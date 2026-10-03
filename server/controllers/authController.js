// =======================================================
// server/controllers/authController.js
// Tiếp nhận Request / Response cho chức năng Xác thực
// Tham chiếu: Rule.md mục 7 & Rule 04
// Luồng: Route → [Validator] → Controller → Service → Repository → SP
// =======================================================

const authService = require('../services/authService');

/**
 * Hiển thị form đăng nhập (GET /auth/login)
 * Nếu đã có session → redirect về trang chính
 */
exports.showLoginForm = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/employees');
  }
  // Truyền biến error (nếu có) để hiển thị thông báo lỗi trên form
  const error = req.query.error || null;
  res.render('auth/login', {
    title: 'Đăng nhập - QLVT',
    layout: 'layouts/main',
    error: error
  });
};

/**
 * Xử lý đăng nhập (POST /auth/login)
 * Lưu session: req.session.user = { manv, hoTen, username, role }
 * RULE 03: manv từ SP → session → req.user.manv (qua authMiddleware)
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authService.authenticate(username, password);

    // Lưu session người dùng (chuẩn Rule 03)
    req.session.user = {
      manv: user.manv,
      hoTen: user.hoTen,
      username: user.username,
      role: user.role
    };

    // Phân biệt AJAX request vs Browser request
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, user: req.session.user });
    }
    res.redirect('/employees');
  } catch (err) {
    // Render lại form login kèm error message thay vì redirect đến trang lỗi
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      const statusCode = err.status || 401;
      return res.status(statusCode).json({
        success: false,
        errorCode: 'LOGIN_FAILED',
        message: err.message || 'Đăng nhập thất bại.'
      });
    }
    // Browser request: render lại trang login với thông báo lỗi
    // Xóa currentUser để layout main.ejs hiển thị chế độ toàn trang (Login)
    // thay vì chế độ Dashboard (sidebar + navbar) từ session cũ
    res.locals.currentUser = null;
    res.render('auth/login', {
      title: 'Đăng nhập - QLVT',
      layout: 'layouts/main',
      error: err.message || 'Sai tên đăng nhập hoặc mật khẩu.'
    });
  }
};

/**
 * Đăng xuất (POST /auth/logout)
 * Hủy session và redirect về trang login
 */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

/**
 * Hiển thị form đổi mật khẩu (GET /auth/change-password)
 * Yêu cầu đã đăng nhập (authMiddleware)
 */
exports.showChangePasswordForm = (req, res) => {
  res.render('auth/change-password', { title: 'Đổi mật mã' });
};

/**
 * Xử lý đổi mật khẩu (POST /auth/change-password)
 * Auth: authMiddleware → validateChangePassword → controller
 * BR13: Chỉ đổi pass cho user đã có tài khoản
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.username, oldPassword, newPassword);
    res.json({ success: true, message: 'Đổi mật mã thành công.' });
  } catch (err) {
    next(err);
  }
};
