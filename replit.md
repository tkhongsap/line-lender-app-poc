# LINE Lender App - Loan Management System

## Overview

A loan management system built with LINE LIFF + Next.js. It provides customer-facing loan applications and admin dashboards for managing loans through LINE's messaging platform.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Google Sheets API
- **Storage**: Google Drive API
- **Auth**: LINE LIFF
- **Notifications**: LINE Messaging API
- **OCR**: Slip2Go API for payment slip verification

## Project Structure

```
src/
├── app/
│   ├── (customer)/     # Customer LIFF pages (apply, contracts, payment, slip, status)
│   ├── (admin)/        # Admin LIFF pages (dashboard, applications)
│   └── api/            # API Routes (applications, auth, contracts, cron, line, payments, slip)
├── components/
│   ├── ui/             # shadcn/ui components
│   └── liff/           # LINE LIFF provider
├── lib/                # Utility libraries (auth, calculations, google-drive, google-sheets, liff, line, slip2go, utils)
├── types/              # TypeScript types
└── hooks/              # Custom React hooks (useLiff)
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

- 2025-12-20: Initial Replit setup, configured Next.js for Replit environment with allowedDevOrigins

## User Preferences

(None recorded yet)
