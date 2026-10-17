export const themes = [
  {
    id: 'minimal',
    nameKey: 'theme_minimal',
    family: "'Hanken Grotesk', sans-serif",
    radius: '10px',
    layout: 'grid',
    cardShadow: 'none',
    cardBorder: '1px solid var(--s-line)',
    headingWeight: 600,
    bodyWeight: 400,
    preview: {
      bg: '#fafaf8',
      surface: '#ffffff',
      ink: '#1a1a1a',
      accent: '#1b6b5a',
    },
  },
  {
    id: 'boutique',
    nameKey: 'theme_boutique',
    family: "'Instrument Serif', serif",
    bodyFamily: "'Newsreader', serif",
    radius: '3px',
    layout: 'magazine',
    cardShadow: 'none',
    cardBorder: '1px solid var(--s-line)',
    headingWeight: 400,
    bodyWeight: 300,
    preview: {
      bg: '#faf8f5',
      surface: '#ffffff',
      ink: '#2c2420',
      accent: '#8b6b4a',
    },
  },
  {
    id: 'bold',
    nameKey: 'theme_bold',
    family: "'Space Grotesk', sans-serif",
    radius: '4px',
    layout: 'list',
    cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cardBorder: 'none',
    headingWeight: 700,
    bodyWeight: 400,
    preview: {
      bg: '#f0f0f0',
      surface: '#ffffff',
      ink: '#111111',
      accent: '#e63946',
    },
  },
  {
    id: 'playful',
    nameKey: 'theme_playful',
    family: "'Outfit', sans-serif",
    radius: '20px',
    layout: 'grid',
    cardShadow: '0 4px 16px rgba(0,0,0,0.06)',
    cardBorder: 'none',
    headingWeight: 600,
    bodyWeight: 400,
    preview: {
      bg: '#fef6f0',
      surface: '#ffffff',
      ink: '#2d2d2d',
      accent: '#e07a5f',
    },
  },
];

export function getTheme(id) {
  return themes.find((t) => t.id === id) || themes[0];
}

export function applyThemeVars(theme) {
  return {
    '--t-font': theme.family,
    '--t-body-font': theme.bodyFamily || theme.family,
    '--t-radius': theme.radius,
    '--t-card-shadow': theme.cardShadow,
    '--t-card-border': theme.cardBorder,
    '--t-heading-weight': theme.headingWeight,
    '--t-body-weight': theme.bodyWeight,
  };
}

// The storefront's --s-* design tokens per theme (design-src data.jsx THEMES).
const STOREFRONT_VARS = {
  minimal: {
    '--s-radius': '10px', '--s-radius-sm': '7px', '--s-shadow': '0 1px 2px rgba(20,18,15,.05)',
    '--s-font-display': "'Hanken Grotesk', sans-serif", '--s-font-body': "'Hanken Grotesk', sans-serif",
    '--s-display-weight': '650', '--s-display-spacing': '-0.02em', '--s-up': '0.08em', '--s-up-tt': 'uppercase',
  },
  boutique: {
    '--s-radius': '3px', '--s-radius-sm': '2px', '--s-shadow': '0 2px 18px rgba(20,18,15,.07)',
    '--s-font-display': "'Instrument Serif', serif", '--s-font-body': "'Newsreader', serif",
    '--s-display-weight': '400', '--s-display-spacing': '0em', '--s-up': '0.18em', '--s-up-tt': 'uppercase',
  },
  bold: {
    '--s-radius': '4px', '--s-radius-sm': '3px', '--s-shadow': 'none',
    '--s-font-display': "'Space Grotesk', sans-serif", '--s-font-body': "'Space Grotesk', sans-serif",
    '--s-display-weight': '600', '--s-display-spacing': '-0.03em', '--s-up': '0.06em', '--s-up-tt': 'uppercase',
  },
  playful: {
    '--s-radius': '20px', '--s-radius-sm': '13px', '--s-shadow': '0 8px 22px rgba(20,18,15,.08)',
    '--s-font-display': "'Outfit', sans-serif", '--s-font-body': "'Outfit', sans-serif",
    '--s-display-weight': '650', '--s-display-spacing': '-0.02em', '--s-up': '0.04em', '--s-up-tt': 'none',
  },
};

// Font ids saved by DesignView (shopConfig.font) → display/body families.
const STOREFRONT_FONTS = {
  hanken: ["'Hanken Grotesk', sans-serif", "'Hanken Grotesk', sans-serif"],
  instrument: ["'Instrument Serif', serif", "'Newsreader', serif"],
  newsreader: ["'Newsreader', serif", "'Newsreader', serif"],
  outfit: ["'Outfit', sans-serif", "'Outfit', sans-serif"],
  space: ["'Space Grotesk', sans-serif", "'Space Grotesk', sans-serif"],
};

export function storefrontVars(themeId, fontId) {
  const vars = { ...(STOREFRONT_VARS[themeId] || STOREFRONT_VARS.minimal) };
  const f = STOREFRONT_FONTS[fontId];
  if (f) { vars['--s-font-display'] = f[0]; vars['--s-font-body'] = f[1]; }
  return vars;
}

export default themes;
