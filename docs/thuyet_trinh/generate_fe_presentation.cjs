/**
 * generate_fe_presentation.cjs
 * Tự động tạo file PowerPoint (.pptx) chuẩn đồ án Chuyên Đề Front-End cho nhà hàng Royal Bistro.
 * ĐÃ LOẠI BỎ TOÀN BỘ SỐ LIỆU TÙY TIỆN (15-20p, 25%, 30%, < 1.2s, < 50ms, 100%, v.v.)
 * Thay thế bằng các mô tả định tính an toàn, chuyên nghiệp, bảo vệ đồ án vững chắc.
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createFEPresentation() {
  const pres = new pptxgen();

  // Chuẩn 16:9 Widescreen (13.333 x 7.5 inches)
  pres.defineLayout({ name: 'ROYAL_16_9', width: 13.333, height: 7.5 });
  pres.layout = 'ROYAL_16_9';

  // Palette màu Royal Bistro Design System
  const COLORS = {
    CANVAS_BG: 'F1F5F9',     // Slate 100
    WHITE: 'FFFFFF',
    PRIMARY: '1E3A8A',       // Royal Blue 900
    VIBRANT_BLUE: '2563EB',  // Blue 600
    SKY_BLUE: '0284C7',      // Sky 600
    EMERALD: '059669',       // Emerald 600
    GOLD: 'D97706',          // Amber 600
    RED: 'DC2626',           // Red 600
    PURPLE: '7C3AED',        // Violet 600
    TEXT_DARK: '0F172A',     // Slate 900
    TEXT_MUTED: '475569',    // Slate 600
    CARD_BORDER: 'CBD5E1',   // Slate 300
    BORDER_LIGHT: 'E2E8F0',  // Slate 200
    INNER_BG: 'F8FAFC',      // Slate 50
    PILL_BG: 'EEF2FF',       // Indigo 50
    PILL_BORDER: 'C7D2FE'    // Indigo 200
  };

  const FONT_MAIN = 'Segoe UI';
  const TOTAL_SLIDES = 12;

  const baseDir = __dirname;
  const docsDir = path.dirname(baseDir);
  const screenshotsDir = path.join(docsDir, 'assets', 'screenshots_clean');

  function setSlideBackground(slide) {
    slide.background = { color: COLORS.CANVAS_BG };
  }

  function addSlideHeader(slide, tagText, titleText, subtitleText = '', tagWidth = 3.6) {
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 1.05,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1 }
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 0.06,
      fill: { color: COLORS.VIBRANT_BLUE },
      line: { type: 'none' }
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.10, w: tagWidth, h: 0.26,
      fill: { color: COLORS.PILL_BG },
      line: { color: COLORS.PILL_BORDER, width: 0.75 },
      rectRadius: 0.13
    });

    slide.addText(tagText.toUpperCase(), {
      x: 0.8, y: 0.10, w: tagWidth, h: 0.26,
      fontSize: 10,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE,
      align: 'center',
      valign: 'middle'
    });

    slide.addText(titleText, {
      x: 0.8, y: 0.38, w: 11.733, h: 0.38,
      fontSize: 22,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY,
      valign: 'top'
    });

    if (subtitleText) {
      slide.addText(subtitleText, {
        x: 0.8, y: 0.76, w: 11.733, h: 0.24,
        fontSize: 12,
        fontFace: FONT_MAIN,
        color: COLORS.TEXT_MUTED,
        valign: 'top'
      });
    }
  }

  function addSlideFooter(slide, currentIdx) {
    slide.addText(
      `Đồ Án Chuyên Đề Front-End: Royal Bistro  |  Sinh viên: Nguyễn Hoàng Hưng – MSSV: 501250384`,
      {
        x: 0.8, y: 7.15, w: 8.5, h: 0.3,
        fontSize: 10,
        fontFace: FONT_MAIN,
        color: '94A3B8',
        valign: 'middle'
      }
    );

    slide.addText(
      `Trang ${currentIdx}/${TOTAL_SLIDES}`,
      {
        x: 10.0, y: 7.15, w: 2.533, h: 0.3,
        fontSize: 10,
        fontFace: FONT_MAIN,
        bold: true,
        color: COLORS.VIBRANT_BLUE,
        align: 'right',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 1: TRANG BÌA (COVER SLIDE)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);

    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 0.10,
      fill: { color: COLORS.VIBRANT_BLUE },
      line: { type: 'none' }
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.9, y: 0.40, w: 11.533, h: 0.48,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText('🏛️ TRƯỜNG CAO ĐẲNG CÔNG NGHỆ THÔNG TIN TP.HCM • KHOA CNTT – ĐIỆN TỬ', {
      x: 0.9, y: 0.40, w: 11.533, h: 0.48,
      fontSize: 13,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY,
      align: 'center',
      valign: 'middle'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.9, y: 1.05, w: 11.533, h: 2.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.PILL_BORDER, width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('BÁO CÁO ĐỒ ÁN MÔN HỌC: CHUYÊN ĐỀ FRONT-END', {
      x: 1.1, y: 1.25, w: 11.133, h: 0.35,
      fontSize: 15,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE,
      align: 'center'
    });

    slide.addText('PHẦN MỀM QUẢN LÝ NHÀ HÀNG & GỌI MÓN (ROYAL BISTRO)', {
      x: 1.1, y: 1.65, w: 11.133, h: 1.05,
      fontSize: 27,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY,
      align: 'center'
    });

    slide.addText('React 19 • Vite 6 • Tailwind CSS v4 • Gọi Món QR • Bếp KDS Real-time • POS Bán Hàng', {
      x: 1.1, y: 2.85, w: 11.133, h: 0.35,
      fontSize: 13.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.TEXT_MUTED,
      align: 'center'
    });

    const cardData = [
      {
        title: '👤 SINH VIÊN',
        color: COLORS.VIBRANT_BLUE,
        pillBg: 'EEF2FF',
        items: [
          ['Họ và tên:', 'Nguyễn Hoàng Hưng'],
          ['MSSV:', '501250384'],
          ['Lớp:', 'Khóa K25 – CN Phần mềm']
        ]
      },
      {
        title: '👨‍🏫 GIẢNG VIÊN',
        color: COLORS.EMERALD,
        pillBg: 'ECFDF5',
        items: [
          ['Giảng viên 1:', 'ThS. HÀ MĨ TRINH'],
          ['Giảng viên 2:', 'ThS. NGUYỄN MINH HẢI'],
          ['Bộ môn:', 'Công nghệ Phần mềm']
        ]
      },
      {
        title: '⚡ CÔNG NGHỆ CHÍNH',
        color: COLORS.GOLD,
        pillBg: 'FEF3C7',
        items: [
          ['Core:', 'React 19 & Vite 6'],
          ['Styling:', 'Tailwind CSS v4 (3 tầng)'],
          ['Real-time:', 'Socket.io Client']
        ]
      }
    ];

    let leftPos = 0.9;
    cardData.forEach(card => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: leftPos, y: 4.00, w: 3.68, h: 2.85,
        fill: { color: COLORS.WHITE },
        line: { color: card.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: leftPos + 0.15, y: 4.15, w: 3.38, h: 0.40,
        fill: { color: card.pillBg },
        line: { type: 'none' },
        rectRadius: 0.2
      });

      slide.addText(card.title, {
        x: leftPos + 0.15, y: 4.15, w: 3.38, h: 0.40,
        fontSize: 13,
        fontFace: FONT_MAIN,
        bold: true,
        color: card.color,
        align: 'center',
        valign: 'middle'
      });

      let textRuns = [];
      card.items.forEach(([label, val], idx) => {
        textRuns.push({
          text: `${label} `,
          options: { fontSize: 13, fontFace: FONT_MAIN, color: COLORS.TEXT_MUTED }
        });
        textRuns.push({
          text: `${val}${idx < card.items.length - 1 ? '\n' : ''}`,
          options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK }
        });
      });

      slide.addText(textRuns, {
        x: leftPos + 0.25, y: 4.80, w: 3.18, h: 1.85,
        valign: 'top',
        lineSpacingMultiple: 1.35
      });

      leftPos += 3.93;
    });

    addSlideFooter(slide, 1);
  }

  // =========================================================================
  // SLIDE 2: ĐẶT VẤN ĐỀ (KHÔNG SỐ LIỆU TÙY TIỆN)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '01. Đặt Vấn Đề', 'Các Bất Cập Lớn Trong Quản Lý Nhà Hàng Thủ Công', 'Thách thức lớn khi chưa số hóa giao diện phục vụ F&B');

    const issues = [
      {
        icon: '⏳',
        title: 'TẮC NGHẼN CAO ĐIỂM',
        color: COLORS.RED,
        badge: 'Quá Tải Cao Điểm',
        points: [
          'Khách đợi gọi món quá lâu',
          'Nhân viên quá tải, sót bàn',
          'Trải nghiệm khách giảm sút'
        ]
      },
      {
        icon: '📝',
        title: 'ORDER GIẤY SAI SÓT',
        color: COLORS.GOLD,
        badge: 'Dễ Bị Nhầm Món',
        points: [
          'Ghi tay dễ nhầm món, mất bill',
          'Bỏ quên ghi chú khẩu vị',
          'Truyền đạt vào bếp thiếu sót'
        ]
      },
      {
        icon: '📵',
        title: 'GIAO DIỆN RỜI RẠC',
        color: COLORS.PRIMARY,
        badge: 'Thủ Công Hoàn Toàn',
        points: [
          'Thiếu màn hình điều phối chung',
          'Nhân viên di chuyển liên tục',
          'Khó theo dõi trạng thái bàn ăn'
        ]
      }
    ];

    let xPos = 0.8;
    issues.forEach(item => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos, y: 1.30, w: 3.75, h: 4.35,
        fill: { color: COLORS.WHITE },
        line: { color: item.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText(`${item.icon} ${item.title}`, {
        x: xPos + 0.2, y: 1.50, w: 3.35, h: 0.40,
        fontSize: 15,
        fontFace: FONT_MAIN,
        bold: true,
        color: item.color,
        align: 'center'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: xPos + 0.675, y: 2.00, w: 2.4, h: 0.38,
        fill: { color: COLORS.INNER_BG },
        line: { color: COLORS.BORDER_LIGHT, width: 1 },
        rectRadius: 0.19
      });
      slide.addText(item.badge, {
        x: xPos + 0.675, y: 2.00, w: 2.4, h: 0.38,
        fontSize: 11.5,
        fontFace: FONT_MAIN,
        bold: true,
        color: item.color,
        align: 'center',
        valign: 'middle'
      });

      let bullets = item.points.map(pt => ({
        text: `${pt}\n`,
        options: {
          fontSize: 13.5,
          fontFace: FONT_MAIN,
          color: COLORS.TEXT_DARK,
          bullet: true,
          lineSpacingMultiple: 1.4
        }
      }));

      slide.addText(bullets, {
        x: xPos + 0.25, y: 2.65, w: 3.25, h: 2.70,
        valign: 'top'
      });

      xPos += 3.99;
    });

    const summaryCards = [
      { text: '❌ Trải nghiệm khách hàng giảm sút', color: COLORS.RED, x: 0.8 },
      { text: '❌ Giảm hiệu suất nhân sự', color: COLORS.GOLD, x: 4.79 },
      { text: '❌ Thao tác thủ công chậm chạp', color: COLORS.PRIMARY, x: 8.78 }
    ];

    summaryCards.forEach(c => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: c.x, y: 5.85, w: 3.75, h: 1.00,
        fill: { color: COLORS.WHITE },
        line: { color: COLORS.BORDER_LIGHT, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(c.text, {
        x: c.x + 0.1, y: 5.85, w: 3.55, h: 1.00,
        fontSize: 13,
        fontFace: FONT_MAIN,
        bold: true,
        color: c.color,
        align: 'center',
        valign: 'middle'
      });
    });

    addSlideFooter(slide, 2);
  }

  // =========================================================================
  // SLIDE 3: BÀI TOÁN & MỤC TIÊU FRONT-END (KHÔNG SỐ LIỆU TÙY TIỆN)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '02. Bài Toán & Mục Tiêu', 'Mục Tiêu Giao Diện & Tiêu Chuẩn Trải Nghiệm Người Dùng', 'Xây dựng ứng dụng Web SPA trực quan, thao tác nhanh nhạy');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.30, w: 5.75, h: 4.35,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.VIBRANT_BLUE, width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('🎯 MỤC TIÊU TÍNH NĂNG GIAO DIỆN', {
      x: 1.05, y: 1.50, w: 5.25, h: 0.40,
      fontSize: 16,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE
    });

    const col1Points = [
      'Giao Diện SPA Siêu Tốc: Chuyển màn hình tức thì, không reload',
      'Menu QR Điện Thoại: Khách tự chọn món và gửi order tại bàn',
      'Giao Diện POS Cảm Ứng: Nhân viên phục vụ chọn món nhanh chóng',
      'Màn Hình Bếp KDS: Nhận món chuông reo & đổi trạng thái nấu',
      'Giao Diện Hóa Đơn: Xem trước bill và hiển thị mã VietQR động'
    ];

    slide.addText(col1Points.map(p => ({
      text: `${p}\n`,
      options: { fontSize: 13.5, fontFace: FONT_MAIN, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 1.05, y: 2.05, w: 5.25, h: 3.40,
      valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.78, y: 1.30, w: 5.75, h: 4.35,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.EMERALD, width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('💎 TIÊU CHUẨN TRẢI NGHIỆM UI/UX', {
      x: 7.03, y: 1.50, w: 5.25, h: 0.40,
      fontSize: 16,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.EMERALD
    });

    const col2Points = [
      'Đa Thiết Bị: Chuẩn Mobile, Tablet & Desktop',
      'Tải Trang Nhanh: Tối ưu mượt mà, chống giật layout',
      'Thiết Kế 3 Tầng: Layered Depth nổi khối, bo tròn',
      'Chuông Báo Đơn: Âm thanh & Popup tức thì',
      'Thao Tác Trực Quan: Bố cục tối giản, font tiếng Việt sang trọng'
    ];

    slide.addText(col2Points.map(p => ({
      text: `${p}\n`,
      options: { fontSize: 13.5, fontFace: FONT_MAIN, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 7.03, y: 2.05, w: 5.25, h: 3.40,
      valign: 'top'
    });

    const stats = [
      { num: '⚡ Tức Thời', lbl: 'Phản hồi nhanh, chuyển tab mượt mà', x: 0.8, color: COLORS.VIBRANT_BLUE },
      { num: '📱 Linh Hoạt', lbl: 'Tương thích mọi kích cỡ màn hình', x: 4.79, color: COLORS.EMERALD },
      { num: '🔄 Real-time', lbl: 'Cập nhật giao diện tức thì qua Socket.io', x: 8.78, color: COLORS.GOLD }
    ];

    stats.forEach(st => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: st.x, y: 5.85, w: 3.75, h: 1.00,
        fill: { color: COLORS.WHITE },
        line: { color: COLORS.BORDER_LIGHT, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(st.num, {
        x: st.x, y: 5.95, w: 3.75, h: 0.45,
        fontSize: 18,
        fontFace: FONT_MAIN,
        bold: true,
        color: st.color,
        align: 'center'
      });
      slide.addText(st.lbl, {
        x: st.x, y: 6.40, w: 3.75, h: 0.35,
        fontSize: 11,
        fontFace: FONT_MAIN,
        color: COLORS.TEXT_MUTED,
        align: 'center'
      });
    });

    addSlideFooter(slide, 3);
  }

  // =========================================================================
  // SLIDE 4: KIẾN TRÚC FRONT-END (KHÔNG SỐ LIỆU TÙY TIỆN)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '03. Kiến Trúc Front-End', 'Ngăn Xếp Công Nghệ & Cấu Trúc Mã Nguồn Front-End', 'Tổ chức module hóa cao, xây dựng bằng các công nghệ hiện đại nhất');

    const techBlocks = [
      {
        icon: '⚛️',
        title: 'REACT 19 & VITE 6',
        color: COLORS.VIBRANT_BLUE,
        pillBg: 'EEF2FF',
        points: [
          'Component tái sử dụng cao',
          'Vite HMR cập nhật tức thì khi code',
          'Tối ưu bundle & tải trang mượt mà'
        ]
      },
      {
        icon: '🎨',
        title: 'TAILWIND CSS v4',
        color: COLORS.EMERALD,
        pillBg: 'ECFDF5',
        points: [
          'Hệ utility CSS siêu tinh gọn',
          'Kiến trúc Tách Nền 3 Tầng',
          'Bộ icon Lucide vector nhẹ'
        ]
      },
      {
        icon: '🔄',
        title: 'SOCKET.IO CLIENT',
        color: COLORS.GOLD,
        pillBg: 'FEF3C7',
        points: [
          'Kết nối WebSocket 2 chiều',
          'Bắt sự kiện đơn mới tức thì',
          'Cập nhật giao diện không cần F5'
        ]
      },
      {
        icon: '📁',
        title: 'TỔ CHỨC MÃ NGUỒN',
        color: COLORS.PURPLE,
        pillBg: 'F5F3FF',
        points: [
          'Tách biệt Pages & Components',
          'React Context API (Auth & Socket)',
          'Axios tự động gắn Bearer Token'
        ]
      }
    ];

    const positions = [
      { x: 0.8, y: 1.35 },
      { x: 6.78, y: 1.35 },
      { x: 0.8, y: 4.15 },
      { x: 6.78, y: 4.15 }
    ];

    techBlocks.forEach((tb, idx) => {
      const pos = positions[idx];
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 5.75, h: 2.65,
        fill: { color: COLORS.WHITE },
        line: { color: tb.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 5.35, h: 0.42,
        fill: { color: tb.pillBg },
        line: { type: 'none' },
        rectRadius: 0.21
      });

      slide.addText(`${tb.icon} ${tb.title}`, {
        x: pos.x + 0.2, y: pos.y + 0.18, w: 5.35, h: 0.42,
        fontSize: 13.5,
        fontFace: FONT_MAIN,
        bold: true,
        color: tb.color,
        align: 'center',
        valign: 'middle'
      });

      slide.addText(tb.points.map(pt => ({
        text: `${pt}\n`,
        options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.4 }
      })), {
        x: pos.x + 0.3, y: pos.y + 0.80, w: 5.15, h: 1.65,
        valign: 'top'
      });
    });

    addSlideFooter(slide, 4);
  }

  // =========================================================================
  // SLIDE 5: THỰC HIỆN HOÁ – LIỆT KÊ CHỨC NĂNG FRONT-END (GRID 8 CHỨC NĂNG)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '04. Thực Hiện Hoá: Liệt Kê Chức Năng', 'Danh Mục Các Phân Hệ Chức Năng Front-End', 'Tổng quan toàn bộ màn hình chức năng phục vụ vận hành nhà hàng');

    const featureList = [
      { icon: '🔐', title: '1. Xác Thực Phân Quyền', desc: 'Đăng nhập 4 vai trò (Admin, Thu Ngân, Bếp, Phục Vụ)', color: COLORS.VIBRANT_BLUE, bg: 'EEF2FF' },
      { icon: '📊', title: '2. Dashboard Tổng Quan', desc: 'Biểu đồ doanh thu ngày, thẻ KPI kinh doanh, popup chuông báo', color: COLORS.EMERALD, bg: 'ECFDF5' },
      { icon: '🪑', title: '3. Sơ Đồ Bàn Ăn', desc: 'Trực quan hóa 3 màu: Trống (Xanh), Dùng (Đỏ), Đặt (Cam)', color: COLORS.GOLD, bg: 'FEF3C7' },
      { icon: '🖥️', title: '4. POS Bán Hàng Tại Bàn', desc: 'Màn hình cảm ứng tìm món nhanh, ghi chú khẩu vị, tạm tính', color: COLORS.PURPLE, bg: 'F5F3FF' },
      { icon: '👨‍🍳', title: '5. Màn Hình Bếp KDS', desc: 'Nhận đơn chuông reo, đổi trạng thái: Chờ nấu ➔ Nấu ➔ Xong', color: COLORS.RED, bg: 'FEF2F2' },
      { icon: '📱', title: '6. Khách Quét Mã QR', desc: 'Menu điện tử trên điện thoại, tự chọn món & gửi order tại bàn', color: COLORS.VIBRANT_BLUE, bg: 'EEF2FF' },
      { icon: '📋', title: '7. Quản Lý Thực Đơn', desc: 'Thêm, sửa, xóa món ăn, ảnh đại diện, bật/tắt Còn hàng', color: COLORS.EMERALD, bg: 'ECFDF5' },
      { icon: '💳', title: '8. Thanh Toán & VietQR', desc: 'Hiển thị mã VietQR động, in phiếu tạm tính, thanh toán đa kênh', color: COLORS.GOLD, bg: 'FEF3C7' }
    ];

    const gridPositions = [
      { x: 0.8, y: 1.30 }, { x: 6.78, y: 1.30 },
      { x: 0.8, y: 2.70 }, { x: 6.78, y: 2.70 },
      { x: 0.8, y: 4.10 }, { x: 6.78, y: 4.10 },
      { x: 0.8, y: 5.50 }, { x: 6.78, y: 5.50 }
    ];

    featureList.forEach((feat, idx) => {
      const pos = gridPositions[idx];
      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 5.75, h: 1.25,
        fill: { color: COLORS.WHITE },
        line: { color: feat.color, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x + 0.15, y: pos.y + 0.15, w: 0.95, h: 0.95,
        fill: { color: feat.bg },
        line: { type: 'none' },
        rectRadius: 0.15
      });

      slide.addText(feat.icon, {
        x: pos.x + 0.15, y: pos.y + 0.15, w: 0.95, h: 0.95,
        fontSize: 24,
        align: 'center',
        valign: 'middle'
      });

      slide.addText(feat.title, {
        x: pos.x + 1.25, y: pos.y + 0.20, w: 4.30, h: 0.35,
        fontSize: 14,
        fontFace: FONT_MAIN,
        bold: true,
        color: feat.color,
        valign: 'top'
      });

      slide.addText(feat.desc, {
        x: pos.x + 1.25, y: pos.y + 0.58, w: 4.30, h: 0.50,
        fontSize: 12,
        fontFace: FONT_MAIN,
        color: COLORS.TEXT_DARK,
        valign: 'top'
      });
    });

    addSlideFooter(slide, 5);
  }

  // =========================================================================
  // SLIDE 6: NÓI CHỨC NĂNG 1 – XÁC THỰC & DASHBOARD TỔNG QUAN
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '04. Thực Hiện Hoá: Nói Chức Năng', 'Chức Năng Đăng Nhập & Bảng Điều Khiển Dashboard', 'Giao diện bảo mật và màn hình thống kê chỉ số kinh doanh');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('🔐 GIAO DIỆN ĐĂNG NHẬP THEO VAI TRÒ', {
      x: 1.0, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY
    });

    const imgLogin = path.join(screenshotsDir, '01_login.png');
    if (fs.existsSync(imgLogin)) {
      slide.addImage({
        path: imgLogin,
        x: 1.0, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const loginBullets = [
      '4 Vai trò: Admin, Thu Ngân, Bếp, Phục Vụ',
      'Tự chuyển trang: Đúng giao diện theo quyền',
      'Đăng nhập nhanh: Chọn tài khoản mẫu kiểm thử'
    ];
    slide.addText(loginBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 1.0, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.78, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('📊 DASHBOARD TỔNG QUAN REAL-TIME', {
      x: 6.98, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE
    });

    const imgDash = path.join(screenshotsDir, '02_dashboard.png');
    if (fs.existsSync(imgDash)) {
      slide.addImage({
        path: imgDash,
        x: 6.98, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const dashBullets = [
      'Thẻ chỉ số KPI: Doanh thu, hóa đơn, số bàn',
      'Biểu đồ trực quan: Thống kê doanh thu theo giờ',
      'Chuông reo báo đơn: Popup nổi khi có order mới'
    ];
    slide.addText(dashBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 6.98, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    addSlideFooter(slide, 6);
  }

  // =========================================================================
  // SLIDE 7: NÓI CHỨC NĂNG 2 – SƠ ĐỒ BÀN ĂN & POS BÁN HÀNG
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '04. Thực Hiện Hoá: Nói Chức Năng', 'Chức Năng Sơ Đồ Bàn Ăn & POS Bán Hàng', 'Giao diện quản lý bàn trực quan và màn hình chọn món cảm ứng');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('🪑 SƠ ĐỒ BÀN ĂN THỜI GIAN THỰC', {
      x: 1.0, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY
    });

    const imgTables = path.join(screenshotsDir, '04_tables.png');
    if (fs.existsSync(imgTables)) {
      slide.addImage({
        path: imgTables,
        x: 1.0, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const tablesBullets = [
      '3 Màu trực quan: Trống (Xanh) - Dùng (Đỏ) - Đặt (Cam)',
      'Lọc theo khu vực: Sảnh chính, Phòng VIP, Ban công',
      'Thao tác trực tiếp: Mở bàn, gọi thêm, xem bill tạm'
    ];
    slide.addText(tablesBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 1.0, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.78, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('🖥️ GIAO DIỆN POS GỌI MÓN TẠI BÀN', {
      x: 6.98, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE
    });

    const imgPos = path.join(screenshotsDir, '03_pos_order.png');
    if (fs.existsSync(imgPos)) {
      slide.addImage({
        path: imgPos,
        x: 6.98, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const posBullets = [
      'Tìm & Lọc nhanh: Theo tên và nhóm danh mục món',
      'Ghi chú khẩu vị: Ít cay, không đường, ăn chay',
      'Tính tiền tự động: Tạm tính, giảm giá, thuế VAT'
    ];
    slide.addText(posBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 6.98, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    addSlideFooter(slide, 7);
  }

  // =========================================================================
  // SLIDE 8: NÓI CHỨC NĂNG 3 – MÀN HÌNH BẾP KDS & KHÁCH QUÉT QR
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '04. Thực Hiện Hoá: Nói Chức Năng', 'Chức Năng Bếp KDS & Khách Quét Mã QR Gọi Món', 'Giao diện điều phối nhà bếp và menu tự phục vụ trên di động');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('👨‍🍳 MÀN HÌNH BẾP KDS (KITCHEN DISPLAY)', {
      x: 1.0, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.EMERALD
    });

    const imgKitchen = path.join(screenshotsDir, '05_kitchen.png');
    if (fs.existsSync(imgKitchen)) {
      slide.addImage({
        path: imgKitchen,
        x: 1.0, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const kitchenBullets = [
      'Nhận đơn tức thì: Chuông reo & hiện thẻ bàn',
      '3 Trạng thái món: Chờ nấu ➔ Đang nấu ➔ Hoàn tất',
      'Nút chạm cảm ứng: Cập nhật tiến độ nấu nhanh'
    ];
    slide.addText(kitchenBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 1.0, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.78, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('📱 GIAO DIỆN KHÁCH QUÉT MÃ QR (MOBILE)', {
      x: 6.98, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.GOLD
    });

    const imgQr = path.join(screenshotsDir, '10_qr_order.png');
    if (fs.existsSync(imgQr)) {
      slide.addImage({
        path: imgQr,
        x: 6.98, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const qrBullets = [
      'Không cần tải app: Quét camera mở ngay menu',
      'Thực đơn trực quan: Ảnh sắc nét, giá rõ ràng',
      'Theo dõi tiến độ: Khách biết món đang được nấu'
    ];
    slide.addText(qrBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 6.98, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    addSlideFooter(slide, 8);
  }

  // =========================================================================
  // SLIDE 9: NÓI CHỨC NĂNG 4 – THỰC ĐƠN & THANH TOÁN
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '04. Thực Hiện Hoá: Nói Chức Năng', 'Chức Năng Thực Đơn & Thanh Toán Hóa Đơn VietQR', 'Giao diện cấu hình món ăn và màn hình thanh toán không tiền mặt');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('📋 GIAO DIỆN QUẢN LÝ THỰC ĐƠN', {
      x: 1.0, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY
    });

    const imgDishes = path.join(screenshotsDir, '06_dishes.png');
    if (fs.existsSync(imgDishes)) {
      slide.addImage({
        path: imgDishes,
        x: 1.0, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const dishesBullets = [
      'Quản lý món ăn: Thêm, sửa, đổi ảnh & giá bán',
      'Công tắc trạng thái: Bật/tắt Còn hàng - Hết hàng',
      'Phân loại danh mục: Khai vị, Món chính, Đồ uống'
    ];
    slide.addText(dishesBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 1.0, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.78, y: 1.25, w: 5.75, h: 5.75,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.CARD_BORDER, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('💳 GIAO DIỆN THANH TOÁN & MÃ VIETQR ĐỘNG', {
      x: 6.98, y: 1.40, w: 5.35, h: 0.35,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.EMERALD
    });

    const imgPayment = path.join(screenshotsDir, '11_bill_payment.png');
    if (fs.existsSync(imgPayment)) {
      slide.addImage({
        path: imgPayment,
        x: 6.98, y: 1.80, w: 5.35, h: 3.34
      });
    }

    const payBullets = [
      'Mã VietQR động: Tự tạo mã có sẵn số tiền chuyển',
      'Đa phương thức: Tiền mặt, Thẻ, Quét mã QR',
      'In hóa đơn: Xem trước và xuất phiếu in bill'
    ];
    slide.addText(payBullets.map(b => ({
      text: `${b}\n`,
      options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.3 }
    })), {
      x: 6.98, y: 5.25, w: 5.35, h: 1.65,
      valign: 'top'
    });

    addSlideFooter(slide, 9);
  }

  // =========================================================================
  // SLIDE 10: KHÓ KHĂN & THÁCH THỨC FRONT-END
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '05. Khó Khăn & Thách Thức', 'Thách Thức Kỹ Thuật Front-End & Giải Pháp Khắc Phục', 'Các bài toán lập trình giao diện thực tế và cách xử lý');

    const challenges = [
      {
        icon: '🔄',
        title: 'ĐỒNG BỘ REAL-TIME',
        color: COLORS.VIBRANT_BLUE,
        issue: 'Trạng thái bàn và bếp cần cập nhật tức thời không reload trang.',
        solution: 'Bắt sự kiện Socket.io cập nhật state React cục bộ mượt mà.'
      },
      {
        icon: '⚡',
        title: 'TỐI ƯU HIỆU NĂNG ẢNH',
        color: COLORS.GOLD,
        issue: 'Render danh sách nhiều ảnh lớn dễ gây giật layout (CLS cao).',
        solution: 'Lazy loading + Cố định kích thước ảnh + Nén WebP tối ưu.'
      },
      {
        icon: '📱',
        title: 'RESPONSIVE ĐA THIẾT BỊ',
        color: COLORS.EMERALD,
        issue: 'Màn hình PC/POS nằm ngang, màn hình khách QR lại dọc trên điện thoại.',
        solution: 'Thiết kế Mobile-first cho QR & Tailwind Flex/Grid thích ứng.'
      }
    ];

    let xChal = 0.8;
    challenges.forEach(ch => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: xChal, y: 1.30, w: 3.75, h: 5.65,
        fill: { color: COLORS.WHITE },
        line: { color: ch.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText(`${ch.icon} ${ch.title}`, {
        x: xChal + 0.15, y: 1.55, w: 3.45, h: 0.40,
        fontSize: 14,
        fontFace: FONT_MAIN,
        bold: true,
        color: ch.color,
        align: 'center'
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: xChal + 0.2, y: 2.15, w: 3.35, h: 2.15,
        fill: { color: 'FEF2F2' },
        line: { color: 'FECACA', width: 1 },
        rectRadius: 0.06
      });

      slide.addText('⚠️ KHÓ KHĂN KỸ THUẬT', {
        x: xChal + 0.3, y: 2.30, w: 3.15, h: 0.3,
        fontSize: 11.5,
        fontFace: FONT_MAIN,
        bold: true,
        color: COLORS.RED
      });

      slide.addText(ch.issue, {
        x: xChal + 0.3, y: 2.70, w: 3.15, h: 1.45,
        fontSize: 13,
        fontFace: FONT_MAIN,
        bold: true,
        color: COLORS.TEXT_DARK,
        lineSpacingMultiple: 1.3
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: xChal + 0.2, y: 4.45, w: 3.35, h: 2.25,
        fill: { color: 'ECFDF5' },
        line: { color: 'A7F3D0', width: 1 },
        rectRadius: 0.06
      });

      slide.addText('💡 GIẢI PHÁP ĐÃ ÁP DỤNG', {
        x: xChal + 0.3, y: 4.60, w: 3.15, h: 0.3,
        fontSize: 11.5,
        fontFace: FONT_MAIN,
        bold: true,
        color: COLORS.EMERALD
      });

      slide.addText(ch.solution, {
        x: xChal + 0.3, y: 5.00, w: 3.15, h: 1.55,
        fontSize: 13,
        fontFace: FONT_MAIN,
        bold: true,
        color: COLORS.TEXT_DARK,
        lineSpacingMultiple: 1.3
      });

      xChal += 3.99;
    });

    addSlideFooter(slide, 10);
  }

  // =========================================================================
  // SLIDE 11: HƯỚNG PHÁT TRIỂN FRONT-END
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);
    addSlideHeader(slide, '06. Hướng Phát Triển', 'Định Hướng Nâng Cấp Tính Năng Giao Diện Người Dùng', 'Lộ trình hoàn thiện trải nghiệm ứng dụng Web');

    const futureCards = [
      {
        icon: '📲',
        title: 'ỨNG DỤNG PWA (PROGRESSIVE WEB APP)',
        color: COLORS.VIBRANT_BLUE,
        pillBg: 'EEF2FF',
        points: [
          'Cài icon trực tiếp lên màn hình chính điện thoại',
          'Hỗ trợ chạy ngoại tuyến & Web Push Notification'
        ]
      },
      {
        icon: '🌙',
        title: 'CHẾ ĐỘ GIAO DIỆN TỐI (DARK MODE)',
        color: COLORS.GOLD,
        pillBg: 'FEF3C7',
        points: [
          'Tùy chọn giao diện nền tối dịu mắt',
          'Phù hợp môi trường nhà bếp và quầy bar thiếu sáng'
        ]
      },
      {
        icon: '🌐',
        title: 'HỖ TRỢ ĐA NGÔN NGỮ (I18N)',
        color: COLORS.EMERALD,
        pillBg: 'ECFDF5',
        points: [
          'Chuyển đổi giao diện song ngữ Tiếng Việt – Tiếng Anh',
          'Hỗ trợ khách du lịch nước ngoài quét mã QR gọi món'
        ]
      },
      {
        icon: '🤖',
        title: 'TRỢ LÝ AI GỢI Ý MÓN TRÊN GIAO DIỆN',
        color: COLORS.PURPLE,
        pillBg: 'F5F3FF',
        points: [
          'Popup gợi ý món ăn kèm thông minh',
          'Đề xuất món đặc sản theo thời tiết và khung giờ'
        ]
      }
    ];

    const positions = [
      { x: 0.8, y: 1.30 },
      { x: 6.78, y: 1.30 },
      { x: 0.8, y: 4.25 },
      { x: 6.78, y: 4.25 }
    ];

    futureCards.forEach((fc, idx) => {
      const pos = positions[idx];

      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x, y: pos.y, w: 5.75, h: 2.70,
        fill: { color: COLORS.WHITE },
        line: { color: fc.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: pos.x + 0.2, y: pos.y + 0.20, w: 5.35, h: 0.42,
        fill: { color: fc.pillBg },
        line: { type: 'none' },
        rectRadius: 0.21
      });

      slide.addText(`${fc.icon} ${fc.title}`, {
        x: pos.x + 0.2, y: pos.y + 0.20, w: 5.35, h: 0.42,
        fontSize: 13,
        fontFace: FONT_MAIN,
        bold: true,
        color: fc.color,
        align: 'center',
        valign: 'middle'
      });

      slide.addText(fc.points.map(pt => ({
        text: `${pt}\n`,
        options: { fontSize: 13, fontFace: FONT_MAIN, bold: true, color: COLORS.TEXT_DARK, bullet: true, lineSpacingMultiple: 1.4 }
      })), {
        x: pos.x + 0.3, y: pos.y + 0.85, w: 5.15, h: 1.70,
        valign: 'top'
      });
    });

    addSlideFooter(slide, 11);
  }

  // =========================================================================
  // SLIDE 12: KẾT LUẬN & HỎI ĐÁP (CONCLUSION & Q&A)
  // =========================================================================
  {
    const slide = pres.addSlide();
    setSlideBackground(slide);

    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 0.10,
      fill: { color: COLORS.VIBRANT_BLUE },
      line: { type: 'none' }
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 0.55, w: 11.333, h: 4.55,
      fill: { color: COLORS.WHITE },
      line: { color: COLORS.PILL_BORDER, width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('🎉 HOÀN THÀNH TOÀN DIỆN MỤC TIÊU ĐỒ ÁN FRONT-END', {
      x: 1.2, y: 0.85, w: 10.933, h: 0.35,
      fontSize: 15,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE,
      align: 'center'
    });

    slide.addText('XIN CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ!', {
      x: 1.2, y: 1.30, w: 10.933, h: 0.65,
      fontSize: 32,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY,
      align: 'center'
    });

    slide.addText('Kính chúc Quý Thầy Cô trong Hội đồng thật nhiều sức khỏe và thành công!', {
      x: 1.2, y: 2.05, w: 10.933, h: 0.40,
      fontSize: 15,
      fontFace: FONT_MAIN,
      color: COLORS.TEXT_MUTED,
      align: 'center'
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.5, y: 2.65, w: 8.333, h: 1.85,
      fill: { color: COLORS.INNER_BG },
      line: { color: COLORS.GOLD, width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('❓ PHẦN HỎI & ĐÁP (Q & A)', {
      x: 2.6, y: 2.85, w: 8.133, h: 0.45,
      fontSize: 20,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.GOLD,
      align: 'center'
    });

    slide.addText('Em rất mong nhận được những góp ý quý báu của Quý Thầy Cô để hoàn thiện đề tài.', {
      x: 2.8, y: 3.45, w: 7.733, h: 0.85,
      fontSize: 14.5,
      fontFace: FONT_MAIN,
      color: COLORS.TEXT_DARK,
      align: 'center',
      lineSpacingMultiple: 1.2
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: 5.30, w: 11.333, h: 1.55,
      fill: { color: COLORS.PILL_BG },
      line: { color: COLORS.PILL_BORDER, width: 1 },
      rectRadius: 0.08
    });

    slide.addText('👤 Sinh viên: NGUYỄN HOÀNG HƯNG   |   MSSV: 501250384   |   Lớp: Khóa K25 – Công nghệ Phần mềm', {
      x: 1.2, y: 5.45, w: 10.933, h: 0.40,
      fontSize: 14,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.PRIMARY,
      align: 'center'
    });

    slide.addText('👨‍🏫 GVHD: ThS. HÀ MĨ TRINH & ThS. NGUYỄN MINH HẢI   |   Khoa: CNTT – ĐT (ITC)', {
      x: 1.2, y: 5.90, w: 10.933, h: 0.35,
      fontSize: 13,
      fontFace: FONT_MAIN,
      color: COLORS.TEXT_MUTED,
      align: 'center'
    });

    slide.addText('🍽️ Đề tài: Phần Mềm Quản Lý Nhà Hàng & Gọi Món (Royal Bistro Restaurant System)', {
      x: 1.2, y: 6.28, w: 10.933, h: 0.35,
      fontSize: 12.5,
      fontFace: FONT_MAIN,
      bold: true,
      color: COLORS.VIBRANT_BLUE,
      align: 'center'
    });

    addSlideFooter(slide, 12);
  }

  // Lưu file PowerPoint chính và đồng bộ
  const primaryFile = path.join(baseDir, 'BaoCao_DoAn_FrontEnd_RoyalBistro.pptx');
  await pres.writeFile({ fileName: primaryFile });
  console.log(`✅ Đã tạo thành công PowerPoint tại: ${primaryFile}`);

  const syncTargets = [
    '05_NguyenNgocHaThao.pptx',
    '5_NguyenNgocHaThao.pptx',
    '05_NguyenHoangHung.pptx'
  ];

  for (const target of syncTargets) {
    const tPath = path.join(baseDir, target);
    fs.copyFileSync(primaryFile, tPath);
    console.log(`✅ Đã đồng bộ sang: ${tPath}`);
  }
}

createFEPresentation().catch(err => {
  console.error('Lỗi khi tạo presentation:', err);
  process.exit(1);
});
