// ===== Adjust stock popup: recount / loss & damage / customer return =====
Object.assign(I18N.en, { adj_title:"Adjust stock", adj_choose:"Which product?", adj_what:"What happened?", adj_recount:"Recount", adj_recount_d:"Counted the shelf — set the real number", adj_loss:"Loss / damage", adj_loss_d:"Broken, lost, expired or stolen", adj_return:"Customer return", adj_return_d:"Item came back and can be sold again", adj_size:"Which size?", adj_count:"Actual count on the shelf", adj_lost:"How many to remove?", adj_back:"How many came back?", adj_note_ph:"Note (optional) — e.g. water damage, order #1042", adj_btn:"Adjust" });
Object.assign(I18N.ru, { adj_title:"Корректировка", adj_choose:"Какой товар?", adj_what:"Что случилось?", adj_recount:"Пересчёт", adj_recount_d:"Пересчитали полку — укажите реальное число", adj_loss:"Порча / потеря", adj_loss_d:"Сломано, потеряно, просрочено или украдено", adj_return:"Возврат клиента", adj_return_d:"Товар вернули, его можно снова продать", adj_size:"Какой размер?", adj_count:"Фактически на полке", adj_lost:"Сколько списать?", adj_back:"Сколько вернули?", adj_note_ph:"Заметка (необязательно) — напр. намок, заказ #1042", adj_btn:"Корректировать" });
Object.assign(I18N.uz, { adj_title:"Qoldiqni tuzatish", adj_choose:"Qaysi mahsulot?", adj_what:"Nima bo\u02bcldi?", adj_recount:"Qayta sanash", adj_recount_d:"Javonni sanadingiz — haqiqiy sonni kiriting", adj_loss:"Yo\u02bcqotish / nuqson", adj_loss_d:"Singan, yo\u02bcqolgan, muddati o\u02bctgan yoki o\u02bcg\u02bcirlangan", adj_return:"Mijoz qaytardi", adj_return_d:"Mahsulot qaytdi, yana sotish mumkin", adj_size:"Qaysi o\u02bclcham?", adj_count:"Javondagi haqiqiy son", adj_lost:"Nechtasini hisobdan chiqarish?", adj_back:"Nechta qaytdi?", adj_note_ph:"Izoh (ixtiyoriy) — masalan, namlangan, buyurtma #1042", adj_btn:"Tuzatish" });

function AdjustModal({ store, shop, product, variantId, t, lang, onClose }){
  const p = product;
  const [vid, setVid] = React.useState(variantId || p.variants[0].id);
  const [kind, setKind] = React.useState("correction");
  const v = p.variants.find(x=>x.id===vid) || p.variants[0];
  const [count, setCount] = React.useState(Math.max(0, v.qty));
  const [n, setN] = React.useState(1);
  const [note, setNote] = React.useState("");
  React.useEffect(()=>{ setCount(Math.max(0, v.qty)); setN(1); }, [vid]);

  const target = kind==="correction"? count : kind==="loss"? Math.max(0, v.qty - n) : v.qty + n;
  const delta = target - v.qty;
  const kinds = [
    ["correction", t.adj_recount, t.adj_recount_d, I.undo],
    ["loss", t.adj_loss, t.adj_loss_d, I.warn],
    ["return", t.adj_return, t.adj_return_d, I.down],
  ];
  const foot = (
    <div className="rsm-foot">
      <div className="rsm-sum"><span>{v.qty} → <b>{target}</b> {t.rs_units}</span>{delta!==0 && <i className={delta>0?"up":"down"}>{delta>0? "+"+delta : delta}</i>}</div>
      <button className="btn btn-accent" disabled={!delta} onClick={()=>{ store.setQty(shop.id, v.id, target, kind, note); toast(t.st_saved+" · "+(delta>0?"+":"")+delta); onClose(); }}>{t.adj_btn}</button>
    </div>
  );
  return (
    <Modal title={t.adj_title} onClose={onClose} foot={foot}>
      <div className="rsm-prod">
        <span className="rsm-photo"><ImageSlot id={pslot(shop.id,p,0)} src={photoURL(p.tone, pslot(shop.id,p,0), 120,120, IMG_KW[shop.type], 0)} placeholder="" style={FILL}/></span>
        <div><b>{textFB(p.name,lang)}</b><span>{fmtPrice(p.price,lang)}</span></div>
      </div>

      <div className="rsm-label">{t.adj_what}</div>
      <div className="adj-kinds">
        {kinds.map(([k,l,d,ic])=>(
          <button key={k} className={"adj-kind"+(kind===k?" on":"")} onClick={()=>{ setKind(k); setN(1); }}>
            <span className="adj-ic">{ic({width:18,height:18})}</span>
            <b>{l}</b><span>{d}</span>
          </button>
        ))}
      </div>

      {p.variants.length>1 && (
        <React.Fragment>
          <div className="rsm-label">{t.adj_size}</div>
          <div className="chip-row adj-sizes">
            {p.variants.map(x=>(
              <button key={x.id} className={"pick-chip"+(x.id===vid?" on":"")} onClick={()=>setVid(x.id)}>{vLabel(p,x,lang) || t.inv_qty} <i>{x.qty}</i></button>
            ))}
          </div>
        </React.Fragment>
      )}

      <div className="rsm-label">{kind==="correction"? t.adj_count : kind==="loss"? t.adj_lost : t.adj_back}</div>
      <div className="adj-qty">
        {kind==="correction"
          ? <Stepper value={count} min={0} onChange={setCount}/>
          : <Stepper value={n} min={1} max={kind==="loss"? Math.max(1,v.qty) : undefined} onChange={setN}/>}
        <span className="adj-now">{t.rs_onhand}: <b>{v.qty}</b></span>
      </div>

      <input className="qp-note adj-note" value={note} onChange={e=>setNote(e.target.value)} placeholder={t.adj_note_ph}/>
    </Modal>
  );
}
Object.assign(window, { AdjustModal });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { AdjustModal });
