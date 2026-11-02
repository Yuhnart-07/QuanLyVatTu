// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: client/public/js/admin-logins.js
// Mô tả: Xử lý tương tác phía Client cho Form Tạo / Xóa Login (Mục 3.1):
//         - Tự động đồng bộ dropdown nhân viên và form nhập liệu.
//         - Kiểm tra tính hợp lệ dữ liệu phía Frontend trước khi gửi.
//         - Gửi request AJAX Tạo và Xóa tài khoản lên Backend.
//         - Render bảng danh sách tài khoản hiện hữu và lọc tìm kiếm tiếng Việt.
// ====================================================================================

// Biến trạng thái toàn cục của màn hình quản lý login
let allLoginsData = window.INITIAL_LOGINS || [];
let activeSearchQuery = '';

/**
 * Khởi chạy khi DOM sẵn sàng
 */
document.addEventListener('DOMContentLoaded', () => {
  renderActiveLoginsTable();
  updateActiveCountBadge();

  // Khởi tạo trạng thái khóa ban đầu cho các ô nhập liệu khi chưa chọn nhân viên
  const employeeSelect = document.getElementById('employeeSelect');
  if (employeeSelect) {
    handleEmployeeChange(employeeSelect);
  }
});

/**
 * Trợ giúp bật/tắt trạng thái hiển thị của nút bấm
 */
function setButtonState(button, isEnabled) {
  if (!button) return;
  if (isEnabled) {
    button.disabled = false;
    button.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    button.disabled = true;
    button.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

/**
 * Trợ giúp bật/tắt trạng thái ô nhập liệu và style giao diện
 * @param {HTMLInputElement} input 
 * @param {boolean} isEnabled - Cho phép tương tác hay không
 * @param {boolean} isReadOnly - Chỉ đọc (vẫn hiện text nhưng không sửa)
 */
function setInputFieldState(input, isEnabled, isReadOnly = false) {
  if (!input) return;
  input.disabled = !isEnabled;
  input.readOnly = isReadOnly;
  if (isEnabled && !isReadOnly) {
    input.classList.remove('bg-slate-100', 'cursor-not-allowed');
    input.classList.add('bg-slate-50');
  } else {
    input.classList.remove('bg-slate-50', 'bg-white');
    input.classList.add('bg-slate-100', 'cursor-not-allowed');
  }
}

/**
 * Trợ giúp bật/tắt nhóm radio chọn quyền (Admin / Nhân viên)
 * @param {boolean} isEnabled 
 */
function setRoleGroupState(isEnabled) {
  const roleNhanvien = document.getElementById('roleNhanvien');
  const roleAdmin = document.getElementById('roleAdmin');
  const roleRadioGroup = document.getElementById('roleRadioGroup');
  const labelNhanvien = document.getElementById('labelRoleNhanvien');
  const labelAdmin = document.getElementById('labelRoleAdmin');

  if (roleNhanvien) roleNhanvien.disabled = !isEnabled;
  if (roleAdmin) roleAdmin.disabled = !isEnabled;

  if (roleRadioGroup) {
    if (isEnabled) {
      roleRadioGroup.classList.remove('opacity-60');
    } else {
      roleRadioGroup.classList.add('opacity-60');
    }
  }

  [labelNhanvien, labelAdmin].forEach(lbl => {
    if (lbl) {
      if (isEnabled) {
        lbl.classList.remove('cursor-not-allowed');
        lbl.classList.add('cursor-pointer');
      } else {
        lbl.classList.remove('cursor-pointer');
        lbl.classList.add('cursor-not-allowed');
      }
    }
  });
}

/**
 * Xử lý khi người dùng chọn một nhân viên trong Dropdown
 * Tự động cập nhật trạng thái các ô nhập liệu và các nút chức năng
 * @param {HTMLSelectElement} selectElem 
 */
function handleEmployeeChange(selectElem) {
  const selectedOption = selectElem.options[selectElem.selectedIndex];
  const manv = selectElem.value;

  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const btnCreateLogin = document.getElementById('btnCreateLogin');
  const btnDeleteLogin = document.getElementById('btnDeleteLogin');
  const formModeBadge = document.getElementById('formModeBadge');
  const roleAdmin = document.getElementById('roleAdmin');
  const roleNhanvien = document.getElementById('roleNhanvien');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');

  if (!manv) {
    // Trường hợp chưa chọn nhân viên nào: Khóa toàn bộ các ô nhập liệu, nhóm quyền và nút thao tác
    usernameInput.value = '';
    setInputFieldState(usernameInput, false);

    passwordInput.value = '';
    passwordInput.type = 'password';
    setInputFieldState(passwordInput, false);

    // Ẩn nút con mắt khi chưa chọn nhân viên
    if (togglePasswordBtn) togglePasswordBtn.classList.add('hidden');
    if (togglePasswordIcon) {
      togglePasswordIcon.classList.remove('fa-eye', 'text-[#0088ff]');
      togglePasswordIcon.classList.add('fa-eye-slash');
    }

    setRoleGroupState(false);
    if (roleNhanvien) roleNhanvien.checked = true;

    formModeBadge.textContent = 'Chưa chọn';
    formModeBadge.className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200';

    // Vô hiệu hóa cả 2 nút Tạo và Xóa
    setButtonState(btnCreateLogin, false);
    setButtonState(btnDeleteLogin, false);

    // Cập nhật nhãn Custom Select về mặc định
    updateCustomSelectLabel(null, null);
    return;
  }

  const hasLogin = selectedOption.getAttribute('data-has-login') === '1';
  const username = selectedOption.getAttribute('data-username') || '';
  const role = selectedOption.getAttribute('data-role') || '';
  const hoten = selectedOption.getAttribute('data-hoten') || '';

  // Đồng bộ nhãn Custom Select hiển thị tên và badge trạng thái căn phải
  updateCustomSelectLabel(manv, selectedOption);

  if (hasLogin) {
    // NHÂN VIÊN ĐÃ CÓ TÀI KHOẢN:
    // Chuyển sang chế độ xem / xóa tài khoản (khóa nhập mới, mở nút Xóa nếu hợp lệ)
    // Ẩn badge ở góc trên bên phải vì trạng thái đã hiển thị trực tiếp trong dropdown
    formModeBadge.textContent = '';
    formModeBadge.className = 'hidden';

    usernameInput.value = username;
    setInputFieldState(usernameInput, true, true); // readOnly = true, disabled = false để xem

    passwordInput.value = '••••••••';
    passwordInput.type = 'password';
    passwordInput.required = false;
    setInputFieldState(passwordInput, false); // disabled = true

    // BẢO MẬT: Ẩn hoàn toàn con mắt, không ai được xem mật khẩu sau khi tài khoản đã được cấp
    if (togglePasswordBtn) togglePasswordBtn.classList.add('hidden');
    if (togglePasswordIcon) {
      togglePasswordIcon.classList.remove('fa-eye', 'text-[#0088ff]');
      togglePasswordIcon.classList.add('fa-eye-slash');
    }

    setRoleGroupState(false); // Khóa chọn quyền vì tài khoản đã được cấp trước đó
    if (role === 'Admin') {
      roleAdmin.checked = true;
    } else {
      roleNhanvien.checked = true;
    }

    // Vô hiệu hóa nút Tạo, kích hoạt nút Xóa (nếu không phải chính mình)
    setButtonState(btnCreateLogin, false);
    const currentUsername = (window.CURRENT_USERNAME || '').trim().toLowerCase();
    const isCurrent = currentUsername && username && username.trim().toLowerCase() === currentUsername;
    setButtonState(btnDeleteLogin, !isCurrent);

  } else {
    // NHÂN VIÊN CHƯA CÓ TÀI KHOẢN:
    // Mở khóa các ô nhập liệu và nhóm quyền để người dùng tiến hành cấp tài khoản
    // Ẩn badge ở góc trên bên phải vì trạng thái đã hiển thị trực tiếp trong dropdown
    formModeBadge.textContent = '';
    formModeBadge.className = 'hidden';

    // Gợi ý tên đăng nhập mặc định NV_{MANV} để thuận tiện thao tác
    usernameInput.value = `NV_${manv}`;
    setInputFieldState(usernameInput, true, false); // Mở khóa ô Tên đăng nhập

    passwordInput.value = '';
    passwordInput.type = 'password';
    passwordInput.required = true;
    setInputFieldState(passwordInput, true, false); // Mở khóa ô Mật mã

    // HIỂN THỊ CON MẮT: Cho phép Admin xem lại mật mã đang gõ trước khi bấm Lưu
    if (togglePasswordBtn) togglePasswordBtn.classList.remove('hidden');
    if (togglePasswordIcon) {
      togglePasswordIcon.classList.remove('fa-eye', 'text-[#0088ff]');
      togglePasswordIcon.classList.add('fa-eye-slash');
    }

    passwordInput.focus();

    setRoleGroupState(true); // Mở khóa nhóm quyền cho phép chọn Admin / Nhân viên
    roleNhanvien.checked = true;

    // Kích hoạt nút Tạo username, vô hiệu hóa nút Xóa
    setButtonState(btnCreateLogin, true);
    setButtonState(btnDeleteLogin, false);
  }
}

/**
 * Xử lý sự kiện Submit Form tạo mới Login (Nút 'Tạo username')
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const employeeSelect = document.getElementById('employeeSelect');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const roleAdmin = document.getElementById('roleAdmin');

  const manv = parseInt(employeeSelect.value, 10);
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const role = roleAdmin.checked ? 'Admin' : 'Nhanvien';

  // 1. Kiểm tra tính hợp lệ dữ liệu cơ bản (Frontend Validation)
  if (!manv) {
    showToast('warning', 'Vui lòng chọn nhân viên cần cấp tài khoản.');
    employeeSelect.focus();
    return;
  }

  if (!username) {
    showToast('warning', 'Tên đăng nhập không được để trống.');
    usernameInput.focus();
    return;
  }

  if (username.length < 3 || username.length > 50) {
    showToast('warning', 'Tên đăng nhập phải có độ dài từ 3 đến 50 ký tự.');
    usernameInput.focus();
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showToast('warning', 'Tên đăng nhập chỉ được chứa chữ cái, chữ số và dấu gạch dưới (_).');
    usernameInput.focus();
    return;
  }

  if (!password || password.length < 6) {
    showToast('warning', 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.');
    passwordInput.focus();
    return;
  }

  // 2. Gửi request tạo tài khoản lên Backend (Khóa nút tạm thời để chống bấm đúp)
  const btnCreateLogin = document.getElementById('btnCreateLogin');
  const originalBtnHtml = btnCreateLogin.innerHTML;
  setButtonState(btnCreateLogin, false);
  btnCreateLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i><span>Đang tạo...</span>';

  try {
    const response = await fetch('/admin/logins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ manv, username, password, role })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showToast('error', data.message || 'Không thể tạo tài khoản đăng nhập.');
      return;
    }

    showToast('success', data.message || 'Tạo tài khoản đăng nhập thành công.');

    // 3. Tải lại danh sách mới nhất từ server và đồng bộ giao diện
    await reloadLoginsData(manv);

  } catch (err) {
    showToast('error', 'Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.');
  } finally {
    btnCreateLogin.innerHTML = originalBtnHtml;
    const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
    const hasLogin = selectedOption && selectedOption.getAttribute('data-has-login') === '1';
    if (!hasLogin) {
      setButtonState(btnCreateLogin, true);
    }
  }
}

/**
 * Xử lý khi nhấn nút 'Xóa username' trên form chính
 */
function handleDeleteCurrentLogin() {
  const usernameInput = document.getElementById('usernameInput');
  const username = usernameInput.value.trim();
  const employeeSelect = document.getElementById('employeeSelect');
  const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
  const hoten = selectedOption ? selectedOption.getAttribute('data-hoten') : '';

  if (!username) {
    showToast('warning', 'Chưa có tài khoản nào được chọn để xóa.');
    return;
  }

  triggerDeleteLogin(username, hoten);
}

/**
 * Thực thi xác nhận và gửi yêu cầu xóa Login
 * @param {string} username - Tên đăng nhập SQL Server
 * @param {string} hoten - Họ tên nhân viên sở hữu tài khoản
 */
function triggerDeleteLogin(username, hoten) {
  // Kiểm tra an toàn: Không cho phép tự xóa tài khoản đang đăng nhập
  const currentUsername = (window.CURRENT_USERNAME || '').trim().toLowerCase();
  if (currentUsername && username.trim().toLowerCase() === currentUsername) {
    showToast('warning', 'Không được phép xóa tài khoản đang đăng nhập trong phiên làm việc hiện tại.');
    return;
  }

  if (username.trim().toLowerCase() === 'sa') {
    showToast('error', 'Không được phép xóa tài khoản quản trị hệ thống sa.');
    return;
  }

  // Hiển thị hộp thoại xác nhận hành động nguy hiểm
  showConfirm({
    title: 'Xác nhận xóa tài khoản',
    message: `Bạn có chắc chắn muốn xóa tài khoản đăng nhập [${username}]${hoten ? ' của nhân viên ' + hoten : ''} không? Quyền truy cập vào hệ thống của nhân viên này sẽ bị thu hồi hoàn toàn.`,
    onConfirm: async () => {
      try {
        const response = await fetch(`/admin/logins/${encodeURIComponent(username)}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          showToast('error', data.message || 'Không thể xóa tài khoản đăng nhập.');
          return;
        }

        showToast('success', data.message || 'Xóa tài khoản đăng nhập thành công.');

        // Tải lại danh sách và làm mới form
        await reloadLoginsData(null);

      } catch (err) {
        showToast('error', 'Lỗi khi gửi yêu cầu xóa tài khoản. Vui lòng thử lại.');
      }
    }
  });
}

/**
 * Chọn nhanh một nhân viên từ bảng danh sách bên phải nạp lên Form bên trái
 * @param {number} manv 
 */
function selectEmployeeFromTable(manv) {
  const employeeSelect = document.getElementById('employeeSelect');
  employeeSelect.value = manv;
  handleEmployeeChange(employeeSelect);

  // Cuộn nhẹ lên đầu form trên thiết bị di động
  document.getElementById('loginManageForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Tải lại toàn bộ dữ liệu tài khoản từ Backend qua AJAX (không reload trang)
 * @param {number|null} keepSelectedManv - Giữ nguyên nhân viên vừa thao tác nếu có
 */
async function reloadLoginsData(keepSelectedManv = null) {
  try {
    const res = await fetch('/admin/logins', {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.logins)) {
      allLoginsData = data.logins;
      
      // 1. Cập nhật lại các lựa chọn trong Dropdown
      const employeeSelect = document.getElementById('employeeSelect');
      employeeSelect.innerHTML = '<option value="" disabled selected>-- Chọn nhân viên để cấp / quản lý tài khoản --</option>';

      allLoginsData.forEach(nv => {
        const opt = document.createElement('option');
        opt.value = nv.MANV;
        opt.setAttribute('data-has-login', nv.HasLogin ? '1' : '0');
        opt.setAttribute('data-username', nv.Username || '');
        opt.setAttribute('data-role', nv.Role || '');
        opt.setAttribute('data-hoten', nv.HoTen);
        opt.textContent = `${nv.HoTen} (Mã NV: ${nv.MANV}) • ${nv.HasLogin ? 'Đã có tài khoản' : 'Chưa có tài khoản'}`;
        employeeSelect.appendChild(opt);
      });

      // 2. Cập nhật lại Bảng danh sách, Custom Dropdown và Badge số lượng
      renderCustomSelectOptions();
      renderActiveLoginsTable();
      updateActiveCountBadge();

      // 3. Khôi phục lại trạng thái chọn
      if (keepSelectedManv) {
        employeeSelect.value = keepSelectedManv;
        handleEmployeeChange(employeeSelect);
      } else {
        employeeSelect.value = '';
        handleEmployeeChange(employeeSelect);
      }
    }
  } catch (err) {
    console.error('Không thể làm mới danh sách tài khoản:', err);
  }
}

/**
 * Tìm kiếm và lọc danh sách tài khoản trên bảng
 * Sử dụng thuật toán tìm kiếm tiếng Việt không dấu (matchSearchTerms từ main.js)
 * @param {string} query 
 */
function handleSearchLogins(query) {
  activeSearchQuery = query.trim();
  renderActiveLoginsTable();
}

/**
 * Render bảng danh sách các tài khoản SQL Server đang hoạt động
 */
function renderActiveLoginsTable() {
  const tableBody = document.getElementById('loginTableBody');
  if (!tableBody) return;

  // Lọc chỉ lấy những nhân viên ĐÃ CÓ Login (HasLogin == 1)
  let activeLogins = allLoginsData.filter(item => item.HasLogin === 1);

  // Nếu người dùng có nhập từ khóa tìm kiếm
  if (activeSearchQuery) {
    const matcher = (typeof window.matchSearchTerms === 'function') 
      ? window.matchSearchTerms 
      : (typeof matchSearchTerms === 'function' ? matchSearchTerms : null);

    const removeTones = (typeof window.removeVietnameseTones === 'function')
      ? window.removeVietnameseTones
      : (typeof removeVietnameseTones === 'function' ? removeVietnameseTones : (s => (s || '').toLowerCase()));

    activeLogins = activeLogins.filter(item => {
      const searchFields = [
        item.MANV !== null && item.MANV !== undefined ? String(item.MANV) : '',
        item.HoTen || '',
        item.Username || '',
        item.Role || ''
      ];

      // Sử dụng engine tìm kiếm tiếng Việt không dấu theo từ khóa (Token-based)
      if (matcher) {
        return matcher(searchFields, activeSearchQuery);
      }

      // Fallback an toàn có bỏ dấu tiếng Việt
      const normalizedSource = removeTones(searchFields.join(' '));
      const normalizedQuery = removeTones(activeSearchQuery);
      return normalizedSource.includes(normalizedQuery);
    });
  }

  // Trường hợp không có bản ghi nào khớp
  if (activeLogins.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center space-y-1">
            <i class="fa-solid fa-user-xmark text-2xl text-slate-300"></i>
            <span class="text-xs">Không tìm thấy tài khoản đăng nhập nào.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const currentUsername = (window.CURRENT_USERNAME || '').trim().toLowerCase();

  // Render các dòng dữ liệu
  tableBody.innerHTML = activeLogins.map(item => {
    const isCurrent = currentUsername && item.Username && item.Username.trim().toLowerCase() === currentUsername;
    const roleBadge = item.Role === 'Admin'
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
           <i class="fa-solid fa-crown mr-1 text-[9px]"></i>Admin
         </span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
           <i class="fa-solid fa-user mr-1 text-[9px]"></i>Nhân viên
         </span>`;

    return `
      <tr class="hover:bg-blue-50/40 transition cursor-pointer" onclick="selectEmployeeFromTable(${item.MANV})">
        <td class="px-3.5 py-2.5 font-mono font-bold text-[#0088ff]">
          ${item.MANV}
        </td>
        <td class="px-3.5 py-2.5 font-medium text-slate-800">
          ${item.HoTen}
          ${isCurrent ? '<span class="ml-1.5 text-[10px] bg-blue-100 text-[#0088ff] font-bold px-1.5 py-0.5 rounded">(Bạn)</span>' : ''}
        </td>
        <td class="px-3.5 py-2.5 font-mono text-slate-700 font-semibold">
          ${item.Username}
        </td>
        <td class="px-3.5 py-2.5 text-center">
          ${roleBadge}
        </td>
        <td class="px-3.5 py-2.5 text-center" onclick="event.stopPropagation()">
          <div class="flex items-center justify-center">
            ${!isCurrent ? `
              <button 
                type="button" 
                onclick="triggerDeleteLogin('${item.Username}', '${item.HoTen}')" 
                title="Xóa tài khoản này"
                class="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition text-sm"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : `
              <span title="Không thể xóa tài khoản của chính mình" class="w-8 h-8 flex items-center justify-center text-slate-300">
                <i class="fa-solid fa-lock text-xs"></i>
              </span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Cập nhật số lượng tài khoản đang hoạt động lên Badge tiêu đề
 */
function updateActiveCountBadge() {
  const badge = document.getElementById('activeCountBadge');
  if (!badge) return;

  const activeCount = allLoginsData.filter(item => item.HasLogin === 1).length;
  badge.textContent = `${activeCount} tài khoản hoạt động`;
}

/**
 * Bật / Tắt hiển thị mật khẩu khi đang nhập tạo tài khoản mới
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('passwordInput');
  const toggleIcon = document.getElementById('togglePasswordIcon');
  if (!passwordInput || !toggleIcon) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye', 'text-[#0088ff]');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye', 'text-[#0088ff]');
    toggleIcon.classList.add('fa-eye-slash');
  }
}

/**
 * ====================================================================================
 * CÁC HÀM XỬ LÝ CHO CUSTOM SELECT DROPDOWN (CĂN PHẢI TRẠNG THÁI TÀI KHOẢN)
 * ====================================================================================
 */

/**
 * Bật/tắt hiển thị menu dropdown tùy biến
 */
function toggleEmployeeDropdown() {
  const menu = document.getElementById('customSelectMenu');
  const chevron = document.getElementById('customSelectChevron');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    menu.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

/**
 * Đóng menu dropdown tùy biến
 */
function closeEmployeeDropdown() {
  const menu = document.getElementById('customSelectMenu');
  const chevron = document.getElementById('customSelectChevron');
  if (menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

/**
 * Chọn nhân viên từ custom dropdown
 * @param {number} manv 
 */
function selectCustomOption(manv) {
  const employeeSelect = document.getElementById('employeeSelect');
  if (!employeeSelect) return;
  employeeSelect.value = manv;
  handleEmployeeChange(employeeSelect);
  closeEmployeeDropdown();
}

/**
 * Cập nhật nội dung hiển thị trên Trigger button của Custom Select
 * @param {string|number|null} manv 
 * @param {HTMLOptionElement|null} selectedOption 
 */
function updateCustomSelectLabel(manv, selectedOption) {
  const customSelectLabel = document.getElementById('customSelectLabel');
  if (!customSelectLabel) return;

  if (!manv || !selectedOption || !selectedOption.value) {
    customSelectLabel.innerHTML = '<span class="text-slate-400">-- Chọn nhân viên để cấp / quản lý tài khoản --</span>';
    return;
  }

  const hoten = selectedOption.getAttribute('data-hoten') || '';
  const hasLogin = selectedOption.getAttribute('data-has-login') === '1';

  customSelectLabel.innerHTML = `
    <div class="flex items-center justify-between w-full pr-1">
      <span class="font-medium text-slate-800 truncate">
        ${hoten} <span class="text-slate-400 font-normal text-xs">(Mã NV: ${manv})</span>
      </span>
      <span class="shrink-0 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${hasLogin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
        ${hasLogin ? 'Đã có tài khoản' : 'Chưa có tài khoản'}
      </span>
    </div>
  `;
}

/**
 * Render lại danh sách custom option khi dữ liệu thay đổi
 */
function renderCustomSelectOptions() {
  const container = document.getElementById('customSelectItems');
  if (!container) return;

  container.innerHTML = allLoginsData.map(nv => `
    <div 
      class="custom-option flex items-center justify-between px-3.5 py-2.5 hover:bg-blue-50/70 cursor-pointer transition select-none text-xs"
      data-manv="${nv.MANV}"
      onclick="selectCustomOption(${nv.MANV})"
    >
      <span class="font-medium text-slate-800 truncate pr-2">
        ${nv.HoTen} <span class="text-slate-400 font-normal">(Mã NV: ${nv.MANV})</span>
      </span>
      <span class="shrink-0 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${nv.HasLogin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
        ${nv.HasLogin ? 'Đã có tài khoản' : 'Chưa có tài khoản'}
      </span>
    </div>
  `).join('');
}

// Lắng nghe sự kiện click ngoài hoặc phím Escape để đóng Dropdown
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('customSelectWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeEmployeeDropdown();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEmployeeDropdown();
  }
});
