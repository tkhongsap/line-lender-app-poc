# PRD: Web-Admin Missing Features (Gap Closure)

## Overview
This PRD defines the remaining Web-Admin portal features required to fully satisfy `ai-specs/02-prd-web-admin-features.md` gaps. The scope focuses on UI/UX completion, filtering/sorting, verification flows, and export/report enhancements.

## Goals
- Complete contracts and payments workflows for collectors.
- Provide missing visibility and action tools in dashboard and reports.
- Add export capabilities for operational data.

## Non-Goals
- Backend API creation beyond what is strictly required for UI support.
- Reworking authentication or role model.
- Staff “Last Login” display (tracked separately).

## Target Users
- Collectors (daily ops)
- Super Admins (configuration oversight)
- All staff (dashboards and reports)

## Functional Requirements

### FR-1 Contracts List Enhancements
- Add overdue bucket filters: Current, 1-7, 8-30, 31-60, 60+.
- Add sort options: Date (newest), Amount (high-low), Days Overdue.
- Ensure filters + search + sort can be combined.

### FR-2 Contract Detail Additions
- Display customer LINE ID.
- Provide a “Documents” link to the customer’s Google Drive folder (using application/contract reference).

### FR-3 Overdue Bulk Reminders
- Allow selecting multiple overdue contracts.
- Provide bulk reminder action with confirmation and success/error feedback.

### FR-4 Payments List Enhancements
- Show customer name alongside payment entries.
- Add date range filter (paymentDate start/end).

### FR-5 Pending Verification Thumbnails
- Show slip image thumbnail when available.
- Clicking opens full-size slip view.

### FR-6 Payment Verification Detail Page
- Provide a dedicated payment detail page.
- Show slip image, OCR data, and expected vs actual comparison.
- Actions: Verify and Reject (with reason).

### FR-7 Dashboard Metrics + Interactivity
- Add collection rate (this month) and on-time payment rate.
- Show overdue counts by severity buckets.
- Make aging segments clickable to filtered contracts view.

### FR-8 Reports History + Date Range
- Display historical reports list (daily/monthly).
- Support date range selection for generating reports.

### FR-9 CSV Export
- Add CSV export in contracts and payments lists.
- Exports respect active filters/search/sort.

## User Stories
- As a collector, I can filter overdue contracts by severity to prioritize outreach.
- As a collector, I can view payment details and verify with OCR evidence.
- As staff, I can see rate-based KPIs on the dashboard.
- As staff, I can export filtered datasets for offline analysis.

## Success Criteria
- All FR-1 through FR-9 are implemented and accessible from navigation.
- Core pages load without errors and reflect active filters.
- Exports match visible columns and current filters.

## Dependencies and Assumptions
- Existing APIs for contracts, payments, reports, and settings remain available.
- Contract or application data provides a stable identifier for Drive links.
- Payment OCR fields are persisted and accessible in API responses.

## Open Questions
- Which date field should be used for contract sorting (startDate vs createdAt)?
- Source of truth for Drive folder URL: compute pattern or store in data?
- Should report history persist across sessions (server-backed) or client-only?
