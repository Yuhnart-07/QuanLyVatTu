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
  console.log(`\n📂 [${objectType}] Đang quét thư mục [${relativeDir}]...`);

  if (!fs.existsSync(dirPath)) {
    console.log(`   ⚠️ Thư mục [${relativeDir}] không tồn tại.`);
    return { total: 0, newCount: 0, updateCount: 0 };
  }

  // Lọc chỉ lấy các file có đuôi .sql (bỏ qua .gitkeep và file ẩn)
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log(`   ℹ️ Thư mục [${relativeDir}] hiện chưa có file .sql nào (đang trống).`);
    return { total: 0, newCount: 0, updateCount: 0 };
  }

  // Lấy danh sách đối tượng hiện có trong CSDL để phân loại THÊM MỚI hay LÀM MỚI
  let existingObjects = new Set();
  try {
    const result = await pool.request().query(checkQuery);
    existingObjects = new Set(result.recordset.map(r => r.name.toLowerCase()));
  } catch (err) {
    console.warn(`   ⚠️ Không thể đọc danh sách ${objectType} hiện tại:`, err.message);
  }

  let newCount = 0;
  let updateCount = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const objectName = path.basename(file, '.sql').toLowerCase();
    const isExisting = existingObjects.has(objectName);

    await executeSqlFile(pool, filePath);

    if (isExisting) {
      console.log(`   🔄 [LÀM MỚI] ${file}`);
      updateCount++;
    } else {
      console.log(`   🆕 [THÊM MỚI] ${file}`);
      newCount++;
    }
  }

  console.log(`   ✅ Đã đồng bộ ${files.length} ${objectType}(s) (${newCount} mới, ${updateCount} cập nhật).`);
  return { total: files.length, newCount, updateCount };
}

async function runUpdate() {
  console.log('======================================================================');
  console.log('🔄 [QLVT] BẮT ĐẦU CẬP NHẬT DATABASE AN TOÀN (BẢO TOÀN DỮ LIỆU)');
  console.log(`📌 Server: ${dbConfig.server}:${dbConfig.port} | Database: ${DB_NAME}`);
  console.log('🛡️  Cam kết:');
  console.log('   • CẬP NHẬT: Functions, Procedures, Triggers, Roles & Logins');
  console.log('   • BẢO TOÀN : KHÔNG chạm tables/, KHÔNG chạm seed/, KHÔNG mất dữ liệu');
  console.log('======================================================================');

  let pool = null;

  try {
    // -----------------------------------------------------------------
    // BƯỚC 1: Kết nối vào CSDL QLVT
    // -----------------------------------------------------------------
    console.log(`\n👉 [1/5] Đang kết nối tới CSDL [${DB_NAME}]...`);
    pool = await sql.connect({ ...dbConfig, database: DB_NAME });
    console.log(`   ✅ Kết nối CSDL [${DB_NAME}] thành công.`);

    // -----------------------------------------------------------------
    // BƯỚC 2: Đồng bộ FUNCTIONS (database/functions/)
    // -----------------------------------------------------------------
    console.log('\n👉 [2/5] Đồng bộ Functions (Hàm người dùng)...');
    const fnResult = await syncSqlDirectory(
      pool,
      'database/functions',
      'FUNCTION',
      `SELECT name FROM sys.objects WHERE type IN ('FN', 'IF', 'TF') AND schema_id = SCHEMA_ID('dbo')`
    );

    // -----------------------------------------------------------------
    // BƯỚC 3: Đồng bộ PROCEDURES (database/procedures/)
    // -----------------------------------------------------------------
    console.log('\n👉 [3/5] Đồng bộ Stored Procedures (Thủ tục lưu trữ)...');
    const spResult = await syncSqlDirectory(
      pool,
      'database/procedures',
      'PROCEDURE',
      `SELECT name FROM sys.procedures WHERE schema_id = SCHEMA_ID('dbo')`
    );

    // -----------------------------------------------------------------
    // BƯỚC 4: Đồng bộ TRIGGERS (database/triggers/)
    // -----------------------------------------------------------------
    console.log('\n👉 [4/5] Đồng bộ Triggers (Bộ kích hoạt)...');
    const trResult = await syncSqlDirectory(
      pool,
      'database/triggers',
      'TRIGGER',
      `SELECT name FROM sys.triggers WHERE parent_class = 1`
    );

    // -----------------------------------------------------------------
    // BƯỚC 5: Đảm bảo Roles, Quyền và Logins kiểm thử tồn tại (IF NOT EXISTS)
    // -----------------------------------------------------------------
    console.log('\n👉 [5/5] Kiểm tra & bổ sung Roles, Quyền và Logins kiểm thử nếu thiếu...');

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

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_2')
      BEGIN
        CREATE USER [NV_2] FOR LOGIN [NV_2];
      END
      ALTER ROLE [Nhanvien] ADD MEMBER [NV_2];
    `);

    console.log('   ✅ Đã kiểm tra Roles, Quyền và Logins hệ thống.');

    // -----------------------------------------------------------------
    // BÁO CÁO TỔNG KẾT
    // -----------------------------------------------------------------
    console.log('\n======================================================================');
    console.log('🎉🎉 CẬP NHẬT DATABASE THÀNH CÔNG 100%!');
    console.log('📊 Tổng kết đồng bộ:');
    console.log(`   • Functions : ${fnResult.total} file (${fnResult.newCount} mới, ${fnResult.updateCount} cập nhật)`);
    console.log(`   • Procedures: ${spResult.total} file (${spResult.newCount} mới, ${spResult.updateCount} cập nhật)`);
    console.log(`   • Triggers  : ${trResult.total} file (${trResult.newCount} mới, ${trResult.updateCount} cập nhật)`);
    console.log('🛡️  Toàn bộ dữ liệu của bạn trong 8 bảng được bảo toàn nguyên vẹn.');
    console.log('👉 Khởi động web để làm việc tiếp: npm run dev (hoặc npm start)');
    console.log('======================================================================\n');

  } catch (error) {
    console.error('\n❌ CẬP NHẬT DATABASE THẤT BẠI:', error.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

runUpdate();
