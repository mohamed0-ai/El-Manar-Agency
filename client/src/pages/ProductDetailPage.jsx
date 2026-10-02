import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck, Zap, Truck, CheckCircle, ShoppingCart,
  ArrowRight, Phone, Wrench, Layers, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [added, setAdded] = useState(false);
  const [copperMeters, setCopperMeters] = useState(3); // standard default installation comes with 3m

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await axios.get(`/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setActiveImage(res.data.product.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-manar-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">جاري تحميل تفاصيل الجهاز والمواصفات الفنية...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">المنتج غير موجود أو تم حذفه</h2>
        <Link to="/catalog" className="inline-block bg-manar-700 text-white text-xs font-bold px-4 py-2 rounded-lg">
          العودة للكتالوج
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const price = product.discount_price || product.price;
  const isAc = product.category_id === 1 || product.horsepower;
  const copperRate = 1150; // EGP per extra meter

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/" className="hover:text-manar-700">الرئيسية</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-manar-700">الكتالوج</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{product.title_ar}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Left / Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-4 relative">
            <img
              src={activeImage}
              alt={product.title_ar}
              className="max-h-full max-w-full object-contain"
            />
            {product.is_inverter === 1 && (
              <span className="absolute top-4 start-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1.5">
                <Zap size={14} />
                <span>انفرتر موفر للكهرباء حتى 50%</span>
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-manar-600 ring-2 ring-manar-200' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right / Info & Actions */}
        <div className="lg:col-span-6 space-y-6 text-start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyanWater-700 bg-cyan-50 px-2.5 py-1 rounded-md">
                {product.category_name_ar}
              </span>
              {product.brand_name && (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  وكيل معتمد: {product.brand_name}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.title_ar}
            </h1>
            <p className="text-xs text-slate-400 font-mono" dir="ltr">
              {product.title_en}
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">السعر النقدي المعتمد:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-manar-700">
                  {price.toLocaleString()} ج.م
                </span>
                {product.discount_price && (
                  <span className="text-sm text-slate-400 line-through">
                    {product.price.toLocaleString()} ج.م
                  </span>
                )}
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={14} />
                <span>متوفر بالمعرض والمخزن</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">توصيل وتركيب فوري بأسيوط</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>{product.description_ar}</p>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <ShieldCheck size={20} className="text-manar-600 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900">ضمان معتمد {product.warranty_years || 5} سنوات</span>
                <span className="text-[10px] text-slate-500">من الوكيل الرسمي مباشرة</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <Truck size={20} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900">توريد وتركيب أسيوط</span>
                <span className="text-[10px] text-slate-500">بواسطة طاقم هندسي متخصص</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 font-bold hover:bg-slate-200 transition text-sm"
                >
                  -
                </button>
                <span className="px-4 py-2.5 text-xs font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 font-bold hover:bg-slate-200 transition text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow ${
                  added ? 'bg-emerald-600 text-white' : 'bg-manar-700 hover:bg-manar-800 text-white'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircle size={16} />
                    <span>تمت الإضافة للسلة بنجاح!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>إضافة إلى سلة المشتريات</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-5 rounded-xl text-xs shadow transition shrink-0"
              >
                شراء فوري
              </button>
            </div>
          </div>

          {/* Copper Pipe Calculator Extension Box (If HVAC) */}
          {isAc && (
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <div className="flex items-center gap-1.5">
                  <Wrench size={15} />
                  <span>حساب تكلفة تمديد مواسير النحاس الإضافية:</span>
                </div>
                <span className="text-[11px] font-mono">{copperRate} ج.م / للمتر</span>
              </div>
              <p className="text-[11px] text-amber-800">
                مواسير نحاس جنوب إفريقي نقية 100%، عازل أرمفليكس كثافة عالية، وكابلات كهربائية سويدي أصلية.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <label className="text-[11px] font-bold text-slate-700">الأمتار المطلوبة:</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={copperMeters}
                  onChange={(e) => setCopperMeters(Math.max(0, Number(e.target.value) || 0))}
                  className="w-16 bg-white border border-amber-300 rounded px-2 py-1 text-center font-bold"
                />
                <span className="text-[11px] font-bold text-slate-700">
                  = {(copperMeters * copperRate).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications & Technical Details Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-start">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers size={18} className="text-manar-600" />
            <span>المواصفات الفنية والهندسية المعتمدة</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{k}</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
