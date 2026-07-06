<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule custom commands for restaurant automation
use Illuminate\Support\Facades\Schedule;

// 1. Kiểm tra tồn kho và hạn sử dụng nguyên liệu hàng ngày lúc 8:00 sáng
Schedule::command('inventory:check')->dailyAt('08:00');

// 2. Tự động kết ca và tạo báo cáo định kỳ
// - Báo cáo tuần: tự động chạy vào lúc 23:30 tối Chủ Nhật hàng tuần
Schedule::command('report:generate --type=weekly')->weeklyOn(7, '23:30');

// - Báo cáo tháng: tự động chạy vào lúc 23:45 đêm ngày cuối cùng của tháng
Schedule::command('report:generate --type=monthly')->lastDayOfMonth('23:45');

// 3. Sao lưu toàn bộ MySQL (Tài khoản, Hóa đơn, Đơn hàng, Tồn kho, Lịch sử doanh thu) lúc 23:59 hàng ngày
Schedule::command('db:backup')->dailyAt('23:59');

// 4. Sao lưu toàn bộ file hệ thống (Hình ảnh món ăn, mã QR bàn ăn, báo cáo xuất ra, tài liệu hướng dẫn) lúc 23:59 hàng ngày
Schedule::command('system:backup')->dailyAt('23:59');
