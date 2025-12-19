# Loan Management System - LINE LIFF + Next.js

ระบบจัดการสินเชื่อและติดตามหนี้อัตโนมัติ | Automated Loan Management & Debt Collection System

## Overview

This system is built on **LINE LIFF + Next.js**, hosted on **Vercel**, using:
- **Google Sheets** as database
- **Google Drive** for file storage
- **LINE Messaging API** for notifications
- **Slip2Go** for payment slip OCR

## Features

- 📝 **Customer LIFF**: Apply for loans, check status, upload payment slips
- 👔 **Admin LIFF**: Dashboard, approve/reject applications, manage contracts
- 💰 **Debt Tracking**: Auto-calculate interest, payment schedules
- 🔔 **Notifications**: Automated reminders via LINE
- 📊 **Reports**: Daily & monthly automated reports

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) + TailwindCSS + shadcn/ui |
| Backend | Next.js API Routes |
| Database | Google Sheets API |
| Storage | Google Drive API |
| Auth | LINE LIFF |
| Notifications | LINE Messaging API |
| Hosting | Vercel |
| OCR | Slip2Go API |

## Getting Started

### Prerequisites

1. LINE Official Account with Messaging API enabled
2. LINE Login channel with 2 LIFF apps (Customer + Admin)
3. Google Cloud project with Sheets & Drive API enabled
4. Vercel account

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deployment

```bash
vercel deploy
```

## Project Structure

```
src/
├── app/
│   ├── (customer)/     # Customer LIFF pages
│   ├── (admin)/        # Admin LIFF pages
│   └── api/            # API Routes
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── forms/          # Form components
│   └── dashboard/      # Dashboard components
├── lib/                # Utility libraries
├── types/              # TypeScript types
└── hooks/              # Custom React hooks
```

## License

Private - All rights reserved
