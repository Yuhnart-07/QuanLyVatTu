// =======================================================
// server/repositories/authRepository.js
// Tầng truy xuất CSDL duy nhất cho xác thực
// 100% gọi Stored Procedure qua SQL Server Connection Pool
// Tham chiếu: Rule.md mục 9, 12 & Rule 04
// =======================================================

const { getPool, sql } = require('../config/database');

exports.verifyCredentials = async (username, password) => {
  const pool = await getPool();
  // Gọi Stored Procedure xác thực
  const result = await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .input('Password', sql.NVarChar(50), password)
    .execute('sp_Auth_Login');

  return result.recordset[0];
};

exports.changePassword = async (username, oldPassword, newPassword) => {
  const pool = await getPool();
  await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .input('OldPassword', sql.NVarChar(50), oldPassword)
    .input('NewPassword', sql.NVarChar(50), newPassword)
    .execute('sp_Auth_ChangePassword');
  return true;
};
