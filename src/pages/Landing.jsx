import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, getLang, onLangChange } from '../i18n';
import { themes } from '../data/themes';
import { palettes } from '../data/palettes';
import LangPill from '../components/ui/LangPill';
import Logo from '../components/ui/Logo';
import { useAuthStore } from '../store/authStore';
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
  ['#cdb7a3', '#e0d8cb', '#b89f86', '#c8b59c'],
  ['#d8b98a', '#cba36f', '#dcb877', '#e0c79b'],
  ['#ffd2a8', '#f7a8c0', '#cfe0f0', '#ffc9dd'],
  ['#7fb3ab', '#c98a6a', '#9aa7c4', '#c9a96a'],
];

const TILE_PRICES = [
  ['590k', '320k', '640k', '410k'],
  ['18k', '65k', '120k', '95k'],
  ['145k', '89k', '132k', '290k'],
  ['180k', '240k', '320k', '450k'],
];

function ThemeCard({ theme, index }) {
  const preview = theme.preview;
  const tiles = TILE_COLORS[index % TILE_COLORS.length];
  const prices = TILE_PRICES[index % TILE_PRICES.length];
  return (
    <div className="theme-card" style={{ '--tbg': preview.bg, '--tr': theme.radius, fontFamily: theme.family }}>
      <div className="tc-view" style={{ backgroundColor: preview.bg }}>
        <div className="tc-shop">
          <div className="tc-av ph" style={{ '--ph-tone': preview.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
            {DEMO_SHOPS[index % DEMO_SHOPS.length].initials}
          </div>
          <b style={{ color: preview.ink }}>
            {DEMO_SHOPS[index % DEMO_SHOPS.length].name}
          </b>
        </div>
        <div className="tc-tiles">
          {tiles.map((c, i) => (
            <div key={i} className="tc-tile" style={{ '--tr': theme.radius }}>
              <div className="tcimg" style={{ backgroundColor: c }} />
              <div className="tcmeta" style={{ color: preview.ink }}>{prices[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="tc-foot">
        <b style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="tc-swatch" style={{ backgroundColor: preview.accent }} />
          {t(theme.nameKey)}
        </b>
        <span className="tc-go">Preview &rarr;</span>
      </div>
    </div>
  );
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Landing() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const progRef = useRef(null);
  const rootRef = useRef(null);
  const token = useAuthStore((s) => s.token);

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
            e.target.setAttribute('data-in', '');
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
            <Logo size={26} /> rastashops
          </a>
          <div className="pnav-links">
            <a href="#features">{t('nav_features')}</a>
            <a href="#themes">{t('nav_themes')}</a>
            <a href="#pricing">{t('nav_pricing')}</a>
            <a href="/explore" className="nav-explore" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Explore
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
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="rise">
            <div className="eyebrow-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <div key={i} className="av" style={{ '--t': c }} />
                ))}
              </div>
              <span>2,400+ {t('trusted')}</span>
            </div>
          </div>

          <div className="rise" style={{ position: 'relative' }}>
            <div className="float-badge fb-1">
              <div className="fbi" style={{ background: 'var(--saffron-tint)', color: '#b06f1e' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              {t('s2')}
            </div>
            <div className="float-badge fb-2">
              <div className="fbi" style={{ background: 'var(--primary-tint)', color: 'var(--primary-700)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              {t('f3_t')}
            </div>
            <div className="site-card">
              <div className="site-bar">
                <div className="tl"><i/><i/><i/></div>
                <span className="site-url">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  rasta.uz/<b>lolaatelier</b>
                </span>
              </div>
              <div className="site-view ph" style={{ '--ph-tone': '#e8d5c4', padding: '24px' }}>
                <div style={{ height: '60px', borderRadius: '10px', marginBottom: '16px', background: 'linear-gradient(135deg, #c7b09a 0%, #e8d5c4 100%)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className="ph" style={{ '--ph-tone': '#c7b09a', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>LA</div>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>Lola Atelier</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['#e8d5c4', '#d4bfab', '#c9a88e', '#bfa48c'].map((c, i) => (
                    <div key={i} className="ph" style={{ '--ph-tone': c, aspectRatio: '1', borderRadius: '10px' }}>
                      <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '11px', fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '2px 7px', borderRadius: '6px', zIndex: 1 }}>
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
                <span key={i} className="strip-name">{name}</span>
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
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, t: t('f1_t'), d: t('f1_d'), alt: false },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, t: t('f2_t'), d: t('f2_d'), alt: true },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="15" y1="8" x2="15" y2="12"/></svg>, t: t('f3_t'), d: t('f3_d'), alt: false },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, t: t('f4_t'), d: t('f4_d'), alt: true },
            ].map((f, i) => (
              <div key={i} className={`feat${f.alt ? ' alt' : ''}`} data-reveal style={{ '--ri': i }}>
                <div className="ic">{f.icon}</div>
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
          <div className="wrap">
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
              {palettes.map((p) => (
                <div key={p.id} className="pal-dot">
                  <span className="pd-sw">
                    <i style={{ backgroundColor: p.bg }} />
                    <i style={{ backgroundColor: p.accent }} />
                    <i style={{ backgroundColor: p.ink }} />
                  </span>
                  <em>{p.name}</em>
                </div>
              ))}
              <div className="pal-dot gen">
                <span className="gen-sw" />
                <em>{t('theme_custom') || 'Custom'}</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore band */}
      <section className="sect">
        <div className="wrap">
          <div className="explore-band" data-reveal>
            <div style={{ position: 'relative' }}>
              <span className="kicker">Explore</span>
              <h2>{t('explore_band_t') || 'Browse the whole bazaar'}</h2>
              <p>{t('explore_band_d') || 'Every rasta shop in one place — by city, by category, by vibe.'}</p>
              <button className="btn btn-accent" onClick={() => navigate('/explore')}>
                {t('cta_demo')}
              </button>
            </div>
            <div className="eb-shops">
              {DEMO_SHOPS.map((shop, i) => (
                <div key={i} className="eb-shop ph" style={{ '--ph-tone': shop.color }}>
                  <span className="eb-logo ph" style={{ '--ph-tone': shop.color }}>{shop.initials}</span>
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
                <div className="barline" />
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
            <div className="ob-plan" onClick={() => navigate('/onboarding')}>
              <div className="ob-plan-h"><b>{t('price_starter')}</b></div>
              <div className="ob-plan-d">{t('price_free_trial')}</div>
              <div className="ob-plan-price">
                <span className="ob-free">{t('price_starter_price')} {t('som')} {t('price_mo')}</span>
              </div>
              <ul className="ob-feats">
                <li><CheckIcon /> {t('price_starter_f1')}</li>
                <li><CheckIcon /> {t('price_starter_f2')}</li>
                <li><CheckIcon /> {t('price_starter_f3')}</li>
                <li><CheckIcon /> {t('price_starter_f4')}</li>
                <li><CheckIcon /> {t('price_starter_f5')}</li>
              </ul>
              <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); navigate('/onboarding'); }}>
                {t('cta_start_free')}
              </button>
            </div>
            <div className="ob-plan on" onClick={() => navigate('/onboarding')}>
              <div className="ob-plan-pop">Popular</div>
              <div className="ob-plan-h"><b>{t('price_pro')}</b></div>
              <div className="ob-plan-d">{t('price_free_trial')}</div>
              <div className="ob-plan-price">
                <span className="ob-free">{t('price_pro_price')} {t('som')} {t('price_mo')}</span>
              </div>
              <ul className="ob-feats">
                <li><CheckIcon /> {t('price_pro_f1')}</li>
                <li><CheckIcon /> {t('price_pro_f2')}</li>
                <li><CheckIcon /> {t('price_pro_f3')}</li>
                <li><CheckIcon /> {t('price_pro_f4')}</li>
                <li><CheckIcon /> {t('price_pro_f5')}</li>
              </ul>
              <button className="btn btn-accent" onClick={(e) => { e.stopPropagation(); navigate('/onboarding'); }}>
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
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>
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
              <Logo size={26} /> rastashops
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
