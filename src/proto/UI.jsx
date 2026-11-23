// ===== shared UI: modal, toast, small controls =====
function toast(msg, kind){
  window.dispatchEvent(new CustomEvent("rasta-toast", { detail:{ msg, kind:kind||"ok", id:Math.random() } }));
}
function ToastHost(){
  const [items, setItems] = React.useState([]);
  React.useEffect(()=>{
    function on(e){
      const it = e.detail;
      setItems(l=>[...l, it]);
      setTimeout(()=> setItems(l=>l.filter(x=>x.id!==it.id)), 2600);
    }
    window.addEventListener("rasta-toast", on);
    return ()=> window.removeEventListener("rasta-toast", on);
  },[]);
  return (
    <div className="toast-host">
      {items.map(it=>(
        <div key={it.id} className={"toast "+it.kind}>
          {it.kind==="warn"? I.warn({width:16,height:16}) : I.check({width:16,height:16})}
          <span>{it.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, sub, onClose, children, foot, wide, tone }){
  useEscape(onClose);
  React.useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return ()=>{ document.body.style.overflow = prev; };
  },[]);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={"modal"+(wide?" wide":"")+(tone?" "+tone:"")} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h3>{title}</h3>{sub && <div className="modal-sub">{sub}</div>}</div>
          <button className="icon-btn" onClick={onClose} aria-label="close">{I.x()}</button>
        </div>
        <div className="modal-body scroll-y">{children}</div>
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  );
}

function Confirm({ title, body, cta, danger, onConfirm, onClose, needText }){
  const [txt, setTxt] = React.useState("");
  const ok = !needText || txt.trim().toLowerCase()===String(needText).trim().toLowerCase();
  return (
    <Modal title={title} onClose={onClose} tone={danger?"danger":null}
      foot={<>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>{I18N[window.__lang||"en"].g_cancel}</button>
        <div className="mf-right">
          <button className={"btn btn-sm "+(danger?"btn-danger":"btn-accent")} disabled={!ok} onClick={()=>{ onConfirm(); onClose(); }}>{cta}</button>
        </div>
      </>}>
      <p className="modal-p">{body}</p>
      {needText && <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder={needText} autoFocus/>}
    </Modal>
  );
}

function Seg({ value, onChange, options, small }){
  return (
    <div className={"seg"+(small?" seg-sm":"")}>
      {options.map(([v,lab])=>(
        <button key={v} className={value===v?"on":""} onClick={()=>onChange(v)}>{lab}</button>
      ))}
    </div>
  );
}

function Stepper({ value, onChange, min }){
  return (
    <div className="stepper" onClick={e=>e.stopPropagation()}>
      <button onClick={()=>onChange(Math.max(min!=null?min:0, value-1))} aria-label="minus">{I.minus({width:15,height:15})}</button>
      <input value={value} onChange={e=>onChange(Math.max(min!=null?min:0, Number(e.target.value.replace(/\D/g,""))||0))} inputMode="numeric"/>
      <button onClick={()=>onChange(value+1)} aria-label="plus">{I.plus({width:15,height:15})}</button>
    </div>
  );
}

// Real Code 128-B: pattern table of bar/space module widths (107 symbols + stop)
const C128 = ("212222,222122,222221,121223,121322,131222,122213,122312,132212,221213,221312,231212,112232,122132,122231,113222,"+
"123122,123221,223211,221132,221231,213212,223112,312131,311222,321122,321221,312212,322112,322211,212123,212321,232121,"+
"111323,131123,131321,112313,132113,132311,211313,231113,231311,112133,112331,132131,113123,113321,133121,313121,211331,"+
"231131,213113,213311,213131,311123,311321,331121,312113,312311,332111,314111,221411,431111,111224,111422,121124,121421,"+
"141122,141221,112214,112412,122114,122411,142112,142211,241211,221114,413111,241112,134111,111242,121142,121241,114212,"+
"124112,124211,411212,421112,421211,212141,214121,412121,111143,111341,131141,114113,114311,411113,411311,113141,114131,"+
"311141,411131,211412,211214,211232,2331112").split(",");
function code128Modules(text){
  const s = String(text || "").slice(0, 22);
  const vals = [104]; // START B
  let sum = 104;
  for(let i = 0; i < s.length; i++){
    const v = Math.min(94, Math.max(0, s.charCodeAt(i) - 32));
    vals.push(v);
    sum += v * (i + 1);
  }
  vals.push(sum % 103);
  vals.push(106); // STOP
  const out = [];
  vals.forEach(v => C128[v].split("").forEach(w => out.push(Number(w))));
  return out;
}
// visual Code-128 rendering: fixed module width, quiet zones, crisp edges
function Barcode({ code, height=34, className }){
  const mods = React.useMemo(()=>code128Modules(code), [code]);
  const quiet = 10;
  const total = mods.reduce((a,b)=>a+b, 0) + quiet * 2;
  let x = quiet;
  const bars = mods.map((w,i)=>{
    const el = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="100" fill="currentColor"/> : null;
    x += w;
    return el;
  });
  return (
    <svg className={"barcode "+(className||"")} viewBox={"0 0 "+total+" 100"} preserveAspectRatio="none"
      shapeRendering="crispEdges" style={{height, width:"100%"}} role="img" aria-label={String(code)}>
      {bars}
    </svg>
  );
}

function StatusPill({ state, t }){
  const map = { ok:["ok",t.inv_ok], low:["low",t.inv_low], out:["out",t.inv_out] };
  const [cls,lab] = map[state] || map.ok;
  return <span className={"st-pill "+cls}><i></i>{lab}</span>;
}

function EmptyState({ icon, title, body, cta }){
  return (
    <div className="empty-state">
      <div className="es-ic">{(icon||I.box)({width:26,height:26})}</div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {cta}
    </div>
  );
}

// EAN-13 / UPC-A validation (checksum)
function eanValid(code){
  const c = String(code).replace(/\D/g, "");
  if(c.length !== 13 && c.length !== 12) return false;
  const d = c.split("").map(Number);
  const check = d.pop();
  const rev = d.reverse();
  const sum = rev.reduce((n, x, i) => n + x * (i % 2 === 0 ? 3 : 1), 0);
  return ((10 - (sum % 10)) % 10) === check;
}
function Info({ text }){
  const [on, setOn] = React.useState(false);
  return (
    <span className="info-wrap">
      <button className="info-btn" aria-label="info" onClick={()=>setOn(o=>!o)} onMouseEnter={()=>setOn(true)} onMouseLeave={()=>setOn(false)}>?</button>
      {on && <span className="info-pop">{text}</span>}
    </span>
  );
}

Object.assign(window, { toast, ToastHost, Modal, Confirm, Seg, Stepper, Barcode, StatusPill, EmptyState, eanValid, Info, code128Modules });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { toast, ToastHost, Modal, Confirm, Seg, Stepper, C128, code128Modules, Barcode, StatusPill, EmptyState, eanValid, Info });
