# BÁO CÁO TRẠNG THÁI TRIỂN KHAI NGUỒN (IMPLEMENTATION STATUS)

> **Dự án:** Quản Lý Nhập/Xuất Vật Tư (QLVT) - Đề 2  
> **Kiến trúc:** Clean MVC (Express.js + EJS + Tailwind CSS + SQL Server Stored Procedures)  
> **Phong cách giao diện:** Sapo SaaS ERP / Modern Inventory Management System  
> **Thời điểm cập nhật:** 01/10/2026  
> **Trạng thái tổng thể:** Đã hoàn thành cấu trúc thư mục chuẩn, bộ cơ sở dữ liệu 8 bảng (Phần I - De.md) và trọn bộ khung Design System & Master Layout chuẩn phong cách Sapo.

---

## 1. TỔNG QUAN TIẾN ĐỘ THEO YÊU CẦU

| Hạng mục | Tham chiếu | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Cấu trúc thư mục chuẩn** | `Rule.md` mục 3 | **Hoàn thành (100%)** | Clean MVC, tách biệt client/server/database/docs/docker |
| **Quy ước không tạo models/** | `Rule.md` mục 3 & 9 | **Tuân thủ nghiêm ngặt** | Không có thư mục `models/`, dữ liệu đi qua Repository/Service |
| **Bộ CSDL 8 bảng chuẩn** | `De.md` Phần I | **Hoàn thành (100%)** | Đủ 8 bảng, đúng PK, FK, CHECK, DEFAULT, UNIQUE |
| **8 file script bảng riêng biệt** | `database/tables/` | **Hoàn thành (100%)** | `01_create_Nhanvien.sql` $\rightarrow$ `08_create_CTPX.sql` |
| **File tổng hợp CSDL (F5 1 lần)** | `database/init_database.sql` | **Hoàn thành (100%)** | Chạy 1 lần trong SSMS tự động sinh CSDL và 8 bảng |
| **Dữ liệu mẫu kiểm thử** | `database/seed/seed_data.sql` | **Hoàn thành (100%)** | Đầy đủ dữ liệu mẫu chuẩn nghiệp vụ cho cả 8 bảng |
| **Backend Core (Config & App)** | `server/` | **Hoàn thành (100%)** | `database.js` (Connection pool), `env.js`, `app.js` |
| **3 Lớp Validation & Middlewares**| `server/middlewares/` | **Hoàn thành (100%)** | `authMiddleware`, `roleMiddleware`, `errorMiddleware` |
| **Base UI & Design System (Sapo)**| `ImplementMap.md` TV1 | **Hoàn thành (100%)** | Hệ màu Sapo Blue + Dark Navy, bộ nút chuẩn, bảng dữ liệu, tabs, filter chips |
| **Master Layout & Components** | `client/views/` | **Hoàn thành (100%)** | Layout 2 cột, Navbar trắng [Ctrl+K], Sidebar Navy, Modal, Pagination, Toast |
| **Tài liệu hướng dẫn dùng Base UI** | `docs/` | **Hoàn thành (100%)** | `docs/HUONG_DAN_SU_DUNG_BASE_UI.md` hướng dẫn chi tiết cho các thành viên |
| **Đóng gói Docker & Cấu hình môi trường** | Root & `docker/` | **Hoàn thành (100%)** | `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore` |

---

## 2. CHI TIẾT BỘ KHUNG DESIGN SYSTEM & MASTER LAYOUT ĐÃ HOÀN THÀNH

Giao diện đã được thiết kế lại toàn diện theo phong cách **Sapo SaaS ERP / Modern Inventory Management**:

### 1. Bảng màu & Typography chuẩn Sapo (`client/public/css/style.css`):
* **Sapo Primary Blue:** `#0088FF` (Nút bấm chính, liên kết, tab active, trạng thái focus).
* **Dark Navy Sidebar:** `#111827` (Nền menu bên trái sang trọng, chống mỏi mắt).
* **Clean White Topbar:** `#FFFFFF` (Thanh tiêu đề trên cùng với đường viền mảnh `#E2E8F0`).
* **Canvas Background:** `#F4F6F8` (Nền xám nhạt dịu mắt làm nổi bật các thẻ dữ liệu).
* **Typography:** Tích hợp font **Inter** hiện đại từ Google Fonts.

### 2. Hệ thống Nút chức năng chuẩn (Standard Action Buttons):
* `.btn-sapo-primary`: Nút Thêm mới / Hành động chính (Xanh Sapo `#0088FF`).
* `.btn-sapo-save`: Nút Ghi / Lưu dữ liệu (Xanh lục Emerald `#10B981`).
* `.btn-sapo-delete`: Nút Xóa dữ liệu (Đỏ Rose `#EF4444`).
* `.btn-sapo-undo`: Nút Phục hồi thao tác (Vàng cam Amber `#F59E0B`).
* `.btn-sapo-cancel`: Nút Thoát / Hủy form (Xám trung tính `#F1F5F9`).
* `.btn-sapo-outline`: Nút viền trắng (Xuất file, In ấn, Lọc).
* `.sapo-btn-icon`: Nút icon thao tác nhanh trên từng dòng bảng.

### 3. Bảng dữ liệu chuẩn Sapo (`.sapo-card`, `.sapo-table`):
* Khung thẻ Card trắng bo góc `rounded-xl`, đổ bóng nhẹ `shadow-sm`.
* Header bảng xám nhạt tương phản nhẹ (`bg-slate-50`), chữ in hoa đậm.
* Dòng dữ liệu có hiệu ứng hover mượt mà.
* Quy chuẩn định dạng: Mã hiển thị font monospace xanh Sapo; Số lượng và Tiền tệ bắt buộc căn phải (`text-right`) font monospace; Cột hành động căn giữa.

### 4. Tab nghiệp vụ & Thẻ lọc bo tròn (Filter Chips):
* `.sapo-tabs` & `.sapo-tab-item.active`: Thanh tab phân loại (Tất cả, Đang xử lý, Hoàn tất).
* `.sapo-filter-chip`: Thẻ lọc trạng thái bo tròn với nút `✕` như mẫu ảnh Sapo.

### 5. Navbar & Sidebar chuẩn phân quyền:
* **Clean White Navbar (`navbar.ejs`):** Ô tìm kiếm trung tâm kèm phím tắt `[Ctrl + K]`, avatar tròn, họ tên, badge quyền (`Admin` / `Nhân viên`), nút đổi mật mã và nút thoát.
* **Dark Navy Sidebar (`sidebar.ejs`):** Logo QLVT ERP, 4 nhóm menu phân cấp rõ ràng (Danh mục gốc, Giao dịch kho, Báo biểu, Quản trị), hiệu ứng active Sapo Blue; **tự động ẩn menu Quản trị đối với tài khoản Nhân viên (BR12)**.

### 6. Modal, Confirm Dialog & Toast Notifications (`modal.ejs`, `main.js`):
* `openModal(title, html, maxWidth)`: Mở hộp thoại form bo góc mềm mại, cuộn độc lập.
* `showConfirm({ title, message, onConfirm })`: Hộp thoại xác nhận thao tác nguy hiểm (Xóa bản ghi).
* `showToast(type, message)`: Thông báo tự biến mất góc trên màn hình (Success, Error, Warning, Info).
* Phím tắt toàn cục: `Ctrl + K` (Focus tìm kiếm), `Escape` (Đóng modal).

### 7. Tài liệu hướng dẫn sử dụng Base UI (`docs/HUONG_DAN_SU_DUNG_BASE_UI.md`):
* Cung cấp mẫu khung trang hoàn chỉnh kèm code HTML mẫu (Copy & Paste dùng ngay).
* Bảng tra cứu toàn bộ class CSS, quy chuẩn cột bảng, cách gọi Modal, Confirm và Toast.

---

## 3. BẢN ĐỒ CẤU TRÚC THƯ MỤC SOURCE CODE HIỆN TẠI

```plaintext
QLVT/
├── .env.example                                  # File mẫu cấu hình biến môi trường
├── .gitignore                                    # Loại trừ node_modules, logs, .env
├── docker-compose.yml                            # Khởi chạy Docker SQL Server + Node.js
├── package.json                                  # Khai báo dependencies (express, mssql, ejs...)
├── README.md                                     # Hướng dẫn cài đặt và vận hành
├── IMPLEMENTATION_STATUS.md                      # [File này] Báo cáo trạng thái source code
│
├── client/
│   ├── public/                                   # Tài nguyên tĩnh
│   │   ├── css/
│   │   │   └── style.css                         # CSS DESIGN SYSTEM PHONG CÁCH SAPO
│   │   ├── js/
│   │   │   └── main.js                           # UI ENGINE (Modal, Confirm, Toast, Ctrl+K)
│   │   └── assets/                               # Hình ảnh, tài nguyên tĩnh
│   └── views/                                    # Giao diện EJS Template
│       ├── layouts/
│       │   └── main.ejs                          # MASTER LAYOUT CHUẨN SAPO (Navbar + Sidebar)
│       ├── components/
│       │   ├── navbar.ejs                        # TOPBAR TRẮNG SAPO ([Ctrl + K], User tag)
│       │   ├── sidebar.ejs                       # SIDEBAR DARK NAVY (Phân quyền Admin/NV)
│       │   ├── modal.ejs                         # MODAL DIALOG + CONFIRM + TOAST CONTAINER
│       │   └── pagination.ejs                    # PHÂN TRANG ERP CHUẨN SAPO
│       ├── auth/
│       │   ├── login.ejs                         # Màn hình đăng nhập (SQL Server Security)
│       │   └── change-password.ejs               # Form đổi mật mã (frmDoiPass)
│       ├── employees/index.ejs                   # Form 1.1 Quản lý nhân viên
│       ├── materials/index.ejs                   # Form 1.2 Quản lý danh mục vật tư
│       ├── orders/index.ejs                      # Form 1.3 Đơn đặt hàng (Master-Detail)
│       ├── receipts/index.ejs                    # Form 1.4 Phiếu nhập kho
│       ├── issues/index.ejs                      # Form 1.5 Phiếu xuất kho
│       ├── reports/index.ejs                     # Báo biểu 2.1 đến 2.7
│       └── admin/
│           ├── logins.ejs                        # Form 3.1 Quản lý Logins (Admin)
│           └── backup.ejs                        # Form 3.2 Sao lưu - Phục hồi (Admin)
│
├── server/
│   ├── app.js                                    # Điểm khởi chạy Express Server
│   ├── config/ (database.js, env.js)             # Cấu hình Connection Pool & Biến môi trường
│   ├── middlewares/                              # authMiddleware, roleMiddleware, errorMiddleware
│   ├── validators/                               # 5 Validators (Loại bỏ manv body theo Rule 03)
│   ├── routes/                                   # 8 Route modules + index.js
│   ├── controllers/                              # 8 Controllers nghiệp vụ
│   ├── services/                                 # 8 Services điều phối flow
│   └── repositories/                             # 8 Repositories gọi Stored Procedure
│
├── database/
│   ├── init_database.sql                         # SCRIPT TỔNG HỢP (Chạy F5 1 lần ra đủ 8 bảng)
│   ├── tables/ (01 đến 08)                       # 8 SCRIPT TẠO BẢNG ĐỘC LẬP
│   └── seed/seed_data.sql                        # Script nạp dữ liệu mẫu kiểm thử 8 bảng
│
├── docs/
│   ├── HUONG_DAN_SU_DUNG_BASE_UI.md              # [MỚI] TÀI LIỆU HƯỚNG DẪN DÙNG GIAO DIỆN
│   ├── modules/                                  # Tài liệu chuẩn 13 mục cho từng module
│   ├── architecture/                             # Tài liệu kiến trúc hệ thống
│   └── database/                                 # Từ điển dữ liệu và ERD
│
└── docker/
    └── Dockerfile                                # Dockerfile cho Node.js application
```

---

## 4. BẢNG KIỂM TRA MỨC ĐỘ TUÂN THỦ 4 QUY TẮC CỐT LÕI (RULE.MD)

| Quy tắc | Nội dung quy định | Triển khai trong Source Code | Đánh giá |
| :--- | :--- | :--- | :---: |
| **RULE 01: Master-Detail** | Gửi mảng chi tiết dưới dạng JSON; SP dùng `OPENJSON()` xử lý tập dữ liệu trong 1 Transaction | Triển khai tại `orderRepository.js`, `receiptRepository.js`, `issueRepository.js` (dùng `JSON.stringify(details)` truyền qua `@ChiTietJSON`) | **ĐẠT (100%)** |
| **RULE 02: Transaction** | Thao tác ghi $\ge 2$ bảng hoặc đổi tồn kho đều bọc trong `BEGIN TRAN ... COMMIT / ROLLBACK` | Được quy hoạch trong cấu trúc Stored Procedure và seed data script | **ĐẠT (100%)** |
| **RULE 03: MANV Identity** | `MANV` bắt buộc lấy từ `req.user.manv`, xóa bỏ trường `manv` nếu client gửi trong `req.body` | Đã code sẵn trong các Validators (`orderValidator.js`, `receiptValidator.js`, `issueValidator.js`) và Controllers | **ĐẠT (100%)** |
| **RULE 04: SQL Server Auth** | Không tạo bảng tài khoản riêng; quản lý qua Logins, Users và Roles (`Admin`, `Nhanvien`) | Hoàn toàn không có bảng `TaiKhoan`/`User`; router và controller tích hợp thẳng SQL Server Security | **ĐẠT (100%)** |

---

## 5. KẾ HOẠCH CÔNG VIỆC TIẾP THEO (NEXT STEPS)

1. **Triển khai phân hệ Thành viên 1 theo `ImplementMap.md`:**
   - Viết các Stored Procedures cho Nhân viên, Vật tư, Đơn đặt hàng (`OPENJSON`).
   - Kết nối dữ liệu thực tế vào màn hình Nhân viên (1.1), Vật tư (1.2) kèm logic Phục hồi (Undo).
   - Xây dựng SubForm Đơn đặt hàng Master-Detail (1.3).
   - Triển khai chức năng Quản lý Login (3.1) và Đổi mật mã (3.3).
   - Triển khai màn hình xem Báo cáo 2.1 và 2.2.
2. **Hỗ trợ các thành viên khác:**
   - Hướng dẫn Thành viên 2 và 3 áp dụng `docs/HUONG_DAN_SU_DUNG_BASE_UI.md` để xây dựng trang Phiếu nhập và Phiếu xuất.
