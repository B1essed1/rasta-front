// ===== rastashops.com — data layer: i18n, themes, demo shops =====

// ---------- i18n ----------
const I18N = {
  en: {
    _label: "EN",
    nav_features: "Features", nav_themes: "Themes", nav_pricing: "Pricing", nav_login: "Log in",
    cta_start: "Create your shop", cta_demo: "See a live shop", cta_start_free: "Start free",
    hero_kicker: "Your Instagram shop \u2014 now a real store",
    hero_title: "Turn your DMs into a catalogue customers can browse.",
    hero_sub: "rasta gives every seller their own page: products, prices, sizes and an order button. No code, no fees to start. Share one link in your bio.",
    trusted: "Shops already selling on rasta",
    feat_kicker: "Everything a small shop needs",
    feat_title: "One link. A whole store.",
    f1_t: "Catalogue in minutes", f1_d: "Add a photo, a name and a price. Your products go live instantly \u2014 no website to build.",
    f2_t: "Themes that fit your brand", f2_d: "Pick a vibe, an accent colour and a layout. Your shop, your look \u2014 changed in one tap.",
    f3_t: "Orders straight to chat", f3_d: "Customers tap \u2018Order\u2019 and land in your Telegram or WhatsApp with the product ready.",
    f4_t: "Built for Uzbekistan", f4_d: "Prices in so\u02bcm, three languages, and the apps your customers already use.",
    themes_kicker: "Make it yours",
    themes_title: "Four looks. Endless shops.",
    themes_sub: "Every storefront starts from a preset, then you tune the accent, fonts and layout. Here\u2019s the same shop in four themes.",
    steps_title: "Live in three steps",
    s1: "Create your shop", s1d: "Name it, pick your row \u2014 fashion, food, beauty, anything.",
    s2: "Add your products", s2d: "Photo, price, sizes, stock. Paste from your phone in seconds.",
    s3: "Share your link", s3d: "Drop rastashops.com/yourshop in your bio and start taking orders.",
    cta_band_t: "Your shop is one link away.",
    cta_band_d: "Join thousands of sellers turning followers into customers.",
    footer_tag: "A market row, online.",
    // storefront
    sf_search: "Search products", sf_all: "All", sf_in_stock: "In stock", sf_low: "Only a few left",
    sf_sold: "Sold out", sf_sizes: "Sizes", sf_size: "Size", sf_order_tg: "Order on Telegram",
    sf_order_wa: "Order on WhatsApp", sf_share: "Share", sf_products: "products",
    sf_about: "About", sf_pick_size: "Pick a size", sf_desc: "Details", sf_more: "More from this shop",
    sf_back: "Back to shop", sf_empty: "No products match your search.",
    // dashboard
    db_title: "Dashboard", db_products: "Products", db_storefront: "Storefront", db_orders: "Orders",
    db_settings: "Settings", db_add: "Add product", db_published: "Published", db_hidden: "Hidden",
    db_theme: "Theme", db_accent: "Accent colour", db_layout: "Layout", db_font: "Typeface",
    db_preview: "Live preview", db_save: "Save changes", db_saved: "Saved",
    db_visit: "Visit shop", db_name: "Product name", db_price: "Price", db_stock: "Stock",
    db_sizes_lbl: "Sizes (comma separated)", db_desc_lbl: "Short description", db_cancel: "Cancel",
    db_create: "Add to catalogue", db_edit: "Edit", db_delete: "Delete",
    db_layout_grid: "Grid", db_layout_gallery: "Gallery", db_layout_list: "List", db_layout_mag: "Magazine",
    db_revenue: "This month", db_views: "Shop views", db_orders_n: "Orders", db_top: "Most viewed",
  },
  ru: {
    _label: "RU",
    nav_features: "\u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u0438", nav_themes: "\u0422\u0435\u043c\u044b", nav_pricing: "\u0426\u0435\u043d\u044b", nav_login: "\u0412\u043e\u0439\u0442\u0438",
    cta_start: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", cta_demo: "\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", cta_start_free: "\u041d\u0430\u0447\u0430\u0442\u044c \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e",
    hero_kicker: "\u0412\u0430\u0448 Instagram-\u043c\u0430\u0433\u0430\u0437\u0438\u043d \u2014 \u0442\u0435\u043f\u0435\u0440\u044c \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0438\u0439",
    hero_title: "\u041f\u0440\u0435\u0432\u0440\u0430\u0442\u0438\u0442\u0435 \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0443 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0443\u0434\u043e\u0431\u043d\u043e \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c.",
    hero_sub: "rasta \u0434\u0430\u0451\u0442 \u043a\u0430\u0436\u0434\u043e\u043c\u0443 \u043f\u0440\u043e\u0434\u0430\u0432\u0446\u0443 \u0441\u0432\u043e\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443: \u0442\u043e\u0432\u0430\u0440\u044b, \u0446\u0435\u043d\u044b, \u0440\u0430\u0437\u043c\u0435\u0440\u044b \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u0437\u0430\u043a\u0430\u0437\u0430. \u0411\u0435\u0437 \u043a\u043e\u0434\u0430. \u041e\u0434\u043d\u0430 \u0441\u0441\u044b\u043b\u043a\u0430 \u0432 \u0431\u0438\u043e.",
    trusted: "\u041c\u0430\u0433\u0430\u0437\u0438\u043d\u044b \u0443\u0436\u0435 \u043f\u0440\u043e\u0434\u0430\u044e\u0442 \u043d\u0430 rasta",
    feat_kicker: "\u0412\u0441\u0451, \u0447\u0442\u043e \u043d\u0443\u0436\u043d\u043e \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u043e\u043c\u0443 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0443",
    feat_title: "\u041e\u0434\u043d\u0430 \u0441\u0441\u044b\u043b\u043a\u0430. \u0426\u0435\u043b\u044b\u0439 \u043c\u0430\u0433\u0430\u0437\u0438\u043d.",
    f1_t: "\u041a\u0430\u0442\u0430\u043b\u043e\u0433 \u0437\u0430 \u043c\u0438\u043d\u0443\u0442\u044b", f1_d: "\u0424\u043e\u0442\u043e, \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438 \u0446\u0435\u043d\u0430. \u0422\u043e\u0432\u0430\u0440\u044b \u043f\u043e\u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u0441\u0440\u0430\u0437\u0443 \u2014 \u0431\u0435\u0437 \u0441\u0430\u0439\u0442\u0430.",
    f2_t: "\u0422\u0435\u043c\u044b \u043f\u043e\u0434 \u0432\u0430\u0448 \u0431\u0440\u0435\u043d\u0434", f2_d: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0438\u043b\u044c, \u0446\u0432\u0435\u0442 \u0438 \u0440\u0430\u0441\u043a\u043b\u0430\u0434\u043a\u0443. \u0412\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u2014 \u0432\u0430\u0448 \u0432\u0438\u0434.",
    f3_t: "\u0417\u0430\u043a\u0430\u0437\u044b \u0441\u0440\u0430\u0437\u0443 \u0432 \u0447\u0430\u0442", f3_d: "\u041a\u043b\u0438\u0435\u043d\u0442 \u043d\u0430\u0436\u0438\u043c\u0430\u0435\u0442 \u00ab\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c\u00bb \u0438 \u043f\u043e\u043f\u0430\u0434\u0430\u0435\u0442 \u0432 \u0432\u0430\u0448 Telegram \u0438\u043b\u0438 WhatsApp.",
    f4_t: "\u0421\u0434\u0435\u043b\u0430\u043d\u043e \u0434\u043b\u044f \u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d\u0430", f4_d: "\u0426\u0435\u043d\u044b \u0432 \u0441\u0443\u043c\u0430\u0445, \u0442\u0440\u0438 \u044f\u0437\u044b\u043a\u0430 \u0438 \u043f\u0440\u0438\u0432\u044b\u0447\u043d\u044b\u0435 \u043c\u0435\u0441\u0441\u0435\u043d\u0434\u0436\u0435\u0440\u044b.",
    themes_kicker: "\u0421\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u0441\u0432\u043e\u0438\u043c",
    themes_title: "\u0427\u0435\u0442\u044b\u0440\u0435 \u0441\u0442\u0438\u043b\u044f. \u0411\u0435\u0441\u043a\u043e\u043d\u0435\u0447\u043d\u043e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u043e\u0432.",
    themes_sub: "\u041a\u0430\u0436\u0434\u044b\u0439 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0441 \u043f\u0440\u0435\u0441\u0435\u0442\u0430, \u0430 \u0434\u0430\u043b\u044c\u0448\u0435 \u2014 \u0446\u0432\u0435\u0442, \u0448\u0440\u0438\u0444\u0442 \u0438 \u0440\u0430\u0441\u043a\u043b\u0430\u0434\u043a\u0430. \u041e\u0434\u0438\u043d \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u0432 \u0447\u0435\u0442\u044b\u0440\u0451\u0445 \u0442\u0435\u043c\u0430\u0445.",
    steps_title: "\u0417\u0430\u043f\u0443\u0441\u043a \u0437\u0430 \u0442\u0440\u0438 \u0448\u0430\u0433\u0430",
    s1: "\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d", s1d: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438 \u0440\u044f\u0434 \u2014 \u043c\u043e\u0434\u0430, \u0435\u0434\u0430, \u043a\u0440\u0430\u0441\u043e\u0442\u0430.",
    s2: "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0442\u043e\u0432\u0430\u0440\u044b", s2d: "\u0424\u043e\u0442\u043e, \u0446\u0435\u043d\u0430, \u0440\u0430\u0437\u043c\u0435\u0440\u044b, \u043d\u0430\u043b\u0438\u0447\u0438\u0435 \u2014 \u0437\u0430 \u0441\u0435\u043a\u0443\u043d\u0434\u044b.",
    s3: "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0441\u0441\u044b\u043b\u043a\u043e\u0439", s3d: "rasta.uz/yourshop \u0432 \u0431\u0438\u043e \u2014 \u0438 \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0439\u0442\u0435 \u0437\u0430\u043a\u0430\u0437\u044b.",
    cta_band_t: "\u0412\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u2014 \u0432 \u043e\u0434\u043d\u043e\u0439 \u0441\u0441\u044b\u043b\u043a\u0435.",
    cta_band_d: "\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0439\u0442\u0435\u0441\u044c \u043a \u0442\u044b\u0441\u044f\u0447\u0430\u043c \u043f\u0440\u043e\u0434\u0430\u0432\u0446\u043e\u0432.",
    footer_tag: "\u0420\u044b\u043d\u043e\u0447\u043d\u044b\u0439 \u0440\u044f\u0434, \u043e\u043d\u043b\u0430\u0439\u043d.",
    sf_search: "\u041f\u043e\u0438\u0441\u043a \u0442\u043e\u0432\u0430\u0440\u043e\u0432", sf_all: "\u0412\u0441\u0435", sf_in_stock: "\u0412 \u043d\u0430\u043b\u0438\u0447\u0438\u0438", sf_low: "\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u043c\u0430\u043b\u043e",
    sf_sold: "\u041d\u0435\u0442 \u0432 \u043d\u0430\u043b\u0438\u0447\u0438\u0438", sf_sizes: "\u0420\u0430\u0437\u043c\u0435\u0440\u044b", sf_size: "\u0420\u0430\u0437\u043c\u0435\u0440", sf_order_tg: "\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c \u0432 Telegram",
    sf_order_wa: "\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c \u0432 WhatsApp", sf_share: "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f", sf_products: "\u0442\u043e\u0432\u0430\u0440\u043e\u0432",
    sf_about: "\u041e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435", sf_pick_size: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440", sf_desc: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435", sf_more: "\u0415\u0449\u0451 \u0438\u0437 \u044d\u0442\u043e\u0433\u043e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430",
    sf_back: "\u041d\u0430\u0437\u0430\u0434 \u0432 \u043c\u0430\u0433\u0430\u0437\u0438\u043d", sf_empty: "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e.",
    db_title: "\u041f\u0430\u043d\u0435\u043b\u044c", db_products: "\u0422\u043e\u0432\u0430\u0440\u044b", db_storefront: "\u0412\u0438\u0442\u0440\u0438\u043d\u0430", db_orders: "\u0417\u0430\u043a\u0430\u0437\u044b",
    db_settings: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438", db_add: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440", db_published: "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d", db_hidden: "\u0421\u043a\u0440\u044b\u0442",
    db_theme: "\u0422\u0435\u043c\u0430", db_accent: "\u0410\u043a\u0446\u0435\u043d\u0442\u043d\u044b\u0439 \u0446\u0432\u0435\u0442", db_layout: "\u0420\u0430\u0441\u043a\u043b\u0430\u0434\u043a\u0430", db_font: "\u0428\u0440\u0438\u0444\u0442",
    db_preview: "\u041f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440", db_save: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c", db_saved: "\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e",
    db_visit: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", db_name: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435", db_price: "\u0426\u0435\u043d\u0430", db_stock: "\u041d\u0430\u043b\u0438\u0447\u0438\u0435",
    db_sizes_lbl: "\u0420\u0430\u0437\u043c\u0435\u0440\u044b (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043f\u044f\u0442\u0443\u044e)", db_desc_lbl: "\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435", db_cancel: "\u041e\u0442\u043c\u0435\u043d\u0430",
    db_create: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433", db_edit: "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c", db_delete: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
    db_layout_grid: "\u0421\u0435\u0442\u043a\u0430", db_layout_gallery: "\u0413\u0430\u043b\u0435\u0440\u0435\u044f", db_layout_list: "\u0421\u043f\u0438\u0441\u043e\u043a", db_layout_mag: "\u0416\u0443\u0440\u043d\u0430\u043b",
    db_revenue: "\u0417\u0430 \u043c\u0435\u0441\u044f\u0446", db_views: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b", db_orders_n: "\u0417\u0430\u043a\u0430\u0437\u044b", db_top: "\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u043e\u0435",
  },
  uz: {
    _label: "UZ",
    nav_features: "Imkoniyatlar", nav_themes: "Mavzular", nav_pricing: "Narxlar", nav_login: "Kirish",
    cta_start: "Do\u02bckon yaratish", cta_demo: "Do\u02bckonni ko\u02bbrish", cta_start_free: "Bepul boshlash",
    hero_kicker: "Instagram do\u02bckoningiz \u2014 endi haqiqiy do\u02bckon",
    hero_title: "Yozishmalaringizni mijozlar ko\u02bbradigan katalogga aylantiring.",
    hero_sub: "rasta har bir sotuvchiga o\u02bbz sahifasini beradi: mahsulotlar, narxlar, o\u02bblchamlar va buyurtma tugmasi. Kodsiz. Bio\u2019dagi bitta havola.",
    trusted: "Do\u02bckonlar allaqachon rasta\u2019da sotmoqda",
    feat_kicker: "Kichik do\u02bckonga kerak bo\u02bblgan hammasi",
    feat_title: "Bitta havola. Butun do\u02bckon.",
    f1_t: "Katalog bir necha daqiqada", f1_d: "Rasm, nom va narx. Mahsulotlaringiz darhol chiqadi \u2014 sayt qurmasdan.",
    f2_t: "Brendingizga mos mavzular", f2_d: "Uslub, rang va joylashuvni tanlang. Do\u02bckoningiz \u2014 o\u02bbz ko\u02bbrinishingiz.",
    f3_t: "Buyurtmalar to\u02bbg\u02bbri chatga", f3_d: "Mijoz \u2018Buyurtma\u2019 tugmasini bosadi va Telegram yoki WhatsApp\u2019ingizga tushadi.",
    f4_t: "O\u02bbzbekiston uchun", f4_d: "Narxlar so\u02bcmda, uchta til va mijozlar ishlatadigan ilovalar.",
    themes_kicker: "O\u02bbzingizniki qiling",
    themes_title: "To\u02bbrtta ko\u02bbrinish. Cheksiz do\u02bckon.",
    themes_sub: "Har bir do\u02bckon presetdan boshlanadi, keyin rang, shrift va joylashuvni sozlaysiz. Bitta do\u02bckon to\u02bbrtta mavzuda.",
    steps_title: "Uch qadamda ishga tushadi",
    s1: "Do\u02bckon yarating", s1d: "Nom bering, rastani tanlang \u2014 moda, oziq-ovqat, go\u02bbzallik.",
    s2: "Mahsulot qo\u02bbshing", s2d: "Rasm, narx, o\u02bblcham, mavjudlik \u2014 bir necha soniyada.",
    s3: "Havolani ulashing", s3d: "rasta.uz/yourshop\u2019ni bio\u2019ga qo\u02bbying va buyurtma oling.",
    cta_band_t: "Do\u02bckoningiz bir havola narida.",
    cta_band_d: "Obunachilarni mijozga aylantirayotgan minglab sotuvchilarga qo\u02bbshiling.",
    footer_tag: "Bozor rastasi, onlayn.",
    sf_search: "Mahsulot qidirish", sf_all: "Barchasi", sf_in_stock: "Sotuvda bor", sf_low: "Oz qoldi",
    sf_sold: "Tugadi", sf_sizes: "O\u02bblchamlar", sf_size: "O\u02bblcham", sf_order_tg: "Telegramda buyurtma",
    sf_order_wa: "WhatsApp\u2019da buyurtma", sf_share: "Ulashish", sf_products: "mahsulot",
    sf_about: "Do\u02bckon haqida", sf_pick_size: "O\u02bblchamni tanlang", sf_desc: "Tafsilotlar", sf_more: "Shu do\u02bckondan yana",
    sf_back: "Do\u02bckonga qaytish", sf_empty: "Hech narsa topilmadi.",
    db_title: "Boshqaruv", db_products: "Mahsulotlar", db_storefront: "Vitrina", db_orders: "Buyurtmalar",
    db_settings: "Sozlamalar", db_add: "Mahsulot qo\u02bbshish", db_published: "Chop etilgan", db_hidden: "Yashirin",
    db_theme: "Mavzu", db_accent: "Asosiy rang", db_layout: "Joylashuv", db_font: "Shrift",
    db_preview: "Jonli ko\u02bbrinish", db_save: "Saqlash", db_saved: "Saqlandi",
    db_visit: "Do\u02bckonga o\u02bbtish", db_name: "Mahsulot nomi", db_price: "Narx", db_stock: "Mavjudlik",
    db_sizes_lbl: "O\u02bblchamlar (vergul bilan)", db_desc_lbl: "Qisqa tavsif", db_cancel: "Bekor qilish",
    db_create: "Katalogga qo\u02bbshish", db_edit: "Tahrirlash", db_delete: "O\u02bbchirish",
    db_layout_grid: "To\u02bbr", db_layout_gallery: "Galereya", db_layout_list: "Ro\u02bbyxat", db_layout_mag: "Jurnal",
    db_revenue: "Shu oy", db_views: "Ko\u02bbrishlar", db_orders_n: "Buyurtmalar", db_top: "Eng ko\u02bbp ko\u02bbrilgan",
  },
};
const CURRENCY = { en: "so\u02bcm", ru: "\u0441\u0443\u043c", uz: "so\u02bcm" };
function fmtPrice(n, lang) {
  return n.toLocaleString("ru-RU").replace(/,/g, "\u202f").replace(/\u00a0/g, "\u202f") + "\u202f" + CURRENCY[lang || "en"];
}

// ---------- theme presets ----------
// each: vars applied to .storefront root. layout = default layout.
// ---------- looks (typography + shape personality; colour comes from palette) ----------
const THEMES = {
  minimal: {
    id: "minimal", name: { en: "Minimal", ru: "\u041c\u0438\u043d\u0438\u043c\u0430\u043b", uz: "Minimal" },
    layout: "grid", defaultPalette: "mist",
    vars: {
      "--s-radius": "10px", "--s-radius-sm": "7px", "--s-shadow": "0 1px 2px rgba(20,18,15,.05)",
      "--s-font-display": "'Hanken Grotesk', sans-serif", "--s-font-body": "'Hanken Grotesk', sans-serif",
      "--s-display-weight": "650", "--s-display-spacing": "-0.02em", "--s-up": "0.08em", "--s-up-tt": "uppercase",
    },
  },
  boutique: {
    id: "boutique", name: { en: "Editorial", ru: "\u042d\u0434\u0438\u0442\u043e\u0440\u0438\u0430\u043b", uz: "Nashr" },
    layout: "magazine", defaultPalette: "clay",
    vars: {
      "--s-radius": "3px", "--s-radius-sm": "2px", "--s-shadow": "0 2px 18px rgba(20,18,15,.07)",
      "--s-font-display": "'Instrument Serif', serif", "--s-font-body": "'Newsreader', serif",
      "--s-display-weight": "400", "--s-display-spacing": "0em", "--s-up": "0.18em", "--s-up-tt": "uppercase",
    },
  },
  bold: {
    id: "bold", name: { en: "Modern", ru: "\u041c\u043e\u0434\u0435\u0440\u043d", uz: "Zamonaviy" },
    layout: "list", defaultPalette: "midnight",
    vars: {
      "--s-radius": "4px", "--s-radius-sm": "3px", "--s-shadow": "none",
      "--s-font-display": "'Space Grotesk', sans-serif", "--s-font-body": "'Space Grotesk', sans-serif",
      "--s-display-weight": "600", "--s-display-spacing": "-0.03em", "--s-up": "0.06em", "--s-up-tt": "uppercase",
    },
  },
  playful: {
    id: "playful", name: { en: "Soft", ru: "\u041c\u044f\u0433\u043a\u0438\u0439", uz: "Yumshoq" },
    layout: "grid", defaultPalette: "blush",
    vars: {
      "--s-radius": "20px", "--s-radius-sm": "13px", "--s-shadow": "0 8px 22px rgba(20,18,15,.08)",
      "--s-font-display": "'Outfit', sans-serif", "--s-font-body": "'Outfit', sans-serif",
      "--s-display-weight": "650", "--s-display-spacing": "-0.02em", "--s-up": "0.04em", "--s-up-tt": "none",
    },
  },
};

// ---------- 10 curated, matching colour palettes ----------
const PALETTES = [
  { id: "ivory",    name: { en: "Ivory", ru: "\u0421\u043b\u043e\u043d\u043e\u0432\u0430\u044f \u043a\u043e\u0441\u0442\u044c", uz: "Fil suyagi" }, swatch: "#c9a98f", bg: "#faf8f4", surface: "#f1ede5", ink: "#211d18", soft: "#6f665a", line: "#e7e1d6", accent: "#b06a45", accentInk: "#ffffff" },
  { id: "sand",     name: { en: "Sand", ru: "\u041f\u0435\u0441\u043e\u043a", uz: "Qum" }, swatch: "#c3a878", bg: "#f6f1e9", surface: "#ece3d4", ink: "#2a2419", soft: "#74695a", line: "#e3d8c6", accent: "#8a6a3e", accentInk: "#ffffff" },
  { id: "clay",     name: { en: "Clay", ru: "\u0413\u043b\u0438\u043d\u0430", uz: "Loy" }, swatch: "#cf9a86", bg: "#f7f0ec", surface: "#eee0d8", ink: "#2e211c", soft: "#7a685f", line: "#e6d6cc", accent: "#a4503c", accentInk: "#ffffff" },
  { id: "sage",     name: { en: "Sage", ru: "\u0428\u0430\u043b\u0444\u0435\u0439", uz: "Adaçoy" }, swatch: "#9db79f", bg: "#f1f4ef", surface: "#e3e9df", ink: "#1f261f", soft: "#5f6b5f", line: "#d9e1d4", accent: "#4a7256", accentInk: "#ffffff" },
  { id: "olive",    name: { en: "Olive", ru: "\u041e\u043b\u0438\u0432\u0430", uz: "Zaytun" }, swatch: "#b3b078", bg: "#f4f2e8", surface: "#e7e4d2", ink: "#272518", soft: "#6c6850", line: "#ded9c2", accent: "#6f7339", accentInk: "#ffffff" },
  { id: "slate",    name: { en: "Slate", ru: "\u0413\u0440\u0438\u0444\u0435\u043b\u044c", uz: "Slanets" }, swatch: "#9aa6bd", bg: "#f1f2f4", surface: "#e2e5ea", ink: "#1b1e24", soft: "#5e6470", line: "#d7dbe2", accent: "#3a4a6b", accentInk: "#ffffff" },
  { id: "mist",     name: { en: "Mist", ru: "\u0422\u0443\u043c\u0430\u043d", uz: "Tuman" }, swatch: "#9fb9c6", bg: "#f0f3f5", surface: "#e0e7ec", ink: "#1c2226", soft: "#5f6a72", line: "#d5dee4", accent: "#3f6f86", accentInk: "#ffffff" },
  { id: "blush",    name: { en: "Blush", ru: "\u0420\u0443\u043c\u044f\u043d\u0430", uz: "Pushti" }, swatch: "#d7a6ad", bg: "#f9f1f1", surface: "#f0e1e2", ink: "#2b1f21", soft: "#7a6669", line: "#ecd9da", accent: "#9a4f5a", accentInk: "#ffffff" },
  { id: "lilac",    name: { en: "Lilac", ru: "\u0421\u0438\u0440\u0435\u043d\u044c", uz: "Siren" }, swatch: "#b3a3cf", bg: "#f4f1f7", surface: "#e7e1ee", ink: "#241f2b", soft: "#6b6276", line: "#ddd5e8", accent: "#6a4f86", accentInk: "#ffffff" },
  { id: "midnight", name: { en: "Midnight", ru: "\u041f\u043e\u043b\u043d\u043e\u0447\u044c", uz: "Yarim tun" }, swatch: "#d8a657", bg: "#15161a", surface: "#1f2128", ink: "#ecebe6", soft: "#9a9b94", line: "#2c2f37", accent: "#d8a657", accentInk: "#15161a", dark: true },
];
const PALETTE_MAP = Object.fromEntries(PALETTES.map(p => [p.id, p]));
function paletteVars(p){
  return { "--s-bg": p.bg, "--s-surface": p.surface, "--s-ink": p.ink, "--s-soft": p.soft,
    "--s-line": p.line, "--s-accent": p.accent, "--s-accent-ink": p.accentInk };
}
function getPalette(cfg){
  if (cfg && cfg.palette === "custom" && cfg.customPalette) return cfg.customPalette;
  return PALETTE_MAP[cfg && cfg.palette] || PALETTES[0];
}
// elegant OKLCH-harmonised custom palette generator
function genPalette(){
  const h = Math.floor(Math.random() * 360);
  const shift = [0, 24, -24, 150][Math.floor(Math.random() * 4)];
  const h2 = ((h + shift) % 360 + 360) % 360;
  const dark = Math.random() < 0.2;
  if (dark) return { id: "custom", custom: true, name: { en: "Custom", ru: "\u0421\u0432\u043e\u0439", uz: "Maxsus" },
    swatch: `oklch(0.72 0.12 ${h2})`, bg: `oklch(0.17 0.02 ${h})`, surface: `oklch(0.22 0.025 ${h})`,
    ink: `oklch(0.92 0.015 ${h})`, soft: `oklch(0.66 0.02 ${h})`, line: `oklch(0.31 0.03 ${h})`,
    accent: `oklch(0.74 0.13 ${h2})`, accentInk: `oklch(0.18 0.02 ${h})`, dark: true };
  return { id: "custom", custom: true, name: { en: "Custom", ru: "\u0421\u0432\u043e\u0439", uz: "Maxsus" },
    swatch: `oklch(0.74 0.1 ${h2})`, bg: `oklch(0.985 0.008 ${h})`, surface: `oklch(0.955 0.014 ${h})`,
    ink: `oklch(0.24 0.03 ${h})`, soft: `oklch(0.55 0.022 ${h})`, line: `oklch(0.915 0.014 ${h})`,
    accent: `oklch(0.58 0.13 ${h2})`, accentInk: `oklch(0.99 0.01 ${h})` };
}
const FONT_CHOICES = [
  { id: "grotesk", label: "Hanken Grotesk", display: "'Hanken Grotesk', sans-serif", body: "'Hanken Grotesk', sans-serif" },
  { id: "serif", label: "Instrument / Newsreader", display: "'Instrument Serif', serif", body: "'Newsreader', serif" },
  { id: "space", label: "Space Grotesk", display: "'Space Grotesk', sans-serif", body: "'Space Grotesk', sans-serif" },
  { id: "outfit", label: "Outfit", display: "'Outfit', sans-serif", body: "'Outfit', sans-serif" },
];

// ---------- demo shops ----------
const SHOPS = {
  lola: {
    id: "lola", handle: "lolaatelier", name: "Lola Atelier",
    tagline: { en: "Handmade linen, made in Tashkent", ru: "\u0420\u0443\u0447\u043d\u0430\u044f \u0440\u0430\u0431\u043e\u0442\u0430 \u0438\u0437 \u043b\u044c\u043d\u0430, \u0422\u0430\u0448\u043a\u0435\u043d\u0442", uz: "Qo\u02bblda tikilgan zig\u02bcir, Toshkent" },
    location: "Tashkent", type: "fashion", cover: "#c7b09a", rating: 4.9, theme: "boutique", palette: "clay", accent: "#9a5a3b", layout: "magazine", font: "serif",
    initials: "LA",
    cats: { en: ["Dresses", "Tops", "Trousers"], ru: ["\u041f\u043b\u0430\u0442\u044c\u044f", "\u0412\u0435\u0440\u0445", "\u0411\u0440\u044e\u043a\u0438"], uz: ["Ko\u02bbylaklar", "Tepalar", "Shimlar"] },
    products: [
      { id: "l1", cat: 0, name: { en: "Sahar linen dress", ru: "\u041b\u044c\u043d\u044f\u043d\u043e\u0435 \u043f\u043b\u0430\u0442\u044c\u0435 Sahar", uz: "Sahar zig\u02bcir ko\u02bbylagi" }, price: 590000, stock: "in", tone: "#cdb7a3",
        desc: { en: "Breathable washed linen with mother-of-pearl buttons. Cut for everyday wear.", ru: "\u0414\u044b\u0448\u0430\u0449\u0438\u0439 \u043b\u0451\u043d \u0441 \u043f\u0435\u0440\u043b\u0430\u043c\u0443\u0442\u0440\u043e\u0432\u044b\u043c\u0438 \u043f\u0443\u0433\u043e\u0432\u0438\u0446\u0430\u043c\u0438.", uz: "Nafas oluvchi yuvilgan zig\u02bcir, sadaf tugmalar bilan." }, sizes: ["S", "M", "L"] },
      { id: "l2", cat: 1, name: { en: "Oq cotton blouse", ru: "\u0425\u043b\u043e\u043f\u043a\u043e\u0432\u0430\u044f \u0431\u043b\u0443\u0437\u0430 Oq", uz: "Oq paxta bluzkasi" }, price: 320000, stock: "low", tone: "#e0d8cb",
        desc: { en: "Soft cotton blouse with a relaxed collar.", ru: "\u041c\u044f\u0433\u043a\u0430\u044f \u0445\u043b\u043e\u043f\u043a\u043e\u0432\u0430\u044f \u0431\u043b\u0443\u0437\u0430.", uz: "Yumshoq paxta bluzka." }, sizes: ["S", "M", "L", "XL"] },
      { id: "l3", cat: 0, name: { en: "Bahor midi dress", ru: "\u041f\u043b\u0430\u0442\u044c\u0435 \u043c\u0438\u0434\u0438 Bahor", uz: "Bahor midi ko\u02bbylagi" }, price: 640000, stock: "in", tone: "#b89f86",
        desc: { en: "Floaty midi with side pockets and a tie waist.", ru: "\u041b\u0451\u0433\u043a\u043e\u0435 \u043c\u0438\u0434\u0438 \u0441 \u043a\u0430\u0440\u043c\u0430\u043d\u0430\u043c\u0438 \u0438 \u043f\u043e\u044f\u0441\u043e\u043c.", uz: "Yon cho\u02bbntakli va belbog\u02bcli midi." }, sizes: ["S", "M", "L"] },
      { id: "l4", cat: 2, name: { en: "Keng linen trousers", ru: "\u041b\u044c\u043d\u044f\u043d\u044b\u0435 \u0431\u0440\u044e\u043a\u0438", uz: "Keng zig\u02bcir shim" }, price: 410000, stock: "in", tone: "#c8b59c",
        desc: { en: "Wide-leg linen trousers with an elastic back.", ru: "\u0428\u0438\u0440\u043e\u043a\u0438\u0435 \u043b\u044c\u043d\u044f\u043d\u044b\u0435 \u0431\u0440\u044e\u043a\u0438.", uz: "Keng pochali zig\u02bcir shim." }, sizes: ["S", "M", "L"] },
      { id: "l5", cat: 1, name: { en: "Qum knit top", ru: "\u0422\u0440\u0438\u043a\u043e\u0442\u0430\u0436\u043d\u044b\u0439 \u0442\u043e\u043f Qum", uz: "Qum trikotaj tepa" }, price: 280000, stock: "sold", tone: "#d6c4ad",
        desc: { en: "Fine-gauge knit in a warm sand tone.", ru: "\u0422\u043e\u043d\u043a\u0438\u0439 \u0442\u0440\u0438\u043a\u043e\u0442\u0430\u0436 \u043f\u0435\u0441\u043e\u0447\u043d\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430.", uz: "Qum rangli nozik trikotaj." }, sizes: ["S", "M"] },
      { id: "l6", cat: 0, name: { en: "Tun evening dress", ru: "\u0412\u0435\u0447\u0435\u0440\u043d\u0435\u0435 \u043f\u043b\u0430\u0442\u044c\u0435 Tun", uz: "Tun kechki ko\u02bbylagi" }, price: 820000, stock: "in", tone: "#a98f72",
        desc: { en: "Deep-tone evening dress with a draped back.", ru: "\u0412\u0435\u0447\u0435\u0440\u043d\u0435\u0435 \u043f\u043b\u0430\u0442\u044c\u0435 \u0441 \u0434\u0440\u0430\u043f\u0438\u0440\u043e\u0432\u043a\u043e\u0439.", uz: "Orqasi drapirovkali kechki ko\u02bbylak." }, sizes: ["S", "M", "L"] },
    ],
  },
  choyxona: {
    id: "choyxona", handle: "nonandco", name: "Non & Co",
    tagline: { en: "Home bakery \u00b7 fresh every morning", ru: "\u0414\u043e\u043c\u0430\u0448\u043d\u044f\u044f \u043f\u0435\u043a\u0430\u0440\u043d\u044f \u00b7 \u043a\u0430\u0436\u0434\u043e\u0435 \u0443\u0442\u0440\u043e", uz: "Uyda pishiriladi \u00b7 har kuni yangi" },
    location: "Samarkand", type: "food", cover: "#d8bf94", rating: 4.8, theme: "minimal", palette: "sage", accent: "#1f8f86", layout: "grid", font: "grotesk",
    initials: "N&",
    cats: { en: ["Bread", "Pastry", "Sets"], ru: ["\u0425\u043b\u0435\u0431", "\u0412\u044b\u043f\u0435\u0447\u043a\u0430", "\u0421\u0435\u0442\u044b"], uz: ["Non", "Shirinlik", "To\u02bbplam"] },
    products: [
      { id: "c1", cat: 0, name: { en: "Samarkand non", ru: "\u0421\u0430\u043c\u0430\u0440\u043a\u0430\u043d\u0434\u0441\u043a\u0430\u044f \u043b\u0435\u043f\u0451\u0448\u043a\u0430", uz: "Samarqand non" }, price: 18000, stock: "in", tone: "#d8b98a",
        desc: { en: "Stamped tandoor bread, baked at dawn.", ru: "\u0422\u0430\u043d\u0434\u044b\u0440\u043d\u0430\u044f \u043b\u0435\u043f\u0451\u0448\u043a\u0430 \u043d\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435.", uz: "Tongda yopilgan tandir non." }, sizes: [] },
      { id: "c2", cat: 1, name: { en: "Walnut samsa (5 pcs)", ru: "\u0421\u0430\u043c\u0441\u0430 \u0441 \u043e\u0440\u0435\u0445\u043e\u043c (5 \u0448\u0442)", uz: "Yong\u02bcoqli somsa (5 dona)" }, price: 65000, stock: "in", tone: "#cba36f",
        desc: { en: "Flaky pastry with walnut and honey.", ru: "\u0421\u043b\u043e\u0451\u043d\u0430\u044f \u0441\u0430\u043c\u0441\u0430 \u0441 \u043e\u0440\u0435\u0445\u043e\u043c \u0438 \u043c\u0451\u0434\u043e\u043c.", uz: "Yong\u02bcoq va asalli qatlamali somsa." }, sizes: [] },
      { id: "c3", cat: 1, name: { en: "Honey baklava box", ru: "\u041a\u043e\u0440\u043e\u0431\u043a\u0430 \u043f\u0430\u0445\u043b\u0430\u0432\u044b", uz: "Asalli pahlava quti" }, price: 120000, stock: "low", tone: "#dcb877",
        desc: { en: "Layered baklava in a gift box of 12.", ru: "\u041f\u0430\u0445\u043b\u0430\u0432\u0430 \u0432 \u043f\u043e\u0434\u0430\u0440\u043e\u0447\u043d\u043e\u0439 \u043a\u043e\u0440\u043e\u0431\u043a\u0435, 12 \u0448\u0442.", uz: "Sovg\u02bca qutida 12 dona pahlava." }, sizes: [] },
      { id: "c4", cat: 2, name: { en: "Breakfast set for 2", ru: "\u0417\u0430\u0432\u0442\u0440\u0430\u043a \u043d\u0430 \u0434\u0432\u043e\u0438\u0445", uz: "2 kishilik nonushta" }, price: 95000, stock: "in", tone: "#e0c79b",
        desc: { en: "Non, pastries, jam and a pot of tea.", ru: "\u041b\u0435\u043f\u0451\u0448\u043a\u0430, \u0432\u044b\u043f\u0435\u0447\u043a\u0430, \u0434\u0436\u0435\u043c \u0438 \u0447\u0430\u0439.", uz: "Non, shirinlik, murabbo va choy." }, sizes: [] },
      { id: "c5", cat: 1, name: { en: "Pumpkin samsa (5 pcs)", ru: "\u0421\u0430\u043c\u0441\u0430 \u0441 \u0442\u044b\u043a\u0432\u043e\u0439 (5 \u0448\u0442)", uz: "Qovoqli somsa (5 dona)" }, price: 60000, stock: "in", tone: "#d6a45f",
        desc: { en: "Sweet pumpkin filling, baked fresh.", ru: "\u0421\u043b\u0430\u0434\u043a\u0430\u044f \u0442\u044b\u043a\u0432\u0430, \u0441\u0432\u0435\u0436\u0430\u044f \u0432\u044b\u043f\u0435\u0447\u043a\u0430.", uz: "Shirin qovoq, yangi pishirilgan." }, sizes: [] },
      { id: "c6", cat: 0, name: { en: "Sesame patyr", ru: "\u041f\u0430\u0442\u044b\u0440 \u0441 \u043a\u0443\u043d\u0436\u0443\u0442\u043e\u043c", uz: "Kunjutli patyr" }, price: 22000, stock: "sold", tone: "#cda978",
        desc: { en: "Rich layered patyr topped with sesame.", ru: "\u0421\u043b\u043e\u0451\u043d\u044b\u0439 \u043f\u0430\u0442\u044b\u0440 \u0441 \u043a\u0443\u043d\u0436\u0443\u0442\u043e\u043c.", uz: "Kunjut sepilgan qatlamali patyr." }, sizes: [] },
    ],
  },
  gulnoza: {
    id: "gulnoza", handle: "gulnozabeauty", name: "Gulnoza Beauty",
    tagline: { en: "Skincare & beauty, curated", ru: "\u0423\u0445\u043e\u0434 \u0438 \u043a\u0440\u0430\u0441\u043e\u0442\u0430, \u0441 \u043b\u044e\u0431\u043e\u0432\u044c\u044e", uz: "Parvarish va go\u02bbzallik, saralangan" },
    location: "Tashkent", type: "cosmetics", cover: "#f3c9d6", rating: 4.7, theme: "playful", palette: "blush", accent: "#ff5d8f", layout: "grid", font: "outfit",
    initials: "GB",
    cats: { en: ["Skincare", "Makeup", "Sets"], ru: ["\u0423\u0445\u043e\u0434", "\u041c\u0430\u043a\u0438\u044f\u0436", "\u041d\u0430\u0431\u043e\u0440\u044b"], uz: ["Parvarish", "Bo\u02bbyanish", "To\u02bbplam"] },
    products: [
      { id: "g1", cat: 0, name: { en: "Glow vitamin C serum", ru: "\u0421\u044b\u0432\u043e\u0440\u043e\u0442\u043a\u0430 \u0441 \u0432\u0438\u0442. C", uz: "C vitaminli zardob" }, price: 145000, stock: "in", tone: "#ffd2a8",
        desc: { en: "Brightening serum with 10% vitamin C.", ru: "\u041e\u0441\u0432\u0435\u0442\u043b\u044f\u044e\u0449\u0430\u044f \u0441\u044b\u0432\u043e\u0440\u043e\u0442\u043a\u0430 10% \u0432\u0438\u0442. C.", uz: "10% C vitaminli yorituvchi zardob." }, sizes: ["30ml"] },
      { id: "g2", cat: 1, name: { en: "Velvet matte lipstick", ru: "\u041c\u0430\u0442\u043e\u0432\u0430\u044f \u043f\u043e\u043c\u0430\u0434\u0430", uz: "Matoviy lab bo\u02bbyog\u02bci" }, price: 89000, stock: "in", tone: "#f7a8c0",
        desc: { en: "Long-wear matte in five warm shades.", ru: "\u0421\u0442\u043e\u0439\u043a\u0430\u044f \u043c\u0430\u0442\u043e\u0432\u0430\u044f, 5 \u0442\u0451\u043f\u043b\u044b\u0445 \u0442\u043e\u043d\u043e\u0432.", uz: "Uzoq turuvchi, 5 issiq rang." }, sizes: ["Rose", "Clay", "Plum"] },
      { id: "g3", cat: 0, name: { en: "Hydra night cream", ru: "\u041d\u043e\u0447\u043d\u043e\u0439 \u043a\u0440\u0435\u043c", uz: "Tungi krem" }, price: 132000, stock: "low", tone: "#cfe0f0",
        desc: { en: "Rich overnight moisture with ceramides.", ru: "\u041f\u0438\u0442\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043d\u043e\u0447\u043d\u043e\u0439 \u043a\u0440\u0435\u043c.", uz: "Keramidli to\u02bbyimli tungi krem." }, sizes: ["50ml"] },
      { id: "g4", cat: 2, name: { en: "Everyday glow set", ru: "\u041d\u0430\u0431\u043e\u0440 Everyday glow", uz: "Kunlik glow to\u02bbplam" }, price: 290000, stock: "in", tone: "#ffc9dd",
        desc: { en: "Serum, cream and lip in one box.", ru: "\u0421\u044b\u0432\u043e\u0440\u043e\u0442\u043a\u0430, \u043a\u0440\u0435\u043c \u0438 \u043f\u043e\u043c\u0430\u0434\u0430.", uz: "Zardob, krem va lab bo\u02bbyog\u02bci." }, sizes: [] },
      { id: "g5", cat: 1, name: { en: "Soft focus blush", ru: "\u0420\u0443\u043c\u044f\u043d\u0430 Soft focus", uz: "Yumshoq rumyana" }, price: 76000, stock: "in", tone: "#ffbccd",
        desc: { en: "Buildable powder blush, rosy warmth.", ru: "\u041f\u0443\u0434\u0440\u043e\u0432\u044b\u0435 \u0440\u0443\u043c\u044f\u043d\u0430.", uz: "Pudrali rumyana, pushti issiqlik." }, sizes: [] },
      { id: "g6", cat: 0, name: { en: "Gentle gel cleanser", ru: "\u0413\u0435\u043b\u044c \u0434\u043b\u044f \u0443\u043c\u044b\u0432\u0430\u043d\u0438\u044f", uz: "Yumshoq gel yuvg\u02bcich" }, price: 68000, stock: "sold", tone: "#d6f0e6",
        desc: { en: "pH-balanced daily cleanser.", ru: "\u0415\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0439 \u0433\u0435\u043b\u044c, pH-\u0431\u0430\u043b\u0430\u043d\u0441.", uz: "Har kunlik pH muvozanatli gel." }, sizes: [] },
    ],
  },
};
// ---------- shop types (marketplace filter) ----------
const TYPES = {
  footwear:{ en: "Footwear", ru: "Обувь", uz: "Poyabzal" },
  vehicles:{ en: "Vehicles & parts", ru: "Транспорт и запчасти", uz: "Transport va ehtiyot qismlar" },
  flowers: { en: "Flowers & plants", ru: "Цветы и растения", uz: "Gullar va o‘simliklar" },
  health:  { en: "Vitamins & supplements", ru: "Витамины и добавки", uz: "Vitamin va qo‘shimchalar" },
  sport:   { en: "Sport & gym", ru: "Спорт", uz: "Sport" },
  electronics:{ en: "Electronics", ru: "Электроника", uz: "Elektronika" },
  cosmetics:{ en: "Cosmetics", ru: "Косметика", uz: "Kosmetika" },
  fashion: { en: "Fashion", ru: "\u041c\u043e\u0434\u0430", uz: "Moda" },
  food:    { en: "Food", ru: "\u0415\u0434\u0430", uz: "Oziq-ovqat" },
  beauty:  { en: "Beauty", ru: "\u041a\u0440\u0430\u0441\u043e\u0442\u0430", uz: "Go\u02bbzallik" },
  home:    { en: "Home", ru: "\u0414\u043e\u043c", uz: "Uy" },
  desserts:{ en: "Cakes & desserts", ru: "Торты и десерты", uz: "Tort va desertlar" },
  wedding: { en: "Wedding & sarpo", ru: "Свадебное и сарпо", uz: "To‘y va sarpo" },
  furniture:{ en: "Furniture", ru: "Мебель", uz: "Mebel" },
  religious:{ en: "Religious goods", ru: "Религиозные товары", uz: "Diniy buyumlar" },
  party:   { en: "Party & balloons", ru: "Праздник и шары", uz: "Bayram va sharlar" },
  handmade:{ en: "Handmade", ru: "Ручная работа", uz: "Qo‘l mehnati" },
  kids:    { en: "Kids & toys", ru: "Детские товары", uz: "Bolalar mahsulotlari" },
  bags:    { en: "Bags & accessories", ru: "Сумки и аксессуары", uz: "Sumka va aksessuarlar" },
  jewellery:{ en: "Jewellery & watches", ru: "Украшения и часы", uz: "Taqinchoq va soatlar" },
  books:   { en: "Books & stationery", ru: "Книги и канцтовары", uz: "Kitob va kanselyariya" },
  pets:    { en: "Pet supplies", ru: "Зоотовары", uz: "Uy hayvonlari uchun" },
  gifts:   { en: "Gifts", ru: "\u041f\u043e\u0434\u0430\u0440\u043a\u0438", uz: "Sovg\u02bcalar" },
};

// ---------- marketplace / nav strings (added to every language) ----------
Object.assign(I18N.en, { nav_explore: "Explore", mkt_title: "Explore every shop on rasta", mkt_sub: "A whole bazaar in one place \u2014 browse shops by what they sell.", mkt_search: "Search shops", mkt_all_types: "All shops", mkt_open: "Open shop", mkt_rating: "rating", mkt_count: "shops", mkt_nav: "Explore shops" });
Object.assign(I18N.ru, { nav_explore: "\u041e\u0431\u0437\u043e\u0440", mkt_title: "\u0412\u0441\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u044b \u043d\u0430 rasta", mkt_sub: "\u0426\u0435\u043b\u044b\u0439 \u0431\u0430\u0437\u0430\u0440 \u0432 \u043e\u0434\u043d\u043e\u043c \u043c\u0435\u0441\u0442\u0435 \u2014 \u0438\u0449\u0438\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u044b \u043f\u043e \u0442\u043e\u0432\u0430\u0440\u0430\u043c.", mkt_search: "\u041f\u043e\u0438\u0441\u043a \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u043e\u0432", mkt_all_types: "\u0412\u0441\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u044b", mkt_open: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c", mkt_rating: "\u0440\u0435\u0439\u0442\u0438\u043d\u0433", mkt_count: "\u043c\u0430\u0433\u0430\u0437\u0438\u043d\u043e\u0432", mkt_nav: "\u041c\u0430\u0433\u0430\u0437\u0438\u043d\u044b" });
Object.assign(I18N.uz, { nav_explore: "Ko\u02bbrish", mkt_title: "rasta\u2019dagi barcha do\u02bckonlar", mkt_sub: "Bitta joyda butun bozor \u2014 do\u02bckonlarni mahsulot turi bo\u02bbyicha ko\u02bbring.", mkt_search: "Do\u02bckon qidirish", mkt_all_types: "Barcha do\u02bckonlar", mkt_open: "Ochish", mkt_rating: "reyting", mkt_count: "do\u02bckon", mkt_nav: "Do\u02bckonlar" });

// ---------- additional shops (fill the marketplace) ----------
Object.assign(SHOPS, {
  silkroad: {
    id: "silkroad", handle: "silkroadgoods", name: "Silk Road Goods",
    tagline: { en: "Handicraft from Bukhara \u2014 ceramics & textiles", ru: "\u0420\u0435\u043c\u0451\u0441\u043b\u0430 \u0438\u0437 \u0411\u0443\u0445\u0430\u0440\u044b \u2014 \u043a\u0435\u0440\u0430\u043c\u0438\u043a\u0430 \u0438 \u0442\u0435\u043a\u0441\u0442\u0438\u043b\u044c", uz: "Buxoro hunarmandchiligi \u2014 sopol va to\u02bbqimachilik" },
    location: "Bukhara", type: "home", cover: "#bcae93", rating: 4.8, theme: "minimal", palette: "olive", accent: "#1f8f86", layout: "gallery", font: "grotesk", initials: "SR",
    cats: { en: ["Ceramics", "Textiles", "Decor"], ru: ["\u041a\u0435\u0440\u0430\u043c\u0438\u043a\u0430", "\u0422\u0435\u043a\u0441\u0442\u0438\u043b\u044c", "\u0414\u0435\u043a\u043e\u0440"], uz: ["Sopol", "To\u02bbqimachilik", "Bezak"] },
    products: [
      { id: "sr1", cat: 0, name: { en: "Rishtan ceramic plate", ru: "\u0420\u0438\u0448\u0442\u0430\u043d\u0441\u043a\u0430\u044f \u0442\u0430\u0440\u0435\u043b\u043a\u0430", uz: "Rishton sopol laganchasi" }, price: 180000, stock: "in", tone: "#7fb3ab", desc: { en: "Hand-painted turquoise glaze, fired in Rishtan.", ru: "\u0420\u0443\u0447\u043d\u0430\u044f \u0440\u043e\u0441\u043f\u0438\u0441\u044c, \u0431\u0438\u0440\u044e\u0437\u043e\u0432\u0430\u044f \u0433\u043b\u0430\u0437\u0443\u0440\u044c.", uz: "Qo\u02bblda bo\u02bbyalgan firuza sir." }, sizes: [] },
      { id: "sr2", cat: 1, name: { en: "Suzani cushion cover", ru: "\u041d\u0430\u0432\u043e\u043b\u043e\u0447\u043a\u0430 \u0441\u0443\u0437\u0430\u043d\u0438", uz: "Suzana yostiq jildi" }, price: 240000, stock: "in", tone: "#c98a6a", desc: { en: "Embroidered cotton, traditional motifs.", ru: "\u0412\u044b\u0448\u0438\u0442\u044b\u0439 \u0445\u043b\u043e\u043f\u043e\u043a, \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u044b\u0435 \u0443\u0437\u043e\u0440\u044b.", uz: "Kashta paxta, an\u02bcanaviy naqsh." }, sizes: [] },
      { id: "sr3", cat: 1, name: { en: "Bukhara silk scarf", ru: "\u0428\u0451\u043b\u043a\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u0442\u043e\u043a", uz: "Buxoro ipak ro\u02bbmoli" }, price: 320000, stock: "low", tone: "#9aa7c4", desc: { en: "Hand-loomed ikat silk.", ru: "\u0420\u0443\u0447\u043d\u043e\u0439 \u0438\u043a\u0430\u0442 \u0438\u0437 \u0448\u0451\u043b\u043a\u0430.", uz: "Qo\u02bblbola ikat ipak." }, sizes: [] },
      { id: "sr4", cat: 2, name: { en: "Brass teapot", ru: "\u041b\u0430\u0442\u0443\u043d\u043d\u044b\u0439 \u0447\u0430\u0439\u043d\u0438\u043a", uz: "Guruch choynak" }, price: 450000, stock: "in", tone: "#c9a96a", desc: { en: "Engraved brass, holds 1.2L.", ru: "\u0413\u0440\u0430\u0432\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u0430\u044f \u043b\u0430\u0442\u0443\u043d\u044c, 1.2\u043b.", uz: "O\u02bbymakor guruch, 1.2L." }, sizes: [] },
    ],
  },
  bahor: {
    id: "bahor", handle: "bahorflowers", name: "Bahor Flowers",
    tagline: { en: "Fresh bouquets & gifts, same-day delivery", ru: "\u0421\u0432\u0435\u0436\u0438\u0435 \u0431\u0443\u043a\u0435\u0442\u044b \u0438 \u043f\u043e\u0434\u0430\u0440\u043a\u0438, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0432 \u0434\u0435\u043d\u044c", uz: "Yangi gullar va sovg\u02bcalar, kunlik yetkazib berish" },
    location: "Tashkent", type: "flowers", cover: "#e8c2dd", rating: 4.9, theme: "playful", palette: "lilac", accent: "#7c5cff", layout: "grid", font: "outfit", initials: "BF",
    cats: { en: ["Bouquets", "Plants", "Gifts"], ru: ["\u0411\u0443\u043a\u0435\u0442\u044b", "\u0420\u0430\u0441\u0442\u0435\u043d\u0438\u044f", "\u041f\u043e\u0434\u0430\u0440\u043a\u0438"], uz: ["Guldastalar", "O\u02bbsimliklar", "Sovg\u02bcalar"] },
    products: [
      { id: "bf1", cat: 0, name: { en: "Spring bouquet", ru: "\u0412\u0435\u0441\u0435\u043d\u043d\u0438\u0439 \u0431\u0443\u043a\u0435\u0442", uz: "Bahor guldastasi" }, price: 150000, stock: "in", tone: "#f2a8c0", desc: { en: "Seasonal tulips and ranunculus.", ru: "\u0421\u0435\u0437\u043e\u043d\u043d\u044b\u0435 \u0442\u044e\u043b\u044c\u043f\u0430\u043d\u044b \u0438 \u0440\u0430\u043d\u0443\u043d\u043a\u0443\u043b\u044e\u0441.", uz: "Mavsumiy lola va ranunkulus." }, sizes: [] },
      { id: "bf2", cat: 2, name: { en: "Rose gift box", ru: "\u041a\u043e\u0440\u043e\u0431\u043a\u0430 \u0440\u043e\u0437", uz: "Atirgul sovg\u02bca quti" }, price: 290000, stock: "in", tone: "#e98a9a", desc: { en: "25 roses in a hat box.", ru: "25 \u0440\u043e\u0437 \u0432 \u0448\u043b\u044f\u043f\u043d\u043e\u0439 \u043a\u043e\u0440\u043e\u0431\u043a\u0435.", uz: "Shlyapa qutida 25 atirgul." }, sizes: [] },
      { id: "bf3", cat: 1, name: { en: "Succulent trio", ru: "\u0422\u0440\u0438\u043e \u0441\u0443\u043a\u043a\u0443\u043b\u0435\u043d\u0442\u043e\u0432", uz: "Sukkulent uchlik" }, price: 95000, stock: "in", tone: "#a9c9a0", desc: { en: "Three potted succulents.", ru: "\u0422\u0440\u0438 \u0441\u0443\u043a\u043a\u0443\u043b\u0435\u043d\u0442\u0430 \u0432 \u0433\u043e\u0440\u0448\u043a\u0430\u0445.", uz: "Tuvakdagi uchta sukkulent." }, sizes: [] },
      { id: "bf4", cat: 2, name: { en: "Celebration hamper", ru: "\u041f\u043e\u0434\u0430\u0440\u043e\u0447\u043d\u0430\u044f \u043a\u043e\u0440\u0437\u0438\u043d\u0430", uz: "Bayram savati" }, price: 380000, stock: "low", tone: "#d9b6e0", desc: { en: "Flowers, chocolate and a card.", ru: "\u0426\u0432\u0435\u0442\u044b, \u0448\u043e\u043a\u043e\u043b\u0430\u0434 \u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0430.", uz: "Gul, shokolad va otkritka." }, sizes: [] },
    ],
  },
  kicks: {
    id: "kicks", handle: "tashkentkicks", name: "Tashkent Kicks",
    tagline: { en: "Sneakers & streetwear, authentic only", ru: "\u041a\u0440\u043e\u0441\u0441\u043e\u0432\u043a\u0438 \u0438 \u0441\u0442\u0440\u0438\u0442\u0432\u0438\u0440, \u0442\u043e\u043b\u044c\u043a\u043e \u043e\u0440\u0438\u0433\u0438\u043d\u0430\u043b", uz: "Krossovka va streetwear, faqat original" },
    location: "Tashkent", type: "footwear", cover: "#b7bcc2", rating: 4.6, theme: "bold", palette: "midnight", accent: "#d6ff3d", layout: "grid", font: "space", initials: "TK",
    cats: { en: ["Men", "Women", "Running", "Lifestyle", "Sale"], ru: ["\u041c\u0443\u0436\u0441\u043a\u0438\u0435", "\u0416\u0435\u043d\u0441\u043a\u0438\u0435", "\u0411\u0435\u0433", "\u041b\u0430\u0439\u0444\u0441\u0442\u0430\u0439\u043b", "\u0421\u043a\u0438\u0434\u043a\u0438"], uz: ["Erkaklar", "Ayollar", "Yugurish", "Lifestyle", "Chegirma"] },
    products: [
      { id: "tk1", cat: 2, name: { en: "Aero Runner '26", ru: "Aero Runner '26", uz: "Aero Runner '26" }, price: 720000, stock: "in", tone: "#c2c7cc", desc: { en: "Lightweight daily trainer with foam midsole.", ru: "\u041b\u0451\u0433\u043a\u0438\u0435 \u043a\u0440\u043e\u0441\u0441\u043e\u0432\u043a\u0438 \u0434\u043b\u044f \u0431\u0435\u0433\u0430.", uz: "Yengil kunlik yugurish krossovkasi." }, sizes: ["40", "41", "42", "43", "44"] },
      { id: "tk2", cat: 3, name: { en: "Court Classic", ru: "Court Classic", uz: "Court Classic" }, price: 890000, stock: "in", tone: "#d8d2c6", desc: { en: "Leather low-top, everyday icon.", ru: "\u041a\u043e\u0436\u0430\u043d\u044b\u0435 \u043b\u043e\u0443-\u0442\u043e\u043f.", uz: "Charm low-top." }, sizes: ["41", "42", "43", "44"] },
      { id: "tk3", cat: 1, name: { en: "Cloud Trainer W", ru: "Cloud Trainer W", uz: "Cloud Trainer W" }, price: 680000, stock: "low", tone: "#e0c9d0", desc: { en: "Cushioned women\u2019s trainer.", ru: "\u0416\u0435\u043d\u0441\u043a\u0438\u0435 \u0441 \u0430\u043c\u043e\u0440\u0442\u0438\u0437\u0430\u0446\u0438\u0435\u0439.", uz: "Ayollar uchun yumshoq." }, sizes: ["37", "38", "39", "40"] },
      { id: "tk4", cat: 4, name: { en: "Retro Pair (sale)", ru: "Retro Pair (\u0441\u043a\u0438\u0434\u043a\u0430)", uz: "Retro Pair (chegirma)" }, price: 450000, stock: "low", tone: "#b9c0a8", desc: { en: "Last season colourway, limited sizes.", ru: "\u0426\u0432\u0435\u0442 \u043f\u0440\u043e\u0448\u043b\u043e\u0433\u043e \u0441\u0435\u0437\u043e\u043d\u0430.", uz: "O\u02bbtgan mavsum rangi." }, sizes: ["42", "44"] },
    ],
  },
});

const SHOP_ORDER = ["lola", "choyxona", "gulnoza", "silkroad", "bahor", "kicks"];

Object.assign(I18N.en, { db_palette: "Colour palette", db_generate: "Generate", db_custom: "Custom", looks_note: "Four clean looks × ten matching palettes — or generate your own.", explore_cta: "Explore the bazaar", explore_band_t: "Browse the whole bazaar", explore_band_d: "Every rasta shop in one place — by city, by category, by vibe." });
Object.assign(I18N.ru, { db_palette: "Палитра", db_generate: "Создать", db_custom: "Своя", looks_note: "Четыре стиля × десять палитр — или создайте свою.", explore_cta: "В базар", explore_band_t: "Весь базар рядом", explore_band_d: "Все магазины rasta в одном месте." });
Object.assign(I18N.uz, { db_palette: "Rang palitra", db_generate: "Yaratish", db_custom: "Maxsus", looks_note: "Toʻrt toza koʻrinish × oʻnta mos palitra — yoki oʻzingiznikini yarating.", explore_cta: "Bozorga", explore_band_t: "Butun bozorni koʻring", explore_band_d: "Barcha rasta doʼkonlari bir joyda." });

Object.assign(I18N.en, { db_photos: "Photos", db_photos_hint: "First photo is the cover \u00b7 drag an image onto a slot, or click to browse", db_cover: "Cover photo", db_profile: "Profile photo", db_drop: "Drop image" });
Object.assign(I18N.ru, { db_photos: "\u0424\u043e\u0442\u043e", db_photos_hint: "\u041f\u0435\u0440\u0432\u043e\u0435 \u0444\u043e\u0442\u043e \u2014 \u043e\u0431\u043b\u043e\u0436\u043a\u0430 \u00b7 \u043f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0438\u043b\u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435", db_cover: "\u041e\u0431\u043b\u043e\u0436\u043a\u0430", db_profile: "\u0424\u043e\u0442\u043e \u043f\u0440\u043e\u0444\u0438\u043b\u044f", db_drop: "\u0424\u043e\u0442\u043e" });
Object.assign(I18N.uz, { db_photos: "Rasmlar", db_photos_hint: "Birinchi rasm \u2014 muqova \u00b7 rasmni torting yoki bosing", db_cover: "Muqova rasmi", db_profile: "Profil rasmi", db_drop: "Rasm" });

Object.assign(I18N.en, { ob_s_account:"Account", ob_s_shop:"Your shop", ob_s_brand:"Brand", ob_s_plan:"Plan", ob_s_publish:"Publish",
  ob_auth_t:"Open your shop on rasta", ob_auth_d:"Log in to start \u2014 it takes about 3 minutes.", ob_tg:"Continue with Telegram", ob_or:"or", ob_phone:"Phone number", ob_haveacc:"Already selling on rasta?", ob_login:"Log in",
  ob_shop_t:"Name your shop", ob_shop_d:"This is how customers will find you in the bazaar.", ob_name:"Shop name", ob_name_ph:"e.g. Lola Atelier", ob_handle:"Your link", ob_avail:"available", ob_taken:"taken", ob_cat:"What do you sell?", ob_city:"City",
  ob_brand_t:"Make it yours", ob_brand_d:"Add a cover, a logo and a look. You can change all of this later.", ob_cover:"Cover photo", ob_logo:"Logo", ob_tagline:"Tagline", ob_tagline_ph:"One line about your shop", ob_look:"Look", ob_palette:"Palette",
  ob_plan_t:"Start free for 3 months", ob_plan_d:"No card required. Pick a plan for when your trial ends \u2014 cancel anytime.", ob_trial:"3 months free", ob_then:"then", ob_mo:"/mo", ob_billed_m:"Monthly", ob_billed_y:"Yearly", ob_save2:"2 months free", ob_choose:"Choose", ob_chosen:"Selected",
  ob_starter:"Starter", ob_starter_d:"Everything to sell from one link.", ob_pro:"Pro", ob_pro_d:"For shops that are growing fast.",
  ob_review_t:"Ready to publish", ob_review_d:"Review your shop, then go live.", ob_publish:"Publish my shop", ob_publishing:"Publishing\u2026", ob_free_until:"Free until",
  ob_live_t:"Your shop is live", ob_live_d:"Share your link in your bio and start taking orders.", ob_godash:"Go to dashboard", ob_viewshop:"View shop", ob_back:"Back", ob_continue:"Continue", ob_cancel:"Cancel" });
Object.assign(I18N.ru, { ob_s_account:"\u0410\u043a\u043a\u0430\u0443\u043d\u0442", ob_s_shop:"\u041c\u0430\u0433\u0430\u0437\u0438\u043d", ob_s_brand:"\u0411\u0440\u0435\u043d\u0434", ob_s_plan:"\u0422\u0430\u0440\u0438\u0444", ob_s_publish:"\u041f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f",
  ob_auth_t:"\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u043d\u0430 rasta", ob_auth_d:"\u0412\u043e\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043d\u0430\u0447\u0430\u0442\u044c \u2014 \u044d\u0442\u043e \u043e\u043a\u043e\u043b\u043e 3 \u043c\u0438\u043d\u0443\u0442.", ob_tg:"\u0412\u043e\u0439\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 Telegram", ob_or:"\u0438\u043b\u0438", ob_phone:"\u041d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430", ob_haveacc:"\u0423\u0436\u0435 \u043f\u0440\u043e\u0434\u0430\u0451\u0442\u0435 \u043d\u0430 rasta?", ob_login:"\u0412\u043e\u0439\u0442\u0438",
  ob_shop_t:"\u041d\u0430\u0437\u043e\u0432\u0438\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d", ob_shop_d:"\u0422\u0430\u043a \u0432\u0430\u0441 \u043d\u0430\u0439\u0434\u0443\u0442 \u043f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u0438.", ob_name:"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435", ob_name_ph:"\u043d\u0430\u043f\u0440. Lola Atelier", ob_handle:"\u0412\u0430\u0448\u0430 \u0441\u0441\u044b\u043b\u043a\u0430", ob_avail:"\u0441\u0432\u043e\u0431\u043e\u0434\u043d\u0430", ob_taken:"\u0437\u0430\u043d\u044f\u0442\u0430", ob_cat:"\u0427\u0442\u043e \u0432\u044b \u043f\u0440\u043e\u0434\u0430\u0451\u0442\u0435?", ob_city:"\u0413\u043e\u0440\u043e\u0434",
  ob_brand_t:"\u0421\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u0441\u0432\u043e\u0438\u043c", ob_brand_d:"\u041e\u0431\u043b\u043e\u0436\u043a\u0430, \u043b\u043e\u0433\u043e\u0442\u0438\u043f \u0438 \u0441\u0442\u0438\u043b\u044c. \u0412\u0441\u0451 \u043c\u043e\u0436\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0437\u0436\u0435.", ob_cover:"\u041e\u0431\u043b\u043e\u0436\u043a\u0430", ob_logo:"\u041b\u043e\u0433\u043e\u0442\u0438\u043f", ob_tagline:"\u0421\u043b\u043e\u0433\u0430\u043d", ob_tagline_ph:"\u041e\u0434\u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0430 \u043e \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0435", ob_look:"\u0421\u0442\u0438\u043b\u044c", ob_palette:"\u041f\u0430\u043b\u0438\u0442\u0440\u0430",
  ob_plan_t:"3 \u043c\u0435\u0441\u044f\u0446\u0430 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e", ob_plan_d:"\u0411\u0435\u0437 \u043a\u0430\u0440\u0442\u044b. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0430\u0440\u0438\u0444 \u043d\u0430 \u043f\u043e\u0441\u043b\u0435 \u043f\u0440\u043e\u0431\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u2014 \u043e\u0442\u043c\u0435\u043d\u0430 \u0432 \u043b\u044e\u0431\u043e\u0435 \u0432\u0440\u0435\u043c\u044f.", ob_trial:"6 \u043c\u0435\u0441. \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e", ob_then:"\u0437\u0430\u0442\u0435\u043c", ob_mo:"/\u043c\u0435\u0441", ob_billed_m:"\u041c\u0435\u0441\u044f\u0446", ob_billed_y:"\u0413\u043e\u0434", ob_save2:"2 \u043c\u0435\u0441\u044f\u0446\u0430 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e", ob_choose:"\u0412\u044b\u0431\u0440\u0430\u0442\u044c", ob_chosen:"\u0412\u044b\u0431\u0440\u0430\u043d\u043e",
  ob_starter:"Starter", ob_starter_d:"\u0412\u0441\u0451 \u0434\u043b\u044f \u043f\u0440\u043e\u0434\u0430\u0436 \u0441 \u043e\u0434\u043d\u043e\u0439 \u0441\u0441\u044b\u043b\u043a\u0438.", ob_pro:"Pro", ob_pro_d:"\u0414\u043b\u044f \u0431\u044b\u0441\u0442\u0440\u043e \u0440\u0430\u0441\u0442\u0443\u0449\u0438\u0445 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u043e\u0432.",
  ob_review_t:"\u0413\u043e\u0442\u043e\u0432\u043e \u043a \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438", ob_review_d:"\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0439\u0442\u0435.", ob_publish:"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c", ob_publishing:"\u041f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f\u2026", ob_free_until:"\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0434\u043e",
  ob_live_t:"\u0412\u0430\u0448 \u043c\u0430\u0433\u0430\u0437\u0438\u043d \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d", ob_live_d:"\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0441\u0441\u044b\u043b\u043a\u043e\u0439 \u0432 \u0431\u0438\u043e \u0438 \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0439\u0442\u0435 \u0437\u0430\u043a\u0430\u0437\u044b.", ob_godash:"\u0412 \u043f\u0430\u043d\u0435\u043b\u044c", ob_viewshop:"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", ob_back:"\u041d\u0430\u0437\u0430\u0434", ob_continue:"\u0414\u0430\u043b\u0435\u0435", ob_cancel:"\u041e\u0442\u043c\u0435\u043d\u0430" });
Object.assign(I18N.uz, { ob_s_account:"Akkaunt", ob_s_shop:"Do\u02bckon", ob_s_brand:"Brend", ob_s_plan:"Tarif", ob_s_publish:"Chop etish",
  ob_auth_t:"rasta\u2019da do\u02bckon oching", ob_auth_d:"Boshlash uchun kiring \u2014 taxminan 3 daqiqa.", ob_tg:"Telegram orqali kirish", ob_or:"yoki", ob_phone:"Telefon raqami", ob_haveacc:"rasta\u2019da allaqachon sotyapsizmi?", ob_login:"Kirish",
  ob_shop_t:"Do\u02bckonni nomlang", ob_shop_d:"Mijozlar sizni shunday topadi.", ob_name:"Do\u02bckon nomi", ob_name_ph:"mas. Lola Atelier", ob_handle:"Havolangiz", ob_avail:"bo\u02bdsh", ob_taken:"band", ob_cat:"Nima sotasiz?", ob_city:"Shahar",
  ob_brand_t:"O\u02bbzingizniki qiling", ob_brand_d:"Muqova, logo va ko\u02bbrinish. Hammasini keyin o\u02bbzgartirish mumkin.", ob_cover:"Muqova", ob_logo:"Logo", ob_tagline:"Shior", ob_tagline_ph:"Do\u02bckon haqida bir qator", ob_look:"Ko\u02bbrinish", ob_palette:"Palitra",
  ob_plan_t:"3 oy bepul", ob_plan_d:"Karta kerak emas. Sinov tugagach uchun tarif tanlang \u2014 istalgan vaqtda bekor qiling.", ob_trial:"3 oy bepul", ob_then:"keyin", ob_mo:"/oy", ob_billed_m:"Oylik", ob_billed_y:"Yillik", ob_save2:"2 oy bepul", ob_choose:"Tanlash", ob_chosen:"Tanlandi",
  ob_starter:"Starter", ob_starter_d:"Bitta havoladan sotish uchun hammasi.", ob_pro:"Pro", ob_pro_d:"Tez o\u02bbsayotgan do\u02bckonlar uchun.",
  ob_review_t:"Chop etishga tayyor", ob_review_d:"Do\u02bckonni tekshiring va e\u02bclon qiling.", ob_publish:"Do\u02bckonni chop etish", ob_publishing:"Chop etilmoqda\u2026", ob_free_until:"Shu sanagacha bepul",
  ob_live_t:"Do\u02bckoningiz ishga tushdi", ob_live_d:"Havolani bio\u2019ga qo\u02bbying va buyurtma oling.", ob_godash:"Boshqaruvga", ob_viewshop:"Do\u02bckonni ko\u02bbrish", ob_back:"Orqaga", ob_continue:"Davom etish", ob_cancel:"Bekor qilish" });

Object.assign(I18N.en, { db_publish:"Publish", db_save_draft:"Save as draft", db_draft:"Draft", db_details:"Name & description", db_publish_hint:"Add the name in all three languages and a price before publishing." });
Object.assign(I18N.ru, { db_publish:"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c", db_save_draft:"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a", db_draft:"\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a", db_details:"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435", db_publish_hint:"\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043d\u0430 \u0442\u0440\u0451\u0445 \u044f\u0437\u044b\u043a\u0430\u0445 \u0438 \u0446\u0435\u043d\u0443 \u043f\u0435\u0440\u0435\u0434 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0435\u0439." });
Object.assign(I18N.uz, { db_publish:"Chop etish", db_save_draft:"Qoralama saqlash", db_draft:"Qoralama", db_details:"Nom va tavsif", db_publish_hint:"Chop etishdan oldin nomni uch tilda va narxni kiriting." });

Object.assign(I18N.en, { db_not_live_t:"Your shop isn't live yet", db_not_live_d:"Add at least one product, then publish to appear in rasta bozor.", db_publish_shop:"Publish shop", db_need_product:"Add a product to publish", db_live:"Live", db_live_d:"Your shop is public", db_unpublish:"Unpublish", db_shop_published:"Your shop is now live", ob_created_t:"Your shop is ready", ob_created_d:"Add your first product, then publish it to go live in the bazaar.", ob_create_shop:"Create my shop", ob_add_first:"Add first product" });
Object.assign(I18N.ru, { db_not_live_t:"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0435\u0449\u0451 \u043d\u0435 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d", db_not_live_d:"\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u0442\u043e\u0432\u0430\u0440 \u0438 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0439\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u044f\u0432\u0438\u0442\u044c\u0441\u044f \u0432 rasta bozor.", db_publish_shop:"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", db_need_product:"\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0442\u043e\u0432\u0430\u0440", db_live:"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d", db_live_d:"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0432\u0441\u0435\u043c", db_unpublish:"\u0421\u043d\u044f\u0442\u044c \u0441 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438", db_shop_published:"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d", ob_created_t:"\u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0433\u043e\u0442\u043e\u0432", ob_created_d:"\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043f\u0435\u0440\u0432\u044b\u0439 \u0442\u043e\u0432\u0430\u0440 \u0438 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0439\u0442\u0435 \u0435\u0433\u043e, \u0447\u0442\u043e\u0431\u044b \u0432\u044b\u0439\u0442\u0438 \u0432 \u0431\u0430\u0437\u0430\u0440.", ob_create_shop:"\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043c\u0430\u0433\u0430\u0437\u0438\u043d", ob_add_first:"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440" });
Object.assign(I18N.uz, { db_not_live_t:"Do\u02bckon hali e\u02bclon qilinmagan", db_not_live_d:"Kamida bitta mahsulot qo\u02bbshing va rasta bozorda chiqish uchun chop eting.", db_publish_shop:"Do\u02bckonni chop etish", db_need_product:"Avval mahsulot qo\u02bbshing", db_live:"Jonli", db_live_d:"Do\u02bckon hammaga ochiq", db_unpublish:"Chop etishni to\u02bbxtatish", db_shop_published:"Do\u02bckon e\u02bclon qilindi", ob_created_t:"Do\u02bckon tayyor", ob_created_d:"Birinchi mahsulotni qo\u02bbshing va jonli bo\u02bblishi uchun chop eting.", ob_create_shop:"Do\u02bckon yaratish", ob_add_first:"Mahsulot qo\u02bbshish" });

Object.assign(I18N.en, { sf_chat:"Chat", sf_copied:"Link copied", sf_delivery_def:"Delivery across the city", sf_pay_def:"Cash · Payme · Click", sf_sort_new:"Newest", sf_sort_low:"Price ↑", sf_sort_high:"Price ↓", db_empty_t:"No products yet", db_empty_d:"Add your first product — photos, price and sizes take about a minute.", cl_created:"Shop created", db_orders_empty:"No orders yet — share your shop link to start selling." });
Object.assign(I18N.ru, { sf_chat:"Написать", sf_copied:"Ссылка скопирована", sf_delivery_def:"Доставка по городу", sf_pay_def:"Наличные · Payme · Click", sf_sort_new:"Сначала новые", sf_sort_low:"Цена ↑", sf_sort_high:"Цена ↓", db_empty_t:"Пока нет товаров", db_empty_d:"Добавьте первый товар — фото, цена и размеры займут минуту.", cl_created:"Магазин создан", db_orders_empty:"Заказов пока нет — поделитесь ссылкой магазина." });
Object.assign(I18N.uz, { sf_chat:"Yozish", sf_copied:"Havola nusxalandi", sf_delivery_def:"Shahar bo\u02bbylab yetkazib berish", sf_pay_def:"Naqd · Payme · Click", sf_sort_new:"Avval yangilari", sf_sort_low:"Narx ↑", sf_sort_high:"Narx ↓", db_empty_t:"Hozircha mahsulot yo\u02bbq", db_empty_d:"Birinchi mahsulotni qo\u02bbshing — rasm, narx va o\u02bblchamlar bir daqiqa oladi.", cl_created:"Do\u02bbkon yaratildi", db_orders_empty:"Hozircha buyurtma yo\u02bbq — do\u02bbkon havolasini ulashing." });

// ---------- redesigned dashboard strings ----------
Object.assign(I18N.en, { db_home:"Home", db_design:"Design", db_hello:"Hello", db_today_sub:"Here\u2019s your shop at a glance", db_attention:"Needs your attention", db_finish_publish:"Finish & publish", db_unfinished:"unfinished", db_soldout_n:"sold out", db_quick:"Quick actions", db_share:"Share shop", db_copy:"Copy link", db_copied:"Link copied", db_visitors:"Visitors", db_design_sub:"Choose how your shop looks to customers", db_more:"More", db_open_shop:"Open shop", db_overview:"This month", db_avail:"Availability", db_all_good:"All caught up \u2014 nothing needs attention right now.", db_add_first:"Add your first product", db_review_publish:"Review & publish", db_fix:"Finish" });
Object.assign(I18N.ru, { db_home:"Главная", db_design:"Дизайн", db_hello:"Здравствуйте", db_today_sub:"Ваш магазин с первого взгляда", db_attention:"Требует внимания", db_finish_publish:"Завершить и опубликовать", db_unfinished:"не готово", db_soldout_n:"нет в наличии", db_quick:"Быстрые действия", db_share:"Поделиться", db_copy:"Копировать", db_copied:"Ссылка скопирована", db_visitors:"Посетители", db_design_sub:"Выберите, как выглядит ваш магазин", db_more:"Ещё", db_open_shop:"Открыть", db_overview:"За месяц", db_avail:"Наличие", db_all_good:"Всё в порядке — ничего не требует внимания.", db_add_first:"Добавьте первый товар", db_review_publish:"Проверить и опубликовать", db_fix:"Завершить" });
Object.assign(I18N.uz, { db_home:"Bosh sahifa", db_design:"Dizayn", db_hello:"Assalomu alaykum", db_today_sub:"Do\u02bckoningiz bir qarashda", db_attention:"E\u02bctibor talab qiladi", db_finish_publish:"Tugatib chop etish", db_unfinished:"tugallanmagan", db_soldout_n:"tugagan", db_quick:"Tezkor amallar", db_share:"Ulashish", db_copy:"Havoladan nusxa", db_copied:"Havola nusxalandi", db_visitors:"Tashriflar", db_design_sub:"Do\u02bckoningiz qanday ko\u02bbrinishini tanlang", db_more:"Yana", db_open_shop:"Do\u02bckonni ochish", db_overview:"Shu oy", db_avail:"Mavjudligi", db_all_good:"Hammasi joyida \u2014 hozircha e\u02bctibor talab qiladigan narsa yo\u02bcq.", db_add_first:"Birinchi mahsulotni qo\u02bbshing", db_review_publish:"Tekshirib chop etish", db_fix:"Tugatish" });

Object.assign(window, { I18N, CURRENCY, fmtPrice, THEMES, PALETTES, PALETTE_MAP, paletteVars, getPalette, genPalette, FONT_CHOICES, TYPES, SHOPS, SHOP_ORDER });

// ---- port: publish top-level names, as the classic <script> did ----
Object.assign(window, { I18N, CURRENCY, fmtPrice, THEMES, PALETTES, PALETTE_MAP, paletteVars, getPalette, genPalette, FONT_CHOICES, SHOPS, TYPES, SHOP_ORDER });
