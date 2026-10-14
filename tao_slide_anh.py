#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: tao_slide_anh.py
Mục đích: Tạo bài thuyết trình PowerPoint (16:9 Widescreen) TẬP TRUNG HOÀN TOÀN VÀO HÌNH ẢNH GIAO DIỆN
- Chữ tối giản (chỉ có Tiêu đề & Badge phân hệ trên đầu slide).
- Ảnh chụp giao diện và sơ đồ chiếm trọn 85 - 90% diện tích slide, sắc nét và trực quan tối đa.
Tác giả: Nhóm 5 - Nguyễn Ngọc Hà Thảo
"""

import os
import sys
import pptx
from PIL import Image
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ==================== BẢNG MÀU THIẾT KẾ ====================
COLOR_BG_DARK = RGBColor(11, 19, 43)        # #0B132B
COLOR_BG_CARD = RGBColor(22, 33, 62)        # #16213E
COLOR_BORDER = RGBColor(51, 65, 85)         # #334155
COLOR_PRIMARY = RGBColor(2, 132, 199)       # #0284C7
COLOR_ACCENT = RGBColor(245, 158, 11)       # #F59E0B
COLOR_EMERALD = RGBColor(16, 185, 129)      # #10B981
COLOR_PURPLE = RGBColor(129, 140, 248)      # #818CF8
COLOR_ORANGE = RGBColor(249, 115, 22)       # #F97316
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_TEXT_MUTED = RGBColor(148, 163, 184)

SLIDE_WIDTH_IN = 13.333
SLIDE_HEIGHT_IN = 7.5

def create_image_focused_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(SLIDE_WIDTH_IN)
    prs.slide_height = Inches(SLIDE_HEIGHT_IN)
    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(SLIDE_WIDTH_IN), Inches(SLIDE_HEIGHT_IN))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG_DARK
        bg.line.fill.background()
        return bg

    def add_top_bar(slide, badge_text, title_text, badge_color=COLOR_PRIMARY, slide_num=None, total_slides=15):
        # 1. Badge Pill
        badge_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(2.6), Inches(0.35))
        badge_box.fill.solid()
        badge_box.fill.fore_color.rgb = badge_color
        badge_box.line.fill.background()
        tf_b = badge_box.text_frame
        tf_b.word_wrap = True
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_b = tf_b.paragraphs[0]
        p_b.text = badge_text.upper()
        p_b.font.size = Pt(9.5)
        p_b.font.bold = True
        p_b.font.color.rgb = COLOR_WHITE
        p_b.alignment = PP_ALIGN.CENTER

        # 2. Main Title Text
        title_box = slide.shapes.add_textbox(Inches(3.6), Inches(0.32), Inches(7.5), Inches(0.45))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE

        # 3. Slide Counter on Top Right
        if slide_num:
            counter_box = slide.shapes.add_textbox(Inches(11.3), Inches(0.35), Inches(1.2), Inches(0.35))
            tfc = counter_box.text_frame
            tfc.margin_left = tfc.margin_top = tfc.margin_right = tfc.margin_bottom = 0
            pc = tfc.paragraphs[0]
            pc.text = f"{slide_num}/{total_slides}"
            pc.font.size = Pt(11)
            pc.font.bold = True
            pc.font.color.rgb = COLOR_TEXT_MUTED
            pc.alignment = PP_ALIGN.RIGHT

    def add_fullscreen_image(slide, image_path, border_color=COLOR_PRIMARY):
        if not os.path.exists(image_path):
            print(f"Lỗi: Không tìm thấy ảnh {image_path}")
            return

        with Image.open(image_path) as img:
            img_w, img_h = img.size

        aspect = img_w / img_h

        # Vùng chứa ảnh tối đa
        max_w = 11.9
        max_h = 5.95
        top_offset = 0.95

        # Tính toán kích thước vừa vặn nhất
        if aspect >= (max_w / max_h):
            w = max_w
            h = w / aspect
        else:
            h = max_h
            w = h * aspect

        left = (SLIDE_WIDTH_IN - w) / 2
        top = top_offset + (max_h - h) / 2

        # Khung viền tinh tế
        card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(left - 0.06), Inches(top - 0.06),
            Inches(w + 0.12), Inches(h + 0.12)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_CARD
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        # Chèn ảnh chính
        slide.shapes.add_picture(image_path, Inches(left), Inches(top), width=Inches(w), height=Inches(h))

    # ==================== SLIDE 1: TRANG BÌA ====================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    top_bar1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(SLIDE_WIDTH_IN), Inches(0.15))
    top_bar1.fill.solid()
    top_bar1.fill.fore_color.rgb = COLOR_ACCENT
    top_bar1.line.fill.background()

    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.3), Inches(5.1))
    card1.fill.solid()
    card1.fill.fore_color.rgb = COLOR_BG_CARD
    card1.line.color.rgb = COLOR_PRIMARY
    card1.line.width = Pt(2.0)

    tb1 = s1.shapes.add_textbox(Inches(2.0), Inches(1.8), Inches(9.3), Inches(3.8))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "★ BÁO CÁO ĐỒ ÁN CHUYÊN ĐỀ HỆ THỐNG QUẢN LÝ NHÀ HÀNG ★"
    p0.font.size = Pt(12.5)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_ACCENT
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf1.add_paragraph()
    p1.text = "HỆ THỐNG QUẢN LÝ NHÀ HÀNG & MÓN ĂN\n(ROYAL BISTRO POS & KDS)"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_before = Pt(12)

    p2 = tf1.add_paragraph()
    p2.text = "BỘ HÌNH ẢNH MINH HỌA CÁC VAI TRÒ & PHÂN HỆ CHỨC NĂNG CỐT LÕI"
    p2.font.size = Pt(15)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_PRIMARY
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(12)

    p3 = tf1.add_paragraph()
    p3.text = "Thực hiện: NHÓM 5  |  Trưởng nhóm: NGUYỄN NGỌC HÀ THẢO\nCông nghệ: React 19 • Node.js Express • MongoDB / MySQL • Socket.io Realtime"
    p3.font.size = Pt(11.5)
    p3.font.color.rgb = COLOR_TEXT_MUTED
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(24)

    # Danh sách các Slide hình ảnh (Chỉ gồm Badge, Title, Ảnh, Màu)
    image_slides_config = [
        # (Slide Num, Badge, Title, Image Path, Color)
        (2, "Kiến Trúc Hệ Thống", "Mô Hình Phân Tầng Fullstack Monorepo (Node.js + React 19)", "generated_diagrams/project_structure_monorepo.png", COLOR_PRIMARY),
        (3, "Bảo Mật & Phân Quyền", "Màn Hình Đăng Nhập & Chuyển Nhanh 3 Vai Trò (Admin, Thu Ngân, Bếp)", "docs/screenshots/01_login.png", COLOR_ACCENT),
        (4, "Quy Trình Hệ Thống", "Sơ Đồ Luồng Đăng Nhập & Kiểm Soát Truy Cập Phân Quyền (RBAC)", "generated_diagrams/flowchart_login.png", COLOR_ACCENT),
        (5, "Vai Trò: Quản Trị Viên", "Dashboard Giám Sát KPI, Doanh Thu, Top Món Ăn & Nhật Ký Hoạt Động", "docs/screenshots/02_dashboard.png", COLOR_PURPLE),
        (6, "Vai Trò: Phục Vụ / Thu Ngân", "Sơ Đồ Mặt Bằng Bàn Ăn, Đèn Báo Trạng Thái & Xuất Mã QR Từng Bàn", "docs/screenshots/03_tables.png", COLOR_EMERALD),
        (7, "Vai Trò: Thu Ngân", "Điểm Bán Hàng POS: Lên Đơn Nhanh, Ghi Chú Món & In Hóa Đơn Nhiệt 80mm", "docs/screenshots/04_pos_order.png", COLOR_EMERALD),
        (8, "Vai Trò: Đầu Bếp", "Màn Hình Điều Phối Bếp KDS Realtime Tự Động Nhận Đơn Qua Socket.io", "docs/screenshots/05_kitchen_kds.png", COLOR_ORANGE),
        (9, "Quy Trình Realtime", "Sơ Đồ Luồng Đồng Bộ Đơn Hàng Tức Thì Giữa POS Thu Ngân & Bếp KDS", "generated_diagrams/flowchart_pos_kds.png", COLOR_ORANGE),
        (10, "Vai Trò: Quản Trị & Bếp", "Quản Trị Thực Đơn, Định Giá Niêm Yết & Bật/Tắt Trạng Thái Còn/Hết Món", "docs/screenshots/06_dishes.png", COLOR_PRIMARY),
        (11, "Nghiệp Vụ Định Lượng", "Sơ Đồ Tự Động Trừ Tồn Kho Nguyên Liệu Khi Bếp Nấu Xong (BOM)", "generated_diagrams/flowchart_bom_inventory.png", COLOR_ORANGE),
        (12, "Cơ Sở Dữ Liệu", "Lược Đồ Quan Hệ Thực Thể 12 Bảng Cơ Sở Dữ Liệu Chuẩn Hóa 3NF (ERD)", "generated_diagrams/erd_database.png", COLOR_EMERALD),
        (13, "Cấu Trúc Frontend", "Sơ Đồ Cấu Trúc Các Thành Phần Giao Diện Component (React 19)", "generated_diagrams/frontend_structure.png", COLOR_PRIMARY),
    ]

    for s_num, badge, title, img_path, color in image_slides_config:
        s = prs.slides.add_slide(blank_layout)
        set_slide_background(s)
        add_top_bar(s, badge, title, badge_color=color, slide_num=s_num, total_slides=15)
        add_fullscreen_image(s, img_path, border_color=color)

    # ==================== SLIDE 14: VAI TRÒ KHÁCH HÀNG (MÃ QR & QUY TRÌNH) ====================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14)
    add_top_bar(s14, "Vai Trò: Khách Hàng", "Khách Quét Mã QR Tại Bàn Để Tự Động Nhận Diện Bàn & Gọi Món E-Menu", badge_color=COLOR_PRIMARY, slide_num=14, total_slides=15)

    # Bên trái: Mã QR Bàn Ăn lớn
    card_qr = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.2), Inches(5.2), Inches(5.6))
    card_qr.fill.solid()
    card_qr.fill.fore_color.rgb = COLOR_BG_CARD
    card_qr.line.color.rgb = COLOR_ACCENT
    card_qr.line.width = Pt(1.5)

    qr_path = "docs/screenshots/ma_qr.jpg"
    if os.path.exists(qr_path):
        s14.shapes.add_picture(qr_path, Inches(2.05), Inches(1.55), width=Inches(3.5), height=Inches(3.5))

    tb_qr = s14.shapes.add_textbox(Inches(1.5), Inches(5.3), Inches(4.6), Inches(1.2))
    tf_qr = tb_qr.text_frame
    tf_qr.word_wrap = True
    p_q1 = tf_qr.paragraphs[0]
    p_q1.text = "MÃ QR GỌI MÓN BÀN ĂN (E-MENU)"
    p_q1.font.size = Pt(13)
    p_q1.font.bold = True
    p_q1.font.color.rgb = COLOR_ACCENT
    p_q1.alignment = PP_ALIGN.CENTER
    p_q2 = tf_qr.add_paragraph()
    p_q2.text = "Quét bằng Camera Zalo / iOS / Android\nTruy cập trực tiếp: http://127.0.0.1:5000/?table=1"
    p_q2.font.size = Pt(10)
    p_q2.font.color.rgb = COLOR_TEXT_MUTED
    p_q2.alignment = PP_ALIGN.CENTER

    # Bên phải: Kiến trúc kết nối không chạm
    arch_path = "docs/screenshots/arch_diagram.png"
    if os.path.exists(arch_path):
        card_arch = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.2), Inches(5.3), Inches(5.6))
        card_arch.fill.solid()
        card_arch.fill.fore_color.rgb = COLOR_BG_CARD
        card_arch.line.color.rgb = COLOR_PRIMARY
        card_arch.line.width = Pt(1.5)
        s14.shapes.add_picture(arch_path, Inches(7.0), Inches(1.7), width=Inches(4.9))

        tb_ar = s14.shapes.add_textbox(Inches(7.0), Inches(5.3), Inches(4.9), Inches(1.2))
        tf_ar = tb_ar.text_frame
        tf_ar.word_wrap = True
        p_a1 = tf_ar.paragraphs[0]
        p_a1.text = "MÔ HÌNH KẾT NỐI KHÔNG CHẠM"
        p_a1.font.size = Pt(13)
        p_a1.font.bold = True
        p_a1.font.color.rgb = COLOR_PRIMARY
        p_a1.alignment = PP_ALIGN.CENTER
        p_a2 = tf_ar.add_paragraph()
        p_a2.text = "Đơn gọi món từ điện thoại gửi thẳng vào Bếp KDS & POS"
        p_a2.font.size = Pt(10)
        p_a2.font.color.rgb = COLOR_TEXT_MUTED
        p_a2.alignment = PP_ALIGN.CENTER

    # ==================== SLIDE 15: KẾT THÚC ====================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background(s15)

    top_bar15 = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(SLIDE_WIDTH_IN), Inches(0.15))
    top_bar15.fill.solid()
    top_bar15.fill.fore_color.rgb = COLOR_EMERALD
    top_bar15.line.fill.background()

    card15 = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.3), Inches(5.1))
    card15.fill.solid()
    card15.fill.fore_color.rgb = COLOR_BG_CARD
    card15.line.color.rgb = COLOR_PRIMARY
    card15.line.width = Pt(2.0)

    tb15 = s15.shapes.add_textbox(Inches(2.0), Inches(2.0), Inches(9.3), Inches(3.5))
    tf15 = tb15.text_frame
    tf15.word_wrap = True

    p_ty = tf15.paragraphs[0]
    p_ty.text = "CẢM ƠN THẦY CÔ & HỘI ĐỒNG ĐÃ THEO DÕI!"
    p_ty.font.size = Pt(28)
    p_ty.font.bold = True
    p_ty.font.color.rgb = COLOR_ACCENT
    p_ty.alignment = PP_ALIGN.CENTER

    p_qa = tf15.add_paragraph()
    p_qa.text = "HỎI & ĐÁP (Q & A)"
    p_qa.font.size = Pt(20)
    p_qa.font.bold = True
    p_qa.font.color.rgb = COLOR_WHITE
    p_qa.alignment = PP_ALIGN.CENTER
    p_qa.space_before = Pt(12)

    p_c = tf15.add_paragraph()
    p_c.text = "Hệ thống Quản lý Nhà hàng & Món ăn (Royal Bistro POS)\nNhóm thực hiện: Nhóm 5 — Trưởng nhóm: Nguyễn Ngọc Hà Thảo"
    p_c.font.size = Pt(12)
    p_c.font.color.rgb = COLOR_TEXT_MUTED
    p_c.alignment = PP_ALIGN.CENTER
    p_c.space_before = Pt(20)

    output_filename = "BaoCao_TongQuan_AnhGiaoDien.pptx"
    prs.save(output_filename)
    print(f"Đã tạo thành công bài thuyết trình tập trung vào ảnh: {output_filename}")
    return output_filename

if __name__ == "__main__":
    create_image_focused_deck()
