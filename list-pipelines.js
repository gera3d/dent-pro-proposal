const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function listPipelines() {
    console.log('Fetching pipelines...');
    const res = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/pipelines?locationId=${GHL_CONFIG.locationId}`, {
        headers: {
            Authorization: `Bearer ${GHL_CONFIG.accessToken}`,
            Version: '2021-07-28'
        }
    });

    if (!res.ok) {
        console.log('Failed:', res.status, await res.text());
        return;
    }

    const data = await res.json();
    const pipelines = data.pipelines || [];

    console.log(`Found ${pipelines.length} pipelines.`);
    for (const p of pipelines) {
        console.log(`\nPipeline: ${p.name} (ID: ${p.id})`);
        const stages = p.stages || [];
        for (const s of stages) {
            console.log(`  - Stage: ${s.name} (ID: ${s.id})`);
        }
    }
}

listPipelines();
