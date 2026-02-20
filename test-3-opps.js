const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
    userId: 'D0d4WknnxH0DTw39xHxA',
    pipelines: {
        repair_tracker: { id: 'JptjUQHom2aW3y3MGc2g', startStage: 'abf22448-51ea-474f-bac1-e4edd981f8e3' }
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
    SMS: { status: 'active', message: '' }
};

function getGHLCustomFields(formData) {
    const customFields = [];
    if (formData.vin) customFields.push({ id: GHL_CONFIG.customFields.vin, value: formData.vin });
    const ymm = [formData.year, formData.make, formData.model].filter(Boolean).join(' ');
    if (ymm) customFields.push({ id: GHL_CONFIG.customFields.year_make_model, value: ymm });
    if (formData.insurance) customFields.push({ id: GHL_CONFIG.customFields.insurance_company, value: formData.insurance });
    if (formData.claimNumber) customFields.push({ id: GHL_CONFIG.customFields.claim_number, value: formData.claimNumber });
    if (formData.estimator) customFields.push({ id: GHL_CONFIG.customFields.technician_name, value: formData.estimator });
    if (formData.roNumber) customFields.push({ id: GHL_CONFIG.customFields.ro_number, value: formData.roNumber });
    if (formData.color) customFields.push({ id: GHL_CONFIG.customFields.color, value: formData.color });
    return customFields;
}

async function upsertGHLContact(formData) {
    const email = formData.customerEmail;
    const phone = formData.customerPhone;
    const nameParts = (formData.insuredName || '').split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const contactPayload = {
        locationId: GHL_CONFIG.locationId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        source: 'Dent Experts Form',
        customFields: getGHLCustomFields(formData),
        dnd: false,
        dndSettings: { ...GHL_DND_SETTINGS }
    };

    const searchQuery = email || phone;
    const searchRes = await fetch(`${GHL_CONFIG.baseUrl}/contacts/?locationId=${GHL_CONFIG.locationId}&query=${encodeURIComponent(searchQuery)}&limit=1`, {
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28' }
    });
    const searchData = await searchRes.json();

    if (searchData.contacts && searchData.contacts.length > 0) {
        const id = searchData.contacts[0].id;
        const updatePayload = { ...contactPayload };
        delete updatePayload.locationId;
        await fetch(`${GHL_CONFIG.baseUrl}/contacts/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        return { success: true, contactId: id };
    }

    const createRes = await fetch(`${GHL_CONFIG.baseUrl}/contacts/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
    });
    const data = await createRes.json();
    return { success: true, contactId: data.contact.id };
}

async function createGHLOpportunity(formData, contactId) {
    const pipeline = GHL_CONFIG.pipelines.repair_tracker;
    const vehicleInfo = `${formData.year || ''} ${formData.make || ''} ${formData.model || ''}`.trim();
    const customerName = formData.insuredName ? formData.insuredName.split(' ')[0] : '';
    const title = `${customerName} - ${vehicleInfo}`;

    const res = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pipelineId: pipeline.id,
            pipelineStageId: pipeline.startStage,
            locationId: GHL_CONFIG.locationId,
            name: title,
            contactId: contactId,
            status: 'open',
            customFields: getGHLCustomFields(formData)
        })
    });
    return await res.json();
}

async function addGHLNote(contactId, noteBody) {
    await fetch(`${GHL_CONFIG.baseUrl}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GHL_CONFIG.accessToken}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: noteBody, userId: GHL_CONFIG.userId })
    });
}

// SIMULATION ARRAY
const tests = [
    {
        desc: "Test 1: Complete Info + ZIP Link",
        data: {
            insuredName: 'Alice Anderson', customerEmail: 'alice.a@example.com', customerPhone: '+15555550001',
            vin: '1ABCD2EFGH3IJKLMN', year: '2022', make: 'Toyota', model: 'Camry', color: 'Midnight Black',
            insurance: 'Progressive', claimNumber: 'PRG-11111', estimator: 'Gera Yeremin', roNumber: 'RO-1111',
            photoUrls: ['https://airtable.com/zip/alice_photos.zip']
        }
    },
    {
        desc: "Test 2: Minimal Info + Direct Links",
        data: {
            insuredName: 'Bob Benson', customerEmail: 'bob.b@example.com', customerPhone: '+15555550002',
            vin: '', year: '2019', make: 'Honda', model: 'Civic', color: 'White',
            insurance: '', claimNumber: '', estimator: 'Tim', roNumber: 'RO-2222',
            photoUrls: ['https://example.com/dmg1.jpg', 'https://example.com/dmg2.jpg']
        }
    },
    {
        desc: "Test 3: Missing Photos",
        data: {
            insuredName: 'Charlie Chaplin', customerEmail: 'charlie.c@example.com', customerPhone: '+15555550003',
            vin: '3XYZ9WQERTY123456', year: '2024', make: 'Ford', model: 'Mustang', color: 'Grabber Blue',
            insurance: 'Geico', claimNumber: 'GCO-33333', estimator: 'Alex', roNumber: 'RO-3333',
            photoUrls: []
        }
    }
];

async function runTests() {
    for (const test of tests) {
        console.log(`\n▶️ Running ${test.desc}`);
        try {
            const contact = await upsertGHLContact(test.data);
            console.log(`  └ Contact ID: ${contact.contactId}`);

            const opp = await createGHLOpportunity(test.data, contact.contactId);
            console.log(`  └ Opportunity ID: ${opp.opportunity ? opp.opportunity.id : 'FAILED'}`);

            if (test.data.photoUrls && test.data.photoUrls.length > 0) {
                const noteBody = `Uploaded Damage Photos:\n${test.data.photoUrls.join('\n')}`;
                await addGHLNote(contact.contactId, noteBody);
                console.log(`  └ Note added successfully with ${test.data.photoUrls.length} image link(s)`);
            } else {
                console.log(`  └ No photos attached to this test.`);
            }
            console.log(`✅  Passed`);
        } catch (e) {
            console.error(`❌  Failed:`, e.message);
        }
        await new Promise(r => setTimeout(r, 2000)); // space APIs out
    }
}
runTests();
