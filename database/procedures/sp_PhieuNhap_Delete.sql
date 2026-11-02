-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_PhieuNhap_Delete.sql
-- Mô tả: Xóa phiếu nhập kho và hoàn tác số lượng tồn kho (RULE 02)
--         Kiểm tra an toàn: Không cho phép xóa nếu tồn kho hiện tại < số lượng hoàn tác.
-- Người phụ trách: Thành viên 2 (Nhập kho)
-- Tham chiếu: docs/03-BUSINESS_MODULES.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_PhieuNhap_Delete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_PhieuNhap_Delete;
GO

CREATE PROCEDURE dbo.sp_PhieuNhap_Delete
    @MAPN NCHAR(8)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra tồn tại phiếu nhập
        IF NOT EXISTS (SELECT 1 FROM dbo.PhieuNhap WHERE MAPN = @MAPN)
        BEGIN
            THROW 50001, N'Phiếu nhập không tồn tại trong hệ thống.', 1;
        END

        -- 2. Kiểm tra an toàn tồn kho trước khi hoàn tác trừ tồn
        -- Nếu Soluongton hiện tại < SOLUONG đã nhập -> Hàng đã bị xuất bán đi, không được xóa!
        IF EXISTS (
            SELECT 1 
            FROM dbo.CTPN ct
            INNER JOIN dbo.Vattu vt ON ct.MAVT = vt.MAVT
            WHERE ct.MAPN = @MAPN AND vt.Soluongton < ct.SOLUONG
        )
        BEGIN
            THROW 50001, N'Không thể xóa phiếu nhập vì hàng đã được xuất kho (tồn kho hiện tại không đủ để hoàn tác).', 1;
        END

        -- 3. Hoàn tác trừ tồn kho
        UPDATE dbo.Vattu
        SET Soluongton = dbo.Vattu.Soluongton - ct.SOLUONG
        FROM dbo.Vattu
        INNER JOIN dbo.CTPN ct ON dbo.Vattu.MAVT = ct.MAVT
        WHERE ct.MAPN = @MAPN;

        -- 4. Xóa chi tiết CTPN
        DELETE FROM dbo.CTPN WHERE MAPN = @MAPN;

        -- 5. Xóa phiếu Master PhieuNhap
        DELETE FROM dbo.PhieuNhap WHERE MAPN = @MAPN;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_PhieuNhap_Delete';
GO
