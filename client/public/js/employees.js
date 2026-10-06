/**
 * ====================================================================================
 * DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
 * CLIENT-SIDE JAVASCRIPT: QUẢN LÝ NHÂN VIÊN (MỤC 1.1)
 * Phong cách: Sapo SaaS ERP
 * Ràng buộc: BR01 (Lương >= 5.000.000), BR11 (Chặn xóa NV đã lập phiếu), Undo 1 bước
 * ====================================================================================
 */

// Biến lưu danh sách nhân viên hiện tại trên giao diện
let currentEmployees = [];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo dữ liệu từ bảng ban đầu
  initEmployeeDataFromDOM();

  // 2. Gắn sự kiện tìm kiếm thời gian thực
  const searchInput = document.getElementById('employeeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleEmployeeSearch);
  }

  // 3. Cập nhật thống kê ban đầu
  updateStatistics(currentEmployees);

  // 4. Kiểm tra trạng thái nút Undo khi nạp trang
  checkUndoState();
});

/**
 * Trích xuất dữ liệu từ các dòng HTML table khi server render lần đầu
 */
function initEmployeeDataFromDOM() {
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

/**
 * Cập nhật các thẻ số liệu thống kê nhanh trên đầu trang
 */
function updateStatistics(list) {
  const totalCountEl = document.getElementById('statTotalEmployees');
  const totalSalaryEl = document.getElementById('statTotalSalary');
  const avgSalaryEl = document.getElementById('statAvgSalary');
  const totalRecordsText = document.getElementById('totalRecordsText');
  const pageRangeText = document.getElementById('pageRangeText');

  const count = list.length;
  const totalSalary = list.reduce((sum, item) => sum + (Number(item.LUONG) || 0), 0);
  const avgSalary = count > 0 ? Math.round(totalSalary / count) : 0;

  if (totalCountEl) totalCountEl.innerText = count.toString();
  if (totalSalaryEl) totalSalaryEl.innerText = formatCurrency(totalSalary) + ' đ';
  if (avgSalaryEl) avgSalaryEl.innerText = formatCurrency(avgSalary) + ' đ';
  if (totalRecordsText) totalRecordsText.innerText = count.toString();
  if (pageRangeText) pageRangeText.innerText = count > 0 ? `1 - ${count}` : '0 - 0';
}

/**
 * Vẽ lại toàn bộ bảng danh sách nhân viên trên giao diện
 */
function renderEmployeeTable(employees) {
  const tbody = document.getElementById('employeeTableBody');
  if (!tbody) return;

  if (!employees || employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-12 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center">
            <i class="fa-solid fa-users-slash text-4xl mb-3 text-slate-300"></i>
            <span class="text-sm font-medium">Chưa có dữ liệu nhân viên nào trong hệ thống.</span>
          </div>
        </td>
      </tr>
    `;
    updateStatistics([]);
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const formattedSalary = formatCurrency(emp.LUONG);
    const formattedDate = formatDate(emp.NGAYSINH);
    const fullName = `${emp.HO} ${emp.TEN}`.trim();
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
              <div class="text-[11px] text-slate-400 font-mono">NV_${emp.MANV}</div>
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

  updateStatistics(employees);
}

/**
 * Xử lý tìm kiếm trực tiếp trên DOM
 */
function handleEmployeeSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const rows = document.querySelectorAll('#employeeTableBody tr[data-manv]');

  let visibleCount = 0;
  rows.forEach(row => {
    const manv = (row.getAttribute('data-manv') || '').toLowerCase();
    const ho = (row.getAttribute('data-ho') || '').toLowerCase();
    const ten = (row.getAttribute('data-ten') || '').toLowerCase();
    const diachi = (row.getAttribute('data-diachi') || '').toLowerCase();
    const fullName = `${ho} ${ten}`.trim();

    if (manv.includes(query) || ho.includes(query) || ten.includes(query) || fullName.includes(query) || diachi.includes(query)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const totalRecordsText = document.getElementById('totalRecordsText');
  const pageRangeText = document.getElementById('pageRangeText');
  if (totalRecordsText) totalRecordsText.innerText = visibleCount.toString();
  if (pageRangeText) pageRangeText.innerText = visibleCount > 0 ? `1 - ${visibleCount}` : '0 - 0';
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
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>Quy tắc BR01: Lương tối thiểu 5,000,000 VNĐ.
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
                <i class="fa-solid fa-triangle-exclamation mr-1"></i>Quy tắc BR01: Lương tối thiểu 5,000,000 VNĐ.
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
    message: `Bạn có chắc chắn muốn xóa nhân viên <b>${escapeHtml(fullName)}</b> (Mã NV: <b>${manv}</b>)?<br><br><span class="text-xs text-rose-500 font-medium"><i class="fa-solid fa-circle-exclamation mr-1"></i>Quy tắc BR11: Không thể xóa nếu nhân viên đã từng lập Đơn đặt hàng, Phiếu nhập hoặc Phiếu xuất.</span>`,
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
    btnUndo.innerHTML = '<i class="fa-solid fa-rotate-left mr-1"></i> Phục hồi (Undo)';
  } else {
    btnUndo.disabled = true;
    btnUndo.classList.add('opacity-50', 'cursor-not-allowed');
    btnUndo.title = 'Chưa có thao tác nào để phục hồi';
    btnUndo.innerHTML = '<i class="fa-solid fa-rotate-left mr-1"></i> Phục hồi (Undo)';
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
