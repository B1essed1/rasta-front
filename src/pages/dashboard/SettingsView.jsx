import React, { useState, useEffect } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { shopTypes, cities } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';

export default function SettingsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const updateShop = useShopStore((s) => s.updateShop);
  const uploadImage = useShopStore((s) => s.uploadImage);
  const [form, setForm] = useState({
    name: '',
    handle: '',
    bio: '',
    type: '',
    city: '',
    telegram: '',
    instagram: '',
    phone: '',
    coverUrl: '',
    logoUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        handle: shop.handle || '',
        bio: shop.bio || '',
        type: shop.type || '',
        city: shop.city || '',
        telegram: shop.telegram || '',
        instagram: shop.instagram || '',
        phone: shop.phone || '',
        coverUrl: shop.coverUrl || '',
        logoUrl: shop.logoUrl || '',
      });
    }
  }, [shop]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageUpload(field, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch {
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShop(form);
      toast(t('db_saved'), 'success');
    } catch {
      toast('Error', 'error');
    }
    setSaving(false);
  }

  return (
    <div className="settings-view">
      <div className="settings-view__header">
        <h1>{t('db_settings')}</h1>
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t('loading') : t('db_save')}
        </button>
      </div>

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-section">
          <h3>{t('ob_shop_t')}</h3>

          <div className="form-group">
            <label className="form-label">{t('ob_shop_name')}</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('ob_handle')}</label>
            <div className="handle-input">
              <span className="handle-input__prefix">{t('ob_handle_hint')}</span>
              <input
                type="text"
                className="handle-input__field"
                value={form.handle}
                onChange={(e) =>
                  handleChange('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('sf_about')}</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('ob_category')}</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="">—</option>
                {shopTypes.map((st) => (
                  <option key={st.id} value={st.id}>{t(st.labelKey)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('ob_city')}</label>
              <select
                className="form-select"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
              >
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t('ob_brand_t')}</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('ob_cover')}</label>
              <div className="settings-upload">
                {form.coverUrl && <img src={form.coverUrl} alt="Cover" className="settings-upload__img" />}
                <label className="btn btn--outline btn--sm">
                  {t('ob_upload')}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload('coverUrl', e)} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('ob_logo')}</label>
              <div className="settings-upload">
                {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="settings-upload__img settings-upload__img--round" />}
                <label className="btn btn--outline btn--sm">
                  {t('ob_upload')}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload('logoUrl', e)} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Contact</h3>
          <div className="form-row form-row--3">
            <div className="form-group">
              <label className="form-label">{t('ob_telegram')}</label>
              <input
                type="text"
                className="form-input"
                value={form.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                placeholder="@username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ob_instagram')}</label>
              <input
                type="text"
                className="form-input"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('ob_phone_contact')}</label>
              <input
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
