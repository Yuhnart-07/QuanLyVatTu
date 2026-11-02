// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/validators/adminValidator.js
// Mô tả: Lớp 2 Validation Middleware cho phân hệ Quản trị hệ thống (Mục 3.1).
//         Chặn request dữ liệu rác, thiếu trường, sai kiểu trước khi chuyển đến Controller.
// Tham chiếu: Rule.md mục 6, ImplementMap.md mục 7.1 & 11
// ====================================================================================

/**
 * Validate dữ liệu yêu cầu tạo Login SQL Server mới
 * Kiểm tra các trường: manv, username, password, role
 * Chặn lỗi ở cửa ngõ tầng mạng -> Trả về mã lỗi HTTP 400 Bad Request
 */
function validateCreateLogin(req, res, next) {
  const { manv, username, password, role } = req.body;

  // 1. Kiểm tra mã nhân viên (bắt buộc phải là số nguyên dương)
  const parsedManv = parseInt(manv, 10);
  if (!manv || isNaN(parsedManv) || parsedManv <= 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_MANV',
      message: 'Vui lòng chọn nhân viên hợp lệ để cấp tài khoản.'
    });
  }

  // 2. Kiểm tra tên đăng nhập (Login Name)
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_USERNAME',
      message: 'Tên đăng nhập không được để trống.'
    });
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_USERNAME_LENGTH',
      message: 'Tên đăng nhập phải có độ dài từ 3 đến 50 ký tự.'
    });
  }

  // Tên đăng nhập chỉ nên chứa chữ cái, số và dấu gạch dưới (chuẩn SQL Server Identifier an toàn)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_USERNAME_FORMAT',
      message: 'Tên đăng nhập chỉ được chứa các ký tự chữ, số và dấu gạch dưới (_).'
    });
  }

  // 3. Kiểm tra mật khẩu (Password)
  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_PASSWORD',
      message: 'Mật khẩu không được để trống.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_PASSWORD_LENGTH',
      message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.'
    });
  }

  // 4. Kiểm tra nhóm quyền (Role)
  if (!role || (role !== 'Admin' && role !== 'Nhanvien')) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_ROLE',
      message: 'Nhóm quyền không hợp lệ. Vui lòng chọn quyền Admin hoặc Nhân viên.'
    });
  }

  // Dữ liệu đã sạch, gán lại các giá trị chuẩn hóa và tiếp tục luồng
  req.body.manv = parsedManv;
  req.body.username = trimmedUsername;
  next();
}

/**
 * Validate dữ liệu yêu cầu xóa Login SQL Server
 * Kiểm tra tên tài khoản trong req.params hoặc req.body
 */
function validateDeleteLogin(req, res, next) {
  const username = req.params.username || req.body.username;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_USERNAME',
      message: 'Tên đăng nhập cần xóa không hợp lệ.'
    });
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.toLowerCase() === 'sa') {
    return res.status(400).json({
      success: false,
      errorCode: 'FORBIDDEN_DELETE_SA',
      message: 'Không được phép xóa tài khoản quản trị hệ thống sa.'
    });
  }

  req.params.username = trimmedUsername;
  next();
}

module.exports = {
  validateCreateLogin,
  validateDeleteLogin
};
