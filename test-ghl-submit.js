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

const GHL_DND_SETTINGS = {
    Call: { status: 'active', message: '', code: '' },
    Email: { status: 'active', message: '', code: '' },
    SMS: { status: 'active', message: '', code: '' },
    WhatsApp: { status: 'active', message: '', code: '' },
    GMB: { status: 'active', message: '', code: '' },
    FB: { status: 'active', message: '', code: '' }
};

function getGHLCustomFields(formData) {
    const customFields = [];
    if (formData.vin) customFields.push({ id: GHL_CONFIG.customFields.vin, value: formData.vin });

    // Combined Year Make Model
    const ymm = [formData.year, formData.make, formData.model].filter(Boolean).join(' ');
    if (ymm) customFields.push({ id: GHL_CONFIG.customFields.year_make_model, value: ymm });

    if (formData.insurance) customFields.push({ id: GHL_CONFIG.customFields.insurance_company, value: formData.insurance });
    if (formData.claimNumber) customFields.push({ id: GHL_CONFIG.customFields.claim_number, value: formData.claimNumber });
    if (formData.estimator) customFields.push({ id: GHL_CONFIG.customFields.technician_name, value: formData.estimator });
    if (formData.roNumber) customFields.push({ id: GHL_CONFIG.customFields.ro_number, value: formData.roNumber });
    if (formData.color && GHL_CONFIG.customFields.color) customFields.push({ id: GHL_CONFIG.customFields.color, value: formData.color });

    return customFields;
}

async function runTest() {
    const formData = {
        customerEmail: 'test1234455@example.com',
        customerPhone: '9999999999',
        insuredName: 'Test Customer',
        vin: 'VIN123',
        year: '2023',
        make: 'Toyota',
        model: 'Camry',
        color: 'Red',
        insurance: 'Geico',
        claimNumber: 'CLM123',
        estimator: 'Gera',
        roNumber: 'RO123'
    };

    console.log('1. Creating Contact...');
    const customFields = getGHLCustomFields(formData);

    const contactPayload = {
        locationId: GHL_CONFIG.locationId,
        firstName: 'Test',
        lastName: 'Customer',
        email: formData.customerEmail,
        phone: formData.customerPhone,
        source: 'Dent Experts Form',
        customFields: customFields,
        dnd: false,
        dndSettings: GHL_DND_SETTINGS
    };

    const createResponse = await fetch(`${GHL_CONFIG.baseUrl}/contacts/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPayload)
    });

    const createResult = await createResponse.json();
    console.log('Contact Create Response:', createResult);

    if (!createResult.contact || !createResult.contact.id) {
        return;
    }
    const contactId = createResult.contact.id;

    console.log('2. Creating Opportunity...');
    const pipeline = GHL_CONFIG.pipelines.repair_tracker;

    // Note: GHL Opportunities API Custom Fields Format 
    // Wait, let's look at what the app sends. It sends customFields: customFields.

    const oppPayload = {
        pipelineId: pipeline.id,
        pipelineStageId: pipeline.startStage,
        locationId: GHL_CONFIG.locationId,
        name: 'Test - 2023 Toyota Camry',
        contactId: contactId,
        status: 'open',
        customFields: customFields
    };

    const oppResponse = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(oppPayload)
    });

    const oppResult = await oppResponse.json();
    console.log('Opportunity Create Response:', oppResult);
}

runTest();
