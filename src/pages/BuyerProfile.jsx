import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange, fmtPrice } from '../i18n';
import useBuyerStore from '../store/buyerStore';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/ToastHost';
import Modal from '../components/ui/Modal';
import { I } from '../components/ui/Icons';

/* ------------------------------------------------------------------ */
/*  Status badge colours                                               */
/* ------------------------------------------------------------------ */
const STATUS_COLORS = {
  NEW:       { bg: '#fef3cd', color: '#856404' },
  CONFIRMED: { bg: '#cce5ff', color: '#004085' },
  READY:     { bg: '#d4edda', color: '#155724' },
  OUT:       { bg: '#d1ecf1', color: '#0c5460' },
  COMPLETED: { bg: '#eeeae4', color: '#6b6258' },
  CANCELLED: { bg: '#f8d7da', color: '#721c24' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.NEW;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
        background: s.bg, color: s.color, whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab buttons                                                        */
/* ------------------------------------------------------------------ */
function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`db-tab${active === tab.key ? ' on' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders tab                                                         */
/* ------------------------------------------------------------------ */
const ACTIVE_STATUSES = ['NEW', 'CONFIRMED', 'READY', 'OUT'];

function OrdersTab({ orders }) {
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const past = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="es-ic">{I.bag({ width: 28, height: 28 })}</div>
        <h3>{t('bp_no_orders')}</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {active.length > 0 && (
        <div>
          <div className="home-sec-t">{t('bp_active')}</div>
          <div className="ord-list">
            {active.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <div className="home-sec-t">{t('bp_past')}</div>
          <div className="ord-list">
            {past.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString()
    : '';
  const itemCount = (order.items || []).reduce(
    (n, it) => n + (it.qty || 1),
    0
  );

  return (
    <div className="ord-card" style={{ cursor: 'default' }}>
      <div className="ord-main">
        <div className="ord-top">
          <b>#{order.id}</b>
          <StatusBadge status={order.status} />
        </div>
        <div className="ord-prod">
          {order.shopName || order.shop?.name || ''} &middot; {date}
        </div>
      </div>
      <div className="ord-right">
        <span className="ord-price">{fmtPrice(order.total)}</span>
        <span className="ord-time">
          {itemCount} {t('or_items')}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Addresses tab                                                      */
/* ------------------------------------------------------------------ */
function AddressesTab({ addresses }) {
  const [editing, setEditing] = useState(null); // null | 'new' | address object
  const addAddress = useBuyerStore((s) => s.addAddress);
  const updateAddress = useBuyerStore((s) => s.updateAddress);
  const deleteAddress = useBuyerStore((s) => s.deleteAddress);
  const setDefaultAddress = useBuyerStore((s) => s.setDefaultAddress);

  async function handleSave(data) {
    try {
      if (editing && editing.id) {
        await updateAddress(editing.id, data);
      } else {
        await addAddress(data);
      }
      toast(t('db_saved'), 'success');
      setEditing(null);
    } catch {
      toast('Error', 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAddress(id);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
  }

  async function handleSetDefault(id) {
    try {
      await setDefaultAddress(id);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <button
          className="btn btn-accent btn-sm"
          onClick={() => setEditing('new')}
        >
          {I.plus({ width: 16, height: 16 })} {t('bp_add_addr')}
        </button>
      </div>

      {addresses.length === 0 && !editing && (
        <div className="empty-state">
          <div className="es-ic">{I.home({ width: 28, height: 28 })}</div>
          <h3>{t('bp_no_addr')}</h3>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="set-card"
            style={{ padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <b style={{ fontSize: 15 }}>{addr.label || 'Address'}</b>
                  {addr.isDefault && (
                    <span
                      className="st-pill ok"
                      style={{ fontSize: 11 }}
                    >
                      {t('bp_default')}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: 'var(--soft)' }}>{addr.text || addr.address || ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!addr.isDefault && (
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    {t('bp_set_default')}
                  </button>
                )}
                <button
                  className="icon-btn"
                  onClick={() => setEditing(addr)}
                  title={t('db_edit')}
                >
                  {I.edit({ width: 16, height: 16 })}
                </button>
                <button
                  className="icon-btn"
                  onClick={() => handleDelete(addr.id)}
                  title={t('db_delete')}
                  style={{ color: 'var(--danger)' }}
                >
                  {I.trash({ width: 16, height: 16 })}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? t('bp_add_addr') : t('db_edit')}
      >
        <AddressForm
          initial={editing !== 'new' ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const [label, setLabel] = useState(initial?.label || '');
  const [text, setText] = useState(initial?.text || initial?.address || '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ label, text, isDefault });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Home, Office, ..."
        />
      </div>
      <div className="field">
        <label>{t('or_address')}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Full address..."
          rows={3}
        />
      </div>
      <label className="switch-row" style={{ marginBottom: 18 }}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        <span className="switch"><i /></span>
        {t('bp_set_default')}
      </label>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          {t('cancel')}
        </button>
        <button type="submit" className="btn btn-accent btn-sm" disabled={saving}>
          {saving ? t('loading') : t('db_save')}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Favourites tab                                                     */
/* ------------------------------------------------------------------ */
function FavouritesTab({ favourites }) {
  const navigate = useNavigate();
  const removeFavourite = useBuyerStore((s) => s.removeFavourite);

  async function handleRemove(shopId) {
    try {
      await removeFavourite(shopId);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
  }

  if (favourites.length === 0) {
    return (
      <div className="empty-state">
        <div className="es-ic">{I.store({ width: 28, height: 28 })}</div>
        <h3>{t('bp_no_fav')}</h3>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}
    >
      {favourites.map((shop) => (
        <div
          key={shop.id || shop.shopId}
          className="set-card"
          style={{ padding: '18px 20px', cursor: 'pointer', transition: '.14s' }}
          onClick={() => navigate(`/${shop.handle}`)}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  marginBottom: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {shop.name}
              </div>
              {shop.handle && (
                <div style={{ fontSize: 13, color: 'var(--soft)' }}>@{shop.handle}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {shop.type && (
                  <span
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 9px',
                      borderRadius: 999, background: 'var(--paper)', color: 'var(--soft)',
                    }}
                  >
                    {shop.type}
                  </span>
                )}
                {shop.location && (
                  <span style={{ fontSize: 12, color: 'var(--faint)' }}>
                    {shop.location}
                  </span>
                )}
                {shop.rating != null && (
                  <span style={{ fontSize: 12, color: 'var(--saffron)', fontWeight: 700 }}>
                    ★ {shop.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="btn btn-sm btn-ghost"
              style={{ fontSize: 12, flex: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${shop.handle}`);
              }}
            >
              {t('bp_visit')}
            </button>
            <button
              className="btn btn-sm"
              style={{ fontSize: 12, color: 'var(--danger)', flex: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(shop.id || shop.shopId);
              }}
            >
              {t('bp_remove_fav')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function BuyerProfile() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState('orders');
  const navigate = useNavigate();

  const profile = useBuyerStore((s) => s.profile);
  const addresses = useBuyerStore((s) => s.addresses);
  const favourites = useBuyerStore((s) => s.favourites);
  const orders = useBuyerStore((s) => s.orders);
  const fetchProfile = useBuyerStore((s) => s.fetchProfile);
  const fetchAddresses = useBuyerStore((s) => s.fetchAddresses);
  const fetchFavourites = useBuyerStore((s) => s.fetchFavourites);
  const fetchOrders = useBuyerStore((s) => s.fetchOrders);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchFavourites();
    fetchOrders();
  }, []);

  // Stats
  const orderCount = orders.length;
  const uniqueShops = new Set(
    orders.map((o) => o.shopId || o.shop?.id).filter(Boolean)
  ).size;
  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((n, o) => n + (o.total || 0), 0);

  const tabs = [
    { key: 'orders', label: t('bp_orders'), icon: I.bag({ width: 16, height: 16 }) },
    { key: 'addresses', label: t('bp_addresses'), icon: I.home({ width: 16, height: 16 }) },
    { key: 'favourites', label: t('bp_favourites'), icon: I.store({ width: 16, height: 16 }) },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ---- top nav ---- */}
      <div className="pnav">
        <div className="pnav-inner">
          <a href="/" className="brand">
            <span className="brand-name">rast<i>a</i></span>
          </a>
          <div className="pnav-right">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/explore')}>
              {I.search({ width: 16, height: 16 })} {t('mp_title')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              {t('au_logout')}
            </button>
          </div>
        </div>
      </div>

      {/* ---- content ---- */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 26px 100px' }}>
        {/* ---- header ---- */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {profile?.name || t('bp_profile')}
            </h2>
            {profile?.verifiedAt && (
              <span className="st-pill ok" style={{ fontSize: 12 }}>
                {I.check({ width: 13, height: 13 })} {t('bp_verified')}
              </span>
            )}
          </div>
          {profile?.phone && (
            <div style={{ color: 'var(--soft)', fontSize: 15, marginTop: 4 }}>
              {profile.phone}
            </div>
          )}
        </div>

        {/* ---- stats ---- */}
        <div className="mini-stats" style={{ marginBottom: 22 }}>
          <div className="mini-stat">
            <div className="ms-ic">{I.bag({ width: 18, height: 18 })}</div>
            <div className="ms-val">{orderCount}</div>
            <div className="ms-lab">{t('bp_orders')}</div>
          </div>
          <div className="mini-stat">
            <div className="ms-ic">{I.store({ width: 18, height: 18 })}</div>
            <div className="ms-val">{uniqueShops}</div>
            <div className="ms-lab">{t('bp_shops')}</div>
          </div>
          <div className="mini-stat">
            <div className="ms-ic">{I.wallet({ width: 18, height: 18 })}</div>
            <div className="ms-val">{fmtPrice(totalSpent)}</div>
            <div className="ms-lab">{t('bp_spent')}</div>
          </div>
        </div>

        {/* ---- tabs ---- */}
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {/* ---- tab content ---- */}
        {tab === 'orders' && <OrdersTab orders={orders} />}
        {tab === 'addresses' && <AddressesTab addresses={addresses} />}
        {tab === 'favourites' && <FavouritesTab favourites={favourites} />}
      </div>
    </div>
  );
}
