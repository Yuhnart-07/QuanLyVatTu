// ====================================================================================
// client/public/js/reports.js
// Xử lý Client-side cho Hệ thống Báo biểu & Thống kê
// Trọng tâm Thành viên 2: Báo cáo 2.3 (DDH chưa hoàn tất) & Báo cáo 2.5 (Nhập kho 12 tháng)
// ====================================================================================

/**
 * 1. TẢI VÀ HIỂN THỊ CÁC BÁO CÁO CƠ BẢN (KHÔNG CẦN CHỌN NGÀY)
 */
async function loadReport(type) {
  const container = document.getElementById('reportResultContainer');
  const titleEl = document.getElementById('reportTitle');
  const contentEl = document.getElementById('reportContent');

  container.classList.remove('hidden');
  contentEl.innerHTML = '<div class="p-8 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-xl mr-2"></i> Đang tải dữ liệu báo cáo...</div>';

  // Cuộn trang xuống khu vực báo cáo
  container.scrollIntoView({ behavior: 'smooth' });

  try {
    if (type === 'pending-orders') {
      // BÁO CÁO 2.3 — ĐƠN ĐẶT HÀNG CHƯA HOÀN TẤT (THÀNH VIÊN 2)
      titleEl.innerHTML = '<i class="fa-solid fa-clock-rotate-left text-indigo-600 mr-2"></i> BÁO CÁO 2.3: ĐƠN ĐẶT HÀNG CHƯA HOÀN TẤT (CHƯA NHẬP ĐỦ)';
      
      const res = await apiRequest('/reports/pending-orders');
      const data = res.data || [];

      if (data.length === 0) {
        contentEl.innerHTML = `
          <div class="p-8 text-center text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <i class="fa-solid fa-circle-check text-4xl mb-2"></i>
            <div class="font-bold text-base">Tuyệt vời! Tất cả đơn đặt hàng đều đã được nhập đủ 100%.</div>
            <p class="text-xs text-slate-500 mt-1">Không có đơn đặt hàng nào bị tồn đọng chưa giao nhận.</p>
          </div>
        `;
        return;
      }

      let rowsHtml = '';
      let totalConLai = 0;

      data.forEach((r, idx) => {
        const slDat = Number(r.SoLuongDat) || 0;
        const daNhap = Number(r.SoLuongDaNhap) || 0;
        const conLai = Number(r.SoLuongConLai) || 0;
        totalConLai += conLai;

        const isChuaNhap = daNhap === 0;
        const badgeClass = isChuaNhap 
          ? 'bg-rose-50 text-rose-700 border-rose-200' 
          : 'bg-amber-50 text-amber-700 border-amber-200';

        rowsHtml += `
          <tr class="hover:bg-slate-50/80 transition text-xs">
            <td class="p-2.5 text-center text-slate-400 font-mono">${idx + 1}</td>
            <td class="p-2.5 font-mono font-bold text-indigo-600">${r.MasoDDH}</td>
            <td class="p-2.5 text-slate-600">${r.NgayDat ? new Date(r.NgayDat).toLocaleDateString('vi-VN') : '-'}</td>
            <td class="p-2.5 font-medium text-slate-800">${r.NhaCC || '-'}</td>
            <td class="p-2.5 text-slate-600">${r.NhanVienPhuTrach || '-'}</td>
            <td class="p-2.5 font-mono font-semibold text-slate-700">${r.MAVT}</td>
            <td class="p-2.5 font-medium text-slate-800">${r.TENVT}</td>
            <td class="p-2.5 text-center text-slate-500">${r.DVT || '-'}</td>
            <td class="p-2.5 text-right font-mono">${slDat.toLocaleString('vi-VN')}</td>
            <td class="p-2.5 text-right font-mono text-slate-500">${daNhap.toLocaleString('vi-VN')}</td>
            <td class="p-2.5 text-right font-mono font-bold text-rose-600">${conLai.toLocaleString('vi-VN')}</td>
            <td class="p-2.5 text-center">
              <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}">
                ${r.TrangThaiVatTu}
              </span>
            </td>
          </tr>
        `;
      });

      contentEl.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-between items-center text-xs p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
            <span class="text-slate-600">Tổng số dòng vật tư còn thiếu trong toàn hệ thống:</span>
            <span class="font-bold text-sm font-mono text-rose-600">${totalConLai.toLocaleString('vi-VN')} đơn vị</span>
          </div>

          <table class="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead class="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5 text-center w-10">#</th>
                <th class="p-2.5">Mã DDH</th>
                <th class="p-2.5">Ngày Đặt</th>
                <th class="p-2.5">Nhà Cung Cấp</th>
                <th class="p-2.5">NV Phụ Trách</th>
                <th class="p-2.5">Mã VT</th>
                <th class="p-2.5">Tên Vật Tư</th>
                <th class="p-2.5 text-center">ĐVT</th>
                <th class="p-2.5 text-right">SL Đặt</th>
                <th class="p-2.5 text-right">Đã Nhập</th>
                <th class="p-2.5 text-right text-rose-600">Còn Thiếu</th>
                <th class="p-2.5 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

    } else if (type === 'employees') {
      // 2.1 Danh sách nhân viên
      titleEl.innerHTML = '<i class="fa-solid fa-users text-indigo-600 mr-2"></i> BÁO CÁO 2.1: DANH SÁCH NHÂN VIÊN';
      const res = await apiRequest('/reports/employees');
      const data = res.data || [];
      let rowsHtml = '';
      data.forEach((nv, idx) => {
        rowsHtml += `
          <tr class="hover:bg-slate-50 text-xs">
            <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
            <td class="p-2 font-mono font-bold text-indigo-600">${nv.MANV}</td>
            <td class="p-2 font-medium text-slate-800">${nv.HO} ${nv.TEN}</td>
            <td class="p-2 text-slate-600">${nv.DIACHI || '-'}</td>
            <td class="p-2 text-slate-600">${nv.NGAYSINH ? new Date(nv.NGAYSINH).toLocaleDateString('vi-VN') : '-'}</td>
            <td class="p-2 text-right font-mono font-semibold">${Number(nv.LUONG || 0).toLocaleString('vi-VN')} VNĐ</td>
            <td class="p-2 text-slate-500">${nv.GHICHU || '-'}</td>
          </tr>
        `;
      });
      contentEl.innerHTML = `
        <table class="w-full text-left border-collapse border border-slate-200 text-xs">
          <thead class="bg-slate-100 font-bold uppercase text-[11px] border-b">
            <tr>
              <th class="p-2 text-center w-10">#</th>
              <th class="p-2">Mã NV</th>
              <th class="p-2">Họ và Tên</th>
              <th class="p-2">Địa Chỉ</th>
              <th class="p-2">Ngày Sinh</th>
              <th class="p-2 text-right">Lương</th>
              <th class="p-2">Ghi Chú</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">${rowsHtml}</tbody>
        </table>
      `;

    } else if (type === 'materials') {
      // 2.2 Danh mục vật tư
      titleEl.innerHTML = '<i class="fa-solid fa-boxes-stacked text-indigo-600 mr-2"></i> BÁO CÁO 2.2: DANH MỤC VẬT TƯ VÀ TỒN KHO';
      const res = await apiRequest('/reports/materials');
      const data = res.data || [];
      let rowsHtml = '';
      data.forEach((vt, idx) => {
        rowsHtml += `
          <tr class="hover:bg-slate-50 text-xs">
            <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
            <td class="p-2 font-mono font-bold text-indigo-600">${vt.MAVT}</td>
            <td class="p-2 font-semibold text-slate-800">${vt.TENVT}</td>
            <td class="p-2 text-center text-slate-600">${vt.DVT || '-'}</td>
            <td class="p-2 text-right font-mono font-bold text-emerald-600">${Number(vt.Soluongton || 0).toLocaleString('vi-VN')}</td>
          </tr>
        `;
      });
      contentEl.innerHTML = `
        <table class="w-full text-left border-collapse border border-slate-200 text-xs">
          <thead class="bg-slate-100 font-bold uppercase text-[11px] border-b">
            <tr>
              <th class="p-2 text-center w-10">#</th>
              <th class="p-2">Mã VT</th>
              <th class="p-2">Tên Vật Tư</th>
              <th class="p-2 text-center">Đơn Vị Tính</th>
              <th class="p-2 text-right">Số Lượng Tồn Kho</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">${rowsHtml}</tbody>
        </table>
      `;
    }
  } catch (err) {
    contentEl.innerHTML = `<div class="p-6 text-center text-rose-500 font-semibold">Lỗi khi tải báo cáo: ${err.message}</div>`;
  }
}

/**
 * 2. MỞ MODAL CHỌN NĂM THỐNG KÊ (BÁO CÁO 2.5 NHẬP KHO HOẶC 2.6 XUẤT KHO)
 */
function openYearReportModal() {
  const currentYear = new Date().getFullYear();
  const formHtml = `
    <form id="yearReportForm" onsubmit="handleYearReportSubmit(event)" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Loại Báo Cáo Thống Kê</label>
        <select id="modalReportType" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#0088ff] focus:outline-none bg-white">
          <option value="receipt">2.5 Thống kê Phiếu Nhập & Trị giá nhập (Thành viên 2)</option>
          <option value="issue">2.6 Thống kê Phiếu Xuất & Trị giá xuất (Thành viên 3)</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Năm Tài Chính Khảo Sát</label>
        <input 
          type="number" 
          id="modalReportYear" 
          value="${currentYear}" 
          min="2000" 
          max="2100" 
          required 
          class="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:border-[#0088ff] focus:outline-none"
        >
      </div>

      <div class="flex justify-end space-x-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="sapo-btn btn-sapo-cancel">Đóng</button>
        <button type="submit" class="sapo-btn btn-sapo-primary">Xem Thống Kê</button>
      </div>
    </form>
  `;

  openModal('Thống Kê Giao Dịch 12 Tháng Theo Năm', formHtml, 'max-w-md');
}

/**
 * XỬ LÝ SUBMIT CHỌN NĂM BÁO CÁO 2.5
 */
async function handleYearReportSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('modalReportType').value;
  const year = document.getElementById('modalReportYear').value || new Date().getFullYear();
  closeModal();

  const container = document.getElementById('reportResultContainer');
  const titleEl = document.getElementById('reportTitle');
  const contentEl = document.getElementById('reportContent');

  container.classList.remove('hidden');
  contentEl.innerHTML = '<div class="p-8 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-xl mr-2"></i> Đang tổng hợp dữ liệu 12 tháng...</div>';
  container.scrollIntoView({ behavior: 'smooth' });

  try {
    const endpoint = type === 'receipt' ? `/reports/receipt-stats-year?year=${year}` : `/reports/issue-stats-year?year=${year}`;
    const res = await apiRequest(endpoint);
    const data = res.data || [];

    const isReceipt = type === 'receipt';
    titleEl.innerHTML = `<i class="fa-solid fa-calendar-days text-indigo-600 mr-2"></i> BÁO CÁO ${isReceipt ? '2.5: THỐNG KÊ PHIẾU NHẬP' : '2.6: THỐNG KÊ PHIẾU XUẤT'} NĂM ${year}`;

    let rowsHtml = '';
    let totalPhieu = 0;
    let totalTien = 0;

    data.forEach(m => {
      const soPhieu = Number(isReceipt ? m.SoPhieuNhap : m.SoPhieuXuat) || 0;
      const tongTien = Number(isReceipt ? m.TongGiaTriNhap : m.TongGiaTriXuat) || 0;
      totalPhieu += soPhieu;
      totalTien += tongTien;

      rowsHtml += `
        <tr class="hover:bg-slate-50 text-xs">
          <td class="p-2.5 text-center font-bold text-slate-700">Tháng ${m.Thang}</td>
          <td class="p-2.5 text-right font-mono font-semibold ${soPhieu > 0 ? 'text-[#0088ff]' : 'text-slate-400'}">
            ${soPhieu.toLocaleString('vi-VN')}
          </td>
          <td class="p-2.5 text-right font-mono font-semibold ${tongTien > 0 ? (isReceipt ? 'text-emerald-700' : 'text-amber-700') : 'text-slate-400'}">
            ${tongTien.toLocaleString('vi-VN')} VNĐ
          </td>
        </tr>
      `;
    });

    contentEl.innerHTML = `
      <div class="space-y-4">
        <!-- Thẻ tóm tắt cả năm -->
        <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span class="block text-slate-500">Tổng số phiếu ${isReceipt ? 'nhập' : 'xuất'} trong năm:</span>
            <span class="font-bold text-sm font-mono text-[#0088ff]">${totalPhieu.toLocaleString('vi-VN')} phiếu</span>
          </div>
          <div>
            <span class="block text-slate-500">Tổng giá trị ${isReceipt ? 'nhập' : 'xuất'} cả năm ${year}:</span>
            <span class="font-bold text-sm font-mono ${isReceipt ? 'text-emerald-700' : 'text-amber-700'}">${totalTien.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        <!-- Bảng 12 tháng -->
        <table class="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
          <thead class="bg-slate-100 font-bold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th class="p-2.5 text-center w-24">Thời Gian</th>
              <th class="p-2.5 text-right w-44">Số Phiếu ${isReceipt ? 'Nhập' : 'Xuất'}</th>
              <th class="p-2.5 text-right">Tổng Trị Giá (VNĐ)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            ${rowsHtml}
          </tbody>
          <tfoot class="bg-slate-100 font-bold border-t border-slate-200">
            <tr>
              <td class="p-2.5 text-center">TỔNG CỘNG</td>
              <td class="p-2.5 text-right font-mono text-[#0088ff]">${totalPhieu.toLocaleString('vi-VN')}</td>
              <td class="p-2.5 text-right font-mono ${isReceipt ? 'text-emerald-700' : 'text-amber-700'}">${totalTien.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  } catch (err) {
    contentEl.innerHTML = `<div class="p-6 text-center text-rose-500">Lỗi khi tải thống kê: ${err.message}</div>`;
  }
}

/**
 * 3. HỖ TRỢ IN / XUẤT BÁO CÁO
 */
function printReport() {
  window.print();
}
