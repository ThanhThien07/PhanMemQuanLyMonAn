# Antigravity Workspace Guidelines - Royal Bistro Restaurant Management

## 1. UI/UX Design System Rules (Bắt buộc tuân thủ)
- **Bố cục cố định chống xô lệch panel**:
  - Khung tổng thể: `h-screen w-full flex overflow-hidden bg-slate-100`.
  - Sidebar bên trái: Cố định `sticky top-0 h-screen shrink-0 border-r border-slate-200 bg-white w-64 sm:w-72`, không bao giờ bị di chuyển hay trôi khi cuộn.
  - Phân vùng làm việc chính: `flex-1 overflow-y-auto bg-slate-100 p-5 sm:p-7`.
- **Kiến trúc Tách Nền 3 Tầng & Viền Border-2 Nổi Khối (Layered Depth & Border-2 System)**:
  - Tầng 0 (Nền trang Canvas): `bg-slate-100` (`#F1F5F9`).
  - Tầng 1 (Khung Container Card / Panel / Modal): Viền dày 2px `border-2 border-slate-200/90` hoặc `border-2 border-slate-300`, nền `bg-white`, bo góc `rounded-3xl` hoặc `rounded-4`, đổ bóng `shadow-sm hover:shadow-lg transition-all`.
  - Tầng 2 (Item con / Dish Card / Thẻ bàn): Viền dày 2px `border-2 border-slate-200/90`, nền `bg-slate-50/90`, bo tròn `rounded-2xl`, đổ bóng `shadow-2xs`.
  - **Hiệu ứng hover tương tác**: Chuyển nền trắng `hover:bg-white`, viền xanh dương `hover:border-blue-400` hoặc `hover:border-blue-500`, đổ bóng sâu `hover:shadow-md`, nâng nhẹ `hover:-translate-y-0.5` hoặc `hover:-translate-y-1`.
  - Đồng bộ 100% giữa tất cả các component quản trị và toàn bộ Landing Page khách gọi món QR.
- **Font chữ có chân tiếng Việt toàn bộ web**: `'Lora', 'Merriweather', 'Times New Roman', Georgia, serif`.
  - Menu sidebar: `text-start whitespace-nowrap truncate` chống rớt dòng text.
- **Quy tắc Tag & Giá Món Ăn**:
  - BỎ HOÀN TOÀN tag đỏ tên loại trên ảnh món ăn.
  - CHỈ HIỂN THỊ TAG ĐỎ KHI MÓN CÓ GIẢM GIÁ (ví dụ: `Giảm 15%`).
  - Món bình thường không giảm giá: Giá có **MÀU ĐEN** `text-slate-900 font-black`.
  - Món có giảm giá: Giá có **MÀU ĐỎ** `text-red-600 font-black`.
- **Nút bấm & Card**:
  - Tất cả nút bấm đều bo tròn viên thuốc: `rounded-pill`. Nút chính màu xanh dương `btn-primary`.
  - Ảnh món ăn to rõ, bo tròn `rounded-2xl` hoặc ăn sát viền card.

## 2. Operations & Workflow Rules
- **Admin**: Nhìn thấy **ĐẦY ĐỦ TẤT CẢ 10 phân hệ** trên menu để theo dõi, giám sát và xem báo cáo thống kê toàn diện (Dashboard, Báo Cáo Doanh Thu, Sơ Đồ Bàn, POS, Bếp KDS, Đặt Bàn, Thực Đơn, Kho BOM, CRM Khách Hàng, Khách Quét QR). Không được lược bỏ menu của Admin!
- **Thu Ngân**: Khi bấm xác nhận thanh toán -> Tự động giải phóng bàn (`trang_thai: 'trong', so_luong_khach: 0`) ngay lập tức.
- **Bếp Trưởng KDS**: Bấm 'Bắt Đầu Nấu' tự động trừ kho nguyên liệu theo định mức BOM.
- **Phục Vụ**: Quản lý danh sách bàn đã đặt, đón khách chưa đặt -> mở bàn và hướng dẫn khách quét mã QR order món tại bàn.
