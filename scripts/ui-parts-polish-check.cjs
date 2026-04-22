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
    const panelData = {
      rrParts: {
        hood_rr_hood: true,
        lf_fender_rr_lamp: true,
        rf_door_rr_molding: true,
        roof_rr_glass: true
      },
      partOrders: {
        hood_rr_hood: { status: 'not_ordered', partNumber: '', vendor: '', eta: '', notes: '' },
        lf_fender_rr_lamp: { status: 'ordered', partNumber: 'LMP-8821', vendor: 'Dealer', eta: '3/14', notes: 'Rush' },
        rf_door_rr_molding: { status: 'received', partNumber: 'MLD-110', vendor: 'LKQ', eta: 'Arrived', notes: '' },
        roof_rr_glass: { status: 'replaced', partNumber: 'GLS-732', vendor: 'Keystone', eta: '', notes: 'Installed' }
      }
    };

    allVehicles = [{
      id: 'veh1',
      fields: {
        'RO Number': 'RO-7721',
        'Customer Name': 'Michael Torres',
        'Location': 'Phoenix AZ',
        'Year': '2022',
        'Make': 'Toyota',
        'Model': 'Tundra',
        'Color': 'Magnetic Gray',
        'VIN': '5TFMA5DB5NX012345',
        'Insurance Company': 'Progressive',
        'Submitted At': new Date().toISOString(),
        'Panel Data': JSON.stringify(panelData)
      }
    }];

    switchMode('parts');
    renderVehicleList(allVehicles);
    openPartDetail('veh1');
  });

  await page.waitForTimeout(700);
  await page.locator('#partsTechDashboard .vehicle-list').screenshot({ path: path.join(outDir, 'light-parts-dashboard.png') });
  await page.locator('#partDetailModal.show .part-detail-modal').screenshot({ path: path.join(outDir, 'light-parts-detail-modal.png') });
  await page.locator('#partDetailModal.show #progressTracker').screenshot({ path: path.join(outDir, 'light-parts-progress-tracker.png') });
  await page.locator('#partDetailModal.show #rrPartsList').screenshot({ path: path.join(outDir, 'light-parts-rows.png') });

  await browser.close();
  console.log('Saved screenshots to', outDir);
})();
