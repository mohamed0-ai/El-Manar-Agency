import jwt from 'jsonwebtoken';
import { dbHelpers } from '../db/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'almanar_secret_super_secure_key_2026';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.role_name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req, res, next) {
  let token = null;

  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie fallback
  if (!token && req.cookies && req.cookies.almanar_token) {
    token = req.cookies.almanar_token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch fresh user data from DB
    const user = dbHelpers.get(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role_id, r.name as role_name, r.title_ar as role_title_ar, r.title_en as role_title_en
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Token invalid or expired
    console.warn('[Auth Middleware] Invalid token:', err.message);
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة',
      error_en: 'Authentication required. Please log in.'
    });
  }
  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'غير مصرح: يرجى تسجيل الدخول',
        error_en: 'Unauthorized: Please log in'
      });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        error: 'صلاحيات غير كافية للوصول إلى هذا المورد',
        error_en: 'Forbidden: Insufficient role permissions'
      });
    }

    next();
  };
}
