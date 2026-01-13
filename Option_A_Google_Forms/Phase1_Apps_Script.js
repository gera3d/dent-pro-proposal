/**
 * Dent Experts - Google Apps Script Automations
 * 
 * This script adds the following automations to your Google Form + Sheet:
 * 1. Email notification when a new scope is submitted
 * 2. Auto-generate RO number (optional)
 * 3. Status tracking with timestamps
 * 4. Daily summary email
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet (created from Form responses)
 * 2. Click Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Update the CONFIG section below with your emails
 * 5. Click Save (disk icon)
 * 6. Run the "createTriggers" function once to set up automations
 * 7. Authorize the script when prompted
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const CONFIG = {
    // Email addresses to notify on new submissions
    notifyEmails: [
        'estimator@dentexperts.com',  // Change to your estimator's email
        'admin@dentexperts.com'       // Change to admin email (optional)
    ],

    // Company name for emails
    companyName: 'Dent Experts',

    // Daily summary email recipient
    dailySummaryEmail: 'admin@dentexperts.com',

    // Time to send daily summary (24-hour format)
    dailySummaryHour: 18, // 6 PM

    // Sheet name where form responses go
    responseSheetName: 'Form Responses 1'
};

// ============================================
// EMAIL ON NEW SUBMISSION
// ============================================

/**
 * Triggered when a new form response is submitted
 * Sends email notification to estimators
 */
function onFormSubmit(e) {
    try {
        const response = e.namedValues;

        // Extract key information
        const roNumber = response['RO Number'] ? response['RO Number'][0] : 'N/A';
        const vin = response['VIN Number'] ? response['VIN Number'][0] : 'N/A';
        const year = response['Year'] ? response['Year'][0] : '';
        const make = response['Make'] ? response['Make'][0] : '';
        const model = response['Model'] ? response['Model'][0] : '';
        const severity = response['Overall Damage Severity'] ? response['Overall Damage Severity'][0] : 'N/A';
        const scoper = response['Scoper Name'] ? response['Scoper Name'][0] : 'Unknown';
        const estimator = response['Estimator/Writer'] ? response['Estimator/Writer'][0] : 'N/A';
        const location = response['Location'] ? response['Location'][0] : 'N/A';
        const insurance = response['Insurance Company'] ? response['Insurance Company'][0] : 'N/A';
        const claimNumber = response['Claim Number'] ? response['Claim Number'][0] : 'N/A';
        const status = response['Scope Status'] ? response['Scope Status'][0] : 'N/A';

        // Build email subject
        const subject = `🚗 New Scope: ${year} ${make} ${model} | RO: ${roNumber}`;

        // Build email body
        const body = `
NEW VEHICLE SCOPE SUBMITTED
============================

VEHICLE INFORMATION
• RO Number: ${roNumber}
• VIN: ${vin}
• Vehicle: ${year} ${make} ${model}

CLAIM DETAILS
• Insurance: ${insurance}
• Claim #: ${claimNumber}

ASSIGNMENT
• Location: ${location}
• Scoped By: ${scoper}
• Assigned To: ${estimator}

DAMAGE ASSESSMENT
• Severity: ${severity}
• Status: ${status}

---
View all scopes: [Open Dashboard]
${SpreadsheetApp.getActiveSpreadsheet().getUrl()}

This is an automated notification from ${CONFIG.companyName}.
    `;

        // Build HTML email body
        const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; color: #007AFF;">🚗 New Scope Submitted</h2>
        <p style="margin: 8px 0 0 0; color: #a1a1a6;">${year} ${make} ${model} | RO: ${roNumber}</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>VIN</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${vin}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Insurance</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${insurance}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Claim #</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${claimNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Location</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Scoped By</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${scoper}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Estimator</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${estimator}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Severity</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">
              <span style="background: ${getSeverityColor(severity)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${severity}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Status</strong></td>
            <td style="padding: 8px 0;">${status}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #1a1a1a; padding: 16px; text-align: center; border-radius: 0 0 8px 8px;">
        <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}" 
           style="background: #007AFF; color: white; padding: 10px 24px; text-decoration: none; border-radius: 20px; display: inline-block;">
          View Dashboard →
        </a>
      </div>
      
      <p style="color: #888; font-size: 12px; text-align: center; margin-top: 16px;">
        Automated notification from ${CONFIG.companyName}
      </p>
    </div>
    `;

        // Send email
        CONFIG.notifyEmails.forEach(email => {
            MailApp.sendEmail({
                to: email,
                subject: subject,
                body: body,
                htmlBody: htmlBody
            });
        });

        // Log the submission
        console.log(`Scope submitted: ${roNumber} - ${year} ${make} ${model}`);

    } catch (error) {
        console.error('Error in onFormSubmit:', error);
    }
}

/**
 * Returns color based on damage severity
 */
function getSeverityColor(severity) {
    switch (severity) {
        case 'Light (minor dents, minimal repair)':
            return '#30D158'; // Green
        case 'Moderate (multiple panels, standard repair)':
            return '#FF9F0A'; // Orange
        case 'Heavy (extensive damage, major repair)':
            return '#FF453A'; // Red
        case 'Total Loss Candidate':
            return '#8E8E93'; // Gray
        default:
            return '#007AFF'; // Blue
    }
}

// ============================================
// DAILY SUMMARY EMAIL
// ============================================

/**
 * Sends daily summary of all scopes submitted today
 * Triggered daily at the configured hour
 */
function sendDailySummary() {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.responseSheetName);
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) {
            console.log('No data to summarize');
            return;
        }

        const headers = data[0];
        const timestampIndex = headers.indexOf('Timestamp');

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's submissions
        const todaysScopes = data.slice(1).filter(row => {
            const rowDate = new Date(row[timestampIndex]);
            rowDate.setHours(0, 0, 0, 0);
            return rowDate.getTime() === today.getTime();
        });

        if (todaysScopes.length === 0) {
            console.log('No scopes submitted today');
            return;
        }

        // Build summary
        const subject = `📊 Daily Scope Summary: ${todaysScopes.length} scopes submitted today`;

        let body = `
DAILY SCOPE SUMMARY
${CONFIG.companyName}
Date: ${today.toDateString()}
Total Scopes: ${todaysScopes.length}

============================
`;

        todaysScopes.forEach((row, index) => {
            const roIndex = headers.indexOf('RO Number');
            const makeIndex = headers.indexOf('Make');
            const modelIndex = headers.indexOf('Model');
            const yearIndex = headers.indexOf('Year');
            const scoperIndex = headers.indexOf('Scoper Name');

            body += `
${index + 1}. RO: ${row[roIndex]} | ${row[yearIndex]} ${row[makeIndex]} ${row[modelIndex]}
   Scoped by: ${row[scoperIndex]}
`;
        });

        body += `
============================
View full dashboard: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
`;

        // Send email
        MailApp.sendEmail({
            to: CONFIG.dailySummaryEmail,
            subject: subject,
            body: body
        });

        console.log(`Daily summary sent: ${todaysScopes.length} scopes`);

    } catch (error) {
        console.error('Error in sendDailySummary:', error);
    }
}

// ============================================
// SETUP TRIGGERS
// ============================================

/**
 * Creates all necessary triggers
 * RUN THIS FUNCTION ONCE after setting up the script
 */
function createTriggers() {
    // Remove existing triggers first
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

    // Create form submit trigger
    ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onFormSubmit()
        .create();

    // Create daily summary trigger
    ScriptApp.newTrigger('sendDailySummary')
        .timeBased()
        .everyDays(1)
        .atHour(CONFIG.dailySummaryHour)
        .create();

    console.log('Triggers created successfully!');
    console.log('- Form submit trigger: Active');
    console.log('- Daily summary trigger: Active (runs at ' + CONFIG.dailySummaryHour + ':00)');
}

/**
 * Test function to verify email is working
 */
function testEmailNotification() {
    const testEvent = {
        namedValues: {
            'RO Number': ['TEST-001'],
            'VIN Number': ['1HGCM82633A123456'],
            'Year': ['2023'],
            'Make': ['Honda'],
            'Model': ['Accord'],
            'Overall Damage Severity': ['Moderate (multiple panels, standard repair)'],
            'Scoper Name': ['Test Scoper'],
            'Estimator/Writer': ['Test Estimator'],
            'Location': ['Main Shop'],
            'Insurance Company': ['Progressive'],
            'Claim Number': ['CLM-12345'],
            'Scope Status': ['Complete - Ready for estimate']
        }
    };

    onFormSubmit(testEvent);
    console.log('Test email sent!');
}
