-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_Login_GetAll.sql
-- Mô tả: Lấy danh sách toàn bộ nhân viên kèm trạng thái tài khoản Login SQL Server.
--         Phục vụ nạp dữ liệu Dropdown chọn nhân viên và Bảng đối soát tài khoản (Mục 3.1).
-- Tham chiếu: De.md Mục II.3.1, Rule 04, PhanTichNghiepVu.md UC05
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_Login_GetAll', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Login_GetAll;
GO

CREATE PROCEDURE dbo.sp_Login_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    -- Truy vấn danh sách nhân viên kết hợp với thông tin Database User và Server Login
    -- Ánh xạ qua tên Database User (chính là MANV dạng số nguyên theo chuẩn Rule 04)
    -- và nối với sys.server_principals qua trường SID để lấy tên Login và nhóm quyền.
    SELECT 
        nv.MANV,
        RTRIM(nv.HO) AS HO,
        RTRIM(nv.TEN) AS TEN,
        RTRIM(nv.HO) + N' ' + RTRIM(nv.TEN) AS HoTen,
        CASE 
            WHEN sp.name IS NOT NULL THEN 1 
            ELSE 0 
        END AS HasLogin,
        sp.name AS Username,
        role_dp.name AS Role
    FROM dbo.Nhanvien nv
    -- Liên kết sang Database Principals trong CSDL QLVT:
    -- Tên Database User bắt buộc là chuỗi MÃ NHÂN VIÊN (MANV) dạng số nguyên
    LEFT JOIN sys.database_principals dp 
        ON TRY_CAST(dp.name AS INT) = nv.MANV
    -- Liên kết sang Server Principals để lấy Server Login thông qua SID bảo mật
    LEFT JOIN sys.server_principals sp 
        ON dp.sid = sp.sid AND sp.type = 'S'
    -- Xác định thành viên trong Role Admin hoặc Nhanvien
    LEFT JOIN sys.database_role_members drm 
        ON dp.principal_id = drm.member_principal_id
    LEFT JOIN sys.database_principals role_dp 
        ON drm.role_principal_id = role_dp.principal_id AND role_dp.name IN (N'Admin', N'Nhanvien')
    ORDER BY nv.MANV ASC;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_Login_GetAll';
GO
