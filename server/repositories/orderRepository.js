// =======================================================
// server/repositories/orderRepository.js
// Gọi Stored Procedure cho Đơn đặt hàng (Master-Detail)
// BẮT BUỘC TUÂN THỦ RULE 01:
//   Mảng details được ép thành JSON string và truyền qua @ChiTietJSON
// Tham chiếu: Rule.md mục 10 & Rule 01
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAll = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_DatHang_GetAll');
  return result.recordset;
};

exports.getById = async (masoDDH) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MasoDDH', sql.NChar(8), masoDDH)
    .execute('sp_DatHang_GetById');

  // Stored Procedure trả về 2 recordset: Master và Details
  const master = result.recordsets[0][0] || null;
  const details = result.recordsets[1] || [];

  return master ? { ...master, details } : null;
};

exports.create = async ({ masoDDH, ngay, nhaCC, manv, details }) => {
  const pool = await getPool();

  // BẮT BUỘC THEO RULE 01: Ép mảng detail thành JSON string
  const detailJson = JSON.stringify(details);

  await pool.request()
    .input('MasoDDH', sql.NChar(8), masoDDH)
    .input('NGAY', sql.Date, ngay)
    .input('NhaCC', sql.NVarChar(100), nhaCC)
    .input('MANV', sql.Int, manv)
    .input('ChiTietJSON', sql.NVarChar(sql.MAX), detailJson)
    .execute('sp_DatHang_Create');

  return { masoDDH, ngay, nhaCC, manv };
};

exports.update = async (masoDDH, { ngay, nhaCC, details }) => {
  const pool = await getPool();
  const detailJson = JSON.stringify(details);

  await pool.request()
    .input('MasoDDH', sql.NChar(8), masoDDH)
    .input('NGAY', sql.Date, ngay)
    .input('NhaCC', sql.NVarChar(100), nhaCC)
    .input('ChiTietJSON', sql.NVarChar(sql.MAX), detailJson)
    .execute('sp_DatHang_Update');

  return { masoDDH, ngay, nhaCC };
};

exports.delete = async (masoDDH) => {
  const pool = await getPool();
  await pool.request()
    .input('MasoDDH', sql.NChar(8), masoDDH)
    .execute('sp_DatHang_Delete');
  return true;
};
