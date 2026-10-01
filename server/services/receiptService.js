// =======================================================
// server/services/receiptService.js
// Nghiệp vụ Phiếu nhập hàng (Master-Detail)
// Tham chiếu: Rule 01, 02, 03 & Rule.md mục 8
// =======================================================

const receiptRepository = require('../repositories/receiptRepository');

exports.getAllReceipts = async () => {
  return await receiptRepository.getAll();
};

exports.getReceiptById = async (mapn) => {
  const receipt = await receiptRepository.getById(mapn);
  if (!receipt) {
    const error = new Error('Không tìm thấy phiếu nhập.');
    error.status = 404;
    throw error;
  }
  return receipt;
};

exports.createReceipt = async ({ mapn, masoDDH, manv, details }) => {
  return await receiptRepository.create({ mapn, masoDDH, manv, details });
};

exports.deleteReceipt = async (mapn) => {
  return await receiptRepository.delete(mapn);
};
