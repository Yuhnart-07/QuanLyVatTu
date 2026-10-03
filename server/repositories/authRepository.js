// =======================================================
// server/repositories/authRepository.js
// Tầng truy xuất CSDL duy nhất cho xác thực
// 100% gọi Stored Procedure qua SQL Server Connection Pool
// Tham chiếu: Rule.md mục 9, 12 & Rule 04
// SP: sp_XacThucTaiKhoan, sp_DoiMatKhau
// =======================================================

const { getPool, sql } = require('../config/database');

/**
 * Xác thực tài khoản đăng nhập qua SP sp_XacThucTaiKhoan
 * SP dùng PWDCOMPARE để kiểm tra mật khẩu, trích xuất MANV theo quy ước NV_{MANV}
 * @param {string} username - Tên đăng nhập SQL Server Login (VD: NV_1)
 * @param {string} password - Mật khẩu người dùng nhập
 * @returns {Object|null} { manv, hoTen, username, role } hoặc null
 */
exports.verifyCredentials = async (username, password) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .input('Password', sql.NVarChar(100), password)
    .execute('sp_XacThucTaiKhoan');

  // Null-guard: SP có thể không trả về record nếu MANV không tồn tại
  if (!result.recordset || result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
};

/**
 * Đổi mật khẩu tài khoản SQL Server Login qua SP sp_DoiMatKhau
 * @param {string} username - Tên đăng nhập hiện tại
 * @param {string} oldPassword - Mật khẩu cũ cần xác minh
 * @param {string} newPassword - Mật khẩu mới
 * @returns {boolean} true nếu thành công
 */
exports.changePassword = async (username, oldPassword, newPassword) => {
  const pool = await getPool();
  await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .input('OldPassword', sql.NVarChar(100), oldPassword)
    .input('NewPassword', sql.NVarChar(100), newPassword)
    .execute('sp_DoiMatKhau');

  return true;
};
