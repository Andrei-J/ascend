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
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('type')->nullable();
            $table->string('muscle')->nullable();
            $table->string('difficulty')->nullable();

            $table->longText('instructions')->nullable();
            $table->longText('safety_info')->nullable();

            // store array as JSON
            $table->json('equipment')->nullable();

            // optional: if you want API sync tracking
            $table->string('source')->default('api_ninjas');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
