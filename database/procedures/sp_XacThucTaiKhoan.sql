-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_XacThucTaiKhoan.sql
-- Mô tả: Xác thực tài khoản đăng nhập qua SQL Server Security (RULE 04)
--         Dùng hàm PWDCOMPARE để so khớp mật khẩu trực tiếp trong SP.
--         Ánh xạ Login qua SID sang Database User Name (chính là MANV dạng số).
--         Truy vấn Role (Admin / Nhanvien) qua sys.database_role_members.
-- Tham chiếu: Rule.md mục 12 & Rule 04, ImplementMap.md mục 7.1 & 12
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_XacThucTaiKhoan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_XacThucTaiKhoan;
GO

CREATE PROCEDURE dbo.sp_XacThucTaiKhoan
    @Username   NVARCHAR(50),
    @Password   NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- -------------------------------------------------------
    -- 1. Kiểm tra Login có tồn tại trong hệ thống SQL Server
    -- -------------------------------------------------------
    DECLARE @PasswordHash VARBINARY(MAX);

    SELECT @PasswordHash = password_hash
    FROM sys.sql_logins
    WHERE name = @Username;

    IF @PasswordHash IS NULL
        THROW 50001, N'Tên đăng nhập không tồn tại trong hệ thống.', 1;

    -- -------------------------------------------------------
    -- 2. So khớp mật khẩu bằng hàm PWDCOMPARE gốc SQL Server
    -- -------------------------------------------------------
    IF PWDCOMPARE(@Password, @PasswordHash) = 0
        THROW 50001, N'Mật khẩu không chính xác.', 1;

    -- -------------------------------------------------------
    -- 3. Tìm Database User tương ứng với Login trong CSDL QLVT (RULE 04)
    -- -------------------------------------------------------
    DECLARE @DbUserName NVARCHAR(128);

    SELECT @DbUserName = dp.name
    FROM sys.database_principals dp
    INNER JOIN sys.server_principals sp ON dp.sid = sp.sid
    WHERE sp.name = @Username;

    IF @DbUserName IS NULL
    BEGIN
        THROW 50001, N'Tài khoản chưa được phân quyền truy cập vào cơ sở dữ liệu QLVT!', 1;
    END

    -- -------------------------------------------------------
    -- 4. Xác định MANV từ Database User Name (Quy ước: User Name chính là MANV)
    -- -------------------------------------------------------
    DECLARE @MANV INT = NULL;

    -- Ưu tiên 1: Tên Database User là số nguyên thuần túy (chính là MANV theo chuẩn của Thầy)
    SET @MANV = TRY_CAST(@DbUserName AS INT);

    -- Fallback tương thích ngược (nếu CSDL cũ còn User dạng NV_1 hoặc USER_1)
    IF @MANV IS NULL AND @DbUserName LIKE 'NV[_]%'
        SET @MANV = TRY_CAST(SUBSTRING(@DbUserName, 4, LEN(@DbUserName)) AS INT);
    ELSE IF @MANV IS NULL AND @DbUserName LIKE 'USER[_]%'
        SET @MANV = TRY_CAST(SUBSTRING(@DbUserName, 6, LEN(@DbUserName)) AS INT);

    IF @MANV IS NULL
    BEGIN
        THROW 50001, N'Không thể xác định mã nhân viên từ định danh bảo mật!', 1;
    END

    -- Kiểm tra MANV có tồn tại trong bảng Nhanvien
    IF NOT EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
        THROW 50001, N'Không tìm thấy nhân viên tương ứng với tài khoản này.', 1;

    -- -------------------------------------------------------
    -- 5. Xác định Role qua sys.database_role_members
    --    Ưu tiên: Admin > Nhanvien. Nếu không có role -> Báo lỗi.
    -- -------------------------------------------------------
    DECLARE @Role NVARCHAR(20) = NULL;

    SELECT TOP 1 @Role = role_dp.name
    FROM sys.database_role_members drm
    INNER JOIN sys.database_principals role_dp ON drm.role_principal_id = role_dp.principal_id
    INNER JOIN sys.database_principals member_dp ON drm.member_principal_id = member_dp.principal_id
    WHERE member_dp.name = @DbUserName
      AND role_dp.name IN (N'Admin', N'Nhanvien')
    ORDER BY CASE WHEN role_dp.name = N'Admin' THEN 1 ELSE 2 END; -- Ưu tiên Admin nếu thuộc cả 2 nhóm

    IF @Role IS NULL
    BEGIN
        THROW 50001, N'Tài khoản chưa được phân quyền trong hệ thống.', 1;
    END

    -- -------------------------------------------------------
    -- 6. Trả về thông tin người dùng cho Node.js lưu vào session
    -- -------------------------------------------------------
    SELECT 
        nv.MANV        AS manv,
        RTRIM(nv.HO) + N' ' + RTRIM(nv.TEN) AS hoTen,
        @Username      AS username,
        @Role          AS role
    FROM dbo.Nhanvien nv
    WHERE nv.MANV = @MANV;
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_XacThucTaiKhoan';
GO
