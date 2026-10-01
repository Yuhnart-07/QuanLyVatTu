-- =======================================================
-- Bảng: PhieuXuat (Phiếu xuất hàng)
-- Mô tả: Lưu thông tin phiếu xuất kho bán hàng
-- Tham chiếu: Phần I.7 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.PhieuXuat', 'U') IS NOT NULL
    DROP TABLE dbo.PhieuXuat;
GO

CREATE TABLE dbo.PhieuXuat (
    MAPX        NCHAR(8)        NOT NULL,       -- Mã phiếu xuất (Khóa chính)
    NGAY        DATE            NOT NULL DEFAULT GETDATE(), -- Ngày xuất kho
    HOTENKH     NVARCHAR(100)   NULL,           -- Họ tên khách hàng
    MANV        INT             NULL,           -- Mã nhân viên xuất (Khóa ngoại)

    CONSTRAINT PK_PhieuXuat PRIMARY KEY (MAPX),
    CONSTRAINT FK_PhieuXuat_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
