// =======================================================
// server/controllers/authController.js
// Tiếp nhận Request / Response cho chức năng Xác thực
// Tham chiếu: Rule.md mục 7 & Rule 04
// =======================================================

const authService = require('../services/authService');

exports.showLoginForm = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/employees');
  }
  res.render('auth/login', { title: 'Đăng nhập - QLVT' });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authService.authenticate(username, password);

    // Lưu session người dùng
    req.session.user = {
      manv: user.manv,
      hoTen: user.hoTen,
      username: user.username,
      role: user.role
    };

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, user: req.session.user });
    }
    res.redirect('/employees');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

exports.showChangePasswordForm = (req, res) => {
  res.render('auth/change-password', { title: 'Đổi mật mã' });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.username, oldPassword, newPassword);
    res.json({ success: true, message: 'Đổi mật mã thành công.' });
  } catch (err) {
    next(err);
  }
};
