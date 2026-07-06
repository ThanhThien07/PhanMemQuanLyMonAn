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
            $table->integer('so_luong_khach')->default(0)->after('yeu_cau_thanh_toan');
        });

        Schema::table('bao_cao_quan_ly', function (Blueprint $table) {
            $table->integer('tong_luong_khach')->default(0)->after('tong_so_hoa_don');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ban', function (Blueprint $table) {
            $table->dropColumn('so_luong_khach');
        });

        Schema::table('bao_cao_quan_ly', function (Blueprint $table) {
            $table->dropColumn('tong_luong_khach');
        });
    }
};
