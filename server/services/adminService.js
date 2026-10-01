// =======================================================
// server/services/adminService.js
// Nghiệp vụ Quản trị hệ thống (Logins, Backup, Restore)
// Tham chiếu: Rule 04 & De.md Mục II.3
// =======================================================

const adminRepository = require('../repositories/adminRepository');

exports.getAllLogins = async () => {
  return await adminRepository.getAllLogins();
};

exports.createLogin = async (data) => {
  return await adminRepository.createLogin(data);
};

exports.deleteLogin = async (username) => {
  return await adminRepository.deleteLogin(username);
};

exports.getBackupHistory = async () => {
  return await adminRepository.getBackupHistory();
};

exports.backupDatabase = async (resetFile) => {
  return await adminRepository.backupDatabase(resetFile);
};

exports.restoreDatabase = async (position) => {
  return await adminRepository.restoreDatabase(position);
};
