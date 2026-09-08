# HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN (ROYAL BISTRO)
**Kiến Trúc Chuẩn Hoá:** Fullstack JavaScript (Express.js REST API + React.js SPA)  
**Phục Vụ Đề Tài:** Chuyên Đề Backend & Chuyên Đề Frontend

---

## 1. Sơ Đồ Cấu Trúc Thư Mục Dễ Phát Hiện & Xử Lý Lỗi

```
PhanMemQuanLyMonAn/
│
├── backend/                       # 🟢 PHÂN HỆ BACKEND (Node.js & Express.js)
│   ├── data/                      # Cơ sở dữ liệu SQLite
│   │   └── database.sqlite
│   ├── src/
│   │   ├── config/                # Cấu hình Database & JWT
│   │   │   ├── db.js              (Kết nối CSDL SQLite/MySQL không đồng bộ)
│   │   │   └── jwt.js             (Tạo & xác minh token)
│   │   ├── constants/             # Quản lý hằng số tập trung (Tránh lỗi magic string)
│   │   │   └── index.js           (ROLES, TABLE_STATUS, ORDER_STATUS, PAYMENT_METHODS)
│   │   ├── controllers/           # Tầng xử lý nghiệp vụ (Controller phân loại rõ ràng)
│   │   │   ├── authController.js        (Đăng nhập, Đăng ký, Demo accounts)
│   │   │   ├── dishController.js        (Quản lý món & danh mục)
│   │   │   ├── tableController.js       (Quản lý bàn & sơ đồ)
│   │   │   ├── orderController.js       (POS gọi món, trừ kho BOM, thanh toán)
│   │   │   ├── reservationController.js (Đặt bàn trước, check-in)
│   │   │   ├── inventoryController.js   (Kho, cảnh báo hết hàng, NCC)
│   │   │   ├── customerController.js    (Khách hàng & tích điểm)
│   │   │   └── reportController.js      (Báo cáo doanh số)
│   │   ├── middlewares/           # Tầng Middleware (Bảo vệ & Giám sát lỗi)
│   │   │   ├── auth.js                  (Xác thực Token & phân quyền)
│   │   │   ├── errorHandler.js          (Bắt và chuẩn hóa toàn bộ lỗi máy chủ)
│   │   │   └── requestLogger.js         (Ghi log chi tiết mọi HTTP request + thời gian)
│   │   ├── routes/                # Tầng định tuyến REST API
│   │   │   ├── index.js                 (Master router gom tất cả routes)
│   │   │   ├── authRoutes.js
│   │   │   ├── dishRoutes.js
│   │   │   ├── tableRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── reservationRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   └── reportRoutes.js
│   │   └── utils/                 # Bộ công cụ tiện ích & Debug
│   │       ├── asyncHandler.js          (Tự động bắt lỗi Async không cần try/catch lặp lại)
│   │       ├── errors.js                (Custom Error classes: BadRequest, NotFound...)
│   │       ├── logger.js                (Logger màu sắc trực quan kèm timestamp)
│   │       ├── response.js              (Chuẩn hóa phản hồi API: { success, data, message })
│   │       ├── seedDb.js                (Khởi tạo CSDL và nạp dữ liệu mẫu)
│   │       └── socket.js                (Phát sự kiện realtime Bếp và Thu Ngân)
│   ├── .env                       # Biến môi trường Backend
│   ├── package.json
│   └── server.js                  # Entry point chính của Server
│
├── frontend/                      # 🔵 PHÂN HỆ FRONTEND (React.js + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/            # Thành phần giao diện tái sử dụng
│   │   │   ├── common/            # Bộ thành phần cơ bản & Bắt lỗi UI
│   │   │   │   ├── ErrorBoundary.jsx    (Bắt lỗi UI crash, chống trắng màn hình)
│   │   │   │   ├── EmptyState.jsx       (Hiển thị khi không có dữ liệu)
│   │   │   │   ├── Badge.jsx            (Nhãn trạng thái màu chuẩn)
│   │   │   │   └── Spinner.jsx          (Hiệu ứng loading mượt mà)
│   │   │   ├── layout/            # Bố cục giao diện
│   │   │   │   ├── Navbar.jsx           (Thanh header trên cùng)
│   │   │   │   ├── Sidebar.jsx          (Thanh menu bên trái)
│   │   │   │   └── MainLayout.jsx       (Khung layout tổng thể)
│   │   │   └── BillModal.jsx      # Modal hóa đơn, quét mã QR VietQR & in hóa đơn
│   │   ├── context/               # Quản lý trạng thái toàn cục
│   │   │   ├── AuthContext.jsx          (Trạng thái đăng nhập & 1-Click Login)
│   │   │   ├── SocketContext.jsx        (Lắng nghe sự kiện Realtime Socket.io)
│   │   │   └── ToastContext.jsx         (Hệ thống thông báo nổi Toast toàn cục)
│   │   ├── pages/                 # Các trang màn hình chức năng chính
│   │   │   ├── Login.jsx                (Màn hình đăng nhập)
│   │   │   ├── Dashboard.jsx            (Bảng điều khiển tổng quan)
│   │   │   ├── POSOrder.jsx             (POS gọi món theo bàn)
│   │   │   ├── TableManagement.jsx      (Sơ đồ bàn ăn trực quan)
│   │   │   ├── KitchenDisplay.jsx       (Màn hình Bếp KDS Realtime)
│   │   │   ├── ReservationPage.jsx      (Quản lý đặt bàn trước)
│   │   │   ├── DishManagement.jsx       (Quản lý thực đơn)
│   │   │   ├── InventoryPage.jsx        (Quản lý kho nguyên liệu BOM)
│   │   │   ├── CustomerPage.jsx         (Quản lý khách hàng thân thiết)
│   │   │   └── ReportsPage.jsx          (Báo cáo doanh thu & dòng tiền)
│   │   ├── services/              # Tầng gọi API độc lập theo từng module
│   │   │   ├── api.js                   (Axios client cấu hình interceptor gắn Token)
│   │   │   ├── dishService.js
│   │   │   ├── orderService.js
│   │   │   ├── tableService.js
│   │   │   ├── reservationService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── customerService.js
│   │   │   └── reportService.js
│   │   ├── utils/                 # Tiện ích định dạng
│   │   │   └── format.js                (Format tiền tệ VND, ngày giờ)
│   │   ├── App.jsx
│   │   ├── index.css              # Giao diện sáng (Light Theme) + Tailwind v4
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js             # Cấu hình proxy sang Backend Port 5000
│
└── docs/                          # Tài liệu kiến trúc, báo cáo và SQL
```

---

## 2. Vì Sao Cấu Trúc Này Dễ Debug & Xử Lý Lỗi?

1. **Phân tầng rõ ràng (Separation of Concerns):**
   * Lỗi giao diện -> Tìm trong `frontend/src/pages/` hoặc `frontend/src/components/`.
   * Lỗi gọi API -> Tìm trong `frontend/src/services/`.
   * Lỗi logic Backend -> Tìm trong `backend/src/controllers/`.
   * Lỗi kết nối CSDL -> Tìm trong `backend/src/config/db.js`.
2. **Không bị Crash trắng màn hình:** Có `ErrorBoundary.jsx` tự động bắt mọi lỗi rendering và hiện thông báo lỗi chi tiết kèm nút reload.
3. **Request Logging chi tiết:** Mọi yêu cầu gửi tới Backend đều được ghi log rõ ràng: `[METHOD] /endpoint (Status) (Thời gian ms)`.
4. **Hằng số tập trung (Constants):** Không dùng các chuỗi cứng rải rác, tránh lỗi gõ sai chính tả trạng thái (`'trong'`, `'co_khach'`, `'cho_xac_nhan'`).
