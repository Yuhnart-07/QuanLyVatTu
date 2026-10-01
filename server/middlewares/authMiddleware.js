// =======================================================
// server/middlewares/authMiddleware.js
// Xác thực trạng thái đăng nhập của người dùng
// Gán thông tin req.user = { manv, role, username }
// Tham chiếu: Rule.md mục 6 & 11
// =======================================================

function authMiddleware(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Bắt buộc cho Rule 03: req.user.manv
    return next();
  }

  // Nếu là gọi API AJAX thì trả mã 401 JSON
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZED',
      message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.'
    });
  }

  // Nếu duyệt web thông thường thì chuyển hướng về trang login
  res.redirect('/auth/login');
}

module.exports = authMiddleware;
