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
      rrParts: { hood_rr_hood: true, lf_fender_rr_lamp: true, rf_door_rr_molding: true },
      partOrders: {
        hood_rr_hood: { status: 'not_ordered' },
        lf_fender_rr_lamp: { status: 'ordered' },
        rf_door_rr_molding: { status: 'received' }
      }
    };
    allVehicles = [{
      id: 'veh1',
      fields: {
        'RO Number': 'RO-7721', 'Customer Name': 'Michael Torres', 'Location': 'Phoenix AZ',
        'Year': '2022', 'Make': 'Toyota', 'Model': 'Tundra', 'Color': 'Magnetic Gray',
        'Panel Data': JSON.stringify(panelData)
      }
    }];
    switchMode('parts');
    renderVehicleList(allVehicles);
  });

  await page.waitForTimeout(500);
  await page.locator('#partsTechDashboard').screenshot({ path: path.join(outDir, 'light-parts-dashboard-clean.png') });
  await browser.close();
  console.log('Saved screenshot');
})();
