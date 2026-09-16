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
        Schema::create('mon_an', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100)->unique();
            $table->double('gia');
            $table->integer('time')->default(10); // tính theo phút
            $table->string('loai', 50)->default('MonAn'); // MonAn, DoUong
            $table->string('mota', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mon_an');
    }
};
