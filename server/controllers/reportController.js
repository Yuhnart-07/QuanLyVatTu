// =======================================================
// server/controllers/reportController.js
// Tiếp nhận Request / Response cho 7 Báo biểu (Reports)
// Tham chiếu: De.md Mục II.2
// =======================================================

const reportService = require('../services/reportService');

exports.index = (req, res) => {
  res.render('reports/index', { title: 'Hệ thống Báo biểu & Thống kê' });
};

// 2.1 In danh sách nhân viên
exports.getEmployeeListReport = async (req, res, next) => {
  try {
    const data = await reportService.getEmployeeListReport();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.2 In danh mục vật tư
exports.getMaterialListReport = async (req, res, next) => {
  try {
    const data = await reportService.getMaterialListReport();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.3 Đơn đặt hàng chưa hoàn tất
exports.getPendingOrdersReport = async (req, res, next) => {
  try {
    const data = await reportService.getPendingOrdersReport();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.4 Bảng kê chi tiết nhập / xuất
exports.getDetailInOutReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await reportService.getDetailInOutReport(fromDate, toDate);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.5 Thống kê phiếu nhập theo năm
exports.getReceiptStatsByYearReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    const data = await reportService.getReceiptStatsByYearReport(year || new Date().getFullYear());
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.6 Thống kê phiếu xuất theo năm
exports.getIssueStatsByYearReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    const data = await reportService.getIssueStatsByYearReport(year || new Date().getFullYear());
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// 2.7 Bảng tổng hợp nhập xuất
exports.getSummaryInOutReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await reportService.getSummaryInOutReport(fromDate, toDate);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
