// ===== Orders — the seller's side of a storefront request =====
function OrderStatePill({ status, t }){
  return <span className={"or-pill "+status}><i></i>{orderStateLabel(status,t)}</span>;
}

function hoursSince(at){ return Math.max(0, Math.round((Date.now()-at)/3600000)); }

function ConfirmOrderModal({ store, shop, order, t, lang, onClose }){
  const issues = store.orderIssues(shop.id, order);
  const [drop, setDrop] = React.useState([]);
  const kept = order.lines.filter(l=>!drop.includes(l.variantId));
  const total = kept.reduce((n,l)=>n+l.qty*l.unit,0);
  const hasIssues = issues.length>0;
  return (
    <Modal wide title={hasIssues? t.or_conflict_t : t.or_confirm} sub={hasIssues? t.or_conflict_d : t.or_confirm_d}
      onClose={onClose} tone={hasIssues?"danger":null}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right">
          <button className="btn btn-accent btn-sm" disabled={!kept.length} onClick={()=>{
            store.confirmOrder(shop.id, order.id, drop);
            toast(t.or_confirmed_toast);
            onClose();
          }}>{I.check({width:16,height:16})} {drop.length? t.or_confirm_partial : hasIssues? t.or_confirm_anyway : t.or_confirm} · {fmtPrice(total,lang)}</button>
        </div>
      </>}>
      <div className="or-conf-lines">
        {order.lines.map(l=>{
          const is = issues.find(x=>x.line.variantId===l.variantId);
          const dropped = drop.includes(l.variantId);
          return (
            <div key={l.variantId} className={"or-conf-line"+(is?" bad":"")+(dropped?" off":"")}>
              <div className="ocl-m">
                <b>{l.name}{l.label && l.label!=="default"? " · "+l.label : ""}</b>
                <span>{l.qty} × {fmtNum(l.unit)}
                  {is && <em> · {fill(t.or_conflict_line,{a:is.available, b:l.qty})}</em>}</span>
              </div>
              {is && (
                <button className="btn btn-ghost btn-xs" onClick={()=>setDrop(s=> dropped? s.filter(x=>x!==l.variantId) : [...s, l.variantId])}>
                  {dropped? t.or_keep_line : t.or_drop_line}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {hasIssues && <div className="pro-note">{I.warn({width:14,height:14})} {t.or_recount}</div>}
    </Modal>
  );
}

function CancelOrderModal({ store, shop, order, t, onClose }){
  const [reason, setReason] = React.useState(t.or_r_stock);
  const confirmed = !!order.saleId;
  return (
    <Modal title={t.or_cancel} sub={confirmed? t.or_cancel_after_d : t.or_cancel_d} onClose={onClose} tone="danger"
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right">
          <button className="btn btn-danger btn-sm" onClick={()=>{
            store.cancelOrder(shop.id, order.id, reason);
            toast(t.or_cancelled_toast);
            onClose();
          }}>{t.or_cancel}</button>
        </div>
      </>}>
      <div className="field">
        <label>{t.or_cancel_reason}</label>
        <div className="chip-row">
          {[t.or_r_stock, t.or_r_noreply, t.or_r_buyer].map(r=>(
            <button key={r} className={"pick-chip"+(reason===r?" on":"")} onClick={()=>setReason(r)}>{r}</button>
          ))}
        </div>
        <input style={{marginTop:10}} value={reason} onChange={e=>setReason(e.target.value)}/>
      </div>
    </Modal>
  );
}

function OrderCard({ store, shop, order, t, lang, open, onToggle, onConfirm, onCancel, onOpenChat }){
  const n = order.lines.filter(l=>!l.dropped).reduce((m,l)=>m+l.qty,0);
  const stale = order.status==="new" && Date.now()-order.at > 86400000;
  // no delivery stages: a confirmed order is simply marked completed once handed over
  const next = ["confirmed","ready","out"].includes(order.status) ? { s:"completed", lab:t.or_mark_done } : null;
  return (
    <div className={"or-card"+(open?" open":"")+(stale?" stale":"")}>
      <button className="or-head" onClick={onToggle}>
        <span className="or-no">#{order.no}</span>
        <span className="or-who">
          <b>{order.customer.name}{order.customer.verified && <VerifiedTag t={t} small/>}</b>
          <span>{order.customer.phone}</span>
        </span>
        <span className="or-n">{n} {t.sc_items}</span>
        <OrderStatePill status={order.status} t={t}/>
        <span className="or-tot">{fmtPrice(order.total,lang)}</span>
        <span className="or-when">{stale
          ? <span className="or-wait" title={fill(t.or_stale_full,{n:hoursSince(order.at)})}>{I.clock({width:12,height:12})} {fill(t.or_stale,{n:hoursSince(order.at)})}</span>
          : relDay(order.at,lang)}</span>
        <span className="or-cv">{open? I.minus({width:15,height:15}) : I.plus({width:15,height:15})}</span>
      </button>
      {open && (
        <div className="or-body">
          <div className="or-grid">
            <div className="or-col">
              <div className="set-title">{t.or_items}</div>
              {order.lines.map(l=>(
                <div key={l.variantId} className={"or-line"+(l.dropped?" off":"")}>
                  <b>{l.name}{l.label && l.label!=="default"? " · "+l.label : ""}</b>
                  <span>{l.dropped? t.or_dropped : l.qty+" × "+fmtNum(l.unit)}</span>
                  <span className="or-line-t">{l.dropped? "—" : fmtNum(l.qty*l.unit)}</span>
                </div>
              ))}
              <div className="or-sums">
                <div><span>{t.or_goods}</span><b>{fmtNum(order.goods)}</b></div>
                <div className="tot"><span>{t.or_total}</span><b>{fmtPrice(order.total,lang)}</b></div>
              </div>
              {order.saleNo && <div className="or-saleno">{I.wallet({width:14,height:14})} {fill(t.or_sale_no,{no:order.saleNo})}</div>}
            </div>
            <div className="or-col">
              <div className="set-title">{t.or_customer}</div>
              <div className="or-kv"><span>{t.or_name}</span><b>{order.customer.name}</b></div>
              <div className="or-kv"><span>{t.or_phone}</span>
                <b>{order.customer.phone} {order.customer.verified
                  ? <VerifiedTag t={t} small/>
                  : <span className="ver-tag no">{t.ac_unverified}</span>}</b></div>
              {order.customer.address && <div className="or-kv"><span>{t.or_address}</span><b>{order.customer.address}</b></div>}
              <div className="or-kv"><span>{t.or_payment}</span><b>{orderPayLabel(order.pay.method,lang)}</b></div>
              {order.note && <div className="or-note">{I.chat({width:14,height:14})} {order.note}</div>}
              <div className="set-title" style={{marginTop:16}}>{t.or_history}</div>
              <div className="or-hist">
                {order.history.map((h,i)=>(
                  <div key={i} className="or-hist-r"><b>{orderStateLabel(h.status,t)}</b><span>{fmtDateTime(h.at,lang)}</span></div>
                ))}
              </div>
              {order.cancelReason && <div className="or-note warn">{I.warn({width:14,height:14})} {order.cancelReason}</div>}
            </div>
          </div>
          <div className="or-acts">
            {order.status==="new" && <button className="btn btn-accent btn-sm" onClick={onConfirm}>{I.check({width:16,height:16})} {t.or_confirm}</button>}
            {next && <button className="btn btn-accent btn-sm" onClick={()=>{ store.setOrderStatus(shop.id, order.id, next.s); toast(next.lab); }}>{I.check({width:16,height:16})} {next.lab}</button>}
            {onOpenChat && <button className="btn btn-soft btn-sm" onClick={onOpenChat}>{I.chat({width:16,height:16})} {t.ch_open}</button>}
            {order.status!=="completed" && order.status!=="cancelled" && (
              <button className="btn btn-ghost btn-sm" onClick={onCancel}>{t.or_cancel}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersView({ store, shop, t, lang, focusId, onOpenChat }){
  const orders = store.orders(shop.id);
  const [filter, setFilter] = React.useState("open");
  const [open, setOpen] = React.useState(focusId||null);
  const [modal, setModal] = React.useState(null);
  React.useEffect(()=>{ if(focusId){ setFilter("all"); setOpen(focusId); } },[focusId]);

  const counts = {
    open: orders.filter(o=>["new","confirmed","ready","out"].includes(o.status)).length,
    new: orders.filter(o=>o.status==="new").length,
    all: orders.length,
  };
  const list = orders.filter(o=>{
    if(filter==="open") return ["new","confirmed","ready","out"].includes(o.status);
    if(filter==="all") return true;
    return o.status===filter;
  });

  if(!orders.length){
    return <EmptyState icon={I.bag} title={t.or_empty_t} body={t.or_empty_d}/>;
  }
  return (
    <div>
      <div className="db-sec-head">
        <div><h2>{t.db_orders}</h2><div className="sub">{t.or_sub}</div></div>
      </div>
      <div className="chip-row" style={{marginBottom:14}}>
        <button className={"pick-chip"+(filter==="open"?" on":"")} onClick={()=>setFilter("open")}>{t.or_open} <i>{counts.open}</i></button>
        <button className={"pick-chip"+(filter==="new"?" on":"")} onClick={()=>setFilter("new")}>{t.or_new} <i>{counts.new}</i></button>
        {["confirmed","completed","cancelled"].map(s=>(
          <button key={s} className={"pick-chip"+(filter===s?" on":"")} onClick={()=>setFilter(s)}>{orderStateLabel(s,t)}</button>
        ))}
        <button className={"pick-chip"+(filter==="all"?" on":"")} onClick={()=>setFilter("all")}>{t.or_all} <i>{counts.all}</i></button>
      </div>

      <div className="or-list">
        {list.map(o=>(
          <OrderCard key={o.id} store={store} shop={shop} order={o} t={t} lang={lang}
            open={open===o.id} onToggle={()=>setOpen(open===o.id? null : o.id)}
            onConfirm={()=>setModal({k:"confirm", o})} onCancel={()=>setModal({k:"cancel", o})} onOpenChat={onOpenChat}/>
        ))}
        {!list.length && <div className="stk-empty">{t.or_none_filter}</div>}
      </div>

      {modal && modal.k==="confirm" && <ConfirmOrderModal store={store} shop={shop} order={store.orders(shop.id).find(x=>x.id===modal.o.id)} t={t} lang={lang} onClose={()=>setModal(null)}/>}
      {modal && modal.k==="cancel" && <CancelOrderModal store={store} shop={shop} order={modal.o} t={t} onClose={()=>setModal(null)}/>}
    </div>
  );
}

// mocked Telegram push the seller gets when a request lands
function TelegramToast({ order, shop, t, lang, onOpen, onClose }){
  React.useEffect(()=>{
    const id = setTimeout(onClose, 9000);
    return ()=> clearTimeout(id);
  },[order.id]);
  const n = order.lines.reduce((m,l)=>m+l.qty,0);
  return (
    <div className="tg-toast">
      <div className="tg-ic">{I.tg? I.tg({width:20,height:20}) : I.chat({width:20,height:20})}</div>
      <div className="tg-m">
        <b>{t.or_tg_title}</b>
        <span>{fill(t.or_tg_body,{no:order.no, name:order.customer.name, n, sum:fmtPrice(order.total,lang)})}</span>
        <button onClick={onOpen}>{t.or_tg_open} {I.arrow({width:13,height:13})}</button>
      </div>
      <button className="tg-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:15,height:15})}</button>
    </div>
  );
}

// ===== Basket requests — v1: code/link + seller Requests tab · v2: Telegram bot message to the seller =====
addI18N({
  rq_title:   ["Requests", "Запросы", "So‘rovlar"],
  rq_sub:     ["Baskets buyers sent you. Agree the price in Telegram, then mark it sold.", "Корзины от покупателей. Договоритесь о цене в Telegram и отметьте продажу.", "Xaridorlar yuborgan savatlar. Narxni Telegramda kelishing va «sotildi» deb belgilang."],
  rq_find:    ["Paste the basket code, e.g. K7M2Q", "Вставьте код корзины, напр. K7M2Q", "Savat kodini kiriting, mas. K7M2Q"],
  rq_open:    ["Open", "Открытые", "Ochiq"],
  rq_s_new:   ["New", "Новый", "Yangi"],
  rq_s_agreed:["Agreed", "Договорились", "Kelishildi"],
  rq_s_sold:  ["Sold", "Продано", "Sotildi"],
  rq_s_cancelled:["Cancelled", "Отменён", "Bekor qilindi"],
  rq_all:     ["All", "Все", "Hammasi"],
  rq_status:  ["Status", "Статус", "Holat"],
  rq_buyer:   ["Buyer", "Покупатель", "Xaridor"],
  rq_empty_t: ["No requests yet", "Запросов пока нет", "Hozircha so‘rov yo‘q"],
  rq_empty_d: ["When a buyer sends you a basket link, it shows up here.", "Когда покупатель пришлёт ссылку на корзину, она появится здесь.", "Xaridor savat havolasini yuborsa, shu yerda chiqadi."],
  rq_none:    ["Nothing matches", "Ничего не найдено", "Hech narsa topilmadi"],
  rq_guest:   ["Guest buyer", "Гость", "Mehmon xaridor"],
  rq_left:    ["only {n} left", "осталось {n}", "faqat {n} ta qoldi"],
  rq_gone:    ["no longer in stock", "больше нет", "omborda yo‘q"],
  rq_total:   ["Basket total", "Сумма корзины", "Savat summasi"],
  rq_final:   ["Agreed total", "Итог по договорённости", "Kelishilgan summa"],
  rq_agree:   ["Mark agreed", "Договорились", "Kelishildi"],
  rq_sell:    ["Mark sold…", "Продано…", "Sotildi…"],
  rq_cancel:  ["Cancel", "Отменить", "Bekor qilish"],
  rq_reply:   ["Reply in Telegram", "Ответить в Telegram", "Telegramda javob berish"],
  rq_copy:    ["Copy link", "Копировать ссылку", "Havolani nusxalash"],
  rq_copied:  ["Copied", "Скопировано", "Nusxalandi"],
  rq_sell_t:  ["Mark as sold", "Отметить продажу", "Sotildi deb belgilash"],
  rq_sell_d:  ["Enter the price you agreed. Stock goes down and the sale appears in Sales.", "Укажите согласованную цену. Остатки уменьшатся, продажа появится в «Продажах».", "Kelishilgan narxni kiriting. Qoldiq kamayadi, sotuv «Sotuvlar»da chiqadi."],
  rq_sold_toast:["Sold · sale recorded", "Продано · продажа записана", "Sotildi · sotuv yozildi"],
  rq_agreed_toast:["Marked as agreed", "Отмечено: договорились", "Kelishildi deb belgilandi"],
  rq_cancel_toast:["Request cancelled", "Запрос отменён", "So‘rov bekor qilindi"],
  rq_sale_no: ["Sale #{n}", "Продажа #{n}", "Sotuv #{n}"],
  rq_new_badge:["{n} new basket request(s)", "Новых запросов: {n}", "{n} ta yangi savat so‘rovi"],
  rq_add:     ["Add to basket", "В корзину", "Savatga"],
  rq_add_sum: ["Add to basket · {sum}", "В корзину · {sum}", "Savatga · {sum}"],
  rq_added:   ["Added to basket", "Добавлено в корзину", "Savatga qo‘shildi"],
  rq_send:    ["Send to {s}", "Отправить в «{s}»", "«{s}»ga yuborish"],
  rq_bk_note: ["Each shop gets its own basket link. Nothing is paid now — you agree the price with the seller in Telegram.", "Для каждого магазина — своя ссылка на корзину. Сейчас ничего не оплачивается — цену согласуете с продавцом в Telegram.", "Har bir do‘kon uchun alohida savat havolasi. Hozir to‘lov yo‘q — narxni sotuvchi bilan Telegramda kelishasiz."],
  rq_bk_hint: ["Price is agreed with the seller", "Цена — по договорённости с продавцом", "Narx sotuvchi bilan kelishiladi"],
  rq_sent_t:  ["Your basket is ready", "Ваша корзина готова", "Savatingiz tayyor"],
  rq_sent_d:  ["Send this link to {s} in Telegram — the seller sees every item, size and colour.", "Отправьте ссылку в «{s}» в Telegram — продавец увидит все товары, размеры и цвета.", "Bu havolani Telegramda «{s}»ga yuboring — sotuvchi barcha mahsulot, o‘lcham va rangni ko‘radi."],
  rq_code:    ["Basket code", "Код корзины", "Savat kodi"],
  rq_send_tg: ["Send in Telegram", "Отправить в Telegram", "Telegramda yuborish"],
  rq_send_to: ["Send to {s}", "Отправить {s}", "{s} ga yuborish"],
  rq_send_hint:["Telegram opens the shop's chat with the message ready — just press Send.", "Telegram откроет чат магазина с готовым сообщением — просто нажмите «Отправить».", "Telegram do‘kon chatini tayyor xabar bilan ochadi — faqat «Yuborish»ni bosing."],
  rq_open_shop_tg:["Open the shop's Telegram", "Открыть Telegram магазина", "Do‘kon Telegramini ochish"],
  rq_msg:     ["Hi! I'd like to buy these ({n} items, {sum}): {link}", "Здравствуйте! Хочу купить ({n} шт., {sum}): {link}", "Salom! Shularni olmoqchiman ({n} ta, {sum}): {link}"],
  rq_next:    ["The seller replies in Telegram — you agree the price, pickup or delivery and payment there.", "Продавец ответит в Telegram — там договоритесь о цене, получении и оплате.", "Sotuvchi Telegramda javob beradi — narx, olish va to‘lovni o‘sha yerda kelishasiz."],
  rq_bot:     ["rastashops bot", "бот rastashops", "rastashops bot"],
  rq_bot_new: ["New basket {code} · {n} items · {sum}", "Новая корзина {code} · {n} шт. · {sum}", "Yangi savat {code} · {n} ta · {sum}"],
  rq_bot_view:["View", "Открыть", "Ko‘rish"],
  rq_page_t:  ["Basket {code}", "Корзина {code}", "Savat {code}"],
  rq_page_seller:["I'm the seller — open in dashboard", "Я продавец — открыть в панели", "Men sotuvchiman — panelda ochish"],
  rq_page_shop:["Go to the shop", "Перейти в магазин", "Do‘konga o‘tish"],
  rq_page_none:["This basket link doesn't exist", "Такой корзины нет", "Bunday savat topilmadi"],
});
const RQ_PILL = { new:["#fde7e2","#b83f28"], agreed:["#e6edf8","#2f5ea8"], sold:["#e2f3ea","#1f7a4d"], cancelled:["#f1efe9","#5c564c"] };
// the basket link: <this site>/b/CODE (rastashops.com in production, the lab or localhost elsewhere)
const rqLink = (code)=> location.host+"/b/"+code;
const rqUrl = (code)=> location.origin+"/b/"+code;
const rqUnits = (r)=> r.lines.reduce((n,l)=>n+l.qty,0);
function rqCopy(text){ try{ navigator.clipboard && navigator.clipboard.writeText(text); }catch(e){} }
function rqMessage(req, t, lang){ return fill(t.rq_msg,{ n:rqUnits(req), sum:fmtPrice(req.total,lang), link:rqUrl(req.code) }); }
function RqPill({ s, t }){ const c = RQ_PILL[s]||RQ_PILL.new;
  return <span style={{display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:12.5, fontWeight:700, background:c[0], color:c[1], whiteSpace:"nowrap"}}>{t["rq_s_"+s]}</span>; }

function RequestSellModal({ store, shop, req, t, lang, onClose }){
  const [sum, setSum] = React.useState(String(req.finalTotal||req.total));
  const [pay, setPay] = React.useState(((store.settings(shop.id).payments)||["cash"])[0]||"cash");
  return (
    <Modal title={t.rq_sell_t} sub={t.rq_sell_d} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right"><button className="btn btn-accent btn-sm" disabled={!(Number(sum)>0)} onClick={()=>{ store.sellRequest(shop.id, req.id, Number(sum), pay); toast(t.rq_sold_toast); onClose(); }}>
          {I.check({width:16,height:16})} {t.rq_s_sold} · {fmtPrice(Number(sum)||0,lang)}</button></div>
      </>}>
      <div className="field"><label>{t.rq_final}</label>
        <input inputMode="numeric" value={sum} onChange={e=>setSum(e.target.value.replace(/\D/g,""))} autoFocus/>
        <div className="hint">{t.rq_total}: {fmtPrice(req.total,lang)}</div></div>
      <div className="field"><label>{t.sc_payment}</label>
        <div className="chip-row">{PAY_METHODS.filter(m=> m.id==="cash" || ((store.settings(shop.id).payments)||[]).includes(m.id)).map(m=><button key={m.id} className={"pick-chip"+(pay===m.id?" on":"")} onClick={()=>setPay(m.id)}>{m.label[lang]}</button>)}</div></div>
    </Modal>
  );
}

// Requests in pages from the server, with the count of each status (BACKEND-PLAN §23). Rows shown are the store's own
// copies (dashGet puts every page into the store), so Agreed / Sold / Cancel update them at once.
function RequestsView({ store, shop, t, lang, focusCode }){
  const idx = store.variantIndex(shop.id);
  const [filter, setFilter] = React.useState(focusCode? "all" : "open");
  const [q, setQ] = React.useState(focusCode||"");
  const [open, setOpen] = React.useState(null);
  const [sell, setSell] = React.useState(null);
  const qn = q.replace(/[^A-Za-z0-9]/g,"").toUpperCase();
  const pages = useDashPages((page, size)=> store.dashGet(shop.id, "/requests/page?"+dashQS({ status:filter, q:qn, page, size })),
    JSON.stringify([filter, qn]), store.histRev(shop.id));
  const mem = store.requests(shop.id);
  const shown = pages.items.map(r=> mem.find(x=>x.id===r.id) || r)
    .filter(r=> filter==="all" || (filter==="open"? ["new","agreed"].includes(r.status) : r.status===filter));
  React.useEffect(()=>{ if(qn.length>=4 && shown.length===1) setOpen(shown[0].id); }, [qn, shown.length]);
  const counts = (pages.res && pages.res.counts) || {};
  const cnt = (k)=> counts[k] || 0;
  const list = { length: counts.all || 0 };
  const COLS = "96px minmax(180px,1.6fr) 70px 130px 130px 140px 36px";
  return (
    <div>
      <div className="db-sec-head"><div><h2>{t.rq_title}</h2><div className="sub">{t.rq_sub}</div></div></div>
      <div className="inv-bar"><div className="inline-search grow">{I.search({width:17,height:17})}<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.rq_find}/></div></div>
      <div className="chip-row" style={{margin:"10px 0 14px"}}>
        {[["open",t.rq_open],["new",t.rq_s_new],["agreed",t.rq_s_agreed],["sold",t.rq_s_sold],["cancelled",t.rq_s_cancelled],["all",t.rq_all]].map(([k,l])=>
          <button key={k} className={"pick-chip"+(filter===k?" on":"")} onClick={()=>setFilter(k)}>{l} <i>{cnt(k)}</i></button>)}
      </div>
      {!pages.res && pages.loading ? <div className="stk-empty card"><span className="tg-spin"></span></div> : !list.length ? <EmptyState icon={I.bag} title={t.rq_empty_t} body={t.rq_empty_d}/> : !shown.length ? <div className="stk-empty card">{t.rq_none}</div> : (
        <div className="stock-table" style={{overflowX:"auto"}}><div style={{minWidth:780}}>
          <div className="stk-head" style={{display:"grid", gridTemplateColumns:COLS, alignItems:"center"}}>
            {[t.rq_code, t.rq_buyer, t.hc_qty, t.hc_sum, t.rq_status, t.hc_date, ""].map((h,i)=><span key={i} style={{textAlign: i===2||i===3? "right":"left", whiteSpace:"nowrap"}}>{h}</span>)}
          </div>
          {shown.map(r=>{ const isOpen = open===r.id; const b = r.buyer||{}; const live = ["new","agreed"].includes(r.status);
            return (
            <React.Fragment key={r.id}>
              <div className="stk-row" role="button" tabIndex={0} aria-expanded={isOpen} onClick={()=>setOpen(isOpen?null:r.id)}
                style={{display:"grid", gridTemplateColumns:COLS, alignItems:"center", cursor:"pointer", background:isOpen?"var(--paper)":undefined}}>
                <span style={{fontFamily:"'Space Mono', monospace", fontWeight:700, letterSpacing:".06em"}}>{r.code}</span>
                <span style={{minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}><b>{b.name || t.rq_guest}</b>{b.phone && <span style={{color:"var(--soft)"}}> · {b.phone}</span>}</span>
                <span style={{textAlign:"right", fontWeight:700}}>{rqUnits(r)}</span>
                <span style={{textAlign:"right", fontWeight:700, whiteSpace:"nowrap"}}>{fmtNum(r.finalTotal||r.total)}</span>
                <span><RqPill s={r.status} t={t}/></span>
                <span style={{whiteSpace:"nowrap"}}><b>{hxDate(r.at)}</b> <span style={{color:"var(--soft)"}}>{new Date(r.at).toTimeString().slice(0,5)}</span></span>
                <span style={{color:"var(--soft)", display:"flex", justifyContent:"center"}}>{isOpen? I.minus({width:15,height:15}) : I.plus({width:15,height:15})}</span>
              </div>
              {isOpen && (
                <div style={{padding:"6px 16px 16px", background:"var(--paper)", borderBottom:"1px solid var(--line-2)"}}>
                  {r.lines.map(l=>{ const x = idx[l.variantId]; const avail = x? x.v.qty : 0;
                    return (
                      <div key={l.variantId} style={{display:"grid", gridTemplateColumns:"minmax(200px,2fr) 130px 120px", gap:12, alignItems:"center", padding:"8px 0", borderTop:"1px solid var(--line-2)"}}>
                        <span style={{display:"flex", alignItems:"center", gap:10, minWidth:0}}>
                          <span className="stk-photo">{x? <ImageSlot id={pslot(shop.id,x.p,0)} src={photoURL(x.p.tone, pslot(shop.id,x.p,0), 90,90, IMG_KW[shop.type], store.products(shop.id).findIndex(y=>y.id===x.p.id))} placeholder="" style={FILL}/> : null}</span>
                          <span className="stk-name" style={{minWidth:0}}><b>{l.name}</b><span>{l.label && l.label!=="default"? l.label : ""}{x && x.v.barcode? " · "+x.v.barcode : ""}
                            {live && (!x? <em style={{color:"#b83f28", fontStyle:"normal"}}> · {t.rq_gone}</em> : avail<l.qty? <em style={{color:"#b83f28", fontStyle:"normal"}}> · {fill(t.rq_left,{n:Math.max(0,avail)})}</em> : null)}</span></span>
                        </span>
                        <span style={{textAlign:"right"}}>{l.qty} × {fmtNum(l.unit)}</span>
                        <span style={{textAlign:"right", fontWeight:700}}>{fmtNum(l.qty*l.unit)}</span>
                      </div>); })}
                  <div style={{display:"flex", justifyContent:"flex-end", flexWrap:"wrap", gap:16, padding:"10px 0", borderTop:"1px solid var(--line-2)", fontWeight:700}}>
                    <span>{t.rq_total}: {fmtPrice(r.total,lang)}</span>
                    {r.finalTotal && <span style={{color:"#1f7a4d"}}>{t.rq_final}: {fmtPrice(r.finalTotal,lang)}</span>}
                    {r.saleNo && <span>{fill(t.rq_sale_no,{n:r.saleNo})}</span>}
                  </div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:6}}>
                    {r.status==="new" && <button className="btn btn-soft btn-sm" onClick={()=>{ store.setRequestStatus(shop.id, r.id, "agreed"); toast(t.rq_agreed_toast); }}>{I.check({width:15,height:15})} {t.rq_agree}</button>}
                    {live && <button className="btn btn-accent btn-sm" onClick={()=>setSell(r)}>{I.wallet({width:15,height:15})} {t.rq_sell}</button>}
                    {b.tg && <a className="btn btn-ghost btn-sm" href={"https://t.me/"+String(b.tg).replace("@","")} target="_blank" rel="noreferrer">{I.tg({width:15,height:15})} {t.rq_reply}</a>}
                    <button className="btn btn-ghost btn-sm" onClick={()=>{ rqCopy(rqUrl(r.code)); toast(t.rq_copied); }}>{I.copy({width:15,height:15})} {t.rq_copy}</button>
                    {live && <button className="btn btn-ghost btn-sm" style={{marginLeft:"auto"}} onClick={()=>{ store.setRequestStatus(shop.id, r.id, "cancelled"); toast(t.rq_cancel_toast); }}>{t.rq_cancel}</button>}
                  </div>
                </div>
              )}
            </React.Fragment>); })}
        </div></div>
      )}
      {pages.hasMore && <button className="btn btn-soft hist-more" disabled={pages.loading} onClick={pages.more}>{t.h_more} · {pages.total-pages.items.length}</button>}
      {sell && <RequestSellModal store={store} shop={shop} req={sell} t={t} lang={lang} onClose={()=>setSell(null)}/>}
    </div>
  );
}

// buyer: after "Send to shop" — the code, the link, and one tap to send it in Telegram
function RequestSentSheet({ req, shop, t, lang, onClose, onSent }){
  // the basket is emptied only here, when the buyer actually sends it to the shop (not when the popup opens)
  const sent = ()=>{ rqCopy(msg); onSent && onSent(); };
  useEscape(onClose);
  const link = rqUrl(req.code);
  const msg = rqMessage(req, t, lang);
  const tg = shop.contacts && shop.contacts.telegram;
  const [copied, setCopied] = React.useState(false);
  return ReactDOM.createPortal(
    <div className="co-scrim" onClick={onClose}>
      <div className="co-sheet scroll-y" onClick={e=>e.stopPropagation()} style={{maxWidth:470}} role="dialog" aria-label={t.rq_sent_t}>
        <div className="co-head"><div><b>{t.rq_sent_t}</b><span>{shop.name}</span></div>
          <button className="cw-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:17,height:17})}</button></div>
        <div className="co-body">
          <p style={{marginTop:0}}>{fill(t.rq_sent_d,{s:shop.name})}</p>
          <div style={{textAlign:"center", padding:"18px 12px", borderRadius:16, background:"var(--paper,#f4efe7)", margin:"6px 0 14px"}}>
            <small style={{display:"block", opacity:.7, fontWeight:600}}>{t.rq_code}</small>
            <b style={{display:"block", fontFamily:"'Space Mono', monospace", fontSize:34, letterSpacing:".14em", margin:"4px 0"}}>{req.code}</b>
            <span style={{fontSize:13, opacity:.75}}>{rqLink(req.code)} · {byItemsLabel(rqUnits(req), t)} · {fmtPrice(req.total,lang)}</span>
          </div>
          {/* one tap: t.me/<shop>?text=… opens the shop's chat with the message already typed — the buyer only presses Send.
              (Telegram never sends on its own.) The message is also copied, in case an old Telegram app ignores ?text. */}
          <div style={{display:"grid", gap:8}}>
            {/* The buyer always starts the direct chat with the shop: price, pickup and payment are agreed there.
                The seller's bot card (View · Agreed · Cancel · Sold) is sent by the server when the request is made. */}
            {tg ? (
              <a className="btn btn-accent" style={{justifyContent:"center", textDecoration:"none", height:50, fontSize:16}} target="_blank" rel="noreferrer"
                href={"https://t.me/"+tg+"?text="+encodeURIComponent(msg)} onClick={sent}>{I.tg({width:18,height:18})} {fill(t.rq_send_to,{s:"@"+tg})}</a>
            ) : (
              <a className="btn btn-accent" style={{justifyContent:"center", textDecoration:"none", height:50, fontSize:16}} target="_blank" rel="noreferrer"
                href={"https://t.me/share/url?url="+encodeURIComponent(link)+"&text="+encodeURIComponent(msg.replace(link,"").trim())} onClick={sent}>{I.tg({width:18,height:18})} {t.rq_send_tg}</a>
            )}
            {tg && <p className="hint" style={{margin:"2px 0 4px", textAlign:"center"}}>{t.rq_send_hint}</p>}
            <button className="lnk" style={{justifySelf:"center"}} onClick={()=>{ rqCopy(msg); setCopied(true); }}>{copied? I.check({width:14,height:14}) : I.copy({width:14,height:14})} {copied? t.rq_copied : t.rq_copy}</button>
          </div>
          <p className="hint" style={{marginTop:12}}>{t.rq_next}</p>
        </div>
      </div>
    </div>, document.body);
}

// v2 (mock): what the rastashops Telegram bot sends the seller the moment a basket is sent
function RequestBotToast({ req, shop, t, lang, onView, onAgree, onClose }){
  React.useEffect(()=>{ const id = setTimeout(onClose, 15000); return ()=>clearTimeout(id); }, [req.id]);
  return (
    <div className="tg-toast" style={{alignItems:"flex-start"}}>
      <div className="tg-ic">{I.tg({width:20,height:20})}</div>
      <div className="tg-m">
        <b>{t.rq_bot} → {shop.name}</b>
        <span>{fill(t.rq_bot_new,{code:req.code, n:rqUnits(req), sum:fmtPrice(req.total,lang)})}</span>
        <span style={{fontSize:12.5, opacity:.8}}>{req.lines.slice(0,3).map(l=>l.qty+"× "+l.name+(l.label && l.label!=="default"? " ("+l.label+")" : "")).join(", ")}{req.lines.length>3? " …" : ""}</span>
        <div style={{display:"flex", gap:8, marginTop:6, flexWrap:"wrap"}}>
          <button onClick={onView}>{t.rq_bot_view} {I.arrow({width:13,height:13})}</button>
          <button onClick={onAgree}>{I.check({width:13,height:13})} {t.rq_agree}</button>
        </div>
      </div>
      <button className="tg-x" onClick={onClose} aria-label={t.g_close}>{I.x({width:15,height:15})}</button>
    </div>
  );
}

// the basket link itself: rastashops.com/b/CODE (prototype: ?b=CODE)
function RequestPublic({ shopStore, code, lang, setLang, onShop, onSeller, onHome }){
  const t = I18N[lang];
  const local = shopStore.findRequest(code);
  const [fetched, setFetched] = React.useState(undefined);   // undefined = loading, null = not found
  React.useEffect(()=>{ if(!local && code){ shopStore.fetchRequest(code).then(r=>setFetched(r)); } }, [code]);
  const hit = local || fetched || null;
  const shop = hit? shopStore.shopMeta(hit.shopId) : null;
  return (
    <div className="ob">
      <div className="ob-top"><div className="brand" style={{cursor:"pointer"}} onClick={onHome}><Logo/> <BrandName/></div><LangPill lang={lang} setLang={setLang}/></div>
      <div className="ob-card-wrap"><div className="ob-card narrow">
        {!hit && code && fetched===undefined ? <div style={{textAlign:"center", padding:30}}><span className="tg-spin"></span></div> : !hit ? <EmptyState icon={I.bag} title={t.rq_page_none}/> : (
          <>
            <div className="ob-head"><h2 style={{fontFamily:"'Space Mono', monospace"}}>{fill(t.rq_page_t,{code:hit.req.code})}</h2><p>{shop.name} · {hxDate(hit.req.at)}</p></div>
            <RqPill s={hit.req.status} t={t}/>
            <div style={{margin:"14px 0"}}>
              {hit.req.lines.map(l=>(
                <div key={l.variantId} style={{display:"flex", justifyContent:"space-between", gap:12, padding:"10px 0", borderTop:"1px solid var(--line-2)"}}>
                  <span><b>{l.name}</b>{l.label && l.label!=="default" && <span style={{color:"var(--soft)"}}> · {l.label}</span>}</span>
                  <span style={{whiteSpace:"nowrap"}}>{l.qty} × {fmtNum(l.unit)}</span>
                </div>))}
              <div style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderTop:"1px solid var(--line-2)", fontWeight:800}}><span>{t.rq_total}</span><span>{fmtPrice(hit.req.total,lang)}</span></div>
              <div className="hint">{t.rq_bk_hint}</div>
            </div>
            <div style={{display:"grid", gap:8}}>
              <button className="btn btn-accent" onClick={()=>onSeller(hit.shopId, hit.req.code)}>{I.grid({width:16,height:16})} {t.rq_page_seller}</button>
              <button className="btn btn-ghost" onClick={()=>onShop(hit.shopId)}>{I.store({width:16,height:16})} {t.rq_page_shop}</button>
            </div>
          </>
        )}
      </div></div>
    </div>
  );
}

Object.assign(window, { OrdersView, OrderCard, OrderStatePill, ConfirmOrderModal, CancelOrderModal, TelegramToast,
  RequestsView, RequestSellModal, RequestSentSheet, RequestBotToast, RequestPublic, RqPill, rqLink });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { OrderStatePill, hoursSince, ConfirmOrderModal, CancelOrderModal, OrderCard, OrdersView, TelegramToast, RQ_PILL, rqLink, rqUnits, rqCopy, rqMessage, RqPill, RequestSellModal, RequestsView, RequestSentSheet, RequestBotToast, RequestPublic });
