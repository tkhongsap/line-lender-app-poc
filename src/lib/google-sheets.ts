/**
 * Google Sheets API Wrapper
 * Handles all CRUD operations for the loan management system
 */

import { google, sheets_v4 } from 'googleapis';
import type {
  Application,
  Contract,
  PaymentSchedule,
  Payment,
  User,
  NotificationLog,
  ApplicationStatus,
  ContractStatus,
  PaymentStatus,
  UserRole,
} from '@/types';

// Sheet names matching the PRD structure
const SHEETS = {
  APPLICATIONS: 'Applications',
  CONTRACTS: 'Contracts',
  PAYMENT_SCHEDULE: 'Payment_Schedule',
  PAYMENTS: 'Payments',
  USERS: 'Users',
  NOTIFICATION_LOG: 'Notification_Log',
  SETTINGS: 'Settings',
} as const;

// Initialize Google Sheets API client
function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials not configured');
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient(): sheets_v4.Sheets {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) {
    throw new Error('GOOGLE_SPREADSHEET_ID not configured');
  }
  return id;
}

// ==========================================
// Generic Helper Functions
// ==========================================

async function getSheetData(sheetName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:Z`,
  });
  return response.data.values || [];
}

async function appendRow(sheetName: string, values: (string | number | boolean | null)[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values.map(v => v === null ? '' : String(v))],
    },
  });
}

async function updateRow(sheetName: string, rowIndex: number, values: (string | number | boolean | null)[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values.map(v => v === null ? '' : String(v))],
    },
  });
}

function generateId(prefix: string, existingIds: string[]): string {
  let maxNum = 0;
  existingIds.forEach(id => {
    const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

// ==========================================
// Applications CRUD
// ==========================================

export async function getApplications(filters?: {
  status?: ApplicationStatus;
  lineUserId?: string;
}): Promise<Application[]> {
  const data = await getSheetData(SHEETS.APPLICATIONS);
  if (data.length <= 1) return []; // Only header row

  const applications: Application[] = data.slice(1).map(row => ({
    id: row[0] || '',
    lineUserId: row[1] || '',
    fullName: row[2] || '',
    nationalId: row[3] || '',
    phone: row[4] || '',
    email: row[5] || undefined,
    requestedAmount: parseFloat(row[6]) || 0,
    purpose: row[7] as Application['purpose'],
    purposeDetail: row[8] || undefined,
    collateralType: row[9] as Application['collateralType'],
    collateralValue: parseFloat(row[10]) || 0,
    collateralAddress: row[11] || '',
    collateralDescription: row[12] || undefined,
    documentFolderId: row[13] || undefined,
    documents: JSON.parse(row[14] || '[]'),
    status: row[15] as ApplicationStatus,
    reviewedBy: row[16] || undefined,
    reviewedAt: row[17] || undefined,
    approvalNote: row[18] || undefined,
    rejectionReason: row[19] || undefined,
    createdAt: row[20] || '',
    updatedAt: row[21] || undefined,
  })).filter(app => app.id);

  // Apply filters
  let filtered = applications;
  if (filters?.status) {
    filtered = filtered.filter(app => app.status === filters.status);
  }
  if (filters?.lineUserId) {
    filtered = filtered.filter(app => app.lineUserId === filters.lineUserId);
  }

  return filtered;
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const applications = await getApplications();
  return applications.find(app => app.id === id) || null;
}

export async function createApplication(data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
  const existingApps = await getApplications();
  const id = generateId('APP', existingApps.map(a => a.id));
  const now = new Date().toISOString();

  const application: Application = {
    ...data,
    id,
    createdAt: now,
  };

  await appendRow(SHEETS.APPLICATIONS, [
    application.id,
    application.lineUserId,
    application.fullName,
    application.nationalId,
    application.phone,
    application.email || '',
    application.requestedAmount,
    application.purpose,
    application.purposeDetail || '',
    application.collateralType,
    application.collateralValue,
    application.collateralAddress,
    application.collateralDescription || '',
    application.documentFolderId || '',
    JSON.stringify(application.documents),
    application.status,
    application.reviewedBy || '',
    application.reviewedAt || '',
    application.approvalNote || '',
    application.rejectionReason || '',
    application.createdAt,
    '',
  ]);

  return application;
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
  const data = await getSheetData(SHEETS.APPLICATIONS);
  const rowIndex = data.findIndex((row, i) => i > 0 && row[0] === id);

  if (rowIndex === -1) return null;

  const existing = await getApplicationById(id);
  if (!existing) return null;

  const updated: Application = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateRow(SHEETS.APPLICATIONS, rowIndex + 1, [
    updated.id,
    updated.lineUserId,
    updated.fullName,
    updated.nationalId,
    updated.phone,
    updated.email || '',
    updated.requestedAmount,
    updated.purpose,
    updated.purposeDetail || '',
    updated.collateralType,
    updated.collateralValue,
    updated.collateralAddress,
    updated.collateralDescription || '',
    updated.documentFolderId || '',
    JSON.stringify(updated.documents),
    updated.status,
    updated.reviewedBy || '',
    updated.reviewedAt || '',
    updated.approvalNote || '',
    updated.rejectionReason || '',
    updated.createdAt,
    updated.updatedAt || '',
  ]);

  return updated;
}

// ==========================================
// Contracts CRUD
// ==========================================

export async function getContracts(filters?: {
  status?: ContractStatus;
  lineUserId?: string;
  overdue?: boolean;
}): Promise<Contract[]> {
  const data = await getSheetData(SHEETS.CONTRACTS);
  if (data.length <= 1) return [];

  const contracts: Contract[] = data.slice(1).map(row => ({
    id: row[0] || '',
    applicationId: row[1] || '',
    lineUserId: row[2] || '',
    customerName: row[3] || '',
    customerPhone: row[4] || '',
    approvedAmount: parseFloat(row[5]) || 0,
    interestRate: parseFloat(row[6]) || 0,
    termMonths: parseInt(row[7]) || 0,
    monthlyPayment: parseFloat(row[8]) || 0,
    paymentDay: parseInt(row[9]) || 1,
    startDate: row[10] || '',
    endDate: row[11] || '',
    totalDue: parseFloat(row[12]) || 0,
    totalPaid: parseFloat(row[13]) || 0,
    outstandingBalance: parseFloat(row[14]) || 0,
    daysOverdue: parseInt(row[15]) || 0,
    status: row[16] as ContractStatus,
    disbursedAt: row[17] || undefined,
    completedAt: row[18] || undefined,
    createdAt: row[19] || '',
    updatedAt: row[20] || undefined,
  })).filter(c => c.id);

  let filtered = contracts;
  if (filters?.status) {
    filtered = filtered.filter(c => c.status === filters.status);
  }
  if (filters?.lineUserId) {
    filtered = filtered.filter(c => c.lineUserId === filters.lineUserId);
  }
  if (filters?.overdue) {
    filtered = filtered.filter(c => c.daysOverdue > 0);
  }

  return filtered;
}

export async function getContractById(id: string): Promise<Contract | null> {
  const contracts = await getContracts();
  return contracts.find(c => c.id === id) || null;
}

export async function createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
  const existingContracts = await getContracts();
  const id = generateId('CON', existingContracts.map(c => c.id));
  const now = new Date().toISOString();

  const contract: Contract = {
    ...data,
    id,
    createdAt: now,
  };

  await appendRow(SHEETS.CONTRACTS, [
    contract.id,
    contract.applicationId,
    contract.lineUserId,
    contract.customerName,
    contract.customerPhone,
    contract.approvedAmount,
    contract.interestRate,
    contract.termMonths,
    contract.monthlyPayment,
    contract.paymentDay,
    contract.startDate,
    contract.endDate,
    contract.totalDue,
    contract.totalPaid,
    contract.outstandingBalance,
    contract.daysOverdue,
    contract.status,
    contract.disbursedAt || '',
    contract.completedAt || '',
    contract.createdAt,
    '',
  ]);

  return contract;
}

export async function updateContract(id: string, updates: Partial<Contract>): Promise<Contract | null> {
  const data = await getSheetData(SHEETS.CONTRACTS);
  const rowIndex = data.findIndex((row, i) => i > 0 && row[0] === id);

  if (rowIndex === -1) return null;

  const existing = await getContractById(id);
  if (!existing) return null;

  const updated: Contract = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateRow(SHEETS.CONTRACTS, rowIndex + 1, [
    updated.id,
    updated.applicationId,
    updated.lineUserId,
    updated.customerName,
    updated.customerPhone,
    updated.approvedAmount,
    updated.interestRate,
    updated.termMonths,
    updated.monthlyPayment,
    updated.paymentDay,
    updated.startDate,
    updated.endDate,
    updated.totalDue,
    updated.totalPaid,
    updated.outstandingBalance,
    updated.daysOverdue,
    updated.status,
    updated.disbursedAt || '',
    updated.completedAt || '',
    updated.createdAt,
    updated.updatedAt || '',
  ]);

  return updated;
}

// ==========================================
// Payment Schedule CRUD
// ==========================================

export async function getPaymentSchedules(contractId?: string): Promise<PaymentSchedule[]> {
  const data = await getSheetData(SHEETS.PAYMENT_SCHEDULE);
  if (data.length <= 1) return [];

  const schedules: PaymentSchedule[] = data.slice(1).map(row => ({
    id: row[0] || '',
    contractId: row[1] || '',
    installmentNumber: parseInt(row[2]) || 0,
    dueDate: row[3] || '',
    principalAmount: parseFloat(row[4]) || 0,
    interestAmount: parseFloat(row[5]) || 0,
    totalAmount: parseFloat(row[6]) || 0,
    paidAmount: row[7] ? parseFloat(row[7]) : undefined,
    paidAt: row[8] || undefined,
    status: row[9] as PaymentStatus,
  })).filter(s => s.id);

  if (contractId) {
    return schedules.filter(s => s.contractId === contractId);
  }
  return schedules;
}

export async function createPaymentSchedule(data: Omit<PaymentSchedule, 'id'>): Promise<PaymentSchedule> {
  const existingSchedules = await getPaymentSchedules();
  const id = generateId('SCH', existingSchedules.map(s => s.id));

  const schedule: PaymentSchedule = {
    ...data,
    id,
  };

  await appendRow(SHEETS.PAYMENT_SCHEDULE, [
    schedule.id,
    schedule.contractId,
    schedule.installmentNumber,
    schedule.dueDate,
    schedule.principalAmount,
    schedule.interestAmount,
    schedule.totalAmount,
    schedule.paidAmount || '',
    schedule.paidAt || '',
    schedule.status,
  ]);

  return schedule;
}

export async function createPaymentScheduleBatch(schedules: Omit<PaymentSchedule, 'id'>[]): Promise<PaymentSchedule[]> {
  const existingSchedules = await getPaymentSchedules();
  let maxNum = 0;
  existingSchedules.forEach(s => {
    const match = s.id.match(/^SCH(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  const newSchedules: PaymentSchedule[] = schedules.map((s, i) => ({
    ...s,
    id: `SCH${String(maxNum + i + 1).padStart(3, '0')}`,
  }));

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${SHEETS.PAYMENT_SCHEDULE}!A:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: newSchedules.map(schedule => [
        schedule.id,
        schedule.contractId,
        schedule.installmentNumber,
        schedule.dueDate,
        schedule.principalAmount,
        schedule.interestAmount,
        schedule.totalAmount,
        schedule.paidAmount || '',
        schedule.paidAt || '',
        schedule.status,
      ]),
    },
  });

  return newSchedules;
}

export async function updatePaymentSchedule(id: string, updates: Partial<PaymentSchedule>): Promise<PaymentSchedule | null> {
  const data = await getSheetData(SHEETS.PAYMENT_SCHEDULE);
  const rowIndex = data.findIndex((row, i) => i > 0 && row[0] === id);

  if (rowIndex === -1) return null;

  const schedules = await getPaymentSchedules();
  const existing = schedules.find(s => s.id === id);
  if (!existing) return null;

  const updated: PaymentSchedule = {
    ...existing,
    ...updates,
  };

  await updateRow(SHEETS.PAYMENT_SCHEDULE, rowIndex + 1, [
    updated.id,
    updated.contractId,
    updated.installmentNumber,
    updated.dueDate,
    updated.principalAmount,
    updated.interestAmount,
    updated.totalAmount,
    updated.paidAmount || '',
    updated.paidAt || '',
    updated.status,
  ]);

  return updated;
}

// ==========================================
// Payments CRUD
// ==========================================

export async function getPayments(contractId?: string): Promise<Payment[]> {
  const data = await getSheetData(SHEETS.PAYMENTS);
  if (data.length <= 1) return [];

  const payments: Payment[] = data.slice(1).map(row => ({
    id: row[0] || '',
    contractId: row[1] || '',
    scheduleId: row[2] || undefined,
    amount: parseFloat(row[3]) || 0,
    paymentDate: row[4] || '',
    paymentMethod: row[5] as Payment['paymentMethod'],
    slipImageUrl: row[6] || undefined,
    slipAmount: row[7] ? parseFloat(row[7]) : undefined,
    slipDate: row[8] || undefined,
    slipRef: row[9] || undefined,
    slipBank: row[10] || undefined,
    verificationStatus: row[11] as Payment['verificationStatus'],
    verifiedBy: row[12] || undefined,
    verifiedAt: row[13] || undefined,
    verificationNote: row[14] || undefined,
    createdAt: row[15] || '',
    updatedAt: row[16] || undefined,
  })).filter(p => p.id);

  if (contractId) {
    return payments.filter(p => p.contractId === contractId);
  }
  return payments;
}

export async function createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
  const existingPayments = await getPayments();
  const id = generateId('PAY', existingPayments.map(p => p.id));
  const now = new Date().toISOString();

  const payment: Payment = {
    ...data,
    id,
    createdAt: now,
  };

  await appendRow(SHEETS.PAYMENTS, [
    payment.id,
    payment.contractId,
    payment.scheduleId || '',
    payment.amount,
    payment.paymentDate,
    payment.paymentMethod,
    payment.slipImageUrl || '',
    payment.slipAmount || '',
    payment.slipDate || '',
    payment.slipRef || '',
    payment.slipBank || '',
    payment.verificationStatus,
    payment.verifiedBy || '',
    payment.verifiedAt || '',
    payment.verificationNote || '',
    payment.createdAt,
    '',
  ]);

  return payment;
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
  const data = await getSheetData(SHEETS.PAYMENTS);
  const rowIndex = data.findIndex((row, i) => i > 0 && row[0] === id);

  if (rowIndex === -1) return null;

  const payments = await getPayments();
  const existing = payments.find(p => p.id === id);
  if (!existing) return null;

  const updated: Payment = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateRow(SHEETS.PAYMENTS, rowIndex + 1, [
    updated.id,
    updated.contractId,
    updated.scheduleId || '',
    updated.amount,
    updated.paymentDate,
    updated.paymentMethod,
    updated.slipImageUrl || '',
    updated.slipAmount || '',
    updated.slipDate || '',
    updated.slipRef || '',
    updated.slipBank || '',
    updated.verificationStatus,
    updated.verifiedBy || '',
    updated.verifiedAt || '',
    updated.verificationNote || '',
    updated.createdAt,
    updated.updatedAt || '',
  ]);

  return updated;
}

// ==========================================
// Users CRUD
// ==========================================

export async function getUsers(): Promise<User[]> {
  const data = await getSheetData(SHEETS.USERS);
  if (data.length <= 1) return [];

  return data.slice(1).map(row => ({
    id: row[0] || '',
    lineUserId: row[1] || '',
    name: row[2] || '',
    email: row[3] || undefined,
    phone: row[4] || undefined,
    nationalId: row[5] || undefined,
    role: row[6] as UserRole,
    active: row[7] === 'true',
    createdAt: row[8] || '',
    updatedAt: row[9] || undefined,
  })).filter(u => u.id);
}

export async function getUserByLineId(lineUserId: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.lineUserId === lineUserId) || null;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const existingUsers = await getUsers();
  const id = generateId('USR', existingUsers.map(u => u.id));
  const now = new Date().toISOString();

  const user: User = {
    ...data,
    id,
    createdAt: now,
  };

  await appendRow(SHEETS.USERS, [
    user.id,
    user.lineUserId,
    user.name,
    user.email || '',
    user.phone || '',
    user.nationalId || '',
    user.role,
    String(user.active),
    user.createdAt,
    '',
  ]);

  return user;
}

export async function updateUser(lineUserId: string, updates: Partial<User>): Promise<User | null> {
  const data = await getSheetData(SHEETS.USERS);
  const rowIndex = data.findIndex((row, i) => i > 0 && row[1] === lineUserId);

  if (rowIndex === -1) return null;

  const existing = await getUserByLineId(lineUserId);
  if (!existing) return null;

  const updated: User = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateRow(SHEETS.USERS, rowIndex + 1, [
    updated.id,
    updated.lineUserId,
    updated.name,
    updated.email || '',
    updated.phone || '',
    updated.nationalId || '',
    updated.role,
    String(updated.active),
    updated.createdAt,
    updated.updatedAt || '',
  ]);

  return updated;
}

// ==========================================
// Notification Log
// ==========================================

export async function getNotificationLogs(filters?: {
  contractId?: string;
  lineUserId?: string;
}): Promise<NotificationLog[]> {
  const data = await getSheetData(SHEETS.NOTIFICATION_LOG);
  if (data.length <= 1) return [];

  let logs: NotificationLog[] = data.slice(1).map(row => ({
    id: row[0] || '',
    contractId: row[1] || undefined,
    lineUserId: row[2] || '',
    channel: row[3] as NotificationLog['channel'],
    type: row[4] as NotificationLog['type'],
    message: row[5] || '',
    status: row[6] as NotificationLog['status'],
    error: row[7] || undefined,
    createdAt: row[8] || '',
  })).filter(l => l.id);

  if (filters?.contractId) {
    logs = logs.filter(l => l.contractId === filters.contractId);
  }
  if (filters?.lineUserId) {
    logs = logs.filter(l => l.lineUserId === filters.lineUserId);
  }

  return logs;
}

export async function createNotificationLog(data: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<NotificationLog> {
  const existingLogs = await getNotificationLogs();
  const id = generateId('LOG', existingLogs.map(l => l.id));
  const now = new Date().toISOString();

  const log: NotificationLog = {
    ...data,
    id,
    createdAt: now,
  };

  await appendRow(SHEETS.NOTIFICATION_LOG, [
    log.id,
    log.contractId || '',
    log.lineUserId,
    log.channel,
    log.type,
    log.message,
    log.status,
    log.error || '',
    log.createdAt,
  ]);

  return log;
}

// ==========================================
// Settings
// ==========================================

export async function getSettings(): Promise<Record<string, string>> {
  const data = await getSheetData(SHEETS.SETTINGS);
  if (data.length <= 1) return {};

  const settings: Record<string, string> = {};
  data.slice(1).forEach(row => {
    if (row[0]) {
      settings[row[0]] = row[1] || '';
    }
  });

  return settings;
}

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getSettings();
  return settings[key] || null;
}

export async function updateSettings(updates: Record<string, string>): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  // Get current settings data
  const data = await getSheetData(SHEETS.SETTINGS);
  
  // Create a map of existing keys to row indices
  const keyRowMap: Record<string, number> = {};
  data.forEach((row, index) => {
    if (index > 0 && row[0]) {
      keyRowMap[row[0]] = index + 1; // +1 because sheets are 1-indexed
    }
  });
  
  // Process each update
  for (const [key, value] of Object.entries(updates)) {
    if (keyRowMap[key]) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.SETTINGS}!A${keyRowMap[key]}:B${keyRowMap[key]}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[key, value]],
        },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEETS.SETTINGS}!A:B`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[key, value]],
        },
      });
    }
  }
}

