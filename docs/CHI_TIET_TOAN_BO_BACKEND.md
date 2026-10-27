# TÀI LIỆU CHI TIẾT TOÀN BỘ BACK-END (BE) HỆ THỐNG ROYAL BISTRO

> **Hệ thống Quản lý Nhà Hàng Ẩm Thực Cao Cấp Royal Bistro POS & QR Order**
> **Kiến trúc:** Node.js (ES Modules) • Express.js • MongoDB Atlas (Mongoose ODM) • Socket.IO (Real-time WebSockets) • JSON Web Token (JWT Authentication) • Role-Based Access Control (RBAC)
> **Cập nhật:** 2026-10-27

---

## MỤC LỤC

1. [Tổng Quan Kiến Trúc & Ngăn Xếp Công Nghệ (Tech Stack)](#1-tổng-quan-kiến-trúc--ngăn-xếp-công-nghệ)
2. [Cấu Trúc Thư Mục Toàn Bộ Back-End](#2-cấu-trúc-thư-mục-toàn-bộ-back-end)
3. [Thiết Lập Server & Kết Nối (server.js & config)](#3-thiết-lập-server--kết-nối)
4. [Chi Tiết Toàn Bộ 13 Mô Hình Dữ Liệu (Mongoose Models)](#4-chi-tiết-toàn-bộ-13-mô-hình-dữ-liệu-mongoose-models)
5. [Cơ Chế Phân Quyền & Bảo Mật (JWT & RBAC Middlewares)](#5-cơ-chế-phân-quyền--bảo-mật)
6. [Chi Tiết Toàn Bộ Controllers & Luồng Nghiệp Vụ Kinh Doanh](#6-chi-tiết-toàn-bộ-controllers--luồng-nghiệp-vụ-kinh-doanh)
   - 6.1. [Xác Thực & Phân Quyền (xacThucController)](#61-xác-thực--phân-quyền-xacthuccontroller)
   - 6.2. [Quản Lý Sơ Đồ Bàn Ăn (banAnController)](#62-quản-lý-sơ-đồ-bàn-ăn-banancontroller)
   - 6.3. [Thực Đơn & Món Ăn (monAnController)](#63-thực-đơn--món-ăn-monancontroller)
   - 6.4. [Đặt Món, Thanh Toán & Trừ Kho Tự Động BOM (datMonController)](#64-đặt-món-thanh-toán--trừ-kho-tự-động-bom-datmoncontroller)
   - 6.5. [Kho Nguyên Liệu, Hạn Sử Dụng & Nhà Cung Cấp (khoNguyenLieuController)](#65-kho-nguyên-liệu-hạn-sử-dụng--nhà-cung-cấp-khonguyenlieucontroller)
   - 6.6. [Quản Lý Đặt Bàn Trước (datBanController)](#66-quản-lý-đặt-bàn-trước-datbancontroller)
   - 6.7. [Khách Hàng Thân Thiết CRM (khachHangController)](#67-khách-hàng-thân-thiết-crm-khachhangcontroller)
   - 6.8. [Báo Cáo Doanh Thu & Lợi Nhuận (baoCaoController)](#68-báo-cáo-doanh-thu--lợi-nhuận-baocaocontroller)
   - 6.9. [Quản Lý Nhân Viên & Tài Khoản (nguoiDungController)](#69-quản-lý-nhân-viên--tài-khoản-nguoidungcontroller)
7. [Truyền Thông Thời Gian Thực (Socket.IO Real-time Architecture)](#7-truyền-thông-thời-gian-thực-socketio-real-time-architecture)
8. [Danh Mục Toàn Bộ RESTful API Endpoints](#8-danh-mục-toàn-bộ-restful-api-endpoints)
9. [Cơ Chế Tự Tăng Mã (Auto-Increment) & Seeding Dữ Liệu Mẫu](#9-cơ-chế-tự-tăng-mã--seeding-dữ-liệu-mẫu)
10. [Hướng Dẫn Cài Đặt, Cấu Hình Môi Trường & Vận Hành](#10-hướng-dẫn-cài-đặt-cấu-hình-môi-trường--vận-hành)

---

## 1. TỔNG QUAN KIẾN TRÚC & NGĂN XẾP CÔNG NGHỆ

Hệ thống Back-End của Royal Bistro được xây dựng theo mô hình **MVC (Model-View-Controller)** kết hợp với **Event-Driven Architecture (Socket.IO)** để hỗ trợ tương tác hai chiều thời gian thực giữa Khách hàng (quét QR tại bàn), Phục vụ (cầm máy tính bảng POS), Bếp trưởng (màn hình KDS) và Thu ngân (quầy tính tiền).

### Các công nghệ cốt lõi:

- **Runtime:** `Node.js` v18+ với định dạng chuẩn hiện đại `ECMAScript Modules (ESM)` (`"type": "module"`).
- **Web Framework:** `Express.js` v4.19+ tối ưu hóa routing tốc độ cao và kiến trúc middleware dạng pipeline.
- **Cơ sở dữ liệu:** `MongoDB` kết hợp thư viện ODM `Mongoose` v8+, hỗ trợ schema strict validation, populate references và aggregation pipeline.
- **Real-time WebSockets:** `Socket.IO` v4.7+ phục vụ broadcast tức thì các sự kiện bàn, đơn món, trừ kho và chuông báo bếp.
- **Bảo mật:** `jsonwebtoken (JWT)` cấp token xác thực stateless, `bcryptjs` băm mật khẩu muối (salt), `cors` kiểm soát nguồn gọi API.
- **Biến môi trường:** `dotenv` quản lý cấu hình linh hoạt giữa Local Development và Production.

---

## 2. CẤU TRÚC THƯ MỤC TOÀN BỘ BACK-END

```
BE/
├── .env                       # Biến môi trường (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
├── package.json               # Khai báo dependency, scripts (dev:be, start)
├── server.js                  # Điểm khởi chạy hệ thống, tạo Socket.IO server, mount routes
└── src/
    ├── config/
    │   ├── cauHinhJWT.js      # Cấu hình thời hạn token, hàm ký và xác minh JWT
    │   └── coSoDuLieu.js      # Khởi tạo kết nối Mongoose tới MongoDB
    ├── constants/
    │   └── index.js           # Các hằng số: vai trò, trạng thái bàn, trạng thái món
    ├── controllers/
    │   ├── banAnController.js        # Nghiệp vụ quản lý bàn, sơ đồ, mở bàn, giải phóng bàn
    │   ├── baoCaoController.js       # Thống kê doanh thu, tính biên lợi nhuận, món bán chạy
    │   ├── datBanController.js       # Tiếp nhận đặt bàn trước, cọc tiền, check-in
    │   ├── datMonController.js       # Order món, cập nhật nấu, trừ kho BOM, thanh toán
    │   ├── khachHangController.js    # CRM khách hàng, tích điểm, phân hạng VIP
    │   ├── khoNguyenLieuController.js# Kho nguyên liệu, hạn dùng, nhà cung cấp
    │   ├── monAnController.js        # Quản lý thực đơn, danh mục, cập nhật giá
    │   ├── nguoiDungController.js    # Quản lý nhân viên, cấp tài khoản, đổi mật khẩu
    │   └── xacThucController.js      # Đăng nhập hệ thống, cấp phát token JWT
    ├── middlewares/
    │   ├── ghiNhatKyYeuCau.js # Log chi tiết thời gian, IP và endpoint từng request
    │   ├── kiemTraXacThuc.js  # Middleware decode JWT và middleware RBAC phân quyền
    │   └── xuLyLoiHeThong.js  # Global error handler bắt lỗi 404, 500 và validation
    ├── models/
    │   ├── BanAn.js           # Collection bàn ăn (16 bàn 3 tầng)
    │   ├── BaoCao.js          # Collection báo cáo doanh thu tổng hợp
    │   ├── BoDem.js           # Collection atomic counter tự tăng ID
    │   ├── DanhGia.js         # Collection đánh giá phản hồi thực khách
    │   ├── DatBanTruoc.js     # Collection lịch hẹn đặt bàn
    │   ├── DatMon.js          # Collection đơn đặt món & hóa đơn
    │   ├── KhachHang.js       # Collection khách hàng CRM
    │   ├── LoaiMon.js         # Collection danh mục món
    │   ├── MonAn.js           # Collection món ăn trong thực đơn
    │   ├── MonAnNguyenLieu.js # Collection định mức công thức nấu (BOM)
    │   ├── NguoiDung.js       # Collection tài khoản nhân viên
    │   ├── NguyenLieu.js      # Collection tồn kho & hạn dùng nguyên vật liệu
    │   ├── NhaCungCap.js      # Collection đối tác nhà cung cấp
    │   ├── moHinhDuLieu.js    # Tổng hợp xuất khẩu tất cả các model
    │   └── index.js           # Re-export module models
    ├── routes/
    │   ├── dinhTuyenBanAn.js         # /api/tables
    │   ├── dinhTuyenBaoCao.js        # /api/reports
    │   ├── dinhTuyenDatBan.js        # /api/reservations
    │   ├── dinhTuyenDatMon.js        # /api/orders
    │   ├── dinhTuyenKhachHang.js     # /api/customers
    │   ├── dinhTuyenKhoNguyenLieu.js # /api/inventory
    │   ├── dinhTuyenMonAn.js         # /api/dishes & /api/categories
    │   ├── dinhTuyenNguoiDung.js     # /api/users
    │   ├── dinhTuyenTongHop.js       # File tổng hợp toàn bộ router
    │   ├── dinhTuyenXacThuc.js       # /api/auth
    │   └── index.js                  # Re-export routes
    └── utils/
        ├── chuanHoaPhanHoi.js  # Hàm format response JSON chuẩn { success, data, message }
        ├── dinhNghiaLoi.js     # Các custom Error class kế thừa Error
        ├── ghiNhatKyLog.js     # Logger có màu sắc và timestamp
        ├── khoiTaoDuLieuMau.js # Seeding 16 bàn, 10 nguyên liệu, 3 NCC, món ăn mẫu
        ├── taoMaTuTang.js      # Utility atomic sequence MongoDB với BoDem
        ├── truyenThongSocket.js# Khởi tạo và hàm helper phát tín hiệu Socket.IO
        └── xuLyBatDongBo.js    # Async handler wrapper chống crash unhandled promise
```

---

## 3. THIẾT LẬP SERVER & KẾT NỐI

### 3.1. `BE/server.js`

- Khởi tạo Express App và bọc qua Node `http.createServer(app)`.
- Thiết lập `Socket.IO` với cấu hình CORS cho phép kết nối từ Front-End.
- Đính kèm đối tượng `io` vào `req.io` thông qua middleware toàn cục, giúp mọi Controller đều có thể kích hoạt event Socket.IO.
- Kích hoạt các middleware:
  - `cors({ origin: '*', credentials: true })`
  - `express.json({ limit: '10mb' })`
  - `express.urlencoded({ extended: true })`
  - `ghiNhatKyYeuCau`: Ghi log URL, phương thức và thời gian thực thi (ms).
- Mount toàn bộ định tuyến API dưới tiền tố `/api`.
- Đăng ký middleware xử lý 404 và Global Error Handler (bắt lỗi 500, lỗi Mongoose CastError, ValidationError).
- Tự động gọi `ketNoiCoSoDuLieu()` và kiểm tra nạp dữ liệu mẫu qua `khoiTaoDuLieuMau()`.

### 3.2. `BE/src/config/coSoDuLieu.js`

- Quản lý kết nối MongoDB sử dụng connection string từ file `.env` (`MONGO_URI`).
- Cấu hình `autoIndex: true` để tự động lập chỉ mục cho các trường tìm kiếm (`id`, `so_ban`, `so_dien_thoai`).

### 3.3. `BE/src/config/cauHinhJWT.js`

- Cấu hình khóa bí mật `JWT_SECRET` và thời hạn `JWT_EXPIRES_IN = '7d'`.
- Cung cấp 2 hàm tiện ích:
  - `taoMaXacThucJWT(payload)`: Tạo Access Token mang thông tin người dùng (`id`, `email`, `role`, `ho_ten`).
  - `giaiMaXacThucJWT(token)`: Xác minh chữ ký và trích xuất payload.

---

## 4. CHI TIẾT TOÀN BỘ 13 MÔ HÌNH DỮ LIỆU (MONGOOSE MODELS)

### 4.1. `BanAn.js` (Bàn Ăn)

- **Mục đích:** Quản lý không gian 16 bàn ăn phân bổ qua 3 tầng (Sảnh chính tầng 1, Ban công tầng 2, Phòng VIP Hoàng Gia tầng 3).
- **Các trường chính:**
  - `id`: Số nguyên tự tăng, khóa chính tìm kiếm nhanh.
  - `so_ban`: Chuỗi định danh số bàn hiển thị (`"1"`, `"2"`, `"VIP 1"`).
  - `khu_vuc`: Vị trí (`"Tầng 1 - Sảnh Chính"`, `"Tầng 2 - Ban Công"`, `"Tầng 3 - Phòng VIP"`).
  - `suc_chua`: Số ghế tối đa (2, 4, 6, 8, 12 khách).
  - `trang_thai`: Trạng thái hoạt động (`'trong'`, `'co_khach'`, `'da_dat'`, `'dang_don'`).
  - `so_luong_khach`: Số khách thực tế đang ngồi ăn.
  - `tong_tien_tam_tinh`: Tổng giá trị các món ăn đang phục vụ chưa thanh toán.
  - `so_luong_mon`: Số lượng đĩa món hiện tại đang gọi của bàn.
  - `ghi_chu`: Ghi chú yêu cầu của khách tại bàn.

### 4.2. `LoaiMon.js` (Danh Mục Món Ăn)

- **Mục đích:** Phân loại món ăn trong thực đơn để khách và nhân viên dễ lọc tìm.
- **Các trường chính:**
  - `id`: ID danh mục.
  - `ten_loai`: Tên danh mục (`"Khai Vị"`, `"Món Chính"`, `"Tráng Miệng"`, `"Đồ Uống"`, `"Rượu Vang"`).
  - `mo_ta`: Giới thiệu phong cách ẩm thực của nhóm món.
  - `thu_tu_hien_thi`: Số thứ tự sắp xếp trên giao diện.

### 4.3. `MonAn.js` (Món Ăn Thực Đơn)

- **Mục đích:** Chứa thông tin chi tiết từng món ăn trong menu nhà hàng.
- **Các trường chính:**
  - `id`: Mã số món ăn.
  - `ten_mon`: Tên món (`"Bò Wagyu A5 Nướng Đá"`, `"Tôm Hùm Alaska Sốt Bơ Tỏi"`).
  - `loai_mon_id`: Khóa ngoại liên kết tới `LoaiMon`.
  - `gia`: Giá bán niêm yết (VNĐ).
  - `gia_khuyen_mai`: Giá sau khi giảm (nếu có khuyến mại). Nếu không giảm thì bằng `gia` hoặc để `null`.
  - `phan_tram_giam`: % giảm giá (ví dụ: `15` tương ứng giảm 15%).
  - `hinh_anh`: Đường dẫn ảnh món ăn (`/images/...` hoặc URL).
  - `mo_ta`: Thành phần nguyên liệu cao cấp và hương vị.
  - `trang_thai`: Trạng thái mở bán (`'con_hang'`, `'het_hang'`, `'tam_ngung'`).

### 4.4. `DatMon.js` (Đơn Đặt Món / Hóa Đơn)

- **Mục đích:** Lưu trữ toàn bộ các đợt gọi món của bàn ăn, chi tiết từng món, trạng thái nhà bếp và kết quả thanh toán.
- **Các trường chính:**
  - `id`: Mã số đơn gọi món.
  - `ma_don`: Mã đơn dạng chuỗi ký tự hiển thị (`"ORD_1001"`).
  - `ban_id`: Khóa ngoại liên kết `BanAn`.
  - `danh_sach_mon`: Mảng các đối tượng món chi tiết:
    - `mon_an_id`: ID món ăn.
    - `ten_mon`: Tên món chụp lại tại thời điểm gọi.
    - `so_luong`: Số lượng suất đặt.
    - `don_gia`: Đơn giá thực tế tại thời điểm gọi.
    - `thanh_tien`: `so_luong * don_gia`.
    - `ghi_chu`: Yêu cầu cho đầu bếp (ví dụ: *"Ít cay, không hành tây"*).
    - `trang_thai_mon`: Trạng thái KDS (`'cho_nau'`, `'dang_nau'`, `'da_xong'`, `'da_phuc_vu'`, `'da_huy'`).
  - `tong_tien`: Tổng tiền trước chiết khấu.
  - `giam_gia`: Số tiền được miễn giảm (qua voucher hoặc hạng thẻ VIP).
  - `tien_thanh_toan`: Tổng tiền cuối cùng khách phải trả.
  - `phuong_thuc_thanh_toan`: `'tien_mat'`, `'chuyen_khoan'`, `'the'`.
  - `trang_thai_don`: `'chua_thanh_toan'`, `'da_thanh_toan'`, `'da_huy'`.
  - `thoi_gian_tao`: Thời điểm khách bắt đầu gọi món.
  - `thoi_gian_thanh_toan`: Thời điểm thu ngân bấm xác nhận nhận tiền.

### 4.5. `NguyenLieu.js` (Kho Nguyên Liệu)

- **Mục đích:** Quản lý số lượng tồn kho nguyên vật liệu tươi sống, gia vị, hải sản, thịt bò nhập khẩu và kiểm soát hạn sử dụng.
- **Các trường chính:**
  - `id`: Mã nguyên liệu.
  - `ten_nguyen_lieu`: Tên vật tư (`"Thịt Bò Wagyu A5"`, `"Tôm Hùm Alaska"`, `"Bơ Lạt Anchor"`).
  - `don_vi_tinh`: `'kg'`, `'g'`, `'lít'`, `'ml'`, `'hộp'`, `'gói'`, `'chai'`.
  - `so_luong_ton`: Khối lượng thực tế hiện có trong kho lạnh.
  - `dinh_muc_toi_thieu`: Ngưỡng an toàn tối thiểu (nếu tồn kho $\le$ ngưỡng này sẽ báo động đỏ).
  - `gia_nhap_trung_binh`: Đơn giá vốn bình quân gia quyền.
  - `han_su_dung`: **Ngày tháng hết hạn sử dụng (`Date`)** để nhân viên bếp kiểm soát chất lượng và tiêu hủy trước hạn.

### 4.6. `MonAnNguyenLieu.js` (Định Mức BOM - Bill of Materials)

- **Mục đích:** Thiết lập công thức chế biến chuẩn xác giữa Món Ăn và các Nguyên Liệu tiêu hao.
- **Các trường chính:**
  - `id`: Mã bản ghi công thức.
  - `mon_an_id`: ID món ăn liên kết.
  - `nguyen_lieu_id`: ID nguyên liệu liên kết trong kho.
  - `so_luong_tieu_hao`: Định mức nguyên liệu cho 1 đơn vị món ăn (ví dụ: 1 phần *Bò Wagyu Nướng Đá* cần `0.25` kg *Thịt Bò Wagyu A5* và `0.02` kg *Bơ Lạt*).

### 4.7. `NhaCungCap.js` (Nhà Cung Cấp Thực Phẩm)

- **Mục đích:** Quản lý danh bạ đối tác cung ứng nông sản, hải sản, gia vị sạch.
- **Các trường chính:**
  - `id`: Mã ID đối tác.
  - `ma_ncc`: Mã viết tắt định danh (`"NCC_VINAFOOD"`, `"NCC_HAI_SAN"`).
  - `ten_ncc`: Tên công ty hoặc nông trại cung ứng.
  - `so_dien_thoai`: Hotline đặt hàng.
  - `email`: Hộp thư liên hệ.
  - `dia_chi`: Trụ sở kho vận chuyển.
  - `danh_gia_sao`: Điểm uy tín chất lượng (từ 1.0 đến 5.0 sao).

### 4.8. `DatBanTruoc.js` (Lịch Đặt Bàn Trước)

- **Mục đích:** Quản lý khách hàng đặt bàn tiệc trước ngày/giờ dùng bữa.
- **Các trường chính:**
  - `id`: Mã lịch đặt.
  - `ma_reservation`: Chuỗi mã tra cứu (`"RES_20261027_01"`).
  - `ten_khach`: Họ tên người đại diện đặt bàn.
  - `so_dien_thoai`: SĐT liên lạc xác nhận.
  - `so_luong_khach`: Số người tham dự tiệc.
  - `thoi_gian_hen`: Thời điểm khách đến nhận bàn (`Date`).
  - `ban_id`: Bàn được xếp trước (tùy chọn).
  - `tien_dat_coc`: Số tiền cọc đặt trước bảo đảm giữ chỗ.
  - `ghi_chu`: Yêu cầu trang trí hoa, tiệc sinh nhật, view ngắm cảnh.
  - `trang_thai`: `'da_xac_nhan'`, `'da_checkin'`, `'da_huy'`.

### 4.9. `KhachHang.js` (CRM Khách Hàng Thân Thiết)

- **Mục đích:** Lưu trữ hành vi chi tiêu, tích lũy điểm thưởng và nâng hạng VIP.
- **Các trường chính:**
  - `id`: Mã khách hàng.
  - `ho_ten`: Tên khách hàng.
  - `so_dien_thoai`: Số điện thoại duy nhất (Unique Index).
  - `email`: Địa chỉ email nhận hóa đơn điện tử và ưu đãi.
  - `diem_tich_luy`: Điểm thưởng khả dụng.
  - `tong_chi_tieu`: Tổng số tiền tích lũy đã thanh toán tại nhà hàng.
  - `hang_thanh_vien`: Phân hạng thẻ (`'Dong'`, `'Bac'`, `'Vang'`, `'KimCuong'`).

### 4.10. `NguoiDung.js` (Tài Khoản Nhân Viên & Phân Quyền)

- **Mục đích:** Xác thực đăng nhập nhân viên theo cơ chế bảo mật RBAC.
- **Các trường chính:**
  - `id`: Mã nhân viên.
  - `ho_ten`: Tên hiển thị của nhân sự.
  - `email`: Tên đăng nhập hệ thống (Unique Index).
  - `mat_khau`: Mật khẩu đã băm một chiều an toàn bằng `bcrypt`.
  - `role`: Vai trò nghiệp vụ:
    - `'admin'`: Quản trị viên tối cao, truy cập toàn bộ chức năng.
    - `'thu_ngan'`: Chuyên trách POS thanh toán hóa đơn và in bill.
    - `'bep_truong'`: Màn hình KDS, nấu món và nhận báo động kho.
    - `'phuc_vu'`: Sắp xếp bàn, tiếp đón khách, hướng dẫn quét QR.
  - `trang_thai`: `'hoat_dong'`, `'khoa'`.

### 4.11. `BaoCao.js` (Báo Cáo Doanh Thu Tổng Hợp)

- **Mục đích:** Lưu trữ các snapshot báo cáo định kỳ theo ngày/tuần/tháng.
- **Các trường:** Ngày báo cáo, tổng doanh thu, tổng chi phí vốn nguyên liệu, lợi nhuận gộp, tổng số đơn đặt món, số lượng khách tiếp đón, danh sách các món ăn bán chạy nhất.

### 4.12. `DanhGia.js` (Đánh Giá Phản Hồi)

- **Mục đích:** Khách quét QR đánh giá chất lượng món ăn và phục vụ sau khi dùng bữa.
- **Các trường:** `ban_id`, `so_sao` (1 - 5 sao), `noi_dung_gop_y`, `ngay_tao`.

### 4.13. `BoDem.js` (Atomic Sequence Counter)

- **Mục đích:** Cung cấp giải pháp sinh mã tự tăng số nguyên an toàn trong môi trường bất đồng bộ cao (tránh trùng lặp ID khi nhiều khách cùng đặt món cùng 1 lúc).
- **Các trường:**
  - `_id`: Tên định danh chuỗi counter (`'table_id'`, `'order_id'`, `'dish_id'`, `'ingredient_id'`, `'supplier_id'`, `'reservation_id'`).
  - `gia_tri_hien_tai`: Số nguyên tăng dần hiện tại.

---

## 5. CƠ CHẾ PHÂN QUYỀN & BẢO MẬT

Hệ thống bảo vệ dữ liệu bằng cơ chế phòng thủ 2 lớp (Authentication & Authorization):

### 5.1. Middleware Xác Thực Token (`kiemTraXacThuc.js` -> `xacThucNguoiDung`)

- Trích xuất JWT token từ Header HTTP: `Authorization: Bearer <token>`.
- Giải mã chữ ký qua `giaiMaXacThucJWT`.
- Tìm kiếm tài khoản trong DB để đảm bảo tài khoản chưa bị vô hiệu hóa hoặc đổi mật khẩu.
- Gắn `req.nguoiDung = user` vào luồng xử lý của Express.

### 5.2. Middleware Phân Quyền Theo Vai Trò (`kiemTraXacThuc.js` -> `phanQuyen`)

- Khởi tạo linh hoạt: `phanQuyen('admin', 'thu_ngan')`.
- So khớp trường `req.nguoiDung.role` với danh sách quyền hạn cho phép.
- Nếu không đủ thẩm quyền, trả về ngay HTTP Status `403 Forbidden` với thông điệp: *"Bạn không có quyền thực hiện hành động này."*

---

## 6. CHI TIẾT TOÀN BỘ CONTROLLERS & LUỒNG NGHIỆP VỤ KINH DOANH

### 6.1. Xác Thực & Phân Quyền (`xacThucController.js`)

- `dangNhapHeThong`: Nhận `email` và `mat_khau`. So sánh hash bằng `bcrypt.compare`. Trả về token JWT kèm thông tin user và role.
- `layThongTinHienTai`: Endpoint `/me` giúp giao diện Front-End tự động khôi phục phiên đăng nhập khi người dùng bấm F5 hoặc mở lại trình duyệt.

### 6.2. Quản Lý Sơ Đồ Bàn Ăn (`banAnController.js`)

- `layDanhSachBanAn`: Trích xuất 16 bàn kèm trạng thái và tính toán tổng tiền tạm tính hiện hành.
- `capNhatTrangThaiBan`: Cho phép đổi trạng thái (`'trong'`, `'co_khach'`, `'da_dat'`, `'dang_don'`). Phát sự kiện WebSocket `trang_thai_ban_thay_doi` để toàn bộ máy tính bảng nhân viên cập nhật tức thời.
- `moBanDonKhach`: Tiếp nhận số khách thực tế (nhập số nguyên trực tiếp), chuyển bàn sang `'co_khach'`, tạo phiên làm việc và chuẩn bị liên kết mã QR.
- `giaiPhongBan`: Tự động gọi khi hóa đơn được thanh toán xong -> chuyển trạng thái về `'trong'`, xóa `tong_tien_tam_tinh` về `0`.

### 6.3. Thực Đơn & Món Ăn (`monAnController.js`)

- `layDanhSachMonAn`: Hỗ trợ lọc theo `loai_mon_id`, tìm kiếm theo từ khóa tên món, sắp xếp giá bán.
- `themMonAnMoi`: Tạo món ăn mới, tự động sinh mã `dish_id`, thiết lập giá gốc và giá khuyến mãi nếu có.
- `capNhatMonAn`: Chỉnh sửa thông tin, giá bán, ảnh món ăn.
- `chuyenTrangThaiHetHang`: Chuyển đổi trạng thái món ăn sang `'het_hang'` khi nhà bếp thông báo thiếu nguyên vật liệu.

### 6.4. Đặt Món, Thanh Toán & Trừ Kho Tự Động BOM (`datMonController.js`)

Đây là trung tâm xử lý cốt lõi của hệ thống:

1. **Khách quét mã QR tại bàn hoặc nhân viên phục vụ tạo đơn món (`taoDonDatMon`):**
   - Đơn món được ghi nhận vào `DatMon` với trạng thái từng món là `'cho_nau'`.
   - Cập nhật tăng `tong_tien_tam_tinh` của bàn.
   - Bắn sự kiện Socket.IO `mon_moi_goi` tới Màn hình Bếp KDS kèm chuông âm thanh cảnh báo.
2. **Quy trình Khấu Trừ Kho Nguyên Liệu Tự Động (BOM Deduction):**
   - Khi Bếp trưởng bấm **"Bắt Đầu Nấu"** (`capNhatTrangThaiMon` -> `'dang_nau'`):
   - Controller tự động tra cứu công thức chế biến của món ăn trong bảng `MonAnNguyenLieu`.
   - Tính toán lượng nguyên liệu cần khấu trừ:
     $$
     \text{Lượng trừ} = \text{Định mức tiêu hao} \times \text{Số lượng suất nấu}

     $$
   - Trừ trực tiếp trường `so_luong_ton` trong collection `NguyenLieu`.
   - Kiểm tra: Nếu `so_luong_ton <= dinh_muc_toi_thieu`, hệ thống kích hoạt cờ cảnh báo `is_low_stock` và bắn sự kiện `canh_bao_ton_kho` lên màn hình quản lý!
3. **Thanh toán hóa đơn (`thanhToanDonMon`):**
   - Tính tiền tổng, áp dụng chiết khấu voucher/thẻ thành viên.
   - Ghi nhận phương thức thanh toán (`tien_mat`, `chuyen_khoan`, `the`).
   - Cập nhật trạng thái đơn thành `'da_thanh_toan'`.
   - Tự động cộng điểm tích lũy và doanh số cho khách hàng trong collection `KhachHang`.
   - **Tự động giải phóng bàn ăn** về trạng thái `'trong'` để sẵn sàng đón lượt khách tiếp theo.

### 6.5. Kho Nguyên Liệu, Hạn Sử Dụng & Nhà Cung Cấp (`khoNguyenLieuController.js`)

- `layDanhSachNguyenLieu`: Trả về danh sách tồn kho, tự động đánh dấu nguyên liệu chạm định mức tối thiểu.
- `capNhatTonKho`: Bổ sung số lượng khi nhập hàng về kho, đồng thời hỗ trợ cập nhật/gia hạn **Hạn Sử Dụng mới (`han_su_dung`)**.
- `themNguyenLieuMoi`: Thêm nguyên liệu tươi sống mới vào danh mục theo dõi kèm định mức và ngày hết hạn.
- `layDanhSachNhaCungCap`: Danh bạ nhà cung cấp thực phẩm.
- `themNhaCungCapMoi`: Tiếp nhận đăng ký nhà cung cấp mới (`POST /api/inventory/suppliers`) với đầy đủ tên, mã NCC, điện thoại, email, địa chỉ và đánh giá sao.

### 6.6. Quản Lý Đặt Bàn Trước (`datBanController.js`)

- `layDanhSachDatBan`: Lọc danh sách lịch hẹn đặt chỗ theo ngày giờ và trạng thái.
- `taoDatBanMoi`: Lưu thông tin khách, số khách, giờ hẹn và tiền đặt cọc.
- `checkinDatBan`: Khi khách đến nhà hàng, phục vụ bấm check-in -> Tự động kích hoạt bàn ăn thành `'co_khach'`, gắn số khách và mở ngay cửa sổ **In Mã QR Bàn** để phục vụ dán lên bàn hoặc đặt trước mặt khách.

### 6.7. Khách Hàng Thân Thiết CRM (`khachHangController.js`)

- `traCuuKhachHang`: Tìm kiếm nhanh qua số điện thoại khi khách ngồi vào bàn.
- `capNhatTichDiem`: Tự động thăng hạng khách hàng:
  - Dưới 5.000.000đ: Hạng Đồng (Tích lũy 1%).
  - Từ 5.000.000đ - 15.000.000đ: Hạng Bạc (Tích lũy 3%, giảm 5%).
  - Từ 15.000.000đ - 30.000.000đ: Hạng Vàng (Tích lũy 5%, giảm 10%).
  - Trên 30.000.000đ: Hạng Kim Cương (Tích lũy 10%, giảm 15%).

### 6.8. Báo Cáo Doanh Thu & Lợi Nhuận (`baoCaoController.js`)

- `layBaoCaoTongQuan`: Thống kê doanh số theo ngày, tuần, tháng.
- `tinhLoiNhuanGop`: Tính toán tỷ suất lợi nhuận dựa trên Doanh thu bán hàng trừ đi Chi phí vốn nguyên liệu (COGS) đã khấu trừ theo BOM.
- `topMonBanChay`: Thống kê 5 món ăn được yêu thích nhất phục vụ chiến lược nhập kho nguyên liệu của bếp trưởng.

### 6.9. Quản Lý Nhân Viên & Tài Khoản (`nguoiDungController.js`)

- Quản lý danh sách nhân sự nhà hàng, phân chia ca làm việc và đặt lại mật khẩu khi nhân viên quên mã PIN.

---

## 7. TRUYỀN THÔNG THỜI GIAN THỰC (SOCKET.IO REAL-TIME ARCHITECTURE)

Hệ thống WebSocket được tích hợp trực tiếp trên cùng một cổng máy chủ HTTP:


| Tên Event (Sự Kiện)    | Chiều Phát                               | Mục Đích & Tác Động Giao Diện                                                                                                                 |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mon_moi_goi`             | Server $\rightarrow$ Bếp KDS & Thu Ngân  | Phát chuông và hiển thị thẻ món mới cần nấu lên màn hình Bếp trưởng ngay khi khách vừa bấm gọi món trên điện thoại.         |
| `trang_thai_mon_thay_doi` | Server $\rightarrow$ Khách QR & Phục Vụ | Thông báo cho thực khách và nhân viên biết món ăn đã nấu xong, đang được nhân viên bưng ra bàn.                                 |
| `trang_thai_ban_thay_doi` | Server $\rightarrow$ Sơ Đồ Bàn POS     | Tự động chuyển màu thẻ bàn (Trống $\rightarrow$ Có Khách $\rightarrow$ Đang Dọn) trên tất cả các màn hình thu ngân và phục vụ. |
| `canh_bao_ton_kho`        | Server $\rightarrow$ Quản Lý Kho & Bếp  | Bật badge đỏ cảnh báo khi có nguyên liệu bị trừ kho chạm ngưỡng an toàn.                                                               |

---

## 8. DANH MỤC TOÀN BỘ RESTFUL API ENDPOINTS

### 8.1. Phân Hệ Xác Thực (`/api/auth`)


| Method | Endpoint          | Yêu Cầu Quyền | Mô Tả                                     |
| -------- | ------------------- | ------------------ | --------------------------------------------- |
| `POST` | `/api/auth/login` | Public           | Đăng nhập tài khoản, nhận Token JWT   |
| `GET`  | `/api/auth/me`    | Bearer Token     | Lấy hồ sơ tài khoản đang đăng nhập |

### 8.2. Phân Hệ Sơ Đồ Bàn Ăn (`/api/tables`)


| Method  | Endpoint                  | Yêu Cầu Quyền      | Mô Tả                                          |
| --------- | --------------------------- | ----------------------- | -------------------------------------------------- |
| `GET`   | `/api/tables`             | Public / Phục vụ    | Lấy sơ đồ 16 bàn ăn kèm trạng thái      |
| `PATCH` | `/api/tables/:id/status`  | Phục vụ / Thu ngân | Cập nhật trạng thái bàn, số lượng khách |
| `POST`  | `/api/tables/:id/open`    | Phục vụ             | Mở bàn đón khách vãng lai                  |
| `POST`  | `/api/tables/:id/release` | Thu ngân / Admin     | Giải phóng bàn về trạng thái trống        |

### 8.3. Phân Hệ Thực Đơn Món Ăn (`/api/dishes` & `/api/categories`)


| Method   | Endpoint          | Yêu Cầu Quyền | Mô Tả                                             |
| ---------- | ------------------- | ------------------ | ----------------------------------------------------- |
| `GET`    | `/api/dishes`     | Public           | Xem thực đơn món ăn nhà hàng                 |
| `POST`   | `/api/dishes`     | Admin            | Thêm món ăn mới vào menu                       |
| `PUT`    | `/api/dishes/:id` | Admin            | Cập nhật thông tin món, giá bán, khuyến mãi |
| `DELETE` | `/api/dishes/:id` | Admin            | Xóa hoặc ẩn món khỏi thực đơn               |
| `GET`    | `/api/categories` | Public           | Lấy danh mục nhóm món ăn                       |

### 8.4. Phân Hệ Đặt Món & Bếp KDS (`/api/orders`)


| Method  | Endpoint                                    | Yêu Cầu Quyền  | Mô Tả                                                                            |
| --------- | --------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `GET`   | `/api/orders`                               | Thu ngân / Bếp  | Lấy toàn bộ danh sách đơn đặt món                                         |
| `POST`  | `/api/orders`                               | Public (QR) / POS | Tạo đơn gọi món mới từ bàn                                                 |
| `PATCH` | `/api/orders/:orderId/items/:itemId/status` | Bếp trưởng     | Đổi trạng thái món (`dang_nau`, `da_xong`) & **Tự động trừ kho theo BOM** |
| `POST`  | `/api/orders/:id/pay`                       | Thu ngân         | Thanh toán hóa đơn, giải phóng bàn                                          |

### 8.5. Phân Hệ Kho Nguyên Liệu & Nhà Cung Cấp (`/api/inventory`)


| Method  | Endpoint                               | Yêu Cầu Quyền | Mô Tả                                                  |
| --------- | ---------------------------------------- | ------------------ | ---------------------------------------------------------- |
| `GET`   | `/api/inventory/ingredients`           | Bếp / Quản lý | Xem danh sách nguyên liệu, tồn kho, hạn dùng       |
| `POST`  | `/api/inventory/ingredients`           | Quản lý / Bếp | Thêm nguyên liệu mới vào kho kèm hạn dùng        |
| `PATCH` | `/api/inventory/ingredients/:id/stock` | Quản lý / Bếp | Nhập thêm số lượng tồn kho & cập nhật hạn dùng |
| `GET`   | `/api/inventory/suppliers`             | Quản lý / Bếp | Xem danh sách đối tác nhà cung cấp                 |
| `POST`  | `/api/inventory/suppliers`             | Quản lý / Bếp | Thêm đối tác nhà cung cấp mới vào hệ thống     |

### 8.6. Phân Hệ Đặt Bàn Trước (`/api/reservations`)


| Method  | Endpoint                        | Yêu Cầu Quyền      | Mô Tả                                         |
| --------- | --------------------------------- | ----------------------- | ------------------------------------------------- |
| `GET`   | `/api/reservations`             | Phục vụ / Thu ngân | Lấy danh sách lịch hẹn đặt bàn           |
| `POST`  | `/api/reservations`             | Public / Phục vụ    | Khách đặt chỗ trước ngày giờ            |
| `PATCH` | `/api/reservations/:id/checkin` | Phục vụ             | Đón khách đặt bàn vào bàn ăn thực tế |
| `PATCH` | `/api/reservations/:id/cancel`  | Phục vụ / Khách    | Hủy lịch hẹn đặt chỗ                      |

### 8.7. Phân Hệ CRM Khách Hàng (`/api/customers`)


| Method | Endpoint                | Yêu Cầu Quyền  | Mô Tả                                        |
| -------- | ------------------------- | ------------------- | ------------------------------------------------ |
| `GET`  | `/api/customers`        | Thu ngân / Admin | Xem danh sách khách hàng, điểm, hạng VIP |
| `GET`  | `/api/customers/search` | Thu ngân         | Tìm kiếm khách hàng theo SĐT              |
| `POST` | `/api/customers`        | Thu ngân         | Đăng ký thành viên mới                   |

### 8.8. Phân Hệ Báo Cáo Doanh Thu (`/api/reports`)


| Method | Endpoint                  | Yêu Cầu Quyền | Mô Tả                                         |
| -------- | --------------------------- | ------------------ | ------------------------------------------------- |
| `GET`  | `/api/reports/overview`   | Admin            | Xem tổng quan doanh thu, chi phí, lợi nhuận |
| `GET`  | `/api/reports/top-dishes` | Admin            | Thống kê top món ăn bán chạy nhất        |

---

## 9. CƠ CHẾ TỰ TĂNG MÃ & SEEDING DỮ LIỆU MẪU

### 9.1. Utility Tự Tăng Atomic ID (`taoMaTuTang.js`)

Để tránh race-condition khi có nhiều khách cùng gửi request tạo đơn hàng, hệ thống sử dụng toán tử nguyên tử `$inc` của MongoDB qua collection `BoDem`:

```javascript
export async function layMaSoTiepTheo(tenBoDem) {
  const banGhi = await BoDem.findByIdAndUpdate(
    tenBoDem,
    { $inc: { gia_tri_hien_tai: 1 } },
    { new: true, upsert: true }
  );
  return banGhi.gia_tri_hien_tai;
}
```

### 9.2. Khởi Tạo Dữ Liệu Ban Đầu (`khoiTaoDuLieuMau.js`)

Khi khởi động server lần đầu, script tự động nạp:

1. **16 Bàn ăn chuẩn:** Trải dài từ Bàn 1 đến Bàn 16 trên 3 phân khu (Sảnh chính, Ban công ngoài trời, Phòng VIP Hoàng Gia).
2. **10 Nguyên liệu tồn kho:** Bò Wagyu A5, Tôm Hùm Alaska, Cá Hồi Na Uy, Nấm Truffle, Gan Ngỗng Foie Gras... Tất cả đều có **hạn sử dụng cụ thể** và định mức tối thiểu rõ ràng.
3. **3 Nhà cung cấp:** VinaFood Organic, Cty Hải Sản Biển Đông, Công Ty Rượu Vang & Thịt Bò Nhập Khẩu.
4. **Định Mức BOM:** Công thức tiêu hao nguyên liệu chi tiết cho từng món ăn.
5. **Thực đơn ẩm thực Pháp cao cấp:** Đầy đủ hình ảnh, giá bán, giá khuyến mãi và danh mục.
6. **4 Tài khoản nhân sự:** Admin (`admin@royalbistro.vn`), Thu Ngân (`thungan@royalbistro.vn`), Bếp Trưởng (`bep@royalbistro.vn`), Phục Vụ (`phucvu@royalbistro.vn`).

---

## 10. HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH MÔI TRƯỜNG & VẬN HÀNH

### 10.1. Cấu Hình File `BE/.env`

Tạo file `.env` tại thư mục gốc `BE/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/royal_bistro?retryWrites=true&w=majority
JWT_SECRET=RoyalBistro_Secret_Key_Super_Secure_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5000
```

### 10.2. Lệnh Cài Đặt & Khởi Chạy

Tại thư mục gốc dự án:

```bash
# Cài đặt toàn bộ thư viện cần thiết cho Back-End
cd BE
npm install

# Khởi chạy Back-End ở chế độ giám sát tự động tải lại (watch mode)
npm run dev
# Hoặc khởi chạy từ thư mục gốc
npm run dev:be
```

---

*Tài liệu được biên soạn đồng bộ với mã nguồn hệ thống Royal Bistro v2.0.*
