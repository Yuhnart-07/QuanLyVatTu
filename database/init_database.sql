-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: init_database.sql
-- Mô tả: Script khởi tạo hoàn chỉnh CSDL QLVT và 8 bảng theo đúng Phần I - De.md
-- Cách dùng: Mở trong SQL Server Management Studio (SSMS) và bấm EXECUTE (F5) 1 lần duy nhất
-- ====================================================================================

-- 1. TẠO CSDL NẾU CHƯA CÓ
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QLVT')
BEGIN
    CREATE DATABASE QLVT;
    PRINT N'>>> Đã tạo thành công Cơ sở dữ liệu QLVT.';
END
ELSE
BEGIN
    PRINT N'>>> Cơ sở dữ liệu QLVT đã tồn tại.';
END
GO

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- 2. XÓA CÁC BẢNG CŨ THEO ĐÚNG THỨ TỰ RÀNG BUỘC KHÓA NGOẠI (NẾU CÓ)
IF OBJECT_ID('dbo.CTPX', 'U') IS NOT NULL DROP TABLE dbo.CTPX;
IF OBJECT_ID('dbo.PhieuXuat', 'U') IS NOT NULL DROP TABLE dbo.PhieuXuat;
IF OBJECT_ID('dbo.CTPN', 'U') IS NOT NULL DROP TABLE dbo.CTPN;
IF OBJECT_ID('dbo.PhieuNhap', 'U') IS NOT NULL DROP TABLE dbo.PhieuNhap;
IF OBJECT_ID('dbo.CTDDH', 'U') IS NOT NULL DROP TABLE dbo.CTDDH;
IF OBJECT_ID('dbo.DatHang', 'U') IS NOT NULL DROP TABLE dbo.DatHang;
IF OBJECT_ID('dbo.Vattu', 'U') IS NOT NULL DROP TABLE dbo.Vattu;
IF OBJECT_ID('dbo.Nhanvien', 'U') IS NOT NULL DROP TABLE dbo.Nhanvien;
GO

PRINT N'>>> Bắt đầu tạo 8 bảng theo đúng chuẩn Phần I - De.md...';
GO

-- =======================================================
-- BẢNG 1: Nhanvien (Nhân viên)
-- =======================================================
CREATE TABLE dbo.Nhanvien (
    MANV        INT             NOT NULL,       -- Mã nhân viên
    HO          NVARCHAR(40)    NULL,           -- Họ nhân viên
    TEN         NVARCHAR(10)    NULL,           -- Tên nhân viên
    DIACHI      NVARCHAR(100)   NULL,           -- Địa chỉ
    NGAYSINH    DATE            NULL,           -- Ngày sinh
    LUONG       FLOAT           NULL,           -- Lương tối thiểu 5 triệu
    GHICHU      TEXT            NULL,           -- Ghi chú thêm

    CONSTRAINT PK_Nhanvien PRIMARY KEY (MANV),
    CONSTRAINT CK_Nhanvien_Luong CHECK (LUONG >= 5000000)
);
GO
PRINT N'  [OK] Tạo bảng 1: Nhanvien';

-- =======================================================
-- BẢNG 2: Vattu (Vật tư)
-- =======================================================
CREATE TABLE dbo.Vattu (
    MAVT        NCHAR(4)        NOT NULL,       -- Mã vật tư
    TENVT       NVARCHAR(30)    NOT NULL,       -- Tên vật tư (Duy nhất)
    DVT         NVARCHAR(15)    NULL,           -- Đơn vị tính
    Soluongton  INT             NOT NULL DEFAULT 0, -- Số lượng tồn kho

    CONSTRAINT PK_Vattu PRIMARY KEY (MAVT),
    CONSTRAINT UQ_Vattu_TenVT UNIQUE (TENVT)
);
GO
PRINT N'  [OK] Tạo bảng 2: Vattu';

-- =======================================================
-- BẢNG 3: DatHang (Đơn đặt hàng)
-- =======================================================
CREATE TABLE dbo.DatHang (
    MasoDDH     NCHAR(8)        NOT NULL,       -- Mã số đơn đặt hàng
    NGAY        DATE            NULL,           -- Ngày lập đơn hàng
    NhaCC       NVARCHAR(100)   NULL,           -- Tên công ty, đại lý cung cấp hàng
    MANV        INT             NULL,           -- Khóa ngoại tham chiếu Nhanvien(MANV)

    CONSTRAINT PK_DatHang PRIMARY KEY (MasoDDH),
    CONSTRAINT FK_DatHang_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
PRINT N'  [OK] Tạo bảng 3: DatHang';

-- =======================================================
-- BẢNG 4: CTDDH (Chi tiết đơn đặt hàng)
-- =======================================================
CREATE TABLE dbo.CTDDH (
    MasoDDH     NCHAR(8)    NOT NULL,           -- Khóa ngoại tham chiếu DatHang(MasoDDH)
    MAVT        NCHAR(4)    NOT NULL,           -- Khóa ngoại tham chiếu Vattu(MAVT)
    SOLUONG     INT         NOT NULL,           -- Số lượng đặt hàng (> 0)
    DONGIA      FLOAT       NOT NULL,           -- Đơn giá đặt hàng (>= 0)

    CONSTRAINT PK_CTDDH PRIMARY KEY (MasoDDH, MAVT),
    CONSTRAINT FK_CTDDH_DatHang FOREIGN KEY (MasoDDH) 
        REFERENCES dbo.DatHang(MasoDDH),
    CONSTRAINT FK_CTDDH_Vattu FOREIGN KEY (MAVT) 
        REFERENCES dbo.Vattu(MAVT),
    CONSTRAINT CK_CTDDH_SoLuong CHECK (SOLUONG > 0),
    CONSTRAINT CK_CTDDH_DonGia CHECK (DONGIA >= 0)
);
GO
PRINT N'  [OK] Tạo bảng 4: CTDDH';

-- =======================================================
-- BẢNG 5: PhieuNhap (Phiếu nhập hàng)
-- =======================================================
CREATE TABLE dbo.PhieuNhap (
    MAPN        NCHAR(8)        NOT NULL,       -- Mã phiếu nhập
    NGAY        DATE            NOT NULL DEFAULT GETDATE(), -- Ngày nhập (mặc định GETDATE())
    MasoDDH     NCHAR(8)        NULL,           -- Khóa ngoại tham chiếu DatHang(MasoDDH)
    MANV        INT             NULL,           -- Khóa ngoại tham chiếu Nhanvien(MANV)

    CONSTRAINT PK_PhieuNhap PRIMARY KEY (MAPN),
    CONSTRAINT FK_PhieuNhap_DatHang FOREIGN KEY (MasoDDH) 
        REFERENCES dbo.DatHang(MasoDDH),
    CONSTRAINT FK_PhieuNhap_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
PRINT N'  [OK] Tạo bảng 5: PhieuNhap';

-- =======================================================
-- BẢNG 6: CTPN (Chi tiết phiếu nhập hàng)
-- =======================================================
CREATE TABLE dbo.CTPN (
    MAPN        NCHAR(8)    NOT NULL,           -- Khóa ngoại tham chiếu PhieuNhap(MAPN)
    MAVT        NCHAR(4)    NOT NULL,           -- Khóa ngoại tham chiếu Vattu(MAVT)
    SOLUONG     INT         NOT NULL,           -- Số lượng thực nhập (> 0)
    DONGIA      FLOAT       NOT NULL,           -- Đơn giá nhập hàng (>= 0)

    CONSTRAINT PK_CTPN PRIMARY KEY (MAPN, MAVT),
    CONSTRAINT FK_CTPN_PhieuNhap FOREIGN KEY (MAPN) 
        REFERENCES dbo.PhieuNhap(MAPN),
    CONSTRAINT FK_CTPN_Vattu FOREIGN KEY (MAVT) 
        REFERENCES dbo.Vattu(MAVT),
    CONSTRAINT CK_CTPN_SoLuong CHECK (SOLUONG > 0),
    CONSTRAINT CK_CTPN_DonGia CHECK (DONGIA >= 0)
);
GO
PRINT N'  [OK] Tạo bảng 6: CTPN';

-- =======================================================
-- BẢNG 7: PhieuXuat (Phiếu xuất hàng)
-- =======================================================
CREATE TABLE dbo.PhieuXuat (
    MAPX        NCHAR(8)        NOT NULL,       -- Mã phiếu xuất
    NGAY        DATE            NOT NULL DEFAULT GETDATE(), -- Ngày xuất kho (mặc định GETDATE())
    HOTENKH     NVARCHAR(100)   NULL,           -- Họ tên khách hàng
    MANV        INT             NULL,           -- Khóa ngoại tham chiếu Nhanvien(MANV)

    CONSTRAINT PK_PhieuXuat PRIMARY KEY (MAPX),
    CONSTRAINT FK_PhieuXuat_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
PRINT N'  [OK] Tạo bảng 7: PhieuXuat';

-- =======================================================
-- BẢNG 8: CTPX (Chi tiết phiếu xuất hàng)
-- =======================================================
CREATE TABLE dbo.CTPX (
    MAPX        NCHAR(8)    NOT NULL,           -- Khóa ngoại tham chiếu PhieuXuat(MAPX)
    MAVT        NCHAR(4)    NOT NULL,           -- Khóa ngoại tham chiếu Vattu(MAVT)
    SOLUONG     INT         NOT NULL,           -- Số lượng xuất bán (> 0)
    DONGIA      FLOAT       NOT NULL,           -- Đơn giá xuất (>= 0)

    CONSTRAINT PK_CTPX PRIMARY KEY (MAPX, MAVT),
    CONSTRAINT FK_CTPX_PhieuXuat FOREIGN KEY (MAPX) 
        REFERENCES dbo.PhieuXuat(MAPX),
    CONSTRAINT FK_CTPX_Vattu FOREIGN KEY (MAVT) 
        REFERENCES dbo.Vattu(MAVT),
    CONSTRAINT CK_CTPX_SoLuong CHECK (SOLUONG > 0),
    CONSTRAINT CK_CTPX_DonGia CHECK (DONGIA >= 0)
);
GO
PRINT N'  [OK] Tạo bảng 8: CTPX';

PRINT N'===========================================================';
PRINT N'>>> KHỞI TẠO BỘ CƠ SỞ DỮ LIỆU QLVT THÀNH CÔNG 100%! <<<';
PRINT N'===========================================================';
GO
