// ===== Buyer account — phone is the account; orders are found by number, not by browser =====

// Every order this phone has placed, across every shop. This is what makes history
// device-independent: it is derived from the catalog side, not from local storage.
function ordersForPhone(shopStore, phone){
  if(!phone) return [];
  const want = String(phone).replace(/\D/g,"");
  const out = [];
  SHOP_ORDER.forEach(sid=>{
    (shopStore.orders(sid)||[]).forEach(o=>{
      if(String(o.customer.phone||"").replace(/\D/g,"")===want) out.push({ ...o, shopId:sid });
    });
  });
  return out.sort((a,b)=>b.at-a.at);
}

function VerifiedTag({ t, small }){
  return (
    <span className={"ver-tag"+(small?" sm":"")} title={t.ac_verified_h}>
      {I.check({width:small?11:12, height:small?11:12})} {t.ac_verified}
    </span>
  );
}

function SignInGate({ orderStore, t, lang, onDone, title }){
  return (
    <div className="ac-gate">
      <div className="ac-gate-head">
        <div className="ac-gate-ic tg">{TG_I.logo({width:40,height:40})}</div>
        <b>{title || t.ac_signin_t}</b>
        <p>{t.ac_signin_d}</p>
      </div>
      <ul className="ac-why">
        <li>{I.check({width:14,height:14})} {t.ac_why1}</li>
        <li>{I.check({width:14,height:14})} {t.ac_why2}</li>
        <li>{I.check({width:14,height:14})} {t.ac_why3}</li>
      </ul>
      <AuthFlow t={t} headless cta={t.au_continue}
        onDone={(phone, tg)=>{ orderStore.signIn(phone); if(tg && tg.name && orderStore.setAccountName) orderStore.setAccountName(tg.name); toast(t.ac_signedin_toast); onDone && onDone(phone); }}/>
    </div>
  );
}

function AddressForm({ t, onAdd, onCancel }){
  const [label, setLabel] = React.useState("");
  const [text, setText] = React.useState("");
  const ok = text.trim().length>=6;
  return (
    <div className="ac-addr-form">
      <div className="co-field">
        <label>{t.ac_addr_label}</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder={t.ac_addr_label_ph}/>
      </div>
      <div className="co-field">
        <label>{t.co_address}</label>
        <textarea rows="2" value={text} onChange={e=>setText(e.target.value)} placeholder={t.co_address_ph}></textarea>
      </div>
      <div className="ac-addr-acts">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>{t.g_cancel}</button>
        <button className="btn btn-accent btn-sm" disabled={!ok}
          onClick={()=>{ onAdd({ label:label.trim(), text:text.trim() }); onCancel(); }}>{t.g_save}</button>
      </div>
    </div>
  );
}

function AddressBook({ orderStore, t }){
  const acct = orderStore.account();
  const list = (acct && acct.addresses) || [];
  const [adding, setAdding] = React.useState(false);
  return (
    <div className="ac-block">
      <div className="set-title">{t.ac_addresses}</div>
      {list.length===0 && !adding && <div className="hint" style={{margin:"0 0 10px"}}>{t.ac_no_addr}</div>}
      <div className="ac-addr-list">
        {list.map(a=>(
          <div key={a.id} className={"ac-addr"+(a.isDefault?" def":"")}>
            <div className="ac-addr-m">
              <b>{a.label || t.co_address}{a.isDefault && <span className="ac-def">{t.ac_addr_default}</span>}</b>
              <span>{a.text}</span>
            </div>
            <div className="ac-addr-b">
              {!a.isDefault && <button className="lnk" onClick={()=>orderStore.setDefaultAddress(a.id)}>{t.ac_set_default}</button>}
              <button className="cw-item-x" onClick={()=>orderStore.removeAddress(a.id)} aria-label={t.g_delete}>{I.x({width:14,height:14})}</button>
            </div>
          </div>
        ))}
      </div>
      {adding
        ? <AddressForm t={t} onAdd={(e)=>{ orderStore.addAddress(e); toast(t.ac_saved); }} onCancel={()=>setAdding(false)}/>
        : <button className="ac-add" onClick={()=>setAdding(true)}>{I.plus({width:15,height:15})} {t.ac_add_address}</button>}
    </div>
  );
}

function MyOrdersList({ orders, shopStore, t, lang, onOpen }){
  if(!orders.length){
    return (
      <div className="cw-empty">
        <div className="cw-empty-ic">{I.bag({width:24,height:24})}</div>
        <b>{t.ac_no_orders}</b>
        <p>{t.ac_no_orders_d}</p>
      </div>
    );
  }
  return (
    <div className="ac-orders">
      {orders.map(o=>{
        const shop = shopStore.shopMeta(o.shopId);
        const n = o.lines.filter(l=>!l.dropped).reduce((m,l)=>m+l.qty,0);
        return (
          <button key={o.id} className="ac-order" onClick={()=>onOpen(o)}>
            <span className="ac-order-no">#{o.no}</span>
            <span className="ac-order-m">
              <b>{shop.name}</b>
              <span>{n} {t.sc_items} · {relDay(o.at,lang)}</span>
            </span>
            <OrderStatePill status={o.status} t={t}/>
            <span className="ac-order-t">{fmtPrice(o.total,lang)}</span>
          </button>
        );
      })}
    </div>
  );
}

function AccountPanel({ orderStore, shopStore, t, lang, onClose, onOpenOrder }){
  const acct = orderStore.account();
  const [tab, setTab] = React.useState("orders");
  const [name, setName] = React.useState((acct && acct.name) || "");
  React.useEffect(()=>{ setName((orderStore.account()||{}).name || ""); }, [acct && acct.phone]);

  if(!acct){
    return (
      <>
        <div className="cw-head">
          <div className="cw-head-id"><b>{t.ac_title}</b><span>{t.ac_signin}</span></div>
          <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
        </div>
        <div className="cw-list scroll-y"><SignInGate orderStore={orderStore} t={t} lang={lang} title={t.ac_signin_t2}/></div>
      </>
    );
  }
  const orders = ordersForPhone(shopStore, acct.phone);
  return (
    <>
      <div className="cw-head">
        <div className="cw-head-id">
          <b>{acct.name || t.ac_title}</b>
          <span>{acct.phone}</span>
        </div>
        <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button>
      </div>
      <div className="ac-tabs">
        <button className={tab==="orders"?"on":""} onClick={()=>setTab("orders")}>
          {t.ac_tab_orders}{orders.length? <i>{orders.length}</i> : null}
        </button>
        <button className={tab==="profile"?"on":""} onClick={()=>setTab("profile")}>{t.ac_tab_profile}</button>
      </div>
      <div className="cw-list scroll-y">
        {tab==="orders"
          ? <MyOrdersList orders={orders} shopStore={shopStore} t={t} lang={lang} onOpen={onOpenOrder}/>
          : (
            <>
              <div className="ac-id">
                <div className="ac-id-ph">{I.phone({width:18,height:18})}</div>
                <div className="ac-id-m">
                  <b>{acct.phone}</b>
                  <span>{acct.verifiedAt? <VerifiedTag t={t} small/> : t.ac_unverified}</span>
                </div>
              </div>
              <div className="ac-block">
                <div className="set-title">{t.ac_name}</div>
                <div className="co-field">
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dilnoza R."
                    onBlur={()=>{ if(name.trim()!==(acct.name||"")){ orderStore.setAccountName(name.trim()); toast(t.ac_saved); } }}/>
                  <span className="hint">{t.ac_name_d}</span>
                </div>
              </div>
              <AddressBook orderStore={orderStore} t={t}/>
              <div className="ac-block">
                <button className="btn btn-ghost btn-sm" onClick={()=>{ orderStore.signOut(); onClose(); }}>
                  {t.ac_signout}
                </button>
              </div>
            </>
          )}
      </div>
    </>
  );
}

Object.assign(window, { AccountPanel, SignInGate, AddressBook, AddressForm, MyOrdersList, VerifiedTag, ordersForPhone });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { ordersForPhone, VerifiedTag, SignInGate, AddressForm, AddressBook, MyOrdersList, AccountPanel });
