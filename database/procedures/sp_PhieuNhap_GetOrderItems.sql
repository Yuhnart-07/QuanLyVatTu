-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_PhieuNhap_GetOrderItems.sql
-- Mô tả: Lấy danh sách vật tư theo Đơn đặt hàng kèm số lượng đã đặt, đã nhập và còn lại
--         Hỗ trợ Frontend hiển thị form lập phiếu nhập thông minh (UX).
-- Người phụ trách: Thành viên 2 (Nhập kho)
-- Tham chiếu: docs/03-BUSINESS_MODULES.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_PhieuNhap_GetOrderItems', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_PhieuNhap_GetOrderItems;
GO

CREATE PROCEDURE dbo.sp_PhieuNhap_GetOrderItems
    @MasoDDH NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra đơn hàng có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM dbo.DatHang WHERE MasoDDH = @MasoDDH)
    BEGIN
        THROW 50001, N'Đơn đặt hàng không tồn tại trong hệ thống.', 1;
    END;

    -- CTE tính tổng đã nhập của từng vật tư thuộc đơn hàng này
    ;WITH DaNhapCTE AS (
        SELECT 
            ctpn.MAVT,
            SUM(ctpn.SOLUONG) AS TongDaNhap
        FROM dbo.CTPN ctpn
        INNER JOIN dbo.PhieuNhap pn ON ctpn.MAPN = pn.MAPN
        WHERE pn.MasoDDH = @MasoDDH
        GROUP BY ctpn.MAVT
    )
    SELECT 
        c.MasoDDH,
        c.MAVT,
        vt.TENVT,
        vt.DVT,
        c.DONGIA AS DonGiaDat,
        c.SOLUONG AS SoLuongDat,
        ISNULL(dn.TongDaNhap, 0) AS DaNhap,
        (c.SOLUONG - ISNULL(dn.TongDaNhap, 0)) AS ConLai
    FROM dbo.CTDDH c
    INNER JOIN dbo.Vattu vt ON c.MAVT = vt.MAVT
    LEFT JOIN DaNhapCTE dn ON c.MAVT = dn.MAVT
    WHERE c.MasoDDH = @MasoDDH
    ORDER BY c.MAVT ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_PhieuNhap_GetOrderItems';
GO
