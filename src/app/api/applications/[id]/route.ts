/**
 * Single Application API Routes
 * GET: Get application by ID
 * PATCH: Update application
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getApplicationById,
  updateApplication,
} from '@/lib/google-sheets';
import { createAuthContext, requireAuth, requireOwnResource, requireAdmin, AuthContext } from '@/lib/auth';
import { getWebAdminAuthContext } from '@/lib/web-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * Get application details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const lineUserId = request.headers.get('x-line-userid');
    let authContext = await createAuthContext(lineUserId);
    
    if (!authContext.isAuthenticated || lineUserId === 'web-admin') {
      const webAdminContext = await getWebAdminAuthContext();
      if (webAdminContext.isAuthenticated) {
        authContext = {
          user: null,
          isAuthenticated: true,
          isAdmin: webAdminContext.isAdmin,
          permissions: [],
        };
      }
    }

    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!authContext.isAdmin && authContext.user) {
      requireOwnResource(authContext, application.lineUserId);
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    
    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications/[id]
 * Update application (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);

    // Only admins can update applications
    requireAdmin(authContext);

    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application
    const updated = await updateApplication(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

