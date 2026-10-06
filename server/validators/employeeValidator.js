// =======================================================
// server/validators/employeeValidator.js
// Lớp 2: Backend Validator Middleware cho Nhân viên
// Kiểm tra dữ liệu trước khi đi vào Controller/Service
// Tham chiếu: Rule.md mục 6, De.md Phần I.1, BR01 (Lương >= 5.000.000)
// =======================================================

function validateCreate(req, res, next) {
  const { manv, ho, ten, diachi, ngaysinh, luong } = req.body;

  // 1. Kiểm tra Mã nhân viên (MANV)
  const parsedManv = parseInt(manv, 10);
  if (!manv || isNaN(parsedManv) || parsedManv <= 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MANV',
      message: 'Mã nhân viên (MANV) là bắt buộc và phải là số nguyên dương.'
    });
  }

  // 2. Kiểm tra Họ nhân viên
  if (!ho || typeof ho !== 'string' || !ho.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO',
      message: 'Họ nhân viên không được để trống.'
    });
  }
  if (ho.trim().length > 40) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO_LENGTH',
      message: 'Họ nhân viên không được vượt quá 40 ký tự.'
    });
  }

  // 3. Kiểm tra Tên nhân viên
  if (!ten || typeof ten !== 'string' || !ten.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN',
      message: 'Tên nhân viên không được để trống.'
    });
  }
  if (ten.trim().length > 10) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN_LENGTH',
      message: 'Tên nhân viên không được vượt quá 10 ký tự.'
    });
  }

  // 4. Kiểm tra Lương (BR01: >= 5.000.000 VNĐ)
  const parsedLuong = Number(luong);
  if (luong === undefined || luong === null || luong === '' || isNaN(parsedLuong) || parsedLuong < 5000000) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_LUONG',
      message: 'Lương nhân viên phải là số và tối thiểu từ 5,000,000 VNĐ (BR01).'
    });
  }

  // 5. Kiểm tra Địa chỉ (nếu có)
  if (diachi && diachi.length > 100) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_DIACHI_LENGTH',
      message: 'Địa chỉ không được vượt quá 100 ký tự.'
    });
  }

  // 6. Kiểm tra Ngày sinh (nếu có)
  if (ngaysinh) {
    const birthDate = new Date(ngaysinh);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_NGAYSINH',
        message: 'Ngày sinh không đúng định dạng.'
      });
    }
    if (birthDate > new Date()) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_NGAYSINH_FUTURE',
        message: 'Ngày sinh không thể lớn hơn ngày hiện tại.'
      });
    }
  }

  next();
}

function validateUpdate(req, res, next) {
  const { ho, ten, diachi, ngaysinh, luong } = req.body;

  // 1. Kiểm tra Họ nhân viên
  if (!ho || typeof ho !== 'string' || !ho.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO',
      message: 'Họ nhân viên không được để trống.'
    });
  }
  if (ho.trim().length > 40) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HO_LENGTH',
      message: 'Họ nhân viên không được vượt quá 40 ký tự.'
    });
  }

  // 2. Kiểm tra Tên nhân viên
  if (!ten || typeof ten !== 'string' || !ten.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN',
      message: 'Tên nhân viên không được để trống.'
    });
  }
  if (ten.trim().length > 10) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TEN_LENGTH',
      message: 'Tên nhân viên không được vượt quá 10 ký tự.'
    });
  }

  // 3. Kiểm tra Lương (BR01: >= 5.000.000 VNĐ)
  const parsedLuong = Number(luong);
  if (luong === undefined || luong === null || luong === '' || isNaN(parsedLuong) || parsedLuong < 5000000) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_LUONG',
      message: 'Lương nhân viên phải là số và tối thiểu từ 5,000,000 VNĐ (BR01).'
    });
  }

  // 4. Kiểm tra Địa chỉ (nếu có)
  if (diachi && diachi.length > 100) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_DIACHI_LENGTH',
      message: 'Địa chỉ không được vượt quá 100 ký tự.'
    });
  }

  // 5. Kiểm tra Ngày sinh (nếu có)
  if (ngaysinh) {
    const birthDate = new Date(ngaysinh);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_NGAYSINH',
        message: 'Ngày sinh không đúng định dạng.'
      });
    }
    if (birthDate > new Date()) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_NGAYSINH_FUTURE',
        message: 'Ngày sinh không thể lớn hơn ngày hiện tại.'
      });
    }
  }

  next();
}

module.exports = {
  validateCreate,
  validateUpdate
};
