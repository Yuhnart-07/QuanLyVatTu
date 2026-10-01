// =======================================================
// server/validators/employeeValidator.js
// Lớp 2: Backend Validator Middleware cho Nhân viên
// Kiểm tra dữ liệu trước khi đi vào Controller/Service
// Tham chiếu: Rule.md mục 6 & De.md Phần I.1
// =======================================================

function validateCreate(req, res, next) {
  const { manv, ho, ten, luong } = req.body;

  if (!manv || isNaN(manv)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MANV',
      message: 'Mã nhân viên (MANV) là bắt buộc và phải là số nguyên.'
    });
  }

  if (!ho || !ho.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO',
      message: 'Họ nhân viên không được để trống.'
    });
  }

  if (!ten || !ten.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN',
      message: 'Tên nhân viên không được để trống.'
    });
  }

  if (luong !== undefined && (isNaN(luong) || Number(luong) < 5000000)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_LUONG',
      message: 'Lương nhân viên phải là số và tối thiểu từ 5,000,000 VNĐ.'
    });
  }

  next();
}

function validateUpdate(req, res, next) {
  const { ho, ten, luong } = req.body;

  if (!ho || !ho.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO',
      message: 'Họ nhân viên không được để trống.'
    });
  }

  if (!ten || !ten.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN',
      message: 'Tên nhân viên không được để trống.'
    });
  }

  if (luong !== undefined && (isNaN(luong) || Number(luong) < 5000000)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_LUONG',
      message: 'Lương nhân viên phải tối thiểu từ 5,000,000 VNĐ.'
    });
  }

  next();
}

module.exports = {
  validateCreate,
  validateUpdate
};
