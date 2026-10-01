-- =======================================================
-- Bảng: CTPN (Chi tiết phiếu nhập hàng)
-- Mô tả: Lưu chi tiết số lượng và đơn giá vật tư thực nhập
-- Tham chiếu: Phần I.6 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.CTPN', 'U') IS NOT NULL
    DROP TABLE dbo.CTPN;
GO

CREATE TABLE dbo.CTPN (
    MAPN        NCHAR(8)    NOT NULL,           -- Mã phiếu nhập (FK)
    MAVT        NCHAR(4)    NOT NULL,           -- Mã vật tư (FK)
    SOLUONG     INT         NOT NULL,           -- Số lượng thực nhập (> 0)
    DONGIA      FLOAT       NOT NULL,           -- Đơn giá nhập (>= 0)

    CONSTRAINT PK_CTPN PRIMARY KEY (MAPN, MAVT),
    CONSTRAINT FK_CTPN_PhieuNhap FOREIGN KEY (MAPN) 
        REFERENCES dbo.PhieuNhap(MAPN),
    CONSTRAINT FK_CTPN_Vattu FOREIGN KEY (MAVT) 
        REFERENCES dbo.Vattu(MAVT),
    CONSTRAINT CK_CTPN_SoLuong CHECK (SOLUONG > 0),
    CONSTRAINT CK_CTPN_DonGia CHECK (DONGIA >= 0)
);
GO
