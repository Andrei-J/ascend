<?php

use App\Models\User;
use App\Models\Workout;
use App\Services\AnalyticsService;
use App\Services\WorkoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('calculates volume correctly for 1 weighted set', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Single Set Bench Press',
        'started_at' => now()->subHour()->toIso8601String(),
        'completed_at' => now()->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Bench Press',
                'sets' => [
                    ['weight' => 60, 'reps' => 10, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData)->not->toBeNull();
    expect($dayData['volume'])->toEqual(600);
});

test('calculates volume correctly for multiple sets with different weights', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    // Set 1: 60 x 10 = 600
    // Set 2: 65 x 8 = 520
    // Set 3: 70 x 6 = 420
    // Total Volume = 1540
    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Pyramid Bench Press',
        'started_at' => now()->subHour()->toIso8601String(),
        'completed_at' => now()->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Bench Press',
                'sets' => [
                    ['weight' => 60, 'reps' => 10, 'is_completed' => true],
                    ['weight' => 65, 'reps' => 8, 'is_completed' => true],
                    ['weight' => 70, 'reps' => 6, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData['volume'])->toEqual(1540);
});

test('calculates volume correctly for multiple exercises', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    // Exercise 1: 60 x 10 = 600
    // Exercise 2: 40 x 12 = 480
    // Total Volume = 1080
    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Chest & Shoulders',
        'started_at' => now()->subHour()->toIso8601String(),
        'completed_at' => now()->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Bench Press',
                'sets' => [
                    ['weight' => 60, 'reps' => 10, 'is_completed' => true],
                ],
            ],
            [
                'name' => 'Overhead Press',
                'sets' => [
                    ['weight' => 40, 'reps' => 12, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData['volume'])->toEqual(1080);
});

test('bodyweight exercise with zero external weight contributes zero to volume', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    // Bodyweight Push Up: 0 kg x 20 reps = 0 kg volume
    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Bodyweight Session',
        'started_at' => now()->subHour()->toIso8601String(),
        'completed_at' => now()->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Push Up',
                'sets' => [
                    ['weight' => 0, 'reps' => 20, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData['count'])->toBe(1);
    expect($dayData['sets'])->toBe(1);
    expect($dayData['volume'])->toEqual(0);
});

test('handles zero or empty sets correctly', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Empty Workout',
        'started_at' => now()->subHour()->toIso8601String(),
        'completed_at' => now()->toIso8601String(),
        'exercises' => [],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData['count'])->toBe(1);
    expect($dayData['sets'])->toBe(0);
    expect($dayData['volume'])->toEqual(0);
});

test('aggregates multiple sessions on the same date correctly', function () {
    $user = User::factory()->create();
    $workoutService = app(WorkoutService::class);
    $analyticsService = app(AnalyticsService::class);

    // Session 1: 50 x 10 = 500
    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Morning Workout',
        'started_at' => now()->subHours(5)->toIso8601String(),
        'completed_at' => now()->subHours(4)->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Squat',
                'sets' => [
                    ['weight' => 50, 'reps' => 10, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    // Session 2: 60 x 10 = 600
    $workoutService->logWorkoutSession($user->id, [
        'name' => 'Evening Workout',
        'started_at' => now()->subHours(2)->toIso8601String(),
        'completed_at' => now()->subHour()->toIso8601String(),
        'exercises' => [
            [
                'name' => 'Bench Press',
                'sets' => [
                    ['weight' => 60, 'reps' => 10, 'is_completed' => true],
                ],
            ],
        ],
    ]);

    $calendar = $analyticsService->getWeeklyAnalytics($user->id)['contributionCalendar'];
    $todayDate = now()->format('Y-m-d');
    $dayData = collect($calendar['days'])->firstWhere('date', $todayDate);

    expect($dayData['count'])->toBe(2);
    expect($dayData['sets'])->toBe(2);
    expect($dayData['volume'])->toEqual(1100);
});
