// ===== rastashops.com v2 — inventory data model, taxonomy, seeded sales, i18n additions =====

function _hash(s){ let h=2166136261; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function addI18N(map){ Object.keys(map).forEach(k=>{ const v=map[k]; I18N.en[k]=v[0]; I18N.ru[k]=v[1]; I18N.uz[k]=v[2]; }); }
function fill(s, o){ return String(s).replace(/\{(\w+)\}/g, (_,k)=> o[k]!=null? o[k] : "{"+k+"}"); }

// ---------- landing / general copy rewritten around catalog + inventory ----------
addI18N({
  hero_kicker: ["Catalog + stock in one link", "Каталог и склад в одной ссылке", "Katalog va ombor bitta havolada"],
  hero_title: ["Your Instagram shop — now a real catalog.", "Ваш Instagram-магазин — теперь настоящий каталог.", "Instagram do‘koningiz — endi haqiqiy katalog."],
  hero_sub: ["Products, prices, stock — one link in your bio. Your catalog stays online, your inventory stays honest.", "Товары, цены, остатки — одна ссылка в био. Каталог всегда онлайн, склад всегда точный.", "Mahsulot, narx, qoldiq — bio’dagi bitta havola. Katalog onlayn, ombor aniq."],
  f3_t: ["Know your stock", "Знайте свои остатки", "Qoldiqni biling"],
  f3_d: ["Quantities per size, barcode labels, scan to sell. Never oversell again.", "Количество по размерам, штрихкоды, продажа сканером. Больше не продадите лишнего.", "O‘lcham bo‘yicha son, shtrix-kod, skanerlab sotish. Ortiqcha sotmaysiz."],
  s2: ["Add products & stock", "Добавьте товары и остатки", "Mahsulot va qoldiq qo‘shing"],
  s2d: ["Photo, price, sizes, quantity. Barcodes are generated for you.", "Фото, цена, размеры, количество. Штрихкоды создаются сами.", "Rasm, narx, o‘lcham, son. Shtrix-kod avtomatik."],
  s3d: ["Drop rastashops.com/yourshop in your bio — customers browse, you sell in person or in DMs.", "rastashops.com/yourshop в био — клиенты смотрят, вы продаёте лично или в переписке.", "Bio’ga rastashops.com/yourshop — mijoz ko‘radi, siz sotasiz."],
  cta_band_d: ["Join thousands of sellers who finally know what’s in stock.", "Присоединяйтесь к тысячам продавцов, которые знают свои остатки.", "Qoldig‘ini biladigan minglab sotuvchilarga qo‘shiling."],
  ob_contacts_t: ["How customers reach you", "Как с вами связаться", "Mijozlar qanday bog‘lanadi"],
  ob_contacts_d: ["Shown on your page. Fill in what you have — you can change it later.", "Показывается на вашей странице. Заполните, что есть — потом можно изменить.", "Sahifangizda ko‘rinadi. Borini yozing — keyin o‘zgartirasiz."],
  ob_same_handle: ["Same as my rasta link", "Как ссылка на rasta", "rasta havolam bilan bir xil"],
  ob_live_d: ["Share your link in your bio — your catalog is public now.", "Поделитесь ссылкой в био — каталог теперь публичный.", "Havolani bio’ga qo‘ying — katalog ochiq."],
  ob_created_d: ["Add your first product with its stock, then publish to appear in rasta bozor.", "Добавьте первый товар с остатком и опубликуйте, чтобы попасть в rasta bozor.", "Birinchi mahsulot va qoldiqni qo‘shing, so‘ng rasta bozorda chiqarish uchun chop eting."],
  g_cancel: ["Cancel", "Отмена", "Bekor qilish"],
  g_save: ["Save", "Сохранить", "Saqlash"],
  g_close: ["Close", "Закрыть", "Yopish"],
  g_delete: ["Delete", "Удалить", "O‘chirish"],
  g_apply: ["Apply", "Применить", "Qo‘llash"],
  g_all: ["All", "Все", "Barchasi"],
  g_yes: ["Yes", "Да", "Ha"],
  g_no: ["No", "Нет", "Yo‘q"],
  g_none: ["None", "Нет", "Yo‘q"],
  g_back: ["Back", "Назад", "Orqaga"],
});

// ---------- auth (phone + SMS OTP) ----------
addI18N({
  au_title: ["Log in or create your shop", "Вход или создание магазина", "Kirish yoki do‘kon yaratish"],
  au_sub: ["Enter your phone number — we’ll text you a 6-digit code.", "Введите номер телефона — пришлём код из 6 цифр.", "Telefon raqamingizni kiriting — 6 xonali kod yuboramiz."],
  au_phone_lbl: ["Phone number", "Номер телефона", "Telefon raqami"],
  au_continue: ["Continue", "Продолжить", "Davom etish"],
  st_paused: ["Paused", "На паузе", "Pauzada"],
  au_consent: ["By continuing you agree to the Terms & Privacy Policy", "Продолжая, вы принимаете Условия и Политику конфиденциальности", "Davom etsangiz Shartlar va Maxfiylik siyosatiga rozilik bildirasiz"],
  au_code_t: ["Enter the code", "Введите код", "Kodni kiriting"],
  au_code_sub: ["We sent a code to", "Мы отправили код на", "Kod yuborildi:"],
  au_edit: ["Edit number", "Изменить номер", "Raqamni o‘zgartirish"],
  au_resend: ["Resend code", "Отправить снова", "Kodni qayta yuborish"],
  au_resend_in: ["Resend in {n}s", "Повтор через {n}с", "{n}s dan keyin qayta"],
  au_wrong: ["Incorrect code", "Неверный код", "Kod xato"],
  au_expired: ["Code expired — resend", "Код истёк — отправьте снова", "Kod muddati tugadi — qayta yuboring"],
  au_too_many: ["Too many attempts — request a new code", "Слишком много попыток — запросите новый код", "Urinishlar ko‘p — yangi kod so‘rang"],
  au_rate: ["Too many requests. Try again in {n} minutes.", "Слишком много запросов. Повторите через {n} мин.", "So‘rov ko‘p. {n} daqiqadan keyin urinib ko‘ring."],
  au_help: ["No SMS? Check the number, or write to support @rastashops", "Нет SMS? Проверьте номер или напишите в @rastashops", "SMS yo‘qmi? Raqamni tekshiring yoki @rastashops’ga yozing"],
  au_sms_note: ["rastashops.com code: {c} · never share this code", "Код rastashops.com: {c} · никому не сообщайте", "rastashops.com kodi: {c} · hech kimga aytmang"],
  au_demo: ["Demo — the code is shown above. 000000 shows the error state.", "Демо — код показан выше. 000000 покажет ошибку.", "Demo — kod yuqorida. 000000 xatoni ko‘rsatadi."],
  au_logout: ["Log out", "Выйти", "Chiqish"],
  au_op_invalid: ["Not a valid Uzbek operator code", "Неверный код оператора", "Operator kodi noto‘g‘ri"],
});

// ---------- inventory ----------
addI18N({
  db_inventory: ["Inventory", "Склад", "Ombor"],
  db_sales: ["Sales", "Продажи", "Sotuvlar"],
  db_scan: ["Scan & sell", "Сканировать", "Skanerlab sotish"],
  inv_sub: ["Quantities, barcodes and stock history", "Количество, штрихкоды и история", "Son, shtrix-kod va tarix"],
  inv_qty: ["Qty", "Кол-во", "Soni"],
  inv_barcode: ["Barcode", "Штрихкод", "Shtrix-kod"],
  inv_threshold: ["Low at", "Мало при", "Kam chegara"],
  inv_status: ["Status", "Статус", "Holat"],
  inv_last: ["Last change", "Изменено", "O‘zgargan"],
  inv_variant: ["Variant", "Вариант", "Variant"],
  inv_ok: ["In stock", "В наличии", "Bor"],
  inv_low: ["Low", "Мало", "Kam"],
  inv_out: ["Out", "Нет", "Tugagan"],
  inv_search: ["Search by name or barcode", "Поиск по названию или штрихкоду", "Nom yoki shtrix-kod bo‘yicha"],
  inv_restock: ["Restock", "Приход", "Kirim"],
  inv_print: ["Print labels", "Печать этикеток", "Yorliq chop etish"],
  inv_selected: ["{n} selected", "Выбрано: {n}", "{n} tanlandi"],
  inv_set_threshold: ["Set threshold", "Задать порог", "Chegarani belgilash"],
  inv_adjust: ["Adjust stock", "Корректировка", "Tuzatish"],
  inv_movements: ["Stock movements", "Движения склада", "Ombor harakatlari"],
  inv_recent: ["Recent movements", "Последние движения", "So‘nggi harakatlar"],
  inv_reason: ["Reason", "Причина", "Sabab"],
  inv_r_sale: ["Sale", "Продажа", "Sotuv"],
  inv_r_restock: ["Restock", "Приход", "Kirim"],
  inv_r_correction: ["Correction", "Корректировка", "Tuzatish"],
  inv_r_loss: ["Damage / loss", "Порча / потеря", "Yo‘qotish"],
  inv_r_return: ["Return", "Возврат", "Qaytarish"],
  inv_note: ["Note (optional)", "Заметка (необязательно)", "Izoh (ixtiyoriy)"],
  inv_received: ["Received", "Принято", "Qabul qilindi"],
  inv_confirm_restock: ["Confirm restock", "Подтвердить приход", "Kirimni tasdiqlash"],
  inv_labels_t: ["Label sheet", "Лист этикеток", "Yorliqlar varag‘i"],
  inv_labels_d: ["38 × 21 mm grid · barcode, name, variant, price", "Сетка 38 × 21 мм · штрихкод, название, вариант, цена", "38 × 21 mm · shtrix-kod, nom, variant, narx"],
  inv_print_now: ["Print", "Печать", "Chop etish"],
  inv_pro_only: ["Bulk label printing is a Pro feature — Starter prints one product at a time.", "Массовая печать — функция Pro. В Starter — по одному товару.", "Ommaviy chop etish — Pro imkoniyati. Starter’da bittalab."],
  inv_empty: ["No stock yet — add a product to start tracking quantities.", "Пока нет остатков — добавьте товар.", "Hozircha qoldiq yo‘q — mahsulot qo‘shing."],
  inv_no_match: ["Nothing matches these filters", "Ничего не найдено", "Hech narsa topilmadi"],
  inv_all: ["All stock", "Весь склад", "Butun ombor"],
  inv_override: ["Negative stock allowed", "Разрешён минус", "Manfiy qoldiq ruxsat"],
  inv_cost: ["Avg cost", "Себестоим.", "Tannarx"],
  inv_no_cost: ["no cost set", "нет себестоимости", "tannarx yo‘q"],
  inv_history: ["History", "История", "Tarix"],
  inv_qty_new: ["New count", "Новое количество", "Yangi son"],
  inv_r_loss2: ["Loss / damage", "Порча / потеря", "Yo‘qotish / nuqson"],
  inv_scan_sell: ["Scan & sell", "Сканировать", "Skanerlab sotish"],
  rs_title: ["Restock", "Приход товара", "Tovar kirimi"],
  rs_pick: ["Pick or scan variants", "Выберите или отсканируйте", "Tanlang yoki skanerlang"],
  rs_qty_recv: ["Qty received", "Принято", "Qabul qilindi"],
  rs_cost_unit: ["Cost per unit", "Цена за ед.", "Dona tannarxi"],
  rs_extra: ["Additional costs to spread (cargo, delivery)", "Доп. расходы для распределения (карго, доставка)", "Taqsimlanadigan qo‘shimcha xarajat (kargo, yetkazish)"],
  rs_extra_hint: ["Spread across received units by value", "Распределяется по стоимости позиций", "Qiymat bo‘yicha taqsimlanadi"],
  rs_new_avg: ["New average cost", "Новая себестоимость", "Yangi tannarx"],
  rs_margin_at: ["Margin at current price", "Маржа при текущей цене", "Hozirgi narxda marja"],
  rs_was: ["was", "было", "edi"],
  rs_keep: ["To keep {m}% price ≈", "Чтобы сохранить {m}% — цена ≈", "{m}% saqlash uchun narx ≈"],
  rs_supplier: ["Supplier / note", "Поставщик / заметка", "Yetkazuvchi / izoh"],
  rs_onhand: ["On hand", "Сейчас", "Hozir"],
  rs_adding: ["Adding", "Добавляем", "Qo‘shilmoqda"],
  rs_after: ["After this batch", "Станет", "Bo‘ladi"],
  rs_all_sizes: ["All sizes", "Все размеры", "Barcha o‘lchamlar"],
  rs_same_cost: ["Same cost for all sizes", "Одна цена для всех размеров", "Barcha o‘lchamlar uchun bir narx"],
  rs_apply_all: ["Apply to all", "Применить ко всем", "Hammasiga qo‘llash"],
  rs_batch: ["This batch", "Эта партия", "Bu partiya"],
  rs_units: ["units", "шт.", "dona"],
  rs_spend: ["Batch cost", "Стоимость партии", "Partiya qiymati"],
  rs_add_product: ["Add all sizes", "Добавить все размеры", "Barcha o‘lchamlarni qo‘shish"],
  rs_nocost_n: ["Sizes without a cost: {n} — they stay excluded from profit", "Размеров без себестоимости: {n} — они не входят в прибыль", "Tannarxsiz o‘lchamlar: {n} — foydaga kirmaydi"],
  rs_costed_only: ["costed sizes only", "только с себестоимостью", "faqat tannarxi borlar"],
  rs_no_costs: ["No costs entered", "Себестоимость не указана", "Tannarx kiritilmagan"],
  rs_per_size: ["Cost differs by size? Change any row — the average is computed per size.", "Цена отличается по размерам? Измените строку — себестоимость считается по каждому размеру.", "Narx o‘lchamga qarab farq qiladimi? Qatorni o‘zgartiring — tannarx har o‘lcham uchun hisoblanadi."],
  rs_nothing: ["Add a quantity to see the margin effect", "Укажите количество, чтобы увидеть маржу", "Marjani ko‘rish uchun son kiriting"],
  lb_page: ["Page size", "Формат", "Format"],
  lb_a4: ["A4 sheet · 38 × 21 mm", "Лист A4 · 38 × 21 мм", "A4 varaq · 38 × 21 mm"],
  lb_thermal: ["Thermal 58 mm", "Термо 58 мм", "Termo 58 mm"],
  lb_selected: ["{n} labels", "{n} этикеток", "{n} yorliq"],
  lb_pro_lock: ["Bulk printing — Pro", "Массовая печать — Pro", "Ommaviy chop etish — Pro"],
  inv_oversold: ["Oversold", "Продано в минус", "Minusga sotilgan"],
  inv_oversold_d: ["{n} variants are below zero — recount and correct them.", "{n} позиций ушли в минус — пересчитайте и исправьте.", "{n} pozitsiya minusda — qayta sanang va tuzating."],
  inv_recount: ["Recount", "Пересчитать", "Qayta sanash"],
  inv_edit_bc: ["Edit barcode", "Изменить штрихкод", "Shtrix-kodni o‘zgartirish"],
  inv_bc_d: ["Use the manufacturer’s EAN-13 / UPC label instead of the rasta code — then you scan the factory label directly.", "Используйте заводской EAN-13 / UPC вместо кода rasta — тогда сканируется фабричная этикетка.", "rasta kodi o‘rniga zavod EAN-13 / UPC dan foydalaning."],
  inv_bc_auto: ["Back to rasta code", "Вернуть код rasta", "rasta kodiga qaytish"],
  inv_bc_bad: ["Not a valid EAN-13 / UPC-A (check digit)", "Неверный EAN-13 / UPC-A (контрольная цифра)", "EAN-13 / UPC-A xato (nazorat raqami)"],
  inv_bc_dupe: ["Another variant already uses this code", "Этот код уже используется", "Bu kod band"],
  inv_bc_ok: ["Valid EAN-13", "Верный EAN-13", "To‘g‘ri EAN-13"],
  inv_undo_restock: ["Undo last restock", "Отменить последний приход", "Oxirgi kirimni bekor qilish"],
  inv_undo_d: ["Nothing has been sold since — this removes the intake and restores the previous average cost.", "С тех пор ничего не продано — приход будет отменён, себестоимость восстановлена.", "Shundan beri sotuv yo‘q — kirim bekor qilinadi, tannarx tiklanadi."],
  inv_undone: ["Restock undone", "Приход отменён", "Kirim bekor qilindi"],
  inv_journal_fix: ["Quantities were rebuilt from the stock journal", "Количества пересчитаны по журналу", "Sonlar jurnal bo‘yicha qayta hisoblandi"],
  pf_what: ["Profit = your price minus what the item cost you. Rent, ads and delivery are not included.", "Прибыль = ваша цена минус закупка товара. Аренда, реклама и доставка не учитываются.", "Foyda = sizning narxingiz minus tovar tannarxi. Ijara, reklama va yetkazish hisobga olinmaydi."],
  pf_free: ["free", "бесплатно", "bepul"],
  pr_price_sell: ["Selling price", "Цена продажи", "Sotuv narxi"],
  pr_price_sell_d: ["What the customer pays — shown on your storefront.", "Столько платит покупатель — видно в магазине.", "Mijoz to‘laydigan narx — vitrinada ko‘rinadi."],
  pr_cost_buy: ["What it cost you", "Закупочная цена", "Sizga tushgan narx"],
  pr_cost_buy_d: ["What you paid per piece. Private — never shown to customers. Leave empty if you don’t know it.", "Сколько вы заплатили за штуку. Не видно покупателям. Можно оставить пустым.", "Bir dona uchun to‘laganingiz. Mijozga ko‘rinmaydi. Bilmasangiz bo‘sh qoldiring."],
  pr_margin_now: ["Margin", "Маржа", "Marja"],
  pr_profit_each: ["you keep {v} per piece", "с каждой штуки остаётся {v}", "har donadan {v} qoladi"],
  pr_cost_note: ["One-time: after saving, quantities are managed in Inventory. Cost becomes the starting average — every restock updates it automatically.", "Один раз: после сохранения количество ведётся в Складе. Цена станет начальной себестоимостью — каждый приход её пересчитывает.", "Bir marta: saqlangandan keyin miqdor Omborda yuritiladi. Narx boshlang‘ich tannarx bo‘ladi — har kirim uni yangilaydi."],
  fx_title: ["Studio look", "Студийный вид", "Studiya ko‘rinishi"],
  fx_d: ["Phone photos are fine — pick a look and every photo of this product gets the same treatment, so your catalog stays consistent.", "Снимки с телефона подойдут — выберите вид, и все фото товара получат единую обработку.", "Telefon suratlari yetarli — ko‘rinishni tanlang, mahsulotning barcha suratlari bir xil ishlanadi."],
  fx_none: ["As shot", "Как есть", "Asl holicha"],
  fx_studio: ["Studio", "Студия", "Studiya"],
  fx_warm: ["Warm", "Тёплый", "Iliq"],
  fx_cool: ["Cool", "Холодный", "Salqin"],
  fx_mono: ["Mono", "Ч/Б", "Oq-qora"],
  ai_make: ["Make studio photo", "Сделать студийное фото", "Studiya surati qilish"],
  ai_title: ["Studio photo", "Студийное фото", "Studiya surati"],
  ai_sub: ["We place your item on a clean studio backdrop with even lighting.", "Мы поместим товар на чистый студийный фон с ровным светом.", "Mahsulotni toza studiya foniga qo‘yamiz."],
  ai_working: ["Making your studio photo…", "Создаём студийное фото…", "Studiya surati tayyorlanmoqda…"],
  ai_working_d: ["This usually takes about 20 seconds.", "Обычно занимает около 20 секунд.", "Odatda 20 soniyacha."],
  ai_before: ["Your photo", "Ваше фото", "Sizning suratingiz"],
  ai_after: ["Studio", "Студия", "Studiya"],
  ai_drag: ["Drag to compare", "Потяните, чтобы сравнить", "Solishtirish uchun torting"],
  ai_use: ["Use this photo", "Использовать это", "Shuni ishlatish"],
  ai_retry: ["Try again", "Ещё раз", "Yana urinish"],
  ai_keep: ["Keep original", "Оставить оригинал", "Aslini qoldirish"],
  ai_kept: ["Your original photo is always kept — you can switch back any time.", "Оригинал всегда сохраняется — можно вернуть в любой момент.", "Asl surat saqlanadi — istalgan payt qaytarish mumkin."],
  ai_credits: ["{n} studio photos left this month", "Осталось студийных фото в этом месяце: {n}", "Bu oyda {n} studiya surati qoldi"],
  ai_credits_none: ["No studio photos left this month", "Студийные фото на этот месяц исчерпаны", "Bu oyda studiya suratlari tugadi"],
  ai_pro: ["Studio photos are a Pro feature", "Студийные фото — функция Pro", "Studiya suratlari — Pro imkoniyati"],
  ai_pro_d: ["Starter includes 3 to try. Pro gives you 50 every month.", "В Starter — 3 для пробы. В Pro — 50 каждый месяц.", "Starter’da 3 ta sinov. Pro’da har oy 50 ta."],
  ai_applied: ["Studio photo applied", "Студийное фото применено", "Studiya surati qo‘llandi"],
  ai_reverted: ["Original photo restored", "Оригинал восстановлен", "Asl surat tiklandi"],
  ai_badge: ["Studio", "Студия", "Studiya"],
  ai_revert: ["Back to my photo", "Вернуть моё фото", "O‘z suratimga qaytish"],
  gen_offer_t: ["Show 3 more angles of this photo", "Создать ещё 3 ракурса этого фото", "Shu suratning 3 rakursini yaratish"],
  gen_offer_d: ["Turned to the side, from the other side, and a close-up of the fabric — all from your cover photo. Check each one before saving.", "Вид сбоку, с другой стороны и крупный план ткани — из вашего главного фото. Проверьте каждый перед сохранением.", "Yonidan, boshqa tomondan va mato yaqindan — asosiy suratingizdan. Saqlashdan oldin tekshiring."],
  gen_do: ["Generate 3 photos", "Создать 3 фото", "3 surat yaratish"],
  gen_not_now: ["Not now", "Не сейчас", "Hozir emas"],
  gen_working: ["Generating 3 photos…", "Создаём 3 фото…", "3 surat yaratilmoqda…"],
  gen_done: ["3 photos added", "Добавлено 3 фото", "3 surat qo‘shildi"],
  gen_tag_detail: ["Close-up", "Крупно", "Yaqindan"],
  gen_tag_side: ["Side", "Сбоку", "Yonidan"],
  gen_tag_back: ["Other side", "С другой стороны", "Boshqa tomondan"],
  gen_replace: ["Drop your own photo on any of them to replace it", "Перетащите своё фото на любое, чтобы заменить", "Almashtirish uchun o‘z suratingizni tashlang"],
  gen_need_cover: ["Add your cover photo first", "Сначала добавьте главное фото", "Avval asosiy suratni qo‘shing"],
  gen_manual_t: ["Add 3 more photos yourself", "Добавьте ещё 3 фото сами", "Yana 3 surat o‘zingiz qo‘shing"],
  gen_manual_d: ["Buyers who see several angles ask fewer questions: the fabric up close, the full item, and one on a person if you can.", "Покупатели с несколькими ракурсами задают меньше вопросов: ткань вблизи, товар целиком и, если можно, на человеке.", "Bir nechta rakurs bo‘lsa, savol kam bo‘ladi: mato yaqindan, mahsulot to‘liq va imkon bo‘lsa odamda."],
  gen_undo: ["Remove generated photos", "Удалить созданные фото", "Yaratilgan suratlarni o‘chirish"],
  ai_note: ["Check the result — colours, buttons and patterns should match the real item.", "Проверьте результат — цвет, кнопки и узор должны совпадать с товаром.", "Natijani tekshiring — rang, tugma va naqsh mos bo‘lishi kerak."],
  fx_tip: ["Shoot against a plain wall in daylight — the look does the rest.", "Снимайте у однотонной стены при дневном свете — остальное сделает обработка.", "Kunduzi bir rangli devor oldida suratga oling — qolganini ishlov beradi."],
  pr_stock_head: ["Stock & barcodes", "Остатки и штрихкоды", "Qoldiq va shtrix-kodlar"],
  bc_has: ["It has a barcode", "У товара есть штрихкод", "Shtrix-kodi bor"],
  bc_none: ["No barcode — generate one", "Штрихкода нет — создать", "Shtrix-kod yo‘q — yaratish"],
  bc_scan_in: ["Scan or type the code on the label", "Отсканируйте или введите код с этикетки", "Yorliqdagi kodni skanerlang yoki kiriting"],
  bc_generate: ["Generate", "Создать", "Yaratish"],
  bc_generated: ["Generated — print it and stick it on", "Создан — распечатайте и наклейте", "Yaratildi — chop etib yopishtiring"],
  bc_missing: ["No barcode", "Нет штрихкода", "Shtrix-kod yo‘q"],
  bc_missing_d: ["Variants without a barcode: {n} — generate and print labels for them.", "Позиций без штрихкода: {n} — создайте и распечатайте этикетки.", "Shtrix-kodsiz pozitsiyalar: {n} — yarating va chop eting."],
  bc_gen_all: ["Generate for all", "Создать для всех", "Hammasiga yaratish"],
  bc_own: ["rasta code", "код rasta", "rasta kodi"],
  bc_factory: ["Factory code", "Заводской код", "Zavod kodi"],
  bc_replace: ["Lost the label? Generate a new code and reprint it.", "Потеряли этикетку? Создайте новый код и распечатайте.", "Yorliq yo‘qoldimi? Yangi kod yarating va chop eting."],
  bc_free: ["Any code works — numbers or letters. Factory EAN-13 / UPC is checked for you.", "Подойдёт любой код — цифры или буквы. EAN-13 / UPC проверяется.", "Har qanday kod bo‘ladi. EAN-13 / UPC tekshiriladi."],
  inv_cost_d: ["Weighted average of what you paid. Recalculated at every restock — never shown to customers.", "Средневзвешенная закупочная цена. Пересчитывается при каждом приходе, покупателям не видна.", "To‘lagan pulingizning o‘rtachasi. Har kirimda qayta hisoblanadi, mijozga ko‘rinmaydi."],
});

// ---------- scan & sell ----------
addI18N({
  sc_camera: ["Camera", "Камера", "Kamera"],
  sc_scanner: ["USB scanner", "USB-сканер", "USB skaner"],
  sc_manual: ["Search", "Поиск", "Qidirish"],
  sc_hint: ["Point the camera at a barcode", "Наведите камеру на штрихкод", "Kamerani shtrix-kodga qarating"],
  sc_cam_off: ["No camera here — use a scanner or search", "Камера недоступна — сканер или поиск", "Kamera yo‘q — skaner yoki qidiruv"],
  sc_wedge: ["Scanner ready — scan a label", "Сканер готов — считайте этикетку", "Skaner tayyor — yorliqni o‘qing"],
  sc_demo_scan: ["Simulate a scan", "Имитировать сканирование", "Skanerni sinash"],
  sc_cart: ["Sale", "Продажа", "Sotuv"],
  sc_cart_empty: ["Scan or pick a product to start", "Отсканируйте или выберите товар", "Skanerlang yoki mahsulot tanlang"],
  sc_total: ["Total", "Итого", "Jami"],
  sc_complete: ["Complete sale", "Завершить продажу", "Sotuvni yakunlash"],
  sc_payment: ["Payment", "Оплата", "To‘lov"],
  sc_today: ["Today", "Сегодня", "Bugun"],
  sc_notfound: ["Barcode not found", "Штрихкод не найден", "Shtrix-kod topilmadi"],
  sc_addnew: ["Add product", "Добавить товар", "Mahsulot qo‘shish"],
  sc_soldout_warn: ["Sold out — sell anyway?", "Нет в наличии — продать всё равно?", "Tugagan — shunda ham sotasizmi?"],
  sc_sell_anyway: ["Sell anyway", "Всё равно продать", "Shunda ham sotish"],
  sc_recorded: ["Sale recorded", "Продажа записана", "Sotuv yozildi"],
  sc_unit: ["Unit price", "Цена за ед.", "Dona narxi"],
  sc_items: ["items", "шт.", "dona"],
  sc_queued: ["Offline — queued, will sync", "Нет сети — в очереди", "Internet yo‘q — navbatda"],
  sc_added: ["added", "добавлено", "qo‘shildi"],
  sc_point: ["Point at a barcode", "Наведите на штрихкод", "Shtrix-kodga qarating"],
  sc_enter: ["Enter code / search by name", "Ввести код / поиск по названию", "Kod kiritish / nom bo‘yicha"],
  sc_discount: ["tap price to discount", "нажмите на цену для скидки", "chegirma uchun narxni bosing"],
  sc_soldout_line: ["{name} is sold out — sell anyway?", "{name} нет в наличии — продать всё равно?", "{name} tugagan — shunda ham sotasizmi?"],
});

// ---------- sales ----------
addI18N({
  sl_sub: ["Every sale recorded by scan or by hand", "Все продажи со сканера и вручную", "Skaner va qo‘lda qilingan sotuvlar"],
  sl_items: ["Items sold", "Продано", "Sotilgan"],
  sl_revenue: ["Revenue", "Выручка", "Tushum"],
  sl_avg: ["Average sale", "Средний чек", "O‘rtacha savdo"],
  sl_today: ["Today", "Сегодня", "Bugun"],
  sl_week: ["This week", "Неделя", "Hafta"],
  sl_month: ["This month", "Месяц", "Oy"],
  sl_all: ["All time", "Всё время", "Butun davr"],
  sl_empty: ["No sales yet — use Scan & sell to record your first one.", "Продаж пока нет — используйте Сканировать.", "Sotuv yo‘q — Skanerlab sotishdan foydalaning."],
  sl_manual: ["Manual sale", "Продажа вручную", "Qo‘lda sotish"],
  sl_return: ["Return", "Возврат", "Qaytarish"],
  sl_returned: ["Returned", "Возвращено", "Qaytarildi"],
  sl_export: ["Export CSV", "Экспорт CSV", "CSV eksport"],
  sl_paytag: ["Payment", "Оплата", "To‘lov"],
  pay_cash: ["Cash", "Наличные", "Naqd"],
  pay_transfer: ["Transfer", "Перевод", "O‘tkazma"],
  sl_cost: ["Cost", "Себестоимость", "Tannarx"],
  sl_profit: ["Gross profit", "Валовая прибыль", "Yalpi foyda"],
  sl_profit_note: ["profit calculated for {a} of {b} items — {c} items have no cost set", "прибыль посчитана для {a} из {b} позиций — у {c} нет себестоимости", "foyda {b} dan {a} pozitsiya uchun hisoblandi — {c} tada tannarx yo‘q"],
  sl_losses: ["Losses this period", "Потери за период", "Davr yo‘qotishlari"],
  sl_custom: ["Custom", "Период", "Davr"],
  sl_from: ["From", "С", "Dan"],
  sl_to: ["To", "По", "Gacha"],
  sl_return_t: ["Return items", "Возврат позиции", "Pozitsiyani qaytarish"],
  sl_return_stock: ["Return to stock", "Вернуть на склад", "Omborga qaytarish"],
  sl_return_off: ["Write off (damaged)", "Списать (брак)", "Hisobdan chiqarish (nuqson)"],
  sl_confirm: ["Confirm", "Подтвердить", "Tasdiqlash"],
  sl_id: ["Sale", "Чек", "Chek"],
  sl_no_cost_line: ["no cost", "нет с/с", "tannarx yo‘q"],
});

// ---------- storefront ----------
addI18N({
  sf_contact: ["How to reach this shop", "Как связаться с магазином", "Do‘kon bilan bog‘lanish"],
  sf_hide_sold: ["Hide sold out", "Скрыть распроданное", "Tugaganlarni yashirish"],
  sf_avail: ["Availability", "Наличие", "Mavjudligi"],
  sf_available: ["available", "есть", "bor"],
  sf_unavailable: ["sold out", "нет", "tugagan"],
  sf_share_p: ["Share this product", "Поделиться товаром", "Mahsulotni ulashish"],
  sf_copied_p: ["Product link copied", "Ссылка на товар скопирована", "Mahsulot havolasi nusxalandi"],
  sf_setting_up: ["This shop is setting up its catalog", "Магазин наполняет каталог", "Do‘kon katalogini to‘ldirmoqda"],
  sf_closed_t: ["Temporarily closed", "Временно закрыто", "Vaqtincha yopiq"],
  sf_closed_d: ["This shop is not taking new business right now. Check back soon.", "Магазин сейчас не работает. Заходите позже.", "Do‘kon hozir ishlamaydi. Keyinroq kiring."],
  sf_category: ["Category", "Категория", "Kategoriya"],
  sf_specs: ["Details", "Характеристики", "Xususiyatlari"],
  sf_size_chart: ["Size chart", "Таблица размеров", "O‘lchamlar jadvali"],
});

// ---------- chat ordering ----------
addI18N({
  ch_order: ["Order", "Заказать", "Buyurtma"],
  ch_order_add: ["Add to order", "Добавить к заказу", "Buyurtmaga qo‘shish"],
  ch_in_order: ["In your order", "В заказе", "Buyurtmada"],
  ch_title: ["Chats", "Чаты", "Chatlar"],
  ch_added: ["Added to your chat with {store}", "Добавлено в чат с {store}", "{store} bilan chatga qo‘shildi"],
  ch_open: ["Open chat", "Открыть чат", "Chatni ochish"],
  ch_empty_t: ["No chats yet", "Чатов пока нет", "Hozircha chat yo‘q"],
  ch_empty_d: ["Tap Order on a product and a chat with that shop opens here.", "Нажмите «Заказать» — чат с магазином появится здесь.", "Mahsulotda «Buyurtma» ni bosing — do‘kon bilan chat shu yerda paydo bo‘ladi."],
  ch_products_n: ["{n} products", "{n} товаров", "{n} mahsulot"],
  ch_product_1: ["1 product", "1 товар", "1 mahsulot"],
  ch_unread_n: ["{n} unread", "{n} непрочит.", "{n} o‘qilmagan"],
  ch_your_order: ["Your order", "Ваш заказ", "Buyurtmangiz"],
  ch_total: ["Total", "Итого", "Jami"],
  ch_input: ["Type a message…", "Напишите сообщение…", "Xabar yozing…"],
  ch_send: ["Send", "Отправить", "Yuborish"],
  ch_remove: ["Remove", "Убрать", "Olib tashlash"],
  ch_view_product: ["View product", "Открыть товар", "Mahsulotni ko‘rish"],
  ch_first_msg: ["I want to order these products.", "Хочу заказать эти товары.", "Shu mahsulotlarni buyurtma qilmoqchiman."],
  ch_no_msgs: ["No messages yet — say hello.", "Сообщений пока нет — напишите первым.", "Xabar yo‘q — birinchi yozing."],
  ch_reply_1: ["Hello! Everything here is available. Which size do you need?", "Здравствуйте! Всё в наличии. Какой размер нужен?", "Assalomu alaykum! Hammasi bor. Qaysi o‘lcham kerak?"],
  ch_reply_2: ["Yes, available. Delivery across the city today.", "Да, есть. Доставка по городу сегодня.", "Bor. Bugun shahar bo‘ylab yetkazamiz."],
  ch_reply_3: ["Thank you! Let me check and confirm in a minute.", "Спасибо! Уточню и подтвержу через минуту.", "Rahmat! Tekshirib, bir daqiqada tasdiqlaymiz."],
  ch_now: ["now", "сейчас", "hozir"],
  ch_qty: ["Qty", "Кол-во", "Soni"],
  ch_items_n: ["{n} items", "{n} шт.", "{n} dona"],
  ch_item_1: ["1 item", "1 шт.", "1 dona"],
  ch_you: ["You", "Вы", "Siz"],
  ch_sold_note: ["Sold out — ask the shop when it's back", "Нет в наличии — спросите магазин", "Tugagan — do‘kondan so‘rang"],
  opt_color: ["Colour", "Цвет", "Rang"],
  opt_size: ["Size", "Размер", "O‘lcham"],
  opt_option: ["Option", "Вариант", "Variant"],
  opt_qty: ["How many", "Количество", "Nechta"],
  opt_left: ["{n} left", "осталось {n}", "{n} ta qoldi"],
  opt_pick_hint: ["Choose {what}", "Выберите: {what}", "{what}ni tanlang"],
  opt_out: ["sold out", "нет", "yo‘q"],
  opt_ready: ["Add to basket · {sum}", "В корзину · {sum}", "Savatga · {sum}"],
  bk_msgs: ["Messages", "Сообщения", "Xabarlar"],
  bk_my_order: ["My order", "Мой заказ", "Buyurtmam"],
  bk_step1: ["1 · Collect what you want", "1 · Соберите товары", "1 · Mahsulot yig‘ing"],
  bk_step2: ["2 · Send it to the shop", "2 · Отправьте магазину", "2 · Do‘konga yuboring"],
  bk_step3: ["3 · Agree in the chat", "3 · Договоритесь в чате", "3 · Chatda gaplashing"],
  bk_empty_t2: ["Your order is empty", "Ваш заказ пуст", "Buyurtmangiz bo‘sh"],
  bk_empty_d2: ["Add products from the shops you like.", "Добавьте товары из магазинов, которые вам нравятся.", "Yoqqan do‘konlardan mahsulot qo‘shing."],
  ch_empty_t2: ["No messages yet", "Сообщений пока нет", "Xabarlar yo‘q"],
  ch_empty_d2: ["When you send an order to a shop, your conversation will appear here.", "Когда вы отправите заказ магазину, здесь появится переписка.", "Do‘konga buyurtma yuborsangiz, suhbat shu yerda paydo bo‘ladi."],
  ord_empty_t: ["No products in this order", "В этом заказе нет товаров", "Bu buyurtmada mahsulot yo‘q"],
  ord_empty_d: ["You can keep chatting with the shop, or add products from their shop.", "Можете продолжить переписку или добавить товары из магазина.", "Suhbatni davom eting yoki do‘kondan mahsulot qo‘shing."],
  ord_short_t: ["Not enough stock for one item", "Не хватает товара", "Mahsulot yetarli emas"],
  ord_short_l: ["Available: {a} · you asked for {b}", "Доступно: {a} · запрошено {b}", "Bor: {a} · so‘ralgan {b}"],
  ord_fix: ["Set to {n}", "Поставить {n}", "{n} qilib qo‘yish"],
  ord_gone: ["No longer sold", "Больше не продаётся", "Endi sotilmaydi"],
  msg_sending: ["Sending…", "Отправка…", "Yuborilmoqda…"],
  msg_failed: ["Message failed to send", "Сообщение не отправлено", "Xabar yuborilmadi"],
  msg_retry: ["Retry", "Повторить", "Qayta urinish"],
  bk_add: ["Add to basket", "В корзину", "Savatga qo‘shish"],
  bk_in: ["In basket", "В корзине", "Savatda"],
  bk_go: ["In basket · view", "В корзине · открыть", "Savatda · ochish"],
  bk_title: ["Basket", "Корзина", "Savat"],
  bk_tab_chats: ["Chats", "Чаты", "Chatlar"],
  bk_empty_t: ["Your basket is empty", "Корзина пуста", "Savat bo‘sh"],
  bk_empty_d: ["Add products, then send them to the shop as one order.", "Добавьте товары и отправьте магазину одним заказом.", "Mahsulot qo‘shing va do‘konga bitta buyurtma qilib yuboring."],
  bk_order: ["Order through chat", "Заказать в чате", "Chat orqali buyurtma"],
  bk_subtotal: ["Subtotal", "Сумма", "Summa"],
  bk_sent: ["Order sent to {store}", "Заказ отправлен: {store}", "Buyurtma yuborildi: {store}"],
  bk_added: ["Added to your basket", "Добавлено в корзину", "Savatga qo‘shildi"],
  bk_clear: ["Empty basket", "Очистить корзину", "Savatni bo‘shatish"],
  bk_grouped: ["Grouped by shop — each shop gets its own chat", "Сгруппировано по магазинам — у каждого свой чат", "Do‘kon bo‘yicha guruhlangan — har biriga alohida chat"],
  bk_open_chat: ["Open chat", "Открыть чат", "Chatni ochish"],
  ch_pick_variant: ["Choose an option first", "Сначала выберите вариант", "Avval variantni tanlang"],
  ch_pick_open: ["Choose options", "Выбрать вариант", "Variantni tanlash"],
  ch_variant_out: ["This option is sold out", "Этот вариант распродан", "Bu variant tugagan"],
  sf_pick: ["Pick an option", "Выберите вариант", "Variantni tanlang"],
  ch_clear: ["Remove all products", "Убрать все товары", "Hammasini olib tashlash"],
});

// ---------- explore ----------
addI18N({
  mkt_city: ["City", "Город", "Shahar"],
  mkt_all_cities: ["All cities", "Все города", "Barcha shaharlar"],
  mkt_sort_new: ["Newest shops", "Новые магазины", "Yangi do‘konlar"],
  mkt_sort_products: ["Most products", "Больше товаров", "Ko‘p mahsulot"],
  mkt_sort_rating: ["Rating", "Рейтинг", "Reyting"],
  mkt_none_t: ["No shops match", "Магазины не найдены", "Do‘kon topilmadi"],
  mkt_none_d: ["Try a different city or category.", "Попробуйте другой город или категорию.", "Boshqa shahar yoki kategoriya."],
  mkt_clear: ["Clear filters", "Сбросить фильтры", "Filtrlarni tozalash"],
});

// ---------- settings ----------
addI18N({
  st_identity: ["Shop identity", "О магазине", "Do‘kon ma’lumoti"],
  st_contacts: ["Contact info", "Контакты", "Kontaktlar"],
  st_contacts_d: ["Shown on your storefront as plain text so customers know how to reach you.", "Показываются в магазине как текст — чтобы клиенты знали, как связаться.", "Do‘konda matn sifatida ko‘rinadi."],
  st_chips: ["Shop info chips", "Инфо-строки", "Ma’lumot yorliqlari"],
  st_delivery: ["Delivery note", "О доставке", "Yetkazib berish"],
  st_payments: ["Accepted payments", "Способы оплаты", "To‘lov turlari"],
  st_storefront: ["Storefront options", "Настройки витрины", "Vitrina sozlamalari"],
  st_threshold: ["Default low-stock threshold", "Порог «мало» по умолчанию", "Standart kam chegara"],
  st_show_sold: ["Show sold-out products", "Показывать распроданное", "Tugaganlarni ko‘rsatish"],
  st_status: ["Shop status", "Статус магазина", "Do‘kon holati"],
  st_paused_d: ["Paused shops show “temporarily closed” and are hidden from rasta bozor.", "На паузе магазин закрыт и скрыт из rasta bozor.", "Pauzada do‘kon yopiq va rasta bozorda ko‘rinmaydi."],
  st_plan: ["Plan", "Тариф", "Tarif"],
  st_trial_left: ["{n} days left in your trial", "Осталось {n} дней пробного периода", "Sinov davrida {n} kun qoldi"],
  st_upgrade: ["Upgrade to Pro", "Перейти на Pro", "Pro’ga o‘tish"],
  st_account: ["Account", "Аккаунт", "Akkaunt"],
  st_login_phone: ["Login phone number", "Телефон для входа", "Kirish uchun raqam"],
  st_change_number: ["Change number", "Изменить номер", "Raqamni o‘zgartirish"],
  st_change_d: ["We’ll send a code to the new number. The old one stops working.", "Отправим код на новый номер. Старый перестанет работать.", "Yangi raqamga kod yuboramiz. Eskisi ishlamaydi."],
  st_number_changed: ["Login number updated", "Номер обновлён", "Raqam yangilandi"],
  st_danger: ["Danger zone", "Опасная зона", "Xavfli hudud"],
  st_delete: ["Delete shop", "Удалить магазин", "Do‘konni o‘chirish"],
  st_delete_d: ["This removes the shop, its catalog and its history. This cannot be undone.", "Удалит магазин, каталог и историю. Отменить нельзя.", "Do‘kon, katalog va tarix o‘chadi. Qaytarilmaydi."],
  st_delete_confirm: ["Type the shop name to confirm", "Введите название магазина", "Tasdiqlash uchun do‘kon nomini yozing"],
  st_slug_warn: ["Changing your link breaks links you already shared.", "Смена ссылки ломает уже отправленные ссылки.", "Havolani o‘zgartirsangiz eski havolalar ishlamaydi."],
  st_saved: ["Settings saved", "Настройки сохранены", "Sozlamalar saqlandi"],
  st_shop_name: ["Shop name", "Название магазина", "Do‘kon nomi"],
  st_tagline: ["Tagline", "Описание", "Shior"],
  st_slug_taken: ["That link is taken", "Ссылка занята", "Havola band"],
});

// ---------- products ----------
addI18N({
  pr_variants: ["Sizes / options", "Размеры / опции", "O‘lcham / variantlar"],
  pr_has_variants: ["This product has sizes or options", "У товара есть размеры или опции", "Mahsulotda o‘lcham yoki variant bor"],
  pr_values: ["Option values (comma separated)", "Значения (через запятую)", "Qiymatlar (vergul bilan)"],
  pr_initial: ["Opening stock", "Начальный остаток", "Boshlang‘ich qoldiq"],
  ph_min: ["At least {n} photos are required to publish", "Минимум {n} фото, чтобы опубликовать", "Chop etish uchun kamida {n} ta rasm kerak"],
  ph_min_short: ["min {n}", "мин. {n}", "kamida {n}"],
  ph_hints_csv: ["Cover,Front,Back,Detail,Label,More", "Обложка,Спереди,Сзади,Деталь,Этикетка,Ещё", "Muqova,Old,Orqa,Detal,Yorliq,Yana"],
  ph_add: ["Add photo", "Добавить фото", "Rasm qo‘shish"],
  ph_remove: ["Remove slot", "Убрать слот", "Slotni olib tashlash"],
  ph_count: ["{n}/6 photos", "{n}/6 фото", "{n}/6 rasm"],
  ph_per_color: ["Photos by colour", "Фото по цветам", "Rang bo‘yicha suratlar"],
  ph_min: ["At least {n} photos are required to publish", "Минимум {n} фото, чтобы опубликовать", "Chop etish uchun kamida {n} ta rasm kerak"],
  ph_min_short: ["min {n}", "мин. {n}", "kamida {n}"],
  ph_hints_csv: ["Cover,Front,Back,Detail,Label,More", "Обложка,Спереди,Сзади,Деталь,Этикетка,Ещё", "Muqova,Old,Orqa,Detal,Yorliq,Yana"],
  ph_add: ["Add photo", "Добавить фото", "Rasm qo‘shish"],
  ph_remove: ["Remove slot", "Убрать слот", "Slotni olib tashlash"],
  ph_count: ["{n}/6 photos", "{n}/6 фото", "{n}/6 rasm"],
  ph_per_color_d: ["Each colour needs its own photo — buyers see it the moment they pick that colour.", "У каждого цвета — своё фото. Покупатель видит его, выбрав цвет.", "Har bir rangga o‘z surati kerak — mijoz rangni tanlaganda ko‘radi."],
  pr_in_inv: ["change in Inventory", "менять в Складе", "Omborda o‘zgartiring"],
  pr_qty_where: ["Quantities live in Inventory — every change there is recorded with a reason (restock, correction, loss). Here you only set the starting stock of a new product.", "Количество живёт в Складе — каждое изменение записывается с причиной (приход, корректировка, потеря). Здесь задаётся только начальный остаток нового товара.", "Soni Omborda yuritiladi — har bir o‘zgarish sabab bilan yoziladi (kirim, tuzatish, yo‘qotish). Bu yerda faqat yangi mahsulotning boshlang‘ich qoldig‘i kiritiladi."],
  pr_vis_on: ["Visible", "Виден", "Ko‘rinadi"],
  pr_vis_off: ["Hidden", "Скрыт", "Yashirin"],
  pr_vis_tip: ["Show or hide this product on your storefront", "Показать или скрыть товар в магазине", "Mahsulotni vitrinada ko‘rsatish yoki yashirish"],
  pr_visible: ["Visible on storefront", "Видно в магазине", "Vitrinada ko‘rinadi"],
  pr_hidden: ["Hidden", "Скрыт", "Yashirin"],
  pr_duplicate: ["Duplicate", "Дублировать", "Nusxalash"],
  pr_confirm_del_t: ["Delete this product?", "Удалить товар?", "Mahsulot o‘chirilsinmi?"],
  pr_confirm_del_d: ["It disappears from your catalog. Past sales stay in your sales log.", "Он исчезнет из каталога. Продажи останутся в журнале.", "Katalogdan yo‘qoladi. Sotuvlar jurnalda qoladi."],
  pr_reorder: ["Drag to reorder — this is the order customers see", "Перетащите, чтобы изменить порядок в магазине", "Tortib tartibni o‘zgartiring"],
  pr_saved: ["Product saved", "Товар сохранён", "Mahsulot saqlandi"],
  pr_status: ["Status", "Статус", "Holat"],
  pr_missing: ["Needs photos or details", "Не хватает фото или описания", "Rasm yoki tavsif yetishmaydi"],
  pr_category: ["Category", "Категория", "Kategoriya"],
});

// ---------- home ----------
addI18N({
  hm_soldout: ["{n} sold out", "{n} нет в наличии", "{n} tugagan"],
  hm_low: ["{n} low on stock", "{n} заканчиваются", "{n} kamaygan"],
  hm_incomplete: ["{n} missing photos or details", "{n} без фото или описания", "{n} rasm yoki tavsifsiz"],
  hm_items_sold: ["Items sold", "Продано", "Sotilgan"],
  hm_revenue: ["Revenue", "Выручка", "Tushum"],
  hm_pviews: ["Product views", "Просмотры товаров", "Mahsulot ko‘rishlari"],
  hm_view_inv: ["Open inventory", "Открыть склад", "Omborni ochish"],
});

// ---------- orders ----------
addI18N({
  db_orders: ["Orders", "Заказы", "Buyurtmalar"],
  db_chats: ["Chats", "Чаты", "Chatlar"],
  sch_sub: ["Customers who wrote to you — orders and questions", "Клиенты, которые вам написали — заказы и вопросы", "Sizga yozgan mijozlar — buyurtma va savollar"],
  sch_empty_t: ["No chats yet", "Чатов пока нет", "Hozircha chat yo‘q"],
  sch_empty_d: ["When a customer sends an order or a message from your storefront, the conversation appears here.", "Когда клиент отправит заказ или сообщение из магазина, переписка появится здесь.", "Mijoz do‘kondan buyurtma yoki xabar yuborsa, suhbat shu yerda chiqadi."],
  sch_customer: ["Customer", "Клиент", "Mijoz"],
  sch_order_block: ["Customer’s order", "Заказ клиента", "Mijoz buyurtmasi"],
  sch_reply_ph: ["Reply to the customer…", "Ответ клиенту…", "Mijozga javob…"],
  sch_you: ["You", "Вы", "Siz"],
  sch_new: ["{n} new", "Новых: {n}", "Yangi: {n}"],
  sch_pick: ["Pick a chat on the left", "Выберите чат слева", "Chapdan chatni tanlang"],
  or_sub: ["Requests from your storefront — you confirm what you can fulfil", "Запросы из вашего магазина — вы подтверждаете то, что можете выполнить", "Vitrinangizdan so‘rovlar — bajarolganini tasdiqlaysiz"],
  or_new: ["New", "Новый", "Yangi"],
  or_confirmed: ["Confirmed", "Подтверждён", "Tasdiqlangan"],
  or_ready: ["Ready for pickup", "Готов к выдаче", "Olib ketishga tayyor"],
  or_out: ["Out for delivery", "В доставке", "Yetkazishda"],
  or_completed: ["Completed", "Выполнен", "Bajarildi"],
  or_cancelled: ["Cancelled", "Отменён", "Bekor qilindi"],
  or_all: ["All", "Все", "Barchasi"],
  or_open: ["Needs action", "Требует действия", "E’tibor kerak"],
  or_empty_t: ["No orders yet", "Заказов пока нет", "Buyurtma yo‘q"],
  or_empty_d: ["When a customer sends a request from your storefront, it lands here.", "Когда клиент отправит запрос из магазина, он появится здесь.", "Mijoz vitrinadan so‘rov yuborsa, shu yerda paydo bo‘ladi."],
  or_none_filter: ["Nothing in this status", "В этом статусе ничего нет", "Bu holatda hech narsa yo‘q"],
  or_customer: ["Customer", "Клиент", "Mijoz"],
  or_items: ["Items", "Товары", "Mahsulotlar"],
  or_delivery: ["Delivery", "Доставка", "Yetkazish"],
  or_payment: ["Payment", "Оплата", "To‘lov"],
  or_note: ["Customer note", "Заметка клиента", "Mijoz izohi"],
  or_placed: ["Requested", "Запрошен", "So‘rov yuborilgan"],
  or_total: ["Order total", "Сумма заказа", "Buyurtma summasi"],
  or_goods: ["Goods", "Товары", "Mahsulot"],
  or_fee: ["Delivery fee", "Доставка", "Yetkazish narxi"],
  or_confirm: ["Confirm order", "Подтвердить заказ", "Buyurtmani tasdiqlash"],
  or_confirm_d: ["Confirming takes the items off your shelf and records the sale.", "Подтверждение списывает товар со склада и записывает продажу.", "Tasdiqlash mahsulotni omborda kamaytiradi va sotuvni yozadi."],
  or_mark_ready: ["Mark ready", "Готов к выдаче", "Tayyor deb belgilash"],
  or_mark_out: ["Out for delivery", "Отправить в доставку", "Yetkazishga berish"],
  or_mark_done: ["Mark completed", "Выполнен", "Bajarildi deb belgilash"],
  or_cancel: ["Cancel order", "Отменить заказ", "Buyurtmani bekor qilish"],
  or_cancel_d: ["The customer gets a message. Nothing was taken off your shelf yet.", "Клиент получит сообщение. Со склада ничего не списано.", "Mijozga xabar boradi. Ombordan hech narsa yechilmagan."],
  or_cancel_after_d: ["The items go back on your shelf and the sale is reversed.", "Товар вернётся на склад, продажа отменится.", "Mahsulot omborga qaytadi, sotuv bekor bo‘ladi."],
  or_cancel_reason: ["Reason (the customer sees this)", "Причина (её увидит клиент)", "Sabab (mijoz ko‘radi)"],
  or_r_stock: ["Item is gone", "Товара нет", "Mahsulot yo‘q"],
  or_r_noreply: ["Customer stopped replying", "Клиент не отвечает", "Mijoz javob bermadi"],
  or_r_buyer: ["Customer changed their mind", "Клиент передумал", "Mijoz fikridan qaytdi"],
  or_conflict_t: ["Not enough stock for this order", "На складе не хватает товара", "Ombor bu buyurtmaga yetmaydi"],
  or_conflict_d: ["Your shelf changed since the request. Drop the lines you can’t fulfil, or confirm anyway and let stock go negative.", "Склад изменился после запроса. Уберите строки, которые не можете выполнить, или подтвердите с минусом.", "So‘rovdan keyin ombor o‘zgardi. Bajarolmaydigan qatorlarni olib tashlang yoki minusga tasdiqlang."],
  or_conflict_line: ["needs {b}, you have {a}", "нужно {b}, есть {a}", "{b} kerak, {a} bor"],
  or_drop_line: ["Drop this line", "Убрать строку", "Qatorni olib tashlash"],
  or_dropped: ["Dropped", "Убрано", "Olib tashlandi"],
  or_keep_line: ["Keep it", "Оставить", "Qoldirish"],
  or_confirm_partial: ["Confirm the rest", "Подтвердить остальное", "Qolganini tasdiqlash"],
  or_confirm_anyway: ["Confirm anyway", "Всё равно подтвердить", "Shunda ham tasdiqlash"],
  or_recount: ["Recount this variant in Inventory", "Пересчитайте в складе", "Omborda qayta hisoblang"],
  or_confirmed_toast: ["Order confirmed · stock updated", "Заказ подтверждён · склад обновлён", "Buyurtma tasdiqlandi · ombor yangilandi"],
  or_cancelled_toast: ["Order cancelled", "Заказ отменён", "Buyurtma bekor qilindi"],
  or_stale: ["{n}h", "{n} ч", "{n} s"],
  or_stale_full: ["Waiting {n}h for your answer", "Ждёт вашего ответа {n} ч", "Javobingizni {n} soat kutmoqda"],
  or_stale_badge: ["Waiting over a day: {n}", "Ждут больше суток: {n}", "Bir kundan ko‘p kutmoqda: {n}"],
  or_new_badge: ["New orders to answer: {n}", "Новые заказы: {n}", "Yangi buyurtmalar: {n}"],
  or_name: ["Name", "Имя", "Ism"],
  or_phone: ["Phone", "Телефон", "Telefon"],
  or_address: ["Address", "Адрес", "Manzil"],
  or_pending_row: ["Awaiting confirmation", "Ожидает подтверждения", "Tasdiqlash kutilmoqda"],
  or_pending_note: ["Requested orders are not sales yet — they appear here once you confirm them.", "Запросы ещё не продажи — они попадут сюда после подтверждения.", "So‘rovlar hali sotuv emas — tasdiqlagach shu yerda chiqadi."],
  or_tg_title: ["Telegram · rastashops.com", "Telegram · rastashops.com", "Telegram · rastashops.com"],
  or_tg_body: ["New order #{no} from {name} · items: {n} · {sum}", "Новый заказ #{no} от {name} · товаров: {n} · {sum}", "Yangi buyurtma #{no}, {name} · mahsulot: {n} · {sum}"],
  or_tg_open: ["Open order", "Открыть заказ", "Buyurtmani ochish"],
  or_history: ["Order history", "История заказа", "Buyurtma tarixi"],
  or_sale_no: ["Recorded as sale #{no}", "Записан как продажа #{no}", "Sotuv #{no} sifatida yozildi"],
});

// ---------- checkout (customer side) ----------
addI18N({
  co_title: ["Send your request", "Отправить запрос", "So‘rov yuborish"],
  co_sub: ["The shop confirms availability and answers you. Nothing is charged here.", "Магазин подтвердит наличие и ответит вам. Оплата здесь не проходит.", "Do‘kon mavjudligini tasdiqlaydi va javob beradi. To‘lov bu yerda emas."],
  co_name: ["Your name", "Ваше имя", "Ismingiz"],
  co_phone: ["Phone number", "Номер телефона", "Telefon raqami"],
  co_address: ["Address", "Адрес", "Manzil"],
  co_address_ph: ["Street, house, apartment, landmark", "Улица, дом, квартира, ориентир", "Ko‘cha, uy, xonadon, mo‘ljal"],
  co_address_pickup: ["Not needed for pickup", "Для самовывоза не нужен", "Olib ketish uchun shart emas"],
  co_how: ["How do you want it?", "Как получить?", "Qanday olasiz?"],
  co_pay: ["How will you pay?", "Как оплатите?", "Qanday to‘laysiz?"],
  co_note: ["Note for the shop (optional)", "Заметка магазину (необязательно)", "Do‘konga izoh (ixtiyoriy)"],
  co_send: ["Send request", "Отправить запрос", "So‘rov yuborish"],
  co_sent_t: ["Request sent", "Запрос отправлен", "So‘rov yuborildi"],
  co_sent_d: ["{store} will confirm what’s available and message you.", "{store} подтвердит наличие и напишет вам.", "{store} mavjudligini tasdiqlab, sizga yozadi."],
  co_order_no: ["Your order number", "Номер заказа", "Buyurtma raqami"],
  co_track: ["Track this order", "Отследить заказ", "Buyurtmani kuzatish"],
  co_keep_link: ["Keep this link — it shows the status.", "Сохраните ссылку — по ней виден статус.", "Havolani saqlang — holat ko‘rinadi."],
  co_sms: ["We’ll text you when the shop answers.", "Мы напишем, когда магазин ответит.", "Do‘kon javob berganda SMS yuboramiz."],
  co_need_name: ["Enter your name", "Введите имя", "Ismingizni kiriting"],
  co_need_phone: ["Enter a valid phone number", "Введите корректный номер", "To‘g‘ri raqam kiriting"],
  co_need_address: ["Enter an address for delivery", "Введите адрес доставки", "Yetkazish manzilini kiriting"],
  co_status_t: ["Order {no}", "Заказ {no}", "Buyurtma {no}"],
  co_waiting: ["Waiting for the shop to confirm", "Ждём подтверждения магазина", "Do‘kon tasdiqlashini kutmoqdamiz"],
  co_cancel_own: ["Cancel my request", "Отменить запрос", "So‘rovni bekor qilish"],
  co_cancel_own_d: ["You can cancel while the shop hasn’t confirmed yet.", "Можно отменить, пока магазин не подтвердил.", "Do‘kon tasdiqlamaguncha bekor qilish mumkin."],
  co_cancelled_own: ["You cancelled this request", "Вы отменили запрос", "So‘rovni bekor qildingiz"],
  co_sms_log: ["Messages sent to you", "Сообщения для вас", "Sizga yuborilgan xabarlar"],
  co_sms_new: ["rastashops.com: request {no} sent to {store}. We’ll text you when they answer.", "rastashops.com: запрос {no} отправлен в {store}. Напишем, когда ответят.", "rastashops.com: {no} so‘rovi {store}ga yuborildi. Javob bo‘lsa yozamiz."],
  co_sms_confirmed: ["rastashops.com: {store} confirmed order {no}. Agree on hand-over in chat.", "rastashops.com: {store} подтвердил заказ {no}. Договоритесь о передаче в чате.", "rastashops.com: {store} {no} buyurtmani tasdiqladi. Topshirishni chatda kelishing."],
  co_sms_ready: ["rastashops.com: order {no} is ready.", "rastashops.com: заказ {no} готов.", "rastashops.com: {no} buyurtma tayyor."],
  co_sms_out: ["rastashops.com: order {no} is ready.", "rastashops.com: заказ {no} готов.", "rastashops.com: {no} buyurtma tayyor."],
  co_sms_completed: ["rastashops.com: order {no} completed. Thank you!", "rastashops.com: заказ {no} выполнен. Спасибо!", "rastashops.com: {no} buyurtma bajarildi. Rahmat!"],
  co_sms_cancelled: ["rastashops.com: {store} cancelled order {no}. {why}", "rastashops.com: {store} отменил заказ {no}. {why}", "rastashops.com: {store} {no} buyurtmani bekor qildi. {why}"],
});

// ---------- categories & attributes ----------
addI18N({
  cat_platform: ["Category", "Категория", "Kategoriya"],
  cat_platform_d: ["The category decides which details and options this product has, and how buyers find it in rasta bozor.", "Категория определяет характеристики и опции товара и то, как его найдут в rasta bozor.", "Kategoriya mahsulot xususiyatlari va variantlarini, hamda rasta bozorda topilishini belgilaydi."],
  at_specs: ["Details buyers filter by", "Характеристики для фильтров", "Filtr uchun xususiyatlar"],
  at_specs_d: ["These come from the category and describe the whole product.", "Зависят от категории и описывают товар целиком.", "Kategoriyaga bog‘liq, butun mahsulotni tavsiflaydi."],
  at_variants_d: ["Pick the values you sell. Every combination becomes its own stock row with its own barcode.", "Выберите, что продаёте. Каждая комбинация — своя строка склада со своим штрихкодом.", "Sotadiganini tanlang. Har bir kombinatsiya alohida ombor qatori va shtrix-kod."],
  at_no_variants: ["This category is sold as single units — one stock row, no options.", "В этой категории товар продаётся по одному — одна строка склада.", "Bu kategoriya dona bilan sotiladi — bitta ombor qatori."],
  at_combos: ["Stock rows: {n}", "Строк склада: {n}", "Ombor qatorlari: {n}"],
  at_pick: ["Choose…", "Выберите…", "Tanlang…"],
  mkt_cat: ["Category", "Категория", "Kategoriya"],
  mkt_all_cats: ["All categories", "Все категории", "Barcha kategoriyalar"],
  mkt_count_n: ["Shops: {n}", "Магазинов: {n}", "Do‘konlar: {n}"],
});

// ---------- ratings & reviews ----------
addI18N({
  rv_title: ["Reviews", "Отзывы", "Sharhlar"],
  rv_none: ["No reviews yet", "Отзывов пока нет", "Sharh yo‘q"],
  rv_none_d: ["Be the first to review this product.", "Оставьте первый отзыв об этом товаре.", "Bu mahsulotga birinchi sharh yozing."],
  rv_write: ["Write a review", "Написать отзыв", "Sharh yozish"],
  rv_your_rating: ["Your rating", "Ваша оценка", "Bahoyingiz"],
  rv_your_text: ["Your review", "Ваш отзыв", "Sharhingiz"],
  rv_text_ph: ["Quality, size, service — what should other buyers know?", "Качество, размер, сервис — что стоит знать покупателям?", "Sifat, o‘lcham, xizmat — xaridorlar nimani bilishi kerak?"],
  rv_send: ["Post review", "Опубликовать", "Yuborish"],
  rv_thanks: ["Thanks — your review is up", "Спасибо — отзыв опубликован", "Rahmat — sharh chiqdi"],
  rv_anon: ["Customer", "Покупатель", "Xaridor"],
  rv_count: ["Reviews: {n}", "Отзывов: {n}", "Sharhlar: {n}"],
  rv_based: ["Based on {n} reviews", "На основе {n} отзывов", "{n} ta sharh asosida"],
  rv_sub: ["What customers say about your products", "Что покупатели говорят о ваших товарах", "Mijozlar mahsulotlaringiz haqida nima deydi"],
  rv_avg: ["Average rating", "Средняя оценка", "O‘rtacha baho"],
  rv_total: ["Total reviews", "Всего отзывов", "Jami sharhlar"],
  rv_recent: ["Recent comments", "Последние комментарии", "So‘nggi izohlar"],
  rv_by_product: ["By product", "По товарам", "Mahsulot bo‘yicha"],
  rv_no_yet: ["No reviews yet — they appear after customers rate your products.", "Отзывов пока нет — они появятся, когда покупатели оценят товары.", "Sharh yo‘q — mijozlar baholagach paydo bo‘ladi."],
  rv_stars_n: ["{n} stars", "{n} звёзд", "{n} yulduz"],
  pp_back: ["Back to shop", "Назад в магазин", "Do‘konga qaytish"],
});
const RV_TEXTS = [
  "Juda sifatli, rahmat!", "Отличное качество, размер подошёл.", "Sotuvchi tez javob berdi.",
  "Ткань приятная, цвет как на фото.", "Narxiga arziydi.", "Упаковка аккуратная, всё как на фото.",
  "O‘lchami to‘g‘ri keldi, yana olaman.", "Качество супер, беру второй раз.", "Rasmdagidek chiroyli.",
  "Продавец быстро ответил, всё чётко.",
];
const RV_NAMES = ["Dilnoza","Aziz","Kamola","Javohir","Nilufar","Sardor","Zulfiya","Bekzod","Madina","Timur"];
function seedReviews(catalog){
  const out = {};
  const now = Date.now();
  SHOP_ORDER.forEach(sid=>{
    const list = [];
    (catalog[sid]||[]).forEach((p,pi)=>{
      const h = _hash(sid+p.id+"rv");
      const n = h % 7; // 0..6 reviews per product
      for(let k=0;k<n;k++){
        const hh = _hash(sid+p.id+"rv"+k);
        list.push({ id:"rv"+hh.toString(36), productId:p.id,
          rating: 3 + (hh % 100 < 14 ? 0 : hh % 100 < 45 ? 1 : 2),
          name: RV_NAMES[hh % RV_NAMES.length],
          text: RV_TEXTS[hh % RV_TEXTS.length],
          at: now - (2 + (hh % 40)) * 86400000 - (hh % 20) * 3600000 });
      }
    });
    out[sid] = list.sort((a,b)=>b.at-a.at);
  });
  return out;
}
function ratingStats(reviews){
  const n = reviews.length;
  if(!n) return { n:0, avg:0, dist:[0,0,0,0,0] };
  const dist = [0,0,0,0,0];
  let sum = 0;
  reviews.forEach(r=>{ sum += r.rating; dist[r.rating-1]++; });
  return { n, avg: Math.round((sum/n)*10)/10, dist };
}

// ---------- buyer account ----------
addI18N({
  ac_title: ["Your account", "Ваш аккаунт", "Akkauntingiz"],
  ac_signin_t: ["Sign in to send your request", "Войдите, чтобы отправить запрос", "So‘rov yuborish uchun kiring"],
  ac_signin_t2: ["Sign in with your phone", "Войдите по номеру телефона", "Telefon raqami bilan kiring"],
  ac_signin_d: ["Your phone number is your account. Shops see that it’s verified, and your orders follow you to any device.", "Ваш номер — это аккаунт. Магазины видят, что он подтверждён, а заказы доступны на любом устройстве.", "Raqamingiz — akkauntingiz. Do‘konlar tasdiqlanganini ko‘radi, buyurtmalar har qanday qurilmada."],
  ac_why1: ["Shops know you’re a real customer", "Магазины видят реального клиента", "Do‘kon haqiqiy mijozni ko‘radi"],
  ac_why2: ["Your addresses are saved for next time", "Адреса сохраняются на будущее", "Manzillar keyingi safar uchun saqlanadi"],
  ac_why3: ["Your orders open on any device", "Заказы доступны на любом устройстве", "Buyurtmalar har qanday qurilmada"],
  ac_signed_as: ["Signed in as", "Вы вошли как", "Kirdingiz:"],
  ac_signout: ["Sign out", "Выйти", "Chiqish"],
  ac_signin: ["Sign in", "Войти", "Kirish"],
  ac_verified: ["Verified", "Подтверждён", "Tasdiqlangan"],
  ac_verified_h: ["Phone verified by SMS", "Номер подтверждён по SMS", "Raqam SMS bilan tasdiqlangan"],
  ac_unverified: ["Not verified", "Не подтверждён", "Tasdiqlanmagan"],
  ac_name: ["Your name", "Ваше имя", "Ismingiz"],
  ac_name_d: ["Shops see this on your orders.", "Магазины видят его в заказах.", "Do‘konlar buyurtmalarda ko‘radi."],
  ac_addresses: ["Saved addresses", "Сохранённые адреса", "Saqlangan manzillar"],
  ac_add_address: ["Add an address", "Добавить адрес", "Manzil qo‘shish"],
  ac_addr_label: ["Label", "Название", "Nomi"],
  ac_addr_label_ph: ["Home, work, mum’s place…", "Дом, работа, у мамы…", "Uy, ish, onamning uyi…"],
  ac_addr_default: ["Default", "По умолчанию", "Asosiy"],
  ac_set_default: ["Make default", "Сделать основным", "Asosiy qilish"],
  ac_no_addr: ["No saved addresses yet", "Сохранённых адресов пока нет", "Saqlangan manzil yo‘q"],
  ac_new_addr: ["New address", "Новый адрес", "Yangi manzil"],
  ac_use_saved: ["Use a saved address", "Использовать сохранённый", "Saqlanganidan foydalanish"],
  ac_save_addr: ["Save this address to my account", "Сохранить адрес в аккаунт", "Manzilni akkauntga saqlash"],
  ac_my_orders: ["My orders", "Мои заказы", "Buyurtmalarim"],
  ac_no_orders: ["No orders yet", "Заказов пока нет", "Buyurtma yo‘q"],
  ac_no_orders_d: ["Requests you send to shops appear here.", "Запросы магазинам появятся здесь.", "Do‘konlarga yuborilgan so‘rovlar shu yerda."],
  ac_orders_n: ["Orders: {n}", "Заказов: {n}", "Buyurtmalar: {n}"],
  ac_tab_profile: ["Profile", "Профиль", "Profil"],
  ac_tab_orders: ["Orders", "Заказы", "Buyurtmalar"],
  ac_saved: ["Saved", "Сохранено", "Saqlandi"],
  ac_welcome: ["Welcome back, {name}", "С возвращением, {name}", "Xush kelibsiz, {name}"],
  ac_signedin_toast: ["Signed in", "Вы вошли", "Kirdingiz"],
  ac_prefilled: ["From your account — edit if you like", "Из вашего аккаунта — можно изменить", "Akkauntdan olindi — o‘zgartirsangiz bo‘ladi"],
  ac_across: ["Signed in on this device", "Вы вошли на этом устройстве", "Bu qurilmada kirdingiz"],
});

// ---------- delivery methods ----------
const DELIVERY_METHODS = [
  { id:"pickup",  fee:0,     label:{ en:"Pickup from the seller", ru:"Самовывоз", uz:"O‘zim olib ketaman" },
    hint:{ en:"Agree a time in chat", ru:"Время согласуете в чате", uz:"Vaqtni chatda kelishasiz" } },
  { id:"courier", fee:25000, label:{ en:"City courier", ru:"Курьер по городу", uz:"Shahar kuryeri" },
    hint:{ en:"Flat fee, same or next day", ru:"Фикс. цена, сегодня или завтра", uz:"Belgilangan narx, bugun yoki ertaga" } },
  { id:"post",    fee:35000, label:{ en:"Regional post", ru:"Почта по регионам", uz:"Viloyatga pochta" },
    hint:{ en:"2–5 days across Uzbekistan", ru:"2–5 дней по Узбекистану", uz:"O‘zbekiston bo‘ylab 2–5 kun" } },
  { id:"chat",    fee:0,     label:{ en:"Agree in chat", ru:"Договоримся в чате", uz:"Chatda kelishamiz" },
    hint:{ en:"The shop suggests options", ru:"Магазин предложит варианты", uz:"Do‘kon variant taklif qiladi" } },
];
const ORDER_PAY = [
  { id:"cod",   label:{ en:"Cash", ru:"Наличными", uz:"Naqd" } },
  { id:"payme", label:{ en:"Payme / Click prepayment", ru:"Payme / Click предоплата", uz:"Payme / Click oldindan" } },
  { id:"chat",  label:{ en:"Agree in chat", ru:"Договоримся в чате", uz:"Chatda kelishamiz" } },
];
const ORDER_STATES = ["new","confirmed","ready","out","completed","cancelled"];
function orderStateLabel(s, t){
  return ({ new:t.or_new, confirmed:t.or_confirmed, ready:t.or_ready, out:t.or_out,
    completed:t.or_completed, cancelled:t.or_cancelled })[s] || s;
}
function deliveryLabel(id, lang){
  const m = DELIVERY_METHODS.find(x=>x.id===id);
  return m? m.label[lang] : id;
}
function orderPayLabel(id, lang){
  const m = ORDER_PAY.find(x=>x.id===id);
  return m? m.label[lang] : id;
}
function deliveryFee(id){
  const m = DELIVERY_METHODS.find(x=>x.id===id);
  return m? m.fee : 0;
}

// seeded orders so the seller's Orders tab has real history
const ORDER_NAMES = ["Dilnoza R.","Aziz T.","Kamola S.","Javohir M.","Nilufar A.","Sardor K.","Zulfiya N.","Bekzod I."];
const ORDER_ADDR = ["Chilonzor 9, dom 42, kv 15","Yunusobod 4, dom 7, kv 3","Mirzo Ulugbek, Buyuk Ipak Yuli 12","Sergeli 6, dom 21, kv 88","Shayxontohur, Zarqaynar 44"];
function seedOrders(catalog){
  const out = {};
  const now = Date.now();
  SHOP_ORDER.forEach(sid=>{
    const prods = catalog[sid] || [];
    if(!prods.length){ out[sid] = []; return; }
    const list = [];
    const n = 3 + (_hash(sid+"o") % 3);
    for(let i=0;i<n;i++){
      const h = _hash(sid+"order"+i);
      const nLines = 1 + (h % 2);
      const lines = [];
      for(let k=0;k<nLines;k++){
        const p = prods[(h + k*5) % prods.length];
        if(!p) continue;
        const v = p.variants[(h+k) % p.variants.length];
        if(lines.some(l=>l.variantId===v.id)) continue;
        lines.push({ variantId:v.id, productId:p.id, name:p.name.en, label:vLabel(p,v,"en"),
          qty: 1 + ((h>>>(k+2)) % 2), unit:(v.price!=null? v.price : p.price), dropped:false });
      }
      if(!lines.length) continue;
      const status = i===0? "new" : i===1? "new" : (h%3===0? "confirmed" : i===2? "confirmed" : "completed");
      const dm = DELIVERY_METHODS[0];   // no delivery: hand-over is agreed in chat, no fee
      const at = now - (i===0? (h%9)*3600000 : i===1? (26 + h%20)*3600000 : (2 + i)*86400000);
      const goods = lines.reduce((a,l)=>a+l.qty*l.unit,0);
      list.push({
        id:"o"+h.toString(36), no: 1040 + i + (_hash(sid)%9)*7, at, status,
        customer:{ name:ORDER_NAMES[h % ORDER_NAMES.length], phone:"+998 9"+(h%9)+" "+(100+h%900)+" "+(10+h%90)+" "+(10+h%80),
          address: dm.id==="pickup"? "" : ORDER_ADDR[h % ORDER_ADDR.length], verified: h%5!==0 },
        delivery:{ method:dm.id, fee:dm.fee }, pay:{ method: ORDER_PAY[h % ORDER_PAY.length].id },
        lines, goods, total: goods + dm.fee, note: h%4===0? "Iltimos, kechqurun qo‘ng‘iroq qiling" : "",
        history:[{ status:"new", at }].concat(status==="new"? [] : [{ status, at: at + 5400000 }]),
        saleId:null, sms:[{ kind:"new", at }].concat(status==="new"? [] : [{ kind:status, at: at + 5400000 }]),
      });
    }
    out[sid] = list.sort((a,b)=>b.at-a.at);
  });
  return out;
}

// ---------- cities & payments ----------
const UZ_CITIES = ["Tashkent", "Samarkand", "Bukhara", "Andijan", "Namangan", "Fergana", "Nukus", "Qarshi"];
const PAY_METHODS = [
  { id: "cash", label: { en: "Cash", ru: "Наличные", uz: "Naqd" } },
  { id: "payme", label: { en: "Payme", ru: "Payme", uz: "Payme" } },
  { id: "click", label: { en: "Click", ru: "Click", uz: "Click" } },
  { id: "uzcard", label: { en: "Uzcard", ru: "Uzcard", uz: "Uzcard" } },
  { id: "transfer", label: { en: "Transfer", ru: "Перевод", uz: "O‘tkazma" } },
];
const UZ_OPERATORS = ["90", "91", "93", "94", "95", "97", "98", "99", "88", "77", "33", "20"];

// ---------- slugs ----------
function catSlug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

// ---------- variants, barcodes, stock ----------
const DEFAULT_THRESHOLD = 3;
function barcodeFor(shopId, seq){
  return "RS-" + String(shopId).slice(0, 4).toUpperCase() + "-" + String(seq).padStart(5, "0");
}
let _bcSeq = {};
// every barcode ever issued or loaded, so generation can never re-issue one
const BC_USED = new Set();
function registerBarcode(code){ if(code) BC_USED.add(String(code).toUpperCase()); }
function registerCatalogBarcodes(catalog){
  Object.keys(catalog || {}).forEach(sid => (catalog[sid] || []).forEach(p =>
    (p.variants || []).forEach(v => {
      registerBarcode(v.barcode);
      const m = /^RS-[A-Z0-9]+-(\d+)$/.exec(String(v.barcode || "").toUpperCase());
      if(m) _bcSeq[sid] = Math.max(_bcSeq[sid] || 0, Number(m[1]));
    })));
}
function nextBarcode(shopId){
  let code;
  do {
    _bcSeq[shopId] = (_bcSeq[shopId] || 0) + 1;
    code = barcodeFor(shopId, _bcSeq[shopId]);
  } while(BC_USED.has(code.toUpperCase()));
  registerBarcode(code);
  return code;
}
function seedQty(key, stock, isFirst){
  const h = _hash(key);
  if(stock === "sold") return 0;
  if(stock === "low") return isFirst ? 1 + (h % 3) : 0;
  return 4 + (h % 19);
}
function roundSoum(n){ return Math.round(n / 500) * 500; }
function seedValues(attr, key, want){
  const list = attr.values || [];
  if(!list.length) return [];
  const h = _hash(key + attr.id);
  const n = Math.max(1, Math.min(want, list.length));
  const start = h % Math.max(1, list.length - n + 1);
  return list.slice(start, start + n).map(v => v.id);
}
// demo shops: bigger versions cost more (256 GB, a set of 12, 1 kg...) — the variant keeps its own price
const VARIANT_PRICE_STEP = {
  storage:   { "64 gb":0.85, "256 gb":1.2, "512 gb":1.45, "1 tb":1.8 },
  set_size:  { "1":0.25, "12":1.8, "24":3.2 },
  weight_g:  { "100 g":0.35, "250 g":0.6, "1 kg":1.85 },
  volume_ml: { "15":0.55, "50":1.4, "100":2.2, "200":3.4 },
  bouquet_size:{ "s":0.6, "l":1.9 },
  capacity:  { "0.5":0.6, "3":1.4, "5":1.8 },
  weight_kg: { "2":0.4, "4":0.6, "10":1.6, "12":1.9, "16":2.4, "20":2.9, "24":3.4 },
};
function seedVariantPrice(p, options){
  let m = 1;
  Object.keys(options||{}).forEach(a=>{ const step = VARIANT_PRICE_STEP[a]; if(step && step[options[a]]!=null) m *= step[options[a]]; });
  return m===1? null : roundSoum(p.price * m);
}
function makeVariants(shopId, p, catId){
  const vAttrs = variantAttrs(catId);
  const chosen = {};
  vAttrs.forEach((attr, i) => {
    chosen[attr.id] = seedValues(attr, shopId + p.id, attr.chart ? 4 : (i === 0 ? 3 : 2));
  });
  return combineOptions(catId, chosen).map((options, i) => {
    const key = optionsKey(options) || "default";
    const h = _hash(shopId + p.id + key + "c");
    const noCost = (h % 100) < 12;
    return {
      id: p.id + "-" + (catSlug(key) || "default"),
      options,
      barcode: nextBarcode(shopId),
      qty: seedQty(shopId + p.id + key, p.stock, i === 0),
      price: seedVariantPrice(p, options),
      avgCost: noCost ? null : roundSoum((seedVariantPrice(p, options) || p.price) * (0.46 + (h % 22) / 100)),
    };
  });
}
function makeSpecs(shopId, p, catId){
  const out = {};
  specAttrs(catId).forEach(attr => {
    const h = _hash(shopId + p.id + attr.id + "s");
    if(attr.kind === "text"){ out[attr.id] = ""; return; }
    if(attr.kind === "bool"){ out[attr.id] = h % 2 === 0; return; }
    if(attr.kind === "number"){
      const min = attr.min != null ? attr.min : 1;
      const max = attr.max != null ? attr.max : min + 200;
      out[attr.id] = min + (h % Math.max(1, max - min));
      return;
    }
    const list = attr.values || [];
    if(!list.length) return;
    if(attr.kind === "multi"){
      const k = 1 + (h % 2), st = h % Math.max(1, list.length - k);
      out[attr.id] = list.slice(st, st + k).map(v => v.id);
      return;
    }
    out[attr.id] = list[h % list.length].id;
  });
  return out;
}
function margin(price, cost){
  if(!price || cost == null) return null;
  return (price - cost) / price;
}
function priceForMargin(cost, m){
  if(cost == null || m == null || m >= 1) return null;
  return roundSoum(cost / (1 - m));
}
function pct(x){ return Math.round((x || 0) * 100); }
function vLabel(p, v, lang){ return variantLabel(p.catId, (v && v.options)||{}, lang); }
function totalQty(p){ return (p.variants || []).reduce((n, v) => n + Math.max(0, v.qty), 0); }
function stockState(p, threshold){
  const q = totalQty(p);
  const th = p.threshold != null ? p.threshold : (threshold != null ? threshold : DEFAULT_THRESHOLD);
  if(q <= 0) return "sold";
  if(q <= th) return "low";
  return "in";
}
function variantState(v, threshold){
  const th = v.threshold != null ? v.threshold : (threshold != null ? threshold : DEFAULT_THRESHOLD);
  if(v.qty <= 0) return "out";
  if(v.qty <= th) return "low";
  return "ok";
}

// ---------- shop-level settings not present in the seed data ----------
const CONTACT_SEED = {
  lola: { instagram: "lolaatelier", telegram: "lolaatelier", phone: "+998 90 123 45 67" },
  choyxona: { instagram: "nonandco.uz", telegram: "nonandco", phone: "+998 91 887 20 14" },
  gulnoza: { instagram: "gulnoza.beauty", telegram: "gulnozabeauty", phone: "+998 93 400 71 08" },
  silkroad: { instagram: "silkroadgoods", telegram: "silkroadbukhara", phone: "+998 97 512 66 30" },
  bahor: { instagram: "bahor.flowers", telegram: "bahorflowers", phone: "+998 94 220 18 77" },
  kicks: { instagram: "tashkentkicks", telegram: "tkkicks", phone: "+998 99 145 90 02" },
};
function defaultSettings(shop){
  const seed = CONTACT_SEED[shop.id] || { instagram: shop.handle, telegram: shop.handle, phone: "+998 90 000 00 00" };
  return {
    name: shop.name, handle: shop.handle, city: shop.location, type: shop.type,
    tagline: { ...shop.tagline },
    contacts: { ...seed },
    delivery: { en: "", ru: "", uz: "" },   // rastashops has no delivery
    payments: ["cash", "payme", "click"],
    threshold: DEFAULT_THRESHOLD,
    showSold: true,
    status: "live",
    plan: shop.id === "kicks" || shop.id === "lola" ? "pro" : "starter",
    trialDays: 148,
    phone: "+998 90 123 45 67",
  };
}

// ---------- build the runtime catalog (taxonomy-driven) ----------
const SHOP_LEAVES = {
  lola:     ["cl-w-dresses", "cl-w-tops", "cl-w-trousers", "cl-w-outer", "cl-w-skirts"],
  choyxona: ["fd-p-bread", "fd-p-honey", "fd-d-tea", "fd-s-choc", "fd-p-nuts"],
  gulnoza:  ["cs-f-found", "cs-l-stick", "cs-s-serum", "cs-s-cream", "cs-f-powder"],
  silkroad: ["hm-d-ceramics", "hm-d-textile", "hm-k-table", "hm-t-bedding", "hm-k-cook"],
  bahor:    ["fl-b-mixed", "fl-b-roses", "fl-p-indoor", "fl-b-dried"],
  kicks:    ["fw-m-sneakers", "fw-w-sneakers", "fw-m-boots", "fw-m-shoes"],
};
const TYPE_LEAVES = {
  fashion: ["cl-w-dresses", "cl-w-tops", "cl-m-shirts", "fw-w-sneakers"],
  footwear:["fw-w-sneakers", "fw-m-sneakers", "fw-m-boots"],
  vehicles:["vh-c-sedan", "vh-c-suv", "vh-p-tyres"],
  flowers: ["fl-b-mixed", "fl-b-roses", "fl-p-indoor"],
  health:  ["sp-v-multi", "sp-v-single", "sp-s-protein"],
  sport:   ["gy-w-dumbbell", "gy-w-kettle", "gy-a-mats"],
  electronics:["el-p-smart", "el-a-head", "el-c-laptop"],
  cosmetics:["cs-f-found", "cs-l-stick", "cs-s-serum"],
  food:    ["fd-p-nuts", "fd-p-honey", "fd-d-tea"],
  beauty:  ["cs-f-found", "cs-l-stick", "cs-s-serum"],
  furniture:["fu-sofa", "fu-table", "fu-cab"],
  religious:["rl-mat", "rl-tasbeh", "rl-gift"],
  party:   ["pt-balloon", "pt-decor", "pt-wrap"],
  handmade:["hd-soap", "hd-knit", "hd-embroid"],
  wedding: ["wd-dress", "wd-evening", "wd-sarpo"],
  desserts:["fd-cake", "fd-bento", "fd-cupcake"],
  home:    ["hm-d-ceramics", "hm-k-table", "hm-t-bedding"],
  gifts:   ["fl-b-mixed", "fl-b-roses"],
};
function leavesForShop(sid, type){ return SHOP_LEAVES[sid] || TYPE_LEAVES[type] || ["hm-d-ceramics"]; }
function buildCatalog(){
  const out = {};
  SHOP_ORDER.forEach(sid => {
    const s = SHOPS[sid];
    const leaves = leavesForShop(sid, s.type);
    out[sid] = s.products.map((p, i) => {
      const catId = leaves[(p.cat != null ? p.cat : i) % leaves.length];
      return {
        id: p.id, catId, specs: makeSpecs(sid, p, catId),
        name: { ...p.name }, desc: { ...p.desc }, price: p.price, tone: p.tone,
        visible: true, photos: 4, sort: i,
        variants: makeVariants(sid, p, catId),
        created: Date.now() - (i + 1) * 86400000 * 3,
      };
    });
  });
  return out;
}

// ---------- seeded movements + sales (so Inventory / Sales have history) ----------
const SUPPLIERS = ["Abu Sahiy", "Chorsu", "Sergeli sklad", "Yunusobod bozor", "Karaganda cargo"];
function seedHistory(catalog){
  const movements = {}, sales = {};
  const now = Date.now();
  SHOP_ORDER.forEach(sid => {
    const prods = catalog[sid];
    const mv = [], sl = [];
    prods.forEach(p => p.variants.forEach(v => {
      const h = _hash(sid + v.id + "r");
      const older = v.avgCost != null ? roundSoum(v.avgCost * 0.86) : null;
      mv.push({ id: "m" + h.toString(36), variantId: v.id, productId: p.id,
        delta: v.qty + (h % 6), reason: "restock", unitCost: v.avgCost, avgAfter: v.avgCost,
        note: SUPPLIERS[h % SUPPLIERS.length], at: now - (20 + h % 9) * 86400000 });
      if(h % 3 === 0){
        mv.push({ id: "m" + h.toString(36) + "b", variantId: v.id, productId: p.id,
          delta: 6 + (h % 5), reason: "restock", unitCost: older, avgAfter: older,
          note: SUPPLIERS[(h + 2) % SUPPLIERS.length], at: now - (44 + h % 12) * 86400000 });
      }
      if(h % 17 === 0){
        mv.push({ id: "m" + h.toString(36) + "l", variantId: v.id, productId: p.id,
          delta: -1, reason: "loss", unitCost: v.avgCost, note: "", at: now - (5 + h % 20) * 86400000 });
      }
    }));
    const nSales = 6 + (_hash(sid) % 8);
    for(let i = 0; i < nSales; i++){
      const h = _hash(sid + "sale" + i);
      const at = now - Math.floor((h % 2600) / 100) * 86400000 - (h % 20) * 3600000;
      const nLines = 1 + (h % 3);
      const lines = [];
      for(let k = 0; k < nLines; k++){
        const p = prods[(h + k * 7) % prods.length];
        if(!p) continue;
        const v = p.variants[(h + k) % p.variants.length];
        const qty = 1 + ((h >>> (k + 1)) % 2);
        if(lines.some(l => l.variantId === v.id)) continue;
          const base = v.price!=null? v.price : p.price;
          const unit = (h % 9 === 0) ? roundSoum(base * 0.88) : base;
        lines.push({ variantId: v.id, productId: p.id, name: p.name.en, label: vLabel(p,v,"en"), qty, unit, cost: v.avgCost, returned: 0 });
      }
      if(!lines.length) continue;
      const pay = ["cash", "payme", "click", "cash", "transfer"][h % 5];
      const total = lines.reduce((n, l) => n + l.qty * l.unit, 0);
      const sale = { id: "s" + h.toString(36), no: 0, at, lines, total, pay, status: "completed" };
      sl.push(sale);
      lines.forEach(l => mv.push({ id: "m" + _hash(sale.id + l.variantId).toString(36), variantId: l.variantId,
        productId: l.productId, delta: -l.qty, reason: "sale", saleId: sale.id, at }));
    }
    sl.sort((a, b) => a.at - b.at);
    sl.forEach((s, i) => { s.no = 200 + i * 3 + (_hash(sid) % 7); });
    sl.reverse();
    mv.sort((a, b) => b.at - a.at);
    movements[sid] = mv; sales[sid] = sl;
  });
  return { movements, sales };
}

// ---------- storefront stats (seeded) ----------
function seedStats(catalog){
  const stats = {};
  SHOP_ORDER.forEach(sid => {
    const views = 400 + (_hash(sid + "v") % 2200);
    const pv = {};
    catalog[sid].forEach(p => { pv[p.id] = 20 + (_hash(sid + p.id) % 260); });
    stats[sid] = { views, productViews: pv };
  });
  return stats;
}

// ---------- formatting ----------
const MONTHS = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  ru: ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"],
  uz: ["yan","fev","mar","apr","may","iyn","iyl","avg","sen","okt","noy","dek"],
};
function fmtDate(ts, lang){
  const d = new Date(ts);
  return d.getDate() + " " + MONTHS[lang || "en"][d.getMonth()];
}
function fmtDateTime(ts, lang){
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
  return fmtDate(ts, lang) + " · " + hh + ":" + mm;
}
function relDay(ts, lang){
  const d = new Date(ts), n = new Date();
  const same = d.toDateString() === n.toDateString();
  if(same) return I18N[lang].sl_today;
  return fmtDate(ts, lang);
}
function fmtNum(n){ return Number(n || 0).toLocaleString("ru-RU").replace(/[,\u00a0]/g, "\u202f"); }
function textFB(obj, lang){
  if(!obj) return "";
  return obj[lang] || obj.uz || obj.ru || obj.en || "";
}

Object.assign(window, {
  seedValues, makeSpecs, leavesForShop, vLabel, seedReviews, ratingStats, SHOP_LEAVES, TYPE_LEAVES,
  _hash2: _hash, addI18N, fill, UZ_CITIES, PAY_METHODS, UZ_OPERATORS, catSlug,
  DEFAULT_THRESHOLD, barcodeFor, nextBarcode, registerBarcode, registerCatalogBarcodes, BC_USED, makeVariants, totalQty, stockState, variantState,
  defaultSettings, buildCatalog, seedHistory, seedStats, roundSoum, margin, priceForMargin, pct, SUPPLIERS, fmtDate, fmtDateTime, relDay, fmtNum, textFB,
});

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { _hash, addI18N, fill, RV_TEXTS, RV_NAMES, seedReviews, ratingStats, DELIVERY_METHODS, ORDER_PAY, ORDER_STATES, orderStateLabel, deliveryLabel, orderPayLabel, deliveryFee, ORDER_NAMES, ORDER_ADDR, seedOrders, UZ_CITIES, PAY_METHODS, UZ_OPERATORS, catSlug, DEFAULT_THRESHOLD, barcodeFor, _bcSeq, BC_USED, registerBarcode, registerCatalogBarcodes, nextBarcode, seedQty, roundSoum, seedValues, VARIANT_PRICE_STEP, seedVariantPrice, makeVariants, makeSpecs, margin, priceForMargin, pct, vLabel, totalQty, stockState, variantState, CONTACT_SEED, defaultSettings, SHOP_LEAVES, TYPE_LEAVES, leavesForShop, buildCatalog, SUPPLIERS, seedHistory, seedStats, MONTHS, fmtDate, fmtDateTime, relDay, fmtNum, textFB });
