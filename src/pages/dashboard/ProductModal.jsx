import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { shopTypes } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';

const emptyProduct = {
  name: '',
  nameUz: '',
  nameRu: '',
  nameEn: '',
  description: '',
  price: '',
  category: '',
  photos: [],
  variants: [],
  stock: '',
  visible: true,
};

export default function ProductModal({ open, onClose, product }) {
  const [, setTick] = useState(0);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const createProduct = useShopStore((s) => s.createProduct);
  const updateProduct = useShopStore((s) => s.updateProduct);
  const uploadImage = useShopStore((s) => s.uploadImage);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        nameUz: product.nameUz || '',
        nameRu: product.nameRu || '',
        nameEn: product.nameEn || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        photos: product.photos || [],
        variants: product.variants || [],
        stock: product.stock?.toString() || '',
        visible: product.visible !== false,
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product, open]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const url = await uploadImage(file);
        setForm((f) => ({ ...f, photos: [...f.photos, url] }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setForm((f) => ({ ...f, photos: [...f.photos, reader.result] }));
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function removePhoto(index) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { label: '', stock: 0 }],
    }));
  }

  function updateVariant(index, field, value) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) =>
        i === index ? { ...v, [field]: field === 'stock' ? parseInt(value) || 0 : value } : v
      ),
    }));
  }

  function removeVariant(index) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseInt(form.price) || 0,
      stock: parseInt(form.stock) || 0,
    };
    try {
      if (product?.id) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      toast(t('db_saved'), 'success');
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Error', 'error');
    }
    setSaving(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? t('db_edit') : t('db_add')} wide>
      <form className="product-form" onSubmit={handleSubmit}>
        {/* Photos */}
        <div className="form-group">
          <label className="form-label">{t('product_photos')}</label>
          <div className="photo-grid">
            {form.photos.map((url, i) => (
              <div key={i} className="photo-grid__item">
                <img src={url} alt="" />
                <button
                  type="button"
                  className="photo-grid__remove"
                  onClick={() => removePhoto(i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <label className="photo-grid__add">
              <span>+</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Names */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('product_name')}</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row form-row--3">
          <div className="form-group">
            <label className="form-label">{t('product_name_uz')}</label>
            <input
              type="text"
              className="form-input"
              value={form.nameUz}
              onChange={(e) => handleChange('nameUz', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_name_ru')}</label>
            <input
              type="text"
              className="form-input"
              value={form.nameRu}
              onChange={(e) => handleChange('nameRu', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_name_en')}</label>
            <input
              type="text"
              className="form-input"
              value={form.nameEn}
              onChange={(e) => handleChange('nameEn', e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">{t('product_desc')}</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Price, Category, Stock */}
        <div className="form-row form-row--3">
          <div className="form-group">
            <label className="form-label">{t('product_price')}</label>
            <input
              type="number"
              className="form-input"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_category')}</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">—</option>
              {shopTypes.map((st) => (
                <option key={st.id} value={st.id}>{t(st.labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_stock')}</label>
            <input
              type="number"
              className="form-input"
              value={form.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Variants */}
        <div className="form-group">
          <label className="form-label">{t('product_variants')}</label>
          {form.variants.map((v, i) => (
            <div key={i} className="variant-row">
              <input
                type="text"
                className="form-input"
                placeholder="S, M, L..."
                value={v.label}
                onChange={(e) => updateVariant(i, 'label', e.target.value)}
              />
              <input
                type="number"
                className="form-input"
                placeholder={t('product_stock')}
                value={v.stock}
                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                min="0"
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => removeVariant(i)}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={addVariant}
          >
            + {t('product_add_variant')}
          </button>
        </div>

        {/* Visible */}
        <div className="form-group form-group--inline">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => handleChange('visible', e.target.checked)}
            />
            <span>{t('product_visible')}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? t('loading') : t('product_save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
