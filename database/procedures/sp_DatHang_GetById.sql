-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_DatHang_GetById.sql
-- Mô tả: Lấy thông tin chi tiết một Đơn đặt hàng (Master-Detail)
--        Trả về 2 Recordsets:
--          Recordset 1: Thông tin Master đơn hàng
--          Recordset 2: Danh sách chi tiết vật tư kèm đơn giá, số lượng, thành tiền
-- Tham chiếu: Module 1.3 & Rule 01
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_DatHang_GetById', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DatHang_GetById;
GO

CREATE PROCEDURE dbo.sp_DatHang_GetById
    @MasoDDH NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- Recordset 1: Master chứng từ đơn đặt hàng
    SELECT 
        d.MasoDDH,
        d.NGAY,
        d.NhaCC,
        d.MANV,
        RTRIM(LTRIM(CONCAT(nv.HO, ' ', nv.TEN))) AS HoTenNV,
        ISNULL(SUM(ct.SOLUONG * ct.DONGIA), 0) AS TongTien
    FROM dbo.DatHang d
    LEFT JOIN dbo.Nhanvien nv ON d.MANV = nv.MANV
    LEFT JOIN dbo.CTDDH ct ON d.MasoDDH = ct.MasoDDH
    WHERE d.MasoDDH = @MasoDDH
    GROUP BY 
        d.MasoDDH,
        d.NGAY,
        d.NhaCC,
        d.MANV,
        nv.HO,
        nv.TEN;

    -- Recordset 2: Details danh sách vật tư đặt
    SELECT 
        ct.MasoDDH,
        ct.MAVT,
        vt.TENVT,
        vt.DVT,
        ct.SOLUONG,
        ct.DONGIA,
        (ct.SOLUONG * ct.DONGIA) AS ThanhTien
    FROM dbo.CTDDH ct
    INNER JOIN dbo.Vattu vt ON ct.MAVT = vt.MAVT
    WHERE ct.MasoDDH = @MasoDDH
    ORDER BY ct.MAVT ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_DatHang_GetById';
GO
