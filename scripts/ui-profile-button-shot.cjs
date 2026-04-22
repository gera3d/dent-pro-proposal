const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.resolve('test-results/ui-smoke');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('dent_pro_theme', 'light'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    allRecords = [{
      id: 'mock1',
      fields: {
        'Submitted At': new Date().toISOString(),
        'Status': 'In Progress',
        'RO Number': 'RO-8812',
        'Customer Name': 'Alexandria Montgomery',
        'Customer Email': 'alexandria.montgomery@example.com',
        'Customer Phone': '(555) 238-9914',
        'Claim Number': 'CLM-554203',
        'Insurance Company': 'State Farm',
        'Photo Count': 37,
        'Location': 'Denver CO',
        'Year': '2023',
        'Make': 'Ford',
        'Model': 'F-150 Lightning',
        'Color': 'Star White',
        'VIN': '1FT6W1EV1PWG12345',
        'Odometer': '18,220',
        'Estimator': 'Jordan P'
      }
    }];
    switchMode('records');
    renderRecordsList(allRecords);
    openRecordDetail('mock1');
  });

  await page.waitForTimeout(800);
  await page.locator('#topBarContractSelect').screenshot({ path: path.join(outDir, 'light-profile-template-button.png') });
  await page.locator('#recordDetailModal.show .modal-top-bar').screenshot({ path: path.join(outDir, 'light-profile-topbar.png') });

  await browser.close();
  console.log('Saved screenshots to', outDir);
})();
