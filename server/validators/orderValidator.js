// =======================================================
// server/validators/orderValidator.js
// Lớp 2: Backend Validator Middleware cho Đơn đặt hàng (Master-Detail)
// Tham chiếu: Rule.md mục 6, 10 & Rule 01, 03
// =======================================================

function validateCreate(req, res, next) {
  const { masoDDH, nhaCC, details } = req.body;

  // RULE 03: Loại bỏ hoàn toàn manv từ client gửi lên nếu có
  delete req.body.manv;

  if (!masoDDH || !masoDDH.trim() || masoDDH.trim().length > 8) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MASODDH',
      message: 'Mã số đơn đặt hàng là bắt buộc (tối đa 8 ký tự).'
    });
  }

  if (!nhaCC || !nhaCC.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_NHACC',
      message: 'Tên nhà cung cấp không được để trống.'
    });
  }

  // Kiểm tra mảng chi tiết (Master-Detail)
  if (!details || !Array.isArray(details) || details.length === 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'EMPTY_DETAILS',
      message: 'Đơn đặt hàng phải có ít nhất 01 mặt hàng chi tiết.'
    });
  }

  for (let i = 0; i < details.length; i++) {
    const item = details[i];
    if (!item.mavt || !item.mavt.trim()) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_DETAIL_MAVT',
        message: `Dòng chi tiết thứ ${i + 1}: Mã vật tư không hợp lệ.`
      });
    }
    if (!item.soluong || isNaN(item.soluong) || Number(item.soluong) <= 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_DETAIL_SOLUONG',
        message: `Dòng chi tiết thứ ${i + 1}: Số lượng phải là số nguyên > 0.`
      });
    }
    if (item.dongia === undefined || isNaN(item.dongia) || Number(item.dongia) < 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_DETAIL_DONGIA',
        message: `Dòng chi tiết thứ ${i + 1}: Đơn giá phải >= 0.`
      });
    }
  }

  next();
}

function validateUpdate(req, res, next) {
  const { nhaCC, details } = req.body;
  delete req.body.manv;

  if (!nhaCC || !nhaCC.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_NHACC',
      message: 'Tên nhà cung cấp không được để trống.'
    });
  }

  if (!details || !Array.isArray(details) || details.length === 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'EMPTY_DETAILS',
      message: 'Đơn đặt hàng phải có ít nhất 01 mặt hàng chi tiết.'
    });
  }

  next();
}

module.exports = {
  validateCreate,
  validateUpdate
};
