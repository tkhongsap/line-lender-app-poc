# Google Services Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API

## 2. Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `loan-system-service`
4. Grant role: **Editor**
5. Click **Done**

## 3. Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Download the JSON file

## 4. Extract Credentials

From the downloaded JSON file, copy:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

## 5. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet named: `Loan Management System`
3. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
4. Set `GOOGLE_SPREADSHEET_ID` in your `.env.local`

## 6. Share Spreadsheet with Service Account

1. Open the spreadsheet
2. Click **Share**
3. Add the service account email (from step 4)
4. Grant **Editor** access

## 7. Create Required Sheets

Create the following sheets (tabs) in the spreadsheet:

### Applications
| Column | Header |
|--------|--------|
| A | ID |
| B | LINE_User_ID |
| C | Full_Name |
| D | National_ID |
| E | Phone |
| F | Email |
| G | Requested_Amount |
| H | Purpose |
| I | Purpose_Detail |
| J | Collateral_Type |
| K | Collateral_Value |
| L | Collateral_Address |
| M | Collateral_Description |
| N | Document_Folder_ID |
| O | Status |
| P | Reviewed_By |
| Q | Reviewed_At |
| R | Approval_Note |
| S | Rejection_Reason |
| T | Created_At |
| U | Updated_At |

### Contracts
| Column | Header |
|--------|--------|
| A | ID |
| B | Application_ID |
| C | LINE_User_ID |
| D | Customer_Name |
| E | Customer_Phone |
| F | Approved_Amount |
| G | Interest_Rate |
| H | Term_Months |
| I | Monthly_Payment |
| J | Payment_Day |
| K | Start_Date |
| L | End_Date |
| M | Total_Due |
| N | Total_Paid |
| O | Outstanding_Balance |
| P | Days_Overdue |
| Q | Status |
| R | Disbursed_At |
| S | Completed_At |
| T | Created_At |
| U | Updated_At |

### Payment_Schedule
| Column | Header |
|--------|--------|
| A | ID |
| B | Contract_ID |
| C | Installment_Number |
| D | Due_Date |
| E | Principal_Amount |
| F | Interest_Amount |
| G | Total_Amount |
| H | Paid_Amount |
| I | Paid_At |
| J | Status |

### Payments
| Column | Header |
|--------|--------|
| A | ID |
| B | Contract_ID |
| C | Schedule_ID |
| D | Amount |
| E | Payment_Date |
| F | Payment_Method |
| G | Slip_Image_URL |
| H | Slip_Amount |
| I | Slip_Date |
| J | Slip_Ref |
| K | Slip_Bank |
| L | Verification_Status |
| M | Verified_By |
| N | Verified_At |
| O | Verification_Note |
| P | Created_At |
| Q | Updated_At |

### Users
| Column | Header |
|--------|--------|
| A | ID |
| B | LINE_User_ID |
| C | Name |
| D | Email |
| E | Phone |
| F | National_ID |
| G | Role |
| H | Active |
| I | Created_At |
| J | Updated_At |

### Notification_Log
| Column | Header |
|--------|--------|
| A | ID |
| B | Contract_ID |
| C | LINE_User_ID |
| D | Channel |
| E | Type |
| F | Message |
| G | Status |
| H | Error |
| I | Created_At |

### Settings
| Column | Header |
|--------|--------|
| A | Key |
| B | Value |

Default Settings:
| Key | Value |
|-----|-------|
| DEFAULT_INTEREST_RATE | 1.5 |
| DEFAULT_TERM_MONTHS | 12 |
| REMINDER_DAYS_BEFORE | 7 |
| OVERDUE_DAYS | 1,7,14,30 |
| ESCALATION_DAYS | 30 |
| COMPANY_NAME | บริษัท สินเชื่อดี จำกัด |
| CONTACT_PHONE | 02-xxx-xxxx |
| CONTACT_EMAIL | contact@example.com |

## 8. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create folder: `Loan_System`
3. Copy the folder ID from the URL:
   `https://drive.google.com/drive/folders/[FOLDER_ID]`
4. Set `GOOGLE_DRIVE_FOLDER_ID` in your `.env.local`

## 9. Share Drive Folder with Service Account

1. Right-click the folder
2. Click **Share**
3. Add the service account email
4. Grant **Editor** access

## 10. Environment Variables

Add these to your `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

**Note**: The private key should include the newline characters (`\n`).

