import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Wrench, User, Clock, CheckCircle,
  AlertOctagon, Upload, FileText, ChevronRight,
  ExternalLink, Phone, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'services' | 'profile'
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Re-upload state
  const [reuploadOrder, setReuploadOrder] = useState(null);
  const [reuploadMethod, setReuploadMethod] = useState('instapay');
  const [reuploadSender, setReuploadSender] = useState('');
  const [reuploadRef, setReuploadRef] = useState('');
  const [reuploadFile, setReuploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reuploadSuccess, setReuploadSuccess] = useState('');
  const [reuploadError, setReuploadError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, srvRes] = await Promise.all([
        axios.get('/api/orders/my-orders'),
        axios.get('/api/services/my-services')
      ]);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (srvRes.data.success) setServices(srvRes.data.services);
    } catch (err) {
      console.error('Customer dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadSubmit = async (e) => {
    e.preventDefault();
    if (!reuploadFile) {
      setReuploadError('يرجى اختيار صورة الإيصال الجديد');
      return;
    }

    setUploading(true);
    setReuploadError('');
    setReuploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('order_id', reuploadOrder.id);
      formData.append('method', reuploadMethod);
      formData.append('sender_number_or_handle', reuploadSender);
      formData.append('reference_number', reuploadRef);
      formData.append('receipt', reuploadFile);

      const res = await axios.post('/api/payments/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setReuploadSuccess('تم إعادة رفع إشعار الدفع بنجاح! جاري المراجعة والاعتماد.');
        setTimeout(() => {
          setReuploadOrder(null);
          setReuploadSuccess('');
          fetchData();
        }, 2000);
      }
    } catch (err) {
      setReuploadError(err.response?.data?.error || 'فشل رفع الإيصال');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-start">
      {/* User Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-manar-100 text-manar-800 flex items-center justify-center font-bold text-xl border border-manar-200">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              مرحباً بك، {user?.full_name || 'عميلنا العزيز'}
            </h1>
            <p className="text-xs text-slate-500 font-mono" dir="ltr">
              {user?.email} • {user?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-manar-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
            حساب عميل معتمد لشركة المنار
          </span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-manar-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package size={15} />
          <span>سجل الطلبات والتوريدات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-manar-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench size={15} />
          <span>طلبات الصيانة وتمديد النحاس ({services.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Package size={36} className="mx-auto text-slate-400" />
              <h3 className="font-bold text-base text-slate-800">لا توجد طلبات سابقة حتى الآن</h3>
              <p className="text-xs text-slate-500">تصفح كتالوج المنار وقدم طلبك مع الدفع الآمن</p>
            </div>
          ) : (
            orders.map((order) => {
              const latestReceipt = order.receipts?.[0];
              const isRejected = order.payment_status === 'Rejected' || latestReceipt?.status === 'Rejected';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-manar-700 text-sm">
                          {order.order_code}
                        </span>
                        <span className="text-[11px] text-slate-400">({order.created_at})</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {order.items_count} صنف • الإجمالي:{' '}
                        <strong className="text-slate-900">{order.total_amount?.toLocaleString()} ج.م</strong>
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.order_status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.order_status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        حالة التوريد: {order.order_status}
                      </span>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.payment_status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.payment_status === 'Pending_Payment_Verification'
                          ? 'bg-purple-100 text-purple-800'
                          : order.payment_status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        الدفع ({order.payment_method}): {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Rejected Payment Alert & Re-upload Trigger */}
                  {isRejected && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-red-800 text-xs">
                          <AlertOctagon size={16} />
                          <span>تم رفض إشعار الدفع من قبل الإدارة المالية:</span>
                        </div>
                        <p className="text-xs text-red-700">
                          {latestReceipt?.verification_notes || 'بيانات التحويل غير مطابقة أو لم يتم العثور على المبلغ في الحساب.'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setReuploadOrder(order);
                          setReuploadMethod(order.payment_method || 'instapay');
                          setReuploadSender(latestReceipt?.sender_number_or_handle || '');
                          setReuploadRef('');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 shrink-0 transition"
                      >
                        <Upload size={14} />
                        <span>إعادة رفع إشعار دفع صحيح</span>
                      </button>
                    </div>
                  )}

                  {/* Pending verification info */}
                  {order.payment_status === 'Pending_Payment_Verification' && (
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-900 flex items-center gap-2">
                      <Clock size={16} className="text-purple-600 shrink-0" />
                      <span>
                        تم إرسال إشعار التحويل (رقم العملية: <strong>{latestReceipt?.reference_number}</strong>)، وجاري التحقق من مسؤولي الحسابات.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Wrench size={36} className="mx-auto text-slate-400" />
              <h3 className="font-bold text-base text-slate-800">لا توجد طلبات صيانة أو تمديد سابقة</h3>
              <p className="text-xs text-slate-500">احجز فني تركيب أو تمديد مواسير نحاس بسهولة</p>
            </div>
          ) : (
            services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-manar-700 text-xs">
                      {srv.request_code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                      {srv.service_type}
                    </h3>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    srv.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : srv.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {srv.status === 'Pending' ? 'قيد التنسيق' : srv.status === 'Scheduled' ? 'تم تحديد الموعد' : srv.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الفني المسؤول:</span>
                    <span className="font-bold text-slate-800">
                      {srv.assigned_technician || 'جاري إسناد مهندس الصيانة'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">الموعد المحدد:</span>
                    <span className="font-bold text-slate-800">
                      {srv.scheduled_date || 'قيد التأكيد'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">التكلفة التقديرية:</span>
                    <span className="font-bold text-emerald-700">
                      {srv.estimated_cost?.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RE-UPLOAD PAYMENT PROOF MODAL */}
      {reuploadOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-3">
              إعادة رفع إشعار الدفع - طلب #{reuploadOrder.order_code}
            </h3>

            {reuploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                {reuploadError}
              </div>
            )}

            {reuploadSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl">
                {reuploadSuccess}
              </div>
            )}

            <form onSubmit={handleReuploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">طريقة التحويل:</label>
                <select
                  value={reuploadMethod}
                  onChange={(e) => setReuploadMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="instapay">انستاباي (InstaPay IPA)</option>
                  <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                  <option value="bank_transfer">تحويل بنكي (بنك مصر)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  {reuploadMethod === 'instapay' ? 'اسم مستخدم انستاباي المحول منه:' : 'رقم الهاتف المحول منه:'}
                </label>
                <input
                  type="text"
                  value={reuploadSender}
                  onChange={(e) => setReuploadSender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">رقم مرجع العملية الجديد:</label>
                <input
                  type="text"
                  value={reuploadRef}
                  onChange={(e) => setReuploadRef(e.target.value)}
                  placeholder="Ref ID / Sequence number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">صورة الإيصال الجديد:</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setReuploadFile(e.target.files[0])}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReuploadOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-manar-700 text-white font-bold hover:bg-manar-800 transition"
                >
                  {uploading ? 'جاري الرفع...' : 'تأكيد وإعادة الإرسال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
