// Globals the prototype got from <script> tags (React UMD builds) and from prototype-only tooling.
import React from 'react';
import { createPortal, flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';

window.React = React;
// The UMD ReactDOM global carried both react-dom (createPortal) and react-dom/client (createRoot).
window.ReactDOM = { createPortal, flushSync, createRoot, hydrateRoot };

// The prototype's Tweaks panel (tweaks-panel.jsx / Tweaks.jsx) is not shipped, but on load it set these
// CSS variables on <html> with its default values, so the look depends on them. Applied once, same values.
const root = document.documentElement.style;
const primary = '#E4573B', accent = '#e09a36', paper = '#f6f3ee';
Object.entries({
  '--primary': primary,
  '--primary-700': `color-mix(in oklab, ${primary} 76%, black)`,
  '--primary-tint': `color-mix(in oklab, ${primary} 11%, ${paper})`,
  '--saffron': accent,
  '--saffron-tint': `color-mix(in oklab, ${accent} 16%, white)`,
  '--radius': '16px', '--radius-sm': '11px', '--radius-lg': '24px',
  '--paper': paper, '--ink': '#1b1714', '--ink-2': '#41382f',
  '--soft': '#6f655a', '--faint': '#9a9085', '--line': '#e7e0d5', '--line-2': '#efe9df',
}).forEach(([k, v]) => root.setProperty(k, v));

