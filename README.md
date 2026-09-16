# 🍽️ ROYAL BISTRO - HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN THÔNG MINH
> **Kiến Trúc:** Fullstack JavaScript (Node.js Express REST API + MongoDB Mongoose ODM + React.js SPA + Socket.io Realtime + Tailwind CSS)  
> **Phân Chia Chuyên Đề:** 2 Phân Hệ Độc Lập — Chuyên Đề Back-End (`BE/`) & Chuyên Đề Front-End (`FE/`)  
> **Tác Giả Đồ Án:** Nhóm 5 - Nguyễn Ngọc Hà Thảo | Khoá K24 - Trường Cao đẳng CNTT TP.HCM  

---

## 🌟 1. Giới Thiệu Tổng Quan
**Royal Bistro** là giải pháp phần mềm quản lý nhà hàng và điều phối ẩm thực chuyên nghiệp, đáp ứng trọn vẹn chuỗi giá trị vận hành thực tế của một nhà hàng cao cấp (F&B - Food & Beverage):
* **Bán hàng tại quầy / bàn (POS Order):** Tìm kiếm món nhanh, phân loại danh mục, thêm ghi chú chế biến, quản lý giỏ hàng theo bàn ăn.
* **Sơ đồ bàn ăn trực quan (Table Management):** Theo dõi tình trạng bàn thời gian thực (Trống, Đang dùng, Đã đặt), hiển thị mã QR tại bàn để khách tự quét order.
* **Màn hình Bếp KDS Real-time (Kitchen Display System):** Nhận order tức thì qua WebSocket Socket.io, phát âm thanh chuông báo, cập nhật tiến độ nấu món và tự động trừ kho nguyên liệu theo định lượng (BOM).
* **Quản lý kho & Nhà cung cấp (Inventory & Suppliers):** Cảnh báo nguyên liệu chạm ngưỡng tồn kho tối thiểu, nhập kho nhanh chóng.
* **Đặt bàn trước (Reservation):** Tiếp nhận thông tin khách hẹn, số lượng khách, tiền cọc và hỗ trợ check-in khi khách tới.
* **Khách hàng thân thiết (CRM):** Tích lũy điểm thưởng theo chi tiêu, tự động phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương).
* **Báo cáo doanh thu & Dòng tiền (Reports & Analytics):** Tổng hợp doanh số, cơ cấu thanh toán Tiền mặt / Chuyển khoản VietQR, Top món bán chạy nhất và xuất báo cáo.
* **Cổng quét mã QR gọi món cho khách:** Cho phép thực khách quét mã QR tại bàn (qua camera điện thoại) để xem thực đơn điện tử và thanh toán chuyển khoản qua mã VietQR chuẩn.

---

## 📁 2. Quy Chuẩn Đặt Tên File & Cấu Trúc Dự Án (Tiếng Việt 100%)

Toàn bộ mã nguồn dự án được **chuẩn hóa 100% sang tiếng Việt không dấu** kèm chú thích (comment & JSDoc) đầy đủ, rõ ràng và mạch lạc:

```
PhanMemQuanLyMonAn/
├── BE/                                    # 🟢 CHUYÊN ĐỀ BACK-END (Node.js + Express + MongoDB) - Port 5000
│   ├── src/
│   │   ├── config/                        # Cấu hình hệ thống
│   │   │   ├── cauHinhJWT.js              # Cấu hình khóa bí mật JWT_SECRET và thời hạn token
│   │   │   └── coSoDuLieu.js              # Kết nối cơ sở dữ liệu MongoDB (Mongoose ODM)
│   │   ├── constants/
│   │   │   └── hangSoHeThong.js           # Quản lý hằng số tập trung (Vai trò, Trạng thái bàn, Đơn hàng)
│   │   ├── controllers/                   # Tầng điều khiển & xử lý logic nghiệp vụ
│   │   │   ├── banAnController.js         # Xử lý CRUD sơ đồ bàn, đổi trạng thái bàn
│   │   │   ├── baoCaoController.js        # Thống kê doanh thu, báo cáo tổng quan
│   │   │   ├── datBanController.js        # Nghiệp vụ đặt bàn trước, check-in, hủy lịch
│   │   │   ├── datMonController.js        # Tạo đơn gọi món, trừ kho BOM, thanh toán hóa đơn
│   │   │   ├── khachHangController.js     # Quản lý khách hàng thân thiết CRM, tích điểm
│   │   │   ├── khoNguyenLieuController.js # Quản lý nguyên liệu tồn kho, nhà cung cấp
│   │   │   ├── monAnController.js         # Quản lý danh mục loại món, thực đơn món ăn
│   │   │   └── xacThucController.js       # Đăng nhập, đăng ký, cấp phát Token JWT
│   │   ├── middlewares/                   # Tầng trung gian kiểm soát luồng Request
│   │   │   ├── ghiNhatKyYeuCau.js         # Ghi log thời gian phản hồi (ms), method, URL
│   │   │   ├── kiemTraXacThuc.js          # Xác thực JWT Bearer và phân quyền vai trò (RBAC)
│   │   │   └── xuLyLoiHeThong.js          # Bắt lỗi toàn cục tập trung và trả về JSON chuẩn
│   │   ├── models/                        # Định nghĩa Mongoose Schemas & Models
│   │   │   ├── BanAn.js                   # Schema Bàn Ăn (so_ban, suc_chua, trang_thai, khu_vuc)
│   │   │   ├── BaoCao.js                  # Schema Báo Cáo Quản Lý ca làm việc
│   │   │   ├── BoDem.js                   # Schema Bộ Đếm tự tăng (Auto-increment Counter)
│   │   │   ├── DanhGia.js                 # Schema Đánh giá chất lượng món ăn
│   │   │   ├── DatBanTruoc.js             # Schema Lịch Hẹn Đặt Bàn Trước (Reservation)
│   │   │   ├── DatMon.js                  # Schema Đơn Đặt Món & Chi Tiết Hóa Đơn
│   │   │   ├── KhachHang.js               # Schema Khách Hàng Thân Thiết (CRM)
│   │   │   ├── LoaiMon.js                 # Schema Phân Loại Món Ăn
│   │   │   ├── moHinhDuLieu.js            # Xuất tập trung các model dữ liệu
│   │   │   ├── MonAn.js                   # Schema Món Ăn (ten_mon, gia, hinh_anh, mo_ta)
│   │   │   ├── MonAnNguyenLieu.js         # Schema Định Lượng Món Ăn (BOM Recipe)
│   │   │   ├── NguoiDung.js               # Schema Tài Khoản Người Dùng (Users)
│   │   │   ├── NguyenLieu.js              # Schema Kho Nguyên Liệu (Tồn kho, Định mức tối thiểu)
│   │   │   ├── NhaCungCap.js              # Schema Nhà Cung Cấp Thực Phẩm
│   │   │   └── index.js                   # Điểm xuất tập hợp toàn bộ Model
│   │   ├── routes/                        # Tầng định tuyến API Endpoints
│   │   │   ├── dinhTuyenBanAn.js          # Route: /api/tables
│   │   │   ├── dinhTuyenBaoCao.js         # Route: /api/reports
│   │   │   ├── dinhTuyenDatBan.js         # Route: /api/reservations
│   │   │   ├── dinhTuyenDatMon.js         # Route: /api/orders
│   │   │   ├── dinhTuyenKhachHang.js      # Route: /api/customers
│   │   │   ├── dinhTuyenKhoNguyenLieu.js  # Route: /api/inventory
│   │   │   ├── dinhTuyenMonAn.js          # Route: /api/dishes
│   │   │   ├── dinhTuyenTongHop.js        # Gom toàn bộ các route vào router chính
│   │   │   ├── dinhTuyenXacThuc.js        # Route: /api/auth
│   │   │   └── index.js                   # Điểm xuất tập hợp router
│   │   └── utils/                         # Các hàm tiện ích dùng chung
│   │       ├── chuanHoaPhanHoi.js         # Định dạng JSON trả về chuẩn hóa (success, data)
│   │       ├── dinhNghiaLoi.js            # Lớp lỗi tùy biến kế thừa Error (AppError, BadRequest...)
│   │       ├── ghiNhatKyLog.js            # In log console trực quan theo màu
│   │       ├── khoiTaoDuLieuMau.js        # Tự động khởi tạo dữ liệu mẫu khi CSDL trống
│   │       ├── taoMaTuTang.js             # Hàm cấp phát ID số tự tăng đồng bộ
│   │       ├── truyenThongSocket.js       # Phát sóng sự kiện WebSockets thời gian thực
│   │       └── xuLyBatDongBo.js           # Wrapper async/await loại bỏ try/catch thừa
│   ├── .env                               # Cấu hình MONGODB_URI, PORT=5000, JWT_SECRET
│   ├── package.json
│   └── server.js                          # Điểm khởi động máy chủ HTTP REST API & Socket.io
│
├── FE/                                    # 🔵 CHUYÊN ĐỀ FRONT-END (React 19 + Vite SPA) - Port 3000
│   ├── public/
│   │   └── ma_qr.jpg                      # 🖼️ Ảnh mã QR tĩnh chính thức dùng trong hệ thống
│   ├── src/
│   │   ├── assets/
│   │   │   └── ma_qr.jpg                  # Bản sao dự phòng mã QR tĩnh
│   │   ├── components/                    # Thành phần giao diện dùng chung
│   │   │   ├── common/
│   │   │   │   ├── BatLoiGiaoDien.jsx     # Error Boundary bắt lỗi render React
│   │   │   │   ├── HuyHieuTrangThai.jsx   # Badge màu sắc trạng thái & Spinner tải
│   │   │   │   └── KhungDuLieuRong.jsx    # Khung hiển thị khi không có dữ liệu
│   │   │   ├── layout/
│   │   │   │   └── BoCucGiaoDienChinh.jsx # Khung giao diện chính (Sidebar + Header + Content)
│   │   │   ├── ModalInHoaDon.jsx          # Modal Xem trước Hóa đơn & Quét mã QR thanh toán
│   │   │   ├── ThanhDieuHuongTren.jsx     # Thanh Header hiển thị trạng thái kết nối & tài khoản
│   │   │   └── ThanhMenuDieuHuong.jsx     # Sidebar điều hướng các phân hệ chức năng
│   │   ├── context/                       # Quản lý trạng thái toàn cục (React Context)
│   │   │   ├── NguoiDungContext.jsx       # Quản lý phiên đăng nhập, JWT, vai trò người dùng
│   │   │   ├── SocketRealtimeContext.jsx  # Kết nối Socket.io client, nhận sự kiện tức thì
│   │   │   └── ThongBaoToastContext.jsx   # Quản lý hiển thị thông báo góc màn hình (Toast)
│   │   ├── pages/                         # Các màn hình chức năng chính
│   │   │   ├── BaoCaoThongKeDoanhThu.jsx  # Báo cáo doanh số, cơ cấu thanh toán, top món
│   │   │   ├── DangNhapHeThong.jsx        # Đăng nhập hệ thống kèm 4 nút 1-Click Demo Login
│   │   │   ├── GoiMonTaiBanPOS.jsx        # Giao diện POS gọi món tại bàn, gửi bếp KDS
│   │   │   ├── KhachHangGoiMonQR.jsx      # Giao diện Web Khách quét mã QR tự gọi món
│   │   │   ├── ManHinhBepKDS.jsx          # Màn hình Bếp KDS nhận order, trừ kho BOM
│   │   │   ├── QuanLyDatBanTruoc.jsx      # Quản lý khách đặt bàn trước, cọc tiền, check-in
│   │   │   ├── QuanLyKhachHang.jsx        # Quản lý khách hàng thân thiết CRM, tích điểm
│   │   │   ├── QuanLyKhoNguyenLieu.jsx    # Quản lý kho, cảnh báo cạn hàng, nhà cung cấp
│   │   │   ├── QuanLySoDoBan.jsx          # Quản lý sơ đồ bàn, xem mã QR bàn ăn
│   │   │   ├── QuanLyThucDonMonAn.jsx     # Quản lý thực đơn, giá bán, thêm/xóa món ăn
│   │   │   └── TongQuanDashboard.jsx      # Bảng điều khiển tổng quan chỉ số kinh doanh
│   │   ├── services/                      # Tầng gọi API qua Axios Client
│   │   │   ├── cauHinhAxiosApi.js         # Axios Interceptor tự gắn token JWT Bearer
│   │   │   ├── dichVuBanAn.js             # API bàn ăn
│   │   │   ├── dichVuBaoCao.js            # API báo cáo
│   │   │   ├── dichVuDatBan.js            # API đặt bàn trước
│   │   │   ├── dichVuDatMon.js            # API gọi món & thanh toán
│   │   │   ├── dichVuKhachHang.js         # API khách hàng thân thiết
│   │   │   ├── dichVuKhoNguyenLieu.js     # API kho & nhà cung cấp
│   │   │   └── dichVuMonAn.js             # API món ăn & phân loại
│   │   ├── utils/
│   │   │   └── dinhDangDuLieu.js          # Định dạng tiền tệ VND, ngày giờ Việt Nam
│   │   ├── App.jsx                        # Điều phối tuyến đường & phân quyền giao diện
│   │   ├── index.css                      # Hệ thống kiểu dáng Tailwind CSS v4
│   │   └── main.jsx                       # Điểm gắn kết React DOM với các Provider
│   ├── package.json
│   └── vite.config.js
│
├── CDBackEnd.docx                         # 📄 BÁO CÁO CHUYÊN ĐỀ BACK-END (MICROSOFT WORD HOÀN CHỈNH)
├── docs/                                  # 📚 TÀI LIỆU CHÍNH THỨC NHÓM 5
│   ├── Nhom5_NguyenNgocHaThao.docx        # Báo cáo Word chuyên đề của Nhóm 5
│   └── Nhom5_NguyenNgocHaThao.md          # Bản thảo Markdown báo cáo của Nhóm 5
│
├── package.json                           # Cấu hình Monorepo gốc khởi chạy BE & FE
└── README.md                              # Tài liệu hướng dẫn toàn diện hệ thống
```

---

## 🖼️ 3. Cập Nhật Hình Ảnh Mã QR Hệ Thống
Toàn bộ mã QR hiển thị trong toàn bộ ứng dụng đã được thay thế bằng hình ảnh mã QR chính thức do người dùng cung cấp (`/ma_qr.jpg`):
1. **Modal In Hóa Đơn & Thanh Toán (`ModalInHoaDon.jsx`):** Hiển thị mã QR để khách quét chuyển khoản thanh toán hóa đơn bàn ăn.
2. **Modal Chi Tiết Mã QR Bàn (`QuanLySoDoBan.jsx`):** Hiển thị mã QR đặt trên từng bàn để thực khách dùng điện thoại quét vào gọi món.
3. **Màn Hình Khách Tự Đặt Món (`KhachHangGoiMonQR.jsx`):** Hiển thị mã QR thanh toán nhanh khi khách hoàn tất giỏ hàng trực tuyến.

---

## 🚀 4. Hướng Dẫn Khởi Chạy Ứng Dụng

### Cách 1: Khởi chạy đồng thời cả Backend và Frontend (Khuyên Dùng)
Tại thư mục gốc `PhanMemQuanLyMonAn`:
```powershell
npm run dev
```
> Lệnh sẽ tự động khởi động Backend (`http://localhost:5000`) và Frontend (`http://localhost:3000`) trên cùng một cửa sổ dòng lệnh thông qua thư viện `concurrently`.

### Cách 2: Khởi chạy từng phân hệ độc lập
* **Khởi chạy Backend (Terminal 1):**
  ```powershell
  npm run dev:be
  # Hoặc: cd BE && npm run dev
  ```
* **Khởi chạy Frontend (Terminal 2):**
  ```powershell
  npm run dev:fe
  # Hoặc: cd FE && npm run dev
  ```

---

## 🔑 5. Tài Khoản Đăng Nhập Mẫu (1-Click Demo Login)

Tại màn hình đăng nhập (`DangNhapHeThong.jsx`), hệ thống tích hợp sẵn **4 nút bấm 1-Click Demo Login** để giảng viên chấm bài hoặc người dùng có thể đổi vai trò ngay lập tức:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn Trong Hệ Thống |
| :--- | :--- | :--- | :--- |
| **Quản Lý (Admin)** | `admin@nhahang.com` | `123456` | Toàn quyền quản trị hệ thống, xem bảng điều khiển tổng quan, báo cáo doanh số, quản lý thực đơn và kho nguyên liệu |
| **Thu Ngân (Cashier)** | `thungan@nhahang.com` | `123456` | Mở bàn ăn, thực hiện gọi món tại quầy POS, in hóa đơn tạm tính và thanh toán tiền mặt / VietQR |
| **Bếp Trưởng (Kitchen)** | `bep@nhahang.com` | `123456` | Tiếp nhận order từ KDS, bấm nấu món (hệ thống tự động trừ kho định lượng BOM), báo nấu xong |
| **Nhân Viên Phục Vụ (Staff)** | `phucvu@nhahang.com` | `123456` | Tiếp nhận lịch đặt bàn trước của khách, đón khách (check-in) và hỗ trợ gọi món tại bàn |

---

## 📡 6. Danh Mục RESTful API Endpoints

Máy chủ Backend cung cấp danh mục API chuẩn mực trả về dữ liệu định dạng JSON:

| Phân Hệ | Phương Thức | Endpoint | Mô Tả Chức Năng |
| :--- | :---: | :--- | :--- |
| **Xác thực** | `POST` | `/api/auth/login` | Đăng nhập tài khoản, cấp phát mã Token JWT |
| | `GET` | `/api/auth/me` | Lấy thông tin tài khoản phiên đăng nhập hiện tại |
| **Thực đơn** | `GET` | `/api/dishes` | Lấy danh sách tất cả món ăn trong thực đơn |
| | `POST` | `/api/dishes` | Thêm món ăn mới (Yêu cầu quyền Admin) |
| | `DELETE` | `/api/dishes/:id` | Xóa món ăn khỏi thực đơn (Admin) |
| | `GET` | `/api/dishes/categories` | Lấy danh sách danh mục phân loại món |
| **Sơ đồ bàn** | `GET` | `/api/tables` | Lấy sơ đồ bàn ăn và trạng thái sử dụng thực tế |
| | `PATCH` | `/api/tables/:id/status` | Cập nhật trạng thái bàn (trống, có khách, đã đặt) |
| **Gọi món** | `GET` | `/api/orders` | Lấy danh sách đơn gọi món (hỗ trợ lọc theo bàn) |
| | `POST` | `/api/orders` | Gửi đơn món mới vào bếp, kích hoạt Socket realtime |
| | `GET` | `/api/orders/kitchen` | Lấy danh sách món đang chờ / đang nấu cho Bếp KDS |
| | `PATCH` | `/api/orders/:id/status` | Đổi trạng thái chế biến (nấu món -> tự trừ kho BOM) |
| | `POST` | `/api/orders/pay` | Thanh toán hóa đơn bàn, giải phóng bàn, tích điểm CRM |
| **Đặt bàn** | `GET` | `/api/reservations` | Lấy danh sách lịch hẹn đặt bàn trước |
| | `POST` | `/api/reservations` | Tiếp nhận thông tin đặt bàn mới và tiền cọc |
| | `PATCH` | `/api/reservations/:id/checkin` | Check-in đón khách vào bàn ăn |
| | `PATCH` | `/api/reservations/:id/cancel` | Hủy lịch hẹn đặt bàn |
| **Kho hàng** | `GET` | `/api/inventory/ingredients` | Lấy danh sách tồn kho và định mức tối thiểu |
| | `PATCH` | `/api/inventory/ingredients/:id/stock` | Nhập thêm số lượng tồn kho nguyên liệu |
| | `GET` | `/api/inventory/suppliers` | Lấy danh sách nhà cung cấp thực phẩm |
| **Khách hàng** | `GET` | `/api/customers` | Danh sách hội viên thân thiết CRM và điểm tích lũy |
| | `POST` | `/api/customers` | Thêm mới hồ sơ khách hàng thân thiết |
| **Báo cáo** | `GET` | `/api/reports/summary` | Thống kê doanh thu, cơ cấu thanh toán, top món bán chạy |

---

## ⚡ 7. Cơ Chế Socket.io Realtime Events

Hệ thống sử dụng WebSockets hai chiều toàn phần để đồng bộ dữ liệu tức thì:
* `order:new`: Kích hoạt khi POS hoặc khách hàng gửi order mới -> Màn hình Bếp KDS tự động thêm món và phát chuông báo.
* `order:status_updated`: Kích hoạt khi Bếp chuyển trạng thái món -> Giao diện POS và Sơ đồ bàn cập nhật trạng thái ngay lập tức.
* `table:updated`: Kích hoạt khi bàn đổi trạng thái hoặc hoàn tất thanh toán -> Đồng bộ màu sắc sơ đồ bàn trên toàn mạng nội bộ.

---

## 📑 8. Danh Mục 4 File Tài Liệu Duy Nhất Của Dự Án

Tuân thủ nghiêm ngặt yêu cầu lưu trữ tài liệu của đồ án, trong thư mục dự án chỉ duy trì đúng **4 tệp tin tài liệu**:
1. `CDBackEnd.docx`: Báo cáo Word chuẩn mực chi tiết môn học Chuyên Đề Back-End.
2. `README.md`: Tài liệu hướng dẫn triển khai, cài đặt và kiến trúc hệ thống tổng quan.
3. `docs/Nhom5_NguyenNgocHaThao.docx`: Báo cáo chính thức của Nhóm 5 (Nguyễn Ngọc Hà Thảo).
4. `docs/Nhom5_NguyenNgocHaThao.md`: Bản thảo Markdown báo cáo của Nhóm 5.
