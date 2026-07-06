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
        Schema::create('loai_mon', function (Blueprint $table) {
            $table->id();
            $table->string('ma_loai', 20)->unique();
            $table->string('ten_loai', 100);
            $table->timestamps();
        });

        Schema::table('mon_an', function (Blueprint $table) {
            $table->unsignedBigInteger('loai_mon_id')->nullable()->after('loai');
            $table->foreign('loai_mon_id')->references('id')->on('loai_mon')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mon_an', function (Blueprint $table) {
            $table->dropForeign(['loai_mon_id']);
            $table->dropColumn('loai_mon_id');
        });

        Schema::dropIfExists('loai_mon');
    }
};
