# PROMPT — PHÂN TÍCH TOÀN BỘ NGHIỆP VỤ HỆ THỐNG QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)

## 1. Vai trò và mục tiêu

Bạn là Business Analyst kiêm System Analyst, chịu trách nhiệm phân tích toàn diện hệ thống **Quản lý nhập/xuất vật tư (QLVT)** dựa trên đề bài, mã nguồn hiện có và cấu trúc cơ sở dữ liệu được cung cấp.

Nhiệm vụ là xây dựng tài liệu mô tả nghiệp vụ đầy đủ, nhất quán và có thể sử dụng làm cơ sở để ba thành viên phát triển các module độc lập.

Tài liệu phải giúp người đọc hiểu:
- Hệ thống giải quyết vấn đề gì.
- Những đối tượng nào tham gia hệ thống.
- Các module và chức năng cần có.
- Dữ liệu đi qua hệ thống như thế nào.
- Các nghiệp vụ liên kết với nhau ra sao.
- Điều kiện nào cho phép hoặc ngăn cản một nghiệp vụ.
- Các trường hợp thành công, thất bại và ngoại lệ.
- Kết quả nghiệp vụ sau mỗi thao tác.
- Báo cáo được hình thành từ dữ liệu nào.
- Ba thành viên cần triển khai những phần nào và phụ thuộc lẫn nhau ở đâu.
- Những chức năng nào đã có, còn thiếu, sai hoặc chưa thể xác nhận trong dự án hiện tại.

Không chỉ liệt kê màn hình hay CRUD. Phải phân tích nghiệp vụ xuyên suốt từ lúc khai báo dữ liệu, đặt hàng, nhập kho, xuất kho đến thống kê và quản trị hệ thống.

## 2. Bối cảnh và công nghệ

Dự án sử dụng:
- Frontend: Pug, Tailwind CSS, JavaScript.
- Backend: Node.js, Express.js.
- Database: Microsoft SQL Server.
- Các nghiệp vụ truy cập dữ liệu thông qua Stored Procedure.
- Kiến trúc tổng thể tuân theo bộ Rule đã có của dự án.

Không tự ý đổi công nghệ, thay đổi kiến trúc đã thống nhất hoặc tạo ra một bộ Rule khác.

Nếu dự án có mã nguồn đính kèm, hãy đọc và phân tích mã nguồn thực tế trước khi đưa ra kết luận. Phân biệt rõ giữa chức năng đã triển khai, triển khai một phần, chưa triển khai và không thể xác minh. Không được suy đoán rằng chức năng đã tồn tại chỉ vì có tên file, route hoặc giao diện.

## 3. Phạm vi dữ liệu

Hệ thống sử dụng các bảng nghiệp vụ được quy định trong đề:

### 3.1. Nhanvien — Nhân viên

Các trường:
- `MANV`: mã nhân viên, khóa chính.
- `HO`: họ.
- `TEN`: tên.
- `DIACHI`: địa chỉ.
- `NGAYSINH`: ngày sinh.
- `LUONG`: lương, tối thiểu 5.000.000.
- `GHICHU`: ghi chú.

Nghiệp vụ:
- Xem danh sách nhân viên.
- Thêm nhân viên.
- Chỉnh sửa thông tin.
- Xóa nhân viên nếu thỏa điều kiện nghiệp vụ và không vi phạm quan hệ dữ liệu.
- Tìm kiếm nhân viên.
- Lưu và khôi phục dữ liệu đang chỉnh sửa theo hành vi được xác định trong giao diện.
- Xác định những nghiệp vụ nào cần liên kết nhân viên thực hiện.

### 3.2. Vattu — Vật tư

Các trường:
- `MAVT`: mã vật tư, khóa chính.
- `TENVT`: tên vật tư, duy nhất.
- `DVT`: đơn vị tính.
- `Soluongton`: số lượng tồn kho.

Nghiệp vụ:
- Xem, thêm, chỉnh sửa, xóa và tìm kiếm vật tư.
- Theo dõi số lượng tồn.
- Cung cấp dữ liệu vật tư cho đặt hàng, nhập kho, xuất kho và báo cáo.
- Xác định điều kiện xóa vật tư đã phát sinh giao dịch.
- Làm rõ cách xử lý khi người dùng thay đổi thông tin vật tư đã được sử dụng trong chứng từ.

### 3.3. DatHang — Đơn đặt hàng

Các trường:
- `MasoDDH`: mã đơn đặt hàng.
- `NGAY`: ngày đặt hàng.
- `NhaCC`: nhà cung cấp.
- `MANV`: nhân viên phụ trách.

Bảng `CTDDH` chứa các dòng chi tiết:
- `MasoDDH`: mã đơn hàng.
- `MAVT`: mã vật tư.
- `SOLUONG`: số lượng đặt, phải lớn hơn 0.
- `DONGIA`: đơn giá, không âm.

Một đơn đặt hàng có thể gồm nhiều vật tư. Mỗi dòng chi tiết thể hiện số lượng và đơn giá của một vật tư trong đơn.

Nghiệp vụ:
- Lập đơn đặt hàng.
- Thêm nhiều dòng vật tư vào đơn.
- Chỉnh sửa thông tin đơn và chi tiết theo trạng thái nghiệp vụ.
- Xem chi tiết đơn.
- Tìm kiếm đơn theo mã, ngày, nhà cung cấp hoặc nhân viên.
- Xác định trạng thái nhận hàng dựa trên số lượng đã nhập.
- Xem các đơn chưa nhập, nhập một phần hoặc đã nhập đủ.

### 3.4. PhieuNhap — Phiếu nhập kho

Các trường:
- `MAPN`: mã phiếu nhập.
- `NGAY`: ngày nhập, có giá trị mặc định theo cấu trúc database.
- `MasoDDH`: đơn đặt hàng liên quan.
- `MANV`: nhân viên thực hiện.

Bảng `CTPN` chứa:
- `MAPN`: mã phiếu nhập.
- `MAVT`: mã vật tư.
- `SOLUONG`: số lượng nhập, phải lớn hơn 0.
- `DONGIA`: đơn giá nhập, không âm.

Nghiệp vụ:
- Chọn đơn đặt hàng làm căn cứ nhập.
- Hiển thị vật tư đã đặt và số lượng tương ứng.
- Tính tổng số lượng đã nhập trước đó của từng vật tư thuộc đơn hàng.
- Xác định số lượng còn được phép nhập.
- Lập một phiếu nhập có nhiều dòng chi tiết.
- Cho phép một đơn đặt hàng có nhiều phiếu nhập.
- Không cho phép tổng số lượng nhập của một vật tư vượt quá số lượng đã đặt.
- Cập nhật tồn kho sau khi nhập thành công.
- Xem danh sách, chi tiết và lịch sử nhập kho.
- Xác định cách xử lý việc chỉnh sửa hoặc hủy phiếu nhập sau khi đã tác động đến tồn kho.

### 3.5. PhieuXuat — Phiếu xuất kho

Các trường:
- `MAPX`: mã phiếu xuất.
- `NGAY`: ngày xuất, có giá trị mặc định theo cấu trúc database.
- `HOTENKH`: họ tên khách hàng.
- `MANV`: nhân viên thực hiện.

Bảng `CTPX` chứa:
- `MAPX`: mã phiếu xuất.
- `MAVT`: mã vật tư.
- `SOLUONG`: số lượng xuất, phải lớn hơn 0.
- `DONGIA`: đơn giá xuất, không âm.

Nghiệp vụ:
- Lập phiếu xuất cho khách hàng.
- Thêm nhiều dòng vật tư.
- Hiển thị tồn kho hiện tại khi chọn vật tư.
- Kiểm tra số lượng yêu cầu xuất.
- Không cho phép xuất nhiều hơn lượng tồn có thể sử dụng.
- Giảm tồn kho sau khi xuất thành công.
- Xem danh sách, chi tiết và lịch sử xuất kho.
- Xác định cách xử lý chỉnh sửa, hủy hoặc xóa phiếu đã ghi nhận.

## 4. Các luồng nghiệp vụ tổng thể

Phân tích tối thiểu các luồng sau.

### 4.1. Luồng quản lý danh mục

Nhân viên quản trị dữ liệu danh mục → thêm hoặc chỉnh sửa nhân viên, vật tư → hệ thống kiểm tra dữ liệu → lưu thông tin → cung cấp dữ liệu cho các nghiệp vụ khác.

Làm rõ:
- Trường hợp dữ liệu hợp lệ.
- Trường hợp trùng mã hoặc tên vật tư.
- Trường hợp lương không đạt yêu cầu.
- Trường hợp xóa dữ liệu đang được chứng từ tham chiếu.
- Trường hợp tìm kiếm không có kết quả.
- Khác biệt giữa thao tác thêm mới, cập nhật, xóa, hủy thao tác và khôi phục dữ liệu nhập trên giao diện.

### 4.2. Luồng đặt hàng

Chọn nhân viên phụ trách → nhập thông tin đơn hàng → thêm các dòng vật tư → kiểm tra thông tin chung và chi tiết → xác nhận lưu → ghi nhận đơn hàng.

Làm rõ:
- Đơn hàng có một hoặc nhiều dòng vật tư.
- Một vật tư không được xuất hiện thành nhiều dòng trùng khóa `(MasoDDH, MAVT)` trong cùng đơn.
- Đơn hàng có thể chưa phát sinh nhập kho.
- Đơn hàng là căn cứ để lập phiếu nhập.
- Thay đổi đơn hàng sau khi đã phát sinh nhập kho có thể ảnh hưởng đến tính hợp lệ của lịch sử nhập hàng.
- Các điều kiện được phép chỉnh sửa, xóa hoặc hủy phải được xác định rõ, không tự suy ra chức năng chưa có trong đề.

### 4.3. Luồng nhập kho dựa trên đơn đặt hàng

Chọn đơn đặt hàng → tải danh sách vật tư đã đặt → tính số lượng đã nhập và số lượng còn lại → nhập số lượng thực nhận → kiểm tra từng dòng → xác nhận phiếu → ghi nhận phiếu nhập, chi tiết và cập nhật tồn kho.

Ví dụ xuyên suốt:

- Đơn hàng đặt 100 đơn vị vật tư VT01.
- Các phiếu nhập trước đó đã nhập 30.
- Số lượng còn được phép nhập là 70.
- Nhập thêm 50: hợp lệ, sau khi thành công tổng nhập là 80.
- Nhập thêm 71 từ trạng thái ban đầu đã nhập 30: không hợp lệ vì vượt số lượng còn lại.
- Khi tổng số lượng nhập đạt 100: vật tư này đã được nhận đủ theo đơn hàng.

Phải làm rõ rằng số lượng còn được phép nhập được tính theo từng cặp đơn hàng và vật tư, không phải theo tổng số vật tư trong toàn bộ kho.

Một phiếu nhập có thể chứa nhiều dòng. Nếu bất kỳ dòng nào không hợp lệ thì phải phân tích hậu quả đối với toàn phiếu, chi tiết và tồn kho; không để xảy ra tình trạng chỉ lưu được một phần chứng từ.

### 4.4. Luồng xuất kho

Chọn hoặc thêm khách hàng theo dữ liệu được đề cho phép → thêm vật tư → xem tồn kho → nhập số lượng và đơn giá → kiểm tra tất cả dòng → xác nhận xuất → ghi nhận phiếu và chi tiết → giảm tồn kho.

Ví dụ:
- Tồn kho VT01 là 100.
- Người dùng yêu cầu xuất 30: hợp lệ, tồn sau giao dịch là 70.
- Người dùng yêu cầu xuất 80 khi tồn vẫn là 70: không hợp lệ.
- Người dùng tạo phiếu gồm VT01 và VT02 nhưng một trong hai dòng không hợp lệ: phân tích cách bảo đảm toàn bộ chứng từ không bị lưu dở dang.

Làm rõ:
- Nhiều dòng chi tiết trong một phiếu.
- Một vật tư không được lặp thành nhiều dòng có cùng khóa `(MAPX, MAVT)`.
- Tồn kho phải được kiểm tra tại thời điểm ghi nhận giao dịch, tránh dựa hoàn toàn vào dữ liệu tồn đã tải trước đó.
- Việc sửa hoặc hủy chứng từ đã xuất kho cần xử lý đúng ảnh hưởng tồn kho, nếu chức năng đó được phép.

### 4.5. Luồng theo dõi tồn kho

Phân tích mối quan hệ giữa tồn kho và giao dịch:
- Nhập kho làm tăng tồn.
- Xuất kho làm giảm tồn.
- Đặt hàng không trực tiếp làm tăng tồn.
- Trạng thái đơn đặt hàng được xác định từ lượng đặt và lượng nhập, không phải từ tồn kho hiện tại.
- Tồn kho hiện tại không nhất thiết bằng số lượng đã đặt trừ số lượng đã nhập, vì còn có giao dịch xuất kho và các giao dịch khác theo dữ liệu thực tế.

Làm rõ cách đối chiếu dữ liệu giữa `Vattu.Soluongton`, `CTPN` và `CTPX`; xác định các trường hợp có thể làm sai lệch số liệu và cách phát hiện qua kiểm tra hoặc báo cáo.

## 5. Phân tích chi tiết từng module chức năng

### Module A — Quản lý nhân viên

Bao gồm:
- Danh sách nhân viên.
- Thêm, sửa, xóa, tìm kiếm.
- Lưu và khôi phục theo hành vi giao diện.
- Kiểm tra điều kiện dữ liệu.
- Hiển thị lỗi và kết quả thao tác.
- Báo cáo danh sách nhân viên.

Mô tả từng chức năng theo cấu trúc:
1. Mục tiêu.
2. Người thực hiện.
3. Dữ liệu đầu vào.
4. Điều kiện trước khi thực hiện.
5. Các bước xử lý.
6. Dữ liệu thay đổi.
7. Kết quả thành công.
8. Các trường hợp lỗi.
9. Các module phụ thuộc.

### Module B — Quản lý vật tư

Bao gồm:
- Danh sách vật tư.
- Thêm, sửa, xóa, tìm kiếm.
- Hiển thị tồn kho.
- Kiểm tra mã và tên duy nhất.
- Kiểm soát ảnh hưởng đến đơn hàng, phiếu nhập và phiếu xuất.
- Báo cáo danh sách vật tư.

### Module C — Quản lý đơn đặt hàng

Bao gồm:
- Danh sách đơn đặt hàng.
- Lập đơn và nhiều dòng chi tiết.
- Sửa thông tin đơn theo điều kiện nghiệp vụ.
- Xem chi tiết đơn.
- Theo dõi lượng đã nhận và lượng còn lại.
- Tìm kiếm và lọc đơn.
- Báo cáo đơn chưa nhập hoặc chưa nhập đủ.

Phân biệt rõ trạng thái nghiệp vụ của từng đơn với trạng thái của từng vật tư trong đơn. Một đơn có thể có một vật tư đã nhận đủ nhưng vật tư khác mới nhận một phần.

### Module D — Quản lý phiếu nhập

Bao gồm:
- Danh sách phiếu nhập.
- Tạo phiếu dựa trên đơn đặt hàng.
- Chọn các vật tư được phép nhập.
- Hiển thị lượng đặt, lượng đã nhập, lượng còn lại.
- Nhập nhiều dòng.
- Tính tổng tiền phiếu nếu giao diện có yêu cầu.
- Cập nhật tồn kho.
- Xem chi tiết và lịch sử.
- Xử lý các trường hợp nhập vượt lượng đặt, vật tư không thuộc đơn hoặc đơn không tồn tại.

### Module E — Quản lý phiếu xuất

Bao gồm:
- Danh sách phiếu xuất.
- Tạo phiếu xuất.
- Chọn nhiều vật tư.
- Hiển thị tồn kho.
- Kiểm tra lượng xuất.
- Tính tổng tiền phiếu nếu giao diện có yêu cầu.
- Cập nhật tồn kho.
- Xem chi tiết và lịch sử.
- Xử lý tồn kho không đủ, vật tư không tồn tại và các lỗi dữ liệu.

### Module F — Đăng nhập, tài khoản và phân quyền

Đề bài yêu cầu có chức năng tạo/xóa Login, các nhóm Admin và Nhanvien, đổi mật khẩu và các giới hạn quyền liên quan.

Không tự tạo bảng tài khoản nghiệp vụ mới vì phạm vi database được quy định bởi đề. Phân tích cơ chế sử dụng SQL Server Login, Database User, Role và Permission; đồng thời làm rõ ranh giới giữa tài khoản SQL Server và phiên đăng nhập ứng dụng.

Các nội dung phải phân tích:
- Đăng nhập bằng thông tin nào.
- Cách xác thực và xác định danh tính người đang đăng nhập.
- Cách ánh xạ danh tính đăng nhập sang `MANV`.
- Cách lấy `MANV` của người thực hiện khi lập đơn, nhập kho hoặc xuất kho.
- Vai trò Admin và Nhanvien.
- Quyền truy cập từng màn hình và từng hành động.
- Tạo Login, xóa Login, đổi mật khẩu và gán quyền.
- Trường hợp đăng nhập sai, tài khoản không tồn tại, tài khoản bị vô hiệu hóa hoặc không đủ quyền.
- Hạn chế quyền tạo Login và backup database đối với Nhanvien.
- Rủi ro khi tài khoản đăng nhập không có ánh xạ hợp lệ đến nhân viên.

**Điểm bắt buộc:** không được mặc định rằng SQL Server Login tự động cung cấp một `MANV` hợp lệ. Phải xác định phương án ánh xạ danh tính đăng nhập sang nhân viên mà không thêm bảng ngoài đề. Nếu đề và database hiện tại chưa quy định cách ánh xạ này, ghi rõ là vấn đề cần quyết định, kèm các phương án khả thi và ưu nhược điểm. Không tự tuyên bố rằng phương án đã được chốt.

Cũng phải phân biệt:
- Tài khoản mà người dùng sử dụng để đăng nhập ứng dụng.
- Tài khoản dịch vụ mà Node.js sử dụng để kết nối SQL Server.
- Login/User/Role được quản trị bên trong SQL Server.

Không nhầm việc đăng nhập ứng dụng với việc mở trực tiếp một kết nối SQL Server cho từng người dùng.

### Module G — Sao lưu và phục hồi database

Đề bài yêu cầu backup/restore theo các mốc sao lưu.

Phân tích:
- Ai được phép sao lưu.
- Cách chọn vị trí và tên bản sao lưu.
- Cách ghi nhận kết quả sao lưu nếu không có bảng lịch sử riêng.
- Các trường hợp backup thất bại.
- Ai được phép phục hồi.
- Cách chọn bản sao lưu.
- Ảnh hưởng của restore đối với dữ liệu hiện có và người dùng đang kết nối.
- Các bước xác nhận trước khi phục hồi.
- Các rủi ro mất dữ liệu phát sinh sau thời điểm backup.
- Cách thông báo thành công hoặc thất bại.
- Giới hạn giữa thao tác backup/restore và quyền của tài khoản dịch vụ ứng dụng.

Không tự tạo bảng lịch sử backup nếu điều đó vi phạm giới hạn database. Phân biệt lịch sử có thể lấy từ SQL Server hoặc hệ thống bên ngoài với dữ liệu nghiệp vụ.

## 6. Phân tích toàn bộ báo cáo

### Báo cáo 2.1 — Danh sách nhân viên

- Lấy dữ liệu nhân viên.
- Sắp xếp tăng dần theo tên và họ theo yêu cầu đề bài.
- Làm rõ cách sắp xếp khi nhiều nhân viên trùng tên.
- Xác định cột hiển thị và khả năng lọc nếu có.

### Báo cáo 2.2 — Danh sách vật tư

- Lấy danh sách vật tư.
- Sắp xếp tăng dần theo `TENVT`.
- Xác định các cột hiển thị, bao gồm số lượng tồn.

### Báo cáo 2.3 — Đơn đặt hàng chưa nhập hoặc nhập chưa đủ

Tính tổng số lượng đã nhập cho từng cặp `(MasoDDH, MAVT)` bằng cách liên kết đơn hàng, chi tiết đơn hàng, phiếu nhập và chi tiết phiếu nhập.

Phân loại:
- Chưa nhập: lượng đã nhập bằng 0.
- Nhập một phần: lượng đã nhập lớn hơn 0 nhưng nhỏ hơn lượng đặt.
- Đã nhập đủ: lượng đã nhập bằng lượng đặt.

Báo cáo cần tập trung vào đơn chưa nhập hoặc nhập chưa đủ theo yêu cầu. Làm rõ:
- Đơn có nhiều vật tư với các trạng thái khác nhau.
- Đơn chưa có phiếu nhập nào.
- Phiếu nhập có nhiều dòng.
- Tránh nhân bản số lượng khi JOIN nhiều bảng.
- Cách hiển thị đơn hàng và vật tư còn thiếu.

### Báo cáo 2.4 — Chi tiết số lượng và giá trị nhập/xuất theo tháng trong khoảng thời gian

Phân tích dữ liệu theo khoảng ngày người dùng chọn.

Làm rõ:
- Điều kiện ngày bắt đầu và kết thúc.
- Cách lọc theo ngày tháng.
- Chi tiết số lượng và giá trị nhập.
- Chi tiết số lượng và giá trị xuất.
- Cách tính giá trị từ số lượng và đơn giá.
- Cách nhóm dữ liệu theo tháng.
- Cách trình bày kết quả khi một tháng không có giao dịch.
- Không cộng trùng giá trị do quan hệ JOIN.

Nếu đề bài hoặc tài liệu hiện tại chưa xác định chính xác định dạng báo cáo, phải nêu rõ điểm chưa xác định thay vì tự ý chốt.

### Báo cáo 2.5 — Số phiếu nhập và tổng giá trị nhập theo tháng trong năm

- Người dùng chọn năm.
- Thống kê số phiếu nhập và tổng giá trị nhập của từng tháng.
- Làm rõ cách tính giá trị từ các dòng `CTPN`.
- Không đếm trùng phiếu nhập khi phiếu có nhiều dòng.
- Xử lý tháng không phát sinh nhập.
- Tổng kết cả năm nếu cần theo định dạng đề bài.

### Báo cáo 2.6 — Số phiếu xuất và tổng giá trị xuất theo tháng trong năm

- Người dùng chọn năm.
- Thống kê số phiếu xuất và tổng giá trị xuất của từng tháng.
- Tính giá trị từ `CTPX`.
- Không đếm trùng phiếu xuất có nhiều dòng.
- Xử lý tháng không có giao dịch.
- Tổng kết cả năm nếu cần theo định dạng đề bài.

### Báo cáo 2.7 — Tổng hợp nhập xuất

Báo cáo tổng hợp theo ngày trong khoảng thời gian người dùng chọn.

Mỗi ngày thể hiện:
- Tổng giá trị nhập trong ngày.
- Tổng giá trị xuất trong ngày.
- Tỷ lệ giá trị nhập so với tổng giá trị nhập trong toàn khoảng thời gian.
- Tỷ lệ giá trị xuất so với tổng giá trị xuất trong toàn khoảng thời gian.

Cuối báo cáo thể hiện tổng giá trị nhập, tổng giá trị xuất và các tỷ lệ tổng hợp phù hợp.

Phân tích:
- Ngày chỉ có nhập.
- Ngày chỉ có xuất.
- Ngày không có giao dịch.
- Khoảng thời gian không có giao dịch.
- Tránh chia cho 0.
- Không nhân bản tổng tiền do JOIN phiếu nhập và phiếu xuất trực tiếp với nhau.
- Xác định rõ mẫu số của từng tỷ lệ.
- Phân biệt tổng giá trị giao dịch trong khoảng thời gian với tồn kho cuối kỳ.

Không tự gán tỷ lệ nhập và tỷ lệ xuất chung một mẫu số nếu yêu cầu chưa quy định như vậy.

## 7. Phân tích mối quan hệ giữa các module

Xây dựng ma trận phụ thuộc, tối thiểu gồm:

| Module | Dữ liệu sử dụng | Module liên quan | Tác động nghiệp vụ |
|---|---|---|---|
| Nhân viên | Nhanvien | Đặt hàng, nhập, xuất, tài khoản | Xác định người phụ trách |
| Vật tư | Vattu | Đặt hàng, nhập, xuất, báo cáo | Danh mục và tồn kho |
| Đặt hàng | DatHang, CTDDH | Nhập kho, báo cáo 2.3 | Xác định lượng cần nhận |
| Nhập kho | PhieuNhap, CTPN, Vattu | Đặt hàng, xuất kho, báo cáo | Tăng tồn và giảm lượng còn được nhận |
| Xuất kho | PhieuXuat, CTPX, Vattu | Báo cáo | Giảm tồn |
| Tài khoản | SQL Server Security và cơ chế phiên ứng dụng | Tất cả module được bảo vệ | Xác thực và phân quyền |
| Backup/Restore | SQL Server | Toàn hệ thống | Bảo vệ và phục hồi dữ liệu |
| Báo cáo | Các bảng nghiệp vụ | Danh mục, đặt hàng, nhập, xuất | Tổng hợp và đối chiếu |

Chỉ ra rõ module nào cần dữ liệu của module khác nhưng không cần chờ giao diện của module đó hoàn thành mới bắt đầu phát triển.

## 8. Phân công ba thành viên

Sử dụng phương án phân công sau làm cơ sở phân tích.

### Thành viên 1 — Danh mục, đặt hàng và tài khoản

Phụ trách:
- Quản lý nhân viên.
- Quản lý vật tư.
- Đơn đặt hàng và chi tiết đơn hàng.
- Đăng nhập, Login, phân quyền và đổi mật khẩu.
- Báo cáo 2.1.
- Báo cáo 2.2.

### Thành viên 2 — Nhập kho

Phụ trách:
- Phiếu nhập.
- Chi tiết phiếu nhập.
- Liên kết phiếu nhập với đơn đặt hàng.
- Kiểm soát lượng đã nhập và lượng còn lại.
- Cập nhật tồn kho khi nhập.
- Báo cáo 2.3.
- Báo cáo 2.5.

### Thành viên 3 — Xuất kho, quản trị database và báo cáo tổng hợp

Phụ trách:
- Phiếu xuất.
- Chi tiết phiếu xuất.
- Kiểm tra tồn kho.
- Cập nhật tồn kho khi xuất.
- Backup/Restore.
- Báo cáo 2.4.
- Báo cáo 2.6.
- Báo cáo 2.7.

Đánh giá:
- Khối lượng nghiệp vụ của mỗi thành viên.
- Độ khó logic.
- Số lượng màn hình và báo cáo.
- Rủi ro kỹ thuật.
- Các điểm cần phối hợp.
- Các hạng mục có thể chuyển giao để cân bằng tiến độ mà không làm mơ hồ quyền sở hữu module.

Không tự ý đổi phân công nếu chưa nêu rõ lý do và tác động.

## 9. Kế hoạch phát triển và tích hợp

Xây dựng lộ trình theo giai đoạn.

### Giai đoạn 1 — Khảo sát và xác nhận nghiệp vụ

- Đọc đề bài và schema database.
- Đối chiếu các bảng và quan hệ.
- Xác định các điểm đề bài chưa nói rõ.
- Liệt kê quyết định cần nhóm thống nhất.
- Chưa tự ý mở rộng phạm vi.

### Giai đoạn 2 — Chuẩn bị dữ liệu kiểm thử chung

Xây dựng dữ liệu mẫu để ba thành viên phát triển độc lập.

Ví dụ:
- Hai nhân viên mẫu.
- Các vật tư VT01, VT02, VT03.
- Một đơn hàng gồm VT01 số lượng 100, VT02 số lượng 50 và VT03 số lượng 30.
- Một phiếu nhập trước đó nhận VT01 số lượng 30 và VT02 số lượng 20.

Dữ liệu này dùng để kiểm tra:
- Số lượng còn được nhận.
- Trường hợp nhập hợp lệ.
- Trường hợp nhập vượt số lượng đặt.
- Tồn kho trước và sau xuất.
- Báo cáo đơn chưa nhập đủ.
- Báo cáo nhập xuất.

Đây là dữ liệu phục vụ kiểm thử, không phải dữ liệu nghiệp vụ bắt buộc của đề.

### Giai đoạn 3 — Phát triển song song

- Thành viên 1 triển khai danh mục, đặt hàng và tài khoản.
- Thành viên 2 triển khai nhập kho dựa trên schema và dữ liệu mẫu chung.
- Thành viên 3 triển khai xuất kho, backup/restore và báo cáo dựa trên schema và dữ liệu mẫu chung.

Nêu rõ các đầu vào và đầu ra mỗi module cần thống nhất để tích hợp.

### Giai đoạn 4 — Tích hợp

- Tích hợp đăng nhập và phân quyền.
- Tích hợp danh mục với đặt hàng.
- Tích hợp đặt hàng với nhập kho.
- Tích hợp nhập và xuất với tồn kho.
- Tích hợp các báo cáo.
- Tích hợp backup/restore và kiểm tra quyền.
- Xác nhận các luồng từ đầu đến cuối.

### Giai đoạn 5 — Kiểm thử nghiệp vụ

Kiểm thử cả trường hợp thành công và thất bại:
- Tạo dữ liệu hợp lệ.
- Trùng mã hoặc tên.
- Thiếu trường bắt buộc.
- Sai kiểu dữ liệu.
- Số lượng không hợp lệ.
- Nhập vượt lượng đặt.
- Xuất vượt tồn kho.
- Nhân viên không tồn tại hoặc không hợp lệ.
- Người dùng không đủ quyền.
- Lỗi giữa chừng khi lưu chứng từ nhiều dòng.
- Không có dữ liệu báo cáo.
- Lọc ngày và năm sai.
- Backup/restore thất bại.
- Dữ liệu tồn kho không khớp với lịch sử giao dịch.

### Giai đoạn 6 — Đánh giá hoàn thiện

Đối chiếu toàn bộ chức năng với đề bài:
- Đã hoàn thành.
- Hoàn thành một phần.
- Chưa triển khai.
- Sai nghiệp vụ.
- Chưa kiểm thử.
- Chưa đủ thông tin để xác nhận.

## 10. Các vấn đề nghiệp vụ cần làm rõ

Không tự đặt quy định mới cho các vấn đề chưa được đề bài xác định. Tạo danh sách câu hỏi cần nhóm thống nhất, bao gồm:

1. Đơn đặt hàng có được sửa hoặc xóa sau khi đã phát sinh phiếu nhập không?
2. Có cho phép hủy phiếu nhập hoặc phiếu xuất không? Nếu có, cách đảo tồn kho ra sao?
3. Có cho phép sửa chi tiết chứng từ đã lưu không?
4. Mã chứng từ do người dùng nhập hay hệ thống sinh?
5. Cách ánh xạ SQL Server Login sang `MANV` khi không được thêm bảng tài khoản.
6. Cơ chế phiên đăng nhập ứng dụng và phân quyền tương ứng với SQL Server Security.
7. Cách xử lý khi nhân viên bị xóa hoặc ngừng sử dụng nhưng vẫn có lịch sử chứng từ.
8. Định dạng chính xác của báo cáo 2.4 và 2.7 nếu đề bài chưa mô tả đầy đủ.
9. Quyền của Admin và Nhanvien trên từng màn hình và thao tác.
10. Cách xác định, hiển thị và lưu trữ các mốc backup.
11. Có cần lưu lịch sử chỉnh sửa hoặc hủy chứng từ hay không, trong giới hạn không thêm bảng nghiệp vụ.
12. Có cho phép nhiều người đồng thời lập phiếu nhập/xuất cùng một vật tư hay không, và cách tránh vượt số lượng do thao tác đồng thời.

Với mỗi câu hỏi, trình bày:
- Vấn đề.
- Vì sao cần quyết định.
- Các phương án khả thi.
- Ưu và nhược điểm.
- Đề xuất phù hợp với đề bài.
- Trạng thái: đã chốt, đề xuất hoặc chờ xác nhận.

## 11. Đầu ra cần tạo

Tạo một tài liệu Markdown tổng thể, đề xuất đường dẫn:

`docs/analysis/QLVT_BUSINESS_ANALYSIS.md`

Tài liệu cần có các phần:

1. Tổng quan hệ thống.
2. Phạm vi và giới hạn.
3. Đối tượng sử dụng.
4. Danh mục dữ liệu và quan hệ nghiệp vụ.
5. Danh sách module.
6. Phân tích chi tiết từng chức năng.
7. Các luồng nghiệp vụ đầu cuối.
8. Các sơ đồ luồng bằng Mermaid.
9. Ma trận phụ thuộc module.
10. Phân tích báo cáo.
11. Phân công ba thành viên.
12. Kế hoạch phát triển và tích hợp.
13. Kịch bản kiểm thử.
14. Danh sách vấn đề chưa chốt.
15. Ma trận đối chiếu đề bài với chức năng.
16. Đánh giá hiện trạng mã nguồn nếu có.
17. Kết luận về phạm vi nghiệp vụ đã thống nhất.

## 12. Yêu cầu về chất lượng tài liệu

- Viết bằng tiếng Việt rõ ràng, có cấu trúc.
- Giải thích nghiệp vụ theo cách người không chuyên kỹ thuật cũng hiểu.
- Phân biệt nghiệp vụ, giao diện, dữ liệu và chi tiết triển khai.
- Dùng ví dụ xuyên suốt cho đặt hàng, nhập kho và xuất kho.
- Không chỉ liệt kê tên chức năng.
- Mỗi nghiệp vụ quan trọng phải có luồng chính, điều kiện, kết quả và trường hợp ngoại lệ.
- Không lặp lại toàn bộ bộ Rule hiện có.
- Không tạo bảng database ngoài phạm vi đề bài.
- Không tự mở rộng thành các tính năng như quản lý khách hàng riêng, nhà cung cấp riêng, kế toán, thanh toán hoặc tính giá vốn nếu chưa được yêu cầu.
- Không coi một đề xuất là yêu cầu đã được xác nhận.
- Không khẳng định chức năng đã triển khai nếu chưa kiểm tra mã nguồn.
- Không viết code triển khai thay cho tài liệu phân tích nghiệp vụ.
- Nếu phát hiện điểm không nhất quán giữa đề bài, database và mã nguồn, phải nêu rõ và đề xuất cách giải quyết.
- Ưu tiên tính đầy đủ, nhất quán và khả năng triển khai thực tế hơn là độ dài không cần thiết.

**Nhiệm vụ cuối cùng:** Hoàn thành tài liệu phân tích nghiệp vụ tổng thể đủ chi tiết để cả ba thành viên có thể dựa vào đó phát triển độc lập, hiểu rõ phạm vi trách nhiệm và tích hợp hệ thống mà không phải tự suy diễn nghiệp vụ quan trọng.