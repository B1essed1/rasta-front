import React, { useState, useEffect, useMemo } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore, totalQty, stockState } from '../../store/shopStore';
import { I } from '../../components/ui/Icons';

function getProductName(product) {
  return product.nameEn || product.nameUz || product.nameRu || '';
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

/* ---- grid override: 5 columns instead of the design's 8 ---- */
const GRID_COLS = 'minmax(0,1fr) 80px 110px 110px 40px';

function StatusPill({ state }) {
  const cls = state === 'in' ? 'ok' : state === 'low' ? 'low' : 'out';
  const labels = { in: t('inv_in_stock'), low: t('inv_low_stock'), sold: t('inv_sold_out') };
  return (
    <span className={`st-pill ${cls}`}>
      <i />{labels[state]}
    </span>
  );
}

/* ---- Restock modal ---- */
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

  const vLabel = parseVariantLabel(variant.optionsJson);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">{t('inv_restock')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div
              className="stk-photo"
              style={{ background: product.tone || '#e8e8e4' }}
            >
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={getProductName(product)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                  {getProductName(product).charAt(0)}
                </span>
              )}
            </div>
            <div>
              <b style={{ fontSize: 14 }}>{getProductName(product)}</b>
              {vLabel && <span style={{ display: 'block', fontSize: 12.5, color: 'var(--soft)' }}>{vLabel}</span>}
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--faint)' }}>
                {t('inv_qty')}: {variant.qty || 0} {t('inv_units')}
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{t('inv_add_stock')}</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="form-input"
                autoFocus
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{t('inv_note')}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-soft btn-sm" onClick={onClose}>{t('g_cancel')}</button>
              <button type="submit" className="btn btn-accent btn-sm" disabled={!qty || parseInt(qty, 10) <= 0 || saving}>
                {I.plus({ width: 14, height: 14 })} {t('inv_restock')}
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

  /* ---- counts for filter chips ---- */
  const counts = useMemo(() => {
    let sold = 0, low = 0, inStock = 0;
    products.forEach((p) => {
      const s = stockState(p);
      if (s === 'sold') sold++;
      else if (s === 'low') low++;
      else inStock++;
    });
    return { sold, low, inStock, total: products.length };
  }, [products]);

  /* ---- filtered + searched list ---- */
  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'all') list = list.filter((p) => stockState(p) === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const name = getProductName(p).toLowerCase();
        if (name.includes(q)) return true;
        // also search variant barcodes
        return (p.variants || []).some((v) => v.barcode && v.barcode.toLowerCase().includes(q));
      });
    }
    return list;
  }, [products, filter, search]);

  /* ---- early return: no products at all ---- */
  if (!products.length) {
    return (
      <div>
        <div className="db-sec-head">
          <div>
            <h2>{t('db_inventory')}</h2>
            <div className="sub">0 {t('inv_total_items')}</div>
          </div>
        </div>
        <div className="stock-table">
          <div className="stk-empty">
            {I.box({ width: 32, height: 32, style: { opacity: 0.35, marginBottom: 8 } })}
            <div>{t('inv_no_match')}</div>
          </div>
        </div>
      </div>
    );
  }

  async function handleRestock(variantId, productId, qty, unitCost, note) {
    await restockVariant(variantId, productId, qty, unitCost, note);
  }

  return (
    <div>
      {/* ---- header ---- */}
      <div className="db-sec-head">
        <div>
          <h2>{t('db_inventory')}</h2>
          <div className="sub">{counts.total} {t('inv_total_items')}</div>
        </div>
        <div className="head-acts">
          <button className="btn btn-accent btn-sm" onClick={() => {
            // open restock for the first variant of the first low/out product, or first product
            const target = products.find((p) => stockState(p) === 'sold' || stockState(p) === 'low') || products[0];
            if (target) {
              const v = (target.variants || [])[0];
              if (v) setRestockTarget({ product: target, variant: v });
            }
          }}>
            {I.plus({ width: 15, height: 15 })} {t('inv_restock')}
          </button>
        </div>
      </div>

      {/* ---- filter bar ---- */}
      <div className="inv-bar">
        <div className="inline-search grow">
          {I.barcode({ width: 16, height: 16, style: { opacity: 0.4, flexShrink: 0 } })}
          <input
            type="text"
            placeholder={t('inv_qty') + ' / ' + t('db_inventory') + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={`pick-chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
          {t('g_all')} <i>{counts.total}</i>
        </button>
        <button className={`pick-chip${filter === 'low' ? ' on' : ''}`} onClick={() => setFilter('low')}>
          {t('inv_low_stock')} <i>{counts.low}</i>
        </button>
        <button className={`pick-chip${filter === 'sold' ? ' on' : ''}`} onClick={() => setFilter('sold')}>
          {t('inv_sold_out')} <i>{counts.sold}</i>
        </button>
      </div>

      {/* ---- stock table ---- */}
      <div className="stock-table">
        {/* table header */}
        <div className="stk-head" style={{ gridTemplateColumns: GRID_COLS }}>
          <span>Product</span>
          <span>{t('inv_qty')}</span>
          <span>Cost</span>
          <span>Status</span>
          <span></span>
        </div>

        {/* table rows */}
        {filtered.length === 0 ? (
          <div className="stk-empty">
            {I.search({ width: 24, height: 24, style: { opacity: 0.3, marginBottom: 6 } })}
            <div>{t('inv_no_match')}</div>
          </div>
        ) : (
          filtered.map((product) => {
            const name = getProductName(product);
            const state = stockState(product);
            const total = totalQty(product);
            const variants = product.variants || [];
            const hasMulti = variants.length > 1;

            // average cost across variants
            const avgCost = variants.length
              ? variants.reduce((s, v) => s + (Number(v.avgCost) || 0), 0) / variants.length
              : 0;

            return (
              <React.Fragment key={product.id}>
                {/* main product row */}
                <div className="stk-row" style={{ gridTemplateColumns: GRID_COLS }}>
                  {/* product cell */}
                  <div className="stk-c-prod">
                    <div className="stk-photo" style={{ background: product.tone || '#e8e8e4' }}>
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                          {name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="stk-name">
                      <b>{name}</b>
                      {hasMulti && <span>{variants.length} variants</span>}
                    </div>
                  </div>

                  {/* qty cell */}
                  <div className="stk-c-qty">
                    <button
                      className={`qty-btn${total === 0 ? ' zero' : ''}`}
                      onClick={() => {
                        if (!hasMulti && variants[0]) {
                          setRestockTarget({ product, variant: variants[0] });
                        }
                      }}
                      title={hasMulti ? '' : t('inv_restock')}
                    >
                      {total}
                    </button>
                  </div>

                  {/* cost cell */}
                  <div className={`stk-c-cost${avgCost === 0 ? ' none' : ''}`}>
                    {avgCost > 0 ? fmtPrice(avgCost) : '---'}
                  </div>

                  {/* status cell */}
                  <div className="stk-c-st">
                    <StatusPill state={state} />
                  </div>

                  {/* actions cell */}
                  <div className="stk-c-more">
                    {!hasMulti && variants[0] && (
                      <button
                        className="icon-btn sm"
                        title={t('inv_restock')}
                        onClick={() => setRestockTarget({ product, variant: variants[0] })}
                      >
                        {I.plus({ width: 15, height: 15 })}
                      </button>
                    )}
                  </div>
                </div>

                {/* variant sub-rows for multi-variant products */}
                {hasMulti && variants.map((v) => {
                  const vState = (v.qty || 0) === 0 ? 'sold' : (v.qty || 0) <= (v.threshold || 5) ? 'low' : 'in';
                  return (
                    <div
                      key={v.id}
                      className="stk-row"
                      style={{
                        gridTemplateColumns: GRID_COLS,
                        background: 'var(--paper)',
                        paddingLeft: 62,
                      }}
                    >
                      {/* variant name */}
                      <div className="stk-c-prod" style={{ paddingLeft: 0 }}>
                        <div className="stk-name">
                          <b style={{ fontSize: 12.5, fontWeight: 600 }}>{parseVariantLabel(v.optionsJson) || '---'}</b>
                          {v.barcode && <span>{v.barcode}</span>}
                        </div>
                      </div>

                      {/* qty */}
                      <div className="stk-c-qty">
                        <button
                          className={`qty-btn${(v.qty || 0) === 0 ? ' zero' : ''}`}
                          onClick={() => setRestockTarget({ product, variant: v })}
                          title={t('inv_restock')}
                        >
                          {v.qty || 0}
                        </button>
                      </div>

                      {/* cost */}
                      <div className={`stk-c-cost${!v.avgCost ? ' none' : ''}`}>
                        {v.avgCost ? fmtPrice(v.avgCost) : '---'}
                      </div>

                      {/* status */}
                      <div className="stk-c-st">
                        <StatusPill state={vState} />
                      </div>

                      {/* action */}
                      <div className="stk-c-more">
                        <button
                          className="icon-btn sm"
                          title={t('inv_restock')}
                          onClick={() => setRestockTarget({ product, variant: v })}
                        >
                          {I.plus({ width: 15, height: 15 })}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* ---- restock modal ---- */}
      {restockTarget && (
        <RestockModal
          product={restockTarget.product}
          variant={restockTarget.variant}
          onClose={() => setRestockTarget(null)}
          onRestock={handleRestock}
        />
      )}
    </div>
  );
}
