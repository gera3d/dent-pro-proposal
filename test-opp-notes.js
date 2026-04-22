const GHL_CONFIG = {
    accessToken: process.env.GHL_ACCESS_TOKEN || '',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function testOppNotes() {
    const oppId = 'Lu3h39OGPMZ7yNByYRB4'; // from the 3rd test

    const payload = {
        body: "Categorized Note:\nFront: link",
        userId: "D0d4WknnxH0DTw39xHxA"
    };

    const res = await fetch(`${GHL_CONFIG.baseUrl}/opportunities/${oppId}/notes`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    console.log(await res.json());
}
testOppNotes();
