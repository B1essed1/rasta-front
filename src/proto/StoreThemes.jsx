// ===== Storefront signature themes + full-screen Design studio =====
Object.assign(I18N.en, { ss_title:"Shop design", ss_looks:"Looks", ss_colors:"Colours", ss_layout:"Layout & type", ss_signature:"Signature", ss_classic:"Classic", ss_desktop:"Desktop", ss_phone:"Phone", ss_edit:"Edit design", ss_current:"Current look", ss_hint:"Hover to preview · click to apply · ← → to browse", ss_hint_m:"Tap a look to try it" });
Object.assign(I18N.ru, { ss_title:"Дизайн магазина", ss_looks:"Стили", ss_colors:"Цвета", ss_layout:"Сетка и шрифт", ss_signature:"Фирменные", ss_classic:"Классические", ss_desktop:"Компьютер", ss_phone:"Телефон", ss_edit:"Изменить дизайн", ss_current:"Текущий стиль", ss_hint:"Наведите — предпросмотр · клик — применить · ← → листать", ss_hint_m:"Нажмите на стиль, чтобы примерить" });
Object.assign(I18N.uz, { ss_title:"Do\u02bckon dizayni", ss_looks:"Uslublar", ss_colors:"Ranglar", ss_layout:"Joylashuv va shrift", ss_signature:"Maxsus", ss_classic:"Klassik", ss_desktop:"Kompyuter", ss_phone:"Telefon", ss_edit:"Dizaynni o\u02bczgartirish", ss_current:"Joriy uslub", ss_hint:"Ustiga olib boring — ko\u02bcrish · bosing — qo\u02bcllash · ← → varaqlash", ss_hint_m:"Sinab ko\u02bcrish uchun uslubni bosing" });

const _nm = (en, ru, uz)=> ({ en, ru, uz });
PALETTES.push(
  { id:"acid",   name:_nm("Acid","Кислотный","Kislota"), swatch:"#ffe600", bg:"#f2f0e6", surface:"#ffffff", ink:"#0d0d0d", soft:"#3a3a3a", line:"#0d0d0d", accent:"#ffe600", accentInk:"#0d0d0d" },
  { id:"indigo", name:_nm("Suzani night","Сюзане","Suzani"), swatch:"#f0b03f", bg:"#1b1847", surface:"#26225e", ink:"#fbf1dc", soft:"#c3b9e0", line:"rgba(251,241,220,.18)", accent:"#f0b03f", accentInk:"#1b1847" },
  { id:"nebula", name:_nm("Nebula","Туманность","Tumanlik"), swatch:"#ff5fb8", bg:"#120c26", surface:"#1e1640", ink:"#ffffff", soft:"#b9b0d9", line:"rgba(255,255,255,.14)", accent:"#ff5fb8", accentInk:"#ffffff" },
  { id:"press",  name:_nm("Press","Пресса","Matbuot"), swatch:"#e5202e", bg:"#f4efe7", surface:"#ffffff", ink:"#111111", soft:"#5f5a52", line:"#d6cdbf", accent:"#e5202e", accentInk:"#ffffff" },
  { id:"kraft",  name:_nm("Kraft","Крафт","Kraft"), swatch:"#d63a3a", bg:"#e8d9bd", surface:"#fffaf0", ink:"#2b2218", soft:"#6e5f49", line:"rgba(43,34,24,.2)", accent:"#d63a3a", accentInk:"#ffffff" },
  { id:"teal98", name:_nm("Desktop","Рабочий стол","Ish stoli"), swatch:"#008080", bg:"#008080", surface:"#c0c0c0", ink:"#000000", soft:"#1e1e1e", line:"#808080", accent:"#000080", accentInk:"#ffffff" },
);
PALETTES.forEach(p=>{ PALETTE_MAP[p.id] = p; });
FONT_CHOICES.push(
  { id:"unbounded", label:"Unbounded", display:"'Unbounded', sans-serif", body:"'Space Grotesk', sans-serif" },
  { id:"anton", label:"Anton", display:"'Anton', sans-serif", body:"'Hanken Grotesk', sans-serif" },
  { id:"caveat", label:"Caveat", display:"'Caveat', cursive", body:"'Hanken Grotesk', sans-serif" },
  { id:"pixel", label:"VT323", display:"'VT323', monospace", body:"'Space Mono', monospace" },
);
Object.assign(THEMES, {
  brutal: { id:"brutal", signature:true, name:_nm("Brutal","Брутал","Brutal"), layout:"grid", defaultPalette:"acid",
    vars:{ "--s-radius":"0px", "--s-radius-sm":"0px", "--s-shadow":"none", "--s-font-display":"'Unbounded', sans-serif", "--s-font-body":"'Space Grotesk', sans-serif", "--s-display-weight":"800", "--s-display-spacing":"-0.02em", "--s-up":"0.08em", "--s-up-tt":"uppercase" } },
  suzani: { id:"suzani", signature:true, name:_nm("Suzani","Сюзане","Suzani"), layout:"grid", defaultPalette:"indigo",
    vars:{ "--s-radius":"14px", "--s-radius-sm":"10px", "--s-shadow":"none", "--s-font-display":"'Instrument Serif', serif", "--s-font-body":"'Newsreader', serif", "--s-display-weight":"400", "--s-display-spacing":"0em", "--s-up":"0.16em", "--s-up-tt":"uppercase" } },
  aurora: { id:"aurora", signature:true, name:_nm("Aurora","Аврора","Avrora"), layout:"gallery", defaultPalette:"nebula",
    vars:{ "--s-radius":"22px", "--s-radius-sm":"14px", "--s-shadow":"none", "--s-font-display":"'Outfit', sans-serif", "--s-font-body":"'Outfit', sans-serif", "--s-display-weight":"700", "--s-display-spacing":"-0.02em", "--s-up":"0.04em", "--s-up-tt":"none" } },
  vogue:  { id:"vogue", signature:true, name:_nm("Cover story","Обложка","Muqova"), layout:"magazine", defaultPalette:"press",
    vars:{ "--s-radius":"0px", "--s-radius-sm":"0px", "--s-shadow":"none", "--s-font-display":"'Anton', sans-serif", "--s-font-body":"'Hanken Grotesk', sans-serif", "--s-display-weight":"400", "--s-display-spacing":"0em", "--s-up":"0.2em", "--s-up-tt":"uppercase" } },
  craft:  { id:"craft", signature:true, name:_nm("Scrapbook","Скрапбук","Albom"), layout:"grid", defaultPalette:"kraft",
    vars:{ "--s-radius":"4px", "--s-radius-sm":"3px", "--s-shadow":"0 8px 18px rgba(0,0,0,.14)", "--s-font-display":"'Caveat', cursive", "--s-font-body":"'Hanken Grotesk', sans-serif", "--s-display-weight":"700", "--s-display-spacing":"0em", "--s-up":"0.04em", "--s-up-tt":"none" } },
  retro:  { id:"retro", signature:true, name:_nm("Desktop 98","Рабочий стол 98","Ish stoli 98"), layout:"grid", defaultPalette:"teal98",
    vars:{ "--s-radius":"0px", "--s-radius-sm":"0px", "--s-shadow":"none", "--s-font-display":"'VT323', monospace", "--s-font-body":"'Space Mono', monospace", "--s-display-weight":"400", "--s-display-spacing":"0em", "--s-up":"0.04em", "--s-up-tt":"uppercase" } },
});

const SS_ORDER = ()=> [...Object.keys(THEMES).filter(k=>THEMES[k].signature), ...Object.keys(THEMES).filter(k=>!THEMES[k].signature)];
const ssFontId = (v)=>{ const f = FONT_CHOICES.find(x=>x.display===v["--s-font-display"]); return f? f.id : "grotesk"; };
const ssLookCfg = (id)=>{ const th = THEMES[id]; return { theme:id, layout:th.layout, font:ssFontId(th.vars), palette:th.defaultPalette, customPalette:null }; };

function ThemeMini({ id, cfg }){
  const th = THEMES[id], pal = (cfg && cfg.theme===id)? getPalette(cfg) : (PALETTE_MAP[th.defaultPalette] || PALETTES[0]);
  return (
    <span className={"ss-mini th-"+id} style={{"--m-bg":pal.bg, "--m-sf":pal.surface, "--m-ink":pal.ink, "--m-ac":pal.accent, "--m-ln":pal.line, "--m-font":th.vars["--s-font-display"]}}>
      <i className="cv"></i>
      <b>Aa</b>
      <span className="pr"><i></i><i></i><i></i><i></i></span>
    </span>
  );
}

function StoreStudio({ store, shop, cfg, t, lang, onClose }){
  const order = SS_ORDER();
  const [hover, setHover] = React.useState(null);
  const [tab, setTab] = React.useState("look");
  const [grp, setGrp] = React.useState("all");
  const [dev, setDev] = React.useState(()=> window.innerWidth < 820 ? "phone" : "desktop");
  const [box, setBox] = React.useState({w:800,h:600});
  const stageRef = React.useRef(null);
  const patch = (p)=> store.setCfg(shop.id, p);
  const apply = (id)=>{ setHover(null); patch(ssLookCfg(id)); };
  const idx = Math.max(0, order.indexOf(cfg.theme));
  const step = (d)=> apply(order[(idx + d + order.length) % order.length]);
  const prevCfg = hover && hover!==cfg.theme ? { ...cfg, ...ssLookCfg(hover) } : cfg;
  const shownId = hover || cfg.theme;

  React.useEffect(()=>{
    const el = stageRef.current; if(!el) return;
    const fit = ()=>{ const r = el.getBoundingClientRect(); setBox({ w:r.width, h:r.height }); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return ()=>ro.disconnect();
  }, []);
  React.useEffect(()=>{
    const k = (e)=>{ if(e.target.closest && e.target.closest("input,select,textarea")) return;
      if(e.key==="Escape") onClose(); if(e.key==="ArrowRight") step(1); if(e.key==="ArrowLeft") step(-1); };
    addEventListener("keydown", k); return ()=>removeEventListener("keydown", k);
  });
  React.useEffect(()=>{ document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);

  const VW = dev==="phone"? 390 : 1280, VH = dev==="phone"? 800 : 820;
  const narrow = box.w < 560;
  const sc = Math.max(.22, Math.min(1, (box.h-70)/(VH + (dev==="desktop"?36:0)), (box.w-(narrow?90:120))/VW));
  const list = order.filter(id=> grp==="all" || (grp==="sig") === !!THEMES[id].signature);
  const layouts = [["grid",t.db_layout_grid],["gallery",t.db_layout_gallery],["list",t.db_layout_list],["magazine",t.db_layout_mag]];

  return ReactDOM.createPortal(
    <div className="be-root ss-root" role="dialog" aria-label={t.ss_title}>
      <div className="be-top">
        <div className="be-ttl"><b>{t.ss_title}</b><span>rastashops.com/{shop.handle}</span></div>
        <div className="ss-dev">
          <button className={dev==="desktop"?"on":""} onClick={()=>setDev("desktop")}>{t.ss_desktop}</button>
          <button className={dev==="phone"?"on":""} onClick={()=>setDev("phone")}>{t.ss_phone}</button>
        </div>
        <button className="btn btn-accent btn-sm" onClick={onClose}>{I.check({width:15,height:15})} {t.be_done}</button>
      </div>

      <div className="be-stage" ref={stageRef}>
        <button className="be-nav l" onClick={()=>step(-1)} aria-label="Previous">{CC_I.back({width:22,height:22})}</button>
        {dev==="phone" ? (
          <div className="be-phone-wrap" style={{width:VW*sc, height:VH*sc}}>
            <div className="be-phone" style={{transform:"scale("+sc+")"}}>
              <div className="be-screen ss-screen scroll-y" key={"p"+prevCfg.theme}>
                <Storefront shop={shop} cfg={prevCfg} lang={lang} compact embedded/>
              </div>
            </div>
          </div>
        ) : (
          <div className="be-phone-wrap" style={{width:VW*sc, height:(VH+36)*sc}}>
            <div className="ss-browser" style={{width:VW, height:VH+36, transform:"scale("+sc+")"}}>
              <div className="ss-bbar"><span className="tl"><i></i><i></i><i></i></span><span className="u">rastashops.com/{shop.handle}</span></div>
              <div className="ss-bscreen scroll-y" key={"d"+prevCfg.theme}>
                <Storefront shop={shop} cfg={prevCfg} lang={lang} embedded/>
              </div>
            </div>
          </div>
        )}
        <button className="be-nav r" onClick={()=>step(1)} aria-label="Next">{CC_I.back({width:22,height:22,style:{transform:"scaleX(-1)"}})}</button>
        <div className="be-cap">
          <b>{THEMES[shownId].name[lang]}</b><span>{order.indexOf(shownId)+1} / {order.length}</span>
          {hover && hover!==cfg.theme && <em>{t.ss_current}: {THEMES[cfg.theme].name[lang]}</em>}
        </div>
      </div>

      <div className="be-panel">
        <div className="be-tabs">
          {[["look",t.ss_looks],["color",t.ss_colors],["layout",t.ss_layout]].map(([k,l])=><button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>)}
        </div>
        {tab==="look" && (
          <React.Fragment>
            <div className="be-groups">{[["all",t.be_all],["sig",t.ss_signature],["classic",t.ss_classic]].map(([g,l])=><button key={g} className={grp===g?"on":""} onClick={()=>setGrp(g)}>{l}{g==="sig" && <i>{t.vb_new}</i>}</button>)}</div>
            <div className="be-list ss-list" onMouseLeave={()=>setHover(null)}>
              {list.map(id=>(
                <button key={id} className={"bio-pick ss-pick"+(cfg.theme===id?" on":"")} onMouseEnter={()=>setHover(id)} onClick={()=>apply(id)}>
                  <ThemeMini id={id} cfg={cfg}/>
                  <span className="bio-pick-nm">{cfg.theme===id && I.check({width:13,height:13})} {THEMES[id].name[lang]}</span>
                </button>
              ))}
            </div>
            <div className="be-hint"><span className="d">{t.ss_hint}</span><span className="m">{t.ss_hint_m}</span></div>
          </React.Fragment>
        )}
        {tab==="color" && (
          <div className="be-sec">
            <button className="te-gen" style={{marginBottom:12}} onClick={()=>patch({palette:"custom", customPalette:genPalette()})}>{I.spark({width:14,height:14})} {t.db_generate}</button>
            <div className="palettes ss-pals">
              {PALETTES.map(p=>(
                <button key={p.id} className={"pal-btn"+(cfg.palette===p.id?" on":"")} onClick={()=>patch({palette:p.id, customPalette:null})} title={p.name[lang]}>
                  <span className="pal-strip"><i style={{background:p.bg}}></i><i style={{background:p.surface}}></i><i style={{background:p.accent}}></i><i style={{background:p.ink}}></i></span>
                  <span className="pal-name">{p.name[lang]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab==="layout" && (
          <div className="be-sec">
            <label className="be-lab">{t.db_layout}</label>
            <div className="be-chips">{layouts.map(([v,l])=><button key={v} className={cfg.layout===v?"on":""} onClick={()=>patch({layout:v})}>{l}</button>)}</div>
            <label className="be-lab">{t.db_font}</label>
            <div className="be-chips">{FONT_CHOICES.map(f=><button key={f.id} className={cfg.font===f.id?"on":""} style={{fontFamily:f.display}} onClick={()=>patch({font:f.id})}>{f.label.split(" ")[0]}</button>)}</div>
            <button className="lnk" style={{marginTop:16}} onClick={()=>patch(ssLookCfg(cfg.theme))}>{I.x({width:13,height:13})} {t.st_bio_reset}</button>
          </div>
        )}
      </div>
    </div>, document.body
  );
}

// what the browser's <button> styles gave .ss-sum-pv and its contents (app.css already resets font-family/color/border/background)
const SS_SUM_PV_BTN = { textAlign:"center", fontSize:"13.3333px", fontWeight:400, fontStyle:"normal", lineHeight:"normal",
  letterSpacing:"normal", wordSpacing:"normal", textTransform:"none", textIndent:0, textShadow:"none", boxSizing:"border-box" };
function DesignSummary({ store, shop, cfg, t, lang }){
  const [open, setOpen] = React.useState(false);
  const th = THEMES[cfg.theme] || THEMES.minimal, pal = getPalette(cfg);
  return (
    <div className="ss-sum">
      {/* port: was a <button>, but the embedded storefront has buttons inside (invalid nesting).
          Same look: the inherited button defaults are set inline. */}
      <div className="ss-sum-pv" role="button" tabIndex={0} onClick={()=>setOpen(true)} aria-label={t.ss_edit}
        onKeyDown={e=>{ if(e.key==="Enter" || e.key===" "){ e.preventDefault(); setOpen(true); } }}
        style={SS_SUM_PV_BTN}>
        <span className="ss-sum-in"><Storefront shop={shop} cfg={cfg} lang={lang} embedded/></span>
        <span className="ss-sum-cta">{I.layers({width:16,height:16})} {t.ss_edit}</span>
      </div>
      <div className="ss-sum-tx">
        <span className="be-lab">{t.ss_current}</span>
        <b>{th.name[lang]}</b>
        <span className="pal-strip ss-sum-pal"><i style={{background:pal.bg}}></i><i style={{background:pal.surface}}></i><i style={{background:pal.accent}}></i><i style={{background:pal.ink}}></i></span>
        <button className="btn btn-accent btn-sm" onClick={()=>setOpen(true)}>{I.layers({width:15,height:15})} {t.ss_edit}</button>
      </div>
      {open && <StoreStudio store={store} shop={shop} cfg={cfg} t={t} lang={lang} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

Object.assign(window, { StoreStudio, DesignSummary, ThemeMini });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { _nm, SS_ORDER, ssFontId, ssLookCfg, ThemeMini, StoreStudio, DesignSummary });
