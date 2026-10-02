import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle, Printer, FileText, ArrowLeft,
  ShieldCheck, Phone, MapPin, Building, Clock
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`/api/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-manar-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">جاري إصدار فاتورة وإشعار الطلب الرسمي...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">تعذر العثور على الطلب</h2>
        <Link to="/" className="inline-block bg-manar-700 text-white text-xs font-bold px-4 py-2 rounded-lg">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Top Controls (Hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/" className="text-xs font-bold text-manar-700 flex items-center gap-1 hover:underline">
          <ArrowLeft size={14} className="rotate-180" />
          <span>العودة للمتجر</span>
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer size={15} />
            <span>طباعة الفاتورة الرسمية</span>
          </button>
          <Link
            to="/customer"
            className="bg-manar-700 hover:bg-manar-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <span>متابعة الطلب في حسابي</span>
          </Link>
        </div>
      </div>

      {/* Printable Invoice / Voucher Document */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-8 text-start print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-manar-700 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Al-Manar Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.src = '/logo.jpg';
                }}
              />
              <div>
                <h1 className="text-lg font-black text-manar-800 leading-tight">
                  شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  رواد الحلول الهندسية وأنظمة التكييف والتوريدات العامة | أسيوط
                </p>
              </div>
            </div>
          </div>

          <div className="text-start sm:text-end text-xs space-y-1">
            <span className="bg-blue-50 text-manar-800 font-bold px-2.5 py-0.5 rounded inline-block">
              إشعار استلام وتأكيد طلب توريد
            </span>
            <div className="font-mono font-bold text-slate-800 text-sm">{order.order_code}</div>
            <div className="text-[11px] text-slate-500">{order.created_at}</div>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
          order.payment_status === 'Paid'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : order.payment_status === 'Pending_Payment_Verification'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <CheckCircle size={20} className="shrink-0" />
          <div>
            <strong className="block font-bold">
              {order.payment_status === 'Paid'
                ? 'تم تأكيد السداد بنجاح - الطلب قيد التجهيز والتوريد'
                : order.payment_status === 'Pending_Payment_Verification'
                ? 'تم استلام إشعار التحويل بنجاح - جاري المراجعة والاعتماد المالي'
                : 'طلب قيد التنفيذ (الدفع عند الاستلام)'}
            </strong>
            <span className="text-[11px] opacity-90">
              طريقة الدفع: <span className="font-bold uppercase">{order.payment_method}</span>
            </span>
          </div>
        </div>

        {/* Customer & Delivery Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-slate-500 block">اسم العميل / المنشأة:</span>
            <span className="font-bold text-slate-900">{order.customer_name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">رقم الهاتف:</span>
            <span className="font-mono font-bold text-slate-900" dir="ltr">{order.customer_phone}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500 block">عنوان التوصيل والتركيب:</span>
            <span className="font-semibold text-slate-800">{order.shipping_address} ({order.city})</span>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-800">بيانات الأجهزة والتوريدات المطلوبة:</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">اسم الجهاز / الصنف</th>
                  <th className="p-3 text-center">الكمية</th>
                  <th className="p-3 text-end">سعر الوحدة</th>
                  <th className="p-3 text-end">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {order.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold">{item.product_title}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-end font-mono">{item.unit_price?.toLocaleString()} ج.م</td>
                    <td className="p-3 text-end font-bold font-mono">{item.total_price?.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-xs">
                <tr>
                  <td colSpan="4" className="p-3 text-end">الإجمالي المستحق:</td>
                  <td className="p-3 text-end font-black text-manar-700 text-sm font-mono">
                    {order.total_amount?.toLocaleString()} ج.م
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Official Legal & Banking Details */}
        <div className="border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-500">
          <div className="space-y-1">
            <div className="font-bold text-slate-700">بيانات القيد والتسجيل:</div>
            <div>سجل تجاري: <strong>س.ت 92950</strong></div>
            <div>بطاقة ضريبية: <strong>ب.ض 231-091-057</strong></div>
            <div>المعرض: أسيوط - شارع التجنيد أمام بنك الإمارات دبي الوطني</div>
          </div>

          <div className="space-y-1 sm:text-end">
            <div className="font-bold text-slate-700">خدمة العملاء والخطوط الساخنة:</div>
            <div dir="ltr" className="font-bold text-slate-800">01119461111 | 01114961111</div>
            <div>almanaragencies@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
