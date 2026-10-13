-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: sp_PhieuNhap_Create.sql
-- Mô tả: Lập phiếu nhập kho Master-Detail (RULE 01 & RULE 02 & RULE 03)
--         Sử dụng OPENJSON(@ChiTietJSON) và Transaction nguyên tử.
--         Kiểm soát: Số lượng nhập <= Số lượng đặt còn lại của đơn hàng.
--         Tự động tăng số lượng tồn kho Vattu.Soluongton.
-- Người phụ trách: Thành viên 2 (Nhập kho)
-- Tham chiếu: Rule.md mục 10, docs/01-SYSTEM_RULES.md, docs/03-BUSINESS_MODULES.md
-- ====================================================================================

USE QLVT;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.sp_PhieuNhap_Create', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_PhieuNhap_Create;
GO

CREATE PROCEDURE dbo.sp_PhieuNhap_Create
    @MAPN           NCHAR(8),
    @MasoDDH        NVARCHAR(8),
    @MANV           INT,
    @ChiTietJSON    NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra tồn tại mã phiếu nhập
        IF EXISTS (SELECT 1 FROM dbo.PhieuNhap WHERE MAPN = @MAPN)
        BEGIN
            THROW 50001, N'Mã phiếu nhập đã tồn tại trong hệ thống.', 1;
        END

        -- 2. Kiểm tra đơn đặt hàng hợp lệ
        IF NOT EXISTS (SELECT 1 FROM dbo.DatHang WHERE MasoDDH = @MasoDDH)
        BEGIN
            THROW 50001, N'Đơn đặt hàng căn cứ không tồn tại trong hệ thống.', 1;
        END

        -- 3. Kiểm tra nhân viên hợp lệ
        IF NOT EXISTS (SELECT 1 FROM dbo.Nhanvien WHERE MANV = @MANV)
        BEGIN
            THROW 50001, N'Nhân viên thực hiện không tồn tại trong hệ thống.', 1;
        END

        -- 4. Đổ dữ liệu JSON vào bảng tạm để kiểm tra
        CREATE TABLE #TempDetails (
            mavt    NCHAR(4) NOT NULL,
            soluong INT      NOT NULL,
            dongia  FLOAT    NOT NULL
        );

        INSERT INTO #TempDetails (mavt, soluong, dongia)
        SELECT 
            mavt,
            soluong,
            dongia
        FROM OPENJSON(@ChiTietJSON)
        WITH (
            mavt    NCHAR(4) '$.mavt',
            soluong INT      '$.soluong',
            dongia  FLOAT    '$.dongia'
        );

        -- Kiểm tra danh sách chi tiết có rỗng không
        IF NOT EXISTS (SELECT 1 FROM #TempDetails)
        BEGIN
            THROW 50001, N'Chi tiết phiếu nhập không được để trống.', 1;
        END

        -- 5. Kiểm tra vật tư có thuộc đơn đặt hàng không (RULE_RECEIPT_002)
        IF EXISTS (
            SELECT 1 FROM #TempDetails t
            WHERE NOT EXISTS (
                SELECT 1 FROM dbo.CTDDH c 
                WHERE c.MasoDDH = @MasoDDH AND c.MAVT = t.mavt
            )
        )
        BEGIN
            THROW 50001, N'Có vật tư không nằm trong danh mục của đơn đặt hàng này.', 1;
        END

        -- 6. KIỂM SOÁT HẠN MỨC SỐ LƯỢNG NHẬP (RULE_RECEIPT_003)
        -- SL nhập mới <= SL đặt - Tổng SL đã nhập qua các phiếu nhập trước
        DECLARE @ViPhamMAVT NCHAR(4) = NULL;
        DECLARE @SLConLai INT = 0;
        DECLARE @SLYeuCau INT = 0;

        SELECT TOP 1
            @ViPhamMAVT = t.mavt,
            @SLYeuCau = t.soluong,
            @SLConLai = (c.SOLUONG - ISNULL(dn.TongDaNhap, 0))
        FROM #TempDetails t
        INNER JOIN dbo.CTDDH c ON c.MasoDDH = @MasoDDH AND c.MAVT = t.mavt
        LEFT JOIN (
            SELECT ctpn.MAVT, SUM(ctpn.SOLUONG) AS TongDaNhap
            FROM dbo.CTPN ctpn
            INNER JOIN dbo.PhieuNhap pn ON ctpn.MAPN = pn.MAPN
            WHERE pn.MasoDDH = @MasoDDH
            GROUP BY ctpn.MAVT
        ) dn ON dn.MAVT = t.mavt
        WHERE t.soluong > (c.SOLUONG - ISNULL(dn.TongDaNhap, 0));

        IF @ViPhamMAVT IS NOT NULL
        BEGIN
            DECLARE @ErrMsg NVARCHAR(250);
            SET @ErrMsg = N'Vật tư ' + RTRIM(@ViPhamMAVT) + N' yêu cầu nhập ' + CAST(@SLYeuCau AS NVARCHAR(10)) 
                          + N', nhưng số lượng còn lại chỉ là ' + CAST(@SLConLai AS NVARCHAR(10)) + N'.';
            THROW 50001, @ErrMsg, 1;
        END

        -- 7. Insert thông tin phiếu Master
        INSERT INTO dbo.PhieuNhap (MAPN, NGAY, MasoDDH, MANV)
        VALUES (@MAPN, GETDATE(), @MasoDDH, @MANV);

        -- 8. Insert danh sách chi tiết CTPN
        INSERT INTO dbo.CTPN (MAPN, MAVT, SOLUONG, DONGIA)
        SELECT @MAPN, mavt, soluong, dongia
        FROM #TempDetails;

        -- 9. Tự động CẬP NHẬT TĂNG TỒN KHO Vattu (RULE_RECEIPT_004)
        UPDATE dbo.Vattu
        SET Soluongton = dbo.Vattu.Soluongton + t.soluong
        FROM dbo.Vattu
        INNER JOIN #TempDetails t ON dbo.Vattu.MAVT = t.mavt;

        DROP TABLE #TempDetails;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        IF OBJECT_ID('tempdb..#TempDetails') IS NOT NULL
            DROP TABLE #TempDetails;

        THROW;
    END CATCH
END;
GO

PRINT N'  [OK] Tạo Stored Procedure: sp_PhieuNhap_Create';
GO
