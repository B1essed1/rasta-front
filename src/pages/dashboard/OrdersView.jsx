import React, { useState, useEffect } from 'react';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import StatusPill from '../../components/ui/StatusPill';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/ToastHost';

const statusFilters = ['all', 'NEW', 'CONFIRMED', 'READY', 'OUT', 'COMPLETED', 'CANCELLED'];

function OrderCard({ order, onConfirm, onCancel, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || [];
  const itemCount = items.reduce((s, l) => s + l.qty, 0);

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  return (
    <div className={`order-card ${expanded ? 'order-card--open' : ''}`}>
      <button className="order-card__summary" onClick={() => setExpanded(!expanded)} type="button">
        <span className="order-card__no">#{order.orderNo}</span>
        <span className="order-card__customer">{order.customerName}</span>
        <span className="order-card__count">{itemCount} {t('or_items')}</span>
        <span className="order-card__delivery">{order.deliveryMethod}</span>
        <StatusPill status={order.status.toLowerCase()} label={t(`or_${order.status.toLowerCase()}`)} />
        <span className="order-card__total">{fmtPrice(order.total)}</span>
        <span className="order-card__date">{formatDate(order.createdAt)}</span>
        <span className="order-card__expand">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="order-card__detail">
          <div className="order-card__grid">
            <div className="order-card__lines">
              <h4>{t('or_items')}</h4>
              {items.map((line, i) => (
                <div key={i} className="order-line">
                  <span className="order-line__name">
                    {line.name}{line.label && line.label !== 'default' ? ` · ${line.label}` : ''}
                  </span>
                  <span className="order-line__qty">{line.qty} × {fmtPrice(line.unitPrice)}</span>
                  <span className="order-line__total">{fmtPrice(line.qty * line.unitPrice)}</span>
                </div>
              ))}
              <div className="order-totals">
                <div><span>{t('or_goods')}</span><b>{fmtPrice(order.goodsTotal)}</b></div>
                <div><span>{t('or_fee')}</span><b>{order.deliveryFee ? fmtPrice(order.deliveryFee) : '—'}</b></div>
                <div className="order-totals__final"><span>{t('or_total')}</span><b>{fmtPrice(order.total)}</b></div>
              </div>
            </div>
            <div className="order-card__customer-info">
              <h4>{t('or_customer')}</h4>
              <div><span>{t('or_name')}</span><b>{order.customerName}</b></div>
              <div><span>{t('or_phone')}</span><b>{order.customerPhone}</b></div>
              {order.customerAddress && <div><span>{t('or_address')}</span><b>{order.customerAddress}</b></div>}
              <div><span>{t('or_delivery')}</span><b>{order.deliveryMethod}</b></div>
              <div><span>{t('or_payment')}</span><b>{order.payMethod}</b></div>
              {order.note && <div className="order-note">{order.note}</div>}
            </div>
          </div>
          <div className="order-card__actions">
            {order.status === 'NEW' && (
              <>
                <button className="btn btn--primary btn--sm" onClick={() => onConfirm(order)} type="button">
                  {t('or_confirm')}
                </button>
                <button className="btn btn--ghost btn--sm btn--danger" onClick={() => onCancel(order)} type="button">
                  {t('or_cancel')}
                </button>
              </>
            )}
            {order.status === 'CONFIRMED' && (
              <button
                className="btn btn--primary btn--sm"
                onClick={() => onStatusChange(order.id, order.deliveryMethod === 'pickup' ? 'READY' : 'OUT')}
                type="button"
              >
                {order.deliveryMethod === 'pickup' ? t('or_mark_ready') : t('or_mark_out')}
              </button>
            )}
            {(order.status === 'READY' || order.status === 'OUT') && (
              <button className="btn btn--primary btn--sm" onClick={() => onStatusChange(order.id, 'COMPLETED')} type="button">
                {t('or_mark_done')}
              </button>
            )}
            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && order.status !== 'NEW' && (
              <button className="btn btn--ghost btn--sm btn--danger" onClick={() => onCancel(order)} type="button">
                {t('or_cancel')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersView() {
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState('all');
  const [actionModal, setActionModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

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

  async function handleStatusChange(orderId, status, reason) {
    try {
      await updateOrderStatus(orderId, status, reason);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setActionModal(null);
    setCancelReason('');
  }

  function openConfirmModal(order) {
    setActionModal({ order, action: 'confirm' });
  }

  function openCancelModal(order) {
    setCancelReason('');
    setActionModal({ order, action: 'cancel' });
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
            {s === 'all' ? t('or_all') : t(`or_${s.toLowerCase()}`)}
            {s !== 'all' && (
              <span className="tab-btn__count">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="&#128230;" title={t('or_empty_t')} description={t('or_empty_d')} />
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onConfirm={openConfirmModal}
              onCancel={openCancelModal}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setCancelReason(''); }}
        title={actionModal?.action === 'confirm' ? t('or_confirm') : t('or_cancel')}
      >
        <p>
          {actionModal?.action === 'confirm'
            ? `${t('or_confirm')} #${actionModal?.order?.orderNo}?`
            : `${t('or_cancel')} #${actionModal?.order?.orderNo}?`}
        </p>
        {actionModal?.action === 'cancel' && (
          <div className="form-group">
            <label className="form-label">{t('or_cancel_reason')}</label>
            <input type="text" className="form-input" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          </div>
        )}
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={() => { setActionModal(null); setCancelReason(''); }} type="button">
            {t('no')}
          </button>
          <button
            className={`btn ${actionModal?.action === 'confirm' ? 'btn--primary' : 'btn--danger'}`}
            onClick={() =>
              handleStatusChange(
                actionModal.order.id,
                actionModal.action === 'confirm' ? 'CONFIRMED' : 'CANCELLED',
                actionModal.action === 'cancel' ? cancelReason : undefined
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
