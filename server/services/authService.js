// =======================================================
// server/services/authService.js
// Nghiệp vụ Xác thực người dùng qua SQL Server Logins
// Tham chiếu: Rule 04 & Rule.md mục 8
// =======================================================

const authRepository = require('../repositories/authRepository');

/**
 * Xác thực đăng nhập: gọi Repository → SP sp_XacThucTaiKhoan
 * Nếu SP throw 50001 → lỗi tự bung lên errorMiddleware
 * Nếu repository trả null → ném 401 tại đây
 * @param {string} username
 * @param {string} password
 * @returns {Object} { manv, hoTen, username, role }
 */
exports.authenticate = async (username, password) => {
  const user = await authRepository.verifyCredentials(username, password);

  // Phòng trường hợp SP chạy thành công nhưng không trả record
  if (!user) {
    const error = new Error('Không thể xác thực tài khoản. Vui lòng kiểm tra lại.');
    error.status = 401;
    throw error;
  }

  return user;
};

/**
 * Đổi mật khẩu: gọi Repository → SP sp_DoiMatKhau
 * SP tự kiểm tra mật khẩu cũ bằng PWDCOMPARE và ALTER LOGIN
 * @param {string} username
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {boolean}
 */
exports.changePassword = async (username, oldPassword, newPassword) => {
  return await authRepository.changePassword(username, oldPassword, newPassword);
};
