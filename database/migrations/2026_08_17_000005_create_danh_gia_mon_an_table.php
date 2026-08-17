<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('danh_gia_mon_an', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dat_mon_id')->nullable()->constrained('dat_mon')->onDelete('cascade');
            $table->foreignId('ban_id')->nullable()->constrained('ban')->onDelete('set null');
            $table->integer('so_sao')->default(5); // 1 - 5 sao
            $table->text('noi_dung_danh_gia')->nullable();
            $table->boolean('canh_bao_do')->default(false); // true nếu so_sao <= 2
            $table->string('trang_thai_xu_ly')->default('cho_xu_ly'); // cho_xu_ly, da_giai_quyet
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('danh_gia_mon_an');
    }
};
