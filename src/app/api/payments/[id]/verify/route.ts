/**
 * Verify Payment API
 * POST: Verify or reject a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getPayments,
  updatePayment,
  updatePaymentSchedule,
  updateContract,
  getContractById,
  getPaymentSchedules,
} from '@/lib/google-sheets';
import { sendPaymentConfirmation } from '@/lib/line';
import { createAuthContext, requirePermission } from '@/lib/auth';
import { getNextPaymentDue } from '@/lib/calculations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema
const verifyPaymentSchema = z.object({
  approved: z.boolean(),
  note: z.string().optional(),
});

/**
 * POST /api/payments/[id]/verify
 * Verify or reject a payment
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = verifyPaymentSchema.safeParse(body);
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
    requirePermission(authContext, 'verify_payments');

    // Find the payment
    const payments = await getPayments();
    const payment = payments.find(p => p.id === id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.verificationStatus !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Payment already verified' },
        { status: 400 }
      );
    }

    const { approved, note } = validationResult.data;

    // Update payment status
    const updatedPayment = await updatePayment(id, {
      verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
      verifiedBy: authContext.user?.id,
      verifiedAt: new Date().toISOString(),
      verificationNote: note,
    });

    if (approved) {
      // Update payment schedule if linked
      if (payment.scheduleId) {
        await updatePaymentSchedule(payment.scheduleId, {
          status: 'PAID',
          paidAmount: payment.amount,
          paidAt: payment.paymentDate,
        });
      }

      // Update contract totals
      const contract = await getContractById(payment.contractId);
      if (contract) {
        const newTotalPaid = contract.totalPaid + payment.amount;
        const newOutstanding = Math.max(0, contract.totalDue - newTotalPaid);
        
        // Check if contract is completed
        const isCompleted = newOutstanding <= 0;

        await updateContract(payment.contractId, {
          totalPaid: newTotalPaid,
          outstandingBalance: newOutstanding,
          status: isCompleted ? 'COMPLETED' : contract.status,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
        });

        // Get next payment due for notification
        const schedules = await getPaymentSchedules(payment.contractId);
        const nextDue = getNextPaymentDue(schedules);

        // Notify customer of payment confirmation
        await sendPaymentConfirmation(contract.lineUserId, {
          contractId: contract.id,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          remainingBalance: newOutstanding,
          nextDueDate: nextDue?.dueDate,
          liffUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/payment`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: approved ? 'Payment verified' : 'Payment rejected',
    });

  } catch (error) {
    console.error('Error verifying payment:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

