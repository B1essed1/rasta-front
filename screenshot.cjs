const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

const PAGES = [
  { name: 'mobile-landing', url: 'http://localhost:5173/', viewport: { width: 390, height: 844 } },
  { name: 'mobile-storefront', url: 'http://localhost:5173/mysnickers', viewport: { width: 390, height: 844 } },
  { name: 'mobile-bio', url: 'http://localhost:5173/mysnickers/link', viewport: { width: 390, height: 844 } },
  { name: 'mobile-explore', url: 'http://localhost:5173/explore', viewport: { width: 390, height: 844 } },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  for (const pg of PAGES) {
    const page = await browser.newPage();
    await page.setViewport(pg.viewport);
    try {
      await page.goto(pg.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) { await new Promise(r => setTimeout(r, 1000)); }
    await page.screenshot({ path: path.join(dir, `${pg.name}.png`), fullPage: false });
    console.log(`OK: ${pg.name}`);
    await page.close();
  }
  await browser.close();
  console.log('DONE');
})();
