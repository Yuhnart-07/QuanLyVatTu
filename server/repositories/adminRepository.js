// =======================================================
// server/repositories/adminRepository.js
// Gọi Stored Procedure cho Quản trị đăng nhập và Backup/Restore
// Tham chiếu: Rule 04 & De.md Mục II.3
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAllLogins = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Auth_GetLoggedInEmployees');
  return result.recordset;
};

exports.createLogin = async ({ username, password, manv, role }) => {
  const pool = await getPool();
  await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .input('Password', sql.NVarChar(50), password)
    .input('MANV', sql.Int, manv)
    .input('Role', sql.NVarChar(20), role)
    .execute('sp_Auth_CreateLogin');
  return true;
};

exports.deleteLogin = async (username) => {
  const pool = await getPool();
  await pool.request()
    .input('Username', sql.NVarChar(50), username)
    .execute('sp_Auth_DeleteLogin');
  return true;
};

exports.getBackupHistory = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Backup_GetHistory');
  return result.recordset;
};

exports.backupDatabase = async (resetFile) => {
  const pool = await getPool();
  await pool.request()
    .input('ResetFile', sql.Bit, resetFile ? 1 : 0)
    .execute('sp_Backup_Create');
  return true;
};

exports.restoreDatabase = async (position) => {
  const pool = await getPool();
  await pool.request()
    .input('Position', sql.Int, position)
    .execute('sp_Backup_Restore');
  return true;
};
