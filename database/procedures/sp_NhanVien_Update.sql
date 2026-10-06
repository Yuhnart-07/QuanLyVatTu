-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_NhanVien_Update.sql
-- Mô tả: Cập nhật thông tin hồ sơ nhân viên
-- Tham chiếu: De.md Mục II.1.1, Rule.md mục 6 & 9, PhanTichNghiepVu.md BR01
-- Ràng buộc: BR01 - Lương tối thiểu 5,000,000 VNĐ
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_NhanVien_Update', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NhanVien_Update;
GO

CREATE PROCEDURE dbo.sp_NhanVien_Update
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

    -- 1. Kiểm tra tồn tại nhân viên
    IF NOT EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
    BEGIN
        THROW 50001, N'Không tìm thấy nhân viên cần cập nhật.', 1;
        RETURN;
    END

    -- 2. Kiểm tra ràng buộc BR01: Lương tối thiểu 5,000,000 VNĐ
    IF @LUONG IS NOT NULL AND @LUONG < 5000000
    BEGIN
        THROW 50001, N'Lương nhân viên phải tối thiểu từ 5,000,000 VNĐ (BR01).', 1;
        RETURN;
    END

    -- 3. Cập nhật bản ghi
    UPDATE dbo.Nhanvien
    SET HO = @HO,
        TEN = @TEN,
        DIACHI = @DIACHI,
        NGAYSINH = @NGAYSINH,
        LUONG = @LUONG,
        GHICHU = @GHICHU
    WHERE MANV = @MANV;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_NhanVien_Update';
GO
