// ===== Buyer basket + checkout =====
addI18N({
  by_bk_t:      ["Your basket", "Ваша корзина", "Savatingiz"],
  by_bk_d:      ["Each shop gets its own order. You pay the shop directly — nothing is charged now.", "Каждый магазин получает свой заказ. Оплата напрямую магазину — сейчас ничего не списывается.", "Har bir do\u2018konga alohida buyurtma. To\u2018lov to\u2018g\u2018ridan-to\u2018g\u2018ri do\u2018konga — hozir hech narsa yechilmaydi."],
  by_bk_empty:  ["Your basket is empty", "Корзина пуста", "Savat bo\u2018sh"],
  by_bk_empty_d:["Tap “Order” on any product to add it here.", "Нажмите «Заказать» у товара, чтобы добавить его сюда.", "Mahsulotdagi \u00abBuyurtma\u00bb tugmasini bosing."],
  by_bk_from:   ["Order from {s}", "Заказать в «{s}»", "\u00ab{s}\u00bbdan buyurtma"],
  by_bk_ship:   ["Delivery from {p} · pickup free", "Доставка от {p} · самовывоз бесплатно", "Yetkazish {p} dan · olib ketish bepul"],
  by_bk_shops:  ["{n} shops", "{n} магазина", "{n} ta do\u2018kon"],
  by_bk_all:    ["All baskets", "Все корзины", "Barcha savatlar"],
  by_bk_clear_q:["Remove everything from {s}?", "Убрать всё из «{s}»?", "\u00ab{s}\u00bbdagi hammasi olib tashlansinmi?"],
  by_bk_clear:  ["Yes, remove", "Да, убрать", "Ha, olib tashlash"],
  by_bk_fix:    ["Fix", "Исправить", "Tuzatish"],
  by_co_t:      ["Check and send your order", "Проверьте и отправьте заказ", "Buyurtmani tekshirib yuboring"],
  by_co_1:      ["Your contact", "Ваши контакты", "Aloqa"],
  by_co_2:      ["How to receive it", "Как получить", "Qanday olasiz"],
  by_co_3:      ["Where to deliver", "Куда доставить", "Qayerga yetkazish"],
  by_co_4:      ["How you'll pay", "Как оплатите", "Qanday to\u2018laysiz"],
  by_co_5:      ["Note for the shop", "Комментарий для магазина", "Do\u2018kon uchun izoh"],
  by_co_opt:    ["optional", "необязательно", "ixtiyoriy"],
  by_co_req:    ["required", "обязательно", "majburiy"],
  by_co_phone_why:["The shop calls this number to confirm. It comes from your Telegram.", "Магазин позвонит на этот номер для подтверждения. Номер из Telegram.", "Do\u2018kon tasdiqlash uchun shu raqamga qo\u2018ng\u2018iroq qiladi. Raqam Telegramdan."],
  by_co_send:   ["Send order", "Отправить заказ", "Buyurtmani yuborish"],
  by_co_trust:  ["No payment now. The shop confirms first, then you pay on delivery or by Payme/Click.", "Сейчас без оплаты. Магазин сначала подтвердит, затем оплата при получении или через Payme/Click.", "Hozir to\u2018lov yo\u2018q. Do\u2018kon avval tasdiqlaydi, keyin olganda yoki Payme/Click orqali to\u2018laysiz."],
  by_co_summary:["Your order", "Ваш заказ", "Buyurtmangiz"],
  by_co_fix:    ["Fill in the marked fields", "Заполните отмеченные поля", "Belgilangan maydonlarni to\u2018ldiring"],
  by_co_name_l: ["Name for the shop", "Имя для магазина", "Do\u2018kon uchun ism"],
});

function ByQty({ value, onChange, max }){
  return (
    <div className="by-qty">
      <button onClick={()=>onChange(value-1)} aria-label="−">{value<=1? I.trash({width:18,height:18}) : I.minus({width:18,height:18})}</button>
      <b>{value}</b>
      <button onClick={()=>onChange(value+1)} disabled={max!=null && value>=max} aria-label="+">{I.plus({width:18,height:18})}</button>
    </div>
  );
}

function ByBasketLine({ it, issue, onQty, onRemove, t, lang }){
  return (
    <div className={"by-bl"+(issue?" warn":"")}>
      <span className="by-bl-img" style={it.image?{backgroundImage:"url("+it.image+")"}:undefined}></span>
      <div className="by-bl-m">
        <b>{it.productName}</b>
        {it.variantLabel && <span>{it.variantLabel}</span>}
        <em>{fmtPrice(it.unitPrice,lang)}</em>
        {issue && <span className="by-bl-warn">{I.warn({width:15,height:15})} {issue.kind==="gone"? t.ord_gone : fill(t.ord_short_l,{a:issue.available,b:it.quantity})}
          <button onClick={()=> issue.available>0? onQty(it.id, issue.available) : onRemove(it.id)}>{issue.available>0? fill(t.ord_fix,{n:issue.available}) : t.ch_remove}</button></span>}
      </div>
      <div className="by-bl-r">
        <b>{fmtPrice(it.unitPrice*it.quantity,lang)}</b>
        <ByQty value={it.quantity} onChange={(q)=> q<1? onRemove(it.id) : onQty(it.id,q)}/>
      </div>
    </div>
  );
}

function BasketPage({ orderStore, shopStore, t, lang, onClose, onCheckout, onOpenShop }){
  const baskets = orderStore.baskets();
  const [ask, setAsk] = React.useState(null);
  useEscape(onClose);
  const minFee = Math.min(...DELIVERY_METHODS.filter(m=>m.fee>0).map(m=>m.fee));
  const rq = !ordersOn();   // basket-request mode: send a link to the shop instead of checking out
  const total = baskets.reduce((n,b)=>n+orderStore.basketSubtotal(b.storeId),0);
  const items = orderStore.basketCount();
  return ReactDOM.createPortal(
    <div className="by by-od scroll-y" role="dialog" aria-label={t.by_bk_t}>
      <header className="by-top">
        <button className="by-back" onClick={onClose}>{I.back({width:20,height:20})}<span>{t.by_back_shop}</span></button>
        <div className="by-od-title"><b>{t.by_bk_t}</b><span>{items? byItemsLabel(items,t) : ""}</span></div>
        <div className="by-top-r"></div>
      </header>
      {baskets.length===0 ? (
        <div className="by-od-wrap one"><div className="by-empty big"><span className="by-empty-ic">{I.bag({width:32,height:32})}</span><b>{t.by_bk_empty}</b><p>{t.by_bk_empty_d}</p>
          <button className="by-btn primary" onClick={onClose}>{t.by_keep}</button></div></div>
      ) : (
        <div className="by-od-wrap">
          <div className="by-od-main">
            <p className="by-bk-note">{I.store({width:18,height:18})} {rq? t.rq_bk_note : t.by_bk_d}</p>
            {baskets.map(b=>{
              const issues = orderStore.basketIssues(b.storeId);
              const sub = orderStore.basketSubtotal(b.storeId);
              const n = b.items.reduce((m,x)=>m+x.quantity,0);
              return (
                <section key={b.storeId} className="by-card by-bk">
                  <div className="by-bk-h">
                    <ByShopAv shopStore={shopStore} shopId={b.storeId} size={44}/>
                    <button className="by-bk-id" onClick={()=>onOpenShop && onOpenShop(b.storeId)}><b>{b.store.name}</b><span>{rq? t.rq_bk_hint : fill(t.by_bk_ship,{p:fmtPrice(minFee,lang)})}</span></button>
                    <button className="by-btn sm ghost" onClick={()=>setAsk(b)}>{t.bk_clear}</button>
                  </div>
                  <div className="by-bk-lines">
                    {b.items.map(it=><ByBasketLine key={it.id} it={it} t={t} lang={lang} issue={issues.find(x=>x.item.id===it.id)}
                      onQty={(id,q)=>orderStore.setBasketQty(b.storeId,id,q)} onRemove={(id)=>orderStore.removeBasketItem(b.storeId,id)}/>)}
                  </div>
                  <div className="by-bk-f">
                    <div><span>{byItemsLabel(n,t)}</span><b>{fmtPrice(sub,lang)}</b></div>
                    <button className="by-btn primary" disabled={issues.length>0} onClick={()=>onCheckout(b.storeId)}>{rq? I.tg({width:18,height:18}) : null} {fill(rq? t.rq_send : t.by_bk_from,{s:b.store.name})} {rq? null : I.arrow({width:18,height:18})}</button>
                  </div>
                </section>
              );
            })}
          </div>
          <aside className="by-od-side">
            <section className="by-card by-bk-tot">
              <h2 className="by-card-t">{t.by_bk_all}</h2>
              {baskets.map(b=>(<div key={b.storeId} className="by-bk-tr"><span>{b.store.name}</span><b>{fmtPrice(orderStore.basketSubtotal(b.storeId),lang)}</b></div>))}
              <div className="by-bk-tr tot"><span>{t.by_total}</span><b>{fmtPrice(total,lang)}</b></div>
              <p className="by-hint">{rq? t.rq_next : t.by_co_trust}</p>
            </section>
          </aside>
        </div>
      )}
      {ask && <EzConfirm text={fill(t.by_bk_clear_q,{s:ask.store.name})} yes={t.by_bk_clear} no={t.by_no}
        onYes={()=>{ orderStore.clearBasket(ask.storeId); setAsk(null); }} onNo={()=>setAsk(null)}/>}
    </div>, document.body
  );
}

function ByCoSec({ n, title, req, children, t }){
  return (
    <section className="by-card by-co-sec">
      <h2 className="by-co-h"><i>{n}</i>{title}<small>{req? t.by_co_req : t.by_co_opt}</small></h2>
      {children}
    </section>
  );
}

function CheckoutSheet({ basket, orderStore, shopStore, t, lang, onClose, onSent }){
  const shopId = basket.storeId;
  const acct = orderStore.account();
  const saved = (acct && acct.addresses) || [];
  const def = orderStore.defaultAddress();
  const [name, setName] = React.useState((acct && acct.name) || "");
  const [digits, setDigits] = React.useState(acct? String(acct.phone).replace(/\D/g,"").slice(3) : "");
  const [addrId, setAddrId] = React.useState(def? def.id : "new");
  const [addr, setAddr] = React.useState("");
  const [saveAddr, setSaveAddr] = React.useState(true);
  const [how, setHow] = React.useState("courier");
  const [pay, setPay] = React.useState("cod");
  const [note, setNote] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  useEscape(onClose);
  React.useEffect(()=>{
    if(!acct) return;
    setName(n=> n || acct.name || "");
    setDigits(String(acct.phone).replace(/\D/g,"").slice(3));
    const d = orderStore.defaultAddress(); if(d) setAddrId(d.id);
  },[acct && acct.phone]);
  React.useEffect(()=>{ if(!DELIVERY_METHODS.some(m=>m.id===how)) setHow(DELIVERY_METHODS[0].id); },[]);

  const usingSaved = addrId!=="new";
  const chosen = usingSaved? saved.find(a=>a.id===addrId) : null;
  const addrText = usingSaved? (chosen? chosen.text : "") : addr;
  const needsAddr = how!=="pickup";
  const fee = deliveryFee(how);
  const goods = orderStore.basketSubtotal(shopId);
  const nameOk = name.trim().length>=2;
  const phoneOk = validPhone(digits);
  const addrOk = !needsAddr || addrText.trim().length>=6;
  const ready = nameOk && phoneOk && addrOk;
  const issues = orderStore.basketIssues(shopId);
  const n = basket.items.reduce((m,x)=>m+x.quantity,0);

  function send(){
    setTouched(true);
    if(!ready || issues.length) return;
    const idx = shopStore.variantIndex(shopId);
    const lines = basket.items.map(it=>{
      const hit = idx[it.variantId];
      return { variantId: it.variantId, productId: it.productId, name: it.productName,
        label: it.variantLabel || (hit? vLabel(hit.p, hit.v, lang) : ""), qty: it.quantity, unit: it.unitPrice };
    }).filter(l=>l.variantId);
    if(!lines.length) return;
    if(needsAddr && !usingSaved && saveAddr && addr.trim().length>=6) orderStore.addAddress({ text:addr.trim() });
    if(name.trim() && name.trim()!==((acct&&acct.name)||"")) orderStore.setAccountName(name.trim());
    const order = shopStore.createOrder(shopId, {
      customer:{ name:name.trim(), phone:"+998 "+fmtPhone(digits), address: needsAddr? addrText.trim() : "", verified: !!(acct && acct.verifiedAt) },
      delivery:{ method:how }, pay:{ method:pay }, note:note.trim(), lines,
    });
    orderStore.attachOrder(shopId, order, basket.store);
    onSent(order, basket.store);
  }

  return ReactDOM.createPortal(
    <div className="by by-od scroll-y" role="dialog" aria-label={t.by_co_t}>
      <header className="by-top">
        <button className="by-back" onClick={onClose}>{I.back({width:20,height:20})}<span>{t.by_bk_t}</span></button>
        <div className="by-od-title"><b>{t.by_co_t}</b><span>{basket.store.name}</span></div>
        <div className="by-top-r"></div>
      </header>
      {!acct ? (
        <div className="by-od-wrap one"><div className="by-card"><SignInGate orderStore={orderStore} t={t} lang={lang}/></div></div>
      ) : (
      <div className="by-od-wrap">
        <div className="by-od-main">
          <ByCoSec t={t} n="1" title={t.by_co_1} req>
            <div className="by-co-acct">{TG_I.logo({width:34,height:34})}<div><b>{acct.phone}</b><span>{t.by_co_phone_why}</span></div></div>
            <label className="by-lab" htmlFor="co-name">{t.by_co_name_l}</label>
            <input id="co-name" className={"by-input"+(touched&&!nameOk?" err":"")} value={name} onChange={e=>setName(e.target.value)} placeholder="Dilnoza R."/>
            {touched && !nameOk && <span className="by-err">{t.co_need_name}</span>}
          </ByCoSec>
          <ByCoSec t={t} n="2" title={t.by_co_2} req>
            <div className="by-picks">
              {DELIVERY_METHODS.map(m=>(
                <button key={m.id} className={"by-pick"+(how===m.id?" on":"")} onClick={()=>setHow(m.id)} aria-pressed={how===m.id}>
                  <span className="by-radio"></span>
                  <span className="by-pick-m"><b>{m.label[lang]}</b><span>{m.hint[lang]}</span></span>
                  <em>{m.fee? fmtPrice(m.fee,lang) : t.by_free}</em>
                </button>
              ))}
            </div>
          </ByCoSec>
          {needsAddr && (
            <ByCoSec t={t} n="3" title={t.by_co_3} req>
              {saved.length>0 && <div className="by-picks">
                {saved.map(a=>(
                  <button key={a.id} className={"by-pick"+(addrId===a.id?" on":"")} onClick={()=>setAddrId(a.id)} aria-pressed={addrId===a.id}>
                    <span className="by-radio"></span><span className="by-pick-m"><b>{a.label || t.co_address}</b><span>{a.text}</span></span>
                  </button>
                ))}
                <button className={"by-pick"+(addrId==="new"?" on":"")} onClick={()=>setAddrId("new")}><span className="by-radio"></span><span className="by-pick-m"><b>{t.ac_new_addr}</b></span></button>
              </div>}
              {!usingSaved && <>
                <textarea className={"by-input"+(touched&&!addrOk?" err":"")} rows="2" value={addr} onChange={e=>setAddr(e.target.value)} placeholder={t.co_address_ph} style={{marginTop:saved.length?10:0}}></textarea>
                <label className="switch-row by-switch"><input type="checkbox" checked={saveAddr} onChange={e=>setSaveAddr(e.target.checked)}/><span className="switch"><i></i></span>{t.ac_save_addr}</label>
              </>}
              {touched && !addrOk && <span className="by-err">{t.co_need_address}</span>}
            </ByCoSec>
          )}
          <ByCoSec t={t} n={needsAddr?"4":"3"} title={t.by_co_4} req>
            <div className="by-picks two">
              {ORDER_PAY.map(m=>(
                <button key={m.id} className={"by-pick"+(pay===m.id?" on":"")} onClick={()=>setPay(m.id)} aria-pressed={pay===m.id}>
                  <span className="by-radio"></span><span className="by-pick-m"><b>{m.label[lang]}</b></span>
                </button>
              ))}
            </div>
          </ByCoSec>
          <ByCoSec t={t} n={needsAddr?"5":"4"} title={t.by_co_5}>
            <textarea className="by-input" rows="2" value={note} onChange={e=>setNote(e.target.value)} placeholder={t.or_note}></textarea>
          </ByCoSec>
        </div>
        <aside className="by-od-side by-co-side">
          <section className="by-card">
            <div className="by-bk-h"><ByShopAv shopStore={shopStore} shopId={shopId} size={40}/><div className="by-bk-id"><b>{basket.store.name}</b><span>{byItemsLabel(n,t)}</span></div></div>
            <div className="by-bk-lines">
              {basket.items.map(it=><ByBasketLine key={it.id} it={it} t={t} lang={lang} issue={issues.find(x=>x.item.id===it.id)}
                onQty={(id,q)=>orderStore.setBasketQty(shopId,id,q)} onRemove={(id)=>orderStore.removeBasketItem(shopId,id)}/>)}
            </div>
            <div className="by-sum">
              <div><span>{t.by_goods}</span><b>{fmtPrice(goods,lang)}</b></div>
              <div><span>{t.by_fee}</span><b>{fee? fmtPrice(fee,lang) : t.by_free}</b></div>
              <div className="tot"><span>{t.by_total}</span><b>{fmtPrice(goods+fee,lang)}</b></div>
            </div>
            <div className="by-co-send">
              {touched && !ready && <span className="by-err">{t.by_co_fix}</span>}
              <button className="by-btn primary wide big" onClick={send} disabled={issues.length>0}>{I.check({width:20,height:20})} {t.by_co_send} · {fmtPrice(goods+fee,lang)}</button>
              <p className="by-hint">{t.by_co_trust}</p>
            </div>
          </section>
        </aside>
      </div>
      )}
    </div>, document.body
  );
}

Object.assign(window, { BasketPage, CheckoutSheet, ByQty });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ByQty, ByBasketLine, BasketPage, ByCoSec, CheckoutSheet });
