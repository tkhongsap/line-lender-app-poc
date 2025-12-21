import { NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';
import { createSession, upsertWebAdminUser, getWebAdminUserByEmail, createWebAdminUser, SESSION_COOKIE_NAME } from '@/lib/web-auth';
import type { UserRole } from '@/types';

const ISSUER_URL = process.env.ISSUER_URL ?? 'https://replit.com/oidc';
const CODE_VERIFIER_COOKIE = 'pkce_code_verifier';
const REDIRECT_URI_COOKIE = 'oauth_redirect_uri';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/web-admin/login?error=no_code`);
  }
  
  const codeVerifier = request.cookies.get(CODE_VERIFIER_COOKIE)?.value;
  if (!codeVerifier) {
    console.log('No code verifier cookie found. Available cookies:', request.cookies.getAll().map(c => c.name));
    return NextResponse.redirect(`${baseUrl}/web-admin/login?error=no_verifier`);
  }
  
  const storedRedirectUri = request.cookies.get(REDIRECT_URI_COOKIE)?.value;
  const redirectUri = storedRedirectUri || `${baseUrl}/api/web-admin/callback`;
  
  let redirectTo = '/web-admin/dashboard';
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
      redirectTo = stateData.redirect || redirectTo;
    } catch (e) {
      // Ignore state parsing errors
    }
  }
  
  try {
    const config = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
    
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', code);
    if (state) callbackUrl.searchParams.set('state', state);
    
    console.log('Token exchange details:', {
      baseUrl,
      storedRedirectUri,
      callbackUrl: callbackUrl.toString(),
      requestUrl: request.url,
      codeVerifierLength: codeVerifier?.length,
    });
    
    const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
      expectedState: state || undefined,
      pkceCodeVerifier: codeVerifier,
      idTokenExpected: true,
    });
    
    const claims = tokens.claims();
    
    if (!claims || !claims.email) {
      return NextResponse.redirect(`${baseUrl}/web-admin/login?error=no_email`);
    }
    
    let dbUser = await getWebAdminUserByEmail(claims.email as string);
    
    const allowTestAccess = process.env.WEB_ADMIN_TEST_MODE === 'true';
    
    if (!dbUser && allowTestAccess) {
      dbUser = await createWebAdminUser({
        id: claims.sub as string,
        email: claims.email as string,
        firstName: claims.first_name as string | undefined,
        lastName: claims.last_name as string | undefined,
        profileImageUrl: claims.profile_image_url as string | undefined,
        role: 'APPROVER',
        active: 'true',
      });
    }
    
    if (!dbUser || dbUser.active !== 'true') {
      return NextResponse.redirect(`${baseUrl}/web-admin/login?error=not_authorized`);
    }
    
    await upsertWebAdminUser({
      id: claims.sub as string,
      email: claims.email as string,
      firstName: claims.first_name as string | undefined,
      lastName: claims.last_name as string | undefined,
      profileImageUrl: claims.profile_image_url as string | undefined,
    });
    
    const sessionId = await createSession({
      userId: claims.sub as string,
      email: claims.email as string,
      firstName: claims.first_name as string | undefined,
      lastName: claims.last_name as string | undefined,
      profileImageUrl: claims.profile_image_url as string | undefined,
      role: dbUser.role as UserRole,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: claims.exp || (Math.floor(Date.now() / 1000) + 3600),
    });
    
    const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    
    response.cookies.delete(CODE_VERIFIER_COOKIE);
    response.cookies.delete(REDIRECT_URI_COOKIE);
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${baseUrl}/web-admin/login?error=auth_failed`);
  }
}
