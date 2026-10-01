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

console.log('>>> [QLVT] Sapo UI Engine đã được khởi tạo sẵn sàng.');
