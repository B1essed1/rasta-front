import React, { useState, useEffect, useMemo } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore, totalQty, stockState } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';
import { I } from '../../components/ui/Icons';

function getProductName(product) {
  return product.nameEn || product.nameUz || product.nameRu || '';
}

function StockBadge({ state }) {
  const labels = { in: t('inv_in_stock'), low: t('inv_low_stock'), sold: t('inv_sold_out') };
  return <span className={`sf-stock-badge sf-stock-badge--${state}`}>{labels[state]}</span>;
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

  const vLabel = variant.optionsJson || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{t('inv_restock')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>&times;</button>
        </div>
        <p style={{ color: '#666', margin: '0 0 4px', fontSize: 14 }}>
          <b>{getProductName(product)}</b>
          {vLabel && <span style={{ color: '#999' }}> — {vLabel}</span>}
        </p>
        <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
          {t('inv_qty')}: {variant.qty || 0} {t('inv_units')}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t('inv_add_stock')}</label>
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
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{t('inv_note')}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-soft btn-sm" onClick={onClose}>{t('g_cancel')}</button>
            <button type="submit" className="btn btn-accent btn-sm" disabled={!qty || parseInt(qty, 10) <= 0 || saving}>
              {I.plus({ width: 14, height: 14 })} {t('inv_restock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryView() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState('all');
  const [restockTarget, setRestockTarget] = useState(null);
  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const restockVariant = useShopStore((s) => s.restockVariant);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => { if (shop?.id) fetchProducts(); }, [shop?.id, fetchProducts]);

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

  const filtered = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((p) => stockState(p) === filter);
  }, [products, filter]);

  if (!products.length) {
    return <EmptyState icon="&#128230;" title={t('db_inventory')} description={t('pr_empty_t')} />;
  }

  async function handleRestock(variantId, productId, qty, unitCost, note) {
    await restockVariant(variantId, productId, qty, unitCost, note);
  }

  return (
    <div>
      <div className="db-sec-head">
        <div>
          <h2>{t('db_inventory')}</h2>
          <div className="sub">{counts.total} {t('inv_total_items')}</div>
        </div>
      </div>

      <div className="mini-stats four" style={{ marginBottom: 20 }}>
        <div className="mini-stat" onClick={() => setFilter('all')} style={{ cursor: 'pointer', opacity: filter === 'all' ? 1 : 0.6 }}>
          <div className="ms-val">{counts.total}</div>
          <div className="ms-lab">{t('g_all')}</div>
        </div>
        <div className="mini-stat" onClick={() => setFilter('in')} style={{ cursor: 'pointer', opacity: filter === 'in' ? 1 : 0.6 }}>
          <div className="ms-val" style={{ color: '#1a7f37' }}>{counts.inStock}</div>
          <div className="ms-lab">{t('inv_in_stock')}</div>
        </div>
        <div className="mini-stat" onClick={() => setFilter('low')} style={{ cursor: 'pointer', opacity: filter === 'low' ? 1 : 0.6 }}>
          <div className="ms-val" style={{ color: '#b45309' }}>{counts.low}</div>
          <div className="ms-lab">{t('inv_low_stock')}</div>
        </div>
        <div className="mini-stat" onClick={() => setFilter('sold')} style={{ cursor: 'pointer', opacity: filter === 'sold' ? 1 : 0.6 }}>
          <div className="ms-val" style={{ color: '#6b6b6b' }}>{counts.sold}</div>
          <div className="ms-lab">{t('inv_sold_out')}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>{t('inv_no_match')}</div>
      ) : (
        <div className="stock-table">
          {filtered.map((product) => {
            const name = getProductName(product);
            const state = stockState(product);
            const total = totalQty(product);
            const variants = product.variants || [];

            return (
              <div key={product.id} className="stk-row" style={{ background: '#fff', border: '1px solid var(--line, #e7e0d5)', borderRadius: 12, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: variants.length > 1 ? 12 : 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: product.tone || '#e8e8e4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                    <div style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {total} {t('inv_units')} <StockBadge state={state} />
                    </div>
                  </div>
                  {variants.length === 1 && (
                    <button
                      className="btn btn-soft btn-sm"
                      onClick={() => setRestockTarget({ product, variant: variants[0] })}
                    >
                      {I.plus({ width: 14, height: 14 })} {t('inv_restock')}
                    </button>
                  )}
                </div>
                {variants.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 56 }}>
                    {variants.map((v) => (
                      <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 0', borderTop: '1px solid var(--line-2, #efe9df)' }}>
                        <span style={{ flex: 1, color: '#555' }}>{v.optionsJson || '—'}</span>
                        <span style={{ fontWeight: 600, minWidth: 40, textAlign: 'right' }}>{v.qty || 0}</span>
                        <span style={{ color: '#999', fontSize: 12 }}>{t('inv_units')}</span>
                        <button
                          className="btn btn-soft btn-sm"
                          style={{ padding: '3px 8px', fontSize: 12 }}
                          onClick={() => setRestockTarget({ product, variant: v })}
                        >
                          {I.plus({ width: 12, height: 12 })}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
