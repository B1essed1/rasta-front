// Visual parity check: the prototype (../prototype/index.html) vs this app, same page and state,
// at 1280px and 390px. Writes ../compare/<step>-<width>-{proto,app,diff}.png and ../compare/REPORT.md.
//
//   node scripts/compare.mjs                 all steps (APP_PORT=5176 to use another port)
//   node scripts/compare.mjs landing explore only steps whose key starts with one of these
//
// The app is started with `vite` on :5174 unless APP_URL is set (e.g. APP_URL=http://localhost:5173/).
// Both pages get the same fixed clock and the same Math.random seed, so dates, codes and ids match.
// Steps come from the prototype's own tour (shotSteps in App.jsx). STEP_OVERRIDES holds the app-side
// action for a step once the app reaches that state differently (routes instead of the page navigator).
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const FRONT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTO_DIR = path.join(FRONT, '..', 'prototype');
const OUT = path.join(FRONT, '..', 'compare');
const PROTO_PORT = 4179, APP_PORT = Number(process.env.APP_PORT) || 5174;   // APP_PORT=5176 if :5174 is taken
const WIDTHS = [['desktop', 1280, 800], ['phone', 390, 844]];
const FIXED_TIME = new Date('2026-11-20T12:00:00+05:00');
const only = process.argv.slice(2);

// app-side actions that differ from the prototype tour: key → async (page) => {}
export const STEP_OVERRIDES = {};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function serveProto() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = path.join(PROTO_DIR, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
      if (!p.startsWith(PROTO_DIR) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    }).listen(PROTO_PORT, () => ok(s));
  });
}

async function startApp() {
  if (process.env.APP_URL) return { url: process.env.APP_URL, stop() {} };
  const vite = spawn(process.execPath, [path.join(FRONT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(APP_PORT), '--strictPort'],
    { cwd: FRONT, stdio: ['ignore', 'pipe', 'pipe'] });
  let exited = null;
  vite.on('exit', c => { exited = c; });
  const url = `http://localhost:${APP_PORT}/`;
  for (let t = Date.now(); ; await sleep(300)) {
    if (exited !== null) throw new Error('vite exited ' + exited);
    if (Date.now() - t > 60000) { vite.kill(); throw new Error('vite did not start'); }
    if (await fetch(url).then(r => r.ok, () => false)) break;
  }
  return { url, stop: () => vite.kill() };
}

// same deterministic Math.random in both apps (mulberry32)
const SEED_SCRIPT = `(() => { let a = 1234567; Math.random = function () { a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
const EXPAND = `if(!document.getElementById('cmp-css')){const st=document.createElement('style');st.id='cmp-css';
  st.textContent=SHOT_CSS+' *{caret-color:transparent!important}';document.head.appendChild(st);}
  document.documentElement.classList.add('shot-expand');`;

async function openTour(browser, url, w, h, errors, tag) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.clock.setFixedTime(FIXED_TIME);
  await ctx.addInitScript(SEED_SCRIPT);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${tag}: ${e.message.split('\n')[0]}`));
  page.on('console', m => { if (m.type() === 'error' && !/image-slots\.state\.json|404/.test(m.text())) errors.push(`${tag}: ${m.text().split('\n')[0]}`); });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => window.__rastaGo && typeof shotSteps === 'function', null, { timeout: 60000 });
  return { ctx, page };
}

async function act(page, i, key, override) {
  if (override) await override(page);
  else await page.evaluate(async i => { await shotSteps()[i][2](); }, i);
  await sleep(1300);
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function shoot(page, file) {
  // toasts live 2.6s; the two apps reach a step at slightly different times, so shoot both without them
  await page.waitForFunction(() => !document.querySelector('.toast'), null, { timeout: 4000 }).catch(() => {});
  await page.evaluate(EXPAND);
  await sleep(150);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  await page.evaluate(() => document.documentElement.classList.remove('shot-expand'));
}

function diff(a, b, out) {
  const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(b));
  const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
  const pad = img => { if (img.width === w && img.height === h) return img;
    const o = new PNG({ width: w, height: h }); o.data.fill(255); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o; };
  const pa = pad(A), pb = pad(B), d = new PNG({ width: w, height: h });
  const n = pixelmatch(pa.data, pb.data, d.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(out, PNG.sync.write(d));
  return { pct: n / (w * h) * 100, size: `${A.width}×${A.height} vs ${B.width}×${B.height}`, sameSize: A.width === B.width && A.height === B.height };
}

const proto = await serveProto();
const app = await startApp();
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rows = [], errors = [];
try {
  for (const [wn, w, h] of WIDTHS) {
    const P = await openTour(browser, `http://localhost:${PROTO_PORT}/index.html`, w, h, errors, `proto/${wn}`);
    const A = await openTour(browser, app.url, w, h, errors, `app/${wn}`);
    const steps = await P.page.evaluate(() => shotSteps().map(([k, l]) => [k, l]));
    const wanted = i => !only.length || only.some(o => steps[i][0].startsWith(o));
    const last = steps.reduce((n, s, i) => wanted(i) ? i : n, -1);
    for (let i = 0; i <= last; i++) {
      const [key, label] = steps[i];
      const no = String(i + 1).padStart(2, '0');
      // every step runs (states build on each other); only selected ones are captured
      if (process.env.CMP_DEBUG) console.log('step', wn, no, key);
      await act(P.page, i, key);
      await act(A.page, i, key, STEP_OVERRIDES[key]);
      if (!wanted(i)) continue;
      const base = path.join(OUT, `${no}-${key}-${wn}`);
      await shoot(P.page, base + '-proto.png');
      await shoot(A.page, base + '-app.png');
      const r = diff(base + '-proto.png', base + '-app.png', base + '-diff.png');
      rows.push({ no, key, label, wn, ...r });
      console.log(`${wn.padEnd(7)} ${no} ${key.padEnd(28)} ${r.pct.toFixed(2).padStart(6)}%  ${r.sameSize ? '' : r.size}`);
    }
    await P.ctx.close(); await A.ctx.close();
  }
} finally {
  await browser.close(); proto.close(); app.stop();
}
const md = ['# Prototype vs app', '', `Generated by front/scripts/compare.mjs. Diff = share of pixels that differ (threshold 0.1).`, '',
  '| # | State | Width | Diff | Size (proto vs app) |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.no} | ${r.key} | ${r.wn} | ${r.pct.toFixed(2)}% | ${r.sameSize ? 'same' : r.size} |`),
  '', '## Errors', '', ...(errors.length ? [...new Set(errors)].map(e => '- ' + e) : ['none'])];
fs.writeFileSync(path.join(OUT, 'REPORT.md'), md.join('\n') + '\n');
console.log(`\n${rows.length} comparisons, ${new Set(errors).size} distinct errors → compare/REPORT.md`);
