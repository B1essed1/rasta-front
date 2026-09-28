import React, { useState, useEffect, useRef } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { shopTypes as fallbackShopTypes, cities, fetchShopTypes, getCategoryName } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';
import { I } from '../../components/ui/Icons';

function ImageUpload({ label, currentUrl, onUpload, aspect = '16/5', rounded = false }) {
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
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <div
        onClick={() => ref.current?.click()}
        style={{
          position: 'relative', aspectRatio: aspect, borderRadius: rounded ? '50%' : 14,
          border: '1.5px dashed var(--line, #e7e0d5)', background: 'var(--paper, #f6f3ee)',
          cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: rounded ? 96 : '100%', height: rounded ? 96 : undefined,
        }}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--faint, #9a9085)', fontSize: 13 }}>
            {I.plus({ width: 20, height: 20 })}
            <div style={{ marginTop: 4 }}>{uploading ? t('loading') : label}</div>
          </div>
        )}
        {currentUrl && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{t('db_edit')}</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

export default function SettingsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const updateShop = useShopStore((s) => s.updateShop);
  const fetchShop = useShopStore((s) => s.fetchShop);
  const [form, setForm] = useState({
    name: '', handle: '', type: '', location: '',
    telegram: '', instagram: '', phone: '',
    coverColor: '', logoUrl: '', coverUrl: '',
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

      <div className="set-card">
        <div className="set-title">{t('ob_shop_t')}</div>

        <ImageUpload
          label={t('db_preview') + ' (cover)'}
          currentUrl={form.coverUrl}
          onUpload={(url) => set('coverUrl', url)}
          aspect="16/5"
        />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <ImageUpload
            label="Logo"
            currentUrl={form.logoUrl}
            onUpload={(url) => set('logoUrl', url)}
            aspect="1"
            rounded
          />
          <div style={{ flex: 1 }}>
            <div className="field">
              <label>{t('ob_shop_name')}</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="field">
          <label>labaratory.rastashops.com/</label>
          <div className="pre-input">
            <span>labaratory.rastashops.com/</span>
            <input value={form.handle} onChange={(e) => set('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>{t('ob_category')}</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="">—</option>
              {shopTypes.map((st) => (
                <option key={st.id} value={st.id}>{getCategoryName(st)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t('ob_city')}</label>
            <select value={form.location} onChange={(e) => set('location', e.target.value)}>
              <option value="">—</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="set-card">
        <div className="set-title">{t('ob_phone_contact')}</div>
        <div className="field-row">
          <div className="field">
            <label>Instagram</label>
            <div className="pre-input">
              <span>@</span>
              <input value={form.instagram} onChange={(e) => set('instagram', e.target.value.replace(/^@/, ''))} />
            </div>
          </div>
          <div className="field">
            <label>Telegram</label>
            <div className="pre-input">
              <span>@</span>
              <input value={form.telegram} onChange={(e) => set('telegram', e.target.value.replace(/^@/, ''))} />
            </div>
          </div>
        </div>
        <div className="field">
          <label>{t('ob_phone_contact')}</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+998 90 123 45 67" />
        </div>
      </div>
    </div>
  );
}
