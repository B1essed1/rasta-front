import { go, currentRoute } from '../route.js';
// ===== Dashboard — shell, Home overview, Design =====
function ShopSwitcher({ store, currentId, onPick, ids }){
  const [open, setOpen] = React.useState(false);
  const cur = store.shopMeta(currentId);
  return (
    <div className="db-shopsel" onClick={()=>setOpen(o=>!o)}>
      <div className="av ph" style={{"--ph-tone":getPalette(store.cfg(currentId)).swatch}}><div className="ph-init" style={{fontSize:13}}>{cur.initials}</div></div>
      <div className="nm"><b>{cur.name}</b><span>rastashops.com/{cur.handle}</span></div>
      <span className="cv">{I.layers({width:16,height:16})}</span>
      {open && (
        <div className="db-shop-menu" onClick={e=>e.stopPropagation()}>
          {(ids || SHOP_ORDER).map(id=>{
            const m = store.shopMeta(id);
            return (
              <button key={id} onClick={()=>{onPick(id); setOpen(false);}}>
                <div className="av ph" style={{"--ph-tone":getPalette(store.cfg(id)).swatch}}><div className="ph-init" style={{fontSize:11}}>{m.initials}</div></div>
                <b>{m.name}</b>
                {id===currentId && <span style={{marginLeft:"auto", color:"var(--primary)"}}>{I.check({width:16,height:16})}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HomeView({ store, shop, t, lang, setTab, onAdd, onVisit, onVisitBio, onScan }){
  const [share, setShare] = React.useState(false);
  const st = store.settings(shop.id);
  const products = store.products(shop.id);
  const sales = store.sales(shop.id);
  const stats = store.stats(shop.id);
  const monthAgo = Date.now() - 30*86400000;
  const monthSales = sales.filter(s=>s.at>=monthAgo);
  const sold = monthSales.reduce((n,s)=>n+s.lines.reduce((m,l)=>m+(l.qty-l.returned),0),0);
  const rev = monthSales.reduce((n,s)=>n+s.total,0);
  const pViews = Object.values(stats.productViews||{}).reduce((n,x)=>n+x,0);
  const out = products.filter(p=>stockState(p,st.threshold)==="sold");
  const low = products.filter(p=>stockState(p,st.threshold)==="low");
  const incomplete = products.filter(p=>!(p.desc && (p.desc.en||p.desc.ru||p.desc.uz)));
  const oc = store.orderCounts(shop.id);
  const attn = [];
  const rqNew = requestsOn()? store.requests(shop.id).filter(r=>r.status==="new").length : 0;
  if(rqNew) attn.push({ ic:I.bag, txt:fill(t.rq_new_badge,{n:rqNew}), cta:t.rq_title, go:()=>setTab("requests"), tone:"accent" });
  if(ordersOn() && oc.new) attn.push({ ic:I.bag, txt:fill(t.or_new_badge,{n:oc.new}), cta:t.db_orders, go:()=>setTab("orders"), tone:"accent" });
  if(ordersOn() && oc.stale) attn.push({ ic:I.clock, txt:fill(t.or_stale_badge,{n:oc.stale}), cta:t.db_orders, go:()=>setTab("orders"), tone:"alert" });
  if(out.length) attn.push({ ic:I.warn, txt:fill(t.hm_soldout,{n:out.length}), cta:t.hm_view_inv, go:()=>setTab("inventory"), tone:"alert" });
  if(low.length) attn.push({ ic:I.box, txt:fill(t.hm_low,{n:low.length}), cta:t.hm_view_inv, go:()=>setTab("inventory"), tone:"saffron" });
  if(incomplete.length) attn.push({ ic:I.edit, txt:fill(t.hm_incomplete,{n:incomplete.length}), cta:t.db_fix, go:()=>setTab("products"), tone:"plain" });

  const stats4 = [
    { lab:t.db_visitors, val:fmtNum(stats.views), ic:I.eye },
    { lab:t.hm_pviews, val:fmtNum(pViews), ic:I.grid },
    { lab:t.hm_items_sold, val:fmtNum(sold), ic:I.bag },
    { lab:t.hm_revenue+" · "+CURRENCY[lang], val:fmtNum(rev), ic:I.wallet },
  ];
  const live = st.status==="live";
  function copyLink(){
    try{ navigator.clipboard && navigator.clipboard.writeText("rastashops.com/"+st.handle); }catch(e){}
    toast(t.db_copied);
  }
  return (
    <div className="home">
      <button className="dm-hero" onClick={onScan}>
        <span className="dm-hero-ic">{I.scan({width:34,height:34})}</span>
        <span className="dm-hero-m"><b>{t.db_scan}</b><small>{t.dmh_d}</small></span>
        {I.arrow({width:22,height:22})}
      </button>
      <div className="dm-today">
        <div><small>{t.dm_today}</small><b>{fmtNum(sales.filter(s=>s.at>=new Date().setHours(0,0,0,0)).reduce((n,s)=>n+s.total,0))}</b><span>{CURRENCY[lang]}</span></div>
        {ordersOn() && <button onClick={()=>setTab("orders")}><small>{t.db_orders}</small><b>{oc.new||0}</b><span>{t.dmh_new}</span></button>}
        <button onClick={()=>setTab("inventory")}><small>{t.db_inventory}</small><b>{low.length+out.length}</b><span>{t.dmh_low}</span></button>
      </div>
      <div className="home-hello">
        <h2>{t.db_hello}, <span>{st.name}</span></h2>
        <p>{t.db_today_sub}</p>
      </div>

      <div className={"status-card "+(live?"live":"draft")}>
        <div className="sc-row">
          <div className={"sc-badge"+(live?" live":"")}>{live? I.check({width:20,height:20}) : I.store({width:20,height:20})}</div>
          <div className="sc-txt"><b>{live? t.db_live : t.sf_closed_t}</b><span>{live? t.db_live_d : t.st_paused_d}</span></div>
          {!live && <button className="btn btn-accent btn-sm" onClick={()=>{ store.setSettings(shop.id,{status:"live"}); toast(t.db_shop_published); }}>{t.db_publish_shop}</button>}
        </div>
        <div className="sc-link">
          <span className="sc-url">{I.globe({width:15,height:15})} <span>{"rastashops.com/"+st.handle}</span></span>
          <div className="sc-link-acts">
            <button className="btn btn-soft btn-sm" onClick={copyLink}>{I.copy({width:15,height:15})} {t.db_copy}</button>
            <button className="btn btn-accent btn-sm" onClick={onVisit}>{I.eye({width:15,height:15})} {t.db_open_shop}</button>
          </div>
        </div>
      </div>

      <div className="home-sec-t">{t.db_attention}</div>
      {attn.length? (
        <div className="attn-list">
          {attn.map((a,i)=>(
            <div key={i} className={"attn "+a.tone} onClick={a.go}>
              <div className="attn-ic">{a.ic({width:18,height:18})}</div>
              <span className="attn-txt">{a.txt}</span>
              <button className="attn-cta">{a.cta} {I.arrow({width:14,height:14})}</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="attn-empty">{I.check({width:16,height:16})} {t.db_all_good}</div>
      )}

      <div className="home-sec-t">{t.db_overview}</div>
      <div className="mini-stats four">
        {stats4.map((s,i)=>(
          <div key={i} className="mini-stat">
            <div className="ms-ic">{s.ic({width:17,height:17})}</div>
            <div className="ms-val">{s.val}</div>
            <div className="ms-lab">{s.lab}</div>
          </div>
        ))}
      </div>

      <div className="home-sec-t">{t.db_quick}</div>
      <div className="quick-actions">
        <button className="qa" onClick={onAdd}><span className="qa-ic accent">{I.plus({width:20,height:20})}</span>{t.db_add}</button>
        <button className="qa" onClick={onScan}><span className="qa-ic accent">{I.scan({width:20,height:20})}</span>{t.db_scan}</button>
        <button className="qa" onClick={()=>setTab("design")}><span className="qa-ic">{I.palette({width:20,height:20})}</span>{t.db_design}</button>
        <button className="qa" onClick={()=>setShare(true)}><span className="qa-ic">{I.share({width:20,height:20})}</span>{t.db_share}</button>
      </div>
      {share && <ShareSheet store={store} shopId={shop.id} t={t} onClose={()=>setShare(false)}
        onOpenShop={onVisit} onOpenBio={onVisitBio} onSettings={()=>{ setShare(false); setTab("settings"); }}/>}
    </div>
  );
}

function DesignView({ store, shop, cfg, t, lang, onVisitBio }){
  const layouts = [["grid",t.db_layout_grid],["gallery",t.db_layout_gallery],["list",t.db_layout_list],["magazine",t.db_layout_mag]];
  const patch = (p)=> store.setCfg(shop.id, p);
  const st = store.settings(shop.id);
  return (
    <div>
      <div className="db-sec-head">
        <div><h2>{t.db_design}</h2><div className="sub">{t.db_design_sub}</div></div>
        <button className="btn btn-accent btn-sm" onClick={()=>toast(t.db_saved)}>{I.check({width:16,height:16})} {t.db_save}</button>
      </div>
      <DesignSummary store={store} shop={shop} cfg={cfg} t={t} lang={lang}/>
      <div className="set-card" style={{marginTop:22}}>
        <div className="set-title">{t.st_bio}</div>
        <div className="hint" style={{marginTop:-6}}>{t.st_bio_d}</div>
        <BioSummary store={store} shop={shop} t={t} lang={lang} onVisitBio={onVisitBio}/>
      </div>
    </div>
  );
}
function fontIdFor(vars){
  const d = vars["--s-font-display"];
  const f = FONT_CHOICES.find(x=>x.display===d);
  return f? f.id : "grotesk";
}

function Dashboard({ store, chatStore, lang, setLang, onVisit, onVisitBio, onLogout, onDeleted, ordersFocus, clearOrdersFocus, reqFocus, clearReqFocus }){
  const t = I18N[lang];
  const shopId = store.state.currentId;
  const [tab, setTab] = React.useState(()=>{ if(reqFocus){ window.__pendingTab = null; return "requests"; } if(ordersFocus) return "orders"; if(window.__pendingTab){ const x = window.__pendingTab; window.__pendingTab = null; return x; } return currentRoute().tab || "home"; });
  // port: the tab lives in the URL (/dashboard/:tab); /dashboard alone becomes /dashboard/home without a new history entry
  React.useEffect(()=>{ const r = currentRoute(); go("/dashboard/"+tab, { replace: r.view==="dashboard" && !r.tab }); }, [tab]);
  React.useEffect(()=>{ const f = (e)=>{ setTab(e.detail.tab); if(e.detail.pos) setPos(true); }; addEventListener("rasta-tab", f); return ()=>removeEventListener("rasta-tab", f); }, []);
  React.useEffect(()=>{ if(ordersFocus) setTab("orders"); },[ordersFocus]);
  React.useEffect(()=>()=>{ clearOrdersFocus && clearOrdersFocus(); clearReqFocus && clearReqFocus(); },[]);
  React.useEffect(()=>{ if(reqFocus) setTab("requests"); },[reqFocus]);
  const [modal, setModal] = React.useState(null);
  const [pos, setPos] = React.useState(()=>{ const x = !!window.__pendingPos; window.__pendingPos = false; return x; });
  const shopFull = store.shopMeta(shopId);
  const cfg = store.cfg(shopId);
  const st = store.settings(shopId);
  const storeShop = { ...shopFull, products: publicProducts(store, shopId) };
  const products = store.products(shopId);
  const lowN = products.filter(p=>stockState(p,st.threshold)!=="in").length;

  const ords = store.orderCounts(shopId);
  const rqN = requestsOn()? store.requests(shopId).filter(r=>r.status==="new").length : 0;
  const chatN = chatStore? chatStore.sellerUnreadFor(shopId) : 0;
  const viewer = store.operator(shopId);
  const perms = permsOf(viewer);
  const [till, setTill] = React.useState(false);
  const allNav = [
    ["home", t.db_home, I.home],
    requestsOn() && ["requests", t.rq_title, I.bag, rqN || null],
    ordersOn() && ["orders", t.db_orders, I.bag, ords.new || null],
    chatOn() && ["chats", t.db_chats, I.chat, chatN || null],
    perms.products && ["products", t.db_products, I.grid],
    perms.stock && ["inventory", t.db_inventory, I.box, lowN||null],
    ["sales", t.db_sales, I.wallet],
    viewer.role!=="cashier" && ["team", t.tm_title, I.team],
    reviewsOn() && ["reviews", t.rv_title, I.spark],
    viewer.role!=="cashier" && ["design", t.db_design, I.palette],
    viewer.role==="owner" && ["settings", t.db_settings, I.gear],
  ];
  const nav = allNav.filter(Boolean);
  React.useEffect(()=>{ if(!nav.some(n=>n[0]===tab)) setTab("home"); }, [viewer.id, tab]);
  const staffShops = store.staffShops();
  const noAccess = staffShops && !staffShops.some(e=>e.shopId===shopId);
  React.useEffect(()=>{ if(noAccess && staffShops.length) store.setShop(staffShops[0].shopId); }, [noAccess]);
  if(noAccess) return (
    <div className="ob"><div className="ob-card-wrap"><div className="ob-card narrow">
      <EmptyState icon={I.lock} title={t.tm_noaccess_t} body={t.tm_noaccess_d}
        cta={<button className="btn btn-accent" onClick={onLogout}>{t.au_logout}</button>}/>
    </div></div></div>
  );
  const curNav = nav.find(n=>n[0]===tab) || nav[0];

  return (
    <div className="db">
      <aside className="db-side">
        <div className="brand"><Logo/> <BrandName/></div>
        <ShopSwitcher store={store} currentId={shopId} onPick={store.setShop} ids={staffShops? staffShops.map(e=>e.shopId) : null}/>
        <div className="db-nav">
          {nav.map(([id,lab,ic,badge])=>(
            <button key={id} className={tab===id?"on":""} onClick={()=>setTab(id)}>
              {ic()} <span className="dn-lab">{lab}</span>
              {badge? <span className="dn-badge">{badge}</span> : null}
            </button>
          ))}
        </div>
        <div className="db-side-foot">
          <TillChip store={store} shop={shopFull} t={t} onClick={()=>setTill(true)}/>
          <button className="btn btn-accent btn-sm" style={{width:"100%"}} onClick={()=>setPos(true)}>{I.scan({width:17,height:17})} {t.db_scan}</button>
          <button className="btn btn-soft btn-sm" style={{width:"100%"}} onClick={onVisit}>{I.eye({width:17,height:17})} {t.db_visit}</button>
          <div className="db-side-row">
            <LangPill lang={lang} setLang={setLang}/>
            <button className="lnk" onClick={onLogout}>{t.au_logout}</button>
          </div>
        </div>
      </aside>

      <div className="db-main">
        <div className="db-top">
          <h1>{curNav[1]}</h1>
          <div className="right">
            <button className="btn btn-soft btn-sm" onClick={()=>setPos(true)}>{I.scan({width:16,height:16})} {t.db_scan}</button>
            <LangPill lang={lang} setLang={setLang}/>
            <button className="btn btn-ghost btn-sm" onClick={onVisit}>{I.eye({width:16,height:16})} {t.db_visit}</button>
          </div>
        </div>

        <div className="db-mobtop">
          <DbMobileShell store={store} shop={shopFull} t={t} lang={lang} setLang={setLang} nav={nav} tab={tab} setTab={setTab}
            onScan={()=>setPos(true)} onVisit={onVisit} onLogout={onLogout} onTill={()=>setTill(true)}/>
        </div>

        <div className="db-body scroll-y">
          {tab==="home" && <HomeView store={store} shop={shopFull} t={t} lang={lang} setTab={setTab}
            onAdd={()=>setModal({})} onVisit={onVisit} onVisitBio={onVisitBio} onScan={()=>setPos(true)}/>}
          {tab==="products" && <ProductsView store={store} shop={shopFull} t={t} lang={lang}
            onAdd={()=>setModal({})} onEdit={p=>setModal({edit:p})}/>}
          {tab==="inventory" && <InventoryView store={store} shop={shopFull} t={t} lang={lang} onScan={()=>setPos(true)}/>}
          {tab==="requests" && <RequestsView key={reqFocus||"rq"} store={store} shop={shopFull} t={t} lang={lang} focusCode={reqFocus}/>}
          {tab==="orders" && <OrdersView store={store} shop={shopFull} t={t} lang={lang} focusId={ordersFocus} onOpenChat={()=>setTab("chats")}/>}
          {tab==="chats" && <SellerChats orderStore={chatStore} shop={shopFull} t={t} lang={lang}/>}
          {tab==="reviews" && <ReviewsView store={store} shop={shopFull} t={t} lang={lang}/>}
          {tab==="sales" && <SalesView store={store} shop={shopFull} t={t} lang={lang} viewer={viewer} onOpenOrders={()=>setTab("orders")}/>}
          {tab==="team" && <TeamView store={store} shop={shopFull} t={t} lang={lang} viewer={viewer}/>}
          {tab==="design" && <DesignView store={store} shop={storeShop} cfg={cfg} t={t} lang={lang} onVisitBio={onVisitBio}/>}
          {tab==="settings" && <SettingsView store={store} shop={shopFull} t={t} lang={lang} onDeleted={onDeleted} onDesign={()=>setTab("design")}/>}
        </div>
      </div>

      {till && <SwitchSeller store={store} shop={shopFull} t={t} onClose={()=>setTill(false)} onLogout={onLogout}/>}
      {modal && <ProductModal store={store} shop={shopFull} init={modal.edit} t={t} lang={lang} onClose={()=>setModal(null)}/>}
      {pos && <ScanSell store={store} shop={shopFull} t={t} lang={lang} onClose={()=>setPos(false)} onAddProduct={()=>{ setPos(false); setModal({}); }}/>}
    </div>
  );
}

Object.assign(window, { Dashboard, fontIdFor, HomeView, DesignView, ShopSwitcher });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ShopSwitcher, HomeView, DesignView, fontIdFor, Dashboard });
