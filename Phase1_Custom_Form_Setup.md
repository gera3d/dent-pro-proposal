# Custom Web Form - Google Sheets Integration

This guide walks you through setting up the **custom version** of the Dent Experts scope form that stores data directly to Google Sheets (bypassing Google Forms).

---

## What's Different?

| Feature | Google Forms | Custom Web Form |
|---------|--------------|-----------------|
| UI/UX Control | Limited | **Full control** |
| Mobile Optimization | Basic | **iPad-optimized dark theme** |
| Custom Fields | Standard types | **Rating scales, toggles** |
| DCS Dent Count | ❌ | ✅ (1-5, 5-10) |
| OC Rating | ❌ | ✅ (Oversized, 1-40, 40+) |
| RNIN/R&R Toggles | ❌ | ✅ |
| Photo Uploads | Native | Via Google Drive link |
| Branding | Google branding | **Your branding** |

---

## Files Included

1. **`Phase1_Custom_Form_WebApp.js`** - Apps Script backend
2. **`Phase1_Custom_Form_HTML.html`** - Custom form UI (rename to `ScopeForm.html` in Apps Script)

---

## Setup Instructions

### Step 1: Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet: **"Dent Experts - Scope Data"**
3. The script will auto-create headers on first submission

### Step 2: Add Apps Script

1. In your new spreadsheet, click **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Paste the entire contents of `Phase1_Custom_Form_WebApp.js`
4. **Rename the file** from `Code.gs` to `Code.gs` (keep as-is)

### Step 3: Add HTML Form

1. In Apps Script, click **+ (Add file)** → **HTML**
2. Name it exactly: `ScopeForm` (creates `ScopeForm.html`)
3. Paste the entire contents of `Phase1_Custom_Form_HTML.html`
4. Click **Save** (disk icon)

### Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Configure:
   - **Description**: "Dent Experts Scope Form v1"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** when prompted (grant all permissions)
6. **Copy the Web App URL** - this is your form link!

### Step 5: Test the Form

1. Open the Web App URL in your browser
2. Fill out a test submission
3. Check your Google Sheet - data should appear!
4. Verify the email notification was sent

---

## Configuration

Edit the `CONFIG` object in `Phase1_Custom_Form_WebApp.js`:

```javascript
const CONFIG = {
  // Sheet name for storing submissions
  dataSheetName: 'Scope Data',
  
  // Email notifications - UPDATE THESE
  notifyEmails: [
    'estimator@dentexperts.com',
    'admin@dentexperts.com'
  ],
  
  companyName: 'Dent Experts',
  
  // Dropdown options - CUSTOMIZE FOR YOUR TEAM
  locations: ['Main Shop', 'North Location', 'South Location', 'Mobile Unit'],
  scopers: ['John Smith', 'Jane Doe', 'Mike Johnson'],
  estimators: ['Sarah Williams', 'Tom Brown', 'Chris Davis']
};
```

**After changing config**, redeploy the web app to apply changes.

---

## Google Sheet Structure

The form creates these columns automatically:

| Column | Description |
|--------|-------------|
| Timestamp | Auto-generated submission time |
| RO Number | Repair order number |
| VIN | Vehicle identification (17 chars) |
| Year, Make, Model | Vehicle details |
| Color | Vehicle color |
| Insurance | Insurance company |
| Claim Number | Insurance claim reference |
| Location | Shop location |
| Scoper | Who scoped it |
| Estimator | Assigned estimator |
| Damage Areas | Comma-separated list |
| Severity | Light/Moderate/Heavy/Total Loss |
| Panel Count | Number of panels |
| **DCS Dent Count** | 1-5 or 5-10 |
| **OC Rating** | Oversized, 1-40, or 40+ |
| **RNIN** | Yes/No |
| **R&R** | Yes/No (Remove & Replace) |
| PDR Candidate | Yes/No/Partial/Unsure |
| Notes | Additional notes |
| Status | Complete/Partial/On Hold |
| Photo URLs | Links to uploaded photos |

---

## iPad Setup

1. **Open Safari** on iPad
2. Navigate to Web App URL
3. Tap **Share** icon (square with arrow)
4. Tap **Add to Home Screen**
5. Name it "Scope Form"
6. Tap **Add**

Now scopers have a home screen icon that looks and feels like a native app!

---

## Updating the Form

When you need to update:

1. Go to your Google Sheet → **Extensions → Apps Script**
2. Make your changes
3. Click **Deploy → Manage deployments**
4. Click **Edit** (pencil icon)
5. Change version to **New version**
6. Click **Deploy**

The same URL continues to work with the updated version.

---

## Troubleshooting

### Form not submitting?
- Check Apps Script execution logs: **Executions** tab
- Verify script is deployed as web app

### No email notifications?
- Check email addresses in CONFIG
- Verify Apps Script has Gmail permissions
- Check spam folder

### Data not appearing in sheet?
- Make sure sheet name matches CONFIG.dataSheetName
- Check if sheet tab exists

### Need to handle photos?
For photo uploads, you'll need to:
1. Create a Google Drive folder
2. Add file upload handling to the script
3. Store Drive links in the Photo URLs column

---

## Next Steps

1. ✅ Deploy the web app
2. ✅ Test with sample data
3. ✅ Customize dropdown options for your team
4. ✅ Add to iPad home screens
5. 🔄 Set up Google Drive for photo uploads (Phase 2)
