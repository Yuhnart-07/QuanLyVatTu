-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_XoaLogin.sql
-- Mô tả: Xóa tài khoản đăng nhập SQL Server và thu hồi toàn bộ quyền liên kết:
--         1. Kiểm tra an toàn: Tồn tại login, không xóa 'sa', không xóa tài khoản đang đăng nhập.
--         2. Gỡ bỏ quyền server role securityadmin (nếu có).
--         3. Tìm Database User tương ứng trong CSDL QLVT (theo SID liên kết).
--         4. Thu hồi Database User khỏi các nhóm quyền Admin, Nhanvien.
--         5. Xóa Database User khỏi CSDL QLVT.
--         6. Xóa Server Login khỏi máy chủ SQL Server.
-- Tham chiếu: De.md Mục II.3.1, Rule 04, PhanTichNghiepVu.md UC05
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_XoaLogin', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_XoaLogin;
GO

CREATE PROCEDURE dbo.sp_XoaLogin
    @LoginName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- --------------------------------------------------------------------------------
    -- 1. KIỂM TRA ĐIỀU KIỆN AN TOÀN VÀ TỒN TẠI TÀI KHOẢN
    -- --------------------------------------------------------------------------------

    -- Kiểm tra tài khoản có tồn tại trên máy chủ SQL Server không
    IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName AND type = 'S')
    BEGIN
        THROW 50001, N'Tài khoản đăng nhập không tồn tại trong hệ thống.', 1;
    END

    -- Tuyệt đối không cho phép xóa tài khoản quản trị hệ thống gốc sa
    IF LOWER(@LoginName) = 'sa'
    BEGIN
        THROW 50001, N'Không được phép xóa tài khoản quản trị hệ thống sa.', 1;
    END

    -- Ngăn chặn người dùng tự xóa chính tài khoản mà mình đang đăng nhập phiên hiện tại
    IF @LoginName = SUSER_SNAME()
    BEGIN
        THROW 50001, N'Không được phép xóa tài khoản đang đăng nhập.', 1;
    END

    DECLARE @SqlCmd NVARCHAR(MAX);

    BEGIN TRY
        -- ----------------------------------------------------------------------------
        -- 2. GỠ BỎ QUYỀN QUẢN TRỊ SERVER SECURITYADMIN (NẾU CÓ)
        -- ----------------------------------------------------------------------------
        IF IS_SRVROLEMEMBER('securityadmin', @LoginName) = 1
        BEGIN
            SET @SqlCmd = N'ALTER SERVER ROLE [securityadmin] DROP MEMBER ' + QUOTENAME(@LoginName) + N';';
            EXEC sp_executesql @SqlCmd;
        END

        -- ----------------------------------------------------------------------------
        -- 3. TÌM DATABASE USER TƯƠNG ỨNG TRONG CSDL QLVT THEO SID LIÊN KẾT
        -- ----------------------------------------------------------------------------
        DECLARE @DbUserName NVARCHAR(128);

        SELECT @DbUserName = dp.name
        FROM sys.database_principals dp
        INNER JOIN sys.server_principals sp ON dp.sid = sp.sid
        WHERE sp.name = @LoginName;

        -- ----------------------------------------------------------------------------
        -- 4 & 5. THU HỒI QUYỀN VÀ XÓA DATABASE USER KHỎI CSDL QLVT
        -- ----------------------------------------------------------------------------
        IF @DbUserName IS NOT NULL
        BEGIN
            -- Gỡ User khỏi Role Admin nếu là thành viên
            IF EXISTS (
                SELECT 1 
                FROM sys.database_role_members rm
                JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
                JOIN sys.database_principals m ON rm.member_principal_id = m.principal_id
                WHERE r.name = N'Admin' AND m.name = @DbUserName
            )
            BEGIN
                SET @SqlCmd = N'ALTER ROLE [Admin] DROP MEMBER ' + QUOTENAME(@DbUserName) + N';';
                EXEC sp_executesql @SqlCmd;
            END

            -- Gỡ User khỏi Role Nhanvien nếu là thành viên
            IF EXISTS (
                SELECT 1 
                FROM sys.database_role_members rm
                JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
                JOIN sys.database_principals m ON rm.member_principal_id = m.principal_id
                WHERE r.name = N'Nhanvien' AND m.name = @DbUserName
            )
            BEGIN
                SET @SqlCmd = N'ALTER ROLE [Nhanvien] DROP MEMBER ' + QUOTENAME(@DbUserName) + N';';
                EXEC sp_executesql @SqlCmd;
            END

            -- Xóa Database User khỏi CSDL QLVT
            SET @SqlCmd = N'DROP USER ' + QUOTENAME(@DbUserName) + N';';
            EXEC sp_executesql @SqlCmd;
        END

        -- ----------------------------------------------------------------------------
        -- 6. XÓA SERVER LOGIN KHỎI MÁY CHỦ SQL SERVER
        -- ----------------------------------------------------------------------------
        SET @SqlCmd = N'DROP LOGIN ' + QUOTENAME(@LoginName) + N';';
        EXEC sp_executesql @SqlCmd;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50001, @ErrorMessage, 1;
    END CATCH
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_XoaLogin';
GO
