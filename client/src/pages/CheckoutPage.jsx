import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import {
  CreditCard, Smartphone, Building, Truck, Copy,
  Check, Upload, AlertCircle, FileText, ShieldCheck,
  ArrowRight, Phone, CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings for wallets & banking
  const [settings, setSettings] = useState({
    active_instapay_ipa: 'almanar@instapay',
    active_vodafone_cash: '01119461111',
    active_vodafone_cash_owner: 'شركة المنار للتوكيلات التجارية',
    bank_name: 'Banque Misr (بنك مصر - فرع أسيوط)',
    bank_account_holder: 'شركة المنار للتوكيلات التجارية',
    bank_swift: 'BMISEGCX140',
    bank_iban: 'EG710002057805780001000002280'
  });

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('أسيوط - ');
  const [city, setCity] = useState('أسيوط');
  const [notes, setNotes] = useState('');

  // Payment method: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('instapay');

  // Proof data
  const [senderHandle, setSenderHandle] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [copiedKey, setCopiedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await axios.get('/api/settings');
        if (res.data.success) {
          setSettings(prev => ({ ...prev, ...res.data.settings }));
        }
      } catch (err) {
        console.warn('Failed to load store settings:', err.message);
      }
    }
    loadSettings();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الملف كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    setReceiptFile(file);
    setError('');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setError('يرجى استكمال بيانات التوصيل ورقم الهاتف');
      return;
    }

    if (items.length === 0) {
      setError('السلة فارغة!');
      return;
    }

    // If online wallet / proof required
    if (['instapay', 'vodafone_cash', 'bank_transfer'].includes(paymentMethod)) {
      if (!senderHandle.trim() || !refNumber.trim()) {
        setError('يرجى إدخال رقم/حساب المحول ورقم العملية المرجعي لتأكيد الدفع');
        return;
      }
      if (!receiptFile) {
        setError('يرجى إرفاق صورة إشعار أو لقطة شاشة التحويل (JPG, PNG, PDF)');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        city,
        payment_method: paymentMethod,
        notes,
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity
        }))
      };

      const orderRes = await axios.post('/api/orders', orderPayload);
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.error || 'فشل تسجيل الطلب');
      }

      const createdOrder = orderRes.data.order;

      // 2. Upload payment receipt if applicable
      if (['instapay', 'vodafone_cash', 'bank_transfer'].includes(paymentMethod) && receiptFile) {
        const formData = new FormData();
        formData.append('order_id', createdOrder.id);
        formData.append('method', paymentMethod);
        formData.append('sender_number_or_handle', senderHandle.trim());
        formData.append('reference_number', refNumber.trim());
        formData.append('receipt', receiptFile);

        await axios.post('/api/payments/upload-receipt', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {
        // ignore
      }

      // Clear cart & Navigate
      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err) {
      console.error('Order checkout error:', err);
      setError(err.response?.data?.error || err.message || 'حدث خطأ أثناء إتمام الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4 text-start">
        <h1 className="text-2xl font-black text-slate-900">إتمام الشراء وقنوات الدفع</h1>
        <p className="text-xs text-slate-500">
          استكمل بيانات الشحن والتوصيل وحدد طريقة السداد المعتمدة لشركة المنار
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-start">
        {/* Left Form (Delivery & Payment Details) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Customer & Delivery Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-manar-700 text-white flex items-center justify-center text-xs">1</span>
              <span>بيانات العميل ومكان التوصيل داخل محافظة أسيوط</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">الاسم ثلاثي أو اسم المنشأة:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: د. أحمد حسن عبد العال"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رقم الهاتف الأساسي:</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-manar-500"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">عنوان التوصيل والتركيب بالتفصيل:</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="أسيوط - شارع الجمهورية أو التجنيد أو النميس - برج رقم... شقة..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">ملاحظات التوصيل أو مواعيد التواجد:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى التوصيل في الفترة المسائية بعد 4 عصراً"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-manar-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-manar-700 text-white flex items-center justify-center text-xs">2</span>
              <span>اختر طريقة الدفع المناسبة</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* InstaPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-4 rounded-2xl border text-start transition flex items-start gap-3 ${
                  paymentMethod === 'instapay'
                    ? 'border-manar-600 bg-blue-50/70 ring-2 ring-manar-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  IPA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">انستاباي (InstaPay)</h4>
                  <p className="text-[11px] text-slate-500">تحويل لحظي مباشر لحساب الشركة</p>
                </div>
              </button>

              {/* Vodafone Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone_cash')}
                className={`p-4 rounded-2xl border text-start transition flex items-start gap-3 ${
                  paymentMethod === 'vodafone_cash'
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">فودافون كاش (Vodafone Cash)</h4>
                  <p className="text-[11px] text-slate-500">تحويل من أي محفظة إلكترونية</p>
                </div>
              </button>

              {/* Banque Misr Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-2xl border text-start transition flex items-start gap-3 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">تحويل بنكي (بنك مصر)</h4>
                  <p className="text-[11px] text-slate-500">سويفت وآيبان حساب الوكالة الرسمي</p>
                </div>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-start transition flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">الدفع عند الاستلام (COD)</h4>
                  <p className="text-[11px] text-slate-500">المعاينة والاستلام من الفني بأسيوط</p>
                </div>
              </button>
            </div>

            {/* Dynamic Gateway Guides & Account Details */}
            {paymentMethod === 'instapay' && (
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">عنوان الدفع اللحظي في انستاباي (InstaPay IPA):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.active_instapay_ipa, 'ipa')}
                    className="text-[11px] bg-purple-700 hover:bg-purple-800 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition"
                  >
                    {copiedKey === 'ipa' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'ipa' ? 'تم النسخ!' : 'نسخ العنوان'}</span>
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-200 font-mono font-bold text-purple-900 text-sm" dir="ltr">
                  {settings.active_instapay_ipa}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-purple-800 text-[11px]">
                  <li>افتح تطبيق انستاباي على هاتفك.</li>
                  <li>اختر تحويل إلى عنوان دفع لحظي (IPA) وأدخل <strong>{settings.active_instapay_ipa}</strong>.</li>
                  <li>تأكد من ظهور اسم الحساب: <strong>شركة المنار للتوكيلات التجارية</strong>.</li>
                  <li>أدخل المبلغ المطلوب: <strong>{totalAmount.toLocaleString()} ج.م</strong> وأتمم التحويل.</li>
                  <li>التقط لقطة شاشة للإيصال وارفعها بالأسفل مع رقم العملية.</li>
                </ol>
              </div>
            )}

            {paymentMethod === 'vodafone_cash' && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900">رقم محفظة فودافون كاش المعتمدة:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.active_vodafone_cash, 'vf')}
                    className="text-[11px] bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition"
                  >
                    {copiedKey === 'vf' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'vf' ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-red-200 font-mono font-bold text-red-700 text-base" dir="ltr">
                  {settings.active_vodafone_cash}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-red-800 text-[11px]">
                  <li>اطلب كود التحويل <code className="bg-white px-1 rounded font-bold" dir="ltr">*9*7*{settings.active_vodafone_cash}*{totalAmount}#</code> أو من تطبيق "أنا فودافون".</li>
                  <li>المستلم المسجل: <strong>{settings.active_vodafone_cash_owner}</strong>.</li>
                  <li>احتفظ برسالة التأكيد ورقم العملية وقم برفع صورة الرسالة بالأسفل.</li>
                </ol>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-3 animate-in fade-in">
                <span className="font-bold text-amber-900 block">بيانات التحويل البنكي المعتمد (بنك مصر):</span>
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">اسم الحساب:</span>
                    <span className="font-bold text-slate-800">{settings.bank_account_holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">كود السويفت (Swift):</span>
                    <code className="font-mono font-bold text-manar-700">{settings.bank_swift}</code>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-slate-500">رقم الآيبان (IBAN):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bank_iban, 'iban')}
                      className="text-[10px] text-amber-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Copy size={11} />
                      <span>{copiedKey === 'iban' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <code className="block bg-slate-50 p-1.5 rounded font-mono text-[11px] text-slate-800 break-all" dir="ltr">
                    {settings.bank_iban}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Proof Submission (If Offline Electronic Payment) */}
          {['instapay', 'vodafone_cash', 'bank_transfer'].includes(paymentMethod) && (
            <div className="bg-white p-6 rounded-3xl border-2 border-cyanWater-500/60 shadow-md space-y-4 animate-in fade-in">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyanWater-600 text-white flex items-center justify-center text-xs">3</span>
                <span>بيانات وإثبات عملية التحويل (إجباري)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    {paymentMethod === 'instapay'
                      ? 'عنوان / اسم حساب انستاباي المحول منه:'
                      : 'رقم هاتف المحفظة التي قمت بالتحويل منها:'}
                  </label>
                  <input
                    type="text"
                    value={senderHandle}
                    onChange={(e) => setSenderHandle(e.target.value)}
                    placeholder={paymentMethod === 'instapay' ? 'ahmed@instapay' : '01012345678'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-manar-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">رقم مرجع العملية (Sequence / Ref ID):</label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="مثال: IP-948201 أو رقم العملية من الرسالة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-manar-500"
                    required
                  />
                </div>
              </div>

              {/* File Attachment Upload */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 text-xs block">
                  صورة إيصال أو لقطة شاشة التحويل (JPG, PNG, WebP أو PDF - حد أقصى 5 ميجابايت):
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-manar-500 rounded-2xl p-6 text-center bg-slate-50 hover:bg-blue-50/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                  {filePreview ? (
                    <div className="space-y-2">
                      <img src={filePreview} alt="Receipt preview" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        تم اختيار الملف: {receiptFile?.name}
                      </span>
                    </div>
                  ) : receiptFile ? (
                    <div className="space-y-1 text-manar-700">
                      <FileText size={32} className="mx-auto" />
                      <span className="text-xs font-bold block">{receiptFile.name}</span>
                      <span className="text-[10px] text-slate-400">انقر للتغيير</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500">
                      <Upload size={32} className="mx-auto text-manar-600" />
                      <span className="text-xs font-bold block text-slate-700">اسحب الإيصال هنا أو انقر للاختيار</span>
                      <span className="text-[10px] text-slate-400 block">يقبل صيغ الصور و PDF حتى 5 ميجابايت</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary & Submit */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            ملخص الفاتورة والدفع
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-xs text-slate-700">
                <span className="line-clamp-1">{quantity}x {product.title_ar}</span>
                <span className="font-bold shrink-0 ms-2">
                  {((product.discount_price || product.price) * quantity).toLocaleString()} ج.م
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>قيمة المنتجات:</span>
              <span className="font-bold">{totalAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>التوصيل والمعاينة بأسيوط:</span>
              <span>مجاناً</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>المبلغ الإجمالي:</span>
              <span className="text-manar-700 text-lg">{totalAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>معاملة آمنة وموثقة</span>
            </div>
            <p>يتم إصدار إشعار وفاتورة رسمية معتمدة برقم السجل التجاري والبطاقة الضريبية.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-manar-700 hover:bg-manar-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>جاري إرسال الطلب وإثبات الدفع...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>تأكيد الطلب وإرسال إشعار الدفع</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
