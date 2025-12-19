# Google Sheets Setup Files

This folder contains CSV files to set up the Loan Management System database in Google Sheets.

## Files

| File | Sheet Name | Columns | Description |
|------|------------|---------|-------------|
| `1_Applications.csv` | Applications | 21 | Loan application records |
| `2_Contracts.csv` | Contracts | 21 | Approved loan contracts |
| `3_Payment_Schedule.csv` | Payment_Schedule | 10 | Monthly payment schedules |
| `4_Payments.csv` | Payments | 17 | Payment transaction records |
| `5_Users.csv` | Users | 10 | Admin and customer users |
| `6_Notification_Log.csv` | Notification_Log | 9 | LINE message delivery log |
| `7_Settings.csv` | Settings | 2 | System configuration (with defaults) |

## How to Import into Google Sheets

### Option 1: Import Each CSV (Recommended)

1. Create a new Google Spreadsheet at [sheets.new](https://sheets.new)
2. Rename "Sheet1" to "Applications"
3. Go to **File** → **Import**
4. Select **Upload** tab and upload `1_Applications.csv`
5. Choose **Replace current sheet**
6. Click **Import data**
7. Create a new sheet (+ button at bottom) for each remaining file
8. Repeat import process for all 7 files

### Option 2: Quick Import All

1. Create new spreadsheet
2. For each CSV file:
   - Create new sheet tab with the correct name (without number prefix)
   - Copy CSV content and paste into cell A1
   - Google Sheets will auto-parse the CSV

## After Import

1. **Copy Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

2. **Share with Service Account**:
   - Click **Share** button
   - Add your service account email
   - Grant **Editor** access

## Sheet Order

Ensure sheets are in this order (left to right):
1. Applications
2. Contracts
3. Payment_Schedule
4. Payments
5. Users
6. Notification_Log
7. Settings
