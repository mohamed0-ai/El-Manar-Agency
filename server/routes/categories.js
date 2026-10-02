import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET all categories with product count
router.get('/', (req, res) => {
  try {
    const categories = dbHelpers.all(`
      SELECT c.*, COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب الأقسام' });
  }
});

// CREATE category (super_admin, catalog_manager)
router.post('/', requireAuth, requireRole(['super_admin', 'catalog_manager']), (req, res) => {
  try {
    const { name_ar, name_en, slug, icon, display_order } = req.body;
    if (!name_ar || !slug) {
      return res.status(400).json({ success: false, error: 'اسم القسم والرابط مطلوبان' });
    }
    const result = dbHelpers.run(
      'INSERT INTO categories (name_ar, name_en, slug, icon, display_order) VALUES (?, ?, ?, ?, ?)',
      [name_ar, name_en || name_ar, slug, icon || 'Folder', display_order || 0]
    );
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
