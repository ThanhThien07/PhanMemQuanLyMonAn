<?php
$zip = new ZipArchive();
if ($zip->open('CDBackEnd_goc.docx') === TRUE) {
    if (!is_dir('docs/tech_logos')) {
        mkdir('docs/tech_logos', 0777, true);
    }
    $count = 0;
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (strpos($name, 'word/media/') === 0) {
            file_put_contents('docs/tech_logos/' . basename($name), $zip->getFromIndex($i));
            $count++;
        }
    }
    $zip->close();
    echo "Extracted $count media files to docs/tech_logos/\n";
} else {
    echo "Cannot open CDBackEnd_goc.docx\n";
}
