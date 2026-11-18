import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange, fill } from '../../i18n';
import { useShopStore, DEFAULT_THRESHOLD } from '../../store/shopStore';
import { shopTypes as fallbackShopTypes, cities, fetchShopTypes, getCategoryName } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';
import { I } from '../../components/ui/Icons';
import Modal from '../../components/ui/Modal';
import QtyStepper from '../../components/ui/QtyStepper';

/* ------------------------------------------------------------------ */
/*  Cover image upload                                                 */
/* ------------------------------------------------------------------ */
function CoverUpload({ currentUrl, onUpload }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const uploadImage = useShopStore((s) => s.uploadImage);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onUpload(url);
    } catch {
      toast('Upload failed', 'error');
    }
    setUploading(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      style={{
        position: 'relative',
        aspectRatio: '16/5',
        borderRadius: 14,
        border: '1.5px dashed var(--line, #e7e0d5)',
        background: 'var(--paper, #f6f3ee)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      {currentUrl ? (
        <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--faint, #9a9085)', fontSize: 13 }}>
          {I.plus({ width: 20, height: 20 })}
          <div style={{ marginTop: 4 }}>{uploading ? t('loading') : t('ob_cover')}</div>
        </div>
      )}
      {currentUrl && (
        <div
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: '.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{t('db_edit')}</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo / avatar upload                                               */
/* ------------------------------------------------------------------ */
function LogoUpload({ currentUrl, onUpload, onRemove }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const uploadImage = useShopStore((s) => s.uploadImage);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onUpload(url);
    } catch {
      toast('Upload failed', 'error');
    }
    setUploading(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
          border: '1.5px dashed var(--line, #e7e0d5)', background: 'var(--paper, #f6f3ee)',
          cursor: 'pointer', overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--faint, #9a9085)', fontSize: 11 }}>
            {I.plus({ width: 16, height: 16 })}
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          {t('ob_logo')} / profile photo
        </div>
        <div className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
          PNG, JPG &middot; min 200&times;200
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-sm"
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
          >
            {uploading ? t('loading') : t('ob_upload')}
          </button>
          {currentUrl && (
            <button
              className="btn btn-sm"
              type="button"
              onClick={onRemove}
              style={{ color: 'var(--faint)' }}
            >
              {t('db_delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Language tabs for tagline                                          */
/* ------------------------------------------------------------------ */
const LANGS = ['uz', 'ru', 'en'];

function LangTabs({ tagline, onChange }) {
  const [activeLang, setActiveLang] = useState('uz');

  function setVal(lang, val) {
    onChange({ ...tagline, [lang]: val });
  }

  return (
    <div className="field">
      <label>{t('st_tagline')}</label>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            className={`btn btn-sm${activeLang === l ? ' btn-accent' : ''}`}
            style={{ minWidth: 40, textTransform: 'uppercase', fontSize: 12, fontWeight: 700 }}
            onClick={() => setActiveLang(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <input
        value={tagline[activeLang] || ''}
        onChange={(e) => setVal(activeLang, e.target.value)}
        placeholder={t('st_tagline') + ` (${activeLang.toUpperCase()})`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Location settings with map                                         */
/* ------------------------------------------------------------------ */
const CITY_GEO = {
  Toshkent: [41.2995, 69.2401], Samarqand: [39.6542, 66.9597],
  Buxoro: [39.7747, 64.4286], Andijon: [40.7821, 72.3442],
  Namangan: [40.9983, 71.6726], "Farg'ona": [40.3842, 71.7843],
  Nukus: [42.4600, 59.6166], Qarshi: [38.8606, 65.7890],
};

function parseMapLink(s) {
  s = decodeURIComponent(s || '');
  let m;
  if ((m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/))) return [+m[1], +m[2]];
  if ((m = s.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/))) return [+m[1], +m[2]];
  if ((m = s.match(/[?&](?:pt|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/))) return [+m[2], +m[1]];
  if ((m = s.match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/))) return [+m[1], +m[2]];
  return null;
}

function LocationSection({ form, set }) {
  const [hasLocation, setHasLocation] = useState(!!form.address);
  const [mapLink, setMapLink] = useState('');
  const [lat, setLat] = useState(() => {
    if (form.mapLat) return form.mapLat;
    const c = CITY_GEO[form.location] || CITY_GEO.Toshkent;
    return c[0];
  });
  const [lng, setLng] = useState(() => {
    if (form.mapLng) return form.mapLng;
    const c = CITY_GEO[form.location] || CITY_GEO.Toshkent;
    return c[1];
  });
  const [searching, setSearching] = useState(false);

  function setPin(newLat, newLng) {
    setLat(newLat);
    setLng(newLng);
    set('mapLat', newLat);
    set('mapLng', newLng);
  }

  function applyLink(v) {
    setMapLink(v);
    if (!v.trim()) return;
    const ll = parseMapLink(v);
    if (ll) {
      setPin(ll[0], ll[1]);
      toast(t('db_saved'));
      setMapLink('');
    }
  }

  function handleLinkBlur() {
    if (mapLink.trim() && !parseMapLink(mapLink)) {
      toast('Could not read location from link', 'error');
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPin(+p.coords.latitude.toFixed(6), +p.coords.longitude.toFixed(6));
        toast(t('db_saved'));
      },
      () => toast('Location access denied', 'error')
    );
  }

  async function searchAddress() {
    const query = [form.address, form.location].filter(Boolean).join(', ');
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setPin(+data[0].lat, +data[0].lon);
        toast(t('db_saved'));
      } else {
        toast('Address not found', 'error');
      }
    } catch {
      toast('Search failed', 'error');
    }
    setSearching(false);
  }

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006},${lat - 0.004},${lng + 0.006},${lat + 0.004}&layer=mapnik&marker=${lat},${lng}`;
  const yandexUrl = `https://yandex.uz/maps/?pt=${lng},${lat}&z=16&l=map`;

  return (
    <div className="set-card">
      <div className="set-title">{t('ob_city')}</div>
      <div className="hint" style={{ marginTop: -6 }}>
        Where customers can find you or pick up orders.
      </div>
      <label className="switch-row" style={{ marginTop: 8, marginBottom: 12 }}>
        <input type="checkbox" checked={hasLocation} onChange={(e) => setHasLocation(e.target.checked)} />
        <span className="switch"><i /></span>
        I have a shop or pickup point
      </label>

      {hasLocation && (
        <>
          <div className="field-row">
            <div className="field">
              <label>Address</label>
              <input
                value={form.address || ''}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Street, building number"
              />
            </div>
            <div className="field">
              <label>Landmark</label>
              <input
                value={form.landmark || ''}
                onChange={(e) => set('landmark', e.target.value)}
                placeholder="e.g. next to Korzinka, opposite metro"
              />
            </div>
          </div>

          <div className="field">
            <label>Map pin</label>
            <div style={{
              width: '100%', height: 200, borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--line, #e7e0d5)', marginBottom: 10,
            }}>
              <iframe
                key={`${lat}-${lng}`}
                title="map"
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 0 }}
                loading="lazy"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-soft btn-sm" type="button" onClick={searchAddress} disabled={searching}>
                {I.search({ width: 14, height: 14 })} {searching ? '...' : 'Find on map'}
              </button>
              <button className="btn btn-soft btn-sm" type="button" onClick={useMyLocation}>
                {I.globe({ width: 14, height: 14 })} My location
              </button>
              <a href={yandexUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                Open Yandex Maps
              </a>
            </div>
            <div style={{ marginTop: 8 }}>
              <input
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                onBlur={handleLinkBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(mapLink); } }}
                placeholder="Or paste a Google / Yandex Maps link here"
                style={{ width: '100%' }}
              />
              {mapLink.trim() && (
                <button className="btn btn-accent btn-sm" type="button" style={{ marginTop: 6 }} onClick={() => applyLink(mapLink)}>
                  Apply link
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment method chips                                               */
/* ------------------------------------------------------------------ */
const PAY_METHODS = [
  { id: 'cash', key: 'st_pay_cash' },
  { id: 'card', key: 'st_pay_card' },
  { id: 'transfer', key: 'st_pay_transfer' },
];

function PaymentChips({ value, onChange }) {
  const selected = (value || '').split(',').filter(Boolean);

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange(next.join(','));
  }

  return (
    <div className="chip-row">
      {PAY_METHODS.map((m) => {
        const on = selected.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            className={`pick-chip${on ? ' on' : ''}`}
            onClick={() => toggle(m.id)}
          >
            {t(m.key)}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete shop confirmation modal                                     */
/* ------------------------------------------------------------------ */
function DeleteShopModal({ open, onClose, shopName, onConfirm }) {
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const matches = typed === shopName;

  async function handleDelete() {
    if (!matches) return;
    setDeleting(true);
    try {
      await onConfirm();
    } catch {
      toast('Error', 'error');
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('st_delete')}>
      <div style={{ marginBottom: 12 }}>
        <div className="hint" style={{ marginBottom: 16, fontSize: 14 }}>{t('st_delete_d')}</div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
          {fill(t('st_delete_confirm'), { name: shopName })}
        </label>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={shopName}
          autoFocus
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-sm" type="button" onClick={onClose}>
          {t('cancel')}
        </button>
        <button
          className="btn btn-danger btn-sm"
          type="button"
          disabled={!matches || deleting}
          onClick={handleDelete}
        >
          {I.trash({ width: 15, height: 15 })} {deleting ? t('loading') : t('st_delete')}
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function SettingsView() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const shop = useShopStore((s) => s.shop);
  const updateShop = useShopStore((s) => s.updateShop);
  const fetchShop = useShopStore((s) => s.fetchShop);
  const setShopStatus = useShopStore((s) => s.setShopStatus);
  const deleteShop = useShopStore((s) => s.deleteShop);
  const checkHandle = useShopStore((s) => s.checkHandle);

  const [form, setForm] = useState({
    name: '',
    handle: '',
    type: '',
    location: '',
    telegram: '',
    instagram: '',
    phone: '',
    coverColor: '',
    logoUrl: '',
    coverUrl: '',
    tagline: { uz: '', ru: '', en: '' },
    status: 'LIVE',
    deliveryNote: '',
    acceptedPayments: '',
    defaultThreshold: DEFAULT_THRESHOLD,
    showSoldOut: true,
  });
  const [saving, setSaving] = useState(false);
  const [shopTypes, setShopTypes] = useState(fallbackShopTypes);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle availability check state
  const [handleStatus, setHandleStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const handleTimerRef = useRef(null);
  const originalHandle = useRef('');

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => { fetchShopTypes().then(setShopTypes); }, []);

  useEffect(() => {
    if (shop) {
      const h = shop.handle || '';
      originalHandle.current = h;
      setForm({
        name: shop.name || '',
        handle: h,
        type: shop.type || '',
        location: shop.location || '',
        telegram: shop.telegram || '',
        instagram: shop.instagram || '',
        phone: shop.phone || '',
        coverColor: shop.coverColor || '',
        logoUrl: shop.logoUrl || '',
        coverUrl: shop.coverUrl || '',
        tagline: shop.tagline || { uz: '', ru: '', en: '' },
        status: shop.status || 'LIVE',
        address: shop.address || '',
        landmark: shop.landmark || '',
        mapLat: shop.mapLat || null,
        mapLng: shop.mapLng || null,
        deliveryNote: shop.deliveryNote || '',
        acceptedPayments: shop.acceptedPayments || '',
        defaultThreshold: shop.defaultThreshold != null ? shop.defaultThreshold : DEFAULT_THRESHOLD,
        showSoldOut: shop.showSoldOut != null ? shop.showSoldOut : true,
      });
      setHandleStatus(null);
    }
  }, [shop]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Debounced handle availability check
  const onHandleChange = useCallback((raw) => {
    const val = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    set('handle', val);

    // Clear any pending timer
    if (handleTimerRef.current) clearTimeout(handleTimerRef.current);

    // If same as original, no check needed
    if (val === originalHandle.current) {
      setHandleStatus(null);
      return;
    }

    // Must be at least 3 chars
    if (val.length < 3) {
      setHandleStatus(null);
      return;
    }

    setHandleStatus('checking');
    handleTimerRef.current = setTimeout(async () => {
      const result = await checkHandle(val);
      // Only update if handle hasn't changed since we started
      setForm((f) => {
        if (f.handle === val) {
          setHandleStatus(result.available ? 'available' : 'taken');
        }
        return f;
      });
    }, 300);
  }, [checkHandle]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (handleTimerRef.current) clearTimeout(handleTimerRef.current);
    };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (handleStatus === 'taken') {
      toast(t('st_slug_taken'), 'error');
      return;
    }
    setSaving(true);
    try {
      await updateShop(form);
      if (shop?.id) await fetchShop(shop.id);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setSaving(false);
  }

  async function toggleStatus() {
    const next = form.status === 'LIVE' ? 'PAUSED' : 'LIVE';
    set('status', next);
    try {
      await setShopStatus(next);
      if (shop?.id) await fetchShop(shop.id);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
  }

  async function handleDeleteShop() {
    await deleteShop();
    setShowDeleteModal(false);
    navigate('/onboarding');
  }

  const isLive = form.status === 'LIVE';

  // Format trial end date
  const trialEndsAt = shop?.trialEndsAt;
  const trialDateStr = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString()
    : null;

  return (
    <div className="settings">
      <div className="db-sec-head">
        <div>
          <h2>{t('db_settings')}</h2>
          <div className="sub">labaratory.rastashops.com/{shop?.handle || ''}</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving || handleStatus === 'taken'}>
          {I.check({ width: 16, height: 16 })} {saving ? t('loading') : t('db_save')}
        </button>
      </div>

      {/* ---- Section 1: Identity ---- */}
      <div className="set-card">
        <div className="set-title">{t('st_identity')}</div>

        <CoverUpload
          currentUrl={form.coverUrl}
          onUpload={(url) => set('coverUrl', url)}
        />

        <LogoUpload
          currentUrl={form.logoUrl}
          onUpload={(url) => set('logoUrl', url)}
          onRemove={() => set('logoUrl', '')}
        />

        <div className="field">
          <label>{t('ob_shop_name')}</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div className="field">
          <label>{t('ob_handle')}</label>
          <div className="pre-input">
            <span>labaratory.rastashops.com/</span>
            <input
              value={form.handle}
              onChange={(e) => onHandleChange(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <div className="hint" style={{ margin: 0 }}>{t('ob_handle_hint')}{form.handle}</div>
            {handleStatus === 'checking' && (
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>...</span>
            )}
            {handleStatus === 'available' && (
              <span style={{ fontSize: 12, color: '#2e7d32', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {I.check({ width: 14, height: 14 })} {t('st_slug_avail')}
              </span>
            )}
            {handleStatus === 'taken' && (
              <span style={{ fontSize: 12, color: '#c4392f', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {I.x({ width: 14, height: 14 })} {t('st_slug_taken')}
              </span>
            )}
          </div>
        </div>

        <LangTabs
          tagline={form.tagline}
          onChange={(tagline) => set('tagline', tagline)}
        />

        <div className="field-row">
          <div className="field">
            <label>{t('ob_city')}</label>
            <select value={form.location} onChange={(e) => set('location', e.target.value)}>
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t('ob_category')}</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="">—</option>
              {shopTypes.map((st) => (
                <option key={st.id} value={st.id}>{getCategoryName(st)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---- Location ---- */}
      <LocationSection form={form} set={set} />

      {/* ---- Section 2: Look & design link ---- */}
      <div className="set-card">
        <div className="plan-row">
          <div>
            <b>{t('st_look')}</b>
            <div className="hint">{t('st_look_d')}</div>
          </div>
          <button
            className="btn btn-sm"
            type="button"
            onClick={() => navigate('/dashboard/design')}
          >
            {I.palette({ width: 16, height: 16 })} {t('db_design')}
          </button>
        </div>
      </div>

      {/* ---- Section 3: Contacts ---- */}
      <div className="set-card">
        <div className="set-title">{t('ob_phone_contact')}</div>

        <div className="field">
          <label>Instagram</label>
          <div className="pre-input">
            <span>@</span>
            <input
              value={form.instagram}
              onChange={(e) => set('instagram', e.target.value.replace(/^@/, ''))}
              placeholder="yourshop"
            />
          </div>
        </div>

        <div className="field">
          <label>Telegram</label>
          <div className="pre-input">
            <span>@</span>
            <input
              value={form.telegram}
              onChange={(e) => set('telegram', e.target.value.replace(/^@/, ''))}
              placeholder="yourshop"
            />
          </div>
        </div>

        <div className="field">
          <label>{t('ob_phone_contact')}</label>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+998 90 123 45 67"
          />
        </div>
      </div>

      {/* ---- Section 4: Delivery & Payments ---- */}
      <div className="set-card">
        <div className="set-title">{t('st_delivery')}</div>
        <div className="field">
          <input
            value={form.deliveryNote}
            onChange={(e) => set('deliveryNote', e.target.value)}
            placeholder={t('st_delivery_hint')}
          />
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>{t('st_payments')}</label>
          <PaymentChips
            value={form.acceptedPayments}
            onChange={(v) => set('acceptedPayments', v)}
          />
        </div>
      </div>

      {/* ---- Section 5: Storefront options ---- */}
      <div className="set-card">
        <div className="set-title">{t('st_storefront')}</div>

        <div className="field">
          <label>{t('st_threshold')}</label>
          <QtyStepper
            value={Number(form.defaultThreshold)}
            min={0}
            onChange={(n) => set('defaultThreshold', n)}
          />
          <div className="hint">{t('st_threshold_d')}</div>
        </div>

        <label className="switch-row" style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            checked={form.showSoldOut}
            onChange={(e) => set('showSoldOut', e.target.checked)}
          />
          <span className="switch"><i /></span>
          <div>
            <span>{t('st_show_sold')}</span>
            <div className="hint" style={{ marginTop: 2 }}>{t('st_show_sold_d')}</div>
          </div>
        </label>
      </div>

      {/* ---- Section 6: Status ---- */}
      <div className="set-card">
        <div className="set-title">{t('st_status')}</div>

        <label className="switch-row" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isLive}
            onChange={toggleStatus}
          />
          <span className="switch"><i /></span>
          <span>{isLive ? t('st_live') : t('st_paused')}</span>
        </label>

        {!isLive && (
          <div className="hint" style={{ marginTop: 8 }}>{t('st_paused_d')}</div>
        )}
      </div>

      {/* ---- Section 7: Plan ---- */}
      <div className="set-card">
        <div className="set-title">{t('st_plan')}</div>
        <div className="plan-row">
          <div>
            <b>{shop?.plan === 'PRO' ? 'Pro' : 'Starter'}</b>
            {trialDateStr && (
              <div className="hint" style={{ marginTop: 2 }}>
                {fill(t('st_plan_trial'), { date: trialDateStr })}
              </div>
            )}
          </div>
          {shop?.plan !== 'PRO' && (
            <button className="btn btn-soft btn-sm" type="button" onClick={() => toast(t('st_upgrade'))}>
              {I.spark({ width: 15, height: 15 })} {t('st_upgrade')}
            </button>
          )}
        </div>
      </div>

      {/* ---- Section 8: Danger zone ---- */}
      <div className="set-card danger">
        <div className="set-title">{t('st_danger')}</div>
        <div className="plan-row">
          <div>
            <b>{t('st_delete')}</b>
            <div className="hint" style={{ marginTop: 2 }}>{t('st_delete_d')}</div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={() => setShowDeleteModal(true)}
          >
            {I.trash({ width: 15, height: 15 })} {t('st_delete')}
          </button>
        </div>
      </div>

      {/* ---- Delete confirmation modal ---- */}
      <DeleteShopModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        shopName={shop?.name || ''}
        onConfirm={handleDeleteShop}
      />
    </div>
  );
}
