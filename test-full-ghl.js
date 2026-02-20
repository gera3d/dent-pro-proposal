
const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
    pipelines: {
        repair_tracker: {
            id: 'JptjUQHom2aW3y3MGc2g',
            startStage: 'abf22448-51ea-474f-bac1-e4edd981f8e3'
        }
    },
    customFields: {
        vin: 'qKQntVqCwKdmmPaHLnr6',
        year_make_model: 'IEQTtksAvzxZMTR2EeHJ',
        insurance_company: 'wcjFn8HG8fhssQWn0TFM',
        claim_number: 'Y8BZnpg3SgTCaF6eNcwt',
        technician_name: 'XOdGZsGCmyjFmZO1eHsw',
        ro_number: 'cHqj3TzHR1qipS5zXv4L',
        color: 'ljDkfmAAhoJFkZuUii0C'
    }
};

async function testFullGHL() {
    console.log('Testing Full GHL Opportunity Payload...');
    const contactId = 'kJyEgq3J8TMkV48cng8S'; // gera yeremin
    const pipeline = GHL_CONFIG.pipelines.repair_tracker;

    // Simulate getGHLCustomFields output
    const customFields = [
        { id: GHL_CONFIG.customFields.vin, value: 'VIN_FROM_TEST' },
        { id: GHL_CONFIG.customFields.year_make_model, value: '2023 Tesla Model S' },
        { id: GHL_CONFIG.customFields.insurance_company, value: 'Geico' },
        { id: GHL_CONFIG.customFields.claim_number, value: 'CLM123' },
        { id: GHL_CONFIG.customFields.technician_name, value: 'Gera Yeremin' },
        { id: GHL_CONFIG.customFields.ro_number, value: 'RO-001' },
        { id: GHL_CONFIG.customFields.color, value: 'Blue' }
    ];

    const oppPayload = {
        pipelineId: pipeline.id,
        pipelineStageId: pipeline.startStage,
        locationId: GHL_CONFIG.locationId,
        name: 'Repair: 2023 Tesla Model S',
        contactId: contactId,
        status: 'open',
        customFields: customFields
    };

    console.log('Sending Payload:', JSON.stringify(oppPayload, null, 2));

    const res = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(oppPayload)
    });

    const data = await res.json();
    console.log('Opportunity Create Response:', JSON.stringify(data, null, 2));
}
testFullGHL().catch(console.error);
