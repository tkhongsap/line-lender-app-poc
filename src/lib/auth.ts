/**
 * Authentication & Authorization Utilities
 * Role-based access control using LINE User ID
 */

import { getUserByLineId, createUser, getUsers } from './google-sheets';
import type { User, UserRole } from '@/types';

// Role hierarchy and permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  APPROVER: 80,
  COLLECTOR: 60,
  VIEWER: 40,
  CUSTOMER: 20,
};

// Permissions per role
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'view_all',
    'edit_all',
    'approve_applications',
    'reject_applications',
    'manage_contracts',
    'record_payments',
    'verify_payments',
    'send_notifications',
    'view_reports',
    'manage_settings',
    'manage_users',
  ],
  APPROVER: [
    'view_applications',
    'approve_applications',
    'reject_applications',
    'view_contracts',
    'view_dashboard',
    'view_reports',
  ],
  COLLECTOR: [
    'view_contracts',
    'record_payments',
    'verify_payments',
    'send_notifications',
    'view_dashboard',
  ],
  VIEWER: [
    'view_dashboard',
    'view_reports',
  ],
  CUSTOMER: [
    'view_own_applications',
    'create_application',
    'view_own_contracts',
    'upload_slip',
  ],
};

// Admin roles (non-customer roles)
const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN', 'APPROVER', 'COLLECTOR', 'VIEWER'];

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes('edit_all') || permissions.includes('view_all');
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Check if one role has higher or equal authority than another
 */
export function hasAuthorityOver(actorRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[actorRole] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Get user from LINE User ID
 * Creates a new customer user if not exists
 */
export async function getOrCreateUser(lineUserId: string, displayName?: string): Promise<User> {
  // Try to find existing user
  let user = await getUserByLineId(lineUserId);
  
  if (user) {
    return user;
  }

  // Create new customer user
  user = await createUser({
    lineUserId,
    name: displayName || 'LINE User',
    role: 'CUSTOMER',
    active: true,
  });

  return user;
}

/**
 * Get admin user from LINE User ID
 * Returns null if user is not an admin
 */
export async function getAdminUser(lineUserId: string): Promise<User | null> {
  const user = await getUserByLineId(lineUserId);
  
  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  if (!user.active) {
    return null;
  }

  return user;
}

/**
 * Verify if a LINE User ID has admin access
 */
export async function verifyAdminAccess(lineUserId: string): Promise<{
  isAdmin: boolean;
  user: User | null;
  role: UserRole | null;
}> {
  const user = await getAdminUser(lineUserId);
  
  return {
    isAdmin: user !== null,
    user,
    role: user?.role || null,
  };
}

/**
 * Check if user can perform an action
 */
export async function canPerformAction(lineUserId: string, permission: string): Promise<boolean> {
  const user = await getUserByLineId(lineUserId);
  
  if (!user || !user.active) {
    return false;
  }

  return hasPermission(user.role, permission);
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<User[]> {
  const users = await getUsers();
  return users.filter(u => isAdminRole(u.role) && u.active);
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const users = await getUsers();
  return users.filter(u => u.role === role && u.active);
}

// ==========================================
// Middleware Helpers
// ==========================================

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  permissions: string[];
}

/**
 * Create auth context from LINE User ID
 */
export async function createAuthContext(lineUserId: string | null): Promise<AuthContext> {
  if (!lineUserId) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      permissions: [],
    };
  }

  const user = await getUserByLineId(lineUserId);

  if (!user || !user.active) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      permissions: [],
    };
  }

  return {
    user,
    isAuthenticated: true,
    isAdmin: isAdminRole(user.role),
    permissions: ROLE_PERMISSIONS[user.role] || [],
  };
}

/**
 * Require authentication
 * Throws error if not authenticated
 */
export function requireAuth(context: AuthContext): void {
  if (!context.isAuthenticated || !context.user) {
    throw new AuthError('Authentication required', 401);
  }
}

/**
 * Require admin role
 * Throws error if not an admin
 */
export function requireAdmin(context: AuthContext): void {
  requireAuth(context);
  
  if (!context.isAdmin) {
    throw new AuthError('Admin access required', 403);
  }
}

/**
 * Require specific permission
 * Throws error if permission not granted
 */
export function requirePermission(context: AuthContext, permission: string): void {
  requireAuth(context);
  
  if (!context.permissions.includes(permission) && 
      !context.permissions.includes('edit_all') && 
      !context.permissions.includes('view_all')) {
    throw new AuthError(`Permission '${permission}' required`, 403);
  }
}

/**
 * Require specific role or higher
 */
export function requireRole(context: AuthContext, role: UserRole): void {
  requireAuth(context);
  
  if (!hasAuthorityOver(context.user!.role, role)) {
    throw new AuthError(`Role '${role}' or higher required`, 403);
  }
}

/**
 * Check if user can access own resource
 */
export function canAccessOwnResource(context: AuthContext, resourceLineUserId: string): boolean {
  if (!context.isAuthenticated || !context.user) {
    return false;
  }

  // Admins can access all resources
  if (context.isAdmin) {
    return true;
  }

  // Customers can only access their own resources
  return context.user.lineUserId === resourceLineUserId;
}

/**
 * Require access to own resource
 */
export function requireOwnResource(context: AuthContext, resourceLineUserId: string): void {
  if (!canAccessOwnResource(context, resourceLineUserId)) {
    throw new AuthError('Access denied', 403);
  }
}

// ==========================================
// Custom Error Class
// ==========================================

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

// ==========================================
// API Route Helpers
// ==========================================

/**
 * Extract LINE User ID from request headers
 * Expects: x-line-userid header (set by LIFF middleware)
 */
export function getLineUserIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-line-userid');
}

/**
 * Validate LIFF access token
 * This would typically verify with LINE's API
 */
export async function validateLiffToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Call LINE's token verification endpoint
    const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      return { valid: false, error: 'Invalid access token' };
    }

    const data = await response.json();
    
    // Verify the token is for our channel
    const channelId = process.env.LINE_CHANNEL_ID;
    if (channelId && data.client_id !== channelId) {
      return { valid: false, error: 'Token not for this channel' };
    }

    // Get user ID from profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      return { valid: false, error: 'Failed to get profile' };
    }

    const profile = await profileResponse.json();
    
    return { valid: true, userId: profile.userId };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Token validation failed' };
  }
}

