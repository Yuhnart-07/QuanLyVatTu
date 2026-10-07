/**
 * ====================================================================================
 * DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
 * CLIENT-SIDE JAVASCRIPT: QUẢN LÝ NHÂN VIÊN (MỤC 1.1)
 * Phong cách: Sapo SaaS ERP
 * Ràng buộc: BR01 (Lương >= 5.000.000), BR11 (Chặn xóa NV đã lập phiếu), Undo 1 bước
 * ====================================================================================
 */

// Biến lưu danh sách nhân viên và trạng thái phân trang trên giao diện
let currentEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
let pageSize = 10;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo dữ liệu từ bảng ban đầu do server render
  initEmployeeDataFromDOM();

  // 2. Gắn sự kiện tìm kiếm thời gian thực
  const searchInput = document.getElementById('employeeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleEmployeeSearch);
  }

  // 3. Đọc pageSize từ select nếu có
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  if (pageSizeSelect) {
    pageSize = parseInt(pageSizeSelect.value, 10) || 10;
  }

  // 4. Áp dụng phân trang ngay từ trang 1
  currentPage = 1;
  renderPaginatedTable();

  // 5. Cập nhật các thẻ thống kê tổng quan (dựa trên toàn bộ nhân viên)
  updateStatistics(currentEmployees);

  // 6. Kiểm tra trạng thái nút Undo khi nạp trang
  checkUndoState();
});

/**
 * Trích xuất dữ liệu từ các dòng HTML table khi server render lần đầu
 */
function initEmployeeDataFromDOM() {
  if (Array.isArray(window.INITIAL_EMPLOYEES) && window.INITIAL_EMPLOYEES.length > 0) {
    currentEmployees = [...window.INITIAL_EMPLOYEES];
  } else {
    const rows = document.querySelectorAll('#employeeTableBody tr[data-manv]');
    currentEmployees = [];
    rows.forEach(row => {
      currentEmployees.push({
        MANV: parseInt(row.getAttribute('data-manv'), 10),
        HO: row.getAttribute('data-ho') || '',
        TEN: row.getAttribute('data-ten') || '',
        DIACHI: row.getAttribute('data-diachi') || '',
        NGAYSINH: row.getAttribute('data-ngaysinh') || '',
        LUONG: parseFloat(row.getAttribute('data-luong')) || 0,
        GHICHU: row.getAttribute('data-ghichu') || ''
      });
    });
  }

  filteredEmployees = [...currentEmployees];
}

/**
 * Cập nhật các thẻ số liệu thống kê nhanh trên đầu trang
 */
function updateStatistics(list) {
  const totalCountEl = document.getElementById('statTotalEmployees');
  const totalSalaryEl = document.getElementById('statTotalSalary');
  const avgSalaryEl = document.getElementById('statAvgSalary');

  const count = list.length;
  const totalSalary = list.reduce((sum, item) => sum + (Number(item.LUONG) || 0), 0);
  const avgSalary = count > 0 ? Math.round(totalSalary / count) : 0;

  if (totalCountEl) totalCountEl.innerText = count.toString();
  if (totalSalaryEl) totalSalaryEl.innerText = formatCurrency(totalSalary) + ' đ';
  if (avgSalaryEl) avgSalaryEl.innerText = formatCurrency(avgSalary) + ' đ';
}

/**
 * Vẽ lại bảng danh sách nhân viên theo phân trang hiện tại
 */
function renderPaginatedTable() {
  const tbody = document.getElementById('employeeTableBody');
  if (!tbody) return;

  const total = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Đảm bảo currentPage nằm trong khoảng hợp lệ
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // Trường hợp không có dữ liệu
  if (total === 0) {
    const searchInput = document.getElementById('employeeSearch');
    const query = (searchInput?.value || '').trim();

    if (query) {
      tbody.innerHTML = `
        <tr id="employeeEmptySearchRow">
          <td colspan="7" class="px-4 py-12 text-center text-slate-400">
            <div class="flex flex-col items-center justify-center">
              <i class="fa-solid fa-magnifying-glass text-4xl mb-3 text-slate-300"></i>
              <span class="text-sm font-medium">Không tìm thấy nhân viên nào phù hợp với từ khóa "${escapeHtml(query)}".</span>
              <span class="text-xs text-slate-400 mt-1">Gợi ý: Thử tìm kiếm không dấu, kiểm tra lỗi chính tả hoặc tìm theo Mã NV.</span>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-12 text-center text-slate-400">
            <div class="flex flex-col items-center justify-center">
              <i class="fa-solid fa-users-slash text-4xl mb-3 text-slate-300"></i>
              <span class="text-sm font-medium">Chưa có dữ liệu nhân viên nào trong hệ thống.</span>
            </div>
          </td>
        </tr>
      `;
    }

    updatePaginationControls(0, 1, 0, 0);
    return;
  }

  // Cắt mảng dữ liệu tương ứng với trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = filteredEmployees.slice(startIndex, endIndex);

  tbody.innerHTML = pageItems.map(emp => {
    const formattedSalary = formatCurrency(emp.LUONG);
    const formattedDate = formatDate(emp.NGAYSINH);
    const fullName = `${emp.HO || ''} ${emp.TEN || ''}`.trim();
    const initials = (emp.TEN ? emp.TEN[0] : 'NV').toUpperCase();

    return `
      <tr class="hover:bg-slate-50/80 transition" 
          data-manv="${emp.MANV}" 
          data-ho="${escapeHtml(emp.HO || '')}" 
          data-ten="${escapeHtml(emp.TEN || '')}" 
          data-diachi="${escapeHtml(emp.DIACHI || '')}" 
          data-ngaysinh="${emp.NGAYSINH ? emp.NGAYSINH.split('T')[0] : ''}" 
          data-luong="${emp.LUONG || 0}" 
          data-ghichu="${escapeHtml(emp.GHICHU || '')}">
        
        <!-- Mã NV -->
        <td class="sapo-cell-code font-bold font-mono text-slate-900">
          ${emp.MANV}
        </td>

        <!-- Họ và tên có avatar viết tắt -->
        <td>
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              ${initials}
            </div>
            <div>
              <div class="font-semibold text-slate-900">${escapeHtml(fullName)}</div>
            </div>
          </div>
        </td>

        <!-- Địa chỉ -->
        <td class="text-slate-600 max-w-[200px] truncate" title="${escapeHtml(emp.DIACHI || '-')}">
          ${escapeHtml(emp.DIACHI || '-')}
        </td>

        <!-- Ngày sinh -->
        <td class="text-slate-600 font-mono text-xs">
          ${formattedDate}
        </td>

        <!-- Lương cơ bản (Căn phải, font monospace) -->
        <td class="sapo-cell-amount font-semibold text-emerald-600">
          ${formattedSalary} đ
        </td>

        <!-- Ghi chú -->
        <td class="text-slate-500 text-xs max-w-[150px] truncate" title="${escapeHtml(emp.GHICHU || '-')}">
          ${escapeHtml(emp.GHICHU || '-')}
        </td>

        <!-- Nút Thao tác -->
        <td class="text-center">
          <div class="inline-flex items-center space-x-1">
            <button onclick="editEmployee(${emp.MANV})" class="sapo-btn-icon" title="Chỉnh sửa hồ sơ">
              <i class="fa-regular fa-pen-to-square text-sm"></i>
            </button>
            <button onclick="deleteEmployee(${emp.MANV}, '${escapeJs(fullName)}')" class="sapo-btn-icon delete" title="Xóa nhân viên">
              <i class="fa-regular fa-trash-can text-sm"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updatePaginationControls(total, totalPages, startIndex + 1, endIndex);
}

/**
 * Cập nhật thanh điều khiển phân trang dưới chân bảng
 */
function updatePaginationControls(total, totalPages, start, end) {
  const pageRangeText = document.getElementById('pageRangeText');
  const totalRecordsText = document.getElementById('totalRecordsText');
  const btnPrev = document.getElementById('btnPrevPage');
  const btnNext = document.getElementById('btnNextPage');
  const pageContainer = document.getElementById('pageNumbersContainer');

  if (pageRangeText) {
    pageRangeText.innerText = total > 0 ? `${start} - ${end}` : '0 - 0';
  }
  if (totalRecordsText) {
    totalRecordsText.innerText = total.toString();
  }
  if (btnPrev) {
    btnPrev.disabled = (currentPage <= 1);
  }
  if (btnNext) {
    btnNext.disabled = (currentPage >= totalPages || total === 0);
  }

  // Render danh sách nút số trang tròn xanh Sapo
  if (pageContainer) {
    if (total === 0) {
      pageContainer.innerHTML = '';
      return;
    }

    const pages = getPaginationPageList(currentPage, totalPages);
    pageContainer.innerHTML = pages.map(p => {
      if (p === '...') {
        return `<span class="px-1 text-slate-400 font-mono">...</span>`;
      }
      const isActive = (p === currentPage);
      if (isActive) {
        return `
          <button type="button" 
            class="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0088ff] text-white font-semibold text-xs shadow-sm"
            title="Trang ${p}">
            ${p}
          </button>
        `;
      }
      return `
        <button type="button" onclick="goToPage(${p})"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-xs transition"
          title="Đến trang ${p}">
          ${p}
        </button>
      `;
    }).join('');
  }
}

/**
 * Sinh danh sách số trang rút gọn thông minh
 */
function getPaginationPageList(current, total) {
  if (total <= 7) {
    const list = [];
    for (let i = 1; i <= total; i++) list.push(i);
    return list;
  }

  const list = [1];
  if (current > 3) list.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    list.push(i);
  }

  if (current < total - 2) list.push('...');
  list.push(total);

  return list;
}

/**
 * Thay đổi số bản ghi hiển thị trên mỗi trang (10, 20, 50, 100)
 */
function changePageSize(newSize) {
  const size = parseInt(newSize, 10);
  if (!isNaN(size) && size > 0) {
    pageSize = size;
    currentPage = 1;
    renderPaginatedTable();
  }
}

/**
 * Chuyển tới một trang cụ thể
 */
function goToPage(page) {
  const p = parseInt(page, 10);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  if (!isNaN(p) && p >= 1 && p <= totalPages) {
    currentPage = p;
    renderPaginatedTable();
  }
}

/**
 * Lùi về trang trước
 */
function goToPrevPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

/**
 * Tiến tới trang sau
 */
function goToNextPage() {
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

/**
 * Vẽ lại toàn bộ bảng danh sách nhân viên (hỗ trợ gọi từ bên ngoài)
 */
function renderEmployeeTable(employees) {
  currentEmployees = employees || [];
  filteredEmployees = [...currentEmployees];
  currentPage = 1;
  renderPaginatedTable();
  updateStatistics(currentEmployees);
}

/**
 * Xử lý tìm kiếm thời gian thực thông minh trên giao diện kết hợp Phân trang
 */
function handleEmployeeSearch(e) {
  const query = (e.target.value || '').trim();
  const matcher = (typeof window.matchSearchTerms === 'function') 
    ? window.matchSearchTerms 
    : (typeof matchSearchTerms === 'function' ? matchSearchTerms : null);

  if (!query) {
    filteredEmployees = [...currentEmployees];
  } else {
    filteredEmployees = currentEmployees.filter(emp => {
      const manv = (emp.MANV !== null && emp.MANV !== undefined) ? String(emp.MANV) : '';
      const ho = emp.HO || '';
      const ten = emp.TEN || '';
      const fullName = `${ho} ${ten}`.trim();
      const diachi = emp.DIACHI || '';
      const ghichu = emp.GHICHU || '';

      const searchFields = [manv, ho, ten, fullName, diachi, ghichu].filter(item => {
        if (item === null || item === undefined) return false;
        const s = String(item).trim();
        return s.length > 0 && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined';
      });

      if (matcher) {
        return matcher(searchFields, query);
      }
      return searchFields.join(' ').toLowerCase().includes(query.toLowerCase());
    });
  }

  currentPage = 1;
  renderPaginatedTable();
}

/**
 * Mở modal Thêm mới nhân viên
 */
function openCreateEmployeeModal() {
  // Tự động gợi ý mã nhân viên kế tiếp (Max MANV + 1)
  let nextManv = 1;
  if (currentEmployees.length > 0) {
    const maxManv = Math.max(...currentEmployees.map(e => e.MANV || 0));
    nextManv = maxManv + 1;
  }

  const modalHtml = `
    <form id="employeeForm" onsubmit="handleEmployeeSubmit(event, 'CREATE')">
      <div class="space-y-4">
        
        <!-- Mã NV & Lương -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Mã Nhân Viên (MANV) <span class="text-rose-500">*</span>
            </label>
            <input type="number" id="inpManv" name="manv" value="${nextManv}" min="1" required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            <span class="text-[11px] text-slate-400 mt-0.5 block">Số nguyên dương duy nhất trong CSDL.</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Lương Cơ Bản (VNĐ) <span class="text-rose-500">*</span>
            </label>
            <input type="number" id="inpLuong" name="luong" value="5000000" min="5000000" step="500000" required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold text-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            <span class="text-[11px] text-amber-600 mt-0.5 block font-medium">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>Lương tối thiểu 5,000,000 VNĐ.
            </span>
          </div>
        </div>

        <!-- Họ và Tên -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Họ và Tên Đệm <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="inpHocs" name="ho" placeholder="Ví dụ: Nguyễn Văn" maxlength="40" required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="inpTen" name="ten" placeholder="Ví dụ: An" maxlength="10" required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
          </div>
        </div>

        <!-- Ngày sinh & Địa chỉ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ngày Sinh
            </label>
            <input type="date" id="inpNgaysinh" name="ngaysinh"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Địa Chỉ
            </label>
            <input type="text" id="inpDiachi" name="diachi" placeholder="Số nhà, đường, phường, quận..." maxlength="100"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
          </div>
        </div>

        <!-- Ghi chú -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Ghi Chú Thêm
          </label>
          <textarea id="inpGhichu" name="ghichu" rows="2" placeholder="Thông tin ghi chú về nhân viên..."
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition"></textarea>
        </div>

      </div>

      <!-- Footer Modal -->
      <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
        <button type="button" onclick="closeModal()" class="sapo-btn btn-sapo-cancel">
          Hủy bỏ
        </button>
        <button type="submit" id="btnSubmitEmployee" class="sapo-btn btn-sapo-save">
          <i class="fa-solid fa-floppy-disk mr-1"></i> Lưu Nhân Viên
        </button>
      </div>
    </form>
  `;

  openModal('Thêm Mới Hồ Sơ Nhân Viên', modalHtml, 'max-w-xl');
}

/**
 * Mở modal Chỉnh sửa thông tin nhân viên
 */
async function editEmployee(manv) {
  try {
    const res = await apiRequest(`/employees/${manv}`);
    const emp = res.data;
    if (!emp) return;

    const formattedDate = emp.NGAYSINH ? emp.NGAYSINH.split('T')[0] : '';

    const modalHtml = `
      <form id="employeeForm" onsubmit="handleEmployeeSubmit(event, 'UPDATE', ${emp.MANV})">
        <div class="space-y-4">
          
          <!-- Mã NV & Lương -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Mã Nhân Viên (MANV)
              </label>
              <input type="text" value="${emp.MANV}" disabled
                class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-500 cursor-not-allowed">
              <span class="text-[11px] text-slate-400 mt-0.5 block">Mã số nhân viên không được thay đổi.</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Lương Cơ Bản (VNĐ) <span class="text-rose-500">*</span>
              </label>
              <input type="number" id="inpLuong" name="luong" value="${emp.LUONG || 5000000}" min="5000000" step="500000" required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold text-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
              <span class="text-[11px] text-amber-600 mt-0.5 block font-medium">
                <i class="fa-solid fa-triangle-exclamation mr-1"></i>Lương tối thiểu 5,000,000 VNĐ.
              </span>
            </div>
          </div>

          <!-- Họ và Tên -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Họ và Tên Đệm <span class="text-rose-500">*</span>
              </label>
              <input type="text" id="inpHocs" name="ho" value="${escapeHtml(emp.HO || '')}" maxlength="40" required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tên <span class="text-rose-500">*</span>
              </label>
              <input type="text" id="inpTen" name="ten" value="${escapeHtml(emp.TEN || '')}" maxlength="10" required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            </div>
          </div>

          <!-- Ngày sinh & Địa chỉ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Ngày Sinh
              </label>
              <input type="date" id="inpNgaysinh" name="ngaysinh" value="${formattedDate}"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Địa Chỉ
              </label>
              <input type="text" id="inpDiachi" name="diachi" value="${escapeHtml(emp.DIACHI || '')}" maxlength="100"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">
            </div>
          </div>

          <!-- Ghi chú -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Ghi Chú Thêm
            </label>
            <textarea id="inpGhichu" name="ghichu" rows="2"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0088ff]/20 focus:border-[#0088ff] transition">${escapeHtml(emp.GHICHU || '')}</textarea>
          </div>

        </div>

        <!-- Footer Modal -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button type="button" onclick="closeModal()" class="sapo-btn btn-sapo-cancel">
            Hủy bỏ
          </button>
          <button type="submit" id="btnSubmitEmployee" class="sapo-btn btn-sapo-save">
            <i class="fa-solid fa-floppy-disk mr-1"></i> Cập Nhật
          </button>
        </div>
      </form>
    `;

    openModal(`Cập Nhật Nhân Viên: ${emp.HO} ${emp.TEN} (#${emp.MANV})`, modalHtml, 'max-w-xl');
  } catch (err) {
    // apiRequest đã hiển thị toast error
  }
}

/**
 * Xử lý Gửi form Thêm / Sửa nhân viên (Lớp 1 Validation)
 */
async function handleEmployeeSubmit(e, action, manv = null) {
  e.preventDefault();

  const form = e.target;
  const ho = (form.ho.value || '').trim();
  const ten = (form.ten.value || '').trim();
  const diachi = (form.diachi.value || '').trim();
  const ngaysinh = form.ngaysinh.value || null;
  const luong = parseFloat(form.luong.value);
  const ghichu = (form.ghichu.value || '').trim();

  // ----- LỚP 1 VALIDATION: FRONTEND UX -----
  if (!ho) {
    showToast('error', 'Họ nhân viên không được để trống.');
    form.ho.focus();
    return;
  }
  if (!ten) {
    showToast('error', 'Tên nhân viên không được để trống.');
    form.ten.focus();
    return;
  }
  if (isNaN(luong) || luong < 5000000) {
    showToast('error', 'Lương nhân viên phải là số và tối thiểu từ 5,000,000 VNĐ (BR01).');
    form.luong.focus();
    return;
  }
  if (ngaysinh) {
    const bDate = new Date(ngaysinh);
    if (bDate > new Date()) {
      showToast('error', 'Ngày sinh không thể lớn hơn ngày hiện tại.');
      form.ngaysinh.focus();
      return;
    }
  }

  const payload = {
    ho,
    ten,
    diachi: diachi || null,
    ngaysinh: ngaysinh || null,
    luong,
    ghichu: ghichu || null
  };

  const submitBtn = document.getElementById('btnSubmitEmployee');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang lưu...';
  }

  try {
    let res;
    if (action === 'CREATE') {
      const inputManv = parseInt(form.manv.value, 10);
      if (!inputManv || isNaN(inputManv) || inputManv <= 0) {
        showToast('error', 'Mã nhân viên (MANV) phải là số nguyên dương.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Lưu Nhân Viên';
        }
        return;
      }
      payload.manv = inputManv;
      res = await apiRequest('/employees', 'POST', payload);
    } else {
      res = await apiRequest(`/employees/${manv}`, 'PUT', payload);
    }

    closeModal();
    showToast('success', res.message);
    updateUndoButton(res.undoState);
    await reloadEmployeeList();

  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Thử lại';
    }
  }
}

/**
 * Xử lý Xóa nhân viên (Có confirm dialog & kiểm tra BR11)
 */
function deleteEmployee(manv, fullName) {
  showConfirm({
    title: 'Xác nhận xóa nhân viên?',
    message: `Bạn có chắc chắn muốn xóa nhân viên <b>${escapeHtml(fullName)}</b> (Mã NV: <b>${manv}</b>)?`,
    confirmText: 'Đồng ý xóa',
    confirmClass: 'btn-sapo-delete',
    onConfirm: async () => {
      try {
        const res = await apiRequest(`/employees/${manv}`, 'DELETE');
        showToast('success', res.message);
        updateUndoButton(res.undoState);
        await reloadEmployeeList();
      } catch (err) {
        // apiRequest tự động hiển thị toast lỗi (ví dụ lỗi BR11 từ Stored Procedure)
      }
    }
  });
}

/**
 * Xử lý sự kiện Phục hồi (Undo) 1 bước gần nhất
 */
async function handleUndoClick() {
  const btnUndo = document.getElementById('btnUndo');
  if (btnUndo && btnUndo.disabled) return;

  if (btnUndo) {
    btnUndo.disabled = true;
    btnUndo.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang hoàn tác...';
  }

  try {
    const res = await apiRequest('/employees/undo', 'POST');
    showToast('success', res.message);
    updateUndoButton(res.undoState);
    await reloadEmployeeList();
  } catch (err) {
    // Nếu undo thất bại
    await checkUndoState();
  }
}

/**
 * Kiểm tra trạng thái Undo từ server
 */
async function checkUndoState() {
  try {
    const res = await apiRequest('/employees/undo-state');
    updateUndoButton(res.data);
  } catch (err) {
    updateUndoButton({ canUndo: false });
  }
}

/**
 * Cập nhật giao diện của nút Phục hồi (Undo)
 */
function updateUndoButton(undoState) {
  const btnUndo = document.getElementById('btnUndo');
  if (!btnUndo) return;

  if (undoState && undoState.canUndo) {
    btnUndo.disabled = false;
    btnUndo.classList.remove('opacity-50', 'cursor-not-allowed');
    btnUndo.title = undoState.lastAction?.description 
      ? `Phục hồi thao tác: ${undoState.lastAction.description}` 
      : 'Phục hồi thao tác vừa thực hiện';
    btnUndo.innerHTML = '<i class="fa-solid fa-rotate-left mr-1"></i> Phục hồi';
  } else {
    btnUndo.disabled = true;
    btnUndo.classList.add('opacity-50', 'cursor-not-allowed');
    btnUndo.title = 'Chưa có thao tác nào để phục hồi';
    btnUndo.innerHTML = '<i class="fa-solid fa-rotate-left mr-1"></i> Phục hồi';
  }
}

/**
 * Tải lại danh sách nhân viên từ Backend mà không reload toàn trang
 */
async function reloadEmployeeList() {
  try {
    const res = await apiRequest('/employees');
    currentEmployees = res.data || [];
    renderEmployeeTable(currentEmployees);
    updateUndoButton(res.undoState);
  } catch (err) {
    console.error('Lỗi nạp lại danh sách nhân viên:', err);
  }
}

/**
 * Tiện ích escape chuỗi an toàn
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Gắn các hàm phân trang & thao tác lên window để inline events hoạt động ổn định
window.changePageSize = changePageSize;
window.goToPage = goToPage;
window.goToPrevPage = goToPrevPage;
window.goToNextPage = goToNextPage;
window.renderEmployeeTable = renderEmployeeTable;
window.renderPaginatedTable = renderPaginatedTable;
