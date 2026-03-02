const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Catch console logs from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log("Navigating to localhost:8080...");
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });
    
    console.log("Filling form...");
    await page.type('#roNumber', 'TEST-GHL-001');
    await page.type('#insuredName', 'John Tester');
    await page.type('#emailBox', 'john.tester@example.com');
    await page.type('#phoneBox', '555-0100');
    await page.type('#vinString', 'TESTVIN123456');
    await page.type('#yearString', '2024');
    await page.type('#makeString', 'Toyota');
    await page.type('#modelString', 'Camry');
    
    console.log("Uploading photo...");
    // The photo input element for scope
    const fileInput = await page.$('#cameraInputScope');
    await fileInput.uploadFile('/Users/gerayeremin/Documents/Dent Pro/test_image.png');
    
    // Wait for the thumbnail to render
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Adding dent to Left Rail...");
    // Find the left rail DC plus button
    await page.evaluate(() => {
        const plusButton = document.querySelector('.panel-box:first-of-type .stepper-btn.plus');
        if (plusButton) plusButton.click();
    });
    
    console.log("Clicking submit...");
    await page.evaluate(() => {
        document.querySelector('.export-btn').click();
    });
    
    console.log("Waiting for Toast or completion...");
    // Wait for either the success checkmark or failure to appear in the toast/button
    await new Promise(r => setTimeout(r, 15000));
    
    console.log("Done checking.");
    await browser.close();
})();
