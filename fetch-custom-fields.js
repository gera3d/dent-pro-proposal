const https = require('https');

const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'services.leadconnectorhq.com'
};

const options = {
  hostname: GHL_CONFIG.baseUrl,
  path: `/locations/${GHL_CONFIG.locationId}/customFields`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
    'Version': '2021-07-28',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.customFields) {
        json.customFields.forEach(f => {
            console.log(`Name: ${f.name} | ID: ${f.id} | DataType: ${f.dataType}`);
        });
    } else {
        console.log(json);
    }
  });
});

req.end();
