# GoHighLevel (GHL) Integration Documentation

This document describes how the Dent Experts app integrates with GoHighLevel CRM for contact and opportunity management.

## Overview

When a user submits the repair scope form, the app:
1. Creates or updates a Contact in GHL
2. Creates an Opportunity linked to that contact

## Configuration

All GHL settings are in `index.html` in the `GHL_CONFIG` object:

```javascript
const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
    pipelines: {
        production: {
            id: 'JptjUQHom2aW3y3MGc2g',
            startStage: 'abf22448-51ea-474f-bac1-e4edd981f8e3'
        },
        expert_path: {
            id: 'zLqAUFVD2Bfub4EP54lL',
            startStage: 'f62deed6-d81c-4e31-98aa-af54d5646596'
        }
    },
    customFields: {
        vin: 'qKQntVqCwKdmmPaHLnr6',
        year_make_model: 'IEQTtksAvzxZMTR2EeHJ',
        insurance_company: 'wcjFn8HG8fhssQWn0TFM',
        claim_number: 'Y8BZnpg3SgTCaF6eNcwt',
        technician_name: 'XOdGZsGCmyjFmZO1eHsw',
        ro_number: 'cHqj3TzHR1qipS5zXv4L'
    }
};
```

## Pipelines

| Pipeline | ID | First Stage ID |
|----------|-----|----------------|
| Repair Process Tracker | `JptjUQHom2aW3y3MGc2g` | `abf22448-51ea-474f-bac1-e4edd981f8e3` |
| The Expert Path | `zLqAUFVD2Bfub4EP54lL` | `f62deed6-d81c-4e31-98aa-af54d5646596` |

## Custom Fields

These are the custom field IDs for the GHL location `AAzBZNLXS4rdwhG76MLi`:

| Field | GHL ID | Used On |
|-------|--------|---------|
| VIN | `qKQntVqCwKdmmPaHLnr6` | Contact + Opportunity |
| Year/Make/Model | `IEQTtksAvzxZMTR2EeHJ` | Contact + Opportunity |
| Insurance Company | `wcjFn8HG8fhssQWn0TFM` | Contact + Opportunity |
| Claim Number | `Y8BZnpg3SgTCaF6eNcwt` | Contact + Opportunity |
| Technician/Estimator | `XOdGZsGCmyjFmZO1eHsw` | Contact + Opportunity |
| RO Number | `cHqj3TzHR1qipS5zXv4L` | Contact + Opportunity |

## API Limitations & Gotchas

> [!CAUTION]
> **The GHL Opportunities API does NOT accept a `notes` field!**
> Sending `notes` in the opportunity payload will cause a 422 error:
> `"property notes should not exist"`

### Valid Opportunity Fields
- `pipelineId` (required)
- `pipelineStageId` (required)
- `locationId` (required)
- `name` (required)
- `contactId` (required)
- `status` (optional, default: 'open')
- `customFields` (optional, array of `{id, value}`)
- `monetaryValue` (optional)

### Custom Fields Format
Custom fields must be sent as an array of objects:
```javascript
customFields: [
    { id: 'FIELD_ID_HERE', value: 'field value' },
    { id: 'ANOTHER_FIELD_ID', value: 'another value' }
]
```

## Testing the Integration

A test page is available at `/ghl_test.html` that allows you to:
1. Create a test contact
2. Create a test opportunity
3. List all custom fields in the GHL location

## Troubleshooting

### Opportunity not appearing in GHL
1. Check browser console for errors
2. Look for "Opportunity Create Response:" log
3. Verify the correct pipeline is selected in the form
4. Ensure all required fields (email or phone) are filled

### Custom fields not populating
1. Verify the field IDs match what's in GHL Settings > Custom Fields
2. Note: GHL has separate custom fields for Contacts vs Opportunities
3. The field IDs above work for both in this location

### Changes not taking effect
1. The app uses a service worker for caching
2. Bump `APP_VERSION` in `service-worker.js` when making changes
3. Users must hard refresh (Cmd+Shift+R) to get updates

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2026.01.22.04 | 2026-01-22 | Fixed: Removed invalid `notes` field from opportunity creation |
| 2026.01.22.03 | 2026-01-22 | Added detailed API logging for debugging |
| 2026.01.22.02 | 2026-01-22 | Updated custom field IDs, improved contact upsert |
