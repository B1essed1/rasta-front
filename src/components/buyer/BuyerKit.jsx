import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { t } from '../../i18n';
import './buyer-parts.css';

// Icons used only on the buyer side (design BuyerProfile.jsx EZ_I).
export const EZ_I = {
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m12 3.8 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7L12 3.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8"/></svg>,
  gear: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

export function buyerInitials(name) {
  const n = (name || '').trim();
  if (n) return n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return 'R';
}

export function shopTypeLabel(type) {
  if (!type) return '';
  const k = 'type_' + String(type).toLowerCase();
  const v = t(k);
  return v === k ? type : v;
}

// Shop avatar: the logo when there is one, else the initials on the shop colour.
export function ShopAv({ shop, size = 40 }) {
  const st = { width: size, height: size };
  if (shop.logoUrl) return <span className="by-sav" style={{ ...st, backgroundImage: `url(${shop.logoUrl})` }} />;
  return (
    <span className="by-sav ini" style={{ ...st, background: shop.coverColor || 'var(--ink)', fontSize: Math.round(size * 0.36) }}>
      {shop.initials || (shop.name || '?').slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Stars({ value = 0, size }) {
  return (
    <div className="by-stars" style={size ? { '--st': size + 'px' } : undefined}>
      {[1, 2, 3, 4, 5].map((k) => <span key={k} className={k <= value ? 'on' : ''}>{'★'}</span>)}
    </div>
  );
}

export function useBigText() {
  const [on, setOn] = useState(() => localStorage.getItem('rasta.bigtext') === '1');
  useEffect(() => {
    document.documentElement.classList.toggle('ez-big', on);
    localStorage.setItem('rasta.bigtext', on ? '1' : '0');
  }, [on]);
  return [on, setOn];
}

export function EzConfirm({ text, yes, no, onYes, onNo }) {
  return ReactDOM.createPortal(
    <div className="ez-dlg-scrim" onClick={onNo}>
      <div className="ez-dlg" onClick={(e) => e.stopPropagation()} role="alertdialog">
        <b>{text}</b>
        <button className="by-btn danger" onClick={onYes}>{yes}</button>
        <button className="by-btn ghost" onClick={onNo}>{no}</button>
      </div>
    </div>,
    document.body
  );
}
