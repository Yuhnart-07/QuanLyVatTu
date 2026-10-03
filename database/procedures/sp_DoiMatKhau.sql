-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_DoiMatKhau.sql
-- Mô tả: Đổi mật khẩu tài khoản SQL Server Login cho nhân viên đã đăng nhập
--         Xác minh mật khẩu cũ bằng PWDCOMPARE trước khi thực thi ALTER LOGIN.
-- Tham chiếu: Rule.md mục 12 & Rule 04, ImplementMap.md mục 7.1
-- Ràng buộc: BR13 - Chỉ đổi pass cho user đã có tài khoản đăng nhập
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_DoiMatKhau', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_DoiMatKhau;
GO

CREATE PROCEDURE dbo.sp_DoiMatKhau
    @Username       NVARCHAR(50),
    @OldPassword    NVARCHAR(100),
    @NewPassword    NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- -------------------------------------------------------
    -- 1. Kiểm tra Login có tồn tại
    -- -------------------------------------------------------
    DECLARE @PasswordHash VARBINARY(MAX);

    SELECT @PasswordHash = password_hash
    FROM sys.sql_logins
    WHERE name = @Username;

    IF @PasswordHash IS NULL
        THROW 50001, N'Tài khoản không tồn tại trong hệ thống.', 1;

    -- -------------------------------------------------------
    -- 2. Xác minh mật khẩu cũ bằng PWDCOMPARE
    -- -------------------------------------------------------
    IF PWDCOMPARE(@OldPassword, @PasswordHash) = 0
        THROW 50001, N'Mật khẩu cũ không chính xác.', 1;

    -- -------------------------------------------------------
    -- 3. Thực thi đổi mật khẩu qua ALTER LOGIN (Dynamic SQL)
    -- -------------------------------------------------------
    DECLARE @SqlCmd NVARCHAR(500);
    SET @SqlCmd = N'ALTER LOGIN ' + QUOTENAME(@Username) 
                + N' WITH PASSWORD = ' + QUOTENAME(@NewPassword, '''');

    BEGIN TRY
        EXEC sp_executesql @SqlCmd;
    END TRY
    BEGIN CATCH
        THROW 50001, N'Không thể đổi mật khẩu. Mật khẩu mới có thể không đạt yêu cầu chính sách bảo mật SQL Server.', 1;
    END CATCH
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_DoiMatKhau';
GO
