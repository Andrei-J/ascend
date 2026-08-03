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
        // 1. Workout Templates
        Schema::create('workout_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('folder_name')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        // 2. Exercises inside a Workout Template
        Schema::create('workout_template_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_template_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('order_index')->default(0);
            $table->json('sets')->nullable(); // Target sets/reps configuration
            $table->timestamps();
        });

        // 3. Workout Sessions
        Schema::create('workouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('workout_template_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 4. Exercises logged during a Workout Session
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade');
            $table->foreignId('exercise_id')->nullable()->constrained()->onDelete('set null');
            $table->string('exercise_name'); // Snapshot name in case exercise gets deleted
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 5. Sets performed for logged Workout Exercises
        Schema::create('workout_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_exercise_id')->constrained()->onDelete('cascade');
            $table->integer('set_number');
            $table->decimal('weight', 8, 2)->nullable();
            $table->integer('reps')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workout_sets');
        Schema::dropIfExists('workout_exercises');
        Schema::dropIfExists('workouts');
        Schema::dropIfExists('workout_template_exercises');
        Schema::dropIfExists('workout_templates');
    }
};
