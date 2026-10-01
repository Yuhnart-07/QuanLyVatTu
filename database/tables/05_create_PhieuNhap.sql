-- =======================================================
-- Bảng: PhieuNhap (Phiếu nhập hàng)
-- Mô tả: Lưu thông tin phiếu nhập hàng từ đơn đặt hàng
-- Tham chiếu: Phần I.5 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.PhieuNhap', 'U') IS NOT NULL
    DROP TABLE dbo.PhieuNhap;
GO

CREATE TABLE dbo.PhieuNhap (
    MAPN        NCHAR(8)        NOT NULL,       -- Mã phiếu nhập (Khóa chính)
    NGAY        DATE            NOT NULL DEFAULT GETDATE(), -- Ngày nhập hàng
    MasoDDH     NCHAR(8)        NULL,           -- Mã đơn đặt hàng (Khóa ngoại)
    MANV        INT             NULL,           -- Mã nhân viên lập phiếu (Khóa ngoại)

    CONSTRAINT PK_PhieuNhap PRIMARY KEY (MAPN),
    CONSTRAINT FK_PhieuNhap_DatHang FOREIGN KEY (MasoDDH) 
        REFERENCES dbo.DatHang(MasoDDH),
    CONSTRAINT FK_PhieuNhap_NhanVien FOREIGN KEY (MANV) 
        REFERENCES dbo.Nhanvien(MANV)
);
GO
