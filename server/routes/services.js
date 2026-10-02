import { Router } from 'express';
import { dbHelpers } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// 1. Book a new service / maintenance / installation request
router.post('/', async (req, res) => {
  try {
    const {
      customer_name, customer_phone, address, city,
      service_type, brand_id, copper_meters, ac_units_count, notes, preferred_date
    } = req.body;

    if (!customer_name || !customer_phone || !address || !service_type) {
      return res.status(400).json({
        success: false,
        error: 'يرجى استكمال البيانات الأساسية (الاسم، الهاتف، العنوان، نوع الخدمة المطلوبة)'
      });
    }

    // Retrieve copper pricing from settings
    const copperSetting = dbHelpers.get("SELECT value FROM system_settings WHERE key = 'copper_rate_per_meter'");
    const installSetting = dbHelpers.get("SELECT value FROM system_settings WHERE key = 'standard_installation_fee'");
    const copperRate = copperSetting ? Number(copperSetting.value) : 1150;
    const installRate = installSetting ? Number(installSetting.value) : 800;

    let estimated_cost = 0;
    const meters = Number(copper_meters) || 0;
    const units = Math.max(1, Number(ac_units_count) || 1);

    if (service_type === 'copper_piping_extension') {
      estimated_cost = meters * copperRate;
    } else if (service_type === 'ac_installation') {
      estimated_cost = units * installRate + (meters * copperRate);
    } else if (service_type === 'annual_contract') {
      estimated_cost = 13500; // Starting baseline
    } else if (service_type === 'emergency_repair') {
      estimated_cost = 450;
    } else if (service_type === 'water_filter_maintenance') {
      estimated_cost = 350;
    }

    const request_code = `SRV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : null;

    const result = dbHelpers.run(
      `INSERT INTO service_requests (
        request_code, user_id, customer_name, customer_phone,
        address, city, service_type, brand_id, copper_meters,
        ac_units_count, notes, status, scheduled_date, estimated_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [
        request_code, userId, customer_name.trim(), customer_phone.trim(),
        address.trim(), city || 'أسيوط', service_type, brand_id || null,
        meters, units, notes || '', preferred_date || null, estimated_cost
      ]
    );

    if (userId) {
      logAudit(userId, 'CREATE_SERVICE_REQUEST', 'SERVICE_REQUEST', result.lastInsertRowid, `Booked ${service_type} (${request_code})`, req);
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل طلب الصيانة والخدمة الهندسية بنجاح، وسيتواصل معكم فريق الدعم الفني لتأكيد الموعد.',
      service: {
        id: result.lastInsertRowid,
        request_code,
        service_type,
        estimated_cost,
        status: 'Pending'
      }
    });
  } catch (err) {
    console.error('Service request error:', err);
    res.status(500).json({ success: false, error: 'تعذر تسجيل طلب الخدمة' });
  }
});

// 2. Customer view their own service requests
router.get('/my-services', requireAuth, (req, res) => {
  try {
    const services = dbHelpers.all(
      `SELECT s.*, b.name as brand_name
       FROM service_requests s
       LEFT JOIN brands b ON s.brand_id = b.id
       WHERE s.user_id = ?
       ORDER BY s.id DESC`,
      [req.user.id]
    );
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب سجل خدماتك' });
  }
});

// 3. Dispatcher / Super Admin view all service requests
router.get('/', requireAuth, requireRole(['super_admin', 'dispatcher']), (req, res) => {
  try {
    const { status, service_type, q } = req.query;

    let sql = `
      SELECT s.*, b.name as brand_name
      FROM service_requests s
      LEFT JOIN brands b ON s.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    if (service_type) {
      sql += ' AND s.service_type = ?';
      params.push(service_type);
    }

    if (q) {
      const searchPattern = `%${q.trim()}%`;
      sql += ' AND (s.request_code LIKE ? OR s.customer_name LIKE ? OR s.customer_phone LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY s.id DESC';

    const services = dbHelpers.all(sql, params);
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, error: 'تعذر جلب طلبات الخدمات والصيانة' });
  }
});

// 4. Dispatcher / Super Admin update service request (assign technician, update status, schedule date)
router.put('/:id', requireAuth, requireRole(['super_admin', 'dispatcher']), (req, res) => {
  try {
    const { status, assigned_technician, scheduled_date, notes, estimated_cost } = req.body;
    const service = dbHelpers.get('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);

    if (!service) {
      return res.status(404).json({ success: false, error: 'طلب الخدمة غير موجود' });
    }

    dbHelpers.run(
      `UPDATE service_requests SET
        status = COALESCE(?, status),
        assigned_technician = COALESCE(?, assigned_technician),
        scheduled_date = COALESCE(?, scheduled_date),
        notes = COALESCE(?, notes),
        estimated_cost = COALESCE(?, estimated_cost),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, assigned_technician, scheduled_date, notes, estimated_cost, req.params.id]
    );

    logAudit(
      req.user.id,
      'UPDATE_SERVICE_REQUEST',
      'SERVICE_REQUEST',
      req.params.id,
      `Updated request ${service.request_code}: status=${status}, technician=${assigned_technician}`,
      req
    );

    res.json({ success: true, message: 'تم تحديث بيانات ومسار طلب الخدمة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'فشل تحديث طلب الصيانة' });
  }
});

export default router;
