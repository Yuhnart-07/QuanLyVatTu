// =======================================================
// server/config/env.js
// Nạp và xuất các biến môi trường của ứng dụng
// =======================================================

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'qlvt-super-secret-key-2024',
  DB: {
    USER: process.env.DB_USER || 'sa',
    PASSWORD: process.env.DB_PASSWORD || 'YourPassword123',
    SERVER: process.env.DB_SERVER || 'localhost',
    PORT: parseInt(process.env.DB_PORT, 10) || 1433,
    NAME: process.env.DB_NAME || 'QLVT'
  }
};
