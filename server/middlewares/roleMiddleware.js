// =======================================================
// server/middlewares/roleMiddleware.js
// Kiểm tra quyền hạn người dùng (Admin / Nhanvien)
// Tham chiếu: Rule.md mục 6 & 12
// =======================================================

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'Chưa đăng nhập.'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(403).json({
          success: false,
          errorCode: 'FORBIDDEN',
          message: 'Bạn không có quyền truy cập chức năng này.'
        });
      }
      return res.status(403).render('layouts/main', {
        title: '403 Cấm truy cập',
        body: '<div class="p-8 text-center text-red-600 font-bold">403 - Bạn không có quyền truy cập chức năng này!</div>'
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin: requireRole(['Admin']),
  requireStaffOrAdmin: requireRole(['Admin', 'Nhanvien'])
};
