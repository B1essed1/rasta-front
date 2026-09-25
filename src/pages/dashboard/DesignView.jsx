import React, { useState, useEffect } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { themes, getTheme, applyThemeVars } from '../../data/themes';
import { palettes, getPalette, applyPaletteVars } from '../../data/palettes';
import { toast } from '../../components/ui/ToastHost';
import { BIO_BGS, BIO_TPLS, getBioConfig, bioVars } from '../../data/bio';
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
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="design-preview__card"
                  style={{
                    backgroundColor: previewPalette.surface,
                    borderRadius: previewTheme.radius,
                    border: previewTheme.cardBorder,
                    boxShadow: previewTheme.cardShadow,
                  }}
                >
                  <div className="design-preview__card-img" style={{ backgroundColor: previewPalette.line }} />
                  <div className="design-preview__card-body">
                    <div
                      className="design-preview__line"
                      style={{ backgroundColor: previewPalette.ink, opacity: 0.2, width: '70%' }}
                    />
                    <div
                      className="design-preview__line"
                      style={{ backgroundColor: previewPalette.accent, opacity: 0.6, width: '40%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Studio */}
      <BioStudio shopId={shop?.id} handle={shop?.handle} />
    </div>
  );
}

function BioStudio({ shopId, handle }) {
  const [bioJson, setBioJson] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    api.get(`/shops/${shopId}/config`).then((res) => {
      setBioJson(res.data?.bioJson || null);
    }).catch(() => {});
  }, [shopId]);

  const cfg = getBioConfig(bioJson);
  const vars = bioVars(cfg);

  function pickTpl(tplId) {
    const tpl = BIO_TPLS.find((x) => x.id === tplId) || BIO_TPLS[0];
    const newJson = JSON.stringify({ tpl: tplId, bg: tpl.bg, btn: tpl.btn, radius: tpl.radius, font: tpl.font });
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

  async function saveBio(json) {
    if (!shopId) return;
    setSaving(true);
    try {
      await api.put(`/shops/${shopId}/config`, { bioJson: json });
    } catch {}
    setSaving(false);
  }

  const shopData = useShopStore((s) => s.shop);
  const products = useShopStore((s) => s.products);
  const bg = BIO_BGS[cfg.bg];

  function getProductName(p) {
    return p.nameEn || p.nameUz || p.nameRu || '';
  }

  const previewProducts = (products || []).filter((p) => p.visible !== false).slice(0, 4);

  return (
    <div className="set-card" style={{ marginTop: 22 }}>
      <div className="set-title">{t('sh_bio')}</div>
      <div className="hint" style={{ marginTop: -6 }}>{t('sh_bio_d')}</div>
      {handle && (
        <div className="hint" style={{ marginTop: -2 }}>
          <a href={`/${handle}/link`} target="_blank" rel="noopener noreferrer" className="share-url">
            labaratory.rastashops.com/{handle}/link
          </a>
        </div>
      )}

      <div className="theme-editor" style={{ marginTop: 16 }}>
        {/* Controls panel */}
        <div className="te-panel">
          {/* Template picker */}
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t('db_theme')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(94px, 1fr))', gap: 10, marginBottom: 20 }}>
            {BIO_TPLS.map((tpl) => {
              const tplVars = bioVars({ bg: tpl.bg, btn: tpl.btn, radius: tpl.radius, font: tpl.font });
              const isActive = cfg.tpl === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => pickTpl(tpl.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6, padding: 5,
                    borderRadius: 13, border: isActive ? '2px solid var(--primary, #1b1714)' : '2px solid transparent',
                    background: isActive ? '#fff' : '#f1ede6', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    width: '100%', aspectRatio: '4/5', borderRadius: 10,
                    background: tplVars['--b-bg'], padding: '11px 11px 8px', justifyContent: 'center',
                  }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: tplVars['--b-prim'], opacity: 0.9 }} />
                    <span style={{ width: '46%', height: 6, borderRadius: 3, background: tplVars['--b-ink'], opacity: 0.75 }} />
                    <span style={{ width: '100%', height: 12, borderRadius: `calc(${tplVars['--b-r']} / 2.6)`, background: tplVars['--b-prim'] }} />
                    <span style={{ width: '100%', height: 12, borderRadius: `calc(${tplVars['--b-r']} / 2.6)`, background: tplVars['--b-card'] }} />
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 600, paddingBottom: 2 }}>
                    {isActive && I.check({ width: 13, height: 13 })} {tpl.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Background swatches */}
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t('db_accent')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {Object.keys(BIO_BGS).map((id) => (
              <button
                key={id}
                onClick={() => patchBio({ bg: id })}
                style={{
                  width: 34, height: 34, borderRadius: '50%', background: BIO_BGS[id].base,
                  border: cfg.bg === id ? '2px solid #1b1714' : '2px solid rgba(0,0,0,.12)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {cfg.bg === id && <span style={{ color: BIO_BGS[id].ink }}>{I.check({ width: 14, height: 14 })}</span>}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="field-row">
            <div className="field">
              <label>{t('db_font')}</label>
              <select value={cfg.font} onChange={(e) => patchBio({ font: e.target.value })}>
                <option value="soft">Bricolage</option>
                <option value="grotesk">Space Grotesk</option>
                <option value="serif">Serif</option>
                <option value="outfit">Outfit</option>
              </select>
            </div>
            <div className="field">
              <label>Corners</label>
              <select value={cfg.radius} onChange={(e) => patchBio({ radius: e.target.value })}>
                <option value="square">Square</option>
                <option value="round">Rounded</option>
                <option value="pill">Pill</option>
              </select>
            </div>
            <div className="field">
              <label>Buttons</label>
              <select value={cfg.btn} onChange={(e) => patchBio({ btn: e.target.value })}>
                <option value="soft">Soft</option>
                <option value="fill">Filled</option>
                <option value="outline">Outline</option>
                <option value="hard">Bold</option>
                <option value="glass">Glass</option>
              </select>
            </div>
          </div>

          {handle && (
            <div style={{ marginTop: 12 }}>
              <a href={`/${handle}/link`} target="_blank" rel="noopener noreferrer" className="lnk">
                {I.eye({ width: 14, height: 14 })} {t('db_visit')}
              </a>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="te-preview-wrap">
          <div className="te-preview-bar">
            <div className="tl"><i /><i /><i /></div>
            <div className="u">labaratory.rastashops.com/{handle}/link</div>
          </div>
          <div className="te-preview scroll-y">
            <div
              className={`bio-page bio-style-${cfg.btn}${bg.dark ? ' bio-dark' : ''}`}
              style={{ ...vars, minHeight: '100%', padding: '26px 14px 40px' }}
            >
              <div className="bio-card">
                <div className="bio-head">
                  {shopData?.logoUrl ? (
                    <div className="bio-avatar" style={{ width: 64, height: 64 }}>
                      <img src={shopData.logoUrl} alt={shopData?.name} />
                    </div>
                  ) : (
                    <div className="bio-avatar bio-avatar--placeholder" style={{ width: 64, height: 64, background: bg.prim }}>
                      {shopData?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <h1 className="bio-name" style={{ fontSize: 22 }}>{shopData?.name || 'Shop'}</h1>
                  <div className="bio-meta">{shopData?.location || ''}</div>
                </div>
                <div className="bio-links">
                  <div className="bio-btn primary bio-shoplink" style={{ padding: '12px 14px' }}>
                    <span className="bio-btn-tx"><b style={{ fontSize: 14 }}>{t('bio_open_shop')}</b></span>
                    <span className="bio-btn-go">{I.arrow({ width: 14, height: 14 })}</span>
                  </div>
                  {shopData?.instagram && (
                    <div className="bio-btn" style={{ padding: '10px 14px' }}>
                      <span className="bio-btn-tx"><b style={{ fontSize: 13 }}>Instagram</b><i>@{shopData.instagram}</i></span>
                      <span className="bio-btn-go">{I.arrow({ width: 12, height: 12 })}</span>
                    </div>
                  )}
                  {shopData?.telegram && (
                    <div className="bio-btn" style={{ padding: '10px 14px' }}>
                      <span className="bio-btn-tx"><b style={{ fontSize: 13 }}>Telegram</b><i>@{shopData.telegram}</i></span>
                      <span className="bio-btn-go">{I.arrow({ width: 12, height: 12 })}</span>
                    </div>
                  )}
                </div>
                {previewProducts.length > 0 && (
                  <div className="bio-shelf">
                    <div className="bio-shelf-t">{t('bio_featured')}</div>
                    <div className="bio-grid">
                      {previewProducts.slice(0, 2).map((p) => (
                        <div key={p.id} className="bio-prod">
                          <span className="bio-pimg">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={getProductName(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: p.tone || bg.prim, color: '#fff', fontWeight: 700 }}>
                                {getProductName(p).charAt(0)}
                              </span>
                            )}
                          </span>
                          <span className="bio-pname" style={{ fontSize: 11 }}>{getProductName(p)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bio-foot">{t('bio_made')} <b>labaratory.rastashops.com</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saving && <span style={{ fontSize: 12, color: '#888' }}>{t('loading')}</span>}
    </div>
  );
}
