import { lazy, Suspense } from 'react';
import { go, back, subscribe, currentRoute, useRoute, legacyPath } from '../route.js';
// prototype-only page navigator + screenshot tour: development only (parity harness), not in production builds
const DevTour = import.meta.env.DEV ? lazy(() => import('./DevTour.jsx')) : null;

// ===== App shell =====
function StoreView({ store, shopId, lang, setLang, onExplore, onDash, chatStore }){
  const t = I18N[lang];
  const cfg = store.cfg(shopId);
  const meta = store.shopMeta(shopId);
  // the products come in pages from the server (Storefront server mode, BACKEND-PLAN §23)
  const shop = { ...meta, products: publicProducts(store, shopId),
    productCount: meta.productCount!=null? meta.productCount : publicProducts(store, shopId).length };
  // port: the open product comes from the URL (/:handle/p/:productId) instead of ?p=
  const route = useRoute();
  const openId = route.view==="store" && route.handle===meta.handle ? (route.productId || null) : null;
  React.useEffect(()=>{ store.trackVisit(shopId); }, [shopId]);
  // units sold per product (net of returns), counted on the server — drives the "Popular" sort and "N sold"
  const pop = store.pop(shopId);
  return (
    <div style={{minHeight:"100vh", background:getPalette(cfg).bg}}>
      <div className="sf-topbar">
        <button onClick={onExplore} className="sf-topback" style={{display:"inline-flex", alignItems:"center", gap:6}}>{I.back({width:17,height:17})} <Logo size={22}/> <BrandName/></button>
        <span className="sf-topurl">rastashops.com/{shop.handle}</span>
        <div style={{marginLeft:"auto", display:"flex", gap:8, alignItems:"center"}}>
          <button className="btn btn-ghost btn-sm" onClick={onDash}>{I.grid({width:15,height:15})} {t.db_title}</button>
          <LangPill lang={lang} setLang={setLang}/>
          <FavHeart chatStore={chatStore} shopId={shopId} lang={lang} label/>
          <BuyerButton orderStore={chatStore} lang={lang}/>
        </div>
      </div>
      <Storefront shop={shop} cfg={cfg} lang={lang} openId={openId} pop={pop} server={store} onTrackProduct={(pid)=>store.trackProduct(shopId,pid)} chatStore={chatStore}
        reviews={store.reviews(shopId)} onAddReview={(rev)=>store.addReview(shopId, rev)}
        reviewerName={(chatStore.account()||{}).name || null}/>
    </div>
  );
}

function BioView({ store, shopId, lang, setLang, onExplore, onDash, onShop }){
  const t = I18N[lang];
  const meta = store.shopMeta(shopId);
  return (
    <div style={{minHeight:"100vh"}}>
      <div className="sf-topbar">
        <button onClick={onExplore} className="sf-topback" style={{display:"inline-flex", alignItems:"center", gap:6}}>{I.back({width:17,height:17})} <Logo size={22}/> <BrandName/></button>
        <span className="sf-topurl">rastashops.com/{meta.handle}/link</span>
        <div style={{marginLeft:"auto", display:"flex", gap:8, alignItems:"center"}}>
          <button className="btn btn-ghost btn-sm" onClick={onDash}>{I.grid({width:15,height:15})} {t.db_title}</button>
          <LangPill lang={lang} setLang={setLang}/>
        </div>
      </div>
      <BioViewTrack store={store} shopId={shopId}/>
      <BioPage store={store} shopId={shopId} lang={lang} onOpenShop={onShop}/>
    </div>
  );
}

function BioViewTrack({ store, shopId }){
  React.useEffect(()=>{ store.trackBio(shopId); }, [shopId]);
  // the bio page shows the shop's first in-stock products: load them unless the shop's catalog is here already
  React.useEffect(()=>{ const h = store.shopMeta(shopId).handle, done = window.__bioLoaded || (window.__bioLoaded = {});
    if(h && !store.dashReady(shopId) && !done[shopId]){ done[shopId] = true;
      store.browse("/shops/"+encodeURIComponent(h)+"/products?instock=1&sort=shop&size=4", shopId).catch(()=>{ done[shopId] = false; }); } }, [shopId]);
  return null;
}

// dev only: accounts offered by the simulated Telegram (the demo owner and two demo staff of the seed)
const DEV_ACCOUNTS = [
  { name:"Malika", last:"Yusupova", user:"malika_shop", ph:"977003040", tag:"owner · demo" },
  { name:"Dilnoza", last:"Yusupova", user:"dilnoza_yu", ph:"977008044", tag:"manager · demo" },
  { name:"Aziza", last:"Karimova", user:"aziza_k", ph:"901112233", tag:"cashier · demo" },
];

function LoginView({ store, lang, setLang, onDone, onCancel }){
  const t = I18N[lang];
  const [pick, setPick] = React.useState(null);
  const accounts = import.meta.env.DEV ? DEV_ACCOUNTS : null;
  return (
    <div className="ob">
      <div className="ob-top">
        <div className="brand" style={{cursor:"pointer"}} onClick={onCancel}><Logo/> <BrandName/></div>
        <LangPill lang={lang} setLang={setLang}/>
      </div>
      <div className="ob-card-wrap">
        <div className="ob-card narrow">
          {pick ? (
            <div className="auth-step">
              <div className="ob-head"><h2>{t.tm_pick_shop}</h2><p>{t.tm_pick_shop_d}</p></div>
              <div className="tm-shops">{pick.map(e=>{ const sm = store.shopMeta(e.shopId); const m = store.team(e.shopId).find(x=>x.id===e.staffId);
                return (<button key={e.shopId} className="tm-shop-b" onClick={()=>{ store.setShop(e.shopId); onDone(); }}>
                  <div className="av ph" style={{"--ph-tone":getPalette(store.cfg(e.shopId)).swatch}}><div className="ph-init" style={{fontSize:13}}>{sm.initials}</div></div>
                  <span><b>{sm.name}</b><small>{roleLabel(m? m.role : e.role, t)}</small></span>{I.chevR({width:18,height:18})}
                </button>); })}</div>
            </div>
          ) : (
            <AuthFlow t={t} accounts={accounts}
              note={<div className="tm-login-note">{I.team({width:16,height:16})}<span>{t.tm_login_note}</span></div>}
              onDone={(phone, u)=>{ const staff = store.login(phone, u);
                if(staff.length>1) setPick(staff);
                else { if(staff.length){ store.setShop(staff[0].shopId); toast(fill(t.tm_welcome,{n:(u&&u.name||"").split(" ")[0], s:store.shopMeta(staff[0].shopId).name || ""})); } onDone(); } }}/>
          )}
        </div>
      </div>
    </div>
  );
}

function App(){
  const store = useShopStore();
  const lang = store.state.lang;
  // catalog lookup injected into the order store: intent is validated against real stock. Products load in pages
  // now, so a product not loaded yet is "unknown" (kept, no limit): only the server's "gone" drops a basket line.
  const stockOf = React.useCallback((productId, variantId)=>{
    const p = store.productById(productId);
    if(!p) return store.isGone(productId)? { qty:0, exists:false } : { qty:Infinity, exists:true, unknown:true };
    if(!variantId) return { qty: totalQty(p), exists:true };
    const v = p.variants.find(x=>x.id===variantId);
    return v? { qty:v.qty, exists:true } : { qty:0, exists:false };
  }, [store.state.catalog, store.state.pub, store.state.gone]);
  const soleVariantOf = React.useCallback((productId)=>{
    const p = store.productById(productId);
    return p && p.variants && p.variants.length===1? p.variants[0].id : null;
  }, [store.state.catalog, store.state.pub]);
  const chatStore = useOrderStore(lang, stockOf, soleVariantOf);
  window.__lang = lang;
  // port: `view` mirrors the URL (src/route.js). The prototype's ?view=/?p=/?b=/?tab= links are rewritten first.
  const storeRef = React.useRef(store); storeRef.current = store;
  const viewFromUrl = React.useCallback((replaceOnly)=>{
    const st = storeRef.current, r = currentRoute();
    if(r.handle){
      const sid = SHOP_ORDER.find(id=>st.shopMeta(id).handle===r.handle);
      if(!sid){ go("/", { replace:true }); return "landing"; }   // unknown handle (not in the prototype): back to the landing
      if(sid!==st.state.currentId) st.setShop(sid);
    }
    if(r.view==="dashboard" && !st.state.session){ if(r.tab) window.__pendingTab = r.tab; go("/login", { replace:true }); return "login"; }
    if(r.view==="dashboard" && r.tab){   // open Dashboard → switch its tab; otherwise it starts on this tab
      if(!replaceOnly && viewRef.current==="dashboard") dispatchEvent(new CustomEvent("rasta-tab", { detail:{ tab:r.tab } }));
      else window.__pendingTab = r.tab; }
    if(!r.view){ go("/", { replace:true }); return "landing"; }   // unknown path (not in the prototype)
    return r.view;
  }, []);
  const [view, setView] = React.useState(()=>{
    try{
      const legacy = legacyPath({ currentHandle: store.shopMeta(store.state.currentId || SHOP_ORDER[0]).handle,
        handleOfProduct:(pid)=>{ const p = store.productById(pid); const sid = p && p.shopId || SHOP_ORDER.find(id=>(store.products(id)||[]).some(x=>x.id===pid)); return sid? store.shopMeta(sid).handle : null; },
        anyCode:(()=>{ for(const sid of SHOP_ORDER){ const r = store.requests(sid)[0]; if(r) return r.code; } return null; })() });
      if(legacy) history.replaceState(history.state, "", legacy);
      return viewFromUrl(true);
    }catch(e){ return "landing"; }
  });
  const viewRef = React.useRef(view); viewRef.current = view;
  // Back / Forward (and links opened outside App, e.g. a product from Explore) → view
  React.useEffect(()=> subscribe((external)=>{ if(external){ const v = viewFromUrl(false); setView(v); } }), []);
  const setLang = store.setLang;
  React.useEffect(()=>{
    if(window.__rastaRepaired){ toast(I18N[lang].inv_journal_fix); window.__rastaRepaired = 0; }
  },[]);
  const shopId = store.state.currentId || SHOP_ORDER[0];
  const [checkout, setCheckout] = React.useState(null);   // storeId whose order is being reviewed
  const [loginFor, setLoginFor] = React.useState(null);   // { store, product } waiting for Telegram login
  const chatRef = React.useRef(chatStore); chatRef.current = chatStore;
  const coBasket = checkout? chatStore.baskets().find(b=>b.storeId===checkout) : null;
  React.useEffect(()=>{ if(checkout && !coBasket) setCheckout(null); }, [checkout, !!coBasket]);
  React.useEffect(()=>{
    function onOrder(e){
      const { store:st, product, inBasket } = e.detail || {};
      const cs = chatRef.current;
      // basket-request mode: just collect into this shop's basket — no login, no checkout
      if(!ordersOn()){ if(inBasket){ setBasketOpen(true); return; } cs.addToBasket(st, product); toast(I18N[window.__lang||"en"].rq_added); return; }
      if(!cs.signedIn()){ setLoginFor({ store:st, product: inBasket? null : product }); return; }
      if(!inBasket) cs.addToBasket(st, product);
      setCheckout(st.id);
    }
    function onOpen(){ setBasketOpen(true); }
    const onAcct = (e)=>{ setAcctTab((e && e.detail && e.detail.tab) || null); setAccount(true); };
    const onFavLogin = (e)=>{ const id = e && e.detail && e.detail.shopId; if(id) setFavLogin(id); };
    addEventListener("rasta-order", onOrder); addEventListener("rasta-open-basket", onOpen); addEventListener("rasta-account", onAcct); addEventListener("rasta-fav-login", onFavLogin);
    return ()=>{ removeEventListener("rasta-order", onOrder); removeEventListener("rasta-open-basket", onOpen); removeEventListener("rasta-account", onAcct); removeEventListener("rasta-fav-login", onFavLogin); };
  }, []);
  const barBasket = view==="store"? chatStore.baskets().find(b=>b.storeId===shopId) : null;
  const [sent, setSent] = React.useState(null);           // {order, shop}
  const [track, setTrack] = React.useState(null);         // {shopId, orderId}
  const [tg, setTg] = React.useState(null);               // mocked Telegram push
  const [ordersFocus, setOrdersFocus] = React.useState(null);
  const [account, setAccount] = React.useState(false);
  const [acctTab, setAcctTab] = React.useState(null);     // which profile tab to open (e.g. "fav" from the header heart)
  const [favLogin, setFavLogin] = React.useState(null);   // shopId waiting to be saved after login
  const [basketOpen, setBasketOpen] = React.useState(false);
  const [reqSent, setReqSent] = React.useState(null);     // { req, shopId } — buyer's "basket ready" sheet
  const [botReq, setBotReq] = React.useState(null);       // { req, shopId } — mock Telegram bot message to the seller
  const [reqFocus, setReqFocus] = React.useState(null);   // basket code to open in Dashboard → Requests
  const route = useRoute();
  const reqCode = route.view==="request" ? route.code : null;   // port: /b/:code instead of ?b=
  // buyer taps "Send to shop": the basket becomes a request with a short code + link
  // The code is made on the server. The basket stays until the buyer really sends it from the popup
  // ("@shop ga yuborish"); closing the popup keeps it. Pressing "Send" again with the same basket reopens the
  // same request instead of making a second code.
  const sendingRef = React.useRef(false);
  const pendingReq = React.useRef({});   // shopId → { sig, req }: requests made but not yet sent from the popup
  const basketSig = (b)=> b.items.map(it=>it.variantId+"×"+it.quantity).sort().join("|");
  async function sendRequest(sid){
    const b = chatStore.baskets().find(x=>x.storeId===sid); if(!b || sendingRef.current) return;
    const lines = b.items.map(it=>({ variantId:it.variantId, productId:it.productId, name:it.productName, label:it.variantLabel||"", qty:it.quantity, unit:it.unitPrice })).filter(l=>l.variantId);
    if(!lines.length) return;
    const sig = basketSig(b);
    const prev = pendingReq.current[sid];
    if(prev && prev.sig===sig){ setReqSent({ req:prev.req, shopId:sid }); return; }   // the basket page stays open behind the popup
    const a = chatStore.account();
    sendingRef.current = true;
    try{
      const req = await store.createRequest(sid, lines, a? { name:a.name||"", phone:a.phone, tg:a.tg||"" } : null);
      pendingReq.current[sid] = { sig, req };
      setReqSent({ req, shopId:sid });   // the basket page stays open behind the popup: closing the popup returns to it
    }catch(e){
      if(e && e.code==="request.variant_gone" && Array.isArray(e.details)){
        e.details.forEach(vid=>{ const it = b.items.find(x=>x.variantId===vid); if(it) chatStore.removeBasketItem(sid, it.id); });
      }
      toast(Api.errorText(e, lang), "err");
    }finally{ sendingRef.current = false; }
  }
  function openRequestInDash(sid, code){
    store.setShop(sid); setReqFocus(code); window.__pendingTab = "requests";
    if(!store.state.session){ setView("login"); return; }   // the seller logs in first (no demo seller any more)
    if(view==="dashboard") dispatchEvent(new CustomEvent("rasta-tab", { detail:{ tab:"requests" } })); else setView("dashboard");
  }
  const anyReqCode = null;
  // the dashboard always shows a shop this person may open
  const mine = (store.staffShops() || []).map(e=>e.shopId);
  const dashId = mine.includes(shopId) ? shopId : (mine[0] || null);
  React.useEffect(()=>{ if(view==="dashboard" && dashId && dashId!==store.state.currentId) store.setShop(dashId); }, [view, dashId]);
  React.useEffect(()=>{ if(view==="dashboard" && dashId && !store.dashReady(dashId)) store.loadDash(dashId); }, [view, dashId]);
  // port: view → URL. Pages that own part of the path keep it (/:handle/p/:id, /dashboard/:tab).
  React.useEffect(()=>{
    const r = currentRoute(), h = shopId? store.shopMeta(shopId).handle : null;
    const path = view==="landing"? "/" : view==="explore"? "/explore" : view==="login"? "/login" : view==="onboarding"? "/new"
      : view==="profile"? "/me"
      : view==="request"? "/b/"+((r.view==="request" && r.code) || anyReqCode || "")
      : view==="store"? (r.view==="store" && r.handle===h? location.pathname : "/"+h)
      : view==="bio"? "/"+h+"/link"
      : view==="dashboard"? (r.view==="dashboard"? location.pathname : "/dashboard")
      : null;
    if(path) go(path.replace(/\/$/, "") || "/");
  }, [view, shopId]);
  const prevView = React.useRef("explore");
  window.__shopStore = store;
  React.useEffect(()=>{ if(account){ if(view!=="profile") prevView.current = view; setView("profile"); setAccount(false); } }, [account]);
  const trackedOrder = track? (store.orders(track.shopId)||[]).find(o=>o.id===track.orderId) : null;

  function patchCfgFor(id, themeId){
    const th = THEMES[themeId];
    store.setCfg(id, { theme:themeId, palette:th.defaultPalette, customPalette:null, layout:th.layout, font:fontIdFor(th.vars) });
  }
  function goDash(){ setView(store.state.session? "dashboard" : "login"); }

  const sw = [
    ["landing", "Landing", I.spark],
    ["explore", "Explore", I.search],
    ["dashboard", "Dashboard", I.grid],
    ["store", "Storefront", I.store],
    ["bio", "Link in bio", I.globe],
  ];

  return (
    <div className="app-shell">
      {view==="landing" && (
        <Landing store={store} lang={lang} setLang={setLang}
          onStart={()=>setView("onboarding")}
          onLogin={goDash}
          onExplore={()=>setView("explore")}
          onDemo={()=>{ if(SHOP_ORDER[0]){ store.setShop(SHOP_ORDER[0]); setView("store"); } }}
          onPickTheme={(id)=>{ const demo = SHOP_ORDER[0]; if(!demo) return; store.setShop(demo); patchCfgFor(demo, id); setView("store"); }}/>
      )}
      {view==="login" && (
        <LoginView store={store} lang={lang} setLang={setLang} onDone={()=>setView("dashboard")} onCancel={()=>setView("landing")}/>
      )}
      {view==="onboarding" && (
        <OnboardingV2 store={store} lang={lang} setLang={setLang}
          onCancel={()=>setView("landing")}
          goDashboard={()=>setView("dashboard")}
          goStore={()=>setView("store")}/>
      )}
      {view==="explore" && (
        <Marketplace store={store} lang={lang} setLang={setLang} chatStore={chatStore}
          onHome={()=>setView("landing")}
          onStart={()=>setView("onboarding")}
          onOpenShop={(id)=>{ store.setShop(id); setView("store"); }}/>
      )}
      {view==="dashboard" && dashId && !(store.dashReady(dashId) && store.state.currentId===dashId) && (
        <div className="ob"><div className="ob-card-wrap"><div className="ob-card narrow" style={{textAlign:"center", padding:40}}>
          <span className="tg-spin" style={{display:"inline-block"}}></span><p style={{color:"var(--soft)", marginTop:12}}>{I18N[lang].api_loading || "Loading…"}</p>
        </div></div></div>
      )}
      {view==="dashboard" && (!dashId || (store.dashReady(dashId) && store.state.currentId===dashId)) && (dashId ? (
        <Dashboard store={store} chatStore={chatStore} lang={lang} setLang={setLang}
          ordersFocus={ordersFocus} clearOrdersFocus={()=>setOrdersFocus(null)}
          reqFocus={reqFocus} clearReqFocus={()=>setReqFocus(null)}
          onVisit={()=>setView("store")}
          onVisitBio={()=>setView("bio")}
          onLogout={()=>{ store.logout(); setView("landing"); }}
          onDeleted={()=>setView("landing")}/>
      ) : (
        <div className="ob"><div className="ob-card-wrap"><div className="ob-card narrow">
          <EmptyState icon={I.store} title={I18N[lang].ob_create_shop}
            cta={<button className="btn btn-accent" onClick={()=>setView("onboarding")}>{I.plus({width:17,height:17})} {I18N[lang].ob_create_shop}</button>}/>
        </div></div></div>
      ))}
      {view==="store" && shopId && (
        <StoreView store={store} shopId={shopId} lang={lang} setLang={setLang} chatStore={chatStore}
          onExplore={()=>setView("explore")} onDash={goDash}/>
      )}
      {view==="request" && (
        <RequestPublic shopStore={store} code={reqCode} lang={lang} setLang={setLang}
          onHome={()=>setView("landing")}
          onShop={(id)=>{ store.setShop(id); setView("store"); }}
          onSeller={(sid, code)=>openRequestInDash(sid, code)}/>
      )}
      {view==="bio" && shopId && (
        <BioView store={store} shopId={shopId} lang={lang} setLang={setLang}
          onExplore={()=>setView("explore")} onDash={goDash} onShop={()=>setView("store")}/>
      )}

      {chatOn() && (view==="store" || view==="explore") && (
        <OrderDock orderStore={chatStore} lang={lang}
          onCheckout={(b)=>setCheckout(b.storeId)}
          onAccount={()=>setAccount(true)}
          onTrack={(p)=>setTrack({ shopId:p.shopId, orderId:p.orderId })}
          onOpenProduct={(it)=>{
            const owner = SHOP_ORDER.find(sid=>(store.products(sid)||[]).some(p=>p.id===it.productId));
            if(owner && owner!==shopId) store.setShop(owner);
            setView("store");
          }}/>
      )}

      {view==="profile" && (
        <BuyerHub key={acctTab || "home"} initialTab={acctTab || undefined} orderStore={chatStore} shopStore={store} lang={lang} setLang={setLang}
          onBasket={()=>setBasketOpen(true)}
          onClose={()=>setView(prevView.current==="profile"? "explore" : prevView.current)}
          onOpenOrder={(o)=>{ setTrack({ shopId:o.shopId, orderId:o.id }); }}
          onOpenShop={(id)=>{ store.setShop(id); setView("store"); }}
          onExplore={()=>setView("explore")}/>
      )}
      {(ordersOn() || requestsOn()) && barBasket && !checkout && !loginFor && !basketOpen && (
        <div className="ord-bar">
          <div className="ord-bar-m"><b>{I18N[lang].ord_bar_t}</b><span>{barBasket.items.reduce((n,x)=>n+x.quantity,0)} {I18N[lang].sc_items} · {fmtPrice(chatStore.basketSubtotal(shopId),lang)}</span></div>
          <button className="btn btn-accent" onClick={()=> !ordersOn()? setBasketOpen(true) : chatStore.signedIn()? setCheckout(shopId) : setLoginFor({ store:barBasket.store })}>{!ordersOn()? I18N[lang].by_bk_t : I18N[lang].ord_bar_btn} {I.arrow({width:16,height:16})}</button>
        </div>
      )}
      {loginFor && (
        <div className="co-scrim" onClick={()=>setLoginFor(null)}>
          <div className="co-sheet ord-login scroll-y" onClick={e=>e.stopPropagation()}>
            <div className="co-head">
              <div><b>{I18N[lang].ord_login_t}</b><span>{loginFor.store && loginFor.store.name}</span></div>
              <button className="cw-x" onClick={()=>setLoginFor(null)} aria-label={I18N[lang].g_close}>{I.x({width:17,height:17})}</button>
            </div>
            <div className="co-body">
              <SignInGate orderStore={chatStore} t={I18N[lang]} lang={lang} title={I18N[lang].ord_login_t}
                onDone={()=>{ const p = loginFor; setLoginFor(null); setTimeout(()=>{ if(p.product) chatRef.current.addToBasket(p.store, p.product); setCheckout(p.store.id); }, 0); }}/>
            </div>
          </div>
        </div>
      )}
      {favLogin && (
        <div className="co-scrim" onClick={()=>setFavLogin(null)}>
          <div className="co-sheet ord-login scroll-y" onClick={e=>e.stopPropagation()}>
            <div className="co-head">
              <div><b>{I18N[lang].fav_login_t}</b><span>{store.shopMeta(favLogin).name}</span></div>
              <button className="cw-x" onClick={()=>setFavLogin(null)} aria-label={I18N[lang].g_close}>{I.x({width:17,height:17})}</button>
            </div>
            <div className="co-body">
              <p style={{margin:"0 0 14px", color:"var(--soft)"}}>{I18N[lang].fav_login_d}</p>
              <SignInGate orderStore={chatStore} t={I18N[lang]} lang={lang} title={I18N[lang].fav_login_t}
                onDone={()=>{ const id = favLogin; setFavLogin(null);
                  setTimeout(()=>{ const cs = chatRef.current; if(!cs.isFav(id)) cs.toggleFav(id); toast(I18N[lang].fav_added); }, 0); }}/>
            </div>
          </div>
        </div>
      )}
      {basketOpen && !checkout && <BasketLoad store={store} chatStore={chatStore}/>}
      {basketOpen && !checkout && (
        <BasketPage orderStore={chatStore} shopStore={store} t={I18N[lang]} lang={lang}
          onClose={()=>setBasketOpen(false)}
          onOpenShop={(id)=>{ setBasketOpen(false); store.setShop(id); setView("store"); }}
          onCheckout={(sid)=>{ if(!ordersOn()){ sendRequest(sid); return; } const b = chatStore.baskets().find(x=>x.storeId===sid); if(chatStore.signedIn()) setCheckout(sid); else { setBasketOpen(false); setLoginFor({ store:b && b.store }); } }}/>
      )}
      {coBasket && (
        <CheckoutSheet basket={coBasket} orderStore={chatStore} shopStore={store} t={I18N[lang]} lang={lang}
          onClose={()=>setCheckout(null)}
          onSent={(order, shopRef)=>{
            setCheckout(null); setBasketOpen(false);
            setSent({ order, shop:shopRef });
            setTg({ order, shopId:order.shopId || checkout });
          }}/>
      )}
      {sent && (
        <OrderSentSheet order={sent.order} shop={sent.shop} t={I18N[lang]} lang={lang}
          onClose={()=>setSent(null)}
          onTrack={()=>{ setTrack({ shopId:sent.shop.id, orderId:sent.order.id }); setSent(null); }}/>
      )}
      {trackedOrder && (
        <OrderStatusPage order={trackedOrder} shop={store.shopMeta(track.shopId)} t={I18N[lang]} lang={lang}
          shopStore={store} orderStore={chatStore}
          onOpenShop={(id)=>{ setTrack(null); store.setShop(id); setView("store"); }}
          onClose={()=>setTrack(null)}
          onCancel={()=>{ store.cancelOrder(track.shopId, track.orderId, I18N[lang].co_cancelled_own, true); toast(I18N[lang].or_cancelled_toast); }}/>
      )}
      {tg && (
        <TelegramToast order={tg.order} shop={store.shopMeta(tg.shopId)} t={I18N[lang]} lang={lang}
          onClose={()=>setTg(null)}
          onOpen={()=>{ store.setShop(tg.shopId); setOrdersFocus(tg.order.id); setTg(null); setView(store.state.session? "dashboard" : "login"); }}/>
      )}
      {reqSent && <RequestSentSheet req={reqSent.req} shop={store.shopMeta(reqSent.shopId)} t={I18N[lang]} lang={lang} onClose={()=>setReqSent(null)}
        onSent={()=>{ chatStore.clearBasket(reqSent.shopId); delete pendingReq.current[reqSent.shopId]; }}/>}
      {/* the seller's Telegram message is now sent by the real bot (BotService), not simulated here */}
      {DevTour && <Suspense fallback={null}><DevTour view={view} setView={setView} store={store}/></Suspense>}
      <ToastHost/>
    </div>
  );
}

// PageNav, Switcher and the screenshot tour moved to DevTour.jsx (development only).

// the basket's products are loaded when it opens (they may come from pages never opened on this device)
function BasketLoad({ store, chatStore }){
  const ids = chatStore.baskets().flatMap(b=>b.items.map(it=>it.productId)).filter(Boolean);
  React.useEffect(()=>{ store.loadProducts(ids); }, [ids.join(",")]);
  return null;
}

// Boot: the public catalog, the session (refresh cookie) and the data the first screen needs are loaded before
// the first render, so the screens' synchronous reads see real data from the start.
const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(<div style={{minHeight:"100vh", display:"grid", placeItems:"center"}}><span className="tg-spin"></span></div>);
bootData(currentRoute()).then(s => {
  window.__bootState = s;
  if(window.__movedTo) history.replaceState(history.state, "", location.pathname.replace(/^\/[^/]+/, "/" + window.__movedTo));
  root.render(<App/>);
}).catch(e => {
  console.error("[boot]", e);
  window.__bootState = null;
  root.render(<App/>);
});

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { StoreView, BioView, LoginView, App, BasketLoad });
