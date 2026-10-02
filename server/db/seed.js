import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, initDatabase, dbHelpers } from './index.js';

export async function seed() {
  console.log('[Seed] Initializing schema...');
  initDatabase();

  console.log('[Seed] Seeding roles and permissions...');
  
  // Clean existing tables
  const tables = [
    'audit_logs', 'payment_receipts', 'order_items', 'orders',
    'service_requests', 'products', 'brands', 'categories',
    'role_permissions', 'permissions', 'users', 'roles', 'system_settings'
  ];
  for (const t of tables) {
    try {
      db.exec(`DELETE FROM ${t};`);
    } catch (e) {
      // Ignore if table empty or constraints
    }
  }

  // 1. Roles
  const roles = [
    { id: 1, name: 'super_admin', title_ar: 'المدير العام (مالك الوكالة)', title_en: 'Super Admin (Agency Owner)', description: 'Full system ownership, financial audits, settings and user management' },
    { id: 2, name: 'catalog_manager', title_ar: 'مدير الكتالوج والمخزون', title_en: 'Catalog & Inventory Manager', description: 'Manage products, categories, stock levels, brands and pricing' },
    { id: 3, name: 'sales_officer', title_ar: 'مسؤول المبيعات والمدفوعات', title_en: 'Sales & Orders Officer', description: 'Review orders, verify InstaPay & Vodafone Cash receipts, approve fulfillments' },
    { id: 4, name: 'dispatcher', title_ar: 'منسق الصيانة والخدمات', title_en: 'Maintenance & Service Dispatcher', description: 'Manage installation bookings, dispatch technicians, schedule jobs' },
    { id: 5, name: 'customer', title_ar: 'عميل', title_en: 'Customer', description: 'Standard registered customer' }
  ];

  const insertRole = db.prepare('INSERT INTO roles (id, name, title_ar, title_en, description) VALUES (?, ?, ?, ?, ?)');
  for (const r of roles) {
    insertRole.run(r.id, r.name, r.title_ar, r.title_en, r.description);
  }

  // 2. Permissions
  const permissions = [
    { code: 'manage_all', description: 'Full Superadmin Access' },
    { code: 'manage_settings', description: 'Configure Global Settings & Wallets' },
    { code: 'view_financials', description: 'View Revenue & Financial Reports' },
    { code: 'manage_users', description: 'Create and Manage User Accounts' },
    { code: 'manage_catalog', description: 'Manage Products, Brands & Categories' },
    { code: 'view_orders', description: 'View Customer Orders' },
    { code: 'verify_payments', description: 'Approve or Reject Payment Proofs' },
    { code: 'update_order_status', description: 'Update Order Fulfillment Status' },
    { code: 'manage_services', description: 'Manage HVAC & Filter Service Bookings' },
    { code: 'assign_technicians', description: 'Assign Field Technicians' }
  ];

  const insertPerm = db.prepare('INSERT INTO permissions (code, description) VALUES (?, ?)');
  for (const p of permissions) {
    insertPerm.run(p.code, p.description);
  }

  // 3. Users with secure bcrypt password hashing
  const salt = await bcrypt.genSalt(10);
  const commonHash = await bcrypt.hash('Almanar@2026', salt);
  const adminHash = await bcrypt.hash('Admin@123456', salt);
  const catalogHash = await bcrypt.hash('Catalog@123456', salt);
  const salesHash = await bcrypt.hash('Sales@123456', salt);
  const dispatchHash = await bcrypt.hash('Dispatch@123456', salt);
  const customerHash = await bcrypt.hash('Customer@123456', salt);

  const users = [
    { id: 1, full_name: 'م. محمود المنار', email: 'admin@almanar.eg', phone: '01119461111', password_hash: adminHash, role_id: 1 },
    { id: 2, full_name: 'أ. طارق مصطفى - إدارة المنتجات', email: 'catalog@almanar.eg', phone: '01114961111', password_hash: catalogHash, role_id: 2 },
    { id: 3, full_name: 'أ. سارة نبيل - مسؤول المبيعات', email: 'sales@almanar.eg', phone: '01119641111', password_hash: salesHash, role_id: 3 },
    { id: 4, full_name: 'م. يوسف كمال - منسق الصيانة', email: 'dispatcher@almanar.eg', phone: '01119461111', password_hash: dispatchHash, role_id: 4 },
    { id: 5, full_name: 'د. أحمد حسن (عميل معتمد)', email: 'customer@gmail.com', phone: '01098765432', password_hash: customerHash, role_id: 5 }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, full_name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?, ?)');
  for (const u of users) {
    insertUser.run(u.id, u.full_name, u.email, u.phone, u.password_hash, u.role_id);
  }

  // 4. Categories
  const categories = [
    { id: 1, name_ar: 'أنظمة التكييف المتطورة', name_en: 'Air Conditioning Systems', slug: 'air-conditioning', icon: 'Wind', display_order: 1 },
    { id: 2, name_ar: 'فلاتر ومبردات المياه', name_en: 'Water Purification & Dispensers', slug: 'water-purification', icon: 'Droplets', display_order: 2 },
    { id: 3, name_ar: 'الأجهزة الكهربائية', name_en: 'Home & Office Appliances', slug: 'home-appliances', icon: 'Tv', display_order: 3 },
    { id: 4, name_ar: 'المستلزمات والأثاث المكتبي', name_en: 'Office Supplies & Furnishing', slug: 'office-supplies', icon: 'Briefcase', display_order: 4 },
    { id: 5, name_ar: 'خدمات الصيانة والتركيب الهندسية', name_en: 'Engineering & Maintenance Services', slug: 'engineering-services', icon: 'Wrench', display_order: 5 }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (id, name_ar, name_en, slug, icon, display_order) VALUES (?, ?, ?, ?, ?, ?)');
  for (const c of categories) {
    insertCategory.run(c.id, c.name_ar, c.name_en, c.slug, c.icon, c.display_order);
  }

  // 5. Authorized Brands
  const brands = [
    { id: 1, name: 'Carrier', logo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'كاريير - رائد تكييف الهواء عالمياً ومحلياً' },
    { id: 2, name: 'Midea', logo_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'ميديا - تكنولوجيا ذكية وموفرة للطاقة' },
    { id: 3, name: 'Haier', logo_url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'هاير - الجودة الفائقة والتبريد السريع' },
    { id: 4, name: 'LG', logo_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'إل جي - تكنولوجيا الانفرتر المزدوج الذكية' },
    { id: 5, name: 'Sharp', logo_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'شارب - تقنية البلازما كلاستر اليابانية' },
    { id: 6, name: 'Fresh', logo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'فريش - صناعة مصرية بمعايير عالمية' },
    { id: 7, name: 'Tornado', logo_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'تورنيدو - قوة التحمل مع ضمان العربي' },
    { id: 8, name: 'Trane', logo_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'ترين - أنظمة التكييف المركزي والمشروعات الصناعية' },
    { id: 9, name: 'York', logo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'يورك - عملاق التكييف المركزي والمباني الإدارية' },
    { id: 10, name: 'Samsung', logo_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'سامسونج - أجهزة كهربائية وشاشات عرض للمؤتمرات' },
    { id: 11, name: 'Toshiba', logo_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'توشيبا - الأجهزة المعتمدة لمصر والشرق الأوسط' },
    { id: 12, name: 'HP', logo_url: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'إتش بي - طابعات وأحبار ليزر احترافية' },
    { id: 13, name: 'Canon', logo_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'كانون - ماكينات تصوير ومستلزمات طباعة' },
    { id: 14, name: 'Deli', logo_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'ديلي - تجهيزات مكتبية وأثاث حديث' },
    { id: 15, name: 'PurePro / Aqua Clean', logo_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200&auto=format&fit=crop&q=60', is_authorized: 1, description: 'فلاتر تنقية المياه متعددة المراحل التايوانية والأمريكية' }
  ];

  const insertBrand = db.prepare('INSERT INTO brands (id, name, logo_url, is_authorized, description) VALUES (?, ?, ?, ?, ?)');
  for (const b of brands) {
    insertBrand.run(b.id, b.name, b.logo_url, b.is_authorized, b.description);
  }

  // 6. Products
  const products = [
    // --- AIR CONDITIONERS ---
    {
      category_id: 1,
      brand_id: 1, // Carrier
      title_ar: 'تكييف كاريير أوبتيماكس انفرتر 1.5 حصان بارد/ساخن',
      title_en: 'Carrier Optimax Inverter 1.5 HP Cool & Heat',
      description_ar: 'تكييف كاريير أوبتيماكس بتقنية الانفرتر الموفرة للكهرباء حتى 50%. فلاتر كربونية لتنقية الهواء، تبريد فائق السرعة، ومصمم للعمل في درجات الحرارة القاسية بصعيد مصر.',
      description_en: 'Carrier Optimax Inverter AC 1.5 HP Cool/Heat. Saves up to 50% energy. High ambient cooling ideal for Upper Egypt climates, advanced carbon air purifier filters.',
      price: 26500,
      discount_price: 24900,
      stock_quantity: 18,
      horsepower: 1.5,
      is_inverter: 1,
      cooling_type: 'cold_hot',
      warranty_years: 5,
      specs_json: JSON.stringify({
        room_area: 'حتى 14 متر مربع',
        refrigerant: 'R410A صديق للبيئة',
        btu: '12,000 BTU/hr',
        noise_level: 'منخفض جداً (24 ديسيبل)',
        pipe_size: '1/4 - 3/8 بوصة',
        made_in: 'مصر بترخيص من كاريير العالمية'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 1,
      brand_id: 2, // Midea
      title_ar: 'تكييف ميديا ميشن برو 2.25 حصان انفرتر بارد فقط',
      title_en: 'Midea Mission Pro 2.25 HP Inverter Cool Only',
      description_ar: 'تكييف ميديا ميشن برو انفرتر بقوة 2.25 حصان مع شاشة ديجيتال، خاصية التربو للتبريد الخاطف، وفلاتر ثلاثية ضد الميكروبات.',
      description_en: 'Midea Mission Pro 2.25 HP Inverter Cool Only AC with dual inverter motor, digital display, turbo cooling and triple antibacterial air filtration.',
      price: 33800,
      discount_price: 31900,
      stock_quantity: 12,
      horsepower: 2.25,
      is_inverter: 1,
      cooling_type: 'cool_only',
      warranty_years: 5,
      specs_json: JSON.stringify({
        room_area: 'من 15 إلى 22 متر مربع',
        refrigerant: 'R410A',
        btu: '18,000 BTU/hr',
        energy_class: 'A+++ Highest Efficiency',
        pipe_size: '1/4 - 1/2 بوصة'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 1,
      brand_id: 5, // Sharp
      title_ar: 'تكييف شارب انفرتر 3 حصان بارد/ساخن بلازما كلاستر',
      title_en: 'Sharp Inverter 3.0 HP Cool & Heat Plasmacluster',
      description_ar: 'تكييف شارب العربي بقوة 3 حصان مع تقنية البلازما كلاستر للقضاء على الفيروسات والروائح. مزود بموتور انفرتر ياباني عالي الكفاءة مع شاشة ديجيتال مخفية.',
      description_en: 'Sharp El Araby 3 HP Inverter AC with Plasmacluster Ionizer, Japanese motor technology, energy eco-mode and concealed LED display.',
      price: 44500,
      discount_price: 42500,
      stock_quantity: 8,
      horsepower: 3.0,
      is_inverter: 1,
      cooling_type: 'cold_hot',
      warranty_years: 5,
      specs_json: JSON.stringify({
        room_area: 'من 23 إلى 30 متر مربع',
        refrigerant: 'R410A',
        btu: '24,000 BTU/hr',
        special_feature: 'بلازما كلاستر أيون للقضاء على الجراثيم',
        pipe_size: '3/8 - 5/8 بوصة'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 1,
      brand_id: 4, // LG
      title_ar: 'تكييف إل جي ديوال انفرتر 1.5 حصان سمارت واي فاي',
      title_en: 'LG Dual Inverter 1.5 HP Smart Wi-Fi Cool Only',
      description_ar: 'تكييف إل جي بتكنولوجيا الكومبروسور المزدوج Dual Inverter، تحكم كامل عبر الهاتف الذكي (تطبيق LG ThinQ)، حماية من الصدأ جولد فين (Gold Fin)، وتوفير حتى 60% في فاتورة الكهرباء.',
      description_en: 'LG Dual Inverter 1.5 HP Smart Wi-Fi AC with ThinQ app control, Gold Fin anti-corrosion condenser, and 10-year compressor warranty.',
      price: 28900,
      discount_price: 27200,
      stock_quantity: 15,
      horsepower: 1.5,
      is_inverter: 1,
      cooling_type: 'cool_only',
      warranty_years: 10,
      specs_json: JSON.stringify({
        room_area: 'حتى 14 متر مربع',
        refrigerant: 'R410A',
        btu: '12,000 BTU/hr',
        connectivity: 'Built-in Wi-Fi & AI ThinQ'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 1,
      brand_id: 3, // Haier
      title_ar: 'تكييف هاير سمارت كول 1.5 حصان بارد فقط',
      title_en: 'Haier Smart Cool 1.5 HP Cool Only',
      description_ar: 'تكييف هاير تبريد استوائي حتى 52 درجة مئوية، توزيع هواء ثلاثي الأبعاد 3D، شاشة رقمية LED ومواسير نحاسية بالكامل مضادة للتآكل.',
      description_en: 'Haier Smart Cool 1.5 HP heavy-duty tropical AC rated for 52C ambient temperature, 3D airflow distribution, and 100% pure grooved copper tubing.',
      price: 22500,
      discount_price: 20999,
      stock_quantity: 20,
      horsepower: 1.5,
      is_inverter: 0,
      cooling_type: 'cool_only',
      warranty_years: 5,
      specs_json: JSON.stringify({
        room_area: 'حتى 14 متر مربع',
        btu: '12,000 BTU/hr',
        copper_condenser: '100% Pure Inner Grooved Copper'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 0
    },
    {
      category_id: 1,
      brand_id: 1, // Carrier Concealed
      title_ar: 'تكييف كاريير كونسيلد مخفي (Concealed Duct) قدرة 5 حصان 3 فاز',
      title_en: 'Carrier Concealed Duct 5.0 HP 3-Phase Commercial',
      description_ar: 'نظام تكييف مخفي مدمج في السقف المستعار للمقرات الإدارية، الفيلات، وقاعات الاجتماعات الفاخرة. توزيع هواء عبر مخارج دكت مصممة هندسياً بأعلى معايير الهدوء والتبريد المتوازن.',
      description_en: 'Carrier Concealed Duct 5 HP 3-Phase AC designed for corporate offices, luxury villas, and conference halls. Delivers whisper-quiet air distribution through custom ducting.',
      price: 78000,
      discount_price: null,
      stock_quantity: 6,
      horsepower: 5.0,
      is_inverter: 0,
      cooling_type: 'cold_hot',
      warranty_years: 5,
      specs_json: JSON.stringify({
        system_type: 'Concealed Duct Ceiling (سقف مستعار مخفي)',
        btu: '36,000 - 40,000 BTU/hr',
        power_supply: '380V 3-Phase',
        room_area: 'من 40 إلى 55 متر مربع',
        static_pressure: 'High ESP up to 160 Pa'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 1,
      brand_id: 8, // Trane VRF
      title_ar: 'وحدة تكييف مركزي متطور VRF / VRV من ترين قدرة 28 حصان (80 كيلوواط)',
      title_en: 'Trane Advanced Commercial VRF System 28 HP (80 kW)',
      description_ar: 'أنظمة التكييف المتطورة الذكية VRV / VRF للمصانع والمنشآت الإدارية والمستشفيات. تحكم ذكي منفصل في درجات الحرارة لكل غرفة، أعلى معدل توفير طاقة عالمياً، وتشغيل هادئ وموثوق.',
      description_en: 'Trane commercial VRF/VRV multi-split central outdoor unit 28 HP (80 kW) for industrial plants, corporate buildings, and medical centers with zoned inverter control.',
      price: 245000,
      discount_price: 235000,
      stock_quantity: 3,
      horsepower: 28.0,
      is_inverter: 1,
      cooling_type: 'cold_hot',
      warranty_years: 5,
      specs_json: JSON.stringify({
        capacity_kw: '80.0 kW (28 HP)',
        system_type: 'VRF / VRV Inverter Commercial',
        indoor_units_support: 'Up to 32 Indoor Units',
        refrigerant: 'R410A Eco Inverter',
        target_sectors: 'المصانع، المستشفيات، المقرات الإدارية، الفنادق'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },

    // --- WATER PURIFICATION & DISPENSERS ---
    {
      category_id: 2,
      brand_id: 15, // PurePro
      title_ar: 'فلتر مياه ريفيرس أوزموسيس 7 مراحل أمريكي تايواني بمضخة وخزان',
      title_en: '7-Stage RO Water Purification System with Tank & Pump',
      description_ar: 'محطة تنقية مياه منزلية متكاملة 7 مراحل بتكنولوجيا التناضح العكسي (RO). تشمل مرحلة الممبرين الأمريكي ومرحلة الألكالاين لمعادلة حموضة المياه وإضافة المعادن الصحية (كالسيوم وماغنسيوم).',
      description_en: '7-Stage Reverse Osmosis domestic water purification system equipped with high-pressure booster pump, food-grade storage pressure tank, American RO membrane, and Mineral Alkaline stage.',
      price: 5800,
      discount_price: 5200,
      stock_quantity: 25,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 2,
      specs_json: JSON.stringify({
        stages_count: '7 مراحل معالجة وتعقيم',
        tank_capacity: '12 لتر تانك ضغط صحي',
        daily_capacity: '75 جالون / 280 لتر يومياً',
        pump: 'مضخة تايواني أصلية كتم صوت',
        faucet: 'حنفية استانلس ستيل 304 فاخرة'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 2,
      brand_id: 15,
      title_ar: 'طقم شمعات فلاتر مياه أصلي كامل 7 مراحل (سنة كاملة)',
      title_en: 'Full 1-Year 7-Stage Replacement Filter Cartridges Kit',
      description_ar: 'طقم شمعات أصلي يشمل: شمعة شوائب بولي بروبلين، كربون نشط حبيبي، كربون بلوك مصمت، ممبرين تناضح عكسي، بوست كربون، شمعة كالسيت معدنية، وشمعة الأشعة تحت الحمراء/ألكالاين.',
      description_en: 'Complete annual replacement pack of 7 authentic filter cartridges including Sediment PP, GAC, CTO, Filmtec RO membrane, Post Carbon, Mineralizer, and Alkaline Infrared cartridges.',
      price: 1450,
      discount_price: 1250,
      stock_quantity: 60,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 1,
      specs_json: JSON.stringify({
        compatibility: 'يناسب جميع أنواع فلاتر الـ 7 مراحل القياسية',
        origin: 'أمريكي / تايواني معتمد من NSF',
        lifespan: 'من 3 إلى 12 شهر حسب كل مرحلة'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 0
    },
    {
      category_id: 2,
      brand_id: 6, // Fresh
      title_ar: 'مبرد مياه فريش ساخن / بارد بثلاجة سفلية مدمجة',
      title_en: 'Fresh Hot & Cold Water Dispenser with Built-in Mini Fridge',
      description_ar: 'مبرد مياه عصري 2 حنفية (مياه باردة منعشة ومياه ساخنة للمشروبات) مع كابينة ثلاجة سفلية لحفظ المعلبات والأطعمة. مزود بحماية أمان للأطفال وموتور فائق التحمل.',
      description_en: 'Fresh 2-Tap Hot and Cold water dispenser featuring a bottom refrigeration compartment, child-lock hot water safety tap, and heavy-duty tropical compressor.',
      price: 6400,
      discount_price: 5950,
      stock_quantity: 14,
      horsepower: null,
      is_inverter: 0,
      cooling_type: 'cold_hot',
      warranty_years: 2,
      specs_json: JSON.stringify({
        cooling_capacity: '3.5 لتر في الساعة مياه مثلجة',
        heating_capacity: '5 لتر في الساعة مياه ساخنة',
        tank_material: 'استانلس ستيل 304 مضاد للبكتيريا',
        bottom_compartment: 'ثلاجة سفلية صغيرة 16 لتر'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },

    // --- HOME & OFFICE APPLIANCES ---
    {
      category_id: 3,
      brand_id: 10, // Samsung
      title_ar: 'شاشة سامسونج سمارت 65 بوصة 4K كريستال للمؤتمرات والمنازل',
      title_en: 'Samsung 65" Crystal UHD 4K Smart Display with Conference Mode',
      description_ar: 'شاشة سامسونج فائقة الدقة 4K UHD مزودة بمعالج Crystal Processor 4K، دعم مؤتمرات الفيديو وعرض العروض التقديمية اللاسلكية في قاعات الاجتماعات الإدارية، ونظام صوتي محيطي.',
      description_en: 'Samsung 65-inch Crystal UHD 4K Smart TV optimized for corporate boardroom conferencing and entertainment with wireless presentation screen mirroring.',
      price: 24900,
      discount_price: 23200,
      stock_quantity: 10,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 2,
      specs_json: JSON.stringify({
        resolution: '3840 x 2160 (4K UHD)',
        refresh_rate: '60Hz Motion Xcelerator',
        os: 'Tizen Smart OS with PC on TV mode',
        ports: '3x HDMI, 2x USB, LAN, Optical Audio'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 3,
      brand_id: 11, // Toshiba
      title_ar: 'ثلاجة توشيبا انفرتر 18 قدم نوفروست استانلس تبريد فائق',
      title_en: 'Toshiba Inverter 18 Cu Ft No-Frost Refrigerator',
      description_ar: 'ثلاجة توشيبا سعة 18 قدم مزودة بموتور انفرتر لتوفير استهلاك الكهرباء، فلاتر هجينة لتنقية الروائح Ag+ Bio، ونظام تدفق هواء متعدد لحفظ الأطعمة طازجة أطول فترة.',
      description_en: 'Toshiba 18 Cubic Feet No-Frost Refrigerator featuring Inverter Compressor, Ag+ Bio deodorizer filter system, and durable tempered glass shelves.',
      price: 31500,
      discount_price: 29800,
      stock_quantity: 9,
      horsepower: null,
      is_inverter: 1,
      cooling_type: null,
      warranty_years: 10,
      specs_json: JSON.stringify({
        capacity: '411 لتر (18 قدم مكعب)',
        cooling_system: 'نوفروست ذكي بدون تكوين ثلج',
        color: 'استانلس ستيل فضي راقي',
        compressor_warranty: '10 سنوات ضمان العربي'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 0
    },

    // --- OFFICE SUPPLIES & FURNISHING ---
    {
      category_id: 4,
      brand_id: 14, // Deli
      title_ar: 'كرسي مكتب طبي هيدروليك شبك مريح للمديرين والموظفين',
      title_en: 'Ergonomic High-Back Breathable Mesh Office Chair',
      description_ar: 'كرسي مريح مصمم هندسياً لدعم فقرات الظهر والرقبة لساعات العمل الطويلة، مزود بمسند رأس قابل للتعديل، هيدروليك عالي التحمل، وعجلات صامتة.',
      description_en: 'Ergonomic executive high-back office chair with breathable Korean mesh, adjustable lumbar support, heavy-duty pneumatic gas lift, and silent 360 wheels.',
      price: 3950,
      discount_price: 3450,
      stock_quantity: 35,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 2,
      specs_json: JSON.stringify({
        material: 'High-density foam with breathable mesh',
        weight_capacity: 'Up to 150 kg',
        adjustments: 'ارتفاع، إمالة الظهر 135 درجة، مسند الرأس'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 4,
      brand_id: 12, // HP
      title_ar: 'طابعة ليزر متعددة الوظائف HP LaserJet Pro 4 في 1 (طباعة/سكانر/تصوير/فاكس)',
      title_en: 'HP LaserJet Pro MFP M428fdw Wireless Duplex 4-in-1',
      description_ar: 'طابعة ليزر للمؤسسات والمصانع والشركات. طباعة سريعة 38 صفحة في الدقيقة، دوبلكس وجهين أوتوماتيك، شاشة لمس ملونة، واتصال واي فاي مباشر.',
      description_en: 'HP LaserJet Pro M428fdw heavy-duty network laser printer with duplex auto printing, scanner feeder, PIN security, and high-yield cartridge support.',
      price: 21900,
      discount_price: 20500,
      stock_quantity: 7,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 1,
      specs_json: JSON.stringify({
        speed: '38 صفحة في الدقيقة أبيض وأسود',
        connectivity: 'Gigabit Ethernet, Dual-band Wi-Fi, USB',
        paper_capacity: 'درج رئيسي 250 ورقة + درج متعدد 100 ورقة',
        duty_cycle: 'حتى 80,000 صفحة شهرياً'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 0
    },

    // --- ENGINEERING & PREVENTIVE SERVICES ---
    {
      category_id: 5,
      brand_id: null,
      title_ar: 'توريد وتركيب مواسير نحاس أصلية (بالمتر) للتكييف مع العزل',
      title_en: 'Certified Pure Copper Piping Supply & Extension (Per Meter)',
      description_ar: 'توريد وتركيب مواسير نحاس جنوب إفريقي وأمريكي نقية 100% مع عازل أرمفليكس عالي الجودة، كابلات كهربائية سويدي أصلية، ومستلزمات التثبيت والشحن.',
      description_en: 'Premium South African & American pure copper piping installation per linear meter. Includes high-density Armaflex insulation, El Sewedy copper cables, and hardware.',
      price: 1150,
      discount_price: 1050,
      stock_quantity: 999,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 5,
      specs_json: JSON.stringify({
        unit: 'متر طولي كامل بالمستلزمات',
        copper_type: 'جنوب إفريقي / أمريكي نقي 99.9%',
        insulation: 'Armaflex Class 1 ضد الرطوبة وتكثف المياه',
        cables: 'كابلات نحاسية معتمدة من السويدي للكابلات'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    },
    {
      category_id: 5,
      brand_id: null,
      title_ar: 'عقد صيانة سنوي وقائي للمصانع والشركات والمباني الإدارية',
      title_en: 'Comprehensive Annual HVAC Preventive Maintenance Contract',
      description_ar: 'عقد صيانة وقائية شامل دوري (زيارات شهرية وربع سنوية) لفحص ضغوط الفريون، تنظيف وغسيل الوحدات الداخلية والخارجية بماكينات الضغط، فحص الدوائر الكهربائية، واستجابة طارئة 24/7.',
      description_en: 'Commercial annual HVAC service contract for corporate offices and manufacturing facilities. Covers quarterly scheduled inspections, coil washing, refrigerant balancing, and 24/7 priority emergency response.',
      price: 15000,
      discount_price: 13500,
      stock_quantity: 99,
      horsepower: null,
      is_inverter: 0,
      cooling_type: null,
      warranty_years: 1,
      specs_json: JSON.stringify({
        visits: '4 زيارات دورية شاملة + زيارات طوارئ غير محدودة',
        reports: 'تقارير فنية هندسية مفصلة بحالة كل جهاز',
        coverage: 'محافظة أسيوط والمناطق الصناعية (الصفا - منقباد - عرب العوامر)'
      }),
      images_array: JSON.stringify([
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
      ]),
      is_featured: 1
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      category_id, brand_id, title_ar, title_en, description_ar, description_en,
      price, discount_price, stock_quantity, horsepower, is_inverter, cooling_type,
      warranty_years, specs_json, images_array, is_featured, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProduct.run(
      p.category_id, p.brand_id, p.title_ar, p.title_en, p.description_ar, p.description_en,
      p.price, p.discount_price, p.stock_quantity, p.horsepower, p.is_inverter, p.cooling_type,
      p.warranty_years, p.specs_json, p.images_array, p.is_featured, 1
    );
  }

  // 7. System Settings with Al-Manar's official verified credentials
  const settings = [
    { key: 'company_name_ar', value: 'شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية', description: 'الاسم الرسمي للشركة بالعربية' },
    { key: 'company_name_en', value: 'Al-Manar Air Conditioning, Water Filters & Commercial Agencies', description: 'Company Name in English' },
    { key: 'company_slogan_ar', value: 'رواد الحلول الهندسية لأنظمة التكييف والتوريدات العامة في صعيد مصر', description: 'شعار الشركة' },
    { key: 'company_address', value: 'أسيوط - أول شارع التجنيد من شارع الجمهورية - أمام بنك الإمارات دبي الوطني (Emirates NBD)، مدينة أسيوط، مصر.', description: 'عنوان المقر الرئيسي والمعرض' },
    { key: 'hotline_primary', value: '01119461111', description: 'الخط الساخن ورقم فودافون كاش الرئيسي' },
    { key: 'hotline_secondary', value: '01114961111', description: 'رقم خدمة العملاء الثاني' },
    { key: 'hotline_emergency', value: '01119641111', description: 'رقم الطوارئ والدعم الفني 24/7' },
    { key: 'whatsapp_number', value: '201119461111', description: 'رقم الواتساب الرسمي للمحادثات الفورية' },
    { key: 'company_email', value: 'almanaragencies@gmail.com', description: 'البريد الإلكتروني الرسمي للمراسلات' },
    
    // Banking Details (Banque Misr)
    { key: 'bank_name', value: 'Banque Misr (بنك مصر - فرع أسيوط)', description: 'اسم البنك والفرع' },
    { key: 'bank_account_holder', value: 'شركة المنار للتوكيلات التجارية', description: 'اسم صاحب الحساب' },
    { key: 'bank_swift', value: 'BMISEGCX140', description: 'كود السويفت البنكي' },
    { key: 'bank_iban', value: 'EG710002057805780001000002280', description: 'رقم الآيبان البنكي المعتمد' },
    { key: 'commercial_registration', value: 'س.ت 92950', description: 'رقم السجل التجاري' },
    { key: 'tax_card', value: 'ب.ض 231-091-057', description: 'رقم البطاقة الضريبية' },
    
    // Wallets and Payment Configuration
    { key: 'active_vodafone_cash', value: '01119461111', description: 'محفظة فودافون كاش المعتمدة لاستقبال المدفوعات' },
    { key: 'active_vodafone_cash_owner', value: 'شركة المنار للتوكيلات التجارية', description: 'اسم صاحب محفظة فودافون كاش' },
    { key: 'active_instapay_ipa', value: 'almanar@instapay', description: 'عنوان الدفع اللحظي في انستاباي (InstaPay IPA)' },
    { key: 'active_instapay_name', value: 'Al-Manar Trading Agencies / شركة المنار', description: 'الاسم المسجل في تطبيق انستاباي' },
    { key: 'instapay_instructions_ar', value: 'افتح تطبيق انستاباي > اختر تحويل إلى عنوان دفع لحظي (IPA) > اكتب almanar@instapay > تأكد من ظهور اسم "شركة المنار" > أدخل المبلغ وأتمم التحويل > خذ لقطة شاشة للعملية.', description: 'تعليمات التحويل عبر انستاباي' },
    { key: 'vodafone_cash_instructions_ar', value: 'من خط فودافون اطلب #7*9* أو افتح تطبيق أنا فودافون > حول المبلغ إلى 01119461111 > احتفظ برسالة التأكيد ورقم العملية وقم برفع الصورة.', description: 'تعليمات التحويل عبر فودافون كاش' },
    { key: 'copper_rate_per_meter', value: '1150', description: 'سعر توريد وتركيب متر النحاس الأصلي شامل العزل والكابلات (جنيه مصري)' },
    { key: 'standard_installation_fee', value: '800', description: 'مصنعية تركيب التكييف القياسية (جنيه مصري)' },
    { key: 'emergency_dispatch_fee', value: '450', description: 'رسوم المعاينة والكشف الطارئ 24 ساعة (جنيه مصري)' }
  ];

  const insertSetting = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, description) VALUES (?, ?, ?)');
  for (const s of settings) {
    insertSetting.run(s.key, s.value, s.description);
  }

  // 8. Sample Orders and Payment Receipts
  const orders = [
    {
      id: 1,
      order_code: 'ALM-2026-1001',
      user_id: 5,
      customer_name: 'د. أحمد حسن',
      customer_phone: '01098765432',
      shipping_address: 'برج الأطباء - شارع المحافظة، أسيوط',
      city: 'أسيوط',
      subtotal_amount: 24900,
      shipping_fee: 0,
      total_amount: 24900,
      payment_method: 'instapay',
      payment_status: 'Pending_Payment_Verification',
      order_status: 'Pending',
      notes: 'يرجى التوصيل خلال الفترة الصباحية من 10 صباحاً إلى 2 ظهراً.'
    },
    {
      id: 2,
      order_code: 'ALM-2026-1002',
      user_id: 5,
      customer_name: 'شركة الصفا لمواد البناء - م. حسين حجازي',
      customer_phone: '01123456789',
      shipping_address: 'المنطقة الصناعية - مصنع الأسمنت، أسيوط',
      city: 'أسيوط',
      subtotal_amount: 74400,
      shipping_fee: 0,
      total_amount: 74400,
      payment_method: 'vodafone_cash',
      payment_status: 'Paid',
      order_status: 'Processing',
      notes: 'توريد عدد 3 أجهزة تكييف كاريير 1.5 حصان للمبنى الإداري الجديد.'
    },
    {
      id: 3,
      order_code: 'ALM-2026-1003',
      user_id: 5,
      customer_name: 'الحاج مصطفى السيوطي',
      customer_phone: '01222233344',
      shipping_address: 'شارع الجمهورية بجوار محطة القطار، أسيوط',
      city: 'أسيوط',
      subtotal_amount: 5200,
      shipping_fee: 100,
      total_amount: 5300,
      payment_method: 'cod',
      payment_status: 'Paid',
      order_status: 'Delivered',
      notes: 'فلتر مياه 7 مراحل مع التركيب الفوري.'
    }
  ];

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_code, user_id, customer_name, customer_phone,
      shipping_address, city, subtotal_amount, shipping_fee, total_amount,
      payment_method, payment_status, order_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of orders) {
    insertOrder.run(
      o.id, o.order_code, o.user_id, o.customer_name, o.customer_phone,
      o.shipping_address, o.city, o.subtotal_amount, o.shipping_fee, o.total_amount,
      o.payment_method, o.payment_status, o.order_status, o.notes
    );
  }

  // Order Items
  const orderItems = [
    { order_id: 1, product_id: 1, product_title: 'تكييف كاريير أوبتيماكس انفرتر 1.5 حصان بارد/ساخن', unit_price: 24900, quantity: 1, total_price: 24900 },
    { order_id: 2, product_id: 1, product_title: 'تكييف كاريير أوبتيماكس انفرتر 1.5 حصان بارد/ساخن', unit_price: 24800, quantity: 3, total_price: 74400 },
    { order_id: 3, product_id: 8, product_title: 'فلتر مياه ريفيرس أوزموسيس 7 مراحل أمريكي تايواني', unit_price: 5200, quantity: 1, total_price: 5200 }
  ];

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_title, unit_price, quantity, total_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const item of orderItems) {
    insertItem.run(item.order_id, item.product_id, item.product_title, item.unit_price, item.quantity, item.total_price);
  }

  // Sample Payment Receipts
  const receipts = [
    {
      order_id: 1,
      method: 'instapay',
      sender_number_or_handle: 'ahmed_hassan@instapay',
      reference_number: 'IP-20261002-884920',
      receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'Pending_Verification',
      verified_by: null,
      verification_notes: null
    },
    {
      order_id: 2,
      method: 'vodafone_cash',
      sender_number_or_handle: '01011223344',
      reference_number: 'VF-9482710492',
      receipt_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      status: 'Approved',
      verified_by: 3,
      verification_notes: 'تم التأكد من استلام المبلغ بحساب محفظة فودافون كاش بنجاح.'
    }
  ];

  const insertReceipt = db.prepare(`
    INSERT INTO payment_receipts (
      order_id, method, sender_number_or_handle, reference_number,
      receipt_image_url, status, verified_by, verification_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of receipts) {
    insertReceipt.run(r.order_id, r.method, r.sender_number_or_handle, r.reference_number, r.receipt_image_url, r.status, r.verified_by, r.verification_notes);
  }

  // 9. Sample Service Requests
  const serviceRequests = [
    {
      id: 1,
      request_code: 'SRV-2026-501',
      user_id: 5,
      customer_name: 'د. أحمد حسن',
      customer_phone: '01098765432',
      address: 'شارع الهلالي أمام مدرسة الثورة، أسيوط',
      city: 'أسيوط',
      service_type: 'copper_piping_extension',
      brand_id: 1,
      copper_meters: 6,
      ac_units_count: 2,
      notes: 'تجهيز وتمديد شبكة مواسير نحاس أرمفليكس قبل تشطيب الجبس بورد.',
      status: 'Scheduled',
      assigned_technician: 'م. حسام الدين (فني أول تبريد وتكييف)',
      scheduled_date: '2026-10-05 11:00',
      estimated_cost: 6900
    },
    {
      id: 2,
      request_code: 'SRV-2026-502',
      user_id: 5,
      customer_name: 'شركة أسمنت أسيوط (CEMEX) - إدارة الصيانة',
      customer_phone: '01199887766',
      address: 'طريق المطار - مبنى إدارة المشتريات، أسيوط',
      city: 'أسيوط',
      service_type: 'annual_contract',
      brand_id: 8, // Trane
      copper_meters: 0,
      ac_units_count: 14,
      notes: 'معاينة فنية لإبرام عقد صيانة سنوي لأنظمة التكييف المركزي VRF والمبردات.',
      status: 'In_Progress',
      assigned_technician: 'م. يوسف كمال (مهندس المشروعات والتكييف المركزي)',
      scheduled_date: '2026-10-06 09:30',
      estimated_cost: 45000
    },
    {
      id: 3,
      request_code: 'SRV-2026-503',
      user_id: 5,
      customer_name: 'الأستاذ كمال البدراري',
      customer_phone: '01055566677',
      address: 'حي النميس - برج الصفوة، أسيوط',
      city: 'أسيوط',
      service_type: 'water_filter_maintenance',
      brand_id: 15,
      copper_meters: 0,
      ac_units_count: 1,
      notes: 'تغيير شمعات الفلتر 7 مراحل وفحص ضغط خزان المياه وقياس نسبة الأملاح TDS.',
      status: 'Pending',
      assigned_technician: null,
      scheduled_date: '2026-10-04 15:00',
      estimated_cost: 850
    }
  ];

  const insertService = db.prepare(`
    INSERT INTO service_requests (
      id, request_code, user_id, customer_name, customer_phone,
      address, city, service_type, brand_id, copper_meters,
      ac_units_count, notes, status, assigned_technician,
      scheduled_date, estimated_cost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of serviceRequests) {
    insertService.run(
      s.id, s.request_code, s.user_id, s.customer_name, s.customer_phone,
      s.address, s.city, s.service_type, s.brand_id, s.copper_meters,
      s.ac_units_count, s.notes, s.status, s.assigned_technician,
      s.scheduled_date, s.estimated_cost
    );
  }

  // 10. Audit Logs
  const auditLogs = [
    {
      user_id: 1,
      action: 'SYSTEM_INITIALIZATION',
      target_type: 'SYSTEM',
      target_id: '0',
      details: 'Initial database seeding and security configuration established for Al-Manar Trading Agencies.',
      ip_address: '127.0.0.1'
    },
    {
      user_id: 3,
      action: 'PAYMENT_VERIFIED',
      target_type: 'ORDER',
      target_id: '2',
      details: 'Vodafone Cash transaction VF-9482710492 for EGP 74,400 verified and approved.',
      ip_address: '192.168.1.15'
    }
  ];

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const a of auditLogs) {
    insertAudit.run(a.user_id, a.action, a.target_type, a.target_id, a.details, a.ip_address);
  }

  console.log('[Seed] Database successfully seeded with authentic Al-Manar catalog and configuration!');
}

const isDirectCLI = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectCLI) {
  seed().catch(err => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}
