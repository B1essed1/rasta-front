// ===== Storefront catalog: the design's Storefront.jsx listing, StoreFilters.jsx
// (category drill-down, filter sheet, active pills) and ShopLocation.jsx card,
// adapted to the API's shop / product shapes. =====
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { t, fmtPrice, fill } from '../i18n';
import {
  catEntry, catLabel, catBreadcrumb, attrValueName, attrValueHex, variantAttrs, specAttrs, COLORS,
} from '../data/taxonomy';
import { I } from '../components/ui/Icons';

export const SFF_I = {
  sliders: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.8"/><circle cx="10" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.8"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const LOC_I = {
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7"/></svg>,
  nav: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 4 4 10.5l6.5 2.5L13 20l7-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
};

/* ---------- stock badge ---------- */

export function SfStockBadge({ state }) {
  if (state === 'in') return <span className="badge in"><span className="dotx"></span>{t('sf_in_stock')}</span>;
  if (state === 'low') return <span className="badge low"><span className="dotx"></span>{t('sf_low')}</span>;
  return <span className="badge sold">{t('sf_sold')}</span>;
}

/* ---------- contacts ---------- */

const clean = (h) => String(h || '').replace(/^@/, '');

export function ContactRows({ shop }) {
  const rows = [
    shop.instagram && ['Instagram', '@' + clean(shop.instagram), 'https://instagram.com/' + clean(shop.instagram)],
    shop.telegram && ['Telegram', '@' + clean(shop.telegram), 'https://t.me/' + clean(shop.telegram)],
    shop.phone && ['Phone', shop.phone, 'tel:' + shop.phone.replace(/\s/g, '')],
  ].filter(Boolean);
  return (
    <div className="sf-contacts">
      {rows.map(([k, v, href]) => (
        <a key={k} className="sf-contact" href={href}
          target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer">
          <span>{k}</span><b>{v}</b>
        </a>
      ))}
    </div>
  );
}

/* ---------- how to buy (requests mode) ---------- */

// design-src/Storefront.jsx SfHowTo, requests-on steps
export function SfHowTo({ compact }) {
  const steps = [
    [t('sfh_r1'), t('sfh_r1d')],
    [t('sfh_r2'), t('sfh_r2d')],
    [t('sfh_s3'), t('sfh_s3d')],
  ];
  if (compact) {
    return (
      <div className="sfh-how-strip" aria-label={t('sfh_how')}>
        <b>{t('sfh_how')}:</b>
        {steps.map((s, k) => <span key={k}><i>{k + 1}</i>{s[0]}</span>)}
      </div>
    );
  }
  return (
    <div className="sfh-steps">
      {steps.map((s, k) => <div key={k} className="sfh-step"><i>{k + 1}</i><b>{s[0]}</b><span>{s[1]}</span></div>)}
    </div>
  );
}

/* ---------- shop header v2: trust row + facts ---------- */

// trust row under the shop name: Telegram verified · N products · city · since · Instagram
export function SfTrust({ shop, count }) {
  const since = shop.createdAt;
  const items = [
    shop.telegram && [I.check, t('sfh_tg_ok')],
    [I.grid, fill(t('sfh_items'), { n: count })],
    shop.location && [I.store, shop.location],
    since && [I.clock, fill(t('sfh_since'), { y: new Date(since).getFullYear() })],
    shop.instagram && [null, 'Instagram @' + clean(shop.instagram), 'https://instagram.com/' + clean(shop.instagram)],
  ].filter(Boolean);
  return (
    <div className="sfh-trust">
      {items.map(([ic, txt, href], k) => (href
        ? <a key={k} href={href} target="_blank" rel="noreferrer">{txt}</a>
        : <span key={k} className={k === 0 && shop.telegram ? 'ok' : ''}>{ic && ic({ width: 14, height: 14 })}{txt}</span>))}
    </div>
  );
}

const PAY_LABELS = {
  cash: { en: 'Cash', ru: 'Наличные', uz: 'Naqd' },
  payme: { en: 'Payme', ru: 'Payme', uz: 'Payme' },
  click: { en: 'Click', ru: 'Click', uz: 'Click' },
  uzcard: { en: 'Uzcard', ru: 'Uzcard', uz: 'Uzcard' },
  transfer: { en: 'Transfer', ru: 'Перевод', uz: 'O‘tkazma' },
};

// payment · how you get it · exchange & returns (shop page + every product page)
export function SfFacts({ shop, lang }) {
  const pays = String(shop.acceptedPayments || '').split(',').map((x) => x.trim()).filter(Boolean)
    .map((id) => (PAY_LABELS[id] ? PAY_LABELS[id][lang] : id)).join(' · ') || t('sf_pay_def');
  return (
    <div className="sfh-facts">
      <div><small>{t('sfh_pay')}</small><b>{pays}</b></div>
      <div><small>{t('sfh_get')}</small><b>{shop.deliveryNote || fill(t('sfh_get_d'), { c: shop.location || '' })}</b></div>
      <div><small>{t('sfh_returns')}</small><b>{t('sfh_returns_d')}</b></div>
    </div>
  );
}

/* ---------- shop location ---------- */

// "street, city" — unless the seller already typed the city into the address
function fullAddress(shop) {
  const a = (shop.address || '').trim(), c = (shop.location || '').trim();
  if (!c || a.toLowerCase().includes(c.toLowerCase())) return a;
  return [a, c].filter(Boolean).join(', ');
}

function mapLinks(shop) {
  const lat = shop.mapLat, lng = shop.mapLng;
  const full = fullAddress(shop);
  if (lat != null && lng != null) {
    return {
      y: `https://yandex.uz/maps/?pt=${lng},${lat}&z=17&l=map`,
      g: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      embed: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006},${lat - 0.0035},${lng + 0.006},${lat + 0.0035}&layer=mapnik&marker=${lat},${lng}`,
    };
  }
  return {
    y: `https://yandex.uz/maps/?text=${encodeURIComponent(full)}`,
    g: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`,
    embed: null,
  };
}

export function SfLocation({ shop, showToast }) {
  if (!shop.address) return null;
  const L = mapLinks(shop);
  const full = fullAddress(shop);
  const copy = () => {
    try { navigator.clipboard.writeText(full + (shop.landmark ? ` (${shop.landmark})` : '')); } catch { /* clipboard blocked */ }
    if (showToast) showToast(t('loc_copied'));
  };
  return (
    <div className="sf-loc" style={L.embed ? undefined : { gridTemplateColumns: '1fr' }}>
      {L.embed && (
        <a className="sf-loc-map" href={L.y} target="_blank" rel="noopener noreferrer">
          <iframe title="map" src={L.embed} loading="lazy" tabIndex={-1}></iframe>
        </a>
      )}
      <div className="sf-loc-body">
        <div className="sf-sizes-label sf-up">{t('loc_visit')}</div>
        <b className="sf-loc-addr">{full}</b>
        {shop.landmark && <span className="sf-loc-lm">{t('loc_landmark')}: {shop.landmark}</span>}
        <div className="sf-loc-acts">
          <a className="sf-btn sf-btn-accent" href={L.y} target="_blank" rel="noopener noreferrer">{LOC_I.nav({ width: 16, height: 16 })} {t('loc_open_y')}</a>
          <a className="sf-btn sf-btn-line" href={L.g} target="_blank" rel="noopener noreferrer">{t('loc_open_g')}</a>
          <button className="sf-btn sf-btn-line sf-btn-icon" onClick={copy} title={t('loc_copy')} aria-label={t('loc_copy')} type="button">{I.copy({ width: 16, height: 16 })}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- category drill-down ---------- */

export function SfCatBar({ nav, cat, setCat, lang }) {
  const e = cat === 'all' ? null : catEntry(cat);
  const backTo = !e ? null : (e.leaf ? ((catEntry(e.parent) || {}).parent || 'all') : (e.parent || 'all'));
  const scope = !e ? null : (e.leaf ? e.parent : cat);
  return (
    <div className="sf-cats sff-cats">
      {e && (
        <button className="sf-chip sff-back" onClick={() => setCat(backTo)} aria-label={t('sff_back')} type="button">
          {SFF_I.back({ width: 16, height: 16 })}
        </button>
      )}
      {scope && (
        <button className={'sf-chip' + (cat === scope ? ' on' : '')} onClick={() => setCat(scope)} type="button">
          {t('sf_all')} {catLabel(scope, lang)} <i className="sf-chip-n">{nav.count(scope)}</i>
        </button>
      )}
      {nav.level.map((c) => {
        const ce = catEntry(c.id);
        return (
          <button key={c.id} className={'sf-chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)} type="button">
            {c.name} <i className="sf-chip-n">{c.n}</i>{ce && !ce.leaf && <span className="sf-chip-more">›</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- filters v2: facets, counts, price presets, rating, link state ---------- */

export const SFX_EMPTY = { sel: {}, pmin: '', pmax: '', rate: 0, stock: false, sort: 'new' };
const sfxKey = (s) => String(s).trim().toLowerCase().replace(/[ʻʼ‘’'`]/g, '');
// seller-typed colours in any language land on the same swatch ("Qora", "black", "чёрный" → Black)
const SFX_COLOR_SYN = (() => {
  const m = {};
  COLORS.forEach((c) => { [c.id, c.name.en, c.name.ru, c.name.uz].forEach((n) => { if (n) m[sfxKey(n)] = c.id; }); });
  Object.assign(m, { 'черный': 'black', 'чёрная': 'black', 'черная': 'black', 'белая': 'white', 'голубой': 'blue', 'zangori': 'blue', 'красная': 'red', 'зеленый': 'green',
    'розовая': 'pink', 'gray': 'grey', 'серая': 'grey', 'бежевый': 'sand', 'beige': 'sand', 'bej': 'sand', 'бежевая': 'sand', 'коричневая': 'brown', 'тёмно-синий': 'navy', 'темно-синий': 'navy' });
  return m;
})();
function sfxNorm(attr, v) {
  if (v == null || v === '' || v === false) return null;
  if (v === true) return '1';
  v = String(v);
  if (!v.startsWith('c:')) return v;
  const s = sfxKey(v.slice(2));
  if (attr && attr.swatch && SFX_COLOR_SYN[s]) return SFX_COLOR_SYN[s];
  return 'c:' + s;
}
// every value a product offers for one attribute (its variants + its details), normalised
export function sfxVals(p, aid) {
  const out = [];
  const add = (x) => { if (x && !out.includes(x)) out.push(x); };
  const va = variantAttrs(p.catId).find((a) => a.id === aid);
  if (va) (p.variants || []).forEach((v) => add(sfxNorm(va, (v.options || {})[aid])));
  const sa = specAttrs(p.catId).find((a) => a.id === aid);
  if (sa) { const raw = (p.specs || {})[aid]; (Array.isArray(raw) ? raw : [raw]).forEach((r) => add(sfxNorm(sa, r))); }
  return out;
}
// which filters exist for this list — driven by the categories in it, most common first
export function sfxFacets(products) {
  const map = {};
  products.forEach((p) => {
    variantAttrs(p.catId).concat(specAttrs(p.catId)).forEach((a) => {
      if (a.id === 'option' || a.kind === 'number' || a.kind === 'text') return;
      const vals = sfxVals(p, a.id); if (!vals.length) return;
      const f = map[a.id] || (map[a.id] = { attr: a, cover: 0, vals: {} });
      f.cover++; vals.forEach((x) => { f.vals[x] = 1; });
    });
  });
  return Object.keys(map).map((k) => {
    const f = map[k], order = (f.attr.values || []).map((v) => v.id);
    const values = Object.keys(f.vals).sort((x, y) => {
      const i = order.indexOf(x), j = order.indexOf(y);
      if (i >= 0 && j >= 0) return i - j; if (i >= 0) return -1; if (j >= 0) return 1;
      return x.localeCompare(y, undefined, { numeric: true });
    });
    return { attr: f.attr, cover: f.cover, values };
  }).filter((f) => f.values.length > 1 || (f.attr.kind === 'bool' && f.cover < products.length))
    .sort((a, b) => (b.cover - a.cover) || ((b.attr.swatch ? 1 : 0) - (a.attr.swatch ? 1 : 0)));
}
export function sfxLabel(attr, id, lang) {
  if (attr && attr.kind === 'bool') return t('sfx_yes');
  const n = String(attrValueName(attr.id, id, lang));
  if (String(id).startsWith('c:')) return /^[a-z0-9]{1,4}$/.test(n) ? n.toUpperCase() : n.charAt(0).toUpperCase() + n.slice(1);
  return n;
}
// a variant may carry its own price (e.g. 256 GB costs more); otherwise the product price applies
export const vPrice = (p, v) => (v && v.price != null && v.price > 0 ? v.price : p.price);
export const pMin = (p) => { const xs = (p.variants || []).map((v) => vPrice(p, v)); return xs.length ? Math.min(...xs) : p.price; };
export const pVaries = (p) => (p.variants || []).some((v) => v.price != null && v.price > 0 && v.price !== p.price);
export function PriceTag({ p, lang }) {
  return <>{pVaries(p) && <span className="pfrom">{t('sf_from')} </span>}{fmtPrice(pMin(p), lang)}</>;
}
export function sfxPrice(p) {
  const xs = (p.variants || []).map((v) => vPrice(p, v));
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : [p.price, p.price];
}
export function sfxMatch(p, F, ctx, skip) {
  for (const aid in F.sel) {
    if (aid === skip) continue;
    const want = F.sel[aid] || []; if (!want.length) continue;
    const have = sfxVals(p, aid); if (!want.some((w) => have.includes(w))) return false;
  }
  if (skip !== 'price') { const r = sfxPrice(p); if (F.pmin && r[1] < Number(F.pmin)) return false; if (F.pmax && r[0] > Number(F.pmax)) return false; }
  if (skip !== 'rate' && F.rate) { const r = ctx.rating(p); if (!r || r.avg < F.rate) return false; }
  if (skip !== 'stock' && F.stock && ctx.sold(p)) return false;
  return true;
}
export function sfxSort(list, sort, ctx) {
  const out = list.slice();
  // rating sort weighs how many reviews there are, not only the average
  const bay = (p) => { const r = ctx.rating(p); return r ? (r.avg * r.n + 4 * 3) / (r.n + 3) : 0; };
  const created = (p) => String(p.createdAt || '');
  if (sort === 'low') out.sort((a, b) => sfxPrice(a)[0] - sfxPrice(b)[0]);
  else if (sort === 'high') out.sort((a, b) => sfxPrice(b)[0] - sfxPrice(a)[0]);
  else if (sort === 'rate') out.sort((a, b) => bay(b) - bay(a));
  else out.sort((a, b) => created(b).localeCompare(created(a)) || (b.id > a.id ? 1 : -1));
  return out;
}
const sfxNice = (x) => { if (x <= 0) return 0; const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1)); return Math.round(x / m) * m; };
// three ready price ranges built from the real prices in the list
function sfxPresets(products) {
  const ps = products.map((p) => sfxPrice(p)[0]).sort((a, b) => a - b);
  if (ps.length < 4) return [];
  const a = sfxNice(ps[Math.floor(ps.length / 3)]), b = sfxNice(ps[Math.floor(ps.length * 2 / 3)]);
  if (!a || !b || a >= b) return [];
  return [['', String(a)], [String(a), String(b)], [String(b), '']];
}
const fmtNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
function sfxPriceLabel(a, b) {
  if (a && b) return fmtNum(Number(a)) + ' – ' + fmtNum(Number(b));
  if (b) return fill(t('sfx_upto'), { a: fmtNum(Number(b)) });
  return fill(t('sfx_over'), { a: fmtNum(Number(a)) });
}
const sfxToggle = (F, aid, v) => { const cur = F.sel[aid] || []; return { ...F, sel: { ...F.sel, [aid]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } }; };
const sfxActive = (F) => Object.keys(F.sel).reduce((n, k) => n + (F.sel[k] || []).length, 0) + ((F.pmin || F.pmax) ? 1 : 0) + (F.rate ? 1 : 0) + (F.stock ? 1 : 0);
export function sfxPills(F, setF, facets, lang) {
  const out = [];
  Object.keys(F.sel).forEach((aid) => {
    const f = (facets || []).find((x) => x.attr.id === aid); const a = f ? f.attr : { id: aid, name: {} };
    (F.sel[aid] || []).forEach((v) => out.push({
      k: aid + ':' + v, lab: a.kind === 'bool' ? a.name[lang] : sfxLabel(a, v, lang), sw: a.swatch ? (attrValueHex(aid, v) || '#ccc') : null,
      off: () => setF((f0) => ({ ...f0, sel: { ...f0.sel, [aid]: (f0.sel[aid] || []).filter((x) => x !== v) } })),
    }));
  });
  if (F.pmin || F.pmax) out.push({ k: 'price', lab: sfxPriceLabel(F.pmin, F.pmax), off: () => setF((f0) => ({ ...f0, pmin: '', pmax: '' })) });
  if (F.rate) out.push({ k: 'rate', lab: '★ ' + (F.rate >= 4 ? t('sfx_r4') : t('sfx_r3')), off: () => setF((f0) => ({ ...f0, rate: 0 })) });
  if (F.stock) out.push({ k: 'stock', lab: t('sfx_instock'), off: () => setF((f0) => ({ ...f0, stock: false })) });
  return out;
}
// the link keeps the filters, so a link shared in Telegram opens the same list
const SFX_URL_KEYS = ['pmin', 'pmax', 'rate', 'instock', 'sort', 'cat'];
export function sfxRead() {
  try {
    const q = new URLSearchParams(window.location.search);
    const F = { sel: {}, pmin: q.get('pmin') || '', pmax: q.get('pmax') || '', rate: Number(q.get('rate')) || 0, stock: q.get('instock') === '1', sort: q.get('sort') || 'new' };
    q.forEach((v, k) => { if (k.indexOf('f_') === 0) F.sel[k.slice(2)] = v.split(',').filter(Boolean); });
    return { F, cat: q.get('cat') || null };
  } catch { return null; }
}
export function sfxWrite(F, cat) {
  try {
    const q = new URLSearchParams(window.location.search);
    Array.from(q.keys()).forEach((k) => { if (k.indexOf('f_') === 0 || SFX_URL_KEYS.includes(k)) q.delete(k); });
    if (cat && cat !== 'all') q.set('cat', cat);
    Object.keys(F.sel).forEach((a) => { if ((F.sel[a] || []).length) q.set('f_' + a, F.sel[a].join(',')); });
    if (F.pmin) q.set('pmin', F.pmin); if (F.pmax) q.set('pmax', F.pmax);
    if (F.rate) q.set('rate', String(F.rate)); if (F.stock) q.set('instock', '1');
    if (F.sort && F.sort !== 'new') q.set('sort', F.sort);
    const s = q.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : '') + window.location.hash);
  } catch { /* history unavailable */ }
}
const sfxHost = (el) => (el && el.closest && el.closest('.storefront')) || document.body;

function SfxOpt({ on, radio, disabled, sw, label, n, onClick }) {
  return (
    <button type="button" className={'sfx-opt' + (radio ? ' radio' : '') + (on ? ' on' : '')} disabled={disabled} onClick={onClick} aria-pressed={on}>
      <u className="box" style={{ textDecoration: 'none' }}>{on && !radio ? I.check({ width: 12, height: 12 }) : null}</u>
      {sw && <em className="sw" style={{ background: sw }}></em>}
      <span className="lb">{label}</span>{n != null && <i>{n}</i>}
    </button>
  );
}

// the chip row under the categories (Sort · Size · Colour · Price · 4★ · All filters) + its popovers + the full sheet
export function SfxBar({ lang, pool, facets, F, setF, ctx, total, promote }) {
  const [pop, setPop] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [more, setMore] = useState({});
  useEffect(() => { if (!pop) return; const c = () => setPop(null); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c); }, [pop]);
  useEffect(() => {
    if (!pop && !sheet) return;
    const k = (e) => { if (e.key === 'Escape') { setPop(null); setSheet(null); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [pop, sheet]);
  const presets = useMemo(() => sfxPresets(pool), [pool]);
  const fs = facets || [];
  const cnt = (aid, v) => pool.filter((p) => sfxMatch(p, F, ctx, aid) && sfxVals(p, aid).includes(v)).length;
  const priceCnt = (a, b) => pool.filter((p) => { if (!sfxMatch(p, F, ctx, 'price')) return false; const r = sfxPrice(p); return (!a || r[1] >= Number(a)) && (!b || r[0] <= Number(b)); }).length;
  const rateCnt = (r) => pool.filter((p) => sfxMatch(p, F, ctx, 'rate') && ((ctx.rating(p) || {}).avg || 0) >= r).length;
  const stockCnt = pool.filter((p) => sfxMatch(p, F, ctx, 'stock') && !ctx.sold(p)).length;
  const sorts = [['new', t('sfx_sort_new')], ['rate', t('sfx_sort_rate')], ['low', t('sfx_sort_low')], ['high', t('sfx_sort_high')]];
  const hasRatings = pool.some((p) => ctx.rating(p));
  const pick = (aid, v) => setF(sfxToggle(F, aid, v));
  const openPop = (k, e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    setPop((p) => (p && p.k === k ? null : { k, top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 336)), host: sfxHost(el) }));
  };
  const openSheet = (e) => { setPop(null); setSheet({ host: sfxHost(e.currentTarget) }); };
  // phones get fewer promoted chips so the row stays short (Baymard: only 2–3 fit on one line)
  const top = fs.slice(0, promote || (window.innerWidth < 640 ? 2 : 3));
  const nAct = sfxActive(F);
  const priceOn = !!(F.pmin || F.pmax);
  const sortLab = (sorts.find((s) => s[0] === F.sort) || sorts[0])[1];
  const caret = <span className="cv">▾</span>;
  const resetKey = (k) => { if (k === 'price') setF({ ...F, pmin: '', pmax: '' }); else if (k !== 'sort') setF({ ...F, sel: { ...F.sel, [k]: [] } }); };
  const priceBox = (
    <div>
      {presets.length > 0 && <div className="sfx-pre">{presets.map(([a, b]) => {
        const on = F.pmin === a && F.pmax === b; const n = priceCnt(a, b);
        return <SfxOpt key={a + '-' + b} radio on={on} disabled={!on && !n} label={sfxPriceLabel(a, b)} n={n} onClick={() => setF(on ? { ...F, pmin: '', pmax: '' } : { ...F, pmin: a, pmax: b })} />;
      })}</div>}
      <div className="sfx-sec-t" style={{ margin: '6px 2px 8px', fontSize: 13 }}>{t('sfx_own')}</div>
      <div className="sfx-range">
        <input inputMode="numeric" placeholder={t('sfx_from')} value={F.pmin} onChange={(e) => setF({ ...F, pmin: e.target.value.replace(/\D/g, '') })} aria-label={t('sfx_from')} />
        <span>—</span>
        <input inputMode="numeric" placeholder={t('sfx_to')} value={F.pmax} onChange={(e) => setF({ ...F, pmax: e.target.value.replace(/\D/g, '') })} aria-label={t('sfx_to')} />
      </div>
    </div>
  );
  const optList = (f) => f.values.map((v) => {
    const on = (F.sel[f.attr.id] || []).includes(v); const n = cnt(f.attr.id, v);
    return <SfxOpt key={v} on={on} disabled={!on && !n} sw={f.attr.swatch ? (attrValueHex(f.attr.id, v) || '#ccc') : null} label={sfxLabel(f.attr, v, lang)} n={n} onClick={() => pick(f.attr.id, v)} />;
  });
  const popBody = (k) => {
    if (k === 'sort') return sorts.map(([id, l]) => <SfxOpt key={id} radio on={F.sort === id} label={l} onClick={() => { setF({ ...F, sort: id }); setPop(null); }} />);
    if (k === 'price') return priceBox;
    const f = fs.find((x) => x.attr.id === k); return f ? optList(f) : null;
  };
  return (
    <>
      <div className="sfx-row" role="toolbar" aria-label={t('sfx_all')}>
        <button type="button" className={'sfx-chip' + (F.sort !== 'new' ? ' on' : '')} onClick={(e) => openPop('sort', e)} aria-haspopup="true">⇅ {sortLab} {caret}</button>
        {top.map((f) => {
          const n = (F.sel[f.attr.id] || []).length;
          return (
            <button key={f.attr.id} type="button" className={'sfx-chip' + (n ? ' on' : '')} onClick={(e) => openPop(f.attr.id, e)} aria-haspopup="true">
              {f.attr.name[lang]}{n === 1 ? ': ' + (f.attr.kind === 'bool' ? t('sfx_yes') : sfxLabel(f.attr, F.sel[f.attr.id][0], lang)) : n > 1 ? ' · ' + n : ''} {caret}</button>
          );
        })}
        <button type="button" className={'sfx-chip' + (priceOn ? ' on' : '')} onClick={(e) => openPop('price', e)} aria-haspopup="true">{priceOn ? sfxPriceLabel(F.pmin, F.pmax) : t('sfx_price')} {caret}</button>
        {hasRatings && <button type="button" className={'sfx-chip' + (F.rate >= 4 ? ' on' : '')} aria-pressed={F.rate >= 4} onClick={() => setF({ ...F, rate: F.rate >= 4 ? 0 : 4 })}>★ {t('sfx_r4')}</button>}
        <button type="button" className="sfx-chip all" onClick={openSheet}>{SFF_I.sliders({ width: 16, height: 16 })} {t('sfx_all')}{nAct > 0 && <b>{nAct}</b>}</button>
      </div>
      {pop && createPortal(
        <>
          <div className="sfx-scrim" onClick={() => setPop(null)}></div>
          <div className="sfx-pop" style={{ top: pop.top, left: pop.left }} role="dialog">
            <div className="sfx-pop-b">{popBody(pop.k)}</div>
            {pop.k !== 'sort' && <div className="sfx-pop-f">
              <button type="button" className="sfx-btn" onClick={() => resetKey(pop.k)}>{t('sfx_reset')}</button>
              <button type="button" className="sfx-btn pri" onClick={() => setPop(null)}>{fill(t('sfx_show'), { n: total })}</button>
            </div>}
          </div>
        </>, pop.host)}
      {sheet && createPortal(
        <>
          <div className="sfx-scrim dim" onClick={() => setSheet(null)}></div>
          <div className="sfx-sheet" role="dialog" aria-label={t('sfx_all')}>
            <div className="sfx-sheet-h"><b>{t('sfx_all')}</b><button type="button" className="sfx-x" onClick={() => setSheet(null)} aria-label={t('g_close')}>{I.x({ width: 18, height: 18 })}</button></div>
            <div className="sfx-sheet-b">
              <div className="sfx-sec"><div className="sfx-sec-t">{t('sfx_sort')}</div><div className="sfx-grid">
                {sorts.map(([id, l]) => <button key={id} type="button" className={'sfx-val' + (F.sort === id ? ' on' : '')} onClick={() => setF({ ...F, sort: id })}>{l}</button>)}</div></div>
              {fs.map((f) => {
                const open = more[f.attr.id]; const n = (F.sel[f.attr.id] || []).length;
                return (
                  <div key={f.attr.id} className="sfx-sec">
                    <div className="sfx-sec-t"><span>{f.attr.name[lang]}{n ? ' · ' + n : ''}</span>{n > 0 && <button type="button" className="sfx-lnk" onClick={() => resetKey(f.attr.id)}>{t('sfx_reset')}</button>}</div>
                    <div className="sfx-grid">{(open ? f.values : f.values.slice(0, 10)).map((v) => {
                      const on = (F.sel[f.attr.id] || []).includes(v); const c = cnt(f.attr.id, v);
                      return <button key={v} type="button" className={'sfx-val' + (on ? ' on' : '')} disabled={!on && !c} onClick={() => pick(f.attr.id, v)}>
                        {f.attr.swatch && <em className="sw" style={{ background: attrValueHex(f.attr.id, v) || '#ccc' }}></em>}{sfxLabel(f.attr, v, lang)} <i>{c}</i></button>;
                    })}</div>
                    {f.values.length > 10 && <button type="button" className="sfx-lnk" style={{ marginTop: 10 }} onClick={() => setMore((m) => ({ ...m, [f.attr.id]: !open }))}>{open ? t('sfx_less') : fill(t('sfx_more'), { n: f.values.length })}</button>}
                  </div>
                );
              })}
              <div className="sfx-sec"><div className="sfx-sec-t"><span>{t('sfx_price')}</span>{priceOn && <button type="button" className="sfx-lnk" onClick={() => resetKey('price')}>{t('sfx_reset')}</button>}</div>{priceBox}</div>
              {hasRatings && <div className="sfx-sec"><div className="sfx-sec-t">{t('sfx_rating')}</div><div className="sfx-grid">
                {[[0, t('sfx_r_any')], [4, t('sfx_r4')], [3, t('sfx_r3')]].map(([r, l]) => <button key={r} type="button" className={'sfx-val' + (F.rate === r ? ' on' : '')} onClick={() => setF({ ...F, rate: r })}>{r ? '★ ' : ''}{l}{r ? <i>{rateCnt(r)}</i> : null}</button>)}</div></div>}
              <div className="sfx-sec"><div className="sfx-grid"><button type="button" className={'sfx-val' + (F.stock ? ' on' : '')} onClick={() => setF({ ...F, stock: !F.stock })}>{t('sfx_instock')} <i>{stockCnt}</i></button></div></div>
            </div>
            <div className="sfx-pop-f">
              <button type="button" className="sfx-btn" onClick={() => setF({ ...SFX_EMPTY, sort: F.sort })}>{t('sfx_reset_all')}</button>
              <button type="button" className="sfx-btn pri" onClick={() => setSheet(null)}>{fill(t('sfx_show'), { n: total })}</button>
            </div>
          </div>
        </>, sheet.host)}
    </>
  );
}

/* ---------- result title + active pills ---------- */

export function SfResultBar({ lang, cat, count, pills, onClear }) {
  const title = cat === 'all' ? t('sff_all_products') : catBreadcrumb(cat, lang, ' › ');
  return (
    <div className="sff-res">
      <div className="sff-res-t"><b>{title}</b><span>{count} {count === 1 ? t('sff_item') : t('sff_items')}</span></div>
      {pills.length > 0 && (
        <div className="sff-pills">
          {pills.map((p) => (
            <button key={p.k} className="sff-pill" onClick={p.off} type="button">
              {p.sw && <i style={{ background: p.sw }}></i>}{p.lab}{I.x({ width: 12, height: 12 })}
            </button>
          ))}
          <button className="sff-clear" onClick={onClear} type="button">{t('sff_clear')}</button>
        </div>
      )}
    </div>
  );
}

/* ---------- product cards ---------- */

function CardImage({ p, tone, sold, name }) {
  const img = p.images && p.images[0];
  return (
    <div className={'pimg' + (sold ? ' is-sold' : '')} style={{ '--ph-tone': tone }}>
      {img
        ? <img src={img.thumbnailUrl || img.url} alt={name} loading="lazy" decoding="async"/>
        : <span className="pimg-init">{(name || '?').charAt(0)}</span>}
      <SfStockBadge state={p._stock}/>
    </div>
  );
}

function CardButton({ p, onOpen, onAdd }) {
  const sold = p._stock === 'sold';
  const inBasket = !!p._inBasket;
  const label = p._needsPick ? t('sf_card_pick') : sold ? t('sf_sold') : inBasket ? t('bk_go') : t('rq_add');
  return (
    <button className={'sf-btn sf-btn-line sf-btn-card' + (inBasket && !sold ? ' is-in' : '')} type="button" disabled={sold} aria-label={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (p._needsPick) onOpen(p); else onAdd(p); }}>
      {I.bag({ width: 16, height: 16 })} {label}
    </button>
  );
}

export function ProductCard({ p, layout, href, onOpen, onAdd }) {
  const sold = p._stock === 'sold';
  const open = (e) => { e.preventDefault(); onOpen(p); };
  if (layout === 'list') {
    return (
      <a className={'pcard' + (sold ? ' dim' : '')} href={href} onClick={open}>
        <CardImage p={p} tone={p._tone} sold={sold} name={p._name}/>
        <div className="pbody">
          <div className="pname">{p._name}</div>
          {p._desc && <div className="pdesc">{p._desc}</div>}
        </div>
        <div className="plist-right">
          <div className="pprice"><PriceTag p={p}/></div>
          <CardButton p={p} onOpen={onOpen} onAdd={onAdd}/>
        </div>
      </a>
    );
  }
  return (
    <a className={'pcard' + (sold ? ' dim' : '')} href={href} onClick={open}>
      <CardImage p={p} tone={p._tone} sold={sold} name={p._name}/>
      <div className="pbody">
        <div className="pname">{p._name}</div>
        <div className="pprice"><PriceTag p={p}/></div>
        {p._rv && p._rv.n > 0 && <div className="pcard-rv"><span className="star on">★</span> {p._rv.avg} <i>({p._rv.n})</i></div>}
        {layout !== 'gallery' && p._desc && <div className="pdesc">{p._desc}</div>}
        <CardButton p={p} onOpen={onOpen} onAdd={onAdd}/>
      </div>
    </a>
  );
}
