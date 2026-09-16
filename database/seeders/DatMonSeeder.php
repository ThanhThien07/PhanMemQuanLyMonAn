<?php

namespace Database\Seeders;

use App\Models\DatMon;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatMonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = [
            // Bàn 1
            [
                'ten_mon' => 'Phở Bò M&S',
                'ghi_chu' => 'Không hành, nhiều thịt',
                'so_luong' => 2,
                'don_gia' => 45000,
                'thoi_gian_uoc_tinh' => 10, // 10 phút
                'trang_thai' => 'dang_cho',
                'ban_id' => 1,
                // Lùi 6 phút để vượt quá 50% thời gian chờ (10 / 2 = 5 phút)
                'created_at' => Carbon::now()->subMinutes(6),
                'updated_at' => Carbon::now()->subMinutes(6),
            ],
            [
                'ten_mon' => 'Nước Cam Ép',
                'ghi_chu' => 'Ít đá, không ngọt quá',
                'so_luong' => 1,
                'don_gia' => 25000,
                'thoi_gian_uoc_tinh' => 4,
                'trang_thai' => 'dang_cho',
                'ban_id' => 1,
                'created_at' => Carbon::now()->subMinutes(1),
                'updated_at' => Carbon::now()->subMinutes(1),
            ],

            // Bàn 2
            [
                'ten_mon' => 'Cà Phê Sữa Đá M&S',
                'ghi_chu' => 'Nhiều sữa',
                'so_luong' => 1,
                'don_gia' => 20000,
                'thoi_gian_uoc_tinh' => 3,
                'trang_thai' => 'dang_lam',
                'ban_id' => 2,
                'created_at' => Carbon::now()->subMinutes(2),
                'updated_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'ten_mon' => 'Bánh Mì Kẹp Thịt M&S',
                'ghi_chu' => 'Không ớt',
                'so_luong' => 1,
                'don_gia' => 25000,
                'thoi_gian_uoc_tinh' => 5,
                'trang_thai' => 'da_giao',
                'ban_id' => 2,
                'created_at' => Carbon::now()->subMinutes(15),
                'updated_at' => Carbon::now()->subMinutes(10),
            ],

            // Bàn 4 (Yêu cầu thanh toán tiền mặt)
            [
                'ten_mon' => 'Phở Bò M&S',
                'ghi_chu' => 'Bình thường',
                'so_luong' => 1,
                'don_gia' => 45000,
                'thoi_gian_uoc_tinh' => 10,
                'trang_thai' => 'da_giao',
                'ban_id' => 4,
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(20),
            ],
            [
                'ten_mon' => 'Trà Đào Cam Sả M&S',
                'ghi_chu' => 'Ít đào',
                'so_luong' => 1,
                'don_gia' => 30000,
                'thoi_gian_uoc_tinh' => 4,
                'trang_thai' => 'da_giao',
                'ban_id' => 4,
                'created_at' => Carbon::now()->subMinutes(28),
                'updated_at' => Carbon::now()->subMinutes(24),
            ],

            // Bàn 5 (Yêu cầu thanh toán QR)
            [
                'ten_mon' => 'Bún Chả M&S',
                'ghi_chu' => 'Thêm chả băm',
                'so_luong' => 1,
                'don_gia' => 40000,
                'thoi_gian_uoc_tinh' => 8,
                'trang_thai' => 'da_giao',
                'ban_id' => 5,
                'created_at' => Carbon::now()->subMinutes(40),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'ten_mon' => 'Trà Đào Cam Sả M&S',
                'ghi_chu' => 'Nhiều đá',
                'so_luong' => 1,
                'don_gia' => 30000,
                'thoi_gian_uoc_tinh' => 4,
                'trang_thai' => 'da_giao',
                'ban_id' => 5,
                'created_at' => Carbon::now()->subMinutes(38),
                'updated_at' => Carbon::now()->subMinutes(32),
            ],
        ];

        foreach ($orders as $o) {
            DatMon::create($o);
        }
    }
}
