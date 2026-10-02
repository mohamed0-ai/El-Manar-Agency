import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-start">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Al-Manar Logo" className="h-16 mx-auto object-contain" />
          <h1 className="text-xl font-black text-slate-900">إنشاء حساب عميل جديد</h1>
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
            <label className="font-bold text-slate-700">الاسم ثلاثي:</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="مثال: أحمد عبد الله السيوطي"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">البريد الإلكتروني:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">رقم الهاتف المحمول (مصر):</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01012345678"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-manar-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">كلمة المرور:</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <UserPlus size={16} />
            <span>{loading ? 'جاري إنشاء الحساب...' : 'تسجيل حساب جديد'}</span>
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-manar-700 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
