-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_Report_DDHChuaHoanTat.sql
-- Mô tả: Báo cáo 2.3 — Đơn đặt hàng chưa hoàn tất (Chưa nhập hoặc nhập chưa đủ)
--         Sử dụng CTE để tính tổng lượng nhập, tránh nhân bản dòng khi JOIN.
-- Người phụ trách: Thành viên 2 (Báo biểu nhập kho)
-- Tham chiếu: De.md Mục II.2.3, docs/03-BUSINESS_MODULES.md (RULE_REPORT_2_3)
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_Report_DDHChuaHoanTat', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Report_DDHChuaHoanTat;
GO

CREATE PROCEDURE dbo.sp_Report_DDHChuaHoanTat
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Tính tổng số lượng đã nhập của từng vật tư theo từng đơn hàng
    WITH DaNhapCTE AS (
        SELECT 
            pn.MasoDDH,
            ctpn.MAVT,
            SUM(ctpn.SOLUONG) AS TongDaNhap
        FROM dbo.PhieuNhap pn
        INNER JOIN dbo.CTPN ctpn ON pn.MAPN = ctpn.MAPN
        WHERE pn.MasoDDH IS NOT NULL
        GROUP BY pn.MasoDDH, ctpn.MAVT
    )
    -- 2. Kết nối với CTDDH để tính toán số lượng còn thiếu
    SELECT 
        d.MasoDDH,
        d.NGAY AS NgayDat,
        d.NhaCC,
        ISNULL(RTRIM(nv.HO) + ' ' + RTRIM(nv.TEN), N'Chưa rõ') AS NhanVienPhuTrach,
        c.MAVT,
        vt.TENVT,
        vt.DVT,
        c.SOLUONG AS SoLuongDat,
        c.DONGIA AS DonGiaDat,
        ISNULL(dn.TongDaNhap, 0) AS SoLuongDaNhap,
        (c.SOLUONG - ISNULL(dn.TongDaNhap, 0)) AS SoLuongConLai,
        CASE 
            WHEN ISNULL(dn.TongDaNhap, 0) = 0 THEN N'Chưa nhập'
            ELSE N'Nhập một phần'
        END AS TrangThaiVatTu
    FROM dbo.DatHang d
    INNER JOIN dbo.CTDDH c ON d.MasoDDH = c.MasoDDH
    INNER JOIN dbo.Vattu vt ON c.MAVT = vt.MAVT
    LEFT JOIN dbo.Nhanvien nv ON d.MANV = nv.MANV
    LEFT JOIN DaNhapCTE dn ON c.MasoDDH = dn.MasoDDH AND c.MAVT = dn.MAVT
    -- Chỉ lấy các dòng vật tư mà lượng đặt > lượng đã nhập
    WHERE (c.SOLUONG - ISNULL(dn.TongDaNhap, 0)) > 0
    ORDER BY d.NGAY DESC, d.MasoDDH ASC, c.MAVT ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_Report_DDHChuaHoanTat';
GO
