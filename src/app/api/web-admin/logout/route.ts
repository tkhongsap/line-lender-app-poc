import { NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';
import { deleteSession, SESSION_COOKIE_NAME } from '@/lib/web-auth';

const ISSUER_URL = process.env.ISSUER_URL ?? 'https://replit.com/oidc';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  try {
    await deleteSession();
    
    const config = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
    
    const endSessionUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID!,
      post_logout_redirect_uri: `${baseUrl}/web-admin/login`,
    });
    
    const response = NextResponse.redirect(endSessionUrl.href);
    response.cookies.delete(SESSION_COOKIE_NAME);
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.redirect(`${baseUrl}/web-admin/login`);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
