/**
 * Dent Experts - Custom Web Form with Google Sheets Backend
 * 
 * This script creates a custom web form that stores data directly to Google Sheets.
 * It bypasses Google Forms entirely, giving you full control over the UI/UX.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet named "Dent Experts - Scope Data"
 * 2. Create these column headers in Row 1:
 *    Timestamp | RO Number | VIN | Year | Make | Model | Color | Insurance | Claim Number |
 *    Location | Scoper | Estimator | Damage Areas | Severity | Panel Count | 
 *    DCS Dent Count | OC Rating | RNIN | R&R | PDR Candidate | Notes | Status | Photo URLs
 * 3. Click Extensions → Apps Script
 * 4. Delete any existing code and paste this entire file
 * 5. Click Deploy → New deployment
 * 6. Select "Web app" as the type
 * 7. Set "Execute as" to "Me" and "Who has access" to "Anyone"
 * 8. Click Deploy and copy the Web App URL
 * 9. Share this URL with scopers - they can bookmark it on their iPads
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Sheet name for storing submissions
    dataSheetName: 'Scope Data',

    // Email notifications
    notifyEmails: [
        'estimator@dentexperts.com',
        'admin@dentexperts.com'
    ],

    companyName: 'Dent Experts',

    // Customizable dropdown options
    locations: ['Main Shop', 'North Location', 'South Location', 'Mobile Unit'],
    scopers: ['John Smith', 'Jane Doe', 'Mike Johnson'],
    estimators: ['Sarah Williams', 'Tom Brown', 'Chris Davis']
};

// ============================================
// WEB APP HANDLERS
// ============================================

/**
 * Serves the custom HTML form when accessing the web app
 */
function doGet() {
    return HtmlService.createHtmlOutputFromFile('ScopeForm')
        .setTitle('Dent Experts - Vehicle Scope')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Handles form submission via POST request
 */
function doPost(e) {
    try {
        const formData = JSON.parse(e.postData.contents);
        const result = saveToSheet(formData);

        if (result.success) {
            sendNotificationEmail(formData);
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// DATA STORAGE
// ============================================

/**
 * Saves form data to Google Sheet
 */
function saveToSheet(data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.dataSheetName);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
        sheet = ss.insertSheet(CONFIG.dataSheetName);
        const headers = [
            'Timestamp', 'RO Number', 'VIN', 'Year', 'Make', 'Model', 'Color',
            'Insurance', 'Claim Number', 'Location', 'Scoper', 'Estimator',
            'Damage Areas', 'Severity', 'Panel Count',
            'DCS Dent Count', 'OC Rating', 'RNIN', 'R&R',
            'PDR Candidate', 'Notes', 'Status', 'Photo URLs'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
    }

    // Prepare row data
    const timestamp = new Date();
    const rowData = [
        timestamp,
        data.roNumber || '',
        data.vin || '',
        data.year || '',
        data.make || '',
        data.model || '',
        data.color || '',
        data.insurance || '',
        data.claimNumber || '',
        data.location || '',
        data.scoper || '',
        data.estimator || '',
        (data.damageAreas || []).join(', '),
        data.severity || '',
        data.panelCount || '',
        data.dcsDentCount || '',
        data.ocRating || '',
        data.rnin ? 'Yes' : 'No',
        data.rr ? 'Yes' : 'No',
        data.pdrCandidate || '',
        data.notes || '',
        data.status || '',
        (data.photoUrls || []).join(', ')
    ];

    // Append to sheet
    sheet.appendRow(rowData);

    // Get the row number for reference
    const lastRow = sheet.getLastRow();

    return {
        success: true,
        message: 'Scope submitted successfully!',
        rowNumber: lastRow,
        timestamp: timestamp.toISOString()
    };
}

/**
 * Get configuration for the form (called by client-side JS)
 */
function getFormConfig() {
    return {
        locations: CONFIG.locations,
        scopers: CONFIG.scopers,
        estimators: CONFIG.estimators
    };
}

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

/**
 * Sends email notification for new submission
 */
function sendNotificationEmail(data) {
    const subject = `🚗 New Scope: ${data.year} ${data.make} ${data.model} | RO: ${data.roNumber}`;

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; color: #4CD964;">🚗 New Scope Submitted</h2>
        <p style="margin: 8px 0 0 0; color: #a1a1a6; font-size: 16px;">
          ${data.year} ${data.make} ${data.model} | RO: ${data.roNumber}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 140px;">VIN</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.vin || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Insurance</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.insurance || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Claim #</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.claimNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Location</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.location || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Scoped By</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.scoper || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Estimator</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.estimator || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Severity</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
              <span style="background: ${getSeverityColorForEmail(data.severity)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px;">
                ${data.severity || 'N/A'}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Damage Areas</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${(data.damageAreas || []).join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">DCS Dent Count</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.dcsDentCount || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">OC Rating</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.ocRating || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">RNIN</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.rnin ? '✓ Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">R&R</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.rr ? '✓ Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">PDR Candidate</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${data.pdrCandidate || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold;">Status</td>
            <td style="padding: 12px;">${data.status || 'N/A'}</td>
          </tr>
        </table>
        
        ${data.notes ? `
          <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #007AFF;">
            <strong>Notes:</strong><br>
            ${data.notes}
          </div>
        ` : ''}
      </div>
      
      <div style="background: #1a1a1a; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
        <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" 
           style="background: linear-gradient(135deg, #007AFF 0%, #0055cc 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: 600;">
          View Dashboard →
        </a>
      </div>
      
      <p style="color: #888; font-size: 12px; text-align: center; margin-top: 16px;">
        Automated notification from ${CONFIG.companyName} Custom Scope System
      </p>
    </div>
  `;

    CONFIG.notifyEmails.forEach(email => {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            htmlBody: htmlBody
        });
    });
}

function getSeverityColorForEmail(severity) {
    switch (severity) {
        case 'Light': return '#30D158';
        case 'Moderate': return '#FF9F0A';
        case 'Heavy': return '#FF453A';
        case 'Total Loss': return '#8E8E93';
        default: return '#007AFF';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Test function to verify the sheet setup
 */
function testSetup() {
    const testData = {
        roNumber: 'TEST-001',
        vin: '1HGCM82633A123456',
        year: '2024',
        make: 'Honda',
        model: 'Accord',
        color: 'Silver',
        insurance: 'Progressive',
        claimNumber: 'CLM-TEST-001',
        location: 'Main Shop',
        scoper: 'John Smith',
        estimator: 'Sarah Williams',
        damageAreas: ['Hood', 'Roof', 'Front Bumper'],
        severity: 'Moderate',
        panelCount: '4',
        dcsDentCount: '5-10',
        ocRating: '1-40',
        rnin: true,
        rr: false,
        pdrCandidate: 'Yes',
        notes: 'Test submission from setup verification',
        status: 'Complete'
    };

    const result = saveToSheet(testData);
    console.log('Test result:', result);

    // Optionally send test email
    // sendNotificationEmail(testData);
}
