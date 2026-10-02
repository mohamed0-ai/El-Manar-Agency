import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Wind, Droplets, Tv, Briefcase, Wrench, ShieldCheck,
  CheckCircle, ArrowLeft, ArrowRight, Calculator, Phone,
  Sparkles, Award, Zap, Truck, Flame, Star, ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, brandRes] = await Promise.all([
          axios.get('/api/products?featured=1'),
          axios.get('/api/brands')
        ]);
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.products);
        }
        if (brandRes.data.success) {
          setBrands(brandRes.data.brands);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = [
    {
      id: 1,
      title_ar: 'أنظمة التكييف المتطورة',
      title_en: 'Air Conditioning Systems',
      slug: 'air-conditioning',
      desc_ar: 'سبليت، كونسيلد مخفي، مركزي، وأنظمة VRF الذكية للمصانع والشركات',
      icon: Wind,
      color: 'from-blue-600 to-manar-800',
      badge: 'ضمان 5 سنوات'
    },
    {
      id: 2,
      title_ar: 'فلاتر ومبردات المياه',
      title_en: 'Water Purification & Dispensers',
      slug: 'water-purification',
      desc_ar: 'محطات RO منزلية 7 مراحل، شمعات أصلية، ومبردات مياه ساخن/بارد',
      icon: Droplets,
      color: 'from-cyan-500 to-teal-700',
      badge: 'أعلى نقاء صحي'
    },
    {
      id: 3,
      title_ar: 'الأجهزة الكهربائية',
      title_en: 'Home & Office Appliances',
      slug: 'home-appliances',
      desc_ar: 'شاشات عرض ذكية للمؤتمرات، ثلاجات، غسالات، وبوتاجازات معتمدة',
      icon: Tv,
      color: 'from-indigo-600 to-blue-900',
      badge: 'تجهيزات متكاملة'
    },
    {
      id: 4,
      title_ar: 'المستلزمات والأثاث المكتبي',
      title_en: 'Office Supplies & Furnishing',
      slug: 'office-supplies',
      desc_ar: 'تأثيث مكاتب عصري، كراسي طبية، طابعات ليزر وأحبار أصلية',
      icon: Briefcase,
      color: 'from-slate-700 to-slate-900',
      badge: 'جودة تنافسية'
    },
    {
      id: 5,
      title_ar: 'الخدمات الهندسية والصيانة',
      title_en: 'Engineering & Maintenance',
      slug: 'engineering-services',
      desc_ar: 'تمديد مواسير نحاس بالمتر، عقود صيانة سنوية، وطوارئ 24/7',
      icon: Wrench,
      color: 'from-amber-600 to-orange-700',
      badge: 'فريق هندسي معتمد'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-manar-900 via-manar-800 to-cyanWater-700 text-white py-16 lg:py-24">
        {/* Subtle engineering decorative lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-start">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyanWater-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>{t('hero_badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                شركة المنار للتكييف وفلاتر المياه <br />
                <span className="text-cyanWater-300 font-extrabold text-2xl sm:text-3xl lg:text-4xl block mt-2">
                  رواد الحلول الهندسية والتوريدات العامة بأسيوط
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                {t('hero_desc')}
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/catalog"
                  className="bg-cyanWater-500 hover:bg-cyanWater-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-cyanWater-500/30 transition text-sm flex items-center gap-2"
                >
                  <span>{t('hero_cta_browse')}</span>
                  <ArrowLeft size={16} className={lang === 'en' ? 'rotate-180' : ''} />
                </Link>

                <Link
                  to="/calculator"
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-5 py-3.5 rounded-xl backdrop-blur transition text-sm flex items-center gap-2"
                >
                  <Calculator size={17} className="text-amber-400" />
                  <span>{t('hero_cta_calc')}</span>
                </Link>

                <Link
                  to="/services"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-5 py-3.5 rounded-xl transition text-sm flex items-center gap-2 shadow"
                >
                  <Wrench size={16} />
                  <span>حجز صيانة وتمديد نحاس</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-white">ضمان 5 سنوات</span>
                    <span className="text-[10px] text-slate-300">توكيلات أصلية معتمدة</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-cyanWater-300 shrink-0" />
                  <div>
                    <span className="font-bold block text-white">توفير 50% كهرباء</span>
                    <span className="text-[10px] text-slate-300">أحدث موديلات الانفرتر</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award size={20} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-white">نحاس جنوب إفريقي</span>
                    <span className="text-[10px] text-slate-300">نقي 100% معتمد</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: OFFICIAL AGENCY POSTER (بوستر شركة المنار للتوكيلات التجارية) */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-gradient-to-b from-slate-900/95 via-manar-900/90 to-slate-950/95 border-2 border-amber-400/50 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 text-start ring-4 ring-manar-700/40">
                {/* Poster Gold Ribbon Header */}
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black tracking-wide">
                    <Sparkles size={15} className="text-amber-400" />
                    <span>البوستر التعريفي الرسمي | OFFICIAL AGENCY POSTER</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyanWater-300 font-bold bg-manar-800/80 px-2 py-0.5 rounded border border-manar-600">
                    س.ت 92950
                  </span>
                </div>

                {/* Poster Official Logo & Company Identity */}
                <div className="bg-white p-3 rounded-2xl shadow-lg flex items-center justify-between">
                  <img
                    src="/logo.png"
                    alt="شركة المنار للتوكيلات التجارية"
                    className="h-14 sm:h-16 w-auto object-contain"
                    onError={(e) => {
                      e.target.src = '/logo.jpg';
                    }}
                  />
                  <div className="text-end border-s border-slate-200 ps-3">
                    <span className="text-[10px] text-slate-500 font-semibold block">المقر والمعرض الرئيسي</span>
                    <span className="text-xs font-black text-manar-800 block">أسيوط - شارع التجنيد</span>
                    <span className="text-[9px] text-cyanWater-700 font-bold block mt-0.5">أمام بنك Emirates NBD</span>
                  </div>
                </div>

                {/* Poster Engineering Showcase Visual */}
                <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-xl border border-white/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80"
                    alt="Al-Manar Industrial & Commercial HVAC Poster"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Gradient overlays with engineering details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-between p-4 text-white">
                    {/* Top Poster Badges */}
                    <div className="flex justify-between items-start">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wider">
                        حلول المشروعات والمصانع
                      </span>
                      <span className="bg-manar-800/90 text-cyanWater-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyanWater-400/40" dir="ltr">
                        VRF: 8-36 HP | 25.2-100 kW
                      </span>
                    </div>

                    {/* Bottom Slogan & Subtitle */}
                    <div className="space-y-1">
                      <div className="text-xs font-black text-amber-300 italic">
                        "نحن لا نبيع أجهزة، نحن نصنع المناخ المناسب لإنتاجيتكم"
                      </div>
                      <p className="text-sm font-black text-white leading-tight">
                        أنظمة التكييف المتطورة VRV/VRF • كونسيلد مخفي • محطات تحلية المياه
                      </p>
                      <div className="text-[10px] text-cyanWater-200 flex items-center gap-1 pt-0.5">
                        <Award size={12} className="text-amber-400" />
                        <span>وكلاء وموزعون معتمدون: Carrier • Midea • LG • Sharp • Trane</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Agency Pillars Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                  <div className="bg-white/10 backdrop-blur p-2.5 rounded-xl border border-white/15">
                    <span className="text-[10px] text-amber-300 font-bold block mb-0.5">⚡ عقود صيانة سنوية</span>
                    <span className="text-[11px] leading-tight block text-slate-300">للمصانع والمقرات الإدارية 24/7</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur p-2.5 rounded-xl border border-white/15">
                    <span className="text-[10px] text-cyanWater-300 font-bold block mb-0.5">❄️ مواسير نحاس نقية 100%</span>
                    <span className="text-[11px] leading-tight block text-slate-300">جنوب إفريقي مع عازل وكابلات سويدي</span>
                  </div>
                </div>

                {/* Official Presentation Quote Ribbon */}
                <div className="bg-amber-400 text-slate-950 font-black text-center py-2 px-3 rounded-xl text-xs shadow flex items-center justify-center gap-2">
                  <Award size={14} />
                  <span>"التميز ليس فعلاً، بل هو عادة" • شركة المنار للتكييف والتوريدات العامة</span>
                </div>

                {/* Poster Footer Hotline & Action */}
                <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone size={15} className="text-cyanWater-400 shrink-0" />
                    <span className="text-[11px]">الخط الساخن المباشر:</span>
                    <a href="tel:01119461111" className="font-mono font-bold text-amber-400 hover:underline" dir="ltr">
                      01119461111
                    </a>
                  </div>
                  <Link
                    to="/services"
                    className="bg-cyanWater-500 hover:bg-cyanWater-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow"
                  >
                    طلب معاينة
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHORIZED BRANDS STRIP WITH MAIN BRAND PHOTOS / LOGOS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-manar-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
              <Award size={14} className="text-manar-600" />
              <span>موزع معتمد للعلامات التجارية العالمية | Authorized Dealerships</span>
            </div>
            <p className="text-xs text-slate-500">
              نضمن لكم توريد الأجهزة الأصلية بالضمان المعتمد وخدمات ما بعد البيع المباشرة
            </p>
          </div>

          {/* Brands Logo Grid with Official Main Photos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {[
              { name: 'Carrier', logo: '/brands/carrier.svg', category: 'تكييفات وحلول مركزية', query: 'Carrier' },
              { name: 'Midea', logo: '/brands/midea.svg', category: 'انفرتر وتبريد ذكي', query: 'Midea' },
              { name: 'Haier', logo: '/brands/haier.svg', category: 'تبريد استوائي فائق', query: 'Haier' },
              { name: 'LG', logo: '/brands/lg.svg', category: 'ديوال انفرتر سمارت', query: 'LG' },
              { name: 'Sharp', logo: '/brands/sharp.svg', category: 'بلازما كلاستر ياباني', query: 'Sharp' },
              { name: 'Fresh', logo: '/brands/fresh.svg', category: 'تكييفات ومبردات مياه', query: 'Fresh' },
              { name: 'Tornado', logo: '/brands/tornado.svg', category: 'تحمل عالي - ضمان العربي', query: 'Tornado' },
              { name: 'Trane', logo: '/brands/trane.svg', category: 'أنظمة VRF وتكييف مركزي', query: 'Trane' },
              { name: 'York', logo: '/brands/york.svg', category: 'حلول تكييف المباني والمصانع', query: 'York' },
              { name: 'Samsung', logo: '/brands/samsung.svg', category: 'شاشات عرض وأجهزة متطورة', query: 'Samsung' }
            ].map((brand) => (
              <Link
                key={brand.name}
                to={`/catalog?q=${encodeURIComponent(brand.query)}`}
                className="group bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-manar-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between text-center relative overflow-hidden"
                title={`عرض منتجات وتكييفات ${brand.name}`}
              >
                {/* Brand Logo Main Photo */}
                <div className="h-16 w-full flex items-center justify-center p-1 group-hover:scale-110 transition duration-300">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-[130px] object-contain drop-shadow-sm"
                  />
                </div>

                {/* Subtitle & Badge */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 w-full space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block group-hover:text-manar-700 transition">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {brand.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE DOMAINS & CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-cyanWater-700 uppercase">قطاعات وأقسام التوريدات</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              مجالات العمل والحلول الهندسية المتكاملة
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-manar-700 hover:text-manar-800 flex items-center gap-1"
          >
            <span>عرض كافة المنتجات والأسعار</span>
            <ChevronLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200 hover:border-manar-500 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-300`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-manar-700 transition">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-manar-700 transition">
                      {lang === 'ar' ? cat.title_ar : cat.title_en}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {cat.desc_ar}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-manar-700">
                  <span>تصفح المنتجات والمواصفات</span>
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS & DEALS */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mb-1">
              <Flame size={13} />
              <span>أحدث العروض الحصرية بأسيوط</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              أجهزة التكييف وفلاتر المياه الأكثر طلباً
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-manar-700 hover:underline flex items-center gap-1"
          >
            <span>مشاهدة كل الكتالوج</span>
            <ChevronLeft size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => {
              const mainImg = product.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
              const isAdded = addedId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative">
                    {/* Image */}
                    <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                      <img
                        src={mainImg}
                        alt={product.title_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {/* Brand Logo Pill */}
                      {product.brand_name && (
                        <span className="absolute top-2 start-2 bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {product.brand_name}
                        </span>
                      )}

                      {/* Inverter Badge */}
                      {product.is_inverter === 1 && (
                        <span className="absolute top-2 end-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Zap size={10} />
                          <span>انفرتر موفر</span>
                        </span>
                      )}

                      {/* Horsepower Badge */}
                      {product.horsepower && (
                        <span className="absolute bottom-2 start-2 bg-manar-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {product.horsepower} حصان
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-cyanWater-700 font-semibold">
                        {product.category_name_ar}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-manar-700 transition">
                        <Link to={`/catalog/${product.id}`}>
                          {product.title_ar}
                        </Link>
                      </h3>

                      {/* Key spec */}
                      {product.specs?.room_area && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded">
                          المساحة: {product.specs.room_area}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <div>
                      {product.discount_price ? (
                        <div>
                          <span className="text-sm font-black text-manar-700 block">
                            {product.discount_price.toLocaleString()} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {product.price.toLocaleString()} ج.م
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-slate-900 block">
                          {product.price.toLocaleString()} ج.م
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-manar-700 hover:bg-manar-800 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle size={14} />
                          <span>تمت الإضافة!</span>
                        </>
                      ) : (
                        <span>أضف للسلة</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE SMART AC CALCULATOR TEASER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-manar-800 to-cyanWater-800 text-white p-8 lg:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4 text-start">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
              <Calculator size={14} />
              <span>الأداة الهندسية الأولى في صعيد مصر</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              مش متأكد من قدرة التكييف المناسبة لمساحتك؟
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              احسب الحمل الحراري للغرفة بدقة (BTU) وفقاً للمساحة، الارتفاع، الدور الأخير والشمس المباشرة، واحصل على التوصية الهندسية المعتمدة مع نسبة التوفير في فاتورة الكهرباء شهرياً.
            </p>

            <div className="pt-2">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-sm"
              >
                <Calculator size={18} />
                <span>ابدأ الحساب الآن مجاناً</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block absolute end-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <Wind size={260} />
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE AL-MANAR (من واقع ملف الشركة والعرض التقديمي) */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-manar-700 uppercase bg-blue-50 px-3 py-1 rounded-full">
            معايير الجودة والتميز
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            لماذا تختار شركة المنار للتوكيلات التجارية؟
          </h2>
          <p className="text-xs text-slate-500">
            "التميز ليس فعلاً، بل هو عادة" - شريككم الموثوق في حلول التكييف المتكاملة والتوريدات العامة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-start space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-manar-700 flex items-center justify-center font-bold">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-bold text-base text-slate-900">ضمان حقيقي ودعم فني مستمر</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              نضمن جميع منتجاتنا وخدماتنا بالضمان الرسمي للوكالات مع توفير دعم فني هندسي ما بعد البيع وقطع غيار أصلية لجميع الماركات العالمية.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-start space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyanWater-700 flex items-center justify-center font-bold">
              <Zap size={26} />
            </div>
            <h3 className="font-bold text-base text-slate-900">سرعة التنفيذ والالتزام الزمني</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              نلتزم بالجداول الزمنية بدقة متناهية في التوريد والتركيب، سواء للوحدات المنزلية أو للمشروعات الكبرى والمصانع في المناطق الصناعية بأسيوط.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-start space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award size={26} />
            </div>
            <h3 className="font-bold text-base text-slate-900">أسعار تنافسية وتسهيلات كبرى</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              نقدم أفضل قيمة مقابل السعر مع تسهيلات متميزة في السداد للشركات والمصانع، بالإضافة إلى قنوات الدفع اللحظي عبر انستاباي وفودافون كاش.
            </p>
          </div>
        </div>
      </section>

      {/* 7. SHOWROOM LOCATION & CONTACT TEASER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-2 text-manar-700 font-bold text-sm">
              <Phone size={16} />
              <span>يسعدنا تواصلكم وزيارتكم بمعرضنا في أسيوط</span>
            </div>
            <p className="text-xs text-slate-600">
              أسيوط - أول شارع التجنيد من شارع الجمهورية - أمام بنك الإمارات دبي الوطني (Emirates NBD)
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono font-bold text-slate-800 pt-1" dir="ltr">
              <span>📞 01119461111</span>
              <span>📞 01114961111</span>
              <span>🚨 طوارئ: 01119641111</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:01119461111"
              className="bg-manar-700 hover:bg-manar-800 text-white font-bold px-5 py-3 rounded-xl text-xs shadow transition"
            >
              اتصال هاتفي مباشر
            </a>
            <a
              href="https://wa.me/201119461111"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow transition"
            >
              واتساب فوري
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
