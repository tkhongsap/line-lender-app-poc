import * as client from 'openid-client';
import { cookies } from 'next/headers';
import { db } from './db';
import { webAdminUsers, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import type { UserRole } from '@/types';

const ISSUER_URL = process.env.ISSUER_URL ?? 'https://replit.com/oidc';
const SESSION_COOKIE_NAME = 'web_admin_session';

let oidcConfig: client.Configuration | null = null;

async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
  }
  return oidcConfig;
}

export interface WebAdminSession {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: UserRole;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createSession(sessionData: WebAdminSession): Promise<string> {
  const sessionId = generateSessionId();
  const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    sid: sessionId,
    sess: sessionData,
    expire: expireDate,
  }).onConflictDoUpdate({
    target: sessions.sid,
    set: {
      sess: sessionData,
      expire: expireDate,
    },
  });

  return sessionId;
}

export async function getSession(): Promise<WebAdminSession | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const [sessionRow] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sid, sessionId));

  if (!sessionRow || sessionRow.expire < new Date()) {
    return null;
  }

  const session = sessionRow.sess as WebAdminSession;
  
  const now = Math.floor(Date.now() / 1000);
  if (now > session.expiresAt && session.refreshToken) {
    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, session.refreshToken);
      const claims = tokenResponse.claims();
      
      session.accessToken = tokenResponse.access_token!;
      session.refreshToken = tokenResponse.refresh_token;
      session.expiresAt = claims?.exp || (now + 3600);
      
      await db.update(sessions)
        .set({ 
          sess: session,
          expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .where(eq(sessions.sid, sessionId));
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  return session;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.sid, sessionId));
  }
}

export async function upsertWebAdminUser(userData: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  const [updated] = await db
    .update(webAdminUsers)
    .set({
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(webAdminUsers.email, userData.email))
    .returning();
  return updated;
}

export async function getWebAdminUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(webAdminUsers)
    .where(eq(webAdminUsers.email, email));
  return user || null;
}

export function getLoginUrl(hostname: string): string {
  return `/api/web-admin/login?redirect=${encodeURIComponent('https://' + hostname + '/web-admin/dashboard')}`;
}

export function getLogoutUrl(): string {
  return '/api/web-admin/logout';
}

export { SESSION_COOKIE_NAME };

export async function isWebAdminAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function getWebAdminAuthContext(): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: WebAdminSession | null;
}> {
  const session = await getSession();
  
  if (!session) {
    return { isAuthenticated: false, isAdmin: false, user: null };
  }
  
  const adminRoles = ['SUPER_ADMIN', 'APPROVER', 'COLLECTOR', 'VIEWER'];
  const isAdmin = adminRoles.includes(session.role);
  
  return {
    isAuthenticated: true,
    isAdmin,
    user: session,
  };
}
