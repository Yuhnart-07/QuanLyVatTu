// =======================================================
// server/validators/issueValidator.js
// Lớp 2: Backend Validator Middleware cho Phiếu xuất
// Tham chiếu: Rule.md mục 6, 10 & Rule 01, 03
// =======================================================

function validateCreate(req, res, next) {
  const { mapx, hotenkh, details } = req.body;

  // RULE 03: Loại bỏ hoàn toàn manv từ client
  delete req.body.manv;

  if (!mapx || !mapx.trim() || mapx.trim().length > 8) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MAPX',
      message: 'Mã phiếu xuất là bắt buộc (tối đa 8 ký tự).'
    });
  }

  if (!hotenkh || !hotenkh.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_HOTENKH',
      message: 'Họ tên khách hàng không được để trống.'
    });
  }

  if (!details || !Array.isArray(details) || details.length === 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'EMPTY_DETAILS',
      message: 'Phiếu xuất phải có ít nhất 01 dòng chi tiết vật tư.'
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
        message: `Dòng chi tiết thứ ${i + 1}: Số lượng xuất phải > 0.`
      });
    }
    if (item.dongia === undefined || isNaN(item.dongia) || Number(item.dongia) < 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_DETAIL_DONGIA',
        message: `Dòng chi tiết thứ ${i + 1}: Đơn giá xuất phải >= 0.`
      });
    }
  }

  next();
}

module.exports = {
  validateCreate
};
