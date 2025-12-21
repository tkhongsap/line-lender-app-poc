/**
 * Reports Generate API
 * POST: Generate on-demand daily or monthly reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getContracts,
  getApplications,
  getPayments,
} from '@/lib/google-sheets';
import { getSession } from '@/lib/web-auth';
import { calculateDashboardMetrics, calculateAgingReport } from '@/lib/calculations';
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns';

// Validation schema
const generateReportSchema = z.object({
  type: z.enum(['daily', 'monthly']),
  date: z.string().min(1, 'Date is required'), // yyyy-MM-dd for daily, yyyy-MM for monthly
});

export interface DailyReportData {
  type: 'daily';
  date: string;
  generatedAt: string;
  summary: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    defaultedContracts: number;
  };
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueAmount: number;
  };
  overdue: {
    count: number;
    amount: number;
    onTimePaymentRate: number;
  };
  aging: {
    current: { count: number; amount: number };
    days1to7: { count: number; amount: number };
    days8to30: { count: number; amount: number };
    days31to60: { count: number; amount: number };
    days60plus: { count: number; amount: number };
  };
  todayActivity: {
    newApplications: number;
    approved: number;
    rejected: number;
    paymentsReceived: number;
    paymentAmount: number;
  };
  pending: {
    applications: number;
    payments: number;
  };
}

export interface MonthlyReportData {
  type: 'monthly';
  month: string; // yyyy-MM
  generatedAt: string;
  summary: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    defaultedContracts: number;
  };
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueAmount: number;
  };
  monthActivity: {
    newApplications: number;
    approved: number;
    rejected: number;
    disbursed: number;
    disbursedAmount: number;
    paymentsReceived: number;
    paymentAmount: number;
  };
  aging: {
    current: { count: number; amount: number };
    days1to7: { count: number; amount: number };
    days8to30: { count: number; amount: number };
    days31to60: { count: number; amount: number };
    days60plus: { count: number; amount: number };
  };
  performance: {
    approvalRate: number;
    collectionRate: number;
    onTimePaymentRate: number;
  };
  topOverdue: Array<{
    contractId: string;
    customerName: string;
    daysOverdue: number;
    amount: number;
  }>;
}

/**
 * POST /api/reports/generate
 * Generate on-demand report
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = generateReportSchema.safeParse(body);
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

    const { type, date } = validationResult.data;

    // Fetch all data
    const [contracts, applications, payments] = await Promise.all([
      getContracts(),
      getApplications(),
      getPayments(),
    ]);

    if (type === 'daily') {
      const report = generateDailyReport(date, contracts, applications, payments);
      return NextResponse.json({ success: true, data: report });
    } else {
      const report = generateMonthlyReport(date, contracts, applications, payments);
      return NextResponse.json({ success: true, data: report });
    }

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateDailyReport(
  dateStr: string,
  contracts: any[],
  applications: any[],
  payments: any[]
): DailyReportData {
  const targetDate = parseISO(dateStr);
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  // Calculate current metrics
  const pendingApplications = applications.filter(
    a => a.status === 'SUBMITTED' || a.status === 'PENDING'
  ).length;
  const metrics = calculateDashboardMetrics(contracts, pendingApplications);
  const aging = calculateAgingReport(contracts);

  // Today's activities
  const todayApplications = applications.filter(a => {
    const createdAt = new Date(a.createdAt);
    return isWithinInterval(createdAt, { start: dayStart, end: dayEnd });
  });

  const todayApproved = applications.filter(a => {
    if (a.status !== 'APPROVED' || !a.reviewedAt) return false;
    const reviewedAt = new Date(a.reviewedAt);
    return isWithinInterval(reviewedAt, { start: dayStart, end: dayEnd });
  });

  const todayRejected = applications.filter(a => {
    if (a.status !== 'REJECTED' || !a.reviewedAt) return false;
    const reviewedAt = new Date(a.reviewedAt);
    return isWithinInterval(reviewedAt, { start: dayStart, end: dayEnd });
  });

  const todayPayments = payments.filter(p => {
    if (p.verificationStatus !== 'VERIFIED' || !p.verifiedAt) return false;
    const verifiedAt = new Date(p.verifiedAt);
    return isWithinInterval(verifiedAt, { start: dayStart, end: dayEnd });
  });

  const pendingPayments = payments.filter(p => p.verificationStatus === 'PENDING').length;

  return {
    type: 'daily',
    date: dateStr,
    generatedAt: new Date().toISOString(),
    summary: {
      totalContracts: metrics.totalContracts,
      activeContracts: metrics.activeContracts,
      completedContracts: metrics.completedContracts,
      defaultedContracts: metrics.defaultedContracts,
    },
    financial: {
      totalDisbursed: metrics.totalDisbursed,
      totalCollected: metrics.totalCollected,
      totalOutstanding: metrics.totalOutstanding,
      overdueAmount: metrics.overdueAmount,
    },
    overdue: {
      count: metrics.overdueCount,
      amount: metrics.overdueAmount,
      onTimePaymentRate: metrics.onTimePaymentRate,
    },
    aging,
    todayActivity: {
      newApplications: todayApplications.length,
      approved: todayApproved.length,
      rejected: todayRejected.length,
      paymentsReceived: todayPayments.length,
      paymentAmount: todayPayments.reduce((sum, p) => sum + p.amount, 0),
    },
    pending: {
      applications: pendingApplications,
      payments: pendingPayments,
    },
  };
}

function generateMonthlyReport(
  monthStr: string,
  contracts: any[],
  applications: any[],
  payments: any[]
): MonthlyReportData {
  // Parse month string (yyyy-MM)
  const [year, month] = monthStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  // Current metrics
  const pendingApplications = applications.filter(
    a => a.status === 'SUBMITTED' || a.status === 'PENDING'
  ).length;
  const metrics = calculateDashboardMetrics(contracts, pendingApplications);
  const aging = calculateAgingReport(contracts);

  // Month activities
  const monthApplications = applications.filter(a => {
    const createdAt = new Date(a.createdAt);
    return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
  });

  const monthApproved = applications.filter(a => {
    if (a.status !== 'APPROVED' && a.status !== 'DISBURSED') return false;
    if (!a.reviewedAt) return false;
    const reviewedAt = new Date(a.reviewedAt);
    return isWithinInterval(reviewedAt, { start: monthStart, end: monthEnd });
  });

  const monthRejected = applications.filter(a => {
    if (a.status !== 'REJECTED' || !a.reviewedAt) return false;
    const reviewedAt = new Date(a.reviewedAt);
    return isWithinInterval(reviewedAt, { start: monthStart, end: monthEnd });
  });

  const monthDisbursed = contracts.filter(c => {
    if (!c.disbursedAt) return false;
    const disbursedAt = new Date(c.disbursedAt);
    return isWithinInterval(disbursedAt, { start: monthStart, end: monthEnd });
  });

  const monthPayments = payments.filter(p => {
    if (p.verificationStatus !== 'VERIFIED' || !p.verifiedAt) return false;
    const verifiedAt = new Date(p.verifiedAt);
    return isWithinInterval(verifiedAt, { start: monthStart, end: monthEnd });
  });

  const monthDisbursedAmount = monthDisbursed.reduce((sum, c) => sum + c.approvedAmount, 0);
  const monthPaymentAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate rates
  const totalReviewed = monthApproved.length + monthRejected.length;
  const approvalRate = totalReviewed > 0 
    ? Math.round((monthApproved.length / totalReviewed) * 100) 
    : 0;
  
  const collectionRate = monthDisbursedAmount > 0 
    ? Math.round((monthPaymentAmount / monthDisbursedAmount) * 100) 
    : 0;

  // Top overdue contracts
  const overdueContracts = contracts
    .filter(c => c.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 10)
    .map(c => ({
      contractId: c.id,
      customerName: c.customerName,
      daysOverdue: c.daysOverdue,
      amount: c.outstandingBalance,
    }));

  return {
    type: 'monthly',
    month: monthStr,
    generatedAt: new Date().toISOString(),
    summary: {
      totalContracts: metrics.totalContracts,
      activeContracts: metrics.activeContracts,
      completedContracts: metrics.completedContracts,
      defaultedContracts: metrics.defaultedContracts,
    },
    financial: {
      totalDisbursed: metrics.totalDisbursed,
      totalCollected: metrics.totalCollected,
      totalOutstanding: metrics.totalOutstanding,
      overdueAmount: metrics.overdueAmount,
    },
    monthActivity: {
      newApplications: monthApplications.length,
      approved: monthApproved.length,
      rejected: monthRejected.length,
      disbursed: monthDisbursed.length,
      disbursedAmount: monthDisbursedAmount,
      paymentsReceived: monthPayments.length,
      paymentAmount: monthPaymentAmount,
    },
    aging,
    performance: {
      approvalRate,
      collectionRate,
      onTimePaymentRate: metrics.onTimePaymentRate,
    },
    topOverdue: overdueContracts,
  };
}

