// Route behaviour check (not pixels): every URL opens the right page, clicks change the URL,
// Back/Forward work, and the prototype's ?view=/?p=/?b=/?tab= links redirect.
//   node scripts/routes.mjs            (starts vite on :5175 unless APP_URL is set)
import { chromium } from 'playwright';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FRONT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 5175;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function startApp() {
  if (process.env.APP_URL) return { url: process.env.APP_URL.replace(/\/$/, ''), stop() {} };
  const vite = spawn(process.execPath, [path.join(FRONT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(PORT), '--strictPort'],
    { cwd: FRONT, stdio: 'ignore' });
  const url = `http://localhost:${PORT}`;
  for (let t = Date.now(); !(await fetch(url).then(r => r.ok, () => false)); await sleep(300))
    if (Date.now() - t > 60000) { vite.kill(); throw new Error('vite did not start'); }
  return { url, stop: () => vite.kill() };
}

const app = await startApp();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const errors = [];
let page;
async function fresh(w = 1280) {
  if (page) await page.context().close();
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  await ctx.route(/images\.unsplash\.com/, r => r.abort());   // photos are irrelevant here
  page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message.split('\n')[0]));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text().split('\n')[0]); });
  await page.goto(app.url + '/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
}
const open = async p => { await page.goto(app.url + p, { waitUntil: 'domcontentloaded' }); await sleep(700); };
const url = () => { const u = new URL(page.url()); return u.pathname + u.search; };
const has = sel => page.locator(sel).first().isVisible().catch(() => false);
async function check(name, wantPath, sel) {
  await sleep(500);
  const got = url(), okPath = wantPath instanceof RegExp ? wantPath.test(got) : got === wantPath;
  const okSel = sel ? await has(sel) : true;
  results.push([okPath && okSel, name, got, okSel ? '' : `missing ${sel}`]);
}
const login = () => page.evaluate(() => window.__shopStore.login('+998 97 700 30 40', { name: 'Malika Yusupova' }));

try {
  await fresh();
  // direct URLs
  await open('/'); await check('/ → landing', '/', '.lp');
  await open('/explore'); await check('/explore → explore', '/explore', '.ex-cat-all');
  await open('/lolaatelier'); await check('/:handle → storefront', '/lolaatelier', '.storefront .pcard');
  await open('/tashkentkicks'); await check('/:handle other shop', '/tashkentkicks', '.storefront .pcard');
  await open('/lolaatelier/link'); await check('/:handle/link → bio', '/lolaatelier/link', '.bio-links');
  await open('/login'); await check('/login', '/login', '.ob');
  await open('/new'); await check('/new → onboarding', '/new', '.ob, .o2');
  await open('/me'); await check('/me → buyer profile', '/me', '.by-top');
  await open('/dashboard/sales'); await check('/dashboard/:tab without session → /login', '/login', '.ob');
  await open('/nosuchshop'); await check('unknown handle → /', '/', '.lp');

  // storefront → product → Back
  await open('/lolaatelier');
  const pid = await page.evaluate(() => window.__shopStore.products('lola')[0].id);
  await page.locator('.storefront .pcard').first().click();
  await check('click product → /:handle/p/:id', /^\/lolaatelier\/p\/[^/]+$/, '.buy-box');
  await page.goBack(); await check('Back → /:handle, product closed', '/lolaatelier', '.storefront .pcard');
  await page.goForward(); await check('Forward → product again', /^\/lolaatelier\/p\//, '.buy-box');
  await open(`/lolaatelier/p/${pid}`); await check('deep link /:handle/p/:id', `/lolaatelier/p/${pid}`, '.buy-box');

  // explore → shop / product
  await open('/explore');
  await page.locator('.mkt-card').first().click();
  await check('explore shop card → /:handle', /^\/[a-z0-9]+$/, '.storefront');
  await page.goBack(); await check('Back → /explore', '/explore', '.ex-cat-all');
  await page.locator('.ex-cat-strip button').nth(1).click(); await sleep(400);
  const exProd = page.locator('.ex-prods > *').first();
  if (await exProd.count()) { await exProd.click(); await check('explore product → /:handle/p/:id', /^\/[a-z0-9]+\/p\/[^/]+$/, '.buy-box'); }
  else results.push([false, 'explore product → /:handle/p/:id', url(), 'no .ex-prods item']);

  // dashboard tabs
  await open('/'); await login();
  await open('/dashboard'); await check('/dashboard → /dashboard/home', '/dashboard/home', '.db');
  await open('/dashboard/sales'); await check('/dashboard/sales', '/dashboard/sales', '.db');
  await page.locator('.db-nav button').nth(1).click(); await check('click tab → /dashboard/:tab', '/dashboard/requests', '.db');
  await page.goBack(); await check('Back → previous tab', '/dashboard/sales', '.db');

  // basket link
  const code = await page.evaluate(() => { const st = window.__shopStore; for (const s of st.state.order) { const r = st.requests(s)[0]; if (r) return r.code; } return 'NONE'; });
  await open('/b/' + code); await check('/b/:code → basket link (found)', '/b/' + code, `.ob-head h2:has-text("${code}")`);

  // the prototype's links
  await fresh();
  await open('/?view=explore'); await check('?view=explore → /explore', '/explore', '.ex-cat-all');
  await open('/?view=store'); await check('?view=store → /:handle', '/lolaatelier', '.storefront');
  await open('/?view=bio'); await check('?view=bio → /:handle/link', '/lolaatelier/link', '.bio-links');
  await open('/?p=' + pid); await check('?p= → /:handle/p/:id', `/lolaatelier/p/${pid}`, '.buy-box');
  await open('/?view=onboarding'); await check('?view=onboarding → /new', '/new');
  await open('/?view=profile'); await check('?view=profile → /me', '/me');
  await open('/?view=login'); await check('?view=login → /login', '/login');
  await open('/?b=' + code); await check('?b= → /b/:code', '/b/' + code, `.ob-head h2:has-text("${code}")`);
  await open('/?view=dashboard&tab=sales'); await check('?view=dashboard&tab= (no session) → /login', '/login');
  await login(); await open('/?view=dashboard&tab=sales'); await check('?view=dashboard&tab=sales → /dashboard/sales', '/dashboard/sales', '.db');
  await open('/?tab=team'); await check('?tab=team → /dashboard/team', '/dashboard/team', '.db');
  await open('/lolaatelier?sort=price&view=store'); await check('filters survive the redirect', '/lolaatelier?sort=price', '.storefront');
} finally {
  await browser.close(); app.stop();
}
for (const [ok, name, got, why] of results) console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(48)} ${got} ${why}`);
console.log(`\n${results.filter(r => r[0]).length}/${results.length} ok` + (errors.length ? `\nerrors:\n- ${[...new Set(errors)].join('\n- ')}` : ''));
process.exit(results.every(r => r[0]) ? 0 : 1);
