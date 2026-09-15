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
  attrValueName,
  attrValueHex,
} from '../../data/taxonomy';

const PRODUCT_IMAGES_MIN = 4;
const PRODUCT_IMAGES_MAX = 6;
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

function VariantRow({ optKey, options, catId, lang, costs, setCosts, defaultCost, qty, setQty, codes, setCodes, shopId, showLabel, hideColor }) {
  const label = variantLabel(catId, options, lang) || '';
  const displayLabel = hideColor
    ? Object.entries(options).filter(([k]) => k !== hideColor).map(([k, v]) => attrValueName(k, v, lang)).join(' · ')
    : label;
  const code = codes[optKey] || '';
  const digits = code.replace(/\D/g, '');
  const eanish = digits.length >= 12 && digits.length === code.length;
  const bad = eanish && !eanValid(digits);
  const auto = /^RS-/.test(code);

  return (
    <div className="vq-row">
      <div className="vq-top">
        <b>{showLabel ? displayLabel : ''}</b>
        <input
          className="vq-cost"
          value={costs[optKey] || ''}
          inputMode="numeric"
          placeholder={defaultCost || t('pr_cost_buy')}
          onChange={(e) => setCosts((s) => ({ ...s, [optKey]: e.target.value.replace(/\D/g, '') }))}
        />
        <QtyStepper
          value={Number(qty[optKey]) || 0}
          min={0}
          onChange={(n) => setQty((s) => ({ ...s, [optKey]: n }))}
        />
      </div>
      <div className="vq-bc-row">
        <span className="vq-bc-ic">{I.barcode({ width: 15, height: 15 })}</span>
        <input
          className="vq-bc-in"
          value={code}
          placeholder={t('bc_scan_in')}
          onChange={(e) => setCodes((s) => ({ ...s, [optKey]: e.target.value.toUpperCase() }))}
        />
        {code ? (
          <button type="button" className="vq-bc-act" onClick={() => setCodes((s) => ({ ...s, [optKey]: '' }))}>
            {I.x({ width: 14, height: 14 })}
          </button>
        ) : (
          <button type="button" className="vq-bc-act gen" onClick={() => setCodes((s) => ({ ...s, [optKey]: nextBarcode(shopId) }))}>
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
  const [defaultCost, setDefaultCost] = useState('');
  const [costs, setCosts] = useState({});
  const [catId, setCatId] = useState('');
  const [specs, setSpecs] = useState({});
  const [chosen, setChosen] = useState({});
  const [qty, setQty] = useState({});
  const [codes, setCodes] = useState({});
  const [visible, setVisible] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [colorPhotos, setColorPhotos] = useState({});

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
      setDefaultCost('');
      setCosts({});
      setCatId(firstLeaf);
      setSpecs({});
      setChosen({});
      setQty({});
      setCodes({});
      setVisible(true);
      setPhotos([]);
      setColorPhotos({});
      return;
    }
    const vs = product.variants || [];
    setAl(getLang());
    setNames({ en: product.nameEn || '', ru: product.nameRu || '', uz: product.nameUz || '' });
    setDescs({ en: product.descEn || '', ru: product.descRu || '', uz: product.descUz || '' });
    setPrice(product.price != null ? String(product.price) : '');
    setCatId(product.catId || firstLeaf);
    setVisible(product.visible !== false);
    const allImgs = product.images || [];
    setPhotos(allImgs.filter(im => !im.variantId).map((im) => im.url).slice(0, PRODUCT_IMAGES_MAX));

    // Hydrate per-variant photos: group by colour → array of urls
    const cp = {};
    const swAttr = variantAttrs(product.catId).find(a => a.swatch);
    if (swAttr) {
      vs.forEach(v => {
        const opts = parseOptions(v);
        const colorId = opts[swAttr.id];
        if (!colorId) return;
        if (!cp[colorId]) cp[colorId] = [];
        allImgs.filter(im => im.variantId === v.id).forEach(im => {
          if (!cp[colorId].includes(im.url)) cp[colorId].push(im.url);
        });
      });
    }
    setColorPhotos(cp);

    const c = {}; const q = {}; const b = {};
    vs.forEach((v) => {
      const key = optionsKey(parseOptions(v)) || 'default';
      c[key] = v.avgCost != null ? String(v.avgCost) : '';
      q[key] = v.qty || 0;
      b[key] = v.barcode || '';
    });
    setCosts(c); setQty(q); setCodes(b);
    const costVals = Object.values(c).filter(Boolean);
    const allSame = costVals.length > 0 && costVals.every(v => v === costVals[0]);
    setDefaultCost(allSame ? costVals[0] : '');

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

  const costVals = comboKeys.map((k) => costs[k] || defaultCost || '');
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
        const raw = costs[key] || defaultCost;
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
        const before = (product?.images || []).filter(im => !im.variantId);
        const keep = new Set(photos.filter(Boolean));
        const removeIds = before.filter((im) => !keep.has(im.url)).map((im) => im.id);
        const existing = new Set(before.map((im) => im.url));
        const add = photos.filter((u) => u && !existing.has(u)).map((url) => ({ url }));

        // Per-colour variant photos (each colour can have up to 4 images)
        const savedVariants = saved?.variants || product?.variants || [];
        const swAttr = variantAttrs(catId).find(a => a.swatch);
        const beforeVar = (product?.images || []).filter(im => im.variantId);
        const varRemoveIds = beforeVar.filter(im => {
          const v = savedVariants.find(sv => sv.id === im.variantId);
          if (!v || !swAttr) return true;
          const opts = parseOptions(v);
          const cid = opts[swAttr.id];
          if (!cid) return true;
          const kept = (colorPhotos[cid] || []).filter(Boolean);
          return !kept.includes(im.url);
        }).map(im => im.id);

        const varAdd = [];
        if (swAttr) {
          const existingVarUrls = new Set(beforeVar.map(im => im.url));
          Object.entries(colorPhotos).forEach(([cid, urls]) => {
            const matchingVariant = savedVariants.find(v => {
              const opts = parseOptions(v);
              return opts[swAttr.id] === cid;
            });
            if (!matchingVariant) return;
            (urls || []).filter(Boolean).forEach(url => {
              if (!existingVarUrls.has(url)) {
                varAdd.push({ url, variantId: matchingVariant.id });
              }
            });
          });
        }

        const allAdd = [...add, ...varAdd];
        const allRemove = [...removeIds, ...varRemoveIds];
        if (allAdd.length || allRemove.length) {
          await syncProductImages(id, { add: allAdd, removeIds: allRemove });
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
      {/* ---- photos (only when no colour variants) ---- */}
      {!vAttrs.find(a => a.swatch) || !(chosen[vAttrs.find(a => a.swatch)?.id] || []).length ? (
        <div className="field">
          <label>{t('db_photos')}</label>
          <div className="img-uploader">
            {Array.from({ length: Math.min(PRODUCT_IMAGES_MAX, Math.max(PRODUCT_IMAGES_MIN, photos.filter(Boolean).length + 1)) }).map((_, i) => (
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
      ) : null}

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
            value={defaultCost}
            placeholder="340000"
            inputMode="numeric"
            onChange={(e) => {
              setDefaultCost(e.target.value.replace(/\D/g, ''));
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

      {/* ---- per-variant stock + barcode, grouped by colour ---- */}
      <div className="field">
        <label>{t('pr_stock_head')}</label>
        <div className="hint" style={{ marginTop: -2, marginBottom: 9 }}>{t('pr_cost_note')}</div>
        <div className="var-qty">
          {combos.length === 0 && <div className="hint">{t('pr_values')}</div>}
          {(() => {
            const sw = vAttrs.find(a => a.swatch);
            const colors = sw ? (chosen[sw.id] || []) : [];
            const hasColorGroups = colors.length > 0;

            if (!hasColorGroups) {
              return combos.map((options) => {
                const key = optionsKey(options) || 'default';
                return <VariantRow key={key} optKey={key} options={options} catId={catId} lang={lang}
                  costs={costs} setCosts={setCosts} defaultCost={defaultCost}
                  qty={qty} setQty={setQty} codes={codes} setCodes={setCodes} shopId={shop?.id}
                  showLabel={combos.length > 1} />;
              });
            }

            return colors.map(cid => {
              const colorCombos = combos.filter(o => o[sw.id] === cid);
              const cPhotos = colorPhotos[cid] || [];
              return (
                <div key={cid} className="vq-color-group">
                  <div className="vq-color-head">
                    <i style={{ background: attrValueHex(sw.id, cid) || '#ccc', width: 16, height: 16, borderRadius: '50%', display: 'inline-block', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)', flexShrink: 0 }} />
                    <b>{attrValueName(sw.id, cid, lang)}</b>
                    <span className="vq-color-count">{cPhotos.filter(Boolean).length}/{PRODUCT_IMAGES_MAX} {t('db_photos').toLowerCase()}</span>
                  </div>
                  <div className="img-uploader img-uploader--sm">
                    {Array.from({ length: Math.min(PRODUCT_IMAGES_MAX, Math.max(PRODUCT_IMAGES_MIN, cPhotos.filter(Boolean).length + 1)) }).map((_, i) => (
                      <div key={`${cid}-${i}`} className="img-cell">
                        <PhotoSlot
                          url={cPhotos[i] || null}
                          placeholder={i === 0 ? t('db_cover') : t('db_drop')}
                          onUploaded={(u) => setColorPhotos(s => {
                            const arr = (s[cid] || []).slice(); arr[i] = u; return { ...s, [cid]: arr };
                          })}
                          onClear={() => setColorPhotos(s => {
                            const arr = (s[cid] || []).slice(); arr[i] = null; return { ...s, [cid]: arr };
                          })}
                        />
                      </div>
                    ))}
                  </div>
                  {colorCombos.map(options => {
                    const key = optionsKey(options) || 'default';
                    return <VariantRow key={key} optKey={key} options={options} catId={catId} lang={lang}
                      costs={costs} setCosts={setCosts} defaultCost={defaultCost}
                      qty={qty} setQty={setQty} codes={codes} setCodes={setCodes} shopId={shop?.id}
                      showLabel={colorCombos.length > 1} hideColor={sw.id} />;
                  })}
                </div>
              );
            });
          })()}
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
