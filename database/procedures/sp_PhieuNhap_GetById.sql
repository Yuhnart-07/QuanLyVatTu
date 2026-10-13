-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_PhieuNhap_GetById.sql
-- Mô tả: Lấy thông tin chi tiết của 1 phiếu nhập kho (Master + Details)
-- Người phụ trách: Thành viên 2 (Nhập kho)
-- Tham chiếu: Rule 01 & docs/03-BUSINESS_MODULES.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_PhieuNhap_GetById', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_PhieuNhap_GetById;
GO

CREATE PROCEDURE dbo.sp_PhieuNhap_GetById
    @MAPN NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    -- Recordset 1: Master (Thông tin phiếu cha)
    SELECT 
        pn.MAPN,
        pn.NGAY,
        pn.MasoDDH,
        ddh.NhaCC,
        pn.MANV,
        ISNULL(RTRIM(nv.HO) + ' ' + RTRIM(nv.TEN), N'Chưa rõ') AS HoTenNV
    FROM dbo.PhieuNhap pn
    LEFT JOIN dbo.DatHang ddh ON pn.MasoDDH = ddh.MasoDDH
    LEFT JOIN dbo.Nhanvien nv ON pn.MANV = nv.MANV
    WHERE pn.MAPN = @MAPN;

    -- Recordset 2: Details (Danh sách dòng vật tư con)
    SELECT 
        ct.MAPN,
        ct.MAVT,
        vt.TENVT,
        vt.DVT,
        ct.SOLUONG,
        ct.DONGIA,
        (ct.SOLUONG * ct.DONGIA) AS THANHTIEN
    FROM dbo.CTPN ct
    INNER JOIN dbo.Vattu vt ON ct.MAVT = vt.MAVT
    WHERE ct.MAPN = @MAPN
    ORDER BY ct.MAVT ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_PhieuNhap_GetById';
GO
