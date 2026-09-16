<?php
$zip = new ZipArchive();
if ($zip->open('CDBackEnd_goc.docx') === TRUE) {
    $xml = $zip->getFromName('word/document.xml');
    $relsXml = $zip->getFromName('word/_rels/document.xml.rels');
    $zip->close();
    
    $rels = [];
    if (preg_match_all('/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/i', $relsXml, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $m) {
            $rels[$m[1]] = $m[2];
        }
    }
    
    $pList = explode('</w:p>', $xml);
    for ($i = 0; $i < count($pList); $i++) {
        $text = trim(strip_tags($pList[$i]));
        if (preg_match('/^Hình\s*(1\.2|2\.)/i', $text)) {
            // Check current paragraph and previous 3 paragraphs for image
            $foundImg = 'none';
            for ($k = max(0, $i - 3); $k <= $i; $k++) {
                if (preg_match('/r:embed="([^"]+)"/i', $pList[$k], $b)) {
                    $foundImg = $rels[$b[1]] ?? $b[1];
                }
            }
            echo "$text ===> Image: $foundImg\n";
        }
    }
}
