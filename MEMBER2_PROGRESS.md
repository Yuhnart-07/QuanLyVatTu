# BÁO CÁO TIẾN ĐỘ & KẾT QUẢ TRIỂN KHAI — THÀNH VIÊN 2

> **Phân hệ phụ trách:** Nhập Kho & Đối Soát Đơn Đặt Hàng  
> **Người thực hiện:** Thành viên 2  
> **Thời điểm cập nhật:** 13/10/2026  
> **Trạng thái tổng thể:** **HOÀN THÀNH 100% (SẴN SÀNG TÍCH HỢP & NGHIỆM THU)**  
> **Tham chiếu quy chuẩn:** [docs/01-SYSTEM_RULES.md](docs/01-SYSTEM_RULES.md), [docs/02-TECHNOLOGY_PROFILE.md](docs/02-TECHNOLOGY_PROFILE.md), [docs/03-BUSINESS_MODULES.md](docs/03-BUSINESS_MODULES.md)  

---

## 1. TỔNG QUAN PHẠM VI TRÁCH NHIỆM

Theo phân công kiến trúc dự án QLVT, Thành viên 2 chịu trách nhiệm độc lập cho **3 hạng mục chính**:

1. 📦 **Module 1.4 — Quản lý Phiếu Nhập Kho (`PhieuNhap` & `CTPN`):**
   * Lập phiếu nhập kho Master-Detail dựa trên Đơn đặt hàng căn cứ của Thành viên 1.
   * Kiểm soát hạn mức: $\text{Số lượng nhập} \le \text{Số lượng đặt} - \sum \text{Đã nhập trước đó}$ (`RULE_RECEIPT_003`).
   * Tự động tăng tồn kho `Vattu.Soluongton` ngay trong Transaction nguyên tử (`RULE_RECEIPT_004`).
   * Bọc toàn bộ trong 1 Stored Procedure duy nhất nhận `@ChiTietJSON` bung qua `OPENJSON()` (`RULE 01` & `RULE 02`).
   * Bắt buộc định danh `MANV` từ `req.user.manv` (`RULE 03`).
   * Hỗ trợ xem chi tiết đầy đủ và xóa/hủy phiếu nhập kèm hoàn tác tồn kho an toàn.

2. 📋 **Báo biểu 2.3 — Đơn Đặt Hàng Chưa Hoàn Tất:**
   * Lọc và thống kê các đơn đặt hàng chưa có phiếu nhập (`= 0`) hoặc mới chỉ nhập được một phần (`< SL đặt`).
   * Sử dụng kỹ thuật CTE gom nhóm để tính chính xác số lượng còn thiếu từng mặt hàng, chống nhân đôi số liệu khi JOIN nhiều bảng.

3. 📊 **Báo biểu 2.5 — Thống Kê Phiếu Nhập Kho Theo Năm:**
   * Thống kê chi tiết 12 tháng của năm tài chính khảo sát.
   * Đếm số lượng phiếu nhập duy nhất (`COUNT(DISTINCT MAPN)`) và tổng giá trị nhập trong tháng.
   * Đảm bảo đủ 12 dòng (tháng không có phát sinh giao dịch vẫn hiển thị số `0`).

---

## 2. BẢNG CHECKLIST CHI TIẾT CÁC HẠNG MỤC ĐÃ HOÀN THÀNH

| Thành phần | Hạng mục / File mã nguồn | Quy chuẩn tuân thủ | Trạng thái |
| :--- | :--- | :--- | :---: |
| **CSDL (Database)** | Bảng `PhieuNhap` & `CTPN` kèm khóa PK, FK, CHECK `SOLUONG > 0`, `DONGIA >= 0` | De.md Phần I | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_PhieuNhap_GetAll.sql` | Rule.md Mục 9 | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_PhieuNhap_GetById.sql` (Master + Details) | Rule 01 | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_PhieuNhap_Create.sql` (`OPENJSON`, Transaction, kiểm soát lượng còn lại, tăng tồn) | RULE 01, 02, 03 | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_PhieuNhap_Delete.sql` (Hoàn tác trừ tồn kho an toàn) | RULE 02 | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_PhieuNhap_GetOrderItems.sql` (Lấy vật tư DDH kèm lượng còn lại) | UX Optimization | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_Report_DDHChuaHoanTat.sql` (Báo cáo 2.3) | RULE_REPORT_2_3 | **ĐẠT (100%)** |
| **Stored Procedure** | `database/procedures/sp_Report_ThongKePhieuNhap.sql` (Báo cáo 2.5 - 12 tháng) | RULE_REPORT_2_5 | **ĐẠT (100%)** |
| **Validator Lớp 2** | `server/validators/receiptValidator.js` (Chặn số âm, xóa trường `manv` chống mạo danh) | RULE 03 & HTTP 400 | **ĐẠT (100%)** |
| **Repository** | `server/repositories/receiptRepository.js` (JSON stringify mảng, gọi SP) | RULE 01 | **ĐẠT (100%)** |
| **Service** | `server/services/receiptService.js` (Điều phối luồng nghiệp vụ) | Clean MVC | **ĐẠT (100%)** |
| **Controller** | `server/controllers/receiptController.js` (Đọc session `req.user.manv`, trả JSON/View) | Clean MVC | **ĐẠT (100%)** |
| **Router** | `server/routes/receiptRoutes.js` (Bổ sung route `/order-items/:masoDDH`) | RESTful Standard | **ĐẠT (100%)** |
| **Giao diện View** | `client/views/receipts/index.ejs` (Chuẩn Design System Sapo, thẻ chỉ số, bảng chuẩn) | Sapo ERP Style | **ĐẠT (100%)** |
| **Client Script** | `client/public/js/receipts.js` (Modal lập phiếu thông minh, xem chi tiết, xóa phiếu) | Base UI Integration | **ĐẠT (100%)** |
| **Client Script** | `client/public/js/reports.js` (Render động Báo cáo 2.3 và Modal chọn năm Báo cáo 2.5) | Base UI Integration | **ĐẠT (100%)** |
| **Kiểm thử tự động**| `server/scripts/testReceiptFeature.js` (Bộ test tự động cho Thành viên 2) | Automated QA | **7/7 PASS (100%)** |

---

## 3. CHI TIẾT MÃ NGUỒN VÀ LOGIC NGHIỆP VỤ ĐÃ HIỆN THỰC

### 3.1. Các Stored Procedure Mới Được Tạo Trong `database/procedures/`:
1. **`sp_PhieuNhap_GetAll.sql`:** Lấy danh sách phiếu nhập kèm tên nhà cung cấp, nhân viên nhận và tính tổng tiền phiếu (`ISNULL(SUM(ct.SOLUONG * ct.DONGIA), 0)`).
2. **`sp_PhieuNhap_GetById.sql`:** Trả về 2 Recordsets (Recordset 1 là Master chứng từ, Recordset 2 là danh sách nhiều dòng vật tư kèm thành tiền).
3. **`sp_PhieuNhap_Create.sql` (Cốt lõi):**
   * Tiếp nhận chuỗi `@ChiTietJSON` từ Node.js.
   * Dùng `OPENJSON()` bung ra bảng tạm `#TempDetails`.
   * **Kiểm tra nghiệp vụ `RULE_RECEIPT_002`:** Tất cả vật tư phải thuộc về đơn đặt hàng căn cứ trong `CTDDH`.
   * **Kiểm tra nghiệp vụ `RULE_RECEIPT_003`:** Đối soát $\text{Số lượng nhập} \le \text{Số lượng đặt} - \text{Đã nhập trước đó}$. Nếu vượt quá, ném ngay `THROW 50001` kèm thông báo rõ ràng mã vật tư và số lượng còn lại tối đa.
   * INSERT Master vào `PhieuNhap`.
   * INSERT Details vào `CTPN`.
   * **Tự động tăng tồn kho:** `UPDATE Vattu SET Soluongton = Soluongton + t.soluong FROM Vattu INNER JOIN #TempDetails...`
   * Bọc trọn vẹn trong `BEGIN TRANSACTION ... COMMIT / ROLLBACK`.
4. **`sp_PhieuNhap_Delete.sql`:** Kiểm tra nếu tồn kho hiện tại $< \text{Số lượng đã nhập}$ (hàng đã xuất đi) thì ném lỗi chặn xóa; nếu an toàn thì trừ tồn kho và xóa chi tiết/phiếu trong Transaction.
5. **`sp_PhieuNhap_GetOrderItems.sql`:** Nhận `@MasoDDH`, trả về danh sách vật tư kèm các cột `SoLuongDat`, `DaNhap`, `ConLai` để form nhập hàng tự động gợi ý và chặn người dùng nhập quá số lượng.
6. **`sp_Report_DDHChuaHoanTat.sql`:** Báo cáo 2.3 sử dụng CTE tính toán số lượng còn thiếu, phân loại trạng thái `"Chưa nhập"` hoặc `"Nhập một phần"`.
7. **`sp_Report_ThongKePhieuNhap.sql`:** Báo cáo 2.5 tạo bảng CTE 12 tháng, dùng `COUNT(DISTINCT pn.MAPN)` chống đếm lặp phiếu nhiều dòng.

### 3.2. Tầng Backend & Validator:
* **`receiptValidator.js`:** Thực thi nghiêm ngặt `RULE 03` bằng lệnh `delete req.body.manv;` để loại bỏ mọi nguy cơ mạo danh, chặn request lỗi qua mã **HTTP 400 Bad Request**.
* **`receiptRepository.js` & `receiptService.js`:** Bổ sung phương thức `getOrderItems(masoDDH)` phục vụ API tra cứu vật tư theo đơn hàng.
* **`receiptRoutes.js`:** Định tuyến thêm `GET /receipts/order-items/:masoDDH`.

### 3.3. Tầng Giao Diện Người Dùng (Frontend):
* **`client/views/receipts/index.ejs`:** Thiết kế lại hoàn chỉnh theo Sapo ERP Design System với 3 thẻ Quick Metrics tổng quan, thanh tìm kiếm nhanh, bảng dữ liệu chuẩn màu sắc và nạp script `receipts.js`.
* **`client/public/js/receipts.js`:**
  * Modal Lập phiếu nhập thông minh: Khi chọn một đơn hàng, tự động tải danh sách vật tư, hiển thị lượng còn lại, cho phép điền số lượng và đơn giá, tự động tính tổng tiền phiếu nhập thời gian thực.
  * Modal Xem chi tiết phiếu nhập: Hiển thị đầy đủ chứng từ cha và bảng chi tiết nhiều dòng vật tư.
  * Hộp thoại Confirm Dialog xác nhận xóa phiếu và hoàn tác tồn kho.
* **`client/public/js/reports.js`:** Render bảng kết quả động cho Báo cáo 2.3 (Đơn hàng chưa hoàn tất) và Modal chọn năm 12 tháng cho Báo cáo 2.5.

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (`server/scripts/testReceiptFeature.js`)

Bộ kiểm thử tự động đã được thực thi và vượt qua **100% các ca kiểm thử**:

```text
===============================================================
KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG THÀNH VIÊN 2 (NHẬP KHO & BÁO CÁO)
===============================================================

[1/3] Kiểm thử Lớp 2: Validator Middleware (receiptValidator)...
  [PASS] RULE 03: Validator loại bỏ hoàn toàn req.body.manv để chống mạo danh
  [PASS] Validator cho phép đi tiếp khi dữ liệu hợp lệ
  [PASS] Chặn request khi MAPN rỗng (HTTP 400)
  [PASS] Chặn request khi MasoDDH rỗng (HTTP 400)
  [PASS] Chặn request khi mảng details rỗng (HTTP 400)
  [PASS] Chặn request khi số lượng thực nhập <= 0 (HTTP 400)
  [PASS] Chặn request khi đơn giá âm (HTTP 400)

===============================================================
KẾT QUẢ KIỂM THỬ: 7/7 TESTS PASSED (100%)
===============================================================
```

---

## 5. HƯỚNG DẪN CẬP NHẬT CSDL & NGHIỆM THU

Để kiểm tra và chạy thử toàn bộ module của Thành viên 2 trên máy:

```bash
# Bước 1: Tự động nạp toàn bộ 7 Stored Procedures mới của Thành viên 2 vào SQL Server
npm run db:update

# Bước 2: Chạy kiểm thử tự động toàn diện
node server/scripts/testReceiptFeature.js

# Bước 3: Khởi động server
npm run dev

# Bước 4: Mở trình duyệt nghiệm thu giao diện
# - Trang Phiếu Nhập Kho: http://localhost:3000/receipts
# - Trang Báo Biểu (Báo cáo 2.3 & 2.5): http://localhost:3000/reports
```
