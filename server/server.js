import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';

import { initDatabase, dbHelpers } from './db/index.js';
import { authenticate } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import brandsRoutes from './routes/brands.js';
import ordersRoutes from './routes/orders.js';
import paymentsRoutes from './routes/payments.js';
import servicesRoutes from './routes/services.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import calculatorRoutes from './routes/calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Initialize Database Schema & Auto-seed on fresh deployments
initDatabase();
try {
  const userCount = dbHelpers.get('SELECT COUNT(*) as count FROM users');
  if (!userCount || userCount.count === 0) {
    console.log('[Startup] Fresh database detected. Automatically seeding authentic Al-Manar data...');
    const { seed } = await import('./db/seed.js');
    await seed();
  }
} catch (e) {
  console.warn('[Startup] Auto-seed check warning:', e.message);
}

// 2. Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate Limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً بعد 15 دقيقة.'
  }
});
app.use('/api/', apiLimiter);

// 4. Global Auth Token Extractor
app.use(authenticate);

// 5. Static uploads directory
const uploadsDir = process.env.UPLOADS_PATH || path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calculator', calculatorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Al-Manar Trading Agencies E-Commerce & Service Management Platform',
    agency_location: 'Assiut, Egypt',
    timestamp: new Date().toISOString()
  });
});

// 7. Serve Frontend Production Build if present
const clientDistDir = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'حدث خطأ غير متوقع في الخادم',
    error_en: 'Internal server error occurred'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 شركة المنار للتكييف وفلاتر المياه والتوكيلات التجارية`);
  console.log(`📡 Al-Manar Backend API running on http://localhost:${PORT}`);
  console.log(`🏢 Assiut, Egypt | Hotlines: 01119461111 / 01114961111`);
  console.log(`=======================================================`);
});
