<?php

use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutExercises;
use App\Models\WorkoutSet;
use App\Services\AnalyticsService;
use Carbon\Carbon;

test('analytics service generates workout contribution heatmap with workout details', function () {
    $user = User::factory()->create();

    // Create a workout completed today
    $now = Carbon::now();
    $workout = Workout::create([
        'user_id'      => $user->id,
        'name'         => 'Leg Day Intense',
        'started_at'   => $now->copy()->subMinutes(45),
        'completed_at' => $now,
    ]);

    $exercise = WorkoutExercises::create([
        'workout_id'    => $workout->id,
        'exercise_name' => 'Squat',
        'order_index'   => 0,
    ]);

    WorkoutSet::create([
        'workout_exercise_id' => $exercise->id,
        'set_number'          => 1,
        'weight'              => 100.0,
        'reps'                => 10,
        'is_completed'        => true,
    ]);

    /** @var AnalyticsService $service */
    $service = app(AnalyticsService::class);
    $analytics = $service->getWeeklyAnalytics($user->id);

    expect($analytics['hasData'])->toBeTrue();
    expect($analytics['contributionCalendar'])->toHaveKeys(['totalContributions', 'selectedYear', 'availableYears', 'days']);
    expect($analytics['contributionCalendar']['totalContributions'])->toBeGreaterThanOrEqual(1);

    $todayStr = $now->format('Y-m-d');
    $todayContribution = collect($analytics['contributionCalendar']['days'])->firstWhere('date', $todayStr);

    expect($todayContribution)->not->toBeNull();
    expect($todayContribution['count'])->toBe(1);
    expect($todayContribution['sets'])->toBe(1);
    expect($todayContribution['volume'])->toBe(1000.0);
    expect($todayContribution['level'])->toBeGreaterThanOrEqual(1);
    expect($todayContribution['workouts'])->toHaveCount(1);
    expect($todayContribution['workouts'][0]['name'])->toBe('Leg Day Intense');
});

test('analytics service handles zero workout records gracefully', function () {
    $user = User::factory()->create();

    /** @var AnalyticsService $service */
    $service = app(AnalyticsService::class);
    $analytics = $service->getWeeklyAnalytics($user->id);

    expect($analytics['hasData'])->toBeFalse();
    expect($analytics['contributionCalendar']['totalContributions'])->toBe(0);
    expect(count($analytics['contributionCalendar']['days']))->toBeGreaterThan(300);

    // All days should be level 0
    foreach ($analytics['contributionCalendar']['days'] as $day) {
        expect($day['level'])->toBe(0);
        expect($day['count'])->toBe(0);
    }
});
