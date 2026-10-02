import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Building, ShieldCheck,
  CreditCard, Award, ExternalLink
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-manar-900 text-slate-300 pt-14 pb-8 border-t-4 border-cyanWater-500">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Company Profile & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="شركة المنار للتوكيلات التجارية"
                className="h-14 w-auto bg-white p-1 rounded-xl object-contain"
                onError={(e) => {
                  e.target.src = '/logo.jpg';
                }}
              />
              <div>
                <h3 className="text-white font-black text-base leading-tight">
                  شركة المنار
                </h3>
                <p className="text-xs text-cyanWater-400 font-medium">
                  للتكييف وفلاتر المياه والتوكيلات التجارية
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              رواد الحلول الهندسية لأنظمة التكييف والتوريدات العامة في صعيد مصر. وكلاء وموزعون معتمدون لكبرى العلامات العالمية، متخصصون في توريد وتركيب وصيانة أنظمة التكييف المنزلي والمركزي VRF ومحطات تنقية المياه.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>سجل تجاري: <strong className="text-white">س.ت 92950</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} className="text-amber-400" />
                <span>بطاقة ضريبية: <strong className="text-white">ب.ض 231-091-057</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links & Services */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-b border-manar-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyanWater-400 rounded-full"></span>
              الأقسام والخدمات الرئيسية
            </h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <Link to="/catalog?category=air-conditioning" className="hover:text-cyanWater-300 transition">
                  أنظمة التكييف (سبليت - كونسيلد - VRF)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=water-purification" className="hover:text-cyanWater-300 transition">
                  فلاتر ومبردات المياه (RO 7 مراحل)
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=home-appliances" className="hover:text-cyanWater-300 transition">
                  الأجهزة الكهربائية وشاشات المؤتمرات
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=office-supplies" className="hover:text-cyanWater-300 transition">
                  المستلزمات والأثاث المكتبي المتكامل
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="hover:text-cyanWater-300 transition text-amber-300 font-semibold">
                  حاسبة قدرة التكييف المناسب للغرفة (BTU)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-cyanWater-300 transition">
                  عقود الصيانة السنوية وتمديد النحاس بالمتر
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Banque Misr Official Banking Credentials */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-b border-manar-800 pb-2 flex items-center gap-2">
              <CreditCard size={16} className="text-cyanWater-400" />
              الحساب البنكي المعتمد (بنك مصر)
            </h4>
            <div className="bg-manar-800/80 p-3.5 rounded-lg border border-manar-700 text-xs space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">اسم البنك والفرع:</span>
                <span className="text-white font-bold">Banque Misr (بنك مصر - فرع أسيوط)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">اسم صاحب الحساب:</span>
                <span className="text-white font-semibold">شركة المنار للتوكيلات التجارية</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">كود السويفت (Swift Code):</span>
                <code className="text-cyanWater-300 font-mono font-bold tracking-wider">BMISEGCX140</code>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">رقم الآيبان (IBAN):</span>
                <code className="text-amber-300 font-mono text-[10px] break-all block">
                  EG710002057805780001000002280
                </code>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Showroom Address */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-b border-manar-800 pb-2 flex items-center gap-2">
              <Phone size={16} className="text-cyanWater-400" />
              المقر والمعرض الرئيسي
            </h4>
            <ul className="text-xs space-y-3">
              <li className="flex items-start gap-2 text-slate-300 leading-snug">
                <MapPin size={16} className="text-cyanWater-400 shrink-0 mt-0.5" />
                <span>
                  أسيوط - أول شارع التجنيد من شارع الجمهورية - أمام بنك الإمارات دبي الوطني (Emirates NBD)، مدينة أسيوط، مصر.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-cyanWater-400 shrink-0" />
                <span className="text-slate-400">الخطوط الساخنة:</span>
                <div className="flex flex-col text-white font-bold" dir="ltr">
                  <a href="tel:01119461111" className="hover:text-cyanWater-300">01119461111</a>
                  <a href="tel:01114961111" className="hover:text-cyanWater-300">01114961111</a>
                  <a href="tel:01119641111" className="hover:text-cyanWater-300">01119641111</a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-cyanWater-400 shrink-0" />
                <a href="mailto:almanaragencies@gmail.com" className="hover:text-cyanWater-300 text-slate-200">
                  almanaragencies@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-manar-800">
              <span className="text-[11px] text-slate-400 block mb-1">قنوات الدفع المعتمدة:</span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="bg-manar-800 text-cyanWater-300 px-2 py-0.5 rounded border border-manar-700">InstaPay (IPA)</span>
                <span className="bg-manar-800 text-red-400 px-2 py-0.5 rounded border border-manar-700">Vodafone Cash</span>
                <span className="bg-manar-800 text-amber-300 px-2 py-0.5 rounded border border-manar-700">بنك مصر</span>
                <span className="bg-manar-800 text-slate-300 px-2 py-0.5 rounded border border-manar-700">الدفع عند الاستلام</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-manar-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية. جميع الحقوق محفوظة.
          </p>
          <p className="flex items-center gap-2">
            <span>الوكيل والموزع المعتمد لكبرى العلامات التجارية في أسيوط والصعيد</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
