-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_Report_ThongKePhieuNhap.sql
-- Mô tả: Báo cáo 2.5 — Thống kê số lượng phiếu nhập và tổng giá trị nhập theo 12 tháng
--         Sử dụng bảng ảo 12 tháng và COUNT(DISTINCT) để chống đếm lặp phiếu.
-- Người phụ trách: Thành viên 2 (Báo biểu nhập kho)
-- Tham chiếu: De.md Mục II.2.5, docs/03-BUSINESS_MODULES.md (RULE_REPORT_2_5)
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_Report_ThongKePhieuNhap', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Report_ThongKePhieuNhap;
GO

CREATE PROCEDURE dbo.sp_Report_ThongKePhieuNhap
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Nếu không truyền năm hoặc năm <= 0, mặc định lấy năm hiện tại
    IF @Nam IS NULL OR @Nam <= 0
        SET @Nam = YEAR(GETDATE());

    -- 1. Tạo bảng ảo 12 tháng
    WITH Thang12CTE AS (
        SELECT 1 AS Thang UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL 
        SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL 
        SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    ),
    -- 2. Thống kê dữ liệu thực tế từ PhieuNhap và CTPN trong năm chỉ định
    DuLieuNhapCTE AS (
        SELECT 
            MONTH(pn.NGAY) AS Thang,
            COUNT(DISTINCT pn.MAPN) AS SoPhieu,
            SUM(ct.SOLUONG * ct.DONGIA) AS TongTriGia
        FROM dbo.PhieuNhap pn
        INNER JOIN dbo.CTPN ct ON pn.MAPN = ct.MAPN
        WHERE YEAR(pn.NGAY) = @Nam
        GROUP BY MONTH(pn.NGAY)
    )
    -- 3. LEFT JOIN để đảm bảo tháng không có giao dịch vẫn hiển thị 0
    SELECT 
        t.Thang,
        @Nam AS Nam,
        ISNULL(d.SoPhieu, 0) AS SoPhieuNhap,
        ISNULL(d.TongTriGia, 0) AS TongGiaTriNhap
    FROM Thang12CTE t
    LEFT JOIN DuLieuNhapCTE d ON t.Thang = d.Thang
    ORDER BY t.Thang ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_Report_ThongKePhieuNhap';
GO
