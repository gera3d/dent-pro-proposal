const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

const fieldsToCreate = [
    { name: 'Damage Photo - Front', dataType: 'TEXT', model: 'opportunity' },
    { name: 'Damage Photo - Rear', dataType: 'TEXT', model: 'opportunity' },
    { name: 'Damage Photo - Left', dataType: 'TEXT', model: 'opportunity' },
    { name: 'Damage Photo - Right', dataType: 'TEXT', model: 'opportunity' },
    { name: 'Damage Photo - Interior', dataType: 'TEXT', model: 'opportunity' }
];

async function createFields() {
    console.log('Creating Custom Fields in GHL...');
    const createdIds = {};

    for (const field of fieldsToCreate) {
        try {
            const res = await fetch(`${GHL_CONFIG.baseUrl}/locations/${GHL_CONFIG.locationId}/customFields`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(field)
            });

            const data = await res.json();
            if (data.customField && data.customField.id) {
                console.log(`✅ Created: ${field.name} -> ID: ${data.customField.id}`);
                createdIds[field.name] = data.customField.id;
            } else {
                console.error(`❌ Failed to create ${field.name}:`, data);
            }

            // Wait 1 second between requests to avoid rate limits
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error(`❌ Error on ${field.name}:`, err);
        }
    }

    console.log('\n--- Final ID Mapping for index.html ---');
    console.log(JSON.stringify(createdIds, null, 2));
}

createFields();
