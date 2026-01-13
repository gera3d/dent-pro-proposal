# Dent Experts - Phase 1 Setup Guide
## Google Forms & Sheets Implementation

---

## Quick Start Checklist

- [ ] **Step 1:** Create Google Form (15 min)
- [ ] **Step 2:** Link to Google Sheet (2 min)
- [ ] **Step 3:** Add Apps Script automations (10 min)
- [ ] **Step 4:** Test the form (5 min)
- [ ] **Step 5:** Set up iPad bookmarks (5 min)
- [ ] **Step 6:** Train the team (30 min)

---

## Step 1: Create the Google Form

### 1.1 Access Google Forms
1. Go to [forms.google.com](https://forms.google.com)
2. Sign in with your Google account
3. Click **+ Blank** to create a new form

### 1.2 Set Up the Form
1. **Title:** "Dent Experts - Vehicle Scope Sheet"
2. **Description:** "Complete this form for each vehicle inspection."
3. Add each question from `Phase1_Google_Form_Structure.md`

### 1.3 Key Questions to Add

| Section | Questions |
|---------|-----------|
| Vehicle Info | RO Number, VIN, Year, Make, Model, Color |
| Claim Info | Insurance Company, Claim Number |
| Assignment | Location, Scoper Name, Estimator |
| Damage | Damage Areas, Severity, Panel Count |
| Documentation | Photos, Notes, PDR Candidate |
| Status | Scope Status |

### 1.4 Customize Dropdowns
Update these with YOUR actual values:
- **Location:** Your shop locations
- **Scoper Name:** Your scoper team members
- **Estimator/Writer:** Your estimators

---

## Step 2: Link to Google Sheet

### 2.1 Create the Dashboard
1. In your Google Form, click the **Responses** tab
2. Click the green **Google Sheets** icon
3. Select **Create a new spreadsheet**
4. Name it: "Dent Experts - Scope Dashboard"
5. Click **Create**

### 2.2 Set Up the Sheet
1. Your sheet will auto-populate with form headers
2. Consider adding these columns manually:
   - **Status** (for tracking progress)
   - **Estimate Complete** (checkbox)
   - **Notes from Estimator**

### 2.3 Add Conditional Formatting
1. Select the "Overall Damage Severity" column
2. Format → Conditional formatting
3. Add rules:
   - Contains "Light" → Green background
   - Contains "Moderate" → Yellow background
   - Contains "Heavy" → Red background

---

## Step 3: Add Apps Script Automations

### 3.1 Open Apps Script
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor

### 3.2 Paste the Code
1. Open `Phase1_Apps_Script.js` 
2. Copy the entire contents
3. Paste into the Apps Script editor
4. Click the **Save** icon (disk)

### 3.3 Configure Your Settings
Find this section at the top and update:

```javascript
const CONFIG = {
  notifyEmails: [
    'YOUR_ESTIMATOR@email.com',    // ← Change this
    'YOUR_ADMIN@email.com'          // ← Change this
  ],
  companyName: 'Dent Experts',
  dailySummaryEmail: 'YOUR_ADMIN@email.com',  // ← Change this
  dailySummaryHour: 18,  // 6 PM
  responseSheetName: 'Form Responses 1'
};
```

### 3.4 Create Triggers
1. In the function dropdown (top), select **createTriggers**
2. Click **Run**
3. When prompted, click **Review Permissions**
4. Choose your Google account
5. Click **Allow**

### 3.5 Test the Automation
1. Select **testEmailNotification** from the dropdown
2. Click **Run**
3. Check your email for the test notification

---

## Step 4: Test the Form

### 4.1 Submit a Test Entry
1. Click the **Preview** button (eye icon) in Google Forms
2. Fill out a complete test scope
3. Submit the form

### 4.2 Verify Everything Works
- [ ] Form submission goes through
- [ ] Data appears in Google Sheet
- [ ] Email notification is received
- [ ] All fields are captured correctly

### 4.3 Delete Test Data
1. Go to your Google Sheet
2. Right-click the test row
3. Delete row

---

## Step 5: Set Up iPad Bookmarks

### 5.1 Get the Form Link
1. In Google Forms, click **Send** (top right)
2. Click the link icon (🔗)
3. Check "Shorten URL"
4. Copy the link

### 5.2 Create Home Screen Bookmark (iPad)
1. Open Safari on the iPad
2. Go to the form link
3. Tap the **Share** button (square with arrow)
4. Tap **Add to Home Screen**
5. Name it "Vehicle Scope"
6. Tap **Add**

Now scopers can tap the icon to open the form instantly!

---

## Step 6: Team Training

### For Scopers
1. Show how to access the form from iPad home screen
2. Walk through each section of the form
3. Demonstrate photo upload
4. Explain required vs optional fields
5. Submit a practice scope together

### For Estimators
1. Show the Google Sheet dashboard
2. Explain email notifications
3. Demonstrate filtering and searching
4. Show how to mark scopes as complete

### For Admins
1. Show full dashboard access
2. Explain daily summary emails
3. Demonstrate data export options
4. Review photo storage in Google Drive

---

## Troubleshooting

### "I'm not receiving email notifications"
1. Check spam folder
2. Verify email address in CONFIG
3. Re-run createTriggers function
4. Check Apps Script execution logs

### "Photos aren't uploading"
1. Ensure good internet connection
2. Try reducing photo file size
3. Upload one photo at a time
4. Check Google Drive storage quota

### "Form is slow on iPad"
1. Close other browser tabs
2. Use the home screen bookmark (not browser)
3. Ensure iPad software is updated
4. Clear Safari cache

### "I need to edit form questions"
1. Open Google Forms
2. Click on any question to edit
3. Changes apply immediately
4. ⚠️ Don't change question text after responses exist (breaks data alignment)

---

## Quick Reference

| Task | Where to Go |
|------|-------------|
| Fill out scope | iPad home screen → "Vehicle Scope" |
| View all scopes | Google Sheet dashboard |
| Edit form questions | [forms.google.com](https://forms.google.com) → Your form → Edit |
| View photos | Google Drive → Form folder |
| Edit automations | Sheet → Extensions → Apps Script |

---

## Support

Questions about setup? Contact:
- **Gera Yeremin** - gera@57seconds.com
- Website: [gera.yerem.in](https://gera.yerem.in)

---

*Phase 1 Implementation Guide | Dent Experts Workflow Automation*
