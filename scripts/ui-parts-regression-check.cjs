const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 1024 } });
  const report = [];

  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('dent_pro_theme', 'light'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.getByRole('tab', { name: 'Parts' }).click();
  await page.waitForTimeout(1200);

  const targetRo = 'DE-260329-YJE-002';
  const card = page.locator('.vehicle-card').filter({ hasText: targetRo }).first();
  await card.click();
  await page.waitForTimeout(300);

  const cases = [
    { name: 'iphone-390x844', width: 390, height: 844, addNative: true },
    { name: 'ipad-768x1024', width: 768, height: 1024, addNative: true },
    { name: 'ipad-landscape-1024x768', width: 1024, height: 768, addNative: true },
    { name: 'ipad-pro-1366x1024-touch-classes', width: 1366, height: 1024, addNative: true },
    { name: 'desktop-1366x1024-no-classes', width: 1366, height: 1024, addNative: false },
  ];

  for (const c of cases) {
    await page.setViewportSize({ width: c.width, height: c.height });
    await page.evaluate((addNative) => {
      document.documentElement.classList.remove('native-wrapper', 'apple-touch');
      document.body.classList.remove('native-wrapper');
      if (addNative) {
        document.documentElement.classList.add('native-wrapper', 'apple-touch');
        document.body.classList.add('native-wrapper');
      }
    }, c.addNative);

    await page.waitForTimeout(120);

    const metrics = await page.evaluate(() => {
      const modal = document.querySelector('#partDetailModal.show .part-detail-modal');
      const content = document.querySelector('#partDetailModal.show .record-detail-content');
      const sections = Array.from(document.querySelectorAll('#partDetailModal.show .record-detail-section'));
      const orderSection = sections[1];
      const progressSection = sections[2];
      const partsSection = sections[3];
      const etaInput = document.querySelector('#partEtaDate');
      const etaShell = document.querySelector('#partDetailModal .eta-date-shell');
      const closeBtn = document.querySelector('#partDetailModal.show .modal-close-btn');
      const closeIcon = closeBtn ? closeBtn.querySelector('.lucide-icon, svg') : null;
      const required = [modal, content, orderSection, progressSection, partsSection, etaInput, etaShell, closeBtn, closeIcon];

      if (required.some((el) => !el)) return { missing: true };

      const rect = (el) => el.getBoundingClientRect();
      const orderRect = rect(orderSection);
      const progressRect = rect(progressSection);
      const partsRect = rect(partsSection);
      const etaRect = rect(etaInput);
      const etaShellRect = rect(etaShell);
      const closeBtnRect = rect(closeBtn);
      const closeIconRect = rect(closeIcon);

      return {
        missing: false,
        contentDisplay: getComputedStyle(content).display,
        orderProgressGap: progressRect.top - orderRect.bottom,
        progressPartsGap: partsRect.top - progressRect.bottom,
        etaOverflowRight: etaRect.right - etaShellRect.right,
        etaOverflowBottom: etaRect.bottom - etaShellRect.bottom,
        closeDx: Math.abs((closeBtnRect.left + closeBtnRect.width / 2) - (closeIconRect.left + closeIconRect.width / 2)),
        closeDy: Math.abs((closeBtnRect.top + closeBtnRect.height / 2) - (closeIconRect.top + closeIconRect.height / 2)),
        scrollable: content.scrollHeight > content.clientHeight,
      };
    });

    const expectSingleColumn = c.addNative || c.width < 1200;
    const noSectionOverlap = expectSingleColumn
      ? metrics.orderProgressGap >= -1 && metrics.progressPartsGap >= -1
      : true;
    const pass = !metrics.missing
      && noSectionOverlap
      && metrics.etaOverflowRight <= 1
      && metrics.etaOverflowBottom <= 1
      && metrics.closeDx <= 1.5
      && metrics.closeDy <= 1.5;

    report.push({ case: c.name, pass, ...metrics });
  }

  await page.evaluate(() => {
    const modal = document.getElementById('partDetailModal');
    if (modal?.classList.contains('show')) closePartDetail();
  });
  await page.waitForTimeout(250);

  await page.getByRole('tab', { name: 'Records' }).click();
  await page.waitForTimeout(1200);
  let resumeResult = { tested: false };
  const firstRecord = page.locator('#recordsList .record-card').first();
  await firstRecord.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  if (await firstRecord.count()) {
    await firstRecord.click();
    await page.waitForTimeout(300);
    const modalOpen = await page.evaluate(() => document.getElementById('recordDetailModal')?.classList.contains('show') || false);
    if (!modalOpen) {
      resumeResult = { tested: false, reason: 'record-modal-not-open' };
    } else {
      const btn = page.locator('#recordDetailFooterContainer .load-to-form-btn').first();
      const box = await btn.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
        resumeResult = await page.evaluate(() => {
          const mode = document.querySelector('.mode-toggle')?.dataset?.activeMode || null;
          const recVisible = document.getElementById('recordDetailModal')?.classList.contains('show') || false;
          return { tested: true, mode, recordModalVisible: recVisible, pass: mode === 'scoper' && recVisible === false };
        });
      } else {
        resumeResult = { tested: false, reason: 'resume-button-box-missing' };
      }
    }
  } else {
    resumeResult = { tested: false, reason: 'records-list-empty' };
  }

  await browser.close();
  console.log(JSON.stringify({ report, resumeResult }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
