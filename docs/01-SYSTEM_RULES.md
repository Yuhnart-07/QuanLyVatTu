# SYSTEM DEVELOPMENT RULES — HỆ THỐNG QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)

> **Status:** Standardized Architecture Guideline  
> **Scope:** Technology-Independent & Business-Independent Engineering Rules  
> **Target Application:** Quản Lý Nhập/Xuất Vật Tư (QLVT - Đề 2)  
> **Version:** 2.1.0 (Standardized 3-Member Team Framework — Level 2 Standard)  

---

## 0. Tailoring & Sizing Framework (Phân Hạng Quy Mô Dự Án)

Hệ thống tuân thủ mô hình 3 Cấp độ Tuân thủ (Compliance Levels) nhằm chuẩn hóa quy trình phát triển và tránh nguy cơ **Over-engineering**:

| Cấp độ (Level) | Quy mô & Bối cảnh | Mức độ Áp dụng Rules | Quy tắc Giản lược (Pruning Rules) |
| :--- | :--- | :--- | :--- |
| **Level 1: Lite** | • Dự án PoC, MVP, Hackathon<br>• Team 1 - 2 developers<br>• CRUD đơn giản | Basic Rules | • Gộp `Controller` và `Service` vào 1 handler.<br>• Bỏ tầng Repository độc lập.<br>• Gom cấu hình vào 1 file `PROJECT_RULES.md`. |
| **Level 2: Standard (ÁP DỤNG)** | • **Dự án QLVT tiêu chuẩn**<br>• **Team 3 thành viên (M1, M2, M3)**<br>• **Phân tầng dữ liệu & Stored Procedures** | **Toàn bộ Sections: 1 - 10** | • **Bắt buộc phân tầng Clean MVC chuẩn.**<br>• **Bắt buộc dùng Module Contract & JSON Schemas.**<br>• **Bắt buộc duy trì bộ 3 file: `01-SYSTEM_RULES`, `02-TECHNOLOGY_PROFILE`, `03-BUSINESS_MODULES`.** |
| **Level 3: Enterprise** | • Hệ thống Microservices / Multi-team<br>• > 10 developers<br>• Hàng ngàn Business Rules | Mở rộng nâng cao | • Bắt buộc cách ly Module Ownership, Contract Testing, ADR.<br>• Bắt buộc Event-Driven Queue, Distributed Saga & AI Resilience. |

---

## 1. Purpose & Scope

Tài liệu này định nghĩa bộ quy tắc kỹ thuật cốt lõi dùng để thiết kế, phát triển, kiểm thử, tích hợp và bảo trì hệ thống **Quản lý nhập/xuất vật tư (QLVT)** giữa 3 thành viên trong nhóm.

* Các quy tắc trong file này **hoàn toàn độc lập với chi tiết thư viện bên ngoài** (công nghệ cụ thể được quy định tại `02-TECHNOLOGY_PROFILE.md`).
* Các quy tắc **độc lập với chi tiết nghiệp vụ từng màn hình** (chi tiết nghiệp vụ và Rule Sets được quy định tại `03-BUSINESS_MODULES.md`).
* Mục tiêu tối thượng: Giúp **3 thành viên phát triển song song độc lập**, không giẫm chân lên mã nguồn của nhau, tích hợp mượt mà và đảm bảo tính toàn vẹn dữ liệu.

---

## 2. Core Architecture Principles

1. **Separation of Concerns:** Tách biệt tuyệt đối giữa Giao diện (Presentation), Định tuyến (Router), Kiểm tra hợp lệ (Validator Middleware), Tiếp nhận yêu cầu (Controller), Điều phối nghiệp vụ (Service), Truy xuất dữ liệu (Repository) và Lưu trữ (Database Stored Procedures).
2. **Single Responsibility Principle:** Mỗi class/module/file chỉ chịu trách nhiệm cho một lý do thay đổi duy nhất.
3. **High Cohesion & Low Coupling:** Đạt độ gắn kết nội bộ cao trong từng module của mỗi thành viên và giảm thiểu tối đa sự phụ thuộc trực tiếp chéo giữa 3 thành viên.
4. **Dependency Direction:** Chiều phụ thuộc luôn hướng một chiều từ ngoài vào trong:
   $$\text{Presentation / Client} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Stored Procedure} \longrightarrow \text{Database}$$
5. **Explicit Contracts:** Các thành viên chỉ giao tiếp thông qua Module Contract / API Schema đã thống nhất, không can thiệp vào mã nội bộ của nhau.
6. **Validation Authority Rule:** Validation ở Frontend/Client chỉ phục vụ trải nghiệm người dùng (UX); Backend Middleware và Database Stored Procedure mới là cơ quan thẩm quyền cuối cùng (Authority) về bảo mật và toàn vẹn dữ liệu.
7. **Zero-Trash Data Policy:** Mọi dữ liệu không đạt điều kiện nghiệp vụ tuyệt đối không được phép ghi dở dang vào CSDL làm sai lệch số lượng tồn kho.

---

## 3. Clean MVC Architecture Model

Hệ thống tuân thủ mô hình phân tầng chuẩn (**Clean MVC**):

```plaintext
┌────────────────────────────────────────────────────────┐
│ FRONTEND: EJS Template Engine + Tailwind CSS + JS      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP Request (Fetch / Form)
                            ▼
┌────────────────────────────────────────────────────────┐
│ ROUTER: Định tuyến Endpoint URL                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ VALIDATOR MIDDLEWARE: Kiểm tra hợp lệ Lớp 2            │
└───────────────────────────┬────────────────────────────┘
                            │ Dữ liệu sạch (Pass)
                            ▼
┌────────────────────────────────────────────────────────┐
│ CONTROLLER: Tiếp nhận Req, đọc Session, trả JSON/HTML  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ SERVICE: Điều phối luồng nghiệp vụ (Business Flow)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ REPOSITORY: Ép mảng Detail thành JSON, gọi SP duy nhất │
└───────────────────────────┬────────────────────────────┘
                            │ CALL SP(@ChiTietJSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│ STORED PROCEDURE: OPENJSON & Transaction (Lớp 3)       │
└───────────────────────────┬────────────────────────────┘
                            │ COMMIT / ROLLBACK
                            ▼
┌────────────────────────────────────────────────────────┐
│ SQL SERVER: 8 Bảng dữ liệu chuẩn hóa                   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Layer Responsibilities & Boundaries

| Tầng (Layer) | Trách nhiệm chính | ❌ KHÔNG ĐƯỢC LÀM (Forbidden) |
| :--- | :--- | :--- |
| **Router** | Ánh xạ HTTP Method + URL tới Middleware và Controller | ❌ Chứa logic tính toán nghiệp vụ<br>❌ Viết câu lệnh truy vấn CSDL |
| **Validator** | Kiểm tra kiểu dữ liệu, bắt buộc, số âm, loại bỏ trường cấm | ❌ Xử lý lưu trữ CSDL<br>❌ Đọc trực tiếp từ cơ sở dữ liệu |
| **Controller** | Đọc `req.body`, `req.params`, lấy `req.user.manv`, gọi Service | ❌ Tính toán business phức tạp<br>❌ Gọi trực tiếp Stored Procedure |
| **Service** | Điều phối nghiệp vụ, bắt lỗi nghiệp vụ, gọi Repository | ❌ Nhận trực tiếp đối tượng `req`, `res`<br>❌ Viết câu lệnh SQL |
| **Repository** | Đóng gói tham số, `JSON.stringify(details)`, gọi Stored Procedure | ❌ Viết câu lệnh SQL thô (`SELECT...`, `INSERT...`)<br>❌ Chứa logic giao diện |
| **Stored Procedure** | `OPENJSON`, bọc `BEGIN TRANSACTION`, cập nhật tồn kho, ném `THROW 50001` | ❌ Bỏ qua Transaction khi ghi nhiều bảng<br>❌ Cho phép dữ liệu mồ côi |

---

## 5. Bốn Quy Tắc Cốt Lõi Bắt Buộc (4 Core System Rules)

* **RULE 01 — Master-Detail qua OPENJSON:**
  Các nghiệp vụ nhiều dòng chi tiết (Đơn đặt hàng, Phiếu nhập, Phiếu xuất) phải gửi toàn bộ danh sách chi tiết dưới dạng chuỗi JSON (`ChiTietJSON`). Stored Procedure dùng `OPENJSON()` để bung mảng thành bảng trong một lần gọi duy nhất; **nghiêm cấm gọi SP lặp đi lặp lại $N$ lần bằng vòng lặp**.

* **RULE 02 — Atomic Transaction Boundary:**
  Mọi thao tác ghi dữ liệu liên quan từ 2 bảng trở lên (Master + Detail) hoặc làm thay đổi số lượng tồn kho `Vattu.Soluongton` đều bắt buộc phải được bọc trong khối:
  ```sql
  BEGIN TRY
      BEGIN TRANSACTION;
      -- Thao tác Master, Details, Cập nhật tồn kho...
      COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
      IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
      THROW;
  END CATCH
  ```

* **RULE 03 — MANV Session Identity:**
  Mã nhân viên thực hiện chứng từ bắt buộc phải lấy từ phiên làm việc xác thực (`req.user.manv`). Validator Middleware phải **chủ động loại bỏ hoàn toàn `delete req.body.manv`** nếu client cố tình gửi lên, nhằm ngăn chặn triệt để hành vi mạo danh nhân viên lập phiếu.

* **RULE 04 — SQL Server Security Authentication:**
  Hệ thống tuyệt đối không tạo thêm bảng tài khoản (`Account`, `User`, `TaiKhoan`) trong CSDL. Quản trị định danh và phân quyền 100% dựa trên SQL Server Logins, Database Users và 2 Roles (`Admin`, `Nhanvien`).

---

## 6. Quy Chuẩn Validation 3 Lớp Độc Lập

```plaintext
Frontend Validation (Client UX)
         ↓
Validator Middleware (Backend Gatekeeper - HTTP 400)
         ↓
Stored Procedure / Database Validation (Integrity Chokepoint - THROW 50001)
```

1. **Lớp 1 (Frontend):** Bắt lỗi nhanh trên form, ngăn chặn click nhầm, hỗ trợ trải nghiệm người dùng (UX).
2. **Lớp 2 (Backend Validator):** Middleware chặn request rác tại ngõ vào Backend. Kiểm tra thiếu trường, sai format, số lượng $\le 0$. Nếu sai, trả ngay **HTTP 400 Bad Request**.
3. **Lớp 3 (Database SP):** Chốt chặn an toàn cuối cùng. Kiểm tra hạn mức đơn hàng, tồn kho khả dụng, ràng buộc khóa ngoại và toàn vẹn dữ liệu.

---

## 7. Phân Định Quyền Sở Hữu Module Giữa 3 Thành Viên

Nhằm đảm bảo 3 thành viên có thể làm việc song song mà không xung đột:

| Thành viên | Trách nhiệm chính | Module sở hữu | Phụ thuộc đầu vào | Sản phẩm đầu ra |
| :--- | :--- | :--- | :--- | :--- |
| **Thành viên 1** | Danh mục, Đặt hàng & Xác thực | • Quản lý Nhân viên<br>• Quản lý Vật tư<br>• Đơn đặt hàng & CTDDH<br>• Auth & SQL Login<br>• Báo cáo 2.1, 2.2 | Schema 8 bảng & Dữ liệu mẫu | • Master data (NV, VT)<br>• Dữ liệu `DatHang` & `CTDDH`<br>• Phiên đăng nhập `req.user` |
| **Thành viên 2** | **Nhập kho & Đối soát đơn hàng** | • **Phiếu nhập kho & CTPN**<br>• **Kiểm soát lượng nhập vs đặt**<br>• **Cập nhật tăng tồn kho**<br>• **Báo cáo 2.3 (DDH chưa xong)**<br>• **Báo cáo 2.5 (Phiếu nhập/năm)** | • Dữ liệu `DatHang`, `CTDDH`<br>• Danh mục `Vattu`<br>• `req.user.manv` từ M1 | • Dữ liệu `PhieuNhap`, `CTPN`<br>• Tăng `Vattu.Soluongton`<br>• Báo biểu 2.3, 2.5 |
| **Thành viên 3** | Xuất kho, Quản trị DB & Báo cáo | • Phiếu xuất kho & CTPX<br>• Kiểm tra giảm tồn kho<br>• Sao lưu / Phục hồi CSDL<br>• Báo cáo 2.4, 2.6, 2.7 | • Danh mục `Vattu` & Tồn kho<br>• `req.user.manv` từ M1 | • Dữ liệu `PhieuXuat`, `CTPX`<br>• Giảm `Vattu.Soluongton`<br>• Bản backup & Báo cáo tổng |

---

## 8. Definition of Done (DoD) Cho Mỗi Tính Năng

Một tính năng chỉ được xem là **HOÀN TẤT (DONE)** khi:
1. [ ] Tuân thủ mô hình phân tầng Clean MVC và 4 Core System Rules.
2. [ ] Đã qua kiểm tra hợp lệ tại Validator Middleware (Lớp 2) và Stored Procedure (Lớp 3).
3. [ ] Không viết truy vấn SQL trực tiếp trong code Node.js; 100% gọi Stored Procedure.
4. [ ] Khai báo đúng Module Contract (JSON Schemas) đã thỏa thuận.
5. [ ] Đã kiểm thử thành công cả trường hợp hợp lệ (Pass) và ngoại lệ (Fail) trên bộ seed data chuẩn.
6. [ ] Không làm sai lệch số lượng tồn kho `Vattu.Soluongton`.
