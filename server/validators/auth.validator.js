// =======================================================
// server/validators/auth.validator.js
// Lớp 2: Backend Validator Middleware cho Xác thực
// Kiểm tra dữ liệu đăng nhập / đổi mật khẩu trước Controller
// Tham chiếu: Rule.md mục 6 & ImplementMap.md mục 11
// =======================================================

/**
 * Validate dữ liệu đăng nhập: username và password không được rỗng
 * Chặn request ngay tại cửa ngõ → HTTP 400 Bad Request
 */
function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_USERNAME',
      message: 'Tên đăng nhập không được để trống.'
    });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_PASSWORD',
      message: 'Mật khẩu không được để trống.'
    });
  }

  next();
}

/**
 * Validate dữ liệu đổi mật khẩu: oldPassword, newPassword, confirmPassword
 * Kiểm tra không rỗng, newPassword >= 6 ký tự, confirmPassword khớp
 */
function validateChangePassword(req, res, next) {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !oldPassword.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_OLD_PASSWORD',
      message: 'Mật khẩu cũ không được để trống.'
    });
  }

  if (!newPassword || !newPassword.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_NEW_PASSWORD',
      message: 'Mật khẩu mới không được để trống.'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_NEW_PASSWORD',
      message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      errorCode: 'PASSWORD_MISMATCH',
      message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.'
    });
  }

  next();
}

module.exports = {
  validateLogin,
  validateChangePassword
};
