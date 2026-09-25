const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

const DESIGN_URL = "https://b04c05a3-674f-47e4-852c-12dbdfa9c5ec.claudeusercontent.com/v1/design/projects/b04c05a3-674f-47e4-852c-12dbdfa9c5ec/serve/rasta.html?t=2c1a28174f285758d1b8ad97ec1997c0ca0d53b1dfe75a42dbf14185fa49862e.aba3ee41-ffb8-4866-96bd-944994a1f14b.7f2db480-e175-4e15-85ad-41f4fad91dea.1790323920&direct=1";

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Load design
  try {
    await page.goto(DESIGN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log('NAV_WARN:', e.message);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Click Dashboard in the switcher
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.switcher button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('dashboard')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click Inventory tab in the dashboard sidebar
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.db-nav button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('inventor') || btn.textContent.toLowerCase().includes('склад') || btn.textContent.toLowerCase().includes('ombor')) { btn.click(); return true; } }
    return false;
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(dir, 'design-inventory.png'), fullPage: false });
  console.log('OK: design-inventory');

  // Click Design tab
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.db-nav button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('design') || btn.textContent.toLowerCase().includes('дизайн') || btn.textContent.toLowerCase().includes('dizayn')) { btn.click(); return true; } }
    return false;
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll down for bio section
  await page.evaluate(() => {
    const body = document.querySelector('.db-body');
    if (body) body.scrollTop = body.scrollHeight;
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(dir, 'design-dashboard-design.png'), fullPage: false });
  console.log('OK: design-dashboard-design');

  await browser.close();
  console.log('DONE');
})();
