import React, { useState, useEffect } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';

export default function SalesView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const sales = useShopStore((s) => s.sales);
  const fetchSales = useShopStore((s) => s.fetchSales);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchSales();
  }, [shop?.id, fetchSales]);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.quantity || 1), 0);

  return (
    <div className="sales-view">
      <h1>{t('db_sales')}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">&#128176;</div>
          <div className="stat-card__value">{fmtPrice(totalRevenue)}</div>
          <div className="stat-card__label">{t('db_revenue')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">&#128230;</div>
          <div className="stat-card__value">{totalItems}</div>
          <div className="stat-card__label">{t('db_items_sold')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">&#128203;</div>
          <div className="stat-card__value">{sales.length}</div>
          <div className="stat-card__label">{t('db_orders')}</div>
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState icon="&#128200;" title={t('sf_empty')} />
      ) : (
        <div className="sales-table">
          <div className="sales-table__header">
            <span>{t('or_date')}</span>
            <span>{t('db_name')}</span>
            <span>{t('or_customer')}</span>
            <span>{t('or_total')}</span>
          </div>
          {sales.map((sale) => (
            <div key={sale.id} className="sales-table__row">
              <span>{sale.date ? new Date(sale.date).toLocaleDateString() : '—'}</span>
              <span>{sale.productName || '—'}</span>
              <span>{sale.customerName || '—'}</span>
              <span>{fmtPrice(sale.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
