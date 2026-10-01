-- =======================================================
-- Bảng: CTPX (Chi tiết phiếu xuất hàng)
-- Mô tả: Lưu chi tiết vật tư, số lượng và đơn giá xuất
-- Tham chiếu: Phần I.8 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.CTPX', 'U') IS NOT NULL
    DROP TABLE dbo.CTPX;
GO

CREATE TABLE dbo.CTPX (
    MAPX        NCHAR(8)    NOT NULL,           -- Mã phiếu xuất (FK)
    MAVT        NCHAR(4)    NOT NULL,           -- Mã vật tư (FK)
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
