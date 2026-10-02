import React, { useState } from 'react';
import {
  X, CheckCircle, AlertOctagon, FileText, ExternalLink,
  ShieldCheck, Phone, Hash, Calendar, Eye
} from 'lucide-react';
import axios from 'axios';

export default function PaymentProofModal({ receipt, onClose, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!receipt) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/payments/verify/${receipt.id}`, {
        action: 'approve',
        notes: notes || 'تم التحقق من مطابقة الحساب والمبلغ واعتماده.'
      });
      if (res.data.success) {
        onVerified(receipt.id, 'Approved');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'فشل اعتماد الإيصال');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('يرجى كتابة سبب رفض الإيصال لتوضيحه للعميل');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/payments/verify/${receipt.id}`, {
        action: 'reject',
        notes: notes.trim()
      });
      if (res.data.success) {
        onVerified(receipt.id, 'Rejected');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'فشل رفض الإيصال');
    } finally {
      setLoading(false);
    }
  };

  const isPdf = receipt.receipt_image_url?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="bg-manar-800 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyanWater-400" />
            <h3 className="font-bold text-base">
              فحص وتأكيد إشعار الدفع - طلب #{receipt.order_code || receipt.order_id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-manar-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
              <AlertOctagon size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Transfer Metadata Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">طريقة التحويل:</span>
              <span className="font-bold text-manar-700 uppercase">
                {receipt.method === 'instapay' ? 'InstaPay (انستاباي)' : 'Vodafone Cash (فودافون كاش)'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">إجمالي قيمة الطلب:</span>
              <span className="font-black text-slate-800 text-sm">
                {receipt.total_amount?.toLocaleString()} ج.م
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">رقم / حساب المحوّل (Sender):</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                {receipt.sender_number_or_handle}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">رقم العملية المرجعي (Ref ID):</span>
              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                {receipt.reference_number}
              </span>
            </div>

            {receipt.customer_name && (
              <div>
                <span className="text-slate-500 block">اسم العميل:</span>
                <span className="font-semibold text-slate-800">{receipt.customer_name}</span>
              </div>
            )}

            {receipt.customer_phone && (
              <div>
                <span className="text-slate-500 block">هاتف العميل:</span>
                <span className="font-mono text-slate-800" dir="ltr">{receipt.customer_phone}</span>
              </div>
            )}
          </div>

          {/* Receipt Proof Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={15} className="text-manar-600" />
                <span>صورة أو مستند إيصال التحويل:</span>
              </span>
              <a
                href={receipt.receipt_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-manar-600 hover:text-manar-700 flex items-center gap-1 font-semibold"
              >
                <span>فتح بالحجم الكامل</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[220px] max-h-[380px]">
              {isPdf ? (
                <div className="p-8 text-center space-y-3">
                  <FileText size={48} className="mx-auto text-red-500" />
                  <p className="text-xs text-slate-600">تم رفع الإيصال كملف PDF رسمي</p>
                  <a
                    href={receipt.receipt_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-manar-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    <span>معاينة وتحميل ملف PDF</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <img
                  src={receipt.receipt_image_url}
                  alt="إشعار الدفع"
                  className="max-h-[360px] w-auto object-contain mx-auto"
                />
              )}
            </div>
          </div>

          {/* Verification Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              ملاحظات مسؤول المبيعات (تظهر للعميل في حالة الرفض أو التأكيد):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                rejectMode
                  ? 'اكتب سبب الرفض بالتفصيل (مثل: المبلغ غير مطابق، رقم العملية وهمي، صورة غير واضحة)...'
                  : 'ملاحظة داخلية أو تأكيد استلام المبلغ في الحساب...'
              }
              rows={2}
              className={`w-full text-xs p-3 rounded-lg border focus:outline-none transition ${
                rejectMode
                  ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                  : 'border-slate-300 focus:border-manar-500'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              disabled={loading}
            >
              إلغاء
            </button>

            {!rejectMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition flex items-center gap-1.5"
                  disabled={loading}
                >
                  <AlertOctagon size={14} />
                  <span>رفض الإيصال</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  disabled={loading}
                >
                  <CheckCircle size={15} />
                  <span>{loading ? 'جاري الاعتماد...' : 'اعتماد الدفع وتأكيد الطلب'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                  disabled={loading}
                >
                  الرجوع
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  disabled={loading}
                >
                  <AlertOctagon size={15} />
                  <span>{loading ? 'جاري الرفض...' : 'تأكيد رفض الإشعار'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
