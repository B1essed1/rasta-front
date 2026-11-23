// ===== Buyer order pages — order detail / tracking, and "order sent" =====
addI18N({
  by_sent_t:   ["Order sent to {s}", "Заказ отправлен в «{s}»", "Buyurtma \u00ab{s}\u00bbga yuborildi"],
  by_sent_d:   ["Nothing is paid yet. The shop checks stock and confirms first.", "Пока ничего не оплачено. Магазин сначала проверит наличие и подтвердит.", "Hali hech narsa to\u2018lanmagan. Do\u2018kon avval tekshirib tasdiqlaydi."],
  by_next1:    ["The shop confirms", "Магазин подтверждает", "Do\u2018kon tasdiqlaydi"],
  by_next1_d:  ["Usually within a few hours", "Обычно за несколько часов", "Odatda bir necha soatda"],
  by_next2:    ["You get a Telegram message", "Вам придёт сообщение в Telegram", "Telegramga xabar keladi"],
  by_next2_d:  ["At every step, from @rastashops_bot", "На каждом шаге, от @rastashops_bot", "Har bir bosqichda, @rastashops_bot dan"],
  by_next3:    ["Agree on hand-over in chat", "Договоритесь о передаче в чате", "Topshirishni chatda kelishing"],
  by_next3_d:  ["Pay when you receive it, if cash", "Оплата при получении, если наличными", "Naqd bo\u2018lsa, olganda to\u2018laysiz"],
  by_keep:     ["Continue shopping", "Продолжить покупки", "Xaridni davom ettirish"],
  by_pickup_at:["Pickup from", "Самовывоз из", "Olib ketish joyi"],
  by_no_addr:  ["Agree in chat", "Договоритесь в чате", "Chatda kelishing"],
  by_shop_cancel:["The shop cancelled this order", "Магазин отменил заказ", "Do\u2018kon buyurtmani bekor qildi"],
  by_you_cancel:["You cancelled this order", "Вы отменили заказ", "Siz buyurtmani bekor qildingiz"],
  by_reason:   ["Reason", "Причина", "Sabab"],
  by_removed_l:["Removed by the shop — not available", "Убрано магазином — нет в наличии", "Do\u2018kon olib tashladi — mavjud emas"],
});

function OrderStatusPage({ order, shop, t, lang, onClose, onCancel, shopStore, orderStore, onOpenShop }){
  const ss = shopStore || window.__shopStore;
  const os = orderStore;
  const [ask, setAsk] = React.useState(false);
  const [log, setLog] = React.useState(false);
  useEscape(onClose);
  React.useEffect(()=>{ const el = document.querySelector(".by-od"); if(el) el.scrollTop = 0; }, [order.id]);
  const o = { ...order, shopId: order.shopId || shop.id };
  const m = BY_STATUS[o.status] || BY_STATUS.new;
  const off = o.status==="cancelled" || o.status==="declined";
  const flow = byFlow(o).filter(s=>s!=="ready" && s!=="out");   // no delivery stages
  const at = flow.indexOf(o.status);
  const hist = o.history || [{ status:o.status, at:o.at }];
  const when = (s)=>{ const h = hist.filter(x=>x.status===s).pop(); return h? fmtDateTime(h.at,lang) : null; };
  const ls = byLines(o);
  const dropped = (o.lines||[]).filter(l=>l.dropped);
  const contacts = ((ss.settings(o.shopId)||{}).contacts)||{};
  const pickup = o.delivery.method==="pickup";
  const fee = o.delivery.fee || 0;
  const goods = o.goods != null ? o.goods : ls.reduce((n,l)=>n+l.qty*l.unit,0);
  const reviewed = (pid)=> (ss.reviews(o.shopId)||[]).some(r=>r.productId===pid && os && os.account() && r.author===os.account().phone);
  const smsText = (k)=> ({ new: fill(t.co_sms_new,{no:"#"+o.no, store:shop.name}),
    confirmed: fill(t.co_sms_confirmed,{store:shop.name, no:"#"+o.no, how: deliveryLabel(o.delivery.method,lang)}),
    ready: fill(t.co_sms_ready,{no:"#"+o.no}), out: fill(t.co_sms_out,{no:"#"+o.no}),
    completed: fill(t.co_sms_completed,{no:"#"+o.no}),
    cancelled: fill(t.co_sms_cancelled,{store:shop.name, no:"#"+o.no, why:o.cancelReason||""}) })[k] || "";

  return ReactDOM.createPortal(
    <div className="by by-od scroll-y" role="dialog" aria-label={fill(t.by_order_no,{n:o.no})}>
      <header className="by-top">
        <button className="by-back" onClick={onClose}>{I.back({width:20,height:20})}<span>{t.bp_back}</span></button>
        <div className="by-od-title"><b>{fill(t.by_order_no,{n:o.no})}</b><span>{fmtDateTime(o.at,lang)}</span></div>
        <div className="by-top-r"><ByChip o={o} t={t}/></div>
      </header>

      <div className="by-od-wrap">
        <div className="by-od-main">
          <section className={"by-od-hero "+m.tone}>
            <div className="by-od-shop"><ByShopAv shopStore={ss} shopId={o.shopId} size={40}/><span>{shop.name}</span></div>
            <h1>{off? (o.cancelledBy==="customer"? t.by_you_cancel : t.by_shop_cancel) : byHeadline(o, shop.name, t)}</h1>
            {off ? (o.cancelReason && <p><b>{t.by_reason}:</b> {o.cancelReason}</p>) : m.n && <p>{t[m.n]}</p>}
            {!off && (
              <ol className="by-od-steps">
                {flow.map((s,i)=>(
                  <li key={s} className={(i<at?"done":"")+(i===at?" cur":"")}>
                    <span className="by-od-dot">{i<=at? I.check({width:14,height:14}) : i+1}</span>
                    <div><b>{byStepLabel(s,o,t)}</b><span>{when(s) || "\u00a0"}</span></div>
                  </li>
                ))}
              </ol>
            )}
            {o.status==="completed" && os && ls.some(l=>!reviewed(l.productId)) && (
              <div className="by-od-rate">
                <b>{t.by_rate_t}</b>
                {ls.filter(l=>!reviewed(l.productId)).map(l=>(
                  <ByRateCard key={l.productId} compact item={{ shopId:o.shopId, productId:l.productId, name:l.name, at:o.at }} shopStore={ss} acct={os.account()} t={t} lang={lang}/>
                ))}
              </div>
            )}
          </section>

          <section className="by-card">
            <h2 className="by-card-t">{t.by_items} · {byItemsLabel(ls.reduce((n,l)=>n+l.qty,0),t)}</h2>
            <div className="by-od-lines">
              {ls.map(l=>{ const src = byImg(ss, o.shopId, l.productId, 160, 200);
                return (
                  <div key={l.variantId} className="by-od-line">
                    <span className="by-od-img" style={src?{backgroundImage:"url("+src+")"}:undefined}></span>
                    <div className="by-od-lm"><b>{l.name}</b>{l.label && l.label!=="default" && <span>{l.label}</span>}<em>{l.qty} × {fmtPrice(l.unit,lang)}</em></div>
                    <b className="by-od-lt">{fmtPrice(l.qty*l.unit,lang)}</b>
                  </div>
                ); })}
              {dropped.map(l=>(
                <div key={l.variantId} className="by-od-line off">
                  <span className="by-od-img" style={{backgroundImage:"url("+byImg(ss,o.shopId,l.productId,160,200)+")"}}></span>
                  <div className="by-od-lm"><b>{l.name}</b><span>{t.by_removed_l}</span></div>
                </div>
              ))}
            </div>
            <div className="by-sum">
              <div><span>{t.by_goods}</span><b>{fmtPrice(goods,lang)}</b></div>
              <div className="tot"><span>{t.by_total}</span><b>{fmtPrice(o.total,lang)}</b></div>
            </div>
            {os && (off || o.status==="completed") && (
              <button className="by-btn primary wide" onClick={()=>{ const k = byBuyAgain(ss, os, o.shopId, ls, lang); toast(k? t.by_again_done : t.inv_out, k?"ok":"warn"); }}>{I.undo({width:18,height:18})} {t.by_again}</button>
            )}
          </section>

          <section className="by-card">
            <button className="by-od-logh" onClick={()=>setLog(v=>!v)} aria-expanded={log}>
              <span>{I.tg({width:18,height:18})} {t.by_tg_log} · {(o.sms||[]).length}</span>{log? I.minus({width:16,height:16}) : I.plus({width:16,height:16})}
            </button>
            {log && <div className="by-od-log">{(o.sms||[]).map((s,i)=>(
              <div key={i} className="by-od-msg"><p>{smsText(s.kind)}</p><time>{fmtDateTime(s.at,lang)}</time></div>
            ))}</div>}
          </section>
        </div>

        <aside className="by-od-side">
          <section className="by-card">
            <h2 className="by-card-t">{t.by_recipient}</h2>
            <dl className="by-kv">
              <div><dt>{t.by_recipient}</dt><dd>{o.customer.name}<br/>{o.customer.phone}</dd></div>
              <div><dt>{t.by_payment}</dt><dd>{orderPayLabel(o.pay.method,lang)}</dd></div>
            </dl>
          </section>
          <section className="by-card">
            <h2 className="by-card-t">{t.by_shop}</h2>
            <div className="by-od-shopcard"><ByShopAv shopStore={ss} shopId={o.shopId} size={52}/><div><b>{shop.name}</b><span>{shop.location}</span></div></div>
            <div className="by-stack tight">
              {contacts.telegram && <a className="by-btn primary wide" href={"https://t.me/"+contacts.telegram} target="_blank" rel="noreferrer">{I.tg({width:18,height:18})} {t.by_message}</a>}
              {contacts.phone && <a className="by-btn wide" href={"tel:"+contacts.phone.replace(/\s/g,"")}>{I.phone({width:18,height:18})} {t.by_call} · {contacts.phone}</a>}
              {onOpenShop && <button className="by-btn ghost wide" onClick={()=>onOpenShop(o.shopId)}>{I.store({width:18,height:18})} {t.by_visit}</button>}
            </div>
          </section>
          {o.status==="new" && onCancel && (
            <section className="by-card by-od-cancel">
              <p className="by-hint">{t.by_cancel_h}</p>
              <button className="by-btn danger-ghost wide" onClick={()=>setAsk(true)}>{t.by_cancel}</button>
            </section>
          )}
        </aside>
      </div>
      {ask && <EzConfirm text={t.by_cancel_q} yes={t.by_cancel_yes} no={t.by_no} onYes={()=>{ setAsk(false); onCancel(); }} onNo={()=>setAsk(false)}/>}
    </div>, document.body
  );
}

function OrderSentSheet({ order, shop, t, lang, onClose, onTrack }){
  useEscape(onClose);
  const ss = window.__shopStore;
  const o = { ...order, shopId: order.shopId || shop.id };
  const ls = byLines(o);
  return ReactDOM.createPortal(
    <div className="by-sent-scrim" onClick={onClose}>
      <div className="by-sent" onClick={e=>e.stopPropagation()} role="dialog">
        <span className="by-sent-ic">{I.check({width:34,height:34})}</span>
        <h2>{fill(t.by_sent_t,{s:shop.name})}</h2>
        <p>{t.by_sent_d}</p>
        <div className="by-sent-no"><span>{fill(t.by_order_no,{n:o.no})}</span><b>{fmtPrice(o.total,lang)}</b></div>
        {ss && <ByThumbs shopStore={ss} o={o} max={5}/>}
        <ol className="by-sent-next">
          <li><i>1</i><div><b>{t.by_next1}</b><span>{t.by_next1_d}</span></div></li>
          <li><i>2</i><div><b>{t.by_next2}</b><span>{t.by_next2_d}</span></div></li>
          <li><i>3</i><div><b>{t.by_next3}</b><span>{t.by_next3_d}</span></div></li>
        </ol>
        <button className="by-btn primary wide" onClick={onTrack}>{t.by_track} {I.arrow({width:18,height:18})}</button>
        <button className="by-btn ghost wide" onClick={onClose}>{t.by_keep}</button>
      </div>
    </div>, document.body
  );
}

Object.assign(window, { OrderStatusPage, OrderSentSheet });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { OrderStatusPage, OrderSentSheet });
