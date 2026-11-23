// ===== Onboarding: Telegram login → shop → brand → plan → publish =====
const FONT_FOR = { minimal:"grotesk", boutique:"serif", bold:"space", playful:"outfit" };
function slugify(s){ return (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"").slice(0,22); }
function initialsFrom(s){ const w=(s||"").trim().split(/\s+/).filter(Boolean); const a=(w[0]&&w[0][0])||"R"; const b=(w[1]&&w[1][0])||""; return (a+b).toUpperCase(); }
const PLANS = [
  { id:"starter", price:99000, yprice:990000 },
  { id:"pro", price:199000, yprice:1990000, popular:true },
];
const PLAN_FEATS = {
  starter:{ en:["Unlimited products","All looks & palettes","Stock per size + auto barcodes","Scan to sell (camera or scanner)","Basic sales stats · UZ / RU / EN"],
    ru:["Безлимит товаров","Все стили и палитры","Остатки по размерам + штрихкоды","Продажа сканером","Базовая статистика · UZ / RU / EN"],
    uz:["Cheksiz mahsulot","Barcha ko‘rinish va palitra","O‘lcham bo‘yicha qoldiq + shtrix-kod","Skanerlab sotish","Asosiy sotuv statistikasi · UZ / RU / EN"] },
  pro:{ en:["Everything in Starter","Printable barcode labels in bulk","Full analytics & CSV export","Custom domain","Sponsored spots in rasta bozor (marked “Ad”)"],
    ru:["Всё из Starter","Массовая печать этикеток","Полная аналитика и CSV","Свой домен","Рекламные места в rasta bozor (с пометкой «Реклама»)"],
    uz:["Starter’dagi hammasi","Yorliqlarni ommaviy chop etish","To‘liq tahlil va CSV","Shaxsiy domen","rasta bozorda reklama o‘rinlari («Reklama» belgisi bilan)"] },
};
const WIZ_KEY = "rasta.wizard";

function ObProgress({ steps, cur }){
  return (
    <div className="ob-prog">
      {steps.map((s,i)=>(
        <div key={i} className={"ob-prog-step"+(i<cur?" done":"")+(i===cur?" on":"")}>
          <span className="ob-dot">{i<cur? I.check({width:14,height:14}) : i+1}</span>
          <span className="ob-prog-lab">{s}</span>
        </div>
      ))}
    </div>
  );
}

function Onboarding({ store, lang, setLang, onCancel, goDashboard, goStore }){
  const t = I18N[lang];
  const resume = React.useMemo(()=>{ try{ return JSON.parse(localStorage.getItem(WIZ_KEY))||null; }catch(e){ return null; } },[]);
  const [step, setStep] = React.useState(resume && resume.d && resume.d.tgVerified ? resume.step : 0);
  const [done, setDone] = React.useState(false);
  const [d, setD] = React.useState(resume && resume.d && resume.d.tgVerified ? resume.d : resume? { ...resume.d, phone:"" } : { phone:"", name:"", handle:"", handleEdited:false, type:"fashion", city:"Tashkent",
    tagline:"", instagram:"", telegram:"", theme:"minimal", palette:"mist", paletteEdited:false, plan:"starter", billing:"m" });
  function set(p){ setD(s=>({ ...s, ...p })); }
  React.useEffect(()=>{
    if(!done && d.phone) { try{ localStorage.setItem(WIZ_KEY, JSON.stringify({ step, d })); }catch(e){} }
  },[step, d, done]);

  const labels = [t.ob_s_account, t.ob_s_shop, t.ob_s_brand, t.ob_s_plan, t.ob_s_publish];
  const handle = d.handleEdited ? d.handle : slugify(d.name);
  const taken = SHOP_ORDER.some(id=> store.settings(id) && store.settings(id).handle===handle && handle);
  const nameOk = d.name.trim().length>=2 && handle.length>=3 && !taken;
  const plan = PLANS.find(p=>p.id===d.plan);
  const trialEnd = (()=>{ const x=new Date(); x.setMonth(x.getMonth()+6); return x.toLocaleDateString(lang==="ru"?"ru-RU":lang==="uz"?"uz-UZ":"en-GB",{day:"numeric",month:"long",year:"numeric"}); })();

  function publish(){
    setStep(99);
    setTimeout(()=>{
      const palObj = PALETTE_MAP[d.palette] || PALETTES[0];
      const tag = d.tagline.trim() || t.ob_tagline_ph;
      const shop = {
        id: handle, handle, name: d.name.trim(),
        tagline:{ en:tag, ru:tag, uz:tag }, location:d.city, type:d.type,
        cover: palObj.swatch, rating:5.0, theme:d.theme, palette:d.palette,
        layout: THEMES[d.theme].layout, font: FONT_FOR[d.theme], initials: initialsFrom(d.name),
        moderation:"approved", cats:{ en:["New"], ru:["Новое"], uz:["Yangi"] }, catIds:[], products:[],
      };
      const settings = { ...defaultSettings(shop), plan:d.plan, phone:d.phone,
        contacts:{ instagram:(d.instagram||"").trim() || handle, telegram:(d.telegram||"").trim() || handle, phone:d.phone }, trialDays:90 };
      store.addShop(shop, settings);
      store.login(d.phone);
      try{ localStorage.removeItem(WIZ_KEY); }catch(e){}
      setDone(true);
    }, 1100);
  }

  if(done){
    return (
      <ObShell lang={lang} setLang={setLang} onCancel={null} hideProg>
        <div className="ob-done">
          <div className="ob-done-ic">{I.check({width:38,height:38})}</div>
          <h2>{t.ob_created_t}</h2>
          <p>{t.ob_created_d}</p>
          <div className="ob-url">{I.store({width:16,height:16})} <span>rastashops.com/<b>{handle}</b></span></div>
          <div className="ob-done-cta">
            <button className="btn btn-accent btn-lg" onClick={goDashboard}>{I.plus({width:18,height:18})} {t.ob_add_first}</button>
            <button className="btn btn-ghost btn-lg" onClick={goStore}>{I.eye({width:17,height:17})} {t.ob_viewshop}</button>
          </div>
          <div className="ob-trial-note">{I.spark({width:14,height:14})} <span>{t.ob_trial} · {t.ob_free_until} {trialEnd}</span></div>
        </div>
      </ObShell>
    );
  }
  if(step===99){
    return (
      <ObShell lang={lang} setLang={setLang} onCancel={null} hideProg>
        <div className="ob-done"><div className="ob-spinner"></div><h2 style={{marginTop:18}}>{t.ob_publishing}</h2></div>
      </ObShell>
    );
  }

  const valid = [!!(d.phone && d.tgVerified), nameOk, true, !!d.plan, true];
  return (
    <ObShell lang={lang} setLang={setLang} onCancel={onCancel}>
      <ObProgress steps={labels} cur={step}/>
      <div className="ob-step">
        {step===0 && (
          d.phone
            ? (d.tgVerified? <StepVerified t={t} phone={d.phone} name={d.tgName} tg={d.telegram} onChange={()=>set({phone:"", tgVerified:false})}/> : null)
            : <AuthFlow t={t} onDone={(phone, tg)=>{ set({ phone, tgVerified:true, tgName: tg && tg.name, telegram: d.telegram || (tg && tg.username) || "" }); setStep(1); }}/>
        )}
        {step===1 && <StepShop t={t} d={d} set={set} lang={lang} handle={handle} taken={taken}/>}
        {step===2 && <StepBrand t={t} d={d} set={set} lang={lang} handle={handle}/>}
        {step===3 && <StepPlan t={t} d={d} set={set} lang={lang} plan={plan}/>}
        {step===4 && <StepReview t={t} d={d} lang={lang} handle={handle} plan={plan} trialEnd={trialEnd}/>}
      </div>
      {(step>0 || d.phone) && (
        <div className="ob-foot">
          {step>0 ? <button className="btn btn-ghost" onClick={()=>setStep(step-1)}>{I.back({width:17,height:17})} {t.ob_back}</button>
                  : <button className="btn btn-ghost" onClick={onCancel}>{t.ob_cancel}</button>}
          {step<4
            ? <button className="btn btn-accent" disabled={!valid[step]} onClick={()=>setStep(step+1)}>{t.ob_continue} {I.arrow({width:17,height:17})}</button>
            : <button className="btn btn-accent" onClick={publish}>{I.check({width:17,height:17})} {t.ob_create_shop}</button>}
        </div>
      )}
    </ObShell>
  );
}

function ObShell({ lang, setLang, onCancel, hideProg, children }){
  return (
    <div className="ob">
      <div className="ob-top">
        <div className="brand" style={{cursor:onCancel?"pointer":"default"}} onClick={onCancel||undefined}><Logo/> <BrandName/></div>
        <LangPill lang={lang} setLang={setLang}/>
      </div>
      <div className="ob-card-wrap">
        <div className={"ob-card"+(hideProg?" narrow":"")}>{children}</div>
      </div>
    </div>
  );
}

function StepVerified({ t, phone, name, tg, onChange }){
  return (
    <div>
      <div className="ob-head"><h2>{t.ob_s_account}</h2><p>{t.tg_why1}</p></div>
      <div className="verified-row">
        <span className="tg-mark">{TG_I.logo({width:30,height:30})}</span>
        <b>{name? name+" · " : ""}{phone}{tg? <small style={{display:"block",fontWeight:500,fontSize:13,color:"var(--soft)"}}>@{tg}</small> : null}</b>
        <button className="lnk" onClick={onChange}>{t.au_edit}</button>
      </div>
    </div>
  );
}

function StepShop({ t, d, set, lang, handle, taken }){
  return (
    <div>
      <div className="ob-head"><h2>{t.ob_shop_t}</h2><p>{t.ob_shop_d}</p></div>
      <div className="field"><label>{t.st_shop_name}</label>
        <input value={d.name} onChange={e=>set({name:e.target.value})} placeholder={t.ob_name_ph} autoFocus/>
      </div>
      <div className="field"><label>{t.ob_handle}</label>
        <div className="ob-handle">
          <span className="ob-handle-pre">rastashops.com/</span>
          <input value={handle} onChange={e=>set({handle:slugify(e.target.value), handleEdited:true})} placeholder="myshop"/>
          {handle.length>=3 && <span className={"ob-avail"+(taken?" no":"")}>{taken? I.x({width:14,height:14}):I.check({width:14,height:14})} {taken? t.ob_taken : t.ob_avail}</span>}
        </div>
        <div className="hint">a–z 0–9 - · 3–30</div>
      </div>
      <div className="field"><label>{t.ob_cat}</label>
        <div className="ob-cats">
          {Object.keys(TYPES).map(k=>(
            <button key={k} className={"ob-cat"+(d.type===k?" on":"")} onClick={()=>set({type:k})}>{TYPES[k][lang]}</button>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field"><label>{t.ob_city}</label>
          <select value={d.city} onChange={e=>set({city:e.target.value})}>{UZ_CITIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div className="field"><label>{t.ob_tagline}</label>
          <input value={d.tagline} onChange={e=>set({tagline:e.target.value})} placeholder={t.ob_tagline_ph}/>
        </div>
      </div>
      <div className="field">
        <label>{t.ob_contacts_t}</label>
        <div className="hint" style={{marginTop:-2, marginBottom:9}}>{t.ob_contacts_d}</div>
        <div className="field-row">
          <div className="field"><label>Instagram</label>
            <div className="pre-input"><span>@</span>
              <input value={d.instagram} onChange={e=>set({instagram:e.target.value.replace(/^@/,"")})} placeholder={handle||"myshop"}/></div>
          </div>
          <div className="field"><label>Telegram</label>
            <div className="pre-input"><span>@</span>
              <input value={d.telegram} onChange={e=>set({telegram:e.target.value.replace(/^@/,"")})} placeholder={handle||"myshop"}/></div>
          </div>
        </div>
        {handle.length>=3 && (!d.instagram || !d.telegram) && (
          <button className="lnk" style={{marginTop:6}} onClick={()=>set({ instagram:d.instagram||handle, telegram:d.telegram||handle })}>
            {I.check({width:13,height:13})} {t.ob_same_handle}
          </button>
        )}
      </div>
    </div>
  );
}

function StepBrand({ t, d, set, lang, handle }){
  return (
    <div>
      <div className="ob-head"><h2>{t.ob_brand_t}</h2><p>{t.ob_brand_d}</p></div>
      <div className="ob-brand-grid">
        <div>
          <label className="ob-lbl">{t.ob_cover}</label>
          <div className="ob-cover"><ImageSlot id={"cover-"+handle} src={photoURL(d.palette,"cover-"+handle,900,360,IMG_KW[d.type])} placeholder={t.ob_cover} style={FILL}/></div>
        </div>
        <div>
          <label className="ob-lbl">{t.ob_logo}</label>
          <div className="ob-logo"><ImageSlot id={"avatar-"+handle} shape="circle" src={photoURL(d.palette,"avatar-"+handle,200,200,IMG_KW[d.type],3)} placeholder={initialsFrom(d.name)} style={FILL}/></div>
        </div>
      </div>
      <div className="field"><label>{t.ob_look}</label>
        <div className="ob-looks">
          {Object.keys(THEMES).map(id=>{ const th=THEMES[id], pal=PALETTE_MAP[th.defaultPalette];
            return (
              <button key={id} className={"ob-look"+(d.theme===id?" on":"")} onClick={()=>set({theme:id, palette: d.paletteEdited? d.palette : th.defaultPalette})}>
                <span className="ob-look-pv" style={{background:pal.bg, color:pal.ink, fontFamily:th.vars["--s-font-display"]}}>Aa</span>
                <span>{th.name[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="field"><label>{t.ob_palette}</label>
        <div className="ob-sws">
          {PALETTES.map(p=>(<button key={p.id} className={"ob-sw"+(d.palette===p.id?" on":"")} title={p.name[lang]} style={{background:p.accent}} onClick={()=>set({palette:p.id, paletteEdited:true})}></button>))}
        </div>
      </div>
    </div>
  );
}

function StepPlan({ t, d, set, lang }){
  return (
    <div>
      <div className="ob-head"><span className="ob-trial-badge">{I.spark({width:14,height:14})} {t.ob_trial}</span><h2>{t.ob_plan_t}</h2><p>{t.ob_plan_d}</p></div>
      <div className="ob-billing">
        <button className={d.billing==="m"?"on":""} onClick={()=>set({billing:"m"})}>{t.ob_billed_m}</button>
        <button className={d.billing==="y"?"on":""} onClick={()=>set({billing:"y"})}>{t.ob_billed_y} <span className="ob-save">−{t.ob_save2}</span></button>
      </div>
      <div className="ob-plans">
        {PLANS.map(p=>{
          const price = d.billing==="m"? p.price : p.yprice;
          return (
            <button key={p.id} className={"ob-plan"+(d.plan===p.id?" on":"")} onClick={()=>set({plan:p.id})}>
              {p.popular && <span className="ob-plan-pop">Pro</span>}
              <div className="ob-plan-h">
                <b>{p.id==="pro"?t.ob_pro:t.ob_starter}</b>
                <span className="ob-plan-check">{d.plan===p.id && I.check({width:15,height:15})}</span>
              </div>
              <div className="ob-plan-d">{p.id==="pro"?t.ob_pro_d:t.ob_starter_d}</div>
              <div className="ob-plan-price"><span className="ob-free">{t.ob_trial}</span><span className="ob-then">{t.ob_then} {fmtPrice(price,lang)}{d.billing==="m"?t.ob_mo:""}</span></div>
              <ul className="ob-feats">{PLAN_FEATS[p.id][lang].map((f,i)=>(<li key={i}>{I.check({width:14,height:14})} {f}</li>))}</ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepReview({ t, d, lang, handle, plan, trialEnd }){
  const palObj = PALETTE_MAP[d.palette]||PALETTES[0];
  const rows = [
    [t.st_shop_name, d.name||"—"],
    [t.ob_handle, "rastashops.com/"+handle],
    [t.ob_cat, TYPES[d.type][lang]],
    [t.ob_city, d.city],
    [t.st_login_phone, d.phone||"—"],
    [t.ob_s_plan, (d.plan==="pro"?t.ob_pro:t.ob_starter)+" · "+(d.billing==="m"?t.ob_billed_m:t.ob_billed_y)],
  ];
  return (
    <div>
      <div className="ob-head"><h2>{t.ob_review_t}</h2><p>{t.ob_review_d}</p></div>
      <div className="ob-review-card">
        <div className="ob-review-cover" style={{background:palObj.swatch, backgroundImage:`url(${photoURL(d.palette,"cover-"+handle,700,200,IMG_KW[d.type])})`, backgroundSize:"cover", backgroundPosition:"center"}}>
          <div className="ob-review-logo" style={{backgroundImage:`url(${photoURL(d.palette,"avatar-"+handle,120,120,IMG_KW[d.type],3)})`, backgroundSize:"cover"}}></div>
        </div>
        <div className="ob-review-body">
          <b style={{fontFamily:THEMES[d.theme].vars["--s-font-display"], fontSize:20}}>{d.name||t.st_shop_name}</b>
          <div style={{display:"flex",gap:6,marginTop:6}}><span className="ob-chip" style={{background:palObj.accent}}></span><span style={{fontSize:13,color:"var(--soft)"}}>{THEMES[d.theme].name[lang]} · {palObj.name[lang]}</span></div>
        </div>
      </div>
      <div className="ob-review-rows">
        {rows.map(([k,v],i)=>(<div key={i} className="ob-rrow"><span>{k}</span><b>{v}</b></div>))}
      </div>
      <div className="ob-trial-note big">{I.spark({width:15,height:15})} <span>{t.ob_trial} · {t.ob_free_until} <b>{trialEnd}</b></span></div>
    </div>
  );
}

Object.assign(window, { Onboarding, PLANS, PLAN_FEATS, slugify, initialsFrom });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { FONT_FOR, slugify, initialsFrom, PLANS, PLAN_FEATS, WIZ_KEY, ObProgress, Onboarding, ObShell, StepVerified, StepShop, StepBrand, StepPlan, StepReview });
