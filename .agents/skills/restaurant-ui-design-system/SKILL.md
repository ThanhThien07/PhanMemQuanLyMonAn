---
name: restaurant-ui-design-system
description: Quy chuẩn thiết kế UI/UX toàn diện cho nhà hàng Royal Bistro. Tự động áp dụng kiến trúc tách nền 3 tầng (Layered Depth), viền border-2 nổi khối sâu, hiệu ứng hover nâng card, bố cục cố định h-screen overflow-hidden chống lệch panel, menu Admin đầy đủ 10 phân hệ để giám sát thống kê, bỏ tag đỏ danh mục và chỉ hiện tag đỏ cùng giá đỏ khi có giảm giá, font chữ tiếng Việt có chân, bo góc viên thuốc (rounded-pill).
---

# Quy Chuẩn Thiết Kế Giao Diện UI/UX Nhà Hàng Royal Bistro

Khi sửa đổi, thêm mới hoặc tái cấu trúc bất kỳ trang, component, modal hay giao diện nào trong dự án, BẮT BUỘC tuân thủ 100% các quy tắc thiết kế sau đây:

---

## 1. Khung Bố Cục Cố Định Chống Xô Lệch Panel (Fixed App Frame)
- Khung bố cục chính: `h-screen w-full flex overflow-hidden bg-slate-100`.
- Sidebar menu bên trái: `sticky top-0 h-screen shrink-0 border-r border-slate-200 bg-white w-64 sm:w-72`.
  - Cố định hoàn toàn ở lề trái, KHÔNG BAO GIỜ bị trôi hoặc di chuyển khi người dùng cuộn nội dung.
- Phân vùng làm việc bên phải: `flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-slate-100`.
  - Topbar cố định ở trên đầu.
  - Vùng nội dung `main`: `flex-1 overflow-y-auto bg-slate-100 px-3 sm:px-6 lg:px-8 py-5 sm:py-6`. Chỉ có vùng này cuộn dọc độc lập, không phát sinh cuộn ngang toàn trang.

---

## 2. Kiến Trúc Tách Nền 3 Tầng & Hiệu Ứng Nổi Khối (Layered Depth & Border-2 System)
1. **Tầng 0 - Nền tổng thể ứng dụng**: `bg-slate-100` (`#F1F5F9`). Không bao giờ dùng `bg-white` phẳng lì cho toàn trang.
2. **Tầng 1 - Khung Card / Panel / Modal chính**:
   - Viền dày 2px rõ nét: `border-2 border-slate-200/90` hoặc `border-2 border-slate-300`.
   - Nền trắng: `bg-white`.
   - Bo góc lớn: `rounded-3xl` hoặc `rounded-4`.
   - Đổ bóng: `shadow-sm hover:shadow-lg transition-all`.
3. **Tầng 2 - Khối Item Con Bên Trong (Dish Card, Table Card, Item Block)**:
   - Viền dày 2px: `border-2 border-slate-200/90` hoặc `border-2 border-slate-300`.
   - Nền tương phản: `bg-slate-50/90`.
   - Bo tròn: `rounded-2xl`.
   - Đổ bóng vi mô: `shadow-2xs`.
   - **Hiệu ứng hover tương tác**: Chuyển sang nền trắng `hover:bg-white`, viền xanh dương `hover:border-blue-400` (hoặc `hover:border-blue-500`), đổ bóng sâu `hover:shadow-md` và nâng nhẹ `hover:-translate-y-0.5` hoặc `hover:-translate-y-1`.
   - Ảnh món ăn trong thẻ: Viền `border-2 border-slate-200` và ăn sát viền khối.
4. **Đồng bộ hóa 100%**: Áp dụng nhất quán từ Landing Page khách gọi món QR đến toàn bộ các phân hệ quản trị (Dashboard, Sơ đồ bàn, POS, KDS, Đặt bàn, Thực đơn, Kho, Khách hàng, Báo cáo).

---

## 3. Font Chữ Toàn Bộ Web (Serif Font Tiếng Việt Có Chân)
- Toàn bộ văn bản, tiêu đề, nút bấm, bảng biểu, input và modal PHẢI sử dụng font tiếng Việt có chân:
  `font-family: 'Lora', 'Merriweather', 'Times New Roman', Georgia, serif;`
- Đã được cấu hình toàn cục trong `FE/src/index.css` với `--bs-body-font-family`.
- Nút menu sidebar: Sử dụng `text-start whitespace-nowrap truncate` để tên menu không bao giờ bị rớt dòng lộn xộn.

---

## 4. Quy Chuẩn Tag & Giá Món Ăn
- **BỎ HOÀN TOÀN tag đỏ tên danh mục trên ảnh món** (không gắn tag `🔥 Tên Loại` cố định).
- **CHỈ HIỂN THỊ TAG ĐỎ KHI MÓN CÓ GIẢM GIÁ**:
  - Khi món có giảm giá (`phan_tram_giam || is_discount`): Hiển thị tag đỏ (ví dụ: `Giảm 15%`) và giá món có **MÀU ĐỎ** (`text-red-600 font-black`).
  - Khi món bình thường không giảm giá: **KHÔNG HIỂN THỊ TAG NÀO TRÊN ẢNH**, giá món giữ **MÀU ĐEN** (`text-slate-900 font-black`).
- Nút bấm: Tất cả đều bo tròn viên thuốc `rounded-pill`. Nút chính màu xanh dương `btn-primary`.

---

## 5. Flow Nghiệp Vụ & Phân Quyền Vai Trò
- **Admin (Quản Trị Viên)**: Phải nhìn thấy **ĐẦY ĐỦ TẤT CẢ các phân hệ** trên menu để theo dõi, giám sát và xem báo cáo thống kê toàn diện (Dashboard, Báo Cáo Doanh Thu, Sơ Đồ Bàn, POS, Bếp KDS, Đặt Bàn, Thực Đơn, Kho BOM, CRM Khách Hàng, Khách Quét QR). Không được lược bỏ menu của Admin!
- **Thu Ngân**: Chuyên trách tính tiền hóa đơn. Bấm xác nhận thanh toán -> Tự động giải phóng bàn (`trang_thai: 'trong', so_luong_khach: 0`) ngay lập tức.
- **Bếp Trưởng (KDS)**: Nhận đơn realtime qua WebSockets, thông báo âm thanh bip, bấm 'Bắt Đầu Nấu' (tự động trừ kho nguyên liệu theo định mức BOM), bấm 'Nấu Xong & Báo Phục Vụ'.
- **Phục Vụ (Waiter)**: Quản lý danh sách bàn đã đặt, đón khách chưa đặt -> mở bàn và hướng dẫn khách quét mã QR order món tại bàn.
