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
        Schema::create('chi_tiet_tieu_hao_dat_mon', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dat_mon_id');
            $table->unsignedBigInteger('nguyen_lieu_id');
            $table->unsignedBigInteger('lo_hang_nhap_id');
            $table->double('so_luong_tieu_hao'); // Lượng thực sự rút ra
            $table->double('don_gia_von'); // Lưu cứng đơn giá vốn tại thời điểm chế biến
            $table->timestamps();

            $table->foreign('dat_mon_id')->references('id')->on('dat_mon')->onDelete('cascade');
            $table->foreign('nguyen_lieu_id')->references('id')->on('nguyen_lieu')->onDelete('cascade');
            $table->foreign('lo_hang_nhap_id')->references('id')->on('lo_hang_nhap')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_tieu_hao_dat_mon');
    }
};
