/**
 * Send Reminder API
 * POST: Manually trigger a reminder notification to a customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getContractById, getPaymentSchedules, getSettings } from '@/lib/google-sheets';
import { sendPaymentReminder, sendOverdueAlert } from '@/lib/line';
import { getSession } from '@/lib/web-auth';
import { getNextPaymentDue } from '@/lib/calculations';

// Validation schema
const sendReminderSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  type: z.enum(['payment_reminder', 'overdue_alert', 'due_date_alert']),
});

/**
 * POST /api/notifications/send-reminder
 * Manually send a reminder to a customer
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication - must be logged in staff
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN and COLLECTOR can send reminders
    if (!['SUPER_ADMIN', 'COLLECTOR'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied - Only Super Admin and Collectors can send reminders' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = sendReminderSchema.safeParse(body);
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

    const { contractId, type } = validationResult.data;

    // Fetch contract
    const contract = await getContractById(contractId);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Get settings for contact info
    const settings = await getSettings();
    const contactPhone = settings.contactPhone || process.env.COMPANY_PHONE || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // Get payment schedules for next payment info
    const schedules = await getPaymentSchedules(contractId);
    const nextPayment = getNextPaymentDue(schedules);

    let success = false;
    let message = '';

    switch (type) {
      case 'payment_reminder':
        // Send payment reminder (for upcoming payment)
        if (!nextPayment) {
          return NextResponse.json(
            { success: false, error: 'No pending payments found' },
            { status: 400 }
          );
        }

        success = await sendPaymentReminder(contract.lineUserId, {
          contractId: contract.id,
          customerName: contract.customerName,
          installmentNumber: nextPayment.installmentNumber,
          dueDate: nextPayment.dueDate,
          amount: nextPayment.totalAmount,
          liffUrl: `${baseUrl}/customer/payment`,
          contactPhone,
        });
        message = success 
          ? `Payment reminder sent to ${contract.customerName}` 
          : 'Failed to send payment reminder';
        break;

      case 'overdue_alert':
        // Send overdue alert
        if (contract.daysOverdue <= 0) {
          return NextResponse.json(
            { success: false, error: 'Contract is not overdue' },
            { status: 400 }
          );
        }

        success = await sendOverdueAlert(contract.lineUserId, {
          contractId: contract.id,
          customerName: contract.customerName,
          daysOverdue: contract.daysOverdue,
          overdueAmount: contract.outstandingBalance,
          liffUrl: `${baseUrl}/customer/payment`,
          contactPhone,
        });
        message = success 
          ? `Overdue alert sent to ${contract.customerName}` 
          : 'Failed to send overdue alert';
        break;

      case 'due_date_alert':
        // Send due date alert (for today's payment)
        if (!nextPayment) {
          return NextResponse.json(
            { success: false, error: 'No pending payments found' },
            { status: 400 }
          );
        }

        // Import and use sendDueDateAlert
        const { sendDueDateAlert } = await import('@/lib/line');
        success = await sendDueDateAlert(contract.lineUserId, {
          contractId: contract.id,
          customerName: contract.customerName,
          installmentNumber: nextPayment.installmentNumber,
          amount: nextPayment.totalAmount,
          liffUrl: `${baseUrl}/customer/payment`,
          contactPhone,
        });
        message = success 
          ? `Due date alert sent to ${contract.customerName}` 
          : 'Failed to send due date alert';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid reminder type' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message,
        data: {
          contractId,
          customerName: contract.customerName,
          type,
          sentAt: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}

