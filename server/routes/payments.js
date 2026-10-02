import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadReceipt } from '../middleware/upload.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. Upload Payment Receipt Proof (InstaPay / Vodafone Cash / Bank Transfer)
router.post('/upload-receipt', requireAuth, uploadReceipt.single('receipt'), (req, res) => {
  try {
    const { order_id, method, sender_number_or_handle, reference_number } = req.body;

    if (!order_id || !method || !sender_number_or_handle || !reference_number) {
      return res.status(400).json({
        success: false,
        error: 'جميع بيانات إشعار الدفع مطلوبة (رقم الطلب، الطريقة، رقم/حساب المحول، رقم مرجع العملية)'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إرفاق صورة إيصال أو لقطة شاشة التحويل'
      });
    }

    // Verify order exists and belongs to customer (or is admin)
    const order = dbHelpers.get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود' });
    }

    const isStaff = ['super_admin', 'sales_officer'].includes(req.user.role_name);
    if (!isStaff && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'غير مصرح لك برفع إشعار دفع لهذا الطلب' });
    }

    const receipt_image_url = `/uploads/${req.file.filename}`;

    const receiptRes = dbHelpers.run(
      `INSERT INTO payment_receipts (
        order_id, method, sender_number_or_handle, reference_number,
        receipt_image_url, status
      ) VALUES (?, ?, ?, ?, ?, 'Pending_Verification')`,
      [order_id, method, sender_number_or_handle.trim(), reference_number.trim(), receipt_image_url]
    );

    // Update order payment status to Pending_Payment_Verification
    dbHelpers.run(
      `UPDATE orders SET
        payment_status = 'Pending_Payment_Verification',
        payment_method = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [method, order_id]
    );

    logAudit(
      req.user.id,
      'RECEIPT_UPLOADED',
      'PAYMENT_RECEIPT',
      receiptRes.lastInsertRowid,
      `Uploaded ${method} receipt for order #${order.order_code}, ref: ${reference_number}`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'تم رفع إشعار الدفع بنجاح، جاري المراجعة والاعتماد من الإدارة المالية للمنار.',
      receipt_id: receiptRes.lastInsertRowid,
      receipt_url: receipt_image_url
    });
  } catch (err) {
    console.error('Receipt upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'فشل رفع إشعار الدفع' });
  }
});

// 2. View all receipts for Sales Officer / Super Admin
router.get('/receipts', requireAuth, requireRole(['super_admin', 'sales_officer']), (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT pr.*, o.order_code, o.total_amount, o.customer_name, o.customer_phone,
             u.full_name as verified_by_name
      FROM payment_receipts pr
      JOIN orders o ON pr.order_id = o.id
      LEFT JOIN users u ON pr.verified_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND pr.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY pr.id DESC';

    const receipts = dbHelpers.all(sql, params);
    res.json({ success: true, count: receipts.length, receipts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب إيصالات الدفع' });
  }
});

// 3. Verify Payment Receipt Proof (Approve or Reject)
router.post('/verify/:id', requireAuth, requireRole(['super_admin', 'sales_officer']), (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const receipt = dbHelpers.get('SELECT * FROM payment_receipts WHERE id = ?', [req.params.id]);

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'إشعار الدفع غير موجود' });
    }

    if (action === 'approve') {
      dbHelpers.run(
        `UPDATE payment_receipts SET
          status = 'Approved',
          verified_by = ?,
          verification_notes = ?,
          verified_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.user.id, notes || 'تم التحقق من استلام المبلغ واعتماده', receipt.id]
      );

      // Transition order status to Paid and Processing
      dbHelpers.run(
        `UPDATE orders SET
          payment_status = 'Paid',
          order_status = CASE WHEN order_status = 'Pending' THEN 'Processing' ELSE order_status END,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [receipt.order_id]
      );

      logAudit(
        req.user.id,
        'APPROVE_PAYMENT',
        'PAYMENT_RECEIPT',
        receipt.id,
        `Approved payment for order #${receipt.order_id}. Notes: ${notes || ''}`,
        req
      );

      return res.json({
        success: true,
        message: 'تم اعتماد إيصال الدفع بنجاح وتحديث حالة الطلب إلى (تم الدفع - جاري التجهيز)'
      });
    } else if (action === 'reject') {
      dbHelpers.run(
        `UPDATE payment_receipts SET
          status = 'Rejected',
          verified_by = ?,
          verification_notes = ?,
          verified_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.user.id, notes || 'تم رفض الإيصال لعدم مطابقة البيانات', receipt.id]
      );

      dbHelpers.run(
        `UPDATE orders SET
          payment_status = 'Rejected',
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [receipt.order_id]
      );

      logAudit(
        req.user.id,
        'REJECT_PAYMENT',
        'PAYMENT_RECEIPT',
        receipt.id,
        `Rejected payment for order #${receipt.order_id}. Reason: ${notes || ''}`,
        req
      );

      return res.json({
        success: true,
        message: 'تم رفض إشعار الدفع، وتم إشعار العميل بإمكانية إعادة رفع إشعار صحيح.'
      });
    } else {
      return res.status(400).json({ success: false, error: 'الإجراء غير صالح. اختر approve أو reject' });
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, error: 'فشل معالجة التحقق من الدفع' });
  }
});

export default router;
