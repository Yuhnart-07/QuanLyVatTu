-- ====================================================================================
-- DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
-- File: seed_data.sql
-- Mô tả: Dữ liệu mẫu kiểm thử chuẩn nghiệp vụ cho cả 8 bảng
-- Tham chiếu: Rule.md mục 14 & De.md Phần I, II
-- ====================================================================================

USE QLVT;
GO

SET NOCOUNT ON;
GO

PRINT N'>>> Đang làm sạch dữ liệu cũ trước khi nạp seed data...';
BEGIN TRANSACTION;

-- Xóa dữ liệu theo thứ tự ngược của quan hệ khóa ngoại
DELETE FROM dbo.CTPX;
DELETE FROM dbo.PhieuXuat;
DELETE FROM dbo.CTPN;
DELETE FROM dbo.PhieuNhap;
DELETE FROM dbo.CTDDH;
DELETE FROM dbo.DatHang;
DELETE FROM dbo.Vattu;
DELETE FROM dbo.Nhanvien;

PRINT N'>>> Đang nạp dữ liệu mẫu...';

-- 1. Nhanvien (55 nhân viên)
INSERT INTO dbo.Nhanvien (MANV, HO, TEN, DIACHI, NGAYSINH, LUONG, GHICHU) VALUES
(1, N'Nguyễn Văn',  N'An',     N'123 Lê Lợi, Q.1, TP.HCM',              '1990-05-15', 8500000, N'Trưởng phòng kho'),
(2, N'Trần Thị',    N'Bình',   N'456 Nguyễn Huệ, Q.3, TP.HCM',          '1992-08-20', 7500000, N'Nhân viên nhập hàng'),
(3, N'Lê Hoàng',    N'Cường',  N'789 Hai Bà Trưng, Q.1, TP.HCM',        '1988-12-01', 9000000, N'Nhân viên xuất kho'),
(4, N'Phạm Minh',   N'Đức',    N'321 Võ Văn Tần, Q.3, TP.HCM',          '1995-03-10', 6500000, N'Nhân viên kiểm kê'),
(5, N'Hoàng Thị',   N'Em',     N'654 Cách Mạng Tháng 8, Q.10, TP.HCM',  '1993-07-25', 7000000, N'Nhân viên thu mua'),
(6, N'Đặng Quốc',   N'Bảo',    N'12 Pasteur, Q.1, TP.HCM',              '1991-04-12', 8200000, N'Nhân viên kiểm kê hàng hóa'),
(7, N'Vũ Thị',      N'Cẩm',    N'88 Hoàng Hoa Thám, Q.Bình Thạnh, TP.HCM', '1994-11-05', 7300000, N'Kế toán kho vật tư'),
(8, N'Bùi Văn',     N'Dũng',   N'45 Cầu Giấy, Q.Cầu Giấy, Hà Nội',      '1989-02-18', 9500000, N'Phó phòng quản lý kho'),
(9, N'Đỗ Minh',     N'Đạt',    N'102 Nguyễn Trãi, Q.5, TP.HCM',          '1996-09-22', 6800000, N'Nhân viên tiếp nhận đơn hàng'),
(10, N'Hồ Thanh',   N'Giang',  N'67 Lê Duẩn, Q.Hải Châu, Đà Nẵng',       '1992-06-30', 7600000, N'Nhân viên giao nhận vật tư'),
(11, N'Ngô Thị',    N'Hà',     N'34 Bà Triệu, Q.Hoàn Kiếm, Hà Nội',      '1995-12-14', 7100000, N'Nhân viên kiểm soát chất lượng'),
(12, N'Dương Quang',N'Hải',    N'15 Lý Tự Trọng, Q.Ninh Kiều, Cần Thơ',  '1987-08-08', 8800000, N'Điều phối viên vận chuyển'),
(13, N'Lý Mỹ',      N'Hạnh',   N'210 Bạch Đằng, Q.Hồng Bàng, Hải Phòng', '1993-03-25', 7400000, N'Thủ kho phụ'),
(14, N'Đoàn Văn',   N'Hiếu',   N'55 Trần Hưng Đạo, TP.Thủ Dầu Một, Bình Dương', '1990-10-10', 8000000, N'Nhân viên bốc dỡ hàng'),
(15, N'Phan Đình',  N'Hoàng',  N'78 Nguyễn Ái Quốc, TP.Biên Hòa, Đồng Nai', '1985-05-19', 10500000, N'Trưởng nhóm kỹ thuật bảo quản'),
(16, N'Võ Quốc',    N'Hùng',   N'234 Quang Trung, Q.Gò Vấp, TP.HCM',     '1992-01-15', 7800000, N'Nhân viên vận hành xe nâng'),
(17, N'Huỳnh Gia',  N'Huy',    N'89 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM', '1997-07-07', 6500000, N'Nhân viên đóng gói bao bì'),
(18, N'Trịnh Thu',  N'Hương',  N'120 Kim Mã, Q.Ba Đình, Hà Nội',         '1994-04-28', 7500000, N'Nhân viên thống kê nhập xuất'),
(19, N'Đinh Quốc',  N'Khánh',  N'45 Phan Châu Trinh, Q.Hải Châu, Đà Nẵng', '1991-09-17', 8100000, N'Nhân viên kiểm tra chứng từ'),
(20, N'Mai Đăng',   N'Khoa',   N'168 Hùng Vương, Q.5, TP.HCM',           '1988-11-23', 9200000, N'Giám sát an toàn kho bãi'),
(21, N'Lâm Trung',  N'Kiên',   N'302 Võ Thị Sáu, Q.3, TP.HCM',           '1993-02-11', 7700000, N'Nhân viên bốc xếp ca đêm'),
(22, N'Tạ Thanh',   N'Lam',    N'52 Trần Phú, Q.Hà Đông, Hà Nội',        '1996-08-19', 6900000, N'Nhân viên đối soát vật tư'),
(23, N'Lương Thảo', N'Linh',   N'79 Nguyễn Văn Cừ, Q.Ninh Kiều, Cần Thơ','1995-05-02', 7200000, N'Nhân viên nhập liệu hệ thống'),
(24, N'Cao Tuyết',  N'Loan',   N'14 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM','1990-12-09', 8300000, N'Thủ kho thiết bị kim khí'),
(25, N'Hà Phi',     N'Long',   N'63 Lạch Tray, Q.Ngô Quyền, Hải Phòng',  '1986-07-14', 9800000, N'Tổ trưởng tổ vận chuyển'),
(26, N'Nguyễn Thị', N'Mai',    N'221 CMT8, Q.Tân Bình, TP.HCM',          '1993-10-04', 7600000, N'Nhân viên kế toán kho'),
(27, N'Trần Nhật',  N'Minh',   N'95 Giải Phóng, Q.Hai Bà Trưng, Hà Nội', '1992-03-31', 8400000, N'Nhân viên kỹ thuật bảo dưỡng'),
(28, N'Lê Phương',  N'Nam',    N'113 Nguyễn Huệ, TP.Quy Nhơn, Bình Định','1989-06-26', 8700000, N'Nhân viên tiếp nhận vật tư'),
(29, N'Phạm Thúy',  N'Nga',    N'84 Lê Thánh Tôn, Q.1, TP.HCM',          '1994-01-20', 7500000, N'Nhân viên kiểm đếm hàng về'),
(30, N'Hoàng Trọng',N'Nghĩa',  N'207 Hoàng Diệu, TP.Buôn Ma Thuột, Đắk Lắk', '1991-08-15', 7900000, N'Thủ kho xi măng và sắt thép'),
(31, N'Huỳnh Bảo',  N'Ngọc',   N'39 Lê Lợi, TP.Huế, Thừa Thiên Huế',     '1996-11-12', 6700000, N'Nhân viên hỗ trợ xuất kho'),
(32, N'Phan Hồng',  N'Nhung',  N'158 Nguyễn Thị Minh Khai, Q.3, TP.HCM', '1995-04-05', 7300000, N'Nhân viên quản lý hồ sơ phiếu'),
(33, N'Vũ Kiều',    N'Oanh',   N'72 Thái Hà, Q.Đống Đa, Hà Nội',         '1993-09-08', 7600000, N'Nhân viên trực tổng đài vật tư'),
(34, N'Đặng Thanh', N'Phong',  N'29 Lê Văn Sỹ, Q.Phú Nhuận, TP.HCM',     '1987-12-19', 9100000, N'Phụ trách bãi vật tư ngoài trời'),
(35, N'Bùi Vĩnh',   N'Phúc',   N'18 Nguyễn Tri Phương, TP.Vũng Tàu, BR-VT', '1990-05-27', 8200000, N'Nhân viên điều xe tải hàng'),
(36, N'Đỗ Minh',    N'Quân',   N'88 Tôn Đức Thắng, Q.Đống Đa, Hà Nội',   '1994-02-14', 7800000, N'Nhân viên dán tem mã vật tư'),
(37, N'Hồ Nhật',    N'Quang',  N'145 Nguyễn Văn Linh, Q.Thanh Khê, Đà Nẵng', '1988-10-30', 9400000, N'Tổ phó tổ kiểm kê'),
(38, N'Ngô Tấn',    N'Sang',   N'66 Lý Thường Kiệt, TP.Mỹ Tho, Tiền Giang', '1992-07-22', 7700000, N'Nhân viên kiểm tra xuất bến'),
(39, N'Dương Thái', N'Sơn',    N'310 Cộng Hòa, Q.Tân Bình, TP.HCM',      '1991-03-16', 8000000, N'Nhân viên sắp xếp kệ hàng'),
(40, N'Lý Hữu',     N'Tài',    N'53 Hàng Bài, Q.Hoàn Kiếm, Hà Nội',      '1989-09-03', 8900000, N'Kỹ thuật viên pallet và giá kệ'),
(41, N'Đoàn Minh',  N'Tâm',    N'177 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM',    '1995-06-18', 7200000, N'Nhân viên văn phòng kho'),
(42, N'Phan Nhật',  N'Tân',    N'42 Nguyễn Thông, Q.3, TP.HCM',          '1993-01-29', 7500000, N'Nhân viên bốc dỡ hàng nhẹ'),
(43, N'Võ Chiến',   N'Thắng',  N'91 Trần Phú, TP.Nha Trang, Khánh Hòa',  '1986-04-11', 9900000, N'Đội trưởng đội bảo vệ kho bãi'),
(44, N'Huỳnh Tấn',  N'Thành',  N'184 Hai Bà Trưng, TP.Phan Thiết, Bình Thuận', '1990-08-24', 8100000, N'Nhân viên phụ kho hóa chất sơn'),
(45, N'Trịnh Phương',N'Thảo',  N'27 Phố Huế, Q.Hai Bà Trưng, Hà Nội',    '1996-12-07', 7000000, N'Kế toán đối chiếu công nợ kho'),
(46, N'Đinh Quốc',  N'Thịnh',  N'62 Trần Hưng Đạo, TP.Rạch Giá, Kiên Giang', '1992-05-15', 7800000, N'Thủ kho gạch ngói và đá cát'),
(47, N'Mai Hoài',   N'Thu',    N'133 Trường Chinh, Q.Thanh Xuân, Hà Nội','1994-09-28', 7400000, N'Nhân viên kiểm tra quy cách vật tư'),
(48, N'Lâm Thanh',  N'Thủy',   N'80 Ba Cu, TP.Vũng Tàu, BR-VT',          '1995-02-03', 7100000, N'Nhân viên theo dõi hao hụt kho'),
(49, N'Cao Mạnh',   N'Tiến',   N'57 Hoàng Văn Thụ, TP.Hải Phòng',        '1988-08-14', 9000000, N'Điều phối viên bến bãi container'),
(50, N'Hà Thùy',    N'Trang',  N'194 Nguyễn Đình Chiểu, Q.3, TP.HCM',    '1997-03-21', 6600000, N'Nhân viên hỗ trợ scan mã vạch'),
(51, N'Nguyễn Thành',N'Trung', N'38 Đại Cồ Việt, Q.Hai Bà Trưng, Hà Nội','1991-11-09', 8300000, N'Nhân viên an toàn lao động kho'),
(52, N'Trần Cẩm',   N'Tú',     N'75 Đồng Khởi, Q.1, TP.HCM',             '1993-06-17', 7600000, N'Nhân viên kiểm soát xuất kho lẻ'),
(53, N'Lê Minh',    N'Tuấn',   N'112 Phan Đăng Lưu, Q.Phú Nhuận, TP.HCM','1989-12-25', 8600000, N'Thủ kho phụ trách vật tư kim loại'),
(54, N'Phạm Thanh', N'Tùng',   N'49 Nguyễn Chánh, Q.Cầu Giấy, Hà Nội',   '1990-07-04', 8500000, N'Kỹ thuật viên kiểm định vật tư'),
(55, N'Hoàng Ánh',  N'Tuyết',  N'26 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM',     '1996-10-31', 6900000, N'Nhân viên tổng hợp báo cáo kho');

-- 2. Vattu (6 loại vật tư xây dựng)
INSERT INTO dbo.Vattu (MAVT, TENVT, DVT, Soluongton) VALUES
(N'VT01', N'Xi măng Hà Tiên',  N'Bao',    150),
(N'VT02', N'Sắt phi 10',       N'Kg',     800),
(N'VT03', N'Gạch ống 4 lỗ',    N'Viên',   3500),
(N'VT04', N'Cát vàng xây dựng',N'M3',     60),
(N'VT05', N'Đá xanh 1x2',      N'M3',     45),
(N'VT06', N'Sơn Dulux nội thất',N'Thùng', 90);

-- 3. DatHang (3 đơn đặt hàng)
INSERT INTO dbo.DatHang (MasoDDH, NGAY, NhaCC, MANV) VALUES
(N'DDH00001', '2024-01-15', N'Công ty TNHH Vật liệu Sài Gòn',  1),
(N'DDH00002', '2024-02-20', N'Đại lý Thép Miền Nam',            5),
(N'DDH00003', '2024-03-10', N'Công ty CP Gạch Ngói Đồng Nai',   1);

-- 4. CTDDH (Chi tiết đơn đặt hàng)
INSERT INTO dbo.CTDDH (MasoDDH, MAVT, SOLUONG, DONGIA) VALUES
(N'DDH00001', N'VT01', 50,   85000),
(N'DDH00001', N'VT04', 20,   250000),
(N'DDH00002', N'VT02', 300,  16000),
(N'DDH00002', N'VT05', 15,   350000),
(N'DDH00003', N'VT03', 2000, 1300),
(N'DDH00003', N'VT06', 30,   480000);

-- 5. PhieuNhap (3 phiếu nhập kho)
INSERT INTO dbo.PhieuNhap (MAPN, NGAY, MasoDDH, MANV) VALUES
(N'PN000001', '2024-01-20', N'DDH00001', 2),
(N'PN000002', '2024-02-25', N'DDH00002', 2),
(N'PN000003', '2024-03-15', N'DDH00003', 4);

-- 6. CTPN (Chi tiết phiếu nhập - SL nhập <= SL đặt)
INSERT INTO dbo.CTPN (MAPN, MAVT, SOLUONG, DONGIA) VALUES
(N'PN000001', N'VT01', 50,   85000),
(N'PN000001', N'VT04', 20,   250000),
(N'PN000002', N'VT02', 200,  16000),   -- Nhập trước 200/300 kg
(N'PN000002', N'VT05', 10,   350000),  -- Nhập trước 10/15 m3
(N'PN000003', N'VT03', 1500, 1300),   -- Nhập trước 1500/2000 viên
(N'PN000003', N'VT06', 30,   480000);

-- 7. PhieuXuat (2 phiếu xuất kho)
INSERT INTO dbo.PhieuXuat (MAPX, NGAY, HOTENKH, MANV) VALUES
(N'PX000001', '2024-02-05', N'Nguyễn Minh Tuấn (CTy Xây Dựng Số 1)', 3),
(N'PX000002', '2024-03-22', N'Trần Văn Hùng (Nhà thầu Hùng Phát)',    3);

-- 8. CTPX (Chi tiết phiếu xuất - SL xuất <= SL tồn)
INSERT INTO dbo.CTPX (MAPX, MAVT, SOLUONG, DONGIA) VALUES
(N'PX000001', N'VT01', 20,  95000),
(N'PX000001', N'VT04', 5,   280000),
(N'PX000002', N'VT02', 100, 19000),
(N'PX000002', N'VT03', 500, 1600);

COMMIT TRANSACTION;
GO

PRINT N'>>> ĐÃ NẠP SEED DATA THÀNH CÔNG CHO CẢ 8 BẢNG QLVT! <<<';
GO
