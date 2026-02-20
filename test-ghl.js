
const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
    pipelines: {
        repair_tracker: {
            id: 'JptjUQHom2aW3y3MGc2g',
            startStage: 'abf22448-51ea-474f-bac1-e4edd981f8e3'
        }
    }
};

async function testGHL() {
    console.log('Testing GHL Connection...');
    const pipeline = GHL_CONFIG.pipelines.repair_tracker;

    // Create a test contact first or search for one
    const searchResponse = await fetch(`${GHL_CONFIG.baseUrl}/contacts/?locationId=${GHL_CONFIG.locationId}&query=test@example.com&limit=1`, {
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28'
        }
    });
    const searchData = await searchResponse.json();
    console.log('Search Contacts:', searchData);

    let contactId = searchData?.contacts?.[0]?.id;

    if (!contactId) {
        // Create contact
        const createRes = await fetch(`${GHL_CONFIG.baseUrl}/contacts/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locationId: GHL_CONFIG.locationId,
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com'
            })
        });
        const createData = await createRes.json();
        console.log('Create Contact:', createData);
        contactId = createData?.contact?.id;
    }

    if (!contactId) return console.log('No contact ID, aborting');

    // Create opportunity
    console.log('Creating Opportunity for contact:', contactId);

    const oppPayload = {
        pipelineId: pipeline.id,
        pipelineStageId: pipeline.startStage,
        locationId: GHL_CONFIG.locationId,
        name: 'Test Repair Opportunity',
        contactId: contactId,
        status: 'open',
        customFields: [
            { id: 'qKQntVqCwKdmmPaHLnr6', value: 'TestVIN123' },
            { id: 'IEQTtksAvzxZMTR2EeHJ', value: '2022 Honda Civic' }
        ]
    };
    console.log('Opportunity Payload:', JSON.stringify(oppPayload, null, 2));

    const oppRes = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(oppPayload)
    });

    const oppData = await oppRes.json();
    console.log('Opportunity Create Response:', JSON.stringify(oppData, null, 2));
}

testGHL().catch(console.error);
