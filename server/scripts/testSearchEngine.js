// =======================================================
// server/scripts/testSearchEngine.js
// Kiểm thử tự động thuật toán tìm kiếm tiếng Việt không dấu & đa từ khóa
// =======================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainJsPath = path.join(__dirname, '../../client/public/js/main.js');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

const context = { 
  window: {}, 
  document: { addEventListener: () => {} },
  console: console 
};
vm.createContext(context);
vm.runInContext(mainJs, context);

const { removeVietnameseTones, matchSearchTerms } = context.window;

console.log('===============================================================');
console.log('🧪 KIỂM THỬ THUẬT TOÁN TÌM KIẾM TIẾNG VIỆT KHÔNG DẤU & GÕ DỞ DANG');
console.log('===============================================================\n');

const testCases = [
  {
    name: 'Không dấu hoàn toàn ("nguyen van an" -> "Nguyễn Văn An")',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội', null, undefined],
    query: 'nguyen van an',
    expected: true
  },
  {
    name: 'Gõ dở dang Telex ("Nguyen Va" -> "Nguyễn Văn An")',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội', null],
    query: 'Nguyen Va',
    expected: true
  },
  {
    name: 'Gõ dở dang có dấu ("Nguyễn Va" -> "Nguyễn Văn An")',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội', null],
    query: 'Nguyễn Va',
    expected: true
  },
  {
    name: 'Đa từ khóa rời rạc không dấu ("nguyen an" -> "Nguyễn Văn An")',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội', null],
    query: 'nguyen an',
    expected: true
  },
  {
    name: 'Mã NV kết hợp Tên ("1 an" -> MANV: 1, Tên: An)',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội', null],
    query: '1 an',
    expected: true
  },
  {
    name: 'Xử lý ký tự Đ/đ ("mai da nang" -> "Lê Thị Mai", "Đà Nẵng")',
    source: ['2', 'Lê', 'Thị Mai', 'Hải Châu, Đà Nẵng', null],
    query: 'mai da nang',
    expected: true
  },
  {
    name: 'An toàn với null/undefined (ngăn biến null thành text tìm kiếm)',
    source: ['1', 'Nguyễn', 'Văn An', null, undefined],
    query: 'null',
    expected: false
  },
  {
    name: 'Từ khóa không tồn tại ("xyz999")',
    source: ['1', 'Nguyễn', 'Văn An', 'Hà Nội'],
    query: 'xyz999',
    expected: false
  },
  {
    name: 'Query rỗng hoặc chỉ có khoảng trắng (hiển thị toàn bộ)',
    source: ['1', 'Nguyễn', 'Văn An'],
    query: '   ',
    expected: true
  }
];

let passCount = 0;
testCases.forEach((tc, idx) => {
  const result = matchSearchTerms(tc.source, tc.query);
  const pass = result === tc.expected;
  if (pass) passCount++;
  console.log(`  ${pass ? '✅ [PASS]' : '❌ [FAIL]'} Test ${idx + 1}: ${tc.name} -> ${result} (Kỳ vọng: ${tc.expected})`);
});

console.log(`\n===============================================================`);
console.log(`🎉 TỔNG KẾT: ${passCount}/${testCases.length} TESTS ĐẠT YÊU CẦU (${Math.round(passCount / testCases.length * 100)}%)`);
console.log('===============================================================\n');

if (passCount !== testCases.length) {
  process.exit(1);
}
