import React, { useState } from 'react';
import axios from 'axios';
import {
  Calculator, Wind, Zap, CheckCircle, ShoppingCart,
  ArrowRight, Sparkles, AlertCircle, Sun, Users, Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CalculatorPage() {
  const { addToCart } = useCart();

  const [form, setForm] = useState({
    length: 4.5,
    width: 3.5,
    height: 2.8,
    is_top_floor: false,
    sun_exposure: 'normal',
    occupants_count: 2,
    has_large_glass: false,
    daily_usage_hours: 8
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/calculator/ac-room', form);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-manar-900 to-manar-800 text-white rounded-3xl p-8 shadow-xl text-start relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
            <Calculator size={14} />
            <span>حاسبة الأحمال الحرارية الهندسية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            حاسبة قدرة التكييف المناسب للغرفة (BTU / حصان)
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            وفقاً للمعايير الهندسية المعتمدة لطقس محافظة أسيوط وصعيد مصر الحار. أدخل أبعاد الغرفة ومواصفاتها لتحصل فوراً على القدرة الدقيقة ونوع الجهاز الموصى به لتوفير الكهرباء.
          </p>
        </div>

        <div className="hidden md:block absolute end-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
          <Wind size={200} />
        </div>
      </div>

      {/* Calculator Form */}
      <form onSubmit={handleCalculate} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-start">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers size={18} className="text-manar-600" />
          <span>بيانات وأبعاد المساحة المراد تكييفها</span>
        </h2>

        {/* Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">طول الغرفة (بالمتر):</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="30"
              value={form.length}
              onChange={(e) => setForm({ ...form, length: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">عرض الغرفة (بالمتر):</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="30"
              value={form.width}
              onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ارتفاع السقف (الافتراضي 2.8م):</label>
            <input
              type="number"
              step="0.1"
              min="2.2"
              max="6"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-manar-500"
              required
            />
          </div>
        </div>

        {/* Environmental Factors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Sun Exposure */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sun size={14} className="text-amber-500" />
              <span>طبيعة التعرض للشمس:</span>
            </label>
            <select
              value={form.sun_exposure}
              onChange={(e) => setForm({ ...form, sun_exposure: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="low">مظلل بالكامل / لا تصله شمس مباشرة</option>
              <option value="normal">متوسط / شمس صباحية خفيفة</option>
              <option value="high_sun">شديد / واجهة غربية أو قبلية مع شمس مستمرة</option>
            </select>
          </div>

          {/* Occupants & Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-blue-500" />
                <span>عدد الأفراد المعتاد:</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.occupants_count}
                onChange={(e) => setForm({ ...form, occupants_count: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-center"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-500" />
                <span>ساعات التشغيل يومياً:</span>
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={form.daily_usage_hours}
                onChange={(e) => setForm({ ...form, daily_usage_hours: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-center"
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
            <input
              type="checkbox"
              checked={form.is_top_floor}
              onChange={(e) => setForm({ ...form, is_top_floor: e.target.checked })}
              className="w-4 h-4 text-manar-600 rounded"
            />
            <span className="text-xs font-semibold text-slate-800">
              الغرفة بالدور الأخير (السقف معرّض للشمس مباشرة دون عزل)
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-blue-50/50 transition">
            <input
              type="checkbox"
              checked={form.has_large_glass}
              onChange={(e) => setForm({ ...form, has_large_glass: e.target.checked })}
              className="w-4 h-4 text-manar-600 rounded"
            />
            <span className="text-xs font-semibold text-slate-800">
              يوجد واجهات زجاجية كبيرة أو أبواب ألوميتال غير معزولة
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[260px] bg-manar-700 hover:bg-manar-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <Calculator size={18} />
            <span>{loading ? 'جاري الحساب الهندسي...' : 'احسب القدرة والتوصية الهندسية'}</span>
          </button>
        </div>
      </form>

      {/* Result Display Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
          {/* Engineering Recommendation Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-manar-500 rounded-3xl p-6 sm:p-8 shadow-lg text-start space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-4">
              <div>
                <span className="text-xs font-bold text-manar-700 uppercase">التقرير الهندسي المعتمد</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {result.calculation.hp_label}
                </h3>
              </div>
              <div className="text-end">
                <span className="text-xs text-slate-500 block">إجمالي الحمل الحراري:</span>
                <span className="text-lg font-black text-manar-700">
                  {result.calculation.required_btu?.toLocaleString()} BTU/hr
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px]">مساحة الغرفة:</span>
                <span className="font-bold text-slate-900 text-sm">{result.calculation.room_area} م²</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px]">حجم الهواء:</span>
                <span className="font-bold text-slate-900 text-sm">{result.calculation.room_volume} م³</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px]">نطاق التغطية:</span>
                <span className="font-bold text-slate-900 text-xs">{result.calculation.hp_range_desc}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-500 block text-[11px]">النطاق المناخي:</span>
                <span className="font-bold text-amber-700 text-xs">أسيوط (صعيد مصر)</span>
              </div>
            </div>

            {/* Inverter Energy Advice */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <Zap size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">توصية توفير استهلاك الكهرباء:</strong>
                <span>{result.calculation.energy_advice}</span>
              </div>
            </div>
          </div>

          {/* Matching Products In Stock */}
          {result.matching_products && result.matching_products.length > 0 && (
            <div className="space-y-4 text-start">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>أفضل الأجهزة المتوفرة بمخزن ومعرض أسيوط والمطابقة لحساباتك:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.matching_products.map((p) => {
                  const mainImg = p.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80';
                  const isAdded = addedId === p.id;
                  const price = p.discount_price || p.price;

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition p-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-40 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                          <img src={mainImg} alt={p.title_ar} className="w-full h-full object-cover" />
                          {p.brand_name && (
                            <span className="absolute top-2 start-2 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              {p.brand_name}
                            </span>
                          )}
                          {p.is_inverter === 1 && (
                            <span className="absolute top-2 end-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                              <Zap size={10} />
                              <span>انفرتر</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                            <Link to={`/catalog/${p.id}`} className="hover:text-manar-700">
                              {p.title_ar}
                            </Link>
                          </h4>
                          <span className="text-[11px] font-black text-manar-700 block mt-1">
                            {price.toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                        <Link
                          to={`/catalog/${p.id}`}
                          className="text-xs text-slate-500 hover:text-manar-700 font-semibold"
                        >
                          المواصفات
                        </Link>
                        <button
                          onClick={() => handleAddToCart(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isAdded ? 'bg-emerald-600 text-white' : 'bg-manar-700 text-white hover:bg-manar-800'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle size={12} />
                              <span>تمت الإضافة</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={12} />
                              <span>شراء</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
