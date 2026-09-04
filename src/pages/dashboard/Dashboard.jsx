import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import LangPill from '../../components/ui/LangPill';
import { t, onLangChange } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import '../../styles/dashboard.css';

const navItems = [
  { to: '/dashboard', icon: '&#9750;', labelKey: 'db_home', end: true },
  { to: '/dashboard/orders', icon: '&#128230;', labelKey: 'db_orders' },
  { to: '/dashboard/products', icon: '&#128722;', labelKey: 'db_products' },
  { to: '/dashboard/sales', icon: '&#128200;', labelKey: 'db_sales' },
  { to: '/dashboard/reviews', icon: '&#11088;', labelKey: 'db_reviews' },
  { to: '/dashboard/design', icon: '&#127912;', labelKey: 'db_design' },
  { to: '/dashboard/settings', icon: '&#9881;', labelKey: 'db_settings' },
];

export default function Dashboard() {
  const [, setTick] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const shop = useShopStore((s) => s.shop);
  const fetchShop = useShopStore((s) => s.fetchShop);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`dashboard__sidebar ${sidebarOpen ? 'dashboard__sidebar--open' : ''}`}>
        <div className="dashboard__sidebar-header">
          <Logo size={28} />
          <span className="dashboard__brand">rasta</span>
        </div>

        {shop && (
          <div className="dashboard__shop-info">
            <strong>{shop.name}</strong>
            <span className="dashboard__handle">rasta.uz/{shop.handle}</span>
          </div>
        )}

        <nav className="dashboard__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `dashboard__nav-item ${isActive ? 'dashboard__nav-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span
                className="dashboard__nav-icon"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard__sidebar-footer">
          {shop?.handle && (
            <a
              href={`/${shop.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard__visit-btn"
            >
              {t('db_visit')}
            </a>
          )}
          <button className="btn btn--ghost btn--sm" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="dashboard__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="dashboard__main">
        <header className="dashboard__topbar">
          <button
            className="dashboard__burger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dashboard__topbar-right">
            <LangPill />
            <span className="dashboard__user">
              {user?.name || user?.phone || ''}
            </span>
          </div>
        </header>
        <main className="dashboard__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
