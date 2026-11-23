// ===== Link in bio — full-screen design studio: always-visible phone preview + compact controls =====
Object.assign(I18N.en, { be_title:"Link in bio design", be_edit:"Edit design", be_done:"Done", be_tpl:"Templates", be_colors:"Colours", be_style:"Style", be_all:"All", be_hint:"Hover to preview · click to apply · ← → to browse", be_hint_m:"Tap a template to try it", be_current:"Current design", be_buttons:"Buttons" });
Object.assign(I18N.ru, { be_title:"Дизайн ссылки для био", be_edit:"Изменить дизайн", be_done:"Готово", be_tpl:"Шаблоны", be_colors:"Цвета", be_style:"Стиль", be_all:"Все", be_hint:"Наведите — предпросмотр · клик — применить · ← → листать", be_hint_m:"Нажмите на шаблон, чтобы примерить", be_current:"Текущий дизайн", be_buttons:"Кнопки" });
Object.assign(I18N.uz, { be_title:"Bio havola dizayni", be_edit:"Dizaynni o\u02bczgartirish", be_done:"Tayyor", be_tpl:"Shablonlar", be_colors:"Ranglar", be_style:"Uslub", be_all:"Hammasi", be_hint:"Ustiga olib boring — ko\u02bcrish · bosing — qo\u02bcllash · ← → varaqlash", be_hint_m:"Sinab ko\u02bcrish uchun shablonni bosing", be_current:"Joriy dizayn", be_buttons:"Tugmalar" });

const BE_W = 390, BE_H = 800;
const tplGroup = (x)=> x.group || (x.vivid? "vivid" : "classic");

function BioEditor({ store, shop, t, lang, onClose }){
  const st = store.settings(shop.id);
  const raw = st.bio || {};
  const cfg = bioCfgOf({ bio: raw });
  const [hover, setHover] = React.useState(null);
  const [tab, setTab] = React.useState("tpl");
  const [grp, setGrp] = React.useState("all");
  const [scale, setScale] = React.useState(.8);
  const stageRef = React.useRef(null), listRef = React.useRef(null);
  const save = (bio)=> store.setSettings(shop.id, { ...store.settings(shop.id), bio });
  const pick = (p)=> save({ ...raw, tpl:cfg.tpl, ...p });
  const list = BIO_TPLS.filter(x=> grp==="all" || tplGroup(x)===grp);
  const idx = BIO_TPLS.findIndex(x=>x.id===cfg.tpl);
  const shown = hover? BIO_TPLS.find(x=>x.id===hover) : null;
  const override = shown && shown.id!==cfg.tpl ? { tpl:shown.id, layout:shown.layout, bg:shown.bg, btn:shown.btn, radius:shown.radius, font:shown.font } : null;
  const cur = shown || BIO_TPLS[idx] || BIO_TPLS[0];
  const step = (dir)=>{ const n = BIO_TPLS[(idx + dir + BIO_TPLS.length) % BIO_TPLS.length]; setHover(null); save({ tpl:n.id }); };

  React.useEffect(()=>{
    const el = stageRef.current; if(!el) return;
    const fit = ()=>{ const r = el.getBoundingClientRect(); setScale(Math.max(.4, Math.min(1, (r.height-70)/BE_H, (r.width-110)/BE_W))); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return ()=>ro.disconnect();
  }, []);
  React.useEffect(()=>{
    const k = (e)=>{ if(e.target.closest && e.target.closest("input,select,textarea")) return;
      if(e.key==="Escape") onClose(); if(e.key==="ArrowRight") step(1); if(e.key==="ArrowLeft") step(-1); };
    addEventListener("keydown", k); return ()=>removeEventListener("keydown", k);
  });
  React.useEffect(()=>{ document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);
  React.useEffect(()=>{
    const el = listRef.current && listRef.current.querySelector(".bio-pick.on");
    if(el && listRef.current){ const L = listRef.current, r = el.getBoundingClientRect(), R = L.getBoundingClientRect();
      if(r.left < R.left || r.right > R.right) L.scrollBy({ left: r.left - R.left - 20, behavior:"smooth" });
      if(r.top < R.top || r.bottom > R.bottom) L.scrollBy({ top: r.top - R.top - 20, behavior:"smooth" }); }
  }, [cfg.tpl]);

  const groups = [["all",t.be_all],["concept",t.st_bio_concept],["vivid",t.st_bio_vivid],["classic",t.st_bio_classic]];
  const isVibe = VIBE_LAYOUTS.includes(cfg.layout);
  const chips = (opts, val, on)=> <div className="be-chips">{opts.map(([v,l])=><button key={v} className={val===v?"on":""} onClick={()=>on(v)}>{l}</button>)}</div>;

  return ReactDOM.createPortal(
    <div className="be-root" role="dialog" aria-label={t.be_title}>
      <div className="be-top">
        <div className="be-ttl"><b>{t.be_title}</b><span>rastashops.com/{st.handle}/link</span></div>
        <button className="btn btn-accent btn-sm" onClick={onClose}>{I.check({width:15,height:15})} {t.be_done}</button>
      </div>

      <div className="be-stage" ref={stageRef}>
        <button className="be-nav l" onClick={()=>step(-1)} aria-label="Previous">{CC_I.back({width:22,height:22})}</button>
        <div className="be-phone-wrap" style={{width:BE_W*scale, height:BE_H*scale}}>
          <div className="be-phone" style={{transform:"scale("+scale+")"}}>
            <div className="be-screen scroll-y" key={(override? override.tpl : cfg.tpl)}>
              <BioPage store={store} shopId={shop.id} lang={lang} onOpenShop={()=>{}} override={override}/>
            </div>
          </div>
        </div>
        <button className="be-nav r" onClick={()=>step(1)} aria-label="Next">{CC_I.back({width:22,height:22,style:{transform:"scaleX(-1)"}})}</button>
        <div className="be-cap">
          <b>{cur.name}</b><span>{(BIO_TPLS.indexOf(cur)+1)} / {BIO_TPLS.length}</span>
          {shown && shown.id!==cfg.tpl && <em>{t.be_current}: {(BIO_TPLS[idx]||{}).name}</em>}
        </div>
      </div>

      <div className="be-panel">
        <div className="be-tabs">
          {[["tpl",t.be_tpl],["color",t.be_colors],["style",t.be_style]].map(([k,l])=><button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>)}
        </div>
        {tab==="tpl" && (
          <React.Fragment>
            <div className="be-groups">{groups.map(([g,l])=><button key={g} className={grp===g?"on":""} onClick={()=>setGrp(g)}>{l}{g==="concept" && <i>{t.vb_new}</i>}</button>)}</div>
            <div className="be-list" ref={listRef} onMouseLeave={()=>setHover(null)}>
              {list.map(x=>(
                <button key={x.id} className={"bio-pick"+(cfg.tpl===x.id?" on":"")} onMouseEnter={()=>setHover(x.id)} onClick={()=>{ setHover(null); save({ tpl:x.id }); }}>
                  <BioThumb tpl={x.id}/>
                  <span className="bio-pick-nm">{cfg.tpl===x.id && I.check({width:13,height:13})} {x.name}</span>
                </button>
              ))}
            </div>
            <div className="be-hint"><span className="d">{t.be_hint}</span><span className="m">{t.be_hint_m}</span></div>
          </React.Fragment>
        )}
        {tab==="color" && (
          <div className="be-sec">
            <div className="bio-swatches be-sw">
              {Object.keys(BIO_BGS).map(id=>{ const b = BIO_BGS[id];
                return (
                  <button key={id} className={"bio-sw"+(cfg.bg===id?" on":"")} title={id} style={{background: b.a1? "conic-gradient("+b.base+" 0 50%,"+b.a1+" 0 75%,"+b.a2+" 0)" : b.base}} onClick={()=>pick({bg:id})}>
                    {cfg.bg===id && <span style={{color:b.ink, background:b.a1? "rgba(255,255,255,.85)" : "transparent", borderRadius:"50%", display:"flex", padding:2}}>{I.check({width:13,height:13})}</span>}
                  </button>
                ); })}
            </div>
          </div>
        )}
        {tab==="style" && (
          <div className="be-sec">
            <label className="be-lab">{t.st_bio_font}</label>
            {chips([["soft","Bricolage"],["grotesk","Space Grotesk"],["serif","Serif"],["outfit","Outfit"],["round","Unbounded"],["impact","Anton"],["hand","Caveat"],["pixel","Pixel"],["mono","Mono"]], cfg.font, v=>pick({font:v}))}
            <label className="be-lab">{t.st_bio_corners}</label>
            {chips([["square",t.rd_square],["round",t.rd_round],["pill",t.rd_pill]], cfg.radius, v=>pick({radius:v}))}
            {!isVibe && <React.Fragment>
              <label className="be-lab">{t.be_buttons}</label>
              {chips([["soft",t.bs_soft],["fill",t.bs_fill],["outline",t.bs_outline],["hard",t.bs_hard],["glass",t.bs_glass]], cfg.btn, v=>pick({btn:v}))}
            </React.Fragment>}
            <button className="lnk" style={{marginTop:14}} onClick={()=>save({ tpl:cfg.tpl })}>{I.x({width:13,height:13})} {t.st_bio_reset}</button>
          </div>
        )}
      </div>
    </div>, document.body
  );
}

function BioSummary({ store, shop, t, lang, onVisitBio }){
  const [open, setOpen] = React.useState(false);
  const st = store.settings(shop.id);
  const cfg = bioCfgOf(st);
  const tpl = BIO_TPLS.find(x=>x.id===cfg.tpl) || BIO_TPLS[0];
  return (
    <div className="bio-sum">
      <button className="bio-sum-th" onClick={()=>setOpen(true)} aria-label={t.be_edit}><BioThumb tpl={cfg.tpl} over={{bg:cfg.bg,font:cfg.font,radius:cfg.radius,btn:cfg.btn}}/></button>
      <div className="bio-sum-tx">
        <span className="be-lab">{t.be_current}</span>
        <b>{tpl.name}</b>
        <span className="share-url">rastashops.com/{st.handle}/link</span>
        <div className="bio-sum-acts">
          <button className="btn btn-accent btn-sm" onClick={()=>setOpen(true)}>{I.layers({width:15,height:15})} {t.be_edit}</button>
          <button className="btn btn-soft btn-sm" onClick={onVisitBio}>{I.eye({width:15,height:15})} {t.st_bio_view}</button>
        </div>
      </div>
      {open && <BioEditor store={store} shop={shop} t={t} lang={lang} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

Object.assign(window, { BioEditor, BioSummary });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { BE_W, BE_H, tplGroup, BioEditor, BioSummary });
