import React, { useState, useEffect, useCallback } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';
import { I } from '../../components/ui/Icons';

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

  const shop = useShopStore((s) => s.shop);
  const sales = useShopStore((s) => s.sales);
  const fetchSales = useShopStore((s) => s.fetchSales);
  const fetchSalesSummary = useShopStore((s) => s.fetchSalesSummary);
  const returnSaleLine = useShopStore((s) => s.returnSaleLine);

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
      <h1>{t('db_sales')}</h1>

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
            <span>{t('or_date')}</span>
            <span>{t('db_name')}</span>
            <span>{t('or_customer')}</span>
            <span>{t('or_total')}</span>
            <span></span>
          </div>
          {sales.map((sale) => (
            <div key={sale.id} className="sales-table__row">
              <span>{fmtDate(sale.date || sale.createdAt)}</span>
              <span>{sale.productName || '—'}</span>
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
    </div>
  );
}
