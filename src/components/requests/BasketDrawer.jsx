import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { t, fill, fmtPrice, onLangChange } from '../../i18n';
import { I } from '../ui/Icons';
import { toast } from '../ui/ToastHost';
import api from '../../api/client';
import useBasketStore from '../../store/basketStore';
import { byItemsLabel } from './rq';
import { shopMeta } from './basketShops';
import RequestSentSheet from './RequestSentSheet';

// design-src/BuyerCart.jsx — basket drawer in "requests" mode: one basket per shop,
// "Send request" posts it to the shop and shows the basket link + code.
// Opened by the window event 'rasta-open-basket'.

function ByQty({ value, onChange }) {
  return (
    <div className="by-qty">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="−">
        {value <= 1 ? I.trash({ width: 18, height: 18 }) : I.minus({ width: 18, height: 18 })}
      </button>
      <b>{value}</b>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="+">
        {I.plus({ width: 18, height: 18 })}
      </button>
    </div>
  );
}

function ShopAv({ shop, size }) {
  return (
    <span className="by-sav" style={{ width: size, height: size, backgroundImage: shop.logoUrl ? 'url(' + shop.logoUrl + ')' : undefined }} />
  );
}

function BasketLine({ it, onQty }) {
  return (
    <div className="by-bl">
      <span className="by-bl-img" />
      <div className="by-bl-m">
        <b>{it.name}</b>
        {it.label && it.label !== 'default' && <span>{it.label}</span>}
        <em>{fmtPrice(it.unitPrice)}</em>
      </div>
      <div className="by-bl-r">
        <b>{fmtPrice(it.unitPrice * it.qty)}</b>
        <ByQty value={it.qty} onChange={(q) => onQty(it.variantId, q)} />
      </div>
    </div>
  );
}

const sub = (lines) => lines.reduce((n, l) => n + l.qty * l.unitPrice, 0);
const units = (lines) => lines.reduce((n, l) => n + l.qty, 0);

export default function BasketDrawer() {
  const [, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(null);
  const [sent, setSent] = useState(null);
  const [ask, setAsk] = useState(null);
  const baskets = useBasketStore((s) => s.baskets);
  const setQty = useBasketStore((s) => s.setQty);
  const clear = useBasketStore((s) => s.clear);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('rasta-open-basket', on);
    return () => window.removeEventListener('rasta-open-basket', on);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape' && !ask) setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, ask]);

  const list = Object.entries(baskets)
    .map(([shopId, lines]) => ({ shopId, lines: lines || [], shop: shopMeta(shopId) }))
    .filter((b) => b.lines.length);
  const total = list.reduce((n, b) => n + sub(b.lines), 0);
  const items = list.reduce((n, b) => n + units(b.lines), 0);

  async function send(b) {
    const lines = b.lines.filter((l) => l.variantId).map((l) => ({ variantId: l.variantId, qty: l.qty }));
    if (!lines.length || sending) return;
    setSending(b.shopId);
    try {
      const res = await api.post(`/shops/${b.shopId}/requests`, { lines });
      clear(b.shopId);
      setOpen(false);
      setSent(res.data);
    } catch (e) {
      toast(e.serverMessage || 'Error', 'error');
    }
    setSending(null);
  }

  return (
    <>
      {open && ReactDOM.createPortal(
        <div className="by by-od scroll-y" role="dialog" aria-label={t('by_bk_t')}>
          <header className="by-top">
            <button type="button" className="by-back" onClick={() => setOpen(false)}>
              {I.back({ width: 20, height: 20 })}<span>{t('by_back_shop')}</span>
            </button>
            <div className="by-od-title"><b>{t('by_bk_t')}</b><span>{items ? byItemsLabel(items) : ''}</span></div>
            <div className="by-top-r" />
          </header>
          {list.length === 0 ? (
            <div className="by-od-wrap one">
              <div className="by-empty big">
                <span className="by-empty-ic">{I.bag({ width: 32, height: 32 })}</span>
                <b>{t('by_bk_empty')}</b>
                <p>{t('by_bk_empty_d')}</p>
                <button type="button" className="by-btn primary" onClick={() => setOpen(false)}>{t('by_keep')}</button>
              </div>
            </div>
          ) : (
            <div className="by-od-wrap">
              <div className="by-od-main">
                <p className="by-bk-note">{I.store({ width: 18, height: 18 })} {t('rq_bk_note')}</p>
                {list.map((b) => (
                  <section key={b.shopId} className="by-card by-bk">
                    <div className="by-bk-h">
                      <ShopAv shop={b.shop} size={44} />
                      <button type="button" className="by-bk-id"
                        onClick={() => { if (b.shop.handle) window.location.assign('/' + b.shop.handle); }}>
                        <b>{b.shop.name}</b><span>{t('rq_bk_hint')}</span>
                      </button>
                      <button type="button" className="by-btn sm ghost" onClick={() => setAsk(b)}>{t('bk_clear')}</button>
                    </div>
                    <div className="by-bk-lines">
                      {b.lines.map((it) => (
                        <BasketLine key={it.variantId} it={it} onQty={(vid, q) => setQty(b.shopId, vid, q)} />
                      ))}
                    </div>
                    <div className="by-bk-f">
                      <div><span>{byItemsLabel(units(b.lines))}</span><b>{fmtPrice(sub(b.lines))}</b></div>
                      <button type="button" className="by-btn primary" disabled={sending === b.shopId} onClick={() => send(b)}>
                        {I.tg({ width: 18, height: 18 })} {fill(t('rq_send'), { s: b.shop.name })}
                      </button>
                    </div>
                  </section>
                ))}
              </div>
              <aside className="by-od-side">
                <section className="by-card by-bk-tot">
                  <h2 className="by-card-t">{t('by_bk_all')}</h2>
                  {list.map((b) => (
                    <div key={b.shopId} className="by-bk-tr"><span>{b.shop.name}</span><b>{fmtPrice(sub(b.lines))}</b></div>
                  ))}
                  <div className="by-bk-tr tot"><span>{t('by_total')}</span><b>{fmtPrice(total)}</b></div>
                  <p className="by-hint">{t('rq_next')}</p>
                </section>
              </aside>
            </div>
          )}
          {ask && (
            <div className="ez-dlg-scrim" onClick={() => setAsk(null)}>
              <div className="ez-dlg" onClick={(e) => e.stopPropagation()} role="alertdialog">
                <b>{fill(t('by_bk_clear_q'), { s: ask.shop.name })}</b>
                <button type="button" className="ez-btn danger" onClick={() => { clear(ask.shopId); setAsk(null); }}>{t('by_bk_clear')}</button>
                <button type="button" className="ez-btn ghost" onClick={() => setAsk(null)}>{t('by_no')}</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
      {sent && <RequestSentSheet req={sent} onClose={() => setSent(null)} />}
    </>
  );
}
