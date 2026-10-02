import { dbHelpers } from '../db/index.js';

export function logAudit(userId, action, targetType, targetId, details, req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    dbHelpers.run(
      `INSERT INTO audit_logs (user_id, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, action, targetType, String(targetId || ''), details, String(ip)]
    );
  } catch (err) {
    console.error('[Audit Logger Error]:', err.message);
  }
}
