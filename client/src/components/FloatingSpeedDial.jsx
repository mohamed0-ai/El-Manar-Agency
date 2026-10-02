import React, { useState } from 'react';
import { Phone, MessageCircle, X, Headphones, AlertTriangle } from 'lucide-react';

export default function FloatingSpeedDial() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 start-6 z-40 flex flex-col items-start gap-2.5">
      {/* Speed Dial Options Menu */}
      {isOpen && (
        <div className="flex flex-col gap-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-slate-200 transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          <div className="text-[11px] font-bold text-slate-500 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
            <Headphones size={13} className="text-manar-600" />
            <span>خدمة عملاء شركة المنار (أسيوط)</span>
          </div>

          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/201119461111?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D9%88%D8%A3%D8%AC%D9%87%D8%B2%D8%A9%20%D8%B4%D8%B1%D9%83%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MessageCircle size={16} />
            <div className="flex flex-col text-start leading-tight">
              <span>محادثة واتساب مباشرة</span>
              <span className="text-[10px] opacity-90" dir="ltr">01119461111</span>
            </div>
          </a>

          {/* Primary Call: 01119461111 */}
          <a
            href="tel:01119461111"
            className="flex items-center gap-2.5 px-3 py-2 bg-manar-700 hover:bg-manar-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Phone size={15} />
            <div className="flex flex-col text-start leading-tight">
              <span>اتصال هاتفي (الخط الرئيسي)</span>
              <span className="text-[10px] opacity-90" dir="ltr">01119461111</span>
            </div>
          </a>

          {/* Secondary Call: 01114961111 */}
          <a
            href="tel:01114961111"
            className="flex items-center gap-2.5 px-3 py-2 bg-cyanWater-600 hover:bg-cyanWater-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Phone size={15} />
            <div className="flex flex-col text-start leading-tight">
              <span>خدمة العملاء والتوكيلات</span>
              <span className="text-[10px] opacity-90" dir="ltr">01114961111</span>
            </div>
          </a>

          {/* Emergency HVAC Dispatch: 01119641111 */}
          <a
            href="tel:01119641111"
            className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <AlertTriangle size={15} />
            <div className="flex flex-col text-start leading-tight">
              <span>طوارئ الصيانة والتكييف 24/7</span>
              <span className="text-[10px] font-mono" dir="ltr">01119641111</span>
            </div>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-manar-700 to-cyanWater-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition border-2 border-white ring-4 ring-manar-200"
        title="تواصل سريع مع شركة المنار"
        aria-label="تواصل سريع"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <div className="relative">
            <Phone size={24} className="animate-pulse" />
            <span className="absolute -top-1 -end-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
          </div>
        )}
      </button>
    </div>
  );
}
