import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import LangPill from '../ui/LangPill';
import { t, onLangChange } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { I } from '../ui/Icons';

function BrandName() {
  return <span className="brand-name">rasta<i>shops</i></span>;
}

// Mobile sheet: links are [label, "#anchor" | fn], actions are [label, fn, accent?].
function NavMenu({ links, actions }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <>
      <button className="pnav-burger" aria-label="Menu" onClick={() => setOpen(true)} type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
      </button>
      {open && createPortal(
        <div className="nm-scrim" onClick={() => setOpen(false)}>
          <div className="nm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="nm-head">
              <div className="brand"><Logo /> <BrandName /></div>
              <button className="nm-x" aria-label="Close" onClick={() => setOpen(false)} type="button">{I.x({ width: 18, height: 18 })}</button>
            </div>
            <nav className="nm-links">
              {links.map(([lab, go], i) => (
                <a key={i} href={typeof go === 'string' ? go : undefined} onClick={() => { setOpen(false); if (typeof go === 'function') go(); }}>
                  {lab}{I.arrow({ width: 16, height: 16 })}
                </a>
              ))}
            </nav>
            <div className="nm-lang"><LangPill /></div>
            <div className="nm-acts">
              {actions.map(([lab, go, accent], i) => (
                <button key={i} className={'btn ' + (accent ? 'btn-accent' : 'btn-ghost')} onClick={() => { setOpen(false); go(); }} type="button">{lab}</button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function Navbar() {
  const [, setTick] = useState(0);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  const onExplore = () => navigate('/explore');
  const onLogin = () => navigate('/login');
  const onStart = () => navigate('/onboarding');
  const onDash = () => navigate('/dashboard');

  return (
    <div className="pnav">
      <div className="pnav-inner">
        <Link to="/" className="brand"><Logo /> <BrandName /></Link>
        <nav className="pnav-links">
          <a onClick={onExplore} className="nav-explore" style={{ cursor: 'pointer' }}>{I.search({ width: 14, height: 14 })} {t('mkt_nav')}</a>
          <a href="#features">{t('nav_features')}</a>
          <a href="#themes">{t('nav_themes')}</a>
          <a href="#pricing">{t('nav_pricing')}</a>
        </nav>
        <div className="pnav-right">
          <LangPill />
          {token ? (
            <button className="btn btn-accent btn-sm" onClick={onDash}>{t('db_title')}</button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={onLogin}>{t('nav_login')}</button>
              <button className="btn btn-accent btn-sm" onClick={onStart}>{t('cta_start')}</button>
            </>
          )}
          <NavMenu
            links={[[t('mkt_nav'), onExplore], [t('nav_features'), '#features'], [t('nav_themes'), '#themes'], [t('nav_pricing'), '#pricing']]}
            actions={token ? [[t('db_title'), onDash, true]] : [[t('nav_login'), onLogin], [t('cta_start'), onStart, true]]}
          />
        </div>
      </div>
    </div>
  );
}
