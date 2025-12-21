/**
 * Approve Application API
 * POST: Approve application and create contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getApplicationById,
  updateApplication,
  createContract,
  createPaymentScheduleBatch,
  getSetting,
} from '@/lib/google-sheets';
import { notifyApplicationApproved } from '@/lib/line';
import { createAuthContext, requirePermission, AuthContext } from '@/lib/auth';
import { getWebAdminAuthContext } from '@/lib/web-auth';
import {
  generatePaymentSchedule,
  calculateMonthlyPayment,
  calculateTotalPayment,
  calculateEndDate,
} from '@/lib/calculations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for approval
const approvalSchema = z.object({
  approvedAmount: z.number().min(10000).max(1000000),
  interestRate: z.number().min(0.1).max(10),
  termMonths: z.number().min(1).max(60),
  paymentDay: z.number().min(1).max(28),
  note: z.string().optional(),
});

/**
 * POST /api/applications/[id]/approve
 * Approve loan application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = approvalSchema.safeParse(body);
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

    const lineUserId = request.headers.get('x-line-userid');
    let authContext: AuthContext = await createAuthContext(lineUserId);
    
    if (!authContext.isAuthenticated || lineUserId === 'web-admin') {
      const webAdminContext = await getWebAdminAuthContext();
      if (webAdminContext.isAuthenticated && webAdminContext.isAdmin) {
        const hasApprovePermission = ['SUPER_ADMIN', 'APPROVER'].includes(webAdminContext.user?.role || '');
        if (!hasApprovePermission) {
          return NextResponse.json(
            { success: false, error: 'Permission denied' },
            { status: 403 }
          );
        }
        authContext = {
          user: null,
          isAuthenticated: true,
          isAdmin: true,
          permissions: ['approve_applications'],
        };
      } else {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      requirePermission(authContext, 'approve_applications');
    }

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

    const { approvedAmount, interestRate, termMonths, paymentDay, note } = validationResult.data;

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(approvedAmount, interestRate, termMonths);
    const totalDue = calculateTotalPayment(approvedAmount, interestRate, termMonths);
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, termMonths, paymentDay);

    // Create contract
    const contract = await createContract({
      applicationId: id,
      lineUserId: application.lineUserId,
      customerName: application.fullName,
      customerPhone: application.phone,
      approvedAmount,
      interestRate,
      termMonths,
      monthlyPayment,
      paymentDay,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalDue,
      totalPaid: 0,
      outstandingBalance: 0, // No outstanding yet until payments are due
      daysOverdue: 0,
      status: 'ACTIVE',
      disbursedAt: new Date().toISOString(),
    });

    // Generate payment schedule
    const schedules = generatePaymentSchedule({
      contractId: contract.id,
      principal: approvedAmount,
      monthlyRate: interestRate,
      termMonths,
      paymentDay,
      startDate,
    });

    // Save payment schedules
    await createPaymentScheduleBatch(schedules);

    // Update application status
    await updateApplication(id, {
      status: 'APPROVED',
      reviewedBy: authContext.user?.id,
      reviewedAt: new Date().toISOString(),
      approvalNote: note,
    });

    // Notify customer
    const liffUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/customer/contracts`;
    await notifyApplicationApproved(application.lineUserId, {
      contractId: contract.id,
      approvedAmount,
      interestRate,
      termMonths,
      monthlyPayment,
      paymentDay,
      liffUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        application: { ...application, status: 'APPROVED' },
        contract,
        message: 'Application approved successfully',
      },
    });

  } catch (error) {
    console.error('Error approving application:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}

