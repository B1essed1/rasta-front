import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, getLang, onLangChange, fmtPrice, fill } from '../i18n';
import { themes } from '../data/themes';
import { palettes } from '../data/palettes';
import Logo from '../components/ui/Logo';
import Navbar from '../components/layout/Navbar';
import { I } from '../components/ui/Icons';
import api from '../api/client';
import '../styles/landing.css';

const DEMO_SHOPS = [
  { name: 'Lola Atelier', initials: 'LA', color: '#c7b09a' },
  { name: 'Non & Co', initials: 'N&', color: '#d8bf94' },
  { name: 'Gulnoza Beauty', initials: 'GB', color: '#f3c9d6' },
  { name: 'Silk Road Goods', initials: 'SR', color: '#bcae93' },
  { name: 'Bahor Home', initials: 'BH', color: '#e8c2dd' },
  { name: 'Tashkent Kicks', initials: 'TK', color: '#b7bcc2' },
];

const MARQUEE_NAMES = [
  'Lola Atelier', 'Non & Co', 'Gulnoza Beauty', 'Choyxona',
  'Silk Road Goods', 'Bahor Home', 'Tashkent Kicks', 'Anor Ceramics',
];

const AVATAR_COLORS = ['#c7b09a', '#d8bf94', '#f3c9d6', '#bcae93', '#e8c2dd'];

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

const PREVIEW_LABEL = { en: 'Preview', ru: 'Открыть', uz: 'Koʻrish' };
const CURRENCY = { en: 'soʼm', ru: 'сум', uz: 'soʼm' };
const RESERVED = ['admin', 'api', 'app', 'login', 'onboarding', 'dashboard', 'explore', 'rasta', 'rastashops', 'support', 'www'];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
const fmtNum = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/[, ]/g, ' ');
const priceOf = (key) => Number(t(key).replace(/\D/g, ''));

// the four base looks and ten base palettes — the signature themes aren't part of the showcase
const SHOWCASE_THEMES = themes.filter((th) => !th.signature);
const SHOWCASE_PALETTES = palettes.filter((p) => !p.swatch);

// yearly = ten months, i.e. "2 months free"
const PLANS = [
  { id: 'starter', price: priceOf('price_starter_price') },
  { id: 'pro', price: priceOf('price_pro_price'), popular: true },
].map((p) => ({ ...p, yprice: p.price * 10 }));

// mini theme preview card (themes showcase)
function ThemeCard({ theme, index, lang, onPick }) {
  const preview = theme.preview;
  const tiles = TILE_COLORS[index % TILE_COLORS.length];
  const prices = TILE_PRICES[index % TILE_PRICES.length];
  const shop = DEMO_SHOPS[index % DEMO_SHOPS.length];
  return (
    <div className="theme-card" style={{ '--tbg': preview.bg, '--tr': theme.radius }} onClick={() => onPick(theme.id)}>
      <div className="tc-view" style={{ background: preview.bg, color: preview.ink, fontFamily: theme.family }}>
        <div className="tc-shop">
          <div className="tc-av ph" style={{ '--ph-tone': preview.accent }} />
          <b>{shop.name}</b>
        </div>
        <div className="tc-tiles">
          {tiles.map((c, i) => (
            <div key={i} className="tc-tile" style={{ background: preview.surface }}>
              <div className="tcimg ph" style={{ '--ph-tone': c, borderRadius: theme.radius }} />
              <div className="tcmeta">
                <div style={{ color: preview.accent, marginTop: 2 }}>{prices[i]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tc-foot">
        <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="tc-swatch" style={{ background: preview.accent }} />{t(theme.nameKey)}</b>
        <span className="tc-go">{PREVIEW_LABEL[lang] || PREVIEW_LABEL.en} {I.arrow({ width: 14, height: 14 })}</span>
      </div>
    </div>
  );
}

function LpHero({ onStart, onExplore }) {
  const [h, setH] = useState('');
  const [taken, setTaken] = useState(null); // handle the backend reports as in use
  const [checked, setChecked] = useState(''); // last handle the backend answered for

  // availability: GET /shops/{handle} answers 200 when the handle is in use, 404 when free
  useEffect(() => {
    if (h.length < 3 || RESERVED.includes(h)) return;
    let live = true;
    const timer = setTimeout(() => {
      api.get('/shops/' + h)
        .then(() => live && (setTaken(h), setChecked(h)))
        .catch((e) => live && e.response?.status === 404 && (setTaken(null), setChecked(h)));
    }, 350);
    return () => { live = false; clearTimeout(timer); };
  }, [h]);

  let hs = 'empty';
  if (h) {
    if (h.length < 3) hs = 'short';
    else if (RESERVED.includes(h)) hs = 'reserved';
    else if (taken === h) hs = 'taken';
    else if (checked === h) hs = 'ok';
    else hs = 'wait';
  }
  const bad = hs === 'taken' || hs === 'reserved';
  const sugg = bad ? [h + 'shop', h + 'uz', h + '1'].filter((s) => s.length <= 30) : [];
  const go = (e) => { e && e.preventDefault(); if (bad || hs === 'short') return; onStart(h); };
  const statusLabel = { ok: t('o2_free'), taken: t('o2_taken'), reserved: t('o2_reserved'), short: t('o2_short') }[hs];

  return (
    <section className="hero lh">
      <div className="wrap hero-grid">
        <div className="rise lh-copy">
          <div className="brand" style={{ fontSize: 34, gap: 14, marginBottom: 20 }}><Logo size={56} /> <span className="brand-name">rasta<i>shops</i></span></div>
          <span className="eyebrow-pill">{I.store({ width: 15, height: 15 })} {t('hero_kicker')}</span>
          <h1>{t('hero_title')}</h1>
          <p className="hero-sub">{t('hero_sub')}</p>
          <form className="lh-claim" onSubmit={go}>
            <label className="lh-claim-f" htmlFor="lh-h">
              <span className="lh-claim-pre">rastashops.com/</span>
              <input id="lh-h" value={h} onChange={(e) => setH(slugify(e.target.value))} placeholder={t('lh_claim_ph')} aria-label={t('lh_claim_l')} autoComplete="off" spellCheck="false" />
            </label>
            <button className="btn btn-accent btn-lg" type="submit" disabled={bad || hs === 'short'}>{t('lh_claim_btn')} {I.arrow({ width: 18, height: 18 })}</button>
          </form>
          {statusLabel && (
            <div className={'lh-claim-st' + (hs === 'ok' ? '' : ' no')} aria-live="polite">
              {hs === 'ok' ? I.check({ width: 14, height: 14 }) : I.x({ width: 14, height: 14 })}
              <span>rastashops.com/{h} — {statusLabel}</span>
              {sugg.length > 0 && <>{t('o2_try')} {sugg.map((s) => <button key={s} type="button" onClick={() => setH(s)}>{s}</button>)}</>}
            </div>
          )}
          <div className="lh-or">{t('lh_or')} <button type="button" onClick={onExplore}>{t('lh_browse')} {I.arrow({ width: 14, height: 14 })}</button></div>
          <ul className="lh-proof">
            {[t('lh_p1'), t('lh_p2'), t('lh_p3')].map((x, i) => <li key={i}>{I.check({ width: 15, height: 15 })} {x}</li>)}
          </ul>
          <div className="hero-trust lh-trust">
            <div className="lh-avs">{AVATAR_COLORS.map((c, i) => <span key={i} style={{ backgroundColor: c }} />)}</div>
            <span><b>2,400+</b> {t('trusted')}</span>
          </div>
        </div>
        <div className="rise lh-visual" style={{ animationDelay: '.12s' }}>
          <div className="lh-notif">
            <span className="lh-notif-ic" style={{ color: '#229ED9' }}>{I.tg({ width: 34, height: 34 })}</span>
            <div><b>{t('lh_notif_t')}</b><span>{t('lh_notif_d')}</span></div>
          </div>
          <div className="lh-stock">
            <span className="lh-stock-ic">{I.box({ width: 18, height: 18 })}</span>
            <div><b>{t('lh_stock_t')}</b><span>{t('lh_stock_d')}</span></div>
          </div>
          <div className="site-card">
            <div className="site-bar">
              <div className="tl"><i /><i /><i /></div>
              <div className="site-url" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Logo size={14} /> rastashops.com/<b>{h || 'lolaatelier'}</b></div>
            </div>
                <div className="site-view" style={{ padding: '14px 16px', background: '#faf8f4', overflow: 'hidden' }}>
                  {/* Search + filter bar */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e7e0d5', borderRadius: 999, padding: '8px 14px', fontSize: 13, color: '#9a9085' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      {t('sf_search')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e7e0d5', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#6f655a', whiteSpace: 'nowrap' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                      {t('sff_filters')}
                    </div>
                  </div>
                  {/* Quick action pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e7e0d5', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#1b1714', marginBottom: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E4573B" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    {t('db_add')}
                  </div>
                  {/* Product grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { name: 'Bahor midi ko\'ylagi', price: '640 000', bg: 'linear-gradient(145deg,#c9a88e,#a0826a)', letter: 'B' },
                      { name: 'Keng zig\'ir shim', price: '410 000', bg: 'linear-gradient(145deg,#d4c4b0,#b8a896)', letter: 'K' },
                    ].map((p, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e7e0d5' }}>
                        <div style={{ aspectRatio: '3/4', background: p.bg, position: 'relative' }}>
                          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', fontSize: 48, fontWeight: 700 }}>{p.letter}</span>
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 13, fontWeight: 650, color: '#1b1714', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#E4573B', marginTop: 2 }}>{p.price} so'm</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Bottom row with badges */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, overflow: 'hidden' }}>
                    <div style={{ flex: 1, height: 56, borderRadius: 12, background: 'linear-gradient(145deg,#7a9a6e,#5a7a4e)', position: 'relative' }}>
                      <span style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', background: '#1a7f37', padding: '2px 7px', borderRadius: 6 }}>{t('sf_in_stock')}</span>
                    </div>
                    <div style={{ flex: 1, height: 56, borderRadius: 12, background: 'linear-gradient(145deg,#b8a896,#9a8876)', position: 'relative', overflow: 'hidden' }}>
                      <span style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.5)', padding: '3px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
                        {t('db_inventory')}
                      </span>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LpPricing({ onStart }) {
  const [yearly, setYearly] = useState(false);
  const [open, setOpen] = useState(0);
  const lang = getLang();
  const feats = {
    starter: [1, 2, 3, 4, 5].map((i) => t('price_starter_f' + i)),
    pro: [1, 2, 3, 4, 5].map((i) => t('price_pro_f' + i)),
  };
  const name = (id) => (id === 'pro' ? t('ob_pro') : t('ob_starter'));
  const rows = [
    [feats.starter[0], 1, 1],
    [feats.starter[1], 1, 1],
    [feats.starter[2], 1, 1],
    [feats.starter[3], 1, 1],
    [t('pr_f_tg'), 1, 1],
    [t('pr_f_bio'), 1, 1],
    [t('pr_f_team'), 1, 1],
    [feats.starter[4], 1, 1],
    ...feats.pro.slice(1).map((f) => [f, 0, 1]),
  ];
  // pr_q*/pr_a* come from the i18n merge; skip entries whose key isn't translated yet
  const faqs = [1, 2, 3, 4, 5]
    .map((i) => [t('pr_q' + i), t('pr_a' + i), 'pr_q' + i])
    .filter(([q, , key]) => q !== key);
  return (
    <section className="sect pricing-sect pr" id="pricing">
      <div className="wrap">
        <div className="sect-head" data-reveal>
          <span className="kicker">{t('nav_pricing')}</span>
          <h2>{t('ob_plan_t')}</h2>
          <p>{t('ob_plan_d')}</p>
        </div>
        <div className="pr-switch" role="tablist" data-reveal>
          <button role="tab" aria-selected={!yearly} className={!yearly ? 'on' : ''} onClick={() => setYearly(false)} type="button">{t('pr_monthly')}</button>
          <button role="tab" aria-selected={yearly} className={yearly ? 'on' : ''} onClick={() => setYearly(true)} type="button">{t('pr_yearly')} <i>{t('pr_save')}</i></button>
        </div>
        <div className="pr-cards">
          {PLANS.map((p, i) => {
            const mo = yearly ? Math.round(p.yprice / 12 / 500) * 500 : p.price;
            return (
              <div key={p.id} className={'pr-card' + (p.popular ? ' pop' : '')} data-reveal style={{ '--ri': i }}>
                <div className="pr-card-h"><b>{name(p.id)}</b>{p.popular && <span className="pr-pop">{t('pr_popular')}</span>}</div>
                <p className="pr-card-d">{p.id === 'pro' ? t('ob_pro_d') : t('ob_starter_d')}</p>
                <div className="pr-free">{I.spark({ width: 15, height: 15 })} {t('pr_free_then')}</div>
                <div className="pr-price"><b>{fmtNum(mo)}</b><span>{CURRENCY[lang]} {t('pr_per_mo')}</span></div>
                <div className="pr-billed">{yearly ? fill(t('pr_billed_y'), { p: fmtPrice(p.yprice, lang) }) : t('pr_billed_m')}</div>
                <button className={'btn btn-lg ' + (p.popular ? 'btn-accent' : 'btn-soft')} onClick={onStart} type="button">{t('cta_start_free')} {I.arrow({ width: 18, height: 18 })}</button>
                <ul className="pr-feats">{feats[p.id].map((f, k) => <li key={k}>{I.check({ width: 16, height: 16 })} {f}</li>)}</ul>
              </div>
            );
          })}
        </div>

        <div className="pr-compare" data-reveal>
          <h3>{t('pr_compare')}</h3>
          <div className="pr-table" role="table">
            <div className="pr-tr pr-th" role="row"><span role="columnheader"></span>{PLANS.map((p) => <span key={p.id} role="columnheader">{name(p.id)}</span>)}</div>
            {rows.map((r, i) => (
              <div key={i} className="pr-tr" role="row">
                <span role="cell">{r[0]}</span>
                <span role="cell" className={r[1] ? 'y' : 'n'}>{r[1] ? I.check({ width: 18, height: 18 }) : '—'}</span>
                <span role="cell" className={r[2] ? 'y' : 'n'}>{r[2] ? I.check({ width: 18, height: 18 }) : '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {faqs.length > 0 && (
          <div className="pr-faq" data-reveal>
            <h3>{t('pr_faq')}</h3>
            {faqs.map(([q, a], i) => (
              <div key={i} className={'pr-q' + (open === i ? ' open' : '')}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} type="button">{q}<span>{open === i ? I.minus({ width: 18, height: 18 }) : I.plus({ width: 18, height: 18 })}</span></button>
                {open === i && <p>{a}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Landing() {
  const [, setTick] = useState(0);
  const [shops, setShops] = useState([]);
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const lang = getLang();

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  // explore band tiles come from the marketplace; static demo shops stand in until it answers
  useEffect(() => {
    api.get('/marketplace/discover')
      .then((r) => setShops(Array.isArray(r.data) ? r.data.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  // scroll progress line + reveal-on-scroll
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bar = root.querySelector('.scroll-prog i');
    const onScroll = () => {
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const r = Math.min(1, Math.max(0, (window.scrollY || h.scrollTop) / max));
      if (bar) bar.style.transform = 'scaleX(' + r + ')';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    let io;
    if (!reduce && 'IntersectionObserver' in window) {
      root.classList.add('reveal-on');
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-in', '1'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
      root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    }
    return () => { window.removeEventListener('scroll', onScroll); if (io) io.disconnect(); };
  }, []);

  const onExplore = () => navigate('/explore');
  const onStart = (handle) => navigate('/onboarding', { state: typeof handle === 'string' && handle ? { handle } : undefined });
  const onPickTheme = (themeId) => navigate('/onboarding', { state: { themeId } });

  const feats = [
    { ic: I.bolt, t: t('f1_t'), d: t('f1_d') },
    { ic: I.layers, t: t('f2_t'), d: t('f2_d'), alt: true },
    { ic: I.barcode, t: t('f3_t'), d: t('f3_d') },
  ];
  const bandShops = shops.length
    ? shops.map((s) => ({ key: s.id, name: s.name, initials: s.initials || s.name.slice(0, 2).toUpperCase(), color: s.coverColor || '#c7b09a', cover: s.coverUrl, logo: s.logoUrl }))
    : DEMO_SHOPS.map((s) => ({ key: s.name, ...s }));

  return (
    <div className="lp" ref={rootRef}>
      <div className="scroll-prog"><i></i></div>
      <Navbar />

      <LpHero onStart={onStart} onExplore={onExplore} />

      {/* logo strip */}
      <section className="strip">
        <div className="wrap strip-row">
          <span className="lbl">{t('trusted')}:</span>
          <div className="marquee">
            <div className="marquee-track">
              {MARQUEE_NAMES.concat(MARQUEE_NAMES).map((n, i) => (
                <span key={i} className="strip-name">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="sect" id="features">
        <div className="wrap">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t('feat_kicker')}</span>
            <h2>{t('feat_title')}</h2>
          </div>
          <div className="feat-grid">
            {feats.map((f, i) => (
              <div key={i} className={'feat' + (f.alt ? ' alt' : '')} data-reveal style={{ '--ri': i }}>
                <div className="ic">{f.ic()}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* themes */}
      <section className="wrap" id="themes">
        <div className="themes-sect">
          <div className="wrap">
            <div className="sect-head" data-reveal>
              <span className="kicker">{t('themes_kicker')}</span>
              <h2>{t('themes_title')}</h2>
              <p>{t('looks_note')}</p>
            </div>
            <div className="theme-row">
              {SHOWCASE_THEMES.map((theme, i) => (
                <div key={theme.id} data-reveal style={{ '--ri': i }}>
                  <ThemeCard theme={theme} index={i} lang={lang} onPick={onPickTheme} />
                </div>
              ))}
            </div>
            <div className="palette-strip" data-reveal>
              {SHOWCASE_PALETTES.map((p) => (
                <span key={p.id} className="pal-dot" title={p.name}>
                  <span className="pd-sw"><i style={{ background: p.bg }}></i><i style={{ background: p.accent }}></i><i style={{ background: p.ink }}></i></span>
                  <em>{p.name}</em>
                </span>
              ))}
              <span className="pal-dot gen">
                <span className="pd-sw gen-sw"></span>
                <em>{t('db_custom')}</em>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* explore band */}
      <section className="sect" style={{ paddingTop: 6 }}>
        <div className="wrap">
          <div className="explore-band" data-reveal>
            <div className="eb-text">
              <span className="kicker">rasta bozor</span>
              <h2>{t('explore_band_t')}</h2>
              <p>{t('explore_band_d')}</p>
              <button className="btn btn-accent btn-lg" onClick={onExplore}>{I.search({ width: 18, height: 18 })} {t('mkt_nav')} {I.arrow({ width: 18, height: 18 })}</button>
            </div>
            <div className="eb-shops">
              {bandShops.map((s) => (
                <div key={s.key} className="eb-shop ph" style={{ '--ph-tone': s.color, ...(s.cover ? { backgroundImage: `url(${s.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }} onClick={onExplore}>
                  <span className="eb-logo ph" style={{ '--ph-tone': s.color, ...(s.logo ? { backgroundImage: `url(${s.logo})`, backgroundSize: 'cover' } : {}) }}>{!s.logo && <span className="ph-init" style={{ fontSize: 13 }}>{s.initials}</span>}</span>
                  <b>{s.name}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* steps */}
      <section className="sect">
        <div className="wrap">
          <div className="sect-head" data-reveal><span className="kicker">rastashops.com</span><h2>{t('steps_title')}</h2></div>
          <div className="steps">
            {[[t('s1'), t('s1d')], [t('s2'), t('s2d')], [t('s3'), t('s3d')]].map((s, i) => (
              <div key={i} className="step" data-reveal style={{ '--ri': i }}><div className="barline"></div><h3>{s[0]}</h3><p>{s[1]}</p></div>
            ))}
          </div>
        </div>
      </section>

      <LpPricing onStart={() => onStart()} />

      {/* cta band */}
      <section className="sect" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <h2>{t('cta_band_t')}</h2>
            <p>{t('cta_band_d')}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onStart()}>{t('cta_start_free')}</button>
              <button className="btn btn-ghost btn-lg" onClick={onExplore}>{t('cta_demo')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="lp-footer">
        <div className="wrap lp-footer-grid">
          <div>
            <div className="brand"><Logo /> <span className="brand-name">rasta<i>shops</i></span></div>
            <p className="foot-tag">{t('footer_tag')}</p>
          </div>
          <div className="foot-cols">
            <div className="foot-col"><h4>{t('nav_features')}</h4><a>{t('f1_t')}</a><a>{t('f2_t')}</a><a>{t('f3_t')}</a></div>
            <div className="foot-col"><h4>rasta</h4><a>{t('nav_themes')}</a><a>{t('nav_pricing')}</a><a>{t('nav_login')}</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
