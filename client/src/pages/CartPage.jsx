import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, itemCount } = useCart();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 text-manar-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingCart size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">سلة المشتريات فارغة</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          لم تقم بإضافة أي أجهزة تكييف أو فلاتر مياه إلى سلتك بعد. تصفح الكتالوج واختر ما يناسبك!
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 bg-manar-700 hover:bg-manar-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
        >
          <span>تصفح الكتالوج الآن</span>
          <ArrowLeft size={16} className={lang === 'en' ? 'rotate-180' : ''} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">سلة المشتريات</h1>
          <p className="text-xs text-slate-500">لديك ({itemCount}) عناصر في السلة جاهزة للطلب</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
        >
          تفريغ السلة بالكامل
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => {
            const price = product.discount_price || product.price;
            const itemTotal = price * quantity;
            const mainImg = product.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-start"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={mainImg}
                    alt={product.title_ar}
                    className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] text-cyanWater-700 font-bold block">
                      {product.brand_name || 'Al-Manar'}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                      <Link to={`/catalog/${product.id}`} className="hover:text-manar-700">
                        {product.title_ar}
                      </Link>
                    </h3>
                    <div className="text-xs font-black text-manar-700">
                      {price.toLocaleString()} ج.م للقطعة
                    </div>
                  </div>
                </div>

                {/* Quantity & Item Total & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-start sm:text-end">
                    <span className="text-xs text-slate-400 block text-[10px]">الإجمالي:</span>
                    <span className="text-sm font-black text-slate-900">
                      {itemTotal.toLocaleString()} ج.م
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                    title="حذف من السلة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-start">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            ملخص الطلب
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>إجمالي قيمة المنتجات:</span>
              <span className="font-bold text-slate-800">{totalAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>مصاريف الشحن والتوصيل (أسيوط):</span>
              <span className="font-bold">مجاناً</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
              <span className="font-bold text-slate-900">المبلغ الإجمالي المستحق:</span>
              <span className="font-black text-manar-700 text-base">{totalAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-[11px] text-manar-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-manar-600" />
              <span>طرق الدفع المتاحة:</span>
            </div>
            <p>انستاباي (InstaPay) • فودافون كاش • تحويل بنكي (بنك مصر) • الدفع عند الاستلام</p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-manar-700 hover:bg-manar-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>متابعة الشراء وتحديد طريقة الدفع</span>
            <ArrowLeft size={16} className={lang === 'en' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
