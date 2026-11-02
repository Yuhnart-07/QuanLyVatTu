// ====================================================================================
// client/public/js/receipts.js
// Xử lý Client-side cho Module Phiếu Nhập Kho (Thành viên 2)
// Tích hợp: Base UI Design System Sapo, Modal, Confirm, Toast, apiRequest
// Tham chiếu: Rule.md, docs/01-SYSTEM_RULES.md, docs/03-BUSINESS_MODULES.md
// ====================================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo các sự kiện phím tắt hoặc tìm kiếm nếu cần
});

/**
 * 1. MỞ MODAL LẬP PHIẾU NHẬP KHO MỚI
 */
async function openCreateReceiptModal() {
  // Sinh mã phiếu nhập ngẫu nhiên dạng PN000xxx
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const defaultMapn = `PN${randomSuffix.toString().substring(0, 6)}`;

  let orders = [];
  try {
    const res = await apiRequest('/orders');
    if (res && res.data) {
      orders = res.data;
    }
  } catch (e) {
    console.warn('Không tải được danh sách đơn hàng:', e.message);
  }

  let orderOptions = '<option value="">-- Chọn đơn đặt hàng căn cứ --</option>';
  orders.forEach(o => {
    orderOptions += `<option value="${o.MasoDDH}">${o.MasoDDH} - ${o.NhaCC || 'Chưa rõ NCC'} (${o.NGAY ? new Date(o.NGAY).toLocaleDateString('vi-VN') : ''})</option>`;
  });

  const formHtml = `
    <form id="createReceiptForm" onsubmit="handleCreateReceiptSubmit(event)" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Mã Phiếu Nhập <span class="text-rose-500">*</span></label>
          <input 
            type="text" 
            id="modalMapn" 
            name="mapn" 
            value="${defaultMapn}" 
            maxlength="8" 
            required 
            placeholder="Ví dụ: PN000001" 
            class="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:border-[#0088ff] focus:outline-none uppercase"
          >
          <p class="text-[11px] text-slate-400 mt-0.5">Tối đa 8 ký tự chữ hoặc số.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Đơn Đặt Hàng Căn Cứ <span class="text-rose-500">*</span></label>
          <select 
            id="modalMasoDDH" 
            name="masoDDH" 
            required 
            onchange="handleSelectOrderChange(this.value)"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#0088ff] focus:outline-none bg-white font-mono"
          >
            ${orderOptions}
          </select>
          <p class="text-[11px] text-slate-400 mt-0.5">Chọn DDH để tải danh sách vật tư còn thiếu.</p>
        </div>
      </div>

      <!-- Khu vực danh sách chi tiết vật tư của đơn hàng -->
      <div class="pt-2">
        <div class="flex justify-between items-center mb-2">
          <label class="block text-xs font-semibold text-slate-700">Chi Tiết Vật Tư Thực Nhận</label>
          <span id="orderItemSummary" class="text-xs text-slate-500 font-medium"></span>
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
          <div class="max-h-64 overflow-y-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th class="p-2.5">Vật tư</th>
                  <th class="p-2.5 text-center">ĐVT</th>
                  <th class="p-2.5 text-right">SL Đặt</th>
                  <th class="p-2.5 text-right">Đã Nhập</th>
                  <th class="p-2.5 text-right text-emerald-600">Còn Lại</th>
                  <th class="p-2.5 text-right w-24">SL Nhận</th>
                  <th class="p-2.5 text-right w-28">Đơn Giá (VNĐ)</th>
                  <th class="p-2.5 text-right w-28">Thành Tiền</th>
                </tr>
              </thead>
              <tbody id="receiptItemsTableBody" class="divide-y divide-slate-100 bg-white">
                <tr>
                  <td colspan="8" class="p-6 text-center text-slate-400">
                    Vui lòng chọn một Đơn đặt hàng ở trên để hiển thị danh mục vật tư.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tổng kết thành tiền -->
      <div class="flex justify-between items-center p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs">
        <span class="text-slate-600">Tổng giá trị phiếu nhập tạm tính:</span>
        <span id="receiptTotalAmount" class="font-bold font-mono text-sm text-[#0088ff]">0 VNĐ</span>
      </div>

      <!-- Footer nút bấm Modal -->
      <div class="flex justify-end space-x-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="sapo-btn btn-sapo-cancel">
          <i class="fa-solid fa-xmark"></i>
          <span>Thoát</span>
        </button>
        <button type="submit" id="btnSubmitReceipt" class="sapo-btn btn-sapo-save">
          <i class="fa-solid fa-floppy-disk"></i>
          <span>Lưu Phiếu Nhập</span>
        </button>
      </div>
    </form>
  `;

  openModal('Lập Phiếu Nhập Kho Mới (Master-Detail)', formHtml, 'max-w-4xl');
}

/**
 * 2. KHI NGƯỜI DÙNG CHỌN ĐƠN ĐẶT HÀNG TRONG FORM
 */
async function handleSelectOrderChange(masoDDH) {
  const tbody = document.getElementById('receiptItemsTableBody');
  const summarySpan = document.getElementById('orderItemSummary');
  if (!masoDDH) {
    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">Vui lòng chọn một Đơn đặt hàng ở trên.</td></tr>';
    summarySpan.textContent = '';
    recalculateTotalReceiptAmount();
    return;
  }

  tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang tải dữ liệu vật tư của đơn hàng...</td></tr>';

  try {
    const res = await apiRequest(`/receipts/order-items/${encodeURIComponent(masoDDH)}`);
    const items = res.data || [];

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-amber-600">Đơn hàng này không có chi tiết vật tư hoặc đã nhập đủ toàn bộ.</td></tr>';
      summarySpan.textContent = '0 mặt hàng';
      return;
    }

    summarySpan.textContent = `${items.length} mặt hàng`;
    let html = '';

    items.forEach((it, idx) => {
      const conLai = Number(it.ConLai) || 0;
      const isHetHang = conLai <= 0;
      const defaultSl = isHetHang ? 0 : conLai; // Mặc định điền lượng còn lại để tiện thao tác

      html += `
        <tr class="hover:bg-slate-50/80 transition ${isHetHang ? 'opacity-50 bg-slate-50' : ''}" data-mavt="${it.MAVT}">
          <td class="p-2.5">
            <div class="font-semibold text-slate-800">${it.TENVT}</div>
            <div class="text-[11px] font-mono text-slate-400">${it.MAVT}</div>
          </td>
          <td class="p-2.5 text-center text-slate-600">${it.DVT || '-'}</td>
          <td class="p-2.5 text-right font-mono">${Number(it.SoLuongDat).toLocaleString('vi-VN')}</td>
          <td class="p-2.5 text-right font-mono text-slate-500">${Number(it.DaNhap).toLocaleString('vi-VN')}</td>
          <td class="p-2.5 text-right font-mono font-bold text-emerald-600">${conLai.toLocaleString('vi-VN')}</td>
          <td class="p-2.5 text-right">
            <input 
              type="number" 
              name="soluong_${it.MAVT}"
              class="w-20 px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:border-[#0088ff] focus:outline-none input-receipt-qty"
              min="0" 
              max="${conLai}" 
              value="${defaultSl}"
              ${isHetHang ? 'disabled' : ''}
              oninput="handleItemInputChange(this, ${conLai})"
            >
          </td>
          <td class="p-2.5 text-right">
            <input 
              type="number" 
              name="dongia_${it.MAVT}"
              class="w-24 px-2 py-1 text-xs text-right font-mono border border-slate-200 rounded focus:border-[#0088ff] focus:outline-none input-receipt-price"
              min="0" 
              step="any"
              value="${it.DonGiaDat || 0}"
              ${isHetHang ? 'disabled' : ''}
              oninput="handleItemInputChange(this, ${conLai})"
            >
          </td>
          <td class="p-2.5 text-right font-mono font-semibold text-slate-700 cell-item-subtotal">
            ${(defaultSl * (it.DonGiaDat || 0)).toLocaleString('vi-VN')} VNĐ
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    recalculateTotalReceiptAmount();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-rose-500">Lỗi khi tải chi tiết đơn hàng: ${err.message}</td></tr>`;
  }
}

/**
 * 3. TÍNH LẠI THÀNH TIỀN KHI NGƯỜI DÙNG THAY ĐỔI SỐ LƯỢNG HOẶC ĐƠN GIÁ
 */
function handleItemInputChange(inputEl, maxConLai) {
  const row = inputEl.closest('tr');
  const qtyInput = row.querySelector('.input-receipt-qty');
  const priceInput = row.querySelector('.input-receipt-price');
  const subtotalCell = row.querySelector('.cell-item-subtotal');

  let qty = Number(qtyInput.value) || 0;
  let price = Number(priceInput.value) || 0;

  // Cảnh báo nếu nhập vượt quá số lượng còn lại của đơn hàng
  if (qty > maxConLai) {
    showToast('warning', `Số lượng nhập không được vượt quá ${maxConLai}!`);
    qty = maxConLai;
    qtyInput.value = maxConLai;
  }
  if (qty < 0) {
    qty = 0;
    qtyInput.value = 0;
  }
  if (price < 0) {
    price = 0;
    priceInput.value = 0;
  }

  const subtotal = qty * price;
  subtotalCell.textContent = `${subtotal.toLocaleString('vi-VN')} VNĐ`;

  recalculateTotalReceiptAmount();
}

/**
 * TÍNH TỔNG CỘNG TIỀN PHIẾU NHẬP
 */
function recalculateTotalReceiptAmount() {
  let total = 0;
  const rows = document.querySelectorAll('#receiptItemsTableBody tr');
  rows.forEach(r => {
    const qtyInput = r.querySelector('.input-receipt-qty');
    const priceInput = r.querySelector('.input-receipt-price');
    if (qtyInput && priceInput && !qtyInput.disabled) {
      const q = Number(qtyInput.value) || 0;
      const p = Number(priceInput.value) || 0;
      total += q * p;
    }
  });

  const totalEl = document.getElementById('receiptTotalAmount');
  if (totalEl) {
    totalEl.textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
  }
}

/**
 * 4. SUBMIT FORM LẬP PHIẾU NHẬP
 */
async function handleCreateReceiptSubmit(e) {
  e.preventDefault();

  const mapn = document.getElementById('modalMapn').value.trim().toUpperCase();
  const masoDDH = document.getElementById('modalMasoDDH').value.trim();

  if (!mapn) {
    showToast('error', 'Vui lòng nhập Mã phiếu nhập.');
    return;
  }
  if (!masoDDH) {
    showToast('error', 'Vui lòng chọn Đơn đặt hàng căn cứ.');
    return;
  }

  // Thu thập danh sách details có số lượng > 0
  const details = [];
  const rows = document.querySelectorAll('#receiptItemsTableBody tr');

  rows.forEach(r => {
    const mavt = r.getAttribute('data-mavt');
    const qtyInput = r.querySelector('.input-receipt-qty');
    const priceInput = r.querySelector('.input-receipt-price');

    if (mavt && qtyInput && priceInput && !qtyInput.disabled) {
      const soluong = Number(qtyInput.value) || 0;
      const dongia = Number(priceInput.value) || 0;

      if (soluong > 0) {
        details.push({
          mavt,
          soluong,
          dongia
        });
      }
    }
  });

  if (details.length === 0) {
    showToast('error', 'Vui lòng nhập số lượng thực nhận (> 0) cho ít nhất 01 mặt hàng.');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitReceipt');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang lưu...';
  }

  try {
    const payload = {
      mapn,
      masoDDH,
      details
    };

    const res = await apiRequest('/receipts', 'POST', payload);
    showToast('success', res.message || 'Lập phiếu nhập kho thành công!');
    closeModal();
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    showToast('error', err.message || 'Lỗi khi lập phiếu nhập kho.');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Lưu Phiếu Nhập</span>';
    }
  }
}

/**
 * 5. XEM CHI TIẾT PHIẾU NHẬP KHO
 */
async function viewReceiptDetails(mapn) {
  try {
    const res = await apiRequest(`/receipts/${encodeURIComponent(mapn)}`);
    const data = res.data;

    if (!data) {
      showToast('error', 'Không tìm thấy thông tin phiếu nhập.');
      return;
    }

    let detailsHtml = '';
    let total = 0;

    (data.details || []).forEach((d, idx) => {
      const sl = Number(d.SOLUONG) || 0;
      const dg = Number(d.DONGIA) || 0;
      const tt = sl * dg;
      total += tt;

      detailsHtml += `
        <tr class="hover:bg-slate-50">
          <td class="p-2.5 text-center text-slate-400">${idx + 1}</td>
          <td class="p-2.5 font-mono font-semibold text-slate-700">${d.MAVT}</td>
          <td class="p-2.5 font-medium text-slate-800">${d.TENVT}</td>
          <td class="p-2.5 text-center text-slate-500">${d.DVT || '-'}</td>
          <td class="p-2.5 text-right font-mono font-bold text-emerald-600">${sl.toLocaleString('vi-VN')}</td>
          <td class="p-2.5 text-right font-mono">${dg.toLocaleString('vi-VN')}</td>
          <td class="p-2.5 text-right font-mono font-semibold text-slate-800">${tt.toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      `;
    });

    const modalHtml = `
      <div class="space-y-4 text-xs">
        <!-- Thông tin Master -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <div>
            <span class="block text-slate-400 text-[11px]">Mã Phiếu Nhập</span>
            <span class="font-bold font-mono text-sm text-emerald-600">${data.MAPN}</span>
          </div>
          <div>
            <span class="block text-slate-400 text-[11px]">Ngày Nhập</span>
            <span class="font-semibold text-slate-700">${data.NGAY ? new Date(data.NGAY).toLocaleDateString('vi-VN') : '-'}</span>
          </div>
          <div>
            <span class="block text-slate-400 text-[11px]">Đơn Đặt Hàng</span>
            <span class="font-semibold font-mono text-indigo-600">${data.MasoDDH || '-'}</span>
          </div>
          <div>
            <span class="block text-slate-400 text-[11px]">Nhân Viên Nhận</span>
            <span class="font-semibold text-slate-700">${data.HoTenNV || ('Mã NV: ' + data.MANV)}</span>
          </div>
        </div>

        <div>
          <span class="block text-slate-400 text-[11px]">Nhà Cung Cấp</span>
          <span class="font-semibold text-slate-800 text-sm">${data.NhaCC || '-'}</span>
        </div>

        <!-- Bảng chi tiết CTPN -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="p-2.5 text-center w-10">#</th>
                <th class="p-2.5 w-20">Mã VT</th>
                <th class="p-2.5">Tên Vật Tư</th>
                <th class="p-2.5 text-center w-16">ĐVT</th>
                <th class="p-2.5 text-right w-24">Số Lượng</th>
                <th class="p-2.5 text-right w-28">Đơn Giá (VNĐ)</th>
                <th class="p-2.5 text-right w-32">Thành Tiền</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${detailsHtml || '<tr><td colspan="7" class="p-4 text-center text-slate-400">Không có dòng chi tiết nào.</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- Tổng tiền -->
        <div class="flex justify-between items-center p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <span class="font-semibold text-slate-700">TỔNG GIÁ TRỊ PHIẾU NHẬP:</span>
          <span class="font-bold font-mono text-base text-emerald-700">${total.toLocaleString('vi-VN')} VNĐ</span>
        </div>

        <!-- Nút bấm -->
        <div class="flex justify-between items-center pt-2 border-t border-slate-100">
          <button onclick="handleDeleteReceipt('${data.MAPN}')" class="sapo-btn btn-sapo-delete text-xs">
            <i class="fa-solid fa-trash-can"></i>
            <span>Hủy / Xóa Phiếu</span>
          </button>
          <button onclick="closeModal()" class="sapo-btn btn-sapo-cancel">
            <i class="fa-solid fa-xmark"></i>
            <span>Đóng</span>
          </button>
        </div>
      </div>
    `;

    openModal(`Chi Tiết Phiếu Nhập: ${data.MAPN}`, modalHtml, 'max-w-3xl');
  } catch (err) {
    showToast('error', 'Lỗi khi tải chi tiết phiếu nhập: ' + err.message);
  }
}

/**
 * 6. XÓA / HỦY PHIẾU NHẬP KHO
 */
function handleDeleteReceipt(mapn) {
  showConfirm({
    title: `Xác nhận xóa phiếu nhập ${mapn}?`,
    message: 'Hệ thống sẽ hoàn tác trừ lại số lượng tồn kho tương ứng. Thao tác này sẽ bị từ chối nếu số lượng tồn kho hiện tại không đủ để trừ.',
    confirmText: 'Đồng ý xóa',
    confirmClass: 'btn-sapo-delete',
    onConfirm: async () => {
      try {
        await apiRequest(`/receipts/${encodeURIComponent(mapn)}`, 'DELETE');
        showToast('success', 'Xóa phiếu nhập và hoàn tác tồn kho thành công!');
        closeModal();
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('error', err.message || 'Không thể xóa phiếu nhập.');
      }
    }
  });
}
