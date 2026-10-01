// =======================================================
// server/repositories/materialRepository.js
// Gọi Stored Procedure cho danh mục Vật tư
// 100% thông qua Stored Procedure theo Rule.md mục 9
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAll = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Vattu_GetAll');
  return result.recordset;
};

exports.getById = async (mavt) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MAVT', sql.NChar(4), mavt)
    .execute('sp_Vattu_GetById');
  return result.recordset[0] || null;
};

exports.create = async ({ mavt, tenvt, dvt, soluongton }) => {
  const pool = await getPool();
  await pool.request()
    .input('MAVT', sql.NChar(4), mavt)
    .input('TENVT', sql.NVarChar(30), tenvt)
    .input('DVT', sql.NVarChar(15), dvt)
    .input('Soluongton', sql.Int, soluongton ? parseInt(soluongton, 10) : 0)
    .execute('sp_Vattu_Create');
  return { mavt, tenvt, dvt };
};

exports.update = async (mavt, { tenvt, dvt, soluongton }) => {
  const pool = await getPool();
  await pool.request()
    .input('MAVT', sql.NChar(4), mavt)
    .input('TENVT', sql.NVarChar(30), tenvt)
    .input('DVT', sql.NVarChar(15), dvt)
    .input('Soluongton', sql.Int, soluongton ? parseInt(soluongton, 10) : 0)
    .execute('sp_Vattu_Update');
  return { mavt, tenvt, dvt };
};

exports.delete = async (mavt) => {
  const pool = await getPool();
  await pool.request()
    .input('MAVT', sql.NChar(4), mavt)
    .execute('sp_Vattu_Delete');
  return true;
};
