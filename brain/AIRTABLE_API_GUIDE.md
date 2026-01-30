# Airtable API Complete Guide

> **Last Updated:** January 2026  
> **Official Docs:** https://airtable.com/developers/web/api

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Endpoints](#base-url--endpoints)
4. [Creating Records](#creating-records)
5. [Uploading Attachments (Files/Images)](#uploading-attachments-filesimages)
6. [Google Drive Integration (for Large Files)](#google-drive-integration-for-large-files)
7. [Updating Records](#updating-records)
8. [Field Management (Schema API)](#field-management-schema-api)
9. [Rate Limits](#rate-limits)
10. [Error Handling](#error-handling)
11. [Code Examples](#code-examples)
12. [Best Practices](#best-practices)

---

## Overview

Airtable's API is a **REST API** that uses:
- **JSON** for encoding objects
- **HTTP status codes** for operation outcomes
- **Token-based authentication** (Bearer token in headers)

**Official Client Libraries:**
- JavaScript: [airtable.js](https://github.com/Airtable/airtable.js) (Node.js + Browser)
- Python: [pyairtable](https://github.com/gtalarico/pyairtable)
- .NET: [airtable.net](https://github.com/ngocnicholas/airtable.net)
- Ruby: [airrecord](https://github.com/sirupsen/airrecord)

---

## Authentication

### Token Types

1. **Personal Access Tokens (PAT)** - For personal development, internal tools
   - Create at: https://airtable.com/create/tokens
   - Best for: Building integrations for yourself, your client, or company
   - **Do NOT share with third-party services**

2. **OAuth Access Tokens** - For third-party integrations
   - Register at: https://airtable.com/create/oauth
   - Best for: Apps where other users grant access to their Airtable data

### How to Authenticate

All API requests must:
1. Be made over **HTTPS**
2. Include the token in the `Authorization` header

```bash
curl https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Required Scopes

| Action | Required Scope |
|--------|---------------|
| Read records | `data.records:read` |
| Write/Create records | `data.records:write` |
| Delete records | `data.records:write` |
| Upload attachments | `data.records:write` |

### Token Setup Checklist
1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Give it a descriptive name
4. Select scopes: `data.records:read` and `data.records:write`
5. Add your base(s) as resources
6. Copy and save the token (shown only once!)

---

## Base URL & Endpoints

### Main API Base URL
```
https://api.airtable.com/v0
```

### Content API Base URL (for attachments)
```
https://content.airtable.com/v0
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{baseId}/{tableIdOrName}` | GET | List records |
| `/{baseId}/{tableIdOrName}` | POST | Create records |
| `/{baseId}/{tableIdOrName}/{recordId}` | GET | Get single record |
| `/{baseId}/{tableIdOrName}/{recordId}` | PATCH | Update record |
| `/{baseId}/{tableIdOrName}/{recordId}` | DELETE | Delete record |

### Finding Your Base ID and Table ID
1. Open your base in Airtable
2. Click "Help" → "API documentation"
3. Or look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYYYYYYYYYY`
   - Base ID starts with `app`
   - Table ID starts with `tbl`

---

## Creating Records

### Endpoint
```
POST https://api.airtable.com/v0/{baseId}/{tableIdOrName}
```

### Request Body
```json
{
  "records": [
    {
      "fields": {
        "Field Name": "value",
        "Another Field": "another value"
      }
    }
  ]
}
```

### Create Single Record
```json
{
  "fields": {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Status": "Active"
  }
}
```

### Create Multiple Records (up to 10 per request)
```json
{
  "records": [
    {
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com"
      }
    },
    {
      "fields": {
        "Name": "Jane Smith",
        "Email": "jane@example.com"
      }
    }
  ]
}
```

### Optional Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `typecast` | boolean | Auto-convert string values to proper types |
| `returnFieldsByFieldId` | boolean | Return fields keyed by ID instead of name |

### Response
```json
{
  "records": [
    {
      "id": "rec560UJdUtocSouk",
      "createdTime": "2022-09-12T21:03:48.000Z",
      "fields": {
        "Name": "John Doe",
        "Email": "john@example.com"
      }
    }
  ]
}
```

---

## Uploading Attachments (Files/Images)

### ⚠️ TWO METHODS for Attachments

### Method 1: Direct Upload (up to 5MB)

**Endpoint:**
```
POST https://content.airtable.com/v0/{baseId}/{recordId}/{attachmentFieldIdOrName}/uploadAttachment
```

**⚠️ IMPORTANT:** The record must exist FIRST before uploading attachments!

**Request Body:**
```json
{
  "contentType": "image/jpeg",
  "file": "BASE64_ENCODED_FILE_STRING",
  "filename": "photo.jpg"
}
```

**Steps:**
1. Create the record first (without attachments)
2. Get the record ID from the response
3. Upload the attachment to that record

**Request Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `contentType` | string | MIME type (e.g., "image/jpeg", "application/pdf") |
| `file` | string | Base64 encoded file content |
| `filename` | string | Name for the file (e.g., "photo.jpg") |

**Response:**
```json
{
  "id": "recXXXXXXXXXXXXXX",
  "createdTime": "2022-02-01T21:25:05.663Z",
  "fields": {
    "fld00000000000000": [
      {
        "id": "att00000000000000",
        "filename": "photo.jpg",
        "size": 12345,
        "type": "image/jpeg",
        "url": "https://v5.airtableusercontent.com/..."
      }
    ]
  }
}
```

### Method 2: URL-based Attachments (for files > 5MB or publicly accessible URLs)

When creating or updating a record, include the attachment URL:

```json
{
  "fields": {
    "Name": "Project Photo",
    "Attachments": [
      {
        "url": "https://example.com/image.jpg",
        "filename": "image.jpg"
      }
    ]
  }
}
```

**⚠️ The URL must be publicly accessible!** Airtable will download and store the file.

---

## Google Drive Integration (for Large Files)

### Why Use Google Drive + Airtable?

| Method | File Size Limit | Best For |
|--------|----------------|----------|
| Direct Upload (Base64) | 5 MB | Small images, PDFs, documents |
| URL-based Attachments | 1 GB | Large files, video, zip archives |
| **Google Drive + Airtable** | **1 GB (Airtable limit)** | **Large zip files, bulk photo packages** |

**Perfect for:** Uploading zip files containing multiple car photos, large video files, or any content over 5MB.

### How It Works

1. **Upload file to Google Drive** (using Google Drive API)
2. **Get a shareable/download link** from Google Drive
3. **Create/Update Airtable record** with the Google Drive URL as attachment
4. **Airtable downloads and hosts** the file (up to 1GB per file)

### Setting Up Google Drive API

#### Step 1: Enable Google Drive API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Drive API"
4. Create credentials (API Key or OAuth 2.0)

#### Step 2: Get Service Account (For Backend/Server)
1. In Google Cloud Console → IAM & Admin → Service Accounts
2. Create service account
3. Download JSON key file
4. Share your Google Drive folder with the service account email

#### Step 3: Get OAuth Credentials (For User Upload)
1. In Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs
4. Save Client ID and Client Secret

### File Size Limits Summary

- **Direct Base64 Upload:** 5 MB max
- **URL-based (including Google Drive):** 1 GB max per file
- **Airtable will download** the file from the URL and host it
- **Google Drive files:** Can be any size, but Airtable will only accept up to 1GB

### Converting Google Drive Links

Google Drive share links need to be converted to **direct download** format:

```javascript
// ❌ WRONG - This is a "view" link
"https://drive.google.com/file/d/1ABC123XYZ/view?usp=sharing"

// ✅ CORRECT - This is a "download" link
"https://drive.google.com/uc?export=download&id=1ABC123XYZ"

// Function to convert
function convertToDownloadLink(shareLinkOrFileId) {
  // Extract file ID from share link
  const fileIdMatch = shareLinkOrFileId.match(/\/d\/([^\/]+)/);
  const fileId = fileIdMatch ? fileIdMatch[1] : shareLinkOrFileId;
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
```

### Complete Workflow Example

```javascript
// Full workflow: Upload to Drive → Create Airtable Record
const { google } = require('googleapis');

// 1. Setup Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// 2. Upload file to Google Drive
async function uploadToGoogleDrive(fileBuffer, filename, mimeType) {
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: ['YOUR_FOLDER_ID'], // Optional: specify folder
    },
    media: {
      mimeType: mimeType,
      body: fileBuffer,
    },
    fields: 'id, webViewLink',
  });
  
  const fileId = response.data.id;
  
  // Make file publicly accessible (or share with specific users)
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  
  return fileId;
}

// 3. Create Airtable record with Google Drive link
async function createRecordWithDriveFile(carData, zipBuffer) {
  // Upload to Google Drive
  const filename = `car_photos_${carData.carId}.zip`;
  const fileId = await uploadToGoogleDrive(zipBuffer, filename, 'application/zip');
  
  // Convert to download link
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  // Create Airtable record
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Car ID': carData.carId,
          'Customer Name': carData.customerName,
          'Status': 'Photos Uploaded',
          'Photo Package': [
            {
              url: downloadUrl,
              filename: filename,
            }
          ],
        }
      }),
    }
  );
  
  return await response.json();
}

// Usage
const result = await createRecordWithDriveFile(
  { carId: 'ABC123', customerName: 'John Doe' },
  zipFileBuffer
);
```

### Google Apps Script (Simplified)

If you're using Google Apps Script, it's even easier since Drive integration is built-in:

```javascript
function uploadCarPhotosToAirtableViaDrive(carData, zipBlob) {
  const AIRTABLE_TOKEN = 'your_token_here';
  const BASE_ID = 'appXXXXXXXXXXXXXX';
  const TABLE_NAME = 'Your Table Name';
  const DRIVE_FOLDER_ID = 'your_folder_id'; // Optional
  
  // 1. Upload to Google Drive
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const filename = `car_photos_${carData.carId}.zip`;
  const file = folder.createFile(zipBlob.setName(filename));
  
  // 2. Make publicly accessible (or set specific sharing)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // 3. Get download URL
  const fileId = file.getId();
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  // 4. Create Airtable record
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      fields: {
        'Car ID': carData.carId,
        'Customer Name': carData.customerName,
        'Photo Package': [
          {
            url: downloadUrl,
            filename: filename,
          }
        ],
      }
    }),
    muteHttpExceptions: true,
  };
  
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}
```

### Browser-Based Upload (Client-Side)

For uploading from a browser (requires OAuth):

```javascript
// Using Google Picker API + Google Drive API
async function uploadFromBrowser(zipFile, carData) {
  // 1. Use Google Picker to let user select destination or upload
  const pickerApiLoaded = await loadGooglePicker();
  
  // 2. Upload file to Drive (requires OAuth token)
  const metadata = {
    name: `car_photos_${carData.carId}.zip`,
    mimeType: 'application/zip',
  };
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', zipFile);
  
  const uploadResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleOAuthToken}`,
      },
      body: form,
    }
  );
  
  const driveFile = await uploadResponse.json();
  
  // 3. Set file permissions
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${driveFile.id}/permissions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleOAuthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  );
  
  // 4. Create Airtable record with download link
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFile.id}`;
  
  await createAirtableRecord({
    'Car ID': carData.carId,
    'Photo Package': [{ url: downloadUrl, filename: driveFile.name }],
  });
}
```

### Important Notes & Tips

#### Permission Settings
- **Public (Anyone with link):** Best for easy sharing, anyone can download
- **Restricted (Specific people):** More secure but Airtable may have trouble accessing
- **Recommendation:** Use "Anyone with link" for Airtable attachments

#### Alternative: Keep Drive Link as Text Field
If you don't need Airtable to host the file, just store the Google Drive link as a URL field:

```javascript
{
  "fields": {
    "Car ID": "ABC123",
    "Photo Package Link": "https://drive.google.com/file/d/FILE_ID/view"
  }
}
```

**Pros:**
- No 1GB limit (can be any size)
- Faster record creation
- File stays in Google Drive only

**Cons:**
- Users need Google Drive access
- Can't preview in Airtable
- Link could break if file is moved/deleted

#### Webhook Integration
Consider setting up a webhook in your form that:
1. User uploads file → Temporarily stores in your server
2. Server uploads to Google Drive
3. Server creates Airtable record with Drive link
4. Server deletes temporary file

#### Cost Considerations
- **Google Drive:** 15GB free per Google account
- **Airtable:** Attachment storage counts toward base limits (varies by plan)
- **Recommendation:** For lots of large files, store in Drive and use URL field

### Troubleshooting

**"ATTACHMENTS_FAILED_UPLOADING" Error**
- File is too large (>1GB)
- URL is not publicly accessible
- Google Drive link is not in download format
- Too many redirects (max 3)

**File Downloads as HTML Instead of Zip**
- Google Drive link requires authentication
- Use proper download URL format: `https://drive.google.com/uc?export=download&id=FILE_ID`

**Attachment Shows as Broken in Airtable**
- File was deleted from Google Drive
- Drive permissions changed
- Download link expired (if using temporary links)

---

## Updating Records

### Update Single Record
```
PATCH https://api.airtable.com/v0/{baseId}/{tableIdOrName}/{recordId}
```

```json
{
  "fields": {
    "Status": "Completed"
  }
}
```

### Update Multiple Records
```
PATCH https://api.airtable.com/v0/{baseId}/{tableIdOrName}
```

```json
{
  "records": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "fields": {
        "Status": "Completed"
      }
    },
    {
      "id": "recYYYYYYYYYYYYYY",
      "fields": {
        "Status": "In Progress"
      }
    }
  ]
}
```

---

## Field Management (Schema API)

The Schema API allows you to read and modify table structure programmatically.

### Required Scopes
| Scope | Description |
|-------|-------------|
| `schema.bases:read` | Read table schemas (list fields) |
| `schema.bases:write` | Create/update/delete fields |

⚠️ **Create a new token** at https://airtable.com/create/tokens with these scopes enabled!

### List Tables and Fields

**Endpoint:**
```
GET https://api.airtable.com/v0/meta/bases/{baseId}/tables
```

**Response:**
```json
{
  "tables": [
    {
      "id": "tblXXXXXXXXXXXXXX",
      "name": "My Table",
      "fields": [
        {
          "id": "fldXXXXXXXXXXXXXX",
          "name": "Name",
          "type": "singleLineText"
        },
        {
          "id": "fldYYYYYYYYYYYYYY",
          "name": "Photos",
          "type": "multipleAttachments"
        }
      ]
    }
  ]
}
```

### Create a Field

**Endpoint:**
```
POST https://api.airtable.com/v0/meta/bases/{baseId}/tables/{tableId}/fields
```

**Request Body:**
```json
{
  "name": "Photo Package",
  "type": "multipleAttachments",
  "description": "ZIP file containing all assessment photos"
}
```

### Common Field Types

| Type | Description | Options |
|------|-------------|---------|
| `singleLineText` | Single line of text | None |
| `multilineText` | Multiple lines of text | None |
| `number` | Integer or decimal | `precision: 0-8` |
| `checkbox` | Boolean checkbox | `color`, `icon` |
| `singleSelect` | Dropdown (one choice) | `choices: [{name, color}]` |
| `multipleSelects` | Dropdown (multiple) | `choices: [{name, color}]` |
| `multipleAttachments` | File attachments | `isReversed` |
| `date` | Date only | `dateFormat` |
| `dateTime` | Date and time | `dateFormat`, `timeFormat`, `timeZone` |
| `email` | Email address | None |
| `url` | URL/website | None |
| `phoneNumber` | Phone number | None |
| `currency` | Money value | `precision`, `symbol` |

### Example: Create Number Field
```json
{
  "name": "Photo Count",
  "type": "number",
  "options": {
    "precision": 0
  }
}
```

### Example: Create Attachment Field
```json
{
  "name": "Photo Package",
  "type": "multipleAttachments"
}
```

### Auto-Create Fields in Code

```javascript
async function ensureFieldExists(config, fieldName, fieldType, options = {}) {
  // Get current schema
  const schemaUrl = `https://api.airtable.com/v0/meta/bases/${config.baseId}/tables`;
  const schemaRes = await fetch(schemaUrl, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
  
  const schemaData = await schemaRes.json();
  const table = schemaData.tables.find(t => t.id === config.tableId);
  const existingFields = table.fields.map(f => f.name);
  
  if (existingFields.includes(fieldName)) {
    console.log(`✓ Field "${fieldName}" exists`);
    return true;
  }
  
  // Create field
  const createUrl = `https://api.airtable.com/v0/meta/bases/${config.baseId}/tables/${config.tableId}/fields`;
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: fieldName,
      type: fieldType,
      options: Object.keys(options).length ? options : undefined
    })
  });
  
  if (createRes.ok) {
    console.log(`✅ Created field: ${fieldName}`);
    return true;
  }
  
  console.error(`❌ Failed to create field: ${fieldName}`);
  return false;
}
```

---

## Rate Limits

### Limits
| Limit Type | Value |
|------------|-------|
| Per base | **5 requests per second** |
| Per user/service account | **50 requests per second** (across all bases) |

### When Rate Limited
- You receive a `429 Too Many Requests` status
- **Wait 30 seconds** before retrying
- The official JS client has built-in retry logic

### Recommendations
- Use batch operations (up to 10 records per request)
- Implement exponential backoff
- Use caching for read-heavy operations

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | ✅ Request completed |
| `400` | Bad Request | Check JSON encoding |
| `401` | Unauthorized | Check your token |
| `403` | Forbidden | Check permissions and scopes |
| `404` | Not Found | Check base/table/record IDs |
| `413` | Payload Too Large | Reduce request size |
| `422` | Invalid Request | Check field names/values |
| `429` | Rate Limited | Wait 30 seconds, retry |
| `500` | Server Error | Retry with backoff |
| `502` | Bad Gateway | Retry with backoff |
| `503` | Service Unavailable | Retry with backoff |

### Error Response Format
```json
{
  "error": {
    "type": "INVALID_PERMISSIONS",
    "message": "You are not permitted to create records in table TABLE_NAME"
  }
}
```

### Common Errors & Solutions

**403 - INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND**
- Token doesn't have access to the base
- User doesn't have editor permissions
- Base/Table ID is wrong

**422 - INVALID_REQUEST**
- Field name doesn't match exactly (case-sensitive!)
- Value type doesn't match field type
- Required field is missing

---

## Code Examples

### JavaScript (Node.js with fetch)

```javascript
const AIRTABLE_TOKEN = 'your_token_here';
const BASE_ID = 'appXXXXXXXXXXXXXX';
const TABLE_NAME = 'Your Table Name';

// Create a record
async function createRecord(data) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: data
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create record');
  }
  
  return response.json();
}

// Upload attachment (after record exists)
async function uploadAttachment(recordId, fieldName, fileBase64, filename, contentType) {
  const response = await fetch(
    `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: contentType,
        file: fileBase64,
        filename: filename,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload attachment');
  }
  
  return response.json();
}

// Usage example
async function createRecordWithAttachment() {
  // Step 1: Create the record
  const record = await createRecord({
    'Name': 'John Doe',
    'Email': 'john@example.com',
  });
  
  console.log('Created record:', record.id);
  
  // Step 2: Upload attachment
  const fileBase64 = '...'; // Your base64 encoded file
  const result = await uploadAttachment(
    record.id,
    'Photos',  // Your attachment field name
    fileBase64,
    'photo.jpg',
    'image/jpeg'
  );
  
  console.log('Attachment uploaded:', result);
}
```

### JavaScript (Browser - Convert File to Base64)

```javascript
// Convert file input to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage with file input
async function handleFileUpload(fileInput, recordId) {
  const file = fileInput.files[0];
  const base64 = await fileToBase64(file);
  
  await uploadAttachment(
    recordId,
    'Photos',
    base64,
    file.name,
    file.type
  );
}
```

### Google Apps Script

```javascript
function createAirtableRecord(data) {
  const AIRTABLE_TOKEN = 'your_token_here';
  const BASE_ID = 'appXXXXXXXXXXXXXX';
  const TABLE_NAME = 'Your Table Name';
  
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      fields: data
    }),
    muteHttpExceptions: true,
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  if (response.getResponseCode() !== 200) {
    throw new Error(result.error?.message || 'Failed to create record');
  }
  
  return result;
}

function uploadAttachmentToAirtable(recordId, fieldName, blob, filename) {
  const AIRTABLE_TOKEN = 'your_token_here';
  const BASE_ID = 'appXXXXXXXXXXXXXX';
  
  const url = `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`;
  
  const base64 = Utilities.base64Encode(blob.getBytes());
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify({
      contentType: blob.getContentType(),
      file: base64,
      filename: filename,
    }),
    muteHttpExceptions: true,
  };
  
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}
```

### Python

```python
import requests
import base64

AIRTABLE_TOKEN = 'your_token_here'
BASE_ID = 'appXXXXXXXXXXXXXX'
TABLE_NAME = 'Your Table Name'

def create_record(data):
    url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}'
    headers = {
        'Authorization': f'Bearer {AIRTABLE_TOKEN}',
        'Content-Type': 'application/json',
    }
    payload = {'fields': data}
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

def upload_attachment(record_id, field_name, file_path):
    url = f'https://content.airtable.com/v0/{BASE_ID}/{record_id}/{field_name}/uploadAttachment'
    headers = {
        'Authorization': f'Bearer {AIRTABLE_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    with open(file_path, 'rb') as f:
        file_base64 = base64.b64encode(f.read()).decode('utf-8')
    
    import mimetypes
    content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
    filename = file_path.split('/')[-1]
    
    payload = {
        'contentType': content_type,
        'file': file_base64,
        'filename': filename,
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()
```

---

## Best Practices

### 1. Batch Operations
- Create up to **10 records per request**
- This reduces API calls and avoids rate limits

### 2. Use Field IDs Instead of Names
- Field names can change; IDs are stable
- Set `returnFieldsByFieldId: true` in requests

### 3. Error Handling
- Always implement retry logic with exponential backoff
- Check for rate limiting (429) and retry after 30 seconds

### 4. Attachment Workflow
```
1. Create record WITHOUT attachments
2. Get record ID from response
3. Upload attachments using Content API
```

### 5. Security
- **Never expose tokens in client-side code** (use a backend proxy)
- Use environment variables for tokens
- Create tokens with minimal required scopes

### 6. Typecast for Flexibility
- Use `typecast: true` when importing data from external sources
- Airtable will attempt to convert strings to proper field types

---

## Quick Reference Card

### Headers (always required)
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Create Record
```
POST https://api.airtable.com/v0/{baseId}/{tableName}
Body: { "fields": { "Field": "Value" } }
```

### Upload Attachment
```
POST https://content.airtable.com/v0/{baseId}/{recordId}/{fieldName}/uploadAttachment
Body: { "contentType": "image/jpeg", "file": "BASE64...", "filename": "photo.jpg" }
```

### Rate Limits
- 5 requests/second per base
- 50 requests/second per user
- Wait 30 seconds on 429 error

---

## Useful Links

- [API Documentation](https://airtable.com/developers/web/api)
- [Create Personal Access Token](https://airtable.com/create/tokens)
- [Field Types Reference](https://airtable.com/developers/web/api/field-model)
- [airtable.js GitHub](https://github.com/Airtable/airtable.js)
- [pyairtable GitHub](https://github.com/gtalarico/pyairtable)

---

## Dent Pro Implementation Notes

### Photo Upload Flow (as implemented in index.html)

1. **User takes photos** → Stored in `selectedPhotos[]` array as compressed base64
2. **User clicks "Airtable" button** → `uploadToAirtable()` is called
3. **Photos are zipped** → `createPhotosZip()` uses JSZip to bundle all photos
4. **ZIP is uploaded** → Tries Google Drive first (if configured), then falls back to 0x0.st/tmpfiles.org
5. **Airtable record created** → Includes `Photo Package` field with ZIP URL

### Config File (config.json)

```json
{
    "airtable": {
        "apiKey": "pat...",
        "baseId": "app...",
        "tableName": "PDR Assessments"
    },
    "googleDrive": {
        "apiKey": "YOUR_API_KEY",
        "folderId": "OPTIONAL_FOLDER_ID",
        "enabled": false
    }
}
```

### Airtable Fields Used

| Field Name | Type | Description |
|------------|------|-------------|
| `PDF Report` | Attachment | Generated PDF scope report |
| `Photo Package` | Attachment | ZIP file containing all photos |
| `Photo Count` | Number | Count of photos in the package |

### JSZip Library

Loaded from CDN: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`

### Upload Services (Fallback Order)

1. **Google Drive** (if `enabled: true` in config)
2. **0x0.st** - 30 day retention, 512MB limit
3. **tmpfiles.org** - Temporary storage
4. **file.io** - Single download (last resort)
