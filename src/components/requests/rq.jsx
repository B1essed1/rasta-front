import React from 'react';
import { t, fill, fmtPrice } from '../../i18n';

// Shared helpers for the request flow (design-src/Orders.jsx: rqLink, rqUnits,
// rqMessage, RqPill). A Request is what the API returns from /requests.
const RQ_PILL = {
  new: ['#fde7e2', '#b83f28'],
  agreed: ['#e6edf8', '#2f5ea8'],
  sold: ['#e2f3ea', '#1f7a4d'],
  cancelled: ['#f1efe9', '#5c564c'],
};

export const rqLink = (code) => 'rastashops.com/b/' + code;
export const rqUnits = (r) => (r.lines || []).reduce((n, l) => n + l.qty, 0);
export const rqMessage = (req) =>
  fill(t('rq_msg'), { n: rqUnits(req), sum: fmtPrice(req.total), link: 'https://' + rqLink(req.code) });

export function rqCopy(text) {
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  } catch (e) {
    /* clipboard unavailable */
  }
}

export function RqPill({ s }) {
  const c = RQ_PILL[s] || RQ_PILL.new;
  return (
    <span
      style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12.5,
        fontWeight: 700, background: c[0], color: c[1], whiteSpace: 'nowrap',
      }}
    >
      {t('rq_s_' + s)}
    </span>
  );
}

export const fmtNum = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/[, ]/g, ' ');

export function fmtDay(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export const PAY_METHODS = {
  cash: { en: 'Cash', ru: 'Наличные', uz: 'Naqd' },
  payme: { en: 'Payme', ru: 'Payme', uz: 'Payme' },
  click: { en: 'Click', ru: 'Click', uz: 'Click' },
  uzcard: { en: 'Uzcard', ru: 'Uzcard', uz: 'Uzcard' },
  transfer: { en: 'Transfer', ru: 'Перевод', uz: 'O‘tkazma' },
};

export const byItemsLabel = (n) => (n === 1 ? t('by_item_1') : fill(t('by_items_n'), { n }));
