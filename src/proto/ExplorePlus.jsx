import { go } from '../route.js';
// ===== Explore v2 — search-first header, category mega menu, product + shop results =====
addI18N({
  ex_search_ph: ["Search products and shops", "Поиск товаров и магазинов", "Mahsulot va do\u2018konlarni qidirish"],
  ex_cats:      ["All categories", "Все категории", "Barcha toifalar"],
  ex_products:  ["Products", "Товары", "Mahsulotlar"],
  ex_shops:     ["Shops", "Магазины", "Do\u2018konlar"],
  ex_cat_t:     ["Categories", "Категории", "Toifalar"],
  ex_see:       ["Show {n} results", "Показать {n}", "{n} ta natija"],
  ex_all_in:    ["All in {c}", "Всё в «{c}»", "\u00ab{c}\u00bb dagi hammasi"],
  ex_none_q:    ["Nothing found for “{q}”", "Ничего не найдено по «{q}»", "\u00ab{q}\u00bb bo\u2018yicha hech narsa topilmadi"],
  ex_try:       ["Try a shorter word or another category.", "Попробуйте короче или другую категорию.", "Qisqaroq so\u2018z yoki boshqa toifani sinang."],
  ex_from:      ["from {s}", "в «{s}»", "\u00ab{s}\u00bb da"],
  ex_back:      ["Back", "Назад", "Orqaga"],
  ex_popular:   ["Popular right now", "Сейчас ищут", "Hozir qidirilmoqda"],
  ex_n_items:   ["{n} items", "{n} товаров", "{n} ta"],
});

function exCatCounts(shops){
  const c = {};
  shops.forEach(s=>(s.products||[]).forEach(p=>{ catPathIds(p.catId).forEach(id=>{ c[id] = (c[id]||0) + 1; }); }));
  return c;
}
function exInCat(p, cat){ return cat==="all" || p.catId===cat || catPathIds(p.catId).includes(cat); }

function ExMega({ lang, t, counts, value, onPick, onClose, mobile }){
  // show the full category tree (incl. new ones), even where no shop has products yet
  const roots = catRoots();
  const [root, setRoot] = React.useState(()=>{ const p = value!=="all"? catPathIds(value)[0] : null; return p || (roots[0] && roots[0].id); });
  const [stage, setStage] = React.useState(mobile? "roots" : "groups");
  const [grp, setGrp] = React.useState(null);
  React.useEffect(()=>{ const k=(e)=>{ if(e.key==="Escape") onClose(); }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); }, []);
  const r = catNode(root);
  const groups = catGroups(root);
  if(mobile){
    const g = grp && catNode(grp);
    return (
      <div className="ex-sheet" role="dialog" aria-label={t.ex_cat_t}>
        <div className="ex-sheet-h">
          {stage!=="roots" ? <button className="ex-sheet-back" onClick={()=> stage==="leaves"? setStage("groups") : setStage("roots")}>{I.back({width:20,height:20})} {t.ex_back}</button> : <b>{t.ex_cat_t}</b>}
          <button className="ex-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:20,height:20})}</button>
        </div>
        <div className="ex-sheet-b">
          {stage==="roots" && roots.map(x=>(
            <button key={x.id} className="ex-row" onClick={()=>{ setRoot(x.id); setStage("groups"); }}><span>{x.name[lang]}</span><i>{counts[x.id]}</i>{I.chevR({width:18,height:18})}</button>
          ))}
          {stage==="groups" && <>
            <div className="ex-sheet-t">{r && r.name[lang]}</div>
            <button className="ex-row all" onClick={()=>onPick(root)}><span>{fill(t.ex_all_in,{c:r.name[lang]})}</span><i>{counts[root]}</i></button>
            {groups.map(x=>(<button key={x.id} className="ex-row" onClick={()=>{ if(catLeaves(x.id).length){ setGrp(x.id); setStage("leaves"); } else onPick(x.id); }}><span>{x.name[lang]}</span><i>{counts[x.id]}</i>{catLeaves(x.id).length>0 && I.chevR({width:18,height:18})}</button>))}
          </>}
          {stage==="leaves" && g && <>
            <div className="ex-sheet-t">{g.name[lang]}</div>
            <button className="ex-row all" onClick={()=>onPick(grp)}><span>{fill(t.ex_all_in,{c:g.name[lang]})}</span><i>{counts[grp]}</i></button>
            {catLeaves(grp).map(x=>(<button key={x.id} className="ex-row" onClick={()=>onPick(x.id)}><span>{x.name[lang]}</span><i>{counts[x.id]}</i></button>))}
          </>}
        </div>
      </div>
    );
  }
  return (
    <div className="ex-mega" role="dialog" aria-label={t.ex_cat_t}>
      <div className="ex-mega-roots">
        {roots.map(x=>(
          <button key={x.id} className={root===x.id?"on":""} onMouseEnter={()=>setRoot(x.id)} onFocus={()=>setRoot(x.id)} onClick={()=>onPick(x.id)}>
            <span>{x.name[lang]}</span><i>{counts[x.id]}</i>
          </button>
        ))}
      </div>
      <div className="ex-mega-body">
        <div className="ex-mega-h"><b>{r && r.name[lang]}</b><button className="ex-link" onClick={()=>onPick(root)}>{fill(t.ex_all_in,{c:r? r.name[lang] : ""})} {I.arrow({width:15,height:15})}</button></div>
        <div className="ex-mega-cols">
          {groups.map(g=>(
            <div key={g.id} className="ex-mega-col">
              <button className="ex-mega-g" onClick={()=>onPick(g.id)}>{g.name[lang]} <i>{counts[g.id]}</i></button>
              {catLeaves(g.id).map(x=>(
                <button key={x.id} className={"ex-mega-l"+(value===x.id?" on":"")} onClick={()=>onPick(x.id)}>{x.name[lang]} <i>{counts[x.id]}</i></button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExProduct({ s, p, lang, t, onOpen }){
  const src = photoURL(p.tone, pslot(s.id,p,0), 300, 375, IMG_KW[s.type]);
  return (
    <button className="ex-prod" onClick={()=>onOpen(s.id, p.id)}>
      <span className="ex-prod-img" style={{backgroundImage:"url("+src+")"}}></span>
      <b>{textFB(p.name,lang)}</b>
      <em><PriceTag p={p} lang={lang} t={t}/></em>
      {p._rv && <span style={{fontWeight:600}}>★ {p._rv.avg.toFixed(1)} <i style={{fontStyle:"normal", opacity:.6}}>({p._rv.n})</i></span>}
      <span>{fill(t.ex_from,{s:s.name})}</span>
    </button>
  );
}

function Marketplace({ store, lang, setLang, onOpenShop, onStart, onHome, chatStore }){
  const t = I18N[lang];
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");
  const [city, setCity] = React.useState("all");
  const [sort, setSort] = React.useState("new");
  const [pcat, setPcat] = React.useState("all");
  const [mega, setMega] = React.useState(false);
  const [suggest, setSuggest] = React.useState(false);
  const [mobile, setMobile] = React.useState(()=>window.innerWidth<760);
  const inputRef = React.useRef(null);
  const [F, setF] = React.useState(SFX_EMPTY);          // product filters (same engine as the storefront, on the server)
  React.useEffect(()=>{ const f=()=>setMobile(window.innerWidth<760); addEventListener("resize",f); return ()=>removeEventListener("resize",f); },[]);
  React.useEffect(()=>{ const f=(e)=>{ if(e.key==="/" && document.activeElement.tagName!=="INPUT" && document.activeElement.tagName!=="TEXTAREA"){ e.preventDefault(); inputRef.current && inputRef.current.focus(); } }; addEventListener("keydown",f); return ()=>removeEventListener("keydown",f); },[]);

  // ---- the server searches (BACKEND-PLAN §23): shops in pages, and products in pages with the same filters ----
  const ql = q.trim().toLowerCase();
  const showProducts = ql || pcat!=="all";
  const scope = { q, cat:pcat, type, city, lang };
  const shopsP = useSfxPages((page)=> store.browse("/shops?"+sfxQuery(SFX_EMPTY, { ...scope, sort, preview:4, page, size:SFX_PAGE })),
    JSON.stringify([q, pcat, type, city, sort, lang]), true, q? 250 : 0);
  const prodP = useSfxPages((page)=> store.browse("/explore/products?"+sfxQuery(F, { ...scope, page, size:SFX_PAGE })),
    JSON.stringify([q, pcat, type, city, F, lang]), !!showProducts, q? 250 : 0);
  const sr = shopsP.res || {}, pr = (showProducts && prodP.res) || {};
  const counts = sr.counts || {};
  const typesPresent = (sr.types || []).filter(ty=>TYPES[ty]);
  const cities = sr.cities || [];
  const meta = (id)=> ({ ...store.shopMeta(id), products: publicProducts(store, id) });
  const withShop = (p)=> ({ ...p, _s: meta(p.shopId) });
  const prodHits = (pr.suggest || []).map(p=>({ s: meta(p.shopId), p }));   // the search box's first text hits
  const nHits = pr.hits || 0;
  const shopHits = shopsP.items.map(it=> meta(it.shop.id));
  const nShops = shopsP.total;
  // ---- product filters across all shops: size, colour, details, price, in stock ----
  const xkey = (s,p)=> s.id+"|"+p.id;
  const xserver = prodP.res ? sfxServerFacets(prodP.res) : null;
  const xfacets = xserver ? xserver.facets : [];
  const xlist = prodP.items.map(withShop);
  const xtotal = prodP.total;
  const xctx = { rating:()=>null, sold:(p)=>p.stock==="sold", pop:(p)=>p.sold||0 };
  const xpills = sfxPills(F, setF, xfacets, lang, t);
  const acct = chatStore && chatStore.account ? chatStore.account() : null;
  const mySize = acct && acct.mySize || null;
  const saveSize = (aid, v)=>{ if(!acct || !chatStore.setAccountMeta) return; const cur = acct.mySize; if(cur && cur.aid===aid && cur.v===v) return;
    chatStore.setAccountMeta({ mySize:{ aid, v } }); if(!cur) toast(t.sfx_mysize_ok); };

  const catHits = ql.length>=2 ? catRoots().flatMap(r=>[r.id, ...catGroups(r.id).flatMap(g=>[g.id, ...catLeaves(g.id).map(x=>x.id)])]).filter(id=>catLabel(id,lang).toLowerCase().includes(ql)).slice(0,4) : [];
  const dirty = type!=="all" || city!=="all" || q!=="" || pcat!=="all";
  function clear(){ setType("all"); setCity("all"); setQ(""); setPcat("all"); setF(SFX_EMPTY); }
  const pickCat = (id)=>{ setPcat(id); setF(f=>({ ...f, sel:{} })); setMega(false); setSuggest(false); try{ window.scrollTo(0,0); }catch(e){} };
  // port: the product's own URL (/:handle/p/:id) instead of ?p=
  const openProduct = (sid, pid)=>{ go("/"+store.shopMeta(sid).handle+"/p/"+encodeURIComponent(pid), { external:true }); onOpenShop(sid); };
  const popular = catRoots().filter(r=>counts[r.id]).flatMap(r=>catGroups(r.id).filter(g=>counts[g.id])).sort((a,b)=>counts[b.id]-counts[a.id]).slice(0,6);

  return (
    <div className="mkt ex">
      <header className="ex-bar">
        <div className="ex-bar-in">
          <div className="brand" style={{cursor:"pointer"}} onClick={onHome}><Logo/> <BrandName/></div>
          <div className={"ex-search"+(suggest && ql?" open":"")}>
            {I.search({width:20,height:20})}
            <input ref={inputRef} value={q} onChange={e=>{ setQ(e.target.value); setSuggest(true); }} onFocus={()=>setSuggest(true)} onBlur={()=>setTimeout(()=>setSuggest(false),150)}
              onKeyDown={e=>{ if(e.key==="Enter"){ setSuggest(false); e.target.blur(); } }} placeholder={t.ex_search_ph} aria-label={t.ex_search_ph}/>
            {q ? <button className="ex-clear" onMouseDown={e=>e.preventDefault()} onClick={()=>setQ("")} aria-label={t.mkt_clear}>{I.x({width:16,height:16})}</button> : <kbd>/</kbd>}
            {suggest && ql && (
              <div className="ex-sug" onMouseDown={e=>e.preventDefault()}>
                {catHits.length>0 && <div className="ex-sug-g"><span>{t.ex_cat_t}</span>{catHits.map(id=>(
                  <button key={id} onClick={()=>{ setQ(""); pickCat(id); }}>{I.grid({width:16,height:16})} <b>{catBreadcrumb(id,lang)}</b><i>{counts[id]}</i></button>))}</div>}
                {prodHits.length>0 && <div className="ex-sug-g"><span>{t.ex_products}</span>{prodHits.slice(0,4).map(({s,p})=>(
                  <button key={p.id} onClick={()=>openProduct(s.id,p.id)}><span className="ex-sug-img" style={{backgroundImage:"url("+photoURL(p.tone,pslot(s.id,p,0),80,100,IMG_KW[s.type])+")"}}></span><b>{textFB(p.name,lang)}</b><em>{fmtPrice(p.price,lang)}</em></button>))}</div>}
                {shopHits.length>0 && <div className="ex-sug-g"><span>{t.ex_shops}</span>{shopHits.slice(0,3).map(s=>(
                  <button key={s.id} onClick={()=>onOpenShop(s.id)}><span className="ex-sug-av" style={{backgroundImage:"url("+byShopAv(store,s.id)+")"}}></span><b>{s.name}</b><em>{s.location}</em></button>))}</div>}
                {!catHits.length && !prodHits.length && !shopHits.length && <div className="ex-sug-none">{fill(t.ex_none_q,{q})}</div>}
                {(nHits+nShops)>0 && <button className="ex-sug-all" onClick={()=>{ setSuggest(false); inputRef.current && inputRef.current.blur(); }}>{fill(t.ex_see,{n:nHits+nShops})} {I.arrow({width:15,height:15})}</button>}
              </div>
            )}
          </div>
          <div className="ex-bar-r">
            <LangPill lang={lang} setLang={setLang}/>
            {chatStore && <BuyerButton orderStore={chatStore} lang={lang}/>}
            <button className="btn btn-accent btn-sm ex-start" onClick={onStart}>{t.cta_start}</button>
          </div>
        </div>
        <div className="ex-cats">
          <div className="ex-cats-in">
            <button className={"ex-cat-all"+(mega?" on":"")} onClick={()=>setMega(m=>!m)} aria-expanded={mega}>{I.grid({width:17,height:17})} {t.ex_cats}</button>
            <div className="ex-cat-strip">
              <button className={pcat==="all"?"on":""} onClick={()=>pickCat("all")}>{t.mkt_all_types}</button>
              {catRoots().map(r=>(
                <button key={r.id} className={pcat!=="all" && catPathIds(pcat)[0]===r.id?"on":""} onClick={()=>pickCat(r.id)}>{r.name[lang]}</button>
              ))}
            </div>
          </div>
          {mega && !mobile && <><div className="ex-mega-scrim" onClick={()=>setMega(false)}></div><ExMega lang={lang} t={t} counts={counts} value={pcat} onPick={pickCat} onClose={()=>setMega(false)}/></>}
        </div>
      </header>
      {mega && mobile && <ExMega mobile lang={lang} t={t} counts={counts} value={pcat} onPick={pickCat} onClose={()=>setMega(false)}/>}

      <div className="wrap ex-head">
        {pcat!=="all" ? (
          <div className="ex-crumbs">
            <button onClick={()=>pickCat("all")}>rasta bozor</button>
            {catPathIds(pcat).map((id,i,a)=>(<React.Fragment key={id}><span>›</span>{i<a.length-1? <button onClick={()=>pickCat(id)}>{catLabel(id,lang)}</button> : <b>{catLabel(id,lang)}</b>}</React.Fragment>))}
          </div>
        ) : <span className="kicker">rasta bozor</span>}
        <h1>{pcat!=="all"? catLabel(pcat,lang) : ql? "“"+q+"”" : t.mkt_title}</h1>
        {pcat==="all" && !ql && <p>{t.mkt_sub}</p>}
        {pcat==="all" && !ql && popular.length>0 && (
          <div className="ex-pop"><span>{t.ex_popular}:</span>{popular.map(g=><button key={g.id} onClick={()=>pickCat(g.id)}>{g.name[lang]}</button>)}</div>
        )}
        <div className="ex-filters">
          <select className="mini-select" value={type} onChange={e=>setType(e.target.value)} aria-label={t.mkt_all_types}>
            <option value="all">{t.mkt_all_types}</option>
            {typesPresent.map(ty=><option key={ty} value={ty}>{TYPES[ty][lang]}</option>)}
          </select>
          <select className="mini-select" value={city} onChange={e=>setCity(e.target.value)} aria-label={t.mkt_all_cities}>
            <option value="all">{t.mkt_all_cities}</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="mini-select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="new">{t.mkt_sort_new}</option>
            <option value="products">{t.mkt_sort_products}</option>
            <option value="rating">{t.mkt_sort_rating}</option>
          </select>
          {dirty && <button className="lnk" onClick={clear}>{I.x({width:14,height:14})} {t.mkt_clear}</button>}
        </div>
      </div>

      <div className="wrap">
        {showProducts && nHits>0 && (
          <section className="ex-sec">
            <div className="ex-sec-h"><h2>{t.ex_products}</h2><span>{fill(t.ex_n_items,{n:xtotal})}</span></div>
            <div style={{margin:"2px 0 12px"}}>
              <SfxBar t={t} lang={lang} pool={[]} facets={xfacets} F={F} setF={setF} ctx={xctx} total={xtotal} mySize={mySize} onPickSize={saveSize} sv={xserver && xserver.sv}/>
            </div>
            {xpills.length>0 && (
              <div className="sfx-pills">
                {xpills.map(pl=><button key={pl.k} type="button" className="sfx-val on" onClick={pl.off}>{pl.sw && <em className="sw" style={{background:pl.sw}}></em>}{pl.lab} {I.x({width:12,height:12})}</button>)}
                <button type="button" className="sfx-lnk" onClick={()=>setF(f=>({ ...SFX_EMPTY, sort:f.sort }))}>{t.sfx_reset_all}</button>
              </div>
            )}
            {xlist.length>0 ? (
              <div className="ex-prods">{xlist.map(p=><ExProduct key={xkey(p._s,p)} s={p._s} p={p} lang={lang} t={t} onOpen={openProduct}/>)}</div>
            ) : prodP.loading ? (
              <div className="mkt-empty"><span className="tg-spin"></span></div>
            ) : (
              <div className="mkt-empty"><b>{t.sfx_none}</b><p>{t.ex_try}</p><button className="btn btn-ghost btn-sm" onClick={()=>setF(f=>({ ...SFX_EMPTY, sort:f.sort }))}>{t.sfx_reset_all}</button></div>
            )}
            {prodP.hasMore && <button className="btn btn-soft btn-sm" style={{marginTop:16}} disabled={prodP.loading} onClick={prodP.more}>{t.h_more} · {xtotal-xlist.length}</button>}
          </section>
        )}
        <section className="ex-sec">
          {showProducts && <div className="ex-sec-h"><h2>{t.ex_shops}</h2><span>{fill(t.mkt_count_n,{n:nShops})}</span></div>}
          {!showProducts && <div className="mkt-count">{fill(t.mkt_count_n,{n:nShops})}</div>}
          {shopHits.length>0 ? (<>
            <div className="mkt-grid">{shopHits.map(s=>(<MktCard key={s.id} store={store} shop={s} lang={lang} t={t} onOpen={onOpenShop} chatStore={chatStore}/>))}</div>
            {shopsP.hasMore && <button className="btn btn-soft btn-sm" style={{marginTop:16}} disabled={shopsP.loading} onClick={shopsP.more}>{t.h_more} · {nShops-shopHits.length}</button>}
          </>) : shopsP.loading ? (
            <div className="mkt-empty"><span className="tg-spin"></span></div>
          ) : (
            <div className="mkt-empty">
              <div className="es-ic">{I.search({width:24,height:24})}</div>
              <b>{ql? fill(t.ex_none_q,{q}) : t.mkt_none_t}</b>
              <p>{t.ex_try}</p>
              <button className="btn btn-ghost btn-sm" onClick={clear}>{t.mkt_clear}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { Marketplace, ExMega });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { exCatCounts, exInCat, ExMega, ExProduct, Marketplace });
