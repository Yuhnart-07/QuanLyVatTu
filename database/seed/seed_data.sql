-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: seed_data.sql
-- Mô tả: Dữ liệu mẫu kiểm thử chuẩn nghiệp vụ cho cả 8 bảng
-- Tham chiếu: Rule.md mục 14 & De.md Phần I, II
-- ====================================================================================

USE QLVT;
GO

SET NOCOUNT ON;
GO

PRINT N'>>> Đang làm sạch dữ liệu cũ trước khi nạp seed data...';
BEGIN TRANSACTION;

-- Xóa dữ liệu theo thứ tự ngược của quan hệ khóa ngoại
DELETE FROM dbo.CTPX;
DELETE FROM dbo.PhieuXuat;
DELETE FROM dbo.CTPN;
DELETE FROM dbo.PhieuNhap;
DELETE FROM dbo.CTDDH;
DELETE FROM dbo.DatHang;
DELETE FROM dbo.Vattu;
DELETE FROM dbo.Nhanvien;

PRINT N'>>> Đang nạp dữ liệu mẫu...';

-- 1. Nhanvien (5 nhân viên)
INSERT INTO dbo.Nhanvien (MANV, HO, TEN, DIACHI, NGAYSINH, LUONG, GHICHU) VALUES
(1, N'Nguyễn Văn',  N'An',     N'123 Lê Lợi, Q.1, TP.HCM',              '1990-05-15', 8500000, N'Trưởng phòng kho'),
(2, N'Trần Thị',    N'Bình',   N'456 Nguyễn Huệ, Q.3, TP.HCM',          '1992-08-20', 7500000, N'Nhân viên nhập hàng'),
(3, N'Lê Hoàng',    N'Cường',  N'789 Hai Bà Trưng, Q.1, TP.HCM',        '1988-12-01', 9000000, N'Nhân viên xuất kho'),
(4, N'Phạm Minh',   N'Đức',    N'321 Võ Văn Tần, Q.3, TP.HCM',          '1995-03-10', 6500000, N'Nhân viên kiểm kê'),
(5, N'Hoàng Thị',   N'Em',     N'654 Cách Mạng Tháng 8, Q.10, TP.HCM',  '1993-07-25', 7000000, N'Nhân viên thu mua');

-- 2. Vattu (6 loại vật tư xây dựng)
INSERT INTO dbo.Vattu (MAVT, TENVT, DVT, Soluongton) VALUES
(N'VT01', N'Xi măng Hà Tiên',  N'Bao',    150),
(N'VT02', N'Sắt phi 10',       N'Kg',     800),
(N'VT03', N'Gạch ống 4 lỗ',    N'Viên',   3500),
(N'VT04', N'Cát vàng xây dựng',N'M3',     60),
(N'VT05', N'Đá xanh 1x2',      N'M3',     45),
(N'VT06', N'Sơn Dulux nội thất',N'Thùng', 90);

-- 3. DatHang (3 đơn đặt hàng)
INSERT INTO dbo.DatHang (MasoDDH, NGAY, NhaCC, MANV) VALUES
(N'DDH00001', '2024-01-15', N'Công ty TNHH Vật liệu Sài Gòn',  1),
(N'DDH00002', '2024-02-20', N'Đại lý Thép Miền Nam',            5),
(N'DDH00003', '2024-03-10', N'Công ty CP Gạch Ngói Đồng Nai',   1);

-- 4. CTDDH (Chi tiết đơn đặt hàng)
INSERT INTO dbo.CTDDH (MasoDDH, MAVT, SOLUONG, DONGIA) VALUES
(N'DDH00001', N'VT01', 50,   85000),
(N'DDH00001', N'VT04', 20,   250000),
(N'DDH00002', N'VT02', 300,  16000),
(N'DDH00002', N'VT05', 15,   350000),
(N'DDH00003', N'VT03', 2000, 1300),
(N'DDH00003', N'VT06', 30,   480000);

-- 5. PhieuNhap (3 phiếu nhập kho)
INSERT INTO dbo.PhieuNhap (MAPN, NGAY, MasoDDH, MANV) VALUES
(N'PN000001', '2024-01-20', N'DDH00001', 2),
(N'PN000002', '2024-02-25', N'DDH00002', 2),
(N'PN000003', '2024-03-15', N'DDH00003', 4);

-- 6. CTPN (Chi tiết phiếu nhập - SL nhập <= SL đặt)
INSERT INTO dbo.CTPN (MAPN, MAVT, SOLUONG, DONGIA) VALUES
(N'PN000001', N'VT01', 50,   85000),
(N'PN000001', N'VT04', 20,   250000),
(N'PN000002', N'VT02', 200,  16000),   -- Nhập trước 200/300 kg
(N'PN000002', N'VT05', 10,   350000),  -- Nhập trước 10/15 m3
(N'PN000003', N'VT03', 1500, 1300),   -- Nhập trước 1500/2000 viên
(N'PN000003', N'VT06', 30,   480000);

-- 7. PhieuXuat (2 phiếu xuất kho)
INSERT INTO dbo.PhieuXuat (MAPX, NGAY, HOTENKH, MANV) VALUES
(N'PX000001', '2024-02-05', N'Nguyễn Minh Tuấn (CTy Xây Dựng Số 1)', 3),
(N'PX000002', '2024-03-22', N'Trần Văn Hùng (Nhà thầu Hùng Phát)',    3);

-- 8. CTPX (Chi tiết phiếu xuất - SL xuất <= SL tồn)
INSERT INTO dbo.CTPX (MAPX, MAVT, SOLUONG, DONGIA) VALUES
(N'PX000001', N'VT01', 20,  95000),
(N'PX000001', N'VT04', 5,   280000),
(N'PX000002', N'VT02', 100, 19000),
(N'PX000002', N'VT03', 500, 1600);

COMMIT TRANSACTION;
GO

PRINT N'>>> ĐÃ NẠP SEED DATA THÀNH CÔNG CHO CẢ 8 BẢNG QLVT! <<<';
GO
