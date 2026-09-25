const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Login first — set a token in localStorage
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Try to login via the API and set the token
  const loginResult = await page.evaluate(async () => {
    try {
      // Send OTP
      await fetch('http://localhost:8080/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+998901234567' }),
      });
      // Verify with test code
      const res = await fetch('http://localhost:8080/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+998901234567', code: '123456' }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.data?.token;
        const user = data.user || data.data?.user;
        if (token) {
          localStorage.setItem('rasta_token', token);
          localStorage.setItem('rasta_user', JSON.stringify(user));
          return { ok: true, token: token.substring(0, 20) + '...' };
        }
      }
      return { ok: false, status: res.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  console.log('Login:', JSON.stringify(loginResult));

  if (loginResult.ok) {
    // Navigate to inventory
    await page.goto('http://localhost:5173/dashboard/inventory', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(dir, 'inventory-new.png'), fullPage: false });
    console.log('OK: inventory-new');

    // Design view
    await page.goto('http://localhost:5173/dashboard/design', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    // Scroll down to see bio section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(dir, 'design-bio-section.png'), fullPage: false });
    console.log('OK: design-bio-section');
  } else {
    console.log('Login failed, taking unauthenticated screenshots');
    await page.goto('http://localhost:5173/dashboard/inventory', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(dir, 'inventory-noauth.png'), fullPage: false });
    console.log('OK: inventory-noauth (redirected to login)');
  }

  await browser.close();
  console.log('DONE');
})();
