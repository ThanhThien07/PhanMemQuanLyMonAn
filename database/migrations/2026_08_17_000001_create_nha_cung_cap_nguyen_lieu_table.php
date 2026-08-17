<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nha_cung_cap_nguyen_lieu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nha_cung_cap_id')->constrained('nha_cung_cap')->onDelete('cascade');
            $table->foreignId('nguyen_lieu_id')->constrained('nguyen_lieu')->onDelete('cascade');
            $table->double('don_gia_chao')->default(0);
            $table->string('don_vi_tinh')->default('kg');
            $table->double('moq')->default(1); // Minimum Order Quantity (Số lượng đặt tối thiểu)
            $table->integer('lead_time_days')->default(1); // Thời gian giao hàng (ngày)
            $table->float('danh_gia_star')->default(5.0); // Đánh giá uy tín NCC (1-5 sao)
            $table->text('ghi_chu')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nha_cung_cap_nguyen_lieu');
    }
};
