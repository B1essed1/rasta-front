import React, { useState, useEffect, useMemo } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore, totalQty, stockState, DEFAULT_THRESHOLD } from '../../store/shopStore';
import { I } from '../../components/ui/Icons';

function getProductName(p) {
  return p.nameEn || p.nameUz || p.nameRu || '';
}

function parseVariantLabel(optionsJson) {
  if (!optionsJson) return '';
  try {
    const obj = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
    return Object.values(obj).join(' · ');
  } catch {
    return optionsJson;
  }
}

function variantState(v, threshold) {
  const th = v.threshold != null ? v.threshold : (threshold ?? DEFAULT_THRESHOLD);
  if ((v.qty || 0) <= 0) return 'out';
  if ((v.qty || 0) <= th) return 'low';
  return 'ok';
}

function StatusPill({ state }) {
  const labels = { ok: t('inv_in_stock'), low: t('inv_low_stock'), out: t('inv_sold_out') };
  return <span className={`st-pill ${state}`}><i />{labels[state]}</span>;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('ru-RU').replace(/[, ]/g, ' ');
}

function variantImage(product, variant) {
  const images = product.images || [];
  const byVariant = images.find((img) => img.variantId === variant.id);
  if (byVariant) return byVariant.url;
  const defaultImg = images.find((img) => !img.variantId) || images[0];
  return defaultImg?.url || null;
}

function RestockModal({ product, variant, onClose, onRestock }) {
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const n = parseInt(qty, 10);
    if (!n || n <= 0) return;
    setSaving(true);
    try {
      await onRestock(variant.id, product.id, n, null, note);
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_restock')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div className="stk-photo" style={{ background: product.tone || '#e8e8e4' }}>
              {product.images?.[0]?.url
                ? <img src={product.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{getProductName(product).charAt(0)}</span>}
            </div>
            <div>
              <b style={{ fontSize: 14 }}>{getProductName(product)}</b>
              {parseVariantLabel(variant.optionsJson) && <span style={{ display: 'block', fontSize: 12.5, color: 'var(--soft)' }}>{parseVariantLabel(variant.optionsJson)}</span>}
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--faint)' }}>{t('inv_qty')}: {variant.qty || 0}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>{t('inv_add_stock')}</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" autoFocus />
            </div>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>{t('inv_note')}</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>{t('g_cancel')}</button>
              <button type="submit" className="btn btn-accent btn-sm" disabled={!qty || parseInt(qty, 10) <= 0 || saving}>
                {I.box({ width: 15, height: 15 })} {t('inv_restock')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function InventoryView() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [restockTarget, setRestockTarget] = useState(null);
  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const restockVariant = useShopStore((s) => s.restockVariant);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => { if (shop?.id) fetchProducts(); }, [shop?.id, fetchProducts]);

  const rows = useMemo(() => {
    const out = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        out.push({ p, v, state: variantState(v) });
      });
    });
    return out;
  }, [products]);

  const counts = useMemo(() => ({
    all: rows.length,
    low: rows.filter((r) => r.state === 'low').length,
    out: rows.filter((r) => r.state === 'out').length,
  }), [rows]);

  const shown = useMemo(() => {
    return rows.filter((r) => {
      if (filter === 'low' && r.state !== 'low') return false;
      if (filter === 'out' && r.state !== 'out') return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = (getProductName(r.p) + ' ' + parseVariantLabel(r.v.optionsJson) + ' ' + (r.v.barcode || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  if (!products.length) {
    return (
      <div>
        <div className="db-sec-head"><div><h2>{t('db_inventory')}</h2><div className="sub">{t('inv_no_match')}</div></div></div>
        <div className="stock-table"><div className="stk-empty">{I.box({ width: 28, height: 28 })} {t('inv_no_match')}</div></div>
      </div>
    );
  }

  return (
    <div className="inv">
      <div className="db-sec-head">
        <div>
          <h2>{t('db_inventory')}</h2>
          <div className="sub">{t('inv_total_items')}: {counts.all}</div>
        </div>
        <div className="head-acts">
          <button className="btn btn-soft btn-sm" onClick={() => {
            const target = rows.find((r) => r.state === 'out' || r.state === 'low') || rows[0];
            if (target) setRestockTarget({ product: target.p, variant: target.v });
          }}>
            {I.box({ width: 16, height: 16 })} {t('inv_restock')}
          </button>
        </div>
      </div>

      <div className="inv-bar">
        <div className="inline-search grow">
          {I.search({ width: 16, height: 16 })}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('sf_search') || 'Search by name or barcode'} />
        </div>
        <div className="chip-row">
          <button className={`pick-chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
            {t('g_all')} <i>{counts.all}</i>
          </button>
          <button className={`pick-chip${filter === 'low' ? ' on' : ''}`} onClick={() => setFilter('low')}>
            {t('inv_low_stock')} <i>{counts.low}</i>
          </button>
          <button className={`pick-chip${filter === 'out' ? ' on' : ''}`} onClick={() => setFilter('out')}>
            {t('inv_sold_out')} <i>{counts.out}</i>
          </button>
        </div>
      </div>

      <div className="stock-table">
        <div className="stk-head">
          <span className="stk-c-sel"></span>
          <span className="stk-c-prod">{t('db_products')}</span>
          <span className="stk-c-bc">{t('inv_qty')}</span>
          <span className="stk-c-qty">{t('inv_qty')}</span>
          <span className="stk-c-cost">AVG COST</span>
          <span className="stk-c-st">STATUS</span>
          <span className="stk-c-last"></span>
          <span className="stk-c-more"></span>
        </div>

        {shown.length === 0 ? (
          <div className="stk-empty">{t('inv_no_match')}</div>
        ) : (
          shown.map((r) => {
            const name = getProductName(r.p);
            const vLabel = parseVariantLabel(r.v.optionsJson);
            return (
              <div key={r.v.id} className="stk-row">
                <span className="stk-c-sel"></span>
                <div className="stk-c-prod">
                  <div className="stk-photo" style={{ background: r.p.tone || '#e8e8e4' }}>
                    {variantImage(r.p, r.v)
                      ? <img src={variantImage(r.p, r.v)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{name.charAt(0)}</span>}
                  </div>
                  <div className="stk-name">
                    <b>{name}</b>
                    <span>{vLabel}</span>
                  </div>
                </div>
                <span className="stk-c-bc">
                  {r.v.barcode
                    ? <span className="bc-btn">{I.barcode({ width: 14, height: 14 })} {r.v.barcode}</span>
                    : <span className="bc-btn empty">{I.barcode({ width: 14, height: 14 })} —</span>}
                </span>
                <span className="stk-c-qty">
                  <button
                    className={`qty-btn${(r.v.qty || 0) <= 0 ? ' zero' : ''}`}
                    onClick={() => setRestockTarget({ product: r.p, variant: r.v })}
                  >
                    {r.v.qty || 0}
                  </button>
                </span>
                <span className={`stk-c-cost${r.v.avgCost == null ? ' none' : ''}`}>
                  {r.v.avgCost != null ? fmtNum(r.v.avgCost) : '—'}
                </span>
                <span className="stk-c-st">
                  <StatusPill state={r.state} />
                </span>
                <span className="stk-c-last"></span>
                <span className="stk-c-more">
                  <button className="icon-btn sm" title={t('inv_restock')} onClick={() => setRestockTarget({ product: r.p, variant: r.v })}>
                    {I.plus({ width: 15, height: 15 })}
                  </button>
                </span>
              </div>
            );
          })
        )}
      </div>

      {restockTarget && (
        <RestockModal
          product={restockTarget.product}
          variant={restockTarget.variant}
          onClose={() => setRestockTarget(null)}
          onRestock={(vId, pId, qty, cost, note) => restockVariant(vId, pId, qty, cost, note)}
        />
      )}
    </div>
  );
}
