-- =======================================================
-- Bảng: Vattu (Vật tư)
-- Mô tả: Lưu danh mục vật tư trong kho
-- Tham chiếu: Phần I.2 - De.md
-- =======================================================
USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Vattu', 'U') IS NOT NULL
    DROP TABLE dbo.Vattu;
GO

CREATE TABLE dbo.Vattu (
    MAVT        NCHAR(4)        NOT NULL,       -- Mã vật tư (Khóa chính)
    TENVT       NVARCHAR(30)    NOT NULL,       -- Tên vật tư (Duy nhất)
    DVT         NVARCHAR(15)    NULL,           -- Đơn vị tính
    Soluongton  INT             NOT NULL DEFAULT 0, -- Số lượng tồn kho

    CONSTRAINT PK_Vattu PRIMARY KEY (MAVT),
    CONSTRAINT UQ_Vattu_TenVT UNIQUE (TENVT)
);
GO
