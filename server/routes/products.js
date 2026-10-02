import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET all products with filtering & search
router.get('/', (req, res) => {
  try {
    const { category, brand, horsepower, is_inverter, cooling_type, min_price, max_price, q, featured } = req.query;

    let sql = `
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug,
             b.name as brand_name, b.logo_url as brand_logo
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      if (isNaN(category)) {
        sql += ` AND c.slug = ?`;
        params.push(category);
      } else {
        sql += ` AND p.category_id = ?`;
        params.push(Number(category));
      }
    }

    if (brand) {
      sql += ` AND p.brand_id = ?`;
      params.push(Number(brand));
    }

    if (horsepower) {
      sql += ` AND p.horsepower = ?`;
      params.push(Number(horsepower));
    }

    if (is_inverter !== undefined && is_inverter !== '') {
      sql += ` AND p.is_inverter = ?`;
      params.push(Number(is_inverter));
    }

    if (cooling_type) {
      sql += ` AND p.cooling_type = ?`;
      params.push(cooling_type);
    }

    if (min_price) {
      sql += ` AND p.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      sql += ` AND p.price <= ?`;
      params.push(Number(max_price));
    }

    if (featured === '1' || featured === 'true') {
      sql += ` AND p.is_featured = 1`;
    }

    if (q) {
      const searchPattern = `%${q.trim()}%`;
      sql += ` AND (p.title_ar LIKE ? OR p.title_en LIKE ? OR p.description_ar LIKE ? OR b.name LIKE ?)`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY p.is_featured DESC, p.id DESC`;

    const products = dbHelpers.all(sql, params).map(p => ({
      ...p,
      specs: p.specs_json ? JSON.parse(p.specs_json) : {},
      images: p.images_array ? JSON.parse(p.images_array) : []
    }));

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ success: false, error: 'تعذر جلب المنتجات' });
  }
});

// GET single product
router.get('/:id', (req, res) => {
  try {
    const product = dbHelpers.get(
      `SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug,
              b.name as brand_name, b.logo_url as brand_logo
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }

    res.json({
      success: true,
      product: {
        ...product,
        specs: product.specs_json ? JSON.parse(product.specs_json) : {},
        images: product.images_array ? JSON.parse(product.images_array) : []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'خطأ في جلب بيانات المنتج' });
  }
});

// CREATE Product (Super Admin or Catalog Manager)
router.post('/', requireAuth, requireRole(['super_admin', 'catalog_manager']), (req, res) => {
  try {
    const {
      category_id, brand_id, title_ar, title_en, description_ar, description_en,
      price, discount_price, stock_quantity, horsepower, is_inverter, cooling_type,
      warranty_years, specs, images, is_featured
    } = req.body;

    if (!category_id || !title_ar || !price) {
      return res.status(400).json({ success: false, error: 'القسم، اسم المنتج والسعر حقول إجبارية' });
    }

    const specsJson = specs ? JSON.stringify(specs) : '{}';
    const imagesJson = images ? JSON.stringify(images) : '[]';

    const result = dbHelpers.run(
      `INSERT INTO products (
        category_id, brand_id, title_ar, title_en, description_ar, description_en,
        price, discount_price, stock_quantity, horsepower, is_inverter, cooling_type,
        warranty_years, specs_json, images_array, is_featured, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, brand_id || null, title_ar, title_en || title_ar,
        description_ar || '', description_en || '',
        price, discount_price || null, stock_quantity || 10,
        horsepower || null, is_inverter ? 1 : 0, cooling_type || null,
        warranty_years || 5, specsJson, imagesJson, is_featured ? 1 : 0, req.user.id
      ]
    );

    logAudit(req.user.id, 'CREATE_PRODUCT', 'PRODUCT', result.lastInsertRowid, `Created product ${title_ar}`, req);

    res.status(201).json({ success: true, id: result.lastInsertRowid, message: 'تم إضافة المنتج بنجاح' });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, error: 'فشل إضافة المنتج' });
  }
});

// UPDATE Product
router.put('/:id', requireAuth, requireRole(['super_admin', 'catalog_manager']), (req, res) => {
  try {
    const p = dbHelpers.get('SELECT id, title_ar FROM products WHERE id = ?', [req.params.id]);
    if (!p) {
      return res.status(404).json({ success: false, error: 'المنتج غير موجود' });
    }

    const {
      category_id, brand_id, title_ar, title_en, description_ar, description_en,
      price, discount_price, stock_quantity, horsepower, is_inverter, cooling_type,
      warranty_years, specs, images, is_featured
    } = req.body;

    const specsJson = specs !== undefined ? JSON.stringify(specs) : undefined;
    const imagesJson = images !== undefined ? JSON.stringify(images) : undefined;

    dbHelpers.run(
      `UPDATE products SET
        category_id = COALESCE(?, category_id),
        brand_id = COALESCE(?, brand_id),
        title_ar = COALESCE(?, title_ar),
        title_en = COALESCE(?, title_en),
        description_ar = COALESCE(?, description_ar),
        description_en = COALESCE(?, description_en),
        price = COALESCE(?, price),
        discount_price = ?,
        stock_quantity = COALESCE(?, stock_quantity),
        horsepower = ?,
        is_inverter = COALESCE(?, is_inverter),
        cooling_type = ?,
        warranty_years = COALESCE(?, warranty_years),
        specs_json = COALESCE(?, specs_json),
        images_array = COALESCE(?, images_array),
        is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        category_id, brand_id, title_ar, title_en, description_ar, description_en,
        price, discount_price, stock_quantity, horsepower, is_inverter, cooling_type,
        warranty_years, specsJson, imagesJson, is_featured, req.params.id
      ]
    );

    logAudit(req.user.id, 'UPDATE_PRODUCT', 'PRODUCT', req.params.id, `Updated product #${req.params.id}`, req);

    res.json({ success: true, message: 'تم تحديث بيانات المنتج بنجاح' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, error: 'فشل تحديث المنتج' });
  }
});

// DELETE Product
router.delete('/:id', requireAuth, requireRole(['super_admin', 'catalog_manager']), (req, res) => {
  try {
    dbHelpers.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    logAudit(req.user.id, 'DELETE_PRODUCT', 'PRODUCT', req.params.id, `Deleted product #${req.params.id}`, req);
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'فشل حذف المنتج' });
  }
});

export default router;
