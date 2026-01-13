# Dent Experts - Vehicle Scope Form
## Google Form Setup Guide

This document contains the complete structure for the Google Form that scopers will use on their iPads.

---

## Form Title
**Dent Experts - Vehicle Scope Sheet**

## Form Description
> Complete this form for each vehicle inspection. All fields marked with * are required.

---

## SECTION 1: Vehicle Information

### Question 1: RO Number *
- **Type:** Short answer
- **Validation:** Required
- **Helper text:** Repair Order number from Mitchell

### Question 2: VIN Number *
- **Type:** Short answer  
- **Validation:** Required, exactly 17 characters
- **Helper text:** Scan or manually enter the 17-character VIN

### Question 3: Year *
- **Type:** Dropdown
- **Options:** 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, Other
- **Validation:** Required

### Question 4: Make *
- **Type:** Dropdown
- **Options:** 
  - Acura, Audi, BMW, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ford, GMC
  - Honda, Hyundai, Infiniti, Jeep, Kia, Lexus, Lincoln, Mazda, Mercedes-Benz
  - Nissan, Ram, Subaru, Tesla, Toyota, Volkswagen, Volvo, Other
- **Validation:** Required

### Question 5: Model *
- **Type:** Short answer
- **Validation:** Required
- **Helper text:** e.g., Accord, Camry, F-150

### Question 6: Vehicle Color
- **Type:** Dropdown
- **Options:** White, Black, Silver, Gray, Red, Blue, Green, Brown, Beige, Gold, Orange, Yellow, Purple, Other
- **Validation:** Optional

---

## SECTION 2: Claim Information

### Question 7: Insurance Company *
- **Type:** Dropdown
- **Options:**
  - Progressive
  - State Farm
  - Geico
  - Allstate
  - USAA
  - Farmers
  - Liberty Mutual
  - Nationwide
  - Travelers
  - American Family
  - Other
- **Validation:** Required

### Question 8: Claim Number *
- **Type:** Short answer
- **Validation:** Required
- **Helper text:** Insurance claim reference number

---

## SECTION 3: Location & Assignment

### Question 9: Location *
- **Type:** Dropdown
- **Options:** [TO BE CUSTOMIZED - Add your shop locations]
  - Location 1
  - Location 2
  - Location 3
- **Validation:** Required

### Question 10: Scoper Name *
- **Type:** Dropdown
- **Options:** [TO BE CUSTOMIZED - Add scoper names]
  - Scoper 1
  - Scoper 2
  - Scoper 3
- **Validation:** Required

### Question 11: Estimator/Writer *
- **Type:** Dropdown
- **Options:** [TO BE CUSTOMIZED - Add estimator names]
  - Estimator 1
  - Estimator 2
  - Estimator 3
- **Validation:** Required

---

## SECTION 4: Damage Assessment

### Question 12: Damage Areas (Select all that apply) *
- **Type:** Checkboxes
- **Options:**
  - Hood
  - Roof
  - Trunk/Decklid
  - Front Bumper
  - Rear Bumper
  - Left Front Fender
  - Right Front Fender
  - Left Rear Quarter Panel
  - Right Rear Quarter Panel
  - Left Front Door
  - Right Front Door
  - Left Rear Door
  - Right Rear Door
  - Pillars (A, B, C)
  - Windshield
  - Rear Glass
  - Side Mirrors
  - Other
- **Validation:** Required (at least one selection)

### Question 13: Overall Damage Severity *
- **Type:** Multiple choice
- **Options:**
  - Light (minor dents, minimal repair)
  - Moderate (multiple panels, standard repair)
  - Heavy (extensive damage, major repair)
  - Total Loss Candidate
- **Validation:** Required

### Question 14: Estimated Panel Count
- **Type:** Dropdown
- **Options:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13+
- **Validation:** Optional

---

## SECTION 5: Photos & Notes

### Question 15: Vehicle Photos *
- **Type:** File upload
- **Settings:** 
  - Allow multiple files
  - Restrict to images only
  - Maximum 10 files
- **Helper text:** Upload clear photos of all damage areas. Include VIN plate, odometer, and overall vehicle shots.
- **Validation:** Required (at least 1 photo)

### Question 16: Additional Notes
- **Type:** Paragraph (long answer)
- **Validation:** Optional
- **Helper text:** Any additional observations, special circumstances, or notes for the estimator

### Question 17: PDR Candidate?
- **Type:** Multiple choice
- **Options:**
  - Yes - Good candidate for PDR
  - No - Conventional repair needed
  - Partial - Some panels PDR, some conventional
  - Unsure - Needs further evaluation
- **Validation:** Required

---

## SECTION 6: Completion

### Question 18: Scope Status *
- **Type:** Multiple choice
- **Options:**
  - Complete - Ready for estimate
  - Partial - Additional inspection needed
  - On Hold - Waiting for parts/access
- **Validation:** Required

### Question 19: Date/Time
- **Type:** Date + Time (auto-captured by form)
- **Note:** This is automatically recorded by Google Forms

---

## Form Settings

### General
- ✅ Collect email addresses (optional - for Google account login)
- ✅ Limit to 1 response per user: OFF (scopers submit multiple per day)
- ✅ Show progress bar
- ✅ Shuffle question order: OFF
- ✅ Show link to submit another response: ON

### Presentation
- ✅ Show progress bar
- ✅ Confirmation message: "Scope submitted successfully! The estimator has been notified."

### Responses
- ✅ Collect responses in a Google Sheet (this creates your dashboard)

---

## How to Create This Form

1. Go to [forms.google.com](https://forms.google.com)
2. Click **+ Blank** to create a new form
3. Add each question following the structure above
4. Click the **Responses** tab → Click the green Sheets icon → **Create new spreadsheet**
5. Name the spreadsheet "Dent Experts - Scope Dashboard"

---

## Next Steps After Form Creation

1. **Customize dropdowns** - Add your actual locations, scoper names, estimator names
2. **Set up email notifications** - See `apps_script_automations.js`
3. **Create PDF template** - See PDF template documentation
4. **Share form link** - Bookmark on scoper iPads
