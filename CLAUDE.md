# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LINE Lender App POC - A loan management and automated debt collection system built with LINE LIFF and Next.js. The app enables:
- Customer loan applications via LINE LIFF
- Admin approval workflows via separate Admin LIFF
- Automated interest calculations and payment tracking
- LINE Messaging API notifications
- Google Sheets as database, Google Drive for document storage

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, shadcn/ui (New York style), Tailwind CSS 4, Lucide icons
- **Forms:** react-hook-form with zod validation
- **LINE Integration:** @line/liff, @line/bot-sdk
- **Backend Services:** Google Sheets API (database), Google Drive API (files), Slip2Go API (OCR)
- **Deployment:** Vercel with Cron Jobs

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Dual LIFF App Structure
The app serves two distinct user interfaces within LINE:
1. **Customer LIFF** (`/customer/*`) - Loan application, status check, payment slip upload
2. **Admin LIFF** (`/admin/*`) - Dashboard, application approval, contract management

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (customer)/         # Customer-facing LIFF pages
│   ├── (admin)/            # Admin-facing LIFF pages
│   └── api/                # API routes
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility libraries (Google APIs, LINE, calculations)
├── types/                  # TypeScript type definitions
└── hooks/                  # Custom React hooks
```

### Data Flow
- LINE LIFF captures user identity (LINE User ID) automatically
- Applications and contracts stored in Google Sheets
- Documents uploaded to Google Drive (organized by Application ID)
- LINE Messaging API for push notifications to customers and admins
- Vercel Cron Jobs for daily interest calculations and payment reminders

### Key Types (src/types/index.ts)
- `UserRole`: SUPER_ADMIN, APPROVER, COLLECTOR, VIEWER, CUSTOMER
- `ApplicationStatus`: SUBMITTED → PENDING → APPROVED/REJECTED/PENDING_DOCS → DISBURSED
- `ContractStatus`: ACTIVE, COMPLETED, DEFAULT
- Core entities: Application, Contract, PaymentSchedule, Payment

## Path Aliases

Uses `@/*` to reference `./src/*` (configured in tsconfig.json).

## UI Components

Uses shadcn/ui with the "new-york" style variant. Add new components via:
```bash
npx shadcn@latest add <component-name>
```

## Language

All user-facing text (labels, notifications, messages) should be in Thai.
