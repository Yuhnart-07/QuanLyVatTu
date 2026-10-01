// =======================================================
// server/repositories/receiptRepository.js
// Gọi Stored Procedure cho Phiếu nhập hàng (Master-Detail)
// BẮT BUỘC TUÂN THỦ RULE 01:
//   Mảng details được ép thành JSON string và truyền qua @ChiTietJSON
// Tham chiếu: Rule.md mục 10 & Rule 01
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAll = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_PhieuNhap_GetAll');
  return result.recordset;
};

exports.getById = async (mapn) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MAPN', sql.NChar(8), mapn)
    .execute('sp_PhieuNhap_GetById');

  const master = result.recordsets[0][0] || null;
  const details = result.recordsets[1] || [];

  return master ? { ...master, details } : null;
};

exports.create = async ({ mapn, masoDDH, manv, details }) => {
  const pool = await getPool();

  // BẮT BUỘC THEO RULE 01: Ép mảng detail thành JSON string
  const detailJson = JSON.stringify(details);

  await pool.request()
    .input('MAPN', sql.NChar(8), mapn)
    .input('MasoDDH', sql.NVarChar(8), masoDDH)
    .input('MANV', sql.Int, manv)
    .input('ChiTietJSON', sql.NVarChar(sql.MAX), detailJson)
    .execute('sp_PhieuNhap_Create');

  return { mapn, masoDDH, manv };
};

exports.delete = async (mapn) => {
  const pool = await getPool();
  await pool.request()
    .input('MAPN', sql.NChar(8), mapn)
    .execute('sp_PhieuNhap_Delete');
  return true;
};
