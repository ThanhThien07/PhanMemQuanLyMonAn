import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('generated_diagrams', exist_ok=True)

font_path = 'C:/Windows/Fonts/segoeui.ttf'
font_bold_path = 'C:/Windows/Fonts/segoeuib.ttf'
if not os.path.exists(font_bold_path): font_bold_path = font_path

font_title = ImageFont.truetype(font_bold_path, 20)
font_text = ImageFont.truetype(font_path, 14)
font_bold = ImageFont.truetype(font_bold_path, 14)
font_small = ImageFont.truetype(font_path, 12)
font_small_bold = ImageFont.truetype(font_bold_path, 12)

def draw_arrow(draw, p1, p2, color=(80, 90, 110), width=2):
    draw.line([p1, p2], fill=color, width=width)
    x1, y1 = p1
    x2, y2 = p2
    if y1 == y2: # horizontal
        d = 1 if x2 > x1 else -1
        draw.polygon([(x2, y2), (x2 - d*8, y2 - 5), (x2 - d*8, y2 + 5)], fill=color)
    else: # vertical
        d = 1 if y2 > y1 else -1
        draw.polygon([(x2, y2), (x2 - 5, y2 - d*8), (x2 + 5, y2 - d*8)], fill=color)

# 1. POS & KDS Realtime (Hinh 2.7)
def gen_pos_kds():
    w, h = 980, 530
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((w//2, 25), "LƯU ĐỒ GỌI MÓN POS VÀ ĐIỀU PHỐI BẾP KDS REAL-TIME", fill=(20, 30, 60), font=font_title, anchor="mm")

    steps = [
        ("1. Bàn ăn & POS", "Nhân viên mở bàn, chọn món,\nthêm ghi chú và bấm 'Gửi Bếp'", (230, 240, 255), (30, 100, 220), 40, 70, 200, 90),
        ("2. API Gateway & Controller", "POST /api/v1/orders\nKiểm tra dữ liệu, bàn ăn, món ăn", (245, 235, 255), (120, 50, 190), 280, 70, 200, 90),
        ("3. Lưu Trữ MongoDB", "Tạo bản ghi DatMon mới\nTrạng thái 'cho_xac_nhan'", (235, 250, 240), (20, 140, 70), 520, 70, 200, 90),
        ("4. Đổi Trạng Thái Bàn", "BanAn chuyển sang 'co_khach'\nCập nhật thời gian & số khách", (235, 250, 240), (20, 140, 70), 750, 70, 190, 90),
        ("5. Socket.io Phát Sóng", "io.emit('order:new', donHang)\nio.emit('table:updated', banAn)", (255, 245, 220), (210, 110, 10), 750, 220, 190, 90),
        ("6. Màn Hình Bếp KDS", "KDS nhận sự kiện real-time,\nphát âm thanh chuông reo & xếp hàng", (255, 235, 235), (200, 40, 40), 520, 220, 200, 90),
        ("7. Đầu Bếp Bấm Nấu", "Bếp chuyển sang 'dang_che_bien'\nKích hoạt trừ kho định lượng BOM", (255, 245, 220), (210, 110, 10), 280, 220, 200, 90),
        ("8. Socket Cập Nhật", "io.emit('order:status_updated')\nĐồng bộ lại màn hình POS & Thu ngân", (245, 235, 255), (120, 50, 190), 40, 220, 200, 90),
        ("9. Bếp Hoàn Thành", "Đầu bếp nấu xong -> 'da_phuc_vu'\nNhân viên phục vụ mang món ra bàn", (230, 255, 235), (20, 150, 80), 40, 370, 440, 90),
        ("10. Khách Ăn Xong & Tính Tiền", "Khách yêu cầu thanh toán -> POS xuất hóa đơn\nVietQR động & giải phóng bàn về 'trong'", (230, 240, 255), (30, 100, 220), 520, 370, 420, 90),
    ]

    for title, desc, bg, border, x, y, bw, bh in steps:
        draw.rounded_rectangle([x, y, x+bw, y+bh], radius=10, fill=bg, outline=border, width=2)
        draw.text((x + bw//2, y + 20), title, fill=border, font=font_bold, anchor="mm")
        draw.text((x + bw//2, y + 55), desc, fill=(50, 50, 60), font=font_text, anchor="mm")

    draw_arrow(draw, (240, 115), (280, 115))
    draw_arrow(draw, (480, 115), (520, 115))
    draw_arrow(draw, (720, 115), (750, 115))
    draw_arrow(draw, (845, 160), (845, 220))
    draw_arrow(draw, (750, 265), (720, 265))
    draw_arrow(draw, (520, 265), (480, 265))
    draw_arrow(draw, (280, 265), (240, 265))
    draw_arrow(draw, (140, 310), (140, 370))
    draw_arrow(draw, (480, 415), (520, 415))

    img.save('generated_diagrams/flowchart_pos_kds.png')
    print("Generated flowchart_pos_kds.png")

# 2. BOM Inventory (Hinh 2.8)
def gen_bom_inventory():
    w, h = 980, 520
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((w//2, 25), "LƯU ĐỒ CẬP NHẬT TRẠNG THÁI VÀ TRỪ KHO ĐỊNH LƯỢNG (BOM)", fill=(20, 30, 60), font=font_title, anchor="mm")

    steps = [
        ("1. Sự Kiện Nấu Món", "Đầu bếp chọn 'Bắt đầu nấu'\nPUT /api/v1/orders/:id/status\ntrang_thai = 'dang_che_bien'", (255, 235, 235), (200, 40, 40), 40, 75, 210, 95),
        ("2. Kiểm Tra Điều Kiện", "Đơn trước đó có phải\n'cho_xac_nhan' không?\nTránh trừ trùng kho khi bấm lặp", (255, 245, 220), (210, 110, 10), 280, 75, 210, 95),
        ("3. Truy Vấn Công Thức BOM", "Tìm danh sách nguyên liệu của món:\nMonAnNguyenLieu.find({\n  mon_an_id: order.mon_an_id\n})", (245, 235, 255), (120, 50, 190), 520, 75, 230, 95),
        ("4. Tính Hao Phí Nguyên Liệu", "soLuongCanTru =\nbom.so_luong_can * order.so_luong\nTính theo từng thành phần món", (230, 240, 255), (30, 100, 220), 780, 75, 170, 95),
        ("5. Khấu Trừ Tồn Kho", "NguyenLieu.updateOne():\nso_luong_ton = Math.max(0,\nso_luong_ton - soLuongCanTru)", (235, 250, 240), (20, 140, 70), 750, 230, 200, 95),
        ("6. Kiểm Tra Định Mức Tồn", "so_luong_ton <= dinh_muc_toi_thieu?\nNếu có -> Kích hoạt Cảnh Báo Kho\nvà ghi log cảnh báo", (255, 245, 220), (210, 110, 10), 480, 230, 230, 95),
        ("7. Cập Nhật Đơn Món", "Đổi trạng thái DatMon thành\n'dang_che_bien', lưu thời điểm\nupdated_at vào CSDL", (235, 250, 240), (20, 140, 70), 240, 230, 200, 95),
        ("8. Phát Sóng Real-time", "io.emit('order:status_updated')\nĐồng bộ tức thì lên màn hình\nQuản lý, POS và KDS Bếp", (230, 240, 255), (30, 100, 220), 40, 230, 170, 95),
        ("9. Phục Vụ & Kết Thúc", "Món nấu xong chuyển 'da_phuc_vu' -> Thu ngân lập hóa đơn thanh toán và chốt ca", (230, 255, 235), (20, 150, 80), 40, 380, 910, 80),
    ]

    for title, desc, bg, border, x, y, bw, bh in steps:
        draw.rounded_rectangle([x, y, x+bw, y+bh], radius=10, fill=bg, outline=border, width=2)
        draw.text((x + bw//2, y + 20), title, fill=border, font=font_bold, anchor="mm")
        draw.text((x + bw//2, y + 55), desc, fill=(50, 50, 60), font=font_text, anchor="mm")

    draw_arrow(draw, (250, 122), (280, 122))
    draw_arrow(draw, (490, 122), (520, 122))
    draw_arrow(draw, (750, 122), (780, 122))
    draw_arrow(draw, (865, 170), (865, 230))
    draw_arrow(draw, (750, 277), (710, 277))
    draw_arrow(draw, (480, 277), (440, 277))
    draw_arrow(draw, (240, 277), (210, 277))
    draw_arrow(draw, (125, 325), (125, 380))

    img.save('generated_diagrams/flowchart_bom_inventory.png')
    print("Generated flowchart_bom_inventory.png")

# 3. Monorepo Project Structure (Hinh 2.2)
def gen_project_structure():
    w, h = 980, 520
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((w//2, 25), "CẤU TRÚC THƯ MỤC TỔNG THỂ DỰ ÁN MONOREPO (BE & FE)", fill=(20, 30, 60), font=font_title, anchor="mm")

    # Left box: Back-End
    draw.rounded_rectangle([40, 65, 480, 480], radius=12, fill=(248, 250, 255), outline=(30, 100, 220), width=2)
    draw.text((260, 95), "PHÂN HỆ MÁY CHỦ: BACK-END (BE/)", fill=(30, 100, 220), font=font_bold, anchor="mm")
    be_items = [
        ("src/config/", "coSoDuLieu.js (MongoDB Mongoose), cauHinhJWT.js"),
        ("src/constants/", "hangSoHeThong.js (VAI_TRO, TRANG_THAI_BAN/DON)"),
        ("src/controllers/", "8 bộ xử lý: xacThuc, banAn, monAn, datMon, kho, crm..."),
        ("src/middlewares/", "kiemTraXacThuc.js (JWT/RBAC), xuLyLoi, ghiNhatKy"),
        ("src/models/", "12 Mongoose Models: NguoiDung, BanAn, MonAn, DatMon..."),
        ("src/routes/", "Tầng định tuyến API: dinhTuyenXacThuc, dinhTuyenBanAn..."),
        ("src/utils/", "xuLyBatDongBo, dinhNghiaLoi, truyenThongSocket..."),
        ("server.js", "Khởi động Express REST API & Socket.io WebSockets"),
        (".env & package.json", "Cấu hình cổng PORT=5000, MONGODB_URI, JWT_SECRET"),
    ]
    for idx, (folder, detail) in enumerate(be_items):
        y = 125 + idx * 38
        draw.text((60, y), folder, fill=(20, 30, 60), font=font_bold)
        draw.text((200, y), detail, fill=(70, 80, 90), font=font_text)

    # Right box: Front-End
    draw.rounded_rectangle([500, 65, 940, 480], radius=12, fill=(255, 250, 248), outline=(220, 80, 40), width=2)
    draw.text((720, 95), "PHÂN HỆ GIAO DIỆN: FRONT-END (FE/)", fill=(220, 80, 40), font=font_bold, anchor="mm")
    fe_items = [
        ("src/components/", "BoCucGiaoDienChinh, ModalInHoaDon (VietQR)..."),
        ("src/context/", "NguoiDungContext, SocketRealtimeContext..."),
        ("src/pages/", "11 màn hình: TongQuan, GoiMonPOS, BepKDS, Kho..."),
        ("src/services/", "cauHinhAxiosApi, dichVuBanAn, dichVuDatMon..."),
        ("src/utils/", "dinhDangDuLieu.js (tiền tệ VNĐ, ngày giờ DD/MM/YYYY)"),
        ("public/ma_qr.jpg", "Mã QR ngân hàng chuẩn hóa thanh toán hóa đơn"),
        ("package.json", "Khai báo thư viện React 19, Lucide-React, Axios..."),
        ("vite.config.js", "Cấu hình build siêu tốc với Vite Dev Server"),
        ("Tailwind CSS v4", "Giao diện hiện đại, glassmorphism, responsive đa thiết bị"),
    ]
    for idx, (folder, detail) in enumerate(fe_items):
        y = 125 + idx * 38
        draw.text((520, y), folder, fill=(20, 30, 60), font=font_bold)
        draw.text((670, y), detail, fill=(70, 80, 90), font=font_text)

    img.save('generated_diagrams/project_structure_monorepo.png')
    print("Generated project_structure_monorepo.png")

# 4. Front-End Detailed Structure (Hinh 2.4)
def gen_fe_structure():
    w, h = 980, 520
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((w//2, 25), "CẤU TRÚC PHÂN TẦNG VÀ THƯ MỤC CHI TIẾT FRONT-END (FE/src)", fill=(20, 30, 60), font=font_title, anchor="mm")

    cols = [
        ("TẦNG GIAO DIỆN (UI)", "src/pages/\n• TongQuanDashboard.jsx\n• SoDoBanAn.jsx\n• GoiMonTaiBanPOS.jsx\n• ManHinhBepKDS.jsx\n• QuanLyThucDon.jsx\n• QuanLyKhoNguyenLieu.jsx\n• KhachHangCRM.jsx\n• DatBanTruoc.jsx\n• BaoCaoDoanhThu.jsx\n• DangNhap.jsx", (230, 240, 255), (30, 100, 220), 40, 70, 210, 420),
        ("THÀNH PHẦN (COMPONENTS)", "src/components/\n• BoCucGiaoDienChinh.jsx\n• ThanhMenuDieuHuong.jsx\n• ModalInHoaDon.jsx\n• TheMonAnCard.jsx\n• GioHangItem.jsx\n• BangDuLieuTable.jsx\n• HopThoaiXacNhan.jsx\n• NutChonKhuVuc.jsx\n• CanhBaoKhoBanner.jsx\n• ThongBaoToast.jsx", (245, 235, 255), (120, 50, 190), 275, 70, 210, 420),
        ("DỊCH VỤ API (SERVICES)", "src/services/\n• cauHinhAxiosApi.js\n• dichVuXacThuc.js\n• dichVuBanAn.js\n• dichVuMonAn.js\n• dichVuDatMon.js\n• dichVuKhoNguyenLieu.js\n• dichVuKhachHang.js\n• dichVuDatBan.js\n• dichVuBaoCao.js\n• dinhDangDuLieu.js", (235, 250, 240), (20, 140, 70), 510, 70, 210, 420),
        ("QUẢN LÝ TRẠNG THÁI (CONTEXT)", "src/context/\n• NguoiDungContext.jsx\n  - Lưu thông tin user\n  - Quản lý phiên token JWT\n  - Đăng xuất tự động\n• SocketRealtimeContext.jsx\n  - Lắng nghe order:new\n  - Lắng nghe table:updated\n  - Bật chuông reo KDS\n• ThongBaoContext.jsx\n  - Toast thông báo kết quả", (255, 245, 220), (210, 110, 10), 745, 70, 200, 420),
    ]

    for title, desc, bg, border, x, y, bw, bh in cols:
        draw.rounded_rectangle([x, y, x+bw, y+bh], radius=10, fill=bg, outline=border, width=2)
        draw.text((x + bw//2, y + 25), title, fill=border, font=font_small_bold, anchor="mm")
        draw.text((x + 15, y + 55), desc, fill=(50, 50, 60), font=font_small)

    img.save('generated_diagrams/frontend_structure.png')
    print("Generated frontend_structure.png")

# 5. ERD Diagram (Hinh 2.5)
def gen_erd():
    w, h = 980, 550
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((w//2, 22), "SƠ ĐỒ THỰC THỂ QUAN HỆ (ERD) 12 COLLECTIONS CƠ SỞ DỮ LIỆU MONGODB", fill=(20, 30, 60), font=font_title, anchor="mm")

    tables = [
        ("NguoiDung", ["id (PK)", "name, email", "password (hash)", "role (admin/pos/bep)"], 40, 60, 160, 100, (230, 240, 255), (30, 100, 220)),
        ("LoaiMon", ["id (PK)", "ma_loai", "ten_loai", "mo_ta"], 230, 60, 150, 100, (245, 235, 255), (120, 50, 190)),
        ("MonAn", ["id (PK)", "loai_mon_id (FK)", "ten_mon, gia", "hinh_anh, trang_thai"], 410, 60, 160, 100, (245, 235, 255), (120, 50, 190)),
        ("MonAnNguyenLieu", ["id (PK)", "mon_an_id (FK)", "nguyen_lieu_id (FK)", "so_luong_can (BOM)"], 600, 60, 170, 100, (255, 245, 220), (210, 110, 10)),
        ("NguyenLieu", ["id (PK)", "ten_nguyen_lieu", "so_luong_ton, don_vi", "dinh_muc_toi_thieu"], 800, 60, 150, 100, (235, 250, 240), (20, 140, 70)),

        ("BanAn", ["id (PK)", "so_ban, suc_chua", "trang_thai (trong/khach)", "khu_vuc (T1/T2/VIP)"], 40, 230, 160, 100, (230, 240, 255), (30, 100, 220)),
        ("DatMon", ["id (PK)", "ban_id (FK)", "mon_an_id (FK)", "khach_hang_id (FK)", "so_luong, don_gia, tong_tien", "trang_thai (cho/nau/phuc_vu)"], 240, 210, 200, 130, (255, 235, 235), (200, 40, 40)),
        ("HoaDon", ["id (PK)", "ma_hoa_don, ban_id (FK)", "tong_tien, giam_gia", "thuc_thu, phuong_thuc", "trang_thai (da_thanh_toan)"], 480, 210, 190, 130, (230, 255, 235), (20, 150, 80)),
        ("LoHangNhap", ["id (PK)", "ma_lo, nguyen_lieu_id", "nha_cung_cap_id (FK)", "ngay_nhap, ngay_het_han", "so_luong_nhap, don_gia"], 720, 210, 220, 130, (235, 250, 240), (20, 140, 70)),

        ("DatBanTruoc", ["id (PK)", "ban_id (FK)", "ten_khach, so_dien_thoai", "thoi_gian_hen, so_khach", "tien_coc, trang_thai"], 40, 390, 180, 110, (245, 235, 255), (120, 50, 190)),
        ("KhachHang", ["id (PK)", "ho_ten, so_dien_thoai", "diem_tich_luy, hang_the", "tong_chi_tieu"], 260, 390, 180, 110, (255, 245, 220), (210, 110, 10)),
        ("NhaCungCap", ["id (PK)", "ma_ncc, ten_ncc", "so_dien_thoai, email", "dia_chi, danh_gia_sao"], 480, 390, 180, 110, (235, 250, 240), (20, 140, 70)),
        ("BaoCaoDoanhThu", ["id (PK)", "ma_bao_cao, ngay_lap", "ca_lam_viec, tong_doanh_thu", "doanh_thu_mat, chuyen_khoan"], 700, 390, 240, 110, (230, 240, 255), (30, 100, 220)),
    ]

    for title, fields, x, y, bw, bh, bg, border in tables:
        draw.rounded_rectangle([x, y, x+bw, y+bh], radius=8, fill=bg, outline=border, width=2)
        draw.text((x + bw//2, y + 15), title, fill=border, font=font_small_bold, anchor="mm")
        draw.line([(x, y+28), (x+bw, y+28)], fill=border, width=1)
        for f_idx, field in enumerate(fields):
            draw.text((x + 8, y + 33 + f_idx*16), field, fill=(40, 40, 50), font=font_small)

    # Connections
    draw_arrow(draw, (380, 110), (410, 110)) # LoaiMon -> MonAn
    draw_arrow(draw, (570, 110), (600, 110)) # MonAn -> BOM
    draw_arrow(draw, (800, 110), (770, 110)) # NguyenLieu -> BOM
    draw_arrow(draw, (120, 230), (120, 160)) # BanAn
    draw_arrow(draw, (200, 270), (240, 270)) # BanAn -> DatMon
    draw_arrow(draw, (440, 270), (480, 270)) # DatMon -> HoaDon
    draw_arrow(draw, (800, 210), (800, 160)) # LoHangNhap -> NguyenLieu
    draw_arrow(draw, (570, 390), (750, 340)) # NhaCungCap -> LoHangNhap
    draw_arrow(draw, (120, 330), (120, 390)) # BanAn -> DatBanTruoc
    draw_arrow(draw, (350, 390), (350, 340)) # KhachHang -> DatMon

    img.save('generated_diagrams/erd_database.png')
    print("Generated erd_database.png")

gen_pos_kds()
gen_bom_inventory()
gen_project_structure()
gen_fe_structure()
gen_erd()
