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
        Schema::create('nguyen_lieu', function (Blueprint $table) {
            $table->id();
            $table->string('ten', 100);
            $table->double('so_luong_ton')->default(0);
            $table->string('don_vi', 20); // kg, lit, hop, chai, v.v.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nguyen_lieu');
    }
};
