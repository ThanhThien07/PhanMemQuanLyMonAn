<?php
$zip = new ZipArchive();
if ($zip->open('CDBackEnd.docx') === TRUE) {
    echo "Files in CDBackEnd.docx: " . $zip->numFiles . "\n";
    $docXml = $zip->getFromName('word/document.xml');
    echo "word/document.xml size: " . strlen($docXml) . " bytes\n";

    libxml_use_internal_errors(true);
    $xmlObj = simplexml_load_string($docXml);
    if ($xmlObj !== false) {
        echo "🎉 SUCCESS: word/document.xml is 100% VALID XML!\n";
    } else {
        echo "❌ FAILED: XML parsing errors:\n";
        foreach (libxml_get_errors() as $err) {
            echo "Line " . $err->line . ": " . $err->message . "\n";
        }
    }
    
    echo "Embedded media files in zip:\n";
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (strpos($name, 'media/') !== false) {
            $stat = $zip->statIndex($i);
            echo "- $name: " . round($stat['size'] / 1024, 1) . " KB\n";
        }
    }
    echo "Page breaks (<w:br w:type=\"page\"/>): " . substr_count($docXml, '<w:br w:type="page"/>') . "\n";
    $zip->close();
}
