const accessToken = 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79';
const locationId = 'AAzBZNLXS4rdwhG76MLi';
const baseUrl = 'https://services.leadconnectorhq.com';

async function getFields() {
    try {
        const response = await fetch(`${baseUrl}/locations/${locationId}/customFields`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Version': '2021-07-28'
            }
        });

        if (response.ok) {
            const json = await response.json();
            const fields = json.customFields || [];
            
            const targetNames = [
                'Damage Photo - VOIL',
                'Damage Photo - Conditioning',
                'Damage Photo - UPD',
                'Damage Photo - Scope'
            ];
            
            for (const field of fields) {
                if (targetNames.includes(field.name)) {
                    console.log(`FOUND: ${field.name} -> ID: ${field.id}`);
                }
            }
        } else {
            console.error(`Failed to get fields:`, await response.text());
        }
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

getFields();
