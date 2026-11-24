// ===== Explore (rasta bozor) =====
function FavHeart({ chatStore, shopId, lang, label }){
  const t = I18N[lang];
  if(!chatStore) return null;
  const on = chatStore.isFav(shopId);
  return (
    <button className={"fav-btn"+(on?" on":"")+(label?" lab":"")} aria-pressed={on} aria-label={on? t.fav_remove : t.fav_add}
      onClick={(e)=>{ e.stopPropagation();
        // saving a favourite needs an account: guests get the Telegram login first, then it is saved
        if(!chatStore.signedIn()){ window.dispatchEvent(new CustomEvent("rasta-fav-login", { detail:{ shopId } })); return; }
        const now = chatStore.toggleFav(shopId); toast(now? t.fav_added : t.fav_removed); }}>
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4Z" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
      {label && <span>{on? t.fav_saved : t.fav_save}</span>}
    </button>
  );
}
function MktCard({ store, shop, lang, t, onOpen, chatStore }){
  const cfg = store.cfg(shop.id);
  const pal = getPalette(cfg);
  const round = cfg.theme === "playful" || cfg.theme === "minimal";
  const thumbs = shop.products.slice(0, 4);
  return (
    <div className={"mkt-card"+(round?" round":"")} onClick={()=>onOpen(shop.id)}>
      <div className="mkt-cover" style={{"--ph-tone":shop.cover||pal.swatch, backgroundImage:`url(${photoURL(shop.cover||pal.swatch, "cover-"+shop.id, 600,300, IMG_KW[shop.type])})`, backgroundSize:"cover", backgroundPosition:"center"}}>
        <div className="mkt-cover-wm">{shop.name}</div>
        <span className="mkt-type"><span className="dotc" style={{background:pal.accent}}></span>{TYPES[shop.type][lang]}</span>
        <span className="mkt-fav"><FavHeart chatStore={chatStore} shopId={shop.id} lang={lang}/></span>
      </div>
      <div className="mkt-body">
        <div className="mkt-logo" style={{backgroundImage:`url(${photoURL(pal.swatch, "avatar-"+shop.id, 120,120, IMG_KW[shop.type], 3)})`, backgroundSize:"cover", backgroundPosition:"center"}}></div>
        <div className="mkt-head">
          <div className="mkt-head-id">
            <div className="mkt-name">{shop.name}</div>
            <div className="mkt-handle">@{shop.handle}</div>
          </div>
          {reviewsOn() && <span className="mkt-rating"><span className="star">{"\u2605"}</span>{(shop.rating||5).toFixed(1)}</span>}
        </div>
        <div className="mkt-tag">{textFB(shop.tagline,lang)}</div>
        <div className="mkt-thumbs">
          {thumbs.map((p,i)=>(<div key={p.id} className="mkt-thumb" style={{"--t":p.tone, backgroundImage:`url(${photoURL(p.tone, pslot(shop.id,p,0), 150,150, IMG_KW[shop.type], i)})`, backgroundSize:"cover", backgroundPosition:"center"}}></div>))}
        </div>
        <div className="mkt-foot">
          <span className="meta">{I.store({width:15,height:15})} <span>{shop.location} · {shop.productCount!=null? shop.productCount : shop.products.length} {t.sf_products}</span></span>
          <span className="open">{t.mkt_open} {I.arrow()}</span>
        </div>
      </div>
    </div>
  );
}

function Marketplace({ store, lang, setLang, onOpenShop, onStart, onHome , chatStore }){
  const t = I18N[lang];
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("all");
  const [city, setCity] = React.useState("all");
  const [sort, setSort] = React.useState("new");
  const [pcat, setPcat] = React.useState("all");

  const shops = SHOP_ORDER.map(id=>({ ...store.shopMeta(id), products: publicProducts(store, id) }))
    .filter(s=> s.status!=="paused");
  const typesPresent = [...new Set(shops.map(s=>s.type))];
  const cities = [...new Set(shops.map(s=>s.location))];
  const typeCount = (ty)=> shops.filter(s=>s.type===ty).length;
  // platform categories are the discovery axis: which shops carry this kind of product
  const catOptions = [];
  shops.forEach(s=>(s.products||[]).forEach(p=>{
    if(!p.catId || catOptions.some(c=>c.id===p.catId)) return;
    catOptions.push({ id:p.catId, name:catBreadcrumb(p.catId, lang) });
  }));
  catOptions.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  const filtered = shops.filter(s=>{
    if(pcat!=="all" && !(s.products||[]).some(p=>p.catId===pcat)) return false;
    if(type!=="all" && s.type!==type) return false;
    if(city!=="all" && s.location!==city) return false;
    if(q && !(s.name+" "+s.handle+" "+textFB(s.tagline,lang)+" "+TYPES[s.type][lang]).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const list = [...filtered].sort((a,b)=>{
    if(sort==="products") return b.products.length-a.products.length;
    if(sort==="rating") return (b.rating||0)-(a.rating||0);
    return SHOP_ORDER.indexOf(b.id)-SHOP_ORDER.indexOf(a.id);
  });
  const dirty = type!=="all" || city!=="all" || q!=="" || pcat!=="all";
  function clear(){ setType("all"); setCity("all"); setQ(""); setPcat("all"); }

  return (
    <div className="mkt">
      <div className="pnav">
        <div className="pnav-inner">
          <div className="brand" style={{cursor:"pointer"}} onClick={onHome}><Logo/> <BrandName/></div>
          <nav className="pnav-links">
            <a onClick={onHome} style={{cursor:"pointer"}}>{t.nav_features}</a>
            <a style={{color:"var(--ink)", fontWeight:600}}>{t.mkt_nav}</a>
          </nav>
          <div className="pnav-right">
            <LangPill lang={lang} setLang={setLang}/>
            {chatStore && <BuyerButton orderStore={chatStore} lang={lang}/>}
            <button className="btn btn-accent btn-sm" onClick={onStart}>{t.cta_start}</button>
            <NavMenu lang={lang} setLang={setLang} links={[[t.nav_features,onHome],[t.mkt_nav,()=>{}]]} actions={[[t.cta_start,onStart,true]]}/>
          </div>
        </div>
      </div>

      <div className="wrap mkt-hero">
        <span className="kicker">rasta bozor</span>
        <h1>{t.mkt_title}</h1>
        <p>{t.mkt_sub}</p>
        <div className="mkt-search">
          {I.search()}
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.mkt_search}/>
        </div>
        <div className="mkt-filters">
          <button className={"mkt-chip"+(type==="all"?" on":"")} onClick={()=>setType("all")}>
            {t.mkt_all_types} <span className="ct">{shops.length}</span>
          </button>
          {typesPresent.map(ty=>(
            <button key={ty} className={"mkt-chip"+(type===ty?" on":"")} onClick={()=>setType(ty)}>
              {TYPES[ty][lang]} <span className="ct">{typeCount(ty)}</span>
            </button>
          ))}
        </div>
        <div className="mkt-selects">
          <select className="mini-select" value={city} onChange={e=>setCity(e.target.value)}>
            <option value="all">{t.mkt_all_cities}</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="mini-select" value={pcat} onChange={e=>setPcat(e.target.value)}>
            <option value="all">{t.mkt_all_cats}</option>
            {catOptions.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
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
        <div className="mkt-count">{fill(t.mkt_count_n,{n:list.length})}</div>
        {list.length>0 ? (
          <div className="mkt-grid">
            {list.map(s=>(<MktCard key={s.id} store={store} shop={s} lang={lang} t={t} onOpen={onOpenShop} chatStore={chatStore}/>))}
          </div>
        ) : (
          <div className="mkt-empty">
            <div className="es-ic">{I.search({width:24,height:24})}</div>
            <b>{t.mkt_none_t}</b>
            <p>{t.mkt_none_d}</p>
            <button className="btn btn-ghost btn-sm" onClick={clear}>{t.mkt_clear}</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FavHeart,  Marketplace, MktCard });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { FavHeart, MktCard, Marketplace });
