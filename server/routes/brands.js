import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const brands = dbHelpers.all(`
      SELECT b.*, COUNT(p.id) as products_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id
      GROUP BY b.id
      ORDER BY b.is_authorized DESC, b.name ASC
    `);
    res.json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب التوكيلات والعلامات التجارية' });
  }
});

router.post('/', requireAuth, requireRole(['super_admin', 'catalog_manager']), (req, res) => {
  try {
    const { name, logo_url, is_authorized, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'اسم الماركة مطلوب' });
    }
    const result = dbHelpers.run(
      'INSERT INTO brands (name, logo_url, is_authorized, description) VALUES (?, ?, ?, ?)',
      [name, logo_url || null, is_authorized ? 1 : 0, description || '']
    );
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
