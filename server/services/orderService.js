// =======================================================
// server/services/orderService.js
// Nghiệp vụ Đơn đặt hàng (Master-Detail)
// Tham chiếu: Rule 01, 02, 03 & Rule.md mục 8
// =======================================================

const orderRepository = require('../repositories/orderRepository');

exports.getAllOrders = async () => {
  return await orderRepository.getAll();
};

exports.getOrderById = async (masoDDH) => {
  const order = await orderRepository.getById(masoDDH);
  if (!order) {
    const error = new Error('Không tìm thấy đơn đặt hàng.');
    error.status = 404;
    throw error;
  }
  return order;
};

exports.createOrder = async ({ masoDDH, ngay, nhaCC, manv, details }) => {
  // Chuẩn hóa và chuyển mảng details sang Repository
  return await orderRepository.create({ masoDDH, ngay, nhaCC, manv, details });
};

exports.updateOrder = async (masoDDH, { ngay, nhaCC, details }) => {
  return await orderRepository.update(masoDDH, { ngay, nhaCC, details });
};

exports.deleteOrder = async (masoDDH) => {
  return await orderRepository.delete(masoDDH);
};
