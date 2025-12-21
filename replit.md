# LINE Lender App - Loan Management System

## Overview

A loan management system built with LINE LIFF + Next.js. It provides customer-facing loan applications and admin dashboards for managing loans through LINE's messaging platform. Staff can access the system via both LINE LIFF and a standalone web app.

## User Access

- **Customers**: Access via LINE Official Account (LIFF only) at `/customer/*`
- **Staff**: Two access options:
  - **Option 1**: LINE LIFF app at `/admin/*` (via LINE OA for mobile convenience)
  - **Option 2**: Standalone web app at `/web-admin/*` (via browser with Google login)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: PostgreSQL (sessions, web-admin users) + Google Sheets API (applications, contracts)
- **Storage**: Google Drive API
- **Auth**: LINE LIFF (customer & admin LIFF) + Replit Auth/OIDC (web-admin)
- **Notifications**: LINE Messaging API
- **OCR**: Slip2Go API for payment slip verification

## Project Structure

```
src/
├── app/
│   ├── (customer)/     # Customer LIFF pages (apply, contracts, payment, slip, status)
│   ├── (admin)/        # Admin LIFF pages (dashboard, applications)
│   ├── (web-admin)/    # Standalone web admin pages (login, dashboard, applications)
│   └── api/            # API Routes (applications, auth, contracts, cron, line, payments, slip, web-admin)
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── liff/           # LINE LIFF provider
│   └── web-admin/      # Web admin components (guard, navigation)
├── lib/                # Utility libraries (auth, calculations, db, google-drive, google-sheets, liff, line, slip2go, utils, web-auth)
├── types/              # TypeScript types
└── hooks/              # Custom React hooks (useLiff, useWebAuth)
```

## Development

### Running the App

The app runs on port 5000 with the following workflow:
- `npm run dev -- -p 5000 -H 0.0.0.0`

### Required Environment Variables

The app requires several environment variables for LINE, Google, and Slip2Go integrations:
- LINE LIFF credentials
- Google Sheets/Drive API credentials
- Slip2Go API key

### Deployment

Configured for autoscale deployment:
- Build: `npm run build`
- Start: `npm run start -- -p 5000 -H 0.0.0.0`

## Recent Changes

- 2025-12-21: Added standalone web-admin portal with Replit Auth (Google login) for staff access via browser
  - New routes: `/web-admin/login`, `/web-admin/dashboard`, `/web-admin/applications`, `/web-admin/applications/[id]`
  - Added PostgreSQL database for session storage and web-admin user management
  - Staff can now login via Google and manage applications from any browser
- 2025-12-20: Initial Replit setup, configured Next.js for Replit environment with allowedDevOrigins

## User Preferences

(None recorded yet)
