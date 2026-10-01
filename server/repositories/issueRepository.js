// =======================================================
// server/repositories/issueRepository.js
// Gọi Stored Procedure cho Phiếu xuất kho (Master-Detail)
// BẮT BUỘC TUÂN THỦ RULE 01:
//   Mảng details được ép thành JSON string và truyền qua @ChiTietJSON
// Tham chiếu: Rule.md mục 10 & Rule 01
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAll = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_PhieuXuat_GetAll');
  return result.recordset;
};

exports.getById = async (mapx) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MAPX', sql.NChar(8), mapx)
    .execute('sp_PhieuXuat_GetById');

  const master = result.recordsets[0][0] || null;
  const details = result.recordsets[1] || [];

  return master ? { ...master, details } : null;
};

exports.create = async ({ mapx, hotenkh, manv, details }) => {
  const pool = await getPool();

  // BẮT BUỘC THEO RULE 01: Ép mảng detail thành JSON string
  const detailJson = JSON.stringify(details);

  await pool.request()
    .input('MAPX', sql.NChar(8), mapx)
    .input('HOTENKH', sql.NVarChar(100), hotenkh)
    .input('MANV', sql.Int, manv)
    .input('ChiTietJSON', sql.NVarChar(sql.MAX), detailJson)
    .execute('sp_PhieuXuat_Create');

  return { mapx, hotenkh, manv };
};

exports.delete = async (mapx) => {
  const pool = await getPool();
  await pool.request()
    .input('MAPX', sql.NChar(8), mapx)
    .execute('sp_PhieuXuat_Delete');
  return true;
};
