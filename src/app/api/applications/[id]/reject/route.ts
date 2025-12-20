/**
 * Reject Application API
 * POST: Reject loan application
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getApplicationById,
  updateApplication,
  getSetting,
} from '@/lib/google-sheets';
import { notifyApplicationRejected } from '@/lib/line';
import { createAuthContext, requirePermission } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for rejection
const rejectionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

/**
 * POST /api/applications/[id]/reject
 * Reject loan application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = rejectionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);
    requirePermission(authContext, 'reject_applications');

    // Get application
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (application.status !== 'SUBMITTED' && application.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Application already processed' },
        { status: 400 }
      );
    }

    const { reason } = validationResult.data;

    // Update application status
    const updated = await updateApplication(id, {
      status: 'REJECTED',
      reviewedBy: authContext.user?.id,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason,
    });

    // Notify customer
    const contactPhone = await getSetting('CONTACT_PHONE') || '02-xxx-xxxx';
    await notifyApplicationRejected(application.lineUserId, {
      applicationId: id,
      reason,
      contactPhone,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Application rejected',
    });

  } catch (error) {
    console.error('Error rejecting application:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}

