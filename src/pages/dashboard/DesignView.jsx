import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { t, onLangChange, fmtPrice } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { themes, getTheme, applyThemeVars } from '../../data/themes';
import { palettes, getPalette, applyPaletteVars } from '../../data/palettes';
import { toast } from '../../components/ui/ToastHost';
import { BIO_BGS, BIO_TPLS, VIBE_LAYOUTS, getBioConfig, bioVars } from '../../data/bio';
import { I } from '../../components/ui/Icons';
import api from '../../api/client';

const layouts = [
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
  { id: 'magazine', label: 'Magazine' },
  { id: 'gallery', label: 'Gallery' },
];

const fonts = [
  { id: 'hanken', label: 'Hanken Grotesk', family: "'Hanken Grotesk', sans-serif" },
  { id: 'instrument', label: 'Instrument Serif', family: "'Instrument Serif', serif" },
  { id: 'newsreader', label: 'Newsreader', family: "'Newsreader', serif" },
  { id: 'outfit', label: 'Outfit', family: "'Outfit', sans-serif" },
  { id: 'space', label: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
  { id: 'unbounded', label: 'Unbounded', family: "'Unbounded', sans-serif" },
  { id: 'anton', label: 'Anton', family: "'Anton', sans-serif" },
  { id: 'caveat', label: 'Caveat', family: "'Caveat', cursive" },
  { id: 'vt323', label: 'VT323', family: "'VT323', monospace" },
  { id: 'spacemono', label: 'Space Mono', family: "'Space Mono', monospace" },
];

/** Map a theme to a reasonable fontId */
function fontIdForTheme(theme) {
  const fam = (theme.family || '').toLowerCase();
  if (fam.includes('unbounded')) return 'unbounded';
  if (fam.includes('anton')) return 'anton';
  if (fam.includes('caveat')) return 'caveat';
  if (fam.includes('vt323')) return 'vt323';
  if (fam.includes('space mono')) return 'spacemono';
  if (fam.includes('instrument')) return 'instrument';
  if (fam.includes('newsreader')) return 'newsreader';
  if (fam.includes('outfit')) return 'outfit';
  if (fam.includes('space grotesk')) return 'space';
  return 'hanken';
}

/* ────────────────────────────────────────────────────
   DesignView — main component
   ──────────────────────────────────────────────────── */

export default function DesignView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const shopConfig = useShopStore((s) => s.config);
  const fetchConfig = useShopStore((s) => s.fetchConfig);
  const updateConfig = useShopStore((s) => s.updateConfig);
  const [config, setConfig] = useState({
    themeId: 'minimal',
    paletteId: 'ivory',
    layout: 'grid',
    fontId: 'hanken',
  });
  const [saving, setSaving] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop?.id) fetchConfig();
  }, [shop?.id, fetchConfig]);

  useEffect(() => {
    if (shopConfig) {
      setConfig({
        themeId: shopConfig.theme?.toLowerCase() || 'minimal',
        paletteId: shopConfig.palette || 'ivory',
        layout: shopConfig.layout?.toLowerCase() || 'grid',
        fontId: shopConfig.font || 'hanken',
      });
    }
  }, [shopConfig]);

  const currentTheme = getTheme(config.themeId);
  const currentPalette = getPalette(config.paletteId);

  async function handleSave() {
    setSaving(true);
    try {
      await updateConfig(config);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setSaving(false);
  }

  return (
    <div className="design-view">
      <div className="design-view__header">
        <div>
          <h1>{t('db_design')}</h1>
          <p style={{ fontSize: 13, color: 'var(--soft)', marginTop: 2 }}>{t('db_design_sub')}</p>
        </div>
        <div className="design-view__actions">
          {shop?.handle && (
            <a
              href={`/${shop.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline btn--sm"
            >
              {t('db_visit')}
            </a>
          )}
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? t('loading') : t('db_save')}
          </button>
        </div>
      </div>

      {/* Section 1: Shop Design Summary Card */}
      <div className="set-card" style={{ marginBottom: 22 }}>
        <div className="set-title">{t('ss_title')}</div>
        <div
          className="ds-card"
          onClick={() => setStudioOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setStudioOpen(true)}
        >
          {/* Mini theme preview */}
          <div className="ds-preview" style={{ background: currentPalette.bg }}>
            <ThemeMiniThumb theme={currentTheme} palette={currentPalette} size="lg" />
          </div>
          <div className="ds-info">
            <b>{t(currentTheme.nameKey) || currentTheme.name || currentTheme.id}</b>
            <div className="ds-meta">
              <span className="ds-swatch" style={{ background: currentPalette.accent }} />
              <span>{currentPalette.name}</span>
              <span style={{ color: 'var(--faint)' }}>|</span>
              <span>{config.layout}</span>
            </div>
          </div>
          <button className="btn btn-accent" style={{ flexShrink: 0 }}>
            {t('ss_edit')}
          </button>
        </div>
      </div>

      {/* StoreStudio overlay */}
      {studioOpen && (
        <StoreStudio
          shop={shop}
          products={products}
          config={config}
          setConfig={setConfig}
          onClose={() => setStudioOpen(false)}
        />
      )}

      {/* Section 2: Bio Studio */}
      <BioStudio shopId={shop?.id} handle={shop?.handle} />
    </div>
  );
}

/* ────────────────────────────────────────────────────
   ThemeMiniThumb — small storefront representation
   ──────────────────────────────────────────────────── */

function ThemeMiniThumb({ theme, palette, size }) {
  const p = palette || getPalette(theme.defaultPalette);
  const w = size === 'lg' ? 80 : 72;
  const h = size === 'lg' ? 56 : 52;
  return (
    <span
      className="ss-mini"
      style={{
        width: w,
        height: h,
        background: p.bg,
        borderColor: p.line,
      }}
    >
      <span className="cv" style={{ background: p.surface }} />
      <b style={{ fontFamily: theme.family, color: p.ink, fontWeight: theme.weight || theme.headingWeight || 600 }}>Aa</b>
      <span className="pr">
        <i style={{ background: p.surface, borderRadius: theme.radiusSm || '2px' }} />
        <i style={{ background: p.surface, borderRadius: theme.radiusSm || '2px' }} />
        <i style={{ background: p.accent, borderRadius: theme.radiusSm || '2px' }} />
      </span>
    </span>
  );
}

/* ────────────────────────────────────────────────────
   StoreStudio — full-screen design overlay
   ──────────────────────────────────────────────────── */

function StoreStudio({ shop, products, config, setConfig, onClose }) {
  const [hoverThemeId, setHoverThemeId] = useState(null);
  const [tab, setTab] = useState('look');
  const [group, setGroup] = useState('all');
  const [device, setDevice] = useState('desktop');
  const updateConfig = useShopStore((s) => s.updateConfig);
  const iframeRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Theme ordering: signature first, then classic
  const themeOrder = [...themes.filter((t) => t.signature), ...themes.filter((t) => !t.signature)];
  const filteredThemes =
    group === 'all' ? themeOrder :
    group === 'sig' ? themeOrder.filter((t) => t.signature) :
    themeOrder.filter((t) => !t.signature);

  const sigCount = themes.filter((t) => t.signature).length;
  const classicCount = themes.filter((t) => !t.signature).length;

  const currentIdx = themeOrder.findIndex((t) => t.id === config.themeId);
  const displayTheme = hoverThemeId ? getTheme(hoverThemeId) : getTheme(config.themeId);
  const displayPalette = hoverThemeId
    ? getPalette(getTheme(hoverThemeId).defaultPalette)
    : getPalette(config.paletteId);

  const step = useCallback((dir) => {
    const next = themeOrder[(currentIdx + dir + themeOrder.length) % themeOrder.length];
    applyTheme(next.id);
  }, [currentIdx, themeOrder]);

  function applyTheme(id) {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    const newConfig = {
      themeId: id,
      layout: theme.layout || config.layout,
      paletteId: theme.defaultPalette || config.paletteId,
      fontId: fontIdForTheme(theme),
    };
    setConfig(newConfig);
    updateConfig(newConfig);
    setIframeKey((k) => k + 1);
  }

  function applyPalette(id) {
    const newConfig = { ...config, paletteId: id };
    setConfig(newConfig);
    updateConfig(newConfig);
    setIframeKey((k) => k + 1);
  }

  function applyLayout(id) {
    const newConfig = { ...config, layout: id };
    setConfig(newConfig);
    updateConfig(newConfig);
    setIframeKey((k) => k + 1);
  }

  function applyFont(id) {
    const newConfig = { ...config, fontId: id };
    setConfig(newConfig);
    updateConfig(newConfig);
    setIframeKey((k) => k + 1);
  }

  function generateRandomPalette() {
    const idx = Math.floor(Math.random() * palettes.length);
    applyPalette(palettes[idx].id);
  }

  // Scroll lock + keyboard
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, step]);

  const previewUrl = shop?.handle ? `/${shop.handle}` : null;

  // Scale for the iframe preview
  const browserW = device === 'desktop' ? 1200 : 390;
  const browserH = device === 'desktop' ? 700 : 750;
  const stageScale = device === 'desktop' ? 0.55 : 0.7;

  const jsx = (
    <div className="ss-root">
      {/* Top bar */}
      <div className="be-top">
        <div className="be-ttl">
          <b>{t('ss_title')}</b>
        </div>

        {/* Device toggle */}
        <div className="ss-dev">
          <button className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}>
            {t('ss_desktop')}
          </button>
          <button className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')}>
            {t('ss_phone')}
          </button>
        </div>

        <button className="btn btn-primary" onClick={onClose} style={{ marginLeft: 8 }}>
          {t('ss_done')}
        </button>
      </div>

      {/* Stage */}
      <div className="be-stage">
        {/* Left nav */}
        <button className="be-nav l" onClick={() => step(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Preview frame */}
        {previewUrl ? (
          device === 'phone' ? (
            <div className="be-phone-wrap" style={{ transform: `scale(${stageScale})` }}>
              <div className="be-phone">
                <div className="be-screen">
                  <iframe
                    ref={iframeRef}
                    key={iframeKey}
                    src={previewUrl}
                    title="Store preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="ss-browser"
              style={{
                width: browserW,
                height: browserH,
                transform: `scale(${stageScale})`,
              }}
            >
              <div className="ss-bbar">
                <div className="tl"><i /><i /><i /></div>
                <div className="u">labaratory.rastashops.com/{shop?.handle || 'shop'}</div>
              </div>
              <div className="ss-bscreen">
                <iframe
                  ref={iframeRef}
                  key={iframeKey}
                  src={previewUrl}
                  title="Store preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )
        ) : (
          <div style={{ color: 'var(--soft)', fontSize: 14 }}>No shop handle</div>
        )}

        {/* Right nav */}
        <button className="be-nav r" onClick={() => step(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Caption */}
        <div className="be-cap">
          <b>{hoverThemeId ? (t(displayTheme.nameKey) || displayTheme.name) : (t(getTheme(config.themeId).nameKey) || getTheme(config.themeId).name)}</b>
          <span>{currentIdx + 1} / {themeOrder.length}</span>
          {hoverThemeId && hoverThemeId !== config.themeId && (
            <em>{t('ss_current')}: {t(getTheme(config.themeId).nameKey) || getTheme(config.themeId).name}</em>
          )}
        </div>
      </div>

      {/* Bottom panel */}
      <div className="be-panel">
        {/* Tabs */}
        <div className="be-tabs">
          <button className={tab === 'look' ? 'on' : ''} onClick={() => setTab('look')}>
            {t('ss_looks')}
          </button>
          <button className={tab === 'color' ? 'on' : ''} onClick={() => setTab('color')}>
            {t('ss_colors')}
          </button>
          <button className={tab === 'layout' ? 'on' : ''} onClick={() => setTab('layout')}>
            {t('ss_layout')}
          </button>
        </div>

        {/* Look tab */}
        {tab === 'look' && (
          <>
            <div className="be-groups">
              <button className={group === 'all' ? 'on' : ''} onClick={() => setGroup('all')}>
                All
              </button>
              <button className={group === 'sig' ? 'on' : ''} onClick={() => setGroup('sig')}>
                {t('ss_signature')} <i>{sigCount}</i>
              </button>
              <button className={group === 'classic' ? 'on' : ''} onClick={() => setGroup('classic')}>
                {t('ss_classic')} <i>{classicCount}</i>
              </button>
            </div>
            <div className="be-list">
              {filteredThemes.map((theme) => {
                const pal = getPalette(theme.defaultPalette) || getPalette('ivory');
                return (
                  <button
                    key={theme.id}
                    className={'ss-pick' + (config.themeId === theme.id ? ' on' : '')}
                    onMouseEnter={() => setHoverThemeId(theme.id)}
                    onMouseLeave={() => setHoverThemeId(null)}
                    onClick={() => applyTheme(theme.id)}
                  >
                    <ThemeMiniThumb theme={theme} palette={pal} />
                    <span className="bio-pick-nm">
                      {config.themeId === theme.id && I.check({ width: 13, height: 13 })}
                      {' '}{t(theme.nameKey) || theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="be-hint">
              <span className="d">{t('ss_hint')}</span>
              <span className="m">{t('ss_hint')}</span>
            </div>
          </>
        )}

        {/* Color tab */}
        {tab === 'color' && (
          <>
            <div style={{ marginBottom: 10 }}>
              <button className="te-gen" onClick={generateRandomPalette}>
                {t('db_generate_random')}
              </button>
            </div>
            <div className="ss-pals">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  className={'pal-btn' + (config.paletteId === p.id ? ' on' : '')}
                  onClick={() => applyPalette(p.id)}
                >
                  <span className="pal-strip">
                    <i style={{ background: p.bg }} />
                    <i style={{ background: p.surface }} />
                    <i style={{ background: p.accent }} />
                    <i style={{ background: p.ink }} />
                  </span>
                  <span className="pal-name">{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Layout & type tab */}
        {tab === 'layout' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t('db_layout')}</div>
              <div className="be-chips">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    className={config.layout === l.id ? 'on' : ''}
                    onClick={() => applyLayout(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t('db_font')}</div>
              <div className="be-font-chips">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    className={config.fontId === f.id ? 'on' : ''}
                    style={{ fontFamily: f.family }}
                    onClick={() => applyFont(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(jsx, document.body);
}

/* ── Structural mini-preview thumbnails ── */

function ConceptThumb({ L, c }) {
  const base = 'bio-thumb vt ct-' + L;
  const st = bioVars(c);
  if (L === 'os') return <span className={base} style={st}><span className="cto-w"><i className="bar" /><i className="row" /><i className="btn" /></span><span className="cto-ic"><i /><i /><i /></span><span className="cto-w s"><i className="bar" /><i className="grid" /></span><span className="cto-task" /></span>;
  if (L === 'receipt') return <span className={base} style={st}><span className="ctr-p"><i className="c" /><i className="l" /><i className="l" /><i className="l" /><i className="t" /><i className="bc" /></span></span>;
  if (L === 'chat') return <span className={base} style={st}><span className="ctc-h" /><i className="ctc-m in" /><i className="ctc-m in img" /><i className="ctc-m out" /><span className="ctc-k"><i className="big" /><i /><i /></span></span>;
  if (L === 'ticket') return <span className={base} style={st}><span className="ctt-nm" /><i className="ctt-t big" /><i className="ctt-t c1" /><i className="ctt-t c2" /><i className="ctt-t c3" /></span>;
  if (L === 'player') return <span className={base} style={st}><span className="cty-c"><span className="cty-art"><i className="rec" /><i className="sl" /></span><i className="cty-nm" /><i className="cty-pr" /><i className="cty-pl" /></span><i className="cty-tr" /><i className="cty-tr" /></span>;
  if (L === 'cover') return <span className={base} style={st}><span className="ctz-mast" /><i className="ctz-l" /><i className="ctz-l" /><i className="ctz-l s" /><span className="ctz-b" /></span>;
  return null;
}

function VibeThumb({ L, c }) {
  const base = 'bio-thumb vt vt-' + L;
  const st = bioVars(c);
  if (L === 'bento') return <span className={base} style={st}><span className="vtb"><i className="id" /><i className="sh" /><i className="c1" /><i className="c2" /><i className="c3" /><i className="p" /></span></span>;
  if (L === 'sticker') return <span className={base} style={st}><span className="vts-av" /><span className="vts-nm" /><i className="vts-b sh" /><i className="vts-b c1" /><i className="vts-b c2" /><i className="vts-b c3" /></span>;
  if (L === 'marquee') return <span className={base} style={st}><span className="vtm-m" /><span className="vtm-nm" /><span className="vtm-nm s" /><i className="vtm-r big" /><i className="vtm-r" /><i className="vtm-r" /><span className="vtm-m b" /></span>;
  if (L === 'aurora') return <span className={base} style={st}><i className="vta-b a" /><i className="vta-b b" /><i className="vta-b c" /><span className="vta-g"><span className="vta-av" /><span className="vta-nm" /><i className="vta-btn sh" /><i className="vta-btn" /><i className="vta-btn" /></span></span>;
  if (L === 'ikat') return <span className={base} style={st}><span className="vti-band" /><span className="vti-arch" /><span className="vti-nm" /><i className="vti-btn sh" /><i className="vti-btn" /><span className="vti-band bt" /></span>;
  if (L === 'scrap') return <span className={base} style={st}><span className="vtp-pol" /><span className="vtp-nm" /><i className="vtp-n sh" /><i className="vtp-n" /><i className="vtp-n r" /></span>;
  return <ConceptThumb L={L} c={c} />;
}

function BioThumb({ tpl, over }) {
  const def = BIO_TPLS.find(x => x.id === tpl) || BIO_TPLS[0];
  const c = { tpl: def.id, layout: def.layout, bg: def.bg, btn: def.btn, radius: def.radius, font: def.font, ...(over || {}) };
  const L = c.layout;
  if (VIBE_LAYOUTS.includes(L)) return <VibeThumb L={L} c={c} />;
  return (
    <span className={'bio-thumb bio-btn-' + c.btn + ' th-' + L} style={bioVars(c)}>
      {L === 'hero' && <span className="bt-cover" />}
      {L === 'poster' && <span className="bt-poster" />}
      {L !== 'editorial' && <span className="bt-av" style={L === 'poster' ? { marginTop: 'auto' } : null} />}
      {L === 'editorial' && <span className="bt-av left" />}
      <span className={'bt-nm' + (L === 'editorial' ? ' left' : '')} />
      {L === 'tiles'
        ? <span className="bt-tiles"><i className="primary" /><i /><i /></span>
        : L === 'editorial'
        ? <span className="bt-rows"><i /><i /><i /></span>
        : <><span className="bt-btn primary" /><span className="bt-btn" /><span className="bt-btn" /></>}
      {L === 'shelf' && <span className="bt-shelf"><i /><i /><i /></span>}
    </span>
  );
}

/* ── Bio Studio ── */

function BioStudio({ shopId, handle }) {
  const [bioJson, setBioJson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!shopId) return;
    api.get(`/shops/${shopId}/config`).then((res) => {
      setBioJson(res.data?.bioJson || null);
    }).catch(() => {});
  }, [shopId]);

  const cfg = getBioConfig(bioJson);

  function pickTpl(tplId) {
    const newJson = JSON.stringify({ tpl: tplId });
    setBioJson(newJson);
    saveBio(newJson);
  }

  function patchBio(patch) {
    let raw = {};
    try { raw = bioJson ? JSON.parse(bioJson) : {}; } catch {}
    const updated = { ...raw, ...patch };
    const newJson = JSON.stringify(updated);
    setBioJson(newJson);
    saveBio(newJson);
  }

  function resetToTemplate() {
    const newJson = JSON.stringify({ tpl: cfg.tpl });
    setBioJson(newJson);
    saveBio(newJson);
  }

  async function saveBio(json) {
    if (!shopId) return;
    setSaving(true);
    try {
      await api.put(`/shops/${shopId}/config`, { bioJson: json });
      setPreviewKey(k => k + 1);
    } catch {}
    setSaving(false);
  }

  const TPL_GROUPS = [
    ['concept', t('st_bio_concept'), true],
    ['vivid', t('st_bio_vivid'), false],
    ['classic', t('st_bio_classic'), false],
  ];

  const FONT_OPTIONS = [
    ['soft', 'Bricolage'],
    ['grotesk', 'Space Grotesk'],
    ['serif', 'Serif'],
    ['outfit', 'Outfit'],
    ['round', 'Unbounded'],
    ['impact', 'Anton'],
    ['hand', 'Caveat (handwritten)'],
    ['pixel', 'VT323 (pixel)'],
    ['mono', 'Space Mono'],
  ];

  return (
    <div className="set-card" style={{ marginTop: 22 }}>
      <div className="set-title">{t('st_bio')}</div>
      <div className="hint" style={{ marginTop: -6 }}>{t('st_bio_d')}</div>

      <div className="theme-editor" style={{ marginTop: 16 }}>
        {/* Controls panel */}
        <div className="te-panel">
          {/* Template picker — grouped */}
          <div className="bio-sub-t">{t('st_bio_tpl')}</div>
          {TPL_GROUPS.map(([group, label, showNew]) => (
            <div key={group} className="bio-tpl-group">
              <div className="bio-tpl-gt">
                {label}
                {showNew && <em>{t('vb_new')}</em>}
              </div>
              <div className="bio-picker">
                {BIO_TPLS
                  .filter(x => (x.group || (x.vivid ? 'vivid' : 'classic')) === group)
                  .map(x => (
                    <button
                      key={x.id}
                      className={'bio-pick' + (cfg.tpl === x.id ? ' on' : '')}
                      onClick={() => pickTpl(x.id)}
                    >
                      <BioThumb tpl={x.id} />
                      <span className="bio-pick-nm">
                        {cfg.tpl === x.id && I.check({ width: 13, height: 13 })} {x.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}

          {/* Customisation section */}
          <div className="bio-sub-t">{t('st_bio_custom')}</div>

          {/* Background swatches */}
          <div className="field">
            <label>{t('st_bio_bg')}</label>
            <div className="bio-swatches">
              {Object.keys(BIO_BGS).map((id) => (
                <button
                  key={id}
                  className={'bio-sw' + (cfg.bg === id ? ' on' : '')}
                  style={{ background: BIO_BGS[id].base }}
                  onClick={() => patchBio({ bg: id })}
                >
                  {cfg.bg === id && <span style={{ color: BIO_BGS[id].ink }}>{I.check({ width: 14, height: 14 })}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdowns */}
          <div className="field-row">
            {!VIBE_LAYOUTS.includes(cfg.layout) && (
              <div className="field">
                <label>{t('st_bio_btn')}</label>
                <select value={cfg.btn} onChange={(e) => patchBio({ btn: e.target.value })}>
                  {[['soft', t('bs_soft')], ['fill', t('bs_fill')], ['outline', t('bs_outline')], ['hard', t('bs_hard')], ['glass', t('bs_glass')]].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label>{t('st_bio_corners')}</label>
              <select value={cfg.radius} onChange={(e) => patchBio({ radius: e.target.value })}>
                {[['square', t('rd_square')], ['round', t('rd_round')], ['pill', t('rd_pill')]].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t('st_bio_font')}</label>
              <select value={cfg.font} onChange={(e) => patchBio({ font: e.target.value })}>
                {FONT_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset + Preview links */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 12 }}>
            <button className="lnk" onClick={resetToTemplate}>
              {I.x({ width: 13, height: 13 })} {t('st_bio_reset')}
            </button>
            {handle && (
              <a href={`/${handle}/link`} target="_blank" rel="noopener noreferrer" className="lnk">
                {I.eye({ width: 14, height: 14 })} {t('st_bio_view')}
              </a>
            )}
          </div>
        </div>

        {/* Live preview — iframe renders the real bio page */}
        {handle && (
          <div className="te-preview-wrap">
            <div className="te-preview-bar">
              <div className="tl"><i /><i /><i /></div>
              <div className="u">labaratory.rastashops.com/{handle}/link</div>
            </div>
            <div className="te-preview">
              <iframe
                ref={iframeRef}
                key={previewKey}
                src={`/${handle}/link`}
                title="Bio preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {saving && <span style={{ fontSize: 12, color: '#888' }}>{t('loading')}</span>}
    </div>
  );
}
