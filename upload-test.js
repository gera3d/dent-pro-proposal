const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Listen to console logs
    page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Airtable Error Response')) {
            console.log('--- EXTRACTED AIRTABLE ERROR ---');
            console.log(msg.text());
            console.log('---------------------------------');
        }
        else if (msg.type() === 'error') {
            console.log('Browser Error:', msg.text());
        }
        else {
            console.log('Browser Log:', msg.text());
        }
    });

    await page.goto('http://localhost:8768/index.html', { waitUntil: 'networkidle0' });

    await page.evaluate(async () => {
        document.getElementById('insuredName').value = 'Test User';
        document.getElementById('claimNumber').value = 'TEST-123';
        selectedPhotos = [{
            base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            mimeType: 'image/png',
            name: 'TEST.png',
            label: 'TEST.png',
            category: 'scope'
        }];

        try {
            await submitData();
        } catch (e) {
            console.error(e);
        }
    });

    await new Promise(r => setTimeout(r, 15000));
    await browser.close();
})();
