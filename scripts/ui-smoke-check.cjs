const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.resolve('test-results/ui-smoke');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.evaluate(() => localStorage.setItem('dent_pro_theme', 'light'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    if (typeof switchMode === 'function') switchMode('scoper');
    const tab = document.getElementById('tab-voil');
    const panel = document.getElementById('panel-voil');
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('panel-open');

    const upload = document.getElementById('photoUploadStatus');
    const fill = document.getElementById('photoProgressFill');
    const text = document.getElementById('photoStatusText');
    const section = upload?.closest('.photo-section');
    const scopeForm = document.getElementById('scopeForm');
    if (scopeForm) scopeForm.style.display = '';
    if (section) section.style.display = 'block';
    if (upload) upload.style.display = 'block';
    if (fill) fill.style.width = '62%';
    if (text) text.textContent = 'Uploading 37 photos...';

    const mgr = document.getElementById('bgUploadManager');
    const mgrBar = document.getElementById('bgUploadProgressBar');
    const mgrText = document.getElementById('bgUploadText');
    if (mgr) mgr.classList.add('show');
    if (mgrBar) mgrBar.style.width = '62%';
    if (mgrText) mgrText.innerHTML = 'Uploading <span class="bg-upload-count">14</span> photos to Drive...';
  });

  await page.locator('#panel-voil .cat-controls').scrollIntoViewIfNeeded();
  await page.locator('#panel-voil .cat-controls').screenshot({ path: path.join(outDir, 'light-photo-buttons.png') });
  await page.locator('#photoUploadStatus').screenshot({ path: path.join(outDir, 'light-photo-upload-status.png') });
  await page.locator('#bgUploadManager').screenshot({ path: path.join(outDir, 'light-bg-upload-manager.png') });

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
        'Estimator': 'Jordan P',
        'Notes': 'Customer requested front-left priority repair.'
      }
    }];

    if (typeof switchMode === 'function') switchMode('records');
    if (typeof renderRecordsList === 'function') renderRecordsList(allRecords);
    if (typeof openRecordDetail === 'function') openRecordDetail('mock1');
  });

  await page.waitForTimeout(1000);
  await page.locator('.record-group-grid').first().screenshot({ path: path.join(outDir, 'light-records-dashboard.png') });
  await page.locator('#recordDetailModal.show .record-detail-modal').screenshot({ path: path.join(outDir, 'light-record-profile-modal.png') });

  await browser.close();
  console.log('Screenshots written to', outDir);
})();
