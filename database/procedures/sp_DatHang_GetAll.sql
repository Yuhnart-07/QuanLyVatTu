-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_DatHang_GetAll.sql
-- Mô tả: Lấy danh sách toàn bộ Đơn đặt hàng kèm tên nhân viên và tổng giá trị đơn hàng
-- Tham chiếu: Module 1.3 & Rule.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_DatHang_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DatHang_GetAll;
GO

CREATE PROCEDURE dbo.sp_DatHang_GetAll
AS
BEGIN
    SET NOCOUNT ON;

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
    GROUP BY 
        d.MasoDDH,
        d.NGAY,
        d.NhaCC,
        d.MANV,
        nv.HO,
        nv.TEN
    ORDER BY d.NGAY DESC, d.MasoDDH DESC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_DatHang_GetAll';
GO
