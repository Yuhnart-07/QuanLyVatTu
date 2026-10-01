// =======================================================
// server/middlewares/errorMiddleware.js
// Xử lý lỗi tập trung toàn ứng dụng
// Ánh xạ lỗi SQL Server (THROW 50001) sang HTTP Status tương ứng
// Tham chiếu: Rule.md mục 13
// =======================================================

function errorMiddleware(err, req, res, next) {
  console.error('>>> [Lỗi ứng dụng]:', err);

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Đã xảy ra lỗi máy chủ nội bộ.';

  // Kiểm tra nếu là lỗi ném từ Stored Procedure SQL Server (số hiệu 50001)
  if (err.number === 50001 || (err.originalError && err.originalError.number === 50001)) {
    statusCode = 400; // Vi phạm Business Rule
    errorCode = 'BUSINESS_RULE_VIOLATION';
  } else if (err.number === 2627 || err.number === 2601) {
    statusCode = 409; // Trùng khóa chính/khóa duy nhất
    errorCode = 'DUPLICATE_KEY';
    message = 'Dữ liệu đã tồn tại trong hệ thống.';
  } else if (err.number === 547) {
    statusCode = 400; // Vi phạm khóa ngoại hoặc ràng buộc CHECK
    errorCode = 'CONSTRAINT_VIOLATION';
    message = 'Vi phạm ràng buộc dữ liệu hoặc liên kết bảng.';
  }

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
