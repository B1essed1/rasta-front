import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { useAuthStore } from '../../store/authStore';

export default function HomeView() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const shop = useShopStore((s) => s.shop);
  const stats = useShopStore((s) => s.stats);
  const products = useShopStore((s) => s.products);
  const orders = useShopStore((s) => s.orders);
  const fetchStats = useShopStore((s) => s.fetchStats);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const fetchOrders = useShopStore((s) => s.fetchOrders);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) {
      fetchStats();
      fetchProducts();
      fetchOrders();
    }
  }, [shop?.id, fetchStats, fetchProducts, fetchOrders]);

  const newOrders = orders.filter((o) => o.status === 'NEW');
  const lowStock = products.filter((p) => {
    if (!p.variants?.length) return false;
    const totalQty = p.variants.reduce((sum, v) => sum + (v.qty || 0), 0);
    return totalQty > 0 && totalQty <= 5;
  });

  return (
    <div className="home-view">
      <h1 className="home-view__greeting">
        {t('db_hello')}, {user?.name || shop?.name || ''}! &#128075;
      </h1>

      <h2 className="home-view__section-title">{t('db_overview')}</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">&#128065;</div>
          <div className="stat-card__value">{stats?.visitors ?? 0}</div>
          <div className="stat-card__label">{t('db_visitors')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">&#128230;</div>
          <div className="stat-card__value">{stats?.itemsSold ?? 0}</div>
          <div className="stat-card__label">{t('db_items_sold')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">&#128176;</div>
          <div className="stat-card__value">{fmtPrice(stats?.revenue ?? 0)}</div>
          <div className="stat-card__label">{t('db_revenue')}</div>
        </div>
      </div>

      {(newOrders.length > 0 || lowStock.length > 0) && (
        <>
          <h2 className="home-view__section-title">{t('db_attention')}</h2>
          <div className="attention-list">
            {newOrders.length > 0 && (
              <div
                className="attention-item attention-item--orders"
                onClick={() => navigate('/dashboard/orders')}
              >
                <span className="attention-item__icon">&#128230;</span>
                <span>
                  {newOrders.length} {t('or_new').toLowerCase()} {t('db_orders').toLowerCase()}
                </span>
              </div>
            )}
            {lowStock.map((p) => (
              <div
                key={p.id}
                className="attention-item attention-item--stock"
                onClick={() => navigate('/dashboard/products')}
              >
                <span className="attention-item__icon">&#9888;</span>
                <span>
                  {p.nameEn} — {p.variants?.reduce((sum, v) => sum + (v.qty || 0), 0)} {t('db_stock').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="home-view__section-title">{t('db_quick')}</h2>
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => navigate('/dashboard/products')}
          type="button"
        >
          <span className="quick-action-btn__icon">&#10133;</span>
          {t('db_add')}
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate('/dashboard/orders')}
          type="button"
        >
          <span className="quick-action-btn__icon">&#128230;</span>
          {t('db_orders')}
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate('/dashboard/design')}
          type="button"
        >
          <span className="quick-action-btn__icon">&#127912;</span>
          {t('db_design')}
        </button>
        {shop?.handle && (
          <a
            className="quick-action-btn"
            href={`/${shop.handle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="quick-action-btn__icon">&#128065;</span>
            {t('db_visit')}
          </a>
        )}
      </div>
    </div>
  );
}
