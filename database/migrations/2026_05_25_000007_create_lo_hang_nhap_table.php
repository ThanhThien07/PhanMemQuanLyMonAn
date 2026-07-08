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
        Schema::create('lo_hang_nhap', function (Blueprint $table) {
            $table->id();
            $table->string('ma_lo', 100);
            $table->unsignedBigInteger('nguyen_lieu_id');
            $table->unsignedBigInteger('don_nhap_hang_id')->nullable();
            $table->unsignedBigInteger('nha_cung_cap_id')->nullable();
            $table->date('ngay_nhap');
            $table->date('ngay_het_han'); // Hạn sử dụng
            $table->double('so_luong_nhap');
            $table->double('so_luong_ton'); // Lượng tồn thực tế trong lô hàng này
            $table->double('don_gia_nhap'); // Giá vốn của lô hàng này
            $table->string('vi_tri_kho', 100)->nullable();
            $table->timestamps();

            $table->foreign('nguyen_lieu_id')->references('id')->on('nguyen_lieu')->onDelete('cascade');
            $table->foreign('don_nhap_hang_id')->references('id')->on('don_nhap_hang')->onDelete('set null');
            $table->foreign('nha_cung_cap_id')->references('id')->on('nha_cung_cap')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lo_hang_nhap');
    }
};
