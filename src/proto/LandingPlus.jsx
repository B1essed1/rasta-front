// ===== Landing — hero (claim-your-link) + pricing (tiers, billing switch, compare, FAQ) =====
addI18N({
  lh_claim_ph:  ["yourshop", "vashmagazin", "dokoningiz"],
  lh_claim_btn: ["Create my shop", "Создать магазин", "Do\u2018kon yaratish"],
  lh_claim_l:   ["Claim your link", "Займите ссылку", "Havolangizni oling"],
  lh_p1:        ["3 months free", "3 месяца бесплатно", "3 oy bepul"],
  lh_p2:        ["No card needed", "Без карты", "Karta shart emas"],
  lh_p3:        ["Orders arrive in Telegram", "Заказы приходят в Telegram", "Buyurtmalar Telegramga keladi"],
  lh_or:        ["or", "или", "yoki"],
  lh_browse:    ["browse shops", "смотреть магазины", "do\u2018konlarni ko\u2018rish"],
  lh_notif_t:   ["New order #1184", "Новый заказ #1184", "Yangi buyurtma #1184"],
  lh_notif_d:   ["2 items · 420 000 so\u2018m · pickup", "2 товара · 420 000 сум · самовывоз", "2 ta · 420 000 so\u2018m · olib ketish"],
  lh_stock_t:   ["Linen dress — 3 left", "Льняное платье — осталось 3", "Zig\u2018ir ko\u2018ylak — 3 ta qoldi"],
  lh_stock_d:   ["Stock updated after sale", "Остаток обновлён после продажи", "Sotuvdan keyin qoldiq yangilandi"],
  pr_monthly:   ["Monthly", "Помесячно", "Oylik"],
  pr_yearly:    ["Yearly", "За год", "Yillik"],
  pr_save:      ["2 months free", "2 месяца в подарок", "2 oy sovg\u2018a"],
  pr_popular:   ["Most popular", "Популярный", "Eng ommabop"],
  pr_free_then: ["Free for 3 months, then", "3 месяца бесплатно, затем", "3 oy bepul, keyin"],
  pr_per_mo:    ["/ month", "/ мес", "/ oy"],
  pr_billed_y:  ["billed {p} once a year", "{p} раз в год", "yiliga bir marta {p}"],
  pr_billed_m:  ["billed monthly · cancel anytime", "оплата помесячно · отмена в любой момент", "har oy · istalgan vaqtda bekor"],
  pr_compare:   ["Compare plans", "Сравнить тарифы", "Tariflarni solishtirish"],
  pr_faq:       ["Questions sellers ask", "Частые вопросы", "Ko\u2018p so\u2018raladigan savollar"],
  pr_f_tg:      ["Order alerts in Telegram", "Заказы в Telegram", "Telegramda buyurtma xabarlari"],
  pr_f_team:    ["Add sellers & see who sold what", "Продавцы и статистика по ним", "Sotuvchilar va ularning statistikasi"],
  pr_f_bio:     ["Link-in-bio page", "Страница link-in-bio", "Link-in-bio sahifa"],
  pr_q1: ["Do I need a card to start?", "Нужна ли карта, чтобы начать?", "Boshlash uchun karta kerakmi?"],
  pr_a1: ["No. Log in with Telegram, create your shop and sell for 3 months without paying anything. You choose a plan only when the trial ends.", "Нет. Войдите через Telegram, создайте магазин и продавайте 3 месяца бесплатно. Тариф выбираете только в конце пробного периода.", "Yo\u2018q. Telegram orqali kiring, do\u2018kon yarating va 3 oy bepul soting. Tarifni faqat sinov oxirida tanlaysiz."],
  pr_q2: ["What happens after 3 months?", "Что будет через 3 месяца?", "3 oydan keyin nima bo\u2018ladi?"],
  pr_a2: ["We remind you in Telegram a week before. Pick a plan to keep selling — if you don't, your shop is paused, never deleted.", "За неделю напомним в Telegram. Выберите тариф, чтобы продолжить, — иначе магазин приостановится, но не удалится.", "Bir hafta oldin Telegramda eslatamiz. Davom etish uchun tarif tanlang — aks holda do\u2018kon to\u2018xtatiladi, o\u2018chirilmaydi."],
  pr_q3: ["Can I switch plans later?", "Можно ли сменить тариф?", "Tarifni keyin almashtirsa bo\u2018ladimi?"],
  pr_a3: ["Yes, any time from Settings. Upgrades start right away; downgrades start next billing period.", "Да, в любой момент в настройках. Повышение — сразу, понижение — со следующего периода.", "Ha, istalgan vaqtda Sozlamalarda. Oshirish darhol, tushirish keyingi davrdan."],
  pr_q4: ["How do I pay?", "Как оплатить?", "Qanday to\u2018layman?"],
  pr_a4: ["With Payme or Click, in so\u2018m. You get a receipt in Telegram.", "Через Payme или Click, в сумах. Чек придёт в Telegram.", "Payme yoki Click orqali, so\u2018mda. Chek Telegramga keladi."],
  pr_q5: ["Do you take a cut of my sales?", "Берёте ли вы процент с продаж?", "Sotuvdan foiz olasizmi?"],
  pr_a5: ["No. Buyers pay you directly — cash, Payme or Click. The plan price is all you pay.", "Нет. Покупатели платят вам напрямую — наличными, Payme или Click. Вы платите только за тариф.", "Yo\u2018q. Xaridorlar sizga to\u2018g\u2018ridan-to\u2018g\u2018ri to\u2018laydi. Siz faqat tarif uchun to\u2018laysiz."],
});

function lhClaim(handle, lang){
  const h = slugify(handle);
  try{ localStorage.setItem(O2_KEY, JSON.stringify({ step:0, fromClaim:true, d:{ handle:h, handleEdited:!!h } })); }catch(e){}
}

function LpHero({ store, t, lang, onStart, onExplore }){
  const [h, setH] = React.useState("");
  const hero = { ...store.shopMeta("lola"), products: publicProducts(store, "lola") };
  const heroCfg = { theme:"boutique", palette:"clay", layout:"grid", font:"serif" };
  const hs = h ? handleCheck(store, h) : "empty";
  const bad = hs==="taken" || hs==="reserved";
  const sugg = bad ? handleSuggest(store, h) : [];
  const go = (e)=>{ e && e.preventDefault(); if(bad || hs==="short") return; lhClaim(h, lang); onStart(); };
  return (
    <section className="hero lh">
      <div className="wrap hero-grid">
        <div className="rise lh-copy">
          <div className="brand" style={{fontSize:34, gap:14, marginBottom:20}}><Logo size={56}/> <BrandName/></div>
          <span className="eyebrow-pill">{I.store({width:15,height:15})} {t.hero_kicker}</span>
          <h1>{t.hero_title}</h1>
          <p className="hero-sub">{t.hero_sub}</p>
          <form className="lh-claim" onSubmit={go}>
            <label className="lh-claim-f" htmlFor="lh-h">
              <span className="lh-claim-pre">rastashops.com/</span>
              <input id="lh-h" value={h} onChange={e=>setH(slugify(e.target.value))} placeholder={t.lh_claim_ph} aria-label={t.lh_claim_l} autoComplete="off" spellCheck="false"/>
            </label>
            <button className="btn btn-accent btn-lg" type="submit" disabled={bad || hs==="short"}>{t.lh_claim_btn} {I.arrow({width:18,height:18})}</button>
          </form>
          {hs!=="empty" && (
            <div className={"lh-claim-st"+(hs==="ok"?"":" no")} aria-live="polite">
              {hs==="ok"? I.check({width:14,height:14}) : I.x({width:14,height:14})}
              <span>rastashops.com/{h} — {hs==="ok"? t.o2_free : hs==="taken"? t.o2_taken : hs==="reserved"? t.o2_reserved : t.o2_short}</span>
              {sugg.length>0 && <>{t.o2_try} {sugg.map(s=><button key={s} type="button" onClick={()=>setH(s)}>{s}</button>)}</>}
            </div>
          )}
          <div className="lh-or">{t.lh_or} <button onClick={onExplore}>{t.lh_browse} {I.arrow({width:14,height:14})}</button></div>
          <ul className="lh-proof">
            {[t.lh_p1,t.lh_p2,t.lh_p3].map((x,i)=><li key={i}>{I.check({width:15,height:15})} {x}</li>)}
          </ul>
          <div className="hero-trust lh-trust">
            <div className="lh-avs">{SHOP_ORDER.slice(0,5).map(id=><span key={id} style={{backgroundImage:"url("+byShopAv(store,id)+")"}}></span>)}</div>
            <span><b>{fmtNum(window.__shopCount || SHOP_ORDER.length)}</b> {t.trusted}</span>
          </div>
        </div>
        <div className="rise lh-visual" style={{animationDelay:".12s"}}>
          <div className="lh-notif">
            <span className="lh-notif-ic">{TG_I.logo({width:34,height:34})}</span>
            <div><b>{t.lh_notif_t}</b><span>{t.lh_notif_d}</span></div>
          </div>
          <div className="lh-stock">
            <span className="lh-stock-ic">{I.box({width:18,height:18})}</span>
            <div><b>{t.lh_stock_t}</b><span>{t.lh_stock_d}</span></div>
          </div>
          <div className="site-card">
            <div className="site-bar">
              <div className="tl"><i></i><i></i><i></i></div>
              <div className="site-url" style={{display:"inline-flex", alignItems:"center", gap:5}}><Logo size={14}/> rastashops.com/<b>{h || hero.handle}</b></div>
            </div>
            <div className="site-view scroll-y">
              <Storefront shop={hero} cfg={heroCfg} lang={lang} compact embedded/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LpPricing({ t, lang, onStart }){
  const [yearly, setYearly] = React.useState(false);
  const [open, setOpen] = React.useState(0);
  const plans = window.PLANS || [];
  const feats = window.PLAN_FEATS || {};
  const name = (id)=> id==="pro"? t.ob_pro : t.ob_starter;
  const rows = [
    [feats.starter && feats.starter[lang][0], 1, 1],
    [feats.starter && feats.starter[lang][1], 1, 1],
    [feats.starter && feats.starter[lang][2], 1, 1],
    [feats.starter && feats.starter[lang][3], 1, 1],
    [t.pr_f_tg, 1, 1],
    [t.pr_f_bio, 1, 1],
    [t.pr_f_team, 1, 1],
    [feats.starter && feats.starter[lang][4], 1, 1],
    ...((feats.pro && feats.pro[lang].slice(1)) || []).map(f=>[f, 0, 1]),
  ].filter(r=>r[0]);
  const faqs = [1,2,3,4,5].map(i=>[t["pr_q"+i], t["pr_a"+i]]);
  return (
    <section className="sect pricing-sect pr" id="pricing">
      <div className="wrap">
        <div className="sect-head" data-reveal>
          <span className="kicker">{t.nav_pricing}</span>
          <h2>{t.ob_plan_t}</h2>
          <p>{t.ob_plan_d}</p>
        </div>
        <div className="pr-switch" role="tablist" data-reveal>
          <button role="tab" aria-selected={!yearly} className={!yearly?"on":""} onClick={()=>setYearly(false)}>{t.pr_monthly}</button>
          <button role="tab" aria-selected={yearly} className={yearly?"on":""} onClick={()=>setYearly(true)}>{t.pr_yearly} <i>{t.pr_save}</i></button>
        </div>
        <div className="pr-cards">
          {plans.map((p,i)=>{
            const mo = yearly? Math.round(p.yprice/12/500)*500 : p.price;
            const list = (feats[p.id] && feats[p.id][lang]) || [];
            return (
              <div key={p.id} className={"pr-card"+(p.popular?" pop":"")} data-reveal style={{"--ri":i}}>
                <div className="pr-card-h"><b>{name(p.id)}</b>{p.popular && <span className="pr-pop">{t.pr_popular}</span>}</div>
                <p className="pr-card-d">{p.id==="pro"? t.ob_pro_d : t.ob_starter_d}</p>
                <div className="pr-free">{I.spark({width:15,height:15})} {t.pr_free_then}</div>
                <div className="pr-price"><b>{fmtNum(mo)}</b><span>{CURRENCY[lang]} {t.pr_per_mo}</span></div>
                <div className="pr-billed">{yearly? fill(t.pr_billed_y,{p:fmtPrice(p.yprice,lang)}) : t.pr_billed_m}</div>
                <button className={"btn btn-lg "+(p.popular?"btn-accent":"btn-soft")} onClick={onStart}>{t.cta_start_free} {I.arrow({width:18,height:18})}</button>
                <ul className="pr-feats">{list.map((f,k)=><li key={k}>{I.check({width:16,height:16})} {f}</li>)}</ul>
              </div>
            );
          })}
        </div>

        <div className="pr-compare" data-reveal>
          <h3>{t.pr_compare}</h3>
          <div className="pr-table" role="table">
            <div className="pr-tr pr-th" role="row"><span role="columnheader"></span>{plans.map(p=><span key={p.id} role="columnheader">{name(p.id)}</span>)}</div>
            {rows.map((r,i)=>(
              <div key={i} className="pr-tr" role="row">
                <span role="cell">{r[0]}</span>
                <span role="cell" className={r[1]?"y":"n"}>{r[1]? I.check({width:18,height:18}) : "—"}</span>
                <span role="cell" className={r[2]?"y":"n"}>{r[2]? I.check({width:18,height:18}) : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pr-faq" data-reveal>
          <h3>{t.pr_faq}</h3>
          {faqs.map(([q,a],i)=>(
            <div key={i} className={"pr-q"+(open===i?" open":"")}>
              <button onClick={()=>setOpen(open===i? -1 : i)} aria-expanded={open===i}>{q}<span>{open===i? I.minus({width:18,height:18}) : I.plus({width:18,height:18})}</span></button>
              {open===i && <p>{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LpHero, LpPricing });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { lhClaim, LpHero, LpPricing });
