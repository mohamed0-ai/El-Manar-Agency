import { Router } from 'express';
import { dbHelpers, db } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. Create Order (Authenticated or Guest converted to User)
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      customer_name, customer_phone, shipping_address, city,
      payment_method, items, notes
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'سلة المشتريات فارغة' });
    }

    if (!customer_name || !customer_phone || !shipping_address || !payment_method) {
      return res.status(400).json({ success: false, error: 'يرجى استكمال بيانات التوصيل وطريقة الدفع' });
    }

    // Verify products and calculate amounts
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const p = dbHelpers.get('SELECT id, title_ar, price, discount_price, stock_quantity FROM products WHERE id = ?', [item.product_id]);
      if (!p) {
        return res.status(404).json({ success: false, error: `المنتج رقم ${item.product_id} غير متوفر` });
      }
      const unitPrice = p.discount_price ? p.discount_price : p.price;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const totalItem = unitPrice * quantity;
      subtotal += totalItem;

      verifiedItems.push({
        product_id: p.id,
        product_title: p.title_ar,
        unit_price: unitPrice,
        quantity,
        total_price: totalItem
      });
    }

    const shipping_fee = 0; // Free shipping in Assiut
    const total_amount = subtotal + shipping_fee;

    const order_code = `ALM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialPaymentStatus = (payment_method === 'cod') ? 'Pending' : 'Pending_Payment_Verification';
    const initialOrderStatus = (payment_method === 'cod') ? 'Processing' : 'Pending';

    // Insert Order
    const orderRes = dbHelpers.run(
      `INSERT INTO orders (
        order_code, user_id, customer_name, customer_phone,
        shipping_address, city, subtotal_amount, shipping_fee, total_amount,
        payment_method, payment_status, order_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_code, req.user.id, customer_name.trim(), customer_phone.trim(),
        shipping_address.trim(), city || 'أسيوط', subtotal, shipping_fee, total_amount,
        payment_method, initialPaymentStatus, initialOrderStatus, notes || ''
      ]
    );

    const orderId = orderRes.lastInsertRowid;

    // Insert Order Items & decrease stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_title, unit_price, quantity, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare('UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?');

    for (const v of verifiedItems) {
      insertItem.run(orderId, v.product_id, v.product_title, v.unit_price, v.quantity, v.total_price);
      updateStock.run(v.quantity, v.product_id);
    }

    logAudit(req.user.id, 'CREATE_ORDER', 'ORDER', orderId, `Created order ${order_code} for EGP ${total_amount}`, req);

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        order_code,
        total_amount,
        payment_method,
        payment_status: initialPaymentStatus,
        order_status: initialOrderStatus
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'فشل إتمام الطلب' });
  }
});

// 2. Get customer's orders
router.get('/my-orders', requireAuth, (req, res) => {
  try {
    const orders = dbHelpers.all(
      `SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
        (SELECT json_group_array(
          json_object(
            'id', pr.id,
            'method', pr.method,
            'status', pr.status,
            'sender_number_or_handle', pr.sender_number_or_handle,
            'reference_number', pr.reference_number,
            'receipt_image_url', pr.receipt_image_url,
            'verification_notes', pr.verification_notes,
            'created_at', pr.created_at
          )
        ) FROM payment_receipts pr WHERE pr.order_id = o.id) as receipts_json
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [req.user.id]
    );

    const parsedOrders = orders.map(o => ({
      ...o,
      receipts: o.receipts_json ? JSON.parse(o.receipts_json) : []
    }));

    res.json({ success: true, orders: parsedOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب طلباتك' });
  }
});

// 3. Admin / Sales Officer: View all orders
router.get('/', requireAuth, requireRole(['super_admin', 'sales_officer']), (req, res) => {
  try {
    const { payment_status, order_status, q } = req.query;

    let sql = `
      SELECT o.*, u.email as user_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
        (SELECT json_group_array(
          json_object(
            'id', pr.id,
            'method', pr.method,
            'status', pr.status,
            'sender_number_or_handle', pr.sender_number_or_handle,
            'reference_number', pr.reference_number,
            'receipt_image_url', pr.receipt_image_url,
            'verification_notes', pr.verification_notes,
            'created_at', pr.created_at
          )
        ) FROM payment_receipts pr WHERE pr.order_id = o.id) as receipts_json
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (payment_status) {
      sql += ' AND o.payment_status = ?';
      params.push(payment_status);
    }

    if (order_status) {
      sql += ' AND o.order_status = ?';
      params.push(order_status);
    }

    if (q) {
      const searchPattern = `%${q.trim()}%`;
      sql += ' AND (o.order_code LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY o.id DESC';

    const orders = dbHelpers.all(sql, params).map(o => ({
      ...o,
      receipts: o.receipts_json ? JSON.parse(o.receipts_json) : []
    }));

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب سجل الطلبات' });
  }
});

// 4. Single order details with items & receipts
router.get('/:id', requireAuth, (req, res) => {
  try {
    const order = dbHelpers.get(
      `SELECT o.*, u.email as user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }

    // Role check: Only order owner or admin/sales officer
    const isStaff = ['super_admin', 'sales_officer'].includes(req.user.role_name);
    if (!isStaff && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'غير مصرح بعرض هذا الطلب' });
    }

    const items = dbHelpers.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const receipts = dbHelpers.all('SELECT * FROM payment_receipts WHERE order_id = ? ORDER BY id DESC', [order.id]);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        receipts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update Order fulfillment status (super_admin, sales_officer)
router.put('/:id/status', requireAuth, requireRole(['super_admin', 'sales_officer']), (req, res) => {
  try {
    const { order_status, payment_status, notes } = req.body;
    const order = dbHelpers.get('SELECT id, order_code, order_status, payment_status FROM orders WHERE id = ?', [req.params.id]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }

    dbHelpers.run(
      `UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [order_status, payment_status, notes, req.params.id]
    );

    logAudit(
      req.user.id,
      'UPDATE_ORDER_STATUS',
      'ORDER',
      req.params.id,
      `Order ${order.order_code} updated to: status=${order_status}, payment=${payment_status}`,
      req
    );

    res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'فشل تحديث حالة الطلب' });
  }
});

export default router;
