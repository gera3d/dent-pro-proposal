# GHL Documents & Contracts Integration (Proposals API)

This integration uses the GoHighLevel **Proposals API** to send document templates directly to contacts.

**Note:** While labeled "Proposals" in the API, this system handles the "Documents & Contracts" feature in GHL.

## Configuration

- **API Base URL:** `https://services.leadconnectorhq.com`
- **Authentication:** Bearer Token (PIT - Private Integration Token)
- **Version Header:** `2021-07-28`
- **Location ID:** `AAzBZNLXS4rdwhG76MLi`
- **User ID:** `D0d4WknnxH0DTw39xHxA` (Required for sending templates)

## API Endpoints Used

### 1. List Document Templates
Using the `/proposals/templates` endpoint allows fetching the actual template list dynamically.

- **Method:** `GET`
- **Endpoint:** `/proposals/templates?locationId={locationId}`
- **Response:**
  ```json
  {
    "total": 19,
    "data": [
      {
        "_id": "685988c77e39481660754e73",
        "name": "Repair Auth and Direction to pay KS",
        "type": "proposal",
        ...
      },
      ...
    ]
  }
  ```

### 2. Send Document Template
Sends a specific template to a contact. Requires creating/finding the contact first.

- **Method:** `POST`
- **Endpoint:** `/proposals/templates/send`
- **Body:**
  ```json
  {
    "templateId": "685988c77e39481660754e73",
    "userId": "D0d4WknnxH0DTw39xHxA",
    "sendDocument": true,
    "locationId": "AAzBZNLXS4rdwhG76MLi",
    "contactId": "ExistingContactId",
    "opportunityId": "OptionalOppId"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "links": ["https://..."]
  }
  ```

### 3. Check Document Status (Polling)
The system checks the status of sent documents by listing documents and matching by recipient or name.

- **Method:** `GET`
- **Endpoint:** `/proposals/document?locationId={locationId}&limit=20`
- **Matching Logic:**
  - Find document where `recipients` array contains the `contactId`
  - OR where document `name` matches the sent template name
- **Statuses:** `draft`, `sent`, `viewed`, `completed` (signed)

## Data Storage

Contract data is stored in `localStorage` keyed by RO Number: `contracts_{roNumber}`

```json
{
  "roNumber": "10452",
  "contactId": "ghl_contact_123",
  "contracts": [
    {
      "templateId": "685988c7...",
      "templateName": "Repair Auth KS",
      "contactId": "ghl_contact_123",
      "customerName": "John Doe",
      "status": "completed",
      "sentAt": "2026-02-05T14:30:00.000Z",
      "completedAt": "2026-02-05T15:00:00.000Z",
      "sendCount": 1
    }
  ]
}
```

## User Flow

1. **Selection:** User picks a template from the dynamically populated dropdown.
2. **Sending:**
   - App checks for existing GHL contact (by name/email/phone).
   - If missing, creates a new contact.
   - Calls `/proposals/templates/send`.
3. **Tracking:**
   - Sent contract added to "Sent Contracts" list locally.
   - User can click "Refresh Status" to poll GHL for updates.
   - When status becomes `completed`, a "Ready to Work" banner appears.

## Troubleshooting

- **401 Unauthorized:** Check that the PIT token is valid and has `proposals.read` and `proposals.write` scopes.
- **404 Not Found:** Ensure the correct Base URL is used (`services.leadconnectorhq.com`).
- **Template list empty:** Verify Location ID and that templates exist in GHL > Payments > Documents & Contracts > Templates.
