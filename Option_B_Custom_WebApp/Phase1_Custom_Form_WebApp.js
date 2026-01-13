/**
 * Dent Experts - Custom Web Form with Google Sheets Backend
 * 
 * This script creates a custom web form that stores data directly to Google Sheets.
 * It bypasses Google Forms entirely, giving you full control over the UI/UX.
 * 
 * FEATURES:
 * - Custom iPad-optimized dark theme UI
 * - Photo uploads to Google Drive
 * - DCS Dent Count & OC Rating scales
 * - RNIN / R&R toggle switches
 * - Email notifications on submission
 * 
 * SOURCE OF TRUTH: Field definitions based on Phase1_Google_Form_Structure.md
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet named "Dent Experts - Scope Data"
 * 2. Create a Google Drive folder for photos and get the folder ID
 * 3. Click Extensions → Apps Script
 * 4. Delete any existing code and paste this entire file
 * 5. Add ScopeForm.html (from Phase1_Custom_Form_HTML.html)
 * 6. Update CONFIG below with your settings
 * 7. Click Deploy → New deployment → Web app
 * 8. Set "Execute as" to "Me" and "Who has access" to "Anyone"
 * 9. Deploy and copy the Web App URL
 */

// -----------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------
const SCRIPT_PROP = PropertiesService.getScriptProperties();

// CHANGE THIS to your actual Sheet ID (open sheet, copy ID from URL)
// Or use 'active' if script is bound to sheet.
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Sheet1';

// -----------------------------------------------------------------------
// WEB APP SERVING
// -----------------------------------------------------------------------
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form')
    .setTitle('Dent Experts - Vehicle Scope')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

// -----------------------------------------------------------------------
// DATA HANDLING
// -----------------------------------------------------------------------

/**
 * Saves form data to Google Sheet.
 * Dynamically updates headers if new fields are found.
 */
function saveToSheet(data) {
  const doc = SpreadsheetApp.openById(SHEET_ID); // Or SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(SHEET_NAME) || doc.insertSheet(SHEET_NAME);

  const headersRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  let headers = headersRange.getValues()[0];

  // Clean headers (remove empty)
  headers = headers.filter(h => h !== "");

  // Detect New Keys in Data
  const dataKeys = Object.keys(data);
  let newHeaders = [];

  dataKeys.forEach(key => {
    if (!headers.includes(key)) {
      newHeaders.push(key);
      headers.push(key);
    }
  });

  // If new headers found, append them
  if (newHeaders.length > 0) {
    const startCol = headers.length - newHeaders.length + 1;
    sheet.getRange(1, startCol, 1, newHeaders.length).setValues([newHeaders]);
  }

  // Construct Row
  const row = headers.map(header => {
    return data[header] || "";
  });

  // Add Timestamp
  if (!headers.includes('Timestamp')) {
    sheet.getRange(1, headers.length + 1).setValue('Timestamp');
    row.push(new Date());
  } else {
    // Find index of Timestamp
    const tsIndex = headers.indexOf('Timestamp');
    row[tsIndex] = new Date();
  }

  sheet.appendRow(row);
  return { status: 'success' };
}

/**
 * Uploads multiple photos to Drive.
 * Returns Array of File URLs.
 */
function uploadMultiplePhotos(files, roNumber) {
  const folderId = 'YOUR_DRIVE_FOLDER_ID_HERE'; // Ideally passed from config or hardcoded
  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    // Fallback if folder invalid, use Root
    folder = DriveApp.getRootFolder();
  }

  // Create Subfolder for RO? Optional.
  // const subFolder = folder.createFolder(roNumber + "_" + new Date().getTime());

  const urls = [];
  files.forEach(f => {
    const decoded = Utilities.base64Decode(f.base64Data);
    const blob = Utilities.newBlob(decoded, f.mimeType, f.name || 'photo.jpg');
    const file = folder.createFile(blob);
    file.setDescription("Uploaded for RO: " + roNumber);
    urls.push(file.getUrl());
  });

  return urls;
}
