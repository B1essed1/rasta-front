import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import LangPill from '../ui/LangPill';
import { t, onLangChange } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { I } from '../ui/Icons';

export default function Navbar() {
  const [, setTick] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  function go(path) {
    setMobileMenu(false);
    navigate(path);
  }

  return (
    <>
      <nav className="pnav">
        <div className="pnav-inner">
          <Link to="/" className="brand">
            <Logo size={28} />
            <span className="brand-name">rastashops</span>
          </Link>

          <div className="pnav-links">
            <a href="/#features">{t('nav_features')}</a>
            <a href="/#themes">{t('nav_themes')}</a>
            <a href="/#pricing">{t('nav_pricing')}</a>
            <a href="/explore" className="nav-explore" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>
              {I.search({ width: 15, height: 15 })} Explore
            </a>
          </div>

          <div className="pnav-right">
            <LangPill />
            {token ? (
              <button className="btn btn-accent btn-sm" onClick={() => navigate('/dashboard')}>
                {t('db_title')}
              </button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
                  {t('nav_login')}
                </button>
                <button className="btn btn-accent btn-sm" onClick={() => navigate('/onboarding')}>
                  {t('cta_start')}
                </button>
              </>
            )}
            <button className="pnav-burger" onClick={() => setMobileMenu(true)} type="button" aria-label="Menu">
              {I.more ? I.more({ width: 20, height: 20 }) : <span style={{ fontSize: 20 }}>&#9776;</span>}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenu && (
        <div className="nm-scrim" onClick={() => setMobileMenu(false)}>
          <div className="nm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="nm-head">
              <Link to="/" className="brand" onClick={() => setMobileMenu(false)}>
                <Logo size={24} />
                <span>rastashops</span>
              </Link>
              <button className="nm-x" onClick={() => setMobileMenu(false)} type="button">
                {I.x({ width: 18, height: 18 })}
              </button>
            </div>
            <div className="nm-links">
              <a href="/#features" onClick={() => setMobileMenu(false)}>
                {t('nav_features')}
                {I.arrow({ width: 16, height: 16 })}
              </a>
              <a href="/#themes" onClick={() => setMobileMenu(false)}>
                {t('nav_themes')}
                {I.arrow({ width: 16, height: 16 })}
              </a>
              <a href="/#pricing" onClick={() => setMobileMenu(false)}>
                {t('nav_pricing')}
                {I.arrow({ width: 16, height: 16 })}
              </a>
              <a href="/explore" onClick={(e) => { e.preventDefault(); go('/explore'); }}>
                Explore
                {I.arrow({ width: 16, height: 16 })}
              </a>
            </div>
            <div className="nm-lang">
              <LangPill />
            </div>
            <div className="nm-acts">
              {token ? (
                <button className="btn btn-accent" onClick={() => go('/dashboard')}>
                  {t('db_title')}
                </button>
              ) : (
                <>
                  <button className="btn btn-accent" onClick={() => go('/onboarding')}>
                    {t('cta_start')}
                  </button>
                  <button className="btn btn-ghost" onClick={() => go('/login')}>
                    {t('nav_login')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
