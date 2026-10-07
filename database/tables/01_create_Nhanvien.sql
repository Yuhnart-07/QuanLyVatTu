-- =======================================================
-- Bảng: Nhanvien (Nhân viên)
-- Mô tả: Lưu thông tin nhân viên cửa hàng
-- Tham chiếu: Phần I.1 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Nhanvien', 'U') IS NOT NULL
    DROP TABLE dbo.Nhanvien;
GO

CREATE TABLE dbo.Nhanvien (
    MANV        INT             NOT NULL,       -- Mã nhân viên (Khóa chính)
    HO          NVARCHAR(40)    NULL,           -- Họ nhân viên
    TEN         NVARCHAR(10)    NULL,           -- Tên nhân viên
    DIACHI      NVARCHAR(100)   NULL,           -- Địa chỉ
    NGAYSINH    DATE            NULL,           -- Ngày sinh
    LUONG       FLOAT           NULL,           -- Lương (tối thiểu 5,000,000)
    GHICHU      NVARCHAR(MAX)   NULL,           -- Ghi chú thêm

    CONSTRAINT PK_Nhanvien PRIMARY KEY (MANV),
    CONSTRAINT CK_Nhanvien_Luong CHECK (LUONG >= 5000000)
);
GO
