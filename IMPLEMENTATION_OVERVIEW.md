# Dent Experts - Scope System Implementation

This document provides an overview of **two parallel implementations** for the vehicle scope form system. Both solutions store data in Google Sheets, but differ in their approach and capabilities.

---

## Source of Truth

The **canonical field structure** is defined in:
> [`Phase1_Google_Form_Structure.md`](./Option_A_Google_Forms/Phase1_Google_Form_Structure.md)

All implementations should reference this document for:
- Required fields and validation rules
- Dropdown options (makes, insurance companies, etc.)
- Damage assessment categories
- Status options

---

## Option Comparison

| Feature | Option A: Google Forms | Option B: Custom Web App |
|---------|----------------------|--------------------------|
| **Complexity** | Low | Medium |
| **Setup Time** | ~30 minutes | ~1 hour |
| **Maintenance** | Google-managed | Self-managed |
| **UI Customization** | Limited | **Full control** |
| **Branding** | Google branding | **Dent Experts branding** |
| **Mobile Experience** | Basic responsive | **iPad-optimized dark UI** |
| **DCS Dent Count** | ❌ Not available | ✅ (1-5, 5-10) |
| **OC Rating** | ❌ Not available | ✅ (Oversized, 1-40, 40+) |
| **RNIN / R&R Toggles** | ❌ Manual checkboxes | ✅ Toggle switches |
| **Photo Uploads** | ✅ Native support | 🔧 Via Google Drive |
| **Offline Support** | ❌ None | 🔧 Can add PWA support |
| **File Upload** | ✅ Built-in | 🔧 Requires Drive API |
| **Cost** | Free | Free |

---

## Option A: Google Forms

**Best for**: Quick deployment, standard functionality, native file uploads

### Files

Located in: `Option_A_Google_Forms/`

| File | Purpose |
|------|---------|
| [`Phase1_Google_Form_Structure.md`](./Option_A_Google_Forms/Phase1_Google_Form_Structure.md) | Form field definitions (SOURCE OF TRUTH) |
| [`Phase1_Apps_Script.js`](./Option_A_Google_Forms/Phase1_Apps_Script.js) | Email notifications & automations |
| [`Phase1_Setup_Guide.md`](./Option_A_Google_Forms/Phase1_Setup_Guide.md) | Step-by-step setup instructions |

### How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Google Form   │ ───► │  Google Sheets  │ ───► │ Apps Script     │
│   (iPad/Web)    │      │  (Data Storage) │      │ (Email Notify)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Setup Steps

1. Create Google Form using field definitions
2. Link to new Google Sheet
3. Add Apps Script for email notifications
4. Create triggers for automation
5. Share form link to scopers

---

## Option B: Custom Web App

**Best for**: Full UI control, advanced rating scales, premium iPad experience

### Files

Located in: `Option_B_Custom_WebApp/`

| File | Purpose |
|------|---------|
| [`Phase1_Custom_Form_WebApp.js`](./Option_B_Custom_WebApp/Phase1_Custom_Form_WebApp.js) | Apps Script backend + Google Sheets API |
| [`Phase1_Custom_Form_HTML.html`](./Option_B_Custom_WebApp/Phase1_Custom_Form_HTML.html) | Custom form UI (rename to ScopeForm.html) |
| [`Phase1_Custom_Form_Setup.md`](./Option_B_Custom_WebApp/Phase1_Custom_Form_Setup.md) | Deployment instructions |

### How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Custom HTML    │      │  Apps Script    │      │  Google Sheets  │
│  Form (iPad)    │ ───► │  Web App        │ ───► │  (Data Storage) │
│                 │      │  (doPost/doGet) │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │
        │                        ▼
        │                ┌─────────────────┐
        │                │  Email Notify   │
        │                │  (MailApp)      │
        └───────────────►└─────────────────┘
```

### Key Features

- **DCS Dent Count**: Rating scale (1-5, 5-10)
- **OC Rating**: Oversized count (Oversized, 1-40, 40+)
- **RNIN Toggle**: Remove & Install indicator
- **R&R Toggle**: Remove & Replace indicator
- **Dark Theme**: iPad-optimized premium UI
- **Instant Feedback**: Success modals, loading states

### Setup Steps

1. Create new Google Sheet
2. Add Apps Script code
3. Create ScopeForm.html file
4. Deploy as Web App
5. Add to iPad home screen

---

## Field Mapping Reference

Both implementations should capture these fields (from source of truth):

### Vehicle Information
- RO Number (required)
- VIN Number (required, 17 chars)
- Year (required, dropdown)
- Make (required, dropdown)
- Model (required)
- Color (optional)

### Claim Information
- Insurance Company (required)
- Claim Number (required)

### Assignment
- Location (required)
- Scoper Name (required)
- Estimator/Writer (required)

### Damage Assessment
- Damage Areas (required, multi-select)
- Overall Severity (required)
- Panel Count (optional)

### Custom Web App Only
- **DCS Dent Count** (1-5, 5-10)
- **OC Rating** (Oversized, 1-40, 40+)
- **RNIN** (checkbox/toggle)
- **R&R** (checkbox/toggle)

### Repair Assessment
- PDR Candidate (required)
- Scope Status (required)
- Notes (optional)

---

## Recommended Approach

### Phase 1: Deploy Both

1. **Immediately**: Deploy Google Forms version as primary
   - Quick to set up
   - Handles photo uploads natively
   - Good for initial testing

2. **Parallel**: Build out Custom Web App
   - Add photo upload via Drive API
   - Test on iPads
   - Gather feedback

### Phase 2: Evaluate & Choose

After 2-4 weeks of usage:
- Review feedback from scopers
- Assess which features are most used
- Decide on primary solution

### Phase 3: Enhance

Based on chosen solution:
- Add offline support (if Web App)
- Build dashboard views
- Add PDF generation
- Integrate with estimating systems

---

## Development Roadmap

### Google Forms Path
- [x] Form structure defined
- [x] Apps Script for notifications
- [ ] Create actual Google Form
- [ ] Test end-to-end
- [ ] Deploy to scopers

### Custom Web App Path
- [x] HTML form UI
- [x] Apps Script backend
- [x] Google Sheets integration
- [ ] Photo upload via Drive
- [ ] Deploy Web App
- [ ] Test on iPad
- [ ] Add PWA offline support

---

## Questions?

Refer to the individual setup guides in each option folder for detailed instructions.
