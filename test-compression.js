const { chromium } = require('playwright');
const fs = require('fs');

async function testCompression() {
    console.log('Starting Playwright test for Image Compression...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const logs = [];
    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    console.log('Navigating to local Dent Pro app...');
    await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });

    console.log('Testing image compression function...');
    // Create a 2MB dummy image to compress right in the browser
    const result = await page.evaluate(async () => {
        try {
            if (typeof imageCompression === 'undefined') {
                return { error: 'imageCompression is not defined on window' };
            }
            // Generate a 2MB white square canvas
            const canvas = document.createElement('canvas');
            canvas.width = 1500;
            canvas.height = 1500;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 1500, 1500);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1.0));
            var file = new File([blob], "test-image.jpg", { type: "image/jpeg" });

            console.log("Original File size:", file.size);

            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1600,
                initialQuality: 0.7,
                useWebWorker: false
            };

            const compressedBlob = await imageCompression(file, options);
            console.log("Compressed Blob size:", compressedBlob.size);
            return { success: true, originalSize: file.size, targetSize: compressedBlob.size };
        } catch (e) {
            console.error("Compression exception:", e.toString(), e.stack);
            return { error: e.toString(), stack: e.stack };
        }
    });

    console.log('Compression Test Result:', result);
    await browser.close();
}

testCompression().catch(console.error);
