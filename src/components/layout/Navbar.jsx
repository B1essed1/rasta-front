import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import LangPill from '../ui/LangPill';
import { t, onLangChange } from '../../i18n';
import { useAuthStore } from '../../store/authStore';

export default function Navbar({ transparent = false }) {
  const [, setTick] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="pnav">
      <div className="pnav-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <Logo size={30} />
          <span>rasta</span>
        </Link>

        <div className={`pnav-links ${menuOpen ? 'pnav-links--open' : ''}`}>
          <a href="/#features" onClick={() => setMenuOpen(false)}>
            {t('nav_features')}
          </a>
          <a href="/#themes" onClick={() => setMenuOpen(false)}>
            {t('nav_themes')}
          </a>
          <a href="/#pricing" onClick={() => setMenuOpen(false)}>
            {t('nav_pricing')}
          </a>
          <a
            href="/explore"
            className="explore-link"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              navigate('/explore');
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Explore
          </a>
        </div>

        <div className="pnav-right">
          <LangPill />
          {token ? (
            <button
              className="btn btn-accent btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              {t('db_title')}
            </button>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/login')}
              >
                {t('nav_login')}
              </button>
              <button
                className="btn btn-accent btn-sm"
                onClick={() => navigate('/onboarding')}
              >
                {t('cta_start')}
              </button>
            </>
          )}
        </div>

        <button
          className="navbar__burger"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
