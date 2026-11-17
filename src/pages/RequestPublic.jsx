import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import EmptyState from '../components/ui/EmptyState';
import { I } from '../components/ui/Icons';
import { t, fill, fmtPrice, onLangChange } from '../i18n';
import api from '../api/client';
import { RqPill, fmtNum, fmtDay } from '../components/requests/rq';

// design-src/Orders.jsx RequestPublic — the basket link itself: rastashops.com/b/CODE
export default function RequestPublic() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [req, setReq] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    let alive = true;
    setReq(null);
    setMissing(false);
    api.get(`/requests/${encodeURIComponent(code)}`)
      .then((res) => { if (alive) setReq(res.data); })
      .catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [code]);

  const wrap = { minHeight: '100vh', background: 'var(--paper, #f4efe7)', display: 'flex', flexDirection: 'column' };
  const card = {
    background: '#fff', border: '1px solid var(--line)', borderRadius: 24, boxShadow: 'var(--shadow-lg)',
    padding: 32, width: '100%', maxWidth: 480,
  };

  return (
    <div style={wrap}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
        <div className="brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/')}>
          <Logo size={26} /> <span className="brand-name">rasta<i>shops</i></span>
        </div>
        <LangPill />
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '14px 20px 60px' }}>
        <div style={card}>
          {missing ? (
            <EmptyState icon={I.bag({ width: 28, height: 28 })} title={t('rq_page_none')} />
          ) : !req ? (
            <div style={{ textAlign: 'center', color: 'var(--soft)' }}>{t('loading')}</div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 26, margin: 0 }}>{fill(t('rq_page_t'), { code: req.code })}</h2>
                <p style={{ color: 'var(--soft)', margin: '8px 0 12px' }}>{req.shopName} · {fmtDay(req.createdAt)}</p>
                <RqPill s={req.status} />
              </div>
              <div style={{ margin: '14px 0' }}>
                {(req.lines || []).map((l) => (
                  <div key={l.variantId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid var(--line-2)' }}>
                    <span>
                      <b>{l.name}</b>
                      {l.label && l.label !== 'default' && <span style={{ color: 'var(--soft)' }}> · {l.label}</span>}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>{l.qty} × {fmtNum(l.unit)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--line-2)', fontWeight: 800 }}>
                  <span>{t('rq_total')}</span><span>{fmtPrice(req.total)}</span>
                </div>
                <div className="hint">{t('rq_bk_hint')}</div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <button type="button" className="btn btn-accent" onClick={() => navigate('/dashboard/requests')}>
                  {I.grid({ width: 16, height: 16 })} {t('rq_page_seller')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/' + req.shopHandle)}>
                  {I.store({ width: 16, height: 16 })} {t('rq_page_shop')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
