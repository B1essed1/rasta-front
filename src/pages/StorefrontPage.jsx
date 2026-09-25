import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LangPill from '../components/ui/LangPill';
import EmptyState from '../components/ui/EmptyState';
import { t, onLangChange, fmtPrice, fill, plural } from '../i18n';
import { useShopStore } from '../store/shopStore';
import { useAuthStore } from '../store/authStore';
import { getTheme, applyThemeVars } from '../data/themes';
import { getPalette, applyPaletteVars } from '../data/palettes';
import {
  catLabel, catPathIds, variantLabel as taxonomyVariantLabel,
  variantAttrs, specAttrs, sizeChartFor, offeredOptions, variantFor,
  optionReachable, attrValueName, attrValueHex,
} from '../data/taxonomy';
import { I } from '../components/ui/Icons';
import { getLang } from '../i18n';
import api from '../api/client';
import '../styles/storefront.css';

/* ===== helpers ===== */

const TONE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function toneColor(product) {
  if (product.tone) return product.tone;
  const hash = (product.id || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TONE_COLORS[hash % TONE_COLORS.length];
}

function getProductName(product) {
  return product.nameEn || product.nameUz || product.nameRu || '';
}

function getProductDesc(product) {
  return product.descEn || product.descUz || product.descRu || '';
}

function parseVariantLabel(optionsJson, catId) {
  if (!optionsJson) return '';
  try {
    const obj = JSON.parse(optionsJson);
    if (catId) {
      const label = taxonomyVariantLabel(catId, obj, getLang());
      if (label) return label;
    }
    return Object.values(obj).join(' / ');
  } catch {
    return optionsJson;
  }
}

function stockState(product) {
  const total = (product.variants || []).reduce((s, v) => s + (v.qty || 0), 0);
  if (total === 0) return 'sold';
  if (total <= 5) return 'low';
  return 'in';
}

function StockBadge({ state, overlay }) {
  const label = state === 'in' ? t('sf_in_stock') : state === 'low' ? t('sf_low') : t('sf_sold');
  return (
    <span className={`sf-stock-badge sf-stock-badge--${state}${overlay ? ' sf-stock-badge--overlay' : ''}`}>
      {label}
    </span>
  );
}

/* ===== Stars ===== */

function Stars({ value, size, onPick }) {
  return (
    <span className={`stars${onPick ? ' pick' : ''}`}>
      {[1,2,3,4,5].map(k => {
        const Tag = onPick ? 'button' : 'span';
        return (
          <Tag key={k} className={`star${value >= k ? ' on' : ''}`}
            style={size ? {fontSize: size} : undefined}
            onClick={onPick ? () => onPick(k) : undefined}
            type={onPick ? 'button' : undefined}>&#9733;</Tag>
        );
      })}
    </span>
  );
}

/* ===== Rating Stats ===== */

function ratingStats(reviews) {
  if (!reviews.length) return { avg: 0, n: 0, dist: [0,0,0,0,0] };
  const dist = [0,0,0,0,0];
  let sum = 0;
  reviews.forEach(r => { dist[r.rating - 1]++; sum += r.rating; });
  return { avg: (sum / reviews.length).toFixed(1), n: reviews.length, dist };
}

/* ===== Review Form ===== */

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  return (
    <div className="pp-rv-form">
      <b>{t('rv_write')}</b>
      <div className="pp-rv-row">
        <span>{t('rv_your_rating')}</span>
        <Stars value={rating} size={26} onPick={setRating}/>
      </div>
      <input placeholder={t('co_name')} value={name} onChange={e => setName(e.target.value)}/>
      <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={t('rv_text_ph')}/>
      <button className="btn btn-accent btn-sm" disabled={!rating}
        onClick={() => { onSubmit({ rating, text, name: name || t('rv_anon') }); setRating(0); setText(''); setName(''); }}>
        {t('rv_send')}
      </button>
    </div>
  );
}

/* ===== Toast ===== */

let toastTimer = null;
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type) => {
    clearTimeout(toastTimer);
    setToast({ msg, type });
    toastTimer = setTimeout(() => setToast(null), 2200);
  }, []);
  return [toast, show];
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`sf-toast${toast.type === 'error' ? ' sf-toast--error' : ''}`}>
      {toast.msg}
    </div>
  );
}

/* ===== Checkout Sheet ===== */

function formatUzPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  let d = digits;
  if (d.startsWith('998')) d = d.slice(3);
  else if (d.startsWith('8') && d.length > 9) d = d.slice(1);
  let out = '+998';
  if (d.length > 0) out += ' ' + d.slice(0, 2);
  if (d.length > 2) out += ' ' + d.slice(2, 5);
  if (d.length > 5) out += ' ' + d.slice(5, 7);
  if (d.length > 7) out += ' ' + d.slice(7, 9);
  return out;
}

function isValidUzPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
}

function CheckoutSheet({ basket, shop, onClose, onOrderSent, showToast, onUpdateQty, onRemoveItem }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState('delivery');
  const [payMethod, setPayMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [tried, setTried] = useState(false);

  const deliveryFee = delivery === 'pickup' ? 0 : 15000;
  const subtotal = basket.reduce((s, b) => s + b.qty * b.unitPrice, 0);
  const total = subtotal + deliveryFee;

  const nameErr = tried && !name.trim();
  const phoneErr = tried && !isValidUzPhone(phone);
  const addrErr = tried && delivery === 'delivery' && !address.trim();

  async function submit(e) {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || !isValidUzPhone(phone)) return;
    if (delivery === 'delivery' && !address.trim()) return;
    setSending(true);
    try {
      const order = await api.post(`/shops/${shop.id}/orders`, {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        deliveryMethod: delivery,
        deliveryFee,
        payMethod,
        note,
        items: basket.map((b) => ({
          productId: b.productId,
          variantId: b.variantId,
          name: b.name,
          label: b.label,
          qty: b.qty,
          unitPrice: b.unitPrice,
        })),
      });
      onOrderSent(order.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error placing order', 'error');
    }
    setSending(false);
  }

  return (
    <div className="checkout-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="checkout-sheet">
        <div className="checkout-sheet__header">
          <span className="checkout-sheet__title">{t('co_checkout')}</span>
          <button className="checkout-sheet__close" type="button" onClick={onClose}>&times;</button>
        </div>

        {/* Basket items */}
        <div className="checkout-sheet__items">
          {basket.map((item, i) => (
            <div className="checkout-item" key={i}>
              <div className="checkout-item__info">
                <div className="checkout-item__name">{item.name}</div>
                {item.label && <div className="checkout-item__label">{item.label}</div>}
              </div>
              <div className="checkout-item__qty-ctrl">
                <button
                  className="checkout-item__qty-btn"
                  type="button"
                  disabled={item.qty <= 1}
                  onClick={() => onUpdateQty(i, item.qty - 1)}
                >−</button>
                <span className="checkout-item__qty">{item.qty}</span>
                <button className="checkout-item__qty-btn" type="button" onClick={() => onUpdateQty(i, item.qty + 1)}>+</button>
                <button className="checkout-item__remove" type="button" onClick={() => onRemoveItem(i)} aria-label="Remove">✕</button>
              </div>
              <span className="checkout-item__price">{fmtPrice(item.qty * item.unitPrice)}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div className={`checkout-field${nameErr ? ' checkout-field--error' : ''}`}>
            <label>{t('co_name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={nameErr || undefined} />
            {nameErr && <span className="checkout-field__err">{t('co_err_name')}</span>}
          </div>
          <div className={`checkout-field${phoneErr ? ' checkout-field--error' : ''}`}>
            <label>{t('co_phone')}</label>
            <input
              type="tel"
              value={phone}
              placeholder="+998 __ ___ __ __"
              onChange={(e) => setPhone(formatUzPhone(e.target.value))}
              aria-invalid={phoneErr || undefined}
            />
            {phoneErr && <span className="checkout-field__err">{t('co_err_phone')}</span>}
          </div>

          <div className="checkout-field">
            <label>{t('co_delivery')}</label>
            <div className="checkout-radio-group">
              <button
                type="button"
                className={`checkout-radio${delivery === 'delivery' ? ' checkout-radio--active' : ''}`}
                onClick={() => setDelivery('delivery')}
              >
                {t('co_delivery_deliver')}
              </button>
              <button
                type="button"
                className={`checkout-radio${delivery === 'pickup' ? ' checkout-radio--active' : ''}`}
                onClick={() => setDelivery('pickup')}
              >
                {t('co_delivery_pickup')}
              </button>
            </div>
          </div>

          {delivery === 'delivery' && (
            <div className={`checkout-field${addrErr ? ' checkout-field--error' : ''}`}>
              <label>{t('co_address')}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} aria-invalid={addrErr || undefined} />
              {addrErr && <span className="checkout-field__err">{t('co_err_address')}</span>}
            </div>
          )}

          <div className="checkout-field">
            <label>{t('co_payment')}</label>
            <div className="checkout-radio-group">
              <button
                type="button"
                className={`checkout-radio${payMethod === 'cash' ? ' checkout-radio--active' : ''}`}
                onClick={() => setPayMethod('cash')}
              >
                {t('co_pay_cash')}
              </button>
              <button
                type="button"
                className={`checkout-radio${payMethod === 'card' ? ' checkout-radio--active' : ''}`}
                onClick={() => setPayMethod('card')}
              >
                {t('co_pay_card')}
              </button>
            </div>
          </div>

          <div className="checkout-field">
            <label>{t('co_note')}</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          <div className="checkout-summary">
            <div className="checkout-summary__line">
              <span>{t('co_subtotal')} ({basket.reduce((s, b) => s + b.qty, 0)})</span>
              <span>{fmtPrice(subtotal)}</span>
            </div>
            <div className="checkout-summary__line">
              <span>{t('co_delivery_fee')}</span>
              <span>{deliveryFee === 0 ? t('co_free') : fmtPrice(deliveryFee)}</span>
            </div>
            <div className="checkout-total">
              <span>{t('co_total')}</span>
              <span>{fmtPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--block"
            disabled={sending}
          >
            {sending ? t('loading') : t('co_place')}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== Order Success ===== */

function OrderSuccess({ order, onClose }) {
  return (
    <div className="order-success">
      <div className="order-success__icon">{'✓'}</div>
      <h2>{t('co_success')}</h2>
      <p>Order #{order.orderNo || order.id}</p>
      <p>{t('co_total')}: {fmtPrice(order.total)}</p>
      <p>The seller will confirm your order shortly.</p>
      <button className="btn btn--primary btn--lg" onClick={onClose}>
        {t('sf_back')}
      </button>
    </div>
  );
}

/* ===== Size Chart ===== */

function SizeChartPanel({ chart, lang, onClose }) {
  return (
    <div className="sz-chart" onClick={e => e.stopPropagation()}>
      <div className="sz-head">
        <b>{chart.title[lang]}</b>
        <button type="button" onClick={onClose} aria-label={t('close')}>{I.x({ width: 15, height: 15 })}</button>
      </div>
      <table>
        <thead><tr>{chart.cols.map((c, i) => <th key={i}>{c[lang]}</th>)}</tr></thead>
        <tbody>{chart.rows.map((r, i) => <tr key={i}>{r.map((cell, k) => <td key={k}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ===== Option Picker (design-accurate) ===== */

function OptionPicker({ product, sel, setSel, lang }) {
  const offered = offeredOptions(product);
  const attrs = variantAttrs(product.catId).filter(a => (offered[a.id] || []).length);
  const chart = sizeChartFor(product.catId);
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="opt-groups">
      {attrs.map(a => {
        const chosen = sel[a.id];
        const isChart = chart && chart.attr.id === a.id;
        return (
          <div key={a.id} className="opt-group">
            <div className="opt-label">
              <span className="sf-up">{a.name[lang]}</span>
              {chosen && a.swatch && <b>{attrValueName(a.id, chosen, lang)}</b>}
              {isChart && <button className="opt-chart-link" type="button" onClick={() => setShowChart(v => !v)}>{t('sf_size_chart') || 'Size chart'}</button>}
            </div>
            {isChart && showChart && <SizeChartPanel chart={chart.chart} lang={lang} onClose={() => setShowChart(false)} />}
            <div className={`opt-values ${a.swatch ? 'color' : 'size'}`}>
              {(offered[a.id] || []).map(v => {
                const rest = { ...sel }; delete rest[a.id];
                const off = !optionReachable(product, rest, a.id, v);
                const on = chosen === v;
                if (a.swatch) {
                  return (
                    <button key={v} type="button"
                      className={`opt-sw${on ? ' on' : ''}${off ? ' off' : ''}`}
                      disabled={off}
                      title={attrValueName(a.id, v, lang)}
                      onClick={() => setSel(s => ({ ...s, [a.id]: v }))}
                    >
                      <i style={{ background: attrValueHex(a.id, v) || '#ccc' }} />
                      <span>{attrValueName(a.id, v, lang)}</span>
                    </button>
                  );
                }
                return (
                  <button key={v} type="button"
                    className={`opt-chip${on ? ' on' : ''}${off ? ' off' : ''}`}
                    disabled={off}
                    onClick={() => setSel(s => ({ ...s, [a.id]: v }))}
                  >{attrValueName(a.id, v, lang)}</button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== Spec Table ===== */

function SpecTable({ product, lang }) {
  const attrs = specAttrs(product.catId).filter(a => {
    const v = (product.specs || {})[a.id];
    return v != null && v !== '' && !(Array.isArray(v) && !v.length);
  });
  if (!attrs.length) return null;
  return (
    <div className="spec-block">
      <div className="sf-sizes-label sf-up">{t('sf_specs') || t('sf_about')}</div>
      <table className="spec-table"><tbody>
        {attrs.map(a => {
          const v = (product.specs || {})[a.id];
          let text;
          if (a.kind === 'bool') text = v ? t('yes') : t('no');
          else if (a.kind === 'number') text = String(v) + (a.unit ? ' ' + a.unit[lang] : '');
          else if (a.kind === 'multi') text = v.map(x => attrValueName(a.id, x, lang)).join(', ');
          else if (a.kind === 'text') text = String(v);
          else text = attrValueName(a.id, v, lang);
          return <tr key={a.id}><th>{a.name[lang]}</th><td>{text}</td></tr>;
        })}
      </tbody></table>
    </div>
  );
}

/* ===== Contact Block ===== */

function ContactBlock({ shop }) {
  const rows = [
    shop.telegram && ['Telegram', `@${shop.telegram.replace('@', '')}`, `https://t.me/${shop.telegram.replace('@', '')}`],
    shop.instagram && ['Instagram', `@${shop.instagram.replace('@', '')}`, `https://instagram.com/${shop.instagram.replace('@', '')}`],
    shop.phone && [t('ob_phone_contact'), shop.phone, `tel:${shop.phone}`],
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className="sf-contact-block">
      <div className="sf-sizes-label sf-up">{t('sf_reach')}</div>
      <div className="sf-contacts">
        {rows.map(([label, display, href]) => (
          <div key={label} className="sf-contact">
            <span>{label}</span>
            <b><a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer">{display}</a></b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Product Page ===== */

function parseOptions(v) {
  if (v && v.options && typeof v.options === 'object') return v.options;
  try { return JSON.parse(v.optionsJson || '{}') || {}; } catch { return {}; }
}

function normalizeProduct(product) {
  if (!product.variants) return product;
  const variants = product.variants.map(v => {
    if (v.options) return v;
    try {
      return { ...v, options: JSON.parse(v.optionsJson || '{}') };
    } catch { return { ...v, options: {} }; }
  });
  return { ...product, variants };
}

function ProductPage({ product: rawProduct, shop, handle, onBack, onAddToBasket, showToast }) {
  const lang = getLang();
  const product = useMemo(() => normalizeProduct(rawProduct), [rawProduct]);
  const [galIdx, setGalIdx] = useState(0);
  const [sel, setSel] = useState({});
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const touchX = React.useRef(null);

  const name = getProductName(product);
  const desc = getProductDesc(product);
  const state = stockState(product);
  const bg = toneColor(product);

  // Attribute-based variant picking (design-accurate)
  const offered = useMemo(() => offeredOptions(product), [product]);
  const pickAttrs = useMemo(() => variantAttrs(product.catId).filter(a => (offered[a.id] || []).length), [product.catId, offered]);
  const hasAttrPicker = pickAttrs.length > 0;

  const chosen = useMemo(() => {
    if (!hasAttrPicker) return (product.variants || [])[0] || null;
    if (pickAttrs.every(a => sel[a.id])) return variantFor(product, sel);
    return null;
  }, [hasAttrPicker, pickAttrs, sel, product]);

  const needsPick = hasAttrPicker && !chosen;
  const missing = pickAttrs.filter(a => !sel[a.id]).map(a => a.name[lang].toLowerCase()).join(' + ');
  const maxQty = chosen ? Math.max(1, chosen.qty || 0) : 1;
  const isSoldOut = chosen ? (chosen.qty || 0) === 0 : state === 'sold';
  const canAdd = chosen && !isSoldOut && !needsPick;

  // Images — match by exact variant OR by colour (same swatch attribute value)
  const allImages = product.images || [];
  const defaultImages = allImages.filter(img => !img.variantId);
  const swatchAttr = pickAttrs.find(a => a.swatch) || null;
  const colorPick = swatchAttr ? sel[swatchAttr.id] : null;
  const variantImages = useMemo(() => {
    if (!chosen && !colorPick) return [];
    // First try exact variant match
    if (chosen) {
      const exact = allImages.filter(img => img.variantId === chosen.id);
      if (exact.length) return exact;
    }
    // Then try matching any variant with the same colour
    if (colorPick) {
      const colorVariantIds = (product.variants || [])
        .filter(v => (v.options || {})[swatchAttr.id] === colorPick)
        .map(v => v.id);
      const byColor = allImages.filter(img => img.variantId && colorVariantIds.includes(img.variantId));
      if (byColor.length) return byColor;
    }
    return [];
  }, [allImages, chosen, colorPick, product.variants, swatchAttr]);
  const galleryImages = variantImages.length > 0 ? variantImages : defaultImages;

  // Reset on product change
  useEffect(() => { setGalIdx(0); setSel({}); setQty(1); }, [product.id]);
  useEffect(() => { setQty(q => Math.min(Math.max(1, q), maxQty)); }, [chosen?.id, maxQty]);
  useEffect(() => { setGalIdx(0); }, [JSON.stringify(sel)]);

  // Fetch reviews
  useEffect(() => {
    if (!shop?.id) return;
    api.get(`/shops/${shop.id}/reviews`).then(res => {
      const all = res.data || [];
      setReviews(all.filter(r => r.productId === product.id));
    }).catch(() => {});
  }, [shop?.id, product.id]);

  function handleAdd() {
    if (!canAdd) return;
    const label = chosen ? parseVariantLabel(chosen.optionsJson, product.catId) : '';
    const unitPrice = chosen?.price || product.price || 0;
    onAddToBasket({
      productId: product.id,
      variantId: chosen?.id || null,
      name,
      label,
      qty,
      unitPrice,
    });
    setQty(1);
    showToast(t('co_added'));
  }

  async function handleReviewSubmit(review) {
    try {
      await api.post(`/shops/${shop.id}/reviews`, {
        productId: product.id,
        rating: review.rating,
        name: review.name,
        text: review.text,
      });
      showToast(t('rv_thanks'));
      const res = await api.get(`/shops/${shop.id}/reviews`);
      const all = res.data || [];
      setReviews(all.filter(r => r.productId === product.id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/${handle}/p/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: name, url });
    } else {
      navigator.clipboard.writeText(url);
      showToast(t('db_copied'));
    }
  }

  // Touch swipe for gallery
  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 45) setGalIdx(x => Math.max(0, Math.min(galleryImages.length - 1, x + (dx < 0 ? 1 : -1))));
    touchX.current = null;
  }

  // Smart button label
  const buttonLabel = needsPick
    ? `${t('sf_pick_size')}: ${missing}`
    : isSoldOut
    ? t('sf_sold')
    : `${t('co_add')} · ${fmtPrice((chosen?.price || product.price) * qty)}`;

  const stats = ratingStats(reviews);

  return (
    <div className="pp">
      <div className="sf-wrap">
        <button className="pp-back" type="button" onClick={onBack}>
          {I.back ? I.back({ width: 16, height: 16 }) : '←'} {t('pp_back')}
        </button>

        <div className="pp-grid">
          {/* Gallery */}
          <div className="pp-media">
            <div className={`pp-gal${isSoldOut ? ' is-sold' : ''}`}
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <StockBadge state={state} />
              {galleryImages.length > 0 ? (
                galleryImages.map((img, k) => (
                  <div key={img.id || k} className={`sf-gal-frame${galIdx === k ? ' on' : ''}`}>
                    <img src={img.url} alt={`${name} #${k + 1}`} loading={k === 0 ? 'eager' : 'lazy'} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))
              ) : (
                <div className="sf-gal-frame on">
                  <div className="pp-img-placeholder" style={{ backgroundColor: product.tone || bg }}>
                    <span>{name.charAt(0)}</span>
                  </div>
                </div>
              )}
              {galleryImages.length > 1 && (
                <>
                  {galIdx > 0 && <button className="sf-gal-nav prev" type="button" onClick={() => setGalIdx(galIdx - 1)}>{I.back ? I.back({ width: 18, height: 18 }) : '←'}</button>}
                  {galIdx < galleryImages.length - 1 && <button className="sf-gal-nav next" type="button" onClick={() => setGalIdx(galIdx + 1)}>{I.arrow ? I.arrow({ width: 18, height: 18 }) : '→'}</button>}
                  <div className="sf-gal-count">{galIdx + 1}/{galleryImages.length}</div>
                  <div className="sf-gal-dots">
                    {galleryImages.map((_, k) => (
                      <button key={k} type="button" className={`sf-gal-dot${galIdx === k ? ' on' : ''}`} onClick={() => setGalIdx(k)} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="pp-thumbs">
                {galleryImages.map((img, k) => (
                  <button key={img.id || k} type="button"
                    className={`pp-thumb${galIdx === k ? ' on' : ''}`}
                    onClick={() => setGalIdx(k)}
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pp-info">
            <div className="pname sf-display">{name}</div>

            <div className="pp-price-row">
              <div className="pprice">{fmtPrice(chosen?.price || product.price)}</div>
              {stats.n > 0 && (
                <button className="pp-rv-link" type="button" onClick={() => {
                  const el = document.getElementById('pp-reviews');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <Stars value={Math.round(parseFloat(stats.avg))} size={14} />
                  <b>{stats.avg}</b> · {fill(t('rv_count'), { n: stats.n })}
                </button>
              )}
            </div>

            {desc && <div className="sf-detail-desc">{desc}</div>}

            {/* Option Picker */}
            {hasAttrPicker && (
              <OptionPicker product={product} sel={sel} setSel={setSel} lang={lang} />
            )}

            {/* Buy Box */}
            <div className="buy-box">
              <div className="buy-row">
                <div className="opt-label"><span className="sf-up">{t('opt_qty')}</span></div>
                <div className="qty-pick">
                  <button type="button" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>{I.minus ? I.minus({ width: 16, height: 16 }) : '−'}</button>
                  <b>{qty}</b>
                  <button type="button" disabled={qty >= maxQty} onClick={() => setQty(q => Math.min(maxQty, q + 1))}>{I.plus ? I.plus({ width: 16, height: 16 }) : '+'}</button>
                </div>
                {chosen && chosen.qty > 0 && (
                  <span className={`buy-left${chosen.qty <= 5 ? ' low' : ''}`}>
                    {fill(t('opt_left'), { n: chosen.qty })}
                  </span>
                )}
              </div>
              <button
                className="sf-btn sf-btn-accent"
                onClick={handleAdd}
                disabled={!canAdd}
                type="button"
              >
                {buttonLabel}
              </button>
            </div>

            {/* Share */}
            <div className="sf-detail-cta">
              <button className="sf-btn sf-btn-line" type="button" onClick={handleShare}>
                {I.share ? I.share({ width: 17, height: 17 }) : '↗'} {t('sf_share')}
              </button>
            </div>

            {/* Specs */}
            <SpecTable product={product} lang={lang} />

            {/* Contact */}
            <ContactBlock shop={shop} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pp-reviews" id="pp-reviews">
          <div className="pp-rv-head">
            <b className="sf-display">{t('rv_title')}</b>
            {stats.n > 0 && (
              <span className="pp-rv-sum">
                <Stars value={Math.round(parseFloat(stats.avg))} size={14} />
                <b>{stats.avg}</b> · {fill(t('rv_based'), { n: stats.n })}
              </span>
            )}
          </div>
          {stats.n === 0 && (
            <div className="pp-rv-none">
              <b>{t('rv_none')}</b>
              <p>{t('rv_none_d')}</p>
            </div>
          )}
          <div className="pp-rv-grid">
            <div className="pp-rv-list">
              {reviews.map((r, i) => (
                <div className="pp-rv" key={r.id || i}>
                  <div className="pp-rv-top">
                    <b>{r.name || t('rv_anon')}</b>
                    <Stars value={r.rating} size={14} />
                    {r.createdAt && <span>{new Date(r.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>}
                  </div>
                  {r.text && <p>{r.text}</p>}
                </div>
              ))}
            </div>
            <ReviewForm onSubmit={handleReviewSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Main Page ===== */

export default function StorefrontPage() {
  const { handle, productId: urlProductId } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shop, setShop] = useState(null);
  const [shopConfig, setShopConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const [tab, setTab] = useState('products');
  const fetchShopByHandle = useShopStore((s) => s.fetchShopByHandle);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const fetchMyShops = useShopStore((s) => s.fetchMyShops);
  const token = useAuthStore((s) => s.token);
  const [isOwner, setIsOwner] = useState(false);

  // Basket
  const [basket, setBasket] = useState([]); // [{productId, variantId, name, label, qty, unitPrice}]
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [toast, showToast] = useToast();

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const shopData = await fetchShopByHandle(handle);
        setShop(shopData);
        if (shopData?.id) {
          await fetchProducts(shopData.id);
          const storeProducts = useShopStore.getState().products;
          setProducts(storeProducts);
          if (urlProductId) {
            const found = storeProducts.find(p => String(p.id) === String(urlProductId));
            if (found) setSelectedProduct(found);
            else setProductNotFound(true);
          }
          try {
            const configRes = await api.get(`/shops/${shopData.id}/config`);
            setShopConfig(configRes.data);
          } catch {
            // config may not exist
          }
        }
      } catch (e) {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [handle, fetchShopByHandle, fetchProducts, navigate]);

  useEffect(() => {
    if (!token || !shop) { setIsOwner(false); return; }
    fetchMyShops().then(shops => {
      setIsOwner(shops.some(s => s.id === shop.id));
    });
  }, [token, shop?.id, fetchMyShops]);

  useEffect(() => {
    if (!shop) return;
    const lang = getLang();
    const langAttr = lang === 'ru' ? 'ru' : lang === 'uz' ? 'uz' : 'en';
    document.documentElement.lang = langAttr;

    function setMeta(prop, content) {
      if (!content) return;
      let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(prop.startsWith('og:') || prop.startsWith('twitter:') ? 'property' : 'name', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    const prodName = selectedProduct ? getProductName(selectedProduct) : null;
    const prodPrice = selectedProduct ? fmtPrice(selectedProduct.price) : null;
    const coverImg = selectedProduct?.images?.[0]?.url || shop.logoUrl || shop.coverUrl || '';
    const pageUrl = selectedProduct
      ? `${window.location.origin}/${handle}/p/${selectedProduct.id}`
      : `${window.location.origin}/${handle}`;

    if (selectedProduct) {
      document.title = `${prodName} — ${prodPrice} | ${shop.name}`;
      setMeta('og:title', prodName);
      setMeta('og:description', `${prodPrice} · ${shop.name}`);
    } else {
      const count = products.filter(p => p.visible !== false).length;
      document.title = `${shop.name} | rasta`;
      setMeta('og:title', shop.name);
      setMeta('og:description', `${count} ${plural(count, 'product')} · ${shop.location || ''}`);
    }
    setMeta('og:type', selectedProduct ? 'product' : 'website');
    setMeta('og:url', pageUrl);
    setMeta('og:image', coverImg);
    setMeta('og:site_name', shop.name);
    setMeta('og:locale', lang === 'ru' ? 'ru_RU' : lang === 'uz' ? 'uz_UZ' : 'en_US');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('description', selectedProduct ? `${prodName} — ${prodPrice}` : `${shop.name} — ${shop.location || ''}`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = pageUrl;

    return () => { document.title = 'rastashops — Your shop, your link'; };
  }, [shop, selectedProduct, products, handle]);

  const themeId = shopConfig?.theme?.toLowerCase() || 'minimal';
  const paletteId = shopConfig?.palette || 'ivory';
  const theme = getTheme(themeId);
  const palette = getPalette(paletteId);
  const themeVars = applyThemeVars(theme);
  const paletteVars = applyPaletteVars(palette);
  const styleVars = { ...themeVars, ...paletteVars };

  const categories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => { if (p.catId) cats.add(p.catId); });
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.visible !== false);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => getProductName(p).toLowerCase().includes(q));
    }
    if (categoryFilter) {
      list = list.filter((p) => p.catId === categoryFilter);
    }
    if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    return list;
  }, [products, search, categoryFilter, sort]);

  const layout = shopConfig?.layout?.toLowerCase() || 'grid';

  /* ===== Basket actions ===== */

  function addToBasket(item) {
    setBasket((prev) => {
      const idx = prev.findIndex(
        (b) => b.productId === item.productId && b.variantId === item.variantId,
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + item.qty };
        return updated;
      }
      return [...prev, item];
    });
    showToast(t('co_added'));
  }

  function updateBasketQty(index, qty) {
    setBasket((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  }

  function removeBasketItem(index) {
    setBasket((prev) => prev.filter((_, i) => i !== index));
  }

  function handleOrderSent(order) {
    setShowCheckout(false);
    setBasket([]);
    setCompletedOrder(order);
  }

  function handleShare() {
    const url = `${window.location.origin}/${handle}`;
    if (navigator.share) {
      navigator.share({ title: shop?.name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  /* ===== Renders ===== */

  if (loading) {
    return (
      <div className="sf-loading" style={styleVars}>
        <div className="sf-loading__spinner">{t('loading')}</div>
      </div>
    );
  }

  if (notFound || !shop) {
    return (
      <div className="storefront" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <meta name="robots" content="noindex" />
          <div style={{ marginBottom: '1rem', color: '#999' }}>{I.eye({ width: 48, height: 48 })}</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('nf_shop_t')}</h1>
          <p style={{ color: '#666', marginBottom: '0.25rem' }}>{t('nf_shop_d')}</p>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{t('nf_tried')}: <code>/{handle}</code></p>
          <a href="/" style={{ color: 'var(--primary, #6366f1)', fontWeight: 600 }}>{t('nf_go_home')}</a>
        </div>
      </div>
    );
  }

  // Order success screen
  if (completedOrder) {
    return (
      <div className="storefront" style={styleVars}>
        <div className="sf-container">
          <OrderSuccess
            order={completedOrder}
            onClose={() => { setCompletedOrder(null); setSelectedProduct(null); }}
          />
        </div>
      </div>
    );
  }

  // Product not found (deep link to nonexistent product)
  if (productNotFound) {
    return (
      <div className="storefront" style={{ ...styleVars, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <meta name="robots" content="noindex" />
          <div style={{ marginBottom: '1rem', color: '#999' }}>{I.eye({ width: 48, height: 48 })}</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('nf_product_t')}</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{t('nf_product_d')}</p>
          <Link to={`/${handle}`} style={{ color: 'var(--s-accent, var(--primary, #6366f1))', fontWeight: 600 }}>{t('nf_go_shop')}</Link>
        </div>
      </div>
    );
  }

  // Product page (full page, not drawer/modal)
  if (selectedProduct) {
    return (
      <div className="storefront" style={styleVars}>
        <ProductPage
          product={selectedProduct}
          shop={shop}
          handle={handle}
          onBack={() => { setSelectedProduct(null); navigate(`/${handle}`); }}
          onAddToBasket={addToBasket}
          showToast={showToast}
        />
        {/* Basket dock */}
        {basket.length > 0 && !showCheckout && (
          <div className="basket-dock">
            <span className="basket-dock__summary">
              {basket.reduce((s, b) => s + b.qty, 0)} {plural(basket.reduce((s, b) => s + b.qty, 0), 'item')} &middot; {fmtPrice(basket.reduce((s, b) => s + b.qty * b.unitPrice, 0))}
            </span>
            <button className="btn btn--primary btn--sm" onClick={() => setShowCheckout(true)}>
              {t('co_checkout')} &rarr;
            </button>
          </div>
        )}
        {showCheckout && (
          <CheckoutSheet
            basket={basket}
            shop={shop}
            onClose={() => setShowCheckout(false)}
            onOrderSent={handleOrderSent}
            showToast={showToast}
            onUpdateQty={updateBasketQty}
            onRemoveItem={removeBasketItem}
          />
        )}
        <Toast toast={toast} />
      </div>
    );
  }

  // Main listing
  return (
    <div className="storefront" style={styleVars}>
      {/* Cover */}
      <div
        className="sf-cover"
        style={{
          backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : 'none',
          backgroundColor: shop.coverUrl ? undefined : (shop.coverColor || 'var(--s-line)'),
        }}
      />

      {/* Header */}
      <div className="sf-container">
        <div className="sf-header">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} className="sf-header__avatar" loading="eager" decoding="async" width={72} height={72} />
          ) : (
            <div className="sf-header__avatar sf-header__avatar--placeholder">
              {shop.initials || shop.name?.charAt(0)}
            </div>
          )}
          <div className="sf-header__info">
            <h1 className="sf-header__name">{shop.name}</h1>
            <p className="sf-header__meta">
              {shop.handle && <span>@{shop.handle}</span>}
              {shop.location && <><span className="sf-meta-dot">&middot;</span><span>{shop.location}</span></>}
              <span className="sf-meta-dot">&middot;</span>
              <span>{filtered.length} {plural(filtered.length, 'product')}</span>
            </p>
            <div className="sf-header__tags">
              <span className="sf-tag-pill">{t('co_delivery')}</span>
              <span className="sf-tag-pill">{t('co_pay_cash')}</span>
              <span className="sf-tag-pill">{t('co_pay_card')}</span>
            </div>
            {(shop.telegram || shop.instagram || shop.phone) && (
              <div className="sf-header__contacts">
                <span className="sf-contacts-label">{t('sf_reach')}:</span>
                {shop.telegram && (
                  <a href={`https://t.me/${shop.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    @{shop.telegram.replace('@', '')}
                  </a>
                )}
                {shop.instagram && (
                  <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    @{shop.instagram.replace('@', '')}
                  </a>
                )}
                {shop.phone && (
                  <a href={`tel:${shop.phone}`}>{shop.phone}</a>
                )}
              </div>
            )}
          </div>
          <div className="sf-header__actions">
            {isOwner && (
              <Link to="/dashboard" className="sf-btn sf-btn-line">
                {I.back ? I.back({ width: 15, height: 15 }) : '←'} {t('ob_go_dashboard')}
              </Link>
            )}
            <LangPill />
            <button className="sf-btn sf-btn-line" onClick={handleShare}>
              &#8599; {t('sf_share')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="sf-tabs">
          <button
            className={`sf-tabs__btn ${tab === 'products' ? 'sf-tabs__btn--active' : ''}`}
            onClick={() => setTab('products')}
            type="button"
          >
            {t('sf_products')} ({filtered.length})
          </button>
          <button
            className={`sf-tabs__btn ${tab === 'about' ? 'sf-tabs__btn--active' : ''}`}
            onClick={() => setTab('about')}
            type="button"
          >
            {t('sf_about')}
          </button>
        </div>

        {tab === 'products' && (
          <>
            {/* Filters */}
            <div className="sf-filters">
              <input
                type="text"
                className="sf-filters__search"
                placeholder={t('sf_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="sf-filters__cats">
                <button
                  className={`sf-cat-pill ${!categoryFilter ? 'sf-cat-pill--active' : ''}`}
                  onClick={() => setCategoryFilter('')}
                  type="button"
                >
                  {t('sf_all')}
                </button>
                {categories.map((cat) => {
                  const lang = getLang();
                  const leafName = catLabel(cat, lang);
                  const isDuplicate = categories.some(c => c !== cat && catLabel(c, lang) === leafName);
                  const path = catPathIds(cat);
                  const parentName = isDuplicate && path.length >= 2 ? catLabel(path[path.length - 2], lang) : '';
                  const chipLabel = parentName ? `${leafName} · ${parentName}` : leafName;
                  return (
                    <button
                      key={cat}
                      className={`sf-cat-pill ${categoryFilter === cat ? 'sf-cat-pill--active' : ''}`}
                      onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                      type="button"
                    >
                      {chipLabel}
                    </button>
                  );
                })}
              </div>
              <select
                className="sf-filters__sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="default">{t('sf_all')}</option>
                <option value="price-asc">{t('db_price')} &#8593;</option>
                <option value="price-desc">{t('db_price')} &#8595;</option>
              </select>
            </div>

            {/* Products */}
            {filtered.length === 0 ? (
              <EmptyState icon="&#128722;" title={t('sf_empty')} />
            ) : (
              <div className={`sf-products sf-products--${layout}`}>
                {filtered.map((product) => {
                  const name = getProductName(product);
                  const state = stockState(product);
                  const bg = toneColor(product);
                  return (
                    <Link
                      key={product.id}
                      className={`sf-product-card sf-product-card--${layout}`}
                      to={`/${handle}/p/${product.id}`}
                      onClick={(e) => { e.preventDefault(); setSelectedProduct(product); navigate(`/${handle}/p/${product.id}`); }}
                    >
                      <div className="sf-product-card__img">
                        {product.images?.length > 0 ? (
                          <img src={product.images[0].url} alt={name} loading="lazy" decoding="async" width={400} height={400} />
                        ) : (
                          <div className="sf-product-card__no-img--toned" style={{ background: bg }}>
                            {name?.charAt(0)}
                          </div>
                        )}
                        <StockBadge state={state} overlay />
                      </div>
                      <div className="sf-product-card__info">
                        <h3 className="sf-product-card__name">{name}</h3>
                        <span className="sf-product-card__price">{fmtPrice(product.price)}</span>
                        {product.variants?.length > 0 && (
                          <div className="sf-product-card__sizes">
                            {product.variants.slice(0, 4).map((v, i) => (
                              <span key={i} className="sf-product-card__size">
                                {parseVariantLabel(v.optionsJson, product.catId)}
                              </span>
                            ))}
                            {product.variants.length > 4 && (
                              <span className="sf-product-card__size">+{product.variants.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'about' && (
          <div className="sf-about">
            {shop.location && <p><strong>{t('ob_city')}:</strong> {shop.location}</p>}
            {shop.telegram && <p><strong>Telegram:</strong> @{shop.telegram.replace('@', '')}</p>}
            {shop.instagram && <p><strong>Instagram:</strong> @{shop.instagram.replace('@', '')}</p>}
            {shop.phone && <p><strong>{t('ob_phone_contact')}:</strong> {shop.phone}</p>}
          </div>
        )}

        {/* Footer */}
        <footer className="sf-footer">
          <div className="sf-footer__contacts">
            {shop.telegram && (
              <a href={`https://t.me/${shop.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            )}
            {shop.instagram && (
              <a href={`https://instagram.com/${shop.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {shop.phone && (
              <a href={`tel:${shop.phone}`}>{shop.phone}</a>
            )}
          </div>
          {shop.location && <p className="sf-footer__location">{shop.location}</p>}
          <p className="sf-footer__platform">
            <a href="https://rastashops.com" target="_blank" rel="noopener noreferrer">rastashops.com</a>
          </p>
        </footer>
      </div>

      {/* Basket dock */}
      {basket.length > 0 && !showCheckout && (
        <div className="basket-dock">
          <span className="basket-dock__summary">
            {basket.reduce((s, b) => s + b.qty, 0)} {plural(basket.reduce((s, b) => s + b.qty, 0), 'item')} &middot; {fmtPrice(basket.reduce((s, b) => s + b.qty * b.unitPrice, 0))}
          </span>
          <button className="btn btn--primary btn--sm" onClick={() => setShowCheckout(true)}>
            {t('co_checkout')} &rarr;
          </button>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <CheckoutSheet
          basket={basket}
          shop={shop}
          onClose={() => setShowCheckout(false)}
          onOrderSent={handleOrderSent}
          showToast={showToast}
          onUpdateQty={updateBasketQty}
          onRemoveItem={removeBasketItem}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
