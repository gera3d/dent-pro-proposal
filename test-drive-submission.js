const driveScriptUrl = 'https://script.google.com/macros/s/AKfycbzP09CjY8iNGCDR4QmnAEQ_d2szkJxp286hoqgYWsSey2bfjcLakoF0zLzy_MnB-FIq9w/exec';

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
