# BUSINESS MODULES & RULE SETS — HỆ THỐNG QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)

> **Status:** Business Specifications & Member Contracts  
> **Target System:** Quản Lý Nhập/Xuất Vật Tư (Mô hình hợp tác 3 thành viên)  
> **Version:** 2.1.0 (Standardized 3-Member Team Framework)  

---

## 1. Executive Summary & System Actors

Hệ thống Quản lý nhập/xuất vật tư (QLVT) phục vụ quản lý chuỗi cung ứng vật tư xây dựng từ khâu thu mua, nhập kho, quản lý kho bãi, xuất bán cho khách hàng đến hệ thống báo biểu thống kê tài chính.

### Các Đối Tượng Sử Dụng (System Actors & Roles):
1. **Quản trị viên (Admin):**
   * Toàn quyền truy cập mọi màn hình nghiệp vụ và báo biểu.
   * Tạo tài khoản SQL Login, phân quyền người dùng (`sp_CreateLogin`, `sp_AssignLoginRole`).
   * Thực hiện sao lưu (Backup) và phục hồi (Restore) cơ sở dữ liệu.
2. **Nhân viên (Nhanvien):**
   * Được phép lập đơn đặt hàng, lập phiếu nhập kho, lập phiếu xuất kho.
   * Tra cứu danh mục nhân viên, vật tư và xem các báo biểu được phân quyền.
   * Đổi mật khẩu cá nhân.
   * Bị chặn hoàn toàn các chức năng quản trị tài khoản và sao lưu CSDL.

---

## 2. Business Modules Breakdown

Hệ thống được phân rã thành 7 Module nghiệp vụ và 7 Báo biểu được chia quyền sở hữu cho 3 thành viên:

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                        QUẢN LÝ VẬT TƯ (QLVT)                           │
├────────────────────────────┬─────────────────────────────┬─────────────┤
│ THÀNH VIÊN 1 (M1)          │ THÀNH VIÊN 2 (M2)           │ THÀNH VIÊN 3│
├────────────────────────────┼─────────────────────────────┼─────────────┤
│ 1.1 Quản lý Nhân viên      │ 1.4 Phiếu Nhập Kho          │ 1.5 Xuất Kho│
│ 1.2 Quản lý Vật tư         │     - PhieuNhap & CTPN      │     - PX &  │
│ 1.3 Đơn Đặt Hàng           │     - Kiểm soát Hạn mức DDH │       CTPX  │
│     - DatHang & CTDDH      │     - Cập nhật Tăng Tồn Kho │ 1.6 Backup &│
│ 1.0 Đăng nhập & Phân quyền │ 2.3 Báo cáo DDH Chưa Xong   │     Restore │
│ 2.1 Báo cáo DS Nhân viên   │ 2.5 Thống kê Phiếu Nhập/Năm │ 2.4, 2.6    │
│ 2.2 Báo cáo DM Vật tư      │                             │ 2.7 Báo cáo │
└────────────────────────────┴─────────────────────────────┴─────────────┘
```

---

## 3. 4-Step Cross-Member Data Pipeline

Quy trình phối hợp khép kín giữa 3 thành viên bảo đảm luồng dữ liệu thông suốt:

```plaintext
┌────────────────────────────────────────────────────────┐
│                   STEP 1: THÀNH VIÊN 1                 │
│  Lập Đơn Đặt Hàng (DatHang, CTDDH) với Nhà Cung Cấp    │
└───────────────────────────┬────────────────────────────┘
                            │ MasoDDH, MAVT, SOLUONG Đặt
                            ▼
┌────────────────────────────────────────────────────────┐
│                   STEP 2: THÀNH VIÊN 2 (TRỌNG TÂM)     │
│  Kiểm tra Lượng Nhập <= Lượng Đặt Còn Lại             │
│  Ghi Phiếu Nhập (PhieuNhap, CTPN)                      │
│  Tự động TĂNG số lượng tồn kho (Vattu.Soluongton +)    │
└───────────────────────────┬────────────────────────────┘
                            │ Vattu.Soluongton hiện tại
                            ▼
┌────────────────────────────────────────────────────────┐
│                   STEP 3: THÀNH VIÊN 3                 │
│  Kiểm tra Lượng Xuất <= Lượng Tồn Khả Dụng             │
│  Ghi Phiếu Xuất (PhieuXuat, CTPX)                      │
│  Tự động GIẢM số lượng tồn kho (Vattu.Soluongton -)    │
└───────────────────────────┬────────────────────────────┘
                            │ Dữ liệu giao dịch nhập/xuất
                            ▼
┌────────────────────────────────────────────────────────┐
│                   STEP 4: HỆ THỐNG BÁO CÁO             │
│  M2: Báo cáo DDH chưa hoàn tất (2.3), Nhập/năm (2.5)   │
│  M3: Báo cáo Bảng kê (2.4), Xuất/năm (2.6), Tổng (2.7) │
└────────────────────────────────────────────────────────┘
```

---

## 4. Đặc Tả Nghiệp Vụ & Rule Sets Chuyên Sâu Của Thành Viên 2 (Member 2 Focus)

### 4.1. Module Phiếu Nhập Kho (`PhieuNhap` & `CTPN`)

#### 📌 Rule Set 1: Ràng buộc Đơn đặt hàng & Vật tư
* **Rule ID:** `RULE_RECEIPT_001` - Order Integrity Check
  * **Điều kiện:** `PhieuNhap.MasoDDH` phải tồn tại trong bảng `DatHang`.
  * **Xử lý vi phạm:** Nếu không tồn tại $\rightarrow$ Ném lỗi `THROW 50001, N'Đơn đặt hàng căn cứ không tồn tại.', 1;` (HTTP 404/400).
* **Rule ID:** `RULE_RECEIPT_002` - Item Order Inclusion Check
  * **Điều kiện:** Tất cả `MAVT` trong `CTPN` phải tồn tại trong `CTDDH` của đơn đặt hàng tương ứng:
    $$\forall \, \text{item} \in \text{ChiTietJSON}, \quad \text{item.mavt} \in \text{CTDDH}(\text{MasoDDH})$$
  * **Xử lý vi phạm:** Ném lỗi `THROW 50001, N'Có vật tư không nằm trong danh mục của đơn đặt hàng này.', 1;` (HTTP 400).

#### 📌 Rule Set 2: Ràng buộc Hạn mức Số lượng nhập
* **Rule ID:** `RULE_RECEIPT_003` - Order Quantity Cap Check
  * **Nguyên tắc:** Số lượng nhập mới không được vượt quá số lượng đặt còn lại của đơn hàng đối với từng vật tư:
    $$\text{SOLUONG}_{\text{nhập mới}} \le \text{CTDDH.SOLUONG} - \sum_{\text{các PN trước}} \text{CTPN.SOLUONG}$$
  * **Ví dụ xuyên suốt:**
    * Đơn hàng `DDH00002` đặt `VT02` (Sắt phi 10) là **300 Kg**.
    * Phiếu nhập `PN000002` đã nhập trước đó **200 Kg**.
    * Lượng còn được phép nhập tối đa là: $300 - 200 = \mathbf{100\text{ Kg}}$.
    * Nếu người dùng lập phiếu nhập mới với số lượng **101 Kg** $\rightarrow$ Hệ thống lập tức **từ chối giao dịch**.
  * **Xử lý vi phạm:** Ném lỗi `THROW 50001, N'Số lượng nhập vượt quá số lượng còn lại được phép nhập của đơn hàng.', 1;` (HTTP 400).

#### 📌 Rule Set 3: Cập nhật Tồn kho Tự động
* **Rule ID:** `RULE_RECEIPT_004` - Auto Inventory Increment
  * **Công thức cập nhật:**
    $$\text{Vattu.Soluongton}_{\text{mới}} = \text{Vattu.Soluongton}_{\text{cũ}} + \text{CTPN.SOLUONG}$$
  * **Bảo đảm toàn vẹn:** Thao tác cập nhật tồn kho phải thực thi bên trong cùng Transaction với lệnh INSERT `PhieuNhap` và `CTPN`.

#### 📌 Rule Set 4: Bảo mật Định danh Nhân viên
* **Rule ID:** `RULE_RECEIPT_005` - Identity Session Binding
  * **Nguyên tắc:** `PhieuNhap.MANV` bắt buộc gán từ `req.user.manv`. Mọi giá trị `manv` trong `req.body` bị xóa bỏ tại Validator.

---

### 4.2. Báo Cáo 2.3 — Đơn Đặt Hàng Chưa Hoàn Tất

#### 📌 Rule Set: Phân loại & Đối soát Đơn hàng
* **Rule ID:** `RULE_REPORT_2_3` - Unfulfilled Orders Evaluation
  * **Tiêu chí lọc:** Đơn hàng có ít nhất 01 vật tư thỏa mãn:
    $$\text{SoLuongConLai} = \text{CTDDH.SOLUONG} - \text{ISNULL}(\text{TongDaNhap}, 0) > 0$$
  * **Phân loại trạng thái:**
    * `Chưa nhập`: Khi $\text{TongDaNhap} = 0$.
    * `Nhập một phần`: Khi $0 < \text{TongDaNhap} < \text{CTDDH.SOLUONG}$.
  * **Quy tắc tính toán:**
    * Tính tổng số lượng đã nhập theo cặp `(MasoDDH, MAVT)` qua bảng CTE trước khi JOIN với `CTDDH`.
    * Tuyệt đối không để xảy ra tình trạng nhân đôi số lượng do quan hệ $1 - N$ giữa Đơn hàng và nhiều Phiếu nhập.

---

### 4.3. Báo Cáo 2.5 — Thống Kê Phiếu Nhập Theo Năm

#### 📌 Rule Set: Thống kê Dòng tiền Nhập kho 12 Tháng
* **Rule ID:** `RULE_REPORT_2_5` - Yearly Receipt Aggregation
  * **Đếm số phiếu:** Sử dụng `COUNT(DISTINCT pn.MAPN)` để mỗi phiếu nhập có nhiều dòng chi tiết chỉ được đếm là 1 phiếu.
  * **Tính tổng tiền:** $\sum (\text{CTPN.SOLUONG} \times \text{CTPN.DONGIA})$ theo từng tháng.
  * **Tính liên tục 12 tháng:** Sử dụng bảng ảo 12 tháng (`Thang12CTE`), tháng nào không có phiếu thì gán `SoPhieuNhap = 0` và `TongGiaTriNhap = 0 VNĐ`.

---

## 5. Module Contracts (Giao Ước Dữ Liệu Giữa Các Thành Viên)

Các Schema JSON chuẩn dưới đây được sử dụng làm hợp đồng giao tiếp (Contract) giữa Frontend của Thành viên 2 và Backend, cũng như để các thành viên khác mock dữ liệu kiểm thử độc lập:

### Contract 1: `CreateReceiptInput` (Payload Lập Phiếu Nhập Mới)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CreateReceiptInput",
  "type": "object",
  "properties": {
    "mapn": {
      "type": "string",
      "maxLength": 8,
      "description": "Mã phiếu nhập duy nhất"
    },
    "masoDDH": {
      "type": "string",
      "maxLength": 8,
      "description": "Mã đơn đặt hàng căn cứ từ Thành viên 1"
    },
    "details": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "properties": {
          "mavt": {
            "type": "string",
            "maxLength": 4,
            "description": "Mã vật tư"
          },
          "soluong": {
            "type": "integer",
            "minimum": 1,
            "description": "Số lượng thực nhập (> 0)"
          },
          "dongia": {
            "type": "number",
            "minimum": 0,
            "description": "Đơn giá nhập (>= 0)"
          }
        },
        "required": ["mavt", "soluong", "dongia"]
      }
    }
  },
  "required": ["mapn", "masoDDH", "details"]
}
```

### Contract 2: `PendingOrdersResponse` (Dữ liệu Báo cáo 2.3)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PendingOrdersResponse",
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "MasoDDH": { "type": "string" },
          "NgayDat": { "type": "string", "format": "date" },
          "NhaCC": { "type": "string" },
          "NhanVienPhuTrach": { "type": "string" },
          "MAVT": { "type": "string" },
          "TENVT": { "type": "string" },
          "DVT": { "type": "string" },
          "SoLuongDat": { "type": "integer" },
          "DonGiaDat": { "type": "number" },
          "SoLuongDaNhap": { "type": "integer" },
          "SoLuongConLai": { "type": "integer" },
          "TrangThaiVatTu": { "type": "string", "enum": ["Chưa nhập", "Nhập một phần"] }
        },
        "required": ["MasoDDH", "MAVT", "SoLuongDat", "SoLuongConLai", "TrangThaiVatTu"]
      }
    }
  },
  "required": ["success", "data"]
}
```

### Contract 3: `ReceiptStatsYearResponse` (Dữ liệu Báo cáo 2.5)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReceiptStatsYearResponse",
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "data": {
      "type": "array",
      "minItems": 12,
      "maxItems": 12,
      "items": {
        "type": "object",
        "properties": {
          "Thang": { "type": "integer", "minimum": 1, "maximum": 12 },
          "Nam": { "type": "integer" },
          "SoPhieuNhap": { "type": "integer", "minimum": 0 },
          "TongGiaTriNhap": { "type": "number", "minimum": 0 }
        },
        "required": ["Thang", "Nam", "SoPhieuNhap", "TongGiaTriNhap"]
      }
    }
  },
  "required": ["success", "data"]
}
```
