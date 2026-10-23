// ===== Storefront catalog: the design's Storefront.jsx listing, StoreFilters.jsx
// (category drill-down, filter sheet, active pills) and ShopLocation.jsx card,
// adapted to the API's shop / product shapes. =====
import React, { useEffect, useState } from 'react';
import { t, fmtPrice, fill } from '../i18n';
import {
  catEntry, catLabel, catBreadcrumb, attrValueName, attrValueHex,
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
    shop.instagram && ['Instagram', 'https://instagram.com/' + clean(shop.instagram)],
    shop.telegram && ['Telegram', 'https://t.me/' + clean(shop.telegram)],
    shop.phone && ['Phone', 'tel:' + shop.phone.replace(/\s/g, '')],
  ].filter(Boolean);
  return (
    <div className="sf-contacts">
      {rows.map(([k, href]) => (
        <a key={k} className="sf-contact" href={href}
          target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer">
          <span>{k}</span>
        </a>
      ))}
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

/* ---------- filter sheet ---------- */

export function SfFilterSheet({ lang, filters, sel, setSel, price, setPrice, hideSold, setHideSold, sort, setSort, count, onClear, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  const toggle = (aid, v) => setSel((s) => {
    const cur = s[aid] || [];
    const nx = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    return { ...s, [aid]: nx };
  });
  const num = (s) => s.replace(/\D/g, '');
  const sorts = [['new', t('sf_sort_new')], ['low', t('sf_sort_low')], ['high', t('sf_sort_high')]];
  return (
    <div className="sff-scrim" onClick={onClose}>
      <div className="sff-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sff-head">
          <b className="sf-display">{t('sff_filters')}</b>
          <button className="sff-x" onClick={onClose} aria-label="Close" type="button">{I.x({ width: 18, height: 18 })}</button>
        </div>
        <div className="sff-body">
          <div className="sff-sec">
            <div className="sff-lab">{t('sff_sort')}</div>
            <div className="sff-seg">
              {sorts.map(([k, l]) => <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)} type="button">{l}</button>)}
            </div>
          </div>
          {filters.map(({ attr, values }) => (
            <div key={attr.id} className="sff-sec">
              <div className="sff-lab">{attr.name[lang]}{(sel[attr.id] || []).length > 0 && <i> · {(sel[attr.id] || []).length}</i>}</div>
              <div className={'sff-vals' + (attr.swatch ? ' sw' : '')}>
                {values.map((v) => {
                  const on = (sel[attr.id] || []).includes(v);
                  return attr.swatch ? (
                    <button key={v} className={'sff-sw' + (on ? ' on' : '')} onClick={() => toggle(attr.id, v)} type="button">
                      <i style={{ background: attrValueHex(attr.id, v) || '#ccc' }}></i><span>{attrValueName(attr.id, v, lang)}</span>
                    </button>
                  ) : (
                    <button key={v} className={'sff-val' + (on ? ' on' : '')} onClick={() => toggle(attr.id, v)} type="button">{attrValueName(attr.id, v, lang)}</button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="sff-sec">
            <div className="sff-lab">{t('sff_price')}</div>
            <div className="sff-price">
              <label><span>{t('sff_from')}</span><input inputMode="numeric" value={price.min} placeholder="0" onChange={(e) => setPrice((p) => ({ ...p, min: num(e.target.value) }))}/></label>
              <i>—</i>
              <label><span>{t('sff_to')}</span><input inputMode="numeric" value={price.max} placeholder="∞" onChange={(e) => setPrice((p) => ({ ...p, max: num(e.target.value) }))}/></label>
            </div>
          </div>
          <div className="sff-sec">
            <div className="sff-lab">{t('sff_avail')}</div>
            <label className="sff-switch">
              <span>{t('sff_instock')}</span>
              <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)}/>
              <i></i>
            </label>
          </div>
        </div>
        <div className="sff-foot">
          <button className="sf-btn sf-btn-line" onClick={onClear} type="button">{t('sff_clear')}</button>
          <button className="sf-btn sf-btn-accent" onClick={onClose} type="button">{count === 1 ? t('sff_show1') : fill(t('sff_show'), { n: count })}</button>
        </div>
      </div>
    </div>
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
  const label = p._needsPick ? t('sf_card_pick') : sold ? t('sf_sold') : t('co_add');
  return (
    <button className="sf-btn sf-btn-line sf-btn-card" type="button" disabled={sold} aria-label={label}
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
          <div className="pprice">{fmtPrice(p.price)}</div>
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
        <div className="pprice">{fmtPrice(p.price)}</div>
        {layout !== 'gallery' && p._desc && <div className="pdesc">{p._desc}</div>}
        <CardButton p={p} onOpen={onOpen} onAdd={onAdd}/>
      </div>
    </a>
  );
}
