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
        Schema::create('bien_ban_hao_hut', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguyen_lieu_id');
            $table->unsignedBigInteger('lo_hang_nhap_id');
            $table->double('so_luong_hao_hut');
            $table->string('ly_do', 255); // ví dụ: "Rau héo úa cuối ngày", "Hết hạn sử dụng"
            $table->unsignedBigInteger('user_id');
            $table->timestamp('thoi_gian');
            $table->timestamps();

            $table->foreign('nguyen_lieu_id')->references('id')->on('nguyen_lieu')->onDelete('cascade');
            $table->foreign('lo_hang_nhap_id')->references('id')->on('lo_hang_nhap')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bien_ban_hao_hut');
    }
};
