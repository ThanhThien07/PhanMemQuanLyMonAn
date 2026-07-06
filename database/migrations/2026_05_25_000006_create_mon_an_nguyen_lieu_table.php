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
        Schema::create('mon_an_nguyen_lieu', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mon_an_id');
            $table->unsignedBigInteger('nguyen_lieu_id');
            $table->double('so_luong_dinh_luong'); // Định lượng nguyên liệu cho 1 phần ăn
            $table->timestamps();

            $table->foreign('mon_an_id')->references('id')->on('mon_an')->onDelete('cascade');
            $table->foreign('nguyen_lieu_id')->references('id')->on('nguyen_lieu')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mon_an_nguyen_lieu');
    }
};
