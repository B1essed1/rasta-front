// ===== Buyer kit — shared helpers, copy and small parts for the buyer side =====
addI18N({
  by_back_shop:   ["Back to shopping", "Назад к покупкам", "Xaridga qaytish"],
  by_overview:    ["Overview", "Главная", "Asosiy"],
  by_orders:      ["My orders", "Мои заказы", "Buyurtmalarim"],
  by_toreview:    ["To review", "Оценить", "Baholash"],
  by_reviews:     ["My reviews", "Мои отзывы", "Sharhlarim"],
  by_fav:         ["Saved shops", "Избранные магазины", "Saqlangan do\u2018konlar"],
  by_addr:        ["Addresses", "Адреса", "Manzillar"],
  by_settings:    ["Settings", "Настройки", "Sozlamalar"],
  by_basket:      ["Basket", "Корзина", "Savat"],
  by_tg_verified: ["Verified with Telegram", "Подтверждено через Telegram", "Telegram orqali tasdiqlangan"],
  by_in_progress: ["In progress", "В процессе", "Jarayonda"],
  by_delivered:   ["Completed", "Завершены", "Yakunlangan"],
  by_cancelled:   ["Cancelled", "Отменены", "Bekor qilingan"],
  by_all:         ["All", "Все", "Hammasi"],
  by_order_no:    ["Order №{n}", "Заказ №{n}", "Buyurtma №{n}"],
  by_items_n:     ["{n} items", "{n} товара", "{n} ta mahsulot"],
  by_item_1:      ["1 item", "1 товар", "1 ta mahsulot"],
  by_track:       ["Track order", "Отследить", "Kuzatish"],
  by_details:     ["Order details", "Подробнее", "Batafsil"],
  by_again:       ["Order again", "Заказать снова", "Yana buyurtma"],
  by_again_done:  ["Added to your basket", "Добавлено в корзину", "Savatga qo\u2018shildi"],
  by_rate:        ["Rate items", "Оценить товары", "Baholash"],
  by_message:     ["Message shop", "Написать магазину", "Do\u2018konga yozish"],
  by_call:        ["Call", "Позвонить", "Qo\u2018ng\u2018iroq"],
  by_visit:       ["Visit shop", "В магазин", "Do\u2018konga"],
  by_s_new:       ["Waiting for {s} to confirm", "Ждём подтверждения от «{s}»", "\u00ab{s}\u00bb tasdig\u2018i kutilmoqda"],
  by_s_confirmed: ["{s} confirmed your order", "«{s}» подтвердил заказ", "\u00ab{s}\u00bb buyurtmani tasdiqladi"],
  by_s_ready:     ["Ready for you to pick up", "Готов к самовывозу", "Olib ketishga tayyor"],
  by_s_out:       ["On the way to you", "Едет к вам", "Sizga yo\u2018lda"],
  by_s_completed: ["Order completed", "Заказ завершён", "Buyurtma yakunlandi"],
  by_s_cancelled: ["Order cancelled", "Заказ отменён", "Buyurtma bekor qilindi"],
  by_n_new:       ["Shops usually reply within a few hours. We'll message you in Telegram.", "Магазины обычно отвечают за несколько часов. Мы напишем вам в Telegram.", "Do\u2018konlar odatda bir necha soatda javob beradi. Telegramda xabar beramiz."],
  by_n_confirmed: ["Agree with the shop in chat how and when you get it.", "Договоритесь с магазином в чате, как и когда вы его получите.", "Qanday va qachon olishingizni do‘kon bilan chatda kelishing."],
  by_n_ready:     ["Agree a time with the shop and pick it up.", "Договоритесь о времени и заберите заказ.", "Vaqtni kelishib, buyurtmani olib keting."],
  by_n_out:       ["The courier will call before arriving. Keep your phone nearby.", "Курьер позвонит перед приездом. Держите телефон рядом.", "Kuryer kelishdan oldin qo\u2018ng\u2018iroq qiladi."],
  by_n_completed: ["How was it? Your stars help other buyers.", "Как вам? Ваша оценка поможет другим.", "Qanday bo\u2018ldi? Bahoingiz boshqalarga yordam beradi."],
  by_st_sent:     ["Sent", "Отправлен", "Yuborildi"],
  by_st_conf:     ["Confirmed", "Подтверждён", "Tasdiqlandi"],
  by_st_ready:    ["Ready", "Готов", "Tayyor"],
  by_st_out:      ["On the way", "В пути", "Yo\u2018lda"],
  by_st_done:     ["Completed", "Завершён", "Yakunlandi"],
  by_st_picked:   ["Picked up", "Получен", "Olindi"],
  by_whats_next:  ["What happens next", "Что дальше", "Keyingi qadam"],
  by_timeline:    ["Order history", "История заказа", "Buyurtma tarixi"],
  by_items:       ["Items", "Товары", "Mahsulotlar"],
  by_delivery:    ["Delivery", "Доставка", "Yetkazish"],
  by_payment:     ["Payment", "Оплата", "To\u2018lov"],
  by_recipient:   ["Recipient", "Получатель", "Qabul qiluvchi"],
  by_goods:       ["Items", "Товары", "Mahsulotlar"],
  by_fee:         ["Delivery", "Доставка", "Yetkazish"],
  by_total:       ["Total", "Итого", "Jami"],
  by_free:        ["Free", "Бесплатно", "Bepul"],
  by_shop:        ["Shop", "Магазин", "Do\u2018kon"],
  by_cancel:      ["Cancel order", "Отменить заказ", "Buyurtmani bekor qilish"],
  by_cancel_q:    ["Cancel this order?", "Отменить этот заказ?", "Buyurtma bekor qilinsinmi?"],
  by_cancel_yes:  ["Yes, cancel", "Да, отменить", "Ha, bekor qilish"],
  by_cancel_h:    ["You can cancel until the shop confirms.", "Отменить можно, пока магазин не подтвердил.", "Do\u2018kon tasdiqlagunga qadar bekor qilish mumkin."],
  by_no:          ["No, keep it", "Нет, оставить", "Yo\u2018q, qolsin"],
  by_tg_log:      ["Telegram messages", "Сообщения в Telegram", "Telegram xabarlari"],
  by_rate_t:      ["Rate what you bought", "Оцените покупки", "Xaridlarni baholang"],
  by_rate_d:      ["Tap the stars. It takes a few seconds.", "Нажмите на звёзды — это пара секунд.", "Yulduzchani bosing — bir necha soniya."],
  by_rv_write:    ["Tell others what you liked (optional)", "Что понравилось? (необязательно)", "Nima yoqdi? (ixtiyoriy)"],
  by_rv_send:     ["Publish review", "Опубликовать", "Chop etish"],
  by_rv_sent:     ["Thank you! Review published", "Спасибо! Отзыв опубликован", "Rahmat! Sharh chop etildi"],
  by_rv_none_p:   ["Nothing to rate right now", "Пока нечего оценивать", "Hozircha baholanadigan narsa yo\u2018q"],
  by_rv_none_pd:  ["Items appear here after your order is completed.", "Товары появятся здесь после завершения заказа.", "Buyurtma yakunlangach mahsulotlar shu yerda chiqadi."],
  by_bought_on:   ["Bought {d}", "Куплено {d}", "{d} xarid qilingan"],
  by_buy_again_t: ["Buy again", "Купить снова", "Yana xarid qilish"],
  by_hello:       ["Hello, {n}", "Здравствуйте, {n}", "Salom, {n}"],
  by_active_t:    ["Right now", "Сейчас", "Hozir"],
  by_nothing_now: ["No orders on the way. Find something you like?", "Нет заказов в пути. Найдём что-нибудь?", "Yo\u2018ldagi buyurtma yo\u2018q. Biror narsa topamizmi?"],
  by_explore:     ["Explore shops", "Смотреть магазины", "Do\u2018konlarni ko\u2018rish"],
  by_see_all:     ["See all", "Все", "Hammasi"],
  by_demo:        ["Show sample orders (demo)", "Показать примеры заказов (демо)", "Namuna buyurtmalar (demo)"],
  by_no_orders:   ["You haven't ordered yet", "Вы ещё ничего не заказывали", "Hali buyurtma bermagansiz"],
  by_no_orders_d: ["When you order from a shop, it shows up here with its status.", "Когда вы закажете, заказ появится здесь со статусом.", "Buyurtma bersangiz, holati bilan shu yerda chiqadi."],
  by_no_match:    ["No orders here", "Здесь заказов нет", "Bu yerda buyurtma yo\u2018q"],
  by_open:        ["Open", "Открыть", "Ochish"],
  by_remove:      ["Remove", "Убрать", "Olib tashlash"],
  by_need_help:   ["Need help? Telegram @rastashops_help", "Нужна помощь? Telegram @rastashops_help", "Yordam kerakmi? Telegram @rastashops_help"],
  by_one_account: ["One account for every shop on rasta", "Один аккаунт для всех магазинов rasta", "Barcha rasta do\u2018konlari uchun bitta akkaunt"],
});

const BY_STATUS = {
  new:       { tone:"wait", s:"by_s_new", n:"by_n_new" },
  confirmed: { tone:"go",   s:"by_s_confirmed", n:"by_n_confirmed" },
  ready:     { tone:"go",   s:"by_s_ready", n:"by_n_ready" },
  out:       { tone:"move", s:"by_s_out", n:"by_n_out" },
  completed: { tone:"done", s:"by_s_completed", n:"by_n_completed" },
  cancelled: { tone:"off",  s:"by_s_cancelled", n:null },
  declined:  { tone:"off",  s:"by_s_cancelled", n:null },
};
const BY_DONE = ["completed","cancelled","declined","returned","delivered"];
// rastashops has no delivery: sent → confirmed → completed (hand-over agreed in chat)
function byFlow(o){ return ["new","confirmed","completed"]; }
function byStepLabel(s, o, t){
  return ({ new:t.by_st_sent, confirmed:t.by_st_conf, ready:t.by_st_conf, out:t.by_st_conf, completed:t.by_st_done })[s];
}
function byHeadline(o, shopName, t){ const m = BY_STATUS[o.status] || BY_STATUS.new; return fill(t[m.s], { s:shopName }); }
function byItemsLabel(n, t){ return n===1? t.by_item_1 : fill(t.by_items_n,{n}); }
function byLines(o){ return (o.lines||[]).filter(l=>!l.dropped); }
function byProduct(shopStore, shopId, productId){ return (shopStore.products(shopId)||[]).find(x=>x.id===productId) || null; }
function byImg(shopStore, shopId, productId, w, h){
  const p = byProduct(shopStore, shopId, productId); if(!p) return null;
  const type = (shopStore.settings(shopId)||{}).type || (SHOPS[shopId]||{}).type;
  return photoURL(p.tone, pslot(shopId,p,0), w||160, h||200, IMG_KW[type]);
}
function byShopAv(shopStore, shopId){
  const m = shopStore.shopMeta(shopId); const pal = getPalette(shopStore.cfg(shopId));
  return photoURL(pal.swatch, "avatar-"+shopId, 120, 120, IMG_KW[m.type], 3);
}
function byStoreRef(shopStore, shopId){
  const m = shopStore.shopMeta(shopId);
  return { id:shopId, name:m.name, handle:m.handle, initials:m.initials, swatch:getPalette(shopStore.cfg(shopId)).swatch, type:m.type };
}
function byBuyAgain(shopStore, orderStore, shopId, lines, lang){
  const store = byStoreRef(shopStore, shopId);
  let n = 0;
  lines.forEach(l=>{
    const p = byProduct(shopStore, shopId, l.productId); if(!p) return;
    const v = p.variants.find(x=>x.id===l.variantId) || p.variants[0];
    if(!v || v.qty<=0) return;
    orderStore.addToBasket(store, { productId:p.id, storeId:shopId, name:textFB(p.name,lang), price:(v.price!=null? v.price : p.price), variantId:v.id,
      variantLabel: vLabel(p,v,lang) || null, lineId:p.id+"|"+v.id, addQty:l.qty||1,
      image: byImg(shopStore, shopId, p.id, 200, 250), url:"rastashops.com/"+store.handle+"?p="+p.id });
    n++;
  });
  return n;
}
function byPending(shopStore, acct, orders){
  if(!acct) return [];
  const seen = {};
  const out = [];
  orders.filter(o=>o.status==="completed").forEach(o=>byLines(o).forEach(l=>{
    const k = o.shopId+"|"+l.productId; if(seen[k]) return; seen[k] = 1;
    const done = (shopStore.reviews(o.shopId)||[]).some(r=>r.author===acct.phone && r.productId===l.productId);
    if(!done) out.push({ shopId:o.shopId, productId:l.productId, name:l.name, label:l.label, at:o.at, order:o });
  }));
  return out;
}
function byMyReviews(shopStore, acct){
  if(!acct) return [];
  return SHOP_ORDER.flatMap(sid=>(shopStore.reviews(sid)||[]).filter(r=>r.author===acct.phone).map(r=>({ ...r, shopId:sid })))
    .sort((a,b)=>(b.editedAt||b.at)-(a.editedAt||a.at));
}

function ByChip({ o, t }){
  const m = BY_STATUS[o.status] || BY_STATUS.new;
  const lab = o.status==="completed"? byStepLabel("completed", o, t) : o.status==="cancelled"||o.status==="declined"? t.by_cancelled : byStepLabel(o.status, o, t);
  return <span className={"by-chip "+m.tone}><i></i>{lab}</span>;
}
function ByProgress({ o, t, labels }){
  const flow = byFlow(o);
  const at = flow.indexOf(o.status);
  return (
    <div className="by-prog">
      <div className="by-prog-bar">{flow.map((s,i)=><span key={s} className={i<=at?"on":""}></span>)}</div>
      {labels && <div className="by-prog-l">{flow.map((s,i)=><span key={s} className={i<=at?"on":""}>{byStepLabel(s,o,t)}</span>)}</div>}
    </div>
  );
}
function ByThumbs({ shopStore, o, max }){
  const ls = byLines(o); const m = max || 4;
  return (
    <div className="by-thumbs">
      {ls.slice(0,m).map((l,i)=>{ const src = byImg(shopStore, o.shopId, l.productId, 140, 175);
        return <span key={i} className="by-th" style={src?{backgroundImage:"url("+src+")"}:undefined}>{l.qty>1 && <i>×{l.qty}</i>}</span>; })}
      {ls.length>m && <span className="by-th more">+{ls.length-m}</span>}
    </div>
  );
}
function ByStars({ value, onPick, size }){
  const [hov, setHov] = React.useState(0);
  const show = hov || value || 0;
  return (
    <div className={"by-stars"+(onPick?" pick":"")} onMouseLeave={()=>setHov(0)} style={size?{"--st":size+"px"}:undefined}>
      {[1,2,3,4,5].map(k=> onPick
        ? <button key={k} className={k<=show?"on":""} onMouseEnter={()=>setHov(k)} onClick={()=>onPick(k)} aria-label={k+" / 5"}>★</button>
        : <span key={k} className={k<=show?"on":""}>★</span>)}
    </div>
  );
}
function ByShopAv({ shopStore, shopId, size }){
  const s = size || 40;
  return <span className="by-sav" style={{ width:s, height:s, backgroundImage:"url("+byShopAv(shopStore, shopId)+")" }}></span>;
}

// demo: give the signed-in buyer a realistic history across shops
function bySeedDemo(shopStore, acct, lang){
  const H = 3600000, D = 86400000, now = Date.now();
  const meth = (id)=> (DELIVERY_METHODS.find(m=>m.id===id) || DELIVERY_METHODS[1] || DELIVERY_METHODS[0]);
  const courier = "pickup";   // no delivery in rastashops
  const plan = [
    { sid:"lola", status:"confirmed", ago:22*H, pick:[0,3], how:courier, steps:[0, 40*60000, 20*H] },
    { sid:"choyxona", status:"new", ago:50*60000, pick:[1,2], how:"pickup", steps:[0] },
    { sid:"gulnoza", status:"completed", ago:9*D, pick:[0,1,4], how:courier, steps:[0, 2*H, 26*H, 50*H] },
    { sid:"bahor", status:"completed", ago:27*D, pick:[2], how:courier, steps:[0, 1*H, 5*H, 9*H] },
    { sid:"kicks", status:"cancelled", ago:15*D, pick:[0], how:courier, steps:[0, 3*H], reason:"Size 42 sold out \u2014 sorry!" },
  ];
  plan.forEach((pl, i)=>{
    const prods = (shopStore.products(pl.sid)||[]).filter(p=>p.variants && p.variants.length && p.price>0);
    if(!prods.length) return;
    const lines = pl.pick.map((k,j)=>{ const p = prods[k % prods.length]; const v = p.variants[0];
      return { variantId:v.id, productId:p.id, name:textFB(p.name,lang), label:vLabel(p,v,lang), qty: j===0 && i%2? 2 : 1, unit:p.price }; })
      .filter((l,j,a)=>a.findIndex(x=>x.variantId===l.variantId)===j);
    const at = now - pl.ago;
    const flow = ["new","confirmed","completed"];
    const hist = pl.status==="cancelled" ? [{ status:"new", at }, { status:"cancelled", at: at+pl.steps[1] }]
      : flow.slice(0, flow.indexOf(pl.status)+1).map((s,k)=>({ status:s, at: at + (pl.steps[k]||0) }));
    const goods = lines.reduce((n,l)=>n+l.qty*l.unit,0);
    const fee = 0;
    shopStore.injectOrders(pl.sid, [{
      id:"o_demo_"+pl.sid, no: 1180 + i*7, at, status:pl.status,
      customer:{ name: acct.name || "Malika", phone: acct.phone, address: pl.how==="pickup"? "" : ((acct.addresses||[])[0]||{}).text || "Yunusobod 4, 12-uy, 34-xonadon", verified:true },
      delivery:{ method:pl.how, fee }, pay:{ method: i%2? "payme" : "cod" }, lines, goods, total: goods+fee, note:"", saleId:null,
      history: hist, sms: hist.map(h=>({ kind:h.status, at:h.at })),
      ...(pl.status==="cancelled"? { cancelReason:pl.reason, cancelledBy:"shop" } : {}),
    }]);
  });
}

Object.assign(window, { BY_STATUS, BY_DONE, byFlow, byStepLabel, byHeadline, byItemsLabel, byLines, byProduct, byImg, byShopAv, byStoreRef,
  byBuyAgain, byPending, byMyReviews, ByChip, ByProgress, ByThumbs, ByStars, ByShopAv, bySeedDemo });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { BY_STATUS, BY_DONE, byFlow, byStepLabel, byHeadline, byItemsLabel, byLines, byProduct, byImg, byShopAv, byStoreRef, byBuyAgain, byPending, byMyReviews, ByChip, ByProgress, ByThumbs, ByStars, ByShopAv, bySeedDemo });
