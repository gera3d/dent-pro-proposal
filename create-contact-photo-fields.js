const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

const token = Date.now().toString().slice(-4);
const fieldsToCreate = [
    { name: `VOIL Gallery ${token}`, dataType: 'FILE_UPLOAD', model: 'contact' },
    { name: `Conditioning Gallery ${token}`, dataType: 'FILE_UPLOAD', model: 'contact' },
    { name: `UPD Gallery ${token}`, dataType: 'FILE_UPLOAD', model: 'contact' },
    { name: `Scope Gallery ${token}`, dataType: 'FILE_UPLOAD', model: 'contact' },
];

async function createFields() {
    console.log(`Creating Contact FILE_UPLOAD Custom Fields in GHL (Token: ${token})...\n`);
    const createdIds = {};
    for (const field of fieldsToCreate) {
        try {
            const res = await fetch(`${GHL_CONFIG.baseUrl}/locations/${GHL_CONFIG.locationId}/customFields`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
                body: JSON.stringify(field),
            });
            const data = await res.json();
            if (data.id) {
                console.log(`✅ Created: ${field.name} -> ID: ${data.id}`);
                createdIds[field.name] = data.id;
            } else {
                console.error(`❌ Failed to create ${field.name}:`, JSON.stringify(data, null, 2));
            }
            await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
            console.error(`❌ Error on ${field.name}:`, err.message);
        }
    }
    console.log('\n--- Copy These NEW IDs into GHL_CONFIG.customFields in index.html ---');
    console.log(`contact_photo_voil: '${createdIds[`VOIL Gallery ${token}`] || 'MISSING'}',`);
    console.log(`contact_photo_conditioning: '${createdIds[`Conditioning Gallery ${token}`] || 'MISSING'}',`);
    console.log(`contact_photo_upd: '${createdIds[`UPD Gallery ${token}`] || 'MISSING'}',`);
    console.log(`contact_photo_scope: '${createdIds[`Scope Gallery ${token}`] || 'MISSING'}',`);
}
createFields();
