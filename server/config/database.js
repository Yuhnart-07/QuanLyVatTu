// =======================================================
// server/config/database.js
// Cấu hình kết nối SQL Server qua thư viện 'mssql'
// Tham chiếu: Rule.md - Tầng Repository gọi qua Connection Pool
// =======================================================

const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'QLVT',
  options: {
    encrypt: false, // Để false khi kết nối SQL Server local
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

/**
 * Lấy hoặc khởi tạo Connection Pool đến SQL Server
 */
async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('>>> [Database] Kết nối SQL Server thành công (Database: QLVT)');
    } catch (err) {
      console.error('>>> [Database] Lỗi kết nối SQL Server:', err.message);
      throw err;
    }
  }
  return pool;
}

module.exports = {
  sql,
  getPool,
  config
};
