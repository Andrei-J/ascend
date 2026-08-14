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
        Schema::create('user_exercise_saved_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('exercise_name');
            $table->json('sets'); // Array of [{ "weight": 60, "reps": 10, "unit": "kg" }, ...]
            $table->timestamp('last_logged_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'exercise_id']);
            $table->index(['user_id', 'exercise_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_exercise_saved_sets');
    }
};
