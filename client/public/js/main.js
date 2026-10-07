/**
 * ====================================================================================
 * DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
 * CLIENT-SIDE JAVASCRIPT & UI ENGINE (Phong cách Sapo SaaS ERP)
 * ====================================================================================
 */

// 1. LẮNG NGHE PHÍM TẮT TOÀN CỤC [Ctrl + K]
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  // Đóng modal khi bấm Escape
  if (e.key === 'Escape') {
    closeModal();
    closeConfirmModal();
  }
});

// 2. ENGINE ĐIỀU KHIỂN MODAL DÙNG CHUNG
function openModal(title, contentHtml, maxWidthClass = 'max-w-2xl') {
  const modal = document.getElementById('appModal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const cardEl = document.getElementById('modalCard');

  if (modal && titleEl && bodyEl) {
    titleEl.innerText = title;
    bodyEl.innerHTML = contentHtml;

    // Thiết lập độ rộng linh hoạt
    if (cardEl) {
      cardEl.className = cardEl.className.replace(/max-w-\w+/g, '');
      cardEl.classList.add(maxWidthClass);
    }

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('appModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

// 3. ENGINE HỘP THOẠI XÁC NHẬN (CONFIRM DIALOG - XÓA / THAO TÁC NGUY HIỂM)
let onConfirmCallback = null;

function showConfirm({ title = 'Xác nhận hành động', message = 'Bạn có chắc chắn muốn thực hiện thao tác này?', confirmText = 'Đồng ý', confirmClass = 'btn-sapo-save', onConfirm = null }) {
  const confirmModal = document.getElementById('confirmModal');
  const confirmTitle = document.getElementById('confirmModalTitle');
  const confirmMsg = document.getElementById('confirmModalMessage');
  const confirmBtn = document.getElementById('confirmModalBtn');

  if (confirmModal && confirmTitle && confirmMsg && confirmBtn) {
    confirmTitle.innerText = title;
    confirmMsg.innerHTML = message;
    confirmBtn.innerText = confirmText;
    
    // Gán class màu nút (ví dụ btn-sapo-delete hoặc btn-sapo-save)
    confirmBtn.className = 'sapo-btn ' + confirmClass;
    onConfirmCallback = onConfirm;

    confirmModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function handleConfirmSubmit() {
  if (typeof onConfirmCallback === 'function') {
    onConfirmCallback();
  }
  closeConfirmModal();
}

function closeConfirmModal() {
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) {
    confirmModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    onConfirmCallback = null;
  }
}

// 4. HỆ THỐNG TOAST THÔNG BÁO TỰ TẮT (TOAST NOTIFICATIONS)
function showToast(type = 'success', message = '', duration = 3500) {
  let container = document.getElementById('sapoToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sapoToastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `sapo-toast ${type}`;

  let icon = 'fa-circle-check text-emerald-500';
  if (type === 'error') icon = 'fa-circle-exclamation text-rose-500';
  if (type === 'warning') icon = 'fa-triangle-exclamation text-amber-500';
  if (type === 'info') icon = 'fa-circle-info text-blue-500';

  toast.innerHTML = `
    <i class="fa-solid ${icon} text-lg"></i>
    <div class="flex-1 font-medium text-gray-800">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600 ml-2">
      <i class="fa-solid fa-xmark text-sm"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 5. TIỆN ÍCH GỌI API JSON TẬP TRUNG (FETCH API HELPER)
async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Đã có lỗi xảy ra');
    }
    return data;
  } catch (err) {
    showToast('error', err.message);
    throw err;
  }
}

// 6. TIỆN ÍCH ĐỊNH DẠNG SỐ VÀ NGÀY THÁNG
function formatCurrency(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('vi-VN');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN');
}

// 7. TIỆN ÍCH TÌM KIẾM TIẾNG VIỆT KHÔNG DẤU & ĐA TỪ KHÓA (VIETNAMESE SEARCH ENGINE)

/**
 * Chuẩn hóa và loại bỏ dấu tiếng Việt (Unicode NFD).
 * Hỗ trợ chuyển đổi toàn bộ ký tự có dấu, mũ, móc về chữ không dấu cơ bản (a-z, d).
 * An toàn tuyệt đối với giá trị null / undefined / số / boolean.
 *
 * @param {any} str - Chuỗi hoặc giá trị cần chuẩn hóa
 * @returns {string} Chuỗi không dấu, viết thường, loại bỏ khoảng trắng thừa
 */
function removeVietnameseTones(str) {
  if (str === null || str === undefined) return '';
  const text = String(str);
  return text
    .normalize('NFD')                                     // Tách nguyên âm và dấu thanh riêng biệt
    .replace(/[\u0300-\u036f]/g, '')                      // Xóa sạch các dấu thanh (sắc, huyền, hỏi, ngã, nặng, mũ, móc)
    .replace(/[đĐ]/g, m => (m === 'đ' ? 'd' : 'D'))       // Chuyển đ/Đ thành d/D (vì Unicode không tách đ thành d + dấu)
    .toLowerCase()
    .trim();
}

/**
 * So sánh từ khóa tìm kiếm với tập dữ liệu nguồn (Token-based Vietnamese Search).
 * - Tách query thành các từ khóa (tokens) riêng lẻ theo khoảng trắng.
 * - Kiểm tra tất cả các token có đồng thời xuất hiện trong nội dung nguồn hay không (AND logic).
 * - Hỗ trợ gõ dở dang (ví dụ "Nguyen Va" vẫn khớp "Nguyễn Văn An").
 * - Hỗ trợ tìm kiếm theo nhiều trường khác nhau (Mã NV, Họ tên, Địa chỉ, Ghi chú).
 * - 🛡️ An toàn tuyệt đối với null / undefined: Không bao giờ biến null thành chuỗi text "null".
 *
 * @param {string|Array<any>} source - Chuỗi hoặc mảng các trường dữ liệu của đối tượng
 * @param {string} query - Từ khóa người dùng nhập vào ô tìm kiếm
 * @returns {boolean} True nếu khớp tất cả từ khóa, False nếu không khớp
 */
function matchSearchTerms(source, query) {
  // Nếu ô tìm kiếm rỗng, mặc định hiển thị toàn bộ
  if (!query || String(query).trim() === '') return true;

  // Nếu không có nguồn dữ liệu để tìm kiếm
  if (source === null || source === undefined) return false;

  // Lọc sạch các giá trị null, undefined và các chuỗi rỗng trước khi kết hợp
  let cleanParts = [];
  if (Array.isArray(source)) {
    cleanParts = source.filter(item => {
      if (item === null || item === undefined) return false;
      const s = String(item).trim();
      // Loại trừ các giá trị rỗng hoặc chuỗi "null"/"undefined" vô tình bị ép kiểu
      return s.length > 0 && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined';
    });
  } else {
    const s = String(source).trim();
    if (s.length > 0 && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined') {
      cleanParts = [s];
    }
  }

  // Nếu sau khi lọc không còn nội dung nào hợp lệ
  if (cleanParts.length === 0) return false;

  // Ghép các trường hợp lệ thành 1 chuỗi nguồn và chuẩn hóa không dấu
  const combinedSource = cleanParts.join(' ');
  const normalizedSource = removeVietnameseTones(combinedSource);

  // Tách từ khóa người dùng thành các token rời
  const queryTokens = removeVietnameseTones(query)
    .split(/\s+/)
    .filter(token => token.length > 0);

  if (queryTokens.length === 0) return true;

  // Quy tắc AND: Mọi token đều phải xuất hiện trong nguồn dữ liệu
  return queryTokens.every(token => normalizedSource.includes(token));
}

// Gắn vào window để mọi script con đều truy cập được toàn cục
if (typeof window !== 'undefined') {
  window.removeVietnameseTones = removeVietnameseTones;
  window.matchSearchTerms = matchSearchTerms;
}

console.log('>>> [QLVT] Sapo UI Engine đã được khởi tạo sẵn sàng.');
