import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole(['super_admin']), (req, res) => {
  try {
    // Total Revenue from Paid Orders
    const revenueRow = dbHelpers.get(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders
       WHERE payment_status = 'Paid'`
    );

    // Pending Payments Amount
    const pendingRevRow = dbHelpers.get(
      `SELECT COALESCE(SUM(total_amount), 0) as pending_revenue
       FROM orders
       WHERE payment_status = 'Pending_Payment_Verification'`
    );

    // Counts
    const ordersCountRow = dbHelpers.get('SELECT COUNT(*) as total_orders FROM orders');
    const pendingProofsRow = dbHelpers.get("SELECT COUNT(*) as pending_proofs FROM payment_receipts WHERE status = 'Pending_Verification'");
    const activeServicesRow = dbHelpers.get("SELECT COUNT(*) as active_services FROM service_requests WHERE status IN ('Pending', 'Scheduled', 'In_Progress')");
    const productsCountRow = dbHelpers.get('SELECT COUNT(*) as total_products FROM products');
    const usersCountRow = dbHelpers.get('SELECT COUNT(*) as total_users FROM users');

    // Recent Audit Logs
    const recentLogs = dbHelpers.all(`
      SELECT a.*, u.full_name, u.email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
      LIMIT 8
    `);

    // Category Sales breakdown
    const categoryStats = dbHelpers.all(`
      SELECT c.name_ar, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
    `);

    // Monthly orders summary
    const ordersByStatus = dbHelpers.all(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `);

    res.json({
      success: true,
      metrics: {
        total_revenue: revenueRow.total_revenue,
        pending_revenue: pendingRevRow.pending_revenue,
        total_orders: ordersCountRow.total_orders,
        pending_proofs: pendingProofsRow.pending_proofs,
        active_services: activeServicesRow.active_services,
        total_products: productsCountRow.total_products,
        total_users: usersCountRow.total_users
      },
      categoryStats,
      ordersByStatus,
      recentLogs
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'تعذر جلب التقارير المالية والإحصائية' });
  }
});

export default router;
