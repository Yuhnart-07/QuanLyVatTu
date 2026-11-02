// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/controllers/adminController.js
// Mô tả: Tiếp nhận HTTP Request và gửi trả HTTP Response cho Quản trị hệ thống (Mục 3.1 & 3.2).
// Tham chiếu: Rule.md mục 7, De.md Mục II.3 (Chỉ Admin có quyền)
// ====================================================================================

const adminService = require('../services/adminService');

/**
 * Hiển thị giao diện Form Tạo / Xóa Login (Mục 3.1)
 * Hoặc trả về JSON danh sách tài khoản nếu là AJAX request
 * GET /admin/logins
 */
exports.showLogins = async (req, res, next) => {
  try {
    const logins = await adminService.getAllLogins();

    // Hỗ trợ trả về JSON cho client AJAX tải lại dữ liệu không cần F5
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, logins });
    }

    res.render('admin/logins', {
      title: 'Quản lý tài khoản đăng nhập (Tạo / Xóa Login)',
      logins,
      path: '/admin/logins'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý tạo mới tài khoản Login SQL Server (Mục 3.1)
 * POST /admin/logins
 */
exports.createLogin = async (req, res, next) => {
  try {
    const { manv, username, password, role } = req.body;
    await adminService.createLogin({ manv, username, password, role });
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản đăng nhập thành công.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý xóa tài khoản Login SQL Server (Mục 3.1)
 * DELETE /admin/logins/:username
 */
exports.deleteLogin = async (req, res, next) => {
  try {
    const { username } = req.params;
    // Truyền thông tin người dùng hiện tại (req.user) để kiểm tra chặn tự xóa
    await adminService.deleteLogin(username, req.user);
    res.json({
      success: true,
      message: 'Xóa tài khoản đăng nhập thành công.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Hiển thị giao diện Sao lưu - Phục hồi CSDL (Mục 3.2)
 * GET /admin/backup-restore
 */
exports.showBackupRestore = async (req, res, next) => {
  try {
    const backupHistory = await adminService.getBackupHistory();
    res.render('admin/backup', {
      title: 'Sao lưu & Phục hồi CSDL',
      backupHistory,
      path: '/admin/backup'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý yêu cầu sao lưu CSDL
 * POST /admin/backup
 */
exports.backupDatabase = async (req, res, next) => {
  try {
    const { resetFile } = req.body;
    await adminService.backupDatabase(resetFile);
    res.json({
      success: true,
      message: 'Sao lưu CSDL thành công.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Xử lý yêu cầu phục hồi CSDL
 * POST /admin/restore
 */
exports.restoreDatabase = async (req, res, next) => {
  try {
    const { position } = req.body;
    await adminService.restoreDatabase(position);
    res.json({
      success: true,
      message: 'Phục hồi CSDL thành công.'
    });
  } catch (err) {
    next(err);
  }
};
