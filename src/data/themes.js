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

export default themes;
