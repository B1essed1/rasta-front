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
if (!DESIGN_URL) { console.error('Usage: node screenshot-design.cjs <serve_url>'); process.exit(1); }

const VIEWS = ['landing', 'explore', 'store', 'bio'];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Load the design
  try {
    await page.goto(DESIGN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log('NAV_WARN:', e.message);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Screenshot initial view (landing)
  await page.screenshot({ path: path.join(dir, 'design-landing.png'), fullPage: false });
  console.log('OK: design-landing');

  // Click through switcher buttons for each view
  for (const view of VIEWS.slice(1)) {
    try {
      // The design has a .switcher at the bottom with buttons
      const clicked = await page.evaluate((v) => {
        const btns = document.querySelectorAll('.switcher button');
        for (const btn of btns) {
          if (btn.textContent.toLowerCase().includes(v)) {
            btn.click();
            return true;
          }
        }
        return false;
      }, view);
      if (clicked) {
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(dir, `design-${view}.png`), fullPage: false });
        console.log(`OK: design-${view}`);
      } else {
        console.log(`SKIP: design-${view} (button not found)`);
      }
    } catch (e) {
      console.log(`ERR: design-${view} - ${e.message}`);
    }
  }

  // Mobile views
  await page.setViewport({ width: 390, height: 844 });

  // Switch back to store (storefront)
  try {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.switcher button');
      for (const btn of btns) { if (btn.textContent.toLowerCase().includes('store')) { btn.click(); return; } }
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(dir, 'design-storefront-mobile.png'), fullPage: false });
    console.log('OK: design-storefront-mobile');
  } catch (e) { console.log('ERR:', e.message); }

  // Bio mobile
  try {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.switcher button');
      for (const btn of btns) { if (btn.textContent.toLowerCase().includes('bio')) { btn.click(); return; } }
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(dir, 'design-bio-mobile.png'), fullPage: false });
    console.log('OK: design-bio-mobile');
  } catch (e) { console.log('ERR:', e.message); }

  // Landing mobile
  try {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.switcher button');
      for (const btn of btns) { if (btn.textContent.toLowerCase().includes('landing')) { btn.click(); return; } }
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(dir, 'design-landing-mobile.png'), fullPage: false });
    console.log('OK: design-landing-mobile');
  } catch (e) { console.log('ERR:', e.message); }

  await browser.close();
  console.log('ALL DONE');
})();
