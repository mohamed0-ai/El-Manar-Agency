import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. List users with roles (Super Admin)
router.get('/', requireAuth, requireRole(['super_admin']), (req, res) => {
  try {
    const users = dbHelpers.all(`
      SELECT u.id, u.full_name, u.email, u.phone, u.role_id, u.created_at,
             r.name as role_name, r.title_ar as role_title_ar, r.title_en as role_title_en
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `);

    const roles = dbHelpers.all('SELECT * FROM roles ORDER BY id ASC');

    res.json({ success: true, count: users.length, users, roles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب قائمة المستخدمين' });
  }
});

// 2. Change user role (Super Admin)
router.put('/:id/role', requireAuth, requireRole(['super_admin']), (req, res) => {
  try {
    const { role_id } = req.body;
    const targetUserId = req.params.id;

    if (!role_id) {
      return res.status(400).json({ success: false, error: 'يرجى تحديد الدور المطلوب' });
    }

    const user = dbHelpers.get('SELECT * FROM users WHERE id = ?', [targetUserId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    }

    // Prevent demoting the primary agency owner
    if (user.id === 1 && Number(role_id) !== 1) {
      return res.status(400).json({ success: false, error: 'لا يمكن تغيير دور المالك الرئيسي للوكالة' });
    }

    dbHelpers.run('UPDATE users SET role_id = ? WHERE id = ?', [role_id, targetUserId]);

    logAudit(
      req.user.id,
      'CHANGE_USER_ROLE',
      'USER',
      targetUserId,
      `Changed user ${user.email} role to role_id=${role_id}`,
      req
    );

    res.json({ success: true, message: 'تم تحديث صلاحيات ورتبة المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'فشل تغيير دور المستخدم' });
  }
});

// 3. Delete user (Super Admin)
router.delete('/:id', requireAuth, requireRole(['super_admin']), (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (Number(targetUserId) === 1 || Number(targetUserId) === req.user.id) {
      return res.status(400).json({ success: false, error: 'لا يمكن حذف الحساب الإداري الحالي' });
    }

    dbHelpers.run('DELETE FROM users WHERE id = ?', [targetUserId]);
    logAudit(req.user.id, 'DELETE_USER', 'USER', targetUserId, `Deleted user ID #${targetUserId}`, req);

    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر حذف المستخدم' });
  }
});

export default router;
