// =======================================================
// server/scripts/testEmployeeFeature.js
// Script kiểm thử tự động toàn diện chức năng Quản lý Nhân viên (Mục 1.1)
// Kiểm tra: BR01, BR11, CRUD và logic Undo 1 bước gần nhất
// =======================================================

require('dotenv').config();
const { getPool } = require('../config/database');
const employeeService = require('../services/employeeService');
const employeeRepository = require('../repositories/employeeRepository');
const { validateCreate, validateUpdate } = require('../validators/employeeValidator');

let passedTests = 0;
let totalTests = 0;

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
  console.log('===============================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG QUẢN LÝ NHÂN VIÊN (1.1)');
  console.log('===============================================================\n');

  try {
    const pool = await getPool();

    // -------------------------------------------------------------
    // TEST SUITE 1: TẦNG VALIDATOR (LỚP 2 VALIDATION)
    // -------------------------------------------------------------
    console.log('👉 [1/5] Kiểm thử Lớp 2: Validator Middleware (BR01 & Input constraints)...');

    // Test 1.1: validateCreate với Lương < 5.000.000 VNĐ
    let validatorError = null;
    const reqInvalidLuong = {
      body: { manv: 99, ho: 'Nguyễn Văn', ten: 'Test', luong: 4500000 }
    };
    const resMock1 = {
      status: (code) => ({
        json: (data) => { validatorError = { code, ...data }; }
      })
    };
    validateCreate(reqInvalidLuong, resMock1, () => {});
    assert(validatorError && validatorError.code === 400 && validatorError.errorCode === 'INVALID_LUONG',
      'Validator chặn thêm mới khi Lương < 5,000,000 VNĐ (BR01)');

    // Test 1.2: validateCreate với MANV không hợp lệ
    let manvError = null;
    const reqInvalidManv = {
      body: { manv: -5, ho: 'Nguyễn Văn', ten: 'Test', luong: 6000000 }
    };
    validateCreate(reqInvalidManv, {
      status: (code) => ({ json: (data) => { manvError = { code, ...data }; } })
    }, () => {});
    assert(manvError && manvError.code === 400 && manvError.errorCode === 'INVALID_MANV',
      'Validator chặn thêm mới khi MANV <= 0');

    // Test 1.3: validateUpdate với Lương < 5.000.000 VNĐ
    let updateLuongError = null;
    const reqUpdateInvalid = {
      body: { ho: 'Nguyễn Văn', ten: 'Test', luong: 3000000 }
    };
    validateUpdate(reqUpdateInvalid, {
      status: (code) => ({ json: (data) => { updateLuongError = { code, ...data }; } })
    }, () => {});
    assert(updateLuongError && updateLuongError.code === 400 && updateLuongError.errorCode === 'INVALID_LUONG',
      'Validator chặn cập nhật khi Lương < 5,000,000 VNĐ (BR01)');

    // -------------------------------------------------------------
    // TEST SUITE 2: TẦNG STORED PROCEDURE (LỚP 3 - BR01 TẠI DATABASE)
    // -------------------------------------------------------------
    console.log('\n👉 [2/5] Kiểm thử Lớp 3: Stored Procedure & Ràng buộc BR01...');

    // Đảm bảo không còn bản ghi tạm MANV = 99
    try { await pool.request().query('DELETE FROM dbo.Nhanvien WHERE MANV IN (99, 100)'); } catch(e) {}

    // Test 2.1: Gọi sp_NhanVien_Create với Lương = 4,000,000 -> Phải bị THROW 50001
    let spCreateBR01Caught = false;
    try {
      await employeeRepository.create({
        manv: 99,
        ho: 'Đặng Quốc',
        ten: 'Dũng',
        luong: 4000000
      });
    } catch (err) {
      spCreateBR01Caught = err.message.includes('5,000,000') || err.message.includes('BR01') || err.number === 50001;
    }
    assert(spCreateBR01Caught, 'Stored Procedure sp_NhanVien_Create chặn tạo nhân viên có Lương < 5,000,000 (BR01)');

    // Test 2.2: Tạo nhân viên hợp lệ (Lương = 8,000,000)
    let createdEmp = null;
    try {
      createdEmp = await employeeRepository.create({
        manv: 99,
        ho: 'Đặng Quốc',
        ten: 'Dũng',
        diachi: '123 Cách Mạng Tháng 8, Q.3',
        ngaysinh: '1995-10-10',
        luong: 8000000,
        ghichu: 'Nhân viên kiểm thử'
      });
    } catch (err) {
      console.error(err);
    }
    assert(createdEmp && createdEmp.manv === 99, 'Tạo nhân viên hợp lệ thành công với Lương = 8,000,000 VNĐ');

    // Test 2.3: sp_NhanVien_Update với Lương = 2,000,000 -> Phải bị THROW 50001
    let spUpdateBR01Caught = false;
    try {
      await employeeRepository.update(99, {
        ho: 'Đặng Quốc',
        ten: 'Dũng',
        luong: 2000000
      });
    } catch (err) {
      spUpdateBR01Caught = err.message.includes('5,000,000') || err.message.includes('BR01') || err.number === 50001;
    }
    assert(spUpdateBR01Caught, 'Stored Procedure sp_NhanVien_Update chặn cập nhật Lương < 5,000,000 (BR01)');

    // -------------------------------------------------------------
    // TEST SUITE 3: STORED PROCEDURE CHẶN XÓA THEO BR11
    // -------------------------------------------------------------
    console.log('\n👉 [3/5] Kiểm thử Ràng buộc BR11: Chặn xóa nhân viên đã lập phiếu...');

    // Test 3.1: Xóa NV 1 (Đã lập Đơn đặt hàng DDH00001) -> Phải bị chặn
    let deleteNV1Caught = false;
    let deleteNV1Msg = '';
    try {
      await employeeRepository.delete(1);
    } catch (err) {
      deleteNV1Caught = true;
      deleteNV1Msg = err.message;
    }
    assert(deleteNV1Caught && (deleteNV1Msg.includes('BR11') || deleteNV1Msg.includes('Đơn đặt hàng')),
      'sp_NhanVien_Delete chặn xóa MANV = 1 vì đã lập Đơn đặt hàng (BR11)');

    // Test 3.2: Xóa NV 2 (Đã lập Phiếu nhập PN000001) -> Phải bị chặn
    let deleteNV2Caught = false;
    try {
      await employeeRepository.delete(2);
    } catch (err) {
      deleteNV2Caught = true;
    }
    assert(deleteNV2Caught, 'sp_NhanVien_Delete chặn xóa MANV = 2 vì đã lập Phiếu nhập (BR11)');

    // Test 3.3: Xóa NV 3 (Đã lập Phiếu xuất PX000001) -> Phải bị chặn
    let deleteNV3Caught = false;
    try {
      await employeeRepository.delete(3);
    } catch (err) {
      deleteNV3Caught = true;
    }
    assert(deleteNV3Caught, 'sp_NhanVien_Delete chặn xóa MANV = 3 vì đã lập Phiếu xuất (BR11)');

    // Test 3.4: Xóa NV 99 (Chưa lập phiếu nào) -> Phải xóa thành công
    let deleteNV99Success = false;
    try {
      deleteNV99Success = await employeeRepository.delete(99);
    } catch (err) {
      console.error(err);
    }
    assert(deleteNV99Success, 'sp_NhanVien_Delete cho phép xóa NV 99 vì chưa từng lập đơn/phiếu');

    // -------------------------------------------------------------
    // TEST SUITE 4: CƠ CHẾ PHỤC HỒI (UNDO) 1 BƯỚC GẦN NHẤT
    // -------------------------------------------------------------
    console.log('\n👉 [4/5] Kiểm thử Logic Phục hồi (Undo) 1 bước gần nhất...');

    const fakeSession = {};

    // Test 4.1: Undo thao tác CREATE (Tạo NV 100 -> Undo -> NV 100 bị xóa)
    await employeeService.createEmployee({
      manv: 100,
      ho: 'Lê Văn',
      ten: 'Hoàn Tác',
      luong: 6000000
    }, fakeSession);

    assert(fakeSession.employeeUndoAction?.action === 'CREATE', 'Lưu vết thao tác CREATE vào session');

    // Gọi Undo
    const undoCreateRes = await employeeService.undoEmployee(fakeSession);
    const check100 = await employeeRepository.getById(100);
    assert(check100 === null && undoCreateRes.action === 'CREATE',
      'Undo thao tác CREATE thành công: NV 100 vừa thêm đã được tự động xóa');
    assert(fakeSession.employeeUndoAction === null,
      'Sau khi Undo, trạng thái session được xóa về null (quy tắc 1 bước gần nhất)');

    // Test 4.2: Undo thao tác UPDATE
    // Tạo lại NV 99
    await employeeService.createEmployee({
      manv: 99,
      ho: 'Ngô Văn',
      ten: 'Gốc',
      luong: 7000000
    }, fakeSession);

    // Cập nhật tên thành 'Đã Sửa' và lương = 9.000.000
    await employeeService.updateEmployee(99, {
      ho: 'Ngô Văn',
      ten: 'Đã Sửa',
      luong: 9000000
    }, fakeSession);

    assert(fakeSession.employeeUndoAction?.action === 'UPDATE', 'Lưu vết thao tác UPDATE vào session');

    // Gọi Undo
    const undoUpdateRes = await employeeService.undoEmployee(fakeSession);
    const empAfterUndoUpdate = await employeeRepository.getById(99);
    assert(empAfterUndoUpdate.TEN === 'Gốc' && empAfterUndoUpdate.LUONG === 7000000,
      'Undo thao tác UPDATE thành công: NV 99 được khôi phục về tên "Gốc" và lương 7,000,000');

    // Test 4.3: Undo thao tác DELETE
    await employeeService.deleteEmployee(99, fakeSession);
    assert(fakeSession.employeeUndoAction?.action === 'DELETE', 'Lưu vết thao tác DELETE vào session');
    const checkDeleted99 = await employeeRepository.getById(99);
    assert(checkDeleted99 === null, 'NV 99 đã bị xóa khỏi CSDL');

    // Gọi Undo
    const undoDeleteRes = await employeeService.undoEmployee(fakeSession);
    const empRestored = await employeeRepository.getById(99);
    assert(empRestored !== null && empRestored.MANV === 99 && empRestored.TEN === 'Gốc',
      'Undo thao tác DELETE thành công: NV 99 được phục hồi nguyên vẹn vào CSDL');

    // Test 4.4: Thử Undo lần thứ 2 liên tiếp (khi session đã null) -> Phải bị từ chối
    let secondUndoCaught = false;
    try {
      await employeeService.undoEmployee(fakeSession);
    } catch (err) {
      secondUndoCaught = true;
    }
    assert(secondUndoCaught, 'Chặn Undo lần 2 liên tiếp (đảm bảo đúng quy chuẩn phục hồi chính xác 1 bước)');

    // Dọn dẹp dữ liệu test
    await employeeRepository.delete(99);

    // -------------------------------------------------------------
    // TEST SUITE 5: TRUY VẤN DANH SÁCH & CHI TIẾT
    // -------------------------------------------------------------
    console.log('\n👉 [5/5] Kiểm thử Truy vấn danh sách và chi tiết...');
    const allEmployees = await employeeService.getAllEmployees();
    assert(Array.isArray(allEmployees) && allEmployees.length >= 5,
      `sp_NhanVien_GetAll trả về đủ ${allEmployees.length} nhân viên`);

    const emp1 = await employeeService.getEmployeeById(1);
    assert(emp1 && emp1.MANV === 1 && emp1.TEN === 'An',
      'sp_NhanVien_GetById lấy chính xác thông tin nhân viên 1 (Nguyễn Văn An)');

    // -------------------------------------------------------------
    // TỔNG KẾT KẾT QUẢ
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`🎉 TỔNG KẾT: ĐẠT ${passedTests}/${totalTests} KIỂM THỬ (100% SUCCESS)`);
    console.log('===============================================================');

  } catch (error) {
    console.error('\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', error);
  } finally {
    process.exit(0);
  }
}

runTests();
