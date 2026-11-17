import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { t, fill, fmtPrice } from '../../i18n';
import { I } from '../ui/Icons';
import { rqLink, rqUnits, rqMessage, rqCopy, byItemsLabel } from './rq';

// design-src/Orders.jsx RequestSentSheet — shown to the buyer right after "Send request".
// Opens Telegram (or WhatsApp when the shop only has a phone) with the message typed.
export default function RequestSentSheet({ req, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const link = 'https://' + rqLink(req.code);
  const msg = rqMessage(req);
  const tg = String(req.shopTelegram || '').replace(/^@/, '');
  const wa = String(req.shopPhone || '').replace(/\D/g, '');
  const [copied, setCopied] = useState(false);
  const btn = { justifyContent: 'center', textDecoration: 'none', height: 50, fontSize: 16 };

  return ReactDOM.createPortal(
    <div className="co-scrim" onClick={onClose}>
      <div className="co-sheet scroll-y" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 470 }} role="dialog" aria-label={t('rq_sent_t')}>
        <div className="co-head">
          <div><b>{t('rq_sent_t')}</b><span>{req.shopName}</span></div>
          <button type="button" className="cw-x" onClick={onClose} aria-label={t('g_close')}>{I.x({ width: 17, height: 17 })}</button>
        </div>
        <div className="co-body">
          <p style={{ marginTop: 0 }}>{fill(t('rq_sent_d'), { s: req.shopName })}</p>
          <div style={{ textAlign: 'center', padding: '18px 12px', borderRadius: 16, background: 'var(--paper,#f4efe7)', margin: '6px 0 14px' }}>
            <small style={{ display: 'block', opacity: 0.7, fontWeight: 600 }}>{t('rq_code')}</small>
            <b style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: 34, letterSpacing: '.14em', margin: '4px 0' }}>{req.code}</b>
            <span style={{ fontSize: 13, opacity: 0.75 }}>{rqLink(req.code)} · {byItemsLabel(rqUnits(req))} · {fmtPrice(req.total)}</span>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {tg ? (
              <a className="btn btn-accent" style={btn} target="_blank" rel="noreferrer"
                href={'https://t.me/' + tg + '?text=' + encodeURIComponent(msg)} onClick={() => rqCopy(msg)}>
                {I.tg({ width: 18, height: 18 })} {fill(t('rq_send_to'), { s: '@' + tg })}
              </a>
            ) : wa ? (
              <a className="btn btn-accent" style={btn} target="_blank" rel="noreferrer"
                href={'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg)} onClick={() => rqCopy(msg)}>
                {I.wa({ width: 18, height: 18 })} {fill(t('rq_send_to'), { s: req.shopName })}
              </a>
            ) : (
              <a className="btn btn-accent" style={btn} target="_blank" rel="noreferrer"
                href={'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(msg.replace(link, '').trim())}>
                {I.tg({ width: 18, height: 18 })} {t('rq_send_tg')}
              </a>
            )}
            {tg && <p className="hint" style={{ margin: '2px 0 4px', textAlign: 'center' }}>{t('rq_send_hint')}</p>}
            <button type="button" className="lnk" style={{ justifySelf: 'center' }} onClick={() => { rqCopy(msg); setCopied(true); }}>
              {copied ? I.check({ width: 14, height: 14 }) : I.copy({ width: 14, height: 14 })} {copied ? t('rq_copied') : t('rq_copy')}
            </button>
          </div>
          <p className="hint" style={{ marginTop: 12 }}>{t('rq_next')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
