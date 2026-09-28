import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { shopTypes as fallbackShopTypes, cities, fetchShopTypes, getCategoryName } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';
import { I } from '../../components/ui/Icons';

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
      const url = await uploadImage(file);
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
      const url = await uploadImage(file);
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
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function SettingsView() {
  const [, setTick] = useState(0);
  const navigate = useNavigate();
  const shop = useShopStore((s) => s.shop);
  const updateShop = useShopStore((s) => s.updateShop);
  const fetchShop = useShopStore((s) => s.fetchShop);
  const setShopStatus = useShopStore((s) => s.setShopStatus);

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
  });
  const [saving, setSaving] = useState(false);
  const [shopTypes, setShopTypes] = useState(fallbackShopTypes);

  useEffect(() => onLangChange(() => setTick((n) => n + 1)), []);
  useEffect(() => { fetchShopTypes().then(setShopTypes); }, []);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        handle: shop.handle || '',
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
      });
    }
  }, [shop]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
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

  const isLive = form.status === 'LIVE';

  return (
    <div className="settings">
      <div className="db-sec-head">
        <div>
          <h2>{t('db_settings')}</h2>
          <div className="sub">labaratory.rastashops.com/{shop?.handle || ''}</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>
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
              onChange={(e) =>
                set('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))
              }
              disabled
            />
          </div>
          <div className="hint">{t('ob_handle_hint')}{form.handle}</div>
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

      {/* ---- Section 4: Status ---- */}
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
    </div>
  );
}
