# CineTicket

Website đặt vé xem phim online xây dựng bằng PHP MVC đơn giản, sử dụng MySQL/MariaDB để lưu dữ liệu. Dự án gồm 2 phần:

- Trang khách hàng: xem phim, thêm vào giỏ, tạo đơn, chọn ghế, chọn combo, thanh toán, xem lại đơn hàng.
- Trang quản trị: xem dashboard, quản lý phim, thể loại, đơn hàng và tài khoản người dùng.

## 1. Tổng quan chức năng

### Phía khách hàng
- Xem danh sách phim theo thể loại.
- Xem chi tiết phim, giá vé và thông tin mô tả.
- Thêm phim vào giỏ vé, cập nhật số lượng, xóa khỏi giỏ.
- Tạo đơn hàng từ giỏ vé.
- Chọn suất chiếu và ghế ngồi theo từng phim trong đơn.
- Chọn combo bắp nước trước khi thanh toán.
- Xem lịch sử đơn hàng và chi tiết đơn.
- Đăng ký, đăng nhập, đăng xuất, cập nhật tài khoản, đổi mật khẩu.
- Quên mật khẩu qua email bằng PHPMailer, hoặc nhận reset link ở chế độ demo.

### Phía quản trị
- Dashboard thống kê doanh thu và sản phẩm bán chạy.
- CRUD phim.
- Upload poster phim.
- CRUD thể loại phim.
- Xem danh sách đơn hàng và cập nhật trạng thái.
- Xem danh sách người dùng.

## 2. Công nghệ sử dụng

- PHP 8.x
- MySQL / MariaDB
- HTML, CSS, JavaScript
- Bootstrap
- jQuery
- Owl Carousel
- Font Awesome
- Chart.js
- PHPMailer

## 3. Cấu trúc dự án

```text
NguyenNgocHaThao_501250482/
|-- README.md
|-- index.php                 # Entry point trang khách
|-- config.php                # Cấu hình DB và BASE_URL
|-- Controller/               # Xử lý request phía khách
|-- Model/                    # Kết nối DB và thao tác dữ liệu
|-- View/                     # Giao diện phía khách
|-- Admin/                    # Trang quản trị
|   |-- index.php
|   |-- Controller/
|   `-- View/
`-- assets/                   # CSS, JS, hình ảnh, uploads
```

## 4. Yêu cầu môi trường

- Laragon (Apache + MySQL/MariaDB)
- PHP 8.0 trở lên
- Bật extension `mysqli`
- Bật extension `openssl` nếu dùng tính năng gửi email reset mật khẩu
- Trình duyệt web hiện đại

Không cần Composer vì thư viện PHPMailer đã được đưa sẵn vào thư mục `Model/`.

## 5. Hướng dẫn cài đặt

1. Đặt source code vào thư mục `www` của Laragon:

   ```text
   C:\laragon\www\NguyenNgocHaThao_501250482
   ```

2. Mở Laragon và nhấn **Start All** (Apache + MySQL).

3. Import file SQL qua HeidiSQL hoặc phpMyAdmin:

   ```text
   Model/starshopticket.sql
   ```

   File SQL sẽ tự tạo database `starshopticket` cùng schema và dữ liệu mẫu.

4. Kiểm tra cấu hình trong `config.php` (mặc định phù hợp Laragon):

   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'starshopticket');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

   `BASE_URL` được tự động nhận diện theo thư mục dự án, không cần sửa tay.

5. Đảm bảo thư mục upload poster có quyền ghi:

   ```text
   assets/img/uploads/
   ```

6. Truy cập website:

   - Trang khách: `http://localhost/NguyenNgocHaThao_501250482/index.php`
   - Trang admin: `http://localhost/NguyenNgocHaThao_501250482/Admin/`

   Hoặc tạo Virtual Host trong Laragon (Menu → Apache → Virtual Hosts) để dùng dạng `http://nguyenngochathao.test`.

## 6. Tài khoản mặc định

Tài khoản admin mặc định được hệ thống tạo tự động khi đăng nhập nếu chưa tồn tại.

- Email: `admin@cineticket.com`
- Mật khẩu: ` Admin@123`

Tài khoản người dùng mẫu.
- Email: `user1@cineticket.com`
- Mật Khẩu: `123456`

## 7. Luồng sử dụng chính

1. Người dùng đăng ký hoặc đăng nhập.
2. Chọn phim và thêm vào giỏ vé.
3. Nhập thông tin đặt hàng để tạo đơn.
4. Chọn suất chiếu và ghế cho từng phim.
5. Chọn combo bắp nước.
6. Xác nhận thanh toán.
7. Xem lại chi tiết đơn trong mục `Đơn của tôi`.

## 8. Các route chính

### Trang khách
- `index.php?act=home`: Trang chủ
- `index.php?act=sanpham`: Danh sách phim
- `index.php?act=sanphamchitiet&id={id}`: Chi tiết phim
- `index.php?act=cart`: Giỏ vé
- `index.php?act=order`: Form đặt vé
- `index.php?act=seat&order_id={id}`: Chọn ghế
- `index.php?act=snack&order_id={id}`: Chọn combo
- `index.php?act=payment&order_id={id}`: Thanh toán
- `index.php?act=myorders`: Đơn của tôi
- `index.php?act=orderdetail&id={id}`: Chi tiết đơn
- `index.php?act=login`: Đăng nhập
- `index.php?act=registration`: Đăng ký
- `index.php?act=forgetpassword`: Quên mật khẩu
- `index.php?act=account`: Tài khoản
- `index.php?act=contact`: Liên hệ
- `index.php?act=news`: Tin tức

### Trang admin
- `Admin/index.php?act=dashboard`: Dashboard
- `Admin/index.php?act=movies`: Quản lý phim
- `Admin/index.php?act=genres`: Quản lý thể loại
- `Admin/index.php?act=orders`: Quản lý đơn hàng
- `Admin/index.php?act=users`: Quản lý người dùng

## 9. Cơ sở dữ liệu

File `Model/starshopticket.sql` đã bao gồm schema và dữ liệu mẫu. Các bảng chính:

- `users`: Tài khoản người dùng và admin
- `genres`: Thể loại phim
- `movies`: Danh sách phim
- `showtimes`: Suất chiếu
- `orders`: Đơn hàng
- `order_items`: Chi tiết từng phim trong đơn
- `seat_reservations`: Ghế đã chọn theo suất chiếu
- `password_resets`: Token đổi mật khẩu

## 10. Cấu hình reset mật khẩu qua email

Nếu muốn gửi email thật sự, cần cập nhật SMTP trong `Controller/forget.php`:

- `Host`
- `Port`
- `Username`
- `Password`
- `SMTPSecure`

Mặc định file đang để placeholder:

```php
$mail->Host = 'smtp.gmail.com';
$mail->Port = 587;
$mail->Username = 'your_email@gmail.com';
$mail->Password = 'your_app_password';
```

Nếu chưa cấu hình SMTP đúng, hệ thống sẽ hiện reset link trong flash message để demo tính năng.

## 11. Lưu ý khi chấm hoặc demo

- `BASE_URL` được tự động nhận diện theo thư mục trong `www` của Laragon.
- Chức năng upload poster phụ thuộc vào quyền ghi của thư mục `assets/img/uploads/`.
- Dashboard admin chỉ truy cập được khi đăng nhập tài khoản có `role = admin`.
- Dự án không dùng migration, vì vậy cần import file SQL trước khi chạy.
- Dữ liệu kết nối MySQL đã được đặt charset `utf8mb4` để tránh lỗi hiển thị tiếng Việt.

## 12. Gợi ý kiểm thử nhanh

1. Đăng nhập bằng tài khoản admin mặc định.
2. Tạo một tài khoản người dùng mới.
3. Thêm phim vào giỏ và tạo đơn.
4. Chọn đủ ghế theo số lượng vé.
5. Chọn combo và thanh toán.
6. Vào `Đơn của tôi` để kiểm tra kết quả.
7. Vào trang admin để kiểm tra đơn vừa tạo.

## 13. Tác giả

- Họ và tên: Nguyễn Ngọc Hà Thảo
- Mã sinh viên: 501250482

## 14. Ghi chú

README này được viết lại theo đúng cấu trúc và chức năng hiện có trong source code.
