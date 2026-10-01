# BỘ QUY TẮC KIẾN TRÚC VÀ THỎA THUẬN KỸ THUẬT DỰ ÁN QLVT

---

## 1. Công nghệ sử dụng

* **Frontend:** EJS Template Engine + CSS thuần + Tailwind CSS.
* **Backend:** Node.js + Express.js framework.
* **Database:** Microsoft SQL Server.
* **Database Access:** 100% thông qua Stored Procedure (SP).
* **Đóng gói & Chạy hệ thống:** Docker & Docker Compose.
* **Quản lý mã nguồn:** Git & GitHub.

---

## 2. Mô hình Kiến trúc MVC + Clean Structure

Hệ thống tuân thủ mô hình kiến trúc phân tầng chuẩn (**Clean MVC**), tách biệt rõ ràng trách nhiệm của từng tầng:

```plaintext
FRONTEND (EJS + Tailwind CSS)
       ↓
    ROUTER
       ↓
VALIDATOR MIDDLEWARE
       ↓
  CONTROLLER
       ↓
   SERVICE
       ↓
  REPOSITORY
       ↓
STORED PROCEDURE
       ↓
  SQL SERVER
```

---

## 3. Cấu trúc thư mục chuẩn đề xuất

```plaintext
QLVT/
├── client/
│   ├── views/                         # EJS giao diện
│   │   ├── layouts/                   # Master layout chung
│   │   ├── components/                # navbar.ejs, sidebar.ejs, modal.ejs, pagination.ejs...
│   │   ├── auth/                      # login.ejs, change-password.ejs
│   │   ├── admin/                     # logins.ejs, backup.ejs
│   │   ├── employees/                 # index.ejs
│   │   ├── materials/                 # index.ejs
│   │   ├── orders/                    # index.ejs
│   │   ├── receipts/                  # index.ejs
│   │   ├── issues/                    # index.ejs
│   │   └── reports/                   # index.ejs
│   └── public/                        # Static assets
│       ├── css/
│       ├── js/
│       └── assets/
│
├── server/
│   ├── config/                        # database.js, env.js
│   ├── routes/                        # Định tuyến URL
│   ├── controllers/                   # Nhận req / trả res
│   ├── services/                      # Business flow & xử lý nghiệp vụ
│   ├── repositories/                  # Gọi Stored Procedure
│   ├── validators/                    # Schema hoặc hàm validate dữ liệu
│   ├── middlewares/                   # auth, role, validator, error
│   └── app.js
│
├── database/
│   ├── tables/                        # Script tạo 8 bảng CSDL
│   ├── procedures/                    # Toàn bộ file .sql tạo Stored Procedure
│   ├── functions/
│   ├── triggers/
│   └── seed/                          # Dữ liệu mẫu phục vụ kiểm thử
│
├── docs/
│   ├── modules/                       # employee.md, receipt.md...
│   ├── architecture/
│   └── database/
│
├── docker/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

> **Quy tắc về Model:** Dự án sử dụng JavaScript thuần kết hợp Stored Procedure nên **không tạo thư mục `models/`** để chứa các class thực thể rỗng. Dữ liệu từ SP trả về dạng JSON/Recordset được xử lý trực tiếp qua tầng Repository và Service.

---

## 4. `client/` — Frontend (EJS Views & Assets)

Giao diện sử dụng Template Engine EJS kết hợp Tailwind CSS để quản lý layout và component dùng chung:

```html
<%- include('../components/navbar') %>
<%- include('../components/sidebar') %>
```

* **`views/components/`:** Các thành phần giao diện tái sử dụng (`navbar.ejs`, `sidebar.ejs`, `modal.ejs`, `pagination.ejs`).
* **`public/js/`:** JavaScript xử lý phía Client:
  * Lấy dữ liệu từ Backend qua `fetch` / `axios`.
  * Bắt sự kiện người dùng, tương tác DOM.
  * Thực hiện Frontend Validation để tối ưu trải nghiệm người dùng (UX).
  * Hiển thị thông báo, popup modal.
  * **Tuyệt đối không viết câu lệnh SQL ở đây.**

---

## 5. `routes/` — Tầng Định tuyến (Route)

Chỉ có nhiệm vụ xác định URL nào gọi Middleware và Controller nào:

```plaintext
Request → Route → [Middlewares] → Controller
```

**Ví dụ:**
```plaintext
GET    /employees
POST   /employees
PUT    /employees/:id
DELETE /employees/:id
```

> **Quy tắc:** Tuyệt đối không xử lý logic nghiệp vụ hay viết truy vấn CSDL trong Route.

---

## 6. Quy chuẩn Validation 3 lớp & `middlewares/`

Hệ thống bảo vệ dữ liệu bằng 3 lớp validation độc lập:

```plaintext
Frontend Validation
        ↓
Validator Middleware (Backend)
        ↓
Stored Procedure / Database Validation
```

### Lớp 1: Frontend Validation (Phục vụ UX)
* Phản hồi nhanh cho người dùng, hiển thị lỗi rõ ràng trên form.
* Chặn request ngay tại giao diện nếu dữ liệu sai cơ bản: required, sai kiểu dữ liệu, số âm, độ dài chuỗi, định dạng ngày.

### Lớp 2: Backend Validator — Middleware (Chạy trước Controller)
* Đặt tại `server/validators/` và nạp vào Route như một middleware trước khi chuyển giao đến Controller.
* Kiểm tra: thiếu trường bắt buộc, sai kiểu dữ liệu, sai định dạng, giá trị âm.
* Nếu vi phạm: Trả ngay mã lỗi **HTTP 400 Bad Request**, ngắt luồng không đi tiếp vào Controller/Service.

### Lớp 3: Stored Procedure / Database Validation (Bảo vệ tính toàn vẹn)
* Là chốt chặn bảo mật cuối cùng để phòng ngừa request gọi trực tiếp qua Postman hoặc công cụ ngoài.
* Kiểm tra toàn bộ business rule động và ràng buộc toàn vẹn dữ liệu:
  * Số lượng xuất $\le$ số lượng tồn kho.
  * Số lượng nhập $\le$ số lượng còn lại phải nhập của đơn đặt hàng.
  * Lương nhân viên $\ge 5{,}000{,}000$ VNĐ.
  * Trùng khóa chính (PK), vi phạm khóa ngoại (FK), kiểm tra tồn tại bản ghi.

### Các Middleware bắt buộc khác (`server/middlewares/`):
* **`authMiddleware`:** Xác thực người dùng đã đăng nhập chưa từ Session/JWT; gán thông tin định danh vào `req.user = { manv, role }`.
* **`roleMiddleware`:** Kiểm tra quyền hạn (`Admin` / `Nhanvien`); chặn truy cập trái phép bằng mã lỗi **HTTP 403 Forbidden**.
* **`errorMiddleware`:** Xử lý lỗi tập trung toàn ứng dụng, chuẩn hóa định dạng JSON phản hồi để Controller không phải lặp lại khối `try/catch`.

---

## 7. `controllers/` — Tầng Controller

Nơi tiếp nhận HTTP Request và gửi trả HTTP Response:

```plaintext
Request
   ↓
Lấy dữ liệu (req.body, req.params)
   ↓
Gán thông tin phiên (req.user.manv)
   ↓
Gọi Service tương ứng
   ↓
Nhận kết quả từ Service
   ↓
Response (JSON hoặc render view)
```

> **Quy tắc:** Controller không trực tiếp gọi SQL Server và không chứa các đoạn tính toán logic nghiệp vụ phức tạp.

---

## 8. `services/` — Tầng Business Logic

Tầng điều phối nghiệp vụ và kiểm soát luồng xử lý của hệ thống:
* Tiếp nhận dữ liệu sạch đã qua chuẩn hóa từ Controller.
* Điều phối luồng xử lý logic nghiệp vụ.
* Gọi tầng Repository để giao tiếp với Database.
* Xử lý kết quả trả về hoặc bắt lỗi nghiệp vụ.
* Trả kết quả sạch về cho Controller.

> **Quy tắc:** Service không trực tiếp viết các câu lệnh truy vấn SQL.

---

## 9. `repositories/` — Tầng Truy xuất Dữ liệu (Database Access)

Là tầng duy nhất được phép giao tiếp với SQL Server:

```plaintext
Service → Repository → CALL Stored Procedure → SQL Server
```

### Quy tắc cực kỳ quan trọng:
* **ĐƯỢC PHÉP:** Gọi Stored Procedure (`pool.request().execute("sp_...")`).
* **TUYỆT ĐỐI KHÔNG ĐƯỢC:** Viết câu lệnh SQL trực tiếp trong code (`SELECT * FROM...`, `INSERT INTO...`, `UPDATE...`). Toàn bộ logic thao tác dữ liệu phải nằm trong các tệp `.sql` thuộc thư mục `database/procedures/`.

---

## 10. Rule Master-Detail: JSON $\rightarrow$ OPENJSON & Transaction

Áp dụng cho các nghiệp vụ nhiều dòng chi tiết: **Đơn đặt hàng (1.3)**, **Phiếu nhập (1.4)**, **Phiếu xuất (1.5)**.

### Sơ đồ luồng xử lý dữ liệu chuẩn:
```plaintext
Frontend (EJS + JS)
       │
       │ Gửi Request: Payload là JSON Object lồng Mảng Detail
       ▼
Route
       │
       ▼
Validator Middleware
       │ Duyệt mảng kiểm tra hợp lệ từng phần tử (soluong > 0, dongia >= 0...)
       ▼
Controller
       │ Tiếp nhận req.body + gán req.user.manv
       ▼
Service
       │ Điều phối nghiệp vụ (Business Flow)
       ▼
Repository
       │ Thực hiện: JSON.stringify(details) ép mảng thành chuỗi text
       ▼
Stored Procedure (@ChiTietJSON NVARCHAR(MAX))
       │ Dùng OPENJSON(@ChiTietJSON) bung ra bảng dữ liệu
       ▼
Transaction (BEGIN TRAN ... COMMIT / ROLLBACK)
       │
       ├─► Thành công toàn bộ (Master + Details + Tồn kho) ──► COMMIT
       └─► Có bất kỳ lỗi gì phát sinh                     ──► ROLLBACK
```

### Cấu trúc Payload gửi từ Frontend:
```json
{
  "mapn": "PN000001",
  "masoDDH": "DDH00001",
  "details": [
    {
      "mavt": "VT01",
      "soluong": 20,
      "dongia": 50000
    },
    {
      "mavt": "VT02",
      "soluong": 10,
      "dongia": 30000
    }
  ]
}
```

### Mã nguồn xử lý mẫu:

#### Tại Repository (`Node.js`):
```javascript
const detailJson = JSON.stringify(details);

await pool.request()
  .input("MAPN", sql.NChar(8), mapn)
  .input("MasoDDH", sql.NVarChar(8), masoDDH)
  .input("MANV", sql.Int, manv)
  .input("ChiTietJSON", sql.NVarChar(sql.MAX), detailJson)
  .execute("sp_CreateReceipt");
```

#### Tại Stored Procedure (`SQL Server`):
```sql
CREATE PROCEDURE sp_CreateReceipt
    @MAPN NCHAR(8),
    @MasoDDH NVARCHAR(8),
    @MANV INT,
    @ChiTietJSON NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Insert thông tin phiếu cha (Master)
        INSERT INTO PhieuNhap (MAPN, NGAY, MasoDDH, MANV)
        VALUES (@MAPN, GETDATE(), @MasoDDH, @MANV);

        -- 2. Dùng OPENJSON đổ danh sách chi tiết vào bảng con CTPN
        INSERT INTO CTPN (MAPN, MAVT, SOLUONG, DONGIA)
        SELECT 
            @MAPN,
            mavt,
            soluong,
            dongia
        FROM OPENJSON(@ChiTietJSON)
        WITH (
            mavt NCHAR(4) '$.mavt',
            soluong INT   '$.soluong',
            dongia FLOAT  '$.dongia'
        );

        -- 3. Cập nhật số lượng tồn kho của bảng Vattu
        UPDATE Vattu
        SET Soluongton = Vattu.Soluongton + t.soluong
        FROM Vattu
        INNER JOIN OPENJSON(@ChiTietJSON)
        WITH (
            mavt NCHAR(4) '$.mavt',
            soluong INT   '$.soluong'
        ) AS t ON Vattu.MAVT = t.mavt;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END;
```

> **Quy tắc:** Cấm dùng vòng lặp ở Backend để gọi SP $N$ lần cho từng dòng chi tiết. Phải truyền toàn bộ mảng qua chuỗi JSON và xử lý trong 1 SP duy nhất với 1 Transaction duy nhất.

---

## 11. Security Rule: `MANV` không được lấy từ `req.body`

Nhằm ngăn chặn mạo danh nhân viên lập phiếu trong các nghiệp vụ Đơn đặt hàng, Phiếu nhập, Phiếu xuất:

```plaintext
Login 
  ↓
Tạo Session / JWT 
  ↓
authMiddleware giải mã token 
  ↓
Gán vào req.user 
  ↓
Controller đọc trực tiếp req.user.manv 
  ↓
Service 
  ↓
Stored Procedure
```

### Client gửi:
```json
{
  "mapx": "PX000001",
  "hotenkh": "Nguyen Van A",
  "manv": 99
}
```

### Backend xử lý:
```javascript
// TUYỆT ĐỐI KHÔNG ĐƯỢC DÙNG:
const { manv } = req.body; // ✗

// BẮT BUỘC DÙNG:
const manv = req.user.manv; // ✓

await issueService.createIssue({
  mapx,
  hotenkh,
  manv,
  details
});
```

> **Rule chính thức:** `MANV` của các nghiệp vụ Đặt hàng, Phiếu nhập, Phiếu xuất không được lấy từ client gửi lên. Backend bắt buộc lấy từ `req.user.manv` đã được xác thực qua middleware. Mọi trường `MANV` cố tình truyền trong `req.body` phải bị loại bỏ hoàn toàn.

---

## 12. Xác thực bằng SQL Server Security (Không tạo bảng Account/TaiKhoan)

Hệ thống tận dụng cơ chế bảo mật nguyên bản của SQL Server theo đúng yêu cầu đề tài:

```plaintext
SQL Server
├── Logins (login_admin, login_nv01...)
├── Server Roles
└── Database QLVT
    ├── Users (nv01, nv02...)
    ├── Database Roles (Admin, Nhanvien)
    └── Permissions
```

* **Không tạo bảng riêng:** Không thiết kế các bảng như `Account`, `User`, `TaiKhoan` trong CSDL.
* **Quản trị tài khoản qua Stored Procedure:**
  * Tạo/Xóa login phải thông qua các SP chuyên trách (`sp_CreateLogin`, `sp_DeleteLogin`, `sp_ChangePassword`, `sp_AssignLoginRole`).
  * Bên trong SP sử dụng các lệnh DDL hệ thống: `CREATE LOGIN`, `CREATE USER`, `ALTER ROLE... ADD MEMBER`, `DROP LOGIN`.
* **Cơ chế đăng nhập:**
  1. Người dùng nhập Username & Password tại form web.
  2. Node.js thực hiện xác thực với SQL Server qua tài khoản này.
  3. Khi xác thực thành công, Node.js tạo phiên làm việc (Session hoặc cấp JWT) lưu giữ `{ manv, role }` cho client.
  4. Các truy vấn nghiệp vụ thông thường sau đó vẫn chạy qua Connection Pool cấu hình sẵn của ứng dụng để đảm bảo hiệu năng.

---

## 13. Chuẩn hóa lỗi giữa SQL Server $\rightarrow$ Node.js & Mapping mã HTTP

### Chuẩn ném lỗi từ Stored Procedure:
Stored Procedure dùng lệnh `THROW 50001, N'Nội dung lỗi...', 1;` cho các vi phạm nghiệp vụ. Node.js bắt lỗi ở khối `catch` và chuyển đổi thành HTTP status tương ứng:

```json
{
  "success": false,
  "errorCode": "RECEIPT_QUANTITY_EXCEEDED",
  "message": "Số lượng nhập vượt quá số lượng còn lại."
}
```

### Bảng ánh xạ mã HTTP Status:

| Trường hợp lỗi | Mã HTTP Status |
| :--- | :--- |
| Request gửi lên bị thiếu trường bắt buộc / sai kiểu dữ liệu | **400 Bad Request** |
| Chưa đăng nhập hoặc Token/Session hết hạn | **401 Unauthorized** |
| Không đủ quyền truy cập (Nhân viên cố vào trang Admin) | **403 Forbidden** |
| Không tìm thấy tài nguyên dữ liệu yêu cầu | **404 Not Found** |
| Vi phạm Business Rule (Xuất vượt tồn, nhập vượt số lượng đặt, trùng khóa...) | **400 Bad Request** hoặc **409 Conflict** |
| Mất kết nối CSDL, crash hệ thống server ngoài dự kiến | **500 Internal Server Error** |

---

## 14. `database/` — Quản lý mã nguồn SQL Server

Tất cả mã nguồn cơ sở dữ liệu được quản lý đồng bộ trong thư mục `database/`:
* **`tables/`:** Script tạo 8 bảng chính thức (`Nhanvien`, `Vattu`, `DatHang`, `CTDDH`, `PhieuNhap`, `CTPN`, `PhieuXuat`, `CTPX`) kèm các ràng buộc PK, FK, Check.
* **`procedures/`:** Tách mỗi Stored Procedure thành 1 file `.sql` riêng biệt (ví dụ: `sp_NhanVien_Create.sql`, `sp_PhieuNhap_Create.sql`...).
* **`seed/`:** File script chứa dữ liệu mẫu để cả 3 thành viên cùng nạp và test kiểm thử đồng bộ.

---

## 15. `docs/` — Quy chuẩn tài liệu kỹ thuật Module

Mỗi chức năng nghiệp vụ khi phát triển bắt buộc phải có một file tài liệu tương ứng tại `docs/modules/[tên-module].md` gồm đầy đủ 13 mục chuẩn:
1. Mục tiêu
2. Chức năng
3. Database sử dụng
4. Stored Procedure
5. Route
6. Controller
7. Service
8. Repository
9. Validation
10. Business Rule
11. Error case
12. Trạng thái hoàn thành
13. Lịch sử thay đổi

---

## 16. Luồng xử lý hoàn chỉnh toàn hệ thống (End-to-End Flow)

Luồng chuẩn khi người dùng thực hiện một thao tác ghi dữ liệu (ví dụ: Bấm "Lập phiếu nhập"):

```plaintext
Frontend (EJS + JS)
       ↓
Client-side Validation
       ↓
Gửi HTTP POST /receipts
       ↓
Route
       ↓
Validator Middleware ──(Nếu sai dữ liệu cơ bản)──► Trả về HTTP 400 Bad Request
       ↓ (Hợp lệ)
Controller (Đọc body, gán MANV từ req.user.manv)
       ↓
Service (Xử lý Business Flow)
       ↓
Repository (JSON.stringify chi tiết mảng)
       ↓
Gọi Stored Procedure (@ChiTietJSON)
       ↓
SQL Server (OPENJSON + Xử lý Transaction)
       │
       ├─► Thành công: COMMIT TRAN ──► Repository ──► Service ──► Controller ──► Trả JSON HTTP 200/201 ──► Frontend hiển thị thành công
       │
       └─► Thất bại: ROLLBACK TRAN + THROW ──► Bắt tại Catch ──► Controller ──► Trả JSON HTTP Error (400/409/500) ──► Frontend hiển thị lỗi
```

---

## 4 RULE CỐT LÕI BẮT BUỘC TUÂN THỦ

* **RULE 01 — Master-Detail:** Các nghiệp vụ Đặt hàng, Phiếu nhập, Phiếu xuất phải gửi mảng chi tiết xuống Database dưới dạng chuỗi JSON; Stored Procedure dùng `OPENJSON()` để xử lý tập dữ liệu trong một Transaction duy nhất; nghiêm cấm gọi SP lặp lại nhiều lần.
* **RULE 02 — Transaction:** Toàn bộ thao tác ghi liên quan từ 2 bảng trở lên hoặc thay đổi số lượng tồn kho đều phải được bọc trong `BEGIN TRANSACTION ... COMMIT / ROLLBACK` của SQL Server.
* **RULE 03 — MANV Identity:** Mã nhân viên lập phiếu bắt buộc phải lấy từ phiên làm việc xác thực (`req.user.manv`), loại bỏ hoàn toàn trường `MANV` nếu client gửi trong `req.body`.
* **RULE 04 — Authentication & Authorization:** Không tạo bảng tài khoản riêng trong CSDL; quản lý định danh và bảo mật trực tiếp qua SQL Server Logins, Users và Roles (`Admin`, `Nhanvien`).