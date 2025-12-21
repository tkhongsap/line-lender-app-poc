import { NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';

const ISSUER_URL = process.env.ISSUER_URL ?? 'https://replit.com/oidc';
const CODE_VERIFIER_COOKIE = 'pkce_code_verifier';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/web-admin/dashboard';
  
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  try {
    const config = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
    
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    
    const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url');
    
    const authUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: `${baseUrl}/api/web-admin/callback`,
      scope: 'openid email profile offline_access',
      state,
      prompt: 'login consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    const response = NextResponse.redirect(authUrl.href);
    response.cookies.set(CODE_VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to initiate login' }, { status: 500 });
  }
}
