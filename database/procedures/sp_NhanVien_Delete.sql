-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_NhanVien_Delete.sql
-- Mô tả: Xóa nhân viên theo mã nhân viên (MANV)
-- Tham chiếu: De.md Mục II.1.1, Rule.md mục 6 & 9, PhanTichNghiepVu.md BR11
-- Ràng buộc: BR11 - Chặn xóa nếu nhân viên đã đứng tên lập Đơn đặt hàng, Phiếu nhập hoặc Phiếu xuất
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_NhanVien_Delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_NhanVien_Delete;
GO

CREATE PROCEDURE dbo.sp_NhanVien_Delete
    @MANV INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra tồn tại nhân viên
    IF NOT EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
    BEGIN
        THROW 50001, N'Không tìm thấy nhân viên cần xóa.', 1;
        RETURN;
    END

    -- 2. Kiểm tra ràng buộc BR11: Không xóa nếu đã lập Đơn đặt hàng, Phiếu nhập hoặc Phiếu xuất
    IF EXISTS (SELECT 1 FROM dbo.DatHang WHERE MANV = @MANV)
       OR EXISTS (SELECT 1 FROM dbo.PhieuNhap WHERE MANV = @MANV)
       OR EXISTS (SELECT 1 FROM dbo.PhieuXuat WHERE MANV = @MANV)
    BEGIN
        THROW 50001, N'Không thể xóa nhân viên này vì đã đứng tên lập Đơn đặt hàng, Phiếu nhập hoặc Phiếu xuất (BR11).', 1;
        RETURN;
    END

    -- 3. Thực thi xóa bản ghi
    DELETE FROM dbo.Nhanvien WHERE MANV = @MANV;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_NhanVien_Delete';
GO
