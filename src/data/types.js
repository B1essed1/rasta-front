export const shopTypes = [
  { id: 'fashion', labelKey: 'type_fashion', icon: '👗' },
  { id: 'food', labelKey: 'type_food', icon: '🍜' },
  { id: 'beauty', labelKey: 'type_beauty', icon: '💄' },
  { id: 'home', labelKey: 'type_home', icon: '🏠' },
  { id: 'gifts', labelKey: 'type_gifts', icon: '🎁' },
  { id: 'electronics', labelKey: 'type_electronics', icon: '📱' },
  { id: 'sports', labelKey: 'type_sports', icon: '⚽' },
  { id: 'other', labelKey: 'type_other', icon: '📦' },
];

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

export function getShopType(id) {
  return shopTypes.find((t) => t.id === id) || shopTypes[shopTypes.length - 1];
}

export default shopTypes;
