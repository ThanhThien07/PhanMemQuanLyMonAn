<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bao_cao_quan_ly', function (Blueprint $table) {
            $table->id();
            $table->string('ma_bao_cao', 50)->unique();
            $table->date('ngay_lap');
            $table->string('nguoi_lap', 100);
            $table->string('ca_lam_viec', 50); // Sáng, Chiều, Tối

            // Doanh thu
            $table->integer('tong_so_hoa_don')->default(0);
            $table->double('tong_doanh_thu')->default(0);
            $table->double('doanh_thu_tien_mat')->default(0);
            $table->double('doanh_thu_chuyen_khoan')->default(0);
            $table->text('doanh_thu_theo_mon')->nullable(); // JSON string
            $table->text('doanh_thu_theo_khu_vuc')->nullable(); // JSON string

            // Đơn hàng
            $table->integer('tong_don_hang')->default(0);
            $table->integer('don_hoan_thanh')->default(0);
            $table->integer('don_huy')->default(0);
            $table->integer('don_dang_xu_ly')->default(0);

            // Món ăn
            $table->string('mon_ban_chay', 100)->nullable();
            $table->string('mon_ban_it', 100)->nullable();
            $table->text('so_luong_mon_da_ban')->nullable(); // JSON string

            // Nguyên liệu
            $table->text('nguyen_lieu_nhap')->nullable(); // JSON string
            $table->text('nguyen_lieu_dung')->nullable(); // JSON string
            $table->text('nguyen_lieu_ton_cuoi')->nullable(); // JSON string
            $table->text('nguyen_lieu_sap_het')->nullable(); // JSON string

            // Nhân viên
            $table->integer('so_nhan_vien')->default(0);
            $table->double('so_gio_lam')->default(0);
            $table->string('hieu_suat', 100)->nullable();

            // Ghi chú & Sự cố
            $table->text('phan_hoi_khach')->nullable();
            $table->text('su_co')->nullable();
            $table->text('de_xuat')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bao_cao_quan_ly');
    }
};
