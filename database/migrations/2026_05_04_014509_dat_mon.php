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
        Schema::create('dat_mon', function (Blueprint $table) {
            $table->id();
            $table->string('ten_mon', 100);
            $table->string('ghi_chu', 255)->nullable();
            $table->integer('so_luong')->default(1);
            $table->double('don_gia');
            $table->integer('thoi_gian_uoc_tinh')->default(10); // tính theo phút
            $table->string('trang_thai', 50)->default('dang_cho'); // dang_cho, dang_lam, dang_giao, da_giao
            $table->unsignedBigInteger('ban_id');
            $table->foreign('ban_id')->references('id')->on('ban')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dat_mon');
    }
};
