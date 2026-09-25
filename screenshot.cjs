const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

const DESIGN_URL = process.argv[2];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    await page.goto(DESIGN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log('NAV:', e.message);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Go to Dashboard
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.switcher button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('dashboard')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click Inventory tab
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.db-nav button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('inventor') || btn.textContent.toLowerCase().includes('склад') || btn.textContent.toLowerCase().includes('ombor')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(dir, 'design-inv-stock.png'), fullPage: false });
  console.log('OK: design-inv-stock');

  // Click History tab
  const clickedHist = await page.evaluate(() => {
    const btns = document.querySelectorAll('.inv-tabs button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('histor') || btn.textContent.toLowerCase().includes('истори') || btn.textContent.toLowerCase().includes('tarix')) { btn.click(); return true; } }
    return false;
  });
  console.log('Clicked History:', clickedHist);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(dir, 'design-inv-history.png'), fullPage: false });
  console.log('OK: design-inv-history');

  // Click Sales tab
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.db-nav button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('sales') || btn.textContent.toLowerCase().includes('продаж') || btn.textContent.toLowerCase().includes('sotuv')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(dir, 'design-sales.png'), fullPage: false });
  console.log('OK: design-sales');

  // Click an Adjust modal - click qty button on first row
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.db-nav button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('inventor') || btn.textContent.toLowerCase().includes('склад') || btn.textContent.toLowerCase().includes('ombor')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 1500));
  // back to stock tab
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.inv-tabs button');
    if (btns[0]) btns[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));
  // click first qty-btn
  await page.evaluate(() => {
    const btn = document.querySelector('.qty-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(dir, 'design-inv-adjust.png'), fullPage: false });
  console.log('OK: design-inv-adjust');

  await browser.close();
  console.log('DONE');
})();
