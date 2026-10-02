import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { dbHelpers } from '../db/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
    }

    const user = dbHelpers.get(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role_id,
              r.name as role_name, r.title_ar as role_title_ar, r.title_en as role_title_en
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER(?)`,
      [email.trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
    }

    const token = signToken(user);
    logAudit(user.id, 'USER_LOGIN', 'USER', user.id, `User ${user.email} logged in successfully`, req);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: user.role_name,
        role_title_ar: user.role_title_ar,
        role_title_en: user.role_title_en
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'حدث خطأ في الخادم' });
  }
});

// 2. Register (Customer)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'جميع الحقول مطلوبة' });
    }

    const existing = dbHelpers.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Customer role is id 5
    const result = dbHelpers.run(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id)
       VALUES (?, ?, ?, ?, 5)`,
      [full_name.trim(), email.trim(), phone.trim(), password_hash]
    );

    const newUser = dbHelpers.get(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role_id,
              r.name as role_name, r.title_ar as role_title_ar, r.title_en as role_title_en
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [result.lastInsertRowid]
    );

    const token = signToken(newUser);
    logAudit(newUser.id, 'USER_REGISTER', 'USER', newUser.id, `New customer registered: ${newUser.email}`, req);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: newUser.role_id,
        role_name: newUser.role_name,
        role_title_ar: newUser.role_title_ar,
        role_title_en: newUser.role_title_en
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'فشل إنشاء الحساب' });
  }
});

// 3. Demo Quick-Switch Route (for seamless role testing)
router.post('/demo-switch', async (req, res) => {
  try {
    const { role } = req.body;
    let targetEmail = 'admin@almanar.eg';
    if (role === 'catalog_manager') targetEmail = 'catalog@almanar.eg';
    else if (role === 'sales_officer') targetEmail = 'sales@almanar.eg';
    else if (role === 'dispatcher') targetEmail = 'dispatcher@almanar.eg';
    else if (role === 'customer') targetEmail = 'customer@gmail.com';

    const user = dbHelpers.get(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role_id,
              r.name as role_name, r.title_ar as role_title_ar, r.title_en as role_title_en
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER(?)`,
      [targetEmail]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    }

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: user.role_name,
        role_title_ar: user.role_title_ar,
        role_title_en: user.role_title_en
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
