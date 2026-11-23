// ===== Auth — Telegram login (sellers + buyers). No SMS/OTP. =====
// Real build: Telegram bot (@rastashops_bot) with a "Share phone" contact button, or the Telegram Login Widget.
// Here the Telegram side is simulated so the flow can be clicked through.
function fmtPhone(digits){
  const d = digits.slice(0,9);
  const p = [d.slice(0,2), d.slice(2,5), d.slice(5,7), d.slice(7,9)].filter(Boolean);
  return p.join(" ");
}
function maskPhone(digits){
  const d = digits.padEnd(9,"·");
  return "+998 " + d.slice(0,2) + " ···· " + d.slice(7,9);
}
function validPhone(d){ return d.length===9 && UZ_OPERATORS.includes(d.slice(0,2)); }

addI18N({
  tg_title:     ["Log in or create your shop", "Вход или создание магазина", "Kirish yoki do\u02bbkon yaratish"],
  tg_sub:       ["One tap with Telegram — no passwords, no SMS codes.", "Одно нажатие через Telegram — без паролей и SMS-кодов.", "Telegram orqali bir bosishda — parol va SMS kodsiz."],
  tg_btn:       ["Continue with Telegram", "Продолжить через Telegram", "Telegram orqali davom etish"],
  tg_why1:      ["Your Telegram number becomes your login", "Номер из Telegram становится логином", "Telegram raqamingiz login bo\u02bbladi"],
  tg_why2:      ["Order & message alerts arrive in Telegram", "Уведомления о заказах и сообщениях — в Telegram", "Buyurtma va xabar bildirishnomalari Telegramga keladi"],
  tg_why3:      ["Works on any device, nothing to remember", "Работает на любом устройстве, ничего не нужно помнить", "Har qanday qurilmada ishlaydi, eslab qolish shart emas"],
  tg_open:      ["Opening Telegram…", "Открываем Telegram…", "Telegram ochilmoqda…"],
  tg_bot_hi:    ["Hi {n}! Tap the button below to share your phone number and log in to rastashops.com.", "Привет, {n}! Нажмите кнопку ниже, чтобы поделиться номером и войти в rastashops.com.", "Salom, {n}! rastashops.com ga kirish uchun quyidagi tugma orqali raqamingizni ulashing."],
  tg_share:     ["Share my phone number", "Поделиться номером", "Raqamimni ulashish"],
  tg_confirm_t: ["Share phone number?", "Поделиться номером?", "Raqamni ulashasizmi?"],
  tg_confirm_d: ["rastashops.com will receive your phone number and Telegram name.", "rastashops.com получит ваш номер и имя в Telegram.", "rastashops.com raqamingiz va Telegramdagi ismingizni oladi."],
  tg_ok:        ["OK", "OK", "OK"],
  tg_cancel:    ["Cancel", "Отмена", "Bekor"],
  tg_done:      ["You're logged in. Go back to rastashops.com ↩", "Вы вошли. Вернитесь в rastashops.com ↩", "Kirdingiz. rastashops.com ga qayting ↩"],
  tg_back:      ["Back to rastashops.com", "Вернуться в rastashops.com", "rastashops.com ga qaytish"],
  tg_demo:      ["Demo account", "Демо-аккаунт", "Demo akkaunt"],
  tg_demo_ph:   ["Phone in this demo Telegram", "Номер в демо-Telegram", "Demo Telegramdagi raqam"],
  tg_bot:       ["bot", "бот", "bot"],
  tg_consent:   ["By continuing you agree to the Terms & Privacy Policy", "Продолжая, вы принимаете Условия и Политику конфиденциальности", "Davom etib, Shartlar va Maxfiylik siyosatiga rozilik bildirasiz"],
  ac_signin_d:  ["Log in with Telegram to send your request. Shops see a real, verified customer — and your orders follow you to any device.", "Войдите через Telegram, чтобы отправить запрос. Магазин видит реального клиента, а заказы доступны на любом устройстве.", "So\u02bbrov yuborish uchun Telegram orqali kiring. Do\u02bbkon haqiqiy mijozni ko\u02bbradi, buyurtmalar esa har qanday qurilmada ochiladi."],
  ac_signin_t2: ["Log in with Telegram", "Войти через Telegram", "Telegram orqali kirish"],
  ord_login:    ["Log in", "Войти", "Kirish"],
  ord_login_t:  ["Log in with Telegram to order", "Войдите через Telegram, чтобы заказать", "Buyurtma uchun Telegram orqali kiring"],
  ord_bar_t:    ["Your order", "Ваш заказ", "Buyurtmangiz"],
  ord_bar_btn:  ["Review & send", "Проверить и отправить", "Koʻrib chiqish va yuborish"],
  ord_more:     ["Add more from this shop", "Добавить ещё из магазина", "Doʻkondan yana qoʻshish"],
  bk_add:       ["Order", "Заказать", "Buyurtma berish"],
  bk_go:        ["In your order · review", "В заказе · проверить", "Buyurtmada · koʻrish"],
  // server errors (api.js errorText)
  api_network:  ["No internet. Try again.", "Нет интернета. Попробуйте ещё раз.", "Internet yoʻq. Qayta urinib koʻring."],
  api_failed:   ["Could not save", "Не удалось сохранить", "Saqlab boʻlmadi"],
  api_barcode_taken: ["This barcode is already used in your shop", "Этот штрихкод уже есть в магазине", "Bu shtrix-kod doʻkoningizda bor"],
  api_handle_taken: ["This link is taken", "Эта ссылка занята", "Bu havola band"],
  api_gone:     ["Some items are no longer available", "Некоторых товаров уже нет", "Baʼzi mahsulotlar endi yoʻq"],
  api_login:    ["Please log in again", "Войдите снова", "Qaytadan kiring"],
  api_slow_down:["Too many tries. Wait a minute.", "Слишком много попыток. Подождите минуту.", "Juda koʻp urinish. Bir daqiqa kuting."],
  api_paused:   ["This shop is paused", "Магазин на паузе", "Doʻkon toʻxtatilgan"],
  api_saved_offline: ["No internet: the sale is saved and will be sent", "Нет интернета: продажа сохранена и будет отправлена", "Internet yoʻq: sotuv saqlandi, keyin yuboriladi"],
  api_loading:  ["Loading…", "Загрузка…", "Yuklanmoqda…"],
  st_tg_missing:["Add your Telegram username: buyers send their basket to this chat and agree price, pickup and payment with you there.",
                 "Укажите username в Telegram: покупатели отправляют корзину в этот чат и договариваются с вами о цене, получении и оплате.",
                 "Telegram username kiriting: xaridorlar savatni shu chatga yuboradi va narx, olish va toʻlovni siz bilan oʻsha yerda kelishadi."],
  st_change_number: ["Reconnect Telegram", "Переподключить Telegram", "Telegramni qayta ulash"],
  st_change_d:  ["Log in with another Telegram account. Its phone number becomes your login.", "Войдите другим аккаунтом Telegram. Его номер станет логином.", "Boshqa Telegram akkaunti bilan kiring. Uning raqami login bo\u02bbladi."],
});

const TG_I = {
  logo:(p)=> <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path d="M5.4 11.8 16.9 7.3c.53-.2 1 .13.83.95l-1.96 9.23c-.14.66-.54.82-1.1.51l-3-2.21-1.45 1.4c-.16.16-.3.3-.6.3l.21-3.05 5.55-5.01c.24-.21-.05-.33-.37-.12l-6.86 4.32-2.96-.92c-.64-.2-.65-.64.14-.95Z" fill="#fff"/></svg>,
  plane:(p)=> <svg viewBox="0 0 24 24" {...p}><path d="M2.8 11.3 20.3 4.5c.8-.3 1.5.2 1.27 1.45l-2.98 14.05c-.21 1-.82 1.24-1.66.77l-4.58-3.37-2.2 2.13c-.25.24-.45.45-.92.45l.33-4.65 8.45-7.63c.37-.33-.08-.5-.57-.18L7.0 14.1 2.5 12.7c-.98-.3-1-.97.3-1.4Z" fill="currentColor"/></svg>,
  phone:(p)=> <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
};
const TG_DEMO = [
  { name:"Dilnoza", last:"Karimova", user:"dilnoza_k", ph:"901234567" },
  { name:"Jasur", last:"Tursunov", user:"jasur.t", ph:"935551122" },
  { name:"Malika", last:"Yusupova", user:"malika_shop", ph:"977003040" },
];

function TelegramButton({ t, onClick, busy, small }){
  return (
    <button className={"tg-btn"+(small?" sm":"")} onClick={onClick} disabled={busy}>
      {busy ? <span className="tg-spin"></span> : TG_I.plane({width:20,height:20})}
      <span>{busy? t.tg_open : t.tg_btn}</span>
    </button>
  );
}

// simulated Telegram: bot chat → share-contact confirm → back
function TelegramSim({ t, onShared, onClose, accounts }){
  const list = accounts && accounts.length ? accounts : TG_DEMO;
  const [acct, setAcct] = React.useState(()=> accounts && accounts.length ? list[0] : TG_DEMO[Math.floor(Math.random()*TG_DEMO.length)]);
  const [ph, setPh] = React.useState(acct.ph);
  const [stage, setStage] = React.useState("chat");   // chat | confirm | done
  React.useEffect(()=>{ const k=(e)=>{ if(e.key==="Escape") onClose(); }; addEventListener("keydown",k); return ()=>removeEventListener("keydown",k); }, []);
  const ok = validPhone(ph);
  const share = ()=>{ setStage("done"); setTimeout(()=>onShared({ phone:"+998 "+fmtPhone(ph), name:acct.name+" "+acct.last, username:acct.user }), 900); };
  return ReactDOM.createPortal(
    <div className="tg-scrim" onClick={onClose}>
      <div className="tg-app" onClick={e=>e.stopPropagation()}>
        <div className="tg-head">
          <button className="tg-x" onClick={onClose} aria-label={t.tg_back}>{I.back({width:18,height:18})}</button>
          <span className="tg-bav">r</span>
          <div className="tg-who"><b>rastashops</b><small>{t.tg_bot}</small></div>
        </div>
        <div className="tg-feed">
          <div className="tg-msg out"><p>/start login</p><time>12:01 ✓✓</time></div>
          <div className="tg-msg in"><p>{fill(t.tg_bot_hi,{n:acct.name})}</p><time>12:01</time></div>
          {stage==="done" && <div className="tg-msg out contact">{TG_I.phone({width:18,height:18})}<div><b>{acct.name} {acct.last}</b><small>+998 {fmtPhone(ph)}</small></div><time>12:02 ✓✓</time></div>}
          {stage==="done" && <div className="tg-msg in"><p>✅ {t.tg_done}</p><time>12:02</time></div>}
        </div>
        <div className="tg-demo">
          {accounts && accounts.length>1 && stage==="chat" && (
            <div className="tg-accts">{list.map(a=>(
              <button key={a.user} className={a.user===acct.user?"on":""} onClick={()=>{ setAcct(a); setPh(a.ph); }}><b>{a.name} {a.last}</b>{a.tag && <small>{a.tag}</small>}</button>
            ))}</div>
          )}
          <span>{t.tg_demo}: <b>{acct.name} {acct.last}</b> · @{acct.user}</span>
          <label>{t.tg_demo_ph}<span className="tg-ph"><i>+998</i><input value={fmtPhone(ph)} onChange={e=>setPh(e.target.value.replace(/\D/g,"").slice(0,9))} inputMode="tel" disabled={stage!=="chat"}/></span></label>
        </div>
        <div className="tg-kb">
          <button className="tg-key" disabled={!ok || stage!=="chat"} onClick={()=>setStage("confirm")}>{TG_I.phone({width:16,height:16})} {t.tg_share}</button>
        </div>
        {stage==="confirm" && (
          <div className="tg-dlg-wrap">
            <div className="tg-dlg">
              <b>{t.tg_confirm_t}</b>
              <p>{t.tg_confirm_d}</p>
              <div className="tg-dlg-acts"><button onClick={()=>setStage("chat")}>{t.tg_cancel}</button><button className="ok" onClick={share}>{t.tg_ok}</button></div>
            </div>
          </div>
        )}
      </div>
    </div>, document.body
  );
}

// full flow (BACKEND-PLAN §7.1): POST /auth/telegram/start → the bot asks for the phone → the long-poll
// /auth/telegram/wait returns the session → onDone("+998 ...", { name, username }).
// Without a bot (dev profile) the simulated Telegram above stands in for the bot's "Share phone" step.
function AuthFlow({ t, sub, title, headless, onDone, accounts, note, purpose }){
  const [sim, setSim] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const tokenRef = React.useRef(null);
  const alive = React.useRef(true);
  React.useEffect(()=>()=>{ alive.current = false; }, []);
  async function waitLoop(token){
    setWaiting(true);
    while(alive.current && tokenRef.current === token){
      let r;
      try{ r = await Api.get("/auth/telegram/wait?token=" + encodeURIComponent(token)); }
      catch(e){ if(e.code === "network"){ await new Promise(z => setTimeout(z, 1500)); continue; } toast(Api.errorText(e), "err"); break; }
      if(r.status === "done"){
        Api.setSession(r);
        setWaiting(false); setBusy(false);
        const a = r.me.account;
        onDone(a.phone, { name: a.name, username: (a.tg || "").replace("@", "") });
        return;
      }
      if(r.status !== "pending") break;
    }
    if(alive.current){ setWaiting(false); setBusy(false); }
  }
  const start = async ()=>{
    setBusy(true);
    try{
      const s = await Api.post("/auth/telegram/start", { purpose: purpose || "login" });
      tokenRef.current = s.token;
      if(s.botUrl){ window.open(s.botUrl, "_blank"); waitLoop(s.token); }
      else if(s.dev){ setBusy(false); setSim(true); }
      else { setBusy(false); toast(Api.errorText({ code: "auth.bot_off" }), "err"); }
    }catch(e){ setBusy(false); toast(Api.errorText(e), "err"); }
  };
  const shared = async (u)=>{
    setSim(false); setBusy(true);
    try{
      await Api.post("/auth/dev/confirm", { token: tokenRef.current, phone: u.phone, name: u.name, username: u.username });
      waitLoop(tokenRef.current);
    }catch(e){ setBusy(false); toast(Api.errorText(e), "err"); }
  };
  return (
    <div className="auth-step tg-auth">
      {!headless && <div className="ob-head"><h2>{title||t.tg_title}</h2><p>{sub||t.tg_sub}</p></div>}
      {!headless && (
        <ul className="tg-why">
          <li>{I.check({width:14,height:14})} {t.tg_why1}</li>
          <li>{I.check({width:14,height:14})} {t.tg_why2}</li>
          <li>{I.check({width:14,height:14})} {t.tg_why3}</li>
        </ul>
      )}
      <TelegramButton t={t} onClick={start} busy={busy}/>
      {waiting && <div className="auth-consent">{t.tg_open} <button className="btn btn-ghost btn-sm" onClick={()=>{ tokenRef.current = null; setWaiting(false); setBusy(false); }}>{t.tg_cancel}</button></div>}
      <div className="auth-consent">{t.tg_consent}</div>
      {note}
      {sim && <TelegramSim t={t} accounts={accounts} onClose={()=>{ setSim(false); setBusy(false); }} onShared={shared}/>}
    </div>
  );
}

Object.assign(window, { AuthFlow, TelegramButton, TelegramSim, fmtPhone, maskPhone, validPhone, TG_I });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { fmtPhone, maskPhone, validPhone, TG_I, TG_DEMO, TelegramButton, TelegramSim, AuthFlow });
