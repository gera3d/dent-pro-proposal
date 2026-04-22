const GHL_CONFIG = {
    accessToken: process.env.GHL_ACCESS_TOKEN || '',
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
    Call: { status: 'active', message: '' },
    Email: { status: 'active', message: '' },
    SMS: { status: 'active', message: '' },
    WhatsApp: { status: 'active', message: '' },
    GMB: { status: 'active', message: '' },
    FB: { status: 'active', message: '' }
};

// Mirror functions from index.html exactly
function getGHLCustomFields(formData) {
    const customFields = [];
    if (formData.vin) customFields.push({ id: GHL_CONFIG.customFields.vin, value: formData.vin });

    const ymm = [formData.year, formData.make, formData.model].filter(Boolean).join(' ');
    if (ymm) customFields.push({ id: GHL_CONFIG.customFields.year_make_model, value: ymm });

    if (formData.insurance) customFields.push({ id: GHL_CONFIG.customFields.insurance_company, value: formData.insurance });
    if (formData.claimNumber) customFields.push({ id: GHL_CONFIG.customFields.claim_number, value: formData.claimNumber });
    if (formData.estimator) customFields.push({ id: GHL_CONFIG.customFields.technician_name, value: formData.estimator });
    if (formData.roNumber) customFields.push({ id: GHL_CONFIG.customFields.ro_number, value: formData.roNumber });
    if (formData.color && GHL_CONFIG.customFields.color) customFields.push({ id: GHL_CONFIG.customFields.color, value: formData.color });

    return customFields;
}

async function upsertGHLContact(formData) {
    const email = formData.customerEmail;
    const phone = formData.customerPhone;

    if (!email && !phone) return { success: false, error: 'Email or phone required' };

    const nameParts = (formData.insuredName || '').split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';
    const customFields = getGHLCustomFields(formData);

    const contactPayload = {
        locationId: GHL_CONFIG.locationId,
        firstName: firstName,
        lastName: lastName,
        email: email || undefined,
        phone: phone || undefined,
        source: 'Dent Experts Form',
        customFields: customFields,
        dnd: false,
        dndSettings: { ...GHL_DND_SETTINGS }
    };

    const searchQuery = email || phone;
    try {
        const searchResponse = await fetch(`${GHL_CONFIG.baseUrl}/contacts/?locationId=${GHL_CONFIG.locationId}&query=${encodeURIComponent(searchQuery)}&limit=5`, {
            headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28' }
        });

        const searchResult = await searchResponse.json();

        if (searchResult.contacts && searchResult.contacts.length > 0) {
            const existingId = searchResult.contacts[0].id;
            console.log('Found existing contact, updating:', existingId);
            const updatePayload = { ...contactPayload };
            delete updatePayload.locationId;
            const updateResponse = await fetch(`${GHL_CONFIG.baseUrl}/contacts/${existingId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });
            const updateResult = await updateResponse.json();
            console.log('Update result success:', !!updateResult.contact);
            return { success: true, contactId: existingId };
        }
    } catch (e) {
        console.error('Search/Update failed, creating new contact', e);
    }

    const createResponse = await fetch(`${GHL_CONFIG.baseUrl}/contacts/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
    });

    const createResult = await createResponse.json();
    if (createResult.contact && createResult.contact.id) {
        console.log('Created contact:', createResult.contact.id);
        return { success: true, contactId: createResult.contact.id };
    }
    return { success: false, error: 'Failed to create contact in GHL' };
}

async function createGHLOpportunity(formData, contactId, pipelineKey = 'repair_tracker') {
    const pipeline = GHL_CONFIG.pipelines[pipelineKey] || GHL_CONFIG.pipelines.repair_tracker;
    const vehicleInfo = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''}`.trim();
    const customerName = formData.insuredName ? formData.insuredName.split(' ')[0] : '';
    let title = vehicleInfo;
    if (customerName && vehicleInfo) title = `${customerName} - ${vehicleInfo}`;
    else if (!title) title = customerName ? `${customerName} - Repair` : 'New Repair';

    const customFields = getGHLCustomFields(formData);

    const response = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pipelineId: pipeline.id,
            pipelineStageId: pipeline.startStage,
            locationId: GHL_CONFIG.locationId,
            name: title,
            contactId: contactId,
            status: 'open',
            customFields: customFields
        })
    });

    const result = await response.json();
    if (result.opportunity && result.opportunity.id) {
        console.log('Created opportunity:', result.opportunity.id, title);
        return { success: true, opportunityId: result.opportunity.id };
    }
    const errorMsg = result.message || result.error || 'Failed to create opportunity';
    console.error('Opportunity failed:', errorMsg);
    return { success: false, error: errorMsg };
}

async function runE2ETest() {
    console.log('Running simulated form submission...');
    const formData = {
        insuredName: 'E2E Test User',
        customerEmail: 'e2e@example.com',
        customerPhone: '+15550001000',
        vin: 'E2EVIN99999999999',
        year: '2025',
        make: 'Rivian',
        model: 'R1T',
        color: 'Forest Green',
        insurance: 'State Farm',
        claimNumber: 'SF-999-E2E',
        estimator: 'Gera',
        roNumber: 'RO-E2E-001'
    };

    const contact = await upsertGHLContact(formData);
    if (!contact.success) return console.error('Aborting: Contact failed', contact.error);

    const opp = await createGHLOpportunity(formData, contact.contactId, 'repair_tracker');
    if (opp.success) {
        console.log('🎉 End to end GHL pipeline successful!');
    } else {
        console.error('❌ Pipeline failed at Opportunity stage');
    }
}

runE2ETest().catch(console.error);
