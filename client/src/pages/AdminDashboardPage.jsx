import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Package, ShoppingCart, Wrench,
  Settings, Users, Shield, TrendingUp, DollarSign,
  AlertCircle, CheckCircle, Clock, Eye, Edit, Trash2,
  Plus, Check, X, Sparkles, Filter, Search, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentProofModal from '../components/PaymentProofModal';

export default function AdminDashboardPage() {
  const { user, switchDemoRole, hasRole } = useAuth();

  // Role permissions
  const isSuperAdmin = user?.role_name === 'super_admin';
  const isCatalogManager = user?.role_name === 'catalog_manager' || isSuperAdmin;
  const isSalesOfficer = user?.role_name === 'sales_officer' || isSuperAdmin;
  const isDispatcher = user?.role_name === 'dispatcher' || isSuperAdmin;

  // Active Tab: default depending on role
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role_name === 'catalog_manager') return 'products';
    if (user?.role_name === 'sales_officer') return 'orders';
    if (user?.role_name === 'dispatcher') return 'services';
    return 'overview';
  });

  // State data
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Verification modal state
  const [inspectReceipt, setInspectReceipt] = useState(null);

  // New/Edit product modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    loadTabContent();
  }, [activeTab, user?.role_name]);

  const loadTabContent = async () => {
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      if (activeTab === 'overview' && isSuperAdmin) {
        const res = await axios.get('/api/analytics');
        if (res.data.success) setAnalytics(res.data);
      } else if (activeTab === 'products') {
        const [pRes, cRes, bRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories'),
          axios.get('/api/brands')
        ]);
        if (pRes.data.success) setProducts(pRes.data.products);
        if (cRes.data.success) setCategories(cRes.data.categories);
        if (bRes.data.success) setBrands(bRes.data.brands);
      } else if (activeTab === 'orders') {
        const res = await axios.get('/api/orders');
        if (res.data.success) setOrders(res.data.orders);
      } else if (activeTab === 'services') {
        const res = await axios.get('/api/services');
        if (res.data.success) setServices(res.data.services);
      } else if (activeTab === 'settings' && isSuperAdmin) {
        const res = await axios.get('/api/settings');
        if (res.data.success) setStoreSettings(res.data.settings);
      } else if (activeTab === 'users' && isSuperAdmin) {
        const res = await axios.get('/api/users');
        if (res.data.success) {
          setAllUsers(res.data.users);
          setRoles(res.data.roles);
        }
      }
    } catch (err) {
      console.error('Error loading tab content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRoleId) => {
    try {
      const res = await axios.put(`/api/users/${targetUserId}/role`, { role_id: newRoleId });
      if (res.data.success) {
        setMsg({ text: 'تم تحديث رتبة المستخدم بنجاح', type: 'success' });
        loadTabContent();
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'فشل تغيير الدور', type: 'error' });
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/settings', storeSettings);
      if (res.data.success) {
        setMsg({ text: 'تم حفظ وتحديث إعدادات النظام بنجاح', type: 'success' });
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'فشل حفظ الإعدادات', type: 'error' });
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct.id) {
        // Update
        const res = await axios.put(`/api/products/${editingProduct.id}`, editingProduct);
        if (res.data.success) {
          setMsg({ text: 'تم تحديث المنتج بنجاح', type: 'success' });
          setProductModalOpen(false);
          loadTabContent();
        }
      } else {
        // Create
        const res = await axios.post('/api/products', editingProduct);
        if (res.data.success) {
          setMsg({ text: 'تم إنشاء المنتج بنجاح', type: 'success' });
          setProductModalOpen(false);
          loadTabContent();
        }
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'فشل حفظ المنتج', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        setMsg({ text: 'تم حذف المنتج بنجاح', type: 'success' });
        loadTabContent();
      }
    } catch (err) {
      setMsg({ text: 'فشل حذف المنتج', type: 'error' });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { order_status: newStatus });
      if (res.data.success) {
        setMsg({ text: 'تم تحديث مسار تنفيذ الطلب', type: 'success' });
        loadTabContent();
      }
    } catch (err) {
      setMsg({ text: 'فشل التحديث', type: 'error' });
    }
  };

  const handleUpdateService = async (serviceId, updates) => {
    try {
      const res = await axios.put(`/api/services/${serviceId}`, updates);
      if (res.data.success) {
        setMsg({ text: 'تم حفظ بيانات إسناد الفني والموعد', type: 'success' });
        loadTabContent();
      }
    } catch (err) {
      setMsg({ text: 'فشل التحديث', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 text-start">
      {/* 1. TOP RBAC DEMO BAR */}
      <div className="bg-manar-900 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-300">نظام الصلاحيات والأدوار (RBAC)</div>
            <div className="font-bold text-sm text-white">
              المستخدم الحالي: <span className="text-cyanWater-300">{user?.full_name}</span> ({user?.role_title_ar || user?.role_name})
            </div>
          </div>
        </div>

        {/* Demo Role Switch Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-300 ms-1">تبديل المنظور:</span>
          {[
            { id: 'super_admin', label: 'المدير العام', color: 'bg-amber-600 hover:bg-amber-500' },
            { id: 'catalog_manager', label: 'مدير الكتالوج', color: 'bg-indigo-600 hover:bg-indigo-500' },
            { id: 'sales_officer', label: 'مسؤول المبيعات', color: 'bg-emerald-600 hover:bg-emerald-500' },
            { id: 'dispatcher', label: 'منسق الصيانة', color: 'bg-cyan-600 hover:bg-cyan-500' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => switchDemoRole(r.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg text-white transition ${r.color} ${
                user?.role_name === r.id ? 'ring-2 ring-white font-black' : 'opacity-80'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Message */}
      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ text: '', type: '' })}><X size={14} /></button>
        </div>
      )}

      {/* Main Grid: Navigation Tabs + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 px-3 pb-2 border-b border-slate-100">
            أقسام الإدارة والتشغيل
          </div>

          {/* Super Admin Financial Overview */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'overview' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>التقارير المالية والتحليلات</span>
            </button>
          )}

          {/* Catalog Manager / Super Admin */}
          {isCatalogManager && (
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'products' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Package size={16} />
              <span>إدارة المنتجات والمخزون</span>
            </button>
          )}

          {/* Sales Officer / Super Admin */}
          {isSalesOfficer && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'orders' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart size={16} />
              <span>الطلبات وإثباتات الدفع</span>
            </button>
          )}

          {/* Maintenance Dispatcher / Super Admin */}
          {isDispatcher && (
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'services' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Wrench size={16} />
              <span>تنسيق الصيانة وتمديد النحاس</span>
            </button>
          )}

          {/* Super Admin Settings */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'settings' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings size={16} />
              <span>المحافظ وقنوات الدفع والبنك</span>
            </button>
          )}

          {/* Super Admin Users */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-start px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'users' ? 'bg-manar-700 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users size={16} />
              <span>المستخدمين وتعيين الصلاحيات</span>
            </button>
          )}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* TAB 1: OVERVIEW & FINANCIALS */}
          {activeTab === 'overview' && isSuperAdmin && analytics && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                لوحة المؤشرات والتقارير المالية - شركة المنار
              </h2>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                  <span className="text-xs text-emerald-800 font-bold block">إجمالي الإيرادات المؤكدة:</span>
                  <span className="text-xl font-black text-emerald-900 block font-mono">
                    {analytics.metrics.total_revenue?.toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-emerald-700">من المدفوعات المعتمدة</span>
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-1">
                  <span className="text-xs text-purple-800 font-bold block">مبالغ قيد التحقق (معلقة):</span>
                  <span className="text-xl font-black text-purple-900 block font-mono">
                    {analytics.metrics.pending_revenue?.toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-purple-700">{analytics.metrics.pending_proofs} إيصالات قيد المراجعة</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-1">
                  <span className="text-xs text-manar-800 font-bold block">إجمالي عدد الطلبات:</span>
                  <span className="text-xl font-black text-manar-900 block font-mono">
                    {analytics.metrics.total_orders}
                  </span>
                  <span className="text-[10px] text-manar-700">توريدات أجهزة وفلاتر</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-xs text-amber-800 font-bold block">مهام الصيانة النشطة:</span>
                  <span className="text-xl font-black text-amber-900 block font-mono">
                    {analytics.metrics.active_services}
                  </span>
                  <span className="text-[10px] text-amber-700">قيد التنسيق والتنفيذ بأسيوط</span>
                </div>
              </div>

              {/* Security Audit Trail */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Shield size={14} className="text-manar-600" />
                  <span>سجل التدقيق الأمني والعمليات الإدارية (Audit Trail):</span>
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-start">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">الإجراء</th>
                        <th className="p-2.5">المستخدم</th>
                        <th className="p-2.5">التفاصيل</th>
                        <th className="p-2.5">عنوان IP</th>
                        <th className="p-2.5">الوقت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {analytics.recentLogs?.map((log) => (
                        <tr key={log.id}>
                          <td className="p-2.5 font-bold font-mono text-[11px] text-manar-700">{log.action}</td>
                          <td className="p-2.5">{log.full_name || 'System'}</td>
                          <td className="p-2.5 text-slate-600 max-w-xs truncate">{log.details}</td>
                          <td className="p-2.5 font-mono text-slate-400 text-[10px]">{log.ip_address}</td>
                          <td className="p-2.5 text-slate-400 text-[10px]">{log.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && isCatalogManager && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  إدارة المنتجات والأجهزة والمخزون ({products.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct({
                      title_ar: '',
                      title_en: '',
                      category_id: categories[0]?.id || 1,
                      brand_id: brands[0]?.id || 1,
                      price: 20000,
                      discount_price: null,
                      stock_quantity: 10,
                      horsepower: 1.5,
                      is_inverter: 1,
                      cooling_type: 'cool_only',
                      warranty_years: 5,
                      description_ar: '',
                      specs: {},
                      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80']
                    });
                    setProductModalOpen(true);
                  }}
                  className="bg-manar-700 hover:bg-manar-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus size={14} />
                  <span>إضافة جهاز جديد</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-start">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">الصورة</th>
                      <th className="p-3">اسم الجهاز</th>
                      <th className="p-3">الماركة</th>
                      <th className="p-3">القدرة</th>
                      <th className="p-3 text-end">السعر</th>
                      <th className="p-3 text-center">المخزون</th>
                      <th className="p-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-10 h-10 object-contain rounded bg-slate-50 border p-0.5"
                          />
                        </td>
                        <td className="p-3 font-semibold max-w-xs">{p.title_ar}</td>
                        <td className="p-3 font-bold text-slate-600">{p.brand_name || '—'}</td>
                        <td className="p-3">{p.horsepower ? `${p.horsepower} حصان` : '—'}</td>
                        <td className="p-3 text-end font-mono font-bold">{p.price?.toLocaleString()} ج.م</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            p.stock_quantity > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="تعديل"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & PROOF VERIFICATION */}
          {activeTab === 'orders' && isSalesOfficer && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                إدارة طلبات التوريد والتحقق من إيصالات الدفع
              </h2>

              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-start">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">العميل</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">طريقة الدفع</th>
                      <th className="p-3">الإجمالي</th>
                      <th className="p-3">حالة السداد</th>
                      <th className="p-3">حالة التوريد</th>
                      <th className="p-3 text-center">فحص الإيصال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {orders.map((o) => {
                      const latestReceipt = o.receipts?.[0];
                      return (
                        <tr key={o.id}>
                          <td className="p-3 font-mono font-bold text-manar-700">{o.order_code}</td>
                          <td className="p-3 font-semibold">{o.customer_name}</td>
                          <td className="p-3 font-mono" dir="ltr">{o.customer_phone}</td>
                          <td className="p-3 uppercase font-bold text-slate-600">{o.payment_method}</td>
                          <td className="p-3 font-mono font-black">{o.total_amount?.toLocaleString()} ج.م</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              o.payment_status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.payment_status === 'Pending_Payment_Verification'
                                ? 'bg-purple-100 text-purple-800'
                                : o.payment_status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <select
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-semibold"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            {latestReceipt ? (
                              <button
                                onClick={() => setInspectReceipt({ ...latestReceipt, total_amount: o.total_amount, order_code: o.order_code, customer_name: o.customer_name, customer_phone: o.customer_phone })}
                                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto transition"
                              >
                                <Eye size={12} />
                                <span>فحص الإيصال</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">لا يوجد إيصال (COD)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES DISPATCH */}
          {activeTab === 'services' && isDispatcher && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                منسق الصيانة والتركيب وتمديد النحاس ({services.length})
              </h2>

              <div className="space-y-3">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-manar-700">{srv.request_code}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{srv.service_type}</h4>
                        <span className="text-slate-500">العميل: {srv.customer_name} ({srv.customer_phone})</span>
                      </div>

                      <div className="text-end">
                        <span className="font-black text-emerald-700 text-sm block">
                          {srv.estimated_cost?.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] text-slate-500">العنوان: {srv.address}</span>
                      </div>
                    </div>

                    {/* Dispatch Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الفني المكلف:</label>
                        <input
                          type="text"
                          defaultValue={srv.assigned_technician || ''}
                          placeholder="اسم مهندس / فني الصيانة"
                          onBlur={(e) => handleUpdateService(srv.id, { assigned_technician: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">تاريخ ووقت المعاينة:</label>
                        <input
                          type="text"
                          defaultValue={srv.scheduled_date || ''}
                          placeholder="2026-10-06 10:00"
                          onBlur={(e) => handleUpdateService(srv.id, { scheduled_date: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الحالة:</label>
                        <select
                          value={srv.status}
                          onChange={(e) => handleUpdateService(srv.id, { status: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold"
                        >
                          <option value="Pending">Pending (قيد التنسيق)</option>
                          <option value="Scheduled">Scheduled (تم تحديد موعد)</option>
                          <option value="In_Progress">In_Progress (جاري التنفيذ)</option>
                          <option value="Completed">Completed (تمت الزيارة بنجاح)</option>
                          <option value="Cancelled">Cancelled (ملغي)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === 'settings' && isSuperAdmin && (
            <form onSubmit={handleSettingsSave} className="space-y-5 text-xs">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                إعدادات قنوات الدفع ومحافظ الكاش والبيانات البنكية
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">رقم محفظة فودافون كاش المعتمدة:</label>
                  <input
                    type="text"
                    value={storeSettings.active_vodafone_cash || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, active_vodafone_cash: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">اسم صاحب محفظة فودافون كاش:</label>
                  <input
                    type="text"
                    value={storeSettings.active_vodafone_cash_owner || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, active_vodafone_cash_owner: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">عنوان الدفع اللحظي في انستاباي (IPA):</label>
                  <input
                    type="text"
                    value={storeSettings.active_instapay_ipa || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, active_instapay_ipa: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-purple-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">سعر تمديد متر النحاس الأصلي (ج.م):</label>
                  <input
                    type="number"
                    value={storeSettings.copper_rate_per_meter || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, copper_rate_per_meter: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700">رقم الآيبان البنكي (Banque Misr IBAN):</label>
                  <input
                    type="text"
                    value={storeSettings.bank_iban || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, bank_iban: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الخط الساخن الرئيسي:</label>
                  <input
                    type="text"
                    value={storeSettings.hotline_primary || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, hotline_primary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">الخط الثاني للدعم:</label>
                  <input
                    type="text"
                    value={storeSettings.hotline_secondary || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, hotline_secondary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-manar-700 hover:bg-manar-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  حفظ وتحديث الإعدادات
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: USER MANAGEMENT & ROLE ASSIGNMENT */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                إدارة المستخدمين وصلاحيات الأدوار (RBAC) ({allUsers.length})
              </h2>

              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full text-start">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">الاسم</th>
                      <th className="p-3">البريد الإلكتروني</th>
                      <th className="p-3">الهاتف</th>
                      <th className="p-3">الرتبة الحالية</th>
                      <th className="p-3">تغيير الصلاحية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {allUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-mono text-slate-400">{u.id}</td>
                        <td className="p-3 font-bold">{u.full_name}</td>
                        <td className="p-3 font-mono">{u.email}</td>
                        <td className="p-3 font-mono" dir="ltr">{u.phone}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            u.role_name === 'super_admin'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role_name === 'catalog_manager'
                              ? 'bg-indigo-100 text-indigo-900'
                              : u.role_name === 'sales_officer'
                              ? 'bg-emerald-100 text-emerald-900'
                              : u.role_name === 'dispatcher'
                              ? 'bg-cyan-100 text-cyan-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {u.role_title_ar || u.role_name}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.id === 1 ? (
                            <span className="text-slate-400 text-[10px]">مالك المنظومة الرئيسي</span>
                          ) : (
                            <select
                              value={u.role_id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.title_ar} ({r.name})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT PROOF INSPECTION MODAL */}
      {inspectReceipt && (
        <PaymentProofModal
          receipt={inspectReceipt}
          onClose={() => setInspectReceipt(null)}
          onVerified={() => {
            loadTabContent();
            setInspectReceipt(null);
          }}
        />
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة جهاز جديد إلى الكتالوج'}
              </h3>
              <button onClick={() => setProductModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم المنتج بالعربية:</label>
                  <input
                    type="text"
                    value={editingProduct.title_ar}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title_ar: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الاسم بالإنجليزية:</label>
                  <input
                    type="text"
                    value={editingProduct.title_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title_en: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">القسم:</label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: Number(e.target.value) })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الماركة / التوكيل:</label>
                  <select
                    value={editingProduct.brand_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand_id: Number(e.target.value) || null })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-semibold"
                  >
                    <option value="">بدون ماركة محددة</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">السعر (ج.م):</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">سعر الخصم (اختياري):</label>
                  <input
                    type="number"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: Number(e.target.value) || null })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">قدرة التكييف بالحصان (إن وجد):</label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingProduct.horsepower || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, horsepower: Number(e.target.value) || null })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الكمية بالمخزن:</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-manar-700 text-white font-bold hover:bg-manar-800"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
