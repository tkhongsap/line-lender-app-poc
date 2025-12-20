---
name: LINE Lender Test Setup
overview: Set up Google Cloud services, configure LINE OA with LIFF apps, and deploy to Replit for testing the LINE Lender application with your LINE Official Account.
todos:
  - id: google-cloud
    content: Create Google Cloud project and enable Sheets + Drive APIs
    status: pending
  - id: google-service-account
    content: Create service account and download JSON key
    status: pending
  - id: google-spreadsheet
    content: Create spreadsheet with 7 sheets and share with service account
    status: pending
  - id: google-drive
    content: Create Drive folder and share with service account
    status: pending
  - id: line-oa
    content: Set up LINE OA and enable Messaging API
    status: pending
  - id: line-credentials
    content: Get Channel ID, Secret, and Access Token
    status: pending
  - id: line-liff-customer
    content: Create Customer LIFF app
    status: pending
  - id: line-liff-admin
    content: Create Admin LIFF app
    status: pending
  - id: replit-import
    content: Import GitHub repo to Replit
    status: pending
  - id: replit-secrets
    content: Configure all environment variables in Replit Secrets
    status: pending
  - id: replit-run
    content: Build and run the application on Replit
    status: pending
  - id: line-update-liff
    content: Update LIFF endpoints with Replit URL
    status: pending
  - id: line-webhook
    content: Configure and verify webhook URL
    status: pending
  - id: test-customer
    content: Test customer loan application flow
    status: pending
  - id: test-admin
    content: Test admin dashboard and approval flow
    status: pending
---

# LINE Lender Test Setup Plan

## Phase 1: Google Cloud Setup

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., `line-lender-poc`)
3. Enable APIs:

- Search for **Google Sheets API** → Enable
- Search for **Google Drive API** → Enable

### Step 1.2: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**

- Name: `loan-system-service`
- Role: **Editor**

3. Click on the created account → **Keys** tab
4. **Add Key** → **Create new key** → **JSON**
5. Download and save the JSON file securely

### Step 1.3: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create new spreadsheet: `Loan Management System`
3. Create 7 sheet tabs with headers (see [docs/setup-google.md](docs/setup-google.md)):

- `Applications` (21 columns)
- `Contracts` (21 columns)
- `Payment_Schedule` (10 columns)
- `Payments` (17 columns)
- `Users` (10 columns)
- `Notification_Log` (9 columns)
- `Settings` (2 columns with default values)

4. Copy **Spreadsheet ID** from URL

### Step 1.4: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create folder: `Loan_System`
3. Copy **Folder ID** from URL

### Step 1.5: Share with Service Account

1. Open the spreadsheet → **Share** → Add service account email → **Editor**
2. Open the Drive folder → **Share** → Add service account email → **Editor**

---

## Phase 2: LINE Platform Setup

### Step 2.1: LINE Official Account

1. Go to [LINE Official Account Manager](https://manager.line.biz/)
2. Create or select your LINE OA
3. Go to **Settings** → **Messaging API** → **Enable**

### Step 2.2: Get Channel Credentials

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your provider → Select Messaging API channel
3. Note down:

- **Channel ID**
- **Channel Secret**

4. Go to **Messaging API** tab → Issue **Channel Access Token** (long-lived)

### Step 2.3: Create Customer LIFF App

1. In LINE Developers Console → Your channel → **LIFF** tab
2. Click **Add**
3. Configure:

- Name: `Customer App`
- Size: `Full`
- Endpoint URL: `https://YOUR-REPLIT-URL/apply` (update after Replit deploy)
- Scopes: `openid`, `profile`
- Bot link: `Aggressive`

4. Copy **LIFF ID**

### Step 2.4: Create Admin LIFF App

1. Click **Add** again
2. Configure:

- Name: `Admin App`
- Size: `Full`
- Endpoint URL: `https://YOUR-REPLIT-URL/dashboard` (update after Replit deploy)
- Scopes: `openid`, `profile`, `email`
- Bot link: `Aggressive`

3. Copy **LIFF ID**

---

## Phase 3: Deploy to Replit

### Step 3.1: Import GitHub Repository

1. Go to [Replit](https://replit.com/)
2. Click **Create Repl** → **Import from GitHub**
3. Paste: `https://github.com/YOUR-USERNAME/line-lender-app-poc`
4. Select **Node.js** as language

### Step 3.2: Configure Environment Variables

1. In Replit, go to **Secrets** tab (lock icon)
2. Add all secrets:

| Key | Value ||-----|-------|| `LINE_CHANNEL_ID` | Your channel ID || `LINE_CHANNEL_SECRET` | Your channel secret || `LINE_CHANNEL_ACCESS_TOKEN` | Your access token || `LIFF_ID_CUSTOMER` | Customer LIFF ID || `LIFF_ID_ADMIN` | Admin LIFF ID || `NEXT_PUBLIC_LIFF_ID_CUSTOMER` | Customer LIFF ID || `NEXT_PUBLIC_LIFF_ID_ADMIN` | Admin LIFF ID || `NEXT_PUBLIC_BASE_URL` | Your Replit URL || `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From JSON key file || `GOOGLE_PRIVATE_KEY` | From JSON key file (with \n) || `GOOGLE_SPREADSHEET_ID` | Your spreadsheet ID || `GOOGLE_DRIVE_FOLDER_ID` | Your folder ID || `CRON_SECRET` | Generate random string |

### Step 3.3: Run the Application

1. In Replit Shell, run:
   ```javascript
                           npm install
                           npm run build
                           npm start
   ```




2. Copy your Replit public URL

### Step 3.4: Update LIFF Endpoints

1. Go back to LINE Developers Console
2. Update Customer LIFF endpoint: `https://YOUR-REPLIT-URL/apply`
3. Update Admin LIFF endpoint: `https://YOUR-REPLIT-URL/dashboard`

### Step 3.5: Configure Webhook

1. In LINE Developers Console → **Messaging API** tab
2. Set Webhook URL: `https://YOUR-REPLIT-URL/api/line/webhook`
3. Click **Verify**
4. Enable **Use webhook**

---

## Phase 4: Test the Application

### Step 4.1: Add Yourself as Admin

1. Open your Google Spreadsheet
2. Go to **Users** sheet
3. Add a row:

- `ID`: `USR-001`
- `LINE_User_ID`: (get from webhook when you add the OA as friend)
- `Name`: Your name
- `Role`: `SUPER_ADMIN`
- `Active`: `TRUE`

### Step 4.2: Test Customer Flow

1. Add your LINE OA as friend
2. Open: `https://liff.line.me/YOUR-CUSTOMER-LIFF-ID`
3. Submit a loan application
4. Check if data appears in Google Sheets

### Step 4.3: Test Admin Flow

1. Open: `https://liff.line.me/YOUR-ADMIN-LIFF-ID`
2. View dashboard and pending applications
3. Approve/reject an application

---

## Credentials Checklist

Before starting, you'll collect these values:

```javascript
[ ] LINE_CHANNEL_ID
[ ] LINE_CHANNEL_SECRET
[ ] LINE_CHANNEL_ACCESS_TOKEN
[ ] LIFF_ID_CUSTOMER
[ ] LIFF_ID_ADMIN
[ ] GOOGLE_SERVICE_ACCOUNT_EMAIL
[ ] GOOGLE_PRIVATE_KEY
[ ] GOOGLE_SPREADSHEET_ID
[ ] GOOGLE_DRIVE_FOLDER_ID








```