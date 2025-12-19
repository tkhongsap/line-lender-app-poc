# Product Requirements Document (PRD)
# ระบบจัดการสินเชื่อและติดตามหนี้อัตโนมัติ
## Automated Loan Management & Debt Collection System

---

| Field | Value |
|-------|-------|
| **Document Version** | 3.0 |
| **Date** | December 19, 2024 |
| **Status** | Ready for Development |
| **Platform** | LINE LIFF + Next.js |

---

## สารบัญ (Table of Contents)

1. [Introduction/Overview](#1-introductionoverview)
2. [Goals](#2-goals)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Goals (Out of Scope)](#5-non-goals-out-of-scope)
6. [Design Considerations](#6-design-considerations)
7. [Technical Considerations](#7-technical-considerations)
8. [Success Metrics](#8-success-metrics)
9. [Open Questions](#9-open-questions)

---

## 1. Introduction/Overview

### 1.1 ภาพรวมโครงการ (Project Overview)

ระบบจัดการสินเชื่อและติดตามหนี้อัตโนมัติ เป็นระบบที่พัฒนาบน **LINE LIFF + Next.js** เพื่อช่วยให้ธุรกิจสินเชื่อขนาดเล็กถึงกลางสามารถ:

- **รับคำขอสินเชื่อ** ผ่าน LINE LIFF ลูกค้าสมัครได้ใน LINE เลย
- **พิจารณาอนุมัติ** ผ่าน Admin LIFF บนมือถือได้ทุกที่
- **คำนวณดอกเบี้ยอัตโนมัติ** ผ่าน Next.js API + Google Sheets
- **แจ้งเตือนอัตโนมัติ** ผ่าน LINE Messaging API
- **ดู Dashboard** สรุปภาพรวมธุรกิจแบบ real-time

### 1.2 ปัญหาที่แก้ไข (Problems Solved)

| ปัญหาเดิม | วิธีแก้ไข |
|-----------|----------|
| คีย์ข้อมูลซ้ำซ้อน ผิดพลาดบ่อย | ลูกค้ากรอก LIFF Form เอง ข้อมูลไหลเข้าระบบอัตโนมัติ |
| ลืมทวงหนี้ ติดตามไม่ทัน | ระบบแจ้งเตือนอัตโนมัติผ่าน LINE Messaging API |
| คำนวณดอกเบี้ยผิดพลาด | สูตรคำนวณอัตโนมัติ ลดความผิดพลาดจากมนุษย์ |
| ไม่เห็นภาพรวมธุรกิจ | Dashboard แสดงสถานะ real-time |
| ต้องเปิดหลาย app | ทุกอย่างอยู่ใน LINE (LIFF) ที่เดียว |

### 1.3 Technology Stack

| Layer | Technology | หน้าที่ |
|-------|------------|---------|
| **Customer Frontend** | LINE LIFF (Next.js) | สมัครสินเชื่อ, ดูยอดค้าง, ส่งสลิป |
| **Admin Frontend** | LINE LIFF (Next.js) | จัดการ, อนุมัติ, Dashboard |
| **Backend** | Next.js API Routes | Business logic, API endpoints |
| **Database** | Google Sheets (via API) | เก็บข้อมูลลูกค้า, สัญญา, การชำระ |
| **File Storage** | Google Drive | เก็บเอกสาร, สลิป |
| **Notifications** | LINE Messaging API | แจ้งเตือนแบบ two-way |
| **Hosting** | Vercel | Deploy Next.js app |
| **OCR** | Slip2Go API | อ่านข้อมูลจากสลิป |
| **Scheduled Jobs** | Vercel Cron | Daily calculations, reminders |

### 1.4 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        LINE App                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    LINE LIFF                            ││
│  │  ┌─────────────────┐    ┌─────────────────┐            ││
│  │  │  Customer App   │    │    Admin App    │            ││
│  │  │  - สมัครสินเชื่อ    │    │  - Dashboard    │            ││
│  │  │  - ดูยอดค้าง      │    │  - อนุมัติ/ปฏิเสธ  │            ││
│  │  │  - ส่งสลิป       │    │  - จัดการสัญญา    │            ││
│  │  └─────────────────┘    └─────────────────┘            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Next.js)                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   API Routes                            ││
│  │  /api/applications  - จัดการคำขอสินเชื่อ                   ││
│  │  /api/contracts     - จัดการสัญญา                        ││
│  │  /api/payments      - จัดการการชำระ                      ││
│  │  /api/notifications - ส่งแจ้งเตือน                        ││
│  │  /api/line/webhook  - รับ events จาก LINE               ││
│  │  /api/slip/verify   - OCR สลิป                          ││
│  │  /api/cron/*        - Scheduled jobs                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Google Sheets  │ │ LINE Messaging  │ │   Slip2Go API   │
│   (Database)    │ │      API        │ │     (OCR)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 2. Goals

### 2.1 Business Goals

| # | เป้าหมาย | ตัวชี้วัด (KPI) |
|---|----------|-----------------|
| G1 | ลดเวลาพิจารณาสินเชื่อ | < 24 ชั่วโมง จากยื่นถึงพิจารณา |
| G2 | เพิ่มอัตราการเก็บหนี้ตรงเวลา | > 90% ชำระตรงเวลา |
| G3 | ลดงาน Manual | ลด 70% ของการคีย์ข้อมูลซ้ำ |
| G4 | แจ้งเตือนครบถ้วน | 100% ของลูกค้าได้รับแจ้งเตือนก่อนครบกำหนด |
| G5 | เพิ่มความโปร่งใส | Staff ทุกคนเห็นข้อมูลตาม Role ที่กำหนด |

### 2.2 Functional Goals

1. **รับคำขอสินเชื่อ Online** - ลูกค้ากรอก LIFF Form และอัปโหลดเอกสารได้ใน LINE
2. **อนุมัติผ่านมือถือ** - ผู้พิจารณาอนุมัติ/ปฏิเสธผ่าน Admin LIFF ได้ทุกที่
3. **คำนวณดอกเบี้ยอัตโนมัติ** - ระบบคำนวณยอดค้างชำระตามสูตรที่กำหนด
4. **แจ้งเตือนอัตโนมัติ** - ส่ง LINE message ก่อนครบกำหนดและทวงถาม
5. **Dashboard สรุปภาพรวม** - เห็นสถานะทุกสัญญาในหน้าเดียว
6. **Role-based Access** - แต่ละ role เข้าถึงข้อมูลตามสิทธิ์ที่กำหนด

---

## 3. User Stories

### 3.1 User Roles

| Role | คำอธิบาย | สิทธิ์การเข้าถึง |
|------|----------|-----------------|
| **Super Admin** | ผู้ดูแลระบบสูงสุด | Full access ทุกฟังก์ชัน, จัดการ Settings |
| **Approver** | ผู้มีอำนาจพิจารณาสินเชื่อ | ดูคำขอ, อนุมัติ/ปฏิเสธ, ดู Dashboard |
| **Collector** | เจ้าหน้าที่ติดตามหนี้ | ดูสัญญา, บันทึกการชำระ, ส่งแจ้งเตือน manual |
| **Viewer** | ผู้ดูรายงาน (ผู้บริหาร) | ดู Dashboard และรายงานเท่านั้น |
| **Customer** | ลูกค้าผู้ขอสินเชื่อ | สมัครสินเชื่อ, ดูยอดค้าง, ส่งสลิป ผ่าน Customer LIFF |

### 3.2 User Stories by Role

#### Super Admin Stories

| ID | User Story |
|----|------------|
| SA-01 | ในฐานะ Super Admin ฉันต้องการจัดการ Settings ของระบบ (อัตราดอกเบี้ย default, จำนวนงวด) เพื่อให้ระบบทำงานตามนโยบายบริษัท |
| SA-02 | ในฐานะ Super Admin ฉันต้องการดูและแก้ไขข้อมูลทุกสัญญา เพื่อแก้ไขข้อผิดพลาดที่อาจเกิดขึ้น |
| SA-03 | ในฐานะ Super Admin ฉันต้องการดู Notification Log เพื่อตรวจสอบว่าแจ้งเตือนส่งสำเร็จหรือไม่ |
| SA-04 | ในฐานะ Super Admin ฉันต้องการจัดการ user roles เพื่อกำหนดสิทธิ์การเข้าถึงของแต่ละคน |

#### Approver Stories

| ID | User Story |
|----|------------|
| AP-01 | ในฐานะ Approver ฉันต้องการได้รับแจ้งเตือนทาง LINE เมื่อมีคำขอสินเชื่อใหม่ เพื่อพิจารณาได้ทันที |
| AP-02 | ในฐานะ Approver ฉันต้องการดูข้อมูลและเอกสารของผู้ขอสินเชื่อใน Admin LIFF เพื่อประกอบการพิจารณา |
| AP-03 | ในฐานะ Approver ฉันต้องการอนุมัติ/ปฏิเสธ/ขอเอกสารเพิ่มผ่าน Admin LIFF บนมือถือ เพื่อทำงานได้ทุกที่ |
| AP-04 | ในฐานะ Approver ฉันต้องการกำหนดวงเงินอนุมัติ, ดอกเบี้ย, และจำนวนงวด เพื่อปรับให้เหมาะกับลูกค้าแต่ละราย |
| AP-05 | ในฐานะ Approver ฉันต้องการให้ระบบแจ้งผลลูกค้าอัตโนมัติหลังอนุมัติ เพื่อลดงาน manual |

#### Collector Stories

| ID | User Story |
|----|------------|
| CL-01 | ในฐานะ Collector ฉันต้องการดูรายการสัญญาที่ค้างชำระ เพื่อติดตามทวงถาม |
| CL-02 | ในฐานะ Collector ฉันต้องการบันทึกการชำระเงินและแนบรูปสลิป เพื่ออัปเดตสถานะสัญญา |
| CL-03 | ในฐานะ Collector ฉันต้องการดูประวัติการชำระและการติดต่อของลูกค้า เพื่อวางแผนการติดตาม |
| CL-04 | ในฐานะ Collector ฉันต้องการส่งแจ้งเตือน manual ให้ลูกค้า เพื่อทวงถามกรณีพิเศษ |
| CL-05 | ในฐานะ Collector ฉันต้องการให้ระบบ OCR อ่านสลิปอัตโนมัติ เพื่อลดเวลาคีย์ข้อมูล |

#### Viewer Stories

| ID | User Story |
|----|------------|
| VW-01 | ในฐานะ Viewer ฉันต้องการดู Dashboard สรุปยอดปล่อยกู้และยอดคงค้าง เพื่อติดตามสถานะธุรกิจ |
| VW-02 | ในฐานะ Viewer ฉันต้องการดูรายงาน Aging Report เพื่อเห็นคุณภาพหนี้ |
| VW-03 | ในฐานะ Viewer ฉันต้องการดูรายงานประจำเดือน เพื่อนำไปประชุมทีม |

#### Customer Stories

| ID | User Story |
|----|------------|
| CU-01 | ในฐานะ Customer ฉันต้องการกรอกคำขอสินเชื่อผ่าน LINE (LIFF) เพื่อไม่ต้องเดินทางและไม่ต้องติดตั้ง app เพิ่ม |
| CU-02 | ในฐานะ Customer ฉันต้องการอัปโหลดเอกสารผ่าน LIFF เพื่อความสะดวก |
| CU-03 | ในฐานะ Customer ฉันต้องการได้รับแจ้งผลการพิจารณาทาง LINE เพื่อทราบผลทันที |
| CU-04 | ในฐานะ Customer ฉันต้องการได้รับแจ้งเตือนก่อนครบกำหนดชำระ เพื่อเตรียมเงิน |
| CU-05 | ในฐานะ Customer ฉันต้องการดูยอดค้างชำระปัจจุบันผ่าน LIFF เพื่อวางแผนการชำระ |
| CU-06 | ในฐานะ Customer ฉันต้องการส่งสลิปผ่าน LIFF เพื่อแจ้งการชำระเงิน |

---

## 4. Functional Requirements

### 4.1 Module 1: Loan Application & Approval

#### 4.1.1 Customer LIFF - สมัครสินเชื่อ

| # | Requirement |
|---|-------------|
| FR-101 | ระบบต้องมี Customer LIFF App สำหรับสมัครสินเชื่อ เปิดใน LINE ได้โดยตรง |
| FR-102 | LIFF Form ต้องมี fields: ชื่อ-นามสกุล, เลขบัตรประชาชน (13 หลัก), เบอร์โทร (10 หลัก), LINE ID (auto-fill จาก LIFF), จำนวนเงินที่ต้องการกู้, วัตถุประสงค์, ประเภทหลักทรัพย์, มูลค่าหลักทรัพย์, ที่อยู่หลักทรัพย์ |
| FR-103 | ระบบต้องรองรับการอัปโหลดเอกสาร: สำเนาบัตรประชาชน, สำเนาทะเบียนบ้าน, เอกสารหลักทรัพย์, รูปถ่ายหลักทรัพย์ (รองรับ Image และ PDF) |
| FR-104 | ระบบต้องบันทึกไฟล์ที่อัปโหลดไปยัง Google Drive โดยจัดเก็บในโฟลเดอร์แยกตาม Application ID |
| FR-105 | ระบบต้อง validate ข้อมูล: เลขบัตรประชาชน 13 หลัก, เบอร์โทร 10 หลัก |
| FR-106 | ระบบต้องดึง LINE User ID อัตโนมัติจาก LIFF เพื่อใช้ส่งแจ้งเตือน |
| FR-107 | ระบบต้องแสดง confirmation message หลังส่ง Form สำเร็จ |

#### 4.1.2 Notification - แจ้งเตือนผู้พิจารณา

| # | Requirement |
|---|-------------|
| FR-108 | ระบบต้องส่ง LINE message ไปยัง Approver ทันทีเมื่อมีคำขอใหม่ โดยแสดง: ชื่อลูกค้า, จำนวนเงิน, ประเภทหลักทรัพย์, link ไปยัง Admin LIFF |
| FR-109 | ระบบต้องใช้ LINE Messaging API ในการส่งแจ้งเตือน (ไม่ใช่ LINE Notify) |

#### 4.1.3 Admin LIFF - หน้าจออนุมัติ

| # | Requirement |
|---|-------------|
| FR-110 | ระบบต้องมี Admin LIFF App สำหรับ Admin ใช้งาน เปิดใน LINE ได้โดยตรง |
| FR-111 | Admin LIFF ต้องมี View "รอพิจารณา" แสดงคำขอที่ยังไม่ได้พิจารณา |
| FR-112 | Admin LIFF ต้องมี View "รายละเอียดคำขอ" แสดงข้อมูลครบถ้วน + link ไปยังเอกสารใน Drive |
| FR-113 | Admin LIFF ต้องมี Action Buttons: ✅ อนุมัติ, 📎 ขอเอกสารเพิ่ม, ❌ ปฏิเสธ |
| FR-114 | เมื่ออนุมัติ ระบบต้องให้ Approver กรอก: วงเงินอนุมัติ, อัตราดอกเบี้ย (%), จำนวนงวด, วันครบกำหนดชำระ (1-28), หมายเหตุ |
| FR-115 | ระบบต้องสร้าง Contract record และ Payment Schedule อัตโนมัติหลังอนุมัติ |
| FR-116 | ระบบต้องแจ้งผลลูกค้าผ่าน LINE message อัตโนมัติ (อนุมัติ/ปฏิเสธ/ขอเอกสารเพิ่ม) |
| FR-117 | Admin LIFF ต้องมีระบบ Authentication โดยใช้ LINE User ID + role mapping |

#### 4.1.4 Application Status Flow

| # | Requirement |
|---|-------------|
| FR-118 | ระบบต้องรองรับ Status: ยื่นคำขอ → รอพิจารณา → (อนุมัติ / รอเอกสาร / ปฏิเสธ) → ปล่อยกู้ |
| FR-119 | เมื่อ Status เปลี่ยนเป็น "รอเอกสาร" ลูกค้าต้องสามารถส่งเอกสารเพิ่มได้ผ่าน Customer LIFF |

---

### 4.2 Module 2: Debt Tracking & Interest Calculation

#### 4.2.1 Interest Calculation

| # | Requirement |
|---|-------------|
| FR-201 | ระบบต้องคำนวณดอกเบี้ยแบบ Simple Interest: `Monthly Interest = Principal × (Interest Rate / 100)` |
| FR-202 | ระบบต้องคำนวณยอดชำระต่องวด: `Monthly Payment = (Principal / Installments) + Monthly Interest` |
| FR-203 | ระบบต้อง generate Payment Schedule อัตโนมัติเมื่อสร้างสัญญา โดยระบุ: งวดที่, วันครบกำหนด, เงินต้น, ดอกเบี้ย, ยอดชำระ, สถานะ |

#### 4.2.2 Daily Processing (Vercel Cron)

| # | Requirement |
|---|-------------|
| FR-204 | ระบบต้องมี Cron Job ทำงานทุกวัน 08:00 น. เพื่อคำนวณยอดคงค้างทุกสัญญา |
| FR-205 | ระบบต้องคำนวณ Outstanding Balance = ยอดที่ต้องชำระถึงวันนี้ - ยอดที่ชำระแล้ว |
| FR-206 | ระบบต้องคำนวณ Days Overdue สำหรับสัญญาที่เกินกำหนดชำระ |

#### 4.2.3 Payment Recording

| # | Requirement |
|---|-------------|
| FR-207 | ระบบต้องรองรับการบันทึกการชำระ โดย Collector ผ่าน Admin LIFF พร้อมข้อมูล: Contract ID, วันที่ชำระ, จำนวนเงิน, วิธีการชำระ, รูปสลิป |
| FR-208 | ระบบต้องมี Verification process: Collector บันทึก → รอ verify → verified/rejected |
| FR-209 | เมื่อ verify การชำระ ระบบต้องอัปเดต Payment Schedule และ Outstanding Balance อัตโนมัติ |
| FR-210 | ลูกค้าสามารถส่งสลิปผ่าน Customer LIFF เพื่อแจ้งการชำระได้ |

---

### 4.3 Module 3: Notification System

#### 4.3.1 LINE Messaging API

| # | Requirement |
|---|-------------|
| FR-301 | ระบบต้องใช้ LINE Messaging API สำหรับส่งแจ้งเตือน (Push Message) |
| FR-302 | ระบบต้องเก็บ LINE User ID ของลูกค้าเพื่อส่งแจ้งเตือนรายบุคคล |
| FR-303 | ระบบต้องรองรับ Webhook เพื่อรับ events จาก LINE (follow, message, postback) |

#### 4.3.2 Automated Notifications

| # | Requirement |
|---|-------------|
| FR-304 | ระบบต้องส่ง Payment Reminder 7 วันก่อนครบกำหนด (08:00 น.) |
| FR-305 | ระบบต้องส่ง Due Date Alert ในวันครบกำหนด (08:00 น.) |
| FR-306 | ระบบต้องส่ง Overdue Alert ทุกวันที่ค้างชำระ 1, 7, 14, 30 วัน |
| FR-307 | ระบบต้องส่ง Escalation Alert ไปยัง Admin เมื่อค้างชำระเกิน 30 วัน |

#### 4.3.3 Notification Logging

| # | Requirement |
|---|-------------|
| FR-308 | ระบบต้อง Log ทุกการแจ้งเตือนพร้อม: Timestamp, Contract ID, Channel, Type, Message, Status, Error (ถ้ามี) |

---

### 4.4 Module 4: Dashboard & Reports

#### 4.4.1 Admin LIFF Dashboard

| # | Requirement |
|---|-------------|
| FR-401 | ระบบต้องมี Dashboard แสดง Summary Cards: สัญญาทั้งหมด, ยอดปล่อยกู้รวม, ยอดคงค้างรวม, จำนวนค้างชำระ, % ชำระตรงเวลา, จำนวนรอพิจารณา |
| FR-402 | ระบบต้องมี View "สถานะสัญญา" แสดง Chart: Active / Completed / Default |
| FR-403 | ระบบต้องมี View "Aging Report" แสดง Chart: Current, 1-7 days, 8-30 days, 31-60 days, 60+ days |
| FR-404 | ระบบต้องมี View "รายการค้างชำระ" แสดงตาราง: ชื่อ, เลขสัญญา, จำนวนวันค้าง, ยอดค้าง, Action buttons |

#### 4.4.2 Reports

| # | Requirement |
|---|-------------|
| FR-405 | ระบบต้อง generate Daily Report ทุกวัน 18:00 น. ส่งไปยัง Admin ผ่าน LINE |
| FR-406 | ระบบต้อง generate Monthly Report วันที่ 1 ของทุกเดือน 09:00 น. |
| FR-407 | รายงานต้องแสดง: คำขอใหม่, อนุมัติ/ปฏิเสธ, การชำระ, ยอดคงค้าง, รายการค้างชำระ |

---

### 4.5 Module 5: Slip OCR (Slip2Go Integration)

| # | Requirement |
|---|-------------|
| FR-501 | ระบบต้องรองรับการอัปโหลดรูปสลิปผ่าน Customer LIFF และ Admin LIFF |
| FR-502 | ระบบต้องส่งรูปสลิปไปยัง Slip2Go API เพื่อ extract ข้อมูล: จำนวนเงิน, วันที่, ธนาคาร, Transaction ID |
| FR-503 | ระบบต้อง Auto-match สลิปกับสัญญาโดยเทียบจำนวนเงินกับยอดชำระต่องวด (tolerance ±100 บาท) |
| FR-504 | หากไม่สามารถ match อัตโนมัติได้ ระบบต้องแสดงรายการ candidates ให้ Collector เลือก |
| FR-505 | เมื่อ match สำเร็จ ระบบต้องสร้าง Payment record อัตโนมัติ พร้อมสถานะ "Verified by OCR" |

---

### 4.6 Role-based Access Control

| # | Requirement |
|---|-------------|
| FR-601 | ระบบต้องรองรับ 5 roles: Super Admin, Approver, Collector, Viewer, Customer |
| FR-602 | ระบบต้องใช้ LINE User ID เป็น identifier และ map กับ role ใน database |
| FR-603 | Super Admin: เข้าถึงได้ทุก View และ Action รวมถึง Settings |
| FR-604 | Approver: เข้าถึง Applications, Contracts (read), Dashboard, Approve/Reject Actions |
| FR-605 | Collector: เข้าถึง Contracts, Payments, Record Payment Action, Manual Notification Action |
| FR-606 | Viewer: เข้าถึง Dashboard และ Reports เท่านั้น (read-only) |
| FR-607 | Customer: เข้าถึงเฉพาะ Customer LIFF (สมัคร, ดูยอด, ส่งสลิป) |

---

## 5. Non-Goals (Out of Scope)

สิ่งที่ **ไม่รวม** อยู่ใน scope ของโครงการนี้:

| # | Out of Scope | เหตุผล |
|---|--------------|--------|
| 1 | Online payment gateway (PromptPay, Credit Card) | ใช้การโอนเงินและอัปโหลดสลิปแทน |
| 2 | Native mobile app (iOS/Android) | ใช้ LINE LIFF ซึ่งเป็น web app ใน LINE |
| 3 | Multi-currency support | รองรับเฉพาะ THB |
| 4 | Interest calculation แบบ Compound | ใช้ Simple Interest เท่านั้น |
| 5 | Automated credit scoring | การพิจารณาทำโดย Approver |
| 6 | Legal document generation (สัญญากู้) | จัดทำนอกระบบ |
| 7 | Integration กับ National Credit Bureau | อยู่นอก scope |
| 8 | Multi-branch hierarchy | รองรับ single branch, multiple staff |
| 9 | Late fee / penalty calculation | คำนวณนอกระบบ |
| 10 | LINE Official Account auto-reply bot | ใช้ LIFF + Push Message เท่านั้น |

---

## 6. Design Considerations

### 6.1 UI/UX Principles

1. **LINE-Native:** ออกแบบให้เหมาะกับการใช้งานใน LINE (LIFF)
2. **Mobile-First:** ทุกหน้าจอออกแบบสำหรับมือถือก่อน
3. **ภาษาไทย:** ทุก Label, Message, และ Notification เป็นภาษาไทย
4. **สีสื่อความหมาย:** Green=ปกติ/สำเร็จ, Yellow=รอ, Red=ด่วน/ค้าง, Blue=Primary
5. **Fast Loading:** ใช้ Next.js SSR/SSG เพื่อให้โหลดเร็ว

### 6.2 Color Scheme

| Color | Hex Code | ใช้สำหรับ |
|-------|----------|----------|
| LINE Green | `#06C755` | Primary actions, Success |
| Primary Blue | `#1A73E8` | Links, Secondary actions |
| Success Green | `#34A853` | อนุมัติ, ชำระแล้ว, สำเร็จ |
| Warning Yellow | `#FBBC04` | รอพิจารณา, แจ้งเตือน |
| Danger Red | `#EA4335` | ปฏิเสธ, ค้างชำระ, Error |
| Neutral Gray | `#5F6368` | Text, Borders |
| Background | `#F8F9FA` | Page background |

### 6.3 LIFF App Structure

```
📱 LINE App
├── 🧑‍💼 Customer LIFF (/customer/*)
│   ├── /customer/apply          - สมัครสินเชื่อ
│   ├── /customer/status         - ดูสถานะคำขอ
│   ├── /customer/contracts      - ดูสัญญาของตัวเอง
│   ├── /customer/payment        - ดูยอดค้างชำระ
│   └── /customer/slip           - ส่งสลิปการชำระ
│
└── 👔 Admin LIFF (/admin/*)
    ├── /admin/dashboard         - Dashboard สรุปภาพรวม
    ├── /admin/applications      - รายการคำขอ
    │   ├── /admin/applications/pending    - รอพิจารณา
    │   └── /admin/applications/[id]       - รายละเอียด
    ├── /admin/contracts         - รายการสัญญา
    │   ├── /admin/contracts/active        - Active
    │   ├── /admin/contracts/overdue       - ค้างชำระ
    │   └── /admin/contracts/[id]          - รายละเอียด
    ├── /admin/payments          - การชำระเงิน
    │   ├── /admin/payments/pending        - รอ verify
    │   └── /admin/payments/record         - บันทึกการชำระ
    ├── /admin/reports           - รายงาน
    └── /admin/settings          - ตั้งค่า (Super Admin)
```

### 6.4 Google Drive Folder Structure

```
📁 Loan_System/
├── 📁 Applications/
│   └── 📁 {YYYY-MM}/
│       └── 📁 {APP_ID}_{ชื่อ}_{Date}/
├── 📁 Contracts/
│   └── 📁 {Contract_ID}/
├── 📁 Payment_Slips/
│   └── 📁 {Contract_ID}/
└── 📁 Reports/
    └── 📁 {YYYY-MM}/
```

---

## 7. Technical Considerations

### 7.1 Project Structure

```
line-lender-app-poc/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (customer)/           # Customer LIFF pages
│   │   │   ├── apply/
│   │   │   ├── status/
│   │   │   ├── contracts/
│   │   │   ├── payment/
│   │   │   └── slip/
│   │   ├── (admin)/              # Admin LIFF pages
│   │   │   ├── dashboard/
│   │   │   ├── applications/
│   │   │   ├── contracts/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/                  # API Routes
│   │   │   ├── applications/
│   │   │   ├── contracts/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   ├── line/
│   │   │   │   └── webhook/
│   │   │   ├── slip/
│   │   │   └── cron/
│   │   └── layout.tsx
│   ├── components/               # React components
│   │   ├── ui/                   # UI components (shadcn/ui)
│   │   ├── forms/
│   │   ├── dashboard/
│   │   └── liff/
│   ├── lib/                      # Utility libraries
│   │   ├── google-sheets.ts      # Google Sheets API client
│   │   ├── google-drive.ts       # Google Drive API client
│   │   ├── line.ts               # LINE Messaging API wrapper
│   │   ├── liff.ts               # LIFF utilities
│   │   ├── slip2go.ts            # Slip2Go API client
│   │   ├── auth.ts               # Authentication utilities
│   │   └── calculations.ts       # Interest/payment calculations
│   ├── types/                    # TypeScript types
│   └── hooks/                    # Custom React hooks
├── public/
├── .env.local                    # Environment variables
├── next.config.js
├── tailwind.config.js
├── vercel.json                   # Vercel config (cron jobs)
└── package.json
```

### 7.2 Google Sheets Structure

| Sheet Name | Purpose | Key Columns |
|------------|---------|-------------|
| Applications | คำขอสินเชื่อ | Application_ID, Name, ID_Card, LINE_User_ID, Amount, Status, ... |
| Contracts | สัญญา | Contract_ID, Application_ID, LINE_User_ID, Approved_Amount, Interest_Rate, Installments, Status, ... |
| Payment_Schedule | ตารางผ่อนชำระ | Schedule_ID, Contract_ID, Installment_No, Due_Date, Amount, Status, ... |
| Payments | การชำระเงิน | Payment_ID, Contract_ID, Date, Amount, Slip_Image, Verified, ... |
| Users | ผู้ใช้งาน Admin | LINE_User_ID, Name, Role, Active, ... |
| Notification_Log | Log การแจ้งเตือน | Log_ID, Timestamp, Contract_ID, Channel, Type, Status, ... |
| Settings | ค่า Configuration | Key, Value |

### 7.3 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/applications` | GET, POST | List/Create applications |
| `/api/applications/[id]` | GET, PATCH | Get/Update application |
| `/api/applications/[id]/approve` | POST | Approve application |
| `/api/applications/[id]/reject` | POST | Reject application |
| `/api/contracts` | GET | List contracts |
| `/api/contracts/[id]` | GET, PATCH | Get/Update contract |
| `/api/payments` | GET, POST | List/Create payments |
| `/api/payments/[id]/verify` | POST | Verify payment |
| `/api/notifications/send` | POST | Send LINE notification |
| `/api/line/webhook` | POST | LINE webhook handler |
| `/api/slip/verify` | POST | OCR slip with Slip2Go |
| `/api/cron/daily` | GET | Daily processing |
| `/api/cron/reminders` | GET | Send reminders |

### 7.4 Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 1 * * *"  // 08:00 Bangkok time
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "0 1 * * *"  // 08:00 Bangkok time
    },
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 11 * * *" // 18:00 Bangkok time
    }
  ]
}
```

### 7.5 Environment Variables

```env
# LINE
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LIFF_ID_CUSTOMER=
LIFF_ID_ADMIN=

# Google
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=
GOOGLE_DRIVE_FOLDER_ID=

# Slip2Go
SLIP2GO_API_KEY=

# App
NEXT_PUBLIC_BASE_URL=
CRON_SECRET=
```

### 7.6 External API Dependencies

| API | Purpose | Rate Limit |
|-----|---------|------------|
| LINE Messaging API | ส่ง Push Message | 100,000/month (free) |
| LINE LIFF | Web app in LINE | - |
| Google Sheets API | Database operations | 100 requests/100 seconds |
| Google Drive API | File storage | 1,000,000 queries/day |
| Slip2Go API | OCR สลิป | ตาม package ที่ซื้อ |

### 7.7 Security Considerations

1. **Authentication:** ใช้ LINE User ID + LIFF access token verification
2. **Authorization:** Role-based access control (map LINE User ID to role)
3. **Data Encryption:** HTTPS everywhere, Google encrypts data at rest
4. **Sensitive Data:** แสดงเลขบัตรประชาชนเป็น `1-xxxx-xxxxx-xx-x`
5. **API Security:** Verify LINE signature on webhook, use CRON_SECRET for cron jobs
6. **Audit Trail:** Log ทุก action สำคัญ (approve, reject, payment, notification)

### 7.8 PDPA Compliance

1. **Consent:** LIFF Form มี checkbox ยินยอมให้เก็บข้อมูล
2. **Purpose Limitation:** ใช้ข้อมูลเฉพาะการพิจารณาและติดตามสินเชื่อ
3. **Data Retention:** กำหนด retention period 7 ปีตามกฎหมายการเงิน
4. **Right to Access:** ลูกค้าสามารถดูข้อมูลของตัวเองผ่าน Customer LIFF

---

## 8. Success Metrics

### 8.1 Operational Metrics

| Metric | Target | วิธีวัด |
|--------|--------|--------|
| เวลาพิจารณาเฉลี่ย | < 24 ชั่วโมง | AVG(Reviewed_Date - Submitted_Date) |
| อัตราชำระตรงเวลา | > 90% | COUNT(Paid on time) / COUNT(Total due) |
| อัตราการส่งแจ้งเตือนสำเร็จ | > 99% | COUNT(Success) / COUNT(Total sent) |
| ลด Manual data entry | -70% | เปรียบเทียบ workflow เดิม vs ใหม่ |

### 8.2 Business Metrics

| Metric | Target | วิธีวัด |
|--------|--------|--------|
| Collection Rate | > 95% | Total Collected / Total Due |
| NPL Ratio (Non-performing Loan) | < 5% | Overdue 90+ days / Total Outstanding |
| Average Days Overdue | < 7 วัน | AVG(Days Overdue) for overdue contracts |

### 8.3 User Satisfaction

| Metric | Target | วิธีวัด |
|--------|--------|--------|
| Approver satisfaction | > 4/5 | Survey หลังใช้งาน 1 เดือน |
| Collector satisfaction | > 4/5 | Survey หลังใช้งาน 1 เดือน |
| Reduction in complaints | -50% | เปรียบเทียบก่อน/หลัง implement |

---

## 9. Open Questions

| # | Question | Status | Owner |
|---|----------|--------|-------|
| 1 | LINE Official Account ของลูกค้าสร้างแล้วหรือยัง? ต้องใช้สำหรับ LIFF และ Messaging API | Open | Business |
| 2 | Google Service Account สำหรับ Sheets/Drive API มีหรือยัง? | Open | Dev Team |
| 3 | ต้องการ audit trail ระดับไหน? (ทุก action หรือเฉพาะ critical actions) | Resolved | Product Owner |
| 4 | มี SLA สำหรับการ respond ของ Approver หรือไม่? (เช่น ต้องตอบภายใน 24 ชม.) | Open | Business |
| 5 | ค่าใช้จ่าย Slip2Go package ไหนที่เหมาะสม? (ประมาณการจำนวน slips ต่อเดือน) | Open | Business |
| 6 | Domain สำหรับ LIFF endpoint URL คืออะไร? (จะใช้ Vercel subdomain หรือ custom domain) | Open | Dev Team |
| 7 | ลูกค้าจะ add LINE OA อย่างไร? (QR code, LINE ID, หรือ link) | Open | Business |

---

## Appendix

### A. Notification Message Templates

#### แจ้ง Approver เมื่อมีคำขอใหม่
```
🔔 คำขอสินเชื่อใหม่

👤 ชื่อ: {ชื่อ-นามสกุล}
💰 จำนวน: ฿{จำนวนเงิน}
📋 หลักทรัพย์: {ประเภท}
📅 วันที่: {timestamp}

🔗 ดูรายละเอียด: {Admin_LIFF_Link}
```

#### แจ้งลูกค้าเมื่ออนุมัติ
```
✅ ยินดีด้วย! สินเชื่อของท่านได้รับการอนุมัติ

📋 เลขที่สัญญา: {Contract_ID}
💰 วงเงินอนุมัติ: ฿{approved_amount}
📈 อัตราดอกเบี้ย: {interest_rate}% ต่อเดือน
📅 ผ่อนชำระ: {installments} งวด
💵 ยอดชำระต่องวด: ฿{monthly_payment}
📆 ครบกำหนดทุกวันที่: {due_day} ของเดือน

กรุณาติดต่อรับเงินภายใน 7 วัน

🔗 ดูรายละเอียด: {Customer_LIFF_Link}
```

#### แจ้งเตือนก่อนครบกำหนด (7 วัน)
```
⏰ แจ้งเตือนการชำระเงิน

เรียน คุณ{name},

📅 งวดที่ {installment_no} ครบกำหนดชำระ
📆 วันที่: {due_date}
💰 ยอดชำระ: ฿{amount}

กรุณาชำระภายในวันครบกำหนด

🔗 ดูยอดค้าง: {Customer_LIFF_Link}
📱 ติดต่อ: {contact}
```

#### แจ้งเตือนค้างชำระ
```
⚠️ แจ้งเตือนหนี้ค้างชำระ

เรียน คุณ{name},

📛 ค้างชำระ {days_overdue} วัน
💰 ยอดค้าง: ฿{overdue_amount}

กรุณาชำระโดยเร็วที่สุด

🔗 ดูยอดค้าง: {Customer_LIFF_Link}
📱 ติดต่อ: {contact}
```

---

### B. Data Dictionary

| Field | Type | Format | Example |
|-------|------|--------|---------|
| Application_ID | Text | APP{NNN} | APP001 |
| Contract_ID | Text | CON{NNN} | CON001 |
| Payment_ID | Text | PAY{NNN} | PAY001 |
| LINE_User_ID | Text | U + 32 chars | Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| ID_Card | Text | 13 digits | 1234567890123 |
| Phone | Text | 10 digits | 0812345678 |
| Amount | Number | Currency (THB) | 150000 |
| Interest_Rate | Number | Percentage | 1.5 |
| Date | Date | YYYY-MM-DD | 2024-12-25 |
| Status | Text | Enum | รอพิจารณา, อนุมัติ, ปฏิเสธ |

---

### C. LINE Channel Setup Checklist

1. [ ] สร้าง LINE Official Account
2. [ ] Enable Messaging API
3. [ ] สร้าง LINE Login channel
4. [ ] สร้าง LIFF app (Customer)
5. [ ] สร้าง LIFF app (Admin)
6. [ ] ตั้งค่า Webhook URL
7. [ ] เก็บ Channel ID, Channel Secret, Access Token

---

*— End of Document —*
