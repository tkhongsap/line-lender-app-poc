/**
 * Reminders Cron Job
 * - Send payment reminders (7 days before due)
 * - Send due date alerts (on due date)
 * - Send overdue alerts (1, 7, 14, 30 days)
 * - Send escalation alerts to admin (30+ days)
 * Runs at 08:00 Bangkok time (01:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContracts,
  getPaymentSchedules,
  getSetting,
} from '@/lib/google-sheets';
import { getAdminUsers } from '@/lib/auth';
import {
  sendPaymentReminder,
  sendDueDateAlert,
  sendOverdueAlert,
  sendEscalationAlert,
} from '@/lib/line';
import { addDays, format, isSameDay, differenceInDays, startOfDay } from 'date-fns';

/**
 * Verify cron secret
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
 * GET /api/cron/reminders
 * Send payment reminders
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

    console.log(`[Reminders Cron] Running at ${new Date().toISOString()}`);

    // Get settings
    const contactPhone = await getSetting('CONTACT_PHONE') || '02-xxx-xxxx';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const customerLiffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER || '';
    const adminLiffId = process.env.NEXT_PUBLIC_LIFF_ID_ADMIN || '';

    // Get admin users for escalations
    const adminUsers = await getAdminUsers();

    // Get all active contracts
    const contracts = await getContracts({ status: 'ACTIVE' });

    let remindersSent = 0;
    let dueDatesSent = 0;
    let overdueSent = 0;
    let escalationsSent = 0;

    for (const contract of contracts) {
      try {
        const schedules = await getPaymentSchedules(contract.id);
        const unpaidSchedules = schedules.filter(s => s.status !== 'PAID');

        for (const schedule of unpaidSchedules) {
          const dueDate = new Date(schedule.dueDate);
          const daysToDue = differenceInDays(dueDate, today);

          // 7 days before due date reminder
          if (daysToDue === 7) {
            await sendPaymentReminder(contract.lineUserId, {
              contractId: contract.id,
              customerName: contract.customerName,
              installmentNumber: schedule.installmentNumber,
              dueDate: schedule.dueDate,
              amount: schedule.totalAmount,
              liffUrl: `https://liff.line.me/${customerLiffId}/payment`,
              contactPhone,
            });
            remindersSent++;
          }

          // On due date alert
          if (daysToDue === 0 || isSameDay(dueDate, today)) {
            await sendDueDateAlert(contract.lineUserId, {
              contractId: contract.id,
              customerName: contract.customerName,
              installmentNumber: schedule.installmentNumber,
              amount: schedule.totalAmount,
              liffUrl: `https://liff.line.me/${customerLiffId}/payment`,
              contactPhone,
            });
            dueDatesSent++;
          }
        }

        // Overdue alerts (1, 7, 14, 30 days)
        if (contract.daysOverdue > 0) {
          const overdueDays = [1, 7, 14, 30];

          if (overdueDays.includes(contract.daysOverdue)) {
            await sendOverdueAlert(contract.lineUserId, {
              contractId: contract.id,
              customerName: contract.customerName,
              daysOverdue: contract.daysOverdue,
              overdueAmount: contract.outstandingBalance,
              liffUrl: `https://liff.line.me/${customerLiffId}/payment`,
              contactPhone,
            });
            overdueSent++;
          }

          // Escalation to admin at 30+ days
          if (contract.daysOverdue >= 30 && contract.daysOverdue % 7 === 0) {
            for (const admin of adminUsers) {
              await sendEscalationAlert(admin.lineUserId, {
                contractId: contract.id,
                customerName: contract.customerName,
                customerPhone: contract.customerPhone,
                daysOverdue: contract.daysOverdue,
                totalOverdue: contract.outstandingBalance,
                liffUrl: `https://liff.line.me/${adminLiffId}/contracts/${contract.id}`,
              });
              escalationsSent++;
            }
          }
        }

      } catch (error) {
        console.error(`[Reminders Cron] Error processing contract ${contract.id}:`, error);
      }
    }

    console.log(`[Reminders Cron] Completed: ${remindersSent} reminders, ${dueDatesSent} due dates, ${overdueSent} overdue, ${escalationsSent} escalations`);

    return NextResponse.json({
      success: true,
      message: 'Reminders sent',
      stats: {
        remindersSent,
        dueDatesSent,
        overdueSent,
        escalationsSent,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Reminders Cron] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Reminders cron failed' },
      { status: 500 }
    );
  }
}

