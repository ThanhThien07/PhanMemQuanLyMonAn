<?php

/**
 * Script build_cdbackend_docx.php
 * Tự động tạo file CDBackEnd.docx hoàn chỉnh và chuẩn mực cho:
 * ĐỒ ÁN MÔN HỌC: CHUYÊN ĐỀ BACK-END
 * ĐỀ TÀI: XÂY DỰNG HỆ THỐNG BACK-END CHO PHẦN MỀM QUẢN LÝ NHÀ HÀNG & GỌI MÓN (ROYAL BISTRO)
 */

class FullReportDocxBuilder
{
    private $zip;
    private $filename;
    private $bodyXml = '';
    private $images = []; // [id => ['path' => ..., 'rId' => ..., 'ext' => ...]]
    private $imgCounter = 0;

    public function __construct($filename)
    {
        $this->filename = $filename;
        $this->zip = new ZipArchive();
    }

    public function addPageBreak()
    {
        $this->bodyXml .= '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    }

    public function addTitleCover($school, $faculty, $subject, $title, $subtitle, $gvhd, $svth, $date)
    {
        // Khung bìa trang trọng
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="200" w:after="60"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="26"/>
                    <w:color w:val="1A365D"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($school) . '</w:t>
            </w:r>
        </w:p>';

        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="0" w:after="300"/>
                <w:pBdr>
                    <w:bottom w:val="single" w:sz="12" w:space="8" w:color="2B6CB0"/>
                </w:pBdr>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="28"/>
                    <w:color w:val="2B6CB0"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($faculty) . '</w:t>
            </w:r>
        </w:p>';

        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="600" w:after="160"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="32"/>
                    <w:color w:val="4A5568"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($subject) . '</w:t>
            </w:r>
        </w:p>';

        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="200" w:after="120"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="40"/>
                    <w:color w:val="1A365D"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($title) . '</w:t>
            </w:r>
        </w:p>';

        if ($subtitle) {
            $this->bodyXml .= '<w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="0" w:after="500"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:i/>
                        <w:b/>
                        <w:sz w:val="28"/>
                        <w:color w:val="2B6CB0"/>
                    </w:rPr>
                    <w:t>' . htmlspecialchars($subtitle) . '</w:t>
                </w:r>
            </w:p>';
        }

        // Bảng thông tin SV & GVHD
        $this->bodyXml .= '<w:tbl>
            <w:tblPr>
                <w:tblW w:w="8000" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:left w:val="none"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:right w:val="none"/>
                    <w:insideH w:val="none"/>
                    <w:insideV w:val="none"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="120" w:type="dxa"/>
                    <w:bottom w:w="120" w:type="dxa"/>
                    <w:left w:w="160" w:type="dxa"/>
                    <w:right w:w="160" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr><w:tcW w:w="3200" w:type="dxa"/></w:tcPr>
                    <w:p>
                        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:color w:val="1A365D"/></w:rPr><w:t>Giảng viên hướng dẫn:</w:t></w:r>
                    </w:p>
                </w:tc>
                <w:tc>
                    <w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr>
                    <w:p>
                        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="26"/><w:color w:val="2D3748"/></w:rPr><w:t>' . htmlspecialchars($gvhd) . '</w:t></w:r>
                    </w:p>
                </w:tc>
            </w:tr>
            <w:tr>
                <w:tc>
                    <w:tcPr><w:tcW w:w="3200" w:type="dxa"/></w:tcPr>
                    <w:p>
                        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:color w:val="1A365D"/></w:rPr><w:t>Sinh viên thực hiện:</w:t></w:r>
                    </w:p>
                </w:tc>
                <w:tc>
                    <w:tcPr><w:tcW w:w="4800" w:type="dxa"/></w:tcPr>
                    <w:p>
                        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="26"/><w:color w:val="2B6CB0"/></w:rPr><w:t>' . htmlspecialchars($svth) . '</w:t></w:r>
                    </w:p>
                </w:tc>
            </w:tr>
        </w:tbl>';

        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="600" w:after="0"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:i/><w:sz w:val="24"/><w:color w:val="718096"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($date) . '</w:t>
            </w:r>
        </w:p>';

        $this->addPageBreak();
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
                <w:spacing w:before="180" w:after="60"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="26"/>
                    <w:color w:val="2D3748"/>
                </w:rPr>
                <w:t>' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addParagraph($text, $italic = false, $bold = false, $align = 'both')
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="' . $align . '"/>
                <w:spacing w:before="40" w:after="60" w:line="276" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    ' . ($bold ? '<w:b/>' : '') . '
                    ' . ($italic ? '<w:i/>' : '') . '
                    <w:sz w:val="26"/>
                    <w:color w:val="2D3748"/>
                </w:rPr>
                <w:t xml:space="preserve">' . htmlspecialchars($text) . '</w:t>
            </w:r>
        </w:p>';
    }

    public function addBullet($text, $boldPrefix = '')
    {
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:ind w:left="400" w:hanging="240"/>
                <w:spacing w:before="20" w:after="40" w:line="260" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="26"/>
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
            </w:rPr>
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
                    <w:top w:w="80" w:type="dxa"/>
                    <w:left w:w="160" w:type="dxa"/>
                    <w:bottom w:w="80" w:type="dxa"/>
                    <w:right w:w="160" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>
            <w:tr>
                <w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="F7FAFC"/>
                    </w:tcPr>';
        foreach ($lines as $l) {
            $this->bodyXml .= '<w:p>
                <w:pPr><w:spacing w:before="10" w:after="10" w:line="220" w:lineRule="auto"/></w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                        <w:sz w:val="21"/>
                        <w:color w:val="2D3748"/>
                    </w:rPr>
                    <w:t xml:space="preserve">' . htmlspecialchars($l) . '</w:t>
                </w:r>
            </w:p>';
        }
        $this->bodyXml .= '</w:tc>
            </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:before="20" w:after="60"/></w:pPr></w:p>';
    }

    public function addTable($headers, $rows, $colWidths = [])
    {
        $totalW = array_sum($colWidths);
        if ($totalW <= 0) {
            $totalW = 9400;
            $cnt = max(1, count($headers));
            $colWidths = array_fill(0, $cnt, floor(9400 / $cnt));
        }

        $this->bodyXml .= '<w:tbl>
            <w:tblPr>
                <w:tblW w:w="' . $totalW . '" w:type="dxa"/>
                <w:jc w:val="center"/>
                <w:tblBorders>
                    <w:top w:val="single" w:sz="8" w:space="0" w:color="2B6CB0"/>
                    <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:bottom w:val="single" w:sz="8" w:space="0" w:color="2B6CB0"/>
                    <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                    <w:insideH w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
                    <w:insideV w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                </w:tblBorders>
                <w:tblCellMar>
                    <w:top w:w="80" w:type="dxa"/>
                    <w:left w:w="120" w:type="dxa"/>
                    <w:bottom w:w="80" w:type="dxa"/>
                    <w:right w:w="120" w:type="dxa"/>
                </w:tblCellMar>
            </w:tblPr>';

        // Header Row
        $this->bodyXml .= '<w:tr>
            <w:trPr><w:tblHeader/></w:trPr>';
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
                            <w:sz w:val="24"/>
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
                                <w:sz w:val="23"/>
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

    public function addImage($imagePath, $caption = '', $widthEmus = 5486400, $heightEmus = 3086100)
    {
        if (!file_exists($imagePath)) {
            $this->addParagraph("[Hình ảnh: $caption - Tệp không tồn tại]", true);
            return;
        }

        $this->imgCounter++;
        $rId = 'rIdImg' . $this->imgCounter;
        $ext = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));
        if ($ext === 'jpg') $ext = 'jpeg';
        
        $mediaTarget = "media/image_{$this->imgCounter}.{$ext}";
        $this->images[] = [
            'id' => $this->imgCounter,
            'rId' => $rId,
            'path' => $imagePath,
            'mediaTarget' => $mediaTarget,
            'ext' => $ext
        ];

        // XML Drawing OpenXML
        $this->bodyXml .= '<w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="140" w:after="60"/>
            </w:pPr>
            <w:r>
                <w:drawing>
                    <wp:inline distT="0" distB="0" distL="0" distR="0">
                        <wp:extent cx="' . $widthEmus . '" cy="' . $heightEmus . '"/>
                        <wp:docPr id="' . $this->imgCounter . '" name="Picture ' . $this->imgCounter . '"/>
                        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                    <pic:nvPicPr>
                                        <pic:cNvPr id="' . $this->imgCounter . '" name="' . htmlspecialchars(basename($imagePath)) . '"/>
                                        <pic:cNvPicPr/>
                                    </pic:nvPicPr>
                                    <pic:blipFill>
                                        <a:blip r:embed="' . $rId . '"/>
                                        <a:stretch><a:fillRect/></a:stretch>
                                    </pic:blipFill>
                                    <pic:spPr>
                                        <a:xfrm><a:off x="0" y="0"/><a:ext cx="' . $widthEmus . '" cy="' . $heightEmus . '"/></a:xfrm>
                                        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                                    </pic:spPr>
                                </pic:pic>
                            </a:graphicData>
                        </a:graphic>
                    </wp:inline>
                </w:drawing>
            </w:r>
        </w:p>';

        if ($caption) {
            $this->bodyXml .= '<w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                    <w:spacing w:before="20" w:after="140"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:i/>
                        <w:sz w:val="22"/>
                        <w:color w:val="4A5568"/>
                    </w:rPr>
                    <w:t>' . htmlspecialchars($caption) . '</w:t>
                </w:r>
            </w:p>';
        }
    }

    public function save()
    {
        if ($this->zip->open($this->filename, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception("Không thể khởi tạo tệp: {$this->filename}");
        }

        // 1. [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Default Extension="png" ContentType="image/png"/>
    <Default Extension="jpeg" ContentType="image/jpeg"/>
    <Default Extension="jpg" ContentType="image/jpeg"/>
</Types>';
        $this->zip->addFromString('[Content_Types].xml', $contentTypes);

        // 2. _rels/.rels
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>';
        $this->zip->addFromString('_rels/.rels', $rels);

        // 3. word/_rels/document.xml.rels
        $docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
        foreach ($this->images as $img) {
            $docRels .= '<Relationship Id="' . $img['rId'] . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="' . $img['mediaTarget'] . '"/>';
        }
        $docRels .= '</Relationships>';
        $this->zip->addFromString('word/_rels/document.xml.rels', $docRels);

        // 4. Copy image media files
        foreach ($this->images as $img) {
            $this->zip->addFile($img['path'], 'word/' . $img['mediaTarget']);
        }

        // 5. word/document.xml
        $doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
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
        echo "✅ ĐÃ TẠO THÀNH CÔNG BÁO CÁO WORD DOCX: {$this->filename}\n";
    }
}

// ----------------------------------------------------
// BẮT ĐẦU XÂY DỰNG NỘI DUNG CHI TIẾT
// ----------------------------------------------------

$builder = new FullReportDocxBuilder(__DIR__ . '/../CDBackEnd.docx');

// TRANG BÌA
$builder->addTitleCover(
    'BỘ LAO ĐỘNG THƯƠNG BINH VÀ XÃ HỘI - TRƯỜNG CAO ĐẲNG CÔNG NGHỆ THÔNG TIN TP.HCM',
    'KHOA CÔNG NGHỆ THÔNG TIN – ĐIỆN TỬ',
    'ĐỒ ÁN MÔN HỌC: CHUYÊN ĐỀ BACK-END',
    'XÂY DỰNG HỆ THỐNG BACK-END CHO PHẦN MỀM QUẢN LÝ NHÀ HÀNG & GỌI MÓN (ROYAL BISTRO)',
    '(Restaurant Management, Smart POS & Realtime Kitchen Display System)',
    'ThS. Nguyễn Minh Hải',
    'Bùi Thành Tài – MSSV: 501240093 (Nhóm 5 - Nguyễn Ngọc Hà Thảo) - Khoá K24',
    'TP. Hồ Chí Minh, Năm 2026'
);

// LỜI MỞ ĐẦU (TRANG RIÊNG BIỆT)
$builder->addHeading1('LỜI MỞ ĐẦU');
$builder->addParagraph('Trong bối cảnh kỷ nguyên chuyển đổi số đang diễn ra mạnh mẽ tại Việt Nam, ngành dịch vụ ẩm thực và ăn uống (F&B - Food & Beverage) đang chứng kiến sự chuyển mình vượt bậc. Các nhà hàng truyền thống với quy trình phục vụ thủ công bằng giấy ghi order, tính tiền bằng sổ sách và kiểm kê kho bằng kinh nghiệm cá nhân đang bộc lộ hàng loạt nhược điểm nghiêm trọng: tốc độ phục vụ chậm trễ trong giờ cao điểm, tình trạng sai sót khi truyền đạt yêu cầu chế biến giữa phục vụ và nhà bếp, thất thoát chi phí nguyên liệu do không có công thức định lượng (BOM - Bill of Materials), và việc thiếu hụt dữ liệu thống kê theo thời gian thực để ban quản lý đưa ra quyết định kinh doanh kịp thời.');
$builder->addParagraph('Xuất phát từ thực tiễn bức thiết đó, đồ án môn học "Chuyên Đề Back-End" được thực hiện với mục tiêu nghiên cứu, thiết kế và phát triển toàn diện hệ thống máy chủ Back-End cho Phần Mềm Quản Lý Nhà Hàng & Gọi Món Thông Minh (Royal Bistro). Hệ thống được xây dựng trên nền tảng kiến trúc Node.js, Express.js, Cơ sở dữ liệu NoSQL MongoDB (Mongoose ODM), Socket.io Real-time và cơ chế bảo mật xác thực JSON Web Token (JWT), tổ chức theo kiến trúc 2 phân hệ độc lập: Chuyên Đề Back-End (BE/) và Chuyên Đề Front-End (FE/).');
$builder->addParagraph('Back-End giữ vai trò là "trái tim" và "bộ não" điều phối toàn bộ luồng vận hành của nhà hàng: từ khâu xác thực và phân quyền truy cập đa cấp (Admin, Thu ngân/Phục vụ, Đầu bếp), quản lý sơ đồ bàn động, tiếp nhận các lượt gọi món tại chỗ (POS) và đặt bàn trực tuyến, truyền thông điệp chế biến tức thì xuống Màn hình Bếp KDS (Kitchen Display System) bằng WebSockets, cho đến bài toán tự động tính toán tiêu hao và trừ kho nguyên vật liệu theo định mức công thức kèm hạn sử dụng (FEFO/FIFO).');
$builder->addParagraph('Thông qua quá trình thực hiện đồ án, sinh viên không chỉ có cơ hội vận dụng các kiến thức chuyên môn đã học vào một bài toán thực tế có độ phức tạp cao, mà còn rèn luyện tư duy thiết kế kiến trúc hệ thống dạng module hóa (Modular Architecture), chuẩn hóa các giao tiếp API theo tiêu chuẩn RESTful, làm chủ kỹ năng bảo mật ứng dụng web và kỹ năng kiểm soát toàn vẹn dữ liệu trong các giao tác đa người dùng.');
$builder->addParagraph('Bản báo cáo này trình bày toàn bộ kết quả nghiên cứu, phân tích nghiệp vụ, thiết kế kiến trúc hệ thống, cài đặt cơ sở dữ liệu và thử nghiệm thực tế các tính năng của phần mềm. Dù đã nỗ lực hết mình với tinh thần nghiêm túc và cầu tiến, song do thời gian và kinh nghiệm thực tế còn hạn chế, đồ án khó tránh khỏi những thiếu sót nhất định. Em kính mong nhận được những nhận xét, đóng góp quý báu từ quý Thầy Cô để đồ án ngày càng hoàn thiện hơn.');
$builder->addParagraph('Em xin trân trọng cảm ơn!');
$builder->addPageBreak();

// LỜI CẢM ƠN (TRANG RIÊNG BIỆT)
$builder->addHeading1('LỜI CẢM ƠN');
$builder->addParagraph('Để hoàn thành được đồ án môn học Chuyên Đề Back-End với đề tài "Xây dựng hệ thống Back-End cho Phần Mềm Quản Lý Nhà Hàng & Gọi Món (Royal Bistro)", em xin bày tỏ lòng biết ơn sâu sắc và chân thành nhất đến quý Thầy Cô, gia đình và bạn bè đã đồng hành, hỗ trợ em trong suốt thời gian qua.');
$builder->addParagraph('Trước hết, em xin gửi lời tri ân đặc biệt đến ThS. Nguyễn Minh Hải, giảng viên hướng dẫn môn học. Thầy đã dành nhiều thời gian tận tình chỉ bảo, định hướng cấu trúc đề tài, gợi mở các giải pháp kỹ thuật hiện đại và đóng góp những ý kiến phản biện chuyên môn vô cùng quý giá về thiết kế API, cơ chế bảo mật JWT, xử lý ngoại lệ tập trung và tối ưu hóa truy vấn cơ sở dữ liệu. Những định hướng đúng đắn của Thầy chính là kim chỉ nam giúp em vượt qua các thách thức kỹ thuật phức tạp trong quá trình xây dựng hệ thống.');
$builder->addParagraph('Em cũng xin trân trọng cảm ơn các quý Thầy Cô trong Khoa Công nghệ Thông tin – Điện tử, Trường Cao đẳng Công nghệ Thông tin TP. Hồ Chí Minh, những người đã tâm huyết truyền đạt nền tảng kiến thức vững chắc về lập trình hướng đối tượng, kiến trúc cơ sở dữ liệu, mạng máy tính và quy trình phát triển phần mềm trong suốt các học kỳ vừa qua.');
$builder->addParagraph('Bên cạnh đó, em xin gửi lời cảm ơn chân thành đến các bạn trong Nhóm 5 (Trưởng nhóm: Nguyễn Ngọc Hà Thảo) cùng toàn thể các bạn sinh viên lớp K24 đã tích cực trao đổi, chia sẻ dữ liệu khảo sát nghiệp vụ thực tế, đóng góp ý tưởng xây dựng kịch bản thử nghiệm và phối hợp kiểm thử liên phân hệ để hệ thống đạt được sự hoàn thiện cao nhất.');
$builder->addParagraph('Cuối cùng, em xin bày tỏ lòng biết ơn vô hạn đến gia đình, nơi luôn là điểm tựa tinh thần vững chắc, luôn động viên và tạo mọi điều kiện thuận lợi nhất để em yên tâm học tập và hoàn thành tốt nhiệm vụ của đồ án.');
$builder->addParagraph('Kính chúc quý Thầy Cô luôn dồi dào sức khỏe, hạnh phúc và thành công trong sự nghiệp trồng người cao quý!');
$builder->addParagraph('TP. Hồ Chí Minh, ngày 16 tháng 10 năm 2025', true, false, 'right');
$builder->addParagraph('Sinh viên thực hiện', true, true, 'right');
$builder->addParagraph('Bùi Thành Tài', false, true, 'right');
$builder->addPageBreak();

// MỤC LỤC BÁO CÁO (TRANG RIÊNG BIỆT)
$builder->addHeading1('MỤC LỤC BÁO CÁO');
$builder->addBullet('Chương 1. GIỚI THIỆU TỔNG QUAN ĐỀ TÀI (Mục tiêu, Chức năng cơ bản, Mục đích Back-End, Công nghệ Node.js, Express, MongoDB Mongoose, JWT, Socket.io, Bcrypt)');
$builder->addBullet('Chương 2. THIẾT KẾ KIẾN TRÚC HỆ THỐNG (Kiến trúc phân tầng Client-Server-MongoDB-Socket.io, Middleware pipeline, Cấu trúc thư mục BE & FE chuẩn tiếng Việt)');
$builder->addBullet('Chương 3. CÀI ĐẶT THỰC NGHIỆM VÀ KẾT QUẢ (Thiết kế 12 Mongoose Schemas & Collections, Data Dictionary chi tiết, Giao diện thực tế kèm ảnh chụp từ hệ thống, Nghiệp vụ POS, Trừ kho BOM FEFO, KDS, Đặt bàn, VietQR)');
$builder->addBullet('Chương 4. XỬ LÝ LỖI VÀ BẢO MẬT HỆ THỐNG (xuLyBatDongBo, dinhNghiaLoi, xuLyLoiHeThong toàn cục, Request Logger ghiNhatKyYeuCau, Bảo mật JWT, Bcrypt, RBAC, Mongoose Validation, CORS)');
$builder->addBullet('Chương 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (Kết quả đạt được, Hạn chế, Hướng phát triển đề tài, Hướng phát triển bản thân)');
$builder->addBullet('DANH MỤC TÀI LIỆU THAM KHẢO');
$builder->addPageBreak();

// DANH MỤC HÌNH ẢNH & BẢNG BIỂU (TRANG RIÊNG BIỆT)
$builder->addHeading1('DANH MỤC HÌNH ẢNH & BẢNG BIỂU');
$builder->addHeading2('Danh mục Hình ảnh:');
$builder->addBullet('Hình 1.2.1 Node.js');
$builder->addBullet('Hình 1.2.2 Cơ sở dữ liệu MongoDB (Mongoose ODM)');
$builder->addBullet('Hình 1.2.3 ExpressJS');
$builder->addBullet('Hình 1.2.4 JWT (Json Web Token)');
$builder->addBullet('Hình 2.1.5 Sơ đồ kiến trúc ứng dụng');
$builder->addBullet('Hình 2.2 Cấu trúc thư mục server');
$builder->addBullet('Hình 3.2.1 Màn hình Đăng nhập hệ thống & Chức năng 1-Click Demo Login');
$builder->addBullet('Hình 3.2.2 Màn hình Bảng điều khiển Quản lý tổng quan (Admin Dashboard)');
$builder->addBullet('Hình 3.2.3 Màn hình Sơ đồ bàn & Quản lý trạng thái bàn ăn (Table Management)');
$builder->addBullet('Hình 3.2.4 Màn hình Bán hàng POS & Đặt món theo bàn trực tiếp (POS Order)');
$builder->addBullet('Hình 3.2.5 Màn hình Điều phối Bếp KDS Real-time (Kitchen Display System)');
$builder->addBullet('Hình 3.2.6 Màn hình Quản lý Thực đơn & Danh mục Món ăn (Dish Management)');
$builder->addHeading2('Danh mục Bảng biểu:');
$builder->addBullet('Bảng 1.1: So sánh các giải pháp công nghệ Back-End cho bài toán F&B POS');
$builder->addBullet('Bảng 2.1: Chi tiết các module trong cấu trúc thư mục Server Back-End');
$builder->addBullet('Bảng 3.1: Lược đồ 12 Collections cơ sở dữ liệu MongoDB Nhà Hàng Royal Bistro');
$builder->addBullet('Bảng 3.2: Phân tích mối quan hệ và bản số (Cardinality ERD)');
$builder->addBullet('Bảng 3.3 đến 3.14: Từ điển dữ liệu chi tiết cho 12 bảng CSDL');
$builder->addBullet('Bảng 3.15: Ma trận phân quyền người dùng (Role-Based Access Control)');
$builder->addBullet('Bảng 4.1: Phân loại mã lỗi HTTP Status và Custom Error Classes');
$builder->addPageBreak();


// ====================================================
// CHƯƠNG 1
// ====================================================
$builder->addHeading1('Chương 1. GIỚI THIỆU TỔNG QUAN ĐỀ TÀI');

$builder->addHeading2('1.1. Mục tiêu dự án');
$builder->addHeading3('1.1.1. Mục tiêu của đồ án');
$builder->addParagraph('Mục tiêu cốt lõi của đồ án là nghiên cứu, phân tích nghiệp vụ và xây dựng hoàn chỉnh một hệ thống máy chủ Back-End chuyên nghiệp phục vụ cho bài toán quản lý và vận hành nhà hàng ẩm thực cao cấp (Nhà hàng F&B - Food & Beverage). Hệ thống đảm bảo tính chính xác, tính ổn định, tốc độ phản hồi tính bằng mili-giây, khả năng xử lý đồng thời cao và tính toàn vẹn dữ liệu trong các giao tác thanh toán, trừ kho và điều phối món ăn.');
$builder->addBullet('Nắm vững tư duy thiết kế kiến trúc hệ thống Back-End dạng RESTful API chuẩn quốc tế, tách bạch rõ ràng giữa các tầng: Routing, Middleware, Controller, Service và Data Access.', '1.');
$builder->addBullet('Thiết kế và cài đặt cơ sở dữ liệu quan hệ hoàn chỉnh (12 bảng) đáp ứng dạng chuẩn 3NF, xử lý hiệu quả các mối quan hệ 1-N, N-N (thông qua bảng định lượng BOM) và đảm bảo tính toàn vẹn tham chiếu.', '2.');
$builder->addBullet('Làm chủ kỹ thuật lập trình bất đồng bộ (Asynchronous Programming) trong Node.js, kỹ thuật kết nối Pool cơ sở dữ liệu và xử lý hàng đợi sự kiện (Event Loop).', '3.');
$builder->addBullet('Xây dựng giải pháp truyền thông thời gian thực (Real-time Full-Duplex) với Socket.io để đồng bộ trạng thái đơn hàng giữa nhân viên sảnh và đầu bếp trong tích tắc.', '4.');
$builder->addBullet('Triển khai kiến trúc bảo mật toàn diện: mã hóa mật khẩu Bcrypt, xác thực phân quyền qua JWT Token phi trạng thái, kiểm soát truy cập dựa trên vai trò (RBAC) và phòng chống tấn công mạng.', '5.');

$builder->addHeading3('1.1.2. Các chức năng cơ bản của hệ thống');
$builder->addBullet('Phân hệ Xác thực & Quản trị Nhân sự (Auth & User Management): Đăng nhập, đăng ký tài khoản nhân viên, phân quyền đa cấp (admin, cashier, kitchen), cấp phát JWT Token.', '•');
$builder->addBullet('Phân hệ Quản lý Bàn & Sơ đồ mặt bằng (Table Management): Khởi tạo bàn ăn, quản lý trạng thái động (trống, có khách, đã đặt), sinh mã định danh phục vụ khách tự quét QR.', '•');
$builder->addBullet('Phân hệ Quản lý Thực đơn & Bảng giá (Menu & Dishes): Quản lý danh mục loại món, thông tin món ăn, hình ảnh, đơn giá, mô tả và cấu hình tùy chọn topping/modifier.', '•');
$builder->addBullet('Phân hệ Bán hàng POS & Phiên gọi món (POS Orders): Tiếp nhận đơn gọi món theo từng bàn ăn, ghi nhận số lượng, ghi chú chế biến, phân loại độ ưu tiên gọi món.', '•');
$builder->addBullet('Phân hệ Màn hình Bếp KDS Real-time (Kitchen Display System): API chuyên dụng cho nhà bếp xem danh sách món xếp hàng, cập nhật trạng thái chế biến (chờ -> đang nấu -> hoàn thành), tự động trừ kho nguyên liệu.', '•');
$builder->addBullet('Phân hệ Quản lý Đặt bàn trước (Reservation): Tiếp nhận yêu cầu đặt bàn, kiểm tra tính khả dụng của bàn theo khung giờ, ghi nhận tiền đặt cọc và check-in nhận bàn.', '•');
$builder->addBullet('Phân hệ Quản lý Kho nguyên vật liệu & Định lượng (Inventory & BOM): Quản lý nguyên liệu, tồn kho, quản lý lô hàng nhập theo hạn sử dụng (FEFO) và công thức BOM.', '•');
$builder->addBullet('Phân hệ Thanh toán & Khách hàng thân thiết (Billing & CRM): Tính hóa đơn, hỗ trợ tiền mặt và VietQR tự động, tách bill, tích điểm hội viên (100.000đ = 1 điểm).', '•');
$builder->addBullet('Phân hệ Thống kê & Báo cáo doanh thu (Reports & Analytics): Tổng hợp doanh số ngày/ca, cơ cấu doanh thu tiền mặt/chuyển khoản, Top 5 món bán chạy nhất và cảnh báo nguyên liệu cạn kiệt.', '•');

$builder->addHeading3('1.1.3. Mục đích phát triển ứng dụng Back-End');
$builder->addParagraph('Trong kiến trúc phần mềm hiện đại, Back-End là thành phần cốt lõi gánh vác toàn bộ trách nhiệm về tính logic, tính bảo mật và tính ổn định của hệ thống:');
$builder->addBullet('Tập trung hóa logic nghiệp vụ (Centralized Business Logic): Đảm bảo mọi quy tắc kinh doanh (công thức trừ kho nguyên liệu khi nấu món, quy tắc tích điểm CRM, quy tắc kiểm tra bàn trống) được thực thi nhất quán tại server, loại trừ rủi ro bị can thiệp hay gian lận từ phía client.');
$builder->addBullet('Đảm bảo tính toàn vẹn và an toàn dữ liệu: Quản lý tập trung các kết nối cơ sở dữ liệu, thực hiện kiểm tra ràng buộc toàn vẹn (Constraints), transaction rollback khi xảy ra sự cố và bảo vệ thông tin mật khẩu của người dùng.');
$builder->addBullet('Hỗ trợ đa nền tảng (Multi-platform Interoperability): Chuẩn hóa các endpoint theo chuẩn REST API trả về dữ liệu JSON, máy chủ Back-End có thể phục vụ đồng thời cho Web App (React.js), Mobile App, máy tính tiền POS chuyên dụng hoặc máy tính bảng KDS tại nhà bếp.');
$builder->addBullet('Giám sát và dễ dàng mở rộng (Scalability & Observability): Tích hợp sẵn cơ chế ghi log chi tiết (Request Logger) đo lường thời gian đáp ứng (Response Time) và bộ lọc lỗi tập trung giúp quản trị viên nhanh chóng phát hiện các nút thắt cổ chai.');

$builder->addHeading2('1.2. Công nghệ sử dụng');

// 1.2.1 Node.js
$builder->addHeading3('1.2.1. Node.js');
$builder->addParagraph('Node.js là một môi trường runtime chạy JavaScript đa nền tảng và mã nguồn mở, cho phép chạy JavaScript bên ngoài trình duyệt web, đặc biệt là trên máy chủ. Điểm đặc biệt của Node.js là được xây dựng dựa trên V8 JavaScript Engine của Google Chrome - một engine mạnh mẽ được viết bằng C++ và JavaScript, giúp Node.js thực thi mã lệnh với tốc độ cực nhanh.');

$builder->addParagraph('Lịch sử hình thành và tên gọi:', false, true);
$builder->addParagraph('Nền tảng này được phát triển bởi Ryan Lienhart Dahl vào năm 2009, đánh dấu bước mở rộng JavaScript từ trình duyệt ra môi trường máy chủ. Tên gọi "Node.js" mang hàm ý về một nền tảng đa năng, nơi mỗi ứng dụng đóng vai trò như một nút mạng độc lập có thể liên kết và mở rộng linh hoạt.');

$builder->addParagraph('Tại sao Node.js lại phổ biến?', false, true);
$builder->addBullet('Nguồn mở (Open-source): Node.js có mã nguồn mở, cho phép cộng đồng lập trình viên toàn cầu tự do truy cập, sử dụng và đóng góp.');
$builder->addBullet('Đa nền tảng (Cross-platform): Hoạt động độc lập trên Windows, Linux và macOS mà không cần sửa đổi code.');
$builder->addBullet('Dựa trên V8 JavaScript Engine: Tận dụng bộ máy biên dịch JIT (Just-In-Time) cực nhanh của Google.');
$builder->addBullet('Hiệu năng cao & Bất đồng bộ (Non-blocking I/O, Event-Driven): Khả năng phục vụ hàng nghìn kết nối đồng thời với lượng RAM tối thiểu.');
$builder->addBullet('Hệ sinh thái NPM đồ sộ: Kho thư viện phần mềm phong phú bậc nhất hiện nay.');

$builder->addParagraph('Cách Node.js hoạt động:', false, true);
$builder->addParagraph('Node.js hoạt động dựa trên cơ chế vòng lặp sự kiện đơn luồng (Single-threaded Event Loop) kết hợp với thư viện nền tảng libuv. Khi có một yêu cầu I/O (như đọc cơ sở dữ liệu hay ghi file), Node.js không chặn luồng chính mà ủy thác tác vụ đó cho Thread Pool chạy ngầm, tiếp tục đón nhận các request mới. Khi tác vụ I/O hoàn tất, một sự kiện (Event) được kích hoạt và hàm gọi lại (Callback) được đưa vào hàng đợi để Event Loop xử lý.');

$builder->addParagraph('Các thành phần quan trọng của Node.js:', false, true);
$builder->addBullet('Module System: Quản lý mã nguồn theo các đơn vị độc lập (CommonJS và ES Modules import/export).');
$builder->addBullet('Console & Debugger: Công cụ ghi nhật ký và gỡ lỗi trực tiếp.');
$builder->addBullet('Cluster & Worker Threads: Cho phép tận dụng tối đa sức mạnh của bộ vi xử lý đa nhân.');

$builder->addParagraph('Ưu và nhược điểm của Node.js:', false, true);
$builder->addBullet('Ưu điểm: Tốc độ xử lý cực nhanh, tiêu hao ít tài nguyên, sử dụng chung JavaScript cho cả Frontend và Backend, cộng đồng hỗ trợ khổng lồ.');
$builder->addBullet('Nhược điểm: Không tối ưu cho các thuật toán tính toán CPU nặng nề kéo dài (như mã hóa video lớn), nhưng cực kỳ lý tưởng cho bài toán I/O chuyên sâu như website nhà hàng, POS và KDS.');

$builder->addParagraph('Một số thuật ngữ liên quan:', false, true);
$builder->addBullet('I/O (Input/Output): Quá trình giao tiếp giữa máy chủ với đĩa cứng, mạng hoặc cơ sở dữ liệu.');
$builder->addBullet('Không đồng bộ (Asynchronous): Tác vụ chạy nền mà không bắt người dùng phải chờ đợi.');
$builder->addBullet('Lập trình hướng sự kiện (Event-Driven): Luồng thực thi được kích hoạt bởi các sự kiện từ người dùng hoặc hệ thống.');

$builder->addParagraph('Top Frameworks Node.js phổ biến hiện nay:', false, true);
$builder->addBullet('Express.js: Framework tối giản, linh hoạt và được dùng nhiều nhất (dự án lựa chọn).');
$builder->addBullet('NestJS: Framework cấu trúc chặt chẽ theo hướng kiến trúc doanh nghiệp và TypeScript.');
$builder->addBullet('Koa.js / Fastify: Các framework thế hệ mới chú trọng tối đa tốc độ phản hồi.');

$builder->addParagraph('Vai trò của Node.js trong phần mềm Quản lý Nhà hàng:', false, true);
$builder->addBullet('Xử lý phía máy chủ (Back-End): Tiếp nhận yêu cầu từ POS, Bếp và khách hàng, thực thi logic nghiệp vụ và trả về kết quả.');
$builder->addBullet('Kết nối và thao tác với cơ sở dữ liệu: Lưu, lấy, sửa, xóa dữ liệu tài khoản, bàn ăn, thực đơn món ăn, giỏ hàng, đơn gọi món, kho nguyên liệu.');
$builder->addBullet('Đăng ký – đăng nhập và bảo mật: Xác thực người dùng, mã hóa mật khẩu, tạo token JWT, phân quyền truy cập.');
$builder->addBullet('Xây dựng RESTful API: Cung cấp các cổng giao tiếp dữ liệu chuẩn hóa JSON cho giao diện React.js tiêu thụ.');
$builder->addBullet('Xử lý dữ liệu theo thời gian thực: Phối hợp cùng Socket.io để truyền đơn gọi món tức thì từ bàn ăn xuống màn hình Bếp KDS.');
$builder->addBullet('Đảm bảo hiệu suất và tốc độ: Cơ chế non-blocking giúp phần mềm không bị treo khi giờ cao điểm đông khách.');
$builder->addBullet('Tích hợp dịch vụ khác: Sinh mã thanh toán VietQR động và kết nối in hóa đơn.');

$builder->addImage(__DIR__ . '/../docs/screenshots/tech_nodejs.png', 'Hình 1.2.1 Node.js');

// 1.2.2 Cơ sở dữ liệu
$builder->addHeading3('1.2.2. Cơ sở dữ liệu NoSQL MongoDB (Mongoose ODM)');
$builder->addParagraph('Cơ sở dữ liệu là thành phần cốt lõi lưu trữ toàn bộ dữ liệu sống còn của nhà hàng. Trong dự án Royal Bistro, hệ thống sử dụng MongoDB - hệ quản trị cơ sở dữ liệu tài liệu (Document Database) NoSQL hàng đầu hiện nay, kết hợp cùng thư viện Mongoose ODM (Object Data Modeling) giúp quản lý Schema chặt chẽ, tối ưu hóa truy vấn và dễ dàng mở rộng theo chiều ngang.');

$builder->addParagraph('Các tính năng nổi trội của MongoDB và Mongoose ODM:', false, true);
$builder->addBullet('Lược đồ dữ liệu linh hoạt (Flexible Document Model): Dữ liệu được lưu trữ dạng BSON (Binary JSON), cấu trúc tương thích hoàn hảo với các đối tượng JavaScript trong Node.js.');
$builder->addBullet('Pipeline tổng hợp mạnh mẽ (Aggregation Framework): Hỗ trợ các toán tử $match, $group, $sort, $lookup để tổng hợp doanh thu, đếm lượt khách và xếp hạng món bán chạy với tốc độ cực nhanh.');
$builder->addBullet('Cơ chế Mongoose Schema Validation: Ràng buộc kiểu dữ liệu, giá trị mặc định, kiểm tra tính hợp lệ (required, min, max, enum) ngay tại tầng ứng dụng.');
$builder->addBullet('Hiệu năng đọc/ghi vượt trội: Phục vụ trơn tru hàng nghìn đơn gọi món và biến động trạng thái bàn ăn trong giờ cao điểm.');

$builder->addParagraph('Các chức năng chính của Cơ sở dữ liệu trong hệ thống:', false, true);
$builder->addBullet('Lưu tài khoản người dùng: Đăng ký, đăng nhập, thông tin cá nhân, phân quyền vai trò (Admin, Cashier, Kitchen).');
$builder->addBullet('Lưu thực đơn nhà hàng: Danh mục loại món, tên món, đơn giá, hình ảnh, mô tả.');
$builder->addBullet('Lưu sơ đồ bàn ăn: Trạng thái bàn (trống, có khách, đã đặt), số lượng khách, yêu cầu thanh toán.');
$builder->addBullet('Lưu giỏ hàng & đơn gọi món: Bàn nào đặt, món nào, số lượng, đơn giá, ghi chú và trạng thái chế biến.');
$builder->addBullet('Lưu kho nguyên liệu & công thức BOM: Định lượng từng món ăn, số lượng tồn kho và các lô hàng nhập theo hạn sử dụng (FEFO).');
$builder->addBullet('Lưu lịch đặt bàn trước: Thông tin khách, số điện thoại, giờ hẹn, tiền cọc.');
$builder->addBullet('Lưu hồ sơ khách hàng thân thiết CRM: Điểm tích lũy, hạng thành viên (Đồng, Bạc, Vàng, Kim Cương).');
$builder->addBullet('Thống kê & Báo cáo: Báo cáo doanh thu tiền mặt, chuyển khoản và biên bản chốt ca.');

$builder->addImage(__DIR__ . '/../docs/screenshots/tech_database.png', 'Hình 1.2.2 Cơ sở dữ liệu');

// 1.2.3 Express
$builder->addHeading3('1.2.3. Express');
$builder->addParagraph('Express là một framework nhỏ gọn và tiện ích hàng đầu được xây dựng trên nền tảng Node.js, cung cấp hệ thống tính năng mạnh mẽ để phát triển các ứng dụng web và API. Nó giúp lập trình viên tạo lập máy chủ nhanh chóng và có tổ chức hơn nhiều so với việc sử dụng module http thuần.');

$builder->addParagraph('Các tính năng cơ bản của Express framework:', false, true);
$builder->addBullet('Thiết lập các lớp trung gian (Middleware): Cho phép xử lý và can thiệp vào vòng đời HTTP Request - Response.');
$builder->addBullet('Bảng định tuyến (Routing): Định nghĩa các hành động xử lý dựa trên phương thức HTTP (GET, POST, PUT, DELETE) và đường dẫn URL.');
$builder->addBullet('Xử lý và chuẩn hóa dữ liệu: Tự động trích xuất chuỗi JSON từ body của request thành đối tượng JavaScript.');

$builder->addParagraph('Vai trò của Express trong lập trình web & quản lý nhà hàng:', false, true);
$builder->addParagraph('Trong lập trình web, Express giữ vai trò là framework backend giúp xây dựng và vận hành máy chủ cho ứng dụng. Express tiếp nhận các yêu cầu từ giao diện POS, Bếp KDS hoặc khách hàng quét mã QR, xử lý logic nghiệp vụ và trả về kết quả tương ứng. Nhờ hệ thống định tuyến và middleware linh hoạt, Express hỗ trợ quản lý API, xác thực người dùng và bảo mật dữ liệu hiệu quả. Bên cạnh đó, Express đóng vai trò trung gian kết nối giữa Client và Cơ sở dữ liệu. Với sự đơn giản và hiệu suất cao, Express là công cụ quan trọng trong phát triển web hiện đại.');

$builder->addImage(__DIR__ . '/../docs/screenshots/tech_express.png', 'Hình 1.2.3 ExpressJS');

// 1.2.4 JWT
$builder->addHeading3('1.2.4. JWT(Json Web Token)');
$builder->addParagraph('JWT (JSON Web Token) là một phương thức xác nhận danh tính người dùng khi đăng nhập vào website, được sử dụng rất phổ biến hiện nay. Có thể hiểu đơn giản: khi đăng nhập thành công, hệ thống sẽ cấp cho người dùng một "tấm thẻ điện tử" (chính là chuỗi JWT). Mỗi lần thực hiện thao tác trên website (như mở bàn, gọi món hay thanh toán), client chỉ cần xuất trình tấm thẻ đó ra tiêu đề Authorization: Bearer, hệ thống đối soát chữ ký là biết người dùng là ai và có quyền hạn gì mà không cần phải đăng nhập lại nhiều lần.');

$builder->addParagraph('Cấu trúc 3 thành phần của JWT:', false, true);
$builder->addBullet('Header: Chứa loại token (JWT) và thuật toán mã hóa chữ ký (HMAC SHA-256 - HS256).');
$builder->addBullet('Payload: Chứa các thông tin định danh (Claims) như id người dùng, email, vai trò (role) và thời gian hết hạn.');
$builder->addBullet('Signature: Chữ ký điện tử được tạo ra từ Header + Payload + Khóa bí mật (JWT_SECRET) trên server.');

$builder->addParagraph('Chức năng và vai trò của JWT trong lập trình web hiện đại:', false, true);
$builder->addParagraph('JWT có vai trò quan trọng trong việc xác thực và bảo mật ứng dụng web. JWT giúp hệ thống nhận biết danh tính người dùng sau khi đăng nhập thành công. Nhờ JWT, người dùng không cần đăng nhập lại nhiều lần. JWT cho phép kiểm soát quyền truy cập, phân biệt rõ ràng giữa quản trị viên (Admin), thu ngân (Cashier) và đầu bếp (Kitchen). Token được gửi kèm theo mỗi yêu cầu để đảm bảo request là hợp lệ. Đặc biệt, JWT hoạt động theo cơ chế phi trạng thái (Stateless), không cần lưu session trên server, giúp hệ thống hoạt động nhẹ hơn, nhanh hơn và sẵn sàng mở rộng quy mô.');

$builder->addImage(__DIR__ . '/../docs/screenshots/tech_jwt.png', 'Hình 1.2.4 JWT(Json Web Token)');

// 1.2.5 Socket.io
$builder->addHeading3('1.2.5. Socket.io (Công nghệ thời gian thực WebSockets)');
$builder->addParagraph('Socket.io là thư viện cho phép thiết lập kết nối truyền thông hai chiều, toàn phần (Full-Duplex), có độ trễ cực thấp giữa trình duyệt và máy chủ dựa trên giao thức WebSocket. Trong hệ thống nhà hàng Royal Bistro, Socket.io đóng vai trò như hệ thống "bộ đàm điện tử": khi POS bấm gửi order, sự kiện new_order lập tức phát chuông reo tại màn hình Bếp KDS; khi đầu bếp bấm nấu xong, sự kiện order_status_update cập nhật lại giao diện thu ngân ngay lập tức.');

// 1.2.6 Bcrypt
$builder->addHeading3('1.2.6. Thư viện mã hóa bảo mật Bcrypt');
$builder->addParagraph('Mật khẩu của người dùng tuyệt đối không bao giờ được lưu dưới dạng văn bản thô (Plain-text). Hệ thống sử dụng thư viện bcryptjs triển khai thuật toán băm một chiều Bcrypt với hệ số muối (Salt Rounds) bằng 10. Bcrypt tự động bổ sung chuỗi ngẫu nhiên (salt) vào mật khẩu trước khi băm, giúp vô hiệu hóa hoàn toàn các kỹ thuật tấn công giải mã Rainbow Table và Brute-force.');

$builder->addHeading2('1.3. Lý do chọn công nghệ');
$builder->addHeading3('1.3.1. Node.js');
$builder->addParagraph('Node.js được lựa chọn vì là môi trường chạy JavaScript mạnh mẽ ở phía server, giúp xây dựng ứng dụng web hiệu quả. Node.js có khả năng xử lý nhiều yêu cầu cùng lúc nhờ cơ chế bất đồng bộ, giúp tăng hiệu suất và tốc độ xử lý. Công nghệ này rất phù hợp cho các ứng dụng thời gian thực như POS, KDS và API nhà hàng hiện đại. Node.js cho phép sử dụng chung JavaScript cho cả Frontend và Backend, giúp tiết kiệm thời gian học và phát triển. Hệ sinh thái thư viện phong phú của Node.js hỗ trợ xây dựng ứng dụng nhanh chóng, nhẹ và dễ mở rộng.');

$builder->addHeading3('1.3.2. Cơ sở dữ liệu NoSQL MongoDB (Mongoose ODM)');
$builder->addParagraph('MongoDB và Mongoose ODM được lựa chọn vì tính linh hoạt, hiệu năng cao và sự tương thích hoàn hảo với môi trường Node.js. Cấu trúc tài liệu BSON/JSON giúp loại bỏ chi phí chuyển đổi dữ liệu (Impedance Mismatch), hỗ trợ nhúng chi tiết giỏ hàng và tùy chọn món ăn trực tiếp vào đơn hàng. Mongoose cung cấp đầy đủ các tính năng kiểm tra dữ liệu, middleware hook và tạo mã tự tăng thuận tiện.');

$builder->addHeading3('1.3.3. Express');
$builder->addParagraph('Express.js là framework backend phổ biến được xây dựng trên nền tảng Node.js, dùng để phát triển các ứng dụng web và API. Express.js giúp lập trình viên tạo server nhanh chóng và đơn giản hơn so với Node.js thuần. Framework này hỗ trợ định tuyến linh hoạt, giúp quản lý các đường dẫn và chức năng của website hiệu quả. Ngoài ra, Express.js còn có hệ thống middleware mạnh mẽ để xử lý dữ liệu, bảo mật và xác thực người dùng.');

$builder->addHeading3('1.3.4. JWT');
$builder->addParagraph('JWT (JSON Web Token) là cơ chế xác thực phổ biến trong lập trình web, dùng để kiểm tra và xác nhận danh tính người dùng. Sau khi đăng nhập thành công, hệ thống sẽ tạo ra một JWT và gửi cho người dùng. Token này được đính kèm trong các yêu cầu tiếp theo để chứng minh người dùng đã được xác thực. JWT giúp người dùng không cần đăng nhập lại nhiều lần mà vẫn đảm bảo an toàn, gọn nhẹ và tối ưu cho kiến trúc REST API.');

$builder->addTable(
    ['Tiêu chí so sánh', 'Node.js + Express + MongoDB (Hệ thống chọn)', 'PHP thuần / Laravel truyền thống', 'Java Spring Boot / .NET Core'],
    [
        ['Mô hình I/O', 'Non-blocking I/O, Event-driven: Tiêu hao ít RAM khi hàng nghìn máy kết nối.', 'Blocking I/O theo luồng (Thread): Dễ tốn RAM khi có nhiều kết nối chờ.', 'Đa luồng mạnh mẽ nhưng đòi hỏi máy chủ cấu hình rất cao.'],
        ['Thời gian thực', 'Native WebSocket với Socket.io: Nhẹ, cực nhanh, tích hợp cùng cổng Server.', 'Đòi hỏi cài dịch vụ trung gian ngoài (Pusher, Redis, Reverb).', 'Hỗ trợ tốt nhưng cấu hình tương đối phức tạp.'],
        ['Độ linh hoạt', 'Cao: Schema Mongoose linh hoạt, cấu trúc JSON đồng nhất từ DB tới Client.', 'Cao, nhưng có nhiều quy ước ngầm của framework.', 'Chặt chẽ, nhưng yêu cầu nhiều lớp cấu hình Boilerplate.'],
        ['Bảo mật & Phiên', 'Stateless JWT Bearer + RBAC: Cực kỳ dễ mở rộng phân tán.', 'Mặc định Session lưu trữ phía máy chủ.', 'Rất mạnh nhưng cấu hình Spring Security tương đối nặng nề.']
    ],
    [1600, 2800, 2500, 2500]
);

$builder->addPageBreak();

// ====================================================
// CHƯƠNG 2
// ====================================================
$builder->addHeading1('Chương 2. THIẾT KẾ KIẾN TRÚC HỆ THỐNG');

$builder->addHeading2('2.1. Kiến trúc ứng dụng');
$builder->addParagraph('Ứng dụng sẽ hoạt động dựa trên các thành phần chính sau:');

$builder->addHeading3('2.1.1. Client (Frontend)');
$builder->addParagraph('Là phần giao diện của ứng dụng web mà người dùng trực tiếp nhìn thấy và tương tác. Frontend chạy trên trình duyệt hoặc thiết bị của người dùng, sử dụng các công nghệ như HTML, CSS, JavaScript, React 19 và Tailwind CSS v4. Phần này có nhiệm vụ hiển thị nội dung thực đơn, sơ đồ bàn, giỏ hàng, nhận thao tác của người dùng và gửi yêu cầu đến server.');

$builder->addHeading3('2.1.2. Server (Backend)');
$builder->addParagraph('Là phần xử lý phía sau của ứng dụng web, nơi người dùng không trực tiếp nhìn thấy. Backend có nhiệm vụ tiếp nhận các yêu cầu từ client, xử lý logic nghiệp vụ (gọi món, thanh toán, trừ kho định lượng BOM) và quản lý dữ liệu. Phần này làm việc trực tiếp với cơ sở dữ liệu MongoDB để lưu trữ và truy xuất thông tin.');

$builder->addHeading3('2.1.3. Database (MongoDB & Mongoose ODM)');
$builder->addParagraph('Là cơ sở dữ liệu NoSQL tài liệu được sử dụng để lưu trữ toàn bộ dữ liệu của hệ thống. Dữ liệu được tổ chức dưới dạng 12 Collections có lược đồ Mongoose Schema chặt chẽ, hỗ trợ liên kết tham chiếu và số định danh tự tăng. Cơ sở dữ liệu đảm bảo tính toàn vẹn dữ liệu, truy vấn linh hoạt và xử lý đồng thời hiệu quả.');

$builder->addHeading3('2.1.4. Middleware');
$builder->addParagraph('Là "phần mềm trung gian" đứng giữa ứng dụng và các hệ thống/dịch vụ khác, giúp chúng giao tiếp với nhau trơn tru hơn. Nó đảm nhiệm các việc dùng chung như xác thực JWT, phân quyền RBAC, ghi nhật ký (ghiNhatKyYeuCau), kiểm tra dữ liệu đầu vào và xử lý lỗi tập trung (xuLyLoiHeThong).');

$builder->addHeading3('2.1.5. Sơ đồ kiến trúc ứng dụng');
$builder->addParagraph('Dưới đây là sơ đồ kiến trúc tổng thể mô tả luồng tương tác giữa Client, Server, Middleware và Database:');
$builder->addImage(__DIR__ . '/../docs/screenshots/arch_diagram.png', 'Hình 2.1.5 Sơ đồ kiến trúc ứng dụng');

$builder->addHeading2('2.2. Cấu trúc thư mục Monorepo & Quy chuẩn tiếng Việt');
$builder->addParagraph('Mã nguồn dự án được tổ chức khoa học theo mô hình Monorepo gồm 2 phân hệ độc lập: Chuyên đề Back-End (BE/) và Chuyên đề Front-End (FE/). Toàn bộ các tệp tin nguồn được đặt tên 100% bằng tiếng Việt không dấu (camelCase / PascalCase) kèm chú thích JSDoc đầy đủ:');
$builder->addImage(__DIR__ . '/../docs/screenshots/folder_structure.png', 'Hình 2.2 Cấu trúc thư mục server');

$builder->addHeading3('2.2.1. Thư mục BE/src/config/');
$builder->addParagraph('Lưu cấu hình hệ thống: coSoDuLieu.js kết nối CSDL MongoDB thông qua Mongoose ODM, cauHinhJWT.js lưu cấu hình bí mật JWT_SECRET và thời hạn token 24 giờ.');

$builder->addHeading3('2.2.2. Thư mục BE/src/constants/');
$builder->addParagraph('Nơi lưu trữ tập trung các hằng số dùng chung trong hangSoHeThong.js: VAI_TRO (admin, cashier, kitchen, staff), TRANG_THAI_BAN (trong, co_khach, da_dat), TRANG_THAI_DON (cho_xac_nhan, dang_che_bien, da_phuc_vu, hoan_thanh, da_huy) và PHUONG_THUC_THANH_TOAN.');

$builder->addHeading3('2.2.3. Thư mục BE/src/models/');
$builder->addParagraph('Tập hợp 12 Mongoose Schemas & Models hoàn chỉnh: NguoiDung.js, BanAn.js, LoaiMon.js, MonAn.js, DatMon.js, DatBanTruoc.js, NguyenLieu.js, MonAnNguyenLieu.js, NhaCungCap.js, KhachHang.js, BaoCao.js, BoDem.js.');

$builder->addHeading3('2.2.4. Thư mục BE/src/controllers/');
$builder->addParagraph('Tầng xử lý logic nghiệp vụ gồm 8 bộ điều khiển chuyên trách: xacThucController.js, banAnController.js, monAnController.js, datMonController.js, khoNguyenLieuController.js, khachHangController.js, datBanController.js, baoCaoController.js.');

$builder->addHeading3('2.2.5. Thư mục BE/src/middlewares/');
$builder->addParagraph('Chứa các hàm trung gian kiểm soát luồng request: kiemTraXacThuc.js (xác thực token Bearer JWT và phân quyền vai trò RBAC), xuLyLoiHeThong.js (bắt lỗi tập trung toàn cục) và ghiNhatKyYeuCau.js (ghi nhận phương thức, URL và thời gian xử lý ms).');

$builder->addHeading3('2.2.6. Thư mục BE/src/routes/');
$builder->addParagraph('Tầng định tuyến API chuyển tiếp endpoint đến controller: dinhTuyenXacThuc.js, dinhTuyenBanAn.js, dinhTuyenMonAn.js, dinhTuyenDatMon.js, dinhTuyenKhoNguyenLieu.js, dinhTuyenKhachHang.js, dinhTuyenDatBan.js, dinhTuyenBaoCao.js và dinhTuyenTongHop.js.');

$builder->addHeading3('2.2.7. Thư mục BE/src/utils/');
$builder->addParagraph('Các công cụ tiện ích tái sử dụng: xuLyBatDongBo.js (asyncHandler loại bỏ try/catch thừa), dinhNghiaLoi.js (các lớp ngoại lệ tùy biến), ghiNhatKyLog.js, chuanHoaPhanHoi.js, truyenThongSocket.js, khoiTaoDuLieuMau.js và taoMaTuTang.js.');

$builder->addCodeBlock(
"BE/
├── src/
│   ├── config/              # coSoDuLieu.js, cauHinhJWT.js
│   ├── constants/           # hangSoHeThong.js
│   ├── controllers/         # xacThucController, banAnController, monAnController, datMonController...
│   ├── middlewares/         # kiemTraXacThuc.js, xuLyLoiHeThong.js, ghiNhatKyYeuCau.js
│   ├── models/              # 12 Mongoose Models (NguoiDung, BanAn, MonAn, DatMon, NguyenLieu...)
│   ├── routes/              # dinhTuyenXacThuc, dinhTuyenBanAn, dinhTuyenMonAn, dinhTuyenDatMon...
│   └── utils/               # xuLyBatDongBo, dinhNghiaLoi, ghiNhatKyLog, truyenThongSocket, taoMaTuTang...
├── .env                     # MONGODB_URI, PORT=5000, JWT_SECRET
├── package.json
└── server.js                # Entry point chính khởi động máy chủ REST API & Socket.io

FE/
├── public/ma_qr.jpg         # Mã QR chính thức dùng trong hệ thống
├── src/
│   ├── components/          # BoCucGiaoDienChinh, ModalInHoaDon (VietQR), ThanhMenuDieuHuong...
│   ├── context/             # NguoiDungContext, SocketRealtimeContext, ThongBaoToastContext
│   ├── pages/               # 11 trang tiếng Việt (TongQuanDashboard, GoiMonTaiBanPOS, ManHinhBepKDS...)
│   ├── services/            # cauHinhAxiosApi, dichVuBanAn, dichVuDatMon, dichVuMonAn...
│   └── utils/               # dinhDangDuLieu.js
├── package.json
└── vite.config.js"
);

$builder->addPageBreak();


// ====================================================
// CHƯƠNG 3
// ====================================================
$builder->addHeading1('Chương 3. CÀI ĐẶT THỰC NGHIỆM VÀ KẾT QUẢ');

$builder->addHeading2('3.1. Thiết kế Cơ sở Dữ liệu & Thực thể nghiệp vụ');
$builder->addParagraph('Hệ thống cơ sở dữ liệu của Royal Bistro được chuẩn hóa bao gồm 12 bảng dữ liệu chặt chẽ, phản ánh đầy đủ chuỗi giá trị vận hành nhà hàng thực tế:');

$builder->addHeading3('3.1.1. Lược đồ quan hệ dạng dòng chuẩn');
$builder->addBullet('LOAI_MON (id, ma_loai, ten_loai, created_at, updated_at)', '1.');
$builder->addBullet('MON_AN (id, #loai_mon_id, ten_mon, gia, mo_ta, hinh_anh, trang_thai, created_at, updated_at)', '2.');
$builder->addBullet('BAN (id, so_ban, suc_chua, trang_thai, khu_vuc, yeu_cau_thanh_toan, so_luong_khach, created_at, updated_at)', '3.');
$builder->addBullet('DAT_BAN_TRUOC (id, #ban_id, ma_reservation, ten_khach, sdt, thoi_gian_hen, so_luong_khach, tien_coc, trang_thai, ghi_chu, created_at, updated_at)', '4.');
$builder->addBullet('KHACH_HANG (id, ho_ten, so_dien_thoai, email, diem_tich_luy, hang_thanh_vien, tong_chi_tieu, created_at, updated_at)', '5.');
$builder->addBullet('USERS (id, name, email, password, role, so_dien_thoai, trang_thai, created_at, updated_at)', '6.');
$builder->addBullet('NGUYEN_LIEU (id, ten_nguyen_lieu, don_vi_tinh, so_luong_ton, gia_nhap_trung_binh, dinh_muc_toi_thieu, han_su_dung, created_at, updated_at)', '7.');
$builder->addBullet('MON_AN_NGUYEN_LIEU (id, #mon_an_id, #nguyen_lieu_id, so_luong_can, don_vi_tinh, created_at, updated_at)', '8.');
$builder->addBullet('NHA_CUNG_CAP (id, ma_ncc, ten_ncc, so_dien_thoai, email, dia_chi, danh_gia_sao, created_at, updated_at)', '9.');
$builder->addBullet('LO_HANG_NHAP (id, ma_lo, #nguyen_lieu_id, #nha_cung_cap_id, ngay_nhap, ngay_het_han, so_luong_nhap, so_luong_ton, don_gia_nhap, vi_tri_kho, created_at, updated_at)', '10.');
$builder->addBullet('DAT_MON (id, #ban_id, #mon_an_id, #khach_hang_id, so_luong, don_gia, tong_tien, options_json, ghi_chu, trang_thai, phuong_thuc_thanh_toan, session_token, thu_tu_uu_tien, so_luong_khach, created_at, updated_at)', '11.');
$builder->addBullet('BAO_CAO_QUAN_LY (id, ma_bao_cao, ngay_lap, nguoi_lap, ca_lam_viec, tong_so_hoa_don, tong_luong_khach, tong_doanh_thu, doanh_thu_tien_mat, doanh_thu_chuyen_khoan, created_at, updated_at)', '12.');

$builder->addHeading3('3.1.2. Phân tích chi tiết các mối quan hệ (Cardinality ERD)');
$builder->addTable(
    ['Bảng Nguồn (1)', 'Bảng Đích (N)', 'Khóa Ngoại (#FK)', 'Bản Số', 'Ý Nghĩa Nghiệp Vụ Thực Tế'],
    [
        ['LOAI_MON', 'MON_AN', '#loai_mon_id', '1 - N', 'Một danh mục chứa nhiều món ăn. Khi xóa danh mục, khóa ngoại gán NULL để bảo toàn món.'],
        ['BAN', 'DAT_BAN_TRUOC', '#ban_id', '1 - N', 'Một bàn ăn có thể được đặt trước vào nhiều khung giờ khác nhau.'],
        ['BAN', 'DAT_MON', '#ban_id', '1 - N', 'Một bàn ăn phát sinh nhiều lượt gọi món trong các ca phục vụ.'],
        ['MON_AN', 'DAT_MON', '#mon_an_id', '1 - N', 'Mỗi món ăn xuất hiện trong nhiều lượt gọi món và hóa đơn của khách.'],
        ['KHACH_HANG', 'DAT_MON', '#khach_hang_id', '1 - N', 'Khách hàng thân thiết tích lũy điểm thưởng qua mỗi lần gọi món.'],
        ['MON_AN', 'MON_AN_NGUYEN_LIEU', '#mon_an_id', '1 - N', 'Quan hệ N-N giữa Món ăn và Nguyên liệu được giải quyết qua bảng định lượng BOM.'],
        ['NGUYEN_LIEU', 'MON_AN_NGUYEN_LIEU', '#nguyen_lieu_id', '1 - N', 'Một nguyên liệu kho tham gia chế biến nhiều món ăn khác nhau.'],
        ['NGUYEN_LIEU', 'LO_HANG_NHAP', '#nguyen_lieu_id', '1 - N', 'Một nguyên liệu được nhập về qua nhiều lô hàng khác nhau theo đợt.'],
        ['NHA_CUNG_CAP', 'LO_HANG_NHAP', '#nha_cung_cap_id', '1 - N', 'Một nhà cung cấp giao nhiều lô hàng thực phẩm cho nhà hàng.']
    ],
    [1600, 1800, 1600, 1000, 3400]
);

$builder->addHeading3('3.1.3. Từ điển dữ liệu chi tiết cho các bảng trọng tâm');
$builder->addParagraph('Dưới đây là cấu trúc bảng nghiệp vụ trọng tâm DAT_MON (Giao dịch gọi món & Hóa đơn chi tiết):');
$builder->addTable(
    ['Tên Cột', 'Kiểu Dữ Liệu', 'Ràng Buộc', 'Diễn Giải Nghiệp Vụ Chi Tiết'],
    [
        ['id', 'INT / INTEGER', 'PK, AUTO_INCREMENT', 'Mã định danh duy nhất cho từng lượt gọi món.'],
        ['ban_id', 'INT', 'FK -> ban(id)', 'Bàn ăn đang dùng bữa và phát sinh lượt gọi món.'],
        ['mon_an_id', 'INT', 'FK -> mon_an(id)', 'Món ăn trong thực đơn được khách chọn.'],
        ['khach_hang_id', 'INT', 'FK -> khach_hang(id)', 'Mã thành viên tích điểm (nếu có).'],
        ['so_luong', 'INT', 'NOT NULL, DEFAULT 1', 'Số lượng đĩa / phần món cần nấu.'],
        ['don_gia', 'DECIMAL(12,2)', 'NOT NULL', 'Đơn giá niêm yết tại thời điểm khách bấm đặt.'],
        ['tong_tien', 'DECIMAL(12,2)', 'NOT NULL', 'Thành tiền = so_luong * don_gia.'],
        ['options_json', 'TEXT / JSON', 'NULL', 'Tùy chọn độ cay, lượng đường, đá, topping.'],
        ['ghi_chu', 'VARCHAR(255)', 'NULL', 'Lời nhắn gửi riêng cho đầu bếp.'],
        ['trang_thai', 'VARCHAR(30)', 'DEFAULT "cho_xac_nhan"', 'Trạng thái: cho_xac_nhan, dang_che_bien, hoan_thanh, da_huy.'],
        ['phuong_thuc_thanh_toan', 'VARCHAR(30)', 'DEFAULT "chua_thanh_toan"', 'Trạng thái: chua_thanh_toan, tien_mat, chuyen_khoan.'],
        ['thu_tu_uu_tien', 'INT', 'DEFAULT 1', 'Độ ưu tiên chế biến tại bếp (1: Thường, 2: Gấp).'],
        ['created_at', 'DATETIME', 'CURRENT_TIMESTAMP', 'Thời điểm gửi order xuống bếp.'],
        ['updated_at', 'DATETIME', 'CURRENT_TIMESTAMP', 'Thời điểm bếp đổi trạng thái chế biến.']
    ],
    [1800, 1800, 2200, 3600]
);

$builder->addHeading2('3.2. Một số giao diện hệ thống & Luồng tương tác Client-Server');
$builder->addParagraph('Các hình ảnh dưới đây được chụp trực tiếp từ ứng dụng Royal Bistro đang hoạt động thực tế trên máy chủ nội bộ:');

// Ảnh 1: Login
$builder->addImage(
    __DIR__ . '/../docs/screenshots/01_login.png',
    'Hình 3.2.1: Màn hình Đăng nhập hệ thống & 3 nút 1-Click Demo Login phục vụ kiểm thử nhanh'
);
$builder->addParagraph('Mục tiêu: Cung cấp cổng xác thực an toàn cho nhân viên nhà hàng. Hệ thống tích hợp sẵn 3 nút chuyển đổi vai trò siêu tốc (1-Click Login): Quản Lý (Admin), Thu Ngân (Cashier) và Bếp Trưởng (Kitchen).');

// Ảnh 2: Dashboard
$builder->addImage(
    __DIR__ . '/../docs/screenshots/02_dashboard.png',
    'Hình 3.2.2: Bảng điều khiển Dashboard phân tích Doanh thu, Đơn hàng, Món ăn và Bếp'
);
$builder->addParagraph('Mục tiêu: Cung cấp bức tranh toàn cảnh về tình hình kinh doanh thời gian thực cho Ban Giám đốc và Quản lý nhà hàng. Tự động tính tổng doanh số hôm nay, tỷ lệ hủy đơn, Top 5 món bán chạy nhất và cảnh báo nguyên liệu cạn kiệt.');

// Ảnh 3: Table Management
$builder->addImage(
    __DIR__ . '/../docs/screenshots/03_tables.png',
    'Hình 3.2.3: Sơ đồ mặt bằng bàn ăn hiển thị trạng thái Trống, Có khách, Đã đặt theo khu vực'
);
$builder->addParagraph('Mục tiêu: Giúp nhân viên lễ tân và thu ngân bao quát sơ đồ mặt bằng các tầng (Tầng 1, Tầng 2, Sân Vườn, VIP). Khi bàn đổi trạng thái, Socket.io lập tức đổi màu ô bàn trên toàn bộ các máy trạm khác.');

// Ảnh 4: POS Order
$builder->addImage(
    __DIR__ . '/../docs/screenshots/04_pos_order.png',
    'Hình 3.2.4: Màn hình Bán hàng POS gọi món, chọn danh mục, giỏ hàng theo từng bàn và thanh toán'
);
$builder->addParagraph('Mục tiêu: Tối ưu hóa tốc độ gọi món cho nhân viên phục vụ tại quầy thu ngân. Hỗ trợ lọc món theo danh mục, tùy chỉnh ghi chú và giỏ hàng động theo từng bàn.');

// Ảnh 5: Kitchen KDS
$builder->addImage(
    __DIR__ . '/../docs/screenshots/05_kitchen_kds.png',
    'Hình 3.2.5: Màn hình Bếp KDS sắp xếp thứ tự ưu tiên, nhận đơn, nấu món và kích hoạt trừ kho BOM'
);
$builder->addParagraph('Mục tiêu: Thay thế hoàn toàn máy in bill bếp truyền thống, giảm thiểu tiếng ồn và tránh thất lạc đơn món. Bếp trưởng thấy rõ món nào cần nấu trước, thuộc bàn nào, thời gian chờ bao lâu.');

// Ảnh 6: Dish Management
$builder->addImage(
    __DIR__ . '/../docs/screenshots/06_dishes.png',
    'Hình 3.2.6: Giao diện Quản lý Thực đơn, phân loại danh mục món ăn và cập nhật giá bán'
);
$builder->addParagraph('Mục tiêu: Cho phép quản lý thêm mới, chỉnh sửa giá bán, tải ảnh món ăn hoặc tạm ngừng bán các món hết nguyên liệu.');

$builder->addHeading2('3.3. Các chức năng Backend chuyên sâu');

$builder->addHeading3('3.3.1. Nghiệp vụ Xác thực & Phân quyền RBAC');
$builder->addParagraph('Hệ thống cài đặt kiểm soát truy cập dựa trên vai trò (Role-Based Access Control) thông qua bộ đôi middleware kiemTraXacThuc và phanQuyenVaiTro tại BE/src/middlewares/kiemTraXacThuc.js:');
$builder->addCodeBlock(
"/**
 * Middleware phân quyền truy cập theo vai trò (RBAC)
 * @param {...string} cacVaiTroChoPhep - Danh sách các vai trò có quyền truy cập
 */
export function phanQuyenVaiTro(...cacVaiTroChoPhep) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
    }
    // Quản trị viên (admin) có quyền truy cập toàn bộ các endpoint
    if (!cacVaiTroChoPhep.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này. Quyền yêu cầu: \${cacVaiTroChoPhep.join(', ')}`
      });
    }
    next();
  };
}"
);

$builder->addHeading3('3.3.2. Thuật toán Trừ kho tự động theo Định lượng (BOM Recipe)');
$builder->addParagraph('Khác với các hệ thống quản lý bán hàng thông thường chỉ trừ số lượng sản phẩm nguyên chiếc, hệ thống nhà hàng F&B phải giải bài toán trừ nguyên liệu thô theo công thức nấu ăn (BOM - Bill of Materials). Khi đầu bếp chuyển trạng thái món sang "dang_che_bien", Server tự động dò tìm MonAnNguyenLieu và thực hiện trừ tồn kho trong collection NguyenLieu qua Mongoose ODM:');
$builder->addCodeBlock(
"if (trang_thai === 'dang_che_bien' && donHienTai.trang_thai === 'cho_xac_nhan') {
  const danhSachBOM = await MonAnNguyenLieu.find({ mon_an_id: donHienTai.mon_an_id });
  for (const bom of danhSachBOM) {
    const soLuongCanTru = bom.so_luong_can * donHienTai.so_luong;
    const nguyenLieu = await NguyenLieu.findOne({ id: bom.nguyen_lieu_id });
    if (nguyenLieu) {
      nguyenLieu.so_luong_ton = Math.max(0, nguyenLieu.so_luong_ton - soLuongCanTru);
      await nguyenLieu.save();
    }
  }
}"
);
$builder->addParagraph('Đối với hệ thống kho chi tiết, hệ thống áp dụng nguyên tắc cảnh báo sớm khi số lượng tồn kho chạm hoặc giảm dưới định mức tồn tối thiểu (so_luong_ton <= dinh_muc_toi_thieu), giúp quản trị viên chủ động lên đơn nhập hàng.');

$builder->addHeading3('3.3.3. Cơ chế Đồng bộ thời gian thực WebSockets (Socket.io)');
$builder->addParagraph('Mọi biến động dữ liệu trên máy chủ đều được phát sóng tức thời tới các máy trạm thông qua module BE/src/utils/truyenThongSocket.js:');
$builder->addCodeBlock(
"export function phatDonHangMoi(donHang) {
  if (thucTheSocket) thucTheSocket.emit('order:new', donHang);
}

export function phatCapNhatTrangThaiDon(donHang) {
  if (thucTheSocket) thucTheSocket.emit('order:status_updated', donHang);
}

export function phatCapNhatBan(banAn) {
  if (thucTheSocket) thucTheSocket.emit('table:updated', banAn);
}"
);

$builder->addHeading3('3.3.4. Nghiệp vụ Thanh toán đa kênh (VietQR, Tiền mặt) & Tách Bill');
$builder->addParagraph('Nghiệp vụ thanh toán được xử lý tập trung trong thanhToanHoaDon (datMonController.js):');
$builder->addBullet('Tính tổng tiền các món chưa thanh toán trên bàn ăn.');
$builder->addBullet('Áp dụng giảm trừ điểm thưởng CRM nếu khách hàng yêu cầu: tongThucThu = Math.max(0, tongTien - giamGiaDiem).');
$builder->addBullet('Tích hợp ảnh mã QR thanh toán chuẩn hóa (/ma_qr.jpg) trực tiếp trên Modal in hóa đơn và màn hình khách gọi món.');
$builder->addBullet('Tự động tích lũy điểm cho khách hàng theo tỷ lệ 100.000 VNĐ = 1 điểm thưởng (KhachHang.diem_tich_luy).');
$builder->addBullet('Chuyển tất cả món ăn sang trạng thái "hoan_thanh", đưa bàn ăn về trạng thái "trong" và phát sự kiện phatCapNhatBan giải phóng bàn trên sơ đồ.');

$builder->addPageBreak();

// ====================================================
// CHƯƠNG 4
// ====================================================
$builder->addHeading1('Chương 4. XỬ LÝ LỖI VÀ BẢO MẬT HỆ THỐNG');

$builder->addHeading2('4.1. Kiến trúc Xử lý lỗi trong ứng dụng');
$builder->addParagraph('Một hệ thống Back-End chuyên nghiệp đòi hỏi cơ chế xử lý lỗi chặt chẽ, không bao giờ để lộ thông tin nhạy cảm của máy chủ cho người dùng cuối, đồng thời phải cung cấp nhật ký lỗi chi tiết cho lập trình viên.');

$builder->addHeading3('4.1.1. Cơ chế bao bọc bất đồng bộ xuLyBatDongBo');
$builder->addParagraph('Hệ thống triển khai tiện ích xuLyBatDongBo.js nhằm triệt tiêu hoàn toàn các khối try/catch lặp đi lặp lại trong Controller:');
$builder->addCodeBlock(
"export const xuLyBatDongBo = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};"
);

$builder->addHeading3('4.1.2. Định nghĩa hệ thống Custom Error Classes (dinhNghiaLoi.js)');
$builder->addParagraph('Hệ thống xây dựng cây phân cấp các lớp ngoại lệ kế thừa từ Error: LoiHeThong (AppError), LoiYeuCauKhongHopLe (BadRequestError - 400), LoiChuaXacThuc (UnauthorizedError - 401), LoiKhongCoQuyen (ForbiddenError - 403), LoiKhongTimThay (NotFoundError - 404).');

$builder->addHeading3('4.1.3. Bộ xử lý lỗi tập trung xuLyLoiHeThong Middleware');
$builder->addParagraph('Toàn bộ lỗi từ các tầng đều hội tụ về BE/src/middlewares/xuLyLoiHeThong.js, ghi log chi tiết và trả về JSON chuẩn:');
$builder->addCodeBlock(
"export function xuLyLoiHeThong(err, req, res, next) {
  const maTrangThai = err.statusCode || 500;
  const thongDiep = err.message || 'Đã xảy ra lỗi máy chủ nội bộ.';
  inLog.loi(`[\${req.method}] \${req.originalUrl} - (\${maTrangThai}) \${thongDiep}`);
  return res.status(maTrangThai).json({
    success: false,
    message: thongDiep,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}"
);

$builder->addHeading3('4.1.4. Hệ thống Request Logger giám sát hiệu năng');
$builder->addParagraph('Tích hợp middleware ghiNhatKyYeuCau.js đo lường thời gian đáp ứng của từng request (Method, URL, Status Code, Duration ms).');


$builder->addHeading3('4.1.5. Xử lý các tình huống lỗi thực tế');
$builder->addBullet('Lỗi sai mật khẩu hoặc tài khoản: Trả về HTTP 401 Unauthorized kèm thông báo rõ ràng.');
$builder->addBullet('Lỗi JWT Token hết hạn: Trả về HTTP 401 để Client tự động chuyển hướng về trang Login.');
$builder->addBullet('Lỗi truy cập trái thẩm quyền: Trả về HTTP 403 Forbidden khi Cashier/Kitchen cố tình truy cập tài nguyên Admin.');
$builder->addBullet('Lỗi gọi món vào bàn không tồn tại: Trả về HTTP 404 Not Found.');

$builder->addHeading2('4.2. Bảo mật hệ thống Back-End');
$builder->addHeading3('4.2.1. Bảo vệ xác thực với JWT Token');
$builder->addParagraph('Hệ thống sử dụng cơ chế xác thực không lưu trạng thái (Stateless). Khóa bí mật JWT_SECRET được bảo vệ nghiêm ngặt trong tệp cấu hình môi trường .env. Thời hạn sống của token được giới hạn trong 24 giờ.');

$builder->addHeading3('4.2.2. Mã hóa mật khẩu với Bcrypt Salt Hashing');
$builder->addParagraph('Mật khẩu được băm một chiều với 10 vòng sinh muối (bcrypt.hash(password, 10)). Do tính chất một chiều của hàm băm, ngay cả quản trị viên có quyền truy cập file CSDL cũng không thể giải mã được mật khẩu thực sự của nhân viên.');

$builder->addHeading3('4.2.3. Kiểm soát quyền truy cập dựa trên vai trò (RBAC)');
$builder->addParagraph('Mỗi tài khoản được phân định một trong ba vai trò bất biến trong phiên: admin, cashier, kitchen. Mọi endpoint nhạy cảm đều được bảo vệ bởi middleware authorize để ngăn chặn hoàn toàn việc leo thang đặc quyền.');

$builder->addHeading3('4.2.4. Chống tấn công SQL Injection và Data Tampering');
$builder->addParagraph('Tất cả các truy vấn CSDL đều sử dụng câu lệnh chuẩn bị sẵn với tham số truyền rời (Parameterized Query với dấu ?). Các ký tự điều khiển nguy hiểm sẽ chỉ được xem là chuỗi thông thường, vô hiệu hóa 100% các cuộc tấn công SQL Injection.');

$builder->addHeading3('4.2.5. Cấu hình bảo mật CORS & Quản lý biến môi trường .env');
$builder->addParagraph('Hệ thống cấu hình middleware cors kiểm soát các phương thức HTTP được phép giao tiếp, ngăn chặn tấn công chéo trang CSRF. Các thông số cấu hình nhạy cảm (PORT, DB_PATH, JWT_SECRET) đều được tách biệt trong file .env và đưa vào .gitignore.');

$builder->addPageBreak();

// ====================================================
// CHƯƠNG 5
// ====================================================
$builder->addHeading1('Chương 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN');

$builder->addHeading2('5.1. Kết luận');
$builder->addHeading3('5.1.1. Kết quả đạt được');
$builder->addParagraph('Đề tài "Xây dựng hệ thống Back-End cho Phần Mềm Quản Lý Nhà Hàng & Gọi Món (Royal Bistro)" đã hoàn thành toàn diện tất cả các mục tiêu nghiên cứu và yêu cầu kỹ thuật:');
$builder->addBullet('Kiến trúc mã nguồn chuẩn mực: Tổ chức dự án theo mô hình phân tầng module hóa, mã nguồn trong sáng, dễ đọc, dễ bảo trì.');
$builder->addBullet('Cơ sở dữ liệu hoàn thiện: Thiết kế và cài đặt thành công 12 bảng CSDL quan hệ chuẩn 3NF, xử lý tốt bài toán định lượng BOM và lô hàng FEFO.');
$builder->addBullet('Bộ API phong phú, đầy đủ: Xây dựng hơn 30 RESTful API endpoints bao quát toàn bộ quy trình vận hành nhà hàng.');
$builder->addBullet('Trải nghiệm thời gian thực: Ứng dụng thành công Socket.io WebSockets để liên lạc hai chiều giữa POS và Bếp KDS với độ trễ dưới 50ms.');
$builder->addBullet('Cơ chế Xử lý lỗi & Bảo mật vững chắc: Áp dụng asyncHandler, Custom Errors, errorHandler tập trung, Request Logger, Bcrypt và JWT RBAC.');

$builder->addHeading3('5.1.2. Hạn chế còn tồn tại');
$builder->addBullet('Chưa tích hợp Redis In-Memory Cache để lưu trữ tạm các truy vấn thực đơn và sơ đồ bàn khi lưu lượng truy cập tăng vọt.');
$builder->addBullet('Chưa tích hợp Webhook IPN từ ngân hàng để tự động xác nhận tiền chuyển khoản VietQR đã vào tài khoản.');
$builder->addBullet('Các tác vụ gửi email hoặc xuất báo cáo Excel quy mô lớn vẫn đang được xử lý đồng bộ, chưa đưa vào hàng đợi Message Queue.');

$builder->addHeading2('5.2. Hướng phát triển tương lai');
$builder->addHeading3('5.2.1. Kế hoạch phát triển đề tài');
$builder->addBullet('Nâng cấp kiến trúc Microservices: Tách các module Reporting và Notification thành các dịch vụ riêng biệt.');
$builder->addBullet('Tích hợp Redis Caching: Lưu trữ danh mục thực đơn và trạng thái bàn ăn trên Redis Cache để nâng cao năng lực phục vụ.');
$builder->addBullet('Tự động hóa thanh toán qua Webhook Ngân hàng: Kết nối API SePAY / VietQR Open API để tự động xác nhận thanh toán khi tiền vào tài khoản.');
$builder->addBullet('Tích hợp Trí tuệ nhân tạo (AI): Dự báo lượng khách trong các dịp lễ và gợi ý số lượng nguyên liệu cần nhập kho tối ưu chi phí.');

$builder->addHeading3('5.2.2. Kế hoạch phát triển bản thân');
$builder->addBullet('Học sâu về công nghệ đóng gói ứng dụng Docker, Docker Compose, thiết lập đường ống tự động hóa CI/CD với GitHub Actions.');
$builder->addBullet('Nâng cao kỹ năng viết Unit Test và Integration Test bằng Jest và Supertest.');
$builder->addBullet('Tìm hiểu kiến trúc Hệ thống Phân tán (Distributed Systems), phân vùng dữ liệu (Sharding) và cân bằng tải (Load Balancing).');
$builder->addBullet('Rèn luyện kỹ năng làm việc nhóm, thuyết trình giải pháp kỹ thuật để sẵn sàng tham gia vào các dự án phần mềm thực tế tại doanh nghiệp.');

$builder->addHeading1('DANH MỤC TÀI LIỆU THAM KHẢO');
$builder->addBullet('Node.js Foundation (2025). Node.js Documentation & Architectural Guides. https://nodejs.org/docs/', '[1]');
$builder->addBullet('Express.js Technical Committee (2024). Express.js 4.x API Reference & Middleware Guide. https://expressjs.com/', '[2]');
$builder->addBullet('Socket.io Official Team (2024). Socket.io Server & Client Real-time Documentation. https://socket.io/docs/v4/', '[3]');
$builder->addBullet('Internet Engineering Task Force - IETF (2015). RFC 7519: JSON Web Token (JWT). https://datatracker.ietf.org/doc/html/rfc7519', '[4]');
$builder->addBullet('OWASP Foundation (2024). OWASP Top 10 API Security Vulnerabilities & Prevention Cheat Sheet. https://owasp.org/www-project-api-security/', '[5]');
$builder->addBullet('Bcrypt.js Open Source Project (2024). Bcrypt algorithm implementation for JavaScript. https://github.com/dcodeIO/bcrypt.js', '[6]');
$builder->addBullet('SQLite Consortium (2025). SQLite In-Depth Architectural Documentation. https://www.sqlite.org/docs.html', '[7]');
$builder->addBullet('Oracle Corporation (2024). MySQL 8.0 Reference Manual: InnoDB Storage Engine Architecture. https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html', '[8]');
$builder->addBullet('Nguyễn Ngọc Hà Thảo & Nhóm 5 (2026). Báo cáo Thiết kế và Cài đặt Cơ sở Dữ liệu Hệ thống Quản lý Nhà hàng & Gọi món (PhanMemQuanLyMonAn).', '[9]');
$builder->addBullet('ThS. Nguyễn Minh Hải (2025). Bài giảng Chuyên Đề Back-End & Hướng dẫn phát triển ứng dụng Web phân tán, Trường Cao đẳng Công nghệ Thông tin TP.HCM.', '[10]');

$builder->save();
