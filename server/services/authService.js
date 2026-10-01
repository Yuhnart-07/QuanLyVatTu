// =======================================================
// server/services/authService.js
// Nghiệp vụ Xác thực người dùng qua SQL Server Logins
// Tham chiếu: Rule 04 & Rule.md mục 8
// =======================================================

const authRepository = require('../repositories/authRepository');

exports.authenticate = async (username, password) => {
  if (!username || !password) {
    const error = new Error('Vui lòng nhập tên đăng nhập và mật khẩu.');
    error.status = 400;
    throw error;
  }
  return await authRepository.verifyCredentials(username, password);
};

exports.changePassword = async (username, oldPassword, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    const error = new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
    error.status = 400;
    throw error;
  }
  return await authRepository.changePassword(username, oldPassword, newPassword);
};
