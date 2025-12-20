/**
 * Payments API Routes
 * GET: List payments
 * POST: Create payment record
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getPayments,
  createPayment,
  getContractById,
  getPaymentSchedules,
  updatePaymentSchedule,
  updateContract,
} from '@/lib/google-sheets';
import { uploadPaymentSlip } from '@/lib/google-drive';
import { createAuthContext, requireAuth, requirePermission } from '@/lib/auth';

// Validation schema for payment
const createPaymentSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  scheduleId: z.string().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(), // ISO date string
  paymentMethod: z.enum(['TRANSFER', 'CASH', 'OTHER']),
  slipImage: z.object({
    fileName: z.string(),
    base64Data: z.string(),
    mimeType: z.string(),
  }).optional(),
  note: z.string().optional(),
});

/**
 * GET /api/payments
 * List payments with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const verificationStatus = searchParams.get('verificationStatus');

    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);

    let payments = await getPayments(contractId || undefined);

    // Filter by verification status if provided
    if (verificationStatus) {
      payments = payments.filter(p => p.verificationStatus === verificationStatus);
    }

    // Non-admins can only see their own payments
    if (!authContext.isAdmin && authContext.user) {
      // Get user's contracts first
      const { getContracts } = await import('@/lib/google-sheets');
      const userContracts = await getContracts({ lineUserId: authContext.user.lineUserId });
      const userContractIds = userContracts.map(c => c.id);
      payments = payments.filter(p => userContractIds.includes(p.contractId));
    }

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Record a new payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createPaymentSchema.safeParse(body);
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
    requireAuth(authContext);

    const data = validationResult.data;

    // Get contract to verify access
    const contract = await getContractById(data.contractId);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Customers can only record payments for their own contracts
    if (!authContext.isAdmin && contract.lineUserId !== authContext.user?.lineUserId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Upload slip if provided
    let slipImageUrl: string | undefined;
    if (data.slipImage) {
      const uploadResult = await uploadPaymentSlip(
        data.contractId,
        data.slipImage.fileName,
        data.slipImage.base64Data,
        data.slipImage.mimeType
      );
      slipImageUrl = uploadResult.fileUrl;
    }

    // Create payment record
    const payment = await createPayment({
      contractId: data.contractId,
      scheduleId: data.scheduleId,
      amount: data.amount,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      slipImageUrl,
      verificationStatus: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment recorded, pending verification',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

