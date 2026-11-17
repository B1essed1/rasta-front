import React, { useState, useEffect, useMemo } from 'react';
import { t, fill, fmtPrice, getLang, onLangChange } from '../../i18n';
import { I } from '../../components/ui/Icons';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/ToastHost';
import { useShopStore } from '../../store/shopStore';
import {
  RqPill, rqLink, rqUnits, rqCopy, fmtNum, fmtDay, fmtTime, PAY_METHODS,
} from '../../components/requests/rq';

// design-src/Orders.jsx RequestSellModal
function RequestSellModal({ shop, req, onClose }) {
  const lang = getLang();
  const sellRequest = useShopStore((s) => s.sellRequest);
  const pays = useMemo(() => {
    const ids = String(shop?.acceptedPayments || '').split(',').map((x) => x.trim()).filter(Boolean);
    return ids.length ? ids : ['cash'];
  }, [shop]);
  const [sum, setSum] = useState(String(req.finalTotal || req.total));
  const [pay, setPay] = useState(pays[0]);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await sellRequest(req.id, Number(sum), pay);
      toast(t('rq_sold_toast'));
      onClose();
    } catch (e) {
      toast(e.serverMessage || 'Error', 'error');
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      title={t('rq_sell_t')}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>{t('g_cancel')}</button>
          <div className="mf-right">
            <button type="button" className="btn btn-accent btn-sm" disabled={busy || !(Number(sum) > 0)} onClick={submit}>
              {I.check({ width: 16, height: 16 })} {t('rq_s_sold')} · {fmtPrice(Number(sum) || 0)}
            </button>
          </div>
        </>
      }
    >
      <p style={{ marginTop: 0, color: 'var(--soft)' }}>{t('rq_sell_d')}</p>
      <div className="field">
        <label>{t('rq_final')}</label>
        <input inputMode="numeric" value={sum} onChange={(e) => setSum(e.target.value.replace(/\D/g, ''))} autoFocus />
        <div className="hint">{t('rq_total')}: {fmtPrice(req.total)}</div>
      </div>
      <div className="field">
        <label>{t('sc_payment')}</label>
        <div className="chip-row">
          {pays.map((id) => (
            <button type="button" key={id} className={'pick-chip' + (pay === id ? ' on' : '')} onClick={() => setPay(id)}>
              {PAY_METHODS[id] ? PAY_METHODS[id][lang] : id}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

const COLS = '96px minmax(180px,1.6fr) 70px 130px 130px 140px 36px';

// design-src/Orders.jsx RequestsView
export default function RequestsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const list = useShopStore((s) => s.requests);
  const products = useShopStore((s) => s.products);
  const fetchRequests = useShopStore((s) => s.fetchRequests);
  const setRequestStatus = useShopStore((s) => s.setRequestStatus);
  const [filter, setFilter] = useState('open');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [sell, setSell] = useState(null);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    if (shop?.id) fetchRequests();
  }, [shop?.id, fetchRequests]);

  const idx = useMemo(() => {
    const m = {};
    (products || []).forEach((p) => (p.variants || []).forEach((v) => { m[v.id] = { p, v }; }));
    return m;
  }, [products]);

  const isLive = (r) => r.status === 'new' || r.status === 'agreed';
  const qn = q.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const shown = list.filter(
    (r) =>
      (filter === 'all' || (filter === 'open' ? isLive(r) : r.status === filter)) &&
      (!qn || r.code.includes(qn))
  );
  useEffect(() => {
    if (qn.length >= 4 && shown.length === 1) setOpen(shown[0].id);
  }, [qn, shown.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const cnt = (k) =>
    k === 'all' ? list.length : k === 'open' ? list.filter(isLive).length : list.filter((r) => r.status === k).length;

  async function changeStatus(r, status, msg) {
    try {
      await setRequestStatus(r.id, status);
      toast(t(msg));
    } catch (e) {
      toast(e.serverMessage || 'Error', 'error');
    }
  }

  const heads = [t('rq_code'), t('rq_buyer'), t('hc_qty'), t('hc_sum'), t('rq_status'), t('hc_date'), ''];
  const filters = [
    ['open', t('rq_open')], ['new', t('rq_s_new')], ['agreed', t('rq_s_agreed')],
    ['sold', t('rq_s_sold')], ['cancelled', t('rq_s_cancelled')], ['all', t('rq_all')],
  ];

  return (
    <div>
      <div className="db-sec-head">
        <div><h2>{t('rq_title')}</h2><div className="sub">{t('rq_sub')}</div></div>
      </div>
      <div className="inv-bar">
        <div className="inline-search grow">
          {I.search({ width: 17, height: 17 })}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('rq_find')} />
        </div>
      </div>
      <div className="chip-row" style={{ margin: '10px 0 14px' }}>
        {filters.map(([k, l]) => (
          <button type="button" key={k} className={'pick-chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>
            {l} <i>{cnt(k)}</i>
          </button>
        ))}
      </div>

      {!list.length ? (
        <EmptyState icon={I.bag({ width: 28, height: 28 })} title={t('rq_empty_t')} description={t('rq_empty_d')} />
      ) : !shown.length ? (
        <div className="stk-empty card">{t('rq_none')}</div>
      ) : (
        <div className="stock-table" style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 780 }}>
            <div className="stk-head" style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center' }}>
              {heads.map((h, i) => (
                <span key={i} style={{ textAlign: i === 2 || i === 3 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</span>
              ))}
            </div>
            {shown.map((r) => {
              const isOpen = open === r.id;
              const live = isLive(r);
              return (
                <React.Fragment key={r.id}>
                  <div
                    className="stk-row" role="button" tabIndex={0} aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : r.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setOpen(isOpen ? null : r.id); }}
                    style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', cursor: 'pointer', background: isOpen ? 'var(--paper)' : undefined }}
                  >
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: '.06em' }}>{r.code}</span>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <b>{r.buyerName || t('rq_guest')}</b>
                      {r.buyerPhone && <span style={{ color: 'var(--soft)' }}> · {r.buyerPhone}</span>}
                    </span>
                    <span style={{ textAlign: 'right', fontWeight: 700 }}>{rqUnits(r)}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtNum(r.finalTotal || r.total)}</span>
                    <span><RqPill s={r.status} /></span>
                    <span style={{ whiteSpace: 'nowrap' }}>
                      <b>{fmtDay(r.createdAt)}</b> <span style={{ color: 'var(--soft)' }}>{fmtTime(r.createdAt)}</span>
                    </span>
                    <span style={{ color: 'var(--soft)', display: 'flex', justifyContent: 'center' }}>
                      {isOpen ? I.minus({ width: 15, height: 15 }) : I.plus({ width: 15, height: 15 })}
                    </span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '6px 16px 16px', background: 'var(--paper)', borderBottom: '1px solid var(--line-2)' }}>
                      {(r.lines || []).map((l) => {
                        const x = idx[l.variantId];
                        const avail = x ? x.v.qty : 0;
                        const img = x && x.p.images && x.p.images[0];
                        return (
                          <div key={l.variantId} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,2fr) 130px 120px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--line-2)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              <span className="stk-photo">
                                {img ? <img src={img.thumbnailUrl || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                              </span>
                              <span className="stk-name" style={{ minWidth: 0 }}>
                                <b>{l.name}</b>
                                <span>
                                  {l.label && l.label !== 'default' ? l.label : ''}
                                  {live && (!x
                                    ? <em style={{ color: '#b83f28', fontStyle: 'normal' }}> · {t('rq_gone')}</em>
                                    : avail < l.qty
                                      ? <em style={{ color: '#b83f28', fontStyle: 'normal' }}> · {fill(t('rq_left'), { n: Math.max(0, avail) })}</em>
                                      : null)}
                                </span>
                              </span>
                            </span>
                            <span style={{ textAlign: 'right' }}>{l.qty} × {fmtNum(l.unit)}</span>
                            <span style={{ textAlign: 'right', fontWeight: 700 }}>{fmtNum(l.qty * l.unit)}</span>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 16, padding: '10px 0', borderTop: '1px solid var(--line-2)', fontWeight: 700 }}>
                        <span>{t('rq_total')}: {fmtPrice(r.total)}</span>
                        {r.finalTotal ? <span style={{ color: '#1f7a4d' }}>{t('rq_final')}: {fmtPrice(r.finalTotal)}</span> : null}
                        {r.saleNo ? <span>{fill(t('rq_sale_no'), { n: r.saleNo })}</span> : null}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                        {r.status === 'new' && (
                          <button type="button" className="btn btn-soft btn-sm" onClick={() => changeStatus(r, 'agreed', 'rq_agreed_toast')}>
                            {I.check({ width: 15, height: 15 })} {t('rq_agree')}
                          </button>
                        )}
                        {live && (
                          <button type="button" className="btn btn-accent btn-sm" onClick={() => setSell(r)}>
                            {I.wallet({ width: 15, height: 15 })} {t('rq_sell')}
                          </button>
                        )}
                        {r.buyerTelegram && (
                          <a className="btn btn-ghost btn-sm" href={'https://t.me/' + String(r.buyerTelegram).replace('@', '')} target="_blank" rel="noreferrer">
                            {I.tg({ width: 15, height: 15 })} {t('rq_reply')}
                          </a>
                        )}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { rqCopy('https://' + rqLink(r.code)); toast(t('rq_copied')); }}>
                          {I.copy({ width: 15, height: 15 })} {t('rq_copy')}
                        </button>
                        {live && (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => changeStatus(r, 'cancelled', 'rq_cancel_toast')}>
                            {t('rq_cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      {sell && <RequestSellModal shop={shop} req={sell} onClose={() => setSell(null)} />}
    </div>
  );
}
