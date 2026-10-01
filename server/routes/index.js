// =======================================================
// server/routes/index.js
// Định tuyến trung tâm gom toàn bộ module routes
// Tham chiếu: Rule.md mục 5
// =======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Route Trực quan hóa & Kiểm tra Base UI Design System (Sapo SaaS ERP)
router.get('/preview', (req, res) => {
  res.locals.currentUser = {
    manv: 1,
    hoTen: 'Nguyễn Văn An',
    username: 'admin',
    role: 'Admin'
  };
  res.render('preview', { title: 'Design System Demo - Sapo Style' });
});

// Public route: Đăng nhập
router.use('/auth', require('./authRoutes'));

// Protected routes: Yêu cầu đăng nhập
router.use('/employees', authMiddleware, require('./employeeRoutes'));
router.use('/materials', authMiddleware, require('./materialRoutes'));
router.use('/orders', authMiddleware, require('./orderRoutes'));
router.use('/receipts', authMiddleware, require('./receiptRoutes'));
router.use('/issues', authMiddleware, require('./issueRoutes'));
router.use('/reports', authMiddleware, require('./reportRoutes'));

// Admin only routes: Quản trị login, sao lưu phục hồi
router.use('/admin', authMiddleware, requireAdmin, require('./adminRoutes'));

// Trang chủ mặc định
router.get('/', authMiddleware, (req, res) => {
  res.redirect('/employees');
});

module.exports = router;
