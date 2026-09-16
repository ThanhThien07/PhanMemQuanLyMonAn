<?php
$zip = new ZipArchive();
if ($zip->open('CDBackEnd_goc.docx') === TRUE) {
    $xml = $zip->getFromName('word/document.xml');
    $relsXml = $zip->getFromName('word/_rels/document.xml.rels');
    $zip->close();
    
    // Parse rels
    $rels = [];
    if (preg_match_all('/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/i', $relsXml, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $m) {
            $rels[$m[1]] = $m[2];
        }
    }
    
    // Split paragraphs
    $paragraphs = explode('</w:p>', $xml);
    foreach ($paragraphs as $p) {
        $text = trim(strip_tags($p));
        if (preg_match('/Hình\s*1\.2/i', $text) || preg_match('/Hình\s*2\./i', $text) || preg_match('/Node\.js|Express|MongoDB|JWT/i', $text)) {
            // Find blip in this or surrounding
            if (preg_match('/r:embed="([^"]+)"/i', $p, $bMatch)) {
                $target = $rels[$bMatch[1]] ?? '';
                echo "Text: $text | Image: $target\n";
            } else {
                echo "Text: $text\n";
            }
        }
    }
}
