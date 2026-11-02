// =======================================================
// server/scripts/setupDatabase.js
// Script tự động hóa toàn bộ quy trình thiết lập Database QLVT
// Chạy bằng lệnh: npm run db:setup
// Tự động thực thi theo quy trình 8 bước chuẩn:
//   [1/8] Kiểm tra & tạo Database QLVT (kết nối 'master')
//   [2/8] Khởi tạo cấu trúc 8 bảng dữ liệu (database/init_database.sql)
//   [3/8] Thiết lập Database Roles (Admin, Nhanvien) & phân quyền toàn diện
//   [4/8] Quét và nạp toàn bộ FUNCTIONS (database/functions/)
//   [5/8] Quét và nạp toàn bộ STORED PROCEDURES (database/procedures/)
//   [6/8] Nạp dữ liệu mẫu kiểm thử Seed Data (database/seed/seed_data.sql)
//   [7/8] Quét và nạp toàn bộ TRIGGERS (database/triggers/)
//   [8/8] Tạo tài khoản SQL Server Logins kiểm thử (NV_1, NV_2)
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
 * Lọc sạch các dòng lệnh USE [database]; hoặc USE database; ở đầu/trong batch
 * nhằm tuân thủ nghiêm ngặt quy tắc SQL Server:
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

/**
 * Quét và nạp toàn bộ file SQL trong một thư mục logic
 * Bỏ qua .gitkeep và các file không phải .sql; thông báo rõ ràng nếu thư mục trống.
 */
async function executeSqlDirectory(pool, relativeDir, objectType) {
  const dirPath = path.join(__dirname, '../../', relativeDir);
  console.log(`\n📂 [${objectType}] Đang quét thư mục [${relativeDir}]...`);

  if (!fs.existsSync(dirPath)) {
    console.log(`   ⚠️ Thư mục [${relativeDir}] không tồn tại.`);
    return 0;
  }

  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log(`   Thu muc [${relativeDir}] hien chua co file .sql nao (san sang khi them moi).`);
    return 0;
  }

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    await executeSqlFile(pool, filePath);
    console.log(`   Da nap ${objectType}: [${file}]`);
  }

  console.log(`   Da nap thanh cong ${files.length} ${objectType}(s).`);
  return files.length;
}

async function runSetup() {
  console.log('===============================================================');
  console.log('[QLVT] BAT DAU QUY TRINH THIET LAP DATABASE TU DONG');
  console.log(`Server: ${dbConfig.server}:${dbConfig.port} | Database: ${DB_NAME}`);
  console.log('===============================================================\n');

  let masterPool = null;
  let qlvtPool = null;

  try {
    // -----------------------------------------------------------------
    // BƯỚC 1: Kết nối 'master' để đảm bảo Database QLVT đã tồn tại
    // -----------------------------------------------------------------
    console.log(`[1/8] Kiem tra & khoi tao CSDL [${DB_NAME}]...`);
    masterPool = await sql.connect({ ...dbConfig, database: 'master' });
    
    await masterPool.request().batch(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}')
      BEGIN
        CREATE DATABASE [${DB_NAME}];
        PRINT N'>>> Đã tạo CSDL ${DB_NAME}.';
      END
    `);
    console.log(`   CSDL [${DB_NAME}] da san sang.`);
    await masterPool.close();
    masterPool = null;

    // -----------------------------------------------------------------
    // BƯỚC 2: Kết nối trực tiếp vào Database QLVT
    // -----------------------------------------------------------------
    qlvtPool = await sql.connect({ ...dbConfig, database: DB_NAME });

    // -----------------------------------------------------------------
    // BƯỚC 3: Tạo 8 bảng dữ liệu từ init_database.sql
    // -----------------------------------------------------------------
    console.log('\n[2/8] Khoi tao cau truc 8 bang du lieu...');
    const initDbPath = path.join(__dirname, '../../database/init_database.sql');
    await executeSqlFile(qlvtPool, initDbPath);
    console.log('   Da khoi tao 8 bang thanh cong.');

    // -----------------------------------------------------------------
    // BƯỚC 4: Tạo Roles và Phân quyền (Admin, Nhanvien)
    // -----------------------------------------------------------------
    console.log('\n[3/8] Thiet lap Database Roles (Admin, Nhanvien) & Phan quyen...');
    await qlvtPool.request().batch(`
      -- Tạo Role Admin nếu chưa có
      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Admin' AND type = 'R')
        CREATE ROLE [Admin];

      -- Tạo Role Nhanvien nếu chưa có
      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'Nhanvien' AND type = 'R')
        CREATE ROLE [Nhanvien];

      -- Cấp quyền cho Admin (Toàn quyền quản trị DB)
      ALTER ROLE db_owner ADD MEMBER [Admin];

      -- Cấp quyền cho Nhanvien:
      -- EXECUTE: áp dụng cho Scalar Functions & Stored Procedures
      -- SELECT, INSERT, UPDATE, DELETE: áp dụng cho Bảng & Table-Valued Functions
      GRANT EXECUTE TO [Nhanvien];
      GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON SCHEMA::dbo TO [Nhanvien];
    `);
    console.log('   Thiet lap Roles & Phan quyen hoan tat.');

    // -----------------------------------------------------------------
    // BƯỚC 5: Tự động quét và nạp toàn bộ Functions (database/functions/)
    // -----------------------------------------------------------------
    console.log('\n[4/8] Quet va nap toan bo Functions (Ham nguoi dung)...');
    const fnCount = await executeSqlDirectory(qlvtPool, 'database/functions', 'FUNCTION');

    // -----------------------------------------------------------------
    // BƯỚC 6: Tự động quét và nạp toàn bộ Stored Procedures (database/procedures/)
    // -----------------------------------------------------------------
    console.log('\n[5/8] Quet va nap toan bo Stored Procedures (Thu tuc luu trut)...');
    const spCount = await executeSqlDirectory(qlvtPool, 'database/procedures', 'PROCEDURE');

    // -----------------------------------------------------------------
    // BƯỚC 7: Nạp dữ liệu mẫu kiểm thử (Seed Data)
    // (Được nạp TRƯỚC Triggers để tránh trigger tính tồn kho làm lệch số liệu ban đầu)
    // -----------------------------------------------------------------
    console.log('\n[6/8] Nap du lieu mau kiem thu (Seed Data)...');
    const seedPath = path.join(__dirname, '../../database/seed/seed_data.sql');
    await executeSqlFile(qlvtPool, seedPath);
    console.log('   Da nap Seed Data cho ca 8 bang thanh cong.');

    // -----------------------------------------------------------------
    // BƯỚC 8: Tự động quét và nạp toàn bộ Triggers (database/triggers/)
    // (Được nạp SAU Seed Data để bảo vệ số lượng tồn kho ban đầu)
    // -----------------------------------------------------------------
    console.log('\n[7/8] Quet va nap toan bo Triggers (Bo kich hoat)...');
    const trCount = await executeSqlDirectory(qlvtPool, 'database/triggers', 'TRIGGER');

    // -----------------------------------------------------------------
    // BƯỚC 9: Tạo các SQL Server Logins & Users mẫu phục vụ kiểm thử
    // -----------------------------------------------------------------
    console.log('\n[8/8] Tao tai khoan SQL Server Logins kiem thu (NV_1, NV_2)...');
    await qlvtPool.request().batch(`
      -- 1. Dọn dẹp các tài khoản thừa hoặc user cũ dạng NV_1, NV_2
      IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_1')
      BEGIN
        ALTER ROLE [Admin] DROP MEMBER [NV_1];
        DROP USER [NV_1];
      END
      IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'admin')
      BEGIN
        DROP LOGIN [admin];
      END

      IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'NV_2')
      BEGIN
        ALTER ROLE [Nhanvien] DROP MEMBER [NV_2];
        DROP USER [NV_2];
      END
      IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'nhanvien')
      BEGIN
        DROP LOGIN [nhanvien];
      END

      -- 2. Chuẩn hóa tài khoản Quản trị: Login = 'NV_1' (MANV = 1, Database User BẮT BUỘC là Mã NV: [1], Role: Admin)
      IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NV_1')
      BEGIN
        CREATE LOGIN [NV_1] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
      END
      ELSE
      BEGIN
        ALTER LOGIN [NV_1] WITH PASSWORD = N'123456';
      END

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'1')
      BEGIN
        CREATE USER [1] FOR LOGIN [NV_1];
      END
      ALTER ROLE [Admin] ADD MEMBER [1];

      IF IS_SRVROLEMEMBER('securityadmin', 'NV_1') = 0
      BEGIN
        ALTER SERVER ROLE [securityadmin] ADD MEMBER [NV_1];
      END

      -- 3. Chuẩn hóa tài khoản Nhân viên: Login = 'NV_2' (MANV = 2, Database User BẮT BUỘC là Mã NV: [2], Role: Nhanvien)
      IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'NV_2')
      BEGIN
        CREATE LOGIN [NV_2] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
      END
      ELSE
      BEGIN
        ALTER LOGIN [NV_2] WITH PASSWORD = N'123456';
      END

      IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'2')
      BEGIN
        CREATE USER [2] FOR LOGIN [NV_2];
      END
      ALTER ROLE [Nhanvien] ADD MEMBER [2];
    `);
    console.log('   Đã tạo 2 tài khoản kiểm thử duy nhất:');
    console.log('      Quản trị : Login = "NV_1" | Password = "123456" | Role: Admin    (MANV: 1)');
    console.log('      Nhân viên: Login = "NV_2" | Password = "123456" | Role: Nhanvien (MANV: 2)');

    console.log('\n===============================================================');
    console.log('THIET LAP DATABASE QLVT THANH CONG!');
    console.log('Thong ke doi tuong nap vao:');
    console.log(`   - Cau truc 8 bang du lieu: Day du (database/init_database.sql)`);
    console.log(`   - Functions              : ${fnCount} file`);
    console.log(`   - Stored Procedures      : ${spCount} file`);
    console.log(`   - Du lieu mau (Seed)     : Hoan tat`);
    console.log(`   - Triggers               : ${trCount} file`);
    console.log(`   - Logins kiem thu        : NV_1 (Admin), NV_2 (Nhanvien)`);
    console.log('Khoi dong web: npm run dev (hoac npm start)');
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\nQUY TRINH THIET LAP THAT BAI:', error.message);
    process.exit(1);
  } finally {
    if (masterPool) await masterPool.close();
    if (qlvtPool) await qlvtPool.close();
  }
}

runSetup();
