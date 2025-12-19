/**
 * Auth Check API
 * Check if user is admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const lineUserId = request.headers.get('x-line-userid');

    if (!lineUserId) {
      return NextResponse.json({
        isAdmin: false,
        error: 'Not authenticated',
      });
    }

    const { isAdmin, user, role } = await verifyAdminAccess(lineUserId);

    return NextResponse.json({
      isAdmin,
      role,
      user: user ? {
        id: user.id,
        name: user.name,
        role: user.role,
      } : null,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      isAdmin: false,
      error: 'Auth check failed',
    });
  }
}

