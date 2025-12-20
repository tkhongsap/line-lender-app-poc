/**
 * Google Apps Script to set up Loan Management System spreadsheet
 *
 * HOW TO USE:
 * 1. Create a new Google Spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Run" button (or Run > Run function > setupLoanManagementSystem)
 * 5. Grant permissions when prompted
 * 6. All 7 sheets will be created with headers and default settings
 */

function setupLoanManagementSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Define all sheets and their headers
  const sheets = {
    'Applications': [
      'ID', 'LINE_User_ID', 'Full_Name', 'National_ID', 'Phone', 'Email',
      'Requested_Amount', 'Purpose', 'Purpose_Detail', 'Collateral_Type',
      'Collateral_Value', 'Collateral_Address', 'Collateral_Description',
      'Document_Folder_ID', 'Status', 'Reviewed_By', 'Reviewed_At',
      'Approval_Note', 'Rejection_Reason', 'Created_At', 'Updated_At'
    ],
    'Contracts': [
      'ID', 'Application_ID', 'LINE_User_ID', 'Customer_Name', 'Customer_Phone',
      'Approved_Amount', 'Interest_Rate', 'Term_Months', 'Monthly_Payment',
      'Payment_Day', 'Start_Date', 'End_Date', 'Total_Due', 'Total_Paid',
      'Outstanding_Balance', 'Days_Overdue', 'Status', 'Disbursed_At',
      'Completed_At', 'Created_At', 'Updated_At'
    ],
    'Payment_Schedule': [
      'ID', 'Contract_ID', 'Installment_Number', 'Due_Date', 'Principal_Amount',
      'Interest_Amount', 'Total_Amount', 'Paid_Amount', 'Paid_At', 'Status'
    ],
    'Payments': [
      'ID', 'Contract_ID', 'Schedule_ID', 'Amount', 'Payment_Date',
      'Payment_Method', 'Slip_Image_URL', 'Slip_Amount', 'Slip_Date',
      'Slip_Ref', 'Slip_Bank', 'Verification_Status', 'Verified_By',
      'Verified_At', 'Verification_Note', 'Created_At', 'Updated_At'
    ],
    'Users': [
      'ID', 'LINE_User_ID', 'Name', 'Email', 'Phone',
      'National_ID', 'Role', 'Active', 'Created_At', 'Updated_At'
    ],
    'Notification_Log': [
      'ID', 'Contract_ID', 'LINE_User_ID', 'Channel', 'Type',
      'Message', 'Status', 'Error', 'Created_At'
    ],
    'Settings': [
      'Key', 'Value'
    ]
  };

  // Default settings data
  const defaultSettings = [
    ['DEFAULT_INTEREST_RATE', '1.5'],
    ['DEFAULT_TERM_MONTHS', '12'],
    ['REMINDER_DAYS_BEFORE', '7'],
    ['OVERDUE_DAYS', '1,7,14,30'],
    ['ESCALATION_DAYS', '30'],
    ['COMPANY_NAME', 'บริษัท สินเชื่อดี จำกัด'],
    ['CONTACT_PHONE', '02-xxx-xxxx'],
    ['CONTACT_EMAIL', 'contact@example.com']
  ];

  // Delete default Sheet1 if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  // Create each sheet
  for (const [sheetName, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(sheetName);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      // Clear existing content
      sheet.clear();
    }

    // Set headers in row 1
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);

    // Format headers
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    // Add default settings data to Settings sheet
    if (sheetName === 'Settings') {
      const dataRange = sheet.getRange(2, 1, defaultSettings.length, 2);
      dataRange.setValues(defaultSettings);

      // Auto-resize after adding data
      sheet.autoResizeColumn(1);
      sheet.autoResizeColumn(2);
    }
  }

  // Reorder sheets
  const sheetOrder = [
    'Applications', 'Contracts', 'Payment_Schedule',
    'Payments', 'Users', 'Notification_Log', 'Settings'
  ];

  for (let i = 0; i < sheetOrder.length; i++) {
    const sheet = ss.getSheetByName(sheetOrder[i]);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(i + 1);
    }
  }

  // Set Applications as active sheet
  ss.setActiveSheet(ss.getSheetByName('Applications'));

  // Show completion message
  SpreadsheetApp.getUi().alert(
    'Setup Complete! ✅',
    'Created 7 sheets:\n' +
    '• Applications (21 columns)\n' +
    '• Contracts (21 columns)\n' +
    '• Payment_Schedule (10 columns)\n' +
    '• Payments (17 columns)\n' +
    '• Users (10 columns)\n' +
    '• Notification_Log (9 columns)\n' +
    '• Settings (8 default values)\n\n' +
    'Next steps:\n' +
    '1. Copy Spreadsheet ID from URL\n' +
    '2. Share with service account email (Editor access)',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// Add menu item when spreadsheet opens
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏦 Loan System')
    .addItem('Setup All Sheets', 'setupLoanManagementSystem')
    .addToUi();
}
