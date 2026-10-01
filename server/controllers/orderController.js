// =======================================================
// server/controllers/orderController.js
// Tiếp nhận Request / Response cho Đơn đặt hàng (Master-Detail)
// Tham chiếu: Rule 01 (JSON Details) & Rule 03 (req.user.manv)
// =======================================================

const orderService = require('../services/orderService');

exports.getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, data: orders });
    }
    res.render('orders/index', { title: 'Quản lý Đơn đặt hàng', orders });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { masoDDH, ngay, nhaCC, details } = req.body;
    // BẮT BUỘC TUÂN THỦ RULE 03: Lấy MANV từ req.user.manv
    const manv = req.user.manv;

    const result = await orderService.createOrder({
      masoDDH,
      ngay: ngay || new Date().toISOString().split('T')[0],
      nhaCC,
      manv,
      details
    });

    res.status(201).json({ success: true, message: 'Lập đơn đặt hàng thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { ngay, nhaCC, details } = req.body;
    const result = await orderService.updateOrder(req.params.id, { ngay, nhaCC, details });
    res.json({ success: true, message: 'Cập nhật đơn đặt hàng thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.json({ success: true, message: 'Xóa đơn đặt hàng thành công.' });
  } catch (err) {
    next(err);
  }
};
