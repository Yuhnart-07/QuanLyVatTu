// =======================================================
// server/services/reportService.js
// Nghiệp vụ cung cấp dữ liệu cho 7 Báo biểu
// Tham chiếu: De.md Mục II.2
// =======================================================

const reportRepository = require('../repositories/reportRepository');

exports.getEmployeeListReport = async () => {
  return await reportRepository.getEmployeeListReport();
};

exports.getMaterialListReport = async () => {
  return await reportRepository.getMaterialListReport();
};

exports.getPendingOrdersReport = async () => {
  return await reportRepository.getPendingOrdersReport();
};

exports.getDetailInOutReport = async (fromDate, toDate) => {
  return await reportRepository.getDetailInOutReport(fromDate, toDate);
};

exports.getReceiptStatsByYearReport = async (year) => {
  return await reportRepository.getReceiptStatsByYearReport(year);
};

exports.getIssueStatsByYearReport = async (year) => {
  return await reportRepository.getIssueStatsByYearReport(year);
};

exports.getSummaryInOutReport = async (fromDate, toDate) => {
  return await reportRepository.getSummaryInOutReport(fromDate, toDate);
};
