// ===== Team — sellers, roles, till sign-in, per-seller stats =====
I.team = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.6 14.8c1.8.6 3 2.2 3.4 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
I.lock = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" stroke="currentColor" strokeWidth="1.7"/></svg>;
I.chevR = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

addI18N({
  tm_title: ["Team", "Команда", "Jamoa"],
  tm_sub: ["Add sellers, decide what they can do, see who sold what", "Добавляйте продавцов, задавайте права и смотрите, кто сколько продал", "Sotuvchilarni qo‘shing, huquqlarini belgilang va kim qancha sotganini ko‘ring"],
  tm_add: ["Add seller", "Добавить продавца", "Sotuvchi qo‘shish"],
  tm_edit: ["Edit seller", "Изменить продавца", "Sotuvchini tahrirlash"],
  tm_you: ["You", "Вы", "Siz"],
  tm_owner: ["Owner", "Владелец", "Egasi"],
  tm_manager: ["Manager", "Менеджер", "Menejer"],
  tm_cashier: ["Seller", "Продавец", "Sotuvchi"],
  tm_manager_d: ["Everything except team and shop settings", "Всё, кроме команды и настроек магазина", "Jamoa va do‘kon sozlamalaridan tashqari hammasi"],
  tm_cashier_d: ["Sells at the till and handles orders", "Продаёт на кассе и обрабатывает заказы", "Kassada sotadi va buyurtmalarni ko‘radi"],
  tm_name: ["Full name", "Имя и фамилия", "Ism va familiya"],
  tm_phone: ["Phone", "Телефон", "Telefon"],
  tm_tg: ["Telegram username", "Ник в Telegram", "Telegram nomi"],
  tm_role: ["Role", "Роль", "Rol"],
  tm_perms: ["What they can do", "Что можно делать", "Nimalar qila oladi"],
  tm_p_returns: ["Accept returns", "Принимать возвраты", "Qaytarishlarni qabul qilish"],
  tm_p_stock: ["Restock and adjust stock", "Приход и корректировка склада", "Omborni to‘ldirish va tuzatish"],
  tm_p_products: ["Edit products and prices", "Менять товары и цены", "Mahsulot va narxlarni o‘zgartirish"],
  tm_p_costs: ["See cost and profit", "Видеть себестоимость и прибыль", "Tannarx va foydani ko‘rish"],
  tm_commission: ["Commission on sales", "Процент с продаж", "Sotuvdan foiz"],
  tm_commission_h: ["Leave 0 if you pay a fixed salary", "Оставьте 0, если платите оклад", "Belgilangan maosh bo‘lsa 0 qoldiring"],
  tm_pin: ["Till PIN", "PIN для кассы", "Kassa PIN kodi"],
  tm_pin_h: ["They enter it to start selling on this device", "Вводится, чтобы начать продавать на этом устройстве", "Shu qurilmada sotishni boshlash uchun kiritiladi"],
  tm_new_pin: ["New PIN", "Новый PIN", "Yangi PIN"],
  tm_send_invite: ["Add and send invite", "Добавить и отправить приглашение", "Qo‘shish va taklif yuborish"],
  tm_save: ["Save changes", "Сохранить", "Saqlash"],
  tm_invite_t: ["Invite sent", "Приглашение готово", "Taklif tayyor"],
  tm_invite_d: ["{n} opens this link in Telegram, or just logs in at rastashops.com with Telegram using {p}.", "{n} открывает ссылку в Telegram или просто входит на rastashops.com через Telegram с номером {p}.", "{n} havolani Telegramda ochadi yoki rastashops.com ga {p} raqamli Telegram orqali kiradi."],
  tm_send_tg: ["Send in Telegram", "Отправить в Telegram", "Telegramda yuborish"],
  tm_copy: ["Copy link", "Скопировать", "Nusxa olish"],
  tm_copied: ["Link copied", "Ссылка скопирована", "Havola nusxalandi"],
  tm_pending: ["Invite pending", "Ждём ответа", "Taklif kutilmoqda"],
  tm_mark_joined: ["Mark as joined (demo)", "Отметить как вошедшего (демо)", "Qo‘shildi deb belgilash (demo)"],
  tm_inactive: ["Deactivated", "Отключён", "O‘chirilgan"],
  tm_deactivate: ["Deactivate", "Отключить", "O‘chirish"],
  tm_reactivate: ["Turn back on", "Включить снова", "Qayta yoqish"],
  tm_deact_t: ["Deactivate {n}?", "Отключить {n}?", "{n} o‘chirilsinmi?"],
  tm_deact_b: ["They can no longer sign in at the till. Their past sales stay in your reports.", "Больше не сможет войти на кассу. Прошлые продажи останутся в отчётах.", "Endi kassaga kira olmaydi. O‘tgan sotuvlari hisobotlarda qoladi."],
  tm_remove: ["Cancel invite", "Отменить приглашение", "Taklifni bekor qilish"],
  tm_revenue: ["Revenue", "Выручка", "Tushum"],
  tm_receipts: ["Receipts", "Чеки", "Cheklar"],
  tm_avg: ["Avg. receipt", "Средний чек", "O‘rtacha chek"],
  tm_items: ["Items", "Товаров", "Mahsulot"],
  tm_returns: ["Returns", "Возвраты", "Qaytarish"],
  tm_earned: ["Commission", "Комиссия", "Komissiya"],
  tm_profit: ["Profit", "Прибыль", "Foyda"],
  tm_share: ["of revenue", "выручки", "tushumdan"],
  tm_top: ["Top seller", "Лучший продавец", "Eng yaxshi sotuvchi"],
  tm_board: ["Who sold how much", "Кто сколько продал", "Kim qancha sotdi"],
  tm_chart: ["Revenue by seller", "Выручка по продавцам", "Sotuvchilar bo‘yicha tushum"],
  tm_online: ["online", "онлайн", "onlayn"],
  tm_instore: ["in store", "в магазине", "do‘konda"],
  tm_no_sales: ["No sales in this period", "Нет продаж за период", "Bu davrda sotuv yo‘q"],
  tm_recent: ["Their receipts", "Их чеки", "Cheklari"],
  tm_best: ["Best-selling products", "Самые продаваемые", "Eng ko‘p sotilganlar"],
  tm_stats: ["Sales", "Продажи", "Sotuvlar"],
  tm_access: ["Access", "Доступ", "Kirish huquqi"],
  tm_till: ["At the till", "На кассе", "Kassada"],
  tm_who: ["Who's selling?", "Кто продаёт?", "Kim sotyapti?"],
  tm_who_d: ["Each sale is recorded under the person signed in here", "Каждая продажа записывается на того, кто здесь вошёл", "Har bir sotuv shu yerda kirgan odam nomiga yoziladi"],
  tm_enter_pin: ["Enter PIN for {n}", "PIN для: {n}", "{n} uchun PIN"],
  tm_wrong_pin: ["Wrong PIN, try again", "Неверный PIN", "PIN noto‘g‘ri"],
  tm_demo_pin: ["Demo PIN: {p}", "Демо PIN: {p}", "Demo PIN: {p}"],
  tm_now: ["Now selling: {n}", "Сейчас продаёт: {n}", "Hozir sotmoqda: {n}"],
  tm_all: ["Everyone", "Все", "Hammasi"],
  tm_my_sales: ["Showing only your sales", "Показаны только ваши продажи", "Faqat sizning sotuvlaringiz"],
  tm_readonly: ["Only the owner can add or change sellers", "Добавлять и менять продавцов может только владелец", "Sotuvchilarni faqat egasi qo‘sha oladi"],
  tm_since: ["Since {d}", "С {d}", "{d} dan"],
  tm_name_req: ["Enter a name", "Введите имя", "Ismni kiriting"],
  tm_quarter: ["3 months", "3 месяца", "3 oy"],
  tm_login_note: ["Work in a shop? Log in with the Telegram account whose number your owner added — you'll go straight to that shop.", "Работаете в магазине? Войдите через Telegram с номером, который добавил владелец, — и сразу попадёте в магазин.", "Do‘konda ishlaysizmi? Egasi qo‘shgan raqamli Telegram orqali kiring — to‘g‘ri do‘koningizga o‘tasiz."],
  tm_welcome: ["Welcome, {n} — you're in {s}", "Добро пожаловать, {n} — вы в {s}", "Xush kelibsiz, {n} — siz {s} da"],
  tm_pick_shop: ["Choose a shop", "Выберите магазин", "Do‘konni tanlang"],
  tm_pick_shop_d: ["You're on the team in more than one shop", "Вы в команде нескольких магазинов", "Siz bir nechta do‘kon jamoasidasiz"],
  tm_noaccess_t: ["No access to this shop", "Нет доступа к магазину", "Bu do‘konga kirish yo‘q"],
  tm_noaccess_d: ["The owner turned off your account. Ask them to turn it back on.", "Владелец отключил ваш аккаунт. Попросите включить снова.", "Egasi akkauntingizni o‘chirdi. Qayta yoqishni so‘rang."],
  tm_signed_tg: ["Logged in with Telegram", "Вход через Telegram", "Telegram orqali kirgansiz"],
  tm_signed_tg_d: ["Every sale you make here is recorded under your name.", "Все ваши продажи здесь записываются на вас.", "Bu yerdagi har bir sotuvingiz nomingizga yoziladi."],
  tm_login_how: ["Logs in with Telegram · {p}", "Вход через Telegram · {p}", "Telegram orqali kiradi · {p}"],
  tm_phone_req: ["Enter the phone number on their Telegram", "Введите номер из их Telegram", "Telegramdagi raqamini kiriting"],
  tm_phone_h: ["Must match their Telegram number — that's how they log in", "Должен совпадать с номером в Telegram — по нему вход", "Telegramdagi raqam bilan bir xil bo‘lsin — shu orqali kiradi"],
  tm_alltime: ["All time", "Всё время", "Butun davr"],
  tm_selling_as: ["Selling as", "Продаёт", "Sotuvchi"],
});

const TEAM_TONES = ["#41382f", "#E4573B", "#e09a36", "oklch(0.56 0.09 165)", "oklch(0.54 0.11 255)", "oklch(0.58 0.12 340)", "oklch(0.6 0.08 95)"];
const PERM_KEYS = ["returns", "stock", "products", "costs"];
function rolePerms(role){
  if(role === "owner" || role === "manager") return { returns:true, stock:true, products:true, costs:true };
  return { returns:false, stock:false, products:false, costs:false };
}
function seedTeam(shopId){
  const d = 86400000, now = Date.now();
  const owner = { id:"owner", name:"", role:"owner", status:"active", pin:"0000", perms:rolePerms("owner"), joined: now-400*d, tone:0 };
  const dil = { id:"st_dilnoza", name:"Dilnoza Yusupova", role:"manager", phone:"+998 97 700 80 44", tg:"@dilnoza_yu", status:"active", pin:"3333", commission:0, perms:rolePerms("manager"), joined: now-160*d, tone:3 };
  // demo: Dilnoza manages two shops (shows the shop picker); other shops start with just the owner
  if(shopId === SHOP_ORDER[1]) return [owner, { ...dil, joined: now-60*d, tone:1 }];
  if(shopId !== "lola") return [owner];
  return [
    owner,
    { id:"st_aziza", name:"Aziza Karimova", role:"cashier", phone:"+998 90 111 22 33", tg:"@aziza_k", status:"active", pin:"1111", commission:3, perms:{ ...rolePerms("cashier"), returns:true }, joined: now-210*d, tone:1 },
    { id:"st_bekzod", name:"Bekzod Rahimov", role:"cashier", phone:"+998 93 444 55 66", tg:"@bekzod_r", status:"active", pin:"2222", commission:3, perms:rolePerms("cashier"), joined: now-95*d, tone:2 },
    dil,
  ];
}
function hashStr(s){ let h = 0; for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0; return h; }
// history created before the team existed is spread across seeded staff, deterministically
function seedSellerFor(shopId, sale){
  const h = hashStr(String(sale.id)) % 100;
  if(shopId !== "lola") return shopId === SHOP_ORDER[1] && h < 35 ? "st_dilnoza" : "owner";
  if(sale.orderId) return h < 55 ? "st_dilnoza" : "owner";
  return h < 42 ? "st_aziza" : h < 74 ? "st_bekzod" : h < 88 ? "st_dilnoza" : "owner";
}
// always a real first + last name (never "You"): the owner's name comes from their Telegram login
function staffName(m, t){
  if(m.name) return m.name;
  if(m.role === "owner"){ const ses = window.__shopStore && window.__shopStore.state && window.__shopStore.state.session;
    return (ses && ses.name) || ""; }
  return t.tm_cashier;
}
function staffFirst(m, t){ return staffName(m, t).split(" ")[0]; }
function staffInit(m, t){ const n = staffName(m, t); return n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }
function roleLabel(role, t){ return role === "owner" ? t.tm_owner : role === "manager" ? t.tm_manager : t.tm_cashier; }
function permsOf(m){ return m.role === "owner" ? rolePerms("owner") : (m.perms || rolePerms(m.role)); }
function StaffAv({ m, t, size }){
  const s = size || 36;
  return <span className="tm-av" style={{ width:s, height:s, fontSize:Math.round(s*0.36), background:TEAM_TONES[(m.tone||0) % TEAM_TONES.length] }}>{staffInit(m, t)}</span>;
}

function teamBounds(range){
  const d = new Date();
  if(range === "today"){ const s = new Date(d); s.setHours(0,0,0,0); return [s.getTime(), Infinity]; }
  if(range === "all") return [0, Infinity];
  const s = new Date(d); s.setHours(0,0,0,0); s.setDate(s.getDate() - (range === "week" ? 6 : range === "quarter" ? 90 : 29));
  return [s.getTime(), Infinity];
}
function staffStats(store, shopId, range){
  const [from] = teamBounds(range);
  const team = store.team(shopId);
  const out = {};
  team.forEach(m => { out[m.id] = { revenue:0, cost:0, costKnown:true, receipts:0, items:0, returns:0, online:0, sales:[] }; });
  store.sales(shopId).forEach(s => {
    if(s.at < from) return;
    const who = store.saleSeller(shopId, s);
    const r = out[who]; if(!r) return;
    r.sales.push(s);
    let net = 0;
    s.lines.forEach(l => {
      const q = l.qty - l.returned;
      r.returns += l.returned;
      if(q <= 0) return;
      r.items += q; net += q * l.unit;
      if(l.cost != null) r.cost += q * l.cost; else r.costKnown = false;
    });
    if(net > 0){ r.receipts++; if(s.orderId) r.online++; }
    r.revenue += net;
  });
  return out;
}
function seriesFor(store, shopId, range){
  let [from] = teamBounds(range);
  if(range === "all"){ const ts = store.sales(shopId).map(s=>s.at); from = ts.length ? Math.min(...ts) : Date.now(); const s = new Date(from); s.setHours(0,0,0,0); s.setDate(s.getDate()-s.getDay()); from = s.getTime(); }
  const step = range === "today" ? 3600000 : (range === "quarter" || range === "all") ? 7*86400000 : 86400000;
  const n = range === "today" ? 14 : range === "week" ? 7 : range === "quarter" ? 13 : range === "all" ? Math.max(1, Math.min(52, Math.ceil((Date.now()-from)/step))) : 30;
  const start = range === "today" ? (()=>{ const s = new Date(); s.setHours(8,0,0,0); return s.getTime(); })() : from;
  const cols = Array.from({ length:n }, (_, i) => ({ at: start + i*step, by:{} }));
  store.sales(shopId).forEach(s => {
    const i = Math.floor((s.at - start) / step);
    if(i < 0 || i >= n) return;
    const net = s.lines.reduce((m,l)=> m + Math.max(0, l.qty-l.returned)*l.unit, 0);
    const who = store.saleSeller(shopId, s);
    cols[i].by[who] = (cols[i].by[who] || 0) + net;
  });
  return cols;
}

function TeamView({ store, shop, t, lang, viewer }){
  const team = store.team(shop.id);
  const isOwner = viewer.role === "owner";
  const seeCost = permsOf(viewer).costs;
  const [range, setRange] = React.useState(()=>{
    const last = Math.max(0, ...store.sales(shop.id).map(s=>s.at));
    return ["month","quarter"].find(r=>last >= teamBounds(r)[0]) || "all";
  });
  const [edit, setEdit] = React.useState(null);
  const [open, setOpen] = React.useState(null);
  const stats = staffStats(store, shop.id, range);
  const total = Object.values(stats).reduce((n,r)=>n+r.revenue,0);
  const receipts = Object.values(stats).reduce((n,r)=>n+r.receipts,0);
  const rows = team.filter(m => m.status !== "inactive" || stats[m.id].receipts)
    .slice().sort((a,b)=> stats[b.id].revenue - stats[a.id].revenue);
  const top = rows.find(m=>stats[m.id].revenue>0);
  const max = Math.max(1, ...rows.map(m=>stats[m.id].revenue));
  const cols = seriesFor(store, shop.id, range);
  const colMax = Math.max(1, ...cols.map(c=>Object.values(c.by).reduce((n,x)=>n+x,0)));
  const colLabel = (c, i) => {
    const d = new Date(c.at);
    if(range === "today") return i % 2 ? "" : d.getHours()+":00";
    if(range === "week") return d.toLocaleDateString(lang === "uz" ? "uz-UZ" : lang, { weekday:"short" });
    const every = range === "month" ? 5 : Math.max(2, Math.ceil(cols.length/6));
    return i % every ? "" : d.getDate()+" "+MONTHS[lang][d.getMonth()];
  };
  return (
    <div className="team">
      <div className="db-sec-head">
        <div><h2>{t.tm_title}</h2><div className="sub">{t.tm_sub}</div></div>
        {isOwner
          ? <button className="btn btn-accent btn-sm" onClick={()=>setEdit({})}>{I.plus({width:16,height:16})} {t.tm_add}</button>
          : <span className="tm-ro">{I.lock({width:14,height:14})} {t.tm_readonly}</span>}
      </div>

      <div className="chip-row" style={{marginBottom:14}}>
        {[["today",t.sl_today],["week",t.sl_week],["month",t.sl_month],["quarter",t.tm_quarter],["all",t.tm_alltime]].map(([id,lab])=>(
          <button key={id} className={"pick-chip"+(range===id?" on":"")} onClick={()=>setRange(id)}>{lab}</button>
        ))}
      </div>

      <div className="tm-sum">
        <div><span>{t.tm_revenue}</span><b>{fmtNum(total)}</b></div>
        <div><span>{t.tm_receipts}</span><b>{fmtNum(receipts)}</b></div>
        <div><span>{t.tm_avg}</span><b>{receipts? fmtNum(Math.round(total/receipts)) : "—"}</b></div>
        <div className="tm-sum-top"><span>{t.tm_top}</span>{top
          ? <b className="tm-top-who"><StaffAv m={top} t={t} size={26}/>{staffFirst(top,t)}<i>{Math.round(stats[top.id].revenue/Math.max(1,total)*100)}%</i></b>
          : <b>—</b>}</div>
      </div>

      <div className="tm-card">
        <div className="tm-card-h"><b>{t.tm_chart}</b>
          <div className="tm-legend">{rows.map(m=>(<span key={m.id}><i style={{background:TEAM_TONES[(m.tone||0)%TEAM_TONES.length]}}></i>{staffFirst(m,t)}</span>))}</div>
        </div>
        <div className={"tm-chart n"+cols.length}>
          {cols.map((c,i)=>{
            const sum = Object.values(c.by).reduce((n,x)=>n+x,0);
            return (
              <div key={i} className="tm-col" title={fmtNum(sum)}>
                <div className="tm-stack" style={{height:(sum/colMax*100)+"%"}}>
                  {rows.filter(m=>c.by[m.id]).map(m=>(
                    <span key={m.id} style={{flexGrow:c.by[m.id], background:TEAM_TONES[(m.tone||0)%TEAM_TONES.length]}}></span>
                  ))}
                </div>
                <em>{colLabel(c,i)}</em>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-sec-t">{t.tm_board}</div>
      <div className="tm-board">
        <div className={"tm-row tm-row-h"+(seeCost?" cost":"")}>
          <span></span><span>{t.tm_cashier}</span><span>{t.tm_revenue}</span><span>{t.tm_receipts}</span><span>{t.tm_avg}</span>
          <span>{t.tm_items}</span><span>{t.tm_returns}</span><span>{t.tm_earned}</span>{seeCost && <span>{t.tm_profit}</span>}<span></span>
        </div>
        {rows.map((m,i)=>{
          const r = stats[m.id];
          const earned = m.commission ? Math.round(r.revenue*m.commission/100) : null;
          return (
            <button key={m.id} className={"tm-row"+(seeCost?" cost":"")+(m.status!=="active"?" dim":"")} onClick={()=>setOpen(m.id)}>
              <span className="tm-rank">{r.revenue? i+1 : "–"}</span>
              <span className="tm-who">
                <StaffAv m={m} t={t}/>
                <span><b>{staffName(m,t)}</b><small>{roleLabel(m.role,t)}{m.status==="invited"? " · "+t.tm_pending : m.status==="inactive"? " · "+t.tm_inactive : ""}</small></span>
              </span>
              <span className="tm-rev">
                <b>{fmtNum(r.revenue)}</b>
                <span className="tm-bar"><i style={{width:(r.revenue/max*100)+"%", background:TEAM_TONES[(m.tone||0)%TEAM_TONES.length]}}></i></span>
                <small>{total? Math.round(r.revenue/total*100) : 0}% {t.tm_share}{r.online? " · "+r.online+" "+t.tm_online : ""}</small>
              </span>
              <span data-l={t.tm_receipts}>{r.receipts}</span>
              <span data-l={t.tm_avg}>{r.receipts? fmtNum(Math.round(r.revenue/r.receipts)) : "—"}</span>
              <span data-l={t.tm_items}>{r.items}</span>
              <span data-l={t.tm_returns} className={r.returns?"tm-warn":""}>{r.returns||"—"}</span>
              <span data-l={t.tm_earned}>{earned!=null? fmtNum(earned) : "—"}{m.commission? <small> · {m.commission}%</small> : null}</span>
              {seeCost && <span data-l={t.tm_profit}>{fmtNum(r.revenue-r.cost)}</span>}
              <span className="tm-cv">{I.chevR({width:16,height:16})}</span>
            </button>
          );
        })}
      </div>

      {open && <StaffDetail store={store} shop={shop} t={t} lang={lang} viewer={viewer} id={open} range={range}
        onClose={()=>setOpen(null)} onEdit={(m)=>{ setOpen(null); setEdit({ m }); }}/>}
      {edit && <StaffEditor store={store} shop={shop} t={t} lang={lang} init={edit.m} onClose={()=>setEdit(null)}/>}
    </div>
  );
}

function StaffDetail({ store, shop, t, lang, viewer, id, range, onClose, onEdit }){
  const m = store.team(shop.id).find(x=>x.id===id);
  const [tab, setTab] = React.useState("stats");
  const [confirm, setConfirm] = React.useState(false);
  if(!m) return null;
  const isOwner = viewer.role === "owner";
  const r = staffStats(store, shop.id, range)[m.id];
  const p = permsOf(m);
  const prods = {};
  r.sales.forEach(s=>s.lines.forEach(l=>{ const q=l.qty-l.returned; if(q<=0) return;
    const k=l.productId; prods[k]=prods[k]||{ name:l.name, qty:0, rev:0 }; prods[k].qty+=q; prods[k].rev+=q*l.unit; }));
  const best = Object.values(prods).sort((a,b)=>b.qty-a.qty).slice(0,5);
  const payLabel = (pid)=>{ const x=PAY_METHODS.find(y=>y.id===pid); return x? x.label[lang] : pid; };
  const link = "t.me/rastashops_bot?start=join_"+shop.handle+"_"+m.id.slice(-5);
  return (
    <Modal wide title={staffName(m,t)} sub={roleLabel(m.role,t)+(m.joined? " · "+fill(t.tm_since,{d:fmtDate(m.joined,lang)}) : "")} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_close}</button>
        {isOwner && m.role!=="owner" && (
          <div className="mf-right">
            {m.status==="invited" && <button className="btn btn-ghost btn-sm" onClick={()=>{ store.removeStaff(shop.id, m.id); onClose(); }}>{t.tm_remove}</button>}
            {m.status==="active" && <button className="btn btn-ghost btn-sm" onClick={()=>setConfirm(true)}>{t.tm_deactivate}</button>}
            {m.status==="inactive" && <button className="btn btn-soft btn-sm" onClick={()=>store.saveStaff(shop.id,{ id:m.id, status:"active" })}>{t.tm_reactivate}</button>}
            <button className="btn btn-accent btn-sm" onClick={()=>onEdit(m)}>{I.edit({width:15,height:15})} {t.tm_edit}</button>
          </div>
        )}
      </>}>
      <div className="tm-d-head">
        <StaffAv m={m} t={t} size={52}/>
        <div className="tm-d-contact">
          {m.phone && <span>{I.phone({width:14,height:14})} {fill(t.tm_login_how,{p:m.phone})}</span>}
          {m.tg && <span>{I.tg({width:14,height:14})} {m.tg}</span>}
        </div>
        <div className="chip-row" style={{marginLeft:"auto"}}>
          {[["stats",t.tm_stats],["access",t.tm_access]].map(([k,lab])=>(
            <button key={k} className={"pick-chip"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{lab}</button>
          ))}
        </div>
      </div>

      {m.status==="invited" && (
        <div className="tm-invite">
          <div><b>{t.tm_pending}</b><span>{link}</span></div>
          <button className="btn btn-soft btn-sm" onClick={()=>{ try{ navigator.clipboard.writeText(link); }catch(e){} toast(t.tm_copied); }}>{I.copy({width:15,height:15})} {t.tm_copy}</button>
          {isOwner && <button className="btn btn-ghost btn-sm" onClick={()=>store.saveStaff(shop.id,{ id:m.id, status:"active", joined:Date.now() })}>{t.tm_mark_joined}</button>}
        </div>
      )}

      {tab==="stats" ? (
        <>
          <div className="mini-stats four" style={{marginBottom:18}}>
            {[[t.tm_revenue, fmtNum(r.revenue)],[t.tm_receipts, r.receipts],[t.tm_avg, r.receipts? fmtNum(Math.round(r.revenue/r.receipts)):"—"],
              m.commission? [t.tm_earned+" · "+m.commission+"%", fmtNum(Math.round(r.revenue*m.commission/100))] : [t.tm_items, r.items]].map(([lab,val],i)=>(
              <div key={i} className="mini-stat"><div className="ms-val">{val}</div><div className="ms-lab">{lab}</div></div>
            ))}
          </div>
          {r.sales.length===0 ? <div className="tm-empty">{t.tm_no_sales}</div> : (
            <div className="tm-d-grid">
              <div>
                <div className="tm-d-t">{t.tm_best}</div>
                {best.map((b,i)=>(
                  <div key={i} className="tm-best"><span>{i+1}</span><b>{b.name}</b><em>× {b.qty}</em><i>{fmtNum(b.rev)}</i></div>
                ))}
              </div>
              <div>
                <div className="tm-d-t">{t.tm_recent}</div>
                {r.sales.slice(0,8).map(s=>{
                  const n = s.lines.reduce((x,l)=>x+(l.qty-l.returned),0);
                  return (
                    <div key={s.id} className="tm-rc">
                      <span className="tm-rc-no">#{s.no}</span>
                      <span className="tm-rc-when">{relDay(s.at,lang)} · {fmtDateTime(s.at,lang).split("· ")[1]}</span>
                      <span className="tm-rc-how">{s.orderId? t.tm_online : payLabel(s.pay)} · {n} {t.sc_items}</span>
                      <b className={s.status!=="completed"?"ret":""}>{fmtNum(s.total)}</b>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="tm-access">
          {PERM_KEYS.map(k=>(
            <div key={k} className={"tm-perm"+(p[k]?" on":"")}>
              <span className="tm-perm-ic">{p[k]? I.check({width:15,height:15}) : I.x({width:14,height:14})}</span>{t["tm_p_"+k]}
            </div>
          ))}
          <div className="tm-perm on"><span className="tm-perm-ic">{I.lock({width:14,height:14})}</span>{t.tm_pin}: ••••</div>
        </div>
      )}
      {confirm && <Confirm title={fill(t.tm_deact_t,{n:staffFirst(m,t)})} body={t.tm_deact_b} cta={t.tm_deactivate} danger
        onClose={()=>setConfirm(false)} onConfirm={()=>{ store.saveStaff(shop.id,{ id:m.id, status:"inactive" }); setConfirm(false); toast(t.tm_inactive); }}/>}
    </Modal>
  );
}

function genPin(){ return String(Math.floor(1000 + Math.random()*9000)); }
function StaffEditor({ store, shop, t, lang, init, onClose }){
  const team = store.team(shop.id);
  const [d, setD] = React.useState(()=> init ? { ...init, perms:permsOf(init) } : { name:"", phone:"", tg:"", role:"cashier", perms:rolePerms("cashier"), commission:0, pin:genPin() });
  const [sent, setSent] = React.useState(null);
  const set = (p)=> setD(x=>({ ...x, ...p }));
  const isOwnerRow = d.role === "owner";
  function save(){
    if(!String(d.name||"").trim() && !isOwnerRow){ toast(t.tm_name_req, "warn"); return; }
    if(!isOwnerRow && String(d.phone||"").replace(/\D/g,"").length < 9){ toast(t.tm_phone_req, "warn"); return; }
    if(init){ store.saveStaff(shop.id, { ...d, name:String(d.name||"").trim() }); toast(t.db_saved); onClose(); return; }
    const used = team.map(m=>m.tone||0);
    let tone = 1; while(used.includes(tone) && tone < TEAM_TONES.length-1) tone++;
    const m = { ...d, name:d.name.trim(), id:"st_"+Math.random().toString(36).slice(2,8), status:"invited", tone, joined:Date.now() };
    store.saveStaff(shop.id, m);
    setSent(m);
  }
  if(sent){
    const link = location.host + "/login";   // the invite is the phone number: logging in with that Telegram activates it
    return (
      <Modal title={t.tm_invite_t} onClose={onClose}
        foot={<><span></span><div className="mf-right"><button className="btn btn-accent btn-sm" onClick={onClose}>{I.check({width:16,height:16})} {t.g_close}</button></div></>}>
        <div className="tm-sent">
          <StaffAv m={sent} t={t} size={56}/>
          <p>{fill(t.tm_invite_d,{n:staffFirst(sent,t), p:sent.phone})}</p>
          <div className="tm-link">{link}</div>
          <div className="tm-sent-acts">
            <button className="btn btn-soft" onClick={()=>{ try{ navigator.clipboard.writeText(link); }catch(e){} toast(t.tm_copied); }}>{I.copy({width:16,height:16})} {t.tm_copy}</button>
            <button className="btn btn-accent" onClick={()=>toast(t.tm_copied)}>{I.tg({width:16,height:16})} {t.tm_send_tg}</button>
          </div>
          <div className="tm-pin-note">{t.tm_pin}: <b>{sent.pin}</b> · {t.tm_pin_h}</div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={init? t.tm_edit : t.tm_add} onClose={onClose}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_cancel}</button>
        <div className="mf-right"><button className="btn btn-accent btn-sm" onClick={save}>{init? I.check({width:16,height:16}) : I.tg({width:15,height:15})} {init? t.tm_save : t.tm_send_invite}</button></div>
      </>}>
      {!isOwnerRow && (
        <>
          <div className="field"><label>{t.tm_name}</label><input value={d.name} onChange={e=>set({name:e.target.value})} placeholder="Aziza Karimova" autoFocus/></div>
          <div className="field"><label>{t.tm_phone} · Telegram</label><input value={d.phone||""} onChange={e=>set({phone:e.target.value})} placeholder="+998 90 000 00 00" inputMode="tel"/>
            <div className="hint">{t.tm_phone_h}</div></div>
          <div className="field"><label>{t.tm_tg}</label><input value={d.tg||""} onChange={e=>set({tg:e.target.value})} placeholder="@username"/></div>
          <div className="field"><label>{t.tm_role}</label>
            <div className="radio-list">
              {["cashier","manager"].map(r=>(
                <label key={r} className={"radio"+(d.role===r?" on":"")}>
                  <input type="radio" checked={d.role===r} onChange={()=>set({ role:r, perms:rolePerms(r) })}/>
                  <span className="radio-dot"></span>
                  <span className="tm-role-txt"><b>{roleLabel(r,t)}</b><small>{t["tm_"+r+"_d"]}</small></span>
                </label>
              ))}
            </div>
          </div>
          <div className="field"><label>{t.tm_perms}</label>
            <div className="tm-switches">
              {PERM_KEYS.map(k=>(
                <label key={k} className="switch-row">
                  <input type="checkbox" checked={!!d.perms[k]} onChange={e=>set({ perms:{ ...d.perms, [k]:e.target.checked } })}/>
                  <span className="switch"><i></i></span>{t["tm_p_"+k]}
                </label>
              ))}
            </div>
          </div>
          <div className="field"><label>{t.tm_commission}</label>
            <div className="tm-pct"><input type="number" min="0" max="50" value={d.commission||0} onChange={e=>set({commission:Math.max(0,Math.min(50,Number(e.target.value)||0))})}/><span>%</span></div>
            <div className="hint">{t.tm_commission_h}</div>
          </div>
        </>
      )}
      <div className="field"><label>{t.tm_pin}</label>
        <div className="tm-pin-row"><span className="tm-pin-val">{d.pin || "••••"}</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>set({pin:genPin()})}>{I.undo({width:14,height:14})} {t.tm_new_pin}</button></div>
        <div className="hint">{t.tm_pin_h}</div>
      </div>
    </Modal>
  );
}

function SwitchSeller({ store, shop, t, onClose, onLogout }){
  const team = store.team(shop.id).filter(m=>m.status!=="inactive");
  const cur = store.operatorId(shop.id);
  const [who, setWho] = React.useState(null);
  const [pin, setPin] = React.useState("");
  const [err, setErr] = React.useState(false);
  const self = (store.staffShops()||[]).find(e=>e.shopId===shop.id);
  if(self && self.role!=="owner"){
    const me = store.operator(shop.id);
    return (
      <Modal title={t.tm_signed_tg} onClose={onClose}
        foot={<><button className="btn btn-ghost btn-sm" onClick={onClose}>{t.g_close}</button><div className="mf-right"><button className="btn btn-soft btn-sm" onClick={onLogout}>{t.au_logout}</button></div></>}>
        <div className="tm-sent">
          <StaffAv m={me} t={t} size={56}/>
          <div><b style={{fontSize:17}}>{staffName(me,t)}</b><div className="tm-pin-note">{roleLabel(me.role,t)} · {shop.name}</div></div>
          <div className="tm-link">{I.tg({width:14,height:14})} {me.tg || me.phone}</div>
          <p>{t.tm_signed_tg_d}</p>
        </div>
      </Modal>
    );
  }
  function press(k){
    if(k==="del"){ setPin(p=>p.slice(0,-1)); setErr(false); return; }
    const next = (pin + k).slice(0,4);
    setPin(next); setErr(false);
    if(next.length===4){
      // the PIN is checked on the server (5 wrong tries lock it for 5 minutes)
      store.switchOperator(shop.id, who.id, next).then(r=>{
        if(r.ok){ toast(fill(t.tm_now,{n:staffFirst(who,t)})); onClose(); }
        else { setErr(true); setPin(""); }
      });
    }
  }
  return (
    <Modal title={who? fill(t.tm_enter_pin,{n:staffFirst(who,t)}) : t.tm_who} sub={who? null : t.tm_who_d} onClose={onClose}
      foot={<><button className="btn btn-ghost btn-sm" onClick={()=> who? (setWho(null), setPin("")) : onClose()}>{who? t.g_back || "←" : t.g_cancel}</button><span></span></>}>
      {!who ? (
        <div className="tm-pick">
          {team.map(m=>(
            <button key={m.id} className={"tm-pick-b"+(m.id===cur?" on":"")} disabled={m.status==="invited"} onClick={()=>{ if(self && m.id===self.staffId){ store.setOperator(shop.id, m.id); toast(fill(t.tm_now,{n:staffFirst(m,t)})); onClose(); return; } setWho(m); setPin(""); setErr(false); }}>
              <StaffAv m={m} t={t} size={48}/>
              <b>{staffName(m,t)}</b>
              <small>{m.status==="invited"? t.tm_pending : roleLabel(m.role,t)}</small>
              {m.id===cur && <span className="tm-pick-on">{I.check({width:13,height:13})}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className={"tm-pad"+(err?" err":"")}>
          <StaffAv m={who} t={t} size={56}/>
          <div className="tm-dots">{[0,1,2,3].map(i=><i key={i} className={i<pin.length?"on":""}></i>)}</div>
          <div className="tm-pad-msg">{err? t.tm_wrong_pin : "\u00a0"}</div>
          <div className="tm-keys">
            {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=> k===""? <span key={i}></span> :
              <button key={i} onClick={()=>press(k)} aria-label={k==="del"?"delete":k}>{k==="del"? I.back({width:20,height:20}) : k}</button>)}
          </div>
        </div>
      )}
    </Modal>
  );
}

function TillChip({ store, shop, t, compact, onClick }){
  const m = store.operator(shop.id);
  return (
    <button className={"tm-till"+(compact?" compact":"")} onClick={onClick} title={t.tm_who}>
      <StaffAv m={m} t={t} size={compact?26:30}/>
      {!compact && <span className="tm-till-t"><small>{t.tm_till}</small><b>{staffName(m,t)}</b></span>}
      <span className="tm-till-sw">{I.layers({width:14,height:14})}</span>
    </button>
  );
}

Object.assign(window, { TeamView, StaffDetail, StaffEditor, SwitchSeller, TillChip, StaffAv, seedTeam, seedSellerFor, rolePerms, permsOf, staffName, staffFirst, roleLabel, TEAM_TONES });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { TEAM_TONES, PERM_KEYS, rolePerms, seedTeam, hashStr, seedSellerFor, staffName, staffFirst, staffInit, roleLabel, permsOf, StaffAv, teamBounds, staffStats, seriesFor, TeamView, StaffDetail, genPin, StaffEditor, SwitchSeller, TillChip });
