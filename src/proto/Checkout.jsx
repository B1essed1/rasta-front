// ===== Checkout — the customer's request, and the status page they get back =====
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
  const how = "pickup";   // rastashops has no delivery: buyer and seller agree on hand-over in chat
  const [pay, setPay] = React.useState("cod");
  const [note, setNote] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  useEscape(onClose);

  // signing in mid-flow: adopt whatever the account already knows
  React.useEffect(()=>{
    if(!acct) return;
    setName(n=> n || acct.name || "");
    setDigits(String(acct.phone).replace(/\D/g,"").slice(3));
    const d = orderStore.defaultAddress();
    if(d) setAddrId(d.id);
  },[acct && acct.phone]);

  const usingSaved = addrId!=="new";
  const chosen = usingSaved? saved.find(a=>a.id===addrId) : null;
  const addrText = usingSaved? (chosen? chosen.text : "") : addr;
  const needsAddr = how==="courier" || how==="post";
  const fee = 0;
  const goods = orderStore.basketSubtotal(shopId);
  const nameOk = name.trim().length>=2;
  const phoneOk = validPhone(digits);
  const addrOk = !needsAddr || addrText.trim().length>=6;
  const ready = nameOk && phoneOk && addrOk;

  function send(){
    setTouched(true);
    if(!ready) return;
    const idx = shopStore.variantIndex(shopId);
    const lines = basket.items.map(it=>{
      const vid = it.variantId;
      const hit = idx[vid];
      return { variantId: vid, productId: it.productId, name: it.productName,
        label: it.variantLabel || (hit? vLabel(hit.p, hit.v, lang) : ""), qty: it.quantity, unit: it.unitPrice };
    }).filter(l=>l.variantId);
    if(!lines.length) return;
    if(needsAddr && !usingSaved && saveAddr && addr.trim().length>=6) orderStore.addAddress({ text:addr.trim() });
    if(name.trim() && name.trim()!==((acct&&acct.name)||"")) orderStore.setAccountName(name.trim());
    const order = shopStore.createOrder(shopId, {
      customer:{ name:name.trim(), phone:"+998 "+fmtPhone(digits), address: needsAddr? addrText.trim() : "",
        verified: !!(acct && acct.verifiedAt) },
      delivery:{ method:how }, pay:{ method:pay }, note:note.trim(), lines,
    });
    orderStore.attachOrder(shopId, order, basket.store);
    onSent(order, basket.store);
  }

  return (
    <div className="co-scrim" onClick={onClose}>
      <div className="co-sheet scroll-y" onClick={e=>e.stopPropagation()}>
        <div className="co-head">
          <div><b>{t.co_title}</b><span>{t.co_sub}</span></div>
          <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
        </div>

        {!acct ? (
          <div className="co-body">
            <div className="co-shop">
              <ChatAvatar store={basket.store}/>
              <div><b>{basket.store.name}</b><span>{basket.items.reduce((n,x)=>n+x.quantity,0)} {t.sc_items} · {fmtPrice(goods,lang)}</span></div>
            </div>
            <SignInGate orderStore={orderStore} t={t} lang={lang}/>
          </div>
        ) : (
        <>
        <div className="co-body">
          <div className="co-shop">
            <ChatAvatar store={basket.store}/>
            <div><b>{basket.store.name}</b><span>{basket.items.reduce((n,x)=>n+x.quantity,0)} {t.sc_items} · {fmtPrice(goods,lang)}</span></div>
          </div>

          <div className="co-items">
            {basket.items.map(it=>(
              <OrderLine key={it.id} it={it} t={t} lang={lang} onOpen={()=>{}}
                onQty={(id,q)=>orderStore.setBasketQty(shopId,id,q)}
                onRemove={(id)=>orderStore.removeBasketItem(shopId,id)}/>
            ))}
            <button className="lnk co-more" onClick={onClose}>{I.plus({width:14,height:14})} {t.ord_more}</button>
          </div>

          <div className="co-acct">
            {TG_I.logo({width:28,height:28})}
            <div className="co-acct-m"><b>{t.ac_signed_as}</b><span>{acct.name? acct.name+" · " : ""}{acct.phone}</span></div>
            {acct.verifiedAt && <VerifiedTag t={t} small/>}
          </div>

          <div className="co-field">
            <label>{t.co_name}</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dilnoza R." autoFocus/>
            {touched && !nameOk && <span className="co-err">{t.co_need_name}</span>}
          </div>

          {needsAddr && (
            <div className="co-field">
              <label>{t.co_address}</label>
              {saved.length>0 && (
                <div className="co-addrs">
                  {saved.map(a=>(
                    <button key={a.id} className={"co-addr"+(addrId===a.id?" on":"")} onClick={()=>setAddrId(a.id)}>
                      <span className="co-pick-r"></span>
                      <span className="co-addr-m"><b>{a.label || t.co_address}</b><i>{a.text}</i></span>
                    </button>
                  ))}
                  <button className={"co-addr"+(addrId==="new"?" on":"")} onClick={()=>setAddrId("new")}>
                    <span className="co-pick-r"></span>
                    <span className="co-addr-m"><b>{t.ac_new_addr}</b></span>
                  </button>
                </div>
              )}
              {!usingSaved && (
                <>
                  <textarea value={addr} rows="2" onChange={e=>setAddr(e.target.value)} placeholder={t.co_address_ph}></textarea>
                  <label className="switch-row" style={{marginTop:10}}>
                    <input type="checkbox" checked={saveAddr} onChange={e=>setSaveAddr(e.target.checked)}/>
                    <span className="switch"><i></i></span>{t.ac_save_addr}
                  </label>
                </>
              )}
              {touched && !addrOk && <span className="co-err">{t.co_need_address}</span>}
            </div>
          )}

          <div className="co-field">
            <label>{t.co_pay}</label>
            <div className="chip-row">
              {ORDER_PAY.map(m=>(
                <button key={m.id} className={"pick-chip"+(pay===m.id?" on":"")} onClick={()=>setPay(m.id)}>{m.label[lang]}</button>
              ))}
            </div>
          </div>

          <div className="co-field">
            <label>{t.co_note}</label>
            <textarea value={note} rows="2" onChange={e=>setNote(e.target.value)} placeholder={t.or_note}></textarea>
          </div>

          <div className="co-sum">
            <div className="co-sum-r"><span>{t.or_goods}</span><b>{fmtPrice(goods,lang)}</b></div>
            <div className="co-sum-r tot"><span>{t.or_total}</span><b>{fmtPrice(goods+fee,lang)}</b></div>
          </div>
        </div>

        <div className="co-foot">
          <button className="btn btn-accent" style={{width:"100%"}} onClick={send}>{I.check({width:18,height:18})} {t.co_send}</button>
          <span className="co-note">{t.co_sms}</span>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

function OrderSentSheet({ order, shop, t, lang, onClose, onTrack }){
  useEscape(onClose);
  return (
    <div className="co-scrim" onClick={onClose}>
      <div className="co-sheet narrow" onClick={e=>e.stopPropagation()}>
        <div className="co-done">
          <div className="co-done-ic">{I.check({width:32,height:32})}</div>
          <b>{t.co_sent_t}</b>
          <p>{fill(t.co_sent_d,{store:shop.name})}</p>
          <div className="co-no"><span>{t.co_order_no}</span><b>#{order.no}</b></div>
          <button className="btn btn-accent" style={{width:"100%"}} onClick={onTrack}>{I.clock({width:17,height:17})} {t.co_track}</button>
          <span className="co-note">{t.co_keep_link}</span>
        </div>
      </div>
    </div>
  );
}

// what the buyer sees at rastashops.com/order/<no>
function OrderStatusPage({ order, shop, t, lang, onClose, onCancel }){
  const steps = ["new","confirmed","ready","out","completed"];
  const cancelled = order.status==="cancelled";
  const at = steps.indexOf(order.status);
  const pickup = order.delivery.method==="pickup";
  const flow = ["new","confirmed","completed"];   // no delivery stages
  const smsText = (s)=>{
    const how = pickup? t.co_sms_ready : t.co_sms_out;
    return ({ new: fill(t.co_sms_new,{no:"#"+order.no, store:shop.name}),
      confirmed: fill(t.co_sms_confirmed,{store:shop.name, no:"#"+order.no, how: deliveryLabel(order.delivery.method,lang)}),
      ready: fill(t.co_sms_ready,{no:"#"+order.no}),
      out: fill(t.co_sms_out,{no:"#"+order.no}),
      completed: fill(t.co_sms_completed,{no:"#"+order.no}),
      cancelled: fill(t.co_sms_cancelled,{store:shop.name, no:"#"+order.no, why: order.cancelReason||""}) })[s] || "";
  };
  useEscape(onClose);
  return (
    <div className="co-scrim" onClick={onClose}>
      <div className="co-sheet scroll-y" onClick={e=>e.stopPropagation()}>
        <div className="co-head">
          <div><b>{fill(t.co_status_t,{no:"#"+order.no})}</b><span>rastashops.com/order/{order.no}</span></div>
          <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
        </div>
        <div className="co-body">
          {cancelled ? (
            <div className="co-cancelled">
              {I.warn({width:18,height:18})}
              <div><b>{order.cancelledBy==="customer"? t.co_cancelled_own : t.or_cancelled}</b>
                {order.cancelReason && <span>{order.cancelReason}</span>}</div>
            </div>
          ) : (
            <div className="co-track">
              {flow.map((s,i)=>{
                const done = flow.indexOf(order.status)>=i;
                const cur = order.status===s;
                return (
                  <div key={s} className={"co-step"+(done?" done":"")+(cur?" on":"")}>
                    <span className="co-step-d">{done? I.check({width:13,height:13}) : i+1}</span>
                    <span className="co-step-l">{orderStateLabel(s,t)}</span>
                    {cur && s==="new" && <span className="co-step-w">{t.co_waiting}</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="co-lines">
            {order.lines.filter(l=>!l.dropped).map(l=>(
              <div key={l.variantId} className="co-line">
                <b>{l.name}{l.label && l.label!=="default"? " · "+l.label : ""}</b>
                <span>{l.qty} × {fmtNum(l.unit)}</span>
              </div>
            ))}
            {order.lines.filter(l=>l.dropped).map(l=>(
              <div key={l.variantId} className="co-line off">
                <b>{l.name}{l.label && l.label!=="default"? " · "+l.label : ""}</b>
                <span>{t.or_dropped}</span>
              </div>
            ))}
          </div>
          <div className="co-sum">
            <div className="co-sum-r"><span>{t.or_payment}</span><b>{orderPayLabel(order.pay.method,lang)}</b></div>
            <div className="co-sum-r tot"><span>{t.or_total}</span><b>{fmtPrice(order.total,lang)}</b></div>
          </div>

          <div className="co-smslog">
            <div className="set-title" style={{marginBottom:9}}>{t.co_sms_log}</div>
            {(order.sms||[]).map((m,i)=>(
              <div key={i} className="co-sms">
                {I.phone({width:14,height:14})}
                <div><span>{smsText(m.kind)}</span><i>{fmtDateTime(m.at,lang)}</i></div>
              </div>
            ))}
          </div>

          {order.status==="new" && (
            <div className="co-cancel">
              <button className="btn btn-ghost btn-sm" onClick={onCancel}>{t.co_cancel_own}</button>
              <span className="hint" style={{margin:0}}>{t.co_cancel_own_d}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheckoutSheet, OrderSentSheet, OrderStatusPage });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { CheckoutSheet, OrderSentSheet, OrderStatusPage });
