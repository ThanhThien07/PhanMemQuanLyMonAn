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
            $table->unsignedBigInteger('khach_hang_id')->nullable()->after('ban_id');
            $table->foreign('khach_hang_id')->references('id')->on('khach_hang')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dat_mon', function (Blueprint $table) {
            $table->dropForeign(['khach_hang_id']);
            $table->dropColumn('khach_hang_id');
        });
    }
};
