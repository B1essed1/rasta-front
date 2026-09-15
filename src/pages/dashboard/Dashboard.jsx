import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import LangPill from '../../components/ui/LangPill';
import { I } from '../../components/ui/Icons';
import { t, onLangChange } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { useShopStore, stockState } from '../../store/shopStore';
import { getPalette } from '../../data/palettes';

const TABS = [
  { id: 'home', path: '/dashboard', labelKey: 'db_home', icon: 'home' },
  { id: 'orders', path: '/dashboard/orders', labelKey: 'db_orders', icon: 'bag' },
  { id: 'chats', path: '/dashboard/chats', labelKey: 'db_chats', icon: 'chat' },
  { id: 'products', path: '/dashboard/products', labelKey: 'db_products', icon: 'grid' },
  { id: 'inventory', path: '/dashboard/inventory', labelKey: 'db_inventory', icon: 'box' },
  { id: 'sales', path: '/dashboard/sales', labelKey: 'db_sales', icon: 'wallet' },
  { id: 'reviews', path: '/dashboard/reviews', labelKey: 'rv_title', icon: 'spark' },
  { id: 'design', path: '/dashboard/design', labelKey: 'db_design', icon: 'palette' },
  { id: 'settings', path: '/dashboard/settings', labelKey: 'db_settings', icon: 'gear' },
];

function initialsOf(name) {
  if (!name) return '??';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}


function tabFromPath(pathname) {
  const match = TABS.filter((x) => x.path).find((x) =>
    x.path === '/dashboard' ? pathname === '/dashboard' || pathname === '/dashboard/' : pathname.startsWith(x.path)
  );
  return match ? match.id : 'home';
}

function ShopSwitcher({ shop, shops, tone, onPick }) {
  const [open, setOpen] = useState(false);
  const initials = shop?.initials || initialsOf(shop?.name);
  return (
    <div
      className="db-shopsel"
      role="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
    >
      <div className="av ph" style={{ '--ph-tone': tone }}>
        <div className="ph-init" style={{ fontSize: 13 }}>
          {initials}
        </div>
      </div>
      <div className="nm">
        <b>{shop?.name || ''}</b>
        <span>rasta.uz/{shop?.handle || ''}</span>
      </div>
      <span className="cv">{I.layers({ width: 16, height: 16 })}</span>
      {open && (
        <div className="db-shop-menu" onClick={(e) => e.stopPropagation()}>
          {(shops.length ? shops : shop ? [shop] : []).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onPick(s.id);
                setOpen(false);
              }}
            >
              <div className="av ph" style={{ '--ph-tone': tone }}>
                <div className="ph-init" style={{ fontSize: 11 }}>
                  {s.initials || initialsOf(s.name)}
                </div>
              </div>
              <b>{s.name}</b>
              {s.id === shop?.id && (
                <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>
                  {I.check({ width: 16, height: 16 })}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [, setTick] = useState(0);
  const [shops, setShops] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const logout = useAuthStore((s) => s.logout);
  const shop = useShopStore((s) => s.shop);
  const config = useShopStore((s) => s.config);
  const products = useShopStore((s) => s.products);
  const orders = useShopStore((s) => s.orders);
  const fetchShop = useShopStore((s) => s.fetchShop);
  const fetchMyShops = useShopStore((s) => s.fetchMyShops);
  const fetchConfig = useShopStore((s) => s.fetchConfig);
  const fetchProducts = useShopStore((s) => s.fetchProducts);
  const fetchOrders = useShopStore((s) => s.fetchOrders);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  useEffect(() => {
    let alive = true;
    async function load() {
      const mine = await fetchMyShops();
      if (!alive) return;
      setShops(mine);
      if (mine.length > 0) {
        await fetchShop(mine[0].id);
        await fetchConfig();
        await fetchProducts(mine[0].id);
        try {
          await fetchOrders();
        } catch (e) {
          /* badge is optional */
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [fetchMyShops, fetchShop, fetchConfig, fetchProducts, fetchOrders, navigate]);

  const tab = tabFromPath(location.pathname);

  const newOrders = useMemo(
    () => (orders || []).filter((o) => (o.status || '').toUpperCase() === 'NEW').length,
    [orders]
  );
  const lowStock = useMemo(
    () => (products || []).filter((p) => stockState(p, config?.threshold) !== 'in').length,
    [products, config]
  );

  // Design tints the avatar tile with the palette's `swatch`; the app's palettes have
  // no swatch field, so fall back to the shop's cover colour, then the accent.
  const palette = getPalette(config?.palette);
  const tone = palette?.swatch || shop?.coverColor || palette?.accent || '#ddd6cb';

  const nav = TABS.map((item) => ({
    ...item,
    label: t(item.labelKey),
    badge: item.id === 'orders' ? newOrders || null : item.id === 'inventory' ? lowStock || null : null,
  }));
  const curNav = nav.find((n) => n.id === tab) || nav[0];

  function go(item) {
    navigate(item.path);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleVisit() {
    if (shop?.handle) window.open(`/${shop.handle}`, '_blank', 'noopener');
  }

  function handleScan() {
    navigate('/dashboard/scan');
  }

  const scanLabel = t('db_scan');

  return (
    <div className="db">
      <aside className="db-side">
        <div className="brand">
          <Logo size={26} />{' '}
          <span className="brand-name">
            rasta<i>shops</i>
          </span>
        </div>

        <ShopSwitcher
          shop={shop}
          shops={shops}
          tone={tone}
          onPick={(id) => {
            if (id && id !== shop?.id) fetchShop(id);
          }}
        />

        <nav className="db-nav" aria-label={t('db_title')}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'on' : ''}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => go(item)}
            >
              {I[item.icon]({ width: 20, height: 20 })}{' '}
              <span className="dn-lab">{item.label}</span>
              {item.badge ? <span className="dn-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="db-side-foot">
          <button
            type="button"
            className="btn btn-soft btn-sm"
            style={{ width: '100%' }}
            onClick={handleScan}
          >
            {I.scan({ width: 17, height: 17 })} {scanLabel}
          </button>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            style={{ width: '100%' }}
            onClick={handleVisit}
          >
            {I.eye({ width: 17, height: 17 })} {t('db_visit')}
          </button>
          <div className="db-side-row">
            <LangPill />
            <button type="button" className="lnk" onClick={handleLogout}>
              {t('au_logout')}
            </button>
          </div>
        </div>
      </aside>

      <div className="db-main">
        <div className="db-top">
          <h1>{curNav.label}</h1>
        </div>

        <div className="db-mobtop">
          <div className="dmt-row">
            <div className="dmt-shop">
              <div className="av ph" style={{ '--ph-tone': tone }}>
                <div className="ph-init" style={{ fontSize: 12 }}>
                  {shop?.initials || initialsOf(shop?.name)}
                </div>
              </div>
              <b>{shop?.name || ''}</b>
            </div>
            <div className="dmt-right">
              <button type="button" className="btn btn-soft btn-xs" aria-label={t('db_scan')} onClick={handleScan}>
                {I.scan({ width: 15, height: 15 })}
              </button>
              <LangPill />
            </div>
          </div>
          <div className="db-tabs scroll-x">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={'db-tab' + (tab === item.id ? ' on' : '')}
                onClick={() => go(item)}
              >
                {I[item.icon]({ width: 17, height: 17 })} {item.label}
                {item.badge ? <span className="db-tab-badge">{item.badge}</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="db-body scroll-y">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
