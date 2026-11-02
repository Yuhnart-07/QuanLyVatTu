// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/scripts/testLoginFeature.js
// Mô tả: Script kiểm thử tự động toàn diện chức năng Quản lý Login SQL Server (Mục 3.1):
//         - Lớp 2: Validator Middleware (kiểm tra kiểu dữ liệu, bắt rỗng, độ dài mật khẩu, role).
//         - Lớp 3: Stored Procedure sp_TaoLogin theo đúng 5 bước chuẩn (MANV làm User name, gán Role, securityadmin).
//         - Xác thực đăng nhập ngay sau khi tạo qua sp_XacThucTaiKhoan.
//         - Lớp 3: Stored Procedure sp_XoaLogin (chặn xóa sa, thu hồi securityadmin, xóa User và Login).
//         - Service & Controller: Chặn tự xóa tài khoản đang đăng nhập.
//         - Phân quyền: requireAdmin chặn tài khoản nhóm Nhanvien bằng HTTP 403 Forbidden.
// ====================================================================================

require('dotenv').config();
const { getPool, sql } = require('../config/database');
const adminService = require('../services/adminService');
const adminRepository = require('../repositories/adminRepository');
const { validateCreateLogin, validateDeleteLogin } = require('../validators/adminValidator');
const { requireAdmin } = require('../middlewares/roleMiddleware');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG TẠO / XÓA LOGIN (MỤC 3.1)');
  console.log('======================================================================\n');

  try {
    const pool = await getPool();

    // --------------------------------------------------------------------------------
    // TEST SUITE 1: TẦNG VALIDATOR (LỚP 2 VALIDATION)
    // --------------------------------------------------------------------------------
    console.log('👉 [1/6] Kiểm thử Lớp 2: Validator Middleware (Ràng buộc đầu vào)...');

    // 1.1: Chặn khi thiếu hoặc MANV không hợp lệ
    let vError1 = null;
    validateCreateLogin({ body: { manv: -1, username: 'test_user', password: 'password123', role: 'Nhanvien' } }, {
      status: (c) => ({ json: (d) => { vError1 = { code: c, ...d }; } })
    }, () => {});
    assert(vError1 && vError1.code === 400 && vError1.errorCode === 'INVALID_MANV',
      'Validator chặn tạo login khi MANV không hợp lệ (<= 0)');

    // 1.2: Chặn khi username quá ngắn (< 3 ký tự)
    let vError2 = null;
    validateCreateLogin({ body: { manv: 10, username: 'ab', password: 'password123', role: 'Nhanvien' } }, {
      status: (c) => ({ json: (d) => { vError2 = { code: c, ...d }; } })
    }, () => {});
    assert(vError2 && vError2.code === 400 && vError2.errorCode === 'INVALID_USERNAME_LENGTH',
      'Validator chặn tạo login khi Username có độ dài < 3 ký tự');

    // 1.3: Chặn khi mật khẩu quá ngắn (< 6 ký tự)
    let vError3 = null;
    validateCreateLogin({ body: { manv: 10, username: 'valid_user', password: '123', role: 'Nhanvien' } }, {
      status: (c) => ({ json: (d) => { vError3 = { code: c, ...d }; } })
    }, () => {});
    assert(vError3 && vError3.code === 400 && vError3.errorCode === 'INVALID_PASSWORD_LENGTH',
      'Validator chặn tạo login khi Mật khẩu < 6 ký tự');

    // 1.4: Chặn khi Role không hợp lệ
    let vError4 = null;
    validateCreateLogin({ body: { manv: 10, username: 'valid_user', password: 'password123', role: 'SuperAdmin' } }, {
      status: (c) => ({ json: (d) => { vError4 = { code: c, ...d }; } })
    }, () => {});
    assert(vError4 && vError4.code === 400 && vError4.errorCode === 'INVALID_ROLE',
      'Validator chặn khi Role không thuộc Admin hoặc Nhanvien');

    // 1.5: Chặn xóa tài khoản sa
    let vDeleteSaError = null;
    validateDeleteLogin({ params: { username: 'sa' } }, {
      status: (c) => ({ json: (d) => { vDeleteSaError = { code: c, ...d }; } })
    }, () => {});
    assert(vDeleteSaError && vDeleteSaError.code === 400 && vDeleteSaError.errorCode === 'FORBIDDEN_DELETE_SA',
      'Validator chặn xóa tài khoản quản trị hệ thống sa');

    // --------------------------------------------------------------------------------
    // TEST SUITE 2: TRUY VẤN DANH SÁCH LOGIN (sp_Login_GetAll)
    // --------------------------------------------------------------------------------
    console.log('\n👉 [2/6] Kiểm thử Stored Procedure sp_Login_GetAll...');

    const loginsList = await adminRepository.getAllLogins();
    assert(Array.isArray(loginsList) && loginsList.length >= 2,
      `sp_Login_GetAll trả về danh sách ${loginsList.length} nhân viên`);

    const adminNv1 = loginsList.find(item => item.MANV === 1);
    assert(adminNv1 && adminNv1.HasLogin === 1 && adminNv1.Username === 'NV_1' && adminNv1.Role === 'Admin',
      'Nhân viên 1 có tài khoản Login NV_1 với quyền Admin');

    const staffNv2 = loginsList.find(item => item.MANV === 2);
    assert(staffNv2 && staffNv2.HasLogin === 1 && staffNv2.Username === 'NV_2' && staffNv2.Role === 'Nhanvien',
      'Nhân viên 2 có tài khoản Login NV_2 với quyền Nhanvien');

    // --------------------------------------------------------------------------------
    // TEST SUITE 3: STORED PROCEDURE sp_TaoLogin (5 BƯỚC CHUẨN)
    // --------------------------------------------------------------------------------
    console.log('\n👉 [3/6] Kiểm thử Stored Procedure sp_TaoLogin (Quy trình 5 bước chuẩn)...');

    // 3.1: Chặn trùng tên đăng nhập đã có (ví dụ: NV_1 đã tồn tại)
    let duplicateLoginError = null;
    try {
      await adminRepository.createLogin({ manv: 10, username: 'NV_1', password: 'password123', role: 'Nhanvien' });
    } catch (err) {
      duplicateLoginError = err;
    }
    assert(duplicateLoginError && duplicateLoginError.message.includes('Tên đăng nhập đã tồn tại'),
      'sp_TaoLogin chặn tạo tài khoản khi trùng tên đăng nhập (NV_1)');

    // 3.2: Chặn tạo thêm tài khoản cho nhân viên đã có login (NV 1 đã có Login NV_1)
    let duplicateEmployeeError = null;
    try {
      await adminRepository.createLogin({ manv: 1, username: 'NV_1_NEW', password: 'password123', role: 'Admin' });
    } catch (err) {
      duplicateEmployeeError = err;
    }
    assert(duplicateEmployeeError && duplicateEmployeeError.message.includes('Nhân viên này đã được cấp tài khoản'),
      'sp_TaoLogin chặn cấp thêm tài khoản cho nhân viên đã có Login (MANV: 1)');

    // Dọn dẹp tài khoản kiểm thử trước khi chạy (nếu có sót lại từ trước)
    try { await adminRepository.deleteLogin('TEST_ADMIN_NV10'); } catch (e) {}
    try { await adminRepository.deleteLogin('TEST_STAFF_NV11'); } catch (e) {}

    // 3.3: Tạo tài khoản Admin mới cho NV 10 (theo quy ước Database User name là "10")
    await adminRepository.createLogin({
      manv: 10,
      username: 'TEST_ADMIN_NV10',
      password: 'Password@123',
      role: 'Admin'
    });

    // Kiểm tra Database User được tạo đúng tên là MANV ("10")
    const checkUser10 = await pool.request().query(`
      SELECT dp.name AS DbUserName, sp.name AS LoginName, role_dp.name AS RoleName
      FROM sys.database_principals dp
      JOIN sys.server_principals sp ON dp.sid = sp.sid
      LEFT JOIN sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
      LEFT JOIN sys.database_principals role_dp ON drm.role_principal_id = role_dp.principal_id
      WHERE sp.name = 'TEST_ADMIN_NV10'
    `);
    assert(checkUser10.recordset.length > 0 && checkUser10.recordset[0].DbUserName === '10',
      'Quy ước chuẩn: Tên Database User được tạo chính xác là MÃ NV ("10")');
    assert(checkUser10.recordset[0].RoleName === 'Admin',
      'Database User "10" được đưa vào nhóm quyền [Admin]');

    // Kiểm tra Bước 5: Tài khoản Admin được cấp server role securityadmin
    const checkSecAdmin = await pool.request().query(`
      SELECT IS_SRVROLEMEMBER('securityadmin', 'TEST_ADMIN_NV10') AS IsSecAdmin
    `);
    assert(checkSecAdmin.recordset[0].IsSecAdmin === 1,
      'Bước 5 chuẩn: Tài khoản Admin TEST_ADMIN_NV10 được cấp server role [securityadmin]');

    // 3.4: Tạo tài khoản Nhân viên mới cho NV 11
    await adminRepository.createLogin({
      manv: 11,
      username: 'TEST_STAFF_NV11',
      password: 'Password@123',
      role: 'Nhanvien'
    });

    const checkSecStaff = await pool.request().query(`
      SELECT IS_SRVROLEMEMBER('securityadmin', 'TEST_STAFF_NV11') AS IsSecAdmin
    `);
    assert(checkSecStaff.recordset[0].IsSecAdmin === 0,
      'Bước 5 chuẩn: Tài khoản Nhân viên TEST_STAFF_NV11 tuyệt đối KHÔNG được cấp [securityadmin]');

    // --------------------------------------------------------------------------------
    // TEST SUITE 4: XÁC THỰC ĐĂNG NHẬP NGAY BẰNG sp_XacThucTaiKhoan
    // --------------------------------------------------------------------------------
    console.log('\n👉 [4/6] Kiểm thử Đăng nhập tài khoản vừa tạo qua sp_XacThucTaiKhoan...');

    const authResult = await pool.request()
      .input('Username', sql.NVarChar(50), 'TEST_ADMIN_NV10')
      .input('Password', sql.NVarChar(100), 'Password@123')
      .execute('sp_XacThucTaiKhoan');

    assert(authResult.recordset && authResult.recordset.length > 0 && authResult.recordset[0].manv === 10,
      'Tài khoản mới tạo TEST_ADMIN_NV10 đăng nhập thành công, trích xuất chính xác MANV = 10');
    assert(authResult.recordset[0].role === 'Admin',
      'Phiên làm việc xác nhận đúng vai trò Admin');

    // --------------------------------------------------------------------------------
    // TEST SUITE 5: STORED PROCEDURE sp_XoaLogin & RÀNG BUỘC AN TOÀN
    // --------------------------------------------------------------------------------
    console.log('\n👉 [5/6] Kiểm thử Stored Procedure sp_XoaLogin và Logic an toàn...');

    // 5.1: Chặn xóa tài khoản sa tại Stored Procedure
    let spDeleteSaError = null;
    try {
      await adminRepository.deleteLogin('sa');
    } catch (err) {
      spDeleteSaError = err;
    }
    assert(spDeleteSaError && spDeleteSaError.message.includes('quản trị hệ thống sa'),
      'sp_XoaLogin chặn xóa tài khoản quản trị hệ thống sa');

    // 5.2: Service chặn người dùng tự xóa tài khoản đang đăng nhập
    let selfDeleteError = null;
    try {
      await adminService.deleteLogin('NV_1', { username: 'NV_1' });
    } catch (err) {
      selfDeleteError = err;
    }
    assert(selfDeleteError && selfDeleteError.message.includes('tự xóa tài khoản đang đăng nhập'),
      'Service chặn người dùng tự xóa tài khoản của chính mình trong phiên làm việc');

    // 5.3: Xóa thành công tài khoản kiểm thử TEST_ADMIN_NV10
    await adminService.deleteLogin('TEST_ADMIN_NV10', { username: 'NV_1' });
    const checkDeleted10 = await pool.request().query(`
      SELECT COUNT(*) AS Cnt FROM sys.server_principals WHERE name = 'TEST_ADMIN_NV10'
    `);
    const checkDeletedUser10 = await pool.request().query(`
      SELECT COUNT(*) AS Cnt FROM sys.database_principals WHERE name = '10'
    `);
    assert(checkDeleted10.recordset[0].Cnt === 0 && checkDeletedUser10.recordset[0].Cnt === 0,
      'sp_XoaLogin thu hồi sạch: Xóa Server Login và xóa Database User "10"');

    // 5.4: Xóa thành công tài khoản kiểm thử TEST_STAFF_NV11
    await adminService.deleteLogin('TEST_STAFF_NV11', { username: 'NV_1' });
    const checkDeleted11 = await pool.request().query(`
      SELECT COUNT(*) AS Cnt FROM sys.server_principals WHERE name = 'TEST_STAFF_NV11'
    `);
    assert(checkDeleted11.recordset[0].Cnt === 0,
      'Xóa sạch tài khoản kiểm thử TEST_STAFF_NV11, bảo toàn CSDL');

    // --------------------------------------------------------------------------------
    // TEST SUITE 6: PHÂN QUYỀN CHẶN NHÓM NHANVIEN (403 FORBIDDEN)
    // --------------------------------------------------------------------------------
    console.log('\n👉 [6/6] Kiểm thử Middleware phân quyền chặn nhóm Nhanvien...');

    let forbiddenResponse = null;
    const reqStaff = {
      user: { manv: 2, role: 'Nhanvien' },
      xhr: true,
      headers: { accept: 'application/json' }
    };
    const resMockForbidden = {
      status: (code) => ({
        json: (data) => { forbiddenResponse = { code, ...data }; }
      })
    };
    requireAdmin(reqStaff, resMockForbidden, () => {});
    assert(forbiddenResponse && forbiddenResponse.code === 403 && forbiddenResponse.errorCode === 'FORBIDDEN',
      'requireAdmin chặn người dùng có Role = "Nhanvien" bằng mã lỗi HTTP 403 Forbidden');

    let adminPassed = false;
    const reqAdmin = {
      user: { manv: 1, role: 'Admin' }
    };
    requireAdmin(reqAdmin, {}, () => { adminPassed = true; });
    assert(adminPassed === true,
      'requireAdmin cho phép người dùng có Role = "Admin" truy cập hợp lệ');

    // --------------------------------------------------------------------------------
    // TỔNG KẾT KẾT QUẢ KIỂM THỬ
    // --------------------------------------------------------------------------------
    console.log('\n======================================================================');
    console.log(`🎉 TỔNG KẾT: ĐẠT ${passedTests}/${totalTests} KIỂM THỬ (${Math.round((passedTests / totalTests) * 100)}% SUCCESS)`);
    console.log('======================================================================\n');

    process.exit(0);

  } catch (err) {
    console.error('\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exit(1);
  }
}

runTests();
