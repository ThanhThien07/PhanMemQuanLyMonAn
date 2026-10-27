<?php
/**
 * Điểm chuyển tiếp thông minh cho Laragon Apache Server (PhanMemQuanLyMonAn.test)
 * Tác giả: Nguyễn Hoàng Hưng
 * 
 * Tự động chuyển hướng trực tiếp tới FE/dist/index.html của hệ thống
 */

$query = !empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '';
$uriPath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

if (file_exists(__DIR__ . '/FE/dist/index.html')) {
    header('Location: ' . $uriPath . '/FE/dist/index.html' . $query);
    exit;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Royal Bistro POS - Khởi chạy</title>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
    <h2>🍽️ ROYAL BISTRO POS</h2>
    <p>Vui lòng chạy lệnh <code>npm run dev</code> trong thư mục dự án hoặc <code>cd FE &amp;&amp; npm run build</code>.</p>
</body>
</html>
