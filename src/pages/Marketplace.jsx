// ===== Explore (rasta bozor) — ported from design-src/Explore.jsx =====
// Search-first header, category mega menu, product + shop results. The catalog tree
// comes from the backend (data/taxonomy.js); products, shops and per-category counts
// come from /api/marketplace/*. Category filters use category UUIDs end to end.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LangPill from '../components/ui/LangPill';
import BuyerButton from '../components/buyer/BuyerButton';
import FavHeart from '../components/buyer/FavHeart';
import { I } from '../components/ui/Icons';
import { t, fill, fmtPrice, getLang, onLangChange } from '../i18n';
import api from '../api/client';
import { useShopStore } from '../store/shopStore';
import { getCategoryName, fetchShopTypes } from '../data/types';
import {
  catRoots, catGroups, catLeaves, catPathIds, catLabel, catBreadcrumb, catNode,
} from '../data/taxonomy';

const PAGE = 24;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const prodName = (p, lang) => p['name' + cap(lang)] || p.nameEn || '';
const tagline = (s, lang) => (s.tagline && (s.tagline[lang] || s.tagline.en)) || '';

function ExMega({ lang, counts, value, onPick, onClose, mobile }) {
  const roots = catRoots();
  const [root, setRoot] = useState(() => {
    const p = value !== 'all' ? catPathIds(value)[0] : null;
    return p || (roots[0] && roots[0].id);
  });
  const [stage, setStage] = useState(mobile ? 'roots' : 'groups');
  const [grp, setGrp] = useState(null);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [onClose]);
  const r = catNode(root);
  const groups = catGroups(root);
  const n = (id) => counts[id] || 0;

  if (mobile) {
    const g = grp && catNode(grp);
    return (
      <div className="ex-sheet" role="dialog" aria-label={t('ex_cat_t')}>
        <div className="ex-sheet-h">
          {stage !== 'roots'
            ? <button className="ex-sheet-back" onClick={() => (stage === 'leaves' ? setStage('groups') : setStage('roots'))}>{I.back({ width: 20, height: 20 })} {t('ex_back')}</button>
            : <b>{t('ex_cat_t')}</b>}
          <button className="ex-x" onClick={onClose} aria-label={t('g_close')}>{I.x({ width: 20, height: 20 })}</button>
        </div>
        <div className="ex-sheet-b">
          {stage === 'roots' && roots.map((x) => (
            <button key={x.id} className="ex-row" onClick={() => { setRoot(x.id); setStage('groups'); }}>
              <span>{x.name[lang]}</span><i>{n(x.id)}</i>{I.chevR({ width: 18, height: 18 })}
            </button>
          ))}
          {stage === 'groups' && r && <>
            <div className="ex-sheet-t">{r.name[lang]}</div>
            <button className="ex-row all" onClick={() => onPick(root)}><span>{fill(t('ex_all_in'), { c: r.name[lang] })}</span><i>{n(root)}</i></button>
            {groups.map((x) => (
              <button key={x.id} className="ex-row" onClick={() => { if (catLeaves(x.id).length) { setGrp(x.id); setStage('leaves'); } else onPick(x.id); }}>
                <span>{x.name[lang]}</span><i>{n(x.id)}</i>{catLeaves(x.id).length > 0 && I.chevR({ width: 18, height: 18 })}
              </button>
            ))}
          </>}
          {stage === 'leaves' && g && <>
            <div className="ex-sheet-t">{g.name[lang]}</div>
            <button className="ex-row all" onClick={() => onPick(grp)}><span>{fill(t('ex_all_in'), { c: g.name[lang] })}</span><i>{n(grp)}</i></button>
            {catLeaves(grp).map((x) => (
              <button key={x.id} className="ex-row" onClick={() => onPick(x.id)}><span>{x.name[lang]}</span><i>{n(x.id)}</i></button>
            ))}
          </>}
        </div>
      </div>
    );
  }

  return (
    <div className="ex-mega" role="dialog" aria-label={t('ex_cat_t')}>
      <div className="ex-mega-roots">
        {roots.map((x) => (
          <button key={x.id} className={root === x.id ? 'on' : ''} onMouseEnter={() => setRoot(x.id)} onFocus={() => setRoot(x.id)} onClick={() => onPick(x.id)}>
            <span>{x.name[lang]}</span><i>{n(x.id)}</i>
          </button>
        ))}
      </div>
      <div className="ex-mega-body">
        <div className="ex-mega-h">
          <b>{r && r.name[lang]}</b>
          <button className="ex-link" onClick={() => onPick(root)}>{fill(t('ex_all_in'), { c: r ? r.name[lang] : '' })} {I.arrow({ width: 15, height: 15 })}</button>
        </div>
        <div className="ex-mega-cols">
          {groups.map((g) => (
            <div key={g.id} className="ex-mega-col">
              <button className="ex-mega-g" onClick={() => onPick(g.id)}>{g.name[lang]} <i>{n(g.id)}</i></button>
              {catLeaves(g.id).map((x) => (
                <button key={x.id} className={'ex-mega-l' + (value === x.id ? ' on' : '')} onClick={() => onPick(x.id)}>{x.name[lang]} <i>{n(x.id)}</i></button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExProduct({ p, lang, onOpen }) {
  const img = p.thumbnailUrl || p.imageUrl;
  return (
    <button className="ex-prod" onClick={() => onOpen(p)}>
      <span className="ex-prod-img" style={{ backgroundColor: p.tone || undefined, backgroundImage: img ? `url(${img})` : undefined }}></span>
      <b>{prodName(p, lang)}</b>
      <em>{fmtPrice(p.price, lang)}</em>
      <span>{fill(t('ex_from'), { s: p.shopName })}</span>
    </button>
  );
}

function ShopCard({ shop, lang, typeLabel, onOpen }) {
  return (
    <div className="mkt-card" onClick={() => onOpen(shop)}>
      <div className="mkt-cover" style={{ '--ph-tone': shop.coverColor || undefined, backgroundImage: shop.coverUrl ? `url(${shop.coverUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="mkt-cover-wm">{shop.name}</div>
        <span className="mkt-fav" onClick={(e) => e.stopPropagation()}><FavHeart shopId={shop.id} /></span>
        {typeLabel[shop.type] && <span className="mkt-type"><span className="dotc"></span>{typeLabel[shop.type]}</span>}
      </div>
      <div className="mkt-body">
        <div className="mkt-logo" style={shop.logoUrl ? { backgroundImage: `url(${shop.logoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          {!shop.logoUrl && (shop.initials || shop.name?.charAt(0))}
        </div>
        <div className="mkt-head">
          <div className="mkt-head-id">
            <div className="mkt-name">{shop.name}</div>
            <div className="mkt-handle">@{shop.handle}</div>
          </div>
          {shop.rating > 0 && <span className="mkt-rating"><span className="star">{'★'}</span>{Number(shop.rating).toFixed(1)}</span>}
        </div>
        <div className="mkt-tag">{tagline(shop, lang)}</div>
        <div className="mkt-foot">
          <span className="meta">{I.store({ width: 15, height: 15 })} <span>{shop.location}</span></span>
          <span className="open">{t('mkt_open')} {I.arrow()}</span>
        </div>
      </div>
    </div>
  );
}

// shop type slug -> localized name, from the backend SHOP_TYPE categories
let typeNames = {};
function useTypeNames() {
  const [, force] = useState(0);
  useEffect(() => {
    fetchShopTypes().then((list) => {
      typeNames = Object.fromEntries(list.map((c) => [c.id, c]));
      force((n) => n + 1);
    });
  }, []);
  return Object.fromEntries(Object.entries(typeNames).map(([id, c]) => [id, getCategoryName(c)]));
}

export default function Marketplace() {
  const navigate = useNavigate();
  const fetchAllShops = useShopStore((s) => s.fetchAllShops);
  const [lang, setLangState] = useState(getLang());
  useEffect(() => onLangChange(setLangState), []);
  const typeLabel = useTypeNames();

  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('new');
  const [pcat, setPcat] = useState('all');
  const [mega, setMega] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const [mobile, setMobile] = useState(() => window.innerWidth < 760);
  const [plimit, setPlimit] = useState(PAGE);
  const inputRef = useRef(null);

  const [allShops, setAllShops] = useState([]);      // unfiltered: feeds the type / city pickers
  const [shops, setShops] = useState([]);
  const [prods, setProds] = useState({ items: [], total: 0 });
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f = () => setMobile(window.innerWidth < 760);
    addEventListener('resize', f);
    return () => removeEventListener('resize', f);
  }, []);
  useEffect(() => {
    const f = (e) => {
      const tag = document.activeElement.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); inputRef.current && inputRef.current.focus(); }
    };
    addEventListener('keydown', f);
    return () => removeEventListener('keydown', f);
  }, []);

  useEffect(() => {
    fetchAllShops({}).then((d) => setAllShops(Array.isArray(d) ? d : []));
    api.get('/marketplace/category-counts').then((r) => setCounts(r.data || {})).catch(() => {});
  }, [fetchAllShops]);

  const ql = q.trim();
  const showProducts = !!ql || pcat !== 'all';
  const catId = pcat === 'all' ? undefined : pcat;
  const typeParam = type === 'all' ? undefined : type;
  const cityParam = city === 'all' ? undefined : city;

  useEffect(() => { setPlimit(PAGE); }, [pcat, ql, type, city]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [shopRes, prodRes] = await Promise.all([
          api.get('/marketplace/discover', { params: { q: ql || undefined, catId, type: typeParam, city: cityParam, sort: sort === 'new' ? undefined : sort } }),
          showProducts
            ? api.get('/marketplace/products', { params: { q: ql || undefined, catId, type: typeParam, city: cityParam, size: plimit } })
            : Promise.resolve({ data: { items: [], total: 0 } }),
        ]);
        if (!live) return;
        setShops(Array.isArray(shopRes.data) ? shopRes.data : []);
        setProds(prodRes.data || { items: [], total: 0 });
      } catch {
        if (!live) return;
        setShops([]);
        setProds({ items: [], total: 0 });
      }
      if (live) setLoading(false);
    }, 250);
    return () => { live = false; clearTimeout(timer); };
  }, [ql, catId, typeParam, cityParam, sort, plimit, showProducts]);

  const typesPresent = useMemo(() => [...new Set(allShops.map((s) => s.type).filter(Boolean))], [allShops]);
  const cities = useMemo(() => [...new Set(allShops.map((s) => s.location).filter(Boolean))], [allShops]);

  const catHits = useMemo(() => {
    if (ql.length < 2) return [];
    const needle = ql.toLowerCase();
    return catRoots()
      .flatMap((r) => [r.id, ...catGroups(r.id).flatMap((g) => [g.id, ...catLeaves(g.id).map((x) => x.id)])])
      .filter((id) => catLabel(id, lang).toLowerCase().includes(needle))
      .slice(0, 4);
  }, [ql, lang]);

  const popular = useMemo(() => catRoots()
    .filter((r) => counts[r.id])
    .flatMap((r) => catGroups(r.id).filter((g) => counts[g.id]))
    .sort((a, b) => counts[b.id] - counts[a.id])
    .slice(0, 6), [counts, lang]);

  const dirty = type !== 'all' || city !== 'all' || q !== '' || pcat !== 'all';
  const clear = () => { setType('all'); setCity('all'); setQ(''); setPcat('all'); };
  const pickCat = (id) => { setPcat(id); setMega(false); setSuggest(false); window.scrollTo(0, 0); };
  const openShop = (s) => navigate(`/${s.handle}`);
  const openProduct = (p) => navigate(`/${p.shopHandle}/p/${p.id}`);
  const prodHits = prods.items;

  return (
    <div className="mkt ex">
      <header className="ex-bar">
        <div className="ex-bar-in">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Logo size={28} /> <span className="brand-name">rastashops</span>
          </div>
          <div className={'ex-search' + (suggest && ql ? ' open' : '')}>
            {I.search({ width: 20, height: 20 })}
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setSuggest(true); }}
              onFocus={() => setSuggest(true)}
              onBlur={() => setTimeout(() => setSuggest(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSuggest(false); e.target.blur(); } }}
              placeholder={t('ex_search_ph')}
              aria-label={t('ex_search_ph')}
            />
            {q
              ? <button className="ex-clear" onMouseDown={(e) => e.preventDefault()} onClick={() => setQ('')} aria-label={t('mkt_clear')}>{I.x({ width: 16, height: 16 })}</button>
              : <kbd>/</kbd>}
            {suggest && ql && (
              <div className="ex-sug" onMouseDown={(e) => e.preventDefault()}>
                {catHits.length > 0 && <div className="ex-sug-g"><span>{t('ex_cat_t')}</span>{catHits.map((id) => (
                  <button key={id} onClick={() => { setQ(''); pickCat(id); }}>{I.grid({ width: 16, height: 16 })} <b>{catBreadcrumb(id, lang)}</b><i>{counts[id] || 0}</i></button>
                ))}</div>}
                {prodHits.length > 0 && <div className="ex-sug-g"><span>{t('ex_products')}</span>{prodHits.slice(0, 4).map((p) => (
                  <button key={p.id} onClick={() => openProduct(p)}>
                    <span className="ex-sug-img" style={{ backgroundImage: (p.thumbnailUrl || p.imageUrl) ? `url(${p.thumbnailUrl || p.imageUrl})` : undefined }}></span>
                    <b>{prodName(p, lang)}</b><em>{fmtPrice(p.price, lang)}</em>
                  </button>
                ))}</div>}
                {shops.length > 0 && <div className="ex-sug-g"><span>{t('ex_shops')}</span>{shops.slice(0, 3).map((s) => (
                  <button key={s.id} onClick={() => openShop(s)}>
                    <span className="ex-sug-av" style={{ backgroundImage: s.logoUrl ? `url(${s.logoUrl})` : undefined }}></span>
                    <b>{s.name}</b><em>{s.location}</em>
                  </button>
                ))}</div>}
                {!loading && !catHits.length && !prodHits.length && !shops.length && <div className="ex-sug-none">{fill(t('ex_none_q'), { q })}</div>}
                {(prods.total + shops.length) > 0 && <button className="ex-sug-all" onClick={() => { setSuggest(false); inputRef.current && inputRef.current.blur(); }}>{fill(t('ex_see'), { n: prods.total + shops.length })} {I.arrow({ width: 15, height: 15 })}</button>}
              </div>
            )}
          </div>
          <div className="ex-bar-r">
            <LangPill />
            <BuyerButton />
            <button className="btn btn-accent btn-sm ex-start" onClick={() => navigate('/onboarding')}>{t('cta_start')}</button>
          </div>
        </div>
        <div className="ex-cats">
          <div className="ex-cats-in">
            <button className={'ex-cat-all' + (mega ? ' on' : '')} onClick={() => setMega((m) => !m)} aria-expanded={mega}>{I.grid({ width: 17, height: 17 })} {t('ex_cats')}</button>
            <div className="ex-cat-strip">
              <button className={pcat === 'all' ? 'on' : ''} onClick={() => pickCat('all')}>{t('mkt_all_types')}</button>
              {catRoots().map((r) => (
                <button key={r.id} className={pcat !== 'all' && catPathIds(pcat)[0] === r.id ? 'on' : ''} onClick={() => pickCat(r.id)}>{r.name[lang]}</button>
              ))}
            </div>
          </div>
          {mega && !mobile && <>
            <div className="ex-mega-scrim" onClick={() => setMega(false)}></div>
            <ExMega lang={lang} counts={counts} value={pcat} onPick={pickCat} onClose={() => setMega(false)} />
          </>}
        </div>
      </header>
      {mega && mobile && <ExMega mobile lang={lang} counts={counts} value={pcat} onPick={pickCat} onClose={() => setMega(false)} />}

      <div className="wrap ex-head">
        {pcat !== 'all' ? (
          <div className="ex-crumbs">
            <button onClick={() => pickCat('all')}>rasta bozor</button>
            {catPathIds(pcat).map((id, i, a) => (
              <React.Fragment key={id}>
                <span>›</span>
                {i < a.length - 1 ? <button onClick={() => pickCat(id)}>{catLabel(id, lang)}</button> : <b>{catLabel(id, lang)}</b>}
              </React.Fragment>
            ))}
          </div>
        ) : <span className="kicker">rasta bozor</span>}
        <h1>{pcat !== 'all' ? catLabel(pcat, lang) : ql ? '“' + q + '”' : t('mkt_title')}</h1>
        {pcat === 'all' && !ql && <p>{t('mkt_sub')}</p>}
        {pcat === 'all' && !ql && popular.length > 0 && (
          <div className="ex-pop"><span>{t('ex_popular')}:</span>{popular.map((g) => <button key={g.id} onClick={() => pickCat(g.id)}>{g.name[lang]}</button>)}</div>
        )}
        <div className="ex-filters">
          <select className="mini-select" value={type} onChange={(e) => setType(e.target.value)} aria-label={t('mkt_all_types')}>
            <option value="all">{t('mkt_all_types')}</option>
            {typesPresent.map((ty) => <option key={ty} value={ty}>{typeLabel[ty] || ty}</option>)}
          </select>
          <select className="mini-select" value={city} onChange={(e) => setCity(e.target.value)} aria-label={t('mkt_all_cities')}>
            <option value="all">{t('mkt_all_cities')}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="mini-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">{t('mkt_sort_new')}</option>
            <option value="products">{t('mkt_sort_products')}</option>
            <option value="rating">{t('mkt_sort_rating')}</option>
          </select>
          {dirty && <button className="lnk" onClick={clear}>{I.x({ width: 14, height: 14 })} {t('mkt_clear')}</button>}
        </div>
      </div>

      <div className="wrap">
        {showProducts && prodHits.length > 0 && (
          <section className="ex-sec">
            <div className="ex-sec-h"><h2>{t('ex_products')}</h2><span>{fill(t('ex_n_items'), { n: prods.total })}</span></div>
            <div className="ex-prods">{prodHits.map((p) => <ExProduct key={p.id} p={p} lang={lang} onOpen={openProduct} />)}</div>
            {prods.total > prodHits.length && (
              <button className="btn btn-soft btn-sm" style={{ marginTop: 16 }} onClick={() => setPlimit((n) => n + PAGE)}>{t('h_more')} · {prods.total - prodHits.length}</button>
            )}
          </section>
        )}
        <section className="ex-sec">
          {showProducts && <div className="ex-sec-h"><h2>{t('ex_shops')}</h2><span>{fill(t('mkt_count_n'), { n: shops.length })}</span></div>}
          {!showProducts && <div className="mkt-count">{fill(t('mkt_count_n'), { n: shops.length })}</div>}
          {loading && !shops.length ? (
            <div className="mkt-count">{t('loading')}</div>
          ) : shops.length > 0 ? (
            <div className="mkt-grid">{shops.map((s) => <ShopCard key={s.id} shop={s} lang={lang} typeLabel={typeLabel} onOpen={openShop} />)}</div>
          ) : (
            <div className="mkt-empty">
              <div className="es-ic">{I.search({ width: 24, height: 24 })}</div>
              <b>{ql ? fill(t('ex_none_q'), { q }) : t('mkt_none_t')}</b>
              <p>{t('ex_try')}</p>
              <button className="btn btn-ghost btn-sm" onClick={clear}>{t('mkt_clear')}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
