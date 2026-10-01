// =======================================================
// server/routes/authRoutes.js
// Định tuyến xác thực: Đăng nhập, Đăng xuất, Đổi mật mã
// =======================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Đổi mật mã yêu cầu đã đăng nhập
router.get('/change-password', authMiddleware, authController.showChangePasswordForm);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
