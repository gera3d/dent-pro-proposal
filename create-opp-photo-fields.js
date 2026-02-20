/**
 * One-time script to create FILE_UPLOAD custom fields on the Opportunity model
 * for VOIL, Conditioning, UPD, and Scope photos.
 *
 * Usage: node create-opp-photo-fields.js
 */

const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

const fieldsToCreate = [
    {
        name: 'VOIL Photos',
        dataType: 'FILE_UPLOAD',
        model: 'opportunity',
        isMultipleFile: true,
        maxNumberOfFiles: 10,
        acceptedFormat: ['.jpg', '.jpeg', '.png'],
    },
    {
        name: 'Conditioning Photos',
        dataType: 'FILE_UPLOAD',
        model: 'opportunity',
        isMultipleFile: true,
        maxNumberOfFiles: 10,
        acceptedFormat: ['.jpg', '.jpeg', '.png'],
    },
    {
        name: 'UPD Photos',
        dataType: 'FILE_UPLOAD',
        model: 'opportunity',
        isMultipleFile: true,
        maxNumberOfFiles: 10,
        acceptedFormat: ['.jpg', '.jpeg', '.png'],
    },
    {
        name: 'Scope Photos',
        dataType: 'FILE_UPLOAD',
        model: 'opportunity',
        isMultipleFile: true,
        maxNumberOfFiles: 10,
        acceptedFormat: ['.jpg', '.jpeg', '.png'],
    },
];

async function createFields() {
    console.log('Creating Opportunity FILE_UPLOAD Custom Fields in GHL...\n');
    const createdIds = {};

    for (const field of fieldsToCreate) {
        try {
            const res = await fetch(
                `${GHL_CONFIG.baseUrl}/locations/${GHL_CONFIG.locationId}/customFields`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${GHL_CONFIG.accessToken}`,
                        Version: '2021-07-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(field),
                }
            );

            const data = await res.json();
            if (data.customField && data.customField.id) {
                console.log(`✅ Created: ${field.name} -> ID: ${data.customField.id}`);
                createdIds[field.name] = data.customField.id;
            } else {
                console.error(`❌ Failed to create ${field.name}:`, JSON.stringify(data, null, 2));
            }

            // Wait 1 second between requests to avoid rate limits
            await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
            console.error(`❌ Error on ${field.name}:`, err.message);
        }
    }

    console.log('\n--- Copy these IDs into GHL_CONFIG.customFields in index.html ---');
    console.log(`opp_photo_voil: '${createdIds['VOIL Photos'] || 'MISSING'}',`);
    console.log(`opp_photo_conditioning: '${createdIds['Conditioning Photos'] || 'MISSING'}',`);
    console.log(`opp_photo_upd: '${createdIds['UPD Photos'] || 'MISSING'}',`);
    console.log(`opp_photo_scope: '${createdIds['Scope Photos'] || 'MISSING'}',`);
}

createFields();
