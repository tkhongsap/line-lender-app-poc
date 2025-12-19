/**
 * Single Contract API Routes
 * GET: Get contract by ID with payment schedule
 * PATCH: Update contract
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContractById,
  updateContract,
  getPaymentSchedules,
  getPayments,
} from '@/lib/google-sheets';
import { createAuthContext, requireOwnResource, requireAdmin } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contracts/[id]
 * Get contract details with payment schedule and history
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);

    const contract = await getContractById(id);

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!authContext.isAdmin) {
      requireOwnResource(authContext, contract.lineUserId);
    }

    // Get payment schedule
    const schedules = await getPaymentSchedules(id);
    
    // Get payment history
    const payments = await getPayments(id);

    return NextResponse.json({
      success: true,
      data: {
        ...contract,
        schedules,
        payments,
      },
    });
  } catch (error) {
    console.error('Error fetching contract:', error);

    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contracts/[id]
 * Update contract (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);
    requireAdmin(authContext);

    const contract = await getContractById(id);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Update contract
    const updated = await updateContract(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating contract:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

