/**
 * LINE Messaging API Wrapper
 * Handles push messages, webhooks, and notifications
 */

import { Client, TextMessage, FlexMessage, Message, WebhookEvent } from '@line/bot-sdk';
import { createNotificationLog } from './google-sheets';
import type { NotificationLog } from '@/types';

// LINE Client configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// Initialize LINE client
let lineClient: Client | null = null;

function getLineClient(): Client {
  if (!lineClient) {
    if (!config.channelAccessToken || !config.channelSecret) {
      throw new Error('LINE credentials not configured');
    }
    lineClient = new Client(config);
  }
  return lineClient;
}

// ==========================================
// Message Sending Functions
// ==========================================

/**
 * Send a push message to a user
 */
export async function sendPushMessage(
  userId: string,
  messages: Message[],
  logData?: {
    contractId?: string;
    type: NotificationLog['type'];
  }
): Promise<boolean> {
  try {
    const client = getLineClient();
    await client.pushMessage(userId, messages);

    // Log successful notification
    if (logData) {
      await createNotificationLog({
        contractId: logData.contractId,
        lineUserId: userId,
        channel: 'LINE',
        type: logData.type,
        message: JSON.stringify(messages),
        status: 'SUCCESS',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send LINE message:', error);

    // Log failed notification
    if (logData) {
      await createNotificationLog({
        contractId: logData.contractId,
        lineUserId: userId,
        channel: 'LINE',
        type: logData.type,
        message: JSON.stringify(messages),
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return false;
  }
}

/**
 * Send a text message to a user
 */
export async function sendTextMessage(
  userId: string,
  text: string,
  logData?: {
    contractId?: string;
    type: NotificationLog['type'];
  }
): Promise<boolean> {
  const message: TextMessage = {
    type: 'text',
    text,
  };
  return sendPushMessage(userId, [message], logData);
}

/**
 * Reply to a webhook event
 */
export async function replyMessage(
  replyToken: string,
  messages: Message[]
): Promise<boolean> {
  try {
    const client = getLineClient();
    await client.replyMessage(replyToken, messages);
    return true;
  } catch (error) {
    console.error('Failed to reply LINE message:', error);
    return false;
  }
}

// ==========================================
// Notification Templates
// ==========================================

/**
 * Notify admin of new loan application
 */
export async function notifyNewApplication(
  adminUserId: string,
  applicationData: {
    applicationId: string;
    customerName: string;
    requestedAmount: number;
    collateralType: string;
    createdAt: string;
    liffUrl: string;
  }
): Promise<boolean> {
  const message = `🔔 คำขอสินเชื่อใหม่

👤 ชื่อ: ${applicationData.customerName}
💰 จำนวน: ฿${applicationData.requestedAmount.toLocaleString()}
📋 หลักทรัพย์: ${applicationData.collateralType}
📅 วันที่: ${new Date(applicationData.createdAt).toLocaleDateString('th-TH')}

🔗 ดูรายละเอียด: ${applicationData.liffUrl}`;

  return sendTextMessage(adminUserId, message, {
    type: 'NEW_APPLICATION',
  });
}

/**
 * Notify customer of application approval
 */
export async function notifyApplicationApproved(
  customerUserId: string,
  approvalData: {
    contractId: string;
    approvedAmount: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    paymentDay: number;
    liffUrl: string;
  }
): Promise<boolean> {
  const message = `✅ ยินดีด้วย! สินเชื่อของท่านได้รับการอนุมัติ

📋 เลขที่สัญญา: ${approvalData.contractId}
💰 วงเงินอนุมัติ: ฿${approvalData.approvedAmount.toLocaleString()}
📈 อัตราดอกเบี้ย: ${approvalData.interestRate}% ต่อเดือน
📅 ผ่อนชำระ: ${approvalData.termMonths} งวด
💵 ยอดชำระต่องวด: ฿${approvalData.monthlyPayment.toLocaleString()}
📆 ครบกำหนดทุกวันที่: ${approvalData.paymentDay} ของเดือน

กรุณาติดต่อรับเงินภายใน 7 วัน

🔗 ดูรายละเอียด: ${approvalData.liffUrl}`;

  return sendTextMessage(customerUserId, message, {
    contractId: approvalData.contractId,
    type: 'APPROVED',
  });
}

/**
 * Notify customer of application rejection
 */
export async function notifyApplicationRejected(
  customerUserId: string,
  rejectionData: {
    applicationId: string;
    reason: string;
    contactPhone: string;
  }
): Promise<boolean> {
  const message = `❌ แจ้งผลการพิจารณาสินเชื่อ

เรียน ท่านลูกค้า,

เราขออภัยที่ไม่สามารถอนุมัติสินเชื่อในครั้งนี้

เหตุผล: ${rejectionData.reason}

หากมีข้อสงสัย กรุณาติดต่อ ${rejectionData.contactPhone}`;

  return sendTextMessage(customerUserId, message, {
    type: 'REJECTED',
  });
}

/**
 * Notify customer to submit additional documents
 */
export async function notifyDocumentsRequested(
  customerUserId: string,
  requestData: {
    applicationId: string;
    documents: string[];
    message?: string;
    liffUrl: string;
  }
): Promise<boolean> {
  const docList = requestData.documents.map(d => `• ${d}`).join('\n');
  
  const message = `📎 ขอเอกสารเพิ่มเติม

เลขที่คำขอ: ${requestData.applicationId}

กรุณาส่งเอกสารเพิ่มเติมดังนี้:
${docList}

${requestData.message ? `หมายเหตุ: ${requestData.message}\n` : ''}
🔗 อัปโหลดเอกสาร: ${requestData.liffUrl}`;

  return sendTextMessage(customerUserId, message, {
    type: 'NEW_APPLICATION',
  });
}

/**
 * Payment reminder (7 days before due date)
 */
export async function sendPaymentReminder(
  customerUserId: string,
  reminderData: {
    contractId: string;
    customerName: string;
    installmentNumber: number;
    dueDate: string;
    amount: number;
    liffUrl: string;
    contactPhone: string;
  }
): Promise<boolean> {
  const message = `⏰ แจ้งเตือนการชำระเงิน

เรียน คุณ${reminderData.customerName},

📅 งวดที่ ${reminderData.installmentNumber} ครบกำหนดชำระ
📆 วันที่: ${new Date(reminderData.dueDate).toLocaleDateString('th-TH')}
💰 ยอดชำระ: ฿${reminderData.amount.toLocaleString()}

กรุณาชำระภายในวันครบกำหนด

🔗 ดูยอดค้าง: ${reminderData.liffUrl}
📱 ติดต่อ: ${reminderData.contactPhone}`;

  return sendTextMessage(customerUserId, message, {
    contractId: reminderData.contractId,
    type: 'REMINDER',
  });
}

/**
 * Due date alert (on due date)
 */
export async function sendDueDateAlert(
  customerUserId: string,
  alertData: {
    contractId: string;
    customerName: string;
    installmentNumber: number;
    amount: number;
    liffUrl: string;
    contactPhone: string;
  }
): Promise<boolean> {
  const message = `📢 วันนี้ครบกำหนดชำระ

เรียน คุณ${alertData.customerName},

🔴 งวดที่ ${alertData.installmentNumber} ครบกำหนดวันนี้
💰 ยอดชำระ: ฿${alertData.amount.toLocaleString()}

กรุณาชำระและส่งหลักฐานภายในวันนี้

🔗 ดูยอดค้าง: ${alertData.liffUrl}
📱 ติดต่อ: ${alertData.contactPhone}`;

  return sendTextMessage(customerUserId, message, {
    contractId: alertData.contractId,
    type: 'DUE_DATE',
  });
}

/**
 * Overdue alert
 */
export async function sendOverdueAlert(
  customerUserId: string,
  alertData: {
    contractId: string;
    customerName: string;
    daysOverdue: number;
    overdueAmount: number;
    liffUrl: string;
    contactPhone: string;
  }
): Promise<boolean> {
  const severity = alertData.daysOverdue >= 30 ? '🚨' : '⚠️';
  
  const message = `${severity} แจ้งเตือนหนี้ค้างชำระ

เรียน คุณ${alertData.customerName},

📛 ค้างชำระ ${alertData.daysOverdue} วัน
💰 ยอดค้าง: ฿${alertData.overdueAmount.toLocaleString()}

กรุณาชำระโดยเร็วที่สุด
${alertData.daysOverdue >= 30 ? 'หากมีปัญหากรุณาติดต่อเจ้าหน้าที่' : ''}

🔗 ดูยอดค้าง: ${alertData.liffUrl}
📱 ติดต่อ: ${alertData.contactPhone}`;

  return sendTextMessage(customerUserId, message, {
    contractId: alertData.contractId,
    type: 'OVERDUE',
  });
}

/**
 * Escalation alert to admin (30+ days overdue)
 */
export async function sendEscalationAlert(
  adminUserId: string,
  alertData: {
    contractId: string;
    customerName: string;
    customerPhone: string;
    daysOverdue: number;
    totalOverdue: number;
    liffUrl: string;
  }
): Promise<boolean> {
  const message = `🚨 [ALERT] หนี้ค้างชำระเกิน 30 วัน

👤 ลูกค้า: ${alertData.customerName}
📋 เลขสัญญา: ${alertData.contractId}
📅 ค้างชำระ: ${alertData.daysOverdue} วัน
💰 ยอดค้าง: ฿${alertData.totalOverdue.toLocaleString()}
📱 เบอร์ติดต่อ: ${alertData.customerPhone}

กรุณาดำเนินการติดตามด่วน

🔗 ดูรายละเอียด: ${alertData.liffUrl}`;

  return sendTextMessage(adminUserId, message, {
    contractId: alertData.contractId,
    type: 'ESCALATION',
  });
}

/**
 * Payment confirmation
 */
export async function sendPaymentConfirmation(
  customerUserId: string,
  paymentData: {
    contractId: string;
    amount: number;
    paymentDate: string;
    remainingBalance: number;
    nextDueDate?: string;
    liffUrl: string;
  }
): Promise<boolean> {
  let message = `✅ ยืนยันการชำระเงิน

📋 สัญญา: ${paymentData.contractId}
💰 ยอดที่ชำระ: ฿${paymentData.amount.toLocaleString()}
📅 วันที่: ${new Date(paymentData.paymentDate).toLocaleDateString('th-TH')}
💵 ยอดคงเหลือ: ฿${paymentData.remainingBalance.toLocaleString()}`;

  if (paymentData.nextDueDate) {
    message += `\n📆 งวดถัดไป: ${new Date(paymentData.nextDueDate).toLocaleDateString('th-TH')}`;
  }

  message += `\n\n🔗 ดูรายละเอียด: ${paymentData.liffUrl}`;

  return sendTextMessage(customerUserId, message, {
    contractId: paymentData.contractId,
    type: 'PAYMENT_CONFIRMED',
  });
}

// ==========================================
// Webhook Handling
// ==========================================

/**
 * Parse webhook events from LINE
 */
export function parseWebhookEvents(body: unknown): WebhookEvent[] {
  if (!body || typeof body !== 'object') {
    return [];
  }
  
  const payload = body as { events?: WebhookEvent[] };
  return payload.events || [];
}

/**
 * Verify LINE webhook signature
 */
export function verifySignature(body: string, signature: string): boolean {
  const crypto = require('crypto');
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  
  if (!channelSecret) {
    throw new Error('LINE_CHANNEL_SECRET not configured');
  }
  
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

/**
 * Get user profile from LINE
 */
export async function getUserProfile(userId: string): Promise<{
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
} | null> {
  try {
    const client = getLineClient();
    const profile = await client.getProfile(userId);
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

// ==========================================
// Broadcast Messages
// ==========================================

/**
 * Send broadcast message to all followers
 */
export async function sendBroadcast(messages: Message[]): Promise<boolean> {
  try {
    const client = getLineClient();
    await client.broadcast(messages);
    return true;
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    return false;
  }
}

/**
 * Send multicast message to multiple users
 */
export async function sendMulticast(
  userIds: string[],
  messages: Message[]
): Promise<boolean> {
  try {
    const client = getLineClient();
    await client.multicast(userIds, messages);
    return true;
  } catch (error) {
    console.error('Failed to send multicast:', error);
    return false;
  }
}

