// =======================================================
// server/routes/authRoutes.js
// Định tuyến xác thực: Đăng nhập, Đăng xuất, Đổi mật mã
// Luồng chuẩn Clean MVC: Route → Validator → Controller
// Tham chiếu: Rule.md mục 5 & 6, ImplementMap.md mục 7.1
// =======================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateLogin, validateChangePassword } = require('../validators/auth.validator');

// Đăng nhập (Public - không cần authMiddleware)
router.get('/login', authController.showLoginForm);
router.post('/login', validateLogin, authController.login);

// Đăng xuất
router.post('/logout', authController.logout);

// Đổi mật mã (yêu cầu đã đăng nhập + qua validator)
router.get('/change-password', authMiddleware, authController.showChangePasswordForm);
router.post('/change-password', authMiddleware, validateChangePassword, authController.changePassword);

module.exports = router;
