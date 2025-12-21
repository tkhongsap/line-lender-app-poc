# Product Requirements Document (PRD)

## Web-Admin Portal Feature Completion
### ระบบจัดการสินเชื่อ - Staff Portal Features

---

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Date** | December 21, 2024 |
| **Status** | Ready for Development |
| **Platform** | Next.js Web Application |
| **Related PRD** | tasks/prd-loan-management-system.md |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Feature Gap Analysis](#3-feature-gap-analysis)
4. [Functional Requirements](#4-functional-requirements)
5. [User Stories](#5-user-stories)
6. [UI/UX Specifications](#6-uiux-specifications)
7. [Implementation Priority](#7-implementation-priority)
8. [Technical Notes](#8-technical-notes)

---

## 1. Executive Summary

### 1.1 Background

The loan management system has two access points for staff:
1. **LINE LIFF Admin** - For staff who work primarily on mobile within LINE
2. **Web-Admin Portal** - Standalone web app with Google login for desktop access

The Web-Admin Portal was recently implemented with Google OAuth authentication. However, it currently only supports **Application Management** (viewing and approving loan applications). 

This PRD defines the remaining features needed to make the Web-Admin Portal fully operational for day-to-day loan management activities.

### 1.2 Goal

Complete the Web-Admin Portal so that staff can:
- **Collectors**: Track contracts, record payments, verify slips, manage overdue accounts
- **Super Admins**: Manage staff, configure system settings
- **All Staff**: View comprehensive dashboards and reports

### 1.3 Success Criteria

| Metric | Target |
|--------|--------|
| Collectors can view overdue contracts | 100% |
| Collectors can record and verify payments | 100% |
| Super Admin can manage staff via UI | 100% |
| Dashboard shows aging report | 100% |

---

## 2. Current Implementation Status

### 2.1 What's Already Implemented

#### Customer Portal (LINE LIFF)
| Feature | Status | Path |
|---------|--------|------|
| Apply for loan | ✅ Complete | `/apply` |
| Check application status | ✅ Complete | `/status` |
| View my contracts | ✅ Complete | `/contracts` |
| View payment due | ✅ Complete | `/payment` |
| Upload payment slip | ✅ Complete | `/slip` |

#### Web-Admin Portal
| Feature | Status | Path |
|---------|--------|------|
| Google OAuth Login | ✅ Complete | `/web-admin/login` |
| Dashboard (basic) | ✅ Complete | `/web-admin/dashboard` |
| Applications list | ✅ Complete | `/web-admin/applications` |
| Pending applications | ✅ Complete | `/web-admin/applications/pending` |
| Application detail | ✅ Complete | `/web-admin/applications/[id]` |
| Approve/Reject actions | ✅ Complete | Buttons on detail page |

#### Backend APIs
| API | Status | Notes |
|-----|--------|-------|
| `/api/applications/*` | ✅ Complete | Full CRUD + approve/reject |
| `/api/contracts/*` | ✅ Complete | List and detail |
| `/api/payments/*` | ✅ Complete | List, create, verify |
| `/api/slip/verify` | ✅ Complete | OCR integration |
| `/api/web-admin/staff` | ✅ Complete | Staff CRUD |
| `/api/cron/*` | ✅ Complete | Daily processing |

### 2.2 What's Missing

The backend APIs exist but the **Web-Admin UI pages are missing** for:
- Contracts management
- Payments management
- Staff management
- Settings configuration
- Reports viewing
- Enhanced dashboard features

---

## 3. Feature Gap Analysis

### 3.1 By User Role

#### Collector Role - Daily Operations
| Task | Can They Do It? | Blocker |
|------|-----------------|---------|
| View all contracts | ❌ No | No contracts page |
| View overdue contracts | ❌ No | No overdue filter |
| See payment schedule | ❌ No | No contract detail page |
| Record a payment | ❌ No | No payment recording form |
| Verify a payment slip | ❌ No | No verification UI |
| Send manual reminder | ❌ No | No notification UI |

#### Super Admin Role
| Task | Can They Do It? | Blocker |
|------|-----------------|---------|
| Add new staff member | ❌ No | No staff management UI |
| Change staff role | ❌ No | No staff management UI |
| Deactivate staff | ❌ No | No staff management UI |
| Set default interest rate | ❌ No | No settings page |
| Set default installments | ❌ No | No settings page |

#### All Staff
| Task | Can They Do It? | Blocker |
|------|-----------------|---------|
| View aging report | ❌ No | Dashboard lacks chart |
| View overdue quick list | ❌ No | Dashboard lacks section |
| View reports | ❌ No | No reports page |
| Export data | ❌ No | No export functionality |

---

## 4. Functional Requirements

### 4.1 Module: Contracts Management

#### FR-CM-01: Contracts List Page
| Requirement |
|-------------|
| Display all contracts in a table/card format |
| Show: Contract ID, Customer Name, Amount, Status, Days Overdue |
| Filter by status: All, Active, Completed, Default |
| Filter by overdue: Current, 1-7 days, 8-30 days, 31+ days |
| Search by customer name or contract ID |
| Sort by: Date, Amount, Days Overdue |
| Click to view contract detail |

#### FR-CM-02: Contract Detail Page
| Requirement |
|-------------|
| Display full contract information |
| Show customer info: Name, Phone, LINE ID |
| Show loan terms: Amount, Interest Rate, Installments |
| Display payment schedule table with status per installment |
| Show payment history for this contract |
| Display outstanding balance prominently |
| Show days overdue (if applicable) |
| Quick actions: Record Payment, Send Reminder |
| Link to customer documents in Google Drive |

#### FR-CM-03: Overdue Contracts View
| Requirement |
|-------------|
| Quick filter for overdue contracts only |
| Sort by most overdue first (default) |
| Show escalation level: Yellow (1-7d), Orange (8-30d), Red (31+d) |
| Bulk action: Send reminder to multiple |

### 4.2 Module: Payments Management

#### FR-PM-01: Payments List Page
| Requirement |
|-------------|
| Display all payment records |
| Show: Payment ID, Contract ID, Customer, Amount, Date, Status |
| Filter by status: All, Pending Verification, Verified, Rejected |
| Filter by date range |
| Click to view payment detail |

#### FR-PM-02: Pending Verification Queue
| Requirement |
|-------------|
| Default view showing only pending payments |
| Show slip image thumbnail |
| Quick verify/reject buttons |
| OCR data display (if available) |
| Link to related contract |

#### FR-PM-03: Record Payment Form
| Requirement |
|-------------|
| Select contract (with search/autocomplete) |
| Input: Payment date, Amount, Payment method |
| Optional: Upload slip image |
| Optional: Run OCR on uploaded slip |
| Auto-fill from OCR results |
| Validation: Amount matches expected installment (warning if differs) |
| Submit creates payment record |

#### FR-PM-04: Payment Verification
| Requirement |
|-------------|
| View payment details |
| View attached slip image (full size) |
| View OCR extracted data (if any) |
| Compare with expected payment |
| Actions: Verify (approve), Reject (with reason) |
| On verify: Update payment status, update contract balance |

### 4.3 Module: Staff Management

#### FR-SM-01: Staff List Page
| Requirement |
|-------------|
| Only accessible to SUPER_ADMIN role |
| Display all staff members |
| Show: Email, Name, Role, Status (Active/Inactive), Last Login |
| Click to edit staff |

#### FR-SM-02: Add Staff
| Requirement |
|-------------|
| Input: Email address (Google account) |
| Select role: SUPER_ADMIN, APPROVER, COLLECTOR, VIEWER |
| Staff is created with active=true |
| Staff can login immediately with their Google account |

#### FR-SM-03: Edit Staff
| Requirement |
|-------------|
| Change role |
| Activate/Deactivate account |
| Cannot deactivate own account |
| Cannot demote own role |

### 4.4 Module: Settings

#### FR-ST-01: Settings Page
| Requirement |
|-------------|
| Only accessible to SUPER_ADMIN role |
| Grouped settings sections |

#### FR-ST-02: Loan Settings
| Setting | Type | Default |
|---------|------|---------|
| Default Interest Rate (%) | Number | 1.5 |
| Default Installments | Number | 12 |
| Available Installment Options | Array | [6, 12, 18, 24] |
| Minimum Loan Amount | Number | 10,000 |
| Maximum Loan Amount | Number | 1,000,000 |

#### FR-ST-03: Notification Settings
| Setting | Type | Default |
|---------|------|---------|
| Reminder Days Before Due | Number | 7 |
| Overdue Alert Days | Array | [1, 7, 14, 30] |
| Enable Daily Report | Boolean | true |
| Daily Report Time | Time | 18:00 |

#### FR-ST-04: Company Info
| Setting | Type |
|---------|------|
| Company Name | Text |
| Contact Phone | Text |
| Contact LINE ID | Text |
| Address | Text |

### 4.5 Module: Dashboard Enhancements

#### FR-DB-01: Aging Report Chart
| Requirement |
|-------------|
| Bar or pie chart showing debt aging |
| Categories: Current, 1-7 days, 8-30 days, 31-60 days, 60+ days |
| Show both count and amount |
| Click segment to filter to those contracts |

#### FR-DB-02: Overdue Quick List
| Requirement |
|-------------|
| Show top 10 most overdue contracts |
| Display: Customer name, Days overdue, Amount owed |
| Quick actions: View, Call, Send Reminder |
| "View All" link to full overdue list |

#### FR-DB-03: Better Metrics
| Requirement |
|-------------|
| Total Disbursed Amount |
| Total Outstanding Balance |
| Collection Rate (this month) |
| On-time Payment Rate |
| Overdue Count by severity |

### 4.6 Module: Reports

#### FR-RP-01: Reports Page
| Requirement |
|-------------|
| View historical reports |
| Filter by: Daily, Monthly |
| Filter by date range |
| Display report content inline |

#### FR-RP-02: Report Content
| Daily Report Fields |
|---------------------|
| New applications count |
| Approved/Rejected count |
| Payments received (count and amount) |
| Active contracts count |
| Total outstanding balance |
| Overdue list |

| Monthly Report Fields |
|-----------------------|
| Total applications |
| Approval rate |
| Total disbursed |
| Total collected |
| Collection rate |
| Aging breakdown |
| Top overdue accounts |

---

## 5. User Stories

### 5.1 Collector Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| CL-01 | As a Collector, I want to see all overdue contracts so I can prioritize follow-ups | Overdue list shows contracts sorted by days overdue |
| CL-02 | As a Collector, I want to record a payment when a customer pays so the balance updates | Payment form creates record, balance decreases |
| CL-03 | As a Collector, I want to verify payment slips so we confirm payments are valid | Verify button updates status, updates balance |
| CL-04 | As a Collector, I want to see payment history per contract so I know customer's pattern | Contract detail shows all payments |
| CL-05 | As a Collector, I want to use OCR on slips so I don't have to type payment details | OCR auto-fills amount, date, bank |

### 5.2 Super Admin Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| SA-01 | As a Super Admin, I want to add new staff so they can access the system | Staff can login with Google after being added |
| SA-02 | As a Super Admin, I want to change staff roles so permissions match their job | Role change reflects in their access immediately |
| SA-03 | As a Super Admin, I want to deactivate staff so ex-employees can't access | Deactivated staff sees "not authorized" on login |
| SA-04 | As a Super Admin, I want to set default interest rate so new loans use it | Approval form pre-fills with default rate |
| SA-05 | As a Super Admin, I want to configure notification timing so reminders go at right time | Settings save to database, cron uses them |

### 5.3 All Staff Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| AS-01 | As staff, I want to see an aging report so I understand debt quality | Chart shows distribution by overdue days |
| AS-02 | As staff, I want to see daily reports so I know business activity | Report page shows daily summaries |
| AS-03 | As staff, I want to export data so I can analyze in Excel | Export button downloads CSV |

---

## 6. UI/UX Specifications

### 6.1 Navigation Structure

```
📱 Web-Admin Portal
├── 📊 Dashboard
├── 📋 Applications
│   ├── All Applications
│   └── Pending Review
├── 📁 Contracts          [NEW]
│   ├── All Contracts
│   ├── Active
│   └── Overdue
├── 💳 Payments           [NEW]
│   ├── All Payments
│   ├── Pending Verification
│   └── Record Payment
├── 👥 Staff              [NEW - Super Admin only]
├── ⚙️ Settings           [NEW - Super Admin only]
└── 📈 Reports            [NEW]
```

### 6.2 Contracts List Design

```
┌─────────────────────────────────────────────────────────────┐
│  📁 Contracts                                    [+ Export] │
├─────────────────────────────────────────────────────────────┤
│  [All] [Active] [Overdue] [Completed]     🔍 Search...     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CON001    สมชาย ใจดี                                    │ │
│ │ ฿150,000  🟢 Active    0 days    Outstanding: ฿78,667  │ │
│ │                                           [View Details]│ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CON002    มานะ พยายาม                                   │ │
│ │ ฿100,000  🔴 Overdue   15 days   Outstanding: ฿52,000  │ │
│ │                                           [View Details]│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Contract Detail Design

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    Contract CON001                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Customer Info                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ สมชาย ใจดี                                             │  │
│  │ 📞 081-234-5678    💬 LINE: somchai_j                 │  │
│  │ [📞 Call] [💬 Send LINE]                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  💰 Loan Details                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Approved:    ฿150,000     Interest: 1.5% /month       │  │
│  │ Installments: 12          Monthly:  ฿9,833            │  │
│  │ Start Date:  Oct 1, 2024  End Date: Sep 1, 2025       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  📊 Status                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Paid:        ฿39,333 (4/12 installments)              │  │
│  │ Outstanding: ฿78,667                                   │  │
│  │ Status:      🟢 Current                                │  │
│  │ ████████░░░░░░░░░░░░ 33% complete                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  📅 Payment Schedule                                        │
│  ┌─────────┬────────────┬──────────┬────────────────────┐  │
│  │ # │ Due Date   │ Amount   │ Status              │  │
│  ├─────────┼────────────┼──────────┼────────────────────┤  │
│  │ 1 │ Oct 25     │ ฿9,833   │ ✅ Paid Oct 24      │  │
│  │ 2 │ Nov 25     │ ฿9,833   │ ✅ Paid Nov 23      │  │
│  │ 3 │ Dec 25     │ ฿9,833   │ ✅ Paid Dec 24      │  │
│  │ 4 │ Jan 25     │ ฿9,833   │ ✅ Paid Jan 22      │  │
│  │ 5 │ Feb 25     │ ฿9,833   │ ⏳ Pending          │  │
│  │ ...                                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  📜 Payment History                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Jan 22, 2025  ฿9,833   Transfer  ✅ Verified         │  │
│  │ Dec 24, 2024  ฿9,833   Transfer  ✅ Verified         │  │
│  │ Nov 23, 2024  ฿9,833   Transfer  ✅ Verified         │  │
│  │ Oct 24, 2024  ฿9,833   Transfer  ✅ Verified         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [➕ Record Payment]  [📤 Send Reminder]  [📄 Documents]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Staff Management Design

```
┌─────────────────────────────────────────────────────────────┐
│  👥 Staff Management                          [+ Add Staff] │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📧 admin@company.com                                   │   │
│ │ 👤 สมศักดิ์ ผู้ดูแล         🏷️ SUPER_ADMIN  🟢 Active  │   │
│ │                                              [Edit]    │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📧 approver@company.com                                │   │
│ │ 👤 สมหญิง อนุมัติ          🏷️ APPROVER     🟢 Active  │   │
│ │                                              [Edit]    │   │
│ └───────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📧 collector@company.com                               │   │
│ │ 👤 มานี ติดตาม            🏷️ COLLECTOR    🟢 Active  │   │
│ │                                              [Edit]    │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Add New Staff                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Email (Google Account) *                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ newstaff@gmail.com                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Role *                                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ APPROVER                                         ▼   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Cancel]                                    [Add Staff]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Color Coding

| Status | Color | Hex |
|--------|-------|-----|
| Active / Current | Green | `#22c55e` |
| Pending | Yellow | `#eab308` |
| Overdue 1-7 days | Orange | `#f97316` |
| Overdue 8+ days | Red | `#ef4444` |
| Completed | Blue | `#3b82f6` |
| Inactive | Gray | `#6b7280` |

---

## 7. Implementation Priority

### Phase 1: Collector Daily Operations (Week 1-2)
**Priority: Critical** - Blocking day-to-day work

| Task | Effort | Dependencies |
|------|--------|--------------|
| Contracts list page | 4 hrs | None |
| Contracts detail page | 6 hrs | Contracts list |
| Overdue contracts view | 2 hrs | Contracts list |
| Payments list page | 4 hrs | None |
| Pending verification view | 2 hrs | Payments list |
| Record payment form | 4 hrs | Payments list |
| Verify payment UI | 3 hrs | Payments list |
| Update navigation | 1 hr | All above |

### Phase 2: Super Admin Tools (Week 2-3)
**Priority: High** - Needed for team management

| Task | Effort | Dependencies |
|------|--------|--------------|
| Staff list page | 3 hrs | None |
| Add staff modal | 2 hrs | Staff list |
| Edit staff modal | 2 hrs | Staff list |
| Settings page | 4 hrs | None |
| Settings API (if needed) | 2 hrs | Settings page |

### Phase 3: Dashboard & Reports (Week 3-4)
**Priority: Medium** - Nice to have

| Task | Effort | Dependencies |
|------|--------|--------------|
| Aging report chart | 4 hrs | None |
| Overdue quick list | 2 hrs | None |
| Better metrics cards | 2 hrs | None |
| Reports list page | 3 hrs | None |
| Report detail view | 2 hrs | Reports list |

---

## 8. Technical Notes

### 8.1 Existing APIs to Use

| Feature | API Endpoint | Status |
|---------|--------------|--------|
| List contracts | `GET /api/contracts` | ✅ Ready |
| Contract detail | `GET /api/contracts/[id]` | ✅ Ready |
| List payments | `GET /api/payments` | ✅ Ready |
| Create payment | `POST /api/payments` | ✅ Ready |
| Verify payment | `POST /api/payments/[id]/verify` | ✅ Ready |
| OCR slip | `POST /api/slip/verify` | ✅ Ready |
| Staff CRUD | `/api/web-admin/staff` | ✅ Ready |

### 8.2 New APIs Needed

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Settings | `GET/PUT /api/settings` | Read/write system settings |
| Reports list | `GET /api/reports` | List generated reports |
| Dashboard stats | `GET /api/dashboard/stats` | Aggregated metrics |

### 8.3 Component Reuse

Existing components from the applications pages can be adapted:
- Card layouts from `WebAdminNavigation`
- Table/list styles from applications list
- Detail page layout from application detail
- Badge components for status display
- Dialog components for modals

### 8.4 Authentication

All new pages should:
1. Be wrapped with `WebAdminGuard` component
2. Check user role for role-specific pages (staff, settings)
3. Use `useWebAuth` hook for current user info

---

## Appendix

### A. File Structure for New Pages

```
src/app/(web-admin)/web-admin/
├── contracts/
│   ├── page.tsx              # All contracts
│   ├── overdue/
│   │   └── page.tsx          # Overdue only
│   └── [id]/
│       └── page.tsx          # Contract detail
├── payments/
│   ├── page.tsx              # All payments
│   ├── pending/
│   │   └── page.tsx          # Pending verification
│   └── record/
│       └── page.tsx          # Record payment form
├── staff/
│   └── page.tsx              # Staff management
├── settings/
│   └── page.tsx              # System settings
└── reports/
    └── page.tsx              # Reports view
```

### B. Database Tables

Existing tables used:
- `web_admin_users` - Staff management (PostgreSQL)
- `Contracts` sheet - Contract data (Google Sheets)
- `Payments` sheet - Payment records (Google Sheets)
- `Settings` sheet - Configuration (Google Sheets)

### C. Role Permissions Matrix

| Feature | SUPER_ADMIN | APPROVER | COLLECTOR | VIEWER |
|---------|-------------|----------|-----------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Applications | ✅ | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ✅ | ❌ | ❌ |
| Contracts (view) | ✅ | ✅ | ✅ | ✅ |
| Payments (view) | ✅ | ✅ | ✅ | ✅ |
| Record Payment | ✅ | ❌ | ✅ | ❌ |
| Verify Payment | ✅ | ❌ | ✅ | ❌ |
| Staff Management | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ |

---

*— End of Document —*

