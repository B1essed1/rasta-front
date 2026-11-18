import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { t, onLangChange, fmtPrice } from '../i18n';
import LangPill from '../components/ui/LangPill';
import Modal from '../components/ui/Modal';
import api from '../api/client';
import '../styles/app.css';

/* ===== helpers ===== */

function fmtNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatUzPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  let d = digits;
  if (d.startsWith('998')) d = d.slice(3);
  else if (d.startsWith('8') && d.length > 9) d = d.slice(1);
  let out = '+998';
  if (d.length > 0) out += ' ' + d.slice(0, 2);
  if (d.length > 2) out += ' ' + d.slice(2, 5);
  if (d.length > 5) out += ' ' + d.slice(5, 7);
  if (d.length > 7) out += ' ' + d.slice(7, 9);
  return out;
}

const STEPS = ['NEW', 'CONFIRMED', 'READY', 'OUT', 'COMPLETED'];
const STEP_KEYS = {
  NEW: 'ot_step_new',
  CONFIRMED: 'ot_step_confirmed',
  READY: 'ot_step_ready',
  OUT: 'ot_step_out',
  COMPLETED: 'ot_step_completed',
};

const DELIVERY_LABELS = { delivery: 'co_delivery_deliver', pickup: 'co_delivery_pickup' };
const PAY_LABELS = { cash: 'co_pay_cash', card: 'co_pay_card' };

/* ===== Progress Bar ===== */

function ProgressBar({ status }) {
  const cancelled = status === 'CANCELLED';
  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="ot-progress">
      {STEPS.map((step, i) => {
        let cls = 'ot-step';
        if (cancelled) {
          cls += ' cancelled';
        } else if (i < currentIdx) {
          cls += ' done';
        } else if (i === currentIdx) {
          cls += ' current';
        }

        return (
          <div key={step} className={cls}>
            <div className="ot-dot">
              {cancelled ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (i < currentIdx || i === currentIdx) ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--line)' }} />
              )}
            </div>
            <span className="ot-step-label">{t(STEP_KEYS[step])}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ===== Main Page ===== */

export default function OrderTrackingPage() {
  const { orderNo } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelPhone, setCancelPhone] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    return onLangChange(() => setTick((v) => v + 1));
  }, []);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/orders/track/${orderNo}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [orderNo]);

  async function handleCancel() {
    setCancelError('');
    const digits = cancelPhone.replace(/\D/g, '');
    if (digits.length < 9) {
      setCancelError(t('co_err_phone'));
      return;
    }
    setCancelling(true);
    try {
      const phone = digits.startsWith('998') ? '+' + digits : '+998' + digits;
      await api.put(`/orders/track/${orderNo}/cancel`, { phone });
      // Reload order to get updated status
      const res = await api.get(`/orders/track/${orderNo}`);
      setOrder(res.data);
      setShowCancel(false);
      setCancelPhone('');
    } catch (err) {
      setCancelError(err.serverMessage || err.response?.data?.message || 'Error');
    }
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="ot-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="ot-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2 style={{ marginBottom: 12 }}>{t('ot_not_found')}</h2>
        <Link to="/explore" className="btn btn-accent" style={{ marginTop: 16 }}>
          {t('sf_bazaar')}
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const canCancel = order.status === 'NEW';
  const items = order.items || [];
  const goodsTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);
  const fee = order.deliveryFee || 0;
  const total = order.total || (goodsTotal + fee);
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="ot-page">
      {/* Top bar with lang */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <LangPill />
      </div>

      {/* Header */}
      <div className="ot-header">
        <h1>{t('ot_title')}</h1>
        <div className="ot-no">
          {t('ot_order')} #{order.orderNo || order.id}
          {dateStr && <> &middot; {dateStr}</>}
        </div>
        {order.shopName && (
          <div className="ot-no">{order.shopName}</div>
        )}
      </div>

      {/* Cancelled badge */}
      {isCancelled && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span className="ot-cancelled-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {t('ot_cancelled')}
          </span>
          {order.cancelReason && (
            <div style={{ fontSize: 13, color: 'var(--soft)', marginTop: 6 }}>
              {t('ot_cancel_reason')}: {order.cancelReason}
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar status={order.status} />

      {/* Items */}
      <div className="ot-section">
        <h3>{t('ot_items')}</h3>
        {items.map((item, i) => (
          <div key={i} className={`ot-item${item.dropped ? ' dropped' : ''}`}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.name || item.productName}</div>
              {item.label && <div style={{ fontSize: 13, color: 'var(--soft)' }}>{item.label}</div>}
              {item.dropped && <div style={{ fontSize: 12, color: '#dc3545' }}>{t('ot_dropped')}</div>}
            </div>
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              {item.qty} x {fmtNum(item.unitPrice || 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery */}
      <div className="ot-section">
        <h3>{t('ot_delivery')}</h3>
        <div className="ot-row">
          <span>{t('co_delivery')}</span>
          <span>{t(DELIVERY_LABELS[order.deliveryMethod] || 'co_delivery_deliver')}</span>
        </div>
        {order.customerAddress && (
          <div className="ot-row">
            <span>{t('co_address')}</span>
            <span>{order.customerAddress}</span>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="ot-section">
        <h3>{t('ot_payment')}</h3>
        <div className="ot-row">
          <span>{t('co_payment')}</span>
          <span>{t(PAY_LABELS[order.payMethod] || 'co_pay_cash')}</span>
        </div>
      </div>

      {/* Total */}
      <div className="ot-section">
        <h3>{t('ot_total')}</h3>
        <div className="ot-row">
          <span>{t('ot_goods')}</span>
          <span>{fmtPrice(goodsTotal)}</span>
        </div>
        <div className="ot-row">
          <span>{t('ot_fee')}</span>
          <span>{fee === 0 ? t('co_free') : fmtPrice(fee)}</span>
        </div>
        <div className="ot-row total">
          <span>{t('ot_total')}</span>
          <span>{fmtPrice(total)}</span>
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && (
        <div className="ot-cancel-section">
          <button
            className="btn btn-ghost"
            style={{ color: '#dc3545', border: '1px solid #dc3545' }}
            onClick={() => setShowCancel(true)}
          >
            {t('ot_cancel')}
          </button>
        </div>
      )}

      {/* Cancel modal */}
      <Modal
        open={showCancel}
        onClose={() => { setShowCancel(false); setCancelError(''); }}
        title={t('ot_cancel')}
      >
        <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--soft)' }}>
          {t('ot_cancel_confirm')}
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            {t('ot_cancel_phone')}
          </label>
          <input
            type="tel"
            value={cancelPhone}
            placeholder="+998 __ ___ __ __"
            onChange={(e) => setCancelPhone(formatUzPhone(e.target.value))}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)', fontSize: 15, fontFamily: 'inherit',
            }}
          />
        </div>
        {cancelError && (
          <p style={{ color: '#dc3545', fontSize: 13, marginBottom: 10 }}>{cancelError}</p>
        )}
        <button
          className="btn btn-accent btn--block"
          style={{ width: '100%', background: '#dc3545' }}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? t('loading') : t('ot_cancel')}
        </button>
      </Modal>
    </div>
  );
}
