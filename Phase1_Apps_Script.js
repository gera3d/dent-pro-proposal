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
// GOHIGHLEVEL (GHL) API CONFIGURATION
// ============================================

const GHL_CONFIG = {
  // IMPORTANT: Store these in Script Properties for security
  // Go to: Project Settings → Script Properties → Add Property
  // Key: GHL_ACCESS_TOKEN, Value: your_oauth_token
  // Key: GHL_LOCATION_ID, Value: AAzBZNLXS4rdwhG76MLi

  get accessToken() {
    return PropertiesService.getScriptProperties().getProperty('GHL_ACCESS_TOKEN');
  },
  get locationId() {
    return PropertiesService.getScriptProperties().getProperty('GHL_LOCATION_ID') || 'AAzBZNLXS4rdwhG76MLi';
  },

  baseUrl: 'https://services.leadconnectorhq.com',

  pipelines: {
    production: {
      id: 'JptjUQHom2aW3y3MGc2g',
      name: 'Repair Process tracker',
      stages: {
        scope_estimation: 'abf22448-51ea-474f-bac1-e4edd981f8e3',
        parts: '1bc39bf7-ff57-431b-ae08-83657e613068',
        pending_insurance: '565066b2-9755-4e9d-baec-4ecb0e52ab35',
        approved: 'c310181e-e082-4217-862a-bd62cfdcb094',
        ready_pdr: '4c14425c-c2be-4151-89c7-45e95432299a',
        in_paint: 'e110393b-00da-4589-8896-98fbfd8ed918',
        glass: '9ca436d9-a00f-408b-a383-1e97ccf9478d',
        r_and_i: '040c868a-6fde-4c5f-aed1-78b86cef891d',
        qc_clean: 'a4c28ab3-eb7e-4e3a-9794-975111a3b851',
        complete_ready: 'a3909f1d-7e3f-4339-8cb8-8f460925b1aa',
        delivered: '3e7cf1de-0768-40ae-a914-44cdef06fd5a',
        payment: '6906f57d-c8fc-43b2-95fa-43ec026645d9'
      }
    },
    expert_path: {
      id: 'zLqAUFVD2Bfub4EP54lL',
      name: 'The Expert Path',
      stages: {
        expert_request: 'f62deed6-d81c-4e31-98aa-af54d5646596',
        assessment_in_progress: 'b9d5df83-0740-4353-b761-c0e94d5b6565',
        proposal_ready: 'd3e7f8b4-ba38-49cf-863b-19861221a488',
        client_approved: '8f71858c-79be-4b24-8a1e-895772aaa9bc',
        work_in_progress: 'b9b39647-ea3d-4f4b-bca4-27caf10ad5fb',
        quality_check: 'ba66106b-de42-4b1e-a261-04438da3089a',
        completed: 'b941f0a2-f8b0-413e-90a4-312da89a7a12'
      }
    },
    intake_leads: {
      id: 'HDtbGiOgegyI9aTcYKWu',
      stages: {
        new_leads: 'c1a33091-53ef-4146-9cdb-c09aa07fdc0b'
      }
    }
  },

  customFields: {
    vin: 'Au75x5FoMof3Bsjexmj3',
    year: 'tRnwHMSfBWl329vr1jsd',
    make: 's49iwLf4IDkUgKKcQAQ0',
    model: 'GXMUoOOiBFliQxuAGuzk',
    insurance_company: 'YVIvG2P73p9IltxLHm5v',
    claim_number: 'Qcsf5Kk2MrNp1UP9kdDt',
    technician_name: 'XOdGZsGCmyjFmZO1eHsw',
    paint_cost: '2Zq48bM6qk2aj7nkYVoF',
    parts_cost: '6ksWBndclK6SGadrDqiV'
  }
};

// ============================================
// GOHIGHLEVEL API INTEGRATION
// ============================================

/**
 * Submit form data to GoHighLevel
 * Creates/updates contact and creates opportunity
 */
function submitToGHL(formData) {
  if (!GHL_CONFIG.accessToken) {
    console.error('GHL_ACCESS_TOKEN not set in Script Properties');
    return { success: false, error: 'GHL API token not configured' };
  }

  try {
    // Step 1: Upsert Contact
    const contact = upsertGHLContact(formData);
    if (!contact.success) {
      return contact;
    }

    // Step 2: Create Opportunity
    const opportunity = createGHLOpportunity(formData, contact.contactId);

    return {
      success: true,
      contactId: contact.contactId,
      opportunityId: opportunity.opportunityId
    };

  } catch (error) {
    console.error('GHL Integration Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search for existing contact or create new one
 */
function upsertGHLContact(formData) {
  const email = formData.customerEmail;
  const phone = formData.customerPhone;

  if (!email && !phone) {
    return { success: false, error: 'Email or phone required for contact' };
  }

  // Search for existing contact
  const searchQuery = email || phone;
  const searchUrl = `${GHL_CONFIG.baseUrl}/contacts/search?locationId=${GHL_CONFIG.locationId}&query=${encodeURIComponent(searchQuery)}`;

  const searchResponse = UrlFetchApp.fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    muteHttpExceptions: true
  });

  const searchResult = JSON.parse(searchResponse.getContentText());

  // If contact exists, return it
  if (searchResult.contacts && searchResult.contacts.length > 0) {
    console.log('Found existing contact:', searchResult.contacts[0].id);
    return { success: true, contactId: searchResult.contacts[0].id };
  }

  // Create new contact
  const nameParts = (formData.insuredName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const contactPayload = {
    locationId: GHL_CONFIG.locationId,
    firstName: firstName,
    lastName: lastName,
    email: email || undefined,
    phone: phone || undefined,
    source: 'Dent Experts Form'
  };

  const createUrl = `${GHL_CONFIG.baseUrl}/contacts/`;
  const createResponse = UrlFetchApp.fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    payload: JSON.stringify(contactPayload),
    muteHttpExceptions: true
  });

  const createResult = JSON.parse(createResponse.getContentText());

  if (createResult.contact && createResult.contact.id) {
    console.log('Created new contact:', createResult.contact.id);
    return { success: true, contactId: createResult.contact.id };
  }

  return { success: false, error: 'Failed to create contact' };
}

/**
 * Create opportunity in the appropriate pipeline
 */
function createGHLOpportunity(formData, contactId) {
  // Determine pipeline (default to production)
  const pipelineType = formData.pipelineType || 'production';
  const pipeline = GHL_CONFIG.pipelines[pipelineType] || GHL_CONFIG.pipelines.production;

  // Get starting stage
  const startingStage = pipelineType === 'expert_path'
    ? pipeline.stages.expert_request
    : pipeline.stages.scope_estimation;

  // Build opportunity title
  const title = `Repair: ${formData.year || ''} ${formData.make || ''} ${formData.model || ''}`.trim() || 'New Repair';

  // Build custom fields array
  const customFields = [];

  if (formData.vin) {
    customFields.push({ id: GHL_CONFIG.customFields.vin, value: formData.vin });
  }
  if (formData.year) {
    customFields.push({ id: GHL_CONFIG.customFields.year, value: formData.year });
  }
  if (formData.make) {
    customFields.push({ id: GHL_CONFIG.customFields.make, value: formData.make });
  }
  if (formData.model) {
    customFields.push({ id: GHL_CONFIG.customFields.model, value: formData.model });
  }
  if (formData.insurance) {
    customFields.push({ id: GHL_CONFIG.customFields.insurance_company, value: formData.insurance });
  }
  if (formData.claimNumber) {
    customFields.push({ id: GHL_CONFIG.customFields.claim_number, value: formData.claimNumber });
  }
  if (formData.estimator) {
    customFields.push({ id: GHL_CONFIG.customFields.technician_name, value: formData.estimator });
  }

  const opportunityPayload = {
    pipelineId: pipeline.id,
    pipelineStageId: startingStage,
    locationId: GHL_CONFIG.locationId,
    name: title,
    contactId: contactId,
    status: 'open',
    customFields: customFields
  };

  const url = `${GHL_CONFIG.baseUrl}/opportunities/`;
  const response = UrlFetchApp.fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    },
    payload: JSON.stringify(opportunityPayload),
    muteHttpExceptions: true
  });

  const result = JSON.parse(response.getContentText());

  if (result.opportunity && result.opportunity.id) {
    console.log('Created opportunity:', result.opportunity.id);
    return { success: true, opportunityId: result.opportunity.id };
  }

  console.error('Failed to create opportunity:', result);
  return { success: false, error: 'Failed to create opportunity' };
}

/**
 * Test function to verify GHL connection
 */
function testGHLConnection() {
  const testData = {
    insuredName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '555-123-4567',
    vin: '1HGCM82633A123456',
    year: '2023',
    make: 'Honda',
    model: 'Accord',
    insurance: 'Progressive',
    claimNumber: 'CLM-12345',
    estimator: 'Test Tech'
  };

  const result = submitToGHL(testData);
  console.log('GHL Test Result:', JSON.stringify(result));
  return result;
}

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
