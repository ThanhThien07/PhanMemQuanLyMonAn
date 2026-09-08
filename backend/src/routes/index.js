import express from 'express';
import authRoutes from './authRoutes.js';
import dishRoutes from './dishRoutes.js';
import tableRoutes from './tableRoutes.js';
import orderRoutes from './orderRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import customerRoutes from './customerRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = express.Router();

// Root API Health & Meta
router.get('/', (req, res) => {
  res.json({
    name: 'Hệ Thống Quản Lý Nhà Hàng & Món Ăn (REST API)',
    version: '1.2.0',
    status: 'ONLINE',
    author: 'Nhóm 5 - Nguyễn Ngọc Hà Thảo',
    subject: 'Chuyên Đề Backend',
    modules: {
      auth: '/api/auth',
      dishes: '/api/dishes',
      categories: '/api/dishes/categories',
      tables: '/api/tables',
      orders: '/api/orders',
      kitchen: '/api/orders/kitchen',
      reservations: '/api/reservations',
      inventory: '/api/inventory/ingredients',
      suppliers: '/api/inventory/suppliers',
      customers: '/api/customers',
      reports: '/api/reports/summary'
    }
  });
});

// Register feature routes
router.use('/auth', authRoutes);
router.use('/dishes', dishRoutes);
router.use('/tables', tableRoutes);
router.use('/orders', orderRoutes);
router.use('/reservations', reservationRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customerRoutes);
router.use('/reports', reportRoutes);

export default router;
