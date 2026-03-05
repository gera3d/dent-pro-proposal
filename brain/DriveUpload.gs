// ============================================================
// Dent Pro — Google Drive Upload Script
// Deploy as: Web App → Execute as: Me → Who has access: Anyone
//
// SETUP: In the script editor go to:
//   Extensions → Advanced Google Services → turn ON "Drive API"
// ============================================================

const ROOT_FOLDER_ID = '18_h9VuOx6kwXsJ1MG6jsKle78ENTBQjQ'; // Dent Pro Google Drive folder (ID matches URL: https://drive.google.com/drive/folders/18_h9VuOx6kwXsJ1MG6jsKle78ENTBQjQ)

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action } = payload;

    if (action === 'uploadPhoto') return handleUploadPhoto(payload);
    if (action === 'createFolder') return handleCreateFolder(payload);

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
  const { brandFolder, folderName, fileName, base64Data, mimeType } = payload;

  // Build path: ROOT > folderName
  let parentId = ROOT_FOLDER_ID;
  const folderId = getOrCreateSubFolder(parentId, folderName);

  const decoded = Utilities.base64Decode(base64Data);
  const blob    = Utilities.newBlob(decoded, mimeType || 'image/jpeg', fileName);

  // Use Drive API v3 so it works in Shared Drives
  const file = Drive.Files.create(
    { name: fileName, parents: [folderId] },
    blob,
    { supportsAllDrives: true, fields: 'id,webViewLink' }
  );

  // Make file viewable by anyone with the link
  Drive.Permissions.create(
    { role: 'reader', type: 'anyone' },
    file.id,
    { supportsAllDrives: true }
  );

  return respond({
    success: true,
    fileId:  file.id,
    fileUrl: file.webViewLink
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
