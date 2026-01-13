# Dent Experts - Scoping & Workflow Automation Project

## Executive Summary

This document outlines a proposed software solution for **Dent Experts**, an auto body/dent repair company that handles catastrophe claims through Progressive Insurance. The goal is to streamline their scoping workflow, reduce manual data entry, and create a system that bridges their current tools (Mitchell Connect, OrcaScan, and GoHighLevel CRM).

---

## Current Workflow Analysis

### Systems Currently in Use

| System | Purpose |
|--------|---------|
| **Mitchell Connect** | Primary database for Progressive catastrophe claims. Contains customer info, jobs, and estimates. |
| **OrcaScan** | VIN barcode scanning app with automation capabilities |
| **GoHighLevel** | CRM for managing leads and customers when Dent Experts captures business |
| **Manual Scope Sheets** | Paper/PDF form filled out by scopers during vehicle inspection |

### Current Pain Points

1. **Nightly batch processing** - Hundreds of jobs come in, with a subset assigned for the next day
2. **Manual data entry** - Scopers must manually fill ~8 fields on scope sheets
3. **PDF handoff friction** - Scope sheets need to be saved and reattached to Mitchell database by writers
4. **Duplicate data entry** - When capturing business for Dent Experts (not just Progressive), the same info must be re-entered into GoHighLevel
5. **No centralized dashboard** - Difficult to track scope sheet status and history

---

## Proposed Solution: Phased Development

### Phase 1: MVP (Minimum Viable Product)

**Goal:** Create a simple iPad-friendly dashboard for scopers to fill out electronic scope sheets

#### Features:
- [ ] **Google Authentication** - Secure login for scopers
- [ ] **Dashboard Home** - View all completed scope sheets
- [ ] **"Create New Scope" Button** - Opens empty scope form
- [ ] **Digital Scope Form** - All fields from current paper form, with:
  - Checkboxes and dropdowns for quick input
  - Required fields validation
  - Photo upload capability
- [ ] **Save & Download PDF** - Generate professional PDF of completed scope
- [ ] **Scope Records** - Searchable history of all scopes with car details

#### Technical Stack Recommendation:
- **Frontend:** React/Next.js (iPad-optimized responsive design)
- **Backend:** Node.js or Python
- **Database:** PostgreSQL or Firebase
- **Auth:** Google OAuth 2.0
- **PDF Generation:** PDF-lib or Puppeteer
- **Hosting:** Vercel, AWS, or GCP

---

### Phase 2: OrcaScan VIN Integration

**Goal:** Auto-populate scope form fields by scanning vehicle VIN barcode

#### Features:
- [ ] **OrcaScan API Integration** - Each scoper logs into OrcaScan
- [ ] **VIN Decode** - Scan VIN → auto-fill 8 fields:
  1. VIN Number
  2. Year
  3. Make
  4. Model
  5. RO (Repair Order) Number
  6. Location
  7. Estimator Name
  8. Vehicle Color/Other details
- [ ] **Pre-generated Form** - Form opens with fields pre-filled, scoper adds remaining details

#### Integration Notes:
- OrcaScan has webhooks/Zapier integrations
- May require custom API middleware to connect OrcaScan → our dashboard

---

### Phase 3: Mitchell Connect Integration

**Goal:** Pull job queue directly into dashboard; push completed scopes back to Mitchell

#### Features:
- [ ] **Job Import** - "Sync Jobs" button pulls tomorrow's assigned jobs from Mitchell
- [ ] **Job Cards** - View all pending jobs in dashboard
- [ ] **One-Click Scope Creation** - Create scope pre-populated with Mitchell data
- [ ] **Auto-Upload** - Completed scope PDFs automatically attach to customer file in Mitchell

#### Integration Notes:
- Mitchell Connect may have API access (requires verification with them)
- May need RPA (Robotic Process Automation) as fallback if no API

---

### Phase 4: GoHighLevel CRM Integration

**Goal:** When Dent Experts captures a customer, push scope data to GoHighLevel as a new opportunity

#### Features:
- [ ] **"Capture Customer" Button** - Flags scope as a Dent Experts customer
- [ ] **One-Click Export to GHL** - Creates opportunity in GoHighLevel with:
  - Customer Name
  - Claim Number
  - VIN Number
  - Location
  - Scoper Name
  - Sales Rep Assignment
- [ ] **Admin Dashboard** - View all captured opportunities, status tracking

#### Integration Notes:
- GoHighLevel has robust API
- Can use webhooks for real-time sync

---

## Data Fields for Scope Sheet (Based on Conversation)

| Field | Input Type | Auto-filled by OrcaScan? |
|-------|-----------|-------------------------|
| RO Number | Text | ✅ Yes |
| VIN Number | Text (Scanned) | ✅ Yes |
| Year | Dropdown/Text | ✅ Yes |
| Make | Dropdown | ✅ Yes |
| Model | Text | ✅ Yes |
| Location | Dropdown | ✅ Yes |
| Estimator | Dropdown | ✅ Yes |
| Vehicle Color | Dropdown | ✅ Yes |
| Insurance Name | Dropdown | ❌ Manual |
| Claim Number | Text | ❌ Manual |
| Damage Areas | Checkboxes | ❌ Manual |
| Damage Severity | Dropdown | ❌ Manual |
| Photos | Upload | ❌ Manual |
| Notes | Text Area | ❌ Manual |
| Scoper Signature | Signature Pad | ❌ Manual |

---

## Project Estimate

### Phase 1: MVP
| Component | Estimated Hours | Cost @ $100/hr |
|-----------|----------------|----------------|
| UI/UX Design | 12-16 hrs | $1,200-1,600 |
| Authentication System | 8-12 hrs | $800-1,200 |
| Dashboard Development | 16-24 hrs | $1,600-2,400 |
| Scope Form Builder | 20-30 hrs | $2,000-3,000 |
| PDF Generation | 8-12 hrs | $800-1,200 |
| Database & Backend | 16-20 hrs | $1,600-2,000 |
| Testing & Refinement | 12-16 hrs | $1,200-1,600 |
| **Phase 1 Total** | **92-130 hrs** | **$9,200-13,000** |

### Phase 2: OrcaScan Integration
| Component | Estimated Hours | Cost @ $100/hr |
|-----------|----------------|----------------|
| OrcaScan API Research | 4-6 hrs | $400-600 |
| VIN Decode Integration | 12-16 hrs | $1,200-1,600 |
| Form Auto-population | 8-12 hrs | $800-1,200 |
| Testing & Refinement | 8-10 hrs | $800-1,000 |
| **Phase 2 Total** | **32-44 hrs** | **$3,200-4,400** |

### Phase 3: Mitchell Connect Integration
| Component | Estimated Hours | Cost @ $100/hr |
|-----------|----------------|----------------|
| API Access & Research | 8-12 hrs | $800-1,200 |
| Job Import System | 16-24 hrs | $1,600-2,400 |
| PDF Upload System | 12-16 hrs | $1,200-1,600 |
| Testing & Refinement | 8-12 hrs | $800-1,200 |
| **Phase 3 Total** | **44-64 hrs** | **$4,400-6,400** |

### Phase 4: GoHighLevel Integration
| Component | Estimated Hours | Cost @ $100/hr |
|-----------|----------------|----------------|
| GHL API Integration | 12-16 hrs | $1,200-1,600 |
| Opportunity Creation | 8-12 hrs | $800-1,200 |
| Admin Dashboard | 12-16 hrs | $1,200-1,600 |
| Testing & Refinement | 8-10 hrs | $800-1,000 |
| **Phase 4 Total** | **40-54 hrs** | **$4,000-5,400** |

---

## Total Project Summary

| Phase | Hours Range | Cost Range |
|-------|------------|------------|
| Phase 1: MVP | 92-130 hrs | $9,200-13,000 |
| Phase 2: OrcaScan | 32-44 hrs | $3,200-4,400 |
| Phase 3: Mitchell | 44-64 hrs | $4,400-6,400 |
| Phase 4: GoHighLevel | 40-54 hrs | $4,000-5,400 |
| **TOTAL** | **208-292 hrs** | **$20,800-29,200** |

---

## Recommended Approach

### Start with MVP (Phase 1)
- Get scopers using the digital form on iPads immediately
- Validate the workflow before adding complexity
- Estimated delivery: **3-4 weeks**

### Add OrcaScan (Phase 2) when:
- MVP is stable and adopted
- Team is comfortable with digital workflow
- Estimated delivery: **1-2 weeks** (after Phase 1)

### Add Mitchell & GHL (Phases 3-4) when:
- Core system is proven
- Clear ROI from reduced manual entry
- Estimated delivery: **2-3 weeks each**

---

## Key Roles Mentioned

| Role | Responsibility |
|------|----------------|
| **Scoper** | Scans VIN, fills out scope sheet, takes photos |
| **Writer/Estimator** | Attaches scope sheet to Mitchell, writes estimate |
| **Admin** | Manages GoHighLevel opportunities, customer follow-up |
| **Sales Rep** | Works captured leads in GoHighLevel |

---

## Next Steps

1. **Review this document** - Confirm scope and priorities
2. **Share existing scope sheet** - To design the digital form accurately
3. **Confirm OrcaScan account** - To research integration capabilities
4. **Discuss Mitchell API access** - Check if API is available
5. **Begin Phase 1 development** - After approval

---

*Document generated from audio transcript on January 12, 2026*
