import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET all public system settings
router.get('/', (req, res) => {
  try {
    const rows = dbHelpers.all('SELECT key, value, description FROM system_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب إعدادات المتجر' });
  }
});

// UPDATE system settings (Super Admin Only)
router.put('/', requireAuth, requireRole(['super_admin']), (req, res) => {
  try {
    const updates = req.body; // Key-value object
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'البيانات غير صالحة' });
    }

    const stmt = dbHelpers.get(
      'SELECT COUNT(*) as count FROM system_settings'
    );

    for (const [key, value] of Object.entries(updates)) {
      dbHelpers.run(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }

    logAudit(
      req.user.id,
      'UPDATE_SYSTEM_SETTINGS',
      'SETTINGS',
      'GLOBAL',
      `Updated settings: ${Object.keys(updates).join(', ')}`,
      req
    );

    res.json({ success: true, message: 'تم حفظ وتحديث إعدادات النظام وقنوات الدفع بنجاح' });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ success: false, error: 'فشل تحديث الإعدادات' });
  }
});

export default router;
