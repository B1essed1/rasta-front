import api from '../api/client';
import { getLang } from '../i18n';

export const cities = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Namangan',
  'Andijon',
  'Fargʻona',
  'Nukus',
  'Qarshi',
  'Jizzax',
  'Urganch',
  'Navoiy',
  'Termiz',
  'Kokand',
  'Margʻilon',
  'Chirchiq',
];

let shopTypesCache = null;
let productCategoriesCache = null;

function mapCategory(c) {
  return {
    id: c.slug,
    nameEn: c.nameEn,
    nameUz: c.nameUz,
    nameRu: c.nameRu,
  };
}

export function getCategoryName(cat) {
  if (!cat) return '';
  const lang = getLang();
  if (lang === 'uz') return cat.nameUz || cat.nameEn || '';
  if (lang === 'ru') return cat.nameRu || cat.nameEn || '';
  return cat.nameEn || '';
}

export async function fetchShopTypes() {
  if (shopTypesCache) return shopTypesCache;
  try {
    const res = await api.get('/categories', { params: { kind: 'SHOP_TYPE' } });
    shopTypesCache = res.data.map(mapCategory);
    return shopTypesCache;
  } catch {
    return fallbackShopTypes;
  }
}

export async function fetchProductCategories() {
  if (productCategoriesCache) return productCategoriesCache;
  try {
    const res = await api.get('/categories', { params: { kind: 'PRODUCT_CATEGORY' } });
    productCategoriesCache = res.data.map(mapCategory);
    return productCategoriesCache;
  } catch {
    return fallbackProductCategories;
  }
}

export function clearCategoryCache() {
  shopTypesCache = null;
  productCategoriesCache = null;
}

const fallbackShopTypes = [
  { id: 'fashion', nameEn: 'Fashion', nameUz: 'Moda', nameRu: 'Мода' },
  { id: 'food', nameEn: 'Food', nameUz: 'Oziq-ovqat', nameRu: 'Еда' },
  { id: 'beauty', nameEn: 'Beauty', nameUz: 'Go\'zallik', nameRu: 'Красота' },
  { id: 'home', nameEn: 'Home', nameUz: 'Uy-joy', nameRu: 'Дом' },
  { id: 'gifts', nameEn: 'Gifts', nameUz: 'Sovg\'alar', nameRu: 'Подарки' },
  { id: 'electronics', nameEn: 'Electronics', nameUz: 'Elektronika', nameRu: 'Электроника' },
  { id: 'sports', nameEn: 'Sports', nameUz: 'Sport', nameRu: 'Спорт' },
  { id: 'other', nameEn: 'Other', nameUz: 'Boshqa', nameRu: 'Другое' },
];

const fallbackProductCategories = [
  { id: 'clothing', nameEn: 'Clothing', nameUz: 'Kiyim-kechak', nameRu: 'Одежда' },
  { id: 'shoes', nameEn: 'Shoes', nameUz: 'Poyabzal', nameRu: 'Обувь' },
  { id: 'accessories', nameEn: 'Accessories', nameUz: 'Aksessuarlar', nameRu: 'Аксессуары' },
  { id: 'food', nameEn: 'Food', nameUz: 'Oziq-ovqat', nameRu: 'Еда' },
  { id: 'electronics', nameEn: 'Electronics', nameUz: 'Elektronika', nameRu: 'Электроника' },
  { id: 'other', nameEn: 'Other', nameUz: 'Boshqa', nameRu: 'Другое' },
];

export const shopTypes = fallbackShopTypes;
export const productCategories = fallbackProductCategories;

export function getShopType(id) {
  const list = shopTypesCache || fallbackShopTypes;
  return list.find((t) => t.id === id) || list[list.length - 1];
}

export default shopTypes;
