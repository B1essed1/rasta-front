import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { t, onLangChange } from '../../i18n';
import { useShopStore } from '../../store/shopStore';
import { productCategories as fallbackCategories, fetchProductCategories, getCategoryName } from '../../data/types';
import { toast } from '../../components/ui/ToastHost';

const emptyProduct = {
  nameEn: '',
  nameUz: '',
  nameRu: '',
  descEn: '',
  descUz: '',
  descRu: '',
  price: '',
  catId: '',
  variants: [],
  visible: true,
};

export default function ProductModal({ open, onClose, product }) {
  const [, setTick] = useState(0);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState(fallbackCategories);
  const createProduct = useShopStore((s) => s.createProduct);
  const updateProduct = useShopStore((s) => s.updateProduct);

  useEffect(() => {
    return onLangChange(() => setTick((t) => t + 1));
  }, []);

  useEffect(() => {
    fetchProductCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        nameEn: product.nameEn || '',
        nameUz: product.nameUz || '',
        nameRu: product.nameRu || '',
        descEn: product.descEn || '',
        descUz: product.descUz || '',
        descRu: product.descRu || '',
        price: product.price?.toString() || '',
        catId: product.catId || '',
        variants: (product.variants || []).map((v) => ({
          id: v.id,
          label: (() => {
            try { return Object.values(JSON.parse(v.optionsJson)).join('/'); } catch { return v.optionsJson || ''; }
          })(),
          stock: v.qty || 0,
          barcode: v.barcode || '',
          avgCost: v.avgCost != null ? v.avgCost.toString() : '',
          threshold: v.threshold || 5,
        })),
        visible: product.visible !== false,
      });
    } else {
      setForm(emptyProduct);
    }
  }, [product, open]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { label: '', stock: 0, barcode: '', avgCost: '', threshold: 5 }],
    }));
  }

  function updateVariant(index, field, value) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) =>
        i === index ? { ...v, [field]: field === 'stock' || field === 'threshold' ? parseInt(value) || 0 : value } : v
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
      variants: form.variants.map((v) => ({
        id: v.id,
        optionsJson: v.label ? JSON.stringify({ size: v.label }) : null,
        qty: v.stock,
        barcode: v.barcode || null,
        avgCost: v.avgCost ? parseInt(v.avgCost) : null,
        threshold: v.threshold || 5,
      })),
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
        {/* Names */}
        <div className="form-row form-row--3">
          <div className="form-group">
            <label className="form-label">{t('product_name_en')}</label>
            <input
              type="text"
              className="form-input"
              value={form.nameEn}
              onChange={(e) => handleChange('nameEn', e.target.value)}
              required
            />
          </div>
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
        </div>

        {/* Descriptions - Multi-language */}
        <div className="form-row form-row--3">
          <div className="form-group">
            <label className="form-label">{t('product_desc')} (EN)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.descEn}
              onChange={(e) => handleChange('descEn', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_desc')} (UZ)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.descUz}
              onChange={(e) => handleChange('descUz', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('product_desc')} (RU)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.descRu}
              onChange={(e) => handleChange('descRu', e.target.value)}
            />
          </div>
        </div>

        {/* Price, Category */}
        <div className="form-row">
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
              value={form.catId}
              onChange={(e) => handleChange('catId', e.target.value)}
            >
              <option value="">—</option>
              {categories.map((st) => (
                <option key={st.id} value={st.id}>{getCategoryName(st)}</option>
              ))}
            </select>
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
                placeholder="Size (S, M, L...)"
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
              <input
                type="number"
                className="form-input"
                placeholder="Cost"
                value={v.avgCost || ''}
                onChange={(e) => updateVariant(i, 'avgCost', e.target.value)}
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
