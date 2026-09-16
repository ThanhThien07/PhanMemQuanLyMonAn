<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('don_dat_hang_ncc', function (Blueprint $table) {
            $table->id();
            $table->string('ma_don_po')->unique();
            $table->foreignId('nha_cung_cap_id')->constrained('nha_cung_cap')->onDelete('cascade');
            $table->date('ngay_dat');
            $table->date('du_kien_giao')->nullable();
            $table->double('tong_tien')->default(0);
            $table->string('trang_thai')->default('cho_duyet'); // cho_duyet, da_gui_po, da_giao_hang, da_huy
            $table->string('che_do_toi_uu')->default('lowest_cost'); // lowest_cost, free_shipping, manual
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });

        Schema::create('chi_tiet_don_dat_hang_ncc', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_dat_hang_ncc_id')->constrained('don_dat_hang_ncc')->onDelete('cascade');
            $table->foreignId('nguyen_lieu_id')->constrained('nguyen_lieu')->onDelete('cascade');
            $table->double('so_luong_dat');
            $table->double('don_gia_dat');
            $table->double('thanh_tien');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chi_tiet_don_dat_hang_ncc');
        Schema::dropIfExists('don_dat_hang_ncc');
    }
};
