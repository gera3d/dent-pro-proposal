
const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function testContactUpdate() {
    console.log('Testing existing contact update with customFields (value)...');
    const existingId = 'kJyEgq3J8TMkV48cng8S'; // gera yeremin
    const payload = {
        locationId: GHL_CONFIG.locationId,
        firstName: 'Gera',
        lastName: 'Yeremin',
        customFields: [
            { id: 'qKQntVqCwKdmmPaHLnr6', value: 'VIN_FROM_TEST' }
        ]
    };

    const res = await fetch(`${GHL_CONFIG.baseUrl}/contacts/${existingId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Update result:', data);

    const payloadWithFieldValue = {
        locationId: GHL_CONFIG.locationId,
        firstName: 'Gera',
        lastName: 'Yeremin',
        customFields: [
            { id: 'qKQntVqCwKdmmPaHLnr6', field_value: 'VIN_FROM_TEST2' }
        ]
    };
    const res2 = await fetch(`${GHL_CONFIG.baseUrl}/contacts/${existingId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadWithFieldValue)
    });
    const data2 = await res2.json();
    console.log('Update result 2:', data2);
}

testContactUpdate().catch(console.error);
