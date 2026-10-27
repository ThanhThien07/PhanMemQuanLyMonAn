import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

DOC_PATH = 'docs/bao_cao/501250384_NguyenHoangHung_CDFrontEnd.docx'
BACKUP_PATH = 'docs/bao_cao/501250384_NguyenHoangHung_CDFrontEnd_Backup.docx'
SCREENSHOTS_DIR = 'docs/assets/screenshots_clean'

# Color constants
COLOR_PRIMARY_HEX = "1E3A8A"     # Royal Blue
COLOR_BG_HEADER_HEX = "F1F5F9"   # Slate 100
COLOR_TEXT_MUTED_HEX = "475569"  # Slate 600
COLOR_BORDER_HEX = "CBD5E1"      # Slate 300

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_h1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    return p

def add_h2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(13.5)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    return p

def add_h3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def add_body_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.3
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix:
        rb = p.add_run(bold_prefix)
        rb.font.name = "Times New Roman"
        rb.font.size = Pt(12)
        rb.font.bold = True
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = italic
    return p

def add_bullet_p(doc, bold_title, content):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.25)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.3
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    rb = p.add_run(f"• {bold_title}: ")
    rb.font.name = "Times New Roman"
    rb.font.size = Pt(12)
    rb.font.bold = True
    r = p.add_run(content)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p

def add_image_with_caption(doc, img_name, caption_text, width_in=5.8):
    img_path = os.path.join(SCREENSHOTS_DIR, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(2)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_in))

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(10)
        p_cap.paragraph_format.keep_with_next = False
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = "Times New Roman"
        r_cap.font.size = Pt(11)
        r_cap.font.italic = True
        r_cap.font.bold = True
        r_cap.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    else:
        print(f"Warning: image not found at {img_path}")

def add_custom_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], COLOR_BG_HEADER_HEX)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(11)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Data Rows
    for r_idx, row in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "FFFFFF" if r_idx % 2 == 0 else "F8FAFC"
        for c_idx, val in enumerate(row):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=90, bottom=90, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.2
            if len(p.runs) > 0:
                p.runs[0].font.name = "Times New Roman"
                p.runs[0].font.size = Pt(11)
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Column Widths
    if col_widths:
        for r in table.rows:
            for c_idx, w in enumerate(col_widths):
                r.cells[c_idx].width = Inches(w)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_after = Pt(6)

def main():
    if not os.path.exists(BACKUP_PATH):
        print(f"Creating backup of original docx at: {BACKUP_PATH}")
        with open(DOC_PATH, 'rb') as f_src, open(BACKUP_PATH, 'wb') as f_dst:
            f_dst.write(f_src.read())

    print("Opening source backup to preserve exact cover page...")
    doc = Document(BACKUP_PATH)

    # 1. Update Cover Page (Section 0, P0 to P34)
    print("Updating cover page text...")
    p10 = doc.paragraphs[10]
    p10.text = "ĐỒ ÁN MÔN HỌC: CHUYÊN ĐỀ FRONT-END"
    p10.runs[0].font.name = "Times New Roman"
    p10.runs[0].font.size = Pt(16)
    p10.runs[0].font.bold = True
    p10.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p11 = doc.paragraphs[11]
    p11.text = "ĐỀ TÀI: XÂY DỰNG GIAO DIỆN PHẦN MỀM QUẢN LÝ NHÀ HÀNG & GỌI MÓN (ROYAL BISTRO)"
    p11.runs[0].font.name = "Times New Roman"
    p11.runs[0].font.size = Pt(15.5)
    p11.runs[0].font.bold = True
    p11.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p29 = doc.paragraphs[29]
    p29.text = ""
    r1 = p29.add_run("Giáo viên hướng dẫn : ")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(13)
    r2 = p29.add_run("ThS. Hà Mĩ Trinh – ThS. Nguyễn Minh Hải")
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(13)
    r2.font.bold = True

    p30 = doc.paragraphs[30]
    p30.text = ""
    r1 = p30.add_run("Sinh viên thực hiện : ")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(13)
    r2 = p30.add_run("Nguyễn Hoàng Hưng – MSSV: 501250384")
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(13)
    r2.font.bold = True

    p31 = doc.paragraphs[31]
    p31.text = ""
    r1 = p31.add_run("Khoá                     : ")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(13)
    r2 = p31.add_run("K25 – Công nghệ Phần mềm")
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(13)
    r2.font.bold = True

    p34 = doc.paragraphs[34]
    p34.text = "TP. Hồ Chí Minh, năm 2026"
    p34.runs[0].font.name = "Times New Roman"
    p34.runs[0].font.size = Pt(13)
    p34.runs[0].font.bold = True
    p34.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Clean header/footer references from Cover Page (Section 0)
    p34_sectPr = p34._p.pPr.sectPr
    for tag in ['headerReference', 'footerReference']:
        for elem in p34_sectPr.findall(f'{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}{tag}'):
            p34_sectPr.remove(elem)

    # 2. Clear old body elements after p34, KEEPING the body final sectPr
    body = doc.element.body
    p34_elem = doc.paragraphs[34]._p
    found = False
    to_remove = []
    for child in list(body):
        if found:
            if child.tag.endswith('sectPr') and child == body[-1]:
                continue
            to_remove.append(child)
        elif child == p34_elem:
            found = True

    print(f"Removing {len(to_remove)} legacy elements...")
    for el in to_remove:
        body.remove(el)

    # 3. Setup SECTION 1: Lời mở đầu & Lời cảm ơn (KHÔNG ĐÁNH SỐ TRANG)
    print("Setting up Section 1: Lời mở đầu & Lời cảm ơn (No page number)...")
    sec1 = doc.sections[1]
    sec1.header.is_linked_to_previous = False
    sec1.footer.is_linked_to_previous = False
    for p in sec1.header.paragraphs:
        p.text = ""
    for p in sec1.footer.paragraphs:
        p.text = ""

    # Clean legacy footer reference from sec1 if any
    for tag in ['footerReference', 'headerReference']:
        for elem in sec1._sectPr.findall(f'{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}{tag}'):
            sec1._sectPr.remove(elem)

    # --- LỜI MỞ ĐẦU ---
    p_title = doc.add_paragraph("LỜI MỞ ĐẦU")
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(20)
    p_title.paragraph_format.space_after = Pt(14)
    r_t = p_title.runs[0]
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(16)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    add_body_p(doc, "Trong thời đại công nghệ số hiện nay, ngành dịch vụ ăn uống và nhà hàng (F&B - Food & Beverage) đang chuyển mình mạnh mẽ từ phương thức vận hành truyền thống sang mô hình quản lý hiện đại hóa. Các nhà hàng truyền thống với quy trình ghi món bằng giấy, di chuyển thủ công giữa các bàn ăn và nhà bếp, thanh toán qua sổ sách đang bộc lộ nhiều điểm nghẽn: thời gian chờ đợi kéo dài trong giờ cao điểm, nguy cơ nhầm lẫn khẩu vị món ăn của thực khách, và sự thiếu kết nối đồng bộ giữa các bộ phận phục vụ, thu ngân và bếp trưởng.")
    add_body_p(doc, "Xuất phát từ yêu cầu thực tiễn đó, đồ án môn học \"Chuyên Đề Front-End\" được thực hiện với đề tài: \"Xây dựng giao diện phần mềm Quản lý Nhà hàng & Gọi món (Royal Bistro)\". Phân hệ Front-End đóng vai trò là giao diện tương tác trực tiếp với người dùng, kết nối toàn bộ hoạt động từ khách hàng quét mã QR tại bàn, nhân viên phục vụ ghi món bằng máy POS, đầu bếp điều phối chế biến trên màn hình KDS (Kitchen Display System), cho đến thu ngân xuất hóa đơn VietQR động.")
    add_body_p(doc, "Hệ thống giao diện được xây dựng trên nền tảng ứng dụng trang đơn SPA (Single Page Application) sử dụng React 19, Vite 6, Tailwind CSS v4, thư viện truyền thông thời gian thực Socket.io Client và các biểu tượng Lucide Icons. Giao diện tuân thủ chặt chẽ hệ thống thiết kế tách nền 3 tầng (Layered Depth), phong cách bo góc viên thuốc hiện đại và phông chữ có chân sang trọng chuẩn phong cách nhà hàng ẩm thực cao cấp.")
    add_body_p(doc, "Báo cáo chuyên đề Front-End được cấu trúc gồm 5 chương chính như sau:")
    add_bullet_p(doc, "Chương 1. Giới thiệu tổng quan đề tài Front-End", "Trình bày bối cảnh bài toán, mục tiêu thiết kế giao diện, phạm vi ứng dụng và ngăn xếp công nghệ được lựa chọn.")
    add_bullet_p(doc, "Chương 2. Thiết kế kiến trúc & giao diện hệ thống", "Mô tả cấu trúc thư mục mã nguồn FE/src, quy chuẩn thiết kế UI/UX 3 tầng và cơ chế truyền thông thời gian thực qua WebSocket.")
    add_bullet_p(doc, "Chương 3. Hiện thực hóa các chức năng giao diện trên Web", "Trình bày chi tiết giao diện và chức năng thực tế của từng phân hệ: Đăng nhập phân quyền, Dashboard tổng quan, Sơ đồ bàn ăn, POS bán hàng, Bếp KDS, Gọi món QR di động, Quản lý thực đơn và Thanh toán VietQR.")
    add_bullet_p(doc, "Chương 4. Tối ưu hiệu năng & trải nghiệm người dùng", "Trình bày các giải pháp thiết kế Responsive đa thiết bị, tối ưu hóa chỉ số Core Web Vitals, chống giật layout và các hiệu ứng tương tác trực quan.")
    add_bullet_p(doc, "Chương 5. Kết luận và hướng phát triển", "Đánh giá các kết quả đạt được, chỉ ra những điểm còn hạn chế và đề xuất phương hướng nâng cấp hệ thống trong tương lai.")

    add_body_p(doc, "Dù đã dành nhiều tâm huyết và nỗ lực hoàn thiện giao diện, nhưng do thời gian và kinh nghiệm còn hạn chế nên báo cáo khó tránh khỏi những thiếu sót. Em rất mong nhận được những lời nhận xét, góp ý quý báu của quý Thầy Cô để đồ án ngày càng hoàn thiện hơn.")

    # --- LỜI CẢM ƠN (Page break trong Section 1) ---
    doc.add_page_break()
    p_ty = doc.add_paragraph("LỜI CẢM ƠN")
    p_ty.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ty.paragraph_format.space_before = Pt(20)
    p_ty.paragraph_format.space_after = Pt(14)
    r_ty = p_ty.runs[0]
    r_ty.font.name = "Times New Roman"
    r_ty.font.size = Pt(16)
    r_ty.font.bold = True
    r_ty.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    add_body_p(doc, "Để hoàn thành đồ án môn học Chuyên Đề Front-End này, em đã nhận được sự quan tâm, chỉ bảo tận tình từ quý Thầy Cô cùng sự động viên, hỗ trợ quý báu từ gia đình và bạn bè.")
    add_body_p(doc, "Trước hết, em xin bày tỏ lòng biết ơn chân thành và sâu sắc nhất đến quý Thầy Cô hướng dẫn: ThS. Hà Mĩ Trinh và ThS. Nguyễn Minh Hải. Thầy Cô đã luôn nhiệt tình định hướng cấu trúc đề tài, chỉ dẫn các giải pháp kỹ thuật công nghệ mới, đồng thời đóng góp những ý kiến phản biện chuyên môn thiết thực về trải nghiệm người dùng (UX), tối ưu hóa luồng giao diện và quy chuẩn kiểm thử giao diện Front-End.")
    add_body_p(doc, "Em cũng xin trân trọng cảm ơn toàn thể quý Thầy Cô Khoa Công nghệ Thông tin – Điện tử, Trường Cao đẳng Công nghệ Thông tin TP. Hồ Chí Minh đã tận tâm truyền đạt những kiến thức nền tảng vững chắc về phát triển ứng dụng Web, tư duy lập trình và quản lý dự án phần mềm trong suốt quá trình học tập tại trường.")
    add_body_p(doc, "Cuối cùng, em xin gửi lời cảm ơn đến các bạn sinh viên trong Nhóm 05 cùng toàn thể các bạn sinh viên lớp K25 đã luôn đồng hành, chia sẻ kinh nghiệm xử lý lỗi giao diện và phối hợp nhịp nhàng trong suốt quá trình phát triển đề tài.")
    add_body_p(doc, "Kính chúc quý Thầy Cô luôn dồi dào sức khỏe, niềm vui và gặt hái thêm nhiều thành công trong sự nghiệp giảng dạy!")

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig.paragraph_format.space_before = Pt(20)
    r_sig1 = p_sig.add_run("Sinh viên thực hiện:\n")
    r_sig1.font.name = "Times New Roman"
    r_sig1.font.size = Pt(12)
    r_sig1.font.italic = True
    r_sig2 = p_sig.add_run("Nguyễn Hoàng Hưng – MSSV: 501250384")
    r_sig2.font.name = "Times New Roman"
    r_sig2.font.size = Pt(12)
    r_sig2.font.bold = True

    # 4. Add SECTION 2: BẮT ĐẦU ĐÁNH SỐ TRANG TỪ ĐÂY (TRANG 1)
    print("Adding Section 2: Page numbering starts at 1 from MỤC LỤC...")
    sec2 = doc.add_section()
    sec2.header.is_linked_to_previous = False
    sec2.footer.is_linked_to_previous = False

    # Setup centered page number in footer of Section 2
    footer2 = sec2.footer
    fp = footer2.paragraphs[0]
    fp.text = ""
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    frun = fp.add_run()
    frun.font.name = "Times New Roman"
    frun.font.size = Pt(11)
    frun.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    fld = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    frun._r.append(fld)

    # Force page number to start at 1 in Section 2
    pgNumType = parse_xml(r'<w:pgNumType %s w:start="1"/>' % nsdecls('w'))
    sec2._sectPr.append(pgNumType)

    # --- MỤC LỤC (Trang 1) ---
    p_toc = doc.add_paragraph("MỤC LỤC")
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc.paragraph_format.space_before = Pt(16)
    p_toc.paragraph_format.space_after = Pt(14)
    r_toc = p_toc.runs[0]
    r_toc.font.name = "Times New Roman"
    r_toc.font.size = Pt(16)
    r_toc.font.bold = True
    r_toc.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    toc_items = [
        ("MỤC LỤC", "1"),
        ("DANH MỤC HÌNH ẢNH & BẢNG BIỂU", "2"),
        ("CHƯƠNG 1. GIỚI THIỆU TỔNG QUAN ĐỀ TÀI FRONT-END", "3"),
        ("  1.1. Tổng quan về đề tài", "3"),
        ("  1.2. Mục tiêu và phạm vi xây dựng giao diện", "3"),
        ("  1.3. Ngăn xếp công nghệ Front-End (Tech Stack)", "4"),
        ("CHƯƠNG 2. THIẾT KẾ KIẾN TRÚC & GIAO DIỆN HỆ THỐNG", "6"),
        ("  2.1. Cấu trúc tổ chức mã nguồn Front-End (FE/src)", "6"),
        ("  2.2. Hệ thống thiết kế UI/UX (Design System) 3 tầng", "7"),
        ("  2.3. Cơ chế giao tiếp thời gian thực Socket.io Real-time", "8"),
        ("CHƯƠNG 3. HIỆN THỰC HÓA CÁC CHỨC NĂNG GIAO DIỆN TRÊN WEB", "9"),
        ("  3.1. Giao diện Đăng nhập & Chọn nhanh vai trò", "9"),
        ("  3.2. Bảng điều khiển Quản trị tổng quan (Admin Dashboard)", "10"),
        ("  3.3. Sơ đồ Quản lý Bàn ăn theo khu vực thời gian thực", "11"),
        ("  3.4. Giao diện Bán hàng POS gọi món tại bàn", "12"),
        ("  3.5. Màn hình Điều phối Bếp KDS (Kitchen Display System)", "13"),
        ("  3.6. Giao diện Khách hàng quét mã QR gọi món trên di động", "14"),
        ("  3.7. Màn hình Quản lý Thực đơn & Món ăn", "15"),
        ("  3.8. Giao diện Thanh toán hóa đơn & Mã VietQR động", "16"),
        ("CHƯƠNG 4. TỐI ƯU HIỆU NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG", "17"),
        ("  4.1. Thiết kế giao diện thích ứng đa thiết bị (Responsive Design)", "17"),
        ("  4.2. Tối ưu hóa tải trang và chống giật layout (Core Web Vitals)", "18"),
        ("  4.3. Nâng cao trải nghiệm người dùng với âm thanh và hiệu ứng", "19"),
        ("CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "20"),
        ("  5.1. Kết quả đạt được của phân hệ Front-End", "20"),
        ("  5.2. Các hạn chế còn tồn tại", "20"),
        ("  5.3. Hướng phát triển trong tương lai", "21"),
        ("TÀI LIỆU THAM KHẢO", "22")
    ]

    for title, page in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        is_heading = title.startswith("CHƯƠNG") or title in ["MỤC LỤC", "DANH MỤC HÌNH ẢNH & BẢNG BIỂU", "TÀI LIỆU THAM KHẢO"]
        
        r_title = p.add_run(title)
        r_title.font.name = "Times New Roman"
        r_title.font.size = Pt(11.5)
        r_title.font.bold = is_heading
        
        dots_count = max(5, 75 - len(title) * 1)
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = "Times New Roman"
        r_dots.font.size = Pt(10)
        r_dots.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        
        r_page = p.add_run(page)
        r_page.font.name = "Times New Roman"
        r_page.font.size = Pt(11.5)
        r_page.font.bold = is_heading

    # --- DANH MỤC HÌNH ẢNH & BẢNG BIỂU (Page break) ---
    doc.add_page_break()
    p_list = doc.add_paragraph("DANH MỤC HÌNH ẢNH & BẢNG BIỂU")
    p_list.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_list.paragraph_format.space_before = Pt(16)
    p_list.paragraph_format.space_after = Pt(14)
    r_list = p_list.runs[0]
    r_list.font.name = "Times New Roman"
    r_list.font.size = Pt(16)
    r_list.font.bold = True
    r_list.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    add_h2(doc, "1. Danh mục Hình ảnh")
    figures = [
        ("Hình 3.1. Giao diện Đăng nhập hệ thống theo vai trò và đăng nhập nhanh", "9"),
        ("Hình 3.2. Bảng điều khiển Quản trị tổng quan (Admin Dashboard)", "10"),
        ("Hình 3.3. Sơ đồ bàn ăn hiển thị trạng thái động theo khu vực", "11"),
        ("Hình 3.4. Màn hình Bán hàng POS gọi món cảm ứng và giỏ hàng tại bàn", "12"),
        ("Hình 3.5. Màn hình Điều phối Bếp KDS (Kitchen Display System) Real-time", "13"),
        ("Hình 3.6. Giao diện Khách hàng quét mã QR gọi món trên thiết bị di động", "14"),
        ("Hình 3.7. Giao diện Quản lý Thực đơn, phân loại danh mục và giá bán", "15"),
        ("Hình 3.8. Giao diện Thanh toán hóa đơn và hiển thị mã VietQR động", "16")
    ]
    for fig_title, fig_p in figures:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        r_t = p.add_run(fig_title)
        r_t.font.name = "Times New Roman"
        r_t.font.size = Pt(11)
        dots = max(5, 78 - len(fig_title))
        r_d = p.add_run(" " + "." * dots + " ")
        r_d.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        r_p = p.add_run(fig_p)
        r_p.font.name = "Times New Roman"
        r_p.font.size = Pt(11)
        r_p.font.bold = True

    add_h2(doc, "2. Danh mục Bảng biểu")
    tables_list = [
        ("Bảng 1.1. Ngăn xếp công nghệ sử dụng trong phân hệ Front-End", "5"),
        ("Bảng 2.1. Cấu trúc tổ chức thư mục mã nguồn Front-End (FE/src)", "6"),
        ("Bảng 2.2. Quy chuẩn thiết kế tách nền 3 tầng (Layered Depth System)", "7"),
        ("Bảng 3.1. Bảng tổng hợp các phân hệ và tính năng giao diện đã hoàn thiện", "16")
    ]
    for tab_title, tab_p in tables_list:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        r_t = p.add_run(tab_title)
        r_t.font.name = "Times New Roman"
        r_t.font.size = Pt(11)
        dots = max(5, 78 - len(tab_title))
        r_d = p.add_run(" " + "." * dots + " ")
        r_d.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        r_p = p.add_run(tab_p)
        r_p.font.name = "Times New Roman"
        r_p.font.size = Pt(11)
        r_p.font.bold = True

    # =========================================================================
    # CHƯƠNG 1. GIỚI THIỆU TỔNG QUAN ĐỀ TÀI FRONT-END
    # =========================================================================
    doc.add_page_break()
    add_h1(doc, "CHƯƠNG 1. GIỚI THIỆU TỔNG QUAN ĐỀ TÀI FRONT-END")

    add_h2(doc, "1.1. Tổng quan về đề tài")
    add_body_p(doc, "Ngành dịch vụ ẩm thực (F&B) đòi hỏi tốc độ phục vụ nhanh, độ chính xác cao trong tiếp nhận yêu cầu khẩu vị của thực khách và sự phối hợp nhịp nhàng giữa quầy thu ngân, nhân viên chạy bàn và khu vực nhà bếp. Tuy nhiên, quy trình phục vụ truyền thống hiện vẫn gặp phải những bất cập lớn:")
    add_bullet_p(doc, "Tắc nghẽn trong giờ cao điểm", "Khách hàng phải chờ đợi lâu để gọi nhân viên phục vụ, dẫn đến trải nghiệm ẩm thực bị giảm sút.")
    add_bullet_p(doc, "Sai sót trong ghi nhận món", "Ghi tay trên giấy dễ gây nhầm lẫn tên món, bỏ quên ghi chú khẩu vị (ít cay, không đường, ăn chay) hoặc thất lạc bill trong quá trình truyền đạt vào bếp.")
    add_bullet_p(doc, "Thiếu màn hình điều phối chung", "Nhân viên phải liên tục di chuyển giữa bàn ăn và nhà bếp để kiểm tra món, gây lãng phí công sức và khó kiểm soát trạng thái các bàn ăn.")

    add_body_p(doc, "Phần mềm Quản lý Nhà hàng & Gọi món Royal Bistro được xây dựng nhằm số hóa toàn diện quy trình trên. Trong đó, phân hệ Front-End là bộ mặt trực quan của toàn bộ hệ thống, chịu trách nhiệm cung cấp giao diện tương tác tức thì cho từng vai trò người dùng trong nhà hàng.")

    add_h2(doc, "1.2. Mục tiêu và phạm vi xây dựng giao diện")
    add_body_p(doc, "Mục tiêu trọng tâm của phân hệ Front-End bao gồm:")
    add_bullet_p(doc, "Mô hình ứng dụng trang đơn SPA", "Chuyển đổi linh hoạt giữa các màn hình chức năng mà không phải tải lại toàn bộ trang (Không reload), mang lại trải nghiệm mượt mà tương tự ứng dụng Native trên máy tính.")
    add_bullet_p(doc, "Tương thích đa thiết bị (Responsive)", "Giao diện tự động co giãn tối ưu trên máy tính để bàn (dành cho Admin, Thu ngân), máy tính bảng (dành cho phục vụ tại bàn) và màn hình điện thoại thông minh (dành cho khách hàng quét mã QR).")
    add_bullet_p(doc, "Phản hồi dữ liệu thời gian thực (Real-time)", "Mọi sự kiện gọi món mới, thay đổi trạng thái chế biến ở bếp hay thanh toán hóa đơn đều được thông báo tức thì trên giao diện qua WebSockets.")
    add_bullet_p(doc, "Phân quyền giao diện chặt chẽ (Role-Based Access Control)", "Tự động hiển thị menu và các màn hình làm việc tương ứng với 4 vai trò: Quản trị viên (Admin), Thu ngân, Phục vụ và Đầu bếp KDS.")

    add_h2(doc, "1.3. Ngăn xếp công nghệ Front-End (Tech Stack)")
    add_body_p(doc, "Hệ thống Front-End được xây dựng hoàn toàn bằng các công nghệ hiện đại nhất trong hệ sinh thái JavaScript/React:")

    tech_data = [
        ["1", "React 19", "Thư viện giao diện cốt lõi, cơ chế Virtual DOM tối ưu render, Component tái sử dụng cao."],
        ["2", "Vite 6", "Công cụ build thế hệ mới, hỗ trợ Hot Module Replacement (HMR) cực nhanh, tối ưu dung lượng gói bundle."],
        ["3", "Tailwind CSS v4", "Framework CSS utility-first, kiến trúc tách nền 3 tầng Layered Depth, tối ưu responsive đa màn hình."],
        ["4", "Socket.io Client", "Thư viện kết nối WebSocket 2 chiều, bắt sự kiện đơn gọi món và đổi trạng thái bếp thời gian thực."],
        ["5", "React Context API", "Quản lý trạng thái xác thực người dùng (Auth Context) và kết nối socket toàn cục."],
        ["6", "Axios", "Thư viện HTTP client gửi request RESTful API, tự động gắn kèm Bearer JWT Token vào Header."],
        ["7", "Lucide React", "Bộ biểu tượng vector SVG hiện đại, trọng lượng nhẹ, hiển thị sắc nét trên màn hình Retina."]
    ]
    add_custom_table(doc, ["STT", "Công nghệ", "Vai trò và Đặc tính kỹ thuật"], tech_data, [0.6, 1.8, 3.8])

    # =========================================================================
    # CHƯƠNG 2. THIẾT KẾ KIẾN TRÚC & GIAO DIỆN HỆ THỐNG
    # =========================================================================
    doc.add_page_break()
    add_h1(doc, "CHƯƠNG 2. THIẾT KẾ KIẾN TRÚC & GIAO DIỆN HỆ THỐNG")

    add_h2(doc, "2.1. Cấu trúc tổ chức mã nguồn Front-End (FE/src)")
    add_body_p(doc, "Mã nguồn Front-End được tổ chức theo kiến trúc module hóa rõ ràng, phân tách rành mạch giữa các thành phần giao diện dùng chung, các trang nghiệp vụ, tầng quản lý trạng thái và các dịch vụ kết nối mạng:")

    dir_data = [
        ["1", "components/layout/", "Chứa khung bố cục chính: BoCucGiaoDienChinh.jsx, ThanhDieuHuongTren.jsx và Sidebar cố định chống xô lệch panel."],
        ["2", "components/pages/", "Chứa các trang màn hình chức năng: DangNhapHeThong, TongQuanDashboard, QuanLySoDoBan, GoiMonTaiBanPOS, ManHinhBepKDS, KhachHangGoiMonQR, QuanLyThucDonMonAn."],
        ["3", "components/", "Chứa các component dùng chung: ModalInHoaDon.jsx, TheMonAn.jsx, BoChonDanhMuc.jsx, ThanhCuonNgang.jsx."],
        ["4", "contexts/", "Quản lý dữ liệu toàn cục qua React Context: AuthContext (lưu thông tin đăng nhập và token), SocketContext (quản lý kết nối socket)."],
        ["5", "services/", "Tầng giao tiếp API: apiDichVu.js định cấu hình Axios instance, tự động gắn token và xử lý lỗi phản hồi."],
        ["6", "utils/", "Các hàm tiện ích: dinhDangDuLieu.js (định dạng tiền tệ VND, định dạng ngày giờ chuẩn Việt Nam)."]
    ]
    add_custom_table(doc, ["STT", "Thư mục / Tệp tin", "Chức năng và Nhiệm vụ"], dir_data, [0.6, 2.0, 3.6])

    add_h2(doc, "2.2. Hệ thống thiết kế UI/UX (Design System) 3 tầng")
    add_body_p(doc, "Để giao diện đạt được tính thẩm mỹ cao, tạo cảm giác sang trọng và chuyên nghiệp chuẩn phong cách nhà hàng ẩm thực cao cấp Royal Bistro, hệ thống áp dụng triệt để Quy chuẩn Thiết kế Tách Nền 3 Tầng (Layered Depth System):")

    depth_data = [
        ["Tầng 0", "Nền Canvas tổng thể", "Mã màu #F1F5F9 (Slate 100), tạo chiều sâu dịu mắt, làm nổi bật các khối nội dung bên trên."],
        ["Tầng 1", "Khung Container Card / Panel", "Nền trắng tinh khiết (#FFFFFF), viền dày 2px (border-2 border-slate-200), bo góc lớn (rounded-3xl hoặc rounded-2xl), đổ bóng nhẹ."],
        ["Tầng 2", "Item con / Dish Card / Thẻ bàn", "Nền sáng (bg-slate-50), viền dày 2px (border-2 border-slate-200), bo tròn (rounded-2xl)."],
        ["Hiệu ứng", "Tương tác rê chuột (Hover)", "Nền chuyển sang trắng sáng, viền đổi sang màu xanh dương (hover:border-blue-500), nâng nhẹ thẻ card (hover:-translate-y-1) và đổ bóng sâu (hover:shadow-md)."]
    ]
    add_custom_table(doc, ["Tầng", "Thành phần giao diện", "Quy chuẩn thiết kế và Hiệu ứng tương tác"], depth_data, [1.0, 2.0, 3.2])

    add_body_p(doc, "Bên cạnh kiến trúc 3 tầng, hệ thống còn quy định các chuẩn mực thẩm mỹ đồng bộ:")
    add_bullet_p(doc, "Kiểu chữ (Typography)", "Toàn bộ ứng dụng sử dụng phông chữ có chân sang trọng ('Lora', 'Merriweather', serif) mang lại nét đẹp cổ điển và quý phái của phong cách bistro hoàng gia.")
    add_bullet_p(doc, "Nút bấm & Card", "Tất cả các nút hành động đều được bo tròn viên thuốc (rounded-pill), nút chính sử dụng màu xanh Royal Blue tạo sự nổi bật và nhất quán.")

    add_h2(doc, "2.3. Cơ chế giao tiếp thời gian thực Socket.io Real-time")
    add_body_p(doc, "Để đảm bảo dữ liệu luôn được cập nhật đồng bộ tức thì giữa các phân hệ mà không phải thao tác F5/tải lại trang:")
    add_bullet_p(doc, "Khi khách quét QR hoặc phục vụ gửi order", "Ứng dụng phát sự kiện WebSocket lên máy chủ. Màn hình Bếp KDS lập tức nhận sự kiện, tự động phát âm thanh chuông reo và render thẻ món mới vào danh sách cần chế biến.")
    add_bullet_p(doc, "Khi bếp trưởng bấm cập nhật trạng thái", "Sự kiện được truyền ngược lại màn hình di động của khách hàng và màn hình POS của phục vụ để người dùng biết món ăn của mình đang được nấu hay đã sẵn sàng.")

    # =========================================================================
    # CHƯƠNG 3. HIỆN THỰC HÓA CÁC CHỨC NĂNG GIAO DIỆN TRÊN WEB
    # =========================================================================
    doc.add_page_break()
    add_h1(doc, "CHƯƠNG 3. HIỆN THỰC HÓA CÁC CHỨC NĂNG GIAO DIỆN TRÊN WEB")
    add_body_p(doc, "Chương này trình bày chi tiết hình ảnh giao diện thực tế cùng các chức năng cụ thể được hiện thực hóa trong đồ án:")

    add_h2(doc, "3.1. Giao diện Đăng nhập & Chọn nhanh vai trò")
    add_body_p(doc, "Giao diện đăng nhập được thiết kế theo phong cách tối giản, hiện đại, đảm bảo tính bảo mật và thuận tiện cho việc kiểm thử:")
    add_bullet_p(doc, "Form đăng nhập chuẩn xác", "Nhập tên tài khoản, mật khẩu có nút ẩn/hiện mật khẩu trực quan.")
    add_bullet_p(doc, "Điều hướng tự động theo quyền", "Hệ thống tự động chuyển hướng người dùng đến đúng phân hệ được cấp phép (Admin chuyển đến Dashboard, Thu ngân chuyển đến Sơ đồ bàn, Đầu bếp chuyển đến Màn hình KDS).")
    add_bullet_p(doc, "Nút đăng nhập nhanh (Quick Demo Login)", "Cung cấp sẵn 4 nút chọn nhanh tài khoản tương ứng với 4 vai trò để ban giám khảo và giảng viên kiểm thử hệ thống nhanh chóng mà không cần gõ bàn phím.")
    add_image_with_caption(doc, "01_login.png", "Hình 3.1. Giao diện Đăng nhập hệ thống theo vai trò và đăng nhập nhanh")

    add_h2(doc, "3.2. Bảng điều khiển Quản trị tổng quan (Admin Dashboard)")
    add_body_p(doc, "Màn hình Dashboard đóng vai trò là trung tâm giám sát hoạt động kinh doanh của nhà hàng dành cho cấp quản lý:")
    add_bullet_p(doc, "Thẻ chỉ số hiệu năng (KPI Cards)", "Hiển thị tổng quan các số liệu trọng yếu: Doanh thu trong ngày, Tổng số hóa đơn đã xuất, Số lượng bàn đang có khách và Số lượng bàn trống.")
    add_bullet_p(doc, "Biểu đồ thống kê trực quan", "Biểu đồ cột trực quan hóa phân bổ doanh thu theo các khung giờ trong ngày, giúp người quản lý nhận biết khung giờ cao điểm để điều phối nhân sự hợp lý.")
    add_bullet_p(doc, "Chuông reo và Popup thông báo", "Tích hợp cửa sổ popup nổi bật kèm âm thanh chuông reo mỗi khi phát sinh đơn hàng mới trong nhà hàng.")
    add_image_with_caption(doc, "02_dashboard.png", "Hình 3.2. Bảng điều khiển Quản trị tổng quan (Admin Dashboard)")

    add_h2(doc, "3.3. Sơ đồ Quản lý Bàn ăn theo khu vực thời gian thực")
    add_body_p(doc, "Sơ đồ bàn ăn mô phỏng trực quan toàn bộ mặt bằng nhà hàng theo thời gian thực:")
    add_bullet_p(doc, "Phân biệt 3 trạng thái bằng màu sắc", "Màu xanh lá (Bàn trống sẵn sàng đón khách) - Màu đỏ (Bàn đang có khách ngồi dùng bữa) - Màu cam (Bàn đã được khách đặt trước).")
    add_bullet_p(doc, "Bộ lọc theo khu vực", "Cho phép chuyển đổi nhanh giữa các phân khu: Sảnh chính (Main Dining), Phòng VIP và Ban công ngoài trời.")
    add_bullet_p(doc, "Thao tác trực tiếp trên bàn", "Nhấp chuột vào từng bàn để thực hiện các thao tác: Mở bàn cho khách, chuyển sang giao diện POS gọi món hoặc xem trước hóa đơn tạm tính.")
    add_image_with_caption(doc, "04_tables.png", "Hình 3.3. Sơ đồ bàn ăn hiển thị trạng thái động theo khu vực")

    add_h2(doc, "3.4. Giao diện Bán hàng POS gọi món tại bàn")
    add_body_p(doc, "Giao diện POS bán hàng được thiết kế theo bố cục 2 cột chuyên dụng cho màn hình cảm ứng của nhân viên phục vụ:")
    add_bullet_p(doc, "Cột chọn món bên trái", "Bao gồm ô tìm kiếm món ăn nhanh chóng, thanh trượt ngang lọc theo danh mục món (Khai vị, Món chính, Món tráng miệng, Đồ uống...) và lưới các thẻ món ăn hiển thị hình ảnh rõ ràng.")
    add_bullet_p(doc, "Cột giỏ hàng bên phải", "Hiển thị danh sách các món ăn đã chọn cho bàn, nút tăng/giảm số lượng món, nút xóa món và ô nhập ghi chú khẩu vị riêng (ít cay, không hành, ăn chay...).")
    add_bullet_p(doc, "Tính tiền tự động", "Tự động cộng dồn tiền món, tính thuế giá trị gia tăng (VAT), trừ tiền giảm giá khuyến mãi và hiển thị tổng tiền tạm tính.")
    add_image_with_caption(doc, "03_pos_order.png", "Hình 3.4. Màn hình Bán hàng POS gọi món cảm ứng và giỏ hàng tại bàn")

    add_h2(doc, "3.5. Màn hình Điều phối Bếp KDS (Kitchen Display System)")
    add_body_p(doc, "Màn hình KDS thay thế hoàn toàn máy in bill giấy truyền thống tại khu vực bếp, hỗ trợ các đầu bếp phối hợp nhịp nhàng:")
    add_bullet_p(doc, "Nhận đơn tức thì kèm âm thanh", "Khi khách quét QR hoặc nhân viên POS gửi đơn, màn hình KDS lập tức reo chuông và hiển thị thẻ đơn món ăn mới theo thời gian thực.")
    add_bullet_p(doc, "Sắp xếp theo thứ tự ưu tiên", "Các món ăn khách gọi trước sẽ tự động được ưu tiên đưa lên đầu danh sách để đầu bếp chế biến đúng thứ tự.")
    add_bullet_p(doc, "Chuyển trạng thái cảm ứng", "Đầu bếp chỉ cần 1 chạm để chuyển đổi trạng thái chế biến: Chờ nấu ➔ Bắt đầu nấu ➔ Đã nấu xong (hoàn tất).")
    add_image_with_caption(doc, "05_kitchen.png", "Hình 3.5. Màn hình Điều phối Bếp KDS (Kitchen Display System) Real-time")

    add_h2(doc, "3.6. Giao diện Khách hàng quét mã QR gọi món trên di động")
    add_body_p(doc, "Giao diện khách quét mã QR là điểm nhấn công nghệ tự phục vụ hiện đại của nhà hàng:")
    add_bullet_p(doc, "Không cần cài đặt ứng dụng", "Thực khách chỉ cần mở camera điện thoại quét mã QR dán tại bàn là giao diện thực đơn mở ngay trên trình duyệt web di động.")
    add_bullet_p(doc, "Thực đơn trực quan sắc nét", "Hình ảnh món ăn chụp thực tế to rõ, giá bán minh bạch và tag giảm giá đỏ nổi bật giúp kích thích nhu cầu gọi món của khách.")
    add_bullet_p(doc, "Theo dõi tiến độ món ăn", "Sau khi bấm gửi order, khách hàng có thể theo dõi trực tiếp trạng thái món ăn của bàn mình (đang chờ bếp nấu hay đã nấu xong).")
    add_image_with_caption(doc, "10_qr_order.png", "Hình 3.6. Giao diện Khách hàng quét mã QR gọi món trên thiết bị di động")

    add_h2(doc, "3.7. Màn hình Quản lý Thực đơn & Món ăn")
    add_body_p(doc, "Giao diện quản lý thực đơn hỗ trợ người quản trị kiểm soát toàn bộ danh mục ẩm thực của nhà hàng:")
    add_bullet_p(doc, "Thao tác CRUD toàn diện", "Thêm món ăn mới, cập nhật giá bán, tải ảnh đại diện món ăn lên hệ thống và xóa món ăn.")
    add_bullet_p(doc, "Công tắc trạng thái Còn hàng / Hết hàng", "Khi một món ăn hết nguyên liệu trong bếp, quản lý chỉ cần gạt công tắc sang trạng thái 'Hết hàng'. Món ăn sẽ tự động hiển thị mờ đi trên thực đơn của khách để tránh việc gọi món không thể phục vụ.")
    add_image_with_caption(doc, "06_dishes.png", "Hình 3.7. Giao diện Quản lý Thực đơn, phân loại danh mục và giá bán")

    add_h2(doc, "3.8. Giao diện Thanh toán hóa đơn & Mã VietQR động")
    add_body_p(doc, "Giao diện thanh toán hỗ trợ quy trình xuất hóa đơn nhanh chóng và thanh toán không tiền mặt hiện đại:")
    add_bullet_p(doc, "Xem trước hóa đơn tạm tính", "Hiển thị đầy đủ thông tin số bàn, chi tiết từng món ăn đã sử dụng, số lượng, đơn giá, tổng tiền hàng và tiền thuế VAT.")
    add_bullet_p(doc, "Tạo mã VietQR động tự động", "Tự động sinh mã VietQR chứa sẵn số tài khoản ngân hàng của nhà hàng, số tiền chính xác cần thanh toán và nội dung chuyển khoản theo mã hóa đơn, loại bỏ hoàn toàn nguy cơ chuyển khoản nhầm số tiền.")
    add_bullet_p(doc, "Đa kênh thanh toán & In bill", "Hỗ trợ thanh toán bằng Tiền mặt, Thẻ ngân hàng hoặc Quét mã QR, nút bấm in bill phiếu thanh toán và tự động giải phóng bàn ăn về trạng thái 'Trống' ngay khi thanh toán thành công.")
    add_image_with_caption(doc, "11_bill_payment.png", "Hình 3.8. Giao diện Thanh toán hóa đơn và hiển thị mã VietQR động")

    add_h3(doc, "Bảng tổng hợp các phân hệ và tính năng giao diện Front-End")
    summary_data = [
        ["1", "Đăng nhập & Xác thực", "Form đăng nhập bảo mật, chuyển hướng theo vai trò, 4 nút Quick Demo Login."],
        ["2", "Dashboard Quản trị", "4 thẻ KPI kinh doanh, biểu đồ doanh thu theo giờ, chuông reo báo đơn mới."],
        ["3", "Sơ đồ Bàn ăn", "Trực quan hóa 3 màu sắc, lọc theo 3 khu vực, thao tác trực tiếp trên bàn."],
        ["4", "Bán hàng POS", "Màn hình cảm ứng 2 cột, lọc danh mục trượt ngang, giỏ hàng, ghi chú khẩu vị."],
        ["5", "Bếp KDS Real-time", "Nhận đơn chuông reo tức thì qua Socket.io, ưu tiên thứ tự nấu, 3 nút trạng thái."],
        ["6", "Khách quét mã QR", "Menu di động chuẩn Mobile-first, không cần cài app, theo dõi tiến độ món ăn."],
        ["7", "Quản lý Thực đơn", "Thêm/sửa/xóa món, tải ảnh món ăn, công tắc bật/tắt Còn hàng - Hết hàng."],
        ["8", "Thanh toán & VietQR", "Xem trước hóa đơn, tạo mã VietQR động, in phiếu thanh toán, tự động giải phóng bàn."]
    ]
    add_custom_table(doc, ["STT", "Phân hệ Giao diện", "Các tính năng chính đã hiện thực hóa"], summary_data, [0.6, 2.0, 3.6])

    # =========================================================================
    # CHƯƠNG 4. TỐI ƯU HIỆU NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG
    # =========================================================================
    doc.add_page_break()
    add_h1(doc, "CHƯƠNG 4. TỐI ƯU HIỆU NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG")

    add_h2(doc, "4.1. Thiết kế giao diện thích ứng đa thiết bị (Responsive Design)")
    add_body_p(doc, "Trong môi trường nhà hàng F&B, hệ thống được vận hành đồng thời trên nhiều loại thiết bị phần cứng khác nhau:")
    add_bullet_p(doc, "Màn hình máy tính để bàn (PC / Laptop)", "Được tối ưu cho người quản lý và nhân viên thu ngân với thanh Sidebar cố định, bảng dữ liệu mở rộng hiển thị đầy đủ chi tiết.")
    add_bullet_p(doc, "Màn hình máy tính bảng (Tablet POS)", "Được thiết kế các nút bấm to bản, khoảng cách chạm an toàn giúp nhân viên phục vụ thao tác chọn món nhanh chóng.")
    add_bullet_p(doc, "Màn hình điện thoại thông minh (Smartphones)", "Thiết kế chuẩn Mobile-first cho khách quét mã QR, các thao tác lướt chọn món và giỏ hàng được dồn gọn về góc dưới màn hình thuận tiện cho việc thao tác bằng một tay.")

    add_h2(doc, "4.2. Tối ưu hóa tải trang và chống giật layout (Core Web Vitals)")
    add_body_p(doc, "Để đảm bảo tốc độ phản hồi nhanh nhạy và giữ chân người dùng:")
    add_bullet_p(doc, "Triệt tiêu hiện tượng giật layout (Cumulative Layout Shift - CLS)", "Tất cả các thẻ hình ảnh món ăn đều được ấn định kích thước width, height và tỷ lệ khung hình cố định (aspect-ratio), đảm bảo trình duyệt dành sẵn không gian hiển thị trước khi ảnh tải xong, tránh hiện tượng xô lệch giao diện.")
    add_bullet_p(doc, "Tải lười hình ảnh (Lazy Loading)", "Áp dụng thuộc tính loading='lazy' và giải mã ảnh bất đồng bộ decoding='async' cho danh sách hình ảnh món ăn, giúp trang web khởi động nhẹ nhàng và tiết kiệm băng thông mạng.")
    add_bullet_p(doc, "Phân tách gói mã nguồn (Code Splitting)", "Sử dụng cơ chế React.lazy() kết hợp Suspense để chia nhỏ bundle JavaScript theo từng trang chức năng, chỉ tải mã nguồn của trang khi người dùng truy cập.")

    add_h2(doc, "4.3. Nâng cao trải nghiệm người dùng với âm thanh và hiệu ứng")
    add_body_p(doc, "Trải nghiệm người dùng (UX) được trau chuốt tỉ mỉ qua từng chi tiết tương tác nhỏ:")
    add_bullet_p(doc, "Hiệu ứng thị giác nổi khối", "Áp dụng kỹ thuật viền border-2 kết hợp đổ bóng sâu khi rê chuột (hover:translate-y-1 hover:shadow-md) giúp người dùng dễ dàng định vị vị trí thao tác trên màn hình cảm ứng.")
    add_bullet_p(doc, "Âm thanh chuông báo động", "Tích hợp âm thanh chuông reo thông qua Web Audio API khi có đơn đặt món mới gửi đến bếp và khi khách gọi thanh toán, giúp nhân viên không bị bỏ sót yêu cầu của khách trong môi trường ồn ào của nhà hàng.")

    # =========================================================================
    # CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # =========================================================================
    doc.add_page_break()
    add_h1(doc, "CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_h2(doc, "5.1. Kết quả đạt được của phân hệ Front-End")
    add_body_p(doc, "Sau thời gian nghiên cứu và thực hiện đề tài, phân hệ Front-End của Phần Mềm Quản Lý Nhà Hàng & Gọi Món Royal Bistro đã hoàn thành xuất sắc các mục tiêu đề ra:")
    add_bullet_p(doc, "Hoàn thiện 8 phân hệ giao diện chuyên nghiệp", "Bao gồm Đăng nhập phân quyền, Dashboard tổng quan, Sơ đồ bàn ăn, POS bán hàng tại bàn, Màn hình bếp KDS, Gọi món QR di động, Quản lý thực đơn và Thanh toán VietQR động.")
    add_bullet_p(doc, "Truyền thông dữ liệu thời gian thực mượt mà", "Tích hợp thành công Socket.io Client giúp thông báo đơn món và trạng thái chế biến cập nhật tức thì giữa khách hàng, phục vụ, bếp trưởng và thu ngân mà không cần tải lại trang.")
    add_bullet_p(doc, "Giao diện thẩm mỹ cao và chuẩn mực", "Tuân thủ nghiêm ngặt hệ thống thiết kế tách nền 3 tầng, phông chữ có chân sang trọng, bố cục cố định chống xô lệch và tương thích tốt trên đa dạng kích cỡ màn hình.")

    add_h2(doc, "5.2. Các hạn chế còn tồn tại")
    add_body_p(doc, "Bên cạnh các kết quả đạt được, hệ thống giao diện vẫn còn một số điểm cần tiếp tục hoàn thiện:")
    add_bullet_p(doc, "Chưa hỗ trợ chế độ ngoại tuyến", "Khi thiết bị tạm thời mất kết nối mạng Internet, giao diện chưa có cơ chế lưu trữ hàng đợi thao tác cục bộ qua Service Worker.")
    add_bullet_p(doc, "Chưa đa dạng ngôn ngữ", "Giao diện hiện tại mới chỉ hỗ trợ hiển thị bằng Tiếng Việt, chưa hỗ trợ chuyển đổi đa ngôn ngữ cho khách du lịch quốc tế.")

    add_h2(doc, "5.3. Hướng phát triển trong tương lai")
    add_body_p(doc, "Trong thời gian tới, hệ thống giao diện Front-End sẽ tiếp tục được nâng cấp theo các hướng sau:")
    add_bullet_p(doc, "Đóng gói ứng dụng PWA (Progressive Web App)", "Bổ sung Web App Manifest và Service Worker để nhân viên có thể cài đặt trực tiếp icon phần mềm lên màn hình chính điện thoại và nhận thông báo đẩy (Push Notifications).")
    add_bullet_p(doc, "Chế độ giao diện tối (Dark Mode)", "Cung cấp tùy chọn giao diện nền tối dịu mắt, phù hợp với điều kiện ánh sáng của quầy bar và khu vực bếp vào ban đêm.")
    add_bullet_p(doc, "Hỗ trợ đa ngôn ngữ quốc tế (i18n)", "Tích hợp thư viện react-i18next để hỗ trợ song ngữ Tiếng Việt – Tiếng Anh phục vụ thực khách nước ngoài quét mã QR gọi món.")
    add_bullet_p(doc, "Trợ lý AI gợi ý món ăn thông minh", "Ứng dụng trí tuệ nhân tạo để đề xuất các món ăn kèm hoặc combo ưu đãi phù hợp với sở thích của khách hàng ngay trên giao diện gọi món.")

    # =========================================================================
    # TÀI LIỆU THAM KHẢO
    # =========================================================================
    doc.add_page_break()
    p_ref = doc.add_paragraph("TÀI LIỆU THAM KHẢO")
    p_ref.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref.paragraph_format.space_before = Pt(20)
    p_ref.paragraph_format.space_after = Pt(14)
    r_ref = p_ref.runs[0]
    r_ref.font.name = "Times New Roman"
    r_ref.font.size = Pt(16)
    r_ref.font.bold = True
    r_ref.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    references = [
        "[1] React Documentation, \"Getting Started with React 19\", Meta Open Source, https://react.dev, 2025.",
        "[2] Vite Official Guide, \"Next Generation Frontend Tooling\", Evan You & Vite Team, https://vitejs.dev, 2025.",
        "[3] Tailwind CSS Documentation, \"Utility-First CSS Framework v4.0\", Tailwind Labs, https://tailwindcss.com, 2025.",
        "[4] Socket.io Documentation, \"Real-time bidirectional event-based communication\", https://socket.io, 2025.",
        "[5] Google Chrome Developers, \"Web Vitals: Essential metrics for a healthy site\", Google, https://web.dev/vitals, 2024.",
        "[6] MDN Web Docs, \"Responsive Web Design Basics & Media Queries\", Mozilla Developer Network, https://developer.mozilla.org, 2024.",
        "[7] Lucide Icons, \"Beautiful & consistent icon toolkit for modern UI\", https://lucide.dev, 2024."
    ]

    for ref in references:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.3)
        p.paragraph_format.first_line_indent = Inches(-0.3)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.3
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(ref)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11.5)

    # 5. Save Document
    print(f"Saving final report to {DOC_PATH}...")
    doc.save(DOC_PATH)
    print("✅ Báo cáo Front-End đã được xuất bản thành công 100%!")

if __name__ == '__main__':
    main()
