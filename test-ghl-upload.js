const fs = require('fs');

const GHL_CONFIG = {
    accessToken: 'pit-a8576171-f084-46c5-8b31-e8bd0d05da79',
    locationId: 'AAzBZNLXS4rdwhG76MLi',
    baseUrl: 'https://services.leadconnectorhq.com',
};

async function testUpload() {
    try {
        // Create a dummy image file
        fs.writeFileSync('dummy.jpg', 'fake image content');
        const fileBuffer = fs.readFileSync('dummy.jpg');

        const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
        const fd = new FormData();
        fd.append('file', blob, 'dummy.jpg');
        fd.append('name', 'dummy_app_test.jpg');

        console.log('Testing v2 medias/upload-file endpoint...');

        const res = await fetch(`${GHL_CONFIG.baseUrl}/medias/upload-file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.accessToken}`,
                'Version': '2021-07-28'
            },
            // fetch handles boundary for FormData automatically
            body: fd
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', data);
    } catch (err) {
        console.error(err);
    }
}
testUpload();
