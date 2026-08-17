<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dat_ban_truoc', function (Blueprint $table) {
            $table->id();
            $table->string('ma_reservation')->unique();
            $table->string('ten_khach');
            $table->string('sdt');
            $table->foreignId('ban_id')->nullable()->constrained('ban')->onDelete('set null');
            $table->dateTime('thoi_gian_hen');
            $table->integer('so_luong_khach')->default(2);
            $table->double('tien_coc')->default(0);
            $table->string('trang_thai')->default('cho_xac_nhan'); // cho_xac_nhan, da_xac_nhan, khach_da_den, da_huy
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dat_ban_truoc');
    }
};
