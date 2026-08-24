# BẢN ĐỒ TÍNH NĂNG VÀ PHÂN QUYỀN TRÊN GIAO DIỆN HỆ THỐNG
## Hệ thống Quản lý Món ăn & Vận hành Nhà hàng (PhanMemQuanLyMonAn)

Tài liệu này lập bản đồ chi tiết cho toàn bộ tính năng của hệ thống, chỉ rõ **chức năng đó nằm ở màn hình nào (URL/Blade View)**, **do Controller nào xử lý**, và **những vai trò (role) nào được phép nhìn thấy hoặc tương tác**.

---

## 1. PHÂN QUYỀN THEO VAI TRÒ (ROLES & ACTIONS SUMMARY)

Hệ thống quản lý truy cập dựa trên 4 đối tượng chính:

1.  **Ban Điều Hành (`admin`):**
    *   Toàn quyền truy cập tất cả các màn hình và thực hiện mọi hành động (Báo cáo Dashboard, Quản lý nhân sự, Thực đơn, Kho hàng, Sơ đồ bàn, Thu ngân, Nhà cung cấp).
2.  **Nhân Viên Phục Vụ & Thu Ngân (`nhan_vien`):**
    *   Được phép truy cập: Sơ đồ bàn & Thu ngân, Màn hình Nhân viên phục vụ, Đơn món chi tiết, CRM Khách hàng.
    *   *Không được phép:* Dashboard Quản lý, Thực đơn Món ăn & Định lượng BOM, Nhân sự Phân quyền, Kho nguyên liệu & Nhà cung cấp.
3.  **Nhà Bếp & Thủ Kho (`bep`):**
    *   Được phép truy cập: Màn hình Bếp KDS (Kitchen Display System), Kho Nguyên liệu (Quản lý lô, so sánh giá, đề xuất mua, duyệt thực nhận, báo cáo hao hụt).
    *   *Không được phép:* Dashboard Quản lý, Sơ đồ bàn & Thu ngân, CRM Khách hàng, Thực đơn & BOM, Nhân sự Phân quyền.
4.  **Khách Hàng (Quét QR tại Bàn):**
    *   Không cần tài khoản đăng nhập. Chỉ truy cập trang gọi món của bàn tương ứng để chọn món, xem trạng thái chế biến và gọi thanh toán.

---

## 2. BẢN ĐỒ CHI TIẾT TÍNH NĂNG THEO MÀN HÌNH (SCREEN-TO-FEATURE MAP)

Dưới đây là danh sách toàn bộ các màn hình chính trong hệ thống:

### 2.1. Màn hình Đăng nhập & Đăng ký (Auth Screen)
*   **Đường dẫn URL:** `/login` & `/register`
*   **File View (Blade):** [login.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/auth/login.blade.php) & [register.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/auth/register.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\AuthController`
*   **Quyền truy cập:** Công cộng (Khách vãng lai, nhân viên chưa đăng nhập).
*   **Các tính năng chi tiết:**
    *   **Đăng nhập hệ thống:** Form nhập Email và Mật khẩu để xác thực thành viên nhà hàng.
    *   **Đăng ký tài khoản mới:** Form tạo tài khoản phục vụ mục đích kiểm thử hoặc đăng ký nhân viên mới.
    *   **Đăng xuất:** Nút đăng xuất (nằm ở góc trên bên phải header của Layout chung [app.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/layouts/app.blade.php)), xóa Session đăng nhập.

---

### 2.2. Màn hình Báo cáo Quản lý (Admin Dashboard)
*   **Đường dẫn URL:** `/quan-ly`
*   **File View (Blade):** [quan_ly.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/ban/quan_ly.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\ReportController@quanLy`
*   **Quyền truy cập:** `admin` (Chỉ Admin mới nhìn thấy và bấm được menu này trên Sidebar).
*   **Các tính năng chi tiết:**
    *   **Thống kê Ca trực:** Hiển thị tổng số nhân viên đang trực và giờ công tạm tính.
    *   **Thống kê Doanh thu:** Tổng doanh số hôm nay, phân bổ theo Tiền mặt (két) và Chuyển khoản QR (nhận qua ngân hàng), doanh số chi tiết từng bàn.
    *   **Thống kê Đơn hàng:** Tổng số đĩa món ăn đã gọi, tỷ lệ hoàn thành, tỷ lệ hủy đơn (theo dõi thất thoát).
    *   **Thống kê Món ăn:** Biểu đồ TOP 5 món ăn bán chạy nhất và danh sách các món bán chậm nhất để điều chỉnh menu.
    *   **Thống kê Nguyên liệu:** Cảnh báo đỏ các nguyên liệu tồn dưới 5kg, tỷ lệ hao hụt trong bếp.
    *   **Thống kê Sự cố:** Tổng hợp phản hồi xấu của khách và sự cố trang thiết bị phát sinh trong ca làm việc.
    *   **Xuất báo cáo tài chính (Excel/CSV):** Nút *"Xuất Excel"* xuất lịch sử hóa đơn bán hàng định dạng UTF-8 không lỗi font tiếng Việt.
    *   **Lưu báo cáo ca trực:** Nút *"Lưu báo cáo ca"* giúp lưu trữ dữ liệu ca trực vào database.
    *   **Xem lịch sử báo cáo:** Link dẫn sang trang Lịch sử báo cáo ([danh_sach_bao_cao.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/ban/danh_sach_bao_cao.blade.php)).
    *   **Kích hoạt tạo báo cáo tự động:** Nút *"Tạo báo cáo tháng tự động"* (Artisan command chạy ngầm thông qua Controller).
    *   **Sao lưu dữ liệu hệ thống (Backup System):** Hai nút *"Backup Database (MySQL)"* và *"Backup Files (Hình ảnh/QR)"* để tạo file nén dự phòng trực tiếp trên server. Danh sách file backup hiển thị kèm các nút Tải xuống và Xóa file.

---

### 2.3. Màn hình Sơ đồ bàn & Thu ngân (Table Map & Cashier)
*   **Đường dẫn URL:** `/ban` hoặc `/` (đối với nhân viên/admin)
*   **File View (Blade):** [ban.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/ban/ban.blade.php) (Có tích hợp AJAX tải [ordered_items_grid.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/ban/ordered_items_grid.blade.php) hiển thị chi tiết hóa đơn bàn).
*   **Controller xử lý:** `App\Http\Controllers\BanController`
*   **Quyền truy cập:** `admin`, `nhan_vien` (Nhân viên phục vụ và Admin nhìn thấy menu này trên Sidebar).
*   **Các tính năng chi tiết:**
    *   **Giám sát sơ đồ bàn trực quan:** Danh sách các bàn hiển thị bằng ô lưới (Grid) với các màu sắc thể hiện trạng thái tức thời (Màu xanh lá: `Trống`, Màu xanh dương: `Có khách`, Màu đỏ: `Đã gọi món`).
    *   **Thêm bàn ăn mới:** Nút *"Thêm bàn mới"* hiển thị modal để nhập tên bàn (Hệ thống tự động sinh mã QR đặt món riêng biệt cho bàn mới đó).
    *   **In mã QR đặt món:**
        *   Nút *"In tất cả QR"* trên đầu trang để xuất bản in hàng loạt.
        *   Nút *"In mã QR"* riêng lẻ trên từng ô bàn ăn.
    *   **Băng cảnh báo Yêu cầu thanh toán (Real-time Alert):** Khi khách từ bàn quét QR bấm nút yêu cầu thanh toán/báo chuyển khoản, một băng thông báo màu vàng nhấp nháy lập tức xuất hiện trên đầu sơ đồ bàn kèm âm báo.
    *   **Xem chi tiết hóa đơn bàn ăn:** Click vào bất kỳ bàn nào đang hoạt động để mở khung chi tiết hóa đơn ở bên phải màn hình (Danh sách món, đơn giá, số lượng, ghi chú chế biến).
    *   **Thực hiện nghiệp vụ CRM Tích & Tiêu điểm:**
        *   Form nhập Số điện thoại khách hàng để tra cứu thông tin thành viên.
        *   Hiển thị số điểm tích lũy hiện có của khách.
        *   Nút *"Dùng điểm"* để quy đổi điểm thành tiền giảm trừ trực tiếp trên hóa đơn.
    *   **Thanh toán hóa đơn (Checkout):** Nút *"Thanh toán toàn bộ"* để kết toán hóa đơn, tích điểm tự động cho khách hàng và giải phóng bàn ăn về trạng thái trống.
    *   **Tách hóa đơn thanh toán (Split Bill):** Nút *"Tách hóa đơn"* hiển thị danh sách món ăn dưới dạng hộp chọn. Nhân viên chọn món ăn và số lượng cần tách để tạo một Bill phụ thanh toán trước cho khách về sớm (giữ lại các món còn lại trên bàn).

---

### 2.4. Màn hình Kho Nguyên liệu & Lô hàng (Inventory Management)
*   **Đường dẫn URL:** `/nguyen-lieu`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/nguyen_lieu/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\NguyenLieuController`
*   **Quyền truy cập:** `admin`, `bep` (Nhà bếp/Thủ kho và Admin truy cập từ Sidebar).
*   **Các tính năng chi tiết:**
    *   **Theo dõi Tồn kho tổng hợp:** Danh sách toàn bộ nguyên liệu kèm tổng số lượng tồn kho thực tế và đơn vị tính (kg, lít, cái, hộp,...).
    *   **Quản lý chi tiết Lô hàng nhập (`lo_hang_nhap`):** Click vào từng nguyên liệu để xem danh sách các lô hàng đang lưu trữ trong kho (Ngày nhập, hạn sử dụng, giá vốn nhập, số lượng tồn riêng biệt của từng lô và vị trí lưu kho chi tiết).
    *   **Cảnh báo cận hạn sử dụng (FEFO Warning):** Đánh dấu màu đỏ nổi bật đối với các lô hàng sắp hết hạn sử dụng (trong vòng 7 ngày) hoặc đã quá hạn sử dụng.
    *   **Báo cáo hao hụt & Hủy hàng:** Nút báo cáo hủy trên giao diện lô hàng nhập để lập biên bản trừ kho cho các trường hợp nguyên liệu ôi thiu, hư hỏng, chuột cắn.
    *   **So sánh giá giữa các nhà cung cấp:** Tab *"So sánh giá NCC"*, gõ tên nguyên liệu để truy vấn xem nhà cung cấp nào đang có giá bán tốt nhất dựa trên lịch sử nhập hàng.
    *   **Đề xuất mua hàng (Order Proposal):** Form chọn nguyên liệu, chọn nhà cung cấp và nhập số lượng dự kiến mua để gửi đơn đề xuất mua hàng.
    *   **Duyệt nhập kho thực nhận (Verify Import):** Danh sách các đơn đặt hàng đang chờ. Khi hàng về, thủ kho nhập số lượng cân/đo thực nhận để hệ thống đối chiếu chênh lệch và tự động sinh Lô hàng nhập mới cập nhật vào kho.

---

### 2.5. Màn hình Bếp điều phối KDS (Kitchen Display System)
*   **Đường dẫn URL:** `/dat-mon/bep`
*   **File View (Blade):** [bep.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/dat_mon/bep.blade.php) (Tự động cập nhật nội dung qua AJAX từ file [bep_grid.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/dat_mon/bep_grid.blade.php)).
*   **Controller xử lý:** `App\Http\Controllers\DatMonController@bep`
*   **Quyền truy cập:** `admin`, `bep` (Đầu bếp và Admin truy cập thông qua Sidebar).
*   **Các tính năng chi tiết:**
    *   **Bảng điều phối chế biến KDS:** Danh sách các món ăn đang đợi nấu được sắp xếp tự động theo thứ tự ưu tiên gọi món (Mức 1, Mức 2, Mức 3) và thời gian khách đã chờ đợi.
    *   **Âm báo Ding-dong tự động:** Phát âm thanh thông báo mỗi khi có khách đặt thêm món mới qua QR mà bếp không cần F5 trang.
    *   **Tiếp nhận nấu ăn (Nhấp nấu):** Nút *"Bắt đầu làm"* chuyển trạng thái món sang `dang_lam`. **Hành động này kích hoạt thuật toán trừ kho FEFO tự động** (trừ trực tiếp số lượng nguyên liệu định lượng từ lô cận hạn nhất). Nếu kho thiếu nguyên liệu, hệ thống hiển thị thông báo lỗi và chặn không cho chế biến.
    *   **Hoàn tất món ăn:** Nút *"Hoàn thành"* chuyển trạng thái món sang `da_xong`. Món ăn biến mất khỏi màn hình bếp và lập tức xuất hiện bên màn hình nhân viên phục vụ chạy bàn.
    *   **Cấu hình số lượng đầu bếp trực ca:** Thanh chọn số lượng đầu bếp hoạt động (từ 1 đến 15). Dữ liệu này dùng để hệ thống tính toán thời gian chờ ước tính của khách hàng.

---

### 2.6. Màn hình phục vụ của Nhân viên chạy bàn (Staff Service Board)
*   **Đường dẫn URL:** `/nhan-vien`
*   **File View (Blade):** [nhan_vien.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/dat_mon/nhan_vien.blade.php) (Cập nhật real-time qua AJAX từ [nhan_vien_grid.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/dat_mon/nhan_vien_grid.blade.php)).
*   **Controller xử lý:** `App\Http\Controllers\DatMonController@nhanVien`
*   **Quyền truy cập:** `admin`, `nhan_vien` (Nhân viên phục vụ chạy bàn và Admin truy cập từ Sidebar).
*   **Các tính năng chi tiết:**
    *   **Danh sách đĩa món đã hoàn thành:** Hiển thị danh sách các món ăn mà bếp đã nhấn hoàn tất, ghi rõ số bàn ăn để nhân viên bê ra phục vụ khách.
    *   **Xác nhận đã phục vụ:** Nút *"Đã giao"* chuyển trạng thái món ăn sang `da_giao`. Trạng thái này sẽ đồng bộ ngay lập tức lên màn hình điện thoại của khách hàng đang ngồi tại bàn.
    *   **Gọi món trực tiếp tại bàn:** Cho phép nhân viên dùng giao diện phục vụ nhanh để gọi thêm món trực tiếp cho khách thay vì khách phải quét QR.

---

### 2.7. Giao diện Đặt món qua mã QR tại Bàn (Public QR Order Screen)
*   **Đường dẫn URL:** `/qr-order/{ban_id}` (với `{ban_id}` là số thứ tự bàn)
*   **File View (Blade):** [qr_order.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/ban/qr_order.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\DatMonController@qrOrder`
*   **Quyền truy cập:** Công cộng (Khách hàng vãng lai ngồi tại bàn quét mã QR bằng camera điện thoại, không cần đăng nhập).
*   **Các tính năng chi tiết:**
    *   **Khai báo số lượng khách:** Hộp thoại yêu cầu khách nhập số lượng người ngồi tại bàn trước khi xem thực đơn (lưu lại để tính lượng khách trong báo cáo).
    *   **Xem thực đơn điện tử (Menu E-catalog):** Duyệt món ăn theo phân loại rõ ràng (Khai vị, Món chính, Đồ uống, v.v.).
    *   **Đặt món kèm tùy chọn nâng cao:**
        *   Nhập số lượng đĩa món cần đặt.
        *   Viết ghi chú chế biến cho đầu bếp (ví dụ: *"Không bỏ hành"*, *"Cay vừa"*).
        *   **Thiết lập độ ưu tiên nấu món:** Chọn mức độ mong muốn phục vụ món (Mức 1: Theo thứ tự thường; Mức 2: Ra trước món chính; Mức 3: Nấu khẩn cấp).
    *   **Giám sát tiến độ nhà bếp (Real-time KDS Tracker):** Tab *Trạng thái bếp* hiển thị thanh tiến trình và trạng thái thực tế của từng món ăn đã gọi (`Đang chờ`, `Đang làm`, `Đã xong`), kèm đồng hồ đếm ngược thời gian chờ ước tính.
    *   **Yêu cầu thanh toán linh hoạt:**
        *   Nút *"Gọi thanh toán Tiền mặt"*: Gửi tín hiệu nhấp nháy báo nhân viên mang hóa đơn đến bàn.
        *   Nút *"Thanh toán Chuyển khoản QR"*: Hiển thị mã QR ngân hàng tự động sinh kèm số tiền cần trả. Khách chuyển khoản xong bấm *"Xác nhận đã chuyển khoản"* để báo hiệu cho thu ngân giải phóng bàn.

---

### 2.8. Màn hình Thực đơn Món ăn & Định lượng công thức BOM (Menu & Recipe BOM)
*   **Đường dẫn URL:** `/quan-ly/mon-an`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/mon_an/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\MonAnController`
*   **Quyền truy cập:** `admin` (Chỉ Admin mới nhìn thấy và truy cập menu này).
*   **Các tính năng chi tiết:**
    *   **Quản trị Thực đơn Món ăn (CRUD Dishes):** Danh sách món ăn đang phục vụ. Nút thêm món, sửa món (Tên, hình ảnh, đơn giá, thời gian nấu tiêu chuẩn) và nút xóa món.
    *   **Định lượng công thức món ăn (Recipe BOM):** Form cấu hình nguyên liệu cho món ăn. Admin chỉ định khi chế biến món này cần tiêu hao bao nhiêu gam/kg/cái của các nguyên liệu cụ thể lấy ra từ kho.
    *   **Quản lý danh mục loại món ăn (Categories CRUD):** Thêm, sửa, xóa loại món ăn (Khai vị, Món chính, Đồ uống, Lẩu,...) để phân nhóm thực đơn.

---

### 2.9. Màn hình Nhân viên & Phân quyền (Staff Management)
*   **Đường dẫn URL:** `/quan-ly/nhan-vien-quan-ly`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/nhan_vien/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\NhanVienController`
*   **Quyền truy cập:** `admin` (Chỉ Admin mới truy cập được).
*   **Các tính năng chi tiết:**
    *   **Xem danh sách nhân sự:** Bảng thống kê toàn bộ nhân viên nhà hàng (ID, Họ tên, Email, Quyền hạn, Ngày tham gia).
    *   **Thêm tài khoản nhân viên mới:** Form nhập Họ tên, Email đăng nhập, Mật khẩu ban đầu và phân quyền vai trò hoạt động (`admin`, `nhan_vien`, `bep`). Mật khẩu sẽ tự động được băm bảo mật (`bcrypt`) trước khi lưu database.
    *   **Sửa thông tin nhân sự:** Modal cập nhật thông tin tên, email, thay đổi vai trò hoặc cấp mật khẩu mới cho nhân viên.
    *   **Xóa/Thu hồi tài khoản:** Nút xóa tài khoản nhân viên (Hệ thống ràng buộc chặn không cho xóa tài khoản admin mặc định `admin@ms.com` để tránh mất quyền quản trị tối cao).

---

### 2.10. Màn hình CRM Khách hàng thân thiết (Customer Loyalty CRM)
*   **Đường dẫn URL:** `/quan-ly/khach-hang`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/khach_hang/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\KhachHangController`
*   **Quyền truy cập:** `admin`, `nhan_vien` (Nhân viên phục vụ và Admin truy cập từ Sidebar).
*   **Các tính năng chi tiết:**
    *   **Quản lý thông tin khách hàng (CRUD Customers):** Thêm mới thông tin khách hàng (Tên, Số điện thoại, Địa chỉ, Email), sửa thông tin hoặc xóa tài khoản thành viên.
    *   **Theo dõi điểm tích lũy:** Xem số dư điểm tích lũy của từng khách hàng để phục vụ việc trừ tiền trên hóa đơn khi thanh toán.
    *   **Lịch sử giao dịch điểm:** Ghi nhận nhật ký cộng điểm khi thanh toán hóa đơn và trừ điểm khi đổi quà/giảm giá tiền mặt.

---

### 2.11. Màn hình Nhà cung cấp (Supplier Management)
*   **Đường dẫn URL:** `/quan-ly/nha-cung-cap`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/nha_cung_cap/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\NhaCungCapController`
*   **Quyền truy cập:** `admin` (Chỉ Admin truy cập).
*   **Các tính năng chi tiết:**
    *   **Quản trị thông tin nhà cung cấp (CRUD Suppliers):** Thêm mới thông tin nhà cung cấp nguyên vật liệu (Tên đơn vị, Số điện thoại, Email, Địa chỉ, Mã số thuế), sửa đổi thông tin liên lạc hoặc xóa nhà cung cấp khỏi hệ thống.

---

### 2.12. Màn hình lịch sử Đơn món chi tiết (All Orders History)
*   **Đường dẫn URL:** `/dat-mon`
*   **File View (Blade):** [index.blade.php](file:///e:/btap/laragon/www/PhanMemQuanLyMonAn/resources/views/dat_mon/index.blade.php)
*   **Controller xử lý:** `App\Http\Controllers\DatMonController@index`
*   **Quyền truy cập:** `admin`, `nhan_vien` (Nhân viên phục vụ và Admin truy cập).
*   **Các tính năng chi tiết:**
    *   **Truy vấn lịch sử đặt món:** Xem danh sách toàn bộ các đĩa món ăn đã từng được gọi trong nhà hàng kèm thông tin số bàn, trạng thái, thời gian đặt.
    *   **Hủy món ăn và hoàn trả kho (Order Cancellation & Inventory Refund):** Nút *"Hủy món"* dành cho các món ăn khách yêu cầu hủy. Hệ thống sử dụng Database Transactions để tìm kiếm bản ghi lịch sử tiêu hao trong bảng `chi_tiet_tieu_hao_dat_mon`, tự động cộng trả lại chính xác số lượng nguyên liệu vào kho tổng và vào đúng lô hàng đã nhập ban đầu.

---

## 3. BẢNG TỔNG HỢP VAI TRÒ - TÍNH NĂNG - ĐƯỜNG DẪN HỆ THỐNG

| STT | Tên chức năng lớn | Vai trò được sử dụng | Đường dẫn URL | Blade View tương ứng | Lớp Controller điều hướng |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1** | **Báo cáo Dashboard & Sự cố** | `admin` | `/quan-ly` | `ban/quan_ly.blade.php` | `ReportController` |
| **2** | **Sơ đồ bàn & Thu ngân** | `admin`, `nhan_vien` | `/ban` | `ban/ban.blade.php` | `BanController` |
| **3** | **Kho & Quản lý Lô nguyên liệu** | `admin`, `bep` | `/nguyen-lieu` | `nguyen_lieu/index.blade.php` | `NguyenLieuController` |
| **4** | **Thực đơn Món ăn & BOM** | `admin` | `/quan-ly/mon-an` | `mon_an/index.blade.php` | `MonAnController` |
| **5** | **Quản lý Nhân sự & Quyền** | `admin` | `/quan-ly/nhan-vien-quan-ly` | `nhan_vien/index.blade.php` | `NhanVienController` |
| **6** | **CRM Khách Hàng Thân Thiết** | `admin`, `nhan_vien` | `/quan-ly/khach-hang` | `khach_hang/index.blade.php` | `KhachHangController` |
| **7** | **Quản lý Nhà Cung Cấp** | `admin` | `/quan-ly/nha-cung-cap` | `nha_cung_cap/index.blade.php` | `NhaCungCapController` |
| **8** | **Màn hình phục vụ Nhân viên**| `admin`, `nhan_vien` | `/nhan-vien` | `dat_mon/nhan_vien.blade.php` | `DatMonController` |
| **9** | **Đơn đặt món chi tiết** | `admin`, `nhan_vien` | `/dat-mon` | `dat_mon/index.blade.php` | `DatMonController` |
| **10**| **Màn hình Bếp điều phối KDS**| `admin`, `bep` | `/dat-mon/bep` | `dat_mon/bep.blade.php` | `DatMonController` |
| **11**| **Khách gọi món qua mã QR** | Khách hàng | `/qr-order/{ban_id}` | `ban/qr_order.blade.php` | `DatMonController` |
| **12**| **Tài liệu hướng dẫn sử dụng**| Tất cả tài khoản | `/tai-lieu/tai-ve` | Xuất trực tiếp file Word (.doc) | `ReportController` |

---

Tài liệu này cung cấp bản đồ định vị chính xác mọi tính năng trong source code của hệ thống, phục vụ đắc lực cho công tác phát triển, kiểm thử và vận hành thực tế.
