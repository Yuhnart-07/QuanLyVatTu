// =======================================================
// server/routes/adminRoutes.js
// Định tuyến quản trị hệ thống: Logins, Backup/Restore
// Tham chiếu: De.md Mục II.3 (Chỉ Admin)
// =======================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Quản lý Logins
router.get('/logins', adminController.showLogins);
router.post('/logins', adminController.createLogin);
router.delete('/logins/:username', adminController.deleteLogin);

// Sao lưu và Phục hồi CSDL
router.get('/backup-restore', adminController.showBackupRestore);
router.post('/backup', adminController.backupDatabase);
router.post('/restore', adminController.restoreDatabase);

module.exports = router;
