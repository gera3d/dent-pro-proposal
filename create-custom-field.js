const https = require('https');

const GHL_CONFIG = {
    accessToken: process.env.GHL_ACCESS_TOKEN || '',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'services.leadconnectorhq.com'
};

const payload = JSON.stringify({
    name: 'Google Drive Folder',
    dataType: 'TEXT',
    model: 'contact' // Ensure this applies to Contacts
});

const options = {
  hostname: GHL_CONFIG.baseUrl,
  path: `/locations/${GHL_CONFIG.locationId}/customFields`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(payload);
req.end();
