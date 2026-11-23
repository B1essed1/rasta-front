// Prototype-only page navigator + screenshot tour (moved here from App.jsx unchanged).
// Loaded only in development (import.meta.env.DEV): the parity harness (scripts/compare.mjs) drives
// the tour through window.__rastaGo and shotSteps. Not part of production builds.

const PAGE_MAP = [
  { g:"Public", items:[
    { id:"landing", lab:"Landing", view:"landing" },
    { id:"explore", lab:"Explore (bozor)", view:"explore" },
    { id:"store", lab:"Storefront", view:"store" },
    { id:"bio", lab:"Link in bio", view:"bio" },
  ]},
  { g:"Sign in", items:[
    { id:"login", lab:"Log in (Telegram)", view:"login", logout:true },
    { id:"onboarding", lab:"Create shop", view:"onboarding" },
  ]},
  { g:"Buyer", items:[
    { id:"profile", lab:"My profile", view:"profile" },
    { id:"basket", lab:"Basket", view:"explore", basket:true, shopping:true },
    { id:"request", lab:"Basket link (/b/…)", view:"request", requests:true },
  ]},
  { g:"Seller dashboard", items:[
    { id:"d-home", lab:"Home", tab:"home" },
    { id:"d-requests", lab:"Requests", tab:"requests", requests:true },
    { id:"d-orders", lab:"Orders", tab:"orders", orders:true },
    { id:"d-chats", lab:"Chats", tab:"chats", chat:true },
    { id:"d-products", lab:"Products", tab:"products" },
    { id:"d-inventory", lab:"Inventory", tab:"inventory" },
    { id:"d-sales", lab:"Sales", tab:"sales" },
    { id:"d-team", lab:"Team", tab:"team" },
    { id:"d-reviews", lab:"Reviews", tab:"reviews", reviews:true },
    { id:"d-design", lab:"Design", tab:"design" },
    { id:"d-settings", lab:"Settings", tab:"settings" },
    { id:"d-pos", lab:"Scan & sell", tab:"home", pos:true },
  ]},
];
// hide pages of switched-off features (online orders, reviews)
PAGE_MAP.forEach(g=>{ g.items = g.items.filter(it=> !(it.orders && !ordersOn()) && !(it.reviews && !reviewsOn()) && !(it.chat && !chatOn()) && !(it.requests && !requestsOn()) && !(it.shopping && !ordersOn() && !requestsOn())); });
const PAGE_FLAT = PAGE_MAP.flatMap(g=>g.items.map(it=>({ ...it, g:g.g })));

// ===== Screenshot tour — walks every page + key states (popovers, sheets, modals, expanded rows),
// captures each as a FULL-LENGTH image (no scrolling needed) at desktop and phone width, and zips them
// with an index, ready to hand to Claude Code. Runs inside the prototype; nothing is sent anywhere. =====
// html2canvas-pro: same API as html2canvas, but understands modern CSS colours (oklab / oklch / color() from color-mix)
const SHOT_LIBS = ["https://unpkg.com/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js", "https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"];
const SHOT_W = [["desktop",1280],["phone",390]];
const SHOT_CSS = ".shot-expand .scroll-y,.shot-expand .db-body,.shot-expand .db-main{overflow:visible!important;height:auto!important;max-height:none!important}.shot-expand .db{height:auto!important;min-height:100vh}.shot-expand .pgnav,.shot-expand .pgnav-panel,.shot-expand .pgnav-scrim{display:none!important}";
function shotLoad(src){ return new Promise((ok,bad)=>{ if(document.querySelector('script[data-shot="'+src+'"]')) return ok(); const s = document.createElement("script"); s.src = src; s.dataset.shot = src; s.onload = ok; s.onerror = ()=>bad(new Error("Could not load "+src)); document.head.appendChild(s); }); }
const shotWait = (ms)=> new Promise(r=>setTimeout(r,ms));
const shotQ = (sel)=> document.querySelector(sel);
const shotClick = (sel)=>{ const el = typeof sel==="string"? shotQ(sel) : sel; if(el){ el.click(); return true; } return false; };
const shotByText = (sel, txt)=> [...document.querySelectorAll(sel)].find(el=> txt && el.textContent.toLowerCase().includes(String(txt).toLowerCase()));
function shotEsc(){ [window, document].forEach(tg=>{ try{ tg.dispatchEvent(new KeyboardEvent("keydown", { key:"Escape", bubbles:true })); }catch(e){} }); document.querySelectorAll(".sfx-scrim,.ex-mega-scrim,.co-scrim,.dm-scrim,.ez-dlg-scrim").forEach(el=>{ try{ el.click(); }catch(e){} }); }
function shotSteps(){
  const t = I18N[window.__lang||"en"];
  const G = async (id)=>{ shotEsc(); await shotWait(150); window.__rastaGo && window.__rastaGo(id); try{ window.scrollTo(0,0); }catch(e){} };
  return [
    ["landing", "Landing page", ()=>G("landing")],
    ["explore", "Explore / marketplace", ()=>G("explore")],
    ["explore-category-menu", "Explore — 'All categories' mega menu open", ()=>shotClick(".ex-cat-all")],
    ["explore-category-picked", "Explore — a category picked: product results + filter chips", async()=>{ shotEsc(); await shotWait(150); const b = document.querySelectorAll(".ex-cat-strip button")[1]; b && b.click(); }],
    ["explore-filter-popover", "Explore — a filter chip opened (values with counts)", ()=>{ const c = document.querySelectorAll(".sfx-row .sfx-chip"); (c[1]||c[0]) && (c[1]||c[0]).click(); }],
    ["explore-all-filters", "Explore — 'All filters' sheet", async()=>{ shotEsc(); await shotWait(150); shotClick(".sfx-chip.all"); }],
    ["storefront", "Storefront (shop page) — full length incl. 'About the shop'", ()=>G("store")],
    ["storefront-sort", "Storefront — Sort popover", ()=>shotClick(".storefront .sfx-row .sfx-chip")],
    ["storefront-filter-popover", "Storefront — a filter chip opened", async()=>{ shotEsc(); await shotWait(150); const c = document.querySelectorAll(".storefront .sfx-row .sfx-chip"); c[1] && c[1].click(); }],
    ["storefront-price-popover", "Storefront — Price popover (presets + own range)", async()=>{ shotEsc(); await shotWait(150); const c = shotByText(".storefront .sfx-row .sfx-chip", t.sfx_price); c && c.click(); }],
    ["storefront-all-filters", "Storefront — 'All filters' sheet", async()=>{ shotEsc(); await shotWait(150); shotClick(".storefront .sfx-chip.all"); }],
    ["product-page", "Product page", async()=>{ shotEsc(); await shotWait(150); shotClick(".storefront .pcard"); }],
    ["product-variant-picked", "Product page — size/colour picked, price + 'Add to basket'", ()=>{ document.querySelectorAll(".opt-values").forEach(g=>{ const b = g.querySelector("button:not([disabled])"); b && b.click(); }); }],
    ["product-added", "Product page — after 'Add to basket' (basket bar at the bottom)", ()=>shotClick(".buy-box .sf-btn-accent")],
    ["basket", "Basket page (one basket per shop, 'Send to shop')", ()=>window.dispatchEvent(new CustomEvent("rasta-open-basket"))],
    ["basket-sent", "'Your basket is ready' sheet — code, link, Send to @shop", ()=>shotClick(".by-bk-f .by-btn.primary")],
    ["seller-bot-message", "What the seller gets: Telegram bot message (simulated)", ()=>shotClick(".co-scrim")],
    ["basket-link-page", "Public basket link page rastashops.com/b/CODE", ()=>G("request")],
    ["link-in-bio", "Link-in-bio page", ()=>G("bio")],
    ["buyer-profile", "Buyer profile (saved shops, settings)", ()=>G("profile")],
    ["login", "Seller login (Telegram)", ()=>G("login")],
    ["onboarding", "Create a shop — onboarding", ()=>G("onboarding")],
    ["dash-home", "Dashboard — Home", ()=>G("d-home")],
    ["dash-requests", "Dashboard — Requests (basket requests)", ()=>G("d-requests")],
    ["dash-request-open", "Dashboard — a request expanded (items, stock warnings, actions)", ()=>shotClick(".db-body .stk-row")],
    ["dash-request-sold", "Dashboard — 'Mark sold' dialog (agreed total + payment)", ()=>{ const b = shotByText(".db-body button", t.rq_sell); b && b.click(); }],
    ["dash-products", "Dashboard — Products list", ()=>G("d-products")],
    ["dash-product-add", "Dashboard — Add product form", ()=>shotClick(".db-sec-head .btn-accent")],
    ["dash-product-add-options", "Add product — sizes/colours/options opened", ()=>{ const b = shotByText("button", t.pa_opts_add); b && b.click(); }],
    ["dash-inventory", "Dashboard — Inventory (stock)", ()=>G("d-inventory")],
    ["dash-inventory-history", "Inventory — History table", ()=>{ const b = shotByText("button", t.inv_tab_hist); b && b.click(); }],
    ["dash-history-dates", "Inventory History — date range picker open", ()=>shotClick(".dr-btn")],
    ["dash-history-reports", "Inventory History — Reports", async()=>{ shotEsc(); await shotWait(150); const b = shotByText(".hx-seg button", t.hx_reports); b && b.click(); }],
    ["dash-sales", "Dashboard — Sales (stats + table)", ()=>G("d-sales")],
    ["dash-sales-row", "Sales — a sale expanded", ()=>shotClick(".db-body .stk-row")],
    ["dash-sales-manual", "Sales — manual sale dialog", ()=>{ const b = shotByText(".db-sec-head button", t.sl_manual); b && b.click(); }],
    ["dash-team", "Dashboard — Team", ()=>G("d-team")],
    ["dash-design", "Dashboard — Design", ()=>G("d-design")],
    ["dash-settings", "Dashboard — Settings", ()=>G("d-settings")],
    ["dash-scan-sell", "Dashboard — Scan & sell (POS)", ()=>G("d-pos")],
  ];
}
async function runShotTour(setUi){
  try{
    setUi({ msg:"Loading capture tools…" });
    for(const src of SHOT_LIBS) await shotLoad(src);
    const zip = new window.JSZip();
    const steps = shotSteps();
    const index = ["# rastashops prototype — screenshots", "", "Each step = one state of the prototype, captured full-length at desktop (1280px) and phone (390px) width.", "Steps are in click order: each one does the action written next to it on top of the previous state.", ""];
    let n = 0;
    for(const [key, label, act] of steps){
      n++;
      const no = String(n).padStart(2,"0");
      setUi({ msg:"Capturing "+n+" / "+steps.length+": "+label });
      try{ await act(); }catch(e){}
      await shotWait(1300);
      index.push("- **"+no+"-"+key+"** — "+label);
      for(const [wn, w] of SHOT_W){
        try{
          const canvas = await window.html2canvas(document.documentElement, { windowWidth:w, width:w, scale:1, useCORS:true, logging:false, backgroundColor:"#ffffff",
            ignoreElements:(el)=> el.classList && (el.classList.contains("shot-ui") || el.classList.contains("pgnav") || el.classList.contains("pgnav-panel") || el.classList.contains("pgnav-scrim")),
            onclone:(doc)=>{ doc.documentElement.classList.add("shot-expand"); const st = doc.createElement("style"); st.textContent = SHOT_CSS; doc.head.appendChild(st); } });
          const blob = await new Promise(r=>canvas.toBlob(r, "image/png"));
          if(blob) zip.file(no+"-"+key+"-"+wn+".png", blob);
        }catch(e){ index.push("  - ("+wn+" capture failed: "+(e && e.message)+")"); }
      }
    }
    zip.file("INDEX.md", index.join("\n"));
    setUi({ msg:"Packing the zip…" });
    const out = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(out);
    shotEsc(); window.__rastaGo && window.__rastaGo("landing");
    setUi({ msg:"Done — "+steps.length+" states × 2 widths.", url });
    try{ const a = document.createElement("a"); a.href = url; a.download = "rastashops-screens.zip"; document.body.appendChild(a); a.click(); a.remove(); }catch(e){}
  }catch(e){ setUi({ msg:"Capture stopped: "+(e && e.message || e), err:true }); }
}
function ShotTourUI({ ui, onClose }){
  if(!ui) return null;
  return ReactDOM.createPortal(
    <div className="shot-ui" style={{position:"fixed", left:16, bottom:16, zIndex:9999, maxWidth:360, background:"#16150f", color:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 16px 40px rgba(0,0,0,.35)", fontSize:14, lineHeight:1.4}}>
      <b style={{display:"block", marginBottom:6}}>📸 Screenshot tour</b>
      <span>{ui.msg}</span>
      {!ui.url && !ui.err && <div style={{fontSize:12, opacity:.7, marginTop:6}}>Don't click anything until it finishes.</div>}
      <div style={{display:"flex", gap:8, marginTop:10}}>
        {ui.url && <a href={ui.url} download="rastashops-screens.zip" style={{background:"#e8573a", color:"#fff", padding:"8px 12px", borderRadius:10, fontWeight:700, textDecoration:"none"}}>Download zip</a>}
        {(ui.url || ui.err) && <button onClick={onClose} style={{background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,.3)", padding:"8px 12px", borderRadius:10}}>Close</button>}
      </div>
    </div>, document.body);
}

function PageNav({ view, setView, store }){
  const [shot, setShot] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [cur, setCur] = React.useState(()=>{ try{ return localStorage.getItem("rasta.pagenav") || null; }catch(e){ return null; } });
  const [mini, setMini] = React.useState(()=>{ try{ return localStorage.getItem("rasta.switcher")==="0"; }catch(e){ return false; } });
  // keep the indicator honest when you navigate inside the app
  const live = (()=>{
    const c = PAGE_FLAT.find(p=>p.id===cur);
    if(view==="dashboard" && c && c.tab) return c;
    if(view==="dashboard") return PAGE_FLAT.find(p=>p.id==="d-home");
    return PAGE_FLAT.find(p=>p.view===view) || PAGE_FLAT[0];
  })();
  const idx = PAGE_FLAT.findIndex(p=>p.id===live.id);
  React.useEffect(()=>{ window.__rastaGo = (id)=>{ const p = PAGE_FLAT.find(x=>x.id===id); if(p) go(p); }; window.__rastaPages = PAGE_MAP; window.__rastaCur = live.id; try{ parent.postMessage({ rastaPage: live.id }, "*"); }catch(e){} });
  function go(p){
    setCur(p.id); try{ localStorage.setItem("rasta.pagenav", p.id); }catch(e){}
    setOpen(false);
    if(p.tab){
      const ss = store.staffShops && store.staffShops();
      if(!store.state.session || (ss && p.tab!=="home")) store.login("+998 97 700 30 40", { name:"Malika Yusupova" });
      window.__pendingTab = p.tab; window.__pendingPos = !!p.pos;
      if(view==="dashboard") dispatchEvent(new CustomEvent("rasta-tab", { detail:{ tab:p.tab, pos:!!p.pos } }));
      else setView("dashboard");
    } else {
      if(p.logout && store.state.session) store.logout();
      setView(p.view);
      if(p.basket) setTimeout(()=>dispatchEvent(new CustomEvent("rasta-open-basket")), 60);
    }
    try{ window.scrollTo(0,0); }catch(e){}
  }
  const step = (d)=> go(PAGE_FLAT[(idx + d + PAGE_FLAT.length) % PAGE_FLAT.length]);
  function toggleMini(){ setMini(m=>{ try{ localStorage.setItem("rasta.switcher", m? "1" : "0"); }catch(e){} return !m; }); setOpen(false); }
  if(mini) return (
    <div className="pgnav mini"><button className="pgnav-lab" onClick={toggleMini} title="Show page navigator">{I.layers({width:15,height:15})}</button></div>
  );
  return (
    <>
      {open && <div className="pgnav-scrim" onClick={()=>setOpen(false)}></div>}
      {open && (
        <div className="pgnav-panel">
          <div className="pgnav-ph"><b>All pages</b><span>{PAGE_FLAT.length} screens · prototype only</span>
            <button style={{marginLeft:"auto", background:"#16150f", color:"#fff", border:0, borderRadius:10, padding:"7px 12px", fontWeight:700, cursor:"pointer"}}
              onClick={()=>{ setOpen(false); runShotTour(setShot); }}>📸 Screenshot every screen</button></div>
          {PAGE_MAP.map(g=>(
            <div key={g.g} className="pgnav-g">
              <div className="pgnav-gt">{g.g}</div>
              <div className="pgnav-grid">
                {g.items.map(it=>{ const n = PAGE_FLAT.findIndex(p=>p.id===it.id)+1;
                  return <button key={it.id} className={"pgnav-it"+(it.id===live.id?" on":"")} onClick={()=>go(it)}><i>{n}</i>{it.lab}</button>; })}
              </div>
            </div>
          ))}
        </div>
      )}
      <ShotTourUI ui={shot} onClose={()=>setShot(null)}/>
      <div className="pgnav">
        <button className="pgnav-lab" onClick={toggleMini} title="Hide">rastashops.com</button>
        <button className="pgnav-arr" onClick={()=>step(-1)} aria-label="Previous page">{I.back({width:16,height:16})}</button>
        <button className={"pgnav-cur"+(open?" on":"")} onClick={()=>setOpen(o=>!o)}>
          <small>{live.g} · {idx+1}/{PAGE_FLAT.length}</small><b>{live.lab}</b>
        </button>
        <button className="pgnav-arr" onClick={()=>step(1)} aria-label="Next page">{I.arrow({width:16,height:16})}</button>
      </div>
    </>
  );
}

function Switcher({ views, view, setView }){
  const [open, setOpen] = React.useState(()=>{
    try{ const v = localStorage.getItem("rasta.switcher"); if(v===null) return window.innerWidth > 560; return v !== "0"; }catch(e){ return true; }
  });
  function toggle(){
    setOpen(o=>{ try{ localStorage.setItem("rasta.switcher", o? "0" : "1"); }catch(e){} return !o; });
  }
  return (
    <div className={"switcher"+(open?"":" mini")}>
      <button className="lab" onClick={toggle} title="Preview navigation">{open? "rastashops.com" : I.layers({width:15,height:15})}</button>
      {open && views.map(([id,lab,ic])=>(
        <button key={id} className={view===id?"on":""} onClick={()=>setView(id)}>{ic({width:15,height:15})} {lab}</button>
      ))}
    </div>
  );
}

export default PageNav;

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { PAGE_MAP, PAGE_FLAT, SHOT_LIBS, SHOT_W, SHOT_CSS, shotLoad, shotWait, shotQ, shotClick, shotByText, shotEsc, shotSteps, runShotTour, ShotTourUI, PageNav, Switcher });
