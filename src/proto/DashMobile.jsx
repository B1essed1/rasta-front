// ===== Seller dashboard — mobile shell: top bar, bottom tab bar with central Scan, "More" sheet with profile =====
addI18N({
  dm_more:      ["More", "Ещё", "Yana"],
  dm_scan:      ["Scan", "Скан", "Skaner"],
  dm_profile:   ["My profile", "Мой профиль", "Profilim"],
  dm_shop:      ["Shop", "Магазин", "Do\u2018kon"],
  dm_manage:    ["Manage", "Управление", "Boshqaruv"],
  dm_switch:    ["Switch seller", "Сменить продавца", "Sotuvchini almashtirish"],
  dm_tg:        ["Signed in with Telegram", "Вход через Telegram", "Telegram orqali kirgan"],
  dm_lang:      ["Language", "Язык", "Til"],
  dm_today:     ["Today", "Сегодня", "Bugun"],
  dmh_d:        ["Point the camera at a barcode — stock updates itself", "Наведите камеру на штрихкод — остаток обновится сам", "Kamerani shtrix-kodga qarating — qoldiq o\u2018zi yangilanadi"],
  dmh_new:      ["new", "новых", "yangi"],
  dmh_low:      ["running low", "заканчиваются", "tugayapti"],
});

function DbMobileShell({ store, shop, t, lang, setLang, nav, tab, setTab, onScan, onVisit, onLogout, onTill }){
  const [more, setMore] = React.useState(false);
  const viewer = store.operator(shop.id);
  const cfg = store.cfg(shop.id);
  // bottom bar = the first 3 tabs that exist (Orders/Chats can be switched off) — never index a missing tab
  const want = ["home","requests","orders","chats","sales","inventory","products"];
  const primary = want.filter(id=>nav.some(n=>n[0]===id)).slice(0,3);
  const bar = primary.map(id=>nav.find(n=>n[0]===id)).filter(Boolean);
  const rest = nav.filter(n=>!primary.includes(n[0]));
  const restBadge = rest.reduce((n,x)=>n+(x[3]||0),0);
  const inMore = rest.some(n=>n[0]===tab);
  React.useEffect(()=>{ if(!more) return; const k=(e)=>{ if(e.key==="Escape") setMore(false); }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); }, [more]);
  const pick = (id)=>{ setTab(id); setMore(false); };
  const Tab = ({ n })=>{ const [id,lab,ic,badge] = n; return (
    <button className={"dm-tab"+(tab===id?" on":"")} onClick={()=>pick(id)} aria-current={tab===id?"page":undefined}>
      <span className="dm-ic">{ic({width:24,height:24})}{badge? <i>{badge}</i> : null}</span><span>{lab}</span>
    </button>
  ); };
  return (
    <>
      <div className="dm-top">
        <span className="dm-logo" aria-label="rastashops" role="img" style={{display:"inline-flex", flex:"none"}}><Logo size={30}/></span>
        <button className="dm-shop" onClick={()=>setMore(true)} aria-label={t.dm_profile}>
          <span className="dm-shop-av" style={{background:getPalette(cfg).swatch}}>{shop.initials}</span>
          <span className="dm-shop-m"><b>{shop.name}</b><small>rastashops.com/{shop.handle}</small></span>
        </button>
        <TillChip store={store} shop={shop} t={t} compact onClick={onTill}/>
        <button className="dm-me" onClick={()=>setMore(true)} aria-label={t.dm_profile}><StaffAv m={viewer} t={t} size={40}/></button>
      </div>

      {ReactDOM.createPortal(<nav className="dm-bar" aria-label="Dashboard">
        {bar[0] ? <Tab n={bar[0]}/> : <span></span>}
        {bar[1] ? <Tab n={bar[1]}/> : <span></span>}
        <button className="dm-scan" onClick={onScan} aria-label={t.db_scan}>
          <span>{I.scan({width:30,height:30})}</span><b>{t.dm_scan}</b>
        </button>
        {bar[2] ? <Tab n={bar[2]}/> : <span></span>}
        <button className={"dm-tab"+(inMore||more?" on":"")} onClick={()=>setMore(true)}>
          <span className="dm-ic">{I.more({width:24,height:24})}{restBadge? <i>{restBadge}</i> : null}</span><span>{t.dm_more}</span>
        </button>
      </nav>, document.body)}

      {more && ReactDOM.createPortal(
        <div className="dm-scrim" onClick={()=>setMore(false)}>
          <div className="dm-sheet" onClick={e=>e.stopPropagation()} role="dialog" aria-label={t.dm_more}>
            <div className="dm-grab"></div>
            <div className="dm-prof">
              <StaffAv m={viewer} t={t} size={56}/>
              <div className="dm-prof-m">
                <b>{staffName(viewer,t)}</b>
                <span>{roleLabel(viewer.role,t)} · {shop.name}</span>
                <em>{TG_I.logo({width:14,height:14})} {t.dm_tg}</em>
              </div>
              <button className="dm-x" onClick={()=>setMore(false)} aria-label={t.g_close}>{I.x({width:20,height:20})}</button>
            </div>
            <div className="dm-quick">
              <button onClick={()=>{ setMore(false); onScan(); }} className="hot">{I.scan({width:24,height:24})}<span>{t.db_scan}</span></button>
              <button onClick={()=>{ setMore(false); onVisit(); }}>{I.eye({width:24,height:24})}<span>{t.db_visit}</span></button>
              <button onClick={()=>{ setMore(false); onTill(); }}>{I.team({width:24,height:24})}<span>{t.dm_switch}</span></button>
            </div>
            <div className="dm-sec">{t.dm_manage}</div>
            <div className="dm-grid">
              {rest.map(([id,lab,ic,badge])=>(
                <button key={id} className={tab===id?"on":""} onClick={()=>pick(id)}>
                  <span className="dm-gi">{ic({width:24,height:24})}{badge? <i>{badge}</i> : null}</span><span>{lab}</span>
                </button>
              ))}
            </div>
            <div className="dm-row"><span>{t.dm_lang}</span><div className="dm-langs">{["uz","ru","en"].map(l=><button key={l} className={lang===l?"on":""} onClick={()=>setLang(l)}>{I18N[l]._label}</button>)}</div></div>
            <button className="dm-out" onClick={onLogout}>{t.au_logout}</button>
          </div>
        </div>, document.body)}
    </>
  );
}

Object.assign(window, { DbMobileShell });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { DbMobileShell });
