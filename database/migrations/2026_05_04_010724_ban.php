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
        Schema::create('ban', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
            $table->string('trang_thai', 50)->default('Trong'); // Trong, Co_khach, Da_goi
            $table->string('yeu_cau_thanh_toan', 50)->nullable(); // tien_mat, qr, null
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ban');
    }
};
