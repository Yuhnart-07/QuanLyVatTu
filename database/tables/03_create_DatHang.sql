-- =======================================================
-- Bảng: DatHang (Đơn đặt hàng)
-- Mô tả: Lưu thông tin đơn đặt hàng gửi nhà cung cấp
-- Tham chiếu: Phần I.3 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.DatHang', 'U') IS NOT NULL
    DROP TABLE dbo.DatHang;
GO

CREATE TABLE dbo.DatHang (
    MasoDDH     NCHAR(8)        NOT NULL,       -- Mã số đơn đặt hàng (Khóa chính)
    NGAY        DATE            NULL,           -- Ngày lập đơn hàng
    NhaCC       NVARCHAR(100)   NULL,           -- Tên công ty, đại lý cung cấp hàng
    MANV        INT             NULL,           -- Mã nhân viên lập đơn (Khóa ngoại)

    CONSTRAINT PK_DatHang PRIMARY KEY (MasoDDH),
    CONSTRAINT FK_DatHang_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
