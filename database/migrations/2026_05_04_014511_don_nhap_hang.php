<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('don_nhap_hang', function (Blueprint $table) {
            $table->id();
            $table->string('ten_nguyen_lieu', 100);
            $table->string('nha_cung_cap', 100);
            $table->double('don_gia');
            $table->double('so_luong_dat');
            $table->double('so_luong_nhan')->nullable();
            $table->string('trang_thai', 50)->default('cho_kiem_ke'); // cho_kiem_ke, da_nhap_kho
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don_nhap_hang');
    }
};
