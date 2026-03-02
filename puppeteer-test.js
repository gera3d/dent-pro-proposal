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
    // Find the left rail DC plus button
    await page.evaluate(() => {
        const plusButton = document.querySelector('.panel-box:first-of-type .stepper-btn.plus');
        if (plusButton) plusButton.click();
    });
    
    console.log("Uploading photo via page evaluate dispatchEvent...");
    // The photo flow uses a button that shows options. Let's just manually push to selectedPhotos.
    await page.evaluate(async () => {
       // Create a minimal fake 1x1 image Data URL
       const fakeData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
       // Add it to selectedPhotos
       window.selectedPhotos.push(fakeData);
       // we need selectedPhotos to be global, but it's block-scoped. 
       // If it's block-scoped, let's trigger the file input instead.
       
       // Just find a valid hidden cameraInput and trigger change
       const scopeBtn = document.querySelector('#tab-scope');
       if(scopeBtn) scopeBtn.click();
    });

    // Actually, we can just use the DOM elements via Puppeteer:
    const fileInput = await page.$('.cat-photo-strip ~ input[type="file"], input[type="file"]');
    if (fileInput) {
        await fileInput.uploadFile('/Users/gerayeremin/Documents/Dent Pro/test_image.png');
    }

    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Clicking submit...");
    await page.evaluate(() => {
        document.querySelector('.export-btn').click();
    });
    
    console.log("Waiting for Toast or completion...");
    // Wait for the text of the submit button to imply success or failure
    await new Promise(r => setTimeout(r, 10000));
    
    console.log("Done checking.");
    await browser.close();
})();
