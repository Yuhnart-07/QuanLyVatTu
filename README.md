# HỆ THỐNG QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT) - ĐỀ 2

Dự án phát triển ứng dụng quản lý vật tư theo mô hình phân tầng chuẩn **Clean MVC** với **Node.js, Express.js, EJS Template Engine** và **Microsoft SQL Server Stored Procedures**.

---

## 1. CÔNG NGHỆ SỬ DỤNG
* **Backend:** Node.js + Express.js.
* **Frontend:** EJS Template Engine + Tailwind CSS + Vanilla JS.
* **Database:** Microsoft SQL Server (100% qua Stored Procedure).
* **Bảo mật:** SQL Server Security (Logins, Users, Roles).
* **Đóng gói:** Docker & Docker Compose.

---

## 2. HƯỚNG DẪN KHỞI TẠO, CẬP NHẬT & DỮ LIỆU MẪU CSDL

Đảm bảo bạn đã cấu hình đúng thông tin kết nối SQL Server trong file `.env` trước khi thực thi.

---

### 📦 2.1. Dữ liệu mẫu (Seed Data) trong hệ thống gồm những gì?

File dữ liệu mẫu nằm tại [`database/seed/seed_data.sql`](database/seed/seed_data.sql), bao gồm dữ liệu nghiệp vụ chuẩn hóa cho cả **8 bảng**:

1. **`Nhanvien` (55 nhân viên):**
   - Mã nhân viên từ `1` đến `55`.
   - Đầy đủ thông tin: Họ, Tên, Ngày sinh, Địa chỉ (TP.HCM, Hà Nội, Đà Nẵng, Hải Phòng, Cần Thơ...), Lương cơ bản, Ghi chú chức vụ nghiệp vụ.
   - Phục vụ kiểm thử phân trang (10, 20, 50 dòng/trang) và tìm kiếm tiếng Việt.
2. **`Vattu` (6 vật tư xây dựng):**
   - `VT01`: Xi măng Hà Tiên (150 Bao)
   - `VT02`: Sắt phi 10 (800 Kg)
   - `VT03`: Gạch ống 4 lỗ (3.500 Viên)
   - `VT04`: Cát vàng xây dựng (60 M3)
   - `VT05`: Đá xanh 1x2 (45 M3)
   - `VT06`: Sơn Dulux nội thất (90 Thùng)
3. **`DatHang` (3 đơn đặt hàng):**
   - `DDH00001`, `DDH00002`, `DDH00003` liên kết với các nhà cung cấp và nhân viên phụ trách thu mua.
4. **`CTDDH` (6 dòng chi tiết đặt hàng):**
   - Chi tiết danh mục vật tư, số lượng đặt và đơn giá cho từng đơn hàng.
5. **`PhieuNhap` (3 phiếu nhập kho):**
   - `PN000001`, `PN000002`, `PN000003` tương ứng với các đơn đặt hàng đã lập.
6. **`CTPN` (6 dòng chi tiết nhập kho):**
   - Đảm bảo đúng chuẩn nghiệp vụ: số lượng nhập không vượt quá số lượng đặt trên đơn hàng.
7. **`PhieuXuat` (2 phiếu xuất kho):**
   - `PX000001`, `PX000002` xuất hàng cho các khách hàng/nhà thầu.
8. **`CTPX` (4 dòng chi tiết xuất kho):**
   - Đảm bảo đúng chuẩn nghiệp vụ: số lượng xuất không vượt quá số lượng tồn kho.

---

### 🟢 2.2. Khi đã có CSDL: Cách chạy Cập nhật (`npm run db:update`)

> **Dành cho:** Máy **ĐÃ CÓ CSDL** và đang làm việc/test dữ liệu. Thường dùng hằng ngày khi vừa `git pull` code mới về từ repository có sửa đổi hoặc thêm mới Stored Procedures, Functions, Triggers.

#### Cách chạy:
Chạy đúng 1 lệnh duy nhất tại thư mục gốc dự án:
```bash
npm run db:update
```

#### Cơ chế hoạt động:
* Tự động quét và đồng bộ các thành phần logic:
  * 📂 `database/functions/`: Tự động nạp hoặc làm mới Functions.
  * 📂 `database/procedures/`: Tự động nạp hoặc làm mới tất cả Stored Procedures.
  * 📂 `database/triggers/`: Tự động nạp hoặc làm mới Triggers.
* Tự động kiểm tra và bổ sung Roles (`Admin`, `Nhanvien`), phân quyền `EXECUTE` và Logins kiểm thử (`NV_1`, `NV_2`) nếu chưa có (`IF NOT EXISTS`).

#### ⚠️ Lưu ý quan trọng khi chạy `db:update`:
* 🛡️ **Bảo toàn dữ liệu 100%:** Lệnh này **TUYỆT ĐỐI BỎ QUA** thư mục `database/tables/` và `database/seed/`.
* **KHÔNG** xóa bảng (`DROP TABLE`), **KHÔNG** sửa bảng, **KHÔNG** xóa dữ liệu (`DELETE`). Toàn bộ nhân viên, vật tư, đơn hàng, phiếu nhập/xuất bạn tự nhập tay trước đó trên máy sẽ được giữ nguyên vẹn.
* Lệnh này **KHÔNG** tự động nạp thêm dữ liệu mẫu từ `seed_data.sql`.

---

### 🟡 2.3. Khi chưa có CSDL hoặc muốn Reset: Cách chạy Setup (`npm run db:setup`)

> **Dành cho:** Máy **CHƯA CÓ DATABASE** (mới clone dự án lần đầu), HOẶC khi bạn muốn xóa sạch dữ liệu cũ để đưa toàn bộ hệ thống về trạng thái ban đầu với đầy đủ dữ liệu mẫu chuẩn.

#### Cách chạy:
Chạy đúng 1 lệnh duy nhất:
```bash
npm run db:setup
```

#### Quy trình 8 bước tự động:
1. Kết nối SQL Server qua tài khoản `sa` / tài khoản cấu hình trong `.env`, tạo database `QLVT` nếu chưa có.
2. Xóa các bảng cũ (nếu có) và tạo mới toàn bộ 8 bảng dữ liệu ([`database/init_database.sql`](database/init_database.sql)).
3. Cấu hình Database Roles: `Admin` (quyền quản trị cao nhất) và `Nhanvien` (quyền hạn mức nghiệp vụ).
4. Tự động nạp toàn bộ Functions trong `database/functions/`.
5. Tự động nạp toàn bộ Stored Procedures trong `database/procedures/`.
6. **Tự động chạy `database/seed/seed_data.sql`:** Nạp đủ 55 nhân viên mẫu và dữ liệu mẫu của 7 bảng còn lại. *(Được nạp TRƯỚC Triggers để tránh trigger tự động tính toán làm lệch số lượng tồn kho ban đầu)*.
7. Tự động nạp toàn bộ Triggers trong `database/triggers/`.
8. Tự động tạo 2 tài khoản SQL Server Logins kiểm thử:
   * 👤 **Admin:** Username = `NV_1` | Password = `123456`
   * 👤 **Nhân viên:** Username = `NV_2` | Password = `123456`

#### ⚠️ Lưu ý quan trọng khi chạy `db:setup`:
* ⛔ **XÓA SẠCH DỮ LIỆU CŨ:** Lệnh này sẽ `DROP` lại các bảng cũ và nạp lại seed data mặc định. Nếu bạn đang có dữ liệu test quan trọng tự nhập trên máy, dữ liệu đó **sẽ bị mất**.
* Nếu bạn **chỉ muốn giữ nguyên dữ liệu hiện tại và bổ sung thêm nhân viên**, đừng chạy `db:setup`, hãy mở SSMS chạy các dòng `INSERT` nhân viên mới trong file `database/seed/seed_data.sql` (bỏ qua đoạn `DELETE`).

---

### ⚪ 2.4. Cách chạy thủ công qua SQL Server Management Studio (SSMS)

Nếu không dùng terminal Node.js, bạn có thể chạy tuần tự từng file bằng SSMS:
1. Mở file [`database/init_database.sql`](database/init_database.sql) $\rightarrow$ Nhấn **Execute (F5)** để tạo CSDL và 8 bảng.
2. Chạy lần lượt các file trong [`database/functions/`](database/functions/) (nếu có).
3. Chạy lần lượt các file trong [`database/procedures/`](database/procedures/).
4. Mở file [`database/seed/seed_data.sql`](database/seed/seed_data.sql) $\rightarrow$ Nhấn **Execute (F5)** để nạp dữ liệu mẫu.
5. Chạy lần lượt các file trong [`database/triggers/`](database/triggers/) (lưu ý: triggers phải nạp SAU seed data để không kích hoạt cập nhật tồn kho lệch số liệu ban đầu).

---

## 3. HƯỚNG DẪN CHẠY ỨNG DỤNG
```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env
# Chỉnh sửa DB_USER, DB_PASSWORD, DB_SERVER trong file .env cho khớp máy của bạn

# 3. Khởi tạo toàn bộ CSDL chỉ với 1 lệnh
npm run db:setup

# 4. Chạy server ở môi trường phát triển
npm run dev

# 5. Mở trình duyệt tại: http://localhost:3000
# Đăng nhập bằng: NV_1 (mật khẩu 123456) hoặc NV_2 (mật khẩu 123456)

# 6. Xem trang demo giao diện mẫu Design System:
# Truy cập: http://localhost:3000/preview
```

---

## 4. HƯỚNG DẪN SỬ DỤNG BASE UI & MASTER LAYOUT (DESIGN SYSTEM SAPO)

> **Dành cho:** Tất cả các thành viên phát triển module giao diện (Thành viên 1, Thành viên 2, Thành viên 3).  
> **Phong cách thiết kế:** Sapo SaaS ERP / Modern Inventory Management.  
> **Mục đích:** Hướng dẫn cách kế thừa khung giao diện chung, sử dụng các class CSS, component nút bấm, bảng dữ liệu, hộp thoại Modal, Confirm dialog và Toast thông báo để toàn bộ dự án đồng bộ 100% về mặt thẩm mỹ và trải nghiệm người dùng.

### 4.1. Tổng quan hệ thống giao diện chung

Khi bạn xây dựng một trang giao diện EJS mới (ví dụ: Phiếu nhập, Phiếu xuất, Đơn hàng, v.v.), bạn **không cần phải tự tạo thanh menu, thanh tiêu đề hay tự viết CSS từ đầu**. Hệ thống đã có sẵn:
1. **Master Layout (`main.ejs`):** Tự động bao bọc trang của bạn bằng **Sidebar xanh đen Navy bên trái** và **Topbar trắng tinh khôi bên trên**.
2. **Bộ công cụ CSS chuẩn (`style.css`):** Quy định sẵn bảng màu Sapo Blue, các kiểu nút chuẩn (Thêm, Xóa, Ghi, Phục hồi, Thoát), kiểu bảng dữ liệu, tab và thẻ lọc (filter chips).
3. **Engine JavaScript (`main.js`):** Cung cấp sẵn các hàm gọi Modal, Confirm xác nhận xóa và Toast thông báo tự động.

---

### 4.2. Mẫu khung trang chuẩn (Copy & Paste sử dụng ngay)

Dưới đây là cấu trúc khung mẫu chuẩn của một trang nghiệp vụ. Bạn chỉ cần sao chép đoạn mã này vào file `views/[module]/index.ejs` của bạn:

```html
<!-- Tiêu đề trang và Nút hành động chính -->
<div class="space-y-5">
  
  <!-- 1. HEADER TRANG: Tiêu đề + Nhóm nút Thêm / Xuất file -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-xl font-bold text-slate-800 tracking-tight">Tên Trang Nghiệp Vụ</h1>
      <p class="text-xs text-slate-500 mt-1">Mô tả ngắn gọn về chức năng của trang này</p>
    </div>

    <!-- Cụm nút hành động chuẩn -->
    <div class="flex items-center space-x-2.5">
      <button onclick="handleUndo()" class="sapo-btn btn-sapo-undo">
        <i class="fa-solid fa-rotate-left"></i>
        <span>Phục hồi (Undo)</span>
      </button>

      <button onclick="openCreateModal()" class="sapo-btn btn-sapo-primary">
        <i class="fa-solid fa-plus"></i>
        <span>Thêm mới</span>
      </button>
    </div>
  </div>

  <!-- 2. THẺ CARD CHÍNH CHỨA BẢNG DỮ LIỆU & BỘ LỌC -->
  <div class="sapo-card overflow-hidden">
    
    <!-- Thanh Tab nghiệp vụ phong cách Sapo -->
    <div class="px-5 pt-3 border-b border-slate-100">
      <div class="sapo-tabs">
        <button class="sapo-tab-item active">Tất cả</button>
        <button class="sapo-tab-item">Đang xử lý</button>
        <button class="sapo-tab-item">Đã hoàn tất</button>
      </div>
    </div>

    <!-- Thanh tìm kiếm & Filter Chip -->
    <div class="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
      <!-- Ô tìm kiếm nội bộ của trang -->
      <div class="relative w-full sm:w-80">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input 
          type="text" 
          placeholder="Tìm kiếm theo mã, tên..." 
          class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0088ff] focus:ring-1 focus:ring-[#0088ff]"
        >
      </div>

      <!-- Thẻ Filter Chip (giống mẫu Sapo) -->
      <div class="flex items-center space-x-2">
        <span class="sapo-filter-chip">
          <span>Kho: Khu A</span>
          <i class="fa-solid fa-xmark chip-close" onclick="this.parentElement.remove()"></i>
        </span>
      </div>
    </div>

    <!-- BẢNG DỮ LIỆU CHUẨN SAPO -->
    <div class="sapo-table-container">
      <table class="sapo-table">
        <thead>
          <tr>
            <th class="w-10 text-center"><input type="checkbox" class="rounded"></th>
            <th>Mã</th>
            <th>Tên</th>
            <th class="text-right">Số lượng</th>
            <th class="text-right">Đơn giá (VNĐ)</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center"><input type="checkbox" class="rounded"></td>
            <td class="sapo-cell-code">VT01</td>
            <td>
              <a href="#" class="sapo-cell-link">Xi măng Hà Tiên</a>
              <div class="text-[11px] text-slate-400">Đơn vị: Bao</div>
            </td>
            <td class="sapo-cell-amount text-blue-600">150</td>
            <td class="sapo-cell-amount">85,000</td>
            <td class="text-center space-x-1">
              <button class="sapo-btn-icon" title="Chỉnh sửa"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="sapo-btn-icon delete" title="Xóa"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Thanh phân trang chuẩn Sapo -->
    <%- include('../components/pagination') %>

  </div>

</div>
```

---

### 4.3. Bảng tra cứu bộ nút chức năng chuẩn (Buttons Reference)

Tất cả các nút bấm đều bắt đầu bằng class cơ sở `sapo-btn`, sau đó kết hợp với màu sắc tương ứng:

| Tên chức năng | Class CSS | Cấu trúc Icon & Chữ | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Thêm mới** | `sapo-btn btn-sapo-primary` | `<i class="fa-solid fa-plus"></i> <span>Thêm mới</span>` | Mở form/modal tạo mới (Màu xanh Sapo `#0088FF`). |
| **Ghi / Lưu** | `sapo-btn btn-sapo-save` | `<i class="fa-solid fa-floppy-disk"></i> <span>Ghi dữ liệu</span>` | Nút submit form lưu vào CSDL (Màu xanh lá Emerald). |
| **Xóa** | `sapo-btn btn-sapo-delete` | `<i class="fa-solid fa-trash-can"></i> <span>Xóa</span>` | Xóa bản ghi (Màu đỏ Rose, nên kết hợp Confirm dialog). |
| **Phục hồi (Undo)**| `sapo-btn btn-sapo-undo` | `<i class="fa-solid fa-rotate-left"></i> <span>Phục hồi</span>` | Hoàn tác thao tác vừa thực hiện (Màu vàng cam Amber). |
| **Thoát / Hủy** | `sapo-btn btn-sapo-cancel` | `<i class="fa-solid fa-xmark"></i> <span>Thoát</span>` | Hủy bỏ form hoặc đóng modal (Màu xám nhạt). |
| **Nút viền trắng** | `sapo-btn btn-sapo-outline` | `<i class="fa-solid fa-file-export"></i> <span>Xuất Excel</span>` | Các chức năng phụ trợ, xuất dữ liệu, in ấn. |
| **Nút icon trong bảng** | `sapo-btn-icon` | `<i class="fa-solid fa-pen-to-square"></i>` | Nút thao tác nhanh nhỏ gọn đặt tại từng dòng của bảng. |

---

### 4.4. Quy chuẩn định dạng cột trong bảng dữ liệu

Bảng dữ liệu phải đặt trong thẻ bao ngoài `<div class="sapo-card"><div class="sapo-table-container"><table class="sapo-table">...`.

| Loại dữ liệu | Class áp dụng cho thẻ `<td>` | Quy tắc hiển thị |
| :--- | :--- | :--- |
| **Mã định danh** (`MANV`, `MAVT`, `MasoDDH`...) | `class="sapo-cell-code"` | Font chữ monospace, in đậm, màu xanh Sapo. |
| **Tên / Tiêu đề liên kết** | `class="sapo-cell-link"` | Có thể click để xem SubForm hoặc chi tiết, hover có gạch chân. |
| **Số lượng & Tiền tệ** (`LUONG`, `SOLUONG`, `DONGIA`) | `class="sapo-cell-amount"` | **Bắt buộc căn lề phải** (`text-right`), font monospace, định dạng có dấu phẩy ngăn cách nghìn (`1,000,000`). |
| **Ngày tháng** | Không cần class đặc biệt | Định dạng `dd/mm/yyyy`, font rõ ràng. |
| **Cột nút Thao tác** | `class="text-center space-x-1"` | Căn giữa, chứa các nút `.sapo-btn-icon`. |

---

### 4.5. Hướng dẫn dùng hộp thoại Modal (Form Popup)

Bạn không cần tạo thẻ HTML modal mới. Chỉ cần gọi hàm JavaScript có sẵn từ `main.js`:

#### Mở Form Thêm / Sửa trong Modal:
```javascript
// Cú pháp: openModal(tiêu đề, mã_HTML_của_form, độ_rộng_tuỳ_chọn)
// Độ rộng mặc định là 'max-w-2xl', có thể truyền 'max-w-md', 'max-w-lg', 'max-w-4xl'

const formHtml = `
  <form id="myOrderForm" onsubmit="submitForm(event)" class="space-y-4">
    <div>
      <label class="block text-xs font-semibold text-slate-600 mb-1">Mã đơn hàng</label>
      <input type="text" name="masoDDH" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-[#0088ff] focus:outline-none">
    </div>
    
    <!-- Footer nút bấm trong Modal -->
    <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
      <button type="button" onclick="closeModal()" class="sapo-btn btn-sapo-cancel">Hủy</button>
      <button type="submit" class="sapo-btn btn-sapo-save">Ghi dữ liệu</button>
    </div>
  </form>
`;

openModal('Thêm Mới Đơn Đặt Hàng', formHtml, 'max-w-2xl');
```

#### Đóng Modal:
```javascript
closeModal(); // Tự động đóng modal và khôi phục cuộn trang
```

---

### 4.6. Hướng dẫn dùng hộp thoại xác nhận (Confirm Dialog)

Khi làm thao tác nguy hiểm như **Xóa nhân viên**, **Xóa vật tư**, **Hủy phiếu**, bắt buộc phải gọi hộp thoại xác nhận:

```javascript
showConfirm({
  title: 'Xác nhận xóa nhân viên?',
  message: 'Bạn có chắc chắn muốn xóa nhân viên này? Thao tác này sẽ bị từ chối nếu nhân viên đã từng lập phiếu trong hệ thống.',
  confirmText: 'Đồng ý xóa',
  confirmClass: 'btn-sapo-delete',
  onConfirm: async () => {
    // Viết code gọi API xóa ở đây
    try {
      await apiRequest(`/employees/${manv}`, 'DELETE');
      showToast('success', 'Xóa nhân viên thành công!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast('error', err.message);
    }
  }
});
```

---

### 4.7. Hướng dẫn dùng Toast thông báo tự tắt (Toast Notifications)

Không dùng hàm `alert()` mặc định của trình duyệt vì gây gián đoạn trải nghiệm người dùng. Hãy dùng hàm `showToast`:

```javascript
// 1. Thông báo thành công (Màu xanh lá)
showToast('success', 'Lập phiếu nhập kho thành công!');

// 2. Thông báo lỗi (Màu đỏ)
showToast('error', 'Số lượng xuất vượt quá số lượng tồn kho!');

// 3. Thông báo cảnh báo (Màu vàng cam)
showToast('warning', 'Vui lòng kiểm tra lại thông tin nhà cung cấp!');

// 4. Thông báo thông tin (Màu xanh dương)
showToast('info', 'Đang tải danh sách báo biểu...');
```

---

### 4.8. Hướng dẫn gọi API Backend qua tiện ích `apiRequest`

Hàm `apiRequest` đã được cài sẵn cơ chế tự động gửi `application/json`, bắt lỗi HTTP Status và tự hiển thị Toast đỏ nếu server trả mã lỗi:

```javascript
// Ví dụ 1: Lấy dữ liệu (GET)
const response = await apiRequest('/api/materials/VT01');
console.log(response.data);

// Ví dụ 2: Gửi dữ liệu tạo mới (POST)
const newOrderData = {
  masoDDH: 'DDH00001',
  nhaCC: 'Công ty Sắt Thép',
  details: [
    { mavt: 'VT01', soluong: 50, dongia: 85000 }
  ]
};

const result = await apiRequest('/orders', 'POST', newOrderData);
showToast('success', 'Đơn đặt hàng đã được lưu!');
```

---

### 4.9. Quy tắc phân quyền trên giao diện (Role-based UI)

Trên các file `.ejs`, biến `currentUser` luôn có sẵn thông tin phiên đăng nhập gồm:
- `currentUser.manv`: Mã số nhân viên.
- `currentUser.hoTen`: Họ và tên đầy đủ.
- `currentUser.role`: Quyền hạn (`Admin` hoặc `Nhanvien`).

Muốn ẩn hoặc hiện một nút bấm/chức năng chỉ dành cho Admin, bạn chỉ cần bọc điều kiện EJS:
```html
<% if (typeof currentUser !== 'undefined' && currentUser && currentUser.role === 'Admin') { %>
  <button class="sapo-btn btn-sapo-outline">Chức năng chỉ Admin thấy</button>
<% } %>
```

---
*Tài liệu này được biên soạn bởi Thành viên 1 - Trưởng nhóm UI & Design System dự án QLVT.*
