import React, { useState, useEffect } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/ToastHost';

const statusFilters = ['all', 'new', 'open', 'confirmed', 'delivered', 'cancelled'];

export default function OrdersView() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState('all');
  const [actionModal, setActionModal] = useState(null);

  const shop = useShopStore((s) => s.shop);
  const orders = useShopStore((s) => s.orders);
  const fetchOrders = useShopStore((s) => s.fetchOrders);
  const updateOrderStatus = useShopStore((s) => s.updateOrderStatus);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchOrders();
  }, [shop?.id, fetchOrders]);

  const filtered = orders.filter((o) => filter === 'all' || o.status === filter);

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setActionModal(null);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="orders-view">
      <div className="orders-view__header">
        <h1>{t('db_orders')}</h1>
      </div>

      <div className="orders-view__filters">
        {statusFilters.map((s) => (
          <button
            key={s}
            className={`tab-btn ${filter === s ? 'tab-btn--active' : ''}`}
            onClick={() => setFilter(s)}
            type="button"
          >
            {s === 'all' ? t('or_all') : t(`or_${s}`)}
            {s !== 'all' && (
              <span className="tab-btn__count">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="&#128230;" title={t('sf_empty')} />
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <span className="order-card__id">#{order.id}</span>
                <StatusPill status={order.status} label={t(`or_${order.status}`)} />
              </div>
              <div className="order-card__body">
                <div className="order-card__detail">
                  <span className="order-card__label">{t('or_customer')}</span>
                  <span>{order.customerName || order.customerPhone || '—'}</span>
                </div>
                <div className="order-card__detail">
                  <span className="order-card__label">{t('or_total')}</span>
                  <span>{fmtPrice(order.total)}</span>
                </div>
                <div className="order-card__detail">
                  <span className="order-card__label">{t('or_date')}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                {order.items && (
                  <div className="order-card__detail">
                    <span className="order-card__label">{t('or_items')}</span>
                    <span>{order.items.length} {t('or_items')}</span>
                  </div>
                )}
              </div>
              <div className="order-card__actions">
                {(order.status === 'new' || order.status === 'open') && (
                  <>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => setActionModal({ order, action: 'confirm' })}
                      type="button"
                    >
                      {t('or_confirm')}
                    </button>
                    <button
                      className="btn btn--ghost btn--sm btn--danger"
                      onClick={() => setActionModal({ order, action: 'cancel' })}
                      type="button"
                    >
                      {t('or_cancel')}
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleStatusChange(order.id, 'delivered')}
                    type="button"
                  >
                    {t('or_delivered')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.action === 'confirm' ? t('or_confirm') : t('or_cancel')}
      >
        <p>
          {actionModal?.action === 'confirm'
            ? `${t('or_confirm')} #${actionModal?.order?.id}?`
            : `${t('or_cancel')} #${actionModal?.order?.id}?`}
        </p>
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={() => setActionModal(null)} type="button">
            {t('no')}
          </button>
          <button
            className={`btn ${actionModal?.action === 'confirm' ? 'btn--primary' : 'btn--danger'}`}
            onClick={() =>
              handleStatusChange(
                actionModal.order.id,
                actionModal.action === 'confirm' ? 'confirmed' : 'cancelled'
              )
            }
            type="button"
          >
            {t('yes')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
