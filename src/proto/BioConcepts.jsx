// ===== Link in bio — concept templates: desktop, receipt, chat, ticket, vinyl, magazine cover =====
Object.assign(I18N.en, { st_bio_concept:"Fresh concepts", cc_hi:"Hi! Welcome to", cc_ask:"How can I order?", cc_ans:"Everything is in our shop — tap below, or message us right here.", cc_online:"online", cc_today:"Today", cc_msg:"Message", cc_total:"Total", cc_thanks:"Thank you · Rahmat · Спасибо", cc_open:"Open", cc_admit:"Admit one", cc_entry:"Entry", cc_upnext:"Up next", cc_from:"Playing from", cc_albums:"Popular now", cc_inside:"Inside this issue", cc_issue:"Issue", cc_objects:"object(s)", cc_start:"Start" });
Object.assign(I18N.ru, { st_bio_concept:"Новые концепции", cc_hi:"Привет! Добро пожаловать в", cc_ask:"Как сделать заказ?", cc_ans:"Всё есть в нашем магазине — нажмите ниже или напишите нам прямо здесь.", cc_online:"в сети", cc_today:"Сегодня", cc_msg:"Сообщение", cc_total:"Итого", cc_thanks:"Спасибо · Rahmat · Thank you", cc_open:"Открыто", cc_admit:"Вход на одного", cc_entry:"Вход", cc_upnext:"Далее", cc_from:"Играет из", cc_albums:"Популярное", cc_inside:"В этом выпуске", cc_issue:"Выпуск", cc_objects:"объект(ов)", cc_start:"Пуск" });
Object.assign(I18N.uz, { st_bio_concept:"Yangi konsepsiyalar", cc_hi:"Salom! Xush kelibsiz:", cc_ask:"Qanday buyurtma beraman?", cc_ans:"Hammasi do\u02bckonimizda — pastdagi tugmani bosing yoki shu yerda yozing.", cc_online:"onlayn", cc_today:"Bugun", cc_msg:"Xabar", cc_total:"Jami", cc_thanks:"Rahmat · Спасибо · Thank you", cc_open:"Ochiq", cc_admit:"Bir kishilik", cc_entry:"Kirish", cc_upnext:"Keyingisi", cc_from:"Ijro etilmoqda", cc_albums:"Ommabop", cc_inside:"Bu sonda", cc_issue:"Son", cc_objects:"ta obyekt", cc_start:"Pusk" });

const CC_I = {
  play:(p)=> <svg viewBox="0 0 24 24" {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>,
  prev:(p)=> <svg viewBox="0 0 24 24" {...p}><path d="M7 6v12M18 6v12l-9-6 9-6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  next:(p)=> <svg viewBox="0 0 24 24" {...p}><path d="M17 6v12M6 6v12l9-6-9-6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  heart:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  send:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" fill="currentColor"/></svg>,
  back:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M14.5 6 8.5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dots:(p)=> <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="5.5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="18.5" r="1.8" fill="currentColor"/></svg>,
};

function BioConcept({ layout, d, shopId, lang, onOpenShop, tagline, page }){
  const t = d.t, name = d.st.name, meta = d.st.city+" · "+TYPES[d.st.type][lang];
  const shop = d.links.find(l=>l.big), rest = d.links.filter(l=>!l.big);
  const nm = (p)=> textFB(p.name, lang);
  const now = new Date();

  if(layout==="os") return page(
    <div className="bio-card vo-desk">
      <div className="vo-win">
        <div className="vo-bar"><span>{d.st.handle}.exe</span><span className="vo-ctl"><i>_</i><i>□</i><i>×</i></span></div>
        <div className="vo-body">
          <div className="vo-prof">
            <span className="vo-av"><VSquareAvatar d={d} shopId={shopId}/></span>
            <div><h1 className="vo-name">{name}</h1>{tagline && <p>{tagline}</p>}<small>{meta}</small></div>
          </div>
          {shop && <button className="vo-cta" onClick={shop.go}>{CC_I.play({width:14,height:14})} {shop.lab}</button>}
        </div>
      </div>
      <div className="vo-icons">
        {rest.map(l=>(
          <button key={l.key} className="vo-icon" onClick={l.go}><span className="vo-ib">{l.ic({width:24,height:24})}</span><b>{l.lab}</b></button>
        ))}
      </div>
      {d.prods.length>0 && (
        <div className="vo-win">
          <div className="vo-bar"><span>{t.cc_albums}</span><span className="vo-ctl"><i>_</i><i>□</i><i>×</i></span></div>
          <div className="vo-files">
            {d.prods.map((p,i)=>(
              <button key={p.id} className="vo-file" onClick={onOpenShop}>
                <span className="vo-thumb"><VImg d={d} shopId={shopId} p={p} i={i} w={200} h={200}/></span>
                <b>{nm(p)}</b><small>{d.priceStr(typeof pMin==="function"? pMin(p) : p.price)}</small>
              </button>
            ))}
          </div>
          <div className="vo-status"><span>{d.prods.length} {t.cc_objects}</span><span>rastashops.com</span></div>
        </div>
      )}
      <div className="vo-task">
        <button className="vo-start" onClick={onOpenShop}><i></i>{t.cc_start}</button>
        <span className="vo-clock">{d.st.city} {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}</span>
      </div>
    </div>
  );

  if(layout==="receipt") return page(
    <div className="bio-card">
      <div className="vr-paper">
        <div className="vr-edge top"></div>
        <div className="vr-in">
          <span className="vr-stamp">{t.cc_open}<br/>{d.st.city}</span>
          <div className="vr-logo"><BioAvatar d={d} shopId={shopId} size={64}/></div>
          <h1 className="vr-name">{name}</h1>
          {tagline && <div className="vr-c">{tagline}</div>}
          <div className="vr-c">{meta}</div>
          <div className="vr-c vr-sm">{now.toLocaleDateString("en-GB")} · #{d.st.handle.toUpperCase()}</div>
          <div className="vr-hr"></div>
          {rest.map(l=>(
            <button key={l.key} className="vr-row" onClick={l.go}><span>{l.lab}</span><i></i><b>{l.sub}</b></button>
          ))}
          {d.prods.length>0 && <div className="vr-hr"></div>}
          {d.prods.map((p,i)=>(
            <button key={p.id} className="vr-item" onClick={onOpenShop}>
              <span className="vr-pimg"><VImg d={d} shopId={shopId} p={p} i={i} w={120} h={120}/></span>
              <span className="vr-q">1×</span><span className="vr-pn">{nm(p)}</span><i></i><b>{d.priceStr(p.price)}</b>
            </button>
          ))}
          <div className="vr-hr dbl"></div>
          {shop && <button className="vr-total" onClick={shop.go}><span>{t.cc_total}</span><b>{shop.lab} →</b></button>}
          <div className="vr-barcode"></div>
          <div className="vr-c vr-sm">rastashops.com/{d.st.handle}</div>
          <div className="vr-c vr-sm">{t.cc_thanks}</div>
        </div>
        <div className="vr-edge bot"></div>
      </div>
      <BioFoot d={d}/>
    </div>
  );

  if(layout==="chat") return page(
    <div className="bio-card vc-app">
      <div className="vc-head">
        <span className="vc-back">{CC_I.back({width:20,height:20})}</span>
        <BioAvatar d={d} shopId={shopId} size={40}/>
        <div className="vc-who"><b>{name}</b><small>{t.cc_online} · {d.st.city}</small></div>
        <span className="vc-back">{CC_I.dots({width:18,height:18})}</span>
      </div>
      <div className="vc-feed">
        <div className="vc-day"><span>{t.cc_today}</span></div>
        <div className="vc-msg in"><p>{t.cc_hi} <b>{name}</b>!{tagline? " "+tagline : ""}</p><time>10:24</time></div>
        {d.prods.length>0 && (
          <div className="vc-msg in album">
            <div className={"vc-grid n"+Math.min(d.prods.length,4)}>
              {d.prods.slice(0,4).map((p,i)=>(
                <button key={p.id} className="vc-ph" onClick={onOpenShop}><VImg d={d} shopId={shopId} p={p} i={i} w={260} h={260}/><em>{d.priceStr(p.price)}</em></button>
              ))}
            </div>
            <p>{t.cc_albums}</p><time>10:24</time>
          </div>
        )}
        <div className="vc-msg out"><p>{t.cc_ask}</p><time>10:25 ✓✓</time></div>
        <div className="vc-msg in"><p>{t.cc_ans}</p><time>10:25</time></div>
        <div className="vc-kb">
          {shop && <button className="vc-key big" onClick={shop.go}>{shop.ic({width:18,height:18})} {shop.lab}</button>}
          {rest.map(l=><button key={l.key} className="vc-key" onClick={l.go}>{l.ic({width:16,height:16})} {l.lab}</button>)}
        </div>
        <div className="vc-typing"><i></i><i></i><i></i></div>
      </div>
      <div className="vc-input"><span>{t.cc_msg}</span><button onClick={onOpenShop} aria-label="send">{CC_I.send({width:18,height:18})}</button></div>
    </div>
  );

  if(layout==="ticket") return page(
    <div className="bio-card">
      <div className="tk-head">
        <span className="tk-admit">★ {t.cc_admit} ★</span>
        <BioAvatar d={d} shopId={shopId} size={78}/>
        <h1 className="tk-name">{name}</h1>
        {tagline && <p className="tk-tag">{tagline}</p>}
        <span className="tk-meta">{meta}</span>
      </div>
      <div className="tk-list">
        {shop && (
          <button className="tk tk-big" onClick={shop.go}>
            <span className="tk-main"><small>{t.cc_entry} · rastashops.com</small><b>{shop.lab}</b><span className="tk-row"><i>{d.st.city}</i><i>{now.toLocaleDateString("en-GB")}</i></span></span>
            <span className="tk-stub"><span className="tk-bc"></span><em>№ 001</em></span>
          </button>
        )}
        {rest.map((l,i)=>(
          <button key={l.key} className={"tk tk-c"+(i%3+1)} onClick={l.go}>
            <span className="tk-main"><small>{l.lab}</small><b>{l.sub}</b></span>
            <span className="tk-stub">{l.ic({width:22,height:22})}<em>№ 00{i+2}</em></span>
          </button>
        ))}
      </div>
      {d.prods.length>0 && (
        <div className="tk-prods">
          {d.prods.map((p,i)=>(
            <button key={p.id} className="tk-pc" onClick={onOpenShop}>
              <span className="tk-pimg"><VImg d={d} shopId={shopId} p={p} i={i}/></span>
              <span className="tk-pb"><b>{nm(p)}</b><em>{d.priceStr(p.price)}</em></span>
            </button>
          ))}
        </div>
      )}
      <BioFoot d={d}/>
    </div>
  );

  if(layout==="player") return page(
    <div className="bio-card">
      <div className="vy-card">
        <div className="vy-top"><span>{CC_I.back({width:18,height:18,style:{transform:"rotate(-90deg)"}})}</span><small>{t.cc_from}<b>rastashops.com/{d.st.handle}</b></small><span>{CC_I.dots({width:18,height:18})}</span></div>
        <div className="vy-art">
          <span className="vy-rec"><span className="vy-label"><BioAvatar d={d} shopId={shopId} size={64}/></span></span>
          <span className="vy-sleeve"><BioCover d={d} shopId={shopId} cls="vy-fill"/></span>
        </div>
        <div className="vy-meta">
          <div><h1 className="vy-name">{name}</h1><p>{tagline || meta}</p></div>
          <span className="vy-heart">{CC_I.heart({width:24,height:24})}</span>
        </div>
        <div className="vy-prog"><i></i></div>
        <div className="vy-times"><span>1:24</span><span>{d.st.city}</span></div>
        <div className="vy-ctrl">
          <span>{CC_I.prev({width:24,height:24})}</span>
          <button className="vy-play" onClick={shop? shop.go : onOpenShop} aria-label={t.bio_open_shop}>{CC_I.play({width:30,height:30})}</button>
          <span>{CC_I.next({width:24,height:24})}</span>
        </div>
        {shop && <button className="vy-shop" onClick={shop.go}>{shop.lab}</button>}
      </div>
      <div className="vy-list">
        <div className="vy-lt">{t.cc_upnext}</div>
        {rest.map((l,i)=>(
          <button key={l.key} className="vy-tr" onClick={l.go}>
            <span className="vy-n">{i+1}</span>
            <span className="vy-ic">{l.ic({width:18,height:18})}</span>
            <span className="vy-tx"><b>{l.lab}</b><small>{l.sub}</small></span>
            {i===0? <span className="vy-eq"><i></i><i></i><i></i></span> : <span className="vy-dur">{"3:"+String(12+i*9).padStart(2,"0")}</span>}
          </button>
        ))}
      </div>
      {d.prods.length>0 && (
        <div className="vy-albums">
          <div className="vy-lt">{t.cc_albums}</div>
          <div className="vy-row">
            {d.prods.map((p,i)=>(
              <button key={p.id} className="vy-alb" onClick={onOpenShop}>
                <span className="vy-aimg"><VImg d={d} shopId={shopId} p={p} i={i} w={260} h={260}/></span>
                <b>{nm(p)}</b><small>{d.priceStr(p.price)}</small>
              </button>
            ))}
          </div>
        </div>
      )}
      <BioFoot d={d}/>
    </div>
  );

  if(layout==="cover") return page(
    <div className="bio-card">
      <div className="vz-cover">
        <BioCover d={d} shopId={shopId} cls="vz-photo"/>
        <div className="vz-top">
          <div className="vz-mast">{name}</div>
          <div className="vz-issue">{t.cc_issue} {now.getDate()} · {d.st.city} · {now.getFullYear()}</div>
          {tagline && <div className="vz-dek">{tagline}</div>}
        </div>
        <div className="vz-lines">
          {rest.map(l=>(
            <button key={l.key} className="vz-line" onClick={l.go}><small>{l.lab}</small><b>{l.sub}</b></button>
          ))}
        </div>
        {shop && <button className="vz-burst" onClick={shop.go}><span>{shop.lab}</span></button>}
        <div className="vz-bc"></div>
      </div>
      {d.prods.length>0 && (
        <div className="vz-inside">
          <div className="vz-ih"><b>{t.cc_inside}</b><span>rastashops.com/{d.st.handle}</span></div>
          {d.prods.map((p,i)=>(
            <button key={p.id} className="vz-it" onClick={onOpenShop}>
              <span className="vz-pg">{String(12+i*8)}</span>
              <span className="vz-tx"><b>{nm(p)}</b><small>{d.priceStr(p.price)}</small></span>
              <span className="vz-pimg"><VImg d={d} shopId={shopId} p={p} i={i} w={160} h={200}/></span>
            </button>
          ))}
        </div>
      )}
      <BioFoot d={d}/>
    </div>
  );
  return null;
}

function ConceptThumb({ L, c }){
  const base = "bio-thumb vt ct-"+L, st = bioVars(c);
  if(L==="os") return <span className={base} style={st}><span className="cto-w"><i className="bar"></i><i className="row"></i><i className="btn"></i></span><span className="cto-ic"><i></i><i></i><i></i></span><span className="cto-w s"><i className="bar"></i><i className="grid"></i></span><span className="cto-task"></span></span>;
  if(L==="receipt") return <span className={base} style={st}><span className="ctr-p"><i className="c"></i><i className="l"></i><i className="l"></i><i className="l"></i><i className="t"></i><i className="bc"></i></span></span>;
  if(L==="chat") return <span className={base} style={st}><span className="ctc-h"></span><i className="ctc-m in"></i><i className="ctc-m in img"></i><i className="ctc-m out"></i><span className="ctc-k"><i className="big"></i><i></i><i></i></span></span>;
  if(L==="ticket") return <span className={base} style={st}><span className="ctt-nm"></span><i className="ctt-t big"></i><i className="ctt-t c1"></i><i className="ctt-t c2"></i><i className="ctt-t c3"></i></span>;
  if(L==="player") return <span className={base} style={st}><span className="cty-c"><span className="cty-art"><i className="rec"></i><i className="sl"></i></span><i className="cty-nm"></i><i className="cty-pr"></i><i className="cty-pl"></i></span><i className="cty-tr"></i><i className="cty-tr"></i></span>;
  if(L==="cover") return <span className={base} style={st}><span className="ctz-mast"></span><i className="ctz-l"></i><i className="ctz-l"></i><i className="ctz-l s"></i><span className="ctz-b"></span></span>;
  return null;
}

Object.assign(window, { BioConcept, ConceptThumb });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { CC_I, BioConcept, ConceptThumb });
