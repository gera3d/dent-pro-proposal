const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function check() {
    try {
        console.log('Fetching Contacts...');
        const res = await fetch(`${GHL_CONFIG.baseUrl}/contacts/?locationId=${GHL_CONFIG.locationId}&limit=5`, {
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                'Version': '2021-07-28'
            }
        });
        const data = await res.json();
        console.log('Recent Contacts:', data.contacts ? data.contacts.map(c => ({
            id: c.id,
            name: c.contactName || c.firstName + ' ' + c.lastName,
            email: c.email,
            phone: c.phone,
            dateAdded: c.dateAdded
        })) : data);

        console.log('\nFetching Opportunities (expert path zLqAUFVD2Bfub4EP54lL)...');
        // Let's search opportunities using pipelines
        const oppRes = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/search?location_id=${GHL_CONFIG.locationId}&pipeline_id=zLqAUFVD2Bfub4EP54lL`, {
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                'Version': '2021-07-28'
            }
        });
        const oppData = await oppRes.json();
        console.log('Recent Opportunities:', oppData.opportunities ? oppData.opportunities.slice(0, 5).map(o => ({
            id: o.id,
            name: o.name,
            contactId: o.contactId,
            createdAt: o.createdAt
        })) : oppData);

    } catch (err) {
        console.error(err);
    }
}
check();
