---
name: Complete Staff Portal Features
overview: "Add missing operational features to the web-admin portal so staff can fully manage loans: contracts management, payments management, staff management UI, and enhanced dashboard with aging reports."
todos:
  - id: contracts-list
    content: Create contracts list page with status filters (all, active, overdue)
    status: completed
  - id: contracts-detail
    content: Create contract detail page with payment schedule and history
    status: completed
    dependencies:
      - contracts-list
  - id: payments-list
    content: Create payments list page with pending verification filter
    status: completed
  - id: payments-record
    content: Create payment recording form with OCR slip option
    status: completed
    dependencies:
      - payments-list
  - id: payments-verify
    content: Add verify/reject buttons to pending payments
    status: completed
    dependencies:
      - payments-list
  - id: staff-management
    content: Create staff management UI for Super Admin
    status: completed
  - id: settings-page
    content: Create settings page for system configuration
    status: completed
  - id: dashboard-aging
    content: Add aging report chart to dashboard
    status: completed
  - id: dashboard-overdue
    content: Add overdue quick list to dashboard
    status: completed
  - id: update-navigation
    content: Update navigation with all new menu items
    status: completed
    dependencies:
      - contracts-list
      - payments-list
      - staff-management
---

# Complete Staff Portal Features

## Priority 1: Collector Daily Operations (Critical)

These are blocking day-to-day debt collection work:

### Contracts Management

- `/web-admin/contracts` - List all contracts with status filters
- `/web-admin/contracts/overdue` - Quick view of overdue customers
- `/web-admin/contracts/[id]` - Contract detail with payment schedule and history

Backend API already exists at [`src/app/api/contracts/`](src/app/api/contracts/) - just need UI pages.

### Payments Management

- `/web-admin/payments` - List all payments
- `/web-admin/payments/pending` - Payments waiting for verification
- `/web-admin/payments/record` - Form to manually record payment
- Verify payment button with OCR integration

Backend APIs exist at [`src/app/api/payments/`](src/app/api/payments/) and [`src/app/api/slip/verify/`](src/app/api/slip/verify/) - just need UI.

## Priority 2: Super Admin Tools

### Staff Management UI

- `/web-admin/staff` - List staff members
- Add new staff (email + role)
- Activate/deactivate staff
- Change staff roles

Backend API exists at [`src/app/api/web-admin/staff/route.ts`](src/app/api/web-admin/staff/route.ts).

### Settings Page

- `/web-admin/settings` - System configuration
- Default interest rate
- Default installment count
- Company info (name, contact)
- Notification timing settings

## Priority 3: Enhanced Dashboard & Reports

### Dashboard Improvements

- Aging report chart (Current, 1-7d, 8-30d, 31-60d, 60+d overdue)
- Overdue quick list with action buttons
- Better metrics calculation

### Reports Page

- `/web-admin/reports` - View generated reports
- Filter by date range
- Export options

## Navigation Update