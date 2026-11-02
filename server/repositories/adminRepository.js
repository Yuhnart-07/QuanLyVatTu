// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/repositories/adminRepository.js
// Mô tả: Tầng truy xuất CSDL duy nhất cho Quản trị hệ thống (Mục 3.1 & 3.2).
//         100% gọi Stored Procedure qua Connection Pool chung của ứng dụng.
// Tham chiếu: Rule.md mục 9 & 12, Rule 04, De.md Mục II.3
// SP sử dụng: sp_Login_GetAll, sp_TaoLogin, sp_XoaLogin
// ====================================================================================

const { getPool, sql } = require('../config/database');

/**
 * Lấy danh sách toàn bộ nhân viên kèm trạng thái tài khoản Login trên SQL Server
 * Gọi Stored Procedure: sp_Login_GetAll
 * @returns {Promise<Array>} Danh sách bản ghi { MANV, HO, TEN, HoTen, HasLogin, Username, Role }
 */
exports.getAllLogins = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Login_GetAll');
  return result.recordset;
};

/**
 * Tạo Login SQL Server, Database User (tên MANV) và gán Role theo quy trình 5 bước chuẩn
 * Gọi Stored Procedure: sp_TaoLogin
 * @param {Object} param0 { manv, username, password, role }
 * @returns {Promise<boolean>}
 */
exports.createLogin = async ({ manv, username, password, role }) => {
  const pool = await getPool();
  await pool.request()
    .input('MANV', sql.Int, manv)
    .input('LoginName', sql.NVarChar(50), username)
    .input('Password', sql.NVarChar(100), password)
    .input('Role', sql.NVarChar(20), role)
    .execute('sp_TaoLogin');
  return true;
};

/**
 * Xóa Server Login, thu hồi Role và Database User liên kết
 * Gọi Stored Procedure: sp_XoaLogin
 * @param {string} username - Tên đăng nhập SQL Server cần xóa
 * @returns {Promise<boolean>}
 */
exports.deleteLogin = async (username) => {
  const pool = await getPool();
  await pool.request()
    .input('LoginName', sql.NVarChar(50), username)
    .execute('sp_XoaLogin');
  return true;
};

/**
 * Lấy lịch sử các bản sao lưu cơ sở dữ liệu
 * @returns {Promise<Array>}
 */
exports.getBackupHistory = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Backup_GetHistory');
  return result.recordset;
};

/**
 * Thực hiện sao lưu cơ sở dữ liệu
 * @param {boolean} resetFile
 * @returns {Promise<boolean>}
 */
exports.backupDatabase = async (resetFile) => {
  const pool = await getPool();
  await pool.request()
    .input('ResetFile', sql.Bit, resetFile ? 1 : 0)
    .execute('sp_Backup_Create');
  return true;
};

/**
 * Phục hồi cơ sở dữ liệu từ bản backup chỉ định
 * @param {number} position
 * @returns {Promise<boolean>}
 */
exports.restoreDatabase = async (position) => {
  const pool = await getPool();
  await pool.request()
    .input('Position', sql.Int, position)
    .execute('sp_Backup_Restore');
  return true;
};
