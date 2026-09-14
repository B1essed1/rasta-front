import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import { t, fill, getLang, onLangChange } from '../../i18n';
import { I } from '../../components/ui/Icons';
import { useShopStore } from '../../store/shopStore';
import { toast } from '../../components/ui/ToastHost';
import { CategoryCascade, SpecFields, VariantChooser } from '../../components/ui/Attributes';
import QtyStepper from '../../components/ui/QtyStepper';
import PhotoSlot from '../../components/ui/PhotoSlot';
import {
  variantAttrs,
  combineOptions,
  optionsKey,
  variantLabel,
  catSlug,
  leavesForShop,
} from '../../data/taxonomy';

const PRODUCT_IMAGES = 4;
const LANGS = ['uz', 'ru', 'en'];
const LANG_LABEL = { uz: 'UZ', ru: 'RU', en: 'EN' };  // design I18N._label

// Per-language example name, as the design's ProductModal shows.
const NAME_PLACEHOLDER = {
  uz: 'Sahar zig‘ir ko‘ylagi',
  ru: 'Льняное платье',
  en: 'Sahar linen dress',
};
const CURRENCY = { en: 'soʼm', ru: 'сум', uz: 'soʼm' };

function fmtPrice(n, lang) {
  return (
    Number(n || 0)
      .toLocaleString('ru-RU')
      .replace(/[,  ]/g, ' ') +
    ' ' +
    (CURRENCY[lang] || CURRENCY.en)
  );
}

// Design: margin = (price - cost) / price, shown as a whole percent.
function marginPct(price, cost) {
  if (!price || !cost) return 0;
  return Math.round(((price - cost) / price) * 100);
}

// EAN-8/13 checksum, as the design validates scanned codes.
function eanValid(digits) {
  const d = String(digits).split('').map(Number);
  if (d.length !== 8 && d.length !== 13) return false;
  const check = d.pop();
  let sum = 0;
  d.reverse().forEach((n, i) => { sum += n * (i % 2 === 0 ? 3 : 1); });
  return (10 - (sum % 10)) % 10 === check;
}

function nextBarcode(shopId) {
  return 'RS-' + String(shopId || '').slice(0, 4).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

// Parse the variant options the API stores as a JSON string.
function parseOptions(v) {
  if (v && v.options && typeof v.options === 'object') return v.options;
  try { return JSON.parse(v.optionsJson || '{}') || {}; } catch { return {}; }
}

export default function ProductModal({ open, onClose, product }) {
  const [, setTick] = useState(0);
  const lang = getLang();
  const shop = useShopStore((s) => s.shop);
  const createProduct = useShopStore((s) => s.createProduct);
  const updateProduct = useShopStore((s) => s.updateProduct);
  const syncProductImages = useShopStore((s) => s.syncProductImages);

  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [al, setAl] = useState(lang);
  const [names, setNames] = useState({ en: '', ru: '', uz: '' });
  const [descs, setDescs] = useState({ en: '', ru: '', uz: '' });
  const [price, setPrice] = useState('');
  const [costs, setCosts] = useState({});
  const [catId, setCatId] = useState('');
  const [specs, setSpecs] = useState({});
  const [chosen, setChosen] = useState({});
  const [qty, setQty] = useState({});
  const [codes, setCodes] = useState({});
  const [visible, setVisible] = useState(true);
  const [photos, setPhotos] = useState([]);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);

  // Reset / hydrate whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    const firstLeaf = leavesForShop(shop?.id, shop?.type)[0] || '';
    if (!product) {
      setAl(getLang());
      setNames({ en: '', ru: '', uz: '' });
      setDescs({ en: '', ru: '', uz: '' });
      setPrice('');
      setCosts({});
      setCatId(firstLeaf);
      setSpecs({});
      setChosen({});
      setQty({});
      setCodes({});
      setVisible(true);
      setPhotos([]);
      return;
    }
    const vs = product.variants || [];
    setAl(getLang());
    setNames({ en: product.nameEn || '', ru: product.nameRu || '', uz: product.nameUz || '' });
    setDescs({ en: product.descEn || '', ru: product.descRu || '', uz: product.descUz || '' });
    setPrice(product.price != null ? String(product.price) : '');
    setCatId(product.catId || firstLeaf);
    setVisible(product.visible !== false);
    setPhotos((product.images || []).map((im) => im.url).slice(0, PRODUCT_IMAGES));

    const c = {}; const q = {}; const b = {};
    vs.forEach((v) => {
      const key = optionsKey(parseOptions(v)) || 'default';
      c[key] = v.avgCost != null ? String(v.avgCost) : '';
      q[key] = v.qty || 0;
      b[key] = v.barcode || '';
    });
    setCosts(c); setQty(q); setCodes(b);

    // Re-derive which attribute values this product is offered in.
    const picked = {};
    variantAttrs(product.catId).forEach((a) => {
      const seen = [];
      vs.forEach((v) => {
        const x = parseOptions(v)[a.id];
        if (x && !seen.includes(x)) seen.push(x);
      });
      if (seen.length) picked[a.id] = seen;
    });
    setChosen(picked);
  }, [open, product, shop]);

  const vAttrs = variantAttrs(catId);
  const combos = useMemo(() => combineOptions(catId, chosen), [catId, chosen]);
  const comboKeys = combos.map((o) => optionsKey(o) || 'default');
  const hasVars = vAttrs.length > 0 && combos.length > 1;

  const costVals = comboKeys.map((k) => costs[k] || '');
  const mixedCost = costVals.some((v) => v !== costVals[0]);
  const costed = costVals.filter((v) => Number(v) > 0).map(Number);
  const repCost = costed.length ? Math.round(costed.reduce((a, b) => a + b, 0) / costed.length) : 0;

  const anyName = LANGS.some((l) => (names[l] || '').trim());
  const ready = anyName && Number(price) > 0;

  async function save() {
    if (!ready || saving) return;
    setSaving(true);
    const fb = (names[al] || names.en || names.ru || names.uz || '').trim();
    const payload = {
      catId,
      nameEn: (names.en || '').trim() || fb,
      nameRu: (names.ru || '').trim() || fb,
      nameUz: (names.uz || '').trim() || fb,
      descEn: (descs.en || '').trim(),
      descRu: (descs.ru || '').trim(),
      descUz: (descs.uz || '').trim(),
      price: Number(price) || 0,
      visible,
      variants: combos.map((options) => {
        const key = optionsKey(options) || 'default';
        const old = (product?.variants || []).find(
          (v) => (optionsKey(parseOptions(v)) || 'default') === key
        );
        const raw = costs[key];
        return {
          id: old ? old.id : undefined,
          optionsJson: JSON.stringify(options || {}),
          barcode: (codes[key] || '').trim() || null,
          qty: Number(qty[key]) || 0,
          avgCost: raw === '' || raw == null ? null : Number(raw),
          threshold: old?.threshold ?? null,
        };
      }),
    };
    try {
      let saved;
      if (product?.id) saved = await updateProduct(product.id, payload);
      else saved = await createProduct(payload);

      // Photos live on their own endpoint, so reconcile them after the product exists.
      const id = saved?.id || product?.id;
      if (id) {
        const before = product?.images || [];
        const keep = new Set(photos.filter(Boolean));
        const removeIds = before.filter((im) => !keep.has(im.url)).map((im) => im.id);
        const existing = new Set(before.map((im) => im.url));
        const add = photos.filter((u) => u && !existing.has(u)).map((url) => ({ url }));
        if (add.length || removeIds.length) {
          await syncProductImages(id, { add, removeIds });
        }
      }
      toast(t('pr_saved'), 'success');
      onClose();
    } catch (err) {
      toast(err.serverMessage || err.response?.data?.message || 'Error', 'error');
    }
    setSaving(false);
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      wide
      title={isEdit ? t('db_edit') : t('db_add')}
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{t('g_cancel')}</button>
          <div className="mf-right">
            <button className="btn btn-accent btn-sm" disabled={!ready || saving} onClick={save}>
              {I.check({ width: 16, height: 16 })} {t('g_save')}
            </button>
          </div>
        </>
      }
    >
      {/* ---- photos ---- */}
      <div className="field">
        <label>{t('db_photos')}</label>
        <div className="img-uploader">
          {Array.from({ length: PRODUCT_IMAGES }).map((_, i) => (
            <div key={i} className={'img-cell' + (i === 0 ? ' main' : '')}>
              <PhotoSlot
                url={photos[i] || null}
                placeholder={i === 0 ? t('db_cover') : t('db_drop')}
                onUploaded={(u) => setPhotos((s) => { const o = s.slice(); o[i] = u; return o; })}
                onClear={() => setPhotos((s) => { const o = s.slice(); o[i] = null; return o; })}
              />
              {i === 0 && <span className="img-tag">{t('db_cover')}</span>}
            </div>
          ))}
        </div>
        <div className="hint">{t('db_photos_hint')}</div>
      </div>

      {/* ---- name + description, one field per language tab ---- */}
      <div className="field">
        <label>{t('db_details')}</label>
        <div className="lang-tabs">
          {LANGS.map((l) => (
            <button key={l} className={'lang-tab' + (al === l ? ' on' : '')} onClick={() => setAl(l)}>
              {LANG_LABEL[l]}
              <span className={'lt-st' + ((names[l] || '').trim() ? ' ok' : '')}>
                {(names[l] || '').trim() ? I.check({ width: 11, height: 11 }) : null}
              </span>
            </button>
          ))}
        </div>
        <input
          value={names[al] || ''}
          onChange={(e) => setNames((s) => ({ ...s, [al]: e.target.value }))}
          placeholder={NAME_PLACEHOLDER[al] || NAME_PLACEHOLDER.en}
          autoFocus
        />
        <textarea
          style={{ marginTop: 10 }}
          value={descs[al] || ''}
          onChange={(e) => setDescs((s) => ({ ...s, [al]: e.target.value }))}
          placeholder={t('db_desc_lbl')}
        />
      </div>

      {/* ---- selling price + cost ---- */}
      <div className="field-row">
        <div className="field">
          <label>{t('pr_price_sell')}</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            placeholder="590000"
            inputMode="numeric"
          />
          <div className="hint">{t('pr_price_sell_d')}</div>
        </div>
        <div className="field">
          <label>{hasVars ? t('rs_same_cost') : t('pr_cost_buy')}</label>
          <input
            value={mixedCost ? '' : costs[comboKeys[0]] || ''}
            placeholder={mixedCost ? '—' : '340000'}
            inputMode="numeric"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              const o = {};
              comboKeys.forEach((k) => { o[k] = v; });
              setCosts((s) => ({ ...s, ...o }));
            }}
          />
          <div className="hint">{hasVars ? t('rs_per_size') : t('pr_cost_buy_d')}</div>
        </div>
      </div>

      {Number(price) > 0 && (
        <div className={'margin-strip' + (repCost > 0 ? '' : ' empty')}>
          {repCost > 0 ? (
            <>
              <div className="ms-block">
                <span>{t('pr_margin_now')}{mixedCost ? ' · ' + t('rs_costed_only') : ''}</span>
                <b>{marginPct(Number(price), repCost)}%</b>
              </div>
              <div className="ms-sep" />
              <div className="ms-block wide">
                <span>{fmtPrice(Number(price), lang)} − {fmtPrice(repCost, lang)}</span>
                <b>{fill(t('pr_profit_each'), { v: fmtPrice(Number(price) - repCost, lang) })}</b>
              </div>
            </>
          ) : (
            <div className="ms-block wide"><b>{t('pr_cost_note')}</b></div>
          )}
        </div>
      )}

      <CategoryCascade
        value={catId}
        lang={lang}
        onChange={(id) => { setCatId(id); setChosen({}); setSpecs({}); }}
      />
      <SpecFields catId={catId} specs={specs} setSpecs={setSpecs} lang={lang} />
      <VariantChooser catId={catId} chosen={chosen} setChosen={setChosen} combos={combos} lang={lang} />

      {/* ---- per-variant stock + barcode ---- */}
      <div className="field">
        <label>{t('pr_stock_head')}</label>
        <div className="hint" style={{ marginTop: -2, marginBottom: 9 }}>{t('pr_cost_note')}</div>
        <div className="var-qty">
          {combos.length === 0 && <div className="hint">{t('pr_values')}</div>}
          {combos.map((options) => {
            const key = optionsKey(options) || 'default';
            const shown = variantLabel(catId, options, lang) || t('inv_qty');
            const code = codes[key] || '';
            const digits = code.replace(/\D/g, '');
            const eanish = digits.length >= 12 && digits.length === code.length;
            const bad = eanish && !eanValid(digits);
            const auto = /^RS-/.test(code);
            return (
              <div key={key} className="vq-row">
                <div className="vq-top">
                  <b>{shown}</b>
                  <input
                    className="vq-cost"
                    value={costs[key] || ''}
                    inputMode="numeric"
                    placeholder={t('pr_cost_buy')}
                    onChange={(e) => setCosts((s) => ({ ...s, [key]: e.target.value.replace(/\D/g, '') }))}
                  />
                  <QtyStepper
                    value={Number(qty[key]) || 0}
                    min={0}
                    onChange={(n) => setQty((s) => ({ ...s, [key]: n }))}
                  />
                </div>
                <div className="vq-bc-row">
                  <span className="vq-bc-ic">{I.barcode({ width: 15, height: 15 })}</span>
                  <input
                    className="vq-bc-in"
                    value={code}
                    placeholder={t('bc_scan_in')}
                    onChange={(e) => setCodes((s) => ({ ...s, [key]: e.target.value.toUpperCase() }))}
                  />
                  {code ? (
                    <button className="vq-bc-act" onClick={() => setCodes((s) => ({ ...s, [key]: '' }))}>
                      {I.x({ width: 14, height: 14 })}
                    </button>
                  ) : (
                    <button className="vq-bc-act gen" onClick={() => setCodes((s) => ({ ...s, [key]: nextBarcode(shop?.id) }))}>
                      {I.spark({ width: 13, height: 13 })} {t('bc_generate')}
                    </button>
                  )}
                </div>
                {code && (
                  <div className={'vq-bc-st' + (bad ? ' bad' : '')}>
                    {bad ? (
                      <>{I.warn({ width: 13, height: 13 })} {t('inv_bc_bad')}</>
                    ) : auto ? (
                      <>{I.check({ width: 13, height: 13 })} {t('bc_generated')}</>
                    ) : (
                      <>{I.check({ width: 13, height: 13 })} {eanish ? t('inv_bc_ok') : t('bc_factory')}</>
                    )}
                  </div>
                )}
                {!code && <div className="vq-bc-st muted">{t('bc_free')}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="switch-row">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          <span className="switch"><i /></span>
          {t('pr_visible')}
        </label>
      </div>
    </Modal>
  );
}
