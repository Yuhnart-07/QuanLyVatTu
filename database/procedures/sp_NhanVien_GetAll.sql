-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_NhanVien_GetAll.sql
-- Mô tả: Lấy danh sách toàn bộ nhân viên trong hệ thống
-- Tham chiếu: De.md Mục II.1.1, Rule.md mục 9
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_NhanVien_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NhanVien_GetAll;
GO

CREATE PROCEDURE dbo.sp_NhanVien_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MANV, 
        HO, 
        TEN, 
        DIACHI, 
        NGAYSINH, 
        LUONG, 
        GHICHU 
    FROM dbo.Nhanvien 
    ORDER BY MANV ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_NhanVien_GetAll';
GO
