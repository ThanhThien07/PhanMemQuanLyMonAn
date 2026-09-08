# 🍽️ ROYAL BISTRO - HỆ THỐNG QUẢN LÝ NHÀ HÀNG & GỌI MÓN (POS)
> **Kiến Trúc:** Fullstack JavaScript (Node.js Express REST API + React.js SPA + Socket.io Realtime)  
> **Phục Vụ Đề Tài:** Chuyên Đề Backend & Chuyên Đề Frontend  

---

## 🌟 1. Giới Thiệu Tổng Quan
**Royal Bistro** là hệ thống phần mềm quản lý nhà hàng và đặt món tại bàn chuyên nghiệp, hiện đại, đáp ứng đầy đủ các nghiệp vụ từ bán hàng (POS), điều phối bếp (KDS), quản lý kho nguyên liệu theo định lượng (BOM), đặt bàn trước và phân tích báo cáo doanh số.

Toàn bộ hệ thống được xây dựng **100% bằng JavaScript/Node.js**, tách biệt rõ ràng 2 phân hệ độc lập:
* **`backend/`**: Node.js + Express.js + SQLite/MySQL + Socket.io + JWT Authentication.
* **`frontend/`**: React 19 + Vite + Tailwind CSS v4 + Lucide Icons (Single Page Application).

---

## 📁 2. Cấu Trúc Dự Án (Monorepo)

```
PhanMemQuanLyMonAn/
├── backend/                       # 🟢 PHÂN HỆ BACKEND REST API (Port 5000)
│   ├── data/                      # Lưu trữ cơ sở dữ liệu SQLite
│   │   └── database.sqlite
│   ├── src/
│   │   ├── config/                # Cấu hình CSDL & JWT
│   │   ├── constants/             # Quản lý hằng số tập trung (Roles, Status)
│   │   ├── controllers/           # Tầng xử lý nghiệp vụ (Auth, Dishes, Orders, Tables...)
│   │   ├── middlewares/           # Xác thực Token, Phân quyền, Bắt lỗi & Request Logger
│   │   ├── routes/                # Định tuyến REST API endpoints (/api/...)
│   │   └── utils/                 # Logger, Custom Errors, Seeder, Socket.io
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/                      # 🔵 PHÂN HỆ FRONTEND REACT SPA (Port 3000)
│   ├── src/
│   │   ├── components/            # ErrorBoundary, Navbar, Sidebar, BillModal, Badges
│   │   ├── context/               # AuthContext, SocketContext, ToastContext
│   │   ├── pages/                 # Dashboard, POS, Bàn, Bếp KDS, Đặt Bàn, Kho, Báo Cáo
│   │   ├── services/              # Tầng gọi API theo từng module (Axios Interceptor)
│   │   ├── utils/                 # Format tiền tệ VND, ngày giờ
│   │   ├── App.jsx
│   │   └── index.css              # Giao diện sáng (Light Theme) + Tailwind v4
│   ├── package.json
│   └── vite.config.js
│
├── docs/                          # 📚 TÀI LIỆU, SƠ ĐỒ THIẾT KẾ & FILE SQL CSDL
│   ├── BANDO_TINH_NANG_VA_GIAO_DIEN.md
│   ├── BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.docx
│   ├── BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.md
│   ├── DAC_TA_HE_THONG_QUAN_LY_NHA_HANG.md
│   ├── Nhom5_NguyenNgocHaThao.sql  (File SQL CSDL 12 bảng)
│   └── PhanMemQuanLyNhaHang_Database.sql
│
├── package.json                   # Monorepo scripts khởi chạy toàn dự án
└── README.md
```

---

## 🚀 3. Hướng Dẫn Khởi Chạy

### Cách 1: Chạy đồng thời cả Frontend và Backend (Khuyên dùng)
Tại thư mục gốc của dự án:
```powershell
npm run dev
```
> Lệnh này sẽ tự động khởi chạy cả Backend (`http://localhost:5000`) và Frontend (`http://localhost:3000`) trên cùng 1 terminal!

### Cách 2: Khởi chạy từng phân hệ độc lập
* **Khởi động Backend (Terminal 1):**
  ```powershell
  npm run dev:backend
  # Hoặc: cd backend && npm run dev
  ```
* **Khởi động Frontend (Terminal 2):**
  ```powershell
  npm run dev:frontend
  # Hoặc: cd frontend && npm run dev
  ```

---

## 🔑 4. Tài Khoản Đăng Nhập Mẫu (1-Click Demo Login)

Trên màn hình Đăng nhập có sẵn **3 nút 1-Click Login** để chuyển đổi vai trò ngay lập tức:

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản Lý (Admin)** | `admin@nhahang.com` | `123456` | Toàn quyền quản trị, xem báo cáo doanh số, quản lý món & kho |
| **Thu Ngân (Cashier)** | `thungan@nhahang.com` | `123456` | Mở bàn, gọi món POS theo bàn, tính tiền, in hóa đơn & QR VietQR |
| **Bếp Trưởng (Kitchen)** | `bep@nhahang.com` | `123456` | Màn hình Bếp KDS Realtime, nhận món, nấu món (tự động trừ kho BOM) |

---

## 🎯 5. Tính Năng Nổi Bật Dùng Thuyết Minh 2 Môn Học

### 🌟 Chuyên Đề Backend:
1. **Kiến trúc RESTful API chuẩn:** Tách Controller, Middleware, Services, Routes gọn gàng.
2. **Bảo mật & Phân quyền:** JWT Authentication, Bcrypt Password Hashing, RBAC Authorization.
3. **Nghiệp vụ phức tạp:** Tự động trừ kho nguyên liệu theo Định lượng món ăn (BOM - Bill of Materials).
4. **Realtime Socket.io:** Bắn sự kiện tức thì từ POS tới Bếp không cần reload trang.
5. **Hệ thống Logger & Bắt lỗi:** Tích hợp `requestLogger.js` ghi log mọi request kèm thời gian phản hồi và mã trạng thái.

### 🌟 Chuyên Đề Frontend:
1. **Single Page Application (SPA):** Sử dụng React 19 + Vite, tốc độ load siêu nhanh.
2. **Giao diện sáng (Light Theme) cao cấp:** Tailwind CSS v4, thiết kế hiện đại, responsive.
3. **Phòng chống Crash giao diện:** Tích hợp `ErrorBoundary.jsx` bắt mọi lỗi rendering UI.
4. **Trải nghiệm bán hàng POS:** Lọc món theo danh mục, giỏ hàng theo từng bàn, modal hóa đơn tích hợp mã VietQR.
