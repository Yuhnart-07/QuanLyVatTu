-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_TaoLogin.sql
-- Mô tả: Khởi tạo tài khoản SQL Server Login, tạo Database User và phân quyền theo
--         đúng Quy trình tạo tài khoản và phân quyền chuẩn (5 bước):
--         Bước 1: Chuẩn bị nhóm quyền (Role) - Đã có sẵn Admin, Nhanvien.
--         Bước 2: Tạo Server Login với Login Name và Mật khẩu.
--         Bước 3: Tạo Database User có tên là MÃ NHÂN VIÊN (MANV) liên kết với Login.
--         Bước 4: Đưa Database User vào nhóm quyền tương ứng (Admin hoặc Nhanvien).
--         Bước 5: Nếu thuộc nhóm Admin -> Cấp thêm quyền server role securityadmin;
--                 nếu là Nhanvien -> Tuyệt đối không cấp quyền này.
-- Tham chiếu: De.md Mục II.3.1, Rule 04, PhanTichNghiepVu.md UC05
-- ====================================================================================

USE QLVT;
GO

IF OBJECT_ID('dbo.sp_TaoLogin', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_TaoLogin;
GO

CREATE PROCEDURE dbo.sp_TaoLogin
    @MANV       INT,
    @LoginName  NVARCHAR(50),
    @Password   NVARCHAR(100),
    @Role       NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- --------------------------------------------------------------------------------
    -- KIỂM TRA ĐIỀU KIỆN TIỀN ĐỀ VÀ DỮ LIỆU ĐẦU VÀO
    -- --------------------------------------------------------------------------------

    -- 1. Kiểm tra nhóm quyền hợp lệ: chỉ chấp nhận 'Admin' hoặc 'Nhanvien'
    IF @Role NOT IN (N'Admin', N'Nhanvien')
    BEGIN
        THROW 50001, N'Nhóm quyền không hợp lệ. Vui lòng chọn quyền Admin hoặc Nhân viên.', 1;
    END

    -- 2. Kiểm tra mã nhân viên có tồn tại trong bảng hồ sơ nhân viên hay không
    IF NOT EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
    BEGIN
        THROW 50001, N'Mã nhân viên không tồn tại trong hệ thống.', 1;
    END

    -- 3. Kiểm tra xem nhân viên này đã được cấp tài khoản đăng nhập trước đó hay chưa
    -- Quy tắc: Mỗi nhân viên chỉ được sở hữu duy nhất 1 tài khoản đăng nhập hệ thống.
    -- Tên Database User bắt buộc là MANV (dạng chuỗi số nguyên).
    IF EXISTS (
        SELECT 1 
        FROM sys.database_principals dp
        INNER JOIN sys.server_principals sp ON dp.sid = sp.sid
        WHERE TRY_CAST(dp.name AS INT) = @MANV
          AND sp.type = 'S'
    )
    BEGIN
        THROW 50001, N'Nhân viên này đã được cấp tài khoản đăng nhập trên hệ thống.', 1;
    END

    -- 4. Kiểm tra tên đăng nhập (Login Name) đã tồn tại trên SQL Server chưa
    IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName)
    BEGIN
        THROW 50001, N'Tên đăng nhập đã tồn tại trong hệ thống. Vui lòng chọn tên đăng nhập khác.', 1;
    END

    -- Tên Database User theo quy chuẩn bắt buộc là MÃ NHÂN VIÊN (chuỗi số nguyên)
    DECLARE @DbUserName NVARCHAR(20) = CAST(@MANV AS NVARCHAR(10));
    DECLARE @SqlCmd NVARCHAR(MAX);

    -- Dọn dẹp Database User cũ mồ côi (nếu trước đó login đã bị xóa ngoài nhưng user còn sót lại)
    IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @DbUserName)
    BEGIN
        SET @SqlCmd = N'DROP USER ' + QUOTENAME(@DbUserName) + N';';
        EXEC sp_executesql @SqlCmd;
    END

    BEGIN TRY
        -- ----------------------------------------------------------------------------
        -- BƯỚC 2: Khởi tạo tài khoản đăng nhập ở cấp Server (Login Name & Mật khẩu)
        -- Tắt chính sách kiểm tra độ phức tạp của Windows (CHECK_POLICY = OFF) để linh hoạt mật khẩu
        -- ----------------------------------------------------------------------------
        SET @SqlCmd = N'CREATE LOGIN ' + QUOTENAME(@LoginName) 
                    + N' WITH PASSWORD = ' + QUOTENAME(@Password, '''') 
                    + N', CHECK_POLICY = OFF;';
        EXEC sp_executesql @SqlCmd;

        -- ----------------------------------------------------------------------------
        -- BƯỚC 3: Tạo Database User và ánh xạ vào CSDL QLVT
        -- Quy ước quan trọng: Tên User Name bắt buộc là MÃ NV (@MANV)
        -- ----------------------------------------------------------------------------
        SET @SqlCmd = N'CREATE USER ' + QUOTENAME(@DbUserName) 
                    + N' FOR LOGIN ' + QUOTENAME(@LoginName) + N';';
        EXEC sp_executesql @SqlCmd;

        -- ----------------------------------------------------------------------------
        -- BƯỚC 4: Đưa Database User vào nhóm quyền (Role) tương ứng
        -- Gán User vào Role Admin hoặc Role Nhanvien đã được cấu hình sẵn từ Bước 1
        -- ----------------------------------------------------------------------------
        SET @SqlCmd = N'ALTER ROLE ' + QUOTENAME(@Role) 
                    + N' ADD MEMBER ' + QUOTENAME(@DbUserName) + N';';
        EXEC sp_executesql @SqlCmd;

        -- ----------------------------------------------------------------------------
        -- BƯỚC 5: Cấp quyền quản trị Server securityadmin (Chỉ khi tài khoản là Admin)
        -- Nếu là Admin: đưa vào securityadmin để có quyền tạo và phân quyền tài khoản khác.
        -- Nếu là Nhanvien: Tuyệt đối KHÔNG cấp quyền này để ngăn chặn tạo tài khoản trái phép.
        -- ----------------------------------------------------------------------------
        IF @Role = N'Admin'
        BEGIN
            SET @SqlCmd = N'ALTER SERVER ROLE [securityadmin] ADD MEMBER ' + QUOTENAME(@LoginName) + N';';
            EXEC sp_executesql @SqlCmd;
        END

    END TRY
    BEGIN CATCH
        -- Nếu xảy ra lỗi ở bất kỳ bước nào, tiến hành dọn dẹp các đối tượng vừa tạo để đảm bảo tính nguyên tử
        IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @DbUserName)
        BEGIN
            SET @SqlCmd = N'DROP USER ' + QUOTENAME(@DbUserName) + N';';
            EXEC sp_executesql @SqlCmd;
        END

        IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @LoginName)
        BEGIN
            SET @SqlCmd = N'DROP LOGIN ' + QUOTENAME(@LoginName) + N';';
            EXEC sp_executesql @SqlCmd;
        END

        -- Bắn lại thông báo lỗi chi tiết ra cho Controller xử lý
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50001, @ErrorMessage, 1;
    END CATCH
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_TaoLogin';
GO
