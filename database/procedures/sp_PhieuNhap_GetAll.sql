-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_PhieuNhap_GetAll.sql
-- Mô tả: Lấy danh sách toàn bộ phiếu nhập kho kèm tổng giá trị và họ tên nhân viên
-- Người phụ trách: Thành viên 2 (Nhập kho)
-- Tham chiếu: Rule.md mục 9 & docs/03-BUSINESS_MODULES.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_PhieuNhap_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_PhieuNhap_GetAll;
GO

CREATE PROCEDURE dbo.sp_PhieuNhap_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        pn.MAPN, 
        pn.NGAY, 
        pn.MasoDDH, 
        ddh.NhaCC,
        pn.MANV,
        ISNULL(RTRIM(nv.HO) + ' ' + RTRIM(nv.TEN), N'Chưa rõ') AS HoTenNV,
        ISNULL(SUM(ct.SOLUONG * ct.DONGIA), 0) AS TongTien
    FROM dbo.PhieuNhap pn
    LEFT JOIN dbo.DatHang ddh ON pn.MasoDDH = ddh.MasoDDH
    LEFT JOIN dbo.Nhanvien nv ON pn.MANV = nv.MANV
    LEFT JOIN dbo.CTPN ct ON pn.MAPN = ct.MAPN
    GROUP BY pn.MAPN, pn.NGAY, pn.MasoDDH, ddh.NhaCC, pn.MANV, nv.HO, nv.TEN
    ORDER BY pn.NGAY DESC, pn.MAPN DESC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_PhieuNhap_GetAll';
GO
