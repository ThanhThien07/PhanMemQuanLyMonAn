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
        Schema::table('dat_mon', function (Blueprint $table) {
            $table->integer('so_luong_khach')->default(0)->after('so_luong');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dat_mon', function (Blueprint $table) {
            $table->dropColumn('so_luong_khach');
        });
    }
};
