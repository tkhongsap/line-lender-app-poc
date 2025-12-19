/**
 * Daily Report Cron Job
 * - Generate and send daily report to admins
 * Runs at 18:00 Bangkok time (11:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getContracts,
  getApplications,
  getPayments,
} from '@/lib/google-sheets';
import { getAdminUsers } from '@/lib/auth';
import { sendTextMessage } from '@/lib/line';
import { calculateDashboardMetrics, calculateAgingReport, formatCurrency } from '@/lib/calculations';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

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
 * GET /api/cron/daily-report
 * Generate and send daily report
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

    console.log(`[Daily Report] Running at ${new Date().toISOString()}`);

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const dateStr = format(today, 'dd/MM/yyyy');

    // Get data
    const [contracts, applications, payments] = await Promise.all([
      getContracts(),
      getApplications(),
      getPayments(),
    ]);

    // Calculate metrics
    const pendingApplications = applications.filter(
      a => a.status === 'SUBMITTED' || a.status === 'PENDING'
    ).length;
    const metrics = calculateDashboardMetrics(contracts, pendingApplications);
    const aging = calculateAgingReport(contracts);

    // Today's activities
    const todayApplications = applications.filter(a => {
      const createdAt = new Date(a.createdAt);
      return isWithinInterval(createdAt, { start: todayStart, end: todayEnd });
    });

    const todayApprovals = applications.filter(a => {
      if (a.status !== 'APPROVED' || !a.reviewedAt) return false;
      const reviewedAt = new Date(a.reviewedAt);
      return isWithinInterval(reviewedAt, { start: todayStart, end: todayEnd });
    });

    const todayPayments = payments.filter(p => {
      if (p.verificationStatus !== 'VERIFIED' || !p.verifiedAt) return false;
      const verifiedAt = new Date(p.verifiedAt);
      return isWithinInterval(verifiedAt, { start: todayStart, end: todayEnd });
    });

    const todayPaymentTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Generate report message
    const report = `📊 รายงานประจำวัน ${dateStr}

📋 สรุปสถานะสัญญา
• สัญญาทั้งหมด: ${metrics.totalContracts}
• สัญญาปกติ: ${metrics.activeContracts}
• ปิดสัญญาแล้ว: ${metrics.completedContracts}
• ผิดนัด: ${metrics.defaultedContracts}

💰 ยอดเงิน
• ปล่อยกู้รวม: ${formatCurrency(metrics.totalDisbursed)}
• เก็บได้รวม: ${formatCurrency(metrics.totalCollected)}
• คงค้าง: ${formatCurrency(metrics.totalOutstanding)}

⚠️ ค้างชำระ
• จำนวน: ${metrics.overdueCount} ราย
• ยอดค้าง: ${formatCurrency(metrics.overdueAmount)}
• อัตราชำระตรงเวลา: ${metrics.onTimePaymentRate}%

📈 Aging Report
• ปกติ: ${aging.current.count} ราย (${formatCurrency(aging.current.amount)})
• 1-7 วัน: ${aging.days1to7.count} ราย (${formatCurrency(aging.days1to7.amount)})
• 8-30 วัน: ${aging.days8to30.count} ราย (${formatCurrency(aging.days8to30.amount)})
• 31-60 วัน: ${aging.days31to60.count} ราย (${formatCurrency(aging.days31to60.amount)})
• 60+ วัน: ${aging.days60plus.count} ราย (${formatCurrency(aging.days60plus.amount)})

📝 กิจกรรมวันนี้
• คำขอใหม่: ${todayApplications.length} รายการ
• อนุมัติ: ${todayApprovals.length} รายการ
• เก็บเงินได้: ${formatCurrency(todayPaymentTotal)} (${todayPayments.length} รายการ)

📌 รอดำเนินการ
• คำขอรออนุมัติ: ${pendingApplications} รายการ`;

    // Send to all admins
    const adminUsers = await getAdminUsers();
    let sentCount = 0;

    for (const admin of adminUsers) {
      const sent = await sendTextMessage(admin.lineUserId, report);
      if (sent) sentCount++;
    }

    console.log(`[Daily Report] Sent to ${sentCount}/${adminUsers.length} admins`);

    return NextResponse.json({
      success: true,
      message: 'Daily report sent',
      stats: {
        adminCount: adminUsers.length,
        sentCount,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Daily Report] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Daily report failed' },
      { status: 500 }
    );
  }
}

