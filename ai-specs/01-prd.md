# Product Requirements Document (PRD)

## ระบบจัดการสินเชื่อและติดตามหนี้อัตโนมัติ
### Automated Loan Management & Debt Collection System
### Google Workspace Edition

---

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Date** | December 19, 2024 |
| **Client** | คุณหมิง |
| **Reference** | ใบเสนอราคา 11 พฤศจิกายน 2568 |
| **Status** | Draft for Review |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Objectives](#2-goals--objectives)
3. [System Architecture](#3-system-architecture)
4. [Module 1: Loan Application & Approval](#4-module-1-loan-application--approval)
5. [Module 2: Debt Tracking & Interest Calculation](#5-module-2-debt-tracking--interest-calculation)
6. [Module 3: Notification System](#6-module-3-notification-system)
7. [Module 4: Dashboard & Reports](#7-module-4-dashboard--reports)
8. [Module 5: Slip OCR (Optional)](#8-module-5-slip-ocr-optional)
9. [Data Schema](#9-data-schema)
10. [UI/UX Specifications](#10-uiux-specifications)
11. [Technical Specifications](#11-technical-specifications)
12. [Security & Compliance](#12-security--compliance)
13. [Implementation Timeline](#13-implementation-timeline)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Project Overview

โครงการพัฒนาระบบจัดการสินเชื่อและติดตามหนี้อัตโนมัติ โดยใช้ Google Workspace เป็นแพลตฟอร์มหลัก ประกอบด้วย Google Forms, Google Sheets, Google AppSheet, Google Apps Script และ Google Drive เพื่อให้ได้ระบบที่ใช้งานง่าย ต้นทุนต่ำ และสามารถปรับแต่งได้ตามความต้องการ

This project develops an automated loan management and debt collection system using Google Workspace as the core platform. The system combines Google Forms, Sheets, AppSheet, Apps Script, and Drive to create an easy-to-use, cost-effective, and customizable solution.

### 1.2 Key Features

| Module | Features | Platform |
|--------|----------|----------|
| **1. Application & Approval** | ฟอร์มรับคำขอ, อัปโหลดเอกสาร, หน้าจออนุมัติ | Google Forms, AppSheet |
| **2. Debt Tracking** | คำนวณดอกเบี้ย, ติดตามยอดค้างชำระ, Trigger อัตโนมัติ | Google Sheets, Apps Script |
| **3. Notifications** | แจ้งเตือนผู้พิจารณา, แจ้งผลลูกค้า, ทวงถาม | LINE Notify, Email |
| **4. Dashboard & Reports** | รายงานสถานะ, ยอดคงค้าง, สรุปรายเดือน | AppSheet, Google Sheets |
| **5. Slip OCR (Option)** | อ่านสลิป, จับคู่สัญญา, อัปเดตสถานะ | Slip2Go API |

### 1.3 Benefits

- **ต้นทุนต่ำ:** ใช้ Google Workspace ที่มีอยู่แล้ว ไม่ต้องลงทุนเซิร์ฟเวอร์เพิ่ม
- **ใช้งานง่าย:** Interface คุ้นเคย (Google Forms, Sheets)
- **เข้าถึงได้ทุกที่:** Cloud-based, ใช้งานผ่านมือถือได้
- **ปรับแต่งได้:** สามารถแก้ไขสูตร/เงื่อนไขได้เองผ่าน Sheets
- **อัตโนมัติ:** ลดงาน manual ด้วย Apps Script

---

## 2. Goals & Objectives

### 2.1 Business Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | ลดเวลาการพิจารณาสินเชื่อ | < 24 ชั่วโมง จากการยื่นถึงการพิจารณา |
| G2 | เพิ่มอัตราการเก็บหนี้ | > 90% ชำระตรงเวลา |
| G3 | ลดงาน Manual | ลด 70% ของการคีย์ข้อมูลซ้ำ |
| G4 | ติดตามหนี้ได้ทันเวลา | แจ้งเตือน 100% ก่อนครบกำหนด |

### 2.2 Functional Goals

1. **รับคำขอสินเชื่อออนไลน์** - ลูกค้ากรอกฟอร์มและอัปโหลดเอกสารได้เอง
2. **อนุมัติผ่านมือถือ** - ผู้พิจารณาอนุมัติ/ปฏิเสธผ่าน AppSheet ได้ทุกที่
3. **คำนวณดอกเบี้ยอัตโนมัติ** - ระบบคำนวณยอดค้างชำระตามสูตรที่กำหนด
4. **แจ้งเตือนอัตโนมัติ** - ส่ง LINE/Email ก่อนครบกำหนดและทวงถาม
5. **Dashboard สรุปภาพรวม** - เห็นสถานะทุกสัญญาในหน้าเดียว

---

## 3. System Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Google Form   │    AppSheet     │      LINE / Email           │
│   (ลูกค้ากรอก)    │  (Admin ใช้งาน)   │    (รับแจ้งเตือน)            │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & LOGIC LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Google    │    │   Google    │    │   Google    │         │
│  │   Sheets    │◄──▶│ Apps Script │◄──▶│   Drive     │         │
│  │  (Database) │    │  (Backend)  │    │  (Storage)  │         │
│  └─────────────┘    └──────┬──────┘    └─────────────┘         │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   LINE Notify   │      Gmail      │     Slip2Go API             │
│   (แจ้งเตือน)     │    (Email)      │    (OCR - Option)          │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend - Customer** | Google Forms | รับคำขอสินเชื่อ |
| **Frontend - Admin** | Google AppSheet | หน้าจอจัดการ, อนุมัติ, Dashboard |
| **Database** | Google Sheets | เก็บข้อมูลลูกค้า, สัญญา, การชำระ |
| **Backend Logic** | Google Apps Script | Automation, Triggers, API calls |
| **File Storage** | Google Drive | เก็บเอกสาร, สลิป |
| **Notifications** | LINE Notify + Gmail | แจ้งเตือนผู้ใช้ |
| **OCR (Optional)** | Slip2Go API | อ่านข้อมูลจากสลิป |

### 3.3 Data Flow

```
[ลูกค้า] ──▶ [Google Form] ──▶ [Google Sheets] ──▶ [LINE Notify to Admin]
                                     │
                                     ▼
[Admin] ◀── [AppSheet] ◀── [Review & Approve] ──▶ [LINE Notify to Customer]
                                     │
                                     ▼
                          [Apps Script Daily Trigger]
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             [คำนวณดอกเบี้ย]    [Check Due Date]   [Update Balance]
                    │                │                │
                    └────────────────┼────────────────┘
                                     ▼
                          [Send Notifications]
                          (Reminder / Overdue)
```

---

## 4. Module 1: Loan Application & Approval

### 4.1 Overview

ระบบรับคำขอสินเชื่อผ่าน Google Form และจัดการการอนุมัติผ่าน AppSheet

### 4.2 Features

#### 4.2.1 ฟอร์มรับคำขอสินเชื่อ (Google Form)

**Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ชื่อ-นามสกุล | Text | Yes | - |
| เลขบัตรประชาชน | Text | Yes | 13 digits |
| เบอร์โทรศัพท์ | Text | Yes | 10 digits |
| LINE ID | Text | Yes | - |
| Email | Email | No | Valid email |
| จำนวนเงินที่ต้องการกู้ | Number | Yes | 10,000 - 1,000,000 |
| วัตถุประสงค์การกู้ | Dropdown | Yes | ธุรกิจ, ส่วนตัว, การศึกษา, อื่นๆ |
| ประเภทหลักทรัพย์ค้ำประกัน | Dropdown | Yes | ที่ดิน, บ้าน, รถยนต์, ทองคำ |
| มูลค่าหลักทรัพย์โดยประมาณ | Number | Yes | > 0 |
| ที่อยู่หลักทรัพย์ | Long Text | Yes | - |
| รูปถ่ายหลักทรัพย์ | File Upload | Yes | Image files |
| สำเนาบัตรประชาชน | File Upload | Yes | Image/PDF |
| สำเนาทะเบียนบ้าน | File Upload | Yes | Image/PDF |
| เอกสารหลักทรัพย์ | File Upload | Yes | Image/PDF |

**Form Settings:**
- Response destination: Google Sheets (ชีท "Applications")
- File upload destination: Google Drive folder "Loan_Documents/{timestamp}"
- Confirmation message: "ได้รับคำขอสินเชื่อของท่านแล้ว รอการตรวจสอบภายใน 24 ชั่วโมง"

#### 4.2.2 การจัดเก็บเอกสาร (Google Drive)

**Folder Structure:**
```
📁 Loan_System/
├── 📁 Applications/
│   ├── 📁 2024-12/
│   │   ├── 📁 APP001_สมชาย_20241218/
│   │   │   ├── 📄 บัตรประชาชน.jpg
│   │   │   ├── 📄 ทะเบียนบ้าน.pdf
│   │   │   ├── 📄 เอกสารหลักทรัพย์.pdf
│   │   │   └── 📄 รูปหลักทรัพย์.jpg
│   │   └── 📁 APP002_สมหญิง_20241218/
│   └── 📁 2025-01/
├── 📁 Contracts/
│   └── 📁 {Contract_ID}/
├── 📁 Payment_Slips/
│   └── 📁 {Contract_ID}/
└── 📁 Reports/
```

#### 4.2.3 ระบบแจ้งเตือนผู้พิจารณา

**Trigger:** เมื่อมีการส่งฟอร์มใหม่ (On Form Submit)

**LINE Notify Message:**
```
🔔 คำขอสินเชื่อใหม่

👤 ชื่อ: {ชื่อ-นามสกุล}
💰 จำนวน: ฿{จำนวนเงิน}
📋 หลักทรัพย์: {ประเภทหลักทรัพย์}
📅 วันที่: {timestamp}

🔗 ดูรายละเอียด: {AppSheet_Link}
```

**Email Notification:**
```
Subject: [สินเชื่อ] คำขอใหม่ - {ชื่อ-นามสกุล} - ฿{จำนวนเงิน}

เรียน ผู้พิจารณา,

มีคำขอสินเชื่อใหม่รอการพิจารณา:

• ชื่อลูกค้า: {ชื่อ-นามสกุล}
• จำนวนเงิน: ฿{จำนวนเงิน}
• หลักทรัพย์: {ประเภท} มูลค่า ฿{มูลค่า}
• วันที่ยื่น: {timestamp}

กรุณาตรวจสอบและพิจารณาผ่านระบบ AppSheet

{AppSheet_Link}
```

#### 4.2.4 หน้าจออนุมัติ (AppSheet)

**Views:**

| View Name | Type | Purpose |
|-----------|------|---------|
| รอพิจารณา | Card View | แสดงคำขอที่รอการอนุมัติ |
| รายละเอียดคำขอ | Detail View | แสดงข้อมูลครบถ้วน + เอกสาร |
| ประวัติทั้งหมด | Table View | ดูคำขอทั้งหมดพร้อม Filter |
| Dashboard | Dashboard View | สรุปภาพรวม |

**Approval Actions:**

| Action | Button | Result |
|--------|--------|--------|
| อนุมัติ | ✅ Approve | Status → "อนุมัติ", สร้างสัญญา, แจ้งลูกค้า |
| ขอเอกสารเพิ่ม | 📎 Request Docs | Status → "รอเอกสาร", แจ้งลูกค้า |
| ปฏิเสธ | ❌ Reject | Status → "ปฏิเสธ", แจ้งลูกค้า พร้อมเหตุผล |

**Approval Form Fields:**
- วงเงินอนุมัติ (Number) - สามารถปรับจากที่ขอได้
- อัตราดอกเบี้ย (%) - ค่า default หรือกำหนดเอง
- ระยะเวลาผ่อน (เดือน) - 6, 12, 18, 24
- วันครบกำหนดชำระรายงวด - วันที่ 1-28 ของเดือน
- หมายเหตุ - ข้อความถึงลูกค้า

#### 4.2.5 แจ้งผลลูกค้าอัตโนมัติ

**อนุมัติ - LINE Notify:**
```
✅ ยินดีด้วย! สินเชื่อของท่านได้รับการอนุมัติ

📋 เลขที่สัญญา: {Contract_ID}
💰 วงเงินอนุมัติ: ฿{approved_amount}
📈 อัตราดอกเบี้ย: {interest_rate}% ต่อเดือน
📅 ผ่อนชำระ: {installments} งวด
💵 ยอดชำระต่องวด: ฿{monthly_payment}
📆 ครบกำหนดทุกวันที่: {due_day} ของเดือน

กรุณาติดต่อรับเงินภายใน 7 วัน
```

**ปฏิเสธ - LINE Notify:**
```
❌ แจ้งผลการพิจารณาสินเชื่อ

เรียน คุณ{ชื่อ},

เราขออภัยที่ไม่สามารถอนุมัติสินเชื่อในครั้งนี้

เหตุผล: {rejection_reason}

หากมีข้อสงสัย กรุณาติดต่อ {contact_info}
```

#### 4.2.6 หน้าจอรายละเอียดลูกค้า

**Customer Detail View (AppSheet):**

| Section | Fields |
|---------|--------|
| **ข้อมูลส่วนตัว** | ชื่อ, บัตรประชาชน, เบอร์โทร, LINE ID, Email |
| **ข้อมูลสินเชื่อ** | เลขสัญญา, วงเงิน, ดอกเบี้ย, ระยะเวลา, วันเริ่ม |
| **สถานะปัจจุบัน** | ยอดคงค้าง, งวดที่ชำระแล้ว, งวดถัดไป |
| **ประวัติการชำระ** | รายการชำระทั้งหมด (Inline table) |
| **เอกสาร** | ลิงก์ไปยัง Google Drive folder |
| **หมายเหตุ** | บันทึกจากเจ้าหน้าที่ |

### 4.3 Application Status Flow

```
┌──────────────┐
│   ยื่นคำขอ    │ (ลูกค้าส่ง Form)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  รอพิจารณา   │ (Admin review)
└──────┬───────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   อนุมัติ     │   │  รอเอกสาร   │   │    ปฏิเสธ    │
└──────┬───────┘   └──────┬───────┘   └──────────────┘
       │                  │
       │                  │ (ลูกค้าส่งเอกสารเพิ่ม)
       │                  ▼
       │           ┌──────────────┐
       │           │  รอพิจารณา   │
       │           └──────────────┘
       ▼
┌──────────────┐
│   ปล่อยกู้    │ (Disbursed - เริ่มนับสัญญา)
└──────────────┘
```

---

## 5. Module 2: Debt Tracking & Interest Calculation

### 5.1 Overview

ระบบติดตามหนี้และคำนวณดอกเบี้ยอัตโนมัติ ทำงานผ่าน Google Apps Script ที่ Trigger ทุกวัน

### 5.2 Interest Calculation

#### 5.2.1 Calculation Formula

**Simple Interest (ดอกเบี้ยคงที่):**
```
Monthly Interest = Principal × (Interest Rate / 100)
Monthly Payment = (Principal / Installments) + Monthly Interest
```

**Example:**
- เงินต้น (Principal): ฿100,000
- ดอกเบี้ย (Interest Rate): 1.5% ต่อเดือน
- จำนวนงวด (Installments): 12 งวด

```
Monthly Interest = 100,000 × 0.015 = ฿1,500
Principal per Month = 100,000 / 12 = ฿8,333.33
Monthly Payment = 8,333.33 + 1,500 = ฿9,833.33
Total Interest = 1,500 × 12 = ฿18,000
Total Payment = 100,000 + 18,000 = ฿118,000
```

#### 5.2.2 Payment Schedule Generation

**Google Sheets Formula (Payment Schedule):**

| Column | Formula | Description |
|--------|---------|-------------|
| งวดที่ | =ROW()-1 | Installment number |
| วันครบกำหนด | =EDATE(Start_Date, ROW()-1) | Due date |
| เงินต้น | =Principal/Installments | Principal portion |
| ดอกเบี้ย | =Principal*(Rate/100) | Interest portion |
| ยอดชำระ | =เงินต้น+ดอกเบี้ย | Total payment |
| สถานะ | =IF(Paid_Date<>"","ชำระแล้ว","รอชำระ") | Status |
| ยอดคงค้าง | =SUMIF(สถานะ,"รอชำระ",ยอดชำระ) | Outstanding |

#### 5.2.3 Apps Script - Daily Calculation

```javascript
// Trigger: Daily at 08:00 AM
function dailyDebtCalculation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contractsSheet = ss.getSheetByName('Contracts');
  const paymentsSheet = ss.getSheetByName('Payments');
  
  const contracts = contractsSheet.getDataRange().getValues();
  const today = new Date();
  
  contracts.forEach((contract, index) => {
    if (index === 0) return; // Skip header
    
    const contractId = contract[0];
    const status = contract[5];
    
    if (status !== 'Active') return;
    
    // Calculate outstanding balance
    const totalPaid = calculateTotalPaid(contractId, paymentsSheet);
    const totalDue = calculateTotalDue(contract);
    const outstanding = totalDue - totalPaid;
    
    // Update outstanding balance
    contractsSheet.getRange(index + 1, 10).setValue(outstanding);
    
    // Check for overdue
    const nextDueDate = getNextDueDate(contract);
    const daysOverdue = Math.floor((today - nextDueDate) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue > 0) {
      contractsSheet.getRange(index + 1, 11).setValue(daysOverdue);
    }
  });
}
```

### 5.3 Payment Tracking

#### 5.3.1 Payment Recording

**Payment Sheet Structure:**

| Column | Description |
|--------|-------------|
| Payment_ID | Auto-generated ID |
| Contract_ID | Reference to contract |
| Payment_Date | วันที่ชำระ |
| Amount | จำนวนเงิน |
| Payment_Method | วิธีการชำระ (โอน/เงินสด) |
| Slip_Image | ลิงก์รูปสลิป |
| Verified | ตรวจสอบแล้ว (Yes/No) |
| Verified_By | ผู้ตรวจสอบ |
| Notes | หมายเหตุ |

#### 5.3.2 Outstanding Balance Calculation

```javascript
function calculateOutstanding(contractId) {
  const contract = getContract(contractId);
  const payments = getPayments(contractId);
  
  const principal = contract.approved_amount;
  const rate = contract.interest_rate / 100;
  const installments = contract.installments;
  const monthsPassed = getMonthsPassed(contract.start_date);
  
  // Total due until today
  const monthlyPayment = (principal / installments) + (principal * rate);
  const totalDue = monthlyPayment * Math.min(monthsPassed, installments);
  
  // Total paid
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalDue: totalDue,
    totalPaid: totalPaid,
    outstanding: totalDue - totalPaid,
    status: totalPaid >= totalDue ? 'Current' : 'Overdue'
  };
}
```

### 5.4 Automated Triggers

| Trigger | Schedule | Function |
|---------|----------|----------|
| Daily Calculation | 08:00 AM | คำนวณยอดค้างชำระทุกสัญญา |
| Payment Reminder | 08:00 AM | แจ้งเตือน 7 วันก่อนครบกำหนด |
| Due Date Alert | 08:00 AM | แจ้งเตือนวันครบกำหนด |
| Overdue Alert | 08:00 AM | แจ้งเตือนค้างชำระ |
| Monthly Report | 1st of month, 09:00 AM | สรุปรายงานประจำเดือน |

---

## 6. Module 3: Notification System

### 6.1 Overview

ระบบแจ้งเตือนผ่าน LINE Notify และ Email โดยมี Log บันทึกทุกการแจ้งเตือน

### 6.2 LINE Notify Setup

**Configuration:**
```javascript
const LINE_NOTIFY_TOKEN_ADMIN = 'xxx'; // สำหรับแจ้ง Admin
const LINE_NOTIFY_TOKEN_GROUP = 'xxx'; // สำหรับแจ้งกลุ่ม
```

**Send Function:**
```javascript
function sendLineNotify(token, message) {
  const url = 'https://notify-api.line.me/api/notify';
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: {
      message: message
    }
  };
  
  const response = UrlFetchApp.fetch(url, options);
  
  // Log notification
  logNotification('LINE', message, response.getResponseCode());
  
  return response;
}
```

### 6.3 Email Notification

```javascript
function sendEmailNotification(to, subject, body) {
  GmailApp.sendEmail(to, subject, body, {
    name: 'ระบบสินเชื่อ',
    htmlBody: body
  });
  
  // Log notification
  logNotification('Email', subject, 'Sent');
}
```

### 6.4 Notification Templates

#### 6.4.1 Payment Reminder (7 days before)

**LINE:**
```
⏰ แจ้งเตือนการชำระเงิน

เรียน คุณ{name},

📅 งวดที่ {installment_no} ครบกำหนดชำระ
📆 วันที่: {due_date}
💰 ยอดชำระ: ฿{amount}

กรุณาชำระภายในวันครบกำหนด
หากชำระแล้ว กรุณาส่งหลักฐาน

📱 ติดต่อ: {contact}
```

#### 6.4.2 Due Date Alert (On due date)

**LINE:**
```
📢 วันนี้ครบกำหนดชำระ

เรียน คุณ{name},

🔴 งวดที่ {installment_no} ครบกำหนดวันนี้
💰 ยอดชำระ: ฿{amount}

กรุณาชำระและส่งหลักฐานภายในวันนี้

📱 ติดต่อ: {contact}
```

#### 6.4.3 Overdue Alert (1-7 days)

**LINE:**
```
⚠️ แจ้งเตือนหนี้ค้างชำระ

เรียน คุณ{name},

📛 ค้างชำระ {days_overdue} วัน
💰 ยอดค้าง: ฿{overdue_amount}

กรุณาชำระโดยเร็วที่สุด
หากมีปัญหากรุณาติดต่อเจ้าหน้าที่

📱 ติดต่อ: {contact}
```

#### 6.4.4 Escalation Alert (8-30 days)

**LINE:**
```
🚨 แจ้งเตือนด่วน - หนี้ค้างชำระเกินกำหนด

เรียน คุณ{name},

🔴 ค้างชำระ {days_overdue} วัน
💰 ยอดค้างทั้งหมด: ฿{total_overdue}

⚠️ กรุณาติดต่อเจ้าหน้าที่โดยด่วน
มิฉะนั้นอาจมีค่าปรับและดำเนินการตามสัญญา

📱 ติดต่อ: {contact}
```

#### 6.4.5 Severe Overdue (30+ days) - Notify Admin

**LINE to Admin:**
```
🚨 [ALERT] หนี้ค้างชำระเกิน 30 วัน

👤 ลูกค้า: {name}
📋 เลขสัญญา: {contract_id}
📅 ค้างชำระ: {days_overdue} วัน
💰 ยอดค้าง: ฿{total_overdue}
📱 เบอร์ติดต่อ: {phone}

กรุณาดำเนินการติดตามด่วน
```

### 6.5 Notification Log

**Log Sheet Structure:**

| Column | Description |
|--------|-------------|
| Timestamp | วันเวลาที่ส่ง |
| Contract_ID | เลขสัญญา |
| Customer_Name | ชื่อลูกค้า |
| Channel | LINE / Email |
| Type | Reminder / DueDate / Overdue / Escalation |
| Message | ข้อความที่ส่ง |
| Status | Success / Failed |
| Error_Message | ข้อผิดพลาด (ถ้ามี) |

---

## 7. Module 4: Dashboard & Reports

### 7.1 Dashboard Overview (AppSheet)

#### 7.1.1 Summary Cards

| Card | Metric | Color |
|------|--------|-------|
| 📊 สัญญาทั้งหมด | COUNT(Active Contracts) | Blue |
| 💰 ยอดปล่อยกู้รวม | SUM(Approved Amount) | Green |
| 📈 ยอดคงค้างรวม | SUM(Outstanding) | Orange |
| ⚠️ ค้างชำระ | COUNT(Overdue > 0) | Red |
| ✅ ชำระตรงเวลา | % On-time payments | Green |
| 📅 รอพิจารณา | COUNT(Pending) | Yellow |

#### 7.1.2 Dashboard Views

**View 1: สถานะสัญญา (Contract Status)**
- Pie chart: Active / Completed / Default
- Filter by: Month, Year, Status

**View 2: ยอดคงค้างตามอายุหนี้ (Aging Report)**
- Bar chart showing:
  - Current (ปกติ)
  - 1-7 days overdue
  - 8-30 days overdue
  - 31-60 days overdue
  - 60+ days overdue

**View 3: รายรับรายเดือน (Monthly Collection)**
- Line chart: Monthly payment collection trend
- Compare with target

**View 4: รายการค้างชำระ (Overdue List)**
- Table view with:
  - Customer name
  - Contract ID
  - Days overdue
  - Amount overdue
  - Last contact date
  - Action buttons

### 7.2 Reports

#### 7.2.1 Daily Report

**Auto-generated:** Every day at 18:00

**Content:**
```
📊 รายงานประจำวัน
📅 {date}

=== สรุปวันนี้ ===
• คำขอใหม่: {new_applications}
• อนุมัติ: {approved_today}
• ปฏิเสธ: {rejected_today}
• การชำระเงิน: {payments_received} (฿{amount})

=== สถานะรวม ===
• สัญญา Active: {active_contracts}
• ยอดคงค้างรวม: ฿{total_outstanding}
• ค้างชำระ: {overdue_count} ราย (฿{overdue_amount})

=== ต้องติดตาม ===
{overdue_list}
```

#### 7.2.2 Monthly Report

**Auto-generated:** 1st of each month

**Content:**
```
📊 รายงานประจำเดือน {month} {year}

=== สรุปการปล่อยกู้ ===
• คำขอทั้งหมด: {total_applications}
• อนุมัติ: {approved} ({approval_rate}%)
• ปฏิเสธ: {rejected}
• ยอดปล่อยกู้: ฿{total_disbursed}

=== สรุปการเก็บหนี้ ===
• เป้าหมาย: ฿{target}
• เก็บได้: ฿{collected} ({collection_rate}%)
• ค้างชำระ: ฿{outstanding}

=== อายุหนี้ ===
• ปกติ: ฿{current} ({current_pct}%)
• 1-30 วัน: ฿{overdue_30} ({overdue_30_pct}%)
• 31-60 วัน: ฿{overdue_60} ({overdue_60_pct}%)
• 60+ วัน: ฿{overdue_60plus} ({overdue_60plus_pct}%)

=== Top 10 ค้างชำระ ===
{top_overdue_list}
```

#### 7.2.3 Export Options

- **Google Sheets:** Auto-populate summary sheet
- **PDF:** Generate via Apps Script + Google Docs template
- **Email:** Send to management team

---

## 8. Module 5: Slip OCR (Optional)

### 8.1 Overview

ฟีเจอร์เสริมสำหรับอ่านข้อมูลจากสลิปโอนเงินอัตโนมัติ โดยใช้ Slip2Go API

> ⚠️ **หมายเหตุ:** ฟีเจอร์นี้เป็นบริการเสริม มีค่าใช้จ่ายเพิ่มเติม

### 8.2 Features

1. **อ่านข้อมูลจากสลิป:**
   - จำนวนเงิน
   - วันที่/เวลา
   - ธนาคารผู้โอน
   - ธนาคารผู้รับ
   - เลขอ้างอิง/Transaction ID

2. **จับคู่กับสัญญาอัตโนมัติ:**
   - Match by amount + date
   - Match by customer name (if visible)
   - Manual confirmation if uncertain

3. **อัปเดตสถานะ:**
   - Mark payment as verified
   - Update outstanding balance
   - Send confirmation to customer

### 8.3 Implementation

#### 8.3.1 Slip Upload Flow

```
[ลูกค้าส่งรูปสลิป] ──▶ [Google Form / AppSheet]
                              │
                              ▼
                    [Save to Google Drive]
                              │
                              ▼
                    [Apps Script Trigger]
                              │
                              ▼
                    [Send to Slip2Go API]
                              │
                              ▼
                    [Extract Data]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            [Auto-match]         [Manual Review]
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    [Update Payment Record]
                              │
                              ▼
                    [Notify Customer]
```

#### 8.3.2 Slip2Go Integration

```javascript
function verifySlip(imageUrl) {
  const SLIP2GO_API_KEY = 'your_api_key';
  const SLIP2GO_URL = 'https://api.slip2go.com/verify';
  
  // Get image as base64
  const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  const base64Image = Utilities.base64Encode(imageBlob.getBytes());
  
  // Call Slip2Go API
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + SLIP2GO_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      image: base64Image
    })
  };
  
  const response = UrlFetchApp.fetch(SLIP2GO_URL, options);
  const result = JSON.parse(response.getContentText());
  
  if (result.valid) {
    return {
      success: true,
      amount: result.data.amount,
      date: result.data.date,
      bank: result.data.sendingBank,
      transactionId: result.data.transactionId
    };
  } else {
    return {
      success: false,
      error: result.message
    };
  }
}
```

#### 8.3.3 Auto-matching Logic

```javascript
function autoMatchPayment(slipData) {
  const contracts = getActiveContracts();
  const paymentDate = new Date(slipData.date);
  
  // Find matching contract
  const matches = contracts.filter(contract => {
    const expectedAmount = contract.monthly_payment;
    const tolerance = 100; // Allow ±100 THB difference
    
    return Math.abs(slipData.amount - expectedAmount) <= tolerance;
  });
  
  if (matches.length === 1) {
    // Single match - auto process
    return {
      matched: true,
      contract: matches[0],
      confidence: 'high'
    };
  } else if (matches.length > 1) {
    // Multiple matches - need manual review
    return {
      matched: false,
      candidates: matches,
      confidence: 'low'
    };
  } else {
    // No match
    return {
      matched: false,
      error: 'No matching contract found'
    };
  }
}
```

### 8.4 Slip2Go Pricing

| Package | Verifications/Month | Price |
|---------|---------------------|-------|
| Starter | 100 | ฿500 |
| Basic | 500 | ฿2,000 |
| Pro | 2,000 | ฿6,000 |
| Enterprise | Unlimited | Contact |

---

## 9. Data Schema

### 9.1 Google Sheets Structure

#### 9.1.1 Sheet: Applications (คำขอสินเชื่อ)

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Application_ID | Text | Auto: APP001, APP002... |
| B | Timestamp | DateTime | วันเวลาที่ส่ง |
| C | Name | Text | ชื่อ-นามสกุล |
| D | ID_Card | Text | เลขบัตรประชาชน |
| E | Phone | Text | เบอร์โทร |
| F | LINE_ID | Text | LINE ID |
| G | Email | Text | Email |
| H | Requested_Amount | Number | จำนวนเงินที่ขอ |
| I | Purpose | Text | วัตถุประสงค์ |
| J | Collateral_Type | Text | ประเภทหลักทรัพย์ |
| K | Collateral_Value | Number | มูลค่าหลักทรัพย์ |
| L | Collateral_Address | Text | ที่อยู่หลักทรัพย์ |
| M | Documents_Folder | URL | ลิงก์ Google Drive |
| N | Status | Text | สถานะ |
| O | Reviewed_By | Text | ผู้พิจารณา |
| P | Reviewed_Date | DateTime | วันที่พิจารณา |
| Q | Notes | Text | หมายเหตุ |

**Status Values:** รอพิจารณา, รอเอกสาร, อนุมัติ, ปฏิเสธ

#### 9.1.2 Sheet: Contracts (สัญญา)

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Contract_ID | Text | Auto: CON001, CON002... |
| B | Application_ID | Text | Reference |
| C | Customer_Name | Text | ชื่อลูกค้า |
| D | ID_Card | Text | เลขบัตรประชาชน |
| E | Approved_Amount | Number | วงเงินอนุมัติ |
| F | Interest_Rate | Number | อัตราดอกเบี้ย (%) |
| G | Installments | Number | จำนวนงวด |
| H | Monthly_Payment | Number | ยอดชำระต่องวด |
| I | Start_Date | Date | วันเริ่มสัญญา |
| J | End_Date | Date | วันสิ้นสุดสัญญา |
| K | Due_Day | Number | วันครบกำหนดของเดือน |
| L | Total_Due | Number | ยอดที่ต้องชำระทั้งหมด |
| M | Total_Paid | Number | ยอดที่ชำระแล้ว |
| N | Outstanding | Number | ยอดคงค้าง |
| O | Days_Overdue | Number | จำนวนวันค้างชำระ |
| P | Status | Text | สถานะสัญญา |

**Status Values:** Active, Completed, Default

#### 9.1.3 Sheet: Payments (การชำระเงิน)

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Payment_ID | Text | Auto: PAY001, PAY002... |
| B | Contract_ID | Text | Reference |
| C | Payment_Date | Date | วันที่ชำระ |
| D | Amount | Number | จำนวนเงิน |
| E | Payment_Method | Text | วิธีการชำระ |
| F | Slip_Image | URL | ลิงก์รูปสลิป |
| G | Verified | Boolean | ตรวจสอบแล้ว |
| H | Verified_By | Text | ผู้ตรวจสอบ |
| I | Verified_Date | DateTime | วันที่ตรวจสอบ |
| J | Notes | Text | หมายเหตุ |

#### 9.1.4 Sheet: Payment_Schedule (ตารางผ่อนชำระ)

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Schedule_ID | Text | Auto |
| B | Contract_ID | Text | Reference |
| C | Installment_No | Number | งวดที่ |
| D | Due_Date | Date | วันครบกำหนด |
| E | Principal | Number | เงินต้น |
| F | Interest | Number | ดอกเบี้ย |
| G | Total | Number | รวม |
| H | Paid_Amount | Number | ชำระแล้ว |
| I | Paid_Date | Date | วันที่ชำระ |
| J | Status | Text | สถานะ |

**Status Values:** รอชำระ, ชำระแล้ว, ค้างชำระ

#### 9.1.5 Sheet: Notification_Log (บันทึกการแจ้งเตือน)

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Log_ID | Text | Auto |
| B | Timestamp | DateTime | วันเวลา |
| C | Contract_ID | Text | Reference |
| D | Customer_Name | Text | ชื่อลูกค้า |
| E | Channel | Text | LINE / Email |
| F | Notification_Type | Text | ประเภท |
| G | Message | Text | ข้อความ |
| H | Status | Text | Success / Failed |
| I | Error | Text | ข้อผิดพลาด |

### 9.2 Named Ranges

```javascript
// Define named ranges for formulas
const NAMED_RANGES = {
  'Applications': 'Applications!A:Q',
  'Contracts': 'Contracts!A:P',
  'Payments': 'Payments!A:J',
  'PaymentSchedule': 'Payment_Schedule!A:J',
  'NotificationLog': 'Notification_Log!A:I',
  'Settings': 'Settings!A:B'
};
```

### 9.3 Settings Sheet

| Setting | Value | Description |
|---------|-------|-------------|
| DEFAULT_INTEREST_RATE | 1.5 | Default interest % per month |
| DEFAULT_INSTALLMENTS | 12 | Default number of installments |
| REMINDER_DAYS_BEFORE | 7 | Days before due date to remind |
| OVERDUE_ALERT_DAYS | 1,7,14,30 | Days to send overdue alerts |
| LINE_NOTIFY_TOKEN | xxx | LINE Notify token |
| ADMIN_EMAIL | admin@company.com | Admin email |
| COMPANY_NAME | บริษัท สินเชื่อดี จำกัด | Company name |
| CONTACT_PHONE | 02-xxx-xxxx | Contact number |

---

## 10. UI/UX Specifications

### 10.1 Design Principles

1. **ใช้งานง่าย:** Interface คุ้นเคยของ Google Products
2. **Mobile-Friendly:** AppSheet ใช้งานบนมือถือได้ดี
3. **ภาษาไทย:** ทุก Label และ Message เป็นภาษาไทย
4. **สีสื่อความหมาย:** Green=ดี, Yellow=รอ, Red=ด่วน

### 10.2 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#1A73E8` | Headers, buttons (Google Blue) |
| Success | `#34A853` | Approved, Paid, Success |
| Warning | `#FBBC04` | Pending, Reminder |
| Danger | `#EA4335` | Rejected, Overdue, Error |
| Neutral | `#5F6368` | Text, borders |
| Background | `#F8F9FA` | Page background |

### 10.3 AppSheet Views

#### 10.3.1 Home (Dashboard)

```
┌─────────────────────────────────────┐
│         📊 ภาพรวมระบบ               │
├─────────┬─────────┬─────────────────┤
│ 📋 42   │ 💰 15.7M │ ⚠️ 3          │
│ สัญญา   │ ยอดคงค้าง │ ค้างชำระ       │
├─────────┴─────────┴─────────────────┤
│ 📈 รอพิจารณา                        │
│ ┌─────────────────────────────────┐ │
│ │ สมชาย ใจดี     ฿150,000    ➤  │ │
│ │ สมหญิง รักดี   ฿80,000     ➤  │ │
│ │ วิชัย มั่นคง    ฿250,000    ➤  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🔴 ค้างชำระ                         │
│ ┌─────────────────────────────────┐ │
│ │ มานะ พยายาม   15 วัน  ฿9,833 ➤│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 10.3.2 Application Detail

```
┌─────────────────────────────────────┐
│ ← รายละเอียดคำขอ           APP001  │
├─────────────────────────────────────┤
│ 👤 ข้อมูลผู้ขอ                       │
│   ชื่อ: สมชาย ใจดี                   │
│   บัตร: 1-1234-56789-01-2           │
│   โทร: 081-234-5678                 │
│   LINE: somchai_j                   │
├─────────────────────────────────────┤
│ 💰 ข้อมูลสินเชื่อ                    │
│   จำนวนที่ขอ: ฿150,000              │
│   วัตถุประสงค์: ธุรกิจ               │
│   หลักทรัพย์: ที่ดิน                 │
│   มูลค่า: ฿450,000                  │
├─────────────────────────────────────┤
│ 📎 เอกสาร                           │
│   [📄 บัตรประชาชน] [📄 ทะเบียนบ้าน]  │
│   [📄 เอกสารที่ดิน] [🖼️ รูปที่ดิน]   │
├─────────────────────────────────────┤
│ ✏️ การพิจารณา                       │
│   วงเงินอนุมัติ: [150,000    ]      │
│   ดอกเบี้ย (%): [1.5         ]      │
│   จำนวนงวด:    [12          ]      │
│   หมายเหตุ:    [            ]      │
├─────────────────────────────────────┤
│ [✅ อนุมัติ] [📎 ขอเอกสาร] [❌ ปฏิเสธ]│
└─────────────────────────────────────┘
```

#### 10.3.3 Customer Detail

```
┌─────────────────────────────────────┐
│ ← รายละเอียดลูกค้า         CON001  │
├─────────────────────────────────────┤
│ 👤 สมชาย ใจดี                       │
│    081-234-5678 | somchai_j         │
├─────────────────────────────────────┤
│ 📊 สถานะสัญญา                       │
│ ┌─────────────────────────────────┐ │
│ │ วงเงิน      ฿150,000           │ │
│ │ ชำระแล้ว    ฿39,333  ████░░░░  │ │
│ │ คงเหลือ     ฿78,667            │ │
│ │ งวดที่      4/12               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📅 งวดถัดไป                         │
│    วันที่: 25 ม.ค. 2568             │
│    ยอด: ฿9,833.33                   │
│    สถานะ: ⏳ รอชำระ                 │
├─────────────────────────────────────┤
│ 📜 ประวัติการชำระ                   │
│ ┌─────────────────────────────────┐ │
│ │ 25 ธ.ค. 67  ฿9,833  ✅ ชำระแล้ว│ │
│ │ 25 พ.ย. 67  ฿9,833  ✅ ชำระแล้ว│ │
│ │ 25 ต.ค. 67  ฿9,833  ✅ ชำระแล้ว│ │
│ │ 25 ก.ย. 67  ฿9,833  ✅ ชำระแล้ว│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│    [📱 โทร] [💬 LINE] [📄 เอกสาร]   │
└─────────────────────────────────────┘
```

### 10.4 Google Form Design

**Form Sections:**

1. **ข้อมูลส่วนตัว** - ชื่อ, บัตร, เบอร์โทร, LINE, Email
2. **ข้อมูลสินเชื่อ** - จำนวนเงิน, วัตถุประสงค์
3. **ข้อมูลหลักทรัพย์** - ประเภท, มูลค่า, ที่อยู่
4. **อัปโหลดเอกสาร** - บัตร, ทะเบียนบ้าน, เอกสารหลักทรัพย์, รูปถ่าย

**Form Settings:**
- Progress bar: Enabled
- Confirmation page: Custom message with contact info
- Response receipt: Send copy to respondent

---

## 11. Technical Specifications

### 11.1 Google Apps Script Functions

#### 11.1.1 Main Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `onFormSubmit(e)` | Form Submit | จัดการเมื่อมีคำขอใหม่ |
| `dailyProcess()` | Time-driven (08:00) | ประมวลผลรายวัน |
| `sendReminders()` | Time-driven (08:00) | ส่งแจ้งเตือน |
| `generateReport()` | Time-driven (Monthly) | สร้างรายงาน |
| `processApproval(id, action)` | AppSheet Action | อนุมัติ/ปฏิเสธ |
| `recordPayment(data)` | AppSheet Action | บันทึกการชำระ |

#### 11.1.2 Code Structure

```
📁 Apps Script Project/
├── 📄 Main.gs           // Main entry points
├── 📄 FormHandler.gs    // Form submission handling
├── 📄 ApprovalFlow.gs   // Approval workflow
├── 📄 DebtTracker.gs    // Debt calculation
├── 📄 Notifications.gs  // LINE & Email
├── 📄 Reports.gs        // Report generation
├── 📄 Utils.gs          // Utility functions
├── 📄 Config.gs         // Configuration
└── 📄 SlipOCR.gs        // Slip2Go integration (optional)
```

### 11.2 AppSheet Configuration

#### 11.2.1 Data Sources

| Source | Sheet | Purpose |
|--------|-------|---------|
| Applications | Applications | คำขอสินเชื่อ |
| Contracts | Contracts | สัญญา |
| Payments | Payments | การชำระ |
| Schedule | Payment_Schedule | ตารางผ่อน |

#### 11.2.2 Actions

| Action | Type | Script |
|--------|------|--------|
| Approve | Apps Script | `processApproval(id, 'approve')` |
| Reject | Apps Script | `processApproval(id, 'reject')` |
| Request Docs | Apps Script | `processApproval(id, 'request_docs')` |
| Record Payment | Apps Script | `recordPayment(data)` |
| Send Reminder | Apps Script | `sendManualReminder(id)` |

### 11.3 LINE Notify Setup

1. Go to https://notify-bot.line.me/
2. Login with LINE account
3. Generate token for:
   - Admin notification group
   - Individual customer notifications (via LINE Official Account)

### 11.4 Permissions Required

| Service | Permission |
|---------|------------|
| Google Sheets | Read/Write |
| Google Drive | Read/Write (Documents folder) |
| Gmail | Send emails |
| External URLs | fetch (LINE Notify, Slip2Go) |

---

## 12. Security & Compliance

### 12.1 Data Security

1. **Access Control:**
   - Google Sheets: Share only with authorized team
   - AppSheet: Role-based access (Admin, Viewer)
   - Forms: Anyone with link can submit

2. **Data Protection:**
   - Sensitive data in Google Drive (encrypted at rest)
   - ID card numbers: Display partial (1-xxxx-xxxxx-xx-x)
   - Access logs via Google Workspace

3. **Backup:**
   - Google Sheets auto-version history
   - Weekly manual backup to separate Drive folder

### 12.2 PDPA Compliance

1. **Consent:** Form includes consent checkbox for data processing
2. **Purpose Limitation:** Data used only for loan processing
3. **Data Retention:** Define retention period (7 years for financial data)
4. **Right to Access:** Customer can request their data via admin

### 12.3 Audit Trail

All actions logged:
- Form submissions (timestamp, data)
- Approval actions (who, when, what)
- Notifications sent (success/fail)
- Payment recordings (who verified)

---

## 13. Implementation Timeline

### 13.1 Project Schedule

| Phase | Week | Deliverables |
|-------|------|--------------|
| **Phase 1: Setup** | W1 | Google Sheets structure, Form creation |
| **Phase 2: Core** | W2 | AppSheet app, Basic Apps Script |
| **Phase 3: Automation** | W3 | Notifications, Daily triggers |
| **Phase 4: Testing** | W4 | UAT, Bug fixes, Training |
| **Phase 5: Go-Live** | W5 | Deployment, Documentation |

### 13.2 Detailed Tasks

#### Week 1: Setup
- [ ] Create Google Sheets with all tabs
- [ ] Set up Google Form with all fields
- [ ] Create Google Drive folder structure
- [ ] Configure form-to-sheet connection
- [ ] Set up LINE Notify tokens

#### Week 2: Core Development
- [ ] Build AppSheet app structure
- [ ] Create Dashboard view
- [ ] Create Application list/detail views
- [ ] Create Customer detail view
- [ ] Implement approval actions

#### Week 3: Automation
- [ ] Write Apps Script: Form handler
- [ ] Write Apps Script: Notification functions
- [ ] Write Apps Script: Daily calculation
- [ ] Set up time-driven triggers
- [ ] Test all notifications

#### Week 4: Testing & Training
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Admin training session
- [ ] User manual creation
- [ ] Final review with client

#### Week 5: Go-Live
- [ ] Production deployment
- [ ] Monitor first week
- [ ] Address issues
- [ ] Handover documentation

### 13.3 Payment Milestones

| Milestone | Deliverable | Payment |
|-----------|-------------|---------|
| Project Start | Agreement signed | 30% |
| UAT Ready | Phase 1-3 complete | 40% |
| Go-Live | All phases complete | 30% |

---

## 14. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **AppSheet** | Google's no-code app builder |
| **Apps Script** | Google's JavaScript-based scripting platform |
| **LINE Notify** | LINE's notification service for developers |
| **Slip2Go** | Thai payment slip OCR service |
| **PDPA** | Thailand's Personal Data Protection Act |

### B. Google Form Example Fields

```
Section 1: ข้อมูลส่วนตัว
- ชื่อ-นามสกุล (Short answer, Required)
- เลขบัตรประชาชน (Short answer, Required, Validation: 13 digits)
- เบอร์โทรศัพท์ (Short answer, Required, Validation: 10 digits)
- LINE ID (Short answer, Required)
- Email (Short answer, Validation: Email)

Section 2: ข้อมูลสินเชื่อ
- จำนวนเงินที่ต้องการกู้ (Short answer, Required, Validation: Number)
- วัตถุประสงค์ (Dropdown: ธุรกิจ, ส่วนตัว, การศึกษา, รักษาพยาบาล, อื่นๆ)

Section 3: ข้อมูลหลักทรัพย์
- ประเภทหลักทรัพย์ (Dropdown: ที่ดิน, บ้านพร้อมที่ดิน, คอนโด, รถยนต์, ทองคำ)
- มูลค่าโดยประมาณ (Short answer, Required, Validation: Number)
- ที่อยู่หลักทรัพย์ (Long answer, Required)

Section 4: อัปโหลดเอกสาร
- สำเนาบัตรประชาชน (File upload, Required, Image/PDF)
- สำเนาทะเบียนบ้าน (File upload, Required, Image/PDF)
- เอกสารหลักทรัพย์ (File upload, Required, Image/PDF)
- รูปถ่ายหลักทรัพย์ (File upload, Required, Image only)
```

### C. Sample Apps Script

```javascript
// Config.gs
const CONFIG = {
  SPREADSHEET_ID: 'your_spreadsheet_id',
  LINE_TOKEN_ADMIN: 'your_line_token',
  ADMIN_EMAIL: 'admin@company.com',
  COMPANY_NAME: 'บริษัท สินเชื่อดี จำกัด',
  DEFAULT_INTEREST: 1.5,
  DEFAULT_INSTALLMENTS: 12
};

// FormHandler.gs
function onFormSubmit(e) {
  const response = e.response;
  const itemResponses = response.getItemResponses();
  
  // Extract form data
  const data = {};
  itemResponses.forEach(item => {
    data[item.getItem().getTitle()] = item.getResponse();
  });
  
  // Generate Application ID
  const appId = generateApplicationId();
  
  // Update sheet with ID
  updateApplicationId(response.getId(), appId);
  
  // Send notifications
  notifyAdmin(appId, data);
  notifyCustomer(data);
  
  // Log
  Logger.log('New application: ' + appId);
}

// Notifications.gs
function notifyAdmin(appId, data) {
  const message = `
🔔 คำขอสินเชื่อใหม่

📋 เลขที่: ${appId}
👤 ชื่อ: ${data['ชื่อ-นามสกุล']}
💰 จำนวน: ฿${Number(data['จำนวนเงินที่ต้องการกู้']).toLocaleString()}
📦 หลักทรัพย์: ${data['ประเภทหลักทรัพย์']}

🔗 ดูรายละเอียด: ${getAppSheetLink(appId)}
`;
  
  sendLineNotify(CONFIG.LINE_TOKEN_ADMIN, message);
  sendEmail(CONFIG.ADMIN_EMAIL, `[สินเชื่อ] คำขอใหม่ ${appId}`, message);
}
```

### D. Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-12-19 | Initial draft | Product Team |

---

*— End of Document —*