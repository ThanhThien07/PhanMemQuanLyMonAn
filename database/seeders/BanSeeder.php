<?php

namespace Database\Seeders;

use App\Models\Ban;
use Illuminate\Database\Seeder;

class BanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            ['ten' => 'Bàn 1', 'trang_thai' => 'Co_khach', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 2', 'trang_thai' => 'Da_goi', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 3', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 4', 'trang_thai' => 'Da_goi', 'yeu_cau_thanh_toan' => 'tien_mat'], // Bàn 4 gọi thanh toán tiền mặt
            ['ten' => 'Bàn 5', 'trang_thai' => 'Da_goi', 'yeu_cau_thanh_toan' => 'qr'], // Bàn 5 gọi thanh toán chuyển khoản
            ['ten' => 'Bàn 6', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 7', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 8', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 9', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
            ['ten' => 'Bàn 10', 'trang_thai' => 'Trong', 'yeu_cau_thanh_toan' => null],
        ];

        foreach ($tables as $t) {
            Ban::create($t);
        }
    }
}
