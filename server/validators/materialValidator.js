// =======================================================
// server/validators/materialValidator.js
// Lớp 2: Backend Validator Middleware cho Vật tư
// Tham chiếu: Rule.md mục 6 & De.md Phần I.2
// =======================================================

function validateCreate(req, res, next) {
  const { mavt, tenvt, dvt } = req.body;

  if (!mavt || !mavt.trim() || mavt.trim().length > 4) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MAVT',
      message: 'Mã vật tư là bắt buộc và tối đa 4 ký tự.'
    });
  }

  if (!tenvt || !tenvt.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TENVT',
      message: 'Tên vật tư không được để trống.'
    });
  }

  if (!dvt || !dvt.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_DVT',
      message: 'Đơn vị tính không được để trống.'
    });
  }

  next();
}

function validateUpdate(req, res, next) {
  const { tenvt, dvt } = req.body;

  if (!tenvt || !tenvt.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_TENVT',
      message: 'Tên vật tư không được để trống.'
    });
  }

  if (!dvt || !dvt.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_DVT',
      message: 'Đơn vị tính không được để trống.'
    });
  }

  next();
}

module.exports = {
  validateCreate,
  validateUpdate
};
