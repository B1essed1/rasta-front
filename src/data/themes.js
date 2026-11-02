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
  // Signature themes
  {
    id: 'brutal', signature: true, nameKey: 'th_brutal', name: 'Brutal',
    family: "'Unbounded', sans-serif", bodyFamily: "'Space Grotesk', sans-serif",
    radius: '0px', radiusSm: '0px', shadow: 'none', weight: '800', spacing: '-0.02em',
    layout: 'grid', defaultPalette: 'acid',
    cardShadow: 'none', cardBorder: '2px solid var(--s-ink)', headingWeight: 800, bodyWeight: 400,
    preview: { surface: '#f2f0e6', ink: '#0d0d0d', accent: '#ffe600' },
  },
  {
    id: 'suzani', signature: true, nameKey: 'th_suzani', name: 'Suzani',
    family: "'Instrument Serif', serif", bodyFamily: "'Newsreader', serif",
    radius: '14px', radiusSm: '10px', shadow: 'none', weight: '400', spacing: '0em',
    layout: 'grid', defaultPalette: 'indigo',
    cardShadow: 'none', cardBorder: '1px solid var(--s-line)', headingWeight: 400, bodyWeight: 300,
    preview: { surface: '#26225e', ink: '#fbf1dc', accent: '#f0b03f' },
  },
  {
    id: 'aurora', signature: true, nameKey: 'th_aurora', name: 'Aurora',
    family: "'Outfit', sans-serif", bodyFamily: "'Outfit', sans-serif",
    radius: '22px', radiusSm: '14px', shadow: 'none', weight: '700', spacing: '-0.02em',
    layout: 'gallery', defaultPalette: 'nebula',
    cardShadow: '0 8px 22px rgba(20,18,15,.08)', cardBorder: 'none', headingWeight: 700, bodyWeight: 400,
    preview: { surface: '#1e1640', ink: '#ffffff', accent: '#ff5fb8' },
  },
  {
    id: 'vogue', signature: true, nameKey: 'th_vogue', name: 'Cover story',
    family: "'Anton', sans-serif", bodyFamily: "'Hanken Grotesk', sans-serif",
    radius: '0px', radiusSm: '0px', shadow: 'none', weight: '400', spacing: '0em',
    layout: 'magazine', defaultPalette: 'press',
    cardShadow: 'none', cardBorder: '1px solid var(--s-line)', headingWeight: 400, bodyWeight: 400,
    preview: { surface: '#ffffff', ink: '#111111', accent: '#e5202e' },
  },
  {
    id: 'craft', signature: true, nameKey: 'th_craft', name: 'Scrapbook',
    family: "'Caveat', cursive", bodyFamily: "'Hanken Grotesk', sans-serif",
    radius: '4px', radiusSm: '3px', shadow: '0 8px 18px rgba(0,0,0,.14)', weight: '700', spacing: '0em',
    layout: 'grid', defaultPalette: 'kraft',
    cardShadow: '0 8px 18px rgba(0,0,0,.14)', cardBorder: 'none', headingWeight: 700, bodyWeight: 400,
    preview: { surface: '#fffaf0', ink: '#2b2218', accent: '#d63a3a' },
  },
  {
    id: 'retro', signature: true, nameKey: 'th_retro', name: 'Desktop 98',
    family: "'VT323', monospace", bodyFamily: "'Space Mono', monospace",
    radius: '0px', radiusSm: '0px', shadow: 'none', weight: '400', spacing: '0em',
    layout: 'grid', defaultPalette: 'teal98',
    cardShadow: 'none', cardBorder: '2px solid var(--s-ink)', headingWeight: 400, bodyWeight: 400,
    preview: { surface: '#c0c0c0', ink: '#000000', accent: '#000080' },
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
  brutal: {
    '--s-radius': '0px', '--s-radius-sm': '0px', '--s-shadow': 'none',
    '--s-font-display': "'Unbounded', sans-serif", '--s-font-body': "'Space Grotesk', sans-serif",
    '--s-display-weight': '800', '--s-display-spacing': '-0.02em', '--s-up': '0em', '--s-up-tt': 'uppercase',
  },
  suzani: {
    '--s-radius': '14px', '--s-radius-sm': '10px', '--s-shadow': 'none',
    '--s-font-display': "'Instrument Serif', serif", '--s-font-body': "'Newsreader', serif",
    '--s-display-weight': '400', '--s-display-spacing': '0em', '--s-up': '0.08em', '--s-up-tt': 'none',
  },
  aurora: {
    '--s-radius': '22px', '--s-radius-sm': '14px', '--s-shadow': 'none',
    '--s-font-display': "'Outfit', sans-serif", '--s-font-body': "'Outfit', sans-serif",
    '--s-display-weight': '700', '--s-display-spacing': '-0.02em', '--s-up': '0em', '--s-up-tt': 'none',
  },
  vogue: {
    '--s-radius': '0px', '--s-radius-sm': '0px', '--s-shadow': 'none',
    '--s-font-display': "'Anton', sans-serif", '--s-font-body': "'Hanken Grotesk', sans-serif",
    '--s-display-weight': '400', '--s-display-spacing': '0em', '--s-up': '0em', '--s-up-tt': 'uppercase',
  },
  craft: {
    '--s-radius': '4px', '--s-radius-sm': '3px', '--s-shadow': '0 8px 18px rgba(0,0,0,.14)',
    '--s-font-display': "'Caveat', cursive", '--s-font-body': "'Hanken Grotesk', sans-serif",
    '--s-display-weight': '700', '--s-display-spacing': '0em', '--s-up': '0em', '--s-up-tt': 'none',
  },
  retro: {
    '--s-radius': '0px', '--s-radius-sm': '0px', '--s-shadow': 'none',
    '--s-font-display': "'VT323', monospace", '--s-font-body': "'Space Mono', monospace",
    '--s-display-weight': '400', '--s-display-spacing': '0em', '--s-up': '0em', '--s-up-tt': 'none',
  },
};

// Font ids saved by DesignView (shopConfig.font) → display/body families.
const STOREFRONT_FONTS = {
  hanken: ["'Hanken Grotesk', sans-serif", "'Hanken Grotesk', sans-serif"],
  instrument: ["'Instrument Serif', serif", "'Newsreader', serif"],
  newsreader: ["'Newsreader', serif", "'Newsreader', serif"],
  outfit: ["'Outfit', sans-serif", "'Outfit', sans-serif"],
  space: ["'Space Grotesk', sans-serif", "'Space Grotesk', sans-serif"],
  unbounded: ["'Unbounded', sans-serif", "'Space Grotesk', sans-serif"],
  anton: ["'Anton', sans-serif", "'Hanken Grotesk', sans-serif"],
  caveat: ["'Caveat', cursive", "'Hanken Grotesk', sans-serif"],
  vt323: ["'VT323', monospace", "'Space Mono', monospace"],
  spacemono: ["'Space Mono', monospace", "'Space Mono', monospace"],
};

export function storefrontVars(themeId, fontId) {
  const vars = { ...(STOREFRONT_VARS[themeId] || STOREFRONT_VARS.minimal) };
  const f = STOREFRONT_FONTS[fontId];
  if (f) { vars['--s-font-display'] = f[0]; vars['--s-font-body'] = f[1]; }
  return vars;
}

export default themes;
