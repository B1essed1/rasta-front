import React, { useState, useEffect, useRef } from 'react';
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
];

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

  const previewTheme = getTheme(config.themeId);
  const previewPalette = getPalette(config.paletteId);
  const previewFont = fonts.find((f) => f.id === config.fontId) || fonts[0];
  const previewVars = {
    ...applyThemeVars(previewTheme),
    ...applyPaletteVars(previewPalette),
    '--t-font': previewFont.family,
  };

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
        <h1>{t('db_design')}</h1>
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

      <div className="design-view__layout">
        {/* Controls */}
        <div className="design-view__controls">
          {/* Theme */}
          <div className="design-section">
            <h3>{t('db_theme')}</h3>
            <div className="theme-picker">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-picker__btn ${config.themeId === theme.id ? 'theme-picker__btn--active' : ''}`}
                  style={{
                    fontFamily: theme.family,
                    borderRadius: theme.radius,
                    backgroundColor: theme.preview.surface,
                    color: theme.preview.ink,
                  }}
                  onClick={() => setConfig((c) => ({ ...c, themeId: theme.id }))}
                >
                  <div
                    className="theme-picker__dot"
                    style={{ backgroundColor: theme.preview.accent }}
                  />
                  {t(theme.nameKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Palette */}
          <div className="design-section">
            <h3>{t('db_accent')}</h3>
            <div className="palette-picker">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`palette-picker__btn ${config.paletteId === p.id ? 'palette-picker__btn--active' : ''}`}
                  style={{ backgroundColor: p.accent }}
                  title={p.name}
                  onClick={() => setConfig((c) => ({ ...c, paletteId: p.id }))}
                />
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="design-section">
            <h3>{t('db_layout')}</h3>
            <div className="layout-picker">
              {layouts.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`layout-picker__btn ${config.layout === l.id ? 'layout-picker__btn--active' : ''}`}
                  onClick={() => setConfig((c) => ({ ...c, layout: l.id }))}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="design-section">
            <h3>{t('db_font')}</h3>
            <div className="font-picker">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`font-picker__btn ${config.fontId === f.id ? 'font-picker__btn--active' : ''}`}
                  style={{ fontFamily: f.family }}
                  onClick={() => setConfig((c) => ({ ...c, fontId: f.id }))}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="design-view__preview">
          <div className="design-preview" style={previewVars}>
            <div className="design-preview__cover" style={{ backgroundColor: previewPalette.line }} />
            <div className="design-preview__header">
              <div className="design-preview__avatar" style={{ backgroundColor: previewPalette.accent }}>
                {shop?.name?.charAt(0) || 'R'}
              </div>
              <div>
                <h3 style={{ fontFamily: previewFont.family, color: previewPalette.ink }}>
                  {shop?.name || 'My Shop'}
                </h3>
                <span style={{ color: previewPalette.soft }}>labaratory.rastashops.com/{shop?.handle || 'myshop'}</span>
              </div>
            </div>
            <div className={`design-preview__grid design-preview__grid--${config.layout}`}>
              {(products || []).filter(p => p.visible !== false).slice(0, 4).map((p) => {
                const name = p.nameEn || p.nameUz || p.nameRu || '';
                const imgUrl = p.images?.[0]?.thumbnailUrl || p.images?.[0]?.url;
                return (
                  <div
                    key={p.id}
                    className="design-preview__card"
                    style={{
                      backgroundColor: previewPalette.surface,
                      borderRadius: previewTheme.radius,
                      border: previewTheme.cardBorder,
                      boxShadow: previewTheme.cardShadow,
                    }}
                  >
                    <div className="design-preview__card-img" style={{ backgroundColor: p.tone || previewPalette.line }}>
                      {imgUrl && <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div className="design-preview__card-body">
                      <div style={{ fontSize: 11, fontWeight: 600, color: previewPalette.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: previewPalette.accent, marginTop: 2 }}>
                        {fmtPrice(p.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Studio */}
      <BioStudio shopId={shop?.id} handle={shop?.handle} />
    </div>
  );
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
