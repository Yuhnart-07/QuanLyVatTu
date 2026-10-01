-- =======================================================
-- Bảng: CTDDH (Chi tiết đơn đặt hàng)
-- Mô tả: Lưu danh sách vật tư và số lượng/đơn giá của từng đơn đặt
-- Tham chiếu: Phần I.4 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.CTDDH', 'U') IS NOT NULL
    DROP TABLE dbo.CTDDH;
GO

CREATE TABLE dbo.CTDDH (
    MasoDDH     NCHAR(8)    NOT NULL,           -- Mã số đơn đặt hàng (FK)
    MAVT        NCHAR(4)    NOT NULL,           -- Mã vật tư (FK)
    SOLUONG     INT         NOT NULL,           -- Số lượng đặt (> 0)
    DONGIA      FLOAT       NOT NULL,           -- Đơn giá đặt (>= 0)

    CONSTRAINT PK_CTDDH PRIMARY KEY (MasoDDH, MAVT),
    CONSTRAINT FK_CTDDH_DatHang FOREIGN KEY (MasoDDH) 
        REFERENCES dbo.DatHang(MasoDDH),
    CONSTRAINT FK_CTDDH_Vattu FOREIGN KEY (MAVT) 
        REFERENCES dbo.Vattu(MAVT),
    CONSTRAINT CK_CTDDH_SoLuong CHECK (SOLUONG > 0),
    CONSTRAINT CK_CTDDH_DonGia CHECK (DONGIA >= 0)
);
GO
