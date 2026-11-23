Object.assign(I18N.en,{ st_change_cover:"Change cover", st_logo:"Logo / profile photo", st_logo_d:"Square image, shown round on your shop and link in bio", st_upload:"Upload", st_remove:"Remove", st_look:"Look & design", st_look_d:"Theme, colours, layout and fonts of your shop" });
Object.assign(I18N.ru,{ st_change_cover:"Сменить обложку", st_logo:"Логотип / фото профиля", st_logo_d:"Квадратное фото, в магазине и ссылке для био показывается кругом", st_upload:"Загрузить", st_remove:"Удалить", st_look:"Вид и дизайн", st_look_d:"Тема, цвета, раскладка и шрифты магазина" });
Object.assign(I18N.uz,{ st_change_cover:"Muqovani almashtirish", st_logo:"Logotip / profil rasmi", st_logo_d:"Kvadrat rasm, do\u02bckon va bio havolada dumaloq ko\u02bcrinadi", st_upload:"Yuklash", st_remove:"O\u02bcchirish", st_look:"Ko\u02bcrinish va dizayn", st_look_d:"Do\u02bckon mavzusi, ranglari, joylashuvi va shriftlari" });
// ===== Settings — persists to the storefront =====
function SettingsView({ store, shop, t, lang, onDeleted, onDesign }){
  const [, rf] = React.useState(0); React.useEffect(()=>PhotoStore.sub(()=>rf(x=>x+1)),[]);
  const saved = store.settings(shop.id);
  const [d, setD] = React.useState(saved);
  const [al, setAl] = React.useState(lang);
  const [modal, setModal] = React.useState(null);
  React.useEffect(()=>{ setD(store.settings(shop.id)); },[shop.id]);
  const set = (p)=> setD(s=>({ ...s, ...p }));
  const dirty = JSON.stringify(d)!==JSON.stringify(saved);
  useHandleChecks();
  const hs = d.handle === store.settings(shop.id).handle ? "ok" : handleCheck(store, d.handle, shop.id);   // one rule, checked by the server
  const handleTaken = hs === "taken" || hs === "reserved";
  const slugOk = /^[a-z0-9-]{3,30}$/.test(d.handle) && hs === "ok";

  function save(){
    if(!slugOk) return;
    store.setSettings(shop.id, d);
    toast(t.st_saved);
  }
  return (
    <div className="settings">
      <div className="db-sec-head">
        <div><h2>{t.db_settings}</h2><div className="sub">rastashops.com/{saved.handle}</div></div>
        <button className="btn btn-accent btn-sm" disabled={!dirty || !slugOk} onClick={save}>{I.check({width:16,height:16})} {t.g_save}</button>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_identity}</div>
        <div className="field">
          <label>{t.db_cover}</label>
          <div className="set-cover"><ImageSlot id={"cover-"+shop.id} src={photoURL(shop.cover, "cover-"+shop.id, 1200,360, IMG_KW[d.type])} placeholder={t.db_cover} style={FILL} editable label={t.st_change_cover} max={1600}/></div>
        </div>
        <div className="set-profile-row">
          <div className="set-avatar"><ImageSlot id={"avatar-"+shop.id} shape="circle" src={photoURL(shop.cover, "avatar-"+shop.id, 200,200, IMG_KW[d.type], 3)} placeholder={shop.initials} style={FILL} editable max={500}/></div>
          <div className="set-logo-tx"><b>{t.st_logo}</b><span className="hint" style={{margin:0}}>{t.st_logo_d}</span>
            <div style={{display:"flex", gap:8, marginTop:8}}>
              <button className="btn btn-soft btn-sm" onClick={()=>pickPhoto("avatar-"+shop.id, 500)}>{t.st_upload}</button>
              {PhotoStore.get("avatar-"+shop.id) && <button className="btn btn-ghost btn-sm" onClick={()=>PhotoStore.remove("avatar-"+shop.id)}>{t.st_remove}</button>}
            </div>
          </div>
        </div>
        <div className="field"><label>{t.st_shop_name}</label><input value={d.name} onChange={e=>set({name:e.target.value})}/></div>
        <div className="field">
          <label>{t.ob_handle}</label>
          <div className="ob-handle">
            <span className="ob-handle-pre">rastashops.com/</span>
            <input value={d.handle} onChange={e=>set({handle:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"").slice(0,30)})}/>
            {d.handle.length>=3 && <span className={"ob-avail"+(slugOk?"":" no")}>{slugOk? I.check({width:14,height:14}) : I.x({width:14,height:14})} {slugOk? t.ob_avail : (handleTaken? t.st_slug_taken : "a–z 0–9 -")}</span>}
          </div>
          <div className="hint">{I.warn({width:13,height:13})} {t.st_slug_warn}</div>
        </div>
        <div className="field">
          <label>{t.st_tagline}</label>
          <div className="lang-tabs">
            {["uz","ru","en"].map(l=>(<button key={l} className={"lang-tab"+(al===l?" on":"")} onClick={()=>setAl(l)}>{I18N[l]._label}</button>))}
          </div>
          <input value={d.tagline[al]||""} onChange={e=>set({tagline:{...d.tagline,[al]:e.target.value}})}/>
        </div>
        <div className="field-row">
          <div className="field"><label>{t.ob_city}</label>
            <select value={d.city} onChange={e=>set({city:e.target.value})}>{UZ_CITIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label>{t.pr_category}</label>
            <select value={d.type} onChange={e=>set({type:e.target.value})}>{Object.keys(TYPES).map(k=><option key={k} value={k}>{TYPES[k][lang]}</option>)}</select>
          </div>
        </div>
      </div>

      <LocationSettings d={d} set={set} shopId={shop.id} t={t}/>

      <div className="set-card set-design-link">
        <div className="plan-row">
          <div><b>{t.st_look}</b><span className="hint">{t.st_look_d}</span></div>
          <button className="btn btn-soft btn-sm" onClick={onDesign}>{I.layers({width:15,height:15})} {t.db_design}</button>
        </div>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_contacts}</div>
        <div className="hint" style={{marginTop:-6}}>{t.st_contacts_d}</div>
        <div className="field-row">
          <div className="field"><label>Instagram</label>
            <div className="pre-input"><span>@</span><input value={d.contacts.instagram||""} onChange={e=>set({contacts:{...d.contacts,instagram:e.target.value.replace(/^@/,"")}})}/></div>
          </div>
          <div className="field"><label>Telegram</label>
            <div className="pre-input"><span>@</span><input value={d.contacts.telegram||""} onChange={e=>set({contacts:{...d.contacts,telegram:e.target.value.replace(/^@/,"")}})}/></div>
            {!String(d.contacts.telegram||"").trim() && <div className="hint" style={{color:"#b83f28"}}>{t.st_tg_missing}</div>}
          </div>
        </div>
        <div className="field"><label>{t.ob_phone}</label><input value={d.contacts.phone||""} onChange={e=>set({contacts:{...d.contacts,phone:e.target.value}})}/></div>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_chips}</div>
        <div className="field"><label>{t.st_payments}</label>
          <div className="chip-row">
            {PAY_METHODS.map(m=>{
              const on = (d.payments||[]).includes(m.id);
              return <button key={m.id} className={"pick-chip"+(on?" on":"")} onClick={()=>set({payments: on? d.payments.filter(x=>x!==m.id) : [...d.payments, m.id]})}>{m.label[lang]}</button>;
            })}
          </div>
        </div>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_storefront}</div>
        <div className="field"><label>{t.st_threshold}</label>
          <Stepper value={Number(d.threshold)} min={0} onChange={n=>set({threshold:n})}/>
          <div className="hint">{t.sf_low}: qty ≤ {d.threshold}</div>
        </div>
        <label className="switch-row">
          <input type="checkbox" checked={d.showSold!==false} onChange={e=>set({showSold:e.target.checked})}/>
          <span className="switch"><i></i></span>{t.st_show_sold}
        </label>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_status}</div>
        <Seg value={d.status} onChange={v=>set({status:v})} options={[["live",t.db_live],["paused",t.st_paused||"Paused"]]}/>
        <div className="hint">{t.st_paused_d}</div>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_plan}</div>
        <div className="plan-row">
          <div><b>{d.plan==="pro"? t.ob_pro : t.ob_starter}</b><span className="hint">{fill(t.st_trial_left,{n:d.trialDays})}</span></div>
          {d.plan!=="pro" && <button className="btn btn-soft btn-sm" onClick={()=>{ set({plan:"pro"}); toast(t.st_upgrade); }}>{I.spark({width:15,height:15})} {t.st_upgrade}</button>}
        </div>
      </div>

      <div className="set-card">
        <div className="set-title">{t.st_account}</div>
        <div className="plan-row">
          <div style={{display:"flex",alignItems:"center",gap:12}}>{TG_I.logo({width:34,height:34})}<div><b>{d.phone}</b><span className="hint">{t.tg_why1}</span></div></div>
          <button className="btn btn-soft btn-sm" onClick={()=>setModal("phone")}>{t.st_change_number}</button>
        </div>
      </div>

      <div className="set-card danger">
        <div className="set-title">{t.st_danger}</div>
        <div className="plan-row">
          <div><b>{t.st_delete}</b><span className="hint">{t.st_delete_d}</span></div>
          <button className="btn btn-danger btn-sm" onClick={()=>setModal("del")}>{I.trash({width:15,height:15})} {t.st_delete}</button>
        </div>
      </div>

      {modal==="phone" && (
        <Modal title={t.st_change_number} sub={t.st_change_d} onClose={()=>setModal(null)}>
          <AuthFlow t={t} sub={t.st_change_d} purpose="relink" onDone={(phone)=>{ set({phone}); setModal(null); toast(t.st_number_changed); }}/>
        </Modal>
      )}
      {modal==="del" && (
        <Confirm danger title={t.st_delete} body={t.st_delete_d} cta={t.st_delete} needText={saved.name}
          onConfirm={()=>{ store.deleteShop(shop.id); onDeleted && onDeleted(); }}
          onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}

Object.assign(window, { SettingsView });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { SettingsView });
