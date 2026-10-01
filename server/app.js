// =======================================================
// server/app.js
// Điểm khởi chạy chính của ứng dụng Express.js
// Tuân thủ kiến trúc Clean MVC theo Rule.md
// =======================================================

const express = require('express');
const path = require('path');
const session = require('express-session');
const env = require('./config/env');
const { getPool } = require('./config/database');
const errorMiddleware = require('./middlewares/errorMiddleware');

const expressLayouts = require('express-ejs-layouts');

const app = express();

// 1. Cấu hình EJS Template Engine & Master Layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// 2. Middleware giải mã dữ liệu Request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Phục vụ static assets (CSS, JS, Images)
app.use(express.static(path.join(__dirname, '../client/public')));

// 4. Quản lý Session người dùng
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 tiếng
    httpOnly: true,
    secure: env.NODE_ENV === 'production'
  }
}));

// 5. Middleware gắn thông tin người dùng vào view locals
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.path = req.path;
  next();
});

// 6. Nạp routes chính
app.use('/', require('./routes'));

// 7. Middleware xử lý lỗi tập trung toàn hệ thống
app.use(errorMiddleware);

// 8. Khởi động server
const PORT = env.PORT;
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🚀 QLVT Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📌 Môi trường: ${env.NODE_ENV}`);
  console.log(`===================================================`);
  try {
    await getPool();
  } catch (err) {
    console.warn('⚠️  Chưa kết nối được SQL Server. Vui lòng kiểm tra file .env');
  }
});

module.exports = app;
