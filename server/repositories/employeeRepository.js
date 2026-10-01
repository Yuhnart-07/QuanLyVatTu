// =======================================================
// server/repositories/employeeRepository.js
// Gọi Stored Procedure quản lý Nhân viên
// 100% thông qua Stored Procedure theo Rule.md mục 9
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getAll = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_NhanVien_GetAll');
  return result.recordset;
};

exports.getById = async (manv) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MANV', sql.Int, manv)
    .execute('sp_NhanVien_GetById');
  return result.recordset[0] || null;
};

exports.create = async ({ manv, ho, ten, diachi, ngaysinh, luong, ghichu }) => {
  const pool = await getPool();
  await pool.request()
    .input('MANV', sql.Int, manv)
    .input('HO', sql.NVarChar(40), ho)
    .input('TEN', sql.NVarChar(10), ten)
    .input('DIACHI', sql.NVarChar(100), diachi || null)
    .input('NGAYSINH', sql.Date, ngaysinh || null)
    .input('LUONG', sql.Float, luong ? parseFloat(luong) : null)
    .input('GHICHU', sql.Text, ghichu || null)
    .execute('sp_NhanVien_Create');
  return { manv, ho, ten };
};

exports.update = async (manv, { ho, ten, diachi, ngaysinh, luong, ghichu }) => {
  const pool = await getPool();
  await pool.request()
    .input('MANV', sql.Int, manv)
    .input('HO', sql.NVarChar(40), ho)
    .input('TEN', sql.NVarChar(10), ten)
    .input('DIACHI', sql.NVarChar(100), diachi || null)
    .input('NGAYSINH', sql.Date, ngaysinh || null)
    .input('LUONG', sql.Float, luong ? parseFloat(luong) : null)
    .input('GHICHU', sql.Text, ghichu || null)
    .execute('sp_NhanVien_Update');
  return { manv, ho, ten };
};

exports.delete = async (manv) => {
  const pool = await getPool();
  await pool.request()
    .input('MANV', sql.Int, manv)
    .execute('sp_NhanVien_Delete');
  return true;
};
