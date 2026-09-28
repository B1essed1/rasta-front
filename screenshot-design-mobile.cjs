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
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const page = await browser.newPage();
  // The mobile preview page shows a phone frame - screenshot the whole page
  await page.setViewport({ width: 900, height: 900 });
  try {
    await page.goto(DESIGN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));
  } catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  await page.screenshot({ path: path.join(dir, 'design-mobile-preview.png'), fullPage: false });
  console.log('OK: design-mobile-preview');

  // Now screenshot just the iframe content at phone width
  await page.setViewport({ width: 390, height: 844 });
  const rasta = "https://b04c05a3-674f-47e4-852c-12dbdfa9c5ec.claudeusercontent.com/v1/design/projects/b04c05a3-674f-47e4-852c-12dbdfa9c5ec/serve/rasta.html?t=7a63b761d43f8f44f93fcac226a9199040c9344bdd192f8e91c372ff3ea4430b.aba3ee41-ffb8-4866-96bd-944994a1f14b.7f2db480-e175-4e15-85ad-41f4fad91dea.1790586205&direct=1";
  try {
    await page.goto(rasta, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  await page.screenshot({ path: path.join(dir, 'design-mobile-landing.png'), fullPage: false });
  console.log('OK: design-mobile-landing');

  // Switch to storefront
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.switcher button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('store')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(dir, 'design-mobile-storefront.png'), fullPage: false });
  console.log('OK: design-mobile-storefront');

  // Switch to bio
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.switcher button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('bio')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(dir, 'design-mobile-bio.png'), fullPage: false });
  console.log('OK: design-mobile-bio');

  // Switch to explore
  await page.evaluate(() => {
    const btns = document.querySelectorAll('.switcher button');
    for (const btn of btns) { if (btn.textContent.toLowerCase().includes('explore')) { btn.click(); return; } }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(dir, 'design-mobile-explore.png'), fullPage: false });
  console.log('OK: design-mobile-explore');

  await browser.close();
  console.log('DONE');
})();
