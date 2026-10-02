import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Shield, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(email, password);
      if (['super_admin', 'catalog_manager', 'sales_officer', 'dispatcher'].includes(loggedUser.role_name)) {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setLoading(true);
    try {
      const loggedUser = await switchDemoRole(roleKey);
      if (loggedUser && ['super_admin', 'catalog_manager', 'sales_officer', 'dispatcher'].includes(loggedUser.role_name)) {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError('فشل التبديل التجريبي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-start">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Al-Manar Logo" className="h-16 mx-auto object-contain" />
          <h1 className="text-xl font-black text-slate-900">تسجيل الدخول إلى حسابك</h1>
          <p className="text-xs text-slate-500">شركة المنار للتكييف وفلاتر المياه - أسيوط</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">البريد الإلكتروني:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">كلمة المرور:</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-manar-700 hover:bg-manar-800 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
          </button>
        </form>

        {/* 1-Click Fast Demo Accounts */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span>تسجيل دخول سريع للتجربة واختبار الصلاحيات:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleDemoLogin('super_admin')}
              className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 text-start"
            >
              👑 المدير العام (Super Admin)
            </button>
            <button
              onClick={() => handleDemoLogin('catalog_manager')}
              className="p-2 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold hover:bg-indigo-100 text-start"
            >
              📦 مدير الكتالوج والمخزون
            </button>
            <button
              onClick={() => handleDemoLogin('sales_officer')}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold hover:bg-emerald-100 text-start"
            >
              💳 مسؤول المبيعات والإيصالات
            </button>
            <button
              onClick={() => handleDemoLogin('dispatcher')}
              className="p-2 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200 font-bold hover:bg-cyan-100 text-start"
            >
              🔧 منسق الصيانة والتركيب
            </button>
            <button
              onClick={() => handleDemoLogin('customer')}
              className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold hover:bg-slate-200 text-start col-span-2"
            >
              👤 حساب عميل مشتري (د. أحمد حسن)
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-manar-700 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
