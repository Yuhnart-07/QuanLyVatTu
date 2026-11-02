// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/routes/adminRoutes.js
// Mô tả: Định tuyến các chức năng Quản trị hệ thống (Chỉ dành cho Admin).
//         Luồng: Route -> Validator Middleware -> Controller
// Tham chiếu: Rule.md mục 5 & 6, De.md Mục II.3
// Lưu ý: Toàn bộ router này đã được bảo vệ tập trung tại server/routes/index.js
//        bằng authMiddleware và requireAdmin (chặn nhóm Nhanvien bằng HTTP 403 Forbidden).
// ====================================================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateCreateLogin, validateDeleteLogin } = require('../validators/adminValidator');

// ------------------------------------------------------------------------------------
// PHÂN HỆ QUẢN LÝ TÀI KHOẢN ĐĂNG NHẬP (MỤC 3.1)
// ------------------------------------------------------------------------------------

// Hiển thị Form Tạo / Xóa Login và Bảng đối soát tài khoản
router.get('/logins', adminController.showLogins);

// Tạo mới tài khoản Login SQL Server (qua Validator kiểm tra dữ liệu sạch)
router.post('/logins', validateCreateLogin, adminController.createLogin);

// Xóa tài khoản Login SQL Server (qua Validator kiểm tra tên tài khoản hợp lệ)
router.delete('/logins/:username', validateDeleteLogin, adminController.deleteLogin);

// ------------------------------------------------------------------------------------
// PHÂN HỆ SAO LƯU & PHỤC HỒI CSDL (MỤC 3.2)
// ------------------------------------------------------------------------------------

// Hiển thị danh sách các bản backup
router.get('/backup-restore', adminController.showBackupRestore);

// Thực thi sao lưu CSDL ra file .bak
router.post('/backup', adminController.backupDatabase);

// Thực thi phục hồi CSDL theo mốc thời gian
router.post('/restore', adminController.restoreDatabase);

module.exports = router;
