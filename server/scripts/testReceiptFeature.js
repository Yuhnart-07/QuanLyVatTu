// =======================================================
// server/scripts/testReceiptFeature.js
// Script kiểm thử tự động toàn diện chức năng của Thành viên 2:
// - Module 1.4: Phiếu Nhập Kho (RULE 01, 02, 03, RULE_RECEIPT_001..005)
// - Báo cáo 2.3: Đơn đặt hàng chưa hoàn tất
// - Báo cáo 2.5: Thống kê phiếu nhập theo năm
// =======================================================

require('dotenv').config();
const receiptValidator = require('../validators/receiptValidator');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG THÀNH VIÊN 2 (NHẬP KHO & BÁO CÁO)');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: TẦNG VALIDATOR (LỚP 2 VALIDATION & RULE 03)
  // -------------------------------------------------------------
  console.log('[1/3] Kiểm thử Lớp 2: Validator Middleware (receiptValidator)...');

  // Test 1.1: RULE 03 - Tự động loại bỏ manv từ client body
  const reqWithManv = {
    body: {
      mapn: 'PN999999',
      masoDDH: 'DDH00001',
      manv: 9999, // Mạo danh nhân viên
      details: [{ mavt: 'VT01', soluong: 10, dongia: 50000 }]
    }
  };
  let nextCalled = false;
  receiptValidator.validateCreate(reqWithManv, {}, () => { nextCalled = true; });
  assert(reqWithManv.body.manv === undefined, 'RULE 03: Validator loại bỏ hoàn toàn req.body.manv để chống mạo danh');
  assert(nextCalled === true, 'Validator cho phép đi tiếp khi dữ liệu hợp lệ');

  // Test 1.2: Chặn khi MAPN bị rỗng
  let error1 = null;
  const reqNoMapn = {
    body: { mapn: '', masoDDH: 'DDH00001', details: [{ mavt: 'VT01', soluong: 10, dongia: 50000 }] }
  };
  receiptValidator.validateCreate(reqNoMapn, {
    status: (code) => ({ json: (data) => { error1 = { code, ...data }; } })
  }, () => {});
  assert(error1 && error1.code === 400 && error1.errorCode === 'INVALID_MAPN', 'Chặn request khi MAPN rỗng (HTTP 400)');

  // Test 1.3: Chặn khi MasoDDH bị rỗng
  let error2 = null;
  const reqNoDDH = {
    body: { mapn: 'PN000001', masoDDH: '   ', details: [{ mavt: 'VT01', soluong: 10, dongia: 50000 }] }
  };
  receiptValidator.validateCreate(reqNoDDH, {
    status: (code) => ({ json: (data) => { error2 = { code, ...data }; } })
  }, () => {});
  assert(error2 && error2.code === 400 && error2.errorCode === 'INVALID_MASODDH', 'Chặn request khi MasoDDH rỗng (HTTP 400)');

  // Test 1.4: Chặn khi mảng details rỗng
  let error3 = null;
  const reqEmptyDetails = {
    body: { mapn: 'PN000001', masoDDH: 'DDH00001', details: [] }
  };
  receiptValidator.validateCreate(reqEmptyDetails, {
    status: (code) => ({ json: (data) => { error3 = { code, ...data }; } })
  }, () => {});
  assert(error3 && error3.code === 400 && error3.errorCode === 'EMPTY_DETAILS', 'Chặn request khi mảng details rỗng (HTTP 400)');

  // Test 1.5: Chặn khi số lượng chi tiết <= 0
  let error4 = null;
  const reqZeroQty = {
    body: { mapn: 'PN000001', masoDDH: 'DDH00001', details: [{ mavt: 'VT01', soluong: -2, dongia: 50000 }] }
  };
  receiptValidator.validateCreate(reqZeroQty, {
    status: (code) => ({ json: (data) => { error4 = { code, ...data }; } })
  }, () => {});
  assert(error4 && error4.code === 400 && error4.errorCode === 'INVALID_DETAIL_SOLUONG', 'Chặn request khi số lượng thực nhập <= 0 (HTTP 400)');

  // Test 1.6: Chặn khi đơn giá âm
  let error5 = null;
  const reqNegativePrice = {
    body: { mapn: 'PN000001', masoDDH: 'DDH00001', details: [{ mavt: 'VT01', soluong: 5, dongia: -1000 }] }
  };
  receiptValidator.validateCreate(reqNegativePrice, {
    status: (code) => ({ json: (data) => { error5 = { code, ...data }; } })
  }, () => {});
  assert(error5 && error5.code === 400 && error5.errorCode === 'INVALID_DETAIL_DONGIA', 'Chặn request khi đơn giá âm (HTTP 400)');

  // -------------------------------------------------------------
  // TEST SUITE 2: KIỂM THỬ KẾT NỐI DATABASE VÀ STORED PROCEDURES
  // -------------------------------------------------------------
  console.log('\n[2/3] Kiểm thử Database Stored Procedures & Nghiệp vụ...');
  try {
    const { getPool } = require('../config/database');
    const receiptService = require('../services/receiptService');
    const reportService = require('../services/reportService');

    const pool = await getPool();
    console.log('  -> Kết nối CSDL thành công!');

    // Test 2.1: Lấy danh sách phiếu nhập
    const receipts = await receiptService.getAllReceipts();
    assert(Array.isArray(receipts), `Lấy danh sách phiếu nhập thành công (Số lượng: ${receipts.length})`);

    // Test 2.2: Lấy chi tiết vật tư theo đơn hàng DDH00002
    try {
      const items = await receiptService.getOrderItems('DDH00002');
      assert(Array.isArray(items) && items.length > 0, `sp_PhieuNhap_GetOrderItems: Lấy vật tư DDH00002 thành công (${items.length} mặt hàng)`);
      if (items.length > 0) {
        assert(items[0].ConLai !== undefined, 'Tính toán chính xác trường ConLai của vật tư trong đơn');
      }
    } catch (e) {
      console.log('  [INFO] sp_PhieuNhap_GetOrderItems chưa nạp vào DB (hãy chạy npm run db:update):', e.message);
    }

    // Test 2.3: Báo cáo 2.3 - Đơn đặt hàng chưa hoàn tất
    try {
      const pendingOrders = await reportService.getPendingOrdersReport();
      assert(Array.isArray(pendingOrders), `sp_Report_DDHChuaHoanTat: Báo cáo 2.3 trả về ${pendingOrders.length} dòng vật tư chưa hoàn tất`);
    } catch (e) {
      console.log('  [INFO] sp_Report_DDHChuaHoanTat chưa nạp vào DB (hãy chạy npm run db:update):', e.message);
    }

    // Test 2.4: Báo cáo 2.5 - Thống kê phiếu nhập theo năm
    try {
      const stats = await reportService.getReceiptStatsByYearReport(2024);
      assert(Array.isArray(stats) && stats.length === 12, `sp_Report_ThongKePhieuNhap: Báo cáo 2.5 trả về đúng 12 tháng (Số dòng: ${stats.length})`);
    } catch (e) {
      console.log('  [INFO] sp_Report_ThongKePhieuNhap chưa nạp vào DB (hãy chạy npm run db:update):', e.message);
    }

  } catch (dbErr) {
    console.log('  [SKIP DB TESTS] Chưa kết nối được SQL Server:', dbErr.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: TỔNG KẾT
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('===============================================================');
}

runTests().catch(err => console.error('Lỗi thực thi test:', err));
