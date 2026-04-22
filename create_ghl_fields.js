const accessToken = process.env.GHL_ACCESS_TOKEN || '';
const locationId = 'AAzBZNLXS4rdwhG76MLi';
const baseUrl = 'https://services.leadconnectorhq.com';

const fieldsToCreate = [
    { name: 'Damage Photo - VOIL', dataType: 'TEXT' },
    { name: 'Damage Photo - Conditioning', dataType: 'TEXT' },
    { name: 'Damage Photo - UPD', dataType: 'TEXT' },
    { name: 'Damage Photo - Scope', dataType: 'TEXT' }
];

async function createFields() {
    for (const field of fieldsToCreate) {
        try {
            const response = await fetch(`${baseUrl}/locations/${locationId}/customFields`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: field.name,
                    dataType: field.dataType,
                    placeholder: `URL for ${field.name}`,
                    model: 'contact'
                })
            });

            if (response.ok) {
                const json = await response.json();
                console.log(`Created ${field.name} -> ID: ${json.customField.id}`);
            } else {
                console.error(`Failed to create ${field.name}:`, await response.text());
            }
        } catch (e) {
            console.error(`Error with ${field.name}:`, e.message);
        }
    }
}

createFields();
