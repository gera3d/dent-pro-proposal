const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Catch console logs from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('dialog', async dialog => {
        console.log('DIALOG:', dialog.message());
        await dialog.accept();
    });

    console.log("Navigating to localhost:8080...");
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });
    
    console.log("Filling form...");
    await page.type('#roNumber', 'TEST-GHL-001');
    await page.type('#insuredName', 'John Tester');
    await page.type('#customerEmail', 'john.tester@example.com');
    await page.type('#customerPhone', '555-0100');
    await page.type('#claimNumber', 'CLM-1234');
    await page.type('#vin', 'TESTVIN123456');
    await page.type('#model', 'Camry');
    
    // Select dropdowns
    await page.evaluate(() => {
        const yearOpt = Array.from(document.querySelectorAll('#year option')).find(o => o.value);
        if(yearOpt) document.querySelector('#year').value = yearOpt.value;
        const makeOpt = Array.from(document.querySelectorAll('#make option')).find(o => o.value);
        if(makeOpt) document.querySelector('#make').value = makeOpt.value;
    });
    
    console.log("Adding dent to Left Rail...");
    await page.evaluate(() => {
        const plusButton = document.querySelector('.panel-box:first-of-type .stepper-btn.plus');
        if (plusButton) plusButton.click();
    });
    
    console.log("Uploading photo via file input...");
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
        // usually it's the second one (VIN scanner is first)
        const photoInput = fileInputs.length > 1 ? fileInputs[1] : fileInputs[0];
        await photoInput.uploadFile(path.resolve('../test_image.png'));
    }

    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Clicking submit...");
    await page.click('#submitBtn');
    
    console.log("Waiting for Toast or completion logs...");
    await new Promise(r => setTimeout(r, 15000));
    
    console.log("Done checking.");
    await browser.close();
})();
