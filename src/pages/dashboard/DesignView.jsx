import React, { useState, useEffect } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { themes, getTheme, applyThemeVars } from '../../data/themes';
import { palettes, getPalette, applyPaletteVars } from '../../data/palettes';
import { toast } from '../../components/ui/ToastHost';

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
                <span style={{ color: previewPalette.soft }}>rasta.uz/{shop?.handle || 'myshop'}</span>
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
    </div>
  );
}
