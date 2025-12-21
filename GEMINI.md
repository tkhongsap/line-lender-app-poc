# Project: Loan Management System - LINE LIFF + Next.js

## Project Overview

This is a loan management and debt collection system built with Next.js and LINE LIFF. It's designed to be hosted on Vercel and uses Google Sheets as a database and Google Drive for file storage. The application provides a customer-facing LIFF interface for applying for loans and an admin LIFF interface for managing applications and contracts.

### Key Technologies

*   **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
*   **Backend**: Next.js API Routes
*   **Database**: Google Sheets API
*   **File Storage**: Google Drive API
*   **Authentication**: LINE LIFF
*   **Notifications**: LINE Messaging API
*   **Deployment**: Vercel

### Architecture

The project is a monolithic Next.js application with a clear separation of concerns:

*   **`src/app/(customer)`**: Contains the pages for the customer-facing LIFF application.
*   **`src/app/(admin)`**: Contains the pages for the admin LIFF application.
*   **`src/app/api`**: Contains the backend API routes that handle business logic and data access.
*   **`src/lib`**: Contains the core logic for interacting with external services like LINE LIFF, Google Sheets, and Google Drive.
*   **`src/components`**: Contains reusable React components.

## Building and Running

### Prerequisites

*   Node.js and npm
*   A LINE Official Account with Messaging API enabled
*   A LINE Login channel with two LIFF apps (one for customers, one for admins)
*   A Google Cloud project with the Sheets and Drive APIs enabled
*   A Vercel account for deployment

### Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

The project requires several environment variables to be set. These include credentials for LINE, Google Cloud, and other services. A `.env.example` file should be present in the root of the project to guide you.

### Development

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the development server on `http://localhost:5000`.

### Building

To build the application for production, use the following command:

```bash
npm run build
```

### Starting the Server

To start the production server, use the following command:

```bash
npm run start
```

### Linting

To check the code for linting errors, use the following command:

```bash
npm run lint
```

## Development Conventions

*   **Language**: TypeScript is used throughout the project.
*   **Styling**: TailwindCSS with shadcn/ui components is the primary styling solution.
*   **Code Style**: The project uses ESLint to enforce a consistent code style.
*   **Database**: Google Sheets is used as a database. The schema for each "table" (sheet) is defined by the types in `src/types/index.ts` and the access logic is in `src/lib/google-sheets.ts`.
*   **File Storage**: Google Drive is used for file storage. The logic for file uploads and management is in `src/lib/google-drive.ts`.
*   **Authentication**: Authentication is handled via LINE LIFF. The core LIFF logic is in `src/lib/liff.ts` and the `LiffProvider` component in `src/components/liff/LiffProvider.tsx`.
