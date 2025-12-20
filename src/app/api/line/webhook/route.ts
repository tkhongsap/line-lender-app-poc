/**
 * LINE Webhook Handler
 * Receives events from LINE platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@line/bot-sdk';
import { parseWebhookEvents, verifySignature, replyMessage, getUserProfile } from '@/lib/line';
import { getOrCreateUser, getAdminUser } from '@/lib/auth';
import { getContracts, getApplications } from '@/lib/google-sheets';

/**
 * POST /api/line/webhook
 * Handle LINE webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('x-line-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get raw body
    const body = await request.text();

    // Verify signature
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse events
    const parsedBody = JSON.parse(body);
    const events: WebhookEvent[] = parsedBody.events || [];

    // Process each event
    for (const event of events) {
      await handleEvent(event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

/**
 * Handle individual webhook events
 */
async function handleEvent(event: WebhookEvent): Promise<void> {
  const userId = 'userId' in event.source ? event.source.userId : undefined;
  
  if (!userId) {
    console.log('Event without userId:', event.type);
    return;
  }

  switch (event.type) {
    case 'follow':
      await handleFollow(userId, event.replyToken);
      break;

    case 'unfollow':
      await handleUnfollow(userId);
      break;

    case 'message':
      if (event.message.type === 'text') {
        await handleTextMessage(userId, event.message.text, event.replyToken);
      }
      break;

    case 'postback':
      await handlePostback(userId, event.postback.data, event.replyToken);
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }
}

/**
 * Handle follow event (new friend)
 */
async function handleFollow(userId: string, replyToken: string): Promise<void> {
  try {
    // Get user profile from LINE
    const profile = await getUserProfile(userId);
    
    // Create or update user in our system
    await getOrCreateUser(userId, profile?.displayName);

    // Send welcome message
    const welcomeMessage = `🎉 ยินดีต้อนรับสู่ระบบสินเชื่อ

สิ่งที่คุณสามารถทำได้:
• 📝 สมัครสินเชื่อ
• 💰 ดูยอดค้างชำระ
• 📤 ส่งหลักฐานการชำระเงิน

พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งทั้งหมด`;

    await replyMessage(replyToken, [{ type: 'text', text: welcomeMessage }]);

  } catch (error) {
    console.error('Error handling follow:', error);
  }
}

/**
 * Handle unfollow event (blocked)
 */
async function handleUnfollow(userId: string): Promise<void> {
  console.log('User unfollowed:', userId);
  // Optionally mark user as inactive
}

/**
 * Handle text messages
 */
async function handleTextMessage(
  userId: string,
  text: string,
  replyToken: string
): Promise<void> {
  const lowerText = text.toLowerCase().trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const customerLiffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER || '';
  const adminLiffId = process.env.NEXT_PUBLIC_LIFF_ID_ADMIN || '';

  // Check if user is admin
  const adminUser = await getAdminUser(userId);
  const isAdmin = adminUser !== null;

  // Command handling
  if (lowerText === 'ช่วยเหลือ' || lowerText === 'help') {
    let helpText = `📌 คำสั่งที่ใช้ได้:

• "สมัคร" - สมัครสินเชื่อใหม่
• "ยอด" หรือ "เช็คยอด" - ดูยอดค้างชำระ
• "ส่งสลิป" - ส่งหลักฐานการชำระ
• "สถานะ" - เช็คสถานะคำขอ`;

    if (isAdmin) {
      helpText += `

👔 คำสั่งสำหรับแอดมิน:
• "แดชบอร์ด" - เปิดแดชบอร์ด
• "รออนุมัติ" - ดูคำขอรออนุมัติ
• "ค้างชำระ" - ดูลูกหนี้ค้างชำระ`;
    }

    await replyMessage(replyToken, [{ type: 'text', text: helpText }]);
    return;
  }

  // Customer commands
  if (lowerText === 'สมัคร' || lowerText === 'apply') {
    const url = `https://liff.line.me/${customerLiffId}/apply`;
    await replyMessage(replyToken, [{
      type: 'text',
      text: `📝 กรุณาคลิกลิงก์เพื่อสมัครสินเชื่อ:\n${url}`,
    }]);
    return;
  }

  if (lowerText === 'ยอด' || lowerText === 'เช็คยอด' || lowerText === 'balance') {
    // Get user's contracts
    const contracts = await getContracts({ lineUserId: userId });
    const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

    if (activeContracts.length === 0) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: 'ไม่พบสัญญาสินเชื่อที่ยังใช้งานอยู่',
      }]);
      return;
    }

    let message = '💰 ยอดค้างชำระของคุณ:\n\n';
    for (const contract of activeContracts) {
      message += `📋 สัญญา ${contract.id}\n`;
      message += `   ยอดคงเหลือ: ฿${contract.outstandingBalance.toLocaleString()}\n`;
      if (contract.daysOverdue > 0) {
        message += `   ⚠️ ค้างชำระ ${contract.daysOverdue} วัน\n`;
      }
      message += '\n';
    }

    const url = `https://liff.line.me/${customerLiffId}/payment`;
    message += `🔗 ดูรายละเอียด: ${url}`;

    await replyMessage(replyToken, [{ type: 'text', text: message }]);
    return;
  }

  if (lowerText === 'ส่งสลิป' || lowerText === 'slip') {
    const url = `https://liff.line.me/${customerLiffId}/slip`;
    await replyMessage(replyToken, [{
      type: 'text',
      text: `📤 กรุณาคลิกลิงก์เพื่อส่งหลักฐานการชำระเงิน:\n${url}`,
    }]);
    return;
  }

  if (lowerText === 'สถานะ' || lowerText === 'status') {
    // Get user's applications
    const applications = await getApplications({ lineUserId: userId });
    
    if (applications.length === 0) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: 'ไม่พบคำขอสินเชื่อ',
      }]);
      return;
    }

    const statusLabels: Record<string, string> = {
      SUBMITTED: '📝 ยื่นคำขอแล้ว',
      PENDING: '⏳ รอพิจารณา',
      PENDING_DOCS: '📎 รอเอกสารเพิ่มเติม',
      APPROVED: '✅ อนุมัติ',
      REJECTED: '❌ ไม่อนุมัติ',
      DISBURSED: '💰 รับเงินแล้ว',
    };

    const recent = applications.slice(0, 3);
    let message = '📋 สถานะคำขอของคุณ:\n\n';
    
    for (const app of recent) {
      message += `${app.id}: ${statusLabels[app.status] || app.status}\n`;
      message += `   วงเงิน: ฿${app.requestedAmount.toLocaleString()}\n`;
      message += `   วันที่ยื่น: ${new Date(app.createdAt).toLocaleDateString('th-TH')}\n\n`;
    }

    await replyMessage(replyToken, [{ type: 'text', text: message }]);
    return;
  }

  // Admin commands
  if (isAdmin) {
    if (lowerText === 'แดชบอร์ด' || lowerText === 'dashboard') {
      const url = `https://liff.line.me/${adminLiffId}/dashboard`;
      await replyMessage(replyToken, [{
        type: 'text',
        text: `📊 เปิดแดชบอร์ด:\n${url}`,
      }]);
      return;
    }

    if (lowerText === 'รออนุมัติ' || lowerText === 'pending') {
      const applications = await getApplications({ status: 'SUBMITTED' });
      const pendingApps = await getApplications({ status: 'PENDING' });
      const all = [...applications, ...pendingApps];

      if (all.length === 0) {
        await replyMessage(replyToken, [{
          type: 'text',
          text: '✅ ไม่มีคำขอรออนุมัติ',
        }]);
        return;
      }

      let message = `📋 คำขอรออนุมัติ: ${all.length} รายการ\n\n`;
      
      for (const app of all.slice(0, 5)) {
        message += `${app.id}: ${app.fullName}\n`;
        message += `   ฿${app.requestedAmount.toLocaleString()} - ${app.collateralType}\n\n`;
      }

      const url = `https://liff.line.me/${adminLiffId}/applications/pending`;
      message += `🔗 ดูทั้งหมด: ${url}`;

      await replyMessage(replyToken, [{ type: 'text', text: message }]);
      return;
    }

    if (lowerText === 'ค้างชำระ' || lowerText === 'overdue') {
      const contracts = await getContracts({ overdue: true });

      if (contracts.length === 0) {
        await replyMessage(replyToken, [{
          type: 'text',
          text: '✅ ไม่มีลูกหนี้ค้างชำระ',
        }]);
        return;
      }

      let message = `⚠️ ลูกหนี้ค้างชำระ: ${contracts.length} ราย\n\n`;
      let totalOverdue = 0;

      for (const contract of contracts.slice(0, 5)) {
        message += `${contract.id}: ${contract.customerName}\n`;
        message += `   ค้าง ${contract.daysOverdue} วัน - ฿${contract.outstandingBalance.toLocaleString()}\n\n`;
        totalOverdue += contract.outstandingBalance;
      }

      message += `💰 ยอดค้างรวม: ฿${totalOverdue.toLocaleString()}`;

      await replyMessage(replyToken, [{ type: 'text', text: message }]);
      return;
    }
  }

  // Default response
  await replyMessage(replyToken, [{
    type: 'text',
    text: 'พิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้ได้',
  }]);
}

/**
 * Handle postback events
 */
async function handlePostback(
  userId: string,
  data: string,
  replyToken: string
): Promise<void> {
  try {
    const params = new URLSearchParams(data);
    const action = params.get('action');

    switch (action) {
      case 'view_contract':
        const contractId = params.get('id');
        // Handle view contract action
        break;

      case 'make_payment':
        const paymentContractId = params.get('id');
        // Handle make payment action
        break;

      default:
        console.log('Unknown postback action:', action);
    }
  } catch (error) {
    console.error('Error handling postback:', error);
  }
}

