// ============================================================
// Dent Pro — Google Drive Upload Script
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
//
// SETUP: In the script editor go to:
//   Extensions → Advanced Google Services → turn ON "Drive API"
// ============================================================

const ROOT_FOLDER_ID = '18_h9VuOx6kwXsJ1MG6jsKle78ENTBQjQ'; // Dent Pro Google Drive folder (ID matches URL: https://drive.google.com/drive/folders/18_h9VuOx6kwXsJ1MG6jsKle78ENTBQjQ)
const MAKE_FILES_PUBLIC = false; // Files usually inherit folder visibility. Keep false to reduce API calls.

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'createFolder') {
      return handleCreateFolder(e.parameter);
    }
    return respond({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action } = payload;

    if (action === 'uploadPhoto') return handleUploadPhoto(payload);
    if (action === 'uploadBatch') return handleUploadBatch(payload);
    if (action === 'createUploadSessions') return handleCreateUploadSessions(payload);
    if (action === 'createFolder') return handleCreateFolder(payload);
    if (action === 'visionOcrVin') return handleVisionOcrVin(payload);

    return respond({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function handleCreateFolder(payload) {
  const { brandFolder, folderName } = payload;

  let parentId = ROOT_FOLDER_ID;
  
  // getOrCreateSubFolder only returns ID. We need the webViewLink, so we fetch it
  const folderId = getOrCreateSubFolder(parentId, folderName);
  
  const folder = Drive.Files.get(folderId, { fields: 'id,webViewLink', supportsAllDrives: true });
  
  // Make folder viewable by anyone with the link
  Drive.Permissions.create(
    { role: 'reader', type: 'anyone' },
    folder.id,
    { supportsAllDrives: true }
  );

  return respond({
    success: true,
    folderId: folder.id,
    folderUrl: folder.webViewLink
  });
}

function handleUploadPhoto(payload) {
  // Backward-compatible single-file route.
  return handleUploadBatch({
    folderName: payload.folderName,
    files: [{
      fileName: payload.fileName,
      base64Data: payload.base64Data,
      mimeType: payload.mimeType
    }]
  });
}

function handleUploadBatch(payload) {
  const folderName = payload.folderName;
  const explicitFolderId = String(payload.folderId || '').trim();
  const files = Array.isArray(payload.files) ? payload.files : [];

  if (!folderName && !explicitFolderId) {
    return respond({ success: false, error: 'Missing folderName or folderId' });
  }
  if (files.length === 0) {
    return respond({ success: false, error: 'No files supplied' });
  }

  const folderId = explicitFolderId || getOrCreateSubFolder(ROOT_FOLDER_ID, folderName);
  const folderMeta = Drive.Files.get(folderId, { fields: 'id,webViewLink', supportsAllDrives: true });
  const uploaded = [];
  const failed = [];

  for (let i = 0; i < files.length; i++) {
    const item = files[i] || {};
    const fileName = item.fileName || `photo_${i + 1}.jpg`;

    try {
      const base64Data = String(item.base64Data || '').replace(/^data:[^,]+,/, '');
      if (!base64Data) {
        throw new Error('Missing base64Data');
      }

      const decoded = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decoded, item.mimeType || 'image/jpeg', fileName);

      const file = Drive.Files.create(
        { name: fileName, parents: [folderId] },
        blob,
        { supportsAllDrives: true, fields: 'id,webViewLink' }
      );

      if (MAKE_FILES_PUBLIC) {
        Drive.Permissions.create(
          { role: 'reader', type: 'anyone' },
          file.id,
          { supportsAllDrives: true }
        );
      }

      uploaded.push({ fileId: file.id, fileName: fileName, fileUrl: file.webViewLink });
    } catch (err) {
      failed.push({ fileName: fileName, error: String(err) });
    }
  }

  return respond({
    success: failed.length === 0,
    folderId: folderId,
    folderUrl: folderMeta.webViewLink,
    uploadedCount: uploaded.length,
    failedCount: failed.length,
    uploaded: uploaded,
    failed: failed
  });
}

function handleCreateUploadSessions(payload) {
  const folderName = payload.folderName;
  const explicitFolderId = String(payload.folderId || '').trim();
  const files = Array.isArray(payload.files) ? payload.files : [];

  if (!folderName && !explicitFolderId) {
    return respond({ success: false, error: 'Missing folderName or folderId' });
  }
  if (files.length === 0) {
    return respond({ success: false, error: 'No files supplied' });
  }

  const folderId = explicitFolderId || getOrCreateSubFolder(ROOT_FOLDER_ID, folderName);
  const folderMeta = Drive.Files.get(folderId, { fields: 'id,webViewLink', supportsAllDrives: true });
  const token = ScriptApp.getOAuthToken();
  const sessionInitUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,webViewLink';
  const sessions = [];
  const failed = [];

  files.forEach((item, index) => {
    const fileName = item.fileName || `photo_${index + 1}.jpg`;
    const mimeType = item.mimeType || 'application/octet-stream';
    const fileSize = Math.max(0, Number(item.fileSize || 0));
    const headers = {
      Authorization: 'Bearer ' + token,
      'X-Upload-Content-Type': mimeType
    };

    if (fileSize > 0) {
      headers['X-Upload-Content-Length'] = String(fileSize);
    }

    try {
      const res = UrlFetchApp.fetch(sessionInitUrl, {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        headers: headers,
        payload: JSON.stringify({
          name: fileName,
          parents: [folderId]
        }),
        followRedirects: false,
        muteHttpExceptions: true
      });

      const status = res.getResponseCode();
      const responseHeaders = res.getAllHeaders();
      const locationValue = responseHeaders.Location || responseHeaders.location;
      const uploadUrl = Array.isArray(locationValue) ? locationValue[0] : locationValue;
      const bodyText = res.getContentText() || '';

      if ((status === 200 || status === 201) && uploadUrl) {
        sessions.push({
          index: index,
          fileName: fileName,
          mimeType: mimeType,
          fileSize: fileSize,
          uploadUrl: uploadUrl
        });
        return;
      }

      failed.push({
        index: index,
        fileName: fileName,
        status: status,
        error: bodyText || 'Could not create upload session',
        headers: responseHeaders
      });
    } catch (err) {
      failed.push({
        index: index,
        fileName: fileName,
        status: 0,
        error: String(err)
      });
    }
  });

  return respond({
    success: failed.length === 0,
    folderId: folderId,
    folderUrl: folderMeta.webViewLink,
    sessionCount: sessions.length,
    failedCount: failed.length,
    sessions: sessions,
    failed: failed
  });
}

function handleVisionOcrVin(payload) {
  const imageBase64 = (payload && payload.imageBase64) ? String(payload.imageBase64) : '';
  if (!imageBase64) {
    return respond({ success: false, error: 'Missing imageBase64' });
  }

  const visionApiKey = PropertiesService.getScriptProperties().getProperty('VISION_API_KEY');
  if (!visionApiKey) {
    return respond({ success: false, error: 'VISION_API_KEY script property is not set' });
  }

  const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + encodeURIComponent(visionApiKey);
  const requestBody = {
    requests: [{
      image: { content: imageBase64 },
      features: [{ type: 'TEXT_DETECTION', maxResults: 10 }]
    }]
  };

  const apiRes = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });

  const status = apiRes.getResponseCode();
  const bodyText = apiRes.getContentText() || '';
  let data = {};
  try { data = JSON.parse(bodyText); } catch (_) {}

  if (status < 200 || status >= 300 || (data && data.error)) {
    const errMsg = (data && data.error && data.error.message) ? data.error.message : ('Vision API HTTP ' + status);
    return respond({ success: false, status: status, error: errMsg });
  }

  const annotations = (((data || {}).responses || [])[0] || {}).textAnnotations || [];
  const fullText = annotations.length ? (annotations[0].description || '') : '';
  return respond({
    success: true,
    fullText: fullText,
    annotations: annotations
  });
}

// ---- Helpers ----

// CacheService stores folder IDs so parallel uploads skip the lock
// after the first execution warms the cache.

function getOrCreateSubFolder(parentId, name) {
  const cache    = CacheService.getScriptCache();
  const cacheKey = 'sf_' + Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    parentId + ':' + name,
    Utilities.Charset.UTF_8
  ).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const cached2 = cache.get(cacheKey);
    if (cached2) return cached2;

    // Search for existing folder in Shared Drive
    const safe    = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const results = Drive.Files.list({
      q:      `name='${safe}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    let folderId;
    if (results.files && results.files.length > 0) {
      folderId = results.files[0].id;
    } else {
      const folder = Drive.Files.create(
        { name: name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        null,
        { supportsAllDrives: true, fields: 'id' }
      );
      folderId = folder.id;
    }

    cache.put(cacheKey, folderId, 21600); // cache 6 hours
    return folderId;
  } finally {
    lock.releaseLock();
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
