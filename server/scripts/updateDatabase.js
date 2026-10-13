// =======================================================
// server/scripts/updateDatabase.js
// Script TỰ ĐỘNG CẬP NHẬT CSDL AN TOÀN (BẢO TOÀN 100% DỮ LIỆU)
// Chạy bằng lệnh: npm run db:update
// 
// MỤC ĐÍCH:
//   Dành cho thành viên đã có CSDL và đang làm việc/test dữ liệu.
//   Khi pull code mới về từ Git:
//   - Tự động quét và đồng bộ:
//     1. FUNCTIONS        (database/functions/)
//     2. PROCEDURES       (database/procedures/)
//     3. TRIGGERS         (database/triggers/)
//   - Tự động bổ sung Roles, Quyền hạn và Logins kiểm thử (IF NOT EXISTS).
//   - 🛡️ TUYỆT ĐỐI BỎ QUA tables/ và seed/:
//     KHÔNG DROP TABLE, KHÔNG ALTER TABLE, KHÔNG DELETE DỮ LIỆU.
//   - BẢO TOÀN NGUYÊN VẸN 100% DỮ LIỆU ĐANG CÓ TRONG 8 BẢNG.
// =======================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const DB_NAME = process.env.DB_NAME || 'QLVT';

/**
 * Tách nội dung file SQL thành nhiều batch độc lập theo từ khóa 'GO'
 * Lọc sạch các dòng lệnh USE [database]; hoặc USE database; để tránh lỗi:
 * "CREATE FUNCTION / PROCEDURE / TRIGGER must be the first statement in a query batch"
 */
function splitSqlBatches(sqlContent) {
  return sqlContent
    .split(/^\s*GO\s*$/gmi)
    .map(batch => {
      return batch
        .replace(/^\s*USE\s+\[?[a-zA-Z0-9_]+\]?\s*;?\s*$/gmi, '')
        .trim();
    })
    .filter(batch => batch.length > 0);
}

/**
 * Thực thi một file SQL an toàn (hỗ trợ nhiều batch ngăn cách bởi GO)
 */
async function executeSqlFile(pool, filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const batches = splitSqlBatches(content);

  for (const batch of batches) {
    try {
      await pool.request().batch(batch);
    } catch (err) {
      console.error(`   ❌ Lỗi khi thực thi batch trong file [${path.basename(filePath)}]:`, err.message);
      throw err;
    }
  }
}

/**
 * Đồng bộ toàn bộ các file SQL trong một thư mục logic
 * @param {sql.ConnectionPool} pool - Kết nối SQL Server
 * @param {string} relativeDir - Đường dẫn thư mục (ví dụ 'database/functions')
 * @param {string} objectType - Tên loại đối tượng (FUNCTION, PROCEDURE, TRIGGER)
 * @param {string} checkQuery - Câu truy vấn lấy danh sách đối tượng hiện có
 */
async function syncSqlDirectory(pool, relativeDir, objectType, checkQuery) {
  const dirPath = path.join(__dirname, '../../', relativeDir);
  console.log(`\n[${objectType}] Dang quet thu muc [${relativeDir}]...`);

  if (!fs.existsSync(dirPath)) {
    console.log(`   Thu muc [${relativeDir}] khong ton tai.`);
    return { total: 0, newCount: 0, updateCount: 0 };
  }

  // Lọc chỉ lấy các file có đuôi .sql (bỏ qua .gitkeep và file ẩn)
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log(`   Thu muc [${relativeDir}] hien chua co file .sql nao (dang trong).`);
    return { total: 0, newCount: 0, updateCount: 0 };
  }

  // Lấy danh sách đối tượng hiện có trong CSDL để phân loại THÊM MỚI hay LÀM MỚI
  let existingObjects = new Set();
  try {
    const result = await pool.request().query(checkQuery);
    existingObjects = new Set(result.recordset.map(r => r.name.toLowerCase()));
  } catch (err) {
    console.warn(`   Khong the doc danh sach ${objectType} hien tai:`, err.message);
  }

  let newCount = 0;
  let updateCount = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const objectName = path.basename(file, '.sql').toLowerCase();
    const isExisting = existingObjects.has(objectName);

    await executeSqlFile(pool, filePath);

    if (isExisting) {
      console.log(`   [LAM MOI] ${file}`);
      updateCount++;
    } else {
      console.log(`   [THEM MOI] ${file}`);
      newCount++;
    }
  }

  console.log(`   Da dong bo ${files.length} ${objectType}(s) (${newCount} moi, ${updateCount} cap nhat).`);
  return { total: files.length, newCount, updateCount };
}

async function runUpdate() {
  console.log('======================================================================');
  console.log('[QLVT] BAT DAU CAP NHAT DATABASE AN TOAN (BAO TOAN DU LIEU)');
  console.log(`Server: ${dbConfig.server}:${dbConfig.port} | Database: ${DB_NAME}`);
  console.log('Cam ket:');
  console.log('   - CAP NHAT: Functions, Procedures, Triggers, Roles & Logins');
  console.log('   - BAO TOAN: KHONG cham tables/, KHONG cham seed/, KHONG mat du lieu');
  console.log('======================================================================');

  let pool = null;

  try {
    // -----------------------------------------------------------------
    // BƯỚC 1: Kết nối vào CSDL QLVT
    // -----------------------------------------------------------------
    console.log(`\n[1/5] Dang ket noi toi CSDL [${DB_NAME}]...`);
    pool = await sql.connect({ ...dbConfig, database: DB_NAME });
    console.log(`   Ket noi CSDL [${DB_NAME}] thanh cong.`);

    // -----------------------------------------------------------------
    // BƯỚC 2: Đồng bộ FUNCTIONS (database/functions/)
    // -----------------------------------------------------------------
    console.log('\n[2/5] Dong bo Functions (Ham nguoi dung)...');
    const fnResult = await syncSqlDirectory(
      pool,
      'database/functions',
      'FUNCTION',
      `SELECT name FROM sys.objects WHERE type IN ('FN', 'IF', 'TF') AND schema_id = SCHEMA_ID('dbo')`
    );

    // -----------------------------------------------------------------
    // BƯỚC 3: Đồng bộ PROCEDURES (database/procedures/)
    // -----------------------------------------------------------------
    console.log('\n[3/5] Dong bo Stored Procedures (Thu tuc luu trut)...');
    const spResult = await syncSqlDirectory(
      pool,
      'database/procedures',
      'PROCEDURE',
      `SELECT name FROM sys.procedures WHERE schema_id = SCHEMA_ID('dbo')`
    );

    // -----------------------------------------------------------------
    // BƯỚC 4: Đồng bộ TRIGGERS (database/triggers/)
    // -----------------------------------------------------------------
    console.log('\n[4/5] Dong bo Triggers (Bo kich hoat)...');
    const trResult = await syncSqlDirectory(
      pool,
      'database/triggers',
      'TRIGGER',
      `SELECT name FROM sys.triggers WHERE parent_class = 1`
    );

    // -----------------------------------------------------------------
    // BƯỚC 5: Đảm bảo Roles, Quyền và Logins kiểm thử tồn tại (IF NOT EXISTS)
    // -----------------------------------------------------------------
    console.log('\n[5/5] Kiem tra & bo sung Roles, Quyen va Logins kiem thu neu thieu...');

    await pool.request().batch(`
      -- 1. Đảm bảo Roles tồn tại
      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Admin' AND type = 'R')
        CREATE ROLE [Admin];

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Nhanvien' AND type = 'R')
        CREATE ROLE [Nhanvien];

      -- 2. Cấp quyền cho Roles
      ALTER ROLE db_owner ADD MEMBER [Admin];
      GRANT EXECUTE TO [Nhanvien];
      GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON SCHEMA::dbo TO [Nhanvien];

      -- 3. Đảm bảo tài khoản NV_1 (Admin) tồn tại
      IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NV_1')
      BEGIN
        CREATE LOGIN [NV_1] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
      END
      ELSE
      BEGIN
        ALTER LOGIN [NV_1] WITH PASSWORD = N'123456';
      END

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_1')
      BEGIN
        CREATE USER [NV_1] FOR LOGIN [NV_1];
      END
      ALTER ROLE [Admin] ADD MEMBER [NV_1];

      -- 4. Đảm bảo tài khoản NV_2 (Nhanvien) tồn tại
      IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NV_2')
      BEGIN
        CREATE LOGIN [NV_2] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
      END
      ELSE
      BEGIN
        ALTER LOGIN [NV_2] WITH PASSWORD = N'123456';
      END

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_2')
      BEGIN
        CREATE USER [NV_2] FOR LOGIN [NV_2];
      END
      ALTER ROLE [Nhanvien] ADD MEMBER [NV_2];
    `);

    console.log('   Da kiem tra Roles, Quyen va Logins he thong.');

    // -----------------------------------------------------------------
    // BÁO CÁO TỔNG KẾT
    // -----------------------------------------------------------------
    console.log('\n======================================================================');
    console.log('CAP NHAT DATABASE THANH CONG!');
    console.log('Tong ket dong bo:');
    console.log(`   - Functions : ${fnResult.total} file (${fnResult.newCount} moi, ${fnResult.updateCount} cap nhat)`);
    console.log(`   - Procedures: ${spResult.total} file (${spResult.newCount} moi, ${spResult.updateCount} cap nhat)`);
    console.log(`   - Triggers  : ${trResult.total} file (${trResult.newCount} moi, ${trResult.updateCount} cap nhat)`);
    console.log('Toan bo du lieu cua ban trong 8 bang duoc bao toan nguyen ven.');
    console.log('Khoi dong web de lam viec tiep: npm run dev (hoac npm start)');
    console.log('======================================================================\n');

  } catch (error) {
    console.error('\nCAP NHAT DATABASE THAT BAI:', error.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

runUpdate();
