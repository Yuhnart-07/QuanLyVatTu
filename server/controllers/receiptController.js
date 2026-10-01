// =======================================================
// server/controllers/receiptController.js
// Tiếp nhận Request / Response cho Phiếu nhập hàng (Master-Detail)
// Tham chiếu: Rule 01 (JSON Details) & Rule 03 (req.user.manv)
// =======================================================

const receiptService = require('../services/receiptService');

exports.getAll = async (req, res, next) => {
  try {
    const receipts = await receiptService.getAllReceipts();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, data: receipts });
    }
    res.render('receipts/index', { title: 'Quản lý Phiếu nhập', receipts });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { mapn, masoDDH, details } = req.body;
    // BẮT BUỘC TUÂN THỦ RULE 03: Lấy MANV từ req.user.manv
    const manv = req.user.manv;

    const result = await receiptService.createReceipt({
      mapn,
      masoDDH,
      manv,
      details
    });

    res.status(201).json({ success: true, message: 'Lập phiếu nhập thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await receiptService.deleteReceipt(req.params.id);
    res.json({ success: true, message: 'Xóa phiếu nhập thành công.' });
  } catch (err) {
    next(err);
  }
};
