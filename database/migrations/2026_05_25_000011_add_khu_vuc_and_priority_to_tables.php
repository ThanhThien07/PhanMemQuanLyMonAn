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
        Schema::table('ban', function (Blueprint $table) {
            $table->string('khu_vuc', 50)->default('Tầng 1')->after('trang_thai');
        });

        Schema::table('dat_mon', function (Blueprint $table) {
            $table->integer('thu_tu_uu_tien')->default(1)->after('so_luong');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ban', function (Blueprint $table) {
            $table->dropColumn('khu_vuc');
        });

        Schema::table('dat_mon', function (Blueprint $table) {
            $table->dropColumn('thu_tu_uu_tien');
        });
    }
};
