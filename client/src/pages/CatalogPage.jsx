import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Filter, Search, Zap, ShieldCheck, CheckCircle,
  X, ChevronDown, RotateCcw, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  // Filters state from URL or defaults
  const activeCategory = searchParams.get('category') || '';
  const activeBrand = searchParams.get('brand') || '';
  const activeHp = searchParams.get('hp') || '';
  const activeInverter = searchParams.get('inverter') || '';
  const activeCooling = searchParams.get('cooling') || '';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'default';

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/brands')
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (brandRes.data.success) setBrands(brandRes.data.brands);
      } catch (err) {
        console.error('Failed to load categories/brands:', err);
      }
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory) params.set('category', activeCategory);
        if (activeBrand) params.set('brand', activeBrand);
        if (activeHp) params.set('horsepower', activeHp);
        if (activeInverter !== '') params.set('is_inverter', activeInverter);
        if (activeCooling) params.set('cooling_type', activeCooling);
        if (searchQuery) params.set('q', searchQuery);

        const res = await axios.get(`/api/products?${params.toString()}`);
        if (res.data.success) {
          let list = res.data.products;
          if (sortBy === 'price_asc') {
            list.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
          } else if (sortBy === 'price_desc') {
            list.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
          }
          setProducts(list);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeCategory, activeBrand, activeHp, activeInverter, activeCooling, searchQuery, sortBy]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const horsepowerOptions = [
    { val: '1.5', label: '1.5 حصان (حتى 14 م²)' },
    { val: '2.25', label: '2.25 حصان (15 - 22 م²)' },
    { val: '3', label: '3.0 حصان (23 - 30 م²)' },
    { val: '4', label: '4.0 حصان (31 - 40 م²)' },
    { val: '5', label: '5.0 حصان (41 - 55 م²)' },
    { val: '28', label: '28 حصان (VRF مركزي تجاري)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            كتالوج المنتجات والأجهزة المعتمدة
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تصفح أحدث أجهزة التكييف، فلاتر المياه RO، الأجهزة الكهربائية، والمستلزمات المكتبية بضمان رسمي
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="بحث بالاسم أو الماركة أو القدرة..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 ps-3 pe-10 text-xs focus:outline-none focus:border-manar-500 focus:bg-white transition"
          />
          <Search size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Filter size={16} className="text-manar-600" />
              <span>تصفية النتائج</span>
            </div>
            {(activeCategory || activeBrand || activeHp || activeInverter !== '' || activeCooling || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">الأقسام الرئيسية:</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-start px-2.5 py-1.5 rounded-lg transition ${
                  activeCategory === '' ? 'bg-manar-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                جميع الأقسام
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-start px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                    activeCategory === c.slug ? 'bg-manar-700 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name_ar}</span>
                  <span className="text-[10px] opacity-80">({c.products_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">العلامات التجارية المعتمدة:</label>
            <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('brand', '')}
                className={`w-full text-start px-2.5 py-1 rounded transition ${
                  activeBrand === '' ? 'bg-blue-50 text-manar-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                كل الماركات
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand', String(b.id))}
                  className={`w-full text-start px-2.5 py-1 rounded transition flex items-center justify-between ${
                    activeBrand === String(b.id) ? 'bg-blue-50 text-manar-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] text-slate-400">({b.products_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Horsepower Filter (For ACs) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">قدرة التكييف بالحصان (HP):</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateFilter('hp', '')}
                className={`w-full text-start px-2.5 py-1 rounded transition ${
                  activeHp === '' ? 'bg-blue-50 text-manar-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                كافة القدرات
              </button>
              {horsepowerOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => updateFilter('hp', opt.val)}
                  className={`w-full text-start px-2.5 py-1 rounded transition ${
                    activeHp === opt.val ? 'bg-blue-50 text-manar-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inverter Technology Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">تقنية الانفرتر الموفر:</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('inverter', activeInverter === '1' ? '' : '1')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                  activeInverter === '1'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Zap size={12} />
                <span>انفرتر فقط</span>
              </button>
            </div>
          </div>

          {/* Cooling Type Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">نظام التشغيل:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => updateFilter('cooling', activeCooling === 'cool_only' ? '' : 'cool_only')}
                className={`py-1.5 rounded-lg text-center font-bold border transition ${
                  activeCooling === 'cool_only'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                بارد فقط
              </button>
              <button
                onClick={() => updateFilter('cooling', activeCooling === 'cold_hot' ? '' : 'cold_hot')}
                className={`py-1.5 rounded-lg text-center font-bold border transition ${
                  activeCooling === 'cold_hot'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                بارد / ساخن
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-9 space-y-4">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="font-semibold text-slate-600">
              إجمالي المنتجات المطابقة: <strong className="text-slate-900">{products.length}</strong> منتج
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg py-1 px-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="default">الافتراضي (الأحدث)</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <AlertCircle size={40} className="mx-auto text-slate-400" />
              <h3 className="font-bold text-base text-slate-800">لا توجد منتجات مطابقة لخيارات البحث</h3>
              <p className="text-xs text-slate-500">جرب تقليل خيارات التصفية أو تغيير كلمات البحث</p>
              <button
                onClick={clearAllFilters}
                className="bg-manar-700 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-manar-800 transition"
              >
                عرض كل المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const mainImg = product.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
                const isAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="h-48 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                        <img
                          src={mainImg}
                          alt={product.title_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {product.brand_name && (
                          <span className="absolute top-2 start-2 bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {product.brand_name}
                          </span>
                        )}

                        {product.is_inverter === 1 && (
                          <span className="absolute top-2 end-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <Zap size={10} />
                            <span>انفرتر</span>
                          </span>
                        )}

                        {product.horsepower && (
                          <span className="absolute bottom-2 start-2 bg-manar-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {product.horsepower} حصان
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <span className="text-[11px] text-cyanWater-700 font-semibold block">
                          {product.category_name_ar}
                        </span>

                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-manar-700 transition">
                          <Link to={`/catalog/${product.id}`}>
                            {product.title_ar}
                          </Link>
                        </h3>

                        {product.specs?.room_area && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded">
                            المساحة: {product.specs.room_area}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <ShieldCheck size={12} />
                            <span>ضمان {product.warranty_years || 5} سنوات</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Cart Button */}
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
        </div>
      </div>
    </div>
  );
}
