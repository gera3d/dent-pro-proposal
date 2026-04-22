const API_KEY = process.env.GHL_ACCESS_TOKEN || '';
const LOCATION_ID = 'AAzBZNLXS4rdwhG76MLi';
const BASE_URL = 'https://services.leadconnectorhq.com';

const idsToDelete = [
  'Oy4NbiWhcxoV3IOlq9Ar', // VOIL Gallery 2198
  'pDMArE3EzFAIPD7EHldp', // Conditioning Gallery 2198
  'z29ukzypNDkDTMOVvVxq', // UPD Gallery 2198
  '6so9X9FfOoO9JAbSFrHo', // Scope Gallery 2198
];

async function run() {
  for (const id of idsToDelete) {
    console.log(`Deleting ${id}`);
    const delRes = await fetch(`${BASE_URL}/locations/${LOCATION_ID}/customFields/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Version': '2021-07-28' }
    });
    console.log(`Status:`, delRes.status);
  }
}

run();
