# Dent Experts PDR Scoper

A Progressive Web App for automotive Paintless Dent Repair (PDR) damage assessments. Technicians document vehicle damage, capture photos, and submit assessments to Airtable.

## Quick Start

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Tech Stack

- **Frontend**: Vanilla HTML5/JS/CSS (single-page app in `index.html`)
- **Libraries**: jsPDF (PDF generation), JSZip (photo compression)
- **Backend**: Airtable (REST API), tmpfiles.org (temporary file hosting)
- **PWA**: Service worker for offline support

## Project Structure

```
index.html          # Main application (~8,400 lines)
config.js           # API credentials (gitignored)
config.json         # Configuration
manifest.json       # PWA manifest
service-worker.js   # Offline support
version.json        # Version tracking

brain/              # Documentation
  PROJECT_STATUS.md         # Comprehensive project status
  AIRTABLE_API_GUIDE.md     # Airtable API reference
  GHL_DOCUMENTS_INTEGRATION.md  # GHL integration guide
  EMAIL_WARMUP_SYSTEM.md    # Email warmup docs

warmup/             # Email warmup system (Python)
  daily_warmup.py           # Main warmup script
  warmup_ctl.sh             # Control script
  warmup_config.json        # Configuration
```

## Key Features

1. **Vehicle Info**: RO#, VIN, Year/Make/Model, insurance details
2. **Panel Damage**: 16 panels with dent count, oversize, coin size
3. **Photos**: Camera capture, compression (<200KB), labeled
4. **PDF Reports**: Auto-generated with photo pages (2x2 grid)
5. **Airtable**: Auto-field creation, batch uploads, attachments
6. **GHL Integration**: Contact/opportunity sync, contract workflows

## Configuration

`config.json` contains API keys (never commit):
- `airtable.apiKey` - Airtable personal access token
- `airtable.baseId` - Target Airtable base
- GHL credentials for CRM integration

## Common Tasks

### Update version
1. Edit `version.json`
2. Update cache version in `service-worker.js`

### Add new panel
Search for panel arrays in `index.html` and add to all locations

### Modify Airtable fields
Fields auto-create on first upload if token has `schema.bases:write` scope

## Troubleshooting

- **UNKNOWN_FIELD_NAME**: Check token has schema scopes
- **Photos not uploading**: Check console, verify tmpfiles.org accessible
- **PDF missing photos**: Check selectedPhotos array in console

## Important Notes

- All app logic is in `index.html` (no build process)
- Photos compressed to JPEG 70% quality, max 1920px
- tmpfiles.org URLs expire in 1 hour (Airtable downloads immediately)
- GHL Documents API is IAM-blocked; use workflow enrollment instead
