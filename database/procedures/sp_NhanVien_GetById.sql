-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_NhanVien_GetById.sql
-- Mô tả: Lấy thông tin chi tiết một nhân viên theo mã nhân viên (MANV)
-- Tham chiếu: De.md Mục II.1.1, Rule.md mục 9
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_NhanVien_GetById', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NhanVien_GetById;
GO

CREATE PROCEDURE dbo.sp_NhanVien_GetById
    @MANV INT
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
    WHERE MANV = @MANV;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_NhanVien_GetById';
GO
