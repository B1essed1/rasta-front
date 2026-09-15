import React, { useState, useEffect } from 'react';
import { t, onLangChange, fmtPrice, getLang } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import EmptyState from '../../components/ui/EmptyState';
import { I } from '../../components/ui/Icons';

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
          <div className="stat-card__icon">{I.wallet({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{fmtPrice(totalRevenue)}</div>
          <div className="stat-card__label">{t('db_revenue')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.bag({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{totalItems}</div>
          <div className="stat-card__label">{t('db_items_sold')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">{I.grid({ width: 20, height: 20 })}</div>
          <div className="stat-card__value">{sales.length}</div>
          <div className="stat-card__label">{t('db_orders')}</div>
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
          </div>
          {sales.map((sale) => (
            <div key={sale.id} className="sales-table__row">
              <span>{sale.date ? new Date(sale.date).toLocaleDateString(getLang() === 'ru' ? 'ru-RU' : getLang() === 'uz' ? 'uz-UZ' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</span>
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
