// ===== Attribute library — value lists, size charts and the per-attribute schema =====
// Ported verbatim from design-src/Taxonomy.jsx. Every id, every uz/ru/en name and
// every hex swatch is the design's.
// kind: select | multi | number | text | bool

const L = (en, ru, uz) => ({ en, ru, uz });

// ---- shared value lists -------------------------------------------------
const COLORS = [
  ["ivory", L("Ivory","Слоновая кость","Suyak rang"), "#f2ece1"],
  ["white", L("White","Белый","Oq"), "#fbfaf7"],
  ["black", L("Black","Чёрный","Qora"), "#1d1b16"],
  ["grey", L("Grey","Серый","Kulrang"), "#8d8880"],
  ["sand", L("Sand","Песочный","Qumrang"), "#d9c7a7"],
  ["olive", L("Olive","Оливковый","Zaytun"), "#6f7339"],
  ["terracotta", L("Terracotta","Терракота","Terrakota"), "#b5643c"],
  ["navy", L("Navy","Тёмно-синий","To‘q ko‘k"), "#2d3a56"],
  ["blue", L("Blue","Синий","Ko‘k"), "#3f6ea8"],
  ["red", L("Red","Красный","Qizil"), "#b3352e"],
  ["pink", L("Pink","Розовый","Pushti"), "#d99aa8"],
  ["green", L("Green","Зелёный","Yashil"), "#4a7c59"],
  ["brown", L("Brown","Коричневый","Jigarrang"), "#7a5a41"],
  ["gold", L("Gold","Золотой","Tilla"), "#c9a227"],
  ["silver", L("Silver","Серебряный","Kumush"), "#b9bcc0"],
].map(([id,name,hex])=>({ id, name, hex }));

const vals = (arr)=> arr.map(x=> Array.isArray(x)? { id:x[0], name:x[1] } : { id:String(x).toLowerCase(), name:L(String(x),String(x),String(x)) });

// ---- size charts (shown on the storefront next to the size picker) ------
const SIZE_CHARTS = {
  apparel_w: { title:L("Women’s sizes","Женские размеры","Ayollar o‘lchami"),
    cols:[L("Size","Размер","O‘lcham"), L("Chest, cm","Грудь, см","Ko‘krak, sm"), L("Waist, cm","Талия, см","Bel, sm"), L("Hip, cm","Бёдра, см","Son, sm")],
    rows:[["XS","78–82","60–64","86–90"],["S","83–87","65–69","91–95"],["M","88–92","70–74","96–100"],
          ["L","93–98","75–80","101–106"],["XL","99–104","81–86","107–112"],["XXL","105–110","87–92","113–118"]] },
  apparel_m: { title:L("Men’s sizes","Мужские размеры","Erkaklar o‘lchami"),
    cols:[L("Size","Размер","O‘lcham"), L("Chest, cm","Грудь, см","Ko‘krak, sm"), L("Waist, cm","Талия, см","Bel, sm")],
    rows:[["S","88–94","74–80"],["M","95–101","81–87"],["L","102–108","88–94"],["XL","109–116","95–102"],["XXL","117–124","103–110"]] },
  shoe: { title:L("Shoe sizes","Размеры обуви","Poyabzal o‘lchami"),
    cols:[L("EU","EU","EU"), L("Foot, cm","Стопа, см","Oyoq, sm"), L("US","US","US")],
    rows:[["36","22.5","5.5"],["37","23.2","6.5"],["38","24.0","7.5"],["39","24.7","8"],["40","25.4","9"],
          ["41","26.0","9.5"],["42","26.7","10.5"],["43","27.4","11"],["44","28.0","12"],["45","28.7","13"]] },
  kids: { title:L("Kids’ sizes","Детские размеры","Bolalar o‘lchami"),
    cols:[L("Size","Размер","O‘lcham"), L("Age","Возраст","Yosh"), L("Height, cm","Рост, см","Bo‘y, sm")],
    rows:[["86","1–2","80–92"],["98","2–3","92–104"],["110","4–5","104–116"],["122","6–7","116–128"],["134","8–9","128–140"]] },
};

// ---- attribute library -------------------------------------------------
// kind: select | multi | number | text | bool
const ATTRS = {
  color:      { name:L("Colour","Цвет","Rang"), kind:"select", swatch:true, values:COLORS },
  size_w:     { name:L("Size","Размер","O‘lcham"), kind:"select", chart:"apparel_w", values:vals(["XS","S","M","L","XL","XXL"]) },
  size_m:     { name:L("Size","Размер","O‘lcham"), kind:"select", chart:"apparel_m", values:vals(["S","M","L","XL","XXL"]) },
  size_kids:  { name:L("Size","Размер","O‘lcham"), kind:"select", chart:"kids", values:vals(["86","98","110","122","134"]) },
  size_shoe:  { name:L("EU size","Размер EU","EU o‘lcham"), kind:"select", chart:"shoe", values:vals(["36","37","38","39","40","41","42","43","44","45"]) },
  material:   { name:L("Material","Материал","Material"), kind:"select", values:vals([
                 ["linen",L("Linen","Лён","Zig‘ir")],["cotton",L("Cotton","Хлопок","Paxta")],["silk",L("Silk","Шёлк","Ipak")],
                 ["wool",L("Wool","Шерсть","Jun")],["leather",L("Leather","Кожа","Teri")],["synthetic",L("Synthetic","Синтетика","Sintetika")],
                 ["viscose",L("Viscose","Вискоза","Viskoza")]]) },
  season:     { name:L("Season","Сезон","Fasl"), kind:"select", values:vals([
                 ["summer",L("Summer","Лето","Yoz")],["winter",L("Winter","Зима","Qish")],
                 ["demi",L("Spring / autumn","Весна / осень","Bahor / kuz")],["all",L("All season","Всесезон","Har fasl")]]) },
  fit:        { name:L("Fit","Посадка","Bichim"), kind:"select", values:vals([
                 ["slim",L("Slim","Узкая","Tor")],["regular",L("Regular","Прямая","Oddiy")],["oversize",L("Oversize","Свободная","Erkin")]]) },
  brand:      { name:L("Brand","Бренд","Brend"), kind:"text" },
  shoe_type:  { name:L("Closure","Застёжка","Bandi"), kind:"select", values:vals([
                 ["lace",L("Laces","Шнурки","Ip")],["slipon",L("Slip-on","Без застёжки","Bandsiz")],["velcro",L("Velcro","Липучка","Yopishqoq")]]) },
  // vehicles
  make:       { name:L("Make","Марка","Marka"), kind:"select", values:vals([
                 ["chevrolet",L("Chevrolet","Chevrolet","Chevrolet")],["toyota",L("Toyota","Toyota","Toyota")],
                 ["kia",L("Kia","Kia","Kia")],["hyundai",L("Hyundai","Hyundai","Hyundai")],
                 ["bmw",L("BMW","BMW","BMW")],["mercedes",L("Mercedes-Benz","Mercedes-Benz","Mercedes-Benz")],
                 ["lada",L("Lada","Lada","Lada")],["byd",L("BYD","BYD","BYD")]]) },
  model:      { name:L("Model","Модель","Model"), kind:"text" },
  year:       { name:L("Year","Год выпуска","Ishlab chiqarilgan yil"), kind:"number", unit:L("year","г.","yil"), min:1980, max:2026 },
  mileage:    { name:L("Mileage","Пробег","Yurgan masofa"), kind:"number", unit:L("km","км","km") },
  fuel:       { name:L("Fuel","Топливо","Yoqilg‘i"), kind:"select", values:vals([
                 ["petrol",L("Petrol","Бензин","Benzin")],["gas",L("Petrol + gas","Бензин + газ","Benzin + gaz")],
                 ["diesel",L("Diesel","Дизель","Dizel")],["hybrid",L("Hybrid","Гибрид","Gibrid")],["electric",L("Electric","Электро","Elektr")]]) },
  gearbox:    { name:L("Gearbox","Коробка передач","Uzatmalar qutisi"), kind:"select", values:vals([
                 ["manual",L("Manual","Механика","Mexanika")],["auto",L("Automatic","Автомат","Avtomat")],
                 ["cvt",L("CVT","Вариатор","Variator")],["dct",L("Dual-clutch","Робот","Robot")]]) },
  engine:     { name:L("Engine, litres","Двигатель, л","Motor, litr"), kind:"number", unit:L("L","л","l") },
  condition:  { name:L("Condition","Состояние","Holati"), kind:"select", values:vals([
                 ["new",L("New","Новый","Yangi")],["used",L("Used","С пробегом","Ishlatilgan")]]) },
  tyre_size:  { name:L("Tyre size","Размер шин","Shina o‘lchami"), kind:"select", values:vals(["195/65 R15","205/55 R16","215/60 R16","225/45 R17","235/55 R18"]) },
  // flowers
  bouquet_size:{ name:L("Bouquet size","Размер букета","Guldasta o‘lchami"), kind:"select", values:vals([
                 ["s",L("Small · 11 stems","Маленький · 11 шт","Kichik · 11 dona")],
                 ["m",L("Medium · 25 stems","Средний · 25 шт","O‘rta · 25 dona")],
                 ["l",L("Large · 51 stems","Большой · 51 шт","Katta · 51 dona")]]) },
  flower_type:{ name:L("Flowers","Цветы","Gullar"), kind:"multi", values:vals([
                 ["rose",L("Roses","Розы","Atirgul")],["tulip",L("Tulips","Тюльпаны","Lola")],
                 ["peony",L("Peonies","Пионы","Pion")],["chrys",L("Chrysanthemums","Хризантемы","Xrizantema")],
                 ["eucalyptus",L("Eucalyptus","Эвкалипт","Evkalipt")],["dried",L("Dried flowers","Сухоцветы","Quruq gul")]]) },
  occasion:   { name:L("Occasion","Повод","Sabab"), kind:"select", values:vals([
                 ["birthday",L("Birthday","День рождения","Tug‘ilgan kun")],["wedding",L("Wedding","Свадьба","To‘y")],
                 ["navruz",L("Navruz","Навруз","Navro‘z")],["mothers",L("Mother’s day","День матери","Onalar kuni")],
                 ["sympathy",L("Sympathy","Соболезнование","Ta’ziya")]]) },
  potted:     { name:L("Plant care","Уход","Parvarish"), kind:"select", values:vals([
                 ["easy",L("Easy","Простой","Oson")],["medium",L("Moderate","Средний","O‘rtacha")],["fussy",L("Demanding","Требовательный","Talabchan")]]) },
  // supplements
  supp_form:  { name:L("Form","Форма","Shakli"), kind:"select", values:vals([
                 ["tablet",L("Tablets","Таблетки","Tabletka")],["capsule",L("Capsules","Капсулы","Kapsula")],
                 ["powder",L("Powder","Порошок","Kukun")],["drops",L("Drops","Капли","Tomchi")],["gummy",L("Gummies","Жевательные","Chaynaladigan")]]) },
  dosage:     { name:L("Dosage","Дозировка","Dozasi"), kind:"select", values:vals(["500 mg","1000 mg","2000 IU","5000 IU"]) },
  pack:       { name:L("Pack size","Количество в упаковке","Qadoqdagi soni"), kind:"select", values:vals(["30","60","90","120"]) },
  flavour:    { name:L("Flavour","Вкус","Ta’mi"), kind:"select", values:vals([
                 ["neutral",L("Unflavoured","Без вкуса","Ta’msiz")],["chocolate",L("Chocolate","Шоколад","Shokolad")],
                 ["vanilla",L("Vanilla","Ваниль","Vanil")],["berry",L("Berry","Ягоды","Rezavor")],
                 ["orange",L("Orange","Апельсин","Apelsin")]]) },
  vegan:      { name:L("Vegan","Веганский","Vegan"), kind:"bool" },
  // gym
  weight_kg:  { name:L("Weight, kg","Вес, кг","Vazn, kg"), kind:"select", values:vals(["2","4","6","8","10","12","16","20","24"]) },
  grip:       { name:L("Grip","Хват","Ushlagich"), kind:"select", values:vals([
                 ["rubber",L("Rubber","Резина","Rezina")],["neoprene",L("Neoprene","Неопрен","Neopren")],
                 ["steel",L("Bare steel","Металл","Metall")]]) },
  gym_mat:    { name:L("Material","Материал","Material"), kind:"select", values:vals([
                 ["tpe",L("TPE","TPE","TPE")],["pvc",L("PVC","ПВХ","PVX")],["rubber",L("Natural rubber","Натуральный каучук","Tabiiy kauchuk")],
                 ["cork",L("Cork","Пробка","Probka")]]) },
  thickness:  { name:L("Thickness, mm","Толщина, мм","Qalinligi, mm"), kind:"select", values:vals(["4","6","8","10"]) },
  // electronics
  storage:    { name:L("Storage","Память","Xotira"), kind:"select", values:vals(["64 GB","128 GB","256 GB","512 GB","1 TB"]) },
  ram:        { name:L("RAM","Оперативная память","Tezkor xotira"), kind:"select", values:vals(["4 GB","6 GB","8 GB","16 GB","32 GB"]) },
  screen:     { name:L("Screen, inches","Экран, дюймы","Ekran, dyuym"), kind:"number", unit:L("in","\"","\"") },
  wireless:   { name:L("Wireless","Беспроводные","Simsiz"), kind:"bool" },
  anc:        { name:L("Noise cancelling","Шумоподавление","Shovqin bostirish"), kind:"bool" },
  // home
  home_mat:   { name:L("Material","Материал","Material"), kind:"select", values:vals([
                 ["ceramic",L("Ceramic","Керамика","Sopol")],["porcelain",L("Porcelain","Фарфор","Chinni")],
                 ["glass",L("Glass","Стекло","Shisha")],["steel",L("Stainless steel","Нержавеющая сталь","Zanglamaydigan po‘lat")],
                 ["cast",L("Cast iron","Чугун","Cho‘yan")],["wood",L("Wood","Дерево","Yog‘och")],
                 ["cotton",L("Cotton","Хлопок","Paxta")]]) },
  capacity:   { name:L("Capacity, litres","Объём, л","Hajmi, litr"), kind:"select", values:vals(["0.5","1","1.5","2","3","5"]) },
  bed_size:   { name:L("Bed size","Размер","O‘lcham"), kind:"select", values:vals([
                 ["single",L("Single","Односпальный","Bir kishilik")],["double",L("Double","Двуспальный","Ikki kishilik")],
                 ["king",L("King","Евро","Yevro")]]) },
  dishwasher: { name:L("Dishwasher safe","Можно в посудомойку","Idish yuvish mashinasida"), kind:"bool" },
  // cosmetics
  shade:      { name:L("Shade","Оттенок","Tus"), kind:"select", values:vals([
                 ["porcelain",L("Porcelain 100","Фарфор 100","Chinni 100")],["ivory",L("Ivory 120","Айвори 120","Suyak 120")],
                 ["beige",L("Beige 140","Бежевый 140","Bej 140")],["sand",L("Sand 160","Песочный 160","Qum 160")],
                 ["honey",L("Honey 220","Медовый 220","Asal 220")],["caramel",L("Caramel 300","Карамель 300","Karamel 300")]]) },
  volume_ml:  { name:L("Volume, ml","Объём, мл","Hajmi, ml"), kind:"select", values:vals(["15","30","50","100","200"]) },
  skin_type:  { name:L("Skin type","Тип кожи","Teri turi"), kind:"select", values:vals([
                 ["dry",L("Dry","Сухая","Quruq")],["oily",L("Oily","Жирная","Yog‘li")],
                 ["combo",L("Combination","Комбинированная","Aralash")],["sensitive",L("Sensitive","Чувствительная","Sezgir")],
                 ["all",L("All types","Все типы","Barcha turlar")]]) },
  finish:     { name:L("Finish","Финиш","Yakun"), kind:"select", values:vals([
                 ["matte",L("Matte","Матовый","Mat")],["satin",L("Satin","Сатиновый","Satin")],["glossy",L("Glossy","Глянцевый","Yaltiroq")]]) },
  // food
  weight_g:   { name:L("Weight","Вес","Vazn"), kind:"select", values:vals(["100 g","250 g","500 g","1 kg"]) },
  dietary:    { name:L("Dietary","Особенности","Xususiyat"), kind:"multi", values:vals([
                 ["halal",L("Halal","Халяль","Halol")],["sugarfree",L("No added sugar","Без сахара","Shakarsiz")],
                 ["glutenfree",L("Gluten free","Без глютена","Glyutensiz")],["organic",L("Organic","Органик","Organik")],
                 ["raw",L("Raw","Сыроедческий","Xom")]]) },
  origin:     { name:L("Origin","Происхождение","Kelib chiqishi"), kind:"select", values:vals([
                 ["uz",L("Uzbekistan","Узбекистан","O‘zbekiston")],["tr",L("Türkiye","Турция","Turkiya")],
                 ["ir",L("Iran","Иран","Iron")],["in",L("India","Индия","Hindiston")],["cn",L("China","Китай","Xitoy")]]) },
  tea_type:   { name:L("Type","Вид","Turi"), kind:"select", values:vals([
                 ["black",L("Black","Чёрный","Qora")],["green",L("Green","Зелёный","Ko‘k")],
                 ["herbal",L("Herbal","Травяной","O‘simlik")],["fruit",L("Fruit","Фруктовый","Mevali")]]) },
};

// ---- lookups -----------------------------------------------------------
// attribute definitions for a leaf category, in display order
function attrDef(attrId){
  const a = ATTRS[attrId];
  return a? { id:attrId, ...a } : null;
}
function attrValueName(attrId, valId, lang){
  const a = ATTRS[attrId];
  if(!a || !a.values) return String(valId);
  const v = a.values.find(x=>x.id===String(valId));
  return v? v.name[lang] : String(valId);
}
function attrValueHex(attrId, valId){
  const a = ATTRS[attrId];
  if(!a || !a.values) return null;
  const v = a.values.find(x=>x.id===String(valId));
  return v? (v.hex||null) : null;
}

export { L, COLORS, vals, SIZE_CHARTS, ATTRS, attrDef, attrValueName, attrValueHex };
export default ATTRS;
