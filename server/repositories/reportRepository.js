// =======================================================
// server/repositories/reportRepository.js
// Gọi Stored Procedure cho 7 Báo biểu
// 100% qua Stored Procedure theo Rule.md mục 9
// =======================================================

const { getPool, sql } = require('../config/database');

exports.getEmployeeListReport = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Report_DanhSachNhanVien');
  return result.recordset;
};

exports.getMaterialListReport = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Report_DanhMucVatTu');
  return result.recordset;
};

exports.getPendingOrdersReport = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('sp_Report_DDHChuaHoanTat');
  return result.recordset;
};

exports.getDetailInOutReport = async (fromDate, toDate) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('TuNgay', sql.Date, fromDate)
    .input('DenNgay', sql.Date, toDate)
    .execute('sp_Report_ChiTietNhapXuat');
  return result.recordset;
};

exports.getReceiptStatsByYearReport = async (year) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Nam', sql.Int, year)
    .execute('sp_Report_ThongKePhieuNhap');
  return result.recordset;
};

exports.getIssueStatsByYearReport = async (year) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('Nam', sql.Int, year)
    .execute('sp_Report_ThongKePhieuXuat');
  return result.recordset;
};

exports.getSummaryInOutReport = async (fromDate, toDate) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('TuNgay', sql.Date, fromDate)
    .input('DenNgay', sql.Date, toDate)
    .execute('sp_Report_TongHopNhapXuat');
  return result.recordset;
};
