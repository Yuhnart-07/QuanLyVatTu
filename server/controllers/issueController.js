// =======================================================
// server/controllers/issueController.js
// Tiếp nhận Request / Response cho Phiếu xuất kho (Master-Detail)
// Tham chiếu: Rule 01 (JSON Details) & Rule 03 (req.user.manv)
// =======================================================

const issueService = require('../services/issueService');

exports.getAll = async (req, res, next) => {
  try {
    const issues = await issueService.getAllIssues();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, data: issues });
    }
    res.render('issues/index', { title: 'Quản lý Phiếu xuất', issues });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { mapx, hotenkh, details } = req.body;
    // BẮT BUỘC TUÂN THỦ RULE 03: Lấy MANV từ req.user.manv
    const manv = req.user.manv;

    const result = await issueService.createIssue({
      mapx,
      hotenkh,
      manv,
      details
    });

    res.status(201).json({ success: true, message: 'Lập phiếu xuất thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await issueService.deleteIssue(req.params.id);
    res.json({ success: true, message: 'Xóa phiếu xuất thành công.' });
  } catch (err) {
    next(err);
  }
};
