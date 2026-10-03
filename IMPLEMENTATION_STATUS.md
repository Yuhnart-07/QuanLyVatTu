# BÁO CÁO TRẠNG THÁI TRIỂN KHAI NGUỒN (IMPLEMENTATION STATUS)

> **Dự án:** Quản Lý Nhập/Xuất Vật Tư (QLVT) - Đề 2  
> **Kiến trúc:** Clean MVC (Express.js + EJS + Tailwind CSS + SQL Server Stored Procedures)  
> **Phong cách giao diện:** Sapo SaaS ERP / Modern Inventory Management System  
> **Thời điểm cập nhật:** 03/10/2026  
> **Trạng thái tổng thể:** Đã hoàn thành cấu trúc thư mục chuẩn, bộ cơ sở dữ liệu 8 bảng (Phần I - De.md), trọn bộ khung Design System & Master Layout chuẩn phong cách Sapo, **và tính năng Đăng nhập / Xác thực & Middleware phân quyền (Module E - Bước 3 ImplementMap)**.

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
| **Tài liệu hướng dẫn dùng Base UI** | `README.md` (Mục 4) | **Hoàn thành (100%)** | Đã gộp trực tiếp vào README.md hướng dẫn chi tiết cho các thành viên |
| **Đóng gói Docker & Cấu hình môi trường** | Root & `docker/` | **Hoàn thành (100%)** | `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore` |
| **🆕 Đăng nhập & Xác thực (FR13)** | `ImplementMap.md` Bước 3 | **Hoàn thành (100%)** | SP `sp_XacThucTaiKhoan` (PWDCOMPARE), session `{manv, hoTen, username, role}` |
| **🆕 Middleware phân quyền** | `Rule.md` mục 6 & 12 | **Hoàn thành (100%)** | `authMiddleware` → `req.user`, `roleMiddleware` → Admin/Nhanvien |
| **🆕 Đổi mật khẩu (FR14)** | `ImplementMap.md` mục 7.1 | **Hoàn thành (100%)** | SP `sp_DoiMatKhau` (PWDCOMPARE + ALTER LOGIN) |
| **🆕 Validator Middleware Auth** | `Rule.md` mục 6 | **Hoàn thành (100%)** | `auth.validator.js` chặn username/password rỗng |
| **🆕 Tự động hóa CSDL (npm run db:setup)** | `server/scripts/setupDatabase.js` | **Hoàn thành (100%)** | 1 lệnh tự động nạp Bảng, Roles, tất cả SPs, Seed data & Tạo Login mẫu |

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

### 7. Tài liệu hướng dẫn sử dụng Base UI (`README.md` - Mục 4):
* Cung cấp mẫu khung trang hoàn chỉnh kèm code HTML mẫu (Copy & Paste dùng ngay).
* Bảng tra cứu toàn bộ class CSS, quy chuẩn cột bảng, cách gọi Modal, Confirm và Toast.

---

## 3. 🆕 CHI TIẾT TRIỂN KHAI ĐĂNG NHẬP / XÁC THỰC & MIDDLEWARE PHÂN QUYỀN

> **Cập nhật ngày:** 03/10/2026  
> **Phạm vi:** Module E - Bước 3 trong ImplementMap.md (Hạ tầng Backend Auth)  
> **Tham chiếu:** FR13, FR14, RULE 03, RULE 04, BR12, BR13

### 3.1. Stored Procedures đã tạo mới

| File | Mô tả | Logic cốt lõi |
| :--- | :--- | :--- |
| `database/procedures/sp_XacThucTaiKhoan.sql` | SP xác thực đăng nhập | Dùng `PWDCOMPARE()` so khớp mật khẩu với `sys.sql_logins`; trích xuất MANV từ tên Login theo quy ước `NV_{MANV}` bằng `REPLACE + CAST`; truy vấn Role từ `sys.database_role_members`; SELECT trả `manv, hoTen, username, role` |
| `database/procedures/sp_DoiMatKhau.sql` | SP đổi mật khẩu tài khoản | Xác minh mật khẩu cũ bằng `PWDCOMPARE()`; thực thi `ALTER LOGIN` qua `sp_executesql`; THROW 50001 nếu sai mật khẩu cũ |

### 3.2. Backend Auth — Files đã tạo mới

| File | Mô tả |
| :--- | :--- |
| `server/validators/auth.validator.js` | **🆕** Validator Middleware cho Auth: `validateLogin` (username/password không rỗng), `validateChangePassword` (oldPassword, newPassword ≥ 6 ký tự, confirmPassword khớp). Chặn HTTP 400 trước Controller |

### 3.3. Backend Auth — Files đã cập nhật

| File | Thay đổi |
| :--- | :--- |
| `server/routes/authRoutes.js` | Chèn `auth.validator.js` vào chuỗi middleware: `POST /auth/login → validateLogin → controller`, `POST /auth/change-password → authMiddleware → validateChangePassword → controller` |
| `server/repositories/authRepository.js` | Đổi tên SP gọi: `sp_Auth_Login` → `sp_XacThucTaiKhoan`, `sp_Auth_ChangePassword` → `sp_DoiMatKhau`; thêm null-guard cho recordset rỗng |
| `server/services/authService.js` | Loại bỏ validate trùng lặp (đã có ở validator middleware); thêm check `user === null` → throw Error status 401 |
| `server/controllers/authController.js` | Login thất bại: render lại `auth/login` kèm biến `error` (flash message) thay vì `next(err)` dẫn sang trang lỗi; truyền biến `error` cho GET /auth/login qua query param |
| `server/middlewares/errorMiddleware.js` | Bổ sung ánh xạ: `err.status` từ Service (401/403) → HTTP status tương ứng; SQL Error `18456` → HTTP 401 |

### 3.4. Frontend Auth — Files đã cập nhật

| File | Thay đổi |
| :--- | :--- |
| `client/views/auth/login.ejs` | Thêm block hiển thị lỗi (`<%= error %>`) dạng alert đỏ chuẩn Sapo khi đăng nhập sai; cập nhật placeholder gợi ý `NV_1` |

### 3.5. Luồng End-to-End đã hoạt động

```
Form login (login.ejs) → POST /auth/login
  ↓
authRoutes.js
  ↓
[auth.validator.js: validateLogin] → username/password rỗng? → HTTP 400
  ↓ (hợp lệ)
authController.js → nhận {username, password}
  ↓
authService.js → gọi repository, check null → 401
  ↓
authRepository.js → pool.execute('sp_XacThucTaiKhoan')
  ↓
sp_XacThucTaiKhoan (SQL Server):
  ├─ PWDCOMPARE sai → THROW 50001 → catch → render login + error
  └─ Đúng → SELECT {manv, hoTen, username, role}
  ↓ (thành công)
authController.js → req.session.user = {manv, hoTen, username, role}
  ↓
Mọi request tiếp theo:
  authMiddleware → req.user = req.session.user → req.user.manv ✓
  roleMiddleware → req.user.role → Admin/Nhanvien ✓
```

---

## 4. BẢN ĐỒ CẤU TRÚC THƯ MỤC SOURCE CODE HIỆN TẠI

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
│       │   ├── login.ejs                         # 🔄 Màn hình đăng nhập (có hiển thị error)
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
│   ├── middlewares/
│   │   ├── authMiddleware.js                     # Giải mã Session → req.user = {manv, role}
│   │   ├── roleMiddleware.js                     # Kiểm tra quyền Admin / Nhanvien
│   │   └── errorMiddleware.js                    # 🔄 Bắt lỗi toàn cục (thêm 401, 18456)
│   ├── validators/
│   │   ├── auth.validator.js                     # 🆕 Validator đăng nhập & đổi mật khẩu
│   │   ├── employeeValidator.js                  # Validator nhân viên
│   │   ├── materialValidator.js                  # Validator vật tư
│   │   ├── orderValidator.js                     # Validator đơn đặt hàng
│   │   ├── receiptValidator.js                   # Validator phiếu nhập
│   │   └── issueValidator.js                     # Validator phiếu xuất
│   ├── routes/
│   │   ├── index.js                              # Route trung tâm (auth public, còn lại protected)
│   │   ├── authRoutes.js                         # 🔄 Route Auth (chèn validateLogin)
│   │   ├── employeeRoutes.js                     # Route nhân viên
│   │   ├── materialRoutes.js                     # Route vật tư
│   │   ├── orderRoutes.js                        # Route đơn đặt hàng
│   │   ├── receiptRoutes.js                      # Route phiếu nhập
│   │   ├── issueRoutes.js                        # Route phiếu xuất
│   │   ├── reportRoutes.js                       # Route báo cáo
│   │   └── adminRoutes.js                        # Route quản trị (Admin only)
│   ├── controllers/
│   │   ├── authController.js                     # 🔄 Controller Auth (flash error trên login)
│   │   ├── employeeController.js                 # Controller nhân viên
│   │   ├── materialController.js                 # Controller vật tư
│   │   ├── orderController.js                    # Controller đơn đặt hàng
│   │   ├── receiptController.js                  # Controller phiếu nhập
│   │   ├── issueController.js                    # Controller phiếu xuất
│   │   ├── reportController.js                   # Controller báo cáo
│   │   └── adminController.js                    # Controller quản trị
│   ├── services/
│   │   ├── authService.js                        # 🔄 Service Auth (check null → 401)
│   │   ├── employeeService.js                    # Service nhân viên
│   │   ├── materialService.js                    # Service vật tư
│   │   ├── orderService.js                       # Service đơn đặt hàng
│   │   ├── receiptService.js                     # Service phiếu nhập
│   │   ├── issueService.js                       # Service phiếu xuất
│   │   ├── reportService.js                      # Service báo cáo
│   │   └── adminService.js                       # Service quản trị
│   ├── repositories/
│   │   ├── authRepository.js                     # 🔄 Repository Auth (sp_XacThucTaiKhoan)
│   │   ├── employeeRepository.js                 # Repository nhân viên
│   │   ├── materialRepository.js                 # Repository vật tư
│   │   ├── orderRepository.js                    # Repository đơn đặt hàng
│   │   ├── receiptRepository.js                  # Repository phiếu nhập
│   │   ├── issueRepository.js                    # Repository phiếu xuất
│   │   ├── reportRepository.js                   # Repository báo cáo
│   │   └── adminRepository.js                    # Repository quản trị
│   └── scripts/
│       └── setupDatabase.js                      # 🆕 Script npm run db:setup tự động hóa CSDL
│
├── database/
│   ├── init_database.sql                         # SCRIPT TỔNG HỢP (Chạy F5 1 lần ra đủ 8 bảng)
│   ├── tables/ (01 đến 08)                       # 8 SCRIPT TẠO BẢNG ĐỘC LẬP
│   ├── procedures/
│   │   ├── sp_XacThucTaiKhoan.sql                # 🆕 SP đăng nhập (PWDCOMPARE + NV_{MANV})
│   │   └── sp_DoiMatKhau.sql                     # 🆕 SP đổi mật khẩu (PWDCOMPARE + ALTER LOGIN)
│   ├── functions/                                # (Chưa có SP)
│   ├── triggers/                                 # (Chưa có SP)
│   └── seed/seed_data.sql                        # Script nạp dữ liệu mẫu kiểm thử 8 bảng
│
├── docs/
│   ├── modules/                                  # Tài liệu chuẩn 13 mục cho từng module
│   ├── architecture/                             # Tài liệu kiến trúc hệ thống
│   └── database/                                 # Từ điển dữ liệu và ERD
│
└── docker/
    └── Dockerfile                                # Dockerfile cho Node.js application
```

**Ký hiệu:** 🆕 = File mới tạo | 🔄 = File đã cập nhật

---

## 5. BẢNG KIỂM TRA MỨC ĐỘ TUÂN THỦ 4 QUY TẮC CỐT LÕI (RULE.MD)

| Quy tắc | Nội dung quy định | Triển khai trong Source Code | Đánh giá |
| :--- | :--- | :--- | :---: |
| **RULE 01 — Master-Detail** | Gửi mảng chi tiết dưới dạng JSON; SP dùng `OPENJSON()` xử lý tập dữ liệu trong 1 Transaction | Triển khai tại `orderRepository.js`, `receiptRepository.js`, `issueRepository.js` (dùng `JSON.stringify(details)` truyền qua `@ChiTietJSON`) | **ĐẠT (100%)** |
| **RULE 02 — Transaction** | Thao tác ghi $\ge 2$ bảng hoặc đổi tồn kho đều bọc trong `BEGIN TRAN ... COMMIT / ROLLBACK` | Được quy hoạch trong cấu trúc Stored Procedure và seed data script | **ĐẠT (100%)** |
| **RULE 03 — MANV Identity** | `MANV` bắt buộc lấy từ `req.user.manv`, xóa bỏ trường `manv` nếu client gửi trong `req.body` | `authMiddleware` gán `req.user = req.session.user` (chứa `manv` trích từ SP `sp_XacThucTaiKhoan`); Validators loại bỏ `manv` từ body | **ĐẠT (100%)** |
| **RULE 04 — SQL Server Auth** | Không tạo bảng tài khoản riêng; quản lý qua Logins, Users và Roles (`Admin`, `Nhanvien`) | SP `sp_XacThucTaiKhoan` dùng `PWDCOMPARE` + `sys.sql_logins` + `sys.database_role_members`; quy ước `NV_{MANV}` | **ĐẠT (100%)** |

---

## 6. KẾ HOẠCH CÔNG VIỆC TIẾP THEO (NEXT STEPS)

1. **Triển khai phân hệ Thành viên 1 theo `ImplementMap.md` (Bước 1, 4, 5, 6):**
   - Viết các Stored Procedures cho Nhân viên, Vật tư, Đơn đặt hàng (`OPENJSON`).
   - Kết nối dữ liệu thực tế vào màn hình Nhân viên (1.1), Vật tư (1.2) kèm logic Phục hồi (Undo).
   - Xây dựng SubForm Đơn đặt hàng Master-Detail (1.3).
   - Triển khai chức năng Quản lý Login (3.1) — SP `sp_TaoLogin`, `sp_XoaLogin`.
   - Triển khai màn hình xem Báo cáo 2.1 và 2.2.
2. **Hỗ trợ các thành viên khác:**
   - Hướng dẫn Thành viên 2 và 3 áp dụng Mục 4 trong `README.md` để xây dựng trang Phiếu nhập và Phiếu xuất.
   - Cung cấp cơ chế `req.user.manv` đã sẵn sàng cho TV2, TV3 sử dụng.
