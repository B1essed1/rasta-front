// ===== Taxonomy — 3-level category tree + per-category attribute schema =====
// The category decides which attributes exist. Attributes come in two roles:
//   variant → produces sellable rows, each with its own qty / barcode / cost
//   spec    → describes the whole product; what buyers filter by
// Gender is a branch of the tree, not an attribute.

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
  // made to order, rent, celebrations, handmade
  cake_weight:{ name:L("Size","Размер","Hajmi"), kind:"select", values:vals(["1 kg","1.5 kg","2 kg","3 kg"]) },
  filling:    { name:L("Filling","Начинка","Ichi"), kind:"select", values:vals([
                 ["choc",L("Chocolate","Шоколад","Shokolad")],["vanilla",L("Vanilla","Ваниль","Vanil")],
                 ["berry",L("Berry","Ягоды","Rezavor")],["nut",L("Nut","Орех","Yong‘oq")],["caramel",L("Caramel","Карамель","Karamel")]]) },
  box_pcs:    { name:L("Box","Коробка","Quti"), kind:"select", values:vals([
                 ["4",L("4 pcs","4 шт","4 dona")],["6",L("6 pcs","6 шт","6 dona")],["9",L("9 pcs","9 шт","9 dona")],["12",L("12 pcs","12 шт","12 dona")]]) },
  made_to_order:{ name:L("Made to order","На заказ","Buyurtma asosida"), kind:"bool" },
  lead_days:  { name:L("Days needed","Срок изготовления","Tayyorlash muddati"), kind:"number", unit:L("days","дн.","kun") },
  inscription:{ name:L("Custom inscription","Надпись на заказ","Yozuv qo‘shish"), kind:"bool" },
  sale_rent:  { name:L("Sale or rent","Продажа или аренда","Sotuv yoki ijara"), kind:"select", values:vals([
                 ["sale",L("Sale","Продажа","Sotuv")],["rent",L("Rent","Аренда","Ijara")]]) },
  rent_days:  { name:L("Rental period","Срок аренды","Ijara muddati"), kind:"number", unit:L("days","дн.","kun") },
  set_items:  { name:L("What's included","Что входит","Nimalar kiradi"), kind:"text" },
  bead_count: { name:L("Beads","Бусин","Donalar"), kind:"select", values:vals(["33","99"]) },
  theme:      { name:L("Theme","Тема","Mavzu"), kind:"text" },
  helium:     { name:L("Helium","Гелий","Geliy"), kind:"bool" },
  scent:      { name:L("Scent","Аромат","Hidi"), kind:"select", values:vals([
                 ["lavender",L("Lavender","Лаванда","Lavanda")],["rose",L("Rose","Роза","Atirgul")],
                 ["citrus",L("Citrus","Цитрус","Sitrus")],["vanilla",L("Vanilla","Ваниль","Vanil")],["none",L("Unscented","Без запаха","Hidsiz")]]) },
  handmade:   { name:L("Handmade","Ручная работа","Qo‘l mehnati"), kind:"bool" },
  region:     { name:L("Region","Регион","Hudud"), kind:"select", values:vals([
                 ["tashkent",L("Tashkent","Ташкент","Toshkent")],["samarkand",L("Samarkand","Самарканд","Samarqand")],
                 ["bukhara",L("Bukhara","Бухара","Buxoro")],["margilan",L("Margilan","Маргилан","Marg‘ilon")],
                 ["rishtan",L("Rishtan","Риштан","Rishton")],["khorezm",L("Khorezm","Хорезм","Xorazm")]]) },
  blackout:   { name:L("Blackout","Блэкаут","Qorong‘ilatuvchi"), kind:"bool" },
  hair_len:   { name:L("Length","Длина","Uzunligi"), kind:"select", values:vals(["40 cm","50 cm","60 cm","70 cm"]) },
  compat:     { name:L("Works with","Совместимость","Mos keladi"), kind:"select", values:vals([
                 ["ios",L("iPhone","iPhone","iPhone")],["android",L("Android","Android","Android")],["both",L("iPhone & Android","iPhone и Android","iPhone va Android")]]) },
  // sport
  ball_size:  { name:L("Ball size","Размер мяча","To‘p o‘lchami"), kind:"select", values:vals(["3","4","5","6","7"]) },
  glove_oz:   { name:L("Gloves, oz","Перчатки, унции","Qo‘lqop, oz"), kind:"select", values:vals(["8 oz","10 oz","12 oz","14 oz","16 oz"]) },
  sport_type: { name:L("Sport","Вид спорта","Sport turi"), kind:"select", values:vals([
                 ["boxing",L("Boxing","Бокс","Boks")],["judo",L("Judo","Дзюдо","Dzyudo")],["karate",L("Karate","Карате","Karate")],
                 ["taekwondo",L("Taekwondo","Тхэквондо","Taekvondo")],["kurash",L("Kurash","Кураш","Kurash")],["mma",L("MMA","ММА","MMA")]]) },
  resistance: { name:L("Resistance","Сопротивление","Qarshilik"), kind:"select", values:vals([
                 ["light",L("Light","Лёгкое","Yengil")],["medium",L("Medium","Среднее","O‘rta")],["heavy",L("Heavy","Сильное","Og‘ir")]]) },
  wheel_size: { name:L("Wheel size","Диаметр колес","G‘ildirak o‘lchami"), kind:"select", values:vals(["12\"","16\"","20\"","24\"","26\"","27.5\"","29\""]) },
  max_load:   { name:L("Max load","Макс. нагрузка","Maks. yuk"), kind:"number", unit:L("kg","кг","kg") },
  foldable:   { name:L("Foldable","Складной","Yig‘iladigan"), kind:"bool" },
  in_out:     { name:L("Use","Использование","Foydalanish"), kind:"select", values:vals([
                 ["indoor",L("Indoor","Зал","Zal")],["outdoor",L("Outdoor","Улица","Ochiq maydon")]]) },
  // free option: sellers type their own values (used by every "Other" category)
  option:     { name:L("Option","Вариант","Variant"), kind:"select", values:[] },
  set_size:   { name:L("Set","Набор","To‘plam"), kind:"select", values:vals([
                 ["1",L("1 piece","1 шт","1 dona")],["6",L("Set of 6","Набор из 6","6 talik")],
                 ["12",L("Set of 12","Набор из 12","12 talik")],["24",L("Set of 24","Набор из 24","24 talik")]]) },
  // kids
  age_range:  { name:L("Age","Возраст","Yosh"), kind:"select", values:vals([
                 ["0-1",L("0–1 years","0–1 год","0–1 yosh")],["1-3",L("1–3 years","1–3 года","1–3 yosh")],
                 ["3-6",L("3–6 years","3–6 лет","3–6 yosh")],["6-12",L("6–12 years","6–12 лет","6–12 yosh")],
                 ["12+",L("12+ years","12+ лет","12+ yosh")]]) },
  // jewellery
  ring_size:  { name:L("Ring size","Размер кольца","Uzuk o‘lchami"), kind:"select", values:vals(["15","16","17","18","19","20"]) },
  metal:      { name:L("Metal","Металл","Metall"), kind:"select", values:vals([
                 ["gold585",L("Gold 585","Золото 585","Oltin 585")],["silver925",L("Silver 925","Серебро 925","Kumush 925")],
                 ["steel",L("Stainless steel","Сталь","Po‘lat")],["plated",L("Gold-plated","Позолота","Oltin suvi")]]) },
  // books
  book_lang:  { name:L("Language","Язык","Til"), kind:"select", values:vals([
                 ["uz",L("Uzbek","Узбекский","O‘zbekcha")],["ru",L("Russian","Русский","Ruscha")],["en",L("English","Английский","Inglizcha")]]) },
  author:     { name:L("Author","Автор","Muallif"), kind:"text" },
  cover_type: { name:L("Cover","Переплёт","Muqova"), kind:"select", values:vals([
                 ["hard",L("Hardcover","Твёрдый","Qattiq")],["soft",L("Paperback","Мягкий","Yumshoq")]]) },
  // pets
  pet_type:   { name:L("For","Для кого","Kim uchun"), kind:"multi", values:vals([
                 ["cat",L("Cats","Кошки","Mushuklar")],["dog",L("Dogs","Собаки","Itlar")],
                 ["bird",L("Birds","Птицы","Qushlar")],["fish",L("Fish","Рыбки","Baliqlar")]]) },
};

// ---- the tree: root › group › leaf. Leaves carry v (variant attrs) and s (spec attrs)
const CAT_TREE = [
  { id:"clothing", name:L("Clothing","Одежда","Kiyim"), children:[
    { id:"cl-women", name:L("Women","Женщинам","Ayollar"), children:[
      { id:"cl-w-dresses", name:L("Dresses","Платья","Ko‘ylaklar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-tops", name:L("Tops & blouses","Топы и блузы","Toplar va bluzalar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-trousers", name:L("Trousers","Брюки","Shimlar"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_w"], s:["material","season","fit","brand"] },
      { id:"cl-w-skirts", name:L("Skirts","Юбки","Yubkalar"), v:["color","size_w"], s:["material","season","fit"] },
    ]},
    { id:"cl-men", name:L("Men","Мужчинам","Erkaklar"), children:[
      { id:"cl-m-shirts", name:L("Shirts","Рубашки","Ko‘ylaklar"), v:["color","size_m"], s:["material","season","fit","brand"] },
      { id:"cl-m-tshirts", name:L("T-shirts","Футболки","Futbolkalar"), v:["color","size_m"], s:["material","fit","brand"] },
      { id:"cl-m-trousers", name:L("Trousers","Брюки","Shimlar"), v:["color","size_m"], s:["material","season","fit"] },
      { id:"cl-m-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_m"], s:["material","season","brand"] },
    ]},
    { id:"cl-kids", name:L("Kids","Детям","Bolalar"), children:[
      { id:"cl-k-sets", name:L("Sets","Комплекты","To‘plamlar"), v:["color","size_kids"], s:["material","season"] },
      { id:"cl-k-outer", name:L("Outerwear","Верхняя одежда","Ustki kiyim"), v:["color","size_kids"], s:["material","season"] },
    ]},
  ]},
  { id:"footwear", name:L("Footwear","Обувь","Poyabzal"), children:[
    { id:"fw-women", name:L("Women","Женщинам","Ayollar"), children:[
      { id:"fw-w-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type","season"] },
      { id:"fw-w-boots", name:L("Boots","Сапоги и ботинки","Etiklar"), v:["color","size_shoe"], s:["brand","material","season"] },
      { id:"fw-w-sandals", name:L("Sandals","Сандалии","Sandallar"), v:["color","size_shoe"], s:["brand","material"] },
    ]},
    { id:"fw-men", name:L("Men","Мужчинам","Erkaklar"), children:[
      { id:"fw-m-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type","season"] },
      { id:"fw-m-shoes", name:L("Dress shoes","Туфли","Tuflilar"), v:["color","size_shoe"], s:["brand","material"] },
      { id:"fw-m-boots", name:L("Boots","Ботинки","Botinkalar"), v:["color","size_shoe"], s:["brand","material","season"] },
    ]},
    { id:"fw-kids", name:L("Kids","Детям","Bolalar"), children:[
      { id:"fw-k-sneakers", name:L("Sneakers","Кроссовки","Krossovkalar"), v:["color","size_shoe"], s:["brand","material","shoe_type"] },
    ]},
  ]},
  { id:"vehicles", name:L("Vehicles","Транспорт","Transport"), children:[
    { id:"vh-cars", name:L("Cars","Автомобили","Avtomobillar"), children:[
      { id:"vh-c-sedan", name:L("Sedans","Седаны","Sedanlar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
      { id:"vh-c-suv", name:L("SUVs & crossovers","Внедорожники и кроссоверы","Krossoverlar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
      { id:"vh-c-hatch", name:L("Hatchbacks","Хэтчбеки","Xetchbeklar"), v:[], s:["make","model","year","mileage","fuel","gearbox","engine","color","condition"] },
    ]},
    { id:"vh-parts", name:L("Parts & tyres","Запчасти и шины","Ehtiyot qismlar"), children:[
      { id:"vh-p-tyres", name:L("Tyres","Шины","Shinalar"), v:["tyre_size"], s:["brand","season"] },
      { id:"vh-p-acc", name:L("Accessories","Аксессуары","Aksessuarlar"), v:["color"], s:["brand","make"] },
    ]},
  ]},
  { id:"flowers", name:L("Flowers & plants","Цветы и растения","Gullar va o‘simliklar"), children:[
    { id:"fl-bouquets", name:L("Bouquets","Букеты","Guldastalar"), children:[
      { id:"fl-b-mixed", name:L("Mixed bouquets","Сборные букеты","Aralash guldastalar"), v:["bouquet_size"], s:["flower_type","occasion"] },
      { id:"fl-b-roses", name:L("Roses","Розы","Atirgullar"), v:["bouquet_size","color"], s:["occasion"] },
      { id:"fl-b-dried", name:L("Dried flowers","Сухоцветы","Quruq gullar"), v:["bouquet_size"], s:["flower_type"] },
    ]},
    { id:"fl-plants", name:L("Potted plants","Растения в горшках","Tuvakdagi o‘simliklar"), children:[
      { id:"fl-p-indoor", name:L("Indoor plants","Домашние растения","Uy o‘simliklari"), v:["bouquet_size"], s:["potted"] },
    ]},
  ]},
  { id:"supplements", name:L("Supplements","Витамины и добавки","Vitamin va qo‘shimchalar"), children:[
    { id:"sp-vitamins", name:L("Vitamins","Витамины","Vitaminlar"), children:[
      { id:"sp-v-multi", name:L("Multivitamins","Мультивитамины","Multivitaminlar"), v:["pack","supp_form"], s:["vegan","origin","brand"] },
      { id:"sp-v-single", name:L("Single vitamins","Отдельные витамины","Alohida vitaminlar"), v:["dosage","pack"], s:["supp_form","vegan","brand"] },
    ]},
    { id:"sp-sport", name:L("Sports nutrition","Спортивное питание","Sport ovqatlanish"), children:[
      { id:"sp-s-protein", name:L("Protein","Протеин","Protein"), v:["flavour","weight_g"], s:["supp_form","vegan","brand"] },
      { id:"sp-s-amino", name:L("Amino acids","Аминокислоты","Aminokislotalar"), v:["flavour","pack"], s:["supp_form","brand"] },
    ]},
  ]},
  { id:"gym", name:L("Gym equipment","Товары для спорта","Sport anjomlari"), children:[
    { id:"gy-weights", name:L("Weights","Отягощения","Og‘irliklar"), children:[
      { id:"gy-w-dumbbell", name:L("Dumbbells","Гантели","Gantellar"), v:["weight_kg","color"], s:["grip","brand"] },
      { id:"gy-w-kettle", name:L("Kettlebells","Гири","Girlar"), v:["weight_kg"], s:["grip","brand"] },
    ]},
    { id:"gy-acc", name:L("Accessories","Аксессуары","Aksessuarlar"), children:[
      { id:"gy-a-mats", name:L("Mats","Коврики","Gilamchalar"), v:["color","thickness"], s:["gym_mat","brand"] },
      { id:"gy-a-bands", name:L("Resistance bands","Резинки","Rezinkalar"), v:["color"], s:["brand"] },
    ]},
  ]},
  { id:"electronics", name:L("Electronics","Электроника","Elektronika"), children:[
    { id:"el-phones", name:L("Phones","Телефоны","Telefonlar"), children:[
      { id:"el-p-smart", name:L("Smartphones","Смартфоны","Smartfonlar"), v:["color","storage"], s:["brand","model","ram","screen"] },
    ]},
    { id:"el-audio", name:L("Audio","Аудио","Audio"), children:[
      { id:"el-a-head", name:L("Headphones","Наушники","Naushniklar"), v:["color"], s:["brand","model","wireless","anc"] },
      { id:"el-a-speak", name:L("Speakers","Колонки","Kolonkalar"), v:["color"], s:["brand","model","wireless"] },
    ]},
    { id:"el-comp", name:L("Computers","Компьютеры","Kompyuterlar"), children:[
      { id:"el-c-laptop", name:L("Laptops","Ноутбуки","Noutbuklar"), v:["storage","ram"], s:["brand","model","screen","color"] },
    ]},
  ]},
  { id:"home", name:L("Home & kitchen","Дом и кухня","Uy va oshxona"), children:[
    { id:"hm-kitchen", name:L("Kitchen","Кухня","Oshxona"), children:[
      { id:"hm-k-cook", name:L("Cookware","Посуда для готовки","Pishirish idishlari"), v:["capacity","color"], s:["home_mat","dishwasher","brand"] },
      { id:"hm-k-table", name:L("Tableware & sets","Столовая посуда и сервизы","Dasturxon idishlari va to‘plamlar"), v:["set_size","color"], s:["home_mat","dishwasher","origin"] },
    ]},
    { id:"hm-textile", name:L("Textiles","Текстиль","Tekstil"), children:[
      { id:"hm-t-bedding", name:L("Bedding","Постельное бельё","Choyshablar"), v:["bed_size","color"], s:["home_mat"] },
      { id:"hm-t-towels", name:L("Towels","Полотенца","Sochiqlar"), v:["color"], s:["home_mat"] },
    ]},
    { id:"hm-decor", name:L("Decor","Декор","Dekor"), children:[
      { id:"hm-d-ceramics", name:L("Ceramics","Керамика","Sopol buyumlar"), v:["color"], s:["home_mat","origin"] },
      { id:"hm-d-textile", name:L("Suzani & rugs","Сюзане и ковры","So‘zana va gilamlar"), v:["color"], s:["home_mat","origin"] },
    ]},
  ]},
  { id:"cosmetics", name:L("Cosmetics","Косметика","Kosmetika"), children:[
    { id:"cs-face", name:L("Face","Лицо","Yuz"), children:[
      { id:"cs-f-found", name:L("Foundation","Тональные средства","Tonal kremlar"), v:["shade","volume_ml"], s:["finish","skin_type","brand"] },
      { id:"cs-f-powder", name:L("Powder & blush","Пудра и румяна","Upa va rumyana"), v:["shade"], s:["finish","brand"] },
    ]},
    { id:"cs-lips", name:L("Lips","Губы","Lablar"), children:[
      { id:"cs-l-stick", name:L("Lipstick","Помада","Pomada"), v:["shade"], s:["finish","brand"] },
    ]},
    { id:"cs-skin", name:L("Skincare","Уход за кожей","Teri parvarishi"), children:[
      { id:"cs-s-serum", name:L("Serums","Сыворотки","Sarumlar"), v:["volume_ml"], s:["skin_type","vegan","brand"] },
      { id:"cs-s-cream", name:L("Creams","Кремы","Kremlar"), v:["volume_ml"], s:["skin_type","vegan","brand"] },
    ]},
  ]},
  { id:"food", name:L("Food","Продукты","Oziq-ovqat"), children:[
    { id:"fd-pantry", name:L("Pantry","Продукты","Mahsulotlar"), children:[
      { id:"fd-p-nuts", name:L("Nuts & dried fruit","Орехи и сухофрукты","Yong‘oq va quruq mevalar"), v:["weight_g"], s:["dietary","origin"] },
      { id:"fd-p-honey", name:L("Honey & preserves","Мёд и варенье","Asal va murabbo"), v:["weight_g"], s:["dietary","origin"] },
      { id:"fd-p-bread", name:L("Bread & bakery","Хлеб и выпечка","Non va pishiriqlar"), v:["weight_g"], s:["dietary"] },
    ]},
    { id:"fd-sweets", name:L("Sweets","Сладости","Shirinliklar"), children:[
      { id:"fd-s-choc", name:L("Chocolate & halva","Шоколад и халва","Shokolad va holva"), v:["weight_g","flavour"], s:["dietary","origin"] },
    ]},
    { id:"fd-drinks", name:L("Drinks","Напитки","Ichimliklar"), children:[
      { id:"fd-d-tea", name:L("Tea","Чай","Choy"), v:["weight_g"], s:["tea_type","dietary","origin"] },
      { id:"fd-d-coffee", name:L("Coffee","Кофе","Kofe"), v:["weight_g"], s:["origin","dietary"] },
    ]},
  ]},
  { id:"kids", name:L("Kids & toys","Детские товары","Bolalar mahsulotlari"), children:[
    { id:"kd-toys", name:L("Toys","Игрушки","O‘yinchoqlar"), children:[
      { id:"kd-t-toys", name:L("Toys","Игрушки","O‘yinchoqlar"), v:["color"], s:["age_range","brand"] },
      { id:"kd-t-games", name:L("Board games & puzzles","Настольные игры и пазлы","Stol o‘yinlari va boshqotirmalar"), v:[], s:["age_range","brand"] },
    ]},
    { id:"kd-baby", name:L("Baby","Малыши","Chaqaloqlar"), children:[
      { id:"kd-b-care", name:L("Baby care","Уход за малышом","Chaqaloq parvarishi"), v:[], s:["age_range","brand"] },
      { id:"kd-b-gear", name:L("Strollers & car seats","Коляски и автокресла","Aravacha va avtokreslo"), v:["color"], s:["age_range","brand"] },
    ]},
  ]},
  { id:"bags", name:L("Bags & accessories","Сумки и аксессуары","Sumka va aksessuarlar"), children:[
    { id:"ba-bags", name:L("Bags","Сумки","Sumkalar"), children:[
      { id:"ba-b-hand", name:L("Handbags","Женские сумки","Ayollar sumkalari"), v:["color"], s:["material","brand"] },
      { id:"ba-b-back", name:L("Backpacks","Рюкзаки","Ryukzaklar"), v:["color"], s:["material","brand"] },
    ]},
    { id:"ba-acc", name:L("Accessories","Аксессуары","Aksessuarlar"), children:[
      { id:"ba-a-belts", name:L("Belts & wallets","Ремни и кошельки","Kamar va hamyonlar"), v:["color"], s:["material","brand"] },
      { id:"ba-a-scarves", name:L("Scarves & hats","Платки и головные уборы","Ro‘mol va bosh kiyimlar"), v:["color"], s:["material","season"] },
      { id:"ba-a-sun", name:L("Sunglasses","Солнцезащитные очки","Quyosh ko‘zoynaklari"), v:["color"], s:["brand"] },
    ]},
  ]},
  { id:"jewellery", name:L("Jewellery & watches","Украшения и часы","Taqinchoq va soatlar"), children:[
    { id:"jw-jewel", name:L("Jewellery","Украшения","Taqinchoqlar"), children:[
      { id:"jw-j-rings", name:L("Rings","Кольца","Uzuklar"), v:["ring_size"], s:["metal","brand"] },
      { id:"jw-j-ear", name:L("Earrings","Серьги","Sirg‘alar"), v:["color"], s:["metal","brand"] },
      { id:"jw-j-neck", name:L("Necklaces & bracelets","Цепочки и браслеты","Zanjir va bilaguzuklar"), v:["color"], s:["metal","brand"] },
    ]},
    { id:"jw-watch", name:L("Watches","Часы","Soatlar"), children:[
      { id:"jw-w-watch", name:L("Watches","Часы","Soatlar"), v:["color"], s:["brand","metal"] },
    ]},
  ]},
  { id:"books", name:L("Books & stationery","Книги и канцтовары","Kitob va kanselyariya"), children:[
    { id:"bk-books", name:L("Books","Книги","Kitoblar"), children:[
      { id:"bk-b-books", name:L("Books","Книги","Kitoblar"), v:["book_lang"], s:["author","cover_type"] },
    ]},
    { id:"bk-stat", name:L("Stationery","Канцтовары","Kanselyariya"), children:[
      { id:"bk-s-stat", name:L("Notebooks & stationery","Блокноты и канцтовары","Daftar va kanselyariya"), v:["color"], s:["brand"] },
    ]},
  ]},
  { id:"pets", name:L("Pet supplies","Зоотовары","Uy hayvonlari uchun"), children:[
    { id:"pt-food", name:L("Pet food","Корм","Yem"), children:[
      { id:"pt-f-food", name:L("Pet food","Корм для животных","Hayvonlar uchun yem"), v:["weight_g"], s:["pet_type","brand"] },
    ]},
    { id:"pt-acc", name:L("Toys & accessories","Игрушки и аксессуары","O‘yinchoq va aksessuarlar"), children:[
      { id:"pt-a-acc", name:L("Toys & accessories","Игрушки и аксессуары","O‘yinchoq va aksessuarlar"), v:["color"], s:["pet_type","brand"] },
    ]},
  ]},
];

// ---- Google Product Taxonomy alignment (version 2021-09-21), trimmed for sellers in Uzbekistan ----
// Main categories and groups follow Google's tree and names (Russian = Google's ru-RU names);
// every node carries gid = its Google category ID. Leaf ids are kept, so existing products stay valid.
(function alignToGoogle(){
  const pool = {};
  CAT_TREE.forEach(r=>(r.children||[]).forEach(g=>(g.children||[]).forEach(l=>{ pool[l.id] = l; })));
  const lf = (id, gid, name, v, s)=>{
    const l = pool[id] || { id, v: v||["color"], s: s||["brand"] };
    if(name) l.name = name;
    l.gid = gid; return l;
  };
  const gr = (id, gid, name, children)=>({ id, gid, name, children });
  const rt = gr;
  const TREE = [
    rt("clothing", 166, L("Apparel & Accessories","Предметы одежды и принадлежности","Kiyim va aksessuarlar"), [
      gr("ap-clothing", 1604, L("Clothing","Одежда","Kiyim"), [
        lf("cl-w-dresses", 2271, L("Dresses","Платья","Ko‘ylaklar")),
        lf("cl-w-tops", 212, L("Women’s tops & blouses","Женские рубашки и топы","Ayollar toplari va bluzalari")),
        lf("cl-w-trousers", 204, L("Women’s trousers","Женские штаны","Ayollar shimlari")),
        lf("cl-w-skirts", 1581, L("Skirts","Юбки","Yubkalar")),
        lf("cl-w-outer", 203, L("Women’s outerwear","Женская верхняя одежда","Ayollar ustki kiyimi")),
        lf("cl-m-shirts", 212, L("Men’s shirts","Мужские рубашки","Erkaklar ko‘ylaklari")),
        lf("cl-m-tshirts", 212, L("T-shirts","Футболки","Futbolkalar")),
        lf("cl-m-trousers", 204, L("Men’s trousers","Мужские штаны","Erkaklar shimlari")),
        lf("cl-m-outer", 203, L("Men’s outerwear","Мужская верхняя одежда","Erkaklar ustki kiyimi")),
        lf("cl-k-sets", 182, L("Kids’ clothing sets","Детские комплекты","Bolalar kiyim to‘plamlari")),
        lf("cl-k-outer", 182, L("Kids’ outerwear","Детская верхняя одежда","Bolalar ustki kiyimi")),
        lf("cl-trad", 5388, L("Traditional & national wear","Традиционная и церемониальная одежда","Milliy kiyimlar"), ["size_w","color"], ["material"]),
        lf("cl-sport", 5322, L("Activewear","Спортивная одежда","Sport kiyimi"), ["size_m","color"], ["material","brand"]),
        lf("cl-under", 213, L("Underwear & socks","Носки и нижнее белье","Ichki kiyim va paypoqlar"), ["size_w","color"], ["material"]),
      ]),
      gr("footwear", 187, L("Shoes","Обувь","Poyabzal"),
        ["fw-w-sneakers","fw-w-boots","fw-w-sandals","fw-m-sneakers","fw-m-shoes","fw-m-boots","fw-k-sneakers"].map(id=>lf(id, 187))),
      gr("bags", 6551, L("Handbags, Wallets & Cases","Ручные сумки, кошельки и чехлы","Sumka va hamyonlar"), [
        lf("ba-b-hand", 3032, L("Handbags","Дамские ручные сумки","Ayollar sumkalari")),
        lf("ap-wallet", 2668, L("Wallets","Кошельки","Hamyonlar"), ["color"], ["material","brand"]),
      ]),
      gr("ap-acc", 167, L("Clothing Accessories","Принадлежности для одежды","Kiyim aksessuarlari"), [
        lf("ba-a-belts", 169, L("Belts","Поясные ремни","Kamarlar")),
        lf("ba-a-scarves", 177, L("Scarves, shawls & hats","Шарфы, шали и шляпы","Sharf, ro‘mol va bosh kiyimlar")),
        lf("ba-a-sun", 178, L("Sunglasses","Солнечные очки","Quyosh ko‘zoynaklari")),
      ]),
      gr("jewellery", 188, L("Jewelry","Ювелирные украшения","Taqinchoqlar"), [
        lf("jw-j-rings", 200), lf("jw-j-ear", 194),
        lf("jw-j-neck", 196, L("Necklaces & bracelets","Ожерелья и браслеты","Marjon va bilaguzuklar")),
        lf("jw-w-watch", 201, L("Watches","Наручные часы","Soatlar")),
      ]),
    ]),
    rt("luggage", 5181, L("Luggage & Bags","Багаж и сумки","Bagaj va sumkalar"), [
      gr("lg-bags", 5181, L("Luggage & Bags","Багаж и сумки","Bagaj va sumkalar"), [
        lf("ba-b-back", 100, L("Backpacks","Рюкзаки","Ryukzaklar")),
        lf("lg-suit", 107, L("Suitcases","Чемоданы","Chamadonlar"), ["color"], ["material","brand"]),
      ]),
    ]),
    rt("cosmetics", 469, L("Health & Beauty","Красота и здоровье","Go‘zallik va salomatlik"), [
      gr("pc-makeup", 477, L("Makeup","Макияж","Pardoz"), [ lf("cs-f-found", 2571), lf("cs-f-powder", 2571), lf("cs-l-stick", 2645) ]),
      gr("pc-skin", 567, L("Skin Care","Средства для ухода за кожей","Teri parvarishi"), [ lf("cs-s-serum", 567), lf("cs-s-cream", 2592) ]),
      gr("pc-perf", 479, L("Perfume & Cologne","Парфюмерия","Atir-upa"), [
        lf("cs-perf", 479, L("Perfume","Парфюм","Atirlar"), ["volume_ml"], ["brand"]) ]),
      gr("pc-hair", 486, L("Hair Care","Средства для ухода за волосами","Soch parvarishi"), [
        lf("cs-hair", 486, L("Hair care & styling","Уход и укладка волос","Soch parvarishi va turmaklash"), ["volume_ml"], ["brand"]) ]),
      gr("supplements", 2890, L("Fitness & Nutrition","Фитнес и питание","Fitnes va ovqatlanish"), [
        lf("sp-v-multi", 525), lf("sp-v-single", 525), lf("sp-s-protein", 5702), lf("sp-s-amino", 5702) ]),
    ]),
    rt("food", 412, L("Food, Beverages & Tobacco","Продукты, напитки и табачные изделия","Oziq-ovqat va ichimliklar"), [
      gr("fd-items", 422, L("Food Items","Пищевые продукты","Oziq-ovqat mahsulotlari"), [
        lf("fd-p-bread", 1876), lf("fd-s-choc", 4748), lf("fd-p-nuts", 433), lf("fd-p-honey", 422),
        lf("fd-fruit", 430, L("Fruit & vegetables","Фрукты и овощи","Meva va sabzavotlar"), ["weight_g"], ["origin","dietary"]),
        lf("fd-dairy", 428, L("Dairy","Молочные продукты","Sut mahsulotlari"), ["weight_g"], ["dietary"]),
        lf("fd-ready", 5814, L("Prepared meals","Готовые блюда","Tayyor taomlar"), [], ["dietary"]),
      ]),
      gr("fd-drinks", 413, L("Beverages","Напитки","Ichimliklar"), [ lf("fd-d-tea", 2073), lf("fd-d-coffee", 1868) ]),
    ]),
    rt("home", 536, L("Home & Garden","Дом и сад","Uy va bog‘"), [
      gr("hm-kitchen", 638, L("Kitchen & Dining","Товары для кухни и столовой","Oshxona va dasturxon"), [
        lf("hm-k-cook", 6070), lf("hm-k-table", 672),
        lf("hm-k-drink", 674, L("Drinkware — piyola, cups, glasses","Посуда для напитков","Piyola, kosa va stakanlar"), ["set_size","color"], ["home_mat","origin"]),
        lf("hm-k-tools", 668, L("Kitchen tools & utensils","Кухонные приборы и утварь","Oshxona anjomlari"), ["color"], ["home_mat"]),
      ]),
      gr("hm-textile", 4171, L("Linens & Bedding","Постельное бельё","Choyshab va sochiqlar"), [ lf("hm-t-bedding", 569), lf("hm-t-towels", 4077) ]),
      gr("hm-decor", 696, L("Decor","Декоративные элементы","Bezaklar"), [
        lf("hm-d-ceramics", 696), lf("hm-d-textile", 598),
        lf("hm-d-vase", 602, L("Vases & clocks","Вазы и часы","Vaza va soatlar"), ["color"], ["home_mat"]),
      ]),
      gr("hm-house", 630, L("Household Supplies","Хозяйственные товары","Xo‘jalik mollari"), [
        lf("hm-h-clean", 623, L("Cleaning supplies","Средства для уборки","Tozalash vositalari"), ["volume_ml"], ["brand"]) ]),
      gr("hm-appl", 604, L("Household Appliances","Бытовые приборы","Maishiy texnika"), [
        lf("hm-a-kitchen", 730, L("Kitchen appliances","Кухонная техника","Oshxona texnikasi"), ["color"], ["brand","model","condition"]),
        lf("hm-a-laundry", 2706, L("Washing machines","Устройства для стирки","Kir yuvish mashinalari"), ["color"], ["brand","model","condition"]),
      ]),
      gr("flowers", 985, L("Plants & flowers","Растения и цветы","O‘simlik va gullar"), [
        lf("fl-b-mixed", 2899), lf("fl-b-roses", 2899), lf("fl-b-dried", 6936), lf("fl-p-indoor", 985) ]),
    ]),
    rt("furniture", 436, L("Furniture","Мебель","Mebel"), [
      gr("fu-main", 436, L("Furniture","Мебель","Mebel"), [
        lf("fu-sofa", 460, L("Sofas","Диваны","Divanlar"), ["color"], ["material","brand"]),
        lf("fu-bed", 6433, L("Beds","Кровати","Karavotlar"), ["bed_size","color"], ["material","brand"]),
        lf("fu-table", 6392, L("Tables","Столы","Stollar"), ["color"], ["material","brand"]),
        lf("fu-chair", 443, L("Chairs","Кресла и стулья","Stul va kreslolar"), ["color"], ["material","brand"]),
        lf("fu-cab", 6356, L("Wardrobes & storage","Шкафы и мебель для хранения","Shkaf va javonlar"), ["color"], ["material","brand"]),
      ]),
    ]),
    rt("electronics", 222, L("Electronics","Электроника","Elektronika"), [
      gr("el-phones", 270, L("Telephony","Телефония","Telefonlar"), [
        lf("el-p-smart", 267, L("Mobile phones","Мобильные телефоны","Mobil telefonlar")),
        lf("el-p-acc", 264, L("Phone accessories","Принадлежности для мобильных телефонов","Telefon aksessuarlari"), ["color"], ["brand","model"]),
      ]),
      gr("el-audio", 223, L("Audio","Аудиосистемы","Audio"), [ lf("el-a-head", 505771), lf("el-a-speak", 249) ]),
      gr("el-comp", 278, L("Computers","Компьютеры","Kompyuterlar"), [
        lf("el-c-laptop", 328),
        lf("el-c-tablet", 4745, L("Tablets","Планшеты","Planshetlar"), ["storage","color"], ["brand","model","ram","screen"]),
      ]),
      gr("el-video", 386, L("Video","Видеоаппаратура","Video texnika"), [
        lf("el-v-tv", 404, L("Televisions","Телевизоры","Televizorlar"), [], ["brand","model","screen","condition"]) ]),
    ]),
    rt("kids", 537, L("Baby & Toddler","Товары для новорожденных и маленьких детей","Chaqaloq va kichik bolalar uchun"), [
      gr("kd-baby", 537, L("Baby & Toddler","Товары для малышей","Chaqaloqlar uchun"), [
        lf("kd-b-diaper", 548, L("Diapers","Подгузники","Tagliklar"), [], ["age_range","brand"]),
        lf("kd-b-care", 5252), lf("kd-b-gear", 2764) ]),
    ]),
    rt("toys", 1239, L("Toys & Games","Игры и игрушки","O‘yin va o‘yinchoqlar"), [
      gr("kd-toys", 1239, L("Toys & Games","Игры и игрушки","O‘yin va o‘yinchoqlar"), [ lf("kd-t-toys", 1253), lf("kd-t-games", 1246) ]),
    ]),
    rt("gym", 988, L("Sporting Goods","Спортивные товары","Sport mollari"), [
      gr("gy-fit", 990, L("Exercise & Fitness","Товары для фитнеса","Fitnes anjomlari"), [
        lf("gy-w-dumbbell", 3164), lf("gy-w-kettle", 3164), lf("gy-a-mats", 999), lf("gy-a-bands", 5869) ]),
    ]),
    rt("books", 783, L("Media","Средства информации","Kitob va media"), [
      gr("bk-books", 784, L("Books","Книги","Kitoblar"), [ lf("bk-b-books", 784) ]),
    ]),
    rt("office", 922, L("Office Supplies","Канцелярские товары","Kanselyariya"), [
      gr("bk-stat", 932, L("Office & school supplies","Общие принадлежности","Ofis va maktab anjomlari"), [
        lf("bk-s-stat", 932),
        lf("of-write", 977, L("Pens & pencils","Ручки и карандаши","Ruchka va qalamlar"), ["color"], ["brand"]) ]),
    ]),
    rt("pets", 1, L("Animals & Pet Supplies","Животные и товары для питомцев","Uy hayvonlari uchun"), [
      gr("pt-supplies", 2, L("Pet Supplies","Товары для домашних животных","Uy hayvonlari mahsulotlari"), [ lf("pt-f-food", 3530), lf("pt-a-acc", 2) ]),
    ]),
    rt("vehicles", 888, L("Vehicles & Parts","Транспортные средства и запчасти","Transport va ehtiyot qismlar"), [
      gr("vh-parts", 5613, L("Vehicle Parts & Accessories","Автомобильные детали и принадлежности","Ehtiyot qism va aksessuarlar"), [ lf("vh-p-tyres", 911), lf("vh-p-acc", 5613) ]),
      gr("vh-cars", 5614, L("Vehicles","Транспортные средства","Avtomobillar"), [ lf("vh-c-sedan", 916), lf("vh-c-suv", 916), lf("vh-c-hatch", 916) ]),
    ]),
    rt("arts", 8, L("Arts & Entertainment","Искусство и развлечения","San’at va hobbi"), [
      gr("ar-craft", 5710, L("Hobbies & Creative Arts","Хобби и творчество","Hobbi va ijod"), [
        lf("ar-c-craft", 16, L("Handmade & craft supplies","Рукоделие и хобби","Qo‘l mehnati va hunarmandchilik"), ["color"], ["material"]) ]),
      gr("ar-gift", 2559, L("Gift Giving","Подарки","Sovg‘alar"), [
        lf("ar-g-gift", 2559, L("Gift sets & boxes","Подарочные наборы","Sovg‘a to‘plamlari"), [], ["occasion"]) ]),
    ]),
  ];
  CAT_TREE.splice(0, CAT_TREE.length, ...TREE);
})();

// ---- Instagram / Telegram sellers: categories that sell well in Uzbekistan (Google IDs kept) ----
(function addSocialCommerce(){
  const root = (id)=> CAT_TREE.find(r=>r.id===id);
  const group = (rid, gid)=> (root(rid).children||[]).find(g=>g.id===gid);
  const leaf = (id, gid, name, v, s)=>({ id, gid, name, v, s });
  const add = (rid, gid, leaves)=> group(rid, gid).children.push(...leaves);
  const newGroup = (rid, g)=> root(rid).children.push(g);

  // food: cakes & desserts to order, national sweets, spices
  add("food","fd-items",[
    leaf("fd-cake",1876,L("Custom cakes (tortlar)","Торты на заказ","Buyurtma tortlar"),["cake_weight","filling"],["made_to_order","lead_days","inscription","dietary"]),
    leaf("fd-bento",1876,L("Bento cakes","Бенто-торты","Bento tortlar"),["filling"],["made_to_order","lead_days","inscription"]),
    leaf("fd-cupcake",1876,L("Cupcakes & desserts","Капкейки и десерты","Keks va desertlar"),["box_pcs","filling"],["made_to_order","dietary"]),
    leaf("fd-sweetbox",4748,L("Sweet & gift boxes","Сладкие подарки","Shirinlik qutilari"),["box_pcs"],["occasion","made_to_order"]),
    leaf("fd-natsweet",4748,L("National sweets — chak-chak, parvarda, holva","Национальные сладости","Milliy shirinliklar"),["weight_g"],["origin","dietary"]),
    leaf("fd-spice",4608,L("Spices & dried fruit","Специи и сухофрукты","Ziravorlar va quruq mevalar"),["weight_g"],["origin","dietary"]),
  ]);
  // apparel: modest fashion, maternity, sports shoes, hair extensions
  add("clothing","ap-clothing",[
    leaf("cl-abaya",2271,L("Abayas & long dresses","Абаи и длинные платья","Abaya va uzun ko‘ylaklar"),["size_w","color"],["material","season"]),
    leaf("cl-modest",1604,L("Modest sets","Закрытые комплекты","Yopiq to‘plamlar"),["size_w","color"],["material"]),
    leaf("cl-maternity",1604,L("Maternity wear","Одежда для беременных","Homilador ayollar kiyimi"),["size_w","color"],["material","season"]),
  ]);
  add("clothing","ap-acc",[
    leaf("ap-hijab",177,L("Hijabs & underscarves","Хиджабы и подплатки","Hijob va ichki ro‘mollar"),["color"],["material"]),
    leaf("ap-hairext",4057,L("Hair extensions & wigs","Наращивание и парики","Soch uzaytirish va pariklar"),["hair_len","color"],["material"]),
  ]);
  add("clothing","footwear",[
    leaf("fw-sport",187,L("Football boots & sports shoes","Бутсы и спортивная обувь","Butsi va sport poyabzali"),["size_shoe","color"],["brand","in_out"]),
  ]);
  newGroup("clothing", { id:"ap-wedding", gid:5441, name:L("Wedding & sarpo","Свадебное и сарпо","To‘y va sarpo"), children:[
    leaf("wd-dress",5329,L("Wedding dresses","Свадебные платья","Kelinlik ko‘ylaklari"),["size_w","sale_rent"],["rent_days","material"]),
    leaf("wd-evening",5441,L("Evening & guest dresses","Вечерние платья","Kechki ko‘ylaklar"),["size_w","color","sale_rent"],["rent_days","material"]),
    leaf("wd-sarpo",5441,L("Sarpo sets","Сарпо","Sarpo to‘plamlari"),["set_size"],["set_items","occasion"]),
    leaf("wd-national",5388,L("National wedding wear — kelin libos, chapan","Национальная свадебная одежда","Milliy to‘y liboslari"),["size_w","color"],["handmade","region"]),
  ]});
  // beauty: nails & lashes
  newGroup("cosmetics", { id:"pc-nails", gid:478, name:L("Nail & lash supplies","Ногти и ресницы","Tirnoq va kiprik vositalari"), children:[
    leaf("cs-nail",478,L("Nail polish & gel","Лаки и гели","Lak va gellar"),["color"],["brand"]),
    leaf("cs-lash",477,L("Lash & brow supplies","Для ресниц и бровей","Kiprik va qosh uchun"),["option"],["brand"]),
  ]});
  // home: textiles, candles, soap
  add("home","hm-textile",[
    leaf("hm-t-curtain",2882,L("Curtains (parda)","Шторы","Pardalar"),["color"],["material","blackout"]),
    leaf("hm-t-table",601,L("Tablecloths (dasturxon)","Скатерти","Dasturxonlar"),["color"],["material"]),
    leaf("hm-t-cushion",4454,L("Cushions & covers","Подушки и наволочки","Yostiq va jildlar"),["color"],["material"]),
    leaf("hm-t-kurpacha",4171,L("Kurpacha & blankets","Курпача и одеяла","Ko‘rpacha va adyollar"),["bed_size","color"],["material","handmade"]),
  ]);
  add("home","hm-decor",[
    leaf("hm-d-candle",592,L("Candles & home scents","Свечи и ароматы","Shamlar va xushbo‘yliklar"),["scent"],["handmade"]),
  ]);
  // electronics: smartwatches
  add("electronics","el-audio",[]);
  root("electronics").children.push({ id:"el-wear", gid:500009, name:L("Smartwatches & trackers","Умные часы и трекеры","Aqlli soatlar"), children:[
    leaf("el-w-watch",500009,L("Smartwatches","Умные часы","Aqlli soatlar"),["color"],["brand","model","compat"]),
  ]});
  // arts: party & celebration, handmade
  newGroup("arts", { id:"ar-party", gid:96, name:L("Party Supplies","Товары для вечеринок","Bayram mollari"), children:[
    leaf("pt-balloon",2587,L("Balloon sets","Воздушные шары","Havo sharlari"),["color","set_size"],["helium","occasion"]),
    leaf("pt-decor",96,L("Birthday & party decor","Декор для праздника","Bayram bezaklari"),["color"],["theme","occasion"]),
    leaf("pt-wrap",94,L("Gift boxes & wrapping","Подарочная упаковка","Sovg‘a qadoqlari"),["color"],["occasion"]),
    leaf("pt-candle",4730,L("Cake candles & toppers","Свечи и топперы для торта","Tort shamlari va topperlar"),["color"],["occasion"]),
  ]});
  add("arts","ar-craft",[
    leaf("hd-soap",2503,L("Handmade soap","Мыло ручной работы","Qo‘lda yasalgan sovun"),["scent"],["handmade","vegan"]),
    leaf("hd-knit",16,L("Knitted items","Вязаные изделия","To‘qilgan buyumlar"),["color"],["material","made_to_order"]),
    leaf("hd-embroid",16,L("Embroidery & suzani","Вышивка и сюзане","Kashta va so‘zana"),["color"],["handmade","region"]),
    leaf("hd-resin",16,L("Resin & art pieces","Эпоксидка и арт-объекты","Epoksid va san’at buyumlari"),["color"],["made_to_order","lead_days"]),
  ]);
  // religious goods: Google's Religious & Ceremonial
  CAT_TREE.push({ id:"religious", gid:5605, name:L("Religious & Ceremonial","Товары для церемоний и религиозных обрядов","Diniy buyumlar"), children:[
    { id:"rl-items", gid:97, name:L("Religious Items","Культовые товары","Diniy buyumlar"), children:[
      leaf("rl-mat",97,L("Prayer mats (joynamoz)","Молитвенные коврики","Joynamozlar"),["color"],["material"]),
      leaf("rl-tasbeh",3923,L("Tasbeh","Чётки","Tasbehlar"),["color","bead_count"],["material"]),
      leaf("rl-quran",97,L("Quran & Quran stands","Коран и подставки","Qur’on va lavhlar"),["book_lang"],["cover_type","material"]),
      leaf("rl-gift",97,L("Islamic gifts & decor","Исламские подарки и декор","Islomiy sovg‘alar"),["color"],["occasion"]),
    ]},
  ]});
  // sport: full Google Sporting Goods groups
  add("gym","gy-fit",[
    leaf("gy-rack",3542,L("Home gym racks & benches","Стойки и скамьи","Turnik va skameykalar"),["color"],["max_load","brand"]),
    leaf("gy-cardio",4589,L("Treadmills & exercise bikes","Кардиотренажёры","Kardio trenajyorlar"),["color"],["brand","max_load","foldable"]),
    leaf("gy-small",2614,L("Jump ropes, ab wheels & balls","Скакалки, ролики и мячи","Arqon, rolik va to‘plar"),["color"],["brand"]),
  ]);
  const bandsLeaf = group("gym","gy-fit").children.find(l=>l.id==="gy-a-bands"); if(bandsLeaf && !bandsLeaf.v.includes("resistance")) bandsLeaf.v = ["resistance"].concat(bandsLeaf.v);
  newGroup("gym", { id:"gy-ath", gid:499713, name:L("Athletics","Товары для атлетических видов спорта","Sport turlari"), children:[
    leaf("sp-football",1111,L("Football","Футбол","Futbol"),["ball_size","color"],["brand","in_out"]),
    leaf("sp-basket",1081,L("Basketball","Баскетбол","Basketbol"),["ball_size"],["brand","in_out"]),
    leaf("sp-volley",1115,L("Volleyball","Волейбол","Voleybol"),["color"],["brand"]),
    leaf("sp-combat",499719,L("Boxing & martial arts","Бокс и единоборства","Boks va yakkakurash"),["glove_oz","color"],["sport_type","brand"]),
    leaf("sp-wrestle",1068,L("Wrestling & kurash","Борьба и кураш","Kurash va kurash kiyimi"),["size_m","color"],["sport_type","brand"]),
    leaf("sp-racket",1065,L("Tennis & badminton","Теннис и бадминтон","Tennis va badminton"),["color"],["brand"]),
    leaf("sp-gymnast",1000,L("Gymnastics & dance","Гимнастика и танцы","Gimnastika va raqs"),["size_w","color"],["material"]),
  ]});
  newGroup("gym", { id:"gy-out", gid:1011, name:L("Outdoor Recreation","Товары для отдыха на открытом воздухе","Ochiq havoda dam olish"), children:[
    leaf("sp-bike",1026,L("Bicycles & scooters","Велосипеды и самокаты","Velosiped va samokatlar"),["wheel_size","color"],["brand"]),
    leaf("sp-bikeacc",1025,L("Cycling accessories","Велоаксессуары","Velo aksessuarlar"),["color"],["brand"]),
    leaf("sp-camp",1013,L("Camping & hiking","Кемпинг и походы","Kemping va sayohat"),["color"],["season","brand"]),
    leaf("sp-fish",3334,L("Fishing","Рыбалка","Baliq ovi"),["option"],["brand"]),
    leaf("sp-swim",1144,L("Swimming","Плавание","Suzish"),["size_w","color"],["brand"]),
    leaf("sp-winter",499844,L("Ski & snowboard","Лыжи и сноуборд","Chang‘i va snoubord"),["option"],["brand"]),
  ]});
  newGroup("gym", { id:"gy-indoor", gid:1001, name:L("Indoor Games","Зальные игры","Xona o‘yinlari"), children:[
    leaf("sp-pingpong",1008,L("Table tennis","Настольный теннис","Stol tennisi"),["option"],["brand"]),
    leaf("sp-billiard",1003,L("Billiards","Бильярд","Bilyard"),["option"],["brand"]),
    leaf("sp-darts",1005,L("Darts","Дартс","Dart"),["option"],["brand"]),
  ]});
})();

// every main category ends with "Other": no fixed fields, sellers add their own option values
CAT_TREE.forEach(root=>{
  root.children.push({ id:root.id+"-oth", gid:root.gid, name:L("Other","Другое","Boshqa"), children:[
    { id:root.id+"-oth-x", gid:root.gid, name:L("Other — "+root.name.en.toLowerCase(), "Другое — "+root.name.ru.toLowerCase(), "Boshqa — "+root.name.uz.toLowerCase()), v:["color","option"], s:["brand"] },
  ]});
  // every leaf also accepts one seller-named option (e.g. "Pattern"), its name stored on the product
  root.children.forEach(g=>(g.children||[]).forEach(leaf=>{
    if(!leaf.v.includes("option")) leaf.v = leaf.v.concat("option");
    // new / used, where second-hand selling makes sense
    if(!["food","cosmetics","pets","religious"].includes(root.id) && !(leaf.s||[]).includes("condition")) leaf.s = (leaf.s||[]).concat("condition");
  }));
});

// ---- lookups -----------------------------------------------------------
const CAT_INDEX = {};
(function index(){
  CAT_TREE.forEach(root=>{
    CAT_INDEX[root.id] = { node:root, level:0, path:[root.id] };
    (root.children||[]).forEach(group=>{
      CAT_INDEX[group.id] = { node:group, level:1, path:[root.id, group.id], parent:root.id };
      (group.children||[]).forEach(leaf=>{
        CAT_INDEX[leaf.id] = { node:leaf, level:2, path:[root.id, group.id, leaf.id], parent:group.id, leaf:true };
      });
    });
  });
})();

function catNode(id){ const e = CAT_INDEX[id]; return e? e.node : null; }
function catEntry(id){ return CAT_INDEX[id] || null; }
function isLeafCat(id){ const e = CAT_INDEX[id]; return !!(e && e.leaf); }
function catPathIds(id){ const e = CAT_INDEX[id]; return e? e.path : []; }
function catGoogleId(id){ const n = catNode(id); return n && n.gid!=null? n.gid : null; }   // for Google Shopping / Meta catalog feeds
function catLabel(id, lang){ const n = catNode(id); return n? n.name[lang] : "—"; }
function catBreadcrumb(id, lang, sep){
  return catPathIds(id).map(x=>catLabel(x,lang)).join(sep || " › ");
}
function catRoots(){ return CAT_TREE; }
function catGroups(rootId){ const n = catNode(rootId); return (n && n.children) || []; }
function catLeaves(groupId){ const n = catNode(groupId); return (n && n.children) || []; }
function allLeafCats(){
  return Object.keys(CAT_INDEX).filter(isLeafCat).map(id=>({ id, node:catNode(id) }));
}

// attribute definitions for a leaf category, in display order
function attrDef(attrId){
  const a = ATTRS[attrId];
  return a? { id:attrId, ...a } : null;
}
function variantAttrs(catId){
  const n = catNode(catId);
  return ((n && n.v) || []).map(attrDef).filter(Boolean);
}
function specAttrs(catId){
  const n = catNode(catId);
  return ((n && n.s) || []).map(attrDef).filter(Boolean);
}
function attrValueName(attrId, valId, lang){
  const a = ATTRS[attrId];
  const own = String(valId).replace(/^c:/, "");   // seller-typed values are stored as "c:<text>"
  if(!a || !a.values) return own;
  const v = a.values.find(x=>x.id===String(valId));
  return v? v.name[lang] : own;
}
function attrValueHex(attrId, valId){
  const a = ATTRS[attrId];
  if(!a || !a.values) return null;
  const v = a.values.find(x=>x.id===String(valId));
  return v? (v.hex||null) : null;
}
function sizeChartFor(catId){
  const va = variantAttrs(catId).find(a=>a.chart);
  return va? { attr:va, chart:SIZE_CHARTS[va.chart] } : null;
}

// ---- variants from structured options ----------------------------------
// v.options is { color:"ivory", size_w:"m" } — no string parsing anywhere
function variantLabel(catId, options, lang){
  return variantAttrs(catId)
    .map(a=> options[a.id]? attrValueName(a.id, options[a.id], lang) : null)
    .filter(Boolean).join(" · ");
}
function cartesian(lists){
  return lists.reduce((acc, l)=> acc.flatMap(a=> l.map(b=> [...a, b])), [[]]);
}
// chosen: { color:["ivory","black"], size_w:["s","m"] } → one options object per combination
function combineOptions(catId, chosen){
  const attrs = variantAttrs(catId).filter(a=> (chosen[a.id]||[]).length);
  if(!attrs.length) return [{}];
  const combos = cartesian(attrs.map(a=> chosen[a.id]));
  return combos.map(combo=>{
    const o = {};
    attrs.forEach((a,i)=>{ o[a.id] = combo[i]; });
    return o;
  });
}
function optionsKey(options){
  return Object.keys(options).sort().map(k=>k+":"+options[k]).join("|");
}
// which values a product actually offers, per variant attribute
function offeredOptions(p){
  const out = {};
  variantAttrs(p.catId).forEach(a=>{
    const seen = [];
    (p.variants||[]).forEach(v=>{
      const val = (v.options||{})[a.id];
      if(val && !seen.includes(val)) seen.push(val);
    });
    if(seen.length){
      const order = (a.values||[]).map(x=>x.id);
      seen.sort((x,y)=>order.indexOf(x)-order.indexOf(y));
      out[a.id] = seen;
    }
  });
  return out;
}
// the variant matching a full selection
function variantFor(p, sel){
  return (p.variants||[]).find(v=>{
    const o = v.options||{};
    return Object.keys(sel).every(k=> o[k]===sel[k]);
  }) || null;
}
// is any in-stock variant still reachable if this value were picked?
function optionReachable(p, sel, attrId, value){
  const want = { ...sel, [attrId]:value };
  delete want.__none;
  return (p.variants||[]).some(v=>{
    const o = v.options||{};
    return v.qty>0 && Object.keys(want).every(k=> want[k]==null || o[k]===want[k]);
  });
}

Object.assign(window, {
  L, COLORS, ATTRS, SIZE_CHARTS, CAT_TREE, CAT_INDEX,
  catGoogleId, catNode, catEntry, isLeafCat, catPathIds, catLabel, catBreadcrumb, catRoots, catGroups, catLeaves, allLeafCats,
  attrDef, variantAttrs, specAttrs, attrValueName, attrValueHex, sizeChartFor,
  variantLabel, combineOptions, optionsKey, offeredOptions, variantFor, optionReachable, cartesian,
});

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { L, COLORS, vals, SIZE_CHARTS, ATTRS, CAT_TREE, CAT_INDEX, catNode, catEntry, isLeafCat, catPathIds, catGoogleId, catLabel, catBreadcrumb, catRoots, catGroups, catLeaves, allLeafCats, attrDef, variantAttrs, specAttrs, attrValueName, attrValueHex, sizeChartFor, variantLabel, cartesian, combineOptions, optionsKey, offeredOptions, variantFor, optionReachable });
