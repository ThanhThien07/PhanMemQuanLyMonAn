<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mon_an_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mon_an_id')->constrained('mon_an')->onDelete('cascade');
            $table->string('ten_modifier'); // VD: Thêm Phô Mai Mozzarella, Thêm Bún
            $table->double('gia_tang_them')->default(0); // VD: 15000
            $table->foreignId('nguyen_lieu_id')->nullable()->constrained('nguyen_lieu')->onDelete('set null');
            $table->double('luong_tieu_hao')->nullable()->default(0); // VD: 0.05 kg phô mai
            $table->timestamps();
        });

        Schema::table('dat_mon', function (Blueprint $table) {
            $table->text('options_json')->nullable()->after('ghi_chu'); // Lưu danh sách modifier được chọn
        });
    }

    public function down(): void
    {
        Schema::table('dat_mon', function (Blueprint $table) {
            $table->dropColumn('options_json');
        });
        Schema::dropIfExists('mon_an_modifiers');
    }
};
