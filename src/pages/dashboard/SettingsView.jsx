import React, { useState, useEffect } from 'react';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { shopTypes as fallbackShopTypes, cities, fetchShopTypes, getCategoryName } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';

export default function SettingsView() {
  const [, setTick] = useState(0);
  const shop = useShopStore((s) => s.shop);
  const updateShop = useShopStore((s) => s.updateShop);
  const [form, setForm] = useState({
    name: '',
    handle: '',
    type: '',
    location: '',
    telegram: '',
    instagram: '',
    phone: '',
    coverColor: '',
  });
  const [saving, setSaving] = useState(false);
  const [shopTypes, setShopTypes] = useState(fallbackShopTypes);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    fetchShopTypes().then(setShopTypes);
  }, []);

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
      });
    }
  }, [shop]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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
                  <option key={st.id} value={st.id}>{getCategoryName(st)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('ob_city')}</label>
              <select
                className="form-select"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
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
