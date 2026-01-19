# Dent Experts - PDR Scope App
## Feature List & Testing Guide

**Current Version:** 2026.01.16.9  
**Live URL:** https://gera3d.github.io/dent-pro-proposal/  
**Local Test:** http://localhost:8000

---

# ✅ BUILT FEATURES

## 1. Core Form Features

### 1.1 Vehicle Information Entry
| Feature | How to Test |
|---------|-------------|
| **RO Number** | Enter a repair order number (e.g., "10452") |
| **Estimator Dropdown** | Select from: Oleg, Gera, John, Jane |
| **Insured Name** | Enter customer's full name |
| **Insurance Carrier** | Select from dropdown of major insurers |
| **Claim Number** | Enter claim number (e.g., "123-456-789") |
| **Year/Make/Model** | Select year, make from dropdowns; type model |
| **Odometer** | Enter mileage reading |
| **Location** | Select shop location from dropdown |
| **VIN Entry** | Enter 17-character VIN |
| **VIN Counter** | Shows "X/17" and turns green when valid |
| **Color/Trim** | Enter vehicle color and trim level |

### 1.2 VIN Barcode Scanner
| Feature | How to Test |
|---------|-------------|
| **📷 Scan Button** | Click camera icon next to VIN field |
| **Live Camera View** | Scanner opens with camera viewfinder |
| **Barcode Detection** | Point at VIN barcode - auto-detects using Quagga2 |
| **Auto-Fill** | Detected VIN populates the field automatically |
| **Manual Fallback** | "Enter Manually" button to type instead |

**Test:** Click the 📷 scan button → Allow camera → Point at a barcode

### 1.3 VIN Copy Button
| Feature | How to Test |
|---------|-------------|
| **📋 Copy Button** | Click to copy VIN to clipboard |
| **Toast Notification** | Shows "VIN copied to clipboard!" |

---

## 2. Vehicle Damage Assessment Grid

### 2.1 Panel-by-Panel Damage Entry
**3-Column Layout:** Left Panels | Center (Hood/Roof/Deck) | Right Panels

| Panel | DC (Dent Count) | OS (Oversize) | R&I Checklist | R&R Checklist |
|-------|-----------------|---------------|---------------|---------------|
| Left Fender | ✅ | ✅ | Lamp, Mldg, Emblem, Liner | ✅ |
| Left Front Door | ✅ | ✅ | Mirror, Upper/Belt Mldg, Handle, Trim | ✅ |
| Left Rear Door | ✅ | ✅ | Upper/Belt Mldg, Handle, Trim | ✅ |
| Left Quarter/Bed | ✅ | ✅ | Lamp, Mldg, Glass, Liner | ✅ |
| Left Cab Corner | ✅ | ✅ | N/A | N/A |
| Hood | ✅ | ✅ | Windshield, Cowl | ✅ |
| Roof | ✅ | ✅ | Hi-Mt Lamp, Headliner, Sunroof, Antenna | ✅ |
| Left/Right Rails | ✅ | ✅ | N/A | N/A |
| Deck/Lid/Gate | ✅ | ✅ | L/R Lamps, Handle, Spoiler, Antenna | ✅ |
| Right Fender | ✅ | ✅ | (mirrors left side) | ✅ |
| Right Front Door | ✅ | ✅ | (mirrors left side) | ✅ |
| Right Rear Door | ✅ | ✅ | (mirrors left side) | ✅ |
| Right Quarter/Bed | ✅ | ✅ | (mirrors left side) | ✅ |
| Right Cab Corner | ✅ | ✅ | N/A | N/A |

**Test:** Enter "3" in any DC field, "15" in OS field, check several R&I/R&R boxes

### 2.2 Interactive Car Schematic
| Feature | How to Test |
|---------|-------------|
| **SVG Car Diagram** | Visual car outline in center column |
| **Click Zones** | Click left side → scrolls to left panels |
| **Click Zones** | Click right side → scrolls to right panels |
| **Click Zones** | Click hood/roof/trunk → scrolls to those sections |
| **Hover Effects** | Panels glow on hover |

**Test:** Click different areas of the car diagram to navigate

---

## 3. Photo Upload System

### 3.1 Photo Capture
| Feature | How to Test |
|---------|-------------|
| **📷 Camera Button** | Opens device camera for photo capture |
| **📁 Gallery Button** | Opens file picker for existing photos |
| **3-Column Grid** | Photos display in grid preview |
| **Remove Photo** | Red X button on each photo to delete |
| **Photo Names** | Text field below each photo for naming |
| **Photo Count** | Shows "X photos selected" |

**Test:** Click Camera → Take a photo → See it in the grid → Add a name

### 3.2 Photo Compression
| Feature | How to Test |
|---------|-------------|
| **Auto-Compress** | Large photos compressed before upload |
| **Status Indicator** | Shows "Uploading..." → "Uploaded ✓" or "Error" |

---

## 4. Form Management

### 4.1 Save/Load Forms
| Feature | How to Test |
|---------|-------------|
| **💾 Save Button** | Saves current form to browser localStorage |
| **Form Name Prompt** | Asks for name (defaults to VIN or RO#) |
| **📂 Saved Forms Dropdown** | Lists all saved forms |
| **Load Form** | Select from dropdown → form populates |
| **🗑️ Delete Button** | Removes selected saved form |
| **➕ New Button** | Clears form for fresh entry |

**Test:** Fill some fields → Click Save → Enter a name → Select from dropdown

### 4.2 Auto-Save (Draft)
| Feature | How to Test |
|---------|-------------|
| **Auto-Save on Change** | Form saves to localStorage on every keystroke |
| **Draft Persistence** | Refresh page → data still there |

**Test:** Enter data → Refresh page → Data persists

---

## 5. PWA (Progressive Web App)

### 5.1 Install to Home Screen
| Feature | How to Test |
|---------|-------------|
| **App Button** | Shows "📲 Add to Home Screen" or install status |
| **manifest.json** | Defines app name, icons, theme color |
| **service-worker.js** | Enables offline caching |
| **app-icon.png** | Custom app icon for home screen |

**Test (iOS):** Open in Safari → Share → Add to Home Screen  
**Test (Android):** Chrome → Menu → Install App

### 5.2 Version Checking
| Feature | How to Test |
|---------|-------------|
| **version.json** | Contains current version number |
| **Update Detection** | Compares local vs server version |
| **Update Prompt** | "🔄 Update Available" button appears |

---

## 6. CSV Export for Mitchell/Progressive

### 6.1 Export Data
| Feature | How to Test |
|---------|-------------|
| **Export Button** | Generates CSV file with all form data |
| **Mitchell Format** | CSV structured for import into Mitchell Connect |
| **Download** | CSV file downloads to device |

**Test:** Fill out form → Click Export → Check CSV download

---

## 7. Training Guide

### 7.1 Built-in Documentation
| Feature | How to Test |
|---------|-------------|
| **📖 Training Guide Link** | Opens Training_Guide.html |
| **Terminology Reference** | Defines DC, OS, R&I, R&R |
| **Visual Instructions** | Screenshots and step-by-step guide |

**Test:** Click "📖 Training Guide & Terminology" link in header

---

## 8. Dent Wizard Matrix Pricing

### 8.1 Pricing Calculator
| Feature | How to Test |
|---------|-------------|
| **Coin Size Selector** | Select dent size for pricing lookup |
| **Matrix Reference** | Based on Dent Wizard pricing matrix PDF |
| **Price Calculation** | Returns price based on panel + size |

---

## 9. UI/UX Features

### 9.1 Design
| Feature | Description |
|---------|-------------|
| **Dark Mode** | Black/dark gray aesthetic |
| **Green Accent** | #4CD964 for interactive elements |
| **Glass Effect** | Semi-transparent cards |
| **Inter Font** | Modern, legible typography |
| **iOS-Style** | 44px touch targets, rounded corners |

### 9.2 Responsive
| Feature | How to Test |
|---------|-------------|
| **Mobile Optimized** | Test on iPhone/iPad |
| **Tablet Layout** | 3-column grid on larger screens |
| **Safe Area** | Content avoids notches/home bars |

### 9.3 Toast Notifications
| Feature | How to Test |
|---------|-------------|
| **Success Toasts** | Green border, success messages |
| **Error Toasts** | Red border, error messages |
| **Auto-Dismiss** | Disappears after ~3 seconds |

---

# 🔧 REMAINING / TODO

## Phase 1 Completion

| Task | Status | Notes |
|------|--------|-------|
| Google Sheets Backend | ❌ Not connected | Need Apps Script + Sheet ID |
| Photo Upload to Google Drive | ❌ Not connected | Need Drive folder setup |
| Email Notifications | ❌ Not connected | Need email trigger in Apps Script |
| PDF Generation | ❌ Not built | Need PDF export from form data |

---

## 📝 USER FEEDBACK (Judah - Jan 18, 2026)

### Dent Count Stepper UI Improvements
| Request | Details |
|---------|---------|
| **+/- Stepper Buttons** | Bring back the plus/minus buttons instead of text input - looks cleaner |
| **Range-Based Steps** | Steps should be: 1-5, 6-15, etc. (matching matrix ranges) |
| **"Off Matrix" Option** | Add "Off Matrix" as the last option after the biggest dent count |
| **Bi-Directional Entry** | Allow clicking MINUS first to go directly to "Off Matrix" (one click) |

**Example Flow:**
- Start at 0
- Click + → 1-5
- Click + → 6-15
- Click + → 16-25
- Click + → Off Matrix
- **OR** click - once from 0 → goes to "Off Matrix" immediately

### PDF Export
| Request | Details |
|---------|---------|
| **Single Page PDF** | PDF export must fit on **1 page**, not 11 pages |
| **Compact Layout** | Dense formatting for print - all data visible at a glance |

### Things That Work Well ✅
- UPD Notes section - keep as is
- Notes section - keep as is

---

## Phase 2 Features

| Task | Status | Notes |
|------|--------|-------|
| User Authentication | ❌ Not built | Google OAuth login |
| User Roles (Scoper/Writer/Admin) | ❌ Not built | Permissions per role |
| Dashboard with Search/Filter | ❌ Not built | View all submitted scopes |
| Scope History per User | ❌ Not built | "My Scopes" view |
| Analytics Dashboard | ❌ Not built | Scopes per day, by location, etc. |

## Phase 3 Integrations

| Task | Status | Notes |
|------|--------|-------|
| OrcaScan VIN API | ❌ Not built | Auto-fill 8 fields from VIN |
| Mitchell Connect Import | ❌ Not built | Pull job queue from Mitchell |
| Mitchell PDF Upload | ❌ Not built | Push scope PDF to customer file |
| GoHighLevel CRM Sync | ❌ Not built | Create opportunities from scopes |

---

# 🧪 TESTING CHECKLIST

## Quick Smoke Test
1. [ ] Open http://localhost:8000 or live URL
2. [ ] Enter RO#, Estimator, Customer Name
3. [ ] Fill VIN (should show 17/17 green counter)
4. [ ] Click 📷 VIN scanner (camera should open)
5. [ ] Enter DC/OS values on a few panels
6. [ ] Check some R&I and R&R boxes
7. [ ] Add a photo using camera or gallery
8. [ ] Click 💾 Save button
9. [ ] Reload page → Data should persist
10. [ ] Select saved form from dropdown → Form loads

## Full Feature Test
Run through each section above, testing every feature

---

*Last Updated: January 18, 2026*
