-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_NhanVien_Create.sql
-- Mô tả: Thêm mới hồ sơ nhân viên
-- Tham chiếu: De.md Mục II.1.1, Rule.md mục 6 & 9, PhanTichNghiepVu.md BR01
-- Ràng buộc: BR01 - Lương tối thiểu 5,000,000 VNĐ
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_NhanVien_Create', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NhanVien_Create;
GO

CREATE PROCEDURE dbo.sp_NhanVien_Create
    @MANV       INT,
    @HO         NVARCHAR(40),
    @TEN        NVARCHAR(10),
    @DIACHI     NVARCHAR(100) = NULL,
    @NGAYSINH   DATE = NULL,
    @LUONG      FLOAT = NULL,
    @GHICHU     NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra trùng khóa chính MANV
    IF EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
    BEGIN
        THROW 50001, N'Mã nhân viên đã tồn tại trong hệ thống.', 1;
        RETURN;
    END

    -- 2. Kiểm tra ràng buộc BR01: Lương tối thiểu 5,000,000 VNĐ
    IF @LUONG IS NOT NULL AND @LUONG < 5000000
    BEGIN
        THROW 50001, N'Lương nhân viên phải tối thiểu từ 5,000,000 VNĐ (BR01).', 1;
        RETURN;
    END

    -- 3. Thêm mới bản ghi
    INSERT INTO dbo.Nhanvien (MANV, HO, TEN, DIACHI, NGAYSINH, LUONG, GHICHU)
    VALUES (@MANV, @HO, @TEN, @DIACHI, @NGAYSINH, @LUONG, @GHICHU);
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_NhanVien_Create';
GO
