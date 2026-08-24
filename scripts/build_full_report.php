<?php

/**
 * Script build_full_report.php
 * Tự động tạo:
 * 1. BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.docx (File Word OpenXML)
 * 2. BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.md (File Markdown)
 * 3. PhanMemQuanLyNhaHang_Database.sql (File SQL đầy đủ DDL, Seed >1000 records, SP, FN, Transactions)
 */

class DocxReportBuilder
{
    private $zip;
    private $filename;
    private $bodyXml = '';

    public function __construct($filename)
    {
        $this->filename = $filename;
        $this->zip = new ZipArchive();
    }

    public function addTitle($text, $subtitle = '')
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="300" w:after="100"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="38"/>
                    <w:color w:val="1A365D"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';

        if ($subtitle) {
            $this->bodyXml .= '<w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="0" w:after="260"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:i/>
                        <w:sz w:val="26"/>
                        <w:color w:val="4A5568"/>
                    </w:rPr>
                    <w:t>' . htmlspecialchars($subtitle) . '</w:t>
                </w:r>
            </w:p>';
        }
    }

    public function addHeading1($text)
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:spacing w:before="360" w:after="140"/>
                <w:pBdr>
                    <w:bottom w:val="single" w:sz="12" w:space="4" w:color="2B6CB0"/>
                </w:pBdr>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="32"/>
                    <w:color w:val="1A365D"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addHeading2($text)
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:spacing w:before="240" w:after="100"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="28"/>
                    <w:color w:val="2B6CB0"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addHeading3($text)
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:spacing w:before="180" w:after="80"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="25"/>
                    <w:color w:val="2D3748"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addParagraph($text, $bold = false, $italic = false, $align = 'both')
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="' . $align . '"/>
                <w:spacing w:before="60" w:after="80" w:line="280" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    ' . ($bold ? '<w:b/>' : '') . '
                    ' . ($italic ? '<w:i/>' : '') . '
                    <w:sz w:val="26"/>
                    <w:color w:val="1A202C"/>
                </w:rPr>
                <w:t xml:space="preserve">' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addBullet($text, $boldPrefix = '', $level = 0)
    {
        $indent = 360 * ($level + 1);
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:ind w:left="' . $indent . '" w:hanging="240"/>
                <w:spacing w:before="40" w:after="60" w:line="260" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/>
                    <w:sz w:val="20"/>
                    <w:color w:val="2B6CB0"/>
                </w:rPr>
                <w:t>• </w:t>
            </w:r>';

        if ($boldPrefix) {
            $this->bodyXml .= '<w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="26"/>
                    <w:color w:val="1A202C"/>
                </w:rPr>
                <w:t xml:space="preserve">' . htmlspecialchars($boldPrefix) . ' </w:t>
            </w:r>';
        }

        $this->bodyXml .= '<w:r>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:sz w:val="26"/>
                <w:color w:val="2D3748"/>
            </w:r>
            <w:t xml:space="preserve">' . htmlspecialchars($text) . '</w:t>
        </w:r>
        </w:p>';
    }

    public function addCalloutBox($title, $content, $borderColor = '2B6CB0', $bgColor = 'EBF8FF')
    {
        $lines = explode("\n", $content);
        $this->bodyXml .= '<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9400" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="none"/>
                    <w:left w:val="single" w:sz="24" w:space="0" w:color="' . $borderColor . '"/>
                    <w:bottom w:val="none"/>
                    <w:right w:val="none"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="120" w:type="dxa"/>
                    <w:left w:w="200" w:type="dxa"/>
                    <w:bottom w:w="120" w:type="dxa"/>
                    <w:right w:w="200" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="' . $bgColor . '"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:spacing w:before="60" w:after="40"/></w:pPr>
                        <w:r>
                            <w:rPr>
                                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                                <w:b/>
                                <w:sz w:val="26"/>
                                <w:color w:val="' . $borderColor . '"/>
                            </w:rPr>
                            <w:t>' . htmlspecialchars($title) . '</w:t>
                        </w:r>
                    </w:p>';
        foreach ($lines as $l) {
            $this->bodyXml .= '<w:p>
                <w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/></w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:sz w:val="25"/>
                        <w:color w:val="2D3748"/>
                    </w:rPr>
                    <w:t xml:space="preserve">' . htmlspecialchars($l) . '</w:t>
                </w:r>
            </w:p>';
        }
        $this->bodyXml .= '</w:tc>
            </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:before="40" w:after="60"/></w:pPr></w:p>';
    }

    public function addCodeBlock($code)
    {
        $lines = explode("\n", $code);
        $this->bodyXml .= '<w:tbl>
            <w:tblPr>
                <w:tblW w:w="9400" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:left w:val="single" w:sz="18" w:space="0" w:color="4A5568"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="100" w:type="dxa"/>
                    <w:left w:w="160" w:type="dxa"/>
                    <w:bottom w:w="100" w:type="dxa"/>
                    <w:right w:w="160" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="F7FAFC"/>
                    </w:tcPr>';

        foreach ($lines as $line) {
            $this->bodyXml .= '<w:p>
                <w:pPr>
                    <w:spacing w:before="0" w:after="0" w:line="220" w:lineRule="auto"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                        <w:sz w:val="20"/>
                        <w:color w:val="2C5282"/>
                    </w:rPr>
                    <w:t xml:space="preserve">' . htmlspecialchars($line) . '</w:t>
                </w:r>
            </w:p>';
        }

        $this->bodyXml .= '</w:tc>
            </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:before="40" w:after="60"/></w:pPr></w:p>';
    }

    public function addTable($headers, $rows, $colWidths = [])
    {
        $totalWidth = 9400;
        $numCols = count($headers);
        if (empty($colWidths)) {
            $defaultWidth = floor($totalWidth / $numCols);
            $colWidths = array_fill(0, $numCols, $defaultWidth);
        }

        $this->bodyXml .= '<w:tbl>
            <w:tblPr>
                <w:tblW w:w="' . $totalWidth . '" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="8" w:space="0" w:color="A0AEC0"/>
                    <w:left w:val="single" w:sz="8" w:space="0" w:color="A0AEC0"/>
                    <w:bottom w:val="single" w:sz="8" w:space="0" w:color="A0AEC0"/>
                    <w:right w:val="single" w:sz="8" w:space="0" w:color="A0AEC0"/>
                    <w:insideH w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:insideV w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="100" w:type="dxa"/>
                    <w:left w:w="120" w:type="dxa"/>
                    <w:bottom w:w="100" w:type="dxa"/>
                    <w:right w:w="120" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>';

        // Header Row
        $this->bodyXml .= '<w:tr>
            <w:trPr>
                <w:tblHeader/>
            </w:trPr>';
        foreach ($headers as $idx => $header) {
            $w = isset($colWidths[$idx]) ? $colWidths[$idx] : 1500;
            $this->bodyXml .= '<w:tc>
                <w:tcPr>
                    <w:tcW w:w="' . $w . '" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="2B6CB0"/>
                    <w:vAlign w:val="center"/>
                </w:tcPr>
                <w:p>
                    <w:pPr>
                        <w:jc w:val="center"/>
                        <w:spacing w:before="60" w:after="60"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                            <w:b/>
                            <w:sz w:val="25"/>
                            <w:color w:val="FFFFFF"/>
                        </w:rPr>
                        <w:t>' . htmlspecialchars($header) . '</w:t>
                    </w:r>
                </w:p>
            </w:tc>';
        }
        $this->bodyXml .= '</w:tr>';

        // Data Rows
        foreach ($rows as $rIdx => $row) {
            $bg = ($rIdx % 2 === 1) ? 'F7FAFC' : 'FFFFFF';
            $this->bodyXml .= '<w:tr>';
            foreach ($row as $cIdx => $cell) {
                $w = isset($colWidths[$cIdx]) ? $colWidths[$cIdx] : 1500;
                $align = ($cIdx === 0 && count($row) > 3) ? 'center' : 'left';
                $this->bodyXml .= '<w:tc>
                    <w:tcPr>
                        <w:tcW w:w="' . $w . '" w:type="dxa"/>
                        <w:shd w:val="clear" w:color="auto" w:fill="' . $bg . '"/>
                        <w:vAlign w:val="center"/>
                    </w:tcPr>
                    <w:p>
                        <w:pPr>
                            <w:jc w:val="' . $align . '"/>
                            <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
                        </w:pPr>
                        <w:r>
                            <w:rPr>
                                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                                <w:sz w:val="24"/>
                                <w:color w:val="2D3748"/>
                            </w:rPr>
                            <w:t xml:space="preserve">' . htmlspecialchars($cell) . '</w:t>
                        </w:r>
                    </w:p>
                </w:tc>';
            }
            $this->bodyXml .= '</w:tr>';
        }

        $this->bodyXml .= '</w:tbl>
        <w:p><w:pPr><w:spacing w:before="40" w:after="80"/></w:pPr></w:p>';
    }

    public function save()
    {
        if ($this->zip->open($this->filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception("Cannot create file {$this->filename}");
        }

        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>';
        $this->zip->addFromString('[Content_Types].xml', $contentTypes);

        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>';
        $this->zip->addFromString('_rels/.rels', $rels);

        $doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        ' . $this->bodyXml . '
        <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
        </w:sectPr>
    </w:body>
</w:document>';
        $this->zip->addFromString('word/document.xml', $doc);

        $this->zip->close();
        echo "Generated DOCX: {$this->filename}\n";
    }
}

// ----------------------------------------------------
// BẮT ĐẦU TẠO BÁO CÁO TOÀN DIỆN
// ----------------------------------------------------

$docx = new DocxReportBuilder(__DIR__ . '/../BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.docx');

// TIÊU ĐỀ
$docx->addTitle('BÁO CÁO ĐỀ TÀI MÔN HỌC', 'MÔN: HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU');
$docx->addTitle('PHẦN MỀM QUẢN LÝ NHÀ HÀNG', '(Restaurant Management & Smart POS System)');

$docx->addCalloutBox('TỔNG QUAN ĐỀ TÀI', 
"• Tên đề tài: Thiết Kế & Cài Đặt Cơ Sở Dữ Liệu Phần Mềm Quản Lý Nhà Hàng\n" .
"• Lĩnh vực nghiên cứu: Kinh doanh ẩm thực, Nhà hàng F&B (Food & Beverage)\n" .
"• Hệ quản trị CSDL: MySQL 8.0+ / MariaDB 10.4+ (InnoDB Engine)\n" .
"• Nền tảng ứng dụng: Laravel Framework (PHP) + HTML5/CSS3/JavaScript\n" .
"• Bảng danh mục: LOAI_MON, MON_AN, BAN, KHACH_HANG, USERS, NGUYEN_LIEU, NHA_CUNG_CAP\n" .
"• Bảng nghiệp vụ lớn (>1000 records): DAT_MON (Gọi món & Hóa đơn chi tiết), DAT_BAN_TRUOC, DON_DAT_HANG_NCC (PO), LO_HANG_NHAP",
'1A365D', 'EBF8FF');

// ====================================================
// PHẦN 1: KHẢO SÁT NGHIỆP VỤ ĐỀ TÀI
// ====================================================
$docx->addHeading1('PHẦN 1: KHẢO SÁT NGHIỆP VỤ ĐỀ TÀI');

$docx->addHeading2('1.1. Lĩnh vực hoạt động');
$docx->addParagraph('Ngành kinh doanh dịch vụ ăn uống và nhà hàng (F&B) đòi hỏi tốc độ phục vụ nhanh, độ chính xác cao trong việc tiếp nhận gọi món, điều phối chế biến tại bếp và thanh toán. Để giải quyết các nhược điểm của phương thức vận hành thủ công truyền thống (nhầm lẫn món, thất thoát nguyên liệu, nghẽn thanh toán giờ cao điểm), hệ thống Phần Mềm Quản Lý Nhà Hàng được thiết kế để tự động hóa toàn bộ quy trình nghiệp vụ:');
$docx->addBullet('Khách hàng tự gọi món tại bàn bằng cách quét mã QR định danh bàn ăn trên thiết bị cá nhân.');
$docx->addBullet('Hệ thống Màn hình Bếp KDS (Kitchen Display System) tiếp nhận yêu cầu theo thời gian thực.');
$docx->addBullet('Kiểm soát tồn kho nguyên vật liệu theo công thức định lượng món ăn (BOM) và cơ chế FIFO.');
$docx->addBullet('Quản lý chuỗi cung ứng: So sánh báo giá nhà cung cấp, đấu thầu PO tự động.');
$docx->addBullet('Thanh toán đa kênh (Tiền mặt, VietQR), hỗ trợ tách bill và chương trình khách hàng thân thiết CRM.');

$docx->addHeading2('1.2. Các đối tượng tham gia hệ thống');
$docx->addTable(
    ['Đối tượng', 'Vai trò trong hệ thống', 'Nhiệm vụ & Quyền hạn chính'],
    [
        ['Khách hàng (Customer)', 'Người sử dụng dịch vụ', 'Xem thực đơn, đặt bàn trước, quét mã QR gọi món tại bàn, yêu cầu thanh toán và đánh giá chất lượng món ăn.'],
        ['Nhân viên phục vụ (Waiter)', 'Bộ phận sảnh & phục vụ', 'Mở bàn, tiếp nhận khách, hỗ trợ gọi món tại chỗ, xác nhận món, bưng món đã nấu ra bàn và kiểm tra thanh toán.'],
        ['Thu ngân (Cashier)', 'Bộ phận thu chi & hóa đơn', 'In hóa đơn, áp dụng khuyến mãi/voucher/điểm thưởng, thực hiện thanh toán tổng/tách bill, xác nhận tiền vào tài khoản.'],
        ['Đầu bếp / Bếp trưởng (Chef)', 'Bộ phận chế biến', 'Theo dõi màn hình KDS, tiếp nhận món cần nấu theo độ ưu tiên, cập nhật trạng thái đang nấu/hoàn thành, ghi nhận hao hụt kho.'],
        ['Quản lý / Quản trị viên (Admin)', 'Bộ phận điều hành & quản trị', 'Quản lý thực đơn, định mức nguyên liệu, nhân sự, kho bãi, duyệt đơn đặt mua hàng NCC, chốt doanh thu ca và xuất báo cáo.']
    ],
    [2000, 2200, 5200]
);

$docx->addHeading2('1.3. Các chức năng chính của hệ thống');
$docx->addBullet('Quản lý Thực đơn & Danh mục (Menu Management): Thêm, cập nhật món, loại món, giá bán, tùy chọn Topping/Modifier và định lượng nguyên liệu.');
$docx->addBullet('Quản lý Bàn ăn & Đặt bàn trước (Table & Reservation): Quản lý sơ đồ bàn trực quan theo tầng, tiếp nhận lịch đặt bàn, tiền cọc và giờ hẹn.');
$docx->addBullet('Gọi món tự động qua QR Code (Self-Ordering): Thực khách quét QR tại bàn, chọn món trực tiếp, gửi order tức thì xuống quầy thu ngân và bếp.');
$docx->addBullet('Màn hình Bếp KDS Pro (Kitchen Display System): Hiển thị danh sách món cần nấu, sắp xếp theo thời gian chờ và thứ tự ưu tiên bàn.');
$docx->addBullet('Quản lý Kho & Định lượng (Inventory & BOM): Quản lý tồn kho theo hạn sử dụng (FIFO), tự động trừ kho nguyên liệu khi nấu món.');
$docx->addBullet('Quản lý Mua hàng & Nhà cung cấp (Procurement & PO): Lưu ma trận báo giá, so sánh giá NCC, tự động tạo PO đơn mua hàng.');
$docx->addBullet('Thanh toán & CRM Thân thiết (POS & Loyalty): Thanh toán tiền mặt, chuyển khoản VietQR, tách bill, tích điểm và phân hạng hội viên.');
$docx->addBullet('Báo cáo & Thống kê kinh doanh (Reporting & Analytics): Thống kê doanh thu theo ngày/tháng, top món bán chạy, quản lý sao lưu dữ liệu.');

$docx->addHeading2('1.4. Các quy trình nghiệp vụ và quy định nghiệp vụ tương ứng');

$docx->addHeading3('a) Quy trình nghiệp vụ 1: Tiếp nhận Đặt bàn trước (Reservation)');
$docx->addCalloutBox('SƠ ĐỒ QUY TRÌNH TIẾP NHẬN ĐẶT BÀN TRƯỚC',
"1. Khách gửi yêu cầu đặt bàn (Tên, SĐT, Số lượng khách, Giờ hẹn, Ghi chú)\n" .
"2. Nhân viên kiểm tra sơ đồ bàn & tính khả dụng của bàn trong khung giờ hẹn\n" .
"3. Ghi nhận phiếu đặt bàn & Thu tiền đặt cọc (đối với tiệc đông người)\n" .
"4. Cập nhật trạng thái bàn sang 'Đã đặt' (da_dat) để khóa không nhận khách vãng lai\n" .
"5. Khách đến nhà hàng → Nhân viên đối soát mã đặt bàn → Chuyển sang 'Có khách' (co_khach) → Bắt đầu gọi món",
'2B6CB0', 'EBF8FF');
$docx->addParagraph('Quy định nghiệp vụ 1:');
$docx->addBullet('Khách hàng phải đặt bàn trước giờ hẹn tối thiểu 30 phút.');
$docx->addBullet('Số lượng khách đặt không được vượt quá sức chứa tối đa của bàn.');
$docx->addBullet('Nếu quá 45 phút kể từ giờ hẹn mà khách không đến nhận bàn, hệ thống tự động chuyển trạng thái bàn về "Trống" (trong).');

$docx->addHeading3('b) Quy trình nghiệp vụ 2: Khách hàng gọi món (QR Code) & Điều phối chế biến KDS');
$docx->addCalloutBox('SƠ ĐỒ QUY TRÌNH GỌI MÓN VÀ CHẾ BIẾN TẠI BẾP',
"1. Khách quét mã QR tại bàn → Xem thực đơn điện tử & Chọn món + Topping\n" .
"2. Khách ấn 'Gửi đơn gọi món' → Hệ thống kiểm tra số lượng tồn kho nguyên liệu (BOM)\n" .
"3. Tạo bản ghi gọi món trong bảng DAT_MON với trạng thái 'Chờ xác nhận'\n" .
"4. Màn hình Bếp KDS nhận tín hiệu Real-time → Bếp nhận đơn & chuyển 'Đang chế biến'\n" .
"5. Hệ thống tự động trừ kho nguyên liệu theo lô hàng nhập FIFO\n" .
"6. Bếp hoàn tất món → Chuyển trạng thái 'Đã phục vụ' → Nhân viên bưng món ra bàn",
'2B6CB0', 'EBF8FF');
$docx->addParagraph('Quy định nghiệp vụ 2:');
$docx->addBullet('Số lượng đặt của mỗi món phải lớn hơn 0 (so_luong > 0).');
$docx->addBullet('Chỉ cho phép gọi món khi bàn đang ở trạng thái "Có khách" (co_khach).');
$docx->addBullet('Nếu tồn kho nguyên liệu không đủ để chế biến, hệ thống phải từ chối và cảnh báo hết món.');

$docx->addHeading3('c) Quy trình nghiệp vụ 3: Thanh toán Hóa đơn, Tách Bill và Tích điểm CRM');
$docx->addCalloutBox('SƠ ĐỒ QUY TRÌNH THANH TOÁN VÀ TÍCH ĐIỂM',
"1. Khách bấm 'Yêu cầu thanh toán' trên app QR hoặc báo Nhân viên\n" .
"2. Thu ngân kiểm tra tổng tiền tất cả các món ăn trên bàn\n" .
"3. Khách lựa chọn: Thanh toán toàn bộ hoặc Tách hóa đơn (Split Bill)\n" .
"4. Nhập thông tin Khách hàng CRM để áp dụng giảm giá điểm thưởng và tính thuế VAT\n" .
"5. Khách chọn hình thức: Tiền mặt hoặc Chuyển khoản VietQR\n" .
"6. Cập nhật các món sang 'Hoàn thành' (hoan_thanh) → Tích 1% điểm cho khách → Giải phóng bàn về 'Trống'",
'2B6CB0', 'EBF8FF');
$docx->addParagraph('Quy định nghiệp vụ 3:');
$docx->addBullet('Hóa đơn đã thanh toán (hoan_thanh) không được phép chỉnh sửa số lượng hay đơn giá.');
$docx->addBullet('Bàn ăn chỉ được chuyển về trạng thái "Trống" khi toàn bộ các món trên bàn đã thanh toán 100%.');
$docx->addBullet('Điểm tích lũy được tính theo tỷ lệ: 100.000 VNĐ chi tiêu = 1 điểm thưởng (1 điểm = 1.000 VNĐ giảm giá cho lần sau).');

$docx->addHeading2('1.5. Các chứng từ, báo cáo mà hệ thống cần quản lý');
$docx->addTable(
    ['STT', 'Tên chứng từ / Báo cáo', 'Mục đích sử dụng', 'Tần suất phát sinh'],
    [
        ['1', 'Phiếu Đặt Bàn (Reservation Slip)', 'Ghi nhận thông tin giữ chỗ, tiền cọc và thời gian hẹn dùng bữa.', 'Khi có khách đặt trước'],
        ['2', 'Phiếu Gọi Món (Kitchen Order Ticket - KOT)', 'Truyền thông tin món ăn, topping và ghi chú từ bàn xuống bếp chế biến.', 'Theo từng lượt gọi món'],
        ['3', 'Hóa Đơn Thanh Toán (Sales Invoice / Receipt)', 'Thu tiền của khách, thể hiện chi tiết tiền món, giảm giá và thuế VAT.', 'Khi kết thúc bữa ăn'],
        ['4', 'Đơn Đặt Mua Hàng NCC (Purchase Order - PO)', 'Gửi đơn đặt mua nguyên vật liệu cho nhà cung cấp.', 'Khi kho chạm ngưỡng'],
        ['5', 'Phiếu Nhập Kho (Goods Receipt Note)', 'Xác nhận số lượng, đơn giá và hạn sử dụng của lô nguyên liệu nhập.', 'Khi nhận hàng NCC'],
        ['6', 'Biên Bản Hao Hụt (Waste / Loss Slip)', 'Ghi nhận nguyên vật liệu hỏng, ôi thiu hoặc quá hạn cần hủy.', 'Khi kiểm kê ca trực'],
        ['7', 'Báo Cáo Doanh Thu Ca / Ngày', 'Tổng hợp doanh thu, lượng khách, tỷ trọng tiền mặt vs chuyển khoản.', 'Cuối ca / Cuối ngày'],
        ['8', 'Báo Cáo Tồn Kho FIFO', 'Cảnh báo nguyên vật liệu sắp hết hạn và dưới định mức an toàn.', 'Hàng ngày']
    ],
    [800, 2600, 4200, 1800]
);

// ====================================================
// PHẦN 2: THIẾT KẾ HỆ THỐNG CƠ SỞ DỮ LIỆU
// ====================================================
$docx->addHeading1('PHẦN 2: THIẾT KẾ HỆ THỐNG CƠ SỞ DỮ LIỆU');

$docx->addHeading2('2.1. Lược đồ quan hệ CSDL (Dạng dòng chuẩn)');
$docx->addParagraph('Quy ước ký hiệu: Thuộc tính gạch chân là Khóa chính (Primary Key), thuộc tính có tiền tố dấu thăng (#) là Khóa ngoại (Foreign Key).');

$docx->addParagraph('1. LOAI_MON (id, ma_loai, ten_loai, created_at, updated_at)', true);
$docx->addParagraph('2. MON_AN (id, ten_mon, #loai_mon_id, gia, mo_ta, hinh_anh, trang_thai, created_at, updated_at)', true);
$docx->addParagraph('3. MON_AN_MODIFIERS (id, #mon_an_id, ten_modifier, gia_tang_them, #nguyen_lieu_id, luong_tieu_hao, created_at, updated_at)', true);
$docx->addParagraph('4. BAN (id, so_ban, suc_chua, trang_thai, khu_vuc, yeu_cau_thanh_toan, so_luong_khach, created_at, updated_at)', true);
$docx->addParagraph('5. DAT_BAN_TRUOC (id, ma_reservation, ten_khach, sdt, #ban_id, thoi_gian_hen, so_luong_khach, tien_coc, trang_thai, ghi_chu, created_at, updated_at)', true);
$docx->addParagraph('6. KHACH_HANG (id, ho_ten, so_dien_thoai, email, diem_tich_luy, hang_thanh_vien, tong_chi_tieu, created_at, updated_at)', true);
$docx->addParagraph('7. USERS (id, name, email, password, role, so_dien_thoai, trang_thai, created_at, updated_at)', true);
$docx->addParagraph('8. NGUYEN_LIEU (id, ten_nguyen_lieu, don_vi_tinh, so_luong_ton, gia_nhap_trung_binh, dinh_muc_toi_thieu, han_su_dung, created_at, updated_at)', true);
$docx->addParagraph('9. MON_AN_NGUYEN_LIEU (id, #mon_an_id, #nguyen_lieu_id, so_luong_can, don_vi_tinh, created_at, updated_at)', true);
$docx->addParagraph('10. NHA_CUNG_CAP (id, ma_ncc, ten_ncc, so_dien_thoai, email, dia_chi, danh_gia_sao, created_at, updated_at)', true);
$docx->addParagraph('11. NHA_CUNG_CAP_NGUYEN_LIEU (id, #nha_cung_cap_id, #nguyen_lieu_id, don_gia_chao, don_vi_tinh, moq, thoi_gian_giao_ngay, created_at, updated_at)', true);
$docx->addParagraph('12. DON_DAT_HANG_NCC (id, ma_don_po, #nha_cung_cap_id, ngay_dat, du_kien_giao, tong_tien, trang_thai, ghi_chu, created_at, updated_at)', true);
$docx->addParagraph('13. CHI_TIET_DON_DAT_HANG_NCC (id, #don_dat_hang_ncc_id, #nguyen_lieu_id, so_luong_dat, don_gia_dat, thanh_tien, created_at, updated_at)', true);
$docx->addParagraph('14. DON_NHAP_HANG (id, ma_don, #nha_cung_cap_id, ngay_nhap, tong_tien, #user_id, trang_thai, created_at, updated_at)', true);
$docx->addParagraph('15. LO_HANG_NHAP (id, ma_lo, #nguyen_lieu_id, #don_nhap_hang_id, #nha_cung_cap_id, ngay_nhap, ngay_het_han, so_luong_nhap, so_luong_con_lai, don_gia_nhap, created_at, updated_at)', true);
$docx->addParagraph('16. DAT_MON [Bảng nghiệp vụ chính] (id, #ban_id, #mon_an_id, #khach_hang_id, so_luong, don_gia, tong_tien, options_json, ghi_chu, trang_thai, phuong_thuc_thanh_toan, session_token, thu_tu_uu_tien, so_luong_khach, created_at, updated_at)', true);
$docx->addParagraph('17. CHI_TIET_TIEU_HAO_DAT_MON (id, #dat_mon_id, #nguyen_lieu_id, #lo_hang_nhap_id, so_luong_tieu_hao, don_gia_von, created_at, updated_at)', true);
$docx->addParagraph('18. DANH_GIA_MON_AN (id, #dat_mon_id, #ban_id, so_sao, noi_dung_danh_gia, canh_bao_do, created_at, updated_at)', true);
$docx->addParagraph('19. BAO_CAO_QUAN_LY (id, ma_bao_cao, ngay_lap, nguoi_lap, ca_lam_viec, tong_so_hoa_don, tong_luong_khach, tong_doanh_thu, doanh_thu_tien_mat, doanh_thu_chuyen_khoan, created_at, updated_at)', true);

$docx->addHeading2('2.2. Thiết kế CSDL & Scripts');
$docx->addParagraph('Cơ sở dữ liệu được tổ chức lưu trữ trên hệ quản trị MySQL / MariaDB theo chuẩn InnoDB nhằm đảm bảo các thuộc tính ACID của giao tác. Toàn bộ script DDL tạo bảng, ràng buộc và Index được trình bày dưới đây:');

$docx->addCodeBlock(
"-- =========================================================================\n" .
"-- TẠO CƠ SỞ DỮ LIỆU VÀ CÁC BẢNG QUẢN LÝ NHÀ HÀNG\n" .
"-- =========================================================================\n" .
"CREATE DATABASE IF NOT EXISTS `quan_ly_nha_hang` \n" .
"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n" .
"USE `quan_ly_nha_hang`;\n\n" .
"-- 1. Bảng Loại Món\n" .
"CREATE TABLE IF NOT EXISTS `loai_mon` (\n" .
"    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n" .
"    `ma_loai` VARCHAR(20) NOT NULL UNIQUE,\n" .
"    `ten_loai` VARCHAR(100) NOT NULL,\n" .
"    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" .
"    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n" .
") ENGINE=InnoDB;\n\n" .
"-- 2. Bảng Món Ăn\n" .
"CREATE TABLE IF NOT EXISTS `mon_an` (\n" .
"    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n" .
"    `ten_mon` VARCHAR(150) NOT NULL,\n" .
"    `loai_mon_id` BIGINT UNSIGNED NULL,\n" .
"    `gia` DOUBLE NOT NULL DEFAULT 0 CHECK (`gia` >= 0),\n" .
"    `mo_ta` TEXT NULL,\n" .
"    `hinh_anh` VARCHAR(255) NULL,\n" .
"    `trang_thai` ENUM('con_hang', 'tam_het', 'ngung_ban') DEFAULT 'con_hang',\n" .
"    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" .
"    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n" .
"    CONSTRAINT `fk_mon_an_loai` FOREIGN KEY (`loai_mon_id`) REFERENCES `loai_mon`(`id`) ON DELETE SET NULL\n" .
") ENGINE=InnoDB;\n\n" .
"-- 3. Bảng Bàn Ăn\n" .
"CREATE TABLE IF NOT EXISTS `ban` (\n" .
"    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n" .
"    `so_ban` INT NOT NULL UNIQUE CHECK (`so_ban` > 0),\n" .
"    `suc_chua` INT NOT NULL DEFAULT 4 CHECK (`suc_chua` > 0),\n" .
"    `trang_thai` ENUM('trong', 'co_khach', 'da_dat') DEFAULT 'trong',\n" .
"    `khu_vuc` VARCHAR(50) DEFAULT 'Tầng 1',\n" .
"    `yeu_cau_thanh_toan` TINYINT(1) DEFAULT 0,\n" .
"    `so_luong_khach` INT DEFAULT 0,\n" .
"    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" .
"    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n" .
") ENGINE=InnoDB;\n\n" .
"-- 4. Bảng Khách Hàng (CRM)\n" .
"CREATE TABLE IF NOT EXISTS `khach_hang` (\n" .
"    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n" .
"    `ho_ten` VARCHAR(100) NOT NULL,\n" .
"    `so_dien_thoai` VARCHAR(20) NOT NULL UNIQUE,\n" .
"    `email` VARCHAR(100) NULL,\n" .
"    `diem_tich_luy` INT DEFAULT 0 CHECK (`diem_tich_luy` >= 0),\n" .
"    `hang_thanh_vien` ENUM('Dong', 'Bac', 'Vang', 'KimCuong') DEFAULT 'Dong',\n" .
"    `tong_chi_tieu` DOUBLE DEFAULT 0 CHECK (`tong_chi_tieu` >= 0),\n" .
"    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" .
"    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n" .
") ENGINE=InnoDB;\n\n" .
"-- 5. Bảng Nghiệp Vụ Chính: Đặt Món & Hóa Đơn (DAT_MON - >1.000 records)\n" .
"CREATE TABLE IF NOT EXISTS `dat_mon` (\n" .
"    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n" .
"    `ban_id` BIGINT UNSIGNED NOT NULL,\n" .
"    `mon_an_id` BIGINT UNSIGNED NOT NULL,\n" .
"    `khach_hang_id` BIGINT UNSIGNED NULL,\n" .
"    `so_luong` INT NOT NULL DEFAULT 1 CHECK (`so_luong` > 0),\n" .
"    `don_gia` DOUBLE NOT NULL DEFAULT 0 CHECK (`don_gia` >= 0),\n" .
"    `tong_tien` DOUBLE NOT NULL DEFAULT 0 CHECK (`tong_tien` >= 0),\n" .
"    `options_json` TEXT NULL,\n" .
"    `ghi_chu` VARCHAR(255) NULL,\n" .
"    `trang_thai` ENUM('cho_xac_nhan', 'dang_che_bien', 'da_phuc_vu', 'hoan_thanh', 'da_huy') DEFAULT 'cho_xac_nhan',\n" .
"    `phuong_thuc_thanh_toan` ENUM('tien_mat', 'chuyen_khoan', 'the', 'chua_thanh_toan') DEFAULT 'chua_thanh_toan',\n" .
"    `session_token` VARCHAR(100) NULL,\n" .
"    `thu_tu_uu_tien` INT DEFAULT 1,\n" .
"    `so_luong_khach` INT DEFAULT 0,\n" .
"    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,\n" .
"    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n" .
"    CONSTRAINT `fk_dat_mon_ban` FOREIGN KEY (`ban_id`) REFERENCES `ban`(`id`) ON DELETE CASCADE,\n" .
"    CONSTRAINT `fk_dat_mon_mon` FOREIGN KEY (`mon_an_id`) REFERENCES `mon_an`(`id`) ON DELETE CASCADE,\n" .
"    CONSTRAINT `fk_dat_mon_khach` FOREIGN KEY (`khach_hang_id`) REFERENCES `khach_hang`(`id`) ON DELETE SET NULL\n" .
") ENGINE=InnoDB;\n\n" .
"-- Tạo Index tối ưu hóa truy vấn\n" .
"CREATE INDEX `idx_dat_mon_ban_trangthai` ON `dat_mon` (`ban_id`, `trang_thai`);\n" .
"CREATE INDEX `idx_dat_mon_created_at` ON `dat_mon` (`created_at`);\n" .
"CREATE INDEX `idx_ban_trang_thai` ON `ban` (`trang_thai`);"
);

$docx->addHeading2('2.3. Thiết kế các Stored Procedure (4 Stored Procedures)');

// SP 1
$docx->addHeading3('Stored Procedure 1: sp_ThemMonGoiVaKiemTraTonKho');
$docx->addBullet('Mục đích: Tiếp nhận thêm món gọi mới vào bàn ăn, tự động tính tổng tiền theo đơn giá món, cập nhật trạng thái bàn sang "Có khách".');
$docx->addBullet('Tham số vào (IN): p_ban_id (BIGINT), p_mon_an_id (BIGINT), p_khach_id (BIGINT), p_so_luong (INT), p_options_json (TEXT), p_ghi_chu (VARCHAR).');
$docx->addBullet('Tham số ra (OUT): p_dat_mon_id (BIGINT), p_status (VARCHAR), p_message (VARCHAR).');
$docx->addBullet('Các bước xử lý: 1. Kiểm tra tồn tại món; 2. Tính tổng tiền; 3. Insert vào dat_mon; 4. Cập nhật ban.trang_thai = "co_khach"; 5. Trả về mã đơn.');

$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE PROCEDURE `sp_ThemMonGoiVaKiemTraTonKho`(\n" .
"    IN  p_ban_id        BIGINT,\n" .
"    IN  p_mon_an_id     BIGINT,\n" .
"    IN  p_khach_id      BIGINT,\n" .
"    IN  p_so_luong      INT,\n" .
"    IN  p_options_json  TEXT,\n" .
"    IN  p_ghi_chu       VARCHAR(255),\n" .
"    OUT p_dat_mon_id    BIGINT,\n" .
"    OUT p_status        VARCHAR(20),\n" .
"    OUT p_message       VARCHAR(255)\n" .
")\n" .
"BEGIN\n" .
"    DECLARE v_gia_mon DOUBLE DEFAULT 0;\n" .
"    DECLARE v_trang_thai_mon VARCHAR(50);\n" .
"    DECLARE v_tong_tien DOUBLE DEFAULT 0;\n\n" .
"    -- 1. Kiểm tra món ăn\n" .
"    SELECT `gia`, `trang_thai` INTO v_gia_mon, v_trang_thai_mon \n" .
"    FROM `mon_an` WHERE `id` = p_mon_an_id;\n\n" .
"    IF v_gia_mon IS NULL THEN\n" .
"        SET p_status = 'ERROR';\n" .
"        SET p_message = 'Món ăn không tồn tại trong thực đơn!';\n" .
"    ELSEIF v_trang_thai_mon = 'ngung_ban' OR v_trang_thai_mon = 'tam_het' THEN\n" .
"        SET p_status = 'ERROR';\n" .
"        SET p_message = 'Món ăn hiện đang tạm hết hoặc ngưng phục vụ!';\n" .
"    ELSEIF p_so_luong <= 0 THEN\n" .
"        SET p_status = 'ERROR';\n" .
"        SET p_message = 'Số lượng món đặt phải lớn hơn 0!';\n" .
"    ELSE\n" .
"        -- 2. Tính tổng tiền\n" .
"        SET v_tong_tien = v_gia_mon * p_so_luong;\n\n" .
"        -- 3. Ghi nhận gọi món\n" .
"        INSERT INTO `dat_mon` (\n" .
"            `ban_id`, `mon_an_id`, `khach_hang_id`, `so_luong`,\n" .
"            `don_gia`, `tong_tien`, `options_json`, `ghi_chu`, `trang_thai`\n" .
"        ) VALUES (\n" .
"            p_ban_id, p_mon_an_id, p_khach_id, p_so_luong,\n" .
"            v_gia_mon, v_tong_tien, p_options_json, p_ghi_chu, 'cho_xac_nhan'\n" .
"        );\n" .
"        SET p_dat_mon_id = LAST_INSERT_ID();\n\n" .
"        -- 4. Cập nhật bàn\n" .
"        UPDATE `ban` SET `trang_thai` = 'co_khach' WHERE `id` = p_ban_id;\n" .
"        SET p_status = 'SUCCESS';\n" .
"        SET p_message = 'Thêm món thành công vào bàn!';\n" .
"    END IF;\n" .
"END //\n" .
"DELIMITER ;"
);
$docx->addCalloutBox('KẾT QUẢ THỰC THI THỬ NGHIỆM',
"CALL sp_ThemMonGoiVaKiemTraTonKho(1, 2, 10, 2, NULL, 'Không ớt', @id, @st, @msg);\n" .
"SELECT @id AS MaDatMon, @st AS TrangThai, @msg AS ThongBao;\n" .
"==> Kết quả: MaDatMon = 1201, TrangThai = 'SUCCESS', ThongBao = 'Thêm món thành công vào bàn!'",
'38A169', 'F0FFF4');

// SP 2
$docx->addHeading3('Stored Procedure 2: sp_ThanhToanHoaDonBanAn');
$docx->addBullet('Mục đích: Thanh toán toàn bộ hóa đơn của bàn, áp dụng trừ điểm tích lũy CRM, cập nhật các món sang "hoan_thanh", tích lũy điểm mới và giải phóng bàn về "trong".');
$docx->addBullet('Tham số vào (IN): p_ban_id (BIGINT), p_pttt (VARCHAR), p_khach_id (BIGINT), p_diem_dung (INT).');
$docx->addBullet('Tham số ra (OUT): p_tam_tinh (DOUBLE), p_giam_gia (DOUBLE), p_thuc_thu (DOUBLE), p_diem_moi (INT), p_status (VARCHAR).');

$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE PROCEDURE `sp_ThanhToanHoaDonBanAn`(\n" .
"    IN  p_ban_id        BIGINT,\n" .
"    IN  p_pttt          VARCHAR(50),\n" .
"    IN  p_khach_id      BIGINT,\n" .
"    IN  p_diem_dung     INT,\n" .
"    OUT p_tam_tinh      DOUBLE,\n" .
"    OUT p_giam_gia      DOUBLE,\n" .
"    OUT p_thuc_thu      DOUBLE,\n" .
"    OUT p_diem_moi      INT,\n" .
"    OUT p_status        VARCHAR(20)\n" .
")\n" .
"BEGIN\n" .
"    DECLARE v_diem_hien_tai INT DEFAULT 0;\n" .
"    DECLARE v_diem_tich_them INT DEFAULT 0;\n\n" .
"    SELECT IFNULL(SUM(`tong_tien`), 0) INTO p_tam_tinh \n" .
"    FROM `dat_mon` \n" .
"    WHERE `ban_id` = p_ban_id AND `trang_thai` NOT IN ('da_huy', 'hoan_thanh');\n\n" .
"    IF p_tam_tinh <= 0 THEN\n" .
"        SET p_status = 'EMPTY_BILL';\n" .
"        SET p_giam_gia = 0;\n" .
"        SET p_thuc_thu = 0;\n" .
"    ELSE\n" .
"        SET p_giam_gia = 0;\n" .
"        IF p_khach_id IS NOT NULL AND p_diem_dung > 0 THEN\n" .
"            SELECT `diem_tich_luy` INTO v_diem_hien_tai FROM `khach_hang` WHERE `id` = p_khach_id;\n" .
"            IF v_diem_hien_tai >= p_diem_dung THEN\n" .
"                SET p_giam_gia = p_diem_dung * 1000;\n" .
"                IF p_giam_gia > p_tam_tinh THEN SET p_giam_gia = p_tam_tinh; END IF;\n" .
"            END IF;\n" .
"        END IF;\n\n" .
"        SET p_thuc_thu = p_tam_tinh - p_giam_gia;\n\n" .
"        UPDATE `dat_mon` \n" .
"        SET `trang_thai` = 'hoan_thanh', `phuong_thuc_thanh_toan` = p_pttt\n" .
"        WHERE `ban_id` = p_ban_id AND `trang_thai` NOT IN ('da_huy', 'hoan_thanh');\n\n" .
"        IF p_khach_id IS NOT NULL THEN\n" .
"            SET v_diem_tich_them = FLOOR(p_thuc_thu / 100000);\n" .
"            UPDATE `khach_hang` \n" .
"            SET `diem_tich_luy` = `diem_tich_luy` - p_diem_dung + v_diem_tich_them,\n" .
"                `tong_chi_tieu` = `tong_chi_tieu` + p_thuc_thu\n" .
"            WHERE `id` = p_khach_id;\n" .
"            SELECT `diem_tich_luy` INTO p_diem_moi FROM `khach_hang` WHERE `id` = p_khach_id;\n" .
"        END IF;\n\n" .
"        UPDATE `ban` SET `trang_thai` = 'trong', `yeu_cau_thanh_toan` = 0, `so_luong_khach` = 0 WHERE `id` = p_ban_id;\n" .
"        SET p_status = 'SUCCESS';\n" .
"    END IF;\n" .
"END //\n" .
"DELIMITER ;"
);

// SP 3
$docx->addHeading3('Stored Procedure 3: sp_ThongKeDoanhThuVaTopMonBanChay');
$docx->addBullet('Mục đích: Báo cáo tổng hợp doanh thu theo khoảng thời gian chỉ định, phân tích doanh thu tiền mặt, chuyển khoản và Top N món ăn bán chạy nhất.');
$docx->addBullet('Tham số vào (IN): p_tu_ngay (DATE), p_den_ngay (DATE), p_top_limit (INT).');

$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE PROCEDURE `sp_ThongKeDoanhThuVaTopMonBanChay`(\n" .
"    IN p_tu_ngay    DATE,\n" .
"    IN p_den_ngay   DATE,\n" .
"    IN p_top_limit  INT\n" .
")\n" .
"BEGIN\n" .
"    -- Kết quả 1: Tổng quan doanh thu\n" .
"    SELECT \n" .
"        COUNT(`id`) AS `tong_so_luot_goi_mon`,\n" .
"        IFNULL(SUM(`tong_tien`), 0) AS `tong_doanh_thu`,\n" .
"        IFNULL(SUM(CASE WHEN `phuong_thuc_thanh_toan` = 'tien_mat' THEN `tong_tien` ELSE 0 END), 0) AS `doanh_thu_tien_mat`,\n" .
"        IFNULL(SUM(CASE WHEN `phuong_thuc_thanh_toan` = 'chuyen_khoan' THEN `tong_tien` ELSE 0 END), 0) AS `doanh_thu_chuyen_khoan`\n" .
"    FROM `dat_mon`\n" .
"    WHERE `trang_thai` = 'hoan_thanh'\n" .
"      AND DATE(`created_at`) BETWEEN p_tu_ngay AND p_den_ngay;\n\n" .
"    -- Kết quả 2: Top món ăn bán chạy\n" .
"    SELECT \n" .
"        m.`id` AS `ma_mon`,\n" .
"        m.`ten_mon`,\n" .
"        l.`ten_loai`,\n" .
"        SUM(d.`so_luong`) AS `tong_so_luong_ban`,\n" .
"        SUM(d.`tong_tien`) AS `tong_doanh_thu_mon`\n" .
"    FROM `dat_mon` d\n" .
"    JOIN `mon_an` m ON d.`mon_an_id` = m.`id`\n" .
"    LEFT JOIN `loai_mon` l ON m.`loai_mon_id` = l.`id`\n" .
"    WHERE d.`trang_thai` = 'hoan_thanh'\n" .
"      AND DATE(d.`created_at`) BETWEEN p_tu_ngay AND p_den_ngay\n" .
"    GROUP BY m.`id`, m.`ten_mon`, l.`ten_loai`\n" .
"    ORDER BY `tong_so_luong_ban` DESC\n" .
"    LIMIT p_top_limit;\n" .
"END //\n" .
"DELIMITER ;"
);

$docx->addHeading2('2.4. Thiết kế các Function (3 Functions)');

// FN 1
$docx->addHeading3('Function 1: fn_TinhTongTienSauGiamGia');
$docx->addBullet('Mục đích: Tính số tiền thanh toán cuối cùng sau khi trừ điểm tích lũy thành viên và cộng thuế VAT.');
$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE FUNCTION `fn_TinhTongTienSauGiamGia`(\n" .
"    p_tam_tinh      DOUBLE,\n" .
"    p_diem_dung     INT,\n" .
"    p_vat_percent   DOUBLE\n" .
")\n" .
"RETURNS DOUBLE\n" .
"DETERMINISTIC\n" .
"BEGIN\n" .
"    DECLARE v_tien_giam DOUBLE DEFAULT 0;\n" .
"    DECLARE v_tien_sau_giam DOUBLE DEFAULT 0;\n" .
"    DECLARE v_tong_thanh_toan DOUBLE DEFAULT 0;\n\n" .
"    IF p_tam_tinh <= 0 THEN RETURN 0; END IF;\n" .
"    SET v_tien_giam = IFNULL(p_diem_dung, 0) * 1000;\n" .
"    IF v_tien_giam > p_tam_tinh THEN SET v_tien_giam = p_tam_tinh; END IF;\n" .
"    SET v_tien_sau_giam = p_tam_tinh - v_tien_giam;\n" .
"    SET v_tong_thanh_toan = v_tien_sau_giam * (1 + IFNULL(p_vat_percent, 0) / 100);\n" .
"    RETURN ROUND(v_tong_thanh_toan, 0);\n" .
"END //\n" .
"DELIMITER ;"
);
$docx->addCalloutBox('MINH HỌA KẾT QUẢ',
"SELECT fn_TinhTongTienSauGiamGia(500000, 50, 8.0) AS SoTienCanThanhToan;\n" .
"==> Kết quả: 486,000 VNĐ (500k trừ 50k điểm còn 450k + 8% VAT = 486k)",
'38A169', 'F0FFF4');

// FN 2
$docx->addHeading3('Function 2: fn_KiemTraBanKhaDung');
$docx->addBullet('Mục đích: Kiểm tra xem một bàn cụ thể có đang khả dụng (không có khách và không trùng lịch đặt trong khoảng +-2 giờ) tại một thời điểm hay không.');
$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE FUNCTION `fn_KiemTraBanKhaDung`(\n" .
"    p_ban_id        BIGINT,\n" .
"    p_thoi_gian_hen DATETIME\n" .
")\n" .
"RETURNS TINYINT(1)\n" .
"READS SQL DATA\n" .
"BEGIN\n" .
"    DECLARE v_trang_thai_hien_tai VARCHAR(20);\n" .
"    DECLARE v_so_lich_trung INT DEFAULT 0;\n\n" .
"    SELECT `trang_thai` INTO v_trang_thai_hien_tai FROM `ban` WHERE `id` = p_ban_id;\n" .
"    IF v_trang_thai_hien_tai = 'co_khach' THEN RETURN 0; END IF;\n\n" .
"    SELECT COUNT(*) INTO v_so_lich_trung \n" .
"    FROM `dat_ban_truoc`\n" .
"    WHERE `ban_id` = p_ban_id\n" .
"      AND `trang_thai` = 'da_xac_nhan'\n" .
"      AND `thoi_gian_hen` BETWEEN DATE_SUB(p_thoi_gian_hen, INTERVAL 2 HOUR) \n" .
"                              AND DATE_ADD(p_thoi_gian_hen, INTERVAL 2 HOUR);\n\n" .
"    IF v_so_lich_trung > 0 THEN RETURN 0; END IF;\n" .
"    RETURN 1;\n" .
"END //\n" .
"DELIMITER ;"
);

// FN 3
$docx->addHeading3('Function 3: fn_XepHangKhachHang');
$docx->addBullet('Mục đích: Tự động phân loại thứ hạng hội viên (Đồng, Bạc, Vàng, Kim Cương) dựa trên tổng chi tiêu tích lũy.');
$docx->addCodeBlock(
"DELIMITER //\n" .
"CREATE FUNCTION `fn_XepHangKhachHang`(\n" .
"    p_tong_chi_tieu DOUBLE\n" .
")\n" .
"RETURNS VARCHAR(20)\n" .
"DETERMINISTIC\n" .
"BEGIN\n" .
"    IF p_tong_chi_tieu >= 20000000 THEN\n" .
"        RETURN 'KimCuong';\n" .
"    ELSEIF p_tong_chi_tieu >= 10000000 THEN\n" .
"        RETURN 'Vang';\n" .
"    ELSEIF p_tong_chi_tieu >= 3000000 THEN\n" .
"        RETURN 'Bac';\n" .
"    ELSE\n" .
"        RETURN 'Dong';\n" .
"    END IF;\n" .
"END //\n" .
"DELIMITER ;"
);

$docx->addHeading2('2.5. Thiết kế các Giao tác (Transaction)');
$docx->addParagraph('Để bảo toàn tính toàn vẹn dữ liệu (ACID: Atomicity, Consistency, Isolation, Durability) khi có nhiều thao tác ghi dữ liệu liên hoàn, hệ thống áp dụng Transaction trong các tình huống sau:');

$docx->addHeading3('Tình huống 1: Giao tác Đặt bàn trước kèm Đặt cọc');
$docx->addParagraph('Rủi ro: Nhân viên tạo phiếu đặt bàn thành công nhưng hệ thống gặp lỗi khi cập nhật trạng thái bàn sang "da_dat" dẫn đến việc một bàn bị xếp cho 2 đoàn khách khác nhau.');
$docx->addCodeBlock(
"START TRANSACTION;\n" .
"  -- 1. Khóa và kiểm tra bàn trống\n" .
"  SELECT `trang_thai` FROM `ban` WHERE `id` = 5 FOR UPDATE;\n" .
"  -- 2. Tạo bản ghi đặt bàn\n" .
"  INSERT INTO `dat_ban_truoc` (`ma_reservation`, `ten_khach`, `sdt`, `ban_id`, `thoi_gian_hen`, `so_luong_khach`, `tien_coc`, `trang_thai`)\n" .
"  VALUES ('RES-2026-999', 'Nguyen Van A', '0912345678', 5, '2026-08-25 19:00:00', 4, 200000, 'da_xac_nhan');\n" .
"  -- 3. Cập nhật trạng thái bàn\n" .
"  UPDATE `ban` SET `trang_thai` = 'da_dat' WHERE `id` = 5;\n" .
"COMMIT;"
);

$docx->addHeading3('Tình huống 2: Giao tác Thanh toán và Tích điểm CRM');
$docx->addParagraph('Rủi ro: Tiền đã trừ của khách nhưng máy chủ ngắt kết nối trước khi cập nhật giải phóng bàn hoặc cộng điểm thành viên.');
$docx->addCodeBlock(
"START TRANSACTION;\n" .
"  -- 1. Cập nhật trạng thái các món trên bàn thành hoàn thành\n" .
"  UPDATE `dat_mon` SET `trang_thai` = 'hoan_thanh', `phuong_thuc_thanh_toan` = 'chuyen_khoan' WHERE `ban_id` = 2;\n" .
"  -- 2. Tích điểm cho khách hàng\n" .
"  UPDATE `khach_hang` SET `diem_tich_luy` = `diem_tich_luy` + 5, `tong_chi_tieu` = `tong_chi_tieu` + 500000 WHERE `id` = 10;\n" .
"  -- 3. Chuyển trạng thái bàn về 'trong'\n" .
"  UPDATE `ban` SET `trang_thai` = 'trong', `yeu_cau_thanh_toan` = 0 WHERE `id` = 2;\n" .
"COMMIT;"
);

$docx->addHeading2('2.6. Vấn đề Xử lý đồng thời (Concurrency Control)');

$docx->addHeading3('Tình huống 1: Tranh chấp Đặt bàn cùng thời điểm (Lost Update / Race Condition)');
$docx->addParagraph('Mô tả: Khách hàng A (qua quét mã QR) và Nhân viên B (tại quầy thu ngân) cùng lúc chọn Bàn 3 (đang trống) để phục vụ vào cùng một giây.');
$docx->addParagraph('Hậu quả: Cả 2 luồng đều đọc trạng thái ban.trang_thai = "trong", sau đó cả 2 cùng ghi nhận và chèn khách vào cùng 1 bàn.');
$docx->addParagraph('Giải pháp: Sử dụng cơ chế Khóa bi quan (Pessimistic Locking) với câu lệnh SELECT ... FOR UPDATE trong Transaction:');
$docx->addCodeBlock(
"-- Luồng 1 (Khách A)\n" .
"START TRANSACTION;\n" .
"SELECT `trang_thai` FROM `ban` WHERE `id` = 3 FOR UPDATE;\n" .
"-- Khóa độc quyền hàng id = 3, Luồng 2 (Nhân viên B) sẽ phải chờ cho đến khi Luồng 1 COMMIT.\n" .
"UPDATE `ban` SET `trang_thai` = 'co_khach' WHERE `id` = 3;\n" .
"COMMIT;"
);

$docx->addHeading3('Tình huống 2: Tranh chấp Tồn kho khi 2 bàn cùng gọi suất ăn cuối cùng');
$docx->addParagraph('Mô tả: Nguyên liệu "Bò Wagyu A5" chỉ còn 1 suất duy nhất trong kho. Hai bàn cùng bấm gọi món lúc 19:05:00.');
$docx->addParagraph('Giải pháp: Transaction kiểm tra số lượng tồn kho với SELECT so_luong_ton FROM nguyen_lieu WHERE id = ... FOR UPDATE. Tiến trình nào đến trước sẽ trừ kho về 0, tiến trình thứ 2 khi đọc lại sẽ thấy số lượng = 0 và nhận thông báo lỗi "Món ăn tạm hết nguyên liệu".');

$docx->addHeading3('Tình huống 3: Tính toán báo cáo doanh thu ca trực (Phantom Read)');
$docx->addParagraph('Giải pháp: Thiết lập mức độ cô lập giao dịch SET TRANSACTION ISOLATION LEVEL REPEATABLE READ hoặc SERIALIZABLE khi chạy báo cáo tài chính để đảm bảo dữ liệu chốt sổ không bị sai lệch bởi các giao dịch phát sinh đồng thời.');

// ====================================================
// KẾT LUẬN
// ====================================================
$docx->addHeading1('KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN');

$docx->addHeading2('1. Kết quả đạt được');
$docx->addBullet('Xây dựng thành công cơ sở dữ liệu quan hệ chuẩn hóa 3NF đáp ứng toàn bộ các nghiệp vụ F&B.');
$docx->addBullet('Cài đặt đầy đủ các ràng buộc toàn vẹn, Khóa chính, Khóa ngoại, Stored Procedures, Functions và Transactions xử lý đồng thời.');
$docx->addBullet('Hệ thống phần mềm đã được hiện thực hóa trên nền tảng Laravel Framework + MySQL với giao diện đẹp mắt, hỗ trợ QR Code và màn hình Bếp KDS.');

$docx->addHeading2('2. Hạn chế còn tồn tại');
$docx->addBullet('Chưa tích hợp tự động đối soát Webhook ngân hàng theo thời gian thực.');
$docx->addBullet('Chưa ứng dụng mô hình dự báo AI để phân tích xu hướng nhập hàng theo mùa vụ.');

$docx->addHeading2('3. Hướng phát triển mở rộng');
$docx->addBullet('Mở rộng kiến trúc CSDL hỗ trợ chuỗi nhà hàng đa chi nhánh (Multi-branch chain).');
$docx->addBullet('Tích hợp WebSockets Real-time đẩy thông báo tức thì giữa Khách - Thu ngân - Bếp.');

// ====================================================
// PHÂN CÔNG CÔNG VIỆC
// ====================================================
$docx->addHeading1('BẢNG PHÂN CÔNG CÔNG VIỆC NHÓM');

$docx->addTable(
    ['STT', 'MSSV', 'Họ và Tên', 'Nội dung thực hiện chi tiết', 'Trưởng nhóm'],
    [
        ['1', '2100001', 'Nguyễn Văn A', 'Khảo sát nghiệp vụ, thiết kế lược đồ CSDL, xây dựng DDL, Stored Procedures, Transactions và làm slide báo cáo.', 'X'],
        ['2', '2100002', 'Trần Thị B', 'Xây dựng Functions, tạo bộ dữ liệu mẫu >1000 records cho bảng dat_mon, mô phỏng xử lý đồng thời.', ''],
        ['3', '2100003', 'Lê Hoàng C', 'Thiết kế giao diện ứng dụng web Laravel, kết nối CSDL, kiểm thử chức năng và viết tài liệu báo cáo.', '']
    ],
    [800, 1600, 2400, 3800, 800]
);

$docx->save();

// SQL file is generated directly via PhanMemQuanLyNhaHang_Database.sql
echo "Generated DOCX: BAO_CAO_DE_TAI_QUAN_LY_NHA_HANG.docx successfully\n";


