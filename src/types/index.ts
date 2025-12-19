// ==========================================
// Loan Management System - Type Definitions
// Based on PRD Section 7.2 & Appendix B
// ==========================================

// User Roles per PRD Section 3.1
export type UserRole = 'SUPER_ADMIN' | 'APPROVER' | 'COLLECTOR' | 'VIEWER' | 'CUSTOMER';

// Application Status per PRD FR-118
export type ApplicationStatus = 
  | 'SUBMITTED'      // ยื่นคำขอ
  | 'PENDING'        // รอพิจารณา
  | 'PENDING_DOCS'   // รอเอกสาร
  | 'APPROVED'       // อนุมัติ
  | 'REJECTED'       // ปฏิเสธ
  | 'DISBURSED';     // ปล่อยกู้

// Contract Status
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'DEFAULT';

// Payment Status
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

// Collateral Types per PRD FR-102
export type CollateralType = 'LAND' | 'HOUSE' | 'CONDO' | 'CAR' | 'GOLD' | 'OTHER';

// Loan Purpose
export type LoanPurpose = 'BUSINESS' | 'PERSONAL' | 'EDUCATION' | 'MEDICAL' | 'OTHER';

// ==========================================
// Core Entities
// ==========================================

export interface User {
  id: string;
  lineUserId: string;
  name: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;                    // APP001, APP002, ...
  lineUserId: string;
  fullName: string;
  nationalId: string;            // 13 digits
  phone: string;                 // 10 digits
  email?: string;
  requestedAmount: number;
  purpose: LoanPurpose;
  purposeDetail?: string;
  collateralType: CollateralType;
  collateralValue: number;
  collateralAddress: string;
  collateralDescription?: string;
  documentFolderId?: string;     // Google Drive folder ID
  documents: DocumentInfo[];
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNote?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentInfo {
  type: 'ID_CARD' | 'HOUSE_REGISTRATION' | 'COLLATERAL_DOC' | 'COLLATERAL_PHOTO' | 'OTHER';
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Contract {
  id: string;                    // CON001, CON002, ...
  applicationId: string;
  lineUserId: string;
  customerName: string;
  customerPhone: string;
  approvedAmount: number;
  interestRate: number;          // % per month
  termMonths: number;
  monthlyPayment: number;
  paymentDay: number;            // 1-28
  startDate: string;
  endDate: string;
  totalDue: number;
  totalPaid: number;
  outstandingBalance: number;
  daysOverdue: number;
  status: ContractStatus;
  disbursedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentSchedule {
  id: string;
  contractId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount?: number;
  paidAt?: string;
  status: PaymentStatus;
}

export interface Payment {
  id: string;                    // PAY001, PAY002, ...
  contractId: string;
  scheduleId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'TRANSFER' | 'CASH' | 'OTHER';
  slipImageUrl?: string;
  slipAmount?: number;
  slipDate?: string;
  slipRef?: string;
  slipBank?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationLog {
  id: string;
  contractId?: string;
  lineUserId: string;
  channel: 'LINE' | 'EMAIL';
  type: 'NEW_APPLICATION' | 'APPROVED' | 'REJECTED' | 'REMINDER' | 'DUE_DATE' | 'OVERDUE' | 'ESCALATION' | 'PAYMENT_CONFIRMED';
  message: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  createdAt: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// Dashboard Metrics
// ==========================================

export interface DashboardMetrics {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  defaultedContracts: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalCollected: number;
  overdueCount: number;
  overdueAmount: number;
  onTimePaymentRate: number;
  pendingApplications: number;
}

export interface AgingReport {
  current: { count: number; amount: number };
  days1to7: { count: number; amount: number };
  days8to30: { count: number; amount: number };
  days31to60: { count: number; amount: number };
  days60plus: { count: number; amount: number };
}

// ==========================================
// Form Types
// ==========================================

export interface ApplicationFormData {
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  requestedAmount: number;
  purpose: LoanPurpose;
  purposeDetail?: string;
  collateralType: CollateralType;
  collateralValue: number;
  collateralAddress: string;
  collateralDescription?: string;
  pdpaConsent: boolean;
}

export interface ApprovalFormData {
  approvedAmount: number;
  interestRate: number;
  termMonths: number;
  paymentDay: number;
  note?: string;
}

// ==========================================
// Slip2Go Types
// ==========================================

export interface SlipVerificationResult {
  success: boolean;
  data?: {
    amount: number;
    date: string;
    bank: string;
    transactionId: string;
  };
  error?: string;
}

// ==========================================
// Settings
// ==========================================

export interface SystemSettings {
  defaultInterestRate: number;
  defaultTermMonths: number;
  reminderDaysBefore: number;
  overdueDays: number[];
  escalationDays: number;
  companyName: string;
  contactPhone: string;
  contactEmail: string;
}

