import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t, fill, getLang, setLang, onLangChange } from '../i18n';
import useBuyerStore from '../store/buyerStore';
import useBasketStore from '../store/basketStore';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/ToastHost';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import { I } from '../components/ui/Icons';
import { TelegramSim } from './Auth';
import { EZ_I, ShopAv, Stars, EzConfirm, useBigText, buyerInitials, shopTypeLabel } from '../components/buyer/BuyerKit';
import '../components/buyer/buyer-parts.css';

const LANGS = [['uz', 'O‘zbekcha'], ['ru', 'Русский'], ['en', 'English']];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

function Empty({ icon, title, desc, onExplore }) {
  return (
    <div className="by-empty">
      <span className="by-empty-ic">{icon({ width: 30, height: 30 })}</span>
      <b>{title}</b>{desc && <p>{desc}</p>}
      <div className="by-acts center">
        <button className="by-btn primary" onClick={onExplore}>{t('by_explore')}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Addresses                                                          */
/* ------------------------------------------------------------------ */
function Addresses({ ask }) {
  const addresses = useBuyerStore((s) => s.addresses);
  const addAddress = useBuyerStore((s) => s.addAddress);
  const deleteAddress = useBuyerStore((s) => s.deleteAddress);
  const setDefaultAddress = useBuyerStore((s) => s.setDefaultAddress);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');

  async function run(fn, msg) {
    try { await fn(); toast(msg, 'success'); } catch { toast('Error', 'error'); }
  }

  return (
    <div className="by-stack">
      {addresses.length === 0 && !adding && (
        <div className="by-empty"><span className="by-empty-ic">{EZ_I.pin({ width: 30, height: 30 })}</span><b>{t('ez_addr_none')}</b><p>{t('ez_addr_none_d')}</p></div>
      )}
      <div className="by-addr-grid">
        {addresses.map((a) => (
          <div key={a.id} className={'by-card by-addr' + (a.isDefault ? ' main' : '')}>
            <div className="by-addr-h"><span className="by-addr-ic">{EZ_I.pin({ width: 20, height: 20 })}</span><b>{a.label || t('co_address')}</b>{a.isDefault && <span className="by-tag">{t('ez_addr_main')}</span>}</div>
            <p>{a.text}</p>
            <div className="by-acts">
              {!a.isDefault && <button className="by-btn sm" onClick={() => run(() => setDefaultAddress(a.id), t('ac_saved'))}>{t('ez_addr_make')}</button>}
              <button className="by-btn sm ghost" onClick={() => ask({ text: t('ez_addr_del_q'), yes: t('ez_yes_del'), go: () => run(() => deleteAddress(a.id), t('ez_addr_deleted')) })}>{t('g_delete')}</button>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="by-card">
          <label className="by-lab" htmlFor="by-al">{t('ez_addr_name')}</label>
          <input id="by-al" className="by-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Uy / Дом / Home" />
          <label className="by-lab" htmlFor="by-at">{t('ez_addr_text')}</label>
          <textarea id="by-at" className="by-input" rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('co_address_ph')}></textarea>
          <div className="by-acts">
            <button className="by-btn primary" disabled={text.trim().length < 6}
              onClick={() => run(async () => { await addAddress({ label: label.trim(), text: text.trim() }); setAdding(false); setLabel(''); setText(''); }, t('ac_saved'))}>
              {t('ez_addr_save')}
            </button>
            <button className="by-btn ghost" onClick={() => setAdding(false)}>{t('g_cancel')}</button>
          </div>
        </div>
      ) : <button className="by-btn dashed" onClick={() => setAdding(true)}>{I.plus({ width: 20, height: 20 })} {t('ez_addr_add')}</button>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const TABS = ['home', 'review', 'fav', 'addr', 'set'];

export default function BuyerProfile() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'home';
  const [ask, setAsk] = useState(null);
  const [showSim, setShowSim] = useState(false);
  const [big, setBig] = useBigText();

  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const profile = useBuyerStore((s) => s.profile);
  const favourites = useBuyerStore((s) => s.favourites);
  const reviews = useBuyerStore((s) => s.reviews);
  const fetchProfile = useBuyerStore((s) => s.fetchProfile);
  const fetchAddresses = useBuyerStore((s) => s.fetchAddresses);
  const fetchFavourites = useBuyerStore((s) => s.fetchFavourites);
  const fetchReviews = useBuyerStore((s) => s.fetchReviews);
  const updateProfile = useBuyerStore((s) => s.updateProfile);
  const toggleFavourite = useBuyerStore((s) => s.toggleFavourite);
  const clearBuyer = useBuyerStore((s) => s.clear);
  const bcount = useBasketStore((s) => Object.values(s.baskets).flat().reduce((n, l) => n + l.qty, 0));

  const [name, setName] = useState('');
  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => {
    if (!token) return;
    fetchProfile(); fetchAddresses(); fetchFavourites(); fetchReviews();
  }, [token]);
  useEffect(() => { setName(profile?.name || ''); }, [profile?.name]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { if (ask) setAsk(null); else back(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const go = (k) => setParams(k === 'home' ? {} : { tab: k });
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/explore'));
  const explore = () => navigate('/explore');
  const lang = getLang();

  const top = (
    <header className="by-top">
      <button className="by-back" onClick={back}>{I.back({ width: 20, height: 20 })}<span>{t('by_back_shop')}</span></button>
      <a className="by-brand" href="/"><Logo size={26} /> <span className="brand-name">rast<i>a</i></span></a>
      <div className="by-top-r">
        <LangPill />
        <button className="by-bag" onClick={() => window.dispatchEvent(new CustomEvent('rasta-open-basket'))} aria-label={t('by_basket')}>
          {I.bag({ width: 22, height: 22 })}{bcount > 0 && <i>{bcount}</i>}
        </button>
      </div>
    </header>
  );

  if (!token) {
    return (
      <div className="by">
        {top}
        <div className="by-guest">
          <div className="by-guest-card">
            <span className="by-guest-ic">{I.tg({ width: 56, height: 56 })}</span>
            <h1>{t('bp_guest_t')}</h1>
            <p>{t('bp_guest_d')}</p>
            <ul className="by-why">
              <li><span>{EZ_I.pin({ width: 20, height: 20 })}</span>{t('bp_b2')}</li>
              <li><span>{I.tg({ width: 20, height: 20 })}</span>{t('bp_b3')}</li>
            </ul>
            <button className="tg-btn" onClick={() => setShowSim(true)}>{I.tg({ width: 20, height: 20 })} {t('tg_btn')}</button>
            <p className="by-help">{t('by_need_help')}</p>
          </div>
        </div>
        {showSim && (
          <TelegramSim
            onClose={() => setShowSim(false)}
            onDone={async (demo) => {
              setShowSim(false);
              toast(t('ac_signedin_toast'), 'success');
              await fetchProfile();
              if (demo?.name && !useBuyerStore.getState().profile?.name) {
                try { await updateProfile({ name: demo.name }); } catch { /* name stays empty */ }
              }
            }}
          />
        )}
      </div>
    );
  }

  const first = (profile?.name || '').split(' ')[0];
  const favs = favourites;
  const nav = [
    ['home', t('by_overview'), I.home, null],
    ['review', t('by_toreview'), EZ_I.star, null],
    ['fav', t('by_fav'), EZ_I.heart, null],
    ['addr', t('by_addr'), EZ_I.pin, null],
    ['set', t('by_settings'), EZ_I.gear, null],
  ];

  async function removeFav(id) {
    try { await toggleFavourite(id); toast(t('fav_removed')); } catch { toast('Error', 'error'); }
  }
  async function saveName() {
    try { await updateProfile({ name: name.trim() }); toast(t('ac_saved'), 'success'); } catch { toast('Error', 'error'); }
  }
  function signOut() {
    logout();
    clearBuyer();
    toast(t('bp_logout'));
    navigate('/');
  }

  return (
    <div className="by">
      {top}
      <div className="by-layout">
        <aside className="by-side">
          <div className="by-me">
            <span className="by-me-av">{buyerInitials(profile?.name)}<i>{I.tg({ width: 22, height: 22 })}</i></span>
            <div className="by-me-m"><b>{profile?.name || t('bp_profile')}</b><span>{profile?.phone}</span><em>{I.check({ width: 13, height: 13 })} {t('by_tg_verified')}</em></div>
          </div>
          <nav className="by-nav" aria-label={t('bp_profile')}>
            {nav.map(([k, lab, ic, badge]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}>
                {ic({ width: 22, height: 22 })}<span>{lab}</span>{badge ? <i>{badge}</i> : null}
              </button>
            ))}
          </nav>
          <p className="by-help">{t('by_need_help')}</p>
        </aside>

        <main className="by-main">
          {tab === 'home' && (
            <>
              <div className="by-hello"><h1>{first ? fill(t('by_hello'), { n: first }) : t('bp_profile')}</h1><p>{t('by_one_account')}</p></div>
              {!favs.length && <Empty icon={EZ_I.heart} title={t('bp_fav_none')} desc={t('bp_fav_none_d')} onExplore={explore} />}
              {favs.length > 0 && (
                <section className="by-sec">
                  <div className="by-sec-h"><h2>{t('by_fav')}</h2><button className="by-link" onClick={() => go('fav')}>{t('by_see_all')} {I.arrow({ width: 16, height: 16 })}</button></div>
                  <div className="by-favrow">{favs.slice(0, 6).map((s) => (
                    <button key={s.id} className="by-favchip" onClick={() => navigate('/' + s.handle)}><ShopAv shop={s} size={48} /><b>{s.name}</b></button>
                  ))}</div>
                </section>
              )}
            </>
          )}

          {tab === 'review' && (
            <>
              <div className="by-page-h"><h1>{t('by_toreview')}</h1><p>{t('by_rate_d')}</p></div>
              <div className="by-calm">{EZ_I.star({ width: 22, height: 22 })}<span><b>{t('by_rv_none_p')}</b> &middot; {t('by_rv_none_pd')}</span></div>
              <div className="by-sec-h" style={{ marginTop: 32 }}><h2>{t('by_reviews')}</h2></div>
              {reviews.length === 0 ? <div className="by-calm">{t('bp_rv_none')}</div> : (
                <div className="by-stack">{reviews.map((r) => (
                  <div key={r.id} className="by-card by-myrv">
                    <span className="by-rate-img"></span>
                    <div className="by-myrv-m">
                      <b>{r.productName || '—'}</b>
                      <span>{r.shopName} &middot; {fmtDate(r.createdAt)}</span>
                      <Stars value={r.rating} size={22} />
                      {r.comment && <p>{r.comment}</p>}
                      <div className="by-acts">
                        <button className="by-btn sm" onClick={() => navigate('/' + r.shopHandle + (r.productId ? '/p/' + r.productId : ''))}>{t('rv_edit')}</button>
                      </div>
                    </div>
                  </div>
                ))}</div>
              )}
            </>
          )}

          {tab === 'fav' && (
            <>
              <div className="by-page-h"><h1>{t('by_fav')}</h1><p>{t('ez_fav_d')}</p></div>
              {!favs.length ? <Empty icon={EZ_I.heart} title={t('bp_fav_none')} desc={t('bp_fav_none_d')} onExplore={explore} /> : (
                <div className="by-fav-grid">{favs.map((s) => (
                  <div key={s.id} className="by-fav">
                    <div className="by-fav-cover" style={{ background: s.coverColor || 'var(--line-2)', backgroundImage: s.coverUrl ? `url(${s.coverUrl})` : undefined }}></div>
                    <div className="by-fav-b">
                      <ShopAv shop={s} size={52} />
                      <b>{s.name}</b><span>{[s.location, shopTypeLabel(s.type)].filter(Boolean).join(' · ')}</span>
                      <div className="by-acts">
                        <button className="by-btn primary" onClick={() => navigate('/' + s.handle)}>{t('by_visit')}</button>
                        <button className="by-btn ghost" onClick={() => removeFav(s.id)}>{t('by_remove')}</button>
                      </div>
                    </div>
                  </div>
                ))}</div>
              )}
            </>
          )}

          {tab === 'addr' && (<><div className="by-page-h"><h1>{t('by_addr')}</h1><p>{t('ez_addr_d')}</p></div><Addresses ask={setAsk} /></>)}

          {tab === 'set' && (
            <>
              <div className="by-page-h"><h1>{t('by_settings')}</h1></div>
              <div className="by-stack">
                <div className="by-card">
                  <label className="by-lab" htmlFor="by-name">{t('ac_name')}</label>
                  <div className="by-inline"><input id="by-name" className="by-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dilnoza R." />
                    <button className="by-btn primary" disabled={name.trim() === (profile?.name || '')} onClick={saveName}>{t('ez_name_save')}</button></div>
                  <p className="by-hint">{t('ac_name_d')}</p>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t('ez_big')}</b><p className="by-hint">{t('ez_big_d')}</p></div>
                  <div className="by-onoff"><button className={!big ? 'on' : ''} onClick={() => setBig(false)}>{t('ez_off')}</button><button className={big ? 'on' : ''} onClick={() => setBig(true)}>{t('ez_on')}</button></div>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t('bp_lang')}</b></div>
                  <div className="by-onoff">{LANGS.map(([l, lab]) => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{lab}</button>)}</div>
                </div>
                <div className="by-card by-set-row">
                  <span className="by-tg-ic">{I.tg({ width: 40, height: 40 })}</span>
                  <div style={{ flex: 1 }}><b>{t('bp_tg')}</b><p className="by-hint">{profile?.phone} &mdash; {t('bp_tg_d')}</p></div>
                </div>
                <div className="by-card by-set-row">
                  <div><b>{t('bp_logout')}</b><p className="by-hint">{t('bp_logout_d')}</p></div>
                  <button className="by-btn danger" onClick={() => setAsk({ text: t('ez_confirm_out'), yes: t('ez_yes_out'), go: signOut })}>{t('bp_logout')}</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {ask && <EzConfirm text={ask.text} yes={ask.yes} no={t('ez_no')} onYes={() => { const g = ask.go; setAsk(null); g(); }} onNo={() => setAsk(null)} />}
    </div>
  );
}
