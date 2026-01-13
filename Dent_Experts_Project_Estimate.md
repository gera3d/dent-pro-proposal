# Dent Experts - Project Estimate
## Scoping & Workflow Automation System

---

## Project Overview

**Client:** Dent Experts  
**Project:** Scoping Workflow Automation  
**Date:** January 12, 2026

### Business Context
Dent Experts handles catastrophe claims for Progressive Insurance using Mitchell Connect. Scopers inspect vehicles, fill out scope sheets, and hand off to writers who create estimates. When Dent Experts captures a customer directly, that information needs to flow into GoHighLevel CRM.

### Current Pain Points
- Manual data entry across multiple systems (Mitchell, paper forms, GoHighLevel)
- Scopers fill out ~8+ fields by hand every time
- PDF handoff friction between scopers → writers → admin
- Duplicate entry when capturing customers for Dent Experts

---

# 🔵 Phase 1: Google Forms & Sheets Solution

> **Goal:** Validate the digital workflow using free tools before custom development

## What Gets Built

### 1. Google Form - Vehicle Scope Sheet
A comprehensive digital form that replaces paper scope sheets:

| Field | Type | Notes |
|-------|------|-------|
| RO Number | Short text | Repair Order |
| VIN Number | Short text | Vehicle Identification |
| Year | Dropdown (2015-2026) | |
| Make | Dropdown | Honda, Toyota, Ford, etc. |
| Model | Short text | |
| Vehicle Color | Dropdown | |
| Location | Dropdown | Your shop locations |
| Estimator | Dropdown | Staff names |
| Insurance Name | Dropdown | Progressive, State Farm, etc. |
| Claim Number | Short text | |
| Damage Areas | Checkboxes | Hood, Roof, Doors, Fenders, etc. |
| Damage Severity | Multiple choice | Light, Moderate, Heavy |
| Scope Notes | Paragraph | Detailed observations |
| Photos | File upload | Multiple damage photos |
| Scoper Name | Dropdown | Who filled this out |
| Date/Time | Auto-filled | Timestamp |

### 2. Google Sheet - Scope Dashboard
Auto-populated spreadsheet that serves as your central database:

| Feature | Description |
|---------|-------------|
| **Live Data** | Form responses auto-populate rows |
| **Search/Filter** | Find scopes by VIN, date, scoper, status |
| **Status Column** | Track: Pending → In Progress → Complete |
| **Conditional Formatting** | Color-code by status or priority |
| **Shareable Views** | Different team members see different columns |

### 3. PDF Generation (AppSheet or Docs Add-on)
- One-click PDF export of any scope record
- Professional formatting with your branding
- Easy attachment to Mitchell database

### 4. Basic Automation (Google Apps Script)
- Email notification when new scope is submitted
- Auto-assign RO numbers (if needed)
- Daily summary email to admin

---

## Phase 1 Deliverables

| Deliverable | Description |
|-------------|-------------|
| ✅ Google Form | Branded scope sheet form |
| ✅ Google Sheet | Dashboard with all responses |
| ✅ PDF Template | Professional export format |
| ✅ Email Notifications | Alerts on new submissions |
| ✅ Training Doc | How to use the system |
| ✅ iPad Setup Guide | Bookmarking form for easy access |

---

## Phase 1 Estimate

| Task | Hours | Cost @ $100/hr |
|------|-------|----------------|
| Requirements & Form Design | 2-3 hrs | $200-300 |
| Google Form Build | 3-4 hrs | $300-400 |
| Google Sheet Dashboard Setup | 3-4 hrs | $300-400 |
| Apps Script Automations | 4-6 hrs | $400-600 |
| PDF Template & Export | 2-3 hrs | $200-300 |
| Testing & Refinement | 2-3 hrs | $200-300 |
| Documentation & Training | 2 hrs | $200 |
| **PHASE 1 TOTAL** | **18-25 hrs** | **$1,800-2,500** |

### Timeline: 1-2 Weeks

---

## Phase 1 Benefits

| Benefit | Impact |
|---------|--------|
| 💰 **Low Cost** | ~$2,000 vs $10,000+ for custom app |
| ⚡ **Fast Deployment** | Live in 1-2 weeks |
| 📱 **Mobile Ready** | Works on any iPad/phone |
| 🔄 **Easy to Modify** | Add fields yourself anytime |
| ☁️ **Cloud Backup** | Data never lost |
| 👥 **Collaboration** | Multiple users simultaneously |
| ✅ **Validates Workflow** | Test before bigger investment |

---

# 🟢 Phase 2: Custom Webapp & Dashboard

> **Goal:** Branded, professional experience with enhanced features

## What Gets Built

### 1. Custom Web Application
Professional dashboard accessible from any device:

| Feature | Description |
|---------|-------------|
| **Branded Login** | Dent Experts logo, Google OAuth |
| **User Roles** | Scoper, Writer, Admin with different permissions |
| **Modern UI** | Clean, fast, iPad-optimized interface |
| **Offline Support** | Works without internet, syncs later |

### 2. Enhanced Scope Form
Superior data entry experience:

| Feature | Description |
|---------|-------------|
| **Smart Dropdowns** | Searchable, auto-complete fields |
| **Photo Gallery** | Drag & drop, preview, annotate |
| **Damage Diagram** | Interactive vehicle image to mark damage |
| **Auto-Save** | Never lose work in progress |
| **Validation** | Required fields, format checking |

### 3. Dashboard Features

| View | Description |
|------|-------------|
| **My Scopes** | Scoper sees their submitted work |
| **All Scopes** | Admin sees everything with filters |
| **Pending Review** | Writers see scopes awaiting estimates |
| **Analytics** | Scopes per day, by location, by scoper |
| **Search** | Find any scope instantly |

### 4. PDF Generation
- Professional branded PDF export
- Multiple templates (full scope, summary, customer copy)
- Batch export capability

### 5. Data Migration
- Import all Phase 1 Google Sheets data
- Maintain continuity and history

---

## Phase 2 Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js + React (responsive, fast) |
| Styling | Tailwind CSS or custom CSS |
| Backend | Node.js API or Next.js API routes |
| Database | PostgreSQL or Supabase |
| Auth | Google OAuth 2.0 |
| Hosting | Vercel (fast, reliable) |
| File Storage | AWS S3 or Cloudflare R2 |
| PDF | React-PDF or Puppeteer |

---

## Phase 2 Deliverables

| Deliverable | Description |
|-------------|-------------|
| ✅ Web Application | Fully functional dashboard |
| ✅ User Auth System | Google login, roles, permissions |
| ✅ Scope Form | Beautiful, efficient data entry |
| ✅ Dashboard Views | All scopes, filters, search |
| ✅ PDF Export | Branded professional documents |
| ✅ Mobile Optimization | Perfect iPad experience |
| ✅ Data Migration | All Phase 1 data imported |
| ✅ Hosting Setup | Live on your domain |
| ✅ Training Session | Team walkthrough |

---

## Phase 2 Estimate

| Task | Hours | Cost @ $100/hr |
|------|-------|----------------|
| UI/UX Design & Mockups | 12-16 hrs | $1,200-1,600 |
| Authentication System | 8-10 hrs | $800-1,000 |
| Database Schema & Setup | 6-8 hrs | $600-800 |
| Scope Form Development | 16-20 hrs | $1,600-2,000 |
| Dashboard & List Views | 12-16 hrs | $1,200-1,600 |
| PDF Generation | 8-10 hrs | $800-1,000 |
| Photo Upload & Storage | 6-8 hrs | $600-800 |
| Mobile Optimization | 8-10 hrs | $800-1,000 |
| Data Migration | 4-6 hrs | $400-600 |
| Testing & QA | 10-12 hrs | $1,000-1,200 |
| Deployment & DevOps | 4-6 hrs | $400-600 |
| Documentation & Training | 4-6 hrs | $400-600 |
| **PHASE 2 TOTAL** | **98-128 hrs** | **$9,800-12,800** |

### Timeline: 4-6 Weeks

---

## Phase 2 Benefits Over Phase 1

| Feature | Phase 1 (Forms) | Phase 2 (Custom) |
|---------|-----------------|------------------|
| Branding | Google branding | Your logo everywhere |
| User Experience | Basic form | Beautiful, fast UI |
| Offline Mode | ❌ No | ✅ Yes |
| User Roles | Manual sharing | Built-in permissions |
| Damage Diagram | ❌ No | ✅ Interactive |
| Photo Handling | Basic upload | Gallery, annotations |
| Analytics | Manual in Sheets | Built-in dashboard |
| Speed | Good | Excellent |
| Professional Image | Basic | Premium |

---

# 🟣 Phase 3: API Integrations

> **Goal:** Connect all systems for seamless data flow

## Integration 1: OrcaScan VIN Scanning

### What It Does
- Scoper scans VIN barcode with OrcaScan app
- Dashboard auto-fills 8 fields instantly:
  - VIN, Year, Make, Model, Color
  - RO Number, Location, Estimator

### How It Works
```
[OrcaScan App] → Webhook → [Your Dashboard] → [Pre-filled Form]
```

### Estimate
| Task | Hours | Cost |
|------|-------|------|
| OrcaScan API Research | 2-4 hrs | $200-400 |
| Webhook Endpoint | 4-6 hrs | $400-600 |
| VIN Decode Service | 4-6 hrs | $400-600 |
| Form Auto-population | 6-8 hrs | $600-800 |
| Testing | 4-6 hrs | $400-600 |
| **OrcaScan Total** | **20-30 hrs** | **$2,000-3,000** |

---

## Integration 2: Mitchell Connect

### What It Does
- Pull tomorrow's job queue directly into dashboard
- Push completed scope PDFs back to customer files

### How It Works
```
[Mitchell Connect] ←→ API ←→ [Your Dashboard]
```

### Notes
- ⚠️ Requires verification of Mitchell API availability
- May need RPA solution if no official API

### Estimate
| Task | Hours | Cost |
|------|-------|------|
| Mitchell API Research & Access | 6-10 hrs | $600-1,000 |
| Job Queue Import | 12-16 hrs | $1,200-1,600 |
| PDF Upload to Mitchell | 10-14 hrs | $1,000-1,400 |
| Sync & Error Handling | 6-8 hrs | $600-800 |
| Testing | 6-8 hrs | $600-800 |
| **Mitchell Total** | **40-56 hrs** | **$4,000-5,600** |

---

## Integration 3: GoHighLevel CRM

### What It Does
- "Capture Customer" button on any scope
- One-click export creates opportunity in GHL:
  - Customer Name, Claim #, VIN
  - Location, Scoper, Sales Rep
- Admin dashboard shows all captured leads

### How It Works
```
[Your Dashboard] → GHL API → [New Opportunity in GoHighLevel]
```

### Estimate
| Task | Hours | Cost |
|------|-------|------|
| GHL API Setup | 4-6 hrs | $400-600 |
| Customer Capture Flow | 8-10 hrs | $800-1,000 |
| Opportunity Creation | 6-8 hrs | $600-800 |
| Admin Pipeline View | 6-8 hrs | $600-800 |
| Testing | 4-6 hrs | $400-600 |
| **GoHighLevel Total** | **28-38 hrs** | **$2,800-3,800** |

---

## Phase 3 Summary

| Integration | Hours | Cost |
|-------------|-------|------|
| OrcaScan VIN Scanning | 20-30 hrs | $2,000-3,000 |
| Mitchell Connect | 40-56 hrs | $4,000-5,600 |
| GoHighLevel CRM | 28-38 hrs | $2,800-3,800 |
| **PHASE 3 TOTAL** | **88-124 hrs** | **$8,800-12,400** |

### Timeline: 4-6 Weeks (can be done incrementally)

---

# 📊 Complete Project Summary

## All Phases Overview

| Phase | Description | Hours | Cost | Timeline |
|-------|-------------|-------|------|----------|
| **Phase 1** | Google Forms & Sheets | 18-25 hrs | $1,800-2,500 | 1-2 weeks |
| **Phase 2** | Custom Webapp Dashboard | 98-128 hrs | $9,800-12,800 | 4-6 weeks |
| **Phase 3** | API Integrations | 88-124 hrs | $8,800-12,400 | 4-6 weeks |
| **TOTAL** | Complete Solution | **204-277 hrs** | **$20,400-27,700** |

---

## Recommended Approach

### ✅ Start with Phase 1
- **Immediately useful** - Scopers can use it tomorrow
- **Low risk** - $2,000 investment to validate workflow
- **Learn** - Discover edge cases before building custom

### ✅ Move to Phase 2 When...
- Team is comfortable with digital forms
- You've identified must-have features
- Ready to present professional image
- ~60-90 days after Phase 1 launch

### ✅ Add Phase 3 When...
- Phase 2 is stable and adopted
- Manual entry pain is quantified
- Clear ROI from automation
- Mitchell API access is confirmed

---

## Monthly Cost After Build

| Service | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Hosting | Free (Google) | ~$20/mo (Vercel) | ~$20/mo |
| Database | Free (Sheets) | ~$25/mo (Supabase) | ~$25/mo |
| File Storage | Free (Drive) | ~$5-20/mo (S3) | ~$5-20/mo |
| OrcaScan | N/A | N/A | ~$50/mo |
| **Monthly Total** | **$0** | **~$50/mo** | **~$100/mo** |

---

## Next Steps

1. ✅ **Review this estimate** - Agree on scope for Phase 1
2. 📋 **Share the current scope sheet** - So I can replicate all fields
3. 📍 **List all locations** - For dropdown options
4. 👥 **List scoper/estimator names** - For dropdown options
5. 🚀 **Begin Phase 1** - Google Forms & Sheets solution

---

*Estimate prepared by Geray Eremin | January 12, 2026*
