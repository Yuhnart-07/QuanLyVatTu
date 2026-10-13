# TECHNOLOGY PROFILE — HỆ THỐNG QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)

> **Status:** Active Technology Binding  
> **Target System:** Node.js, Express, EJS & Microsoft SQL Server Stored Procedures  
> **Version:** 2.1.0 (Standardized 3-Member Team Framework)  

---

## 1. Stack Overview

Tài liệu này định nghĩa các công nghệ và thư viện cụ thể được sử dụng để hiện thực hóa các nguyên tắc kiến trúc trong [01-SYSTEM_RULES.md](01-SYSTEM_RULES.md).

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION / UI: EJS Template Engine + Tailwind CSS + Vanilla JS     │
│ (Master Layout: main.ejs, Sapo Blue Design System, Font Inter)         │
├────────────────────────────────────────────────────────────────────────┤
│ ROUTER & MIDDLEWARE: Express.js (v4.x) + Custom Middlewares            │
│ (authMiddleware, roleMiddleware, validatorMiddleware, errorMiddleware) │
├────────────────────────────────────────────────────────────────────────┤
│ APPLICATION / BUSINESS: Node.js (v18+) Service Layer                   │
├────────────────────────────────────────────────────────────────────────┤
│ DATA ACCESS: mssql (v10.x / Tedious Driver) Connection Pool            │
│ (Repository Layer: JSON Serialization & SP Request Execution)          │
├────────────────────────────────────────────────────────────────────────┤
│ DATABASE ENGINE: Microsoft SQL Server 2019 / 2022                      │
│ (8 Tables, 100% Stored Procedures, OPENJSON, Transactions)             │
├────────────────────────────────────────────────────────────────────────┤
│ DEPLOYMENT & CONTAINER: Docker & Docker Compose                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Mapping to Architecture Layers

| Tầng Kiến trúc (`SYSTEM_RULES`) | Công nghệ Lựa chọn | Thư viện / Package cụ thể | Ghi chú & Trách nhiệm |
| :--- | :--- | :--- | :--- |
| **Presentation (View)** | EJS Template Engine | `ejs` | Render server-side template, kế thừa `client/views/layouts/main.ejs` |
| **Styling & Design System** | Tailwind CSS + CSS thuần | Tailwind CDN / Static CSS | Phong cách Sapo ERP, đồng bộ bảng màu và component |
| **Client-side Scripting** | Vanilla JavaScript | Native Fetch API | Xử lý sự kiện DOM, modal popup, client validation (Lớp 1) |
| **Web Server & Routing** | Express.js | `express` | Quản lý Router, Router Groups, Middlewares cắt ngang |
| **Authentication & Session**| Express Session / Cookie | `express-session` / `cookie-parser`| Lưu giữ định danh `{ manv, hoTen, username, role }` sau đăng nhập |
| **Input Validation** | Custom Validation Middleware| `server/validators/*.js` | Kiểm tra Lớp 2, chặn mã HTTP 400 Bad Request |
| **Database Driver** | Microsoft SQL Server Driver | `mssql` | Tạo Connection Pool tĩnh tái sử dụng, thực thi SP |
| **Database Engine** | MS SQL Server | `MSSQL 2019 / 2022` | Quản lý 8 bảng, Transaction, Stored Procedures, PWDCOMPARE |
| **Container & Chạy ứng dụng** | Docker Compose | `docker-compose.yml` | Đóng gói môi trường Database SQL Server và Web Node.js |

---

## 3. Quy Chuẩn Đặt Tên & Cấu Trúc Mã Nguồn (Coding Conventions)

### 3.1. Quy chuẩn Backend (JavaScript / Node.js)
* **File & Thư mục:** Đặt theo kiểu `camelCase` (ví dụ: `receiptController.js`, `orderRoutes.js`).
* **Hàm & Biến:** Đặt theo kiểu `camelCase` (ví dụ: `getAllReceipts`, `mapn`, `masoDDH`, `details`).
* **Hằng số:** Đặt theo kiểu `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_PAGE_SIZE`, `ROLE_ADMIN`).
* **Lấy định danh nhân viên:** Luôn lấy từ `req.user.manv`, nghiêm cấm lấy từ `req.body.manv`.

### 3.2. Quy chuẩn Cơ sở dữ liệu (T-SQL / SQL Server)
* **Tên bảng:** Đặt theo đúng đề bài, PascalCase/chữ hoa chữ thường nguyên bản: `Nhanvien`, `Vattu`, `DatHang`, `CTDDH`, `PhieuNhap`, `CTPN`, `PhieuXuat`, `CTPX`.
* **Tên cột:** Đặt đúng theo đề: `MANV`, `MAVT`, `MasoDDH`, `MAPN`, `MAPX`, `SOLUONG`, `DONGIA`, `Soluongton`.
* **Stored Procedure:** Bắt đầu bằng tiền tố `sp_` kết hợp Tên Module và Hành động (ví dụ: `sp_PhieuNhap_Create`, `sp_Report_DDHChuaHoanTat`).

---

## 4. Chuẩn Hóa Xử Lý Dữ Liệu Master-Detail (RULE 01)

Nhằm tối ưu hiệu năng và đảm bảo tính toàn vẹn, các nghiệp vụ Master-Detail tuân thủ mẫu tuần tự hóa JSON sau:

### 4.1. Tại Tầng Repository (Node.js):
```javascript
// Ép mảng detail thành chuỗi JSON duy nhất
const detailJson = JSON.stringify(details);

await pool.request()
  .input('MAPN', sql.NChar(8), mapn)
  .input('MasoDDH', sql.NVarChar(8), masoDDH)
  .input('MANV', sql.Int, manv)
  .input('ChiTietJSON', sql.NVarChar(sql.MAX), detailJson)
  .execute('sp_PhieuNhap_Create');
```

### 4.2. Tại Stored Procedure (SQL Server):
```sql
-- Dùng OPENJSON bung dữ liệu mảng và kiểm tra trong Transaction
INSERT INTO dbo.CTPN (MAPN, MAVT, SOLUONG, DONGIA)
SELECT @MAPN, mavt, soluong, dongia
FROM OPENJSON(@ChiTietJSON)
WITH (
    mavt NCHAR(4) '$.mavt',
    soluong INT   '$.soluong',
    dongia FLOAT  '$.dongia'
);
```

---

## 5. Ánh Xạ Mã Lỗi Hệ Thống & HTTP Status Code

Khi Stored Procedure ném ngoại lệ nghiệp vụ qua lệnh `THROW 50001, N'Nội dung lỗi...', 1;`, Node.js bắt tại khối `catch` và phản hồi chuẩn hóa theo bảng mã sau:

| Trường hợp lỗi | Mã HTTP Status | Error Code chuẩn | Phản hồi JSON |
| :--- | :--- | :--- | :--- |
| Thiếu trường bắt buộc / Số lượng $\le 0$ / Sai định dạng | **400 Bad Request** | `VALIDATION_FAILED` | `{ "success": false, "errorCode": "INVALID_SOLUONG", "message": "..." }` |
| Chưa đăng nhập hoặc Session hết hạn | **401 Unauthorized** | `UNAUTHORIZED` | `{ "success": false, "message": "Vui lòng đăng nhập hệ thống." }` |
| Nhân viên cố tình vào trang Admin | **403 Forbidden** | `FORBIDDEN` | `{ "success": false, "message": "Bạn không có quyền thực hiện." }` |
| Không tìm thấy đơn hàng / vật tư | **404 Not Found** | `NOT_FOUND` | `{ "success": false, "message": "Tài nguyên yêu cầu không tồn tại." }` |
| Trùng mã chứng từ (PK) | **409 Conflict** | `DUPLICATE_KEY` | `{ "success": false, "message": "Mã phiếu đã tồn tại trong hệ thống." }` |
| Vi phạm hạn mức nhập / Xuất vượt tồn | **400 / 409** | `BUSINESS_RULE_VIOLATION` | `{ "success": false, "message": "Số lượng nhập vượt quá số lượng đặt còn lại." }` |
| Lỗi CSDL / Crash hệ thống server | **500 Internal Error** | `SERVER_ERROR` | `{ "success": false, "message": "Lỗi hệ thống máy chủ CSDL." }` |

---

## 6. Tiêu Chuẩn Kết Nối CSDL (Database Pool Standard)

File cấu hình trung tâm: [`server/config/database.js`](file:///d:/QuanLyVatTu/server/config/database.js)

* Sử dụng Singleton Pattern cho đối tượng Connection Pool, khởi tạo 1 lần duy nhất khi ứng dụng khởi động.
* Cấu hình pool:
  * `max`: 10 kết nối đồng thời.
  * `min`: 0.
  * `idleTimeoutMillis`: 30000ms.
* Tuyệt đối không gọi `pool.close()` sau mỗi request nghiệp vụ để tránh làm nghẽn cổ chai tài nguyên kết nối của hệ thống.
