/**
 * Contracts API Routes
 * GET: List contracts with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContracts,
  getPaymentSchedules,
} from '@/lib/google-sheets';
import { createAuthContext, requireAuth } from '@/lib/auth';
import type { ContractStatus } from '@/types';

/**
 * GET /api/contracts
 * List contracts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContractStatus | null;
    const lineUserId = searchParams.get('lineUserId');
    const overdue = searchParams.get('overdue') === 'true';
    const includeSchedules = searchParams.get('includeSchedules') === 'true';

    // Get auth context
    const authLineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(authLineUserId);

    // Build filters
    const filters: { 
      status?: ContractStatus; 
      lineUserId?: string; 
      overdue?: boolean;
    } = {};

    if (status) {
      filters.status = status;
    }

    if (overdue) {
      filters.overdue = true;
    }

    // Non-admins can only see their own contracts
    if (!authContext.isAdmin && authContext.user) {
      filters.lineUserId = authContext.user.lineUserId;
    } else if (lineUserId) {
      filters.lineUserId = lineUserId;
    }

    let contracts = await getContracts(filters);

    // Include payment schedules if requested
    if (includeSchedules) {
      contracts = await Promise.all(
        contracts.map(async (contract) => {
          const schedules = await getPaymentSchedules(contract.id);
          return { ...contract, schedules };
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: contracts,
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

