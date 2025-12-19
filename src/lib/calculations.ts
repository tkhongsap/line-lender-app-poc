/**
 * Interest Calculation and Payment Schedule Generation
 * Based on PRD Section 4.2 (Simple Interest)
 */

import { addMonths, format, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';
import type { PaymentSchedule, Contract, DashboardMetrics, AgingReport } from '@/types';

// ==========================================
// Interest Calculation (Simple Interest)
// Per PRD FR-201, FR-202
// ==========================================

/**
 * Calculate monthly interest amount
 * Formula: Principal × (Interest Rate / 100)
 */
export function calculateMonthlyInterest(principal: number, monthlyRate: number): number {
  return Math.round(principal * (monthlyRate / 100));
}

/**
 * Calculate monthly payment amount
 * Formula: (Principal / Installments) + Monthly Interest
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  termMonths: number
): number {
  const monthlyPrincipal = Math.round(principal / termMonths);
  const monthlyInterest = calculateMonthlyInterest(principal, monthlyRate);
  return monthlyPrincipal + monthlyInterest;
}

/**
 * Calculate total interest for the loan term
 */
export function calculateTotalInterest(
  principal: number,
  monthlyRate: number,
  termMonths: number
): number {
  const monthlyInterest = calculateMonthlyInterest(principal, monthlyRate);
  return monthlyInterest * termMonths;
}

/**
 * Calculate total payment amount (principal + interest)
 */
export function calculateTotalPayment(
  principal: number,
  monthlyRate: number,
  termMonths: number
): number {
  return principal + calculateTotalInterest(principal, monthlyRate, termMonths);
}

// ==========================================
// Payment Schedule Generation
// Per PRD FR-203
// ==========================================

export interface ScheduleGenerationParams {
  contractId: string;
  principal: number;
  monthlyRate: number;
  termMonths: number;
  paymentDay: number;
  startDate?: Date;
}

/**
 * Generate payment schedule for a contract
 */
export function generatePaymentSchedule(params: ScheduleGenerationParams): Omit<PaymentSchedule, 'id'>[] {
  const {
    contractId,
    principal,
    monthlyRate,
    termMonths,
    paymentDay,
    startDate = new Date(),
  } = params;

  const schedules: Omit<PaymentSchedule, 'id'>[] = [];
  const monthlyPrincipal = Math.round(principal / termMonths);
  const monthlyInterest = calculateMonthlyInterest(principal, monthlyRate);

  // Calculate remaining principal for last installment adjustment
  let remainingPrincipal = principal;

  for (let i = 1; i <= termMonths; i++) {
    // Calculate due date
    const dueDate = calculateDueDate(startDate, i, paymentDay);
    
    // For the last installment, adjust principal to avoid rounding errors
    const principalAmount = i === termMonths 
      ? remainingPrincipal 
      : monthlyPrincipal;
    
    remainingPrincipal -= principalAmount;

    schedules.push({
      contractId,
      installmentNumber: i,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      principalAmount,
      interestAmount: monthlyInterest,
      totalAmount: principalAmount + monthlyInterest,
      status: 'PENDING',
    });
  }

  return schedules;
}

/**
 * Calculate due date for an installment
 */
function calculateDueDate(startDate: Date, installmentNumber: number, paymentDay: number): Date {
  // Add months to start date
  const baseDate = addMonths(startDate, installmentNumber);
  
  // Set the payment day (handle months with fewer days)
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(paymentDay, lastDayOfMonth);
  
  return new Date(year, month, day);
}

/**
 * Calculate contract end date
 */
export function calculateEndDate(startDate: Date, termMonths: number, paymentDay: number): Date {
  return calculateDueDate(startDate, termMonths, paymentDay);
}

// ==========================================
// Outstanding Balance Calculation
// Per PRD FR-205
// ==========================================

/**
 * Calculate outstanding balance for a contract
 * Outstanding = Total Due (up to today) - Total Paid
 */
export function calculateOutstandingBalance(
  schedules: PaymentSchedule[],
  totalPaid: number
): number {
  const today = startOfDay(new Date());
  
  // Sum up amounts due up to today
  const totalDueToDate = schedules
    .filter(s => isBefore(new Date(s.dueDate), today) || s.dueDate === format(today, 'yyyy-MM-dd'))
    .reduce((sum, s) => sum + s.totalAmount, 0);
  
  return Math.max(0, totalDueToDate - totalPaid);
}

/**
 * Calculate total remaining balance (all future payments)
 */
export function calculateRemainingBalance(
  schedules: PaymentSchedule[],
  totalPaid: number
): number {
  const totalDue = schedules.reduce((sum, s) => sum + s.totalAmount, 0);
  return Math.max(0, totalDue - totalPaid);
}

// ==========================================
// Overdue Calculation
// Per PRD FR-206
// ==========================================

/**
 * Calculate days overdue for a contract
 */
export function calculateDaysOverdue(schedules: PaymentSchedule[]): number {
  const today = startOfDay(new Date());
  
  // Find the oldest unpaid schedule that is past due
  const overdueSchedules = schedules
    .filter(s => s.status !== 'PAID' && isBefore(new Date(s.dueDate), today))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  if (overdueSchedules.length === 0) {
    return 0;
  }

  // Calculate days from the oldest unpaid due date
  const oldestDueDate = new Date(overdueSchedules[0].dueDate);
  return differenceInDays(today, oldestDueDate);
}

/**
 * Get overdue amount
 */
export function calculateOverdueAmount(schedules: PaymentSchedule[]): number {
  const today = startOfDay(new Date());
  
  return schedules
    .filter(s => s.status !== 'PAID' && isBefore(new Date(s.dueDate), today))
    .reduce((sum, s) => sum + s.totalAmount - (s.paidAmount || 0), 0);
}

/**
 * Get next payment due
 */
export function getNextPaymentDue(schedules: PaymentSchedule[]): PaymentSchedule | null {
  const today = startOfDay(new Date());
  
  // Find the first unpaid schedule (either overdue or upcoming)
  const unpaidSchedules = schedules
    .filter(s => s.status !== 'PAID')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return unpaidSchedules[0] || null;
}

// ==========================================
// Dashboard Metrics Calculation
// Per PRD Section 4.4
// ==========================================

/**
 * Calculate dashboard metrics from contracts
 */
export function calculateDashboardMetrics(
  contracts: Contract[],
  pendingApplicationsCount: number
): DashboardMetrics {
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
  const defaultedContracts = contracts.filter(c => c.status === 'DEFAULT');
  const overdueContracts = activeContracts.filter(c => c.daysOverdue > 0);

  const totalDisbursed = contracts.reduce((sum, c) => sum + c.approvedAmount, 0);
  const totalOutstanding = activeContracts.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalCollected = contracts.reduce((sum, c) => sum + c.totalPaid, 0);
  const overdueAmount = overdueContracts.reduce((sum, c) => sum + c.outstandingBalance, 0);

  // Calculate on-time payment rate
  const totalPaymentsDue = contracts.reduce((sum, c) => {
    // This is a simplified calculation
    return sum + Math.min(c.termMonths, getMonthsPassed(c.startDate));
  }, 0);
  const totalOnTimePayments = contracts.reduce((sum, c) => {
    // Approximate based on total paid and overdue status
    if (c.daysOverdue === 0 && c.totalPaid > 0) {
      return sum + Math.floor(c.totalPaid / c.monthlyPayment);
    }
    return sum;
  }, 0);
  const onTimePaymentRate = totalPaymentsDue > 0 
    ? Math.round((totalOnTimePayments / totalPaymentsDue) * 100) 
    : 100;

  return {
    totalContracts: contracts.length,
    activeContracts: activeContracts.length,
    completedContracts: completedContracts.length,
    defaultedContracts: defaultedContracts.length,
    totalDisbursed,
    totalOutstanding,
    totalCollected,
    overdueCount: overdueContracts.length,
    overdueAmount,
    onTimePaymentRate,
    pendingApplications: pendingApplicationsCount,
  };
}

/**
 * Calculate aging report
 */
export function calculateAgingReport(contracts: Contract[]): AgingReport {
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

  const report: AgingReport = {
    current: { count: 0, amount: 0 },
    days1to7: { count: 0, amount: 0 },
    days8to30: { count: 0, amount: 0 },
    days31to60: { count: 0, amount: 0 },
    days60plus: { count: 0, amount: 0 },
  };

  for (const contract of activeContracts) {
    const days = contract.daysOverdue;
    const amount = contract.outstandingBalance;

    if (days === 0) {
      report.current.count++;
      report.current.amount += amount;
    } else if (days <= 7) {
      report.days1to7.count++;
      report.days1to7.amount += amount;
    } else if (days <= 30) {
      report.days8to30.count++;
      report.days8to30.amount += amount;
    } else if (days <= 60) {
      report.days31to60.count++;
      report.days31to60.amount += amount;
    } else {
      report.days60plus.count++;
      report.days60plus.amount += amount;
    }
  }

  return report;
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get number of months passed since a date
 */
function getMonthsPassed(startDateStr: string): number {
  const startDate = new Date(startDateStr);
  const today = new Date();
  
  const months = (today.getFullYear() - startDate.getFullYear()) * 12 + 
    (today.getMonth() - startDate.getMonth());
  
  return Math.max(0, months);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse amount from display string
 */
export function parseCurrency(displayStr: string): number {
  const cleaned = displayStr.replace(/[฿,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate loan summary for display
 */
export function calculateLoanSummary(
  principal: number,
  monthlyRate: number,
  termMonths: number
): {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
} {
  return {
    monthlyPayment: calculateMonthlyPayment(principal, monthlyRate, termMonths),
    totalInterest: calculateTotalInterest(principal, monthlyRate, termMonths),
    totalPayment: calculateTotalPayment(principal, monthlyRate, termMonths),
  };
}

