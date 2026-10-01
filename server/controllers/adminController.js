// =======================================================
// server/controllers/adminController.js
// Tiếp nhận Request / Response cho Quản trị hệ thống
// Tham chiếu: De.md Mục II.3 (Admin Only) & Rule 04
// =======================================================

const adminService = require('../services/adminService');

exports.showLogins = async (req, res, next) => {
  try {
    const logins = await adminService.getAllLogins();
    res.render('admin/logins', { title: 'Quản trị Logins', logins });
  } catch (err) {
    next(err);
  }
};

exports.createLogin = async (req, res, next) => {
  try {
    const { username, password, manv, role } = req.body;
    await adminService.createLogin({ username, password, manv, role });
    res.status(201).json({ success: true, message: 'Tạo login thành công.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteLogin = async (req, res, next) => {
  try {
    await adminService.deleteLogin(req.params.username);
    res.json({ success: true, message: 'Xóa login thành công.' });
  } catch (err) {
    next(err);
  }
};

exports.showBackupRestore = async (req, res, next) => {
  try {
    const backupHistory = await adminService.getBackupHistory();
    res.render('admin/backup', { title: 'Sao lưu & Phục hồi CSDL', backupHistory });
  } catch (err) {
    next(err);
  }
};

exports.backupDatabase = async (req, res, next) => {
  try {
    const { resetFile } = req.body;
    await adminService.backupDatabase(resetFile);
    res.json({ success: true, message: 'Sao lưu CSDL thành công.' });
  } catch (err) {
    next(err);
  }
};

exports.restoreDatabase = async (req, res, next) => {
  try {
    const { position } = req.body;
    await adminService.restoreDatabase(position);
    res.json({ success: true, message: 'Phục hồi CSDL thành công.' });
  } catch (err) {
    next(err);
  }
};
