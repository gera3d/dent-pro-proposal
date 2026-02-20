const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function cleanupOpportunities() {
    try {
        console.log('Fetching Opportunities from Repair Tracker (JptjUQHom2aW3y3MGc2g)...');
        const searchUrl = `${GHL_CONFIG.baseUrl}/opportunities/search?location_id=${GHL_CONFIG.locationId}&pipeline_id=JptjUQHom2aW3y3MGc2g`;
        const res = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                'Version': '2021-07-28'
            }
        });
        const data = await res.json();
        const opps = data.opportunities || [];
        console.log(`Found ${opps.length} opportunities.`);

        for (const opp of opps) {
            // Delete opportunities containing "Test" or "E2E"
            if (opp.name.toLowerCase().includes('test') || opp.name.toLowerCase().includes('e2e')) {
                console.log(`Deleting: ${opp.name} (${opp.id})...`);
                const delRes = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/${opp.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                        'Version': '2021-07-28'
                    }
                });
                if (delRes.ok) {
                    console.log(`✅ Deleted ${opp.id}`);
                } else {
                    console.error(`❌ Failed to delete ${opp.id}:`, await delRes.text());
                }
            }
        }
        console.log('Cleanup finished.');
    } catch (err) {
        console.error(err);
    }
}
cleanupOpportunities();
