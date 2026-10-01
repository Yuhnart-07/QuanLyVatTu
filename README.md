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

## 2. HƯỚNG DẪN KHỞI TẠO CƠ SỞ DỮ LIỆU
1. Mở **SQL Server Management Studio (SSMS)**.
2. Kết nối tới SQL Server instance của bạn.
3. Mở file script: [`database/init_database.sql`](file:///c:/Users/tiger/Documents/QLVT/database/init_database.sql).
4. Bấm **Execute (F5)** đúng 1 lần. Toàn bộ CSDL `QLVT` và 8 bảng sẽ được tạo tự động.
5. (Tùy chọn) Muốn nạp dữ liệu mẫu: Mở file [`database/seed/seed_data.sql`](file:///c:/Users/tiger/Documents/QLVT/database/seed/seed_data.sql) và bấm **Execute (F5)**.

---

## 3. HƯỚNG DẪN CHẠY ỨNG DỤNG
```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env
# Sửa thông tin tài khoản SQL Server trong .env

# 3. Chạy ở môi trường phát triển
npm run dev

# 4. Mở trình duyệt tại: http://localhost:3000
```
