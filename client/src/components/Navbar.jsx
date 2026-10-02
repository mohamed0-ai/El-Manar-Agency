import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone, MapPin, ShieldCheck, Globe, ShoppingCart,
  User, LogOut, LayoutDashboard, Calculator, Wrench,
  Search, Menu, X, ChevronDown, CheckCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchDemoRole, hasRole } = useAuth();
  const { itemCount } = useCart();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleDemoRoleSwitch = async (roleKey) => {
    await switchDemoRole(roleKey);
    setRoleDropdownOpen(false);
    if (['super_admin', 'catalog_manager', 'sales_officer', 'dispatcher'].includes(roleKey)) {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
  };

  const isStaff = hasRole(['super_admin', 'catalog_manager', 'sales_officer', 'dispatcher']);

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white">
      {/* 1. TOP UTILITY HEADER */}
      <div className="bg-manar-800 text-white text-xs py-1.5 px-4 border-b border-manar-700">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Address & Credentials */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-manar-100">
              <MapPin size={13} className="text-cyanWater-400" />
              <span>أسيوط - أول شارع التجنيد من شارع الجمهورية</span>
            </span>
            <span className="hidden sm:inline text-manar-300">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-manar-200">
              <ShieldCheck size={13} className="text-amber-400" />
              <span>س.ت 92950 | ب.ض 231-091-057</span>
            </span>
          </div>

          {/* Hotline & Demo Role Switcher & Lang */}
          <div className="flex items-center gap-3">
            <a
              href="tel:01119461111"
              className="flex items-center gap-1 font-semibold text-cyanWater-300 hover:text-white transition"
              dir="ltr"
            >
              <Phone size={12} />
              <span>01119461111</span>
            </a>

            {/* DEMO ROLE SWITCHER POPUP BUTTON */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-2 py-0.5 rounded text-[11px] transition shadow"
                title="التبديل بين الأدوار للتجربة والاختبار"
              >
                <Sparkles size={11} />
                <span>
                  {user ? `الدور: ${user.role_title_ar || user.role_name}` : 'تجربة الأدوار (Demo)'}
                </span>
                <ChevronDown size={11} />
              </button>

              {roleDropdownOpen && (
                <div className="absolute end-0 mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 font-bold text-slate-500 border-b border-slate-100 flex items-center justify-between">
                    <span>تبديل الحساب التجريبي بنقرة واحدة</span>
                  </div>
                  <button
                    onClick={() => handleDemoRoleSwitch('super_admin')}
                    className="w-full text-start px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition"
                  >
                    <div>
                      <div className="font-bold text-manar-700">المدير العام (Super Admin)</div>
                      <div className="text-[10px] text-slate-500">م. محمود المنar - تحكم كامل وتقارير مالية</div>
                    </div>
                    {user?.role_name === 'super_admin' && <CheckCircle size={14} className="text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleDemoRoleSwitch('catalog_manager')}
                    className="w-full text-start px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition border-t border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-indigo-700">مدير الكتالوج والمخزون</div>
                      <div className="text-[10px] text-slate-500">أ. طارق مصطفى - إدارة المنتجات والمواصفات</div>
                    </div>
                    {user?.role_name === 'catalog_manager' && <CheckCircle size={14} className="text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleDemoRoleSwitch('sales_officer')}
                    className="w-full text-start px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition border-t border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-emerald-700">مسؤول المبيعات وإيصالات الدفع</div>
                      <div className="text-[10px] text-slate-500">أ. سارة نبيل - مراجعة إيصالات انستاباي وفودافون</div>
                    </div>
                    {user?.role_name === 'sales_officer' && <CheckCircle size={14} className="text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleDemoRoleSwitch('dispatcher')}
                    className="w-full text-start px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition border-t border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-amber-700">منسق الصيانة والتركيبات</div>
                      <div className="text-[10px] text-slate-500">م. يوسف كمال - إسناد الفنيين وتحديد المواعيد</div>
                    </div>
                    {user?.role_name === 'dispatcher' && <CheckCircle size={14} className="text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleDemoRoleSwitch('customer')}
                    className="w-full text-start px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition border-t border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-cyan-700">عميل مشتري (Customer)</div>
                      <div className="text-[10px] text-slate-500">د. أحمد حسن - طلب أجهزة ورفع إيصالات تحويل</div>
                    </div>
                    {user?.role_name === 'customer' && <CheckCircle size={14} className="text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-slate-200 hover:text-white px-2 py-0.5 rounded bg-manar-900 border border-manar-600 transition"
              title="تغيير اللغة / Change Language"
            >
              <Globe size={12} />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 py-1">
          <img
            src="/logo.png"
            alt="شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية"
            className="h-14 sm:h-18 lg:h-20 w-auto object-contain transition duration-200 group-hover:scale-105"
            onError={(e) => {
              e.target.src = '/logo.jpg';
            }}
          />
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative mx-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن تكييف كاريير، ميديا، شارب، فلاتر مياه، شاشات..."
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 ps-4 pe-10 text-sm focus:outline-none focus:border-manar-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute end-1 top-1/2 -translate-y-1/2 bg-manar-700 hover:bg-manar-800 text-white p-1.5 rounded-full transition"
          >
            <Search size={15} />
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-700">
          <Link
            to="/"
            className={`hover:text-manar-700 transition ${location.pathname === '/' ? 'text-manar-700 font-bold' : ''}`}
          >
            {t('nav_home')}
          </Link>
          <Link
            to="/catalog"
            className={`hover:text-manar-700 transition ${location.pathname.startsWith('/catalog') ? 'text-manar-700 font-bold' : ''}`}
          >
            {t('nav_catalog')}
          </Link>
          <Link
            to="/calculator"
            className={`flex items-center gap-1 text-manar-700 hover:text-manar-800 bg-blue-50 px-2.5 py-1 rounded-md transition border border-blue-200 ${
              location.pathname === '/calculator' ? 'ring-2 ring-manar-500' : ''
            }`}
          >
            <Calculator size={15} className="text-manar-600" />
            <span>حاسبة التكييف</span>
          </Link>
          <Link
            to="/services"
            className={`flex items-center gap-1 hover:text-cyanWater-700 transition ${
              location.pathname === '/services' ? 'text-cyanWater-600 font-bold' : ''
            }`}
          >
            <Wrench size={15} />
            <span>الصيانة والتركيب</span>
          </Link>
        </nav>

        {/* Right Action Icons (Cart, Account, Dashboard) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-manar-700 hover:bg-slate-100 rounded-full transition"
            title="سلة المشتريات"
          >
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -end-1 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User / Dashboard Link */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isStaff ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 bg-manar-700 hover:bg-manar-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-sm"
                >
                  <LayoutDashboard size={15} />
                  <span className="hidden sm:inline">لوحة الإدارة</span>
                </Link>
              ) : (
                <Link
                  to="/customer"
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  <User size={15} />
                  <span className="hidden sm:inline">حسابي وطلباتي</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="تسجيل الخروج"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-manar-700 hover:text-manar-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                دخول
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-block text-xs font-bold bg-manar-700 hover:bg-manar-800 text-white px-3.5 py-2 rounded-lg transition shadow-sm"
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:text-manar-700 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-3 shadow-lg">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أجهزة التكييف والفلاتر..."
              className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 ps-3 pe-10 text-sm"
            />
            <button
              type="submit"
              className="absolute end-1 top-1/2 -translate-y-1/2 bg-manar-700 text-white p-1.5 rounded-md"
            >
              <Search size={14} />
            </button>
          </form>

          <div className="flex flex-col gap-2 font-semibold text-slate-700 text-sm">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              الرئيسية
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              كتالوج المنتجات
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 bg-blue-50 text-manar-700 rounded flex items-center gap-2"
            >
              <Calculator size={16} />
              <span>حاسبة قدرة التكييف (BTU)</span>
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded flex items-center gap-2"
            >
              <Wrench size={16} />
              <span>خدمات الصيانة وتمديد النحاس</span>
            </Link>
            {isStaff ? (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 bg-amber-50 text-amber-900 rounded font-bold flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                <span>لوحة تحكم الإدارة</span>
              </Link>
            ) : isAuthenticated ? (
              <Link
                to="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 hover:bg-slate-50 rounded"
              >
                حسابي ومتابعة الطلبات
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 text-manar-700 font-bold"
              >
                تسجيل الدخول / إنشاء حساب
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
