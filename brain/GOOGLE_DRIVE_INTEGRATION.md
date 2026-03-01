# Google Drive Integration — Dent Experts Scoper

## Overview

Photos and PDFs from every submitted scope are automatically uploaded to a structured Google Shared Drive via a Google Apps Script web app. Files land under:

```
Dent Experts – Product Development Drive (Shared Drive)
└── Dent Experts/
    └── [Customer Name] - [Claim/RO#] - [Year Make Model]/
        ├── COND - 00 - Section Divider.jpg
        ├── COND - 01 - Roof Damage.jpg
        ├── SCOPE - 00 - Section Divider.jpg
        ├── SCOPE - 01 - Hood Hail.jpg
        ├── UPD - 00 - Section Divider.jpg
        ├── UPD - 01 - Prior Dent.jpg
        ├── VOIL - 00 - Section Divider.jpg
        ├── VOIL - 01 - VIN Overview.jpg
        └── DentScope_[RO]_[LastName]_[Year]_[Make]_[Model]_[Date].pdf
```

---

## Architecture

### Apps Script Web App
- **File:** `brain/DriveUpload.gs`
- **Project:** Dent Experts (Google Apps Script)
- **Project ID:** `1ybGBhpGU5mEmEOXp3o-VQhg3iXZeHqG-XnowgLuln-D3fAe2CHZRkn1t`
- **Deployment ID:** `AKfycbzliw6vJpduhKK5EUPQ1uJUu37NdPCiYJ4xSI2pP1Em6Qr_pjNqFvhA9HW3y0rkVwFQyw`
- **Deploy settings:** Execute as: Me | Access: Anyone
- **Advanced Service required:** Drive API v3 (must be enabled in Services panel)

### Shared Drive
- **Name:** Dent Experts – Product Development Drive
- **Root Folder ID:** `0AP5KXgHm4n4gUk9PVA`
- **Brand subfolder:** `Dent Experts` (created automatically on first upload)

### Frontend Config (`config.json`)
```json
{
  "driveScriptUrl": "https://script.google.com/macros/s/AKfycbz.../exec"
}
```
Exposed in the app as `CONFIG.driveScriptUrl`.

---

## File Naming Convention

### Photos
Format: `{CAT} - {NN} - {Label}.jpg`

| Part | Description |
|------|-------------|
| `CAT` | Category abbreviation: `VOIL`, `COND`, `UPD`, `SCOPE` |
| `NN` | `00` for section separator, `01`/`02`... per photo within the category |
| `Label` | Short label (text after `—` in full label, or `Section Divider`) |

Examples:
- `VOIL - 00 - Section Divider.jpg` (branded separator card)
- `VOIL - 01 - VIN Overview.jpg`
- `COND - 01 - Roof Damage.jpg`

Each category resets its counter to `01` independently — VOIL has its own 01, COND has its own 01, etc.

### PDF
Format: `DentScope_{RO}_{LastName}_{Year}_{Make}_{Model}_{YYYY-MM-DD}.pdf`

Example: `DentScope_DE-260227-001_Smith_2023_Ford_F-150_2026-02-27.pdf`

---

## Category Section Separators

Generated client-side using HTML Canvas (`generateCategorySeparator()` in `index.html`).

Each separator is a 1200×800px branded JPEG image:
- Dark background (`#0D1117`) with left accent bar in category color
- Category name auto-sized to fit canvas (font reduces from 160px if text overflows)
- Underline width is exact (`ctx.measureText()`)
- Accent colors: VOIL `#1A6CFF` | COND `#F59E0B` | UPD `#EF4444` | SCOPE `#10B981`
- Subtitle text (e.g. "Vehicle Overview Image List")
- "DENT EXPERTS" header strip + "dentexperts.com" footer strip

The `getPhotosWithSeparators()` function builds the final ordered array:
```
[VOIL separator, VOIL photos..., COND separator, COND photos..., ...]
```

---

## Apps Script — DriveUpload.gs

### Folder resolution
```
ROOT_FOLDER_ID (Shared Drive root)
  → getOrCreateSubFolder(root, brandFolder)   // "Dent Experts"
    → getOrCreateSubFolder(brand, folderName) // "John Doe - CLM-001 - 2023 Ford F-150"
```

Uses `CacheService` (6-hour TTL) + `LockService` to prevent race conditions during parallel batch uploads. Cache key includes `parentId + ':' + name` to avoid collisions across different parent folders.

### Drive API v3 (Advanced Service)
All file/folder operations use `Drive.Files.create()` and `Drive.Files.list()` with:
- `supportsAllDrives: true`
- `includeItemsFromAllDrives: true`
- `corpora: 'drive'` + `driveId: ROOT_FOLDER_ID`

This is required because `DriveApp` (the built-in service) does not support Shared Drive roots. The Drive API Advanced Service must be explicitly enabled in the Apps Script editor under Services.

### Payload accepted by `doPost`
```json
{
  "action": "uploadPhoto",
  "brandFolder": "Dent Experts",
  "folderName": "John Doe - CLM-001 - 2023 Ford F-150",
  "fileName": "VOIL - 01 - VIN Overview.jpg",
  "base64Data": "...",
  "mimeType": "image/jpeg"
}
```
Also accepts `mimeType: "application/pdf"` for the PDF file.

All uploaded files are made public (reader, anyone) via `Drive.Permissions.create()`.

---

## Frontend — `uploadToGoogleDrive()` in `index.html`

**Signature:**
```javascript
async function uploadToGoogleDrive(
  insuredName, claimNumber, roNumber, year, make, model,
  photos,        // from getPhotosWithSeparators() — includes separator cards
  pdfBase64,     // optional — PDF generated silently during submit
  pdfFileName    // optional
)
```

**Batching:** Uploads in parallel batches of 5 (`BATCH_SIZE = 5`). Gives ~5× speed over sequential (important for 150+ photo jobs).

**CORS:** Uses `mode: 'no-cors'` — Apps Script redirects strip CORS headers. Requests still reach Google correctly; we just can't read the response body.

**Status display:** Updates `#scanBoxText` element with `DRIVE N/N` during upload.

---

## Submit Flow Integration

The Drive upload is the last step before `resetForm()`, so `selectedPhotos` is still intact for PDF generation:

```
uploadToAirtable()           ← selectedPhotos full
getPhotosWithSeparators()    ← captures drivePhotos (separators + photos)
clearDraft()                 ← clears localStorage only, NOT selectedPhotos
uploadAllPhotosToGHL()       ← selectedPhotos still full
submitToGHL()
[Drive block]:
  buildCoverPage() + addPhotoPages()  ← selectedPhotos still full → PDF
  uploadToGoogleDrive(drivePhotos, pdfBase64, pdfFileName)
resetForm()                  ← selectedPhotos = [] (cleared here)
```

Drive upload is wrapped in `try/catch` and is non-blocking — a Drive failure does not abort the submission.

---

## Deploying Updates

1. Edit `brain/DriveUpload.gs` locally
2. Open [Apps Script editor](https://script.google.com/home/projects/1ybGBhpGU5mEmEOXp3o-VQhg3iXZeHqG-XnowgLuln-D3fAe2CHZRkn1t/edit)
3. Paste updated code (or use Monaco `models[0].setValue(newCode)` via browser console)
4. `Cmd+S` to save
5. Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy
6. The web app URL stays the same — no config update needed

**IMPORTANT:** After adding Drive API to a new script project, always verify it's listed under Services in the left panel before deploying. Running a test function that calls `Drive.Files.list()` will throw `Drive is not defined` if it wasn't properly enabled.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Drive is not defined` | Drive API Advanced Service not enabled | Add Drive API v3 via Services panel in Apps Script editor |
| Files land in root, not "Dent Experts" subfolder | Old deployment (pre-v10) still active | Redeploy → New version |
| Folder named "Unknown" in Drive search | Drive indexing delay | Wait ~30s and refresh; not a code bug |
| `0 uploaded, N failed` | Apps Script quota exceeded or auth expired | Check execution log in Apps Script editor |
| `DriveApp.getFolderById()` fails silently | DriveApp doesn't support Shared Drive root IDs | Always use Drive API v3 for Shared Drive operations |
| 400 error on contract send | Missing `name` field in GHL proposals payload | Fixed in `sendGHLTemplate()` — passes document name |

---

## Version History

| Script Version | Date | Change |
|---------------|------|--------|
| v1–v5 | Feb 26 | Initial DriveApp attempts; various auth issues |
| v6 | Feb 26 | Switched to Drive API v3 Advanced Service |
| v7–v8 | Feb 26 | Drive API enabled; basic Shared Drive uploads working |
| v9 | Feb 26 | First working end-to-end upload to Shared Drive |
| v10 | Feb 26 | Added `brandFolder` ("Dent Experts") nesting; per-category photo numbering; PDF upload; fixed cache key to include parentId |
