const driveScriptUrl = 'https://script.google.com/macros/s/AKfycbzliw6vJpduhKK5EUPQ1uJUu37NdPCiYJ4xSI2pP1Em6Qr_pjNqFvhA9HW3y0rkVwFQyw/exec';

async function testDriveUpload() {
    const timestamp = new Date().getTime();
    const folderName = `Testing Name - 2026 Acura 100 - ${timestamp}`;

    console.log(`Starting Drive Test...`);
    console.log(`Target Folder Creation: ${folderName}`);

    const payload = {
        action: 'createFolder',
        folderName: folderName
    };

    console.log('Payload:', payload);

    try {
        const response = await fetch(driveScriptUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Result:', result);

        if (result.success) {
            console.log(`SUCCESS! Folder URL: ${result.folderUrl}`);
        } else {
            console.error(`FAILED:`, result.error);
        }

    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testDriveUpload();
