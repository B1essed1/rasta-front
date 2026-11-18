import React, { useState, useEffect, useCallback } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { I } from '../../components/ui/Icons';
import { toast } from '../../components/ui/ToastHost';

function fmtDate(iso) {
  if (!iso) return '';
  const lang = getLang();
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-GB';
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function dateRange(period) {
  const now = new Date();
  const today = startOfDay(now);
  if (period === 'today') {
    return { from: today.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  if (period === 'week') {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); // Monday
    return { from: d.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  if (period === 'month') {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: d.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
  }
  return { from: '', to: '' };
}

export default function SalesView() {
  const [, setTick] = useState(0);
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnAction, setReturnAction] = useState('RETURN_TO_STOCK');
  const [returning, setReturning] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualItems, setManualItems] = useState([]);
  const [manualPay, setManualPay] = useState('cash');
  const [manualSearch, setManualSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shop = useShopStore((s) => s.shop);
  const sales = useShopStore((s) => s.sales);
  const products = useShopStore((s) => s.products);
  const fetchSales = useShopStore((s) => s.fetchSales);
  const fetchSalesSummary = useShopStore((s) => s.fetchSalesSummary);
  const returnSaleLine = useShopStore((s) => s.returnSaleLine);
  const createPosSale = useShopStore((s) => s.createPosSale);

  useEffect(() => {
    return onLangChange(() => setTick((x) => x + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchSales();
  }, [shop?.id, fetchSales]);

  const loadSummary = useCallback(async () => {
    if (!shop?.id) return;
    let from, to;
    if (period === 'custom') {
      from = customFrom;
      to = customTo;
    } else {
      const r = dateRange(period);
      from = r.from;
      to = r.to;
    }
    if (!from || !to) return;
    const res = await fetchSalesSummary(from, to);
    if (res) setSummary(res);
  }, [shop?.id, period, customFrom, customTo, fetchSalesSummary]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);

  const revenue = summary?.revenue ?? totalRevenue;
  const cost = summary?.cost ?? 0;
  const grossProfit = summary?.grossProfit ?? (revenue - cost);
  const margin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;

  const periods = [
    { key: 'today', label: t('sa_today') },
    { key: 'week', label: t('sa_this_week') },
    { key: 'month', label: t('sa_this_month') },
    { key: 'custom', label: t('sa_custom') },
  ];

  function localizePayment(method) {
    if (method === 'cash') return t('co_pay_cash');
    if (method === 'card') return t('co_pay_card');
    if (method === 'transfer') return t('sa_pay_transfer');
    return method || '—';
  }

  function openManualSale() {
    setManualItems([]);
    setManualPay('cash');
    setManualSearch('');
    setManualOpen(true);
  }

  function addManualItem(product, variant) {
    const existing = manualItems.find(
      (i) => i.productId === product.id && i.variantId === (variant?.id || null)
    );
    if (existing) {
      setManualItems(
        manualItems.map((i) =>
          i === existing ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setManualItems([
        ...manualItems,
        {
          productId: product.id,
          variantId: variant?.id || null,
          name: product.nameEn || product.nameUz || product.nameRu || '',
          label: variant?.optionsJson || '',
          price: product.price,
          qty: 1,
        },
      ]);
    }
    setManualSearch('');
  }

  function updateManualQty(idx, qty) {
    if (qty < 1) {
      setManualItems(manualItems.filter((_, i) => i !== idx));
    } else {
      setManualItems(manualItems.map((item, i) => (i === idx ? { ...item, qty } : item)));
    }
  }

  const manualTotal = manualItems.reduce((s, i) => s + i.price * i.qty, 0);

  async function handleManualSubmit() {
    if (manualItems.length === 0) return;
    setSubmitting(true);
    try {
      const items = manualItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        qty: i.qty,
      }));
      await createPosSale(items, manualPay);
      toast(t('db_saved'), 'success');
      setManualOpen(false);
    } catch {
      toast('Error', 'error');
    }
    setSubmitting(false);
  }

  const filteredProducts = products.filter((p) => {
    if (!manualSearch) return false;
    const name = (p.nameEn || p.nameUz || p.nameRu || '').toLowerCase();
    return name.includes(manualSearch.toLowerCase());
  });

  async function handleReturn() {
    if (!returnModal) return;
    setReturning(true);
    try {
      await returnSaleLine(returnModal.saleId, returnModal.lineId, returnQty, returnAction);
      setReturnModal(null);
    } catch {
      /* error logged in store */
    }
    setReturning(false);
  }

  return (
    <div className="sales-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('db_sales')}</h1>
        <button className="btn btn--primary" onClick={openManualSale} type="button">
          + {t('sa_manual')}
        </button>
      </div>

      <div className="sales-periods">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            className={'type-pill' + (period === p.key ? ' type-pill--active' : '')}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="sales-custom-range" style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
          <input type="date" className="form-input" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <input type="date" className="form-input" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </div>
      )}

      <div className="stats-grid" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-card__icon">{I.wallet({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{fmtPrice(revenue)}</div>
          <div className="stat-card__label">{t('db_revenue')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.bag({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{fmtPrice(cost)}</div>
          <div className="stat-card__label">{t('sa_cost')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.grid({ width: 20, height: 20 })}</div>
          <div className="stat-card__value" style={{ color: grossProfit >= 0 ? 'var(--green, #22863a)' : 'var(--red, #d73a49)' }}>
            {fmtPrice(grossProfit)}
          </div>
          <div className="stat-card__label">{t('sa_gross_profit')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.eye({ width: 20, height: 20 })}</div>
          <div className="stat-card__value" style={{ color: grossProfit >= 0 ? 'var(--green, #22863a)' : 'var(--red, #d73a49)' }}>
            {margin}%
          </div>
          <div className="stat-card__label">{t('sa_margin')}</div>
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState icon="&#128200;" title={t('sa_empty_t')} description={t('sa_empty_d')} />
      ) : (
        <div className="sales-table">
          <div className="sales-table__header">
            <span>{t('sa_sale_no')}</span>
            <span>{t('or_date')}</span>
            <span>{t('db_name')}</span>
            <span>{t('or_payment')}</span>
            <span>{t('or_customer')}</span>
            <span>{t('or_total')}</span>
            <span></span>
          </div>
          {sales.map((sale) => (
            <div key={sale.id} className="sales-table__row">
              <span style={{ fontWeight: 600 }}>#{sale.saleNo || sale.id}</span>
              <span>{fmtDate(sale.date || sale.createdAt)}</span>
              <span>{sale.productName || '—'}</span>
              <span>{localizePayment(sale.payMethod)}</span>
              <span>{sale.customerName || '—'}</span>
              <span>{fmtPrice(sale.total)}</span>
              <span>
                {(sale.lines || sale.items || []).map((line) => (
                  <button
                    key={line.id || line.variantId}
                    type="button"
                    className="btn btn-soft btn-sm"
                    style={{ marginLeft: 4 }}
                    onClick={() => {
                      setReturnModal({ saleId: sale.id, lineId: line.id || line.variantId, maxQty: line.qty || 1 });
                      setReturnQty(1);
                      setReturnAction('RETURN_TO_STOCK');
                    }}
                  >
                    {t('sa_return')}
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {returnModal && (
        <div className="modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <h3 style={{ marginBottom: 16 }}>{t('sa_return_title')}</h3>

            <label className="form-label">{t('sa_return_qty')}</label>
            <input
              type="number"
              className="form-input"
              min={1}
              max={returnModal.maxQty}
              value={returnQty}
              onChange={(e) => setReturnQty(Math.max(1, Math.min(returnModal.maxQty, Number(e.target.value) || 1)))}
              style={{ marginBottom: 12 }}
            />

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={'type-pill' + (returnAction === 'RETURN_TO_STOCK' ? ' type-pill--active' : '')}
                onClick={() => setReturnAction('RETURN_TO_STOCK')}
              >
                {t('sa_return_stock')}
              </button>
              <button
                type="button"
                className={'type-pill' + (returnAction === 'WRITE_OFF' ? ' type-pill--active' : '')}
                onClick={() => setReturnAction('WRITE_OFF')}
              >
                {t('sa_return_writeoff')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-soft" onClick={() => setReturnModal(null)}>
                {t('cancel')}
              </button>
              <button type="button" className="btn btn-accent" disabled={returning} onClick={handleReturn}>
                {t('sa_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title={t('sa_manual_t')}
        wide
      >
        <div className="form-group">
          <label className="form-label">{t('sa_add_item')}</label>
          <input
            type="text"
            className="form-input"
            placeholder={t('sf_search')}
            value={manualSearch}
            onChange={(e) => setManualSearch(e.target.value)}
          />
          {filteredProducts.length > 0 && (
            <div style={{ border: '1px solid var(--border, #e0e0e0)', borderRadius: 8, maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
              {filteredProducts.map((p) => {
                const variants = p.variants || [];
                if (variants.length <= 1) {
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="btn btn--ghost"
                      style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between', display: 'flex', padding: '8px 12px' }}
                      onClick={() => addManualItem(p, variants[0] || null)}
                    >
                      <span>{p.nameEn || p.nameUz || p.nameRu || ''}</span>
                      <span style={{ color: 'var(--muted, #666)' }}>{fmtPrice(p.price)}</span>
                    </button>
                  );
                }
                return variants.map((v) => (
                  <button
                    key={`${p.id}-${v.id}`}
                    type="button"
                    className="btn btn--ghost"
                    style={{ width: '100%', textAlign: 'left', justifyContent: 'space-between', display: 'flex', padding: '8px 12px' }}
                    onClick={() => addManualItem(p, v)}
                  >
                    <span>{p.nameEn || p.nameUz || p.nameRu || ''} · {v.optionsJson || 'default'}</span>
                    <span style={{ color: 'var(--muted, #666)' }}>{fmtPrice(p.price)}</span>
                  </button>
                ));
              })}
            </div>
          )}
        </div>

        {manualItems.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {manualItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1 }}>
                  {item.name}{item.label ? ` · ${item.label}` : ''}
                </span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => updateManualQty(idx, item.qty - 1)}>
                  {I.minus({ width: 14, height: 14 })}
                </button>
                <span style={{ minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => updateManualQty(idx, item.qty + 1)}>
                  {I.plus({ width: 14, height: 14 })}
                </button>
                <span style={{ minWidth: 80, textAlign: 'right' }}>{fmtPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">{t('or_payment')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['cash', 'card', 'transfer'].map((m) => (
              <button
                key={m}
                type="button"
                className={'type-pill' + (manualPay === m ? ' type-pill--active' : '')}
                onClick={() => setManualPay(m)}
              >
                {m === 'cash' ? t('co_pay_cash') : m === 'card' ? t('co_pay_card') : t('sa_pay_transfer')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border, #e0e0e0)' }}>
          <b style={{ fontSize: 18 }}>{t('or_total')}: {fmtPrice(manualTotal)}</b>
          <button
            type="button"
            className="btn btn--primary"
            disabled={manualItems.length === 0 || submitting}
            onClick={handleManualSubmit}
          >
            {t('sa_confirm')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
