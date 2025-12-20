/**
 * Daily Cron Job
 * - Update outstanding balances
 * - Calculate days overdue
 * - Mark contracts as default if overdue > 90 days
 * Runs at 08:00 Bangkok time (01:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContracts,
  updateContract,
  getPaymentSchedules,
  updatePaymentSchedule,
} from '@/lib/google-sheets';
import {
  calculateOutstandingBalance,
  calculateDaysOverdue,
} from '@/lib/calculations';
import { isBefore, startOfDay, format } from 'date-fns';

/**
 * Verify cron secret to prevent unauthorized access
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/daily
 * Daily processing cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (skip in development)
    if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');

    console.log(`[Daily Cron] Running at ${new Date().toISOString()}`);

    // Get all active contracts
    const contracts = await getContracts({ status: 'ACTIVE' });
    console.log(`[Daily Cron] Processing ${contracts.length} active contracts`);

    let updatedCount = 0;
    let overdueCount = 0;
    let defaultCount = 0;

    for (const contract of contracts) {
      try {
        // Get payment schedules
        const schedules = await getPaymentSchedules(contract.id);

        // Update schedule statuses (mark overdue)
        for (const schedule of schedules) {
          if (schedule.status === 'PENDING' && isBefore(new Date(schedule.dueDate), today)) {
            await updatePaymentSchedule(schedule.id, {
              status: 'OVERDUE',
            });
          }
        }

        // Calculate outstanding balance
        const outstandingBalance = calculateOutstandingBalance(
          schedules,
          contract.totalPaid
        );

        // Calculate days overdue
        const daysOverdue = calculateDaysOverdue(schedules);

        // Determine if contract should be marked as default
        const shouldDefault = daysOverdue > 90;

        // Update contract if values changed
        if (
          contract.outstandingBalance !== outstandingBalance ||
          contract.daysOverdue !== daysOverdue ||
          (shouldDefault && contract.status !== 'DEFAULT')
        ) {
          await updateContract(contract.id, {
            outstandingBalance,
            daysOverdue,
            status: shouldDefault ? 'DEFAULT' : 'ACTIVE',
          });
          updatedCount++;

          if (shouldDefault && contract.status !== 'DEFAULT') {
            defaultCount++;
          }
        }

        if (daysOverdue > 0) {
          overdueCount++;
        }

      } catch (error) {
        console.error(`[Daily Cron] Error processing contract ${contract.id}:`, error);
      }
    }

    console.log(`[Daily Cron] Completed: ${updatedCount} updated, ${overdueCount} overdue, ${defaultCount} defaulted`);

    return NextResponse.json({
      success: true,
      message: 'Daily processing completed',
      stats: {
        processedContracts: contracts.length,
        updatedContracts: updatedCount,
        overdueContracts: overdueCount,
        defaultedContracts: defaultCount,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Daily Cron] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Daily cron failed' },
      { status: 500 }
    );
  }
}

