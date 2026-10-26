# UI/UX & Operations Rules - Nhà Hàng Royal Bistro

Tất cả các thay đổi giao diện và mã nguồn trong dự án BẮT BUỘC tuân thủ các quy tắc sau:

1. **Khung Bố Cục Cố Định & Kiến Trúc Tách Nền 3 Tầng (Border-2 & Layered Depth)**:
   - Khung tổng thể: `h-screen w-full flex overflow-hidden bg-slate-100`.
   - Sidebar bên trái: Cố định `sticky top-0 h-screen shrink-0 border-r border-slate-200 bg-white w-64 sm:w-72`, không bao giờ bị xê dịch hay trôi khi cuộn trang.
   - Main content bên phải: `flex-1 overflow-y-auto bg-slate-100 p-5 sm:p-7`.
   - **Tầng 0 (Canvas)**: `bg-slate-100` (`#F1F5F9`).
   - **Tầng 1 (Panel Container Card / Modal)**: Viền dày 2px `border-2 border-slate-200/90` hoặc `border-2 border-slate-300`, nền `bg-white`, bo góc `rounded-3xl`, đổ bóng `shadow-sm hover:shadow-lg transition-all`.
   - **Tầng 2 (Item con / Card món ăn / Thẻ bàn)**: Viền dày 2px `border-2 border-slate-200/90`, nền `bg-slate-50/90`, bo tròn `rounded-2xl`, đổ bóng `shadow-2xs`.
   - **Hiệu ứng hover tương tác**: Nền chuyển sang trắng `hover:bg-white`, viền đổi sang xanh dương `hover:border-blue-400` hoặc `hover:border-blue-500`, đổ bóng sâu `hover:shadow-md`, nâng nhẹ `hover:-translate-y-0.5` hoặc `hover:-translate-y-1`.
   - Đồng bộ nhất quán cho 100% component quản trị và toàn bộ Landing Page khách gọi món QR.

2. **Font Chữ Toàn Bộ Web**:
   - Sử dụng font chữ tiếng Việt có chân: `'Lora', 'Merriweather', 'Times New Roman', Georgia, serif`.
   - Đã cấu hình toàn cục tại `FE/src/index.css`. Không sử dụng font không chân (sans-serif) ngoại trừ font số liệu `.font-monospace`.
   - Các nút menu: Phải có `text-start whitespace-nowrap truncate` để chữ không bao giờ bị rớt dòng lộn xộn.

3. **Màu Sắc & Quy Chuẩn Tag Món Ăn**:
   - **BỎ HOÀN TOÀN tag đỏ tên danh mục trên ảnh món ăn** (không gắn tag `🔥 Tên Loại` cố định).
   - **CHỈ HIỂN THỊ TAG ĐỎ KHI MÓN CÓ GIẢM GIÁ** (ví dụ: `Giảm 15%`).
   - **Giá món ăn**:
     + Món bình thường (không giảm giá): Giá có **MÀU ĐEN** `text-slate-900 font-black`.
     + Món có giảm giá: Giá có **MÀU ĐỎ** `text-red-600 font-black`.
   - Nút bấm: Tất cả đều bo tròn viên thuốc `rounded-pill`. Nút chính màu xanh dương `btn-primary`.

4. **Phân Quyền & Luồng Vận Hành**:
   - **Admin (Quản Trị Viên)**: Phải nhìn thấy **ĐẦY ĐỦ TẤT CẢ 10 phân hệ** trên menu để theo dõi, giám sát và xem báo cáo thống kê toàn diện (Dashboard, Báo Cáo Doanh Thu, Sơ Đồ Bàn, POS, Bếp KDS, Đặt Bàn, Thực Đơn, Kho BOM, CRM Khách Hàng, Khách Quét QR). Không được lược bỏ menu của Admin!
   - **Thu Ngân**: Chuyên trách thanh toán hóa đơn. Khi bấm xác nhận thanh toán -> Tự động giải phóng bàn (`trang_thai: 'trong', so_luong_khach: 0`) ngay lập tức.
   - **Bếp Trưởng KDS**: Bấm 'Bắt Đầu Nấu' tự động trừ kho nguyên liệu theo định mức BOM.
   - **Phục Vụ**: Quản lý danh sách bàn đã đặt, đón khách chưa đặt -> mở bàn và hướng dẫn khách quét mã QR order món tại bàn.
