// =======================================================
// server/middlewares/errorMiddleware.js
// Xử lý lỗi tập trung toàn ứng dụng
// Ánh xạ lỗi SQL Server (THROW 50001) sang HTTP Status tương ứng
// Hỗ trợ ánh xạ err.status từ Service/Repository (VD: 401)
// Tham chiếu: Rule.md mục 13
// =======================================================

function errorMiddleware(err, req, res, next) {
  console.error('>>> [Lỗi ứng dụng]:', err);

  let statusCode = err.status || 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Đã xảy ra lỗi máy chủ nội bộ.';

  // ----- Ánh xạ lỗi từ err.status (đặt bởi Service/Repository) -----
  if (statusCode === 401) {
    errorCode = 'UNAUTHORIZED';
  } else if (statusCode === 403) {
    errorCode = 'FORBIDDEN';
  } else if (statusCode === 400) {
    errorCode = 'BAD_REQUEST';
  }

  // ----- Ánh xạ lỗi từ SQL Server Error Number -----
  // Lỗi nghiệp vụ từ SP: THROW 50001
  if (err.number === 50001 || (err.originalError && err.originalError.number === 50001)) {
    statusCode = 400; // Vi phạm Business Rule
    errorCode = 'BUSINESS_RULE_VIOLATION';
    message = err.message || 'Vi phạm quy tắc nghiệp vụ.';
  }
  // Trùng khóa chính / khóa duy nhất
  else if (err.number === 2627 || err.number === 2601) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    message = 'Dữ liệu đã tồn tại trong hệ thống.';
  }
  // Vi phạm khóa ngoại hoặc ràng buộc CHECK
  else if (err.number === 547) {
    statusCode = 400;
    errorCode = 'CONSTRAINT_VIOLATION';
    message = 'Vi phạm ràng buộc dữ liệu hoặc liên kết bảng.';
  }
  // SQL Server Login failed (Error 18456)
  else if (err.number === 18456) {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Sai tên đăng nhập hoặc mật khẩu.';
  }

  // ----- Trả phản hồi theo định dạng phù hợp -----
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(statusCode).json({
      success: false,
      errorCode,
      message
    });
  }

  res.status(statusCode).render('layouts/main', {
    title: `Lỗi ${statusCode}`,
    body: `<div class="p-8 text-center text-red-600"><h2 class="text-2xl font-bold">Lỗi ${statusCode}</h2><p class="mt-2 text-gray-700">${message}</p></div>`
  });
}

module.exports = errorMiddleware;
