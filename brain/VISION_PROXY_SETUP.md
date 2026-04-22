# Vision Proxy Setup (iOS Wrapper)

## Why
Google Vision key calls from WKWebView can fail with:
- `API_KEY_HTTP_REFERRER_BLOCKED`

The fix is a server-side proxy.

## What was added
- App support for `visionProxyUrl` in `config.json`.
- Proxy action expected by app: `action: "visionOcrVin"`.
- Apps Script handler added in `brain/DriveUpload.gs`.

## Deploy steps
1. Open your Apps Script project that backs your current `driveScriptUrl`.
2. Paste/merge the updated `DriveUpload.gs` code (includes `handleVisionOcrVin`).
3. In Apps Script: `Project Settings` -> `Script properties`.
4. Add script property:
   - Key: `VISION_API_KEY`
   - Value: your Google Vision API key
5. Deploy `New version` of Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the deployed Web App URL.
7. Set `visionProxyUrl` in `config.json` to that URL.
8. Run `npm run cap:sync` and rebuild iOS wrapper.

## Request format from app
POST JSON:
```json
{
  "action": "visionOcrVin",
  "imageBase64": "..."
}
```

## Response shape expected by app
```json
{
  "success": true,
  "fullText": "...",
  "annotations": [ ... ]
}
```
