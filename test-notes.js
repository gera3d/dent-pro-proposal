const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function testNotes() {
    const contactId = 'wxbnWTqVuZRlu7WVKkol';
    const payload = {
        body: "Attached Images:\nhttps://example.com/image1.jpg\nhttps://example.com/image2.jpg",
        userId: "D0d4WknnxH0DTw39xHxA" // user id from config
    };

    const res = await fetch(`${GHL_CONFIG.baseUrl}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    console.log(await res.json());
}
testNotes();
