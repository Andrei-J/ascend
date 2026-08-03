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
        Schema::table('workouts', function (Blueprint $table) {
            $table->index(['user_id', 'completed_at']);
        });

        Schema::table('workout_exercises', function (Blueprint $table) {
            $table->index('workout_id');
            $table->index('exercise_id');
        });

        Schema::table('workout_sets', function (Blueprint $table) {
            $table->index(['workout_exercise_id', 'is_completed']);
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->index('name');
            $table->index('type');
            $table->index('muscle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workouts', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'completed_at']);
        });

        Schema::table('workout_exercises', function (Blueprint $table) {
            $table->dropIndex(['workout_id']);
            $table->dropIndex(['exercise_id']);
        });

        Schema::table('workout_sets', function (Blueprint $table) {
            $table->dropIndex(['workout_exercise_id', 'is_completed']);
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['type']);
            $table->dropIndex(['muscle']);
        });
    }
};
