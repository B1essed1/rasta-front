// ===== Landing page =====
function PNav({ lang, setLang, onStart, onLogin, onExplore }){
  const t = I18N[lang];
  return (
    <div className="pnav">
      <div className="pnav-inner">
        <div className="brand"><Logo/> <BrandName/></div>
        <nav className="pnav-links">
          <a onClick={onExplore} className="nav-explore" style={{cursor:"pointer"}}>{I.search({width:14,height:14})} {t.mkt_nav}</a>
          <a href="#features">{t.nav_features}</a>
          <a href="#themes">{t.nav_themes}</a>
          <a href="#pricing">{t.nav_pricing}</a>
        </nav>
        <div className="pnav-right">
          <LangPill lang={lang} setLang={setLang}/>
          <button className="btn btn-ghost btn-sm" onClick={onLogin}>{t.nav_login}</button>
          <button className="btn btn-accent btn-sm" onClick={onStart}>{t.cta_start}</button>
          <NavMenu lang={lang} setLang={setLang}
            links={[[t.mkt_nav,onExplore],[t.nav_features,"#features"],[t.nav_themes,"#themes"],[t.nav_pricing,"#pricing"]]}
            actions={[[t.nav_login,onLogin],[t.cta_start,onStart,true]]}/>
        </div>
      </div>
    </div>
  );
}
function NavMenu({ lang, setLang, links, actions }){
  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{ if(!open) return; const k=(e)=>{ if(e.key==="Escape") setOpen(false); }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); }, [open]);
  return (
    <React.Fragment>
      <button className="pnav-burger" aria-label="Menu" onClick={()=>setOpen(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
      </button>
      {open && ReactDOM.createPortal(
        <div className="nm-scrim" onClick={()=>setOpen(false)}>
          <div className="nm-sheet" onClick={e=>e.stopPropagation()}>
            <div className="nm-head">
              <div className="brand"><Logo/> <BrandName/></div>
              <button className="nm-x" aria-label="Close" onClick={()=>setOpen(false)}>{I.x({width:18,height:18})}</button>
            </div>
            <nav className="nm-links">
              {links.map(([lab,go],i)=>(
                <a key={i} href={typeof go==="string"? go : undefined} onClick={()=>{ setOpen(false); if(typeof go==="function") go(); }}>{lab}{I.arrow({width:16,height:16})}</a>
              ))}
            </nav>
            <div className="nm-lang"><LangPill lang={lang} setLang={setLang}/></div>
            <div className="nm-acts">
              {actions.map(([lab,go,accent],i)=>(
                <button key={i} className={"btn "+(accent?"btn-accent":"btn-ghost")} onClick={()=>{ setOpen(false); go(); }}>{lab}</button>
              ))}
            </div>
          </div>
        </div>, document.body
      )}
    </React.Fragment>
  );
}
function LangPill({ lang, setLang }){
  return (
    <div className="lang">
      {["uz","ru","en"].map(l=>(
        <button key={l} className={lang===l?"on":""} onClick={()=>setLang(l)}>{I18N[l]._label}</button>
      ))}
    </div>
  );
}

// mini theme preview card (themes showcase)
function ThemeCard({ themeId, shop, lang, onPick }){
  const th = THEMES[themeId];
  const v = th.vars;
  const pal = PALETTE_MAP[th.defaultPalette] || PALETTES[0];
  const prods = shop.products.slice(0,4);
  const tr = v["--s-radius-sm"];
  return (
    <div className="theme-card" style={{"--tbg":pal.bg, "--tr":tr}} onClick={()=>onPick(themeId)}>
      <div className="tc-view" style={{background:pal.bg, color:pal.ink, fontFamily:v["--s-font-body"]}}>
        <div className="tc-shop">
          <div className="tc-av ph" style={{"--ph-tone":pal.swatch}}></div>
          <b style={{fontFamily:v["--s-font-display"], fontWeight:v["--s-display-weight"], letterSpacing:v["--s-display-spacing"]}}>{shop.name}</b>
        </div>
        <div className="tc-tiles">
          {prods.map(p=>(
            <div key={p.id} className="tc-tile" style={{background:pal.surface}}>
              <div className="tcimg ph" style={{"--ph-tone":p.tone, borderRadius:tr}}></div>
              <div className="tcmeta" style={{fontFamily:v["--s-font-display"]}}>
                <div style={{color:pal.ink}}>{p.name[lang]}</div>
                <div style={{color:pal.accent, marginTop:2}}>{fmtPrice(p.price,lang).replace(/\u202f?[^\d\u202f].*/, "")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tc-foot">
        <b style={{display:"flex",alignItems:"center",gap:8}}><span className="tc-swatch" style={{background:pal.accent}}></span>{th.name[lang]}</b>
        <span className="tc-go">{lang==="en"?"Preview":lang==="ru"?"\u041e\u0442\u043a\u0440\u044b\u0442\u044c":"Ko\u02bbrish"} {I.arrow({width:14,height:14})}</span>
      </div>
    </div>
  );
}

function Landing({ store, lang, setLang, onStart, onDemo, onPickTheme, onLogin, onExplore }){
  const t = I18N[lang];
  const rootRef = React.useRef(null);
  React.useEffect(()=>{
    const root = rootRef.current; if(!root) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // scroll progress line
    const bar = root.querySelector('.scroll-prog i');
    const onScroll = ()=>{
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const r = Math.min(1, Math.max(0, (window.scrollY||h.scrollTop)/max));
      if(bar) bar.style.transform = 'scaleX('+r+')';
    };
    window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
    let io;
    if(!reduce && 'IntersectionObserver' in window){
      root.classList.add('reveal-on');
      io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting){ e.target.setAttribute('data-in','1'); io.unobserve(e.target); } });
      }, { threshold:0.12, rootMargin:'0px 0px -7% 0px' });
      root.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
    }
    return ()=>{ window.removeEventListener('scroll', onScroll); if(io) io.disconnect(); };
  }, []);
  React.useEffect(()=>{ store.loadLanding && store.loadLanding(); }, []);
  const hero = { ...store.shopMeta("lola"), products: publicProducts(store, "lola") };
  const heroCfg = { theme:"boutique", palette:"clay", layout:"grid", font:"serif" };
  const feats = [
    { ic:I.bolt, t:t.f1_t, d:t.f1_d },
    { ic:I.layers, t:t.f2_t, d:t.f2_d, alt:true },
    { ic:I.barcode, t:t.f3_t, d:t.f3_d },
  ];
  return (
    <div className="lp" ref={rootRef}>
      <div className="scroll-prog"><i></i></div>
      <PNav lang={lang} setLang={setLang} onStart={onStart} onLogin={onLogin} onExplore={onExplore}/>

      <LpHero store={store} t={t} lang={lang} onStart={onStart} onExplore={onExplore}/>

      {/* logo strip */}
      <section className="strip">
        <div className="wrap strip-row">
          <span className="lbl">{t.trusted}:</span>
          <div className="marquee">
            <div className="marquee-track">
              {["Lola Atelier","Non & Co","Gulnoza Beauty","Choyxona","Silk Road Goods","Bahor Home","Tashkent Kicks","Anor Ceramics"].concat(["Lola Atelier","Non & Co","Gulnoza Beauty","Choyxona","Silk Road Goods","Bahor Home","Tashkent Kicks","Anor Ceramics"]).map((n,i)=>(
                <span key={i} className="strip-name">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="sect" id="features">
        <div className="wrap">
          <div className="sect-head" data-reveal>
            <span className="kicker">{t.feat_kicker}</span>
            <h2>{t.feat_title}</h2>
          </div>
          <div className="feat-grid">
            {feats.map((f,i)=>(
              <div key={i} className={"feat"+(f.alt?" alt":"")} data-reveal style={{"--ri":i}}>
                <div className="ic">{f.ic()}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* themes */}
      <section className="wrap" id="themes">
        <div className="themes-sect">
          <div className="wrap">
            <div className="sect-head" data-reveal>
              <span className="kicker">{t.themes_kicker}</span>
              <h2>{t.themes_title}</h2>
              <p>{t.looks_note}</p>
            </div>
            <div className="theme-row">
              {Object.keys(THEMES).map((id,i)=>(
                <div key={id} data-reveal style={{"--ri":i}}>
                  <ThemeCard themeId={id} shop={hero} lang={lang} onPick={onPickTheme}/>
                </div>
              ))}
            </div>
            <div className="palette-strip" data-reveal>
              {PALETTES.map(p=>(
                <span key={p.id} className="pal-dot" title={p.name[lang]}>
                  <span className="pd-sw"><i style={{background:p.bg}}></i><i style={{background:p.accent}}></i><i style={{background:p.ink}}></i></span>
                  <em>{p.name[lang]}</em>
                </span>
              ))}
              <span className="pal-dot gen">
                <span className="pd-sw gen-sw"></span>
                <em>{t.db_custom}</em>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* explore band */}
      <section className="sect" style={{paddingTop:6}}>
        <div className="wrap">
          <div className="explore-band" data-reveal>
            <div className="eb-text">
              <span className="kicker">rasta bozor</span>
              <h2>{t.explore_band_t}</h2>
              <p>{t.explore_band_d}</p>
              <button className="btn btn-accent btn-lg" onClick={onExplore}>{I.search({width:18,height:18})} {t.mkt_nav} {I.arrow({width:18,height:18})}</button>
            </div>
            <div className="eb-shops">
              {SHOP_ORDER.slice(0,6).map(id=>{ const s=store.shopMeta(id); const pal=getPalette(store.cfg(id)); return (
                <div key={id} className="eb-shop ph" style={{"--ph-tone":s.cover||pal.swatch}} onClick={onExplore}>
                  <span className="eb-logo ph" style={{"--ph-tone":pal.swatch}}><span className="ph-init" style={{fontSize:13}}>{s.initials}</span></span>
                  <b>{s.name}</b>
                </div>
              );})}
            </div>
          </div>
        </div>
      </section>

      {/* steps */}
      <section className="sect">
        <div className="wrap">
          <div className="sect-head" data-reveal><span className="kicker">rastashops.com</span><h2>{t.steps_title}</h2></div>
          <div className="steps">
            {[[t.s1,t.s1d],[t.s2,t.s2d],[t.s3,t.s3d]].map((s,i)=>(
              <div key={i} className="step" data-reveal style={{"--ri":i}}><div className="barline"></div><h3>{s[0]}</h3><p>{s[1]}</p></div>
            ))}
          </div>
        </div>
      </section>

      <LpPricing t={t} lang={lang} onStart={onStart}/>

      {/* cta band */}
      <section className="sect" style={{paddingTop:0}}>
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <h2>{t.cta_band_t}</h2>
            <p>{t.cta_band_d}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={onStart}>{t.cta_start_free}</button>
              <button className="btn btn-ghost btn-lg" onClick={onDemo}>{t.cta_demo}</button>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="lp-footer">
        <div className="wrap lp-footer-grid">
          <div>
            <div className="brand"><Logo/> <BrandName/></div>
            <p className="foot-tag">{t.footer_tag}</p>
          </div>
          <div className="foot-cols">
            <div className="foot-col"><h4>{t.nav_features}</h4><a>{t.f1_t}</a><a>{t.f2_t}</a><a>{t.f3_t}</a></div>
            <div className="foot-col"><h4>rasta</h4><a>{t.nav_themes}</a><a>{t.nav_pricing}</a><a>{t.nav_login}</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { NavMenu, Landing, PNav, LangPill, ThemeCard });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { PNav, NavMenu, LangPill, ThemeCard, Landing });
