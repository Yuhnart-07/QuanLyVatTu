// =======================================================
// server/scripts/setupDatabase.js
// Script tự động hóa toàn bộ quy trình thiết lập Database QLVT
// Chạy bằng lệnh: npm run db:setup
// Tự động thực thi:
//   1. Đảm bảo Database QLVT tồn tại
//   2. Khởi tạo 8 bảng dữ liệu (schema)
//   3. Tạo các Database Roles (Admin, Nhanvien) & phân quyền
//   4. Tự động nạp toàn bộ Stored Procedures trong database/procedures/
//   5. Nạp dữ liệu mẫu (Seed Data)
//   6. Tạo sẵn các Login & User SQL Server mẫu (NV_1, NV_2) để test login
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
 * Tách một chuỗi nội dung SQL thành nhiều batch độc lập dựa vào lệnh 'GO'
 */
function splitSqlBatches(sqlContent) {
  return sqlContent
    .split(/^\s*GO\s*$/gmi)
    .map(batch => batch.trim())
    .filter(batch => batch.length > 0);
}

/**
 * Thực thi một file SQL (hỗ trợ nhiều batch ngăn cách bởi GO)
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

async function runSetup() {
  console.log('===============================================================');
  console.log('🚀 [QLVT] BẮT ĐẦU QUY TRÌNH THIẾT LẬP DATABASE TỰ ĐỘNG');
  console.log(`📌 Server: ${dbConfig.server}:${dbConfig.port} | Database: ${DB_NAME}`);
  console.log('===============================================================\n');

  let masterPool = null;
  let qlvtPool = null;

  try {
    // -----------------------------------------------------------------
    // BƯỚC 1: Kết nối 'master' để đảm bảo Database QLVT đã tồn tại
    // -----------------------------------------------------------------
    console.log(`👉 [1/6] Kiểm tra & khởi tạo CSDL [${DB_NAME}]...`);
    masterPool = await sql.connect({ ...dbConfig, database: 'master' });
    
    await masterPool.request().batch(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}')
      BEGIN
        CREATE DATABASE [${DB_NAME}];
        PRINT N'>>> Đã tạo CSDL ${DB_NAME}.';
      END
    `);
    console.log(`   ✅ CSDL [${DB_NAME}] đã sẵn sàng.`);
    await masterPool.close();
    masterPool = null;

    // -----------------------------------------------------------------
    // BƯỚC 2: Kết nối trực tiếp vào Database QLVT
    // -----------------------------------------------------------------
    qlvtPool = await sql.connect({ ...dbConfig, database: DB_NAME });

    // -----------------------------------------------------------------
    // BƯỚC 3: Tạo 8 bảng dữ liệu từ init_database.sql
    // -----------------------------------------------------------------
    console.log('👉 [2/6] Khởi tạo cấu trúc 8 bảng dữ liệu...');
    const initDbPath = path.join(__dirname, '../../database/init_database.sql');
    await executeSqlFile(qlvtPool, initDbPath);
    console.log('   ✅ Đã khởi tạo 8 bảng thành công.');

    // -----------------------------------------------------------------
    // BƯỚC 4: Tạo Roles và Phân quyền (Admin, Nhanvien)
    // -----------------------------------------------------------------
    console.log('👉 [3/6] Thiết lập Database Roles (Admin, Nhanvien)...');
    await qlvtPool.request().batch(`
      -- Tạo Role Admin nếu chưa có
      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Admin' AND type = 'R')
        CREATE ROLE [Admin];

      -- Tạo Role Nhanvien nếu chưa có
      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Nhanvien' AND type = 'R')
        CREATE ROLE [Nhanvien];

      -- Cấp quyền cho Admin (Toàn quyền quản trị DB)
      ALTER ROLE db_owner ADD MEMBER [Admin];

      -- Cấp quyền cho Nhanvien (Thực thi SP và Thao tác dữ liệu)
      GRANT EXECUTE TO [Nhanvien];
      GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [Nhanvien];
    `);
    console.log('   ✅ Thiết lập Roles & Phân quyền hoàn tất.');

    // -----------------------------------------------------------------
    // BƯỚC 5: Tự động quét và nạp toàn bộ Stored Procedures
    // -----------------------------------------------------------------
    console.log('👉 [4/6] Quét và nạp toàn bộ Stored Procedures...');
    const proceduresDir = path.join(__dirname, '../../database/procedures');
    const procedureFiles = fs.readdirSync(proceduresDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (procedureFiles.length === 0) {
      console.log('   ⚠️  Không tìm thấy file Stored Procedure nào trong database/procedures/');
    } else {
      for (const file of procedureFiles) {
        const filePath = path.join(proceduresDir, file);
        await executeSqlFile(qlvtPool, filePath);
        console.log(`   ⚡ Đã nạp Stored Procedure: [${file}]`);
      }
      console.log(`   ✅ Đã nạp thành công ${procedureFiles.length} Stored Procedure(s).`);
    }

    // -----------------------------------------------------------------
    // BƯỚC 6: Nạp dữ liệu mẫu (Seed Data)
    // -----------------------------------------------------------------
    console.log('👉 [5/6] Nạp dữ liệu mẫu kiểm thử (Seed Data)...');
    const seedPath = path.join(__dirname, '../../database/seed/seed_data.sql');
    await executeSqlFile(qlvtPool, seedPath);
    console.log('   ✅ Đã nạp Seed Data cho cả 8 bảng thành công.');

    // -----------------------------------------------------------------
    // BƯỚC 7: Tạo các SQL Server Logins & Users mẫu phục vụ kiểm thử
    // -----------------------------------------------------------------
    console.log('👉 [6/6] Tạo tài khoản SQL Server Logins kiểm thử (NV_1, NV_2)...');
    await qlvtPool.request().batch(`
      -- 1. Tài khoản Quản trị: NV_1 (MANV = 1, Role: Admin)
      IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NV_1')
      BEGIN
        CREATE LOGIN [NV_1] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
      END

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_1')
      BEGIN
        CREATE USER [NV_1] FOR LOGIN [NV_1];
      END
      ALTER ROLE [Admin] ADD MEMBER [NV_1];

      -- 2. Tài khoản Nhân viên: NV_2 (MANV = 2, Role: Nhanvien)
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
    console.log('   ✅ Đã tạo tài khoản mẫu:');
    console.log('      👤 Quản trị: Username = "NV_1" | Password = "123456" | Quyền = Admin');
    console.log('      👤 Nhân viên: Username = "NV_2" | Password = "123456" | Quyền = Nhanvien');

    console.log('\n===============================================================');
    console.log('🎉🎉 THIẾT LẬP DATABASE QLVT THÀNH CÔNG 100%! BẠN CÓ THỂ CHẠY WEB NGAY!');
    console.log('👉 Khởi động web: npm run dev (hoặc npm start)');
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\n❌ QUY TRÌNH THIẾT LẬP THẤT BẠI:', error.message);
    process.exit(1);
  } finally {
    if (masterPool) await masterPool.close();
    if (qlvtPool) await qlvtPool.close();
  }
}

runSetup();
