import React, { useState } from 'react';
import axios from 'axios';
import {
  Wrench, ShieldCheck, Phone, CheckCircle, Clock,
  Calendar, MapPin, AlertTriangle, Layers, Award,
  Sparkles, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ServicesPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    customer_name: user?.full_name || '',
    customer_phone: user?.phone || '',
    address: 'أسيوط - ',
    city: 'أسيوط',
    service_type: 'copper_piping_extension',
    brand_id: '',
    copper_meters: 5,
    ac_units_count: 1,
    notes: '',
    preferred_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const copperRate = 1150; // EGP per meter
  const standardInstall = 800; // EGP per AC

  const calculateEstimate = () => {
    if (form.service_type === 'copper_piping_extension') {
      return (Number(form.copper_meters) || 0) * copperRate;
    }
    if (form.service_type === 'ac_installation') {
      return ((Number(form.ac_units_count) || 1) * standardInstall) + ((Number(form.copper_meters) || 0) * copperRate);
    }
    if (form.service_type === 'annual_contract') {
      return 13500;
    }
    if (form.service_type === 'emergency_repair') {
      return 450;
    }
    if (form.service_type === 'water_filter_maintenance') {
      return 350;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/services', form);
      if (res.data.success) {
        setSuccessData(res.data.service);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'فشل تسجيل طلب الخدمة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-manar-900 to-cyanWater-800 text-white rounded-3xl p-8 shadow-xl text-start relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
            <Wrench size={14} />
            <span>الحلول الهندسية والصيانة المعتمدة</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black">
            خدمات التركيب، تمديد النحاس، وعقود الصيانة الوقائية
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            فريق هندسي متخصص في تمديد شبكات مواسير النحاس الجنوب إفريقي والأمريكي المعتمدة، تركيب كافة أنواع أجهزة التكييف والكونسيلد، وعقود الصيانة السنوية للمصانع والشركات الكبرى بمحافظة أسيوط.
          </p>
        </div>
      </div>

      {/* Booking Form or Success Confirmation */}
      {successData ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              تم تسجيل طلب الخدمة الهندسية بنجاح!
            </h2>
            <p className="text-xs text-slate-500">
              سيتواصل معكم مهندس الدعم الفني وتنسيق المواعيد لتأكيد موعد الزيارة ومعاينة الموقع.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="max-w-md mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3 text-start">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500">رقم طلب الخدمة (الكود):</span>
              <span className="font-mono font-bold text-manar-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                {successData.request_code}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500">نوع الخدمة:</span>
              <span className="font-bold text-slate-800">{successData.service_type}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500">التكلفة التقديرية المبدئية:</span>
              <span className="font-black text-emerald-700 text-sm">
                {successData.estimated_cost?.toLocaleString()} ج.م
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>حالة الطلب:</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                قيد إسناد الفني المختص
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setSuccessData(null)}
              className="bg-manar-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-manar-800 transition"
            >
              تسجيل طلب جديد
            </button>
            <a
              href="tel:01119461111"
              className="bg-slate-100 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-200 transition"
            >
              اتصال بالطوارئ: 01119461111
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-start">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              اختر نوع الخدمة الهندسية أو الصيانة المطلوبة:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                {
                  id: 'copper_piping_extension',
                  title: 'تمديد مواسير نحاس جنوب إفريقي بالمتر',
                  desc: 'مواسير نحاس أصلية 99.9% + عازل أرمفليكس وكابلات سويدي',
                  icon: Layers
                },
                {
                  id: 'ac_installation',
                  title: 'فك ونقل وتركيب تكييف',
                  desc: 'تثبيت حوامل، وزن دقيق بميزان مياه، وتفريغ هواء الفاكيوم',
                  icon: Wrench
                },
                {
                  id: 'annual_contract',
                  title: 'عقد صيانة سنوي وقائي للمصانع والشركات',
                  desc: 'زيارات دورية ربع سنوية، غسيل كيميائي، وضبط ضغوط الفريون',
                  icon: ShieldCheck
                },
                {
                  id: 'water_filter_maintenance',
                  title: 'صيانة وتغيير شمعات فلاتر مياه (RO)',
                  desc: 'طقم شمعات أمريكي تايواني، قياس الأملاح TDS وفحص المضخة',
                  icon: Award
                },
                {
                  id: 'emergency_repair',
                  title: 'طوارئ أعطال التكييف والتبريد 24/7',
                  desc: 'استجابة سريعة للأعطال المفاجئة في المنازل والمستشفيات',
                  icon: AlertTriangle
                }
              ].map((s) => {
                const Icon = s.icon;
                const isSelected = form.service_type === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, service_type: s.id })}
                    className={`p-4 rounded-2xl border text-start transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-manar-600 bg-blue-50/70 ring-2 ring-manar-200'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-manar-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <h4 className="font-bold text-slate-900">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Fields: Meters & Units */}
          {(form.service_type === 'copper_piping_extension' || form.service_type === 'ac_installation') && (
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-amber-900 block">
                  عدد أمتار تمديد النحاس المطلوبة:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.copper_meters}
                    onChange={(e) => setForm({ ...form, copper_meters: Number(e.target.value) })}
                    className="w-24 bg-white border border-amber-300 rounded-lg px-3 py-1.5 font-bold text-center"
                  />
                  <span className="text-slate-600">متر (سعر المتر: {copperRate} ج.م)</span>
                </div>
              </div>

              {form.service_type === 'ac_installation' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-amber-900 block">
                    عدد أجهزة التكييف:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.ac_units_count}
                    onChange={(e) => setForm({ ...form, ac_units_count: Number(e.target.value) })}
                    className="w-24 bg-white border border-amber-300 rounded-lg px-3 py-1.5 font-bold text-center"
                  />
                </div>
              )}
            </div>
          )}

          {/* Customer & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">اسم العميل / اسم المنشأة أو المصنع:</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="مثال: د. أحمد حسن أو شركة مواد البناء"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">رقم الهاتف للتواصل وتأكيد الموعد:</label>
              <input
                type="tel"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="مثال: 01012345678"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-manar-500"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">العنوان بالتفصيل داخل محافظة أسيوط:</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="مثال: أسيوط - شارع الجمهورية - برج الصفا الدور الرابع"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">الموعد والتاريخ المفضل للزيارة والمعاينة:</label>
              <input
                type="datetime-local"
                value={form.preferred_date}
                onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">التكلفة التقديرية المحتسبة:</label>
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-black text-manar-700 text-sm flex items-center justify-between">
                <span>الإجمالي التقديري:</span>
                <span>{calculateEstimate().toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">ملاحظات فنية إضافية:</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="اكتب أي متطلبات خاصة (نوع الجهاز، طبيعة المكان، مشاكل التبريد السابقة)..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-manar-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[280px] bg-manar-700 hover:bg-manar-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <Wrench size={18} />
              <span>{loading ? 'جاري تسجيل الطلب...' : 'تأكيد حجز الخدمة الهندسية'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
