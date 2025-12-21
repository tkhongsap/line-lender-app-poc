---
name: Complete PRD Gaps
overview: Implement the 9 remaining PRD gaps (skipping Staff Last Login) to bring the web-admin portal to full PRD compliance. The implementation will focus on UI enhancements, filtering/sorting, and export functionality.
todos:
  - id: gap-1-contracts-filters
    content: Add overdue bucket filters and sort options to contracts list
    status: completed
  - id: gap-2-contract-detail
    content: Add LINE ID and Google Drive links to contract detail page
    status: completed
  - id: gap-3-bulk-reminders
    content: Add bulk reminder action to overdue contracts page
    status: completed
  - id: gap-4-payments-filters
    content: Add customer name display and date range filter to payments list
    status: completed
  - id: gap-5-slip-thumbnail
    content: Add slip thumbnail preview to pending verification page
    status: completed
  - id: gap-6-payment-detail
    content: Create payment verification detail page
    status: completed
  - id: gap-8-dashboard-rates
    content: Add rates metrics and clickable aging chart to dashboard
    status: completed
  - id: gap-9-reports-history
    content: Add historical reports list and date range to reports page
    status: completed
  - id: gap-10-export
    content: Add CSV export buttons to contracts and payments lists
    status: completed
---

# Complete PRD Feature Gaps

This plan addresses the 9 remaining gaps between the PRD ([`ai-specs/02-prd-web-admin-features.md`](ai-specs/02-prd-web-admin-features.md)) and the current implementation.---

## Phase 1: Contracts & Payments Enhancements (Gaps 1-6)

### Gap 1: Contracts List - Overdue Bucket Filters & Sort Options

**File:** [`src/app/(web-admin)/web-admin/contracts/page.tsx`](src/app/\\(web-admin)/web-admin/contracts/page.tsx)Changes:

- Add overdue bucket filter buttons: Current, 1-7d, 8-30d, 31-60d, 60+d
- Add sort dropdown: Date (newest), Amount (high-low), Days Overdue
- Implement sorting logic based on selected option

### Gap 2: Contract Detail - LINE ID & Google Drive Links

**File:** [`src/app/(web-admin)/web-admin/contracts/[id]/page.tsx`](src/app/(web-admin)/web-admin/contracts/[id]/page.tsx)Changes:

- Display `lineUserId` in customer info section
- Add "Documents" button linking to Google Drive folder
- Use contract's `applicationId` to construct the Drive link

### Gap 3: Overdue View - Bulk Reminder Action

**File:** [`src/app/(web-admin)/web-admin/contracts/overdue/page.tsx`](src/app/\\(web-admin)/web-admin/contracts/overdue/page.tsx)Changes:

- Add checkbox for each contract row
- Add "Select All" checkbox in header
- Add "Send Reminder to Selected" button
- Implement bulk API call to send reminders

### Gap 4: Payments List - Customer Name & Date Range Filter

**File:** [`src/app/(web-admin)/web-admin/payments/page.tsx`](src/app/\\(web-admin)/web-admin/payments/page.tsx)Changes:

- Fetch and display customer name (from contract data)
- Add date range picker (Start Date, End Date inputs)
- Filter payments by `paymentDate` within range

### Gap 5: Pending Verification - Slip Thumbnail Preview

**File:** [`src/app/(web-admin)/web-admin/payments/pending/page.tsx`](src/app/\\(web-admin)/web-admin/payments/pending/page.tsx)Changes:

- Display inline thumbnail image (64x64) when `slipImageUrl` exists
- Click thumbnail opens full-size view
- Use Next.js Image component with external domains config

### Gap 6: Payment Verification Detail Page (New Page)

**File:** `src/app/(web-admin)/web-admin/payments/[id]/page.tsx` (NEW)Features:

- Full payment details display
- Large slip image viewer
- OCR data comparison table (expected vs detected)
- Verify/Reject buttons with confirmation
- Link back to contract

---

## Phase 2: Dashboard & Reports Enhancements (Gaps 8-9)

### Gap 8: Dashboard - Rates & Clickable Aging Chart

**File:** [`src/app/(web-admin)/web-admin/dashboard/page.tsx`](src/app/\\(web-admin)/web-admin/dashboard/page.tsx)Changes:

- Add Collection Rate metric (this month)
- Add On-time Payment Rate metric
- Make aging chart bars clickable (navigate to filtered contracts)
- Show overdue count by severity in quick stats

### Gap 9: Reports - Historical List & Date Range

**File:** [`src/app/(web-admin)/web-admin/reports/page.tsx`](src/app/\\(web-admin)/web-admin/reports/page.tsx)Changes:

- Add "Report History" section showing previously generated reports
- Store generated reports in local state or session storage
- Add date range picker for reports (From Date - To Date)
- Support generating reports for a date range

---

## Phase 3: Export Functionality (Gap 10)

### Gap 10: Export Buttons for Contracts & Payments

**Files:**

- [`src/app/(web-admin)/web-admin/contracts/page.tsx`](src/app/\\(web-admin)/web-admin/contracts/page.tsx)
- [`src/app/(web-admin)/web-admin/payments/page.tsx`](src/app/\\(web-admin)/web-admin/payments/page.tsx)

Changes:

- Add "Export CSV" button in header
- Export currently filtered data (respects search/filter state)
- CSV format matching displayed columns

---

## Summary

| Phase | Gaps | Effort Estimate ||-------|------|-----------------|| Phase 1 | Gaps 1-6 | ~6 hours || Phase 2 | Gaps 8-9 | ~3 hours |