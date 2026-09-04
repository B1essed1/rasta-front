import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, getLang, onLangChange } from '../i18n';
import { themes } from '../data/themes';
import { palettes } from '../data/palettes';
import LangPill from '../components/ui/LangPill';
import Logo from '../components/ui/Logo';
import '../styles/landing.css';

const DEMO_SHOPS = [
  { name: 'Lola Atelier', initials: 'LA', color: '#c7b09a' },
  { name: 'Non & Co', initials: 'N&', color: '#d8bf94' },
  { name: 'Gulnoza Beauty', initials: 'GB', color: '#f3c9d6' },
  { name: 'Silk Road Goods', initials: 'SR', color: '#bcae93' },
  { name: 'Bahor Flowers', initials: 'BF', color: '#e8c2dd' },
  { name: 'Tashkent Kicks', initials: 'TK', color: '#b7bcc2' },
];

const MARQUEE_NAMES = [
  'Lola Atelier', 'Non & Co', 'Gulnoza Beauty', 'Silk Road Goods',
  'Bahor Flowers', 'Tashkent Kicks', 'Moda Samarkand', 'Bukhara Ceramics',
  'Fergana Textiles', 'Chimgan Sports', 'Aral Organics', 'Navruz Flowers',
];

const AVATAR_COLORS = ['#c7b09a', '#d8bf94', '#f3c9d6', '#bcae93', '#e8c2dd', '#b7bcc2'];

const TILE_COLORS = [
  ['#e8d5c4', '#d4bfab', '#c9a88e', '#bfa48c'],
  ['#d9c8b0', '#c4aa8a', '#b89878', '#e0cbb5'],
  ['#f0d5c8', '#e6bfb0', '#d9a898', '#ecc8b8'],
  ['#c8d5c4', '#b0c4a0', '#a8b898', '#d0dcc8'],
];

function ThemeCard({ theme, index }) {
  const preview = theme.preview;
  const tiles = TILE_COLORS[index % TILE_COLORS.length];
  return (
    <div className="theme-card" style={{ fontFamily: theme.family, borderRadius: theme.radius }}>
      <div className="theme-card-preview" style={{ backgroundColor: preview.bg }}>
        <div className="theme-card-shop">
          <div className="theme-card-avatar" style={{ backgroundColor: preview.accent }}>
            {DEMO_SHOPS[index % DEMO_SHOPS.length].initials}
          </div>
          <span className="theme-card-shopname" style={{ color: preview.ink }}>
            {DEMO_SHOPS[index % DEMO_SHOPS.length].name}
          </span>
        </div>
        <div className="theme-card-tiles">
          {tiles.map((c, i) => (
            <div key={i} className="theme-card-tile" style={{ backgroundColor: c, borderRadius: theme.radius }}>
              <span className="theme-card-tile-price">120k</span>
            </div>
          ))}
        </div>
      </div>
      <div className="theme-card-footer">
        <div className="theme-card-footer-left">
          <span className="theme-card-dot" style={{ backgroundColor: preview.accent }} />
          <span className="theme-card-name">{t(theme.nameKey)}</span>
        </div>
        <span className="theme-card-link">Preview &rarr;</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const progRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  // Scroll progress bar
  useEffect(() => {
    function onScroll() {
      if (!progRef.current) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? window.scrollY / h : 0;
      progRef.current.style.transform = `scaleX(${pct})`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    if (rootRef.current) rootRef.current.classList.add('reveal-on');

    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '1');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      {/* Scroll progress */}
      <div className="scroll-prog"><i ref={progRef} /></div>

      {/* Navigation */}
      <nav className="pnav">
        <div className="pnav-inner">
          <a href="/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <Logo size={30} /> rasta
          </a>
          <div className="pnav-links">
            <a href="#features">{t('nav_features')}</a>
            <a href="#themes">{t('nav_themes')}</a>
            <a href="#pricing">{t('nav_pricing')}</a>
            <a href="/explore" className="explore-link" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Explore
            </a>
          </div>
          <div className="pnav-right">
            <LangPill />
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
              {t('nav_login')}
            </button>
            <button className="btn btn-accent btn-sm" onClick={() => navigate('/onboarding')}>
              {t('cta_start')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="rise">
            <div className="eyebrow-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {t('hero_kicker')}
            </div>
            <h1>{t('hero_title')}</h1>
            <p className="hero-sub">{t('hero_sub')}</p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/onboarding')}>
                {t('cta_start')}
              </button>
              <button className="btn btn-explore btn-lg" onClick={() => navigate('/explore')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                {t('cta_demo')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="hero-trust">
              <div className="avatars">
                {AVATAR_COLORS.map((c, i) => (
                  <span key={i} style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>2,400+ {t('trusted')}</span>
            </div>
          </div>

          <div className="rise hero-visual">
            <div className="float-badge fb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add your products
            </div>
            <div className="float-badge fb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Orders straight to chat
            </div>
            <div className="site-card">
              <div className="site-bar">
                <div className="tl"><i/><i/><i/></div>
                <span className="site-url">rasta.uz/lolaatelier</span>
                <span />
              </div>
              <div className="site-view">
                <div className="site-view-cover" style={{ background: 'linear-gradient(135deg, #c7b09a 0%, #e8d5c4 100%)' }} />
                <div className="site-view-hdr">
                  <div className="site-view-avatar" style={{ backgroundColor: '#c7b09a' }}>LA</div>
                  <span className="site-view-name">Lola Atelier</span>
                </div>
                <div className="site-view-products">
                  {['#e8d5c4', '#d4bfab', '#c9a88e', '#bfa48c'].map((c, i) => (
                    <div key={i} className="site-view-product" style={{ backgroundColor: c }}>
                      <span className="site-view-product-price">
                        {['120k', '89k', '245k', '67k'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip marquee */}
      <section className="strip">
        <div className="wrap strip-row">
          <span className="lbl">{t('trusted').split(' ')[0]}:</span>
          <div className="marquee">
            <div className="marquee-track">
              {[...MARQUEE_NAMES, ...MARQUEE_NAMES].map((name, i) => (
                <span key={i}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sect" id="features">
        <div className="wrap">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t('feat_kicker')}</span>
            <h2>{t('feat_title')}</h2>
          </div>
          <div className="feat-grid">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, t: t('f1_t'), d: t('f1_d'), tint: 'tint-p' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, t: t('f2_t'), d: t('f2_d'), tint: 'tint-s' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="15" y1="8" x2="15" y2="12"/></svg>, t: t('f3_t'), d: t('f3_d'), tint: 'tint-p' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, t: t('f4_t'), d: t('f4_d'), tint: 'tint-s' },
            ].map((f, i) => (
              <div key={i} className="feat" data-reveal style={{ '--ri': i }}>
                <div className={`feat-icon ${f.tint}`}>{f.icon}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes showcase */}
      <section className="wrap" id="themes">
        <div className="themes-sect">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t('themes_kicker')}</span>
            <h2>{t('themes_title')}</h2>
            <p>{t('themes_sub')}</p>
          </div>
          <div className="theme-row">
            {themes.map((theme, i) => (
              <div key={theme.id} data-reveal style={{ '--ri': i }}>
                <ThemeCard theme={theme} index={i} />
              </div>
            ))}
          </div>
          <div className="palette-strip">
            {palettes.slice(0, 8).map((p) => (
              <div key={p.id} className="palette-swatch">
                <div className="palette-colors">
                  <span style={{ backgroundColor: p.bg }} />
                  <span style={{ backgroundColor: p.accent }} />
                  <span style={{ backgroundColor: p.ink }} />
                </div>
                <span className="palette-label">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore band */}
      <section className="sect">
        <div className="wrap">
          <div className="explore-band" data-reveal>
            <div className="eb-text">
              <span className="kicker">Explore</span>
              <h2>{t('explore_band_t') || 'Browse the whole bazaar'}</h2>
              <p>{t('explore_band_d') || 'Every rasta shop in one place — by city, by category, by vibe.'}</p>
              <button className="btn btn-accent" onClick={() => navigate('/explore')}>
                {t('cta_demo')}
              </button>
            </div>
            <div className="eb-shops">
              {DEMO_SHOPS.map((shop, i) => (
                <div key={i} className="eb-shop" style={{ '--ph-tone': shop.color }}>
                  <span className="eb-logo">{shop.initials}</span>
                  <b>{shop.name}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="sect">
        <div className="wrap">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t('steps_title')}</span>
            <h2>{t('steps_title')}</h2>
          </div>
          <div className="steps">
            {[
              { t: t('s1'), d: t('s1d') },
              { t: t('s2'), d: t('s2d') },
              { t: t('s3'), d: t('s3d') },
            ].map((s, i) => (
              <div key={i} className="step" data-reveal style={{ '--ri': i }}>
                {i < 2 && <div className="barline" />}
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="sect pricing-sect" id="pricing">
        <div className="wrap">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t('pricing_kicker')}</span>
            <h2>{t('pricing_title')}</h2>
            <p>{t('themes_sub')}</p>
          </div>
          <div className="ob-plans lp-plans">
            <div className="ob-plan-card" onClick={() => navigate('/onboarding')}>
              <div className="ob-plan-card__badge">{t('price_free_trial')}</div>
              <h3>{t('price_starter')}</h3>
              <div className="ob-plan-card__price">
                {t('price_starter_price')} {t('som')} {t('price_mo')}
              </div>
              <ul>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Unlimited products</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> All themes</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Stock per size</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Scan to sell</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> UZ / RU / EN</li>
              </ul>
              <button className="btn btn-ghost btn--block mt-2" onClick={(e) => { e.stopPropagation(); navigate('/onboarding'); }}>
                {t('cta_start_free')}
              </button>
            </div>
            <div className="ob-plan-card ob-plan-card--featured" onClick={() => navigate('/onboarding')}>
              <div className="ob-plan-card__badge" style={{ background: 'var(--saffron-tint)', color: 'var(--saffron)' }}>Popular</div>
              <h3>{t('price_pro')}</h3>
              <div className="ob-plan-card__price">
                {t('price_pro_price')} {t('som')} {t('price_mo')}
              </div>
              <ul>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Everything in Starter</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Bulk labels</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Analytics</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Custom domain</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Featured in bazaar</li>
              </ul>
              <button className="btn btn-accent btn--block mt-2" onClick={(e) => { e.stopPropagation(); navigate('/onboarding'); }}>
                {t('cta_start_free')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="sect">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <h2>{t('cta_band_t')}</h2>
            <p>{t('cta_band_d')}</p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/onboarding')}>
                {t('cta_start_free')}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/explore')}>
                {t('cta_demo')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="wrap lp-footer-grid">
          <div>
            <div className="brand">
              <Logo size={28} /> rasta
            </div>
            <p className="foot-tag">{t('footer_tag')}</p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>Product</h4>
              <a href="#features">{t('nav_features')}</a>
              <a href="#themes">{t('nav_themes')}</a>
              <a href="#pricing">{t('nav_pricing')}</a>
              <a href="/explore" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="foot-col">
              <h4>Support</h4>
              <a href="#">Help center</a>
              <a href="#">Contact</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
