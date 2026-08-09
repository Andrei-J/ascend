<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\ExercisesController;
use App\Http\Controllers\AnalyticsController;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [AnalyticsController::class, 'dashboard'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/Workout', [WorkoutController::class, 'index'])->name('workout');
    Route::post('/Workout/create', [WorkoutController::class, 'store'])->name('workout.create');
    Route::put('/Workout/update/{id}', [WorkoutController::class, 'update'])->name('workout.update');
    Route::delete('/Workout/delete/{id}', [WorkoutController::class, 'destroy'])->name('workout.delete');
    Route::post('/Workout/session', [WorkoutController::class, 'logSession'])->name('workout.session.log');
    Route::get('/api/exercises', function () {
        return response()->json(app(\App\Services\ExerciseService::class)->getExercisesForDashboard());
    })->name('api.exercises');
    Route::get('/History', [WorkoutController::class, 'history'])->name('history');
    Route::get('/Analytics', function () {
        return redirect()->route('dashboard');
    })->name('analytics');
});




Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/Exercises', [ExercisesController::class, 'index'])->name('exercises');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/Exercises/create', [ExercisesController::class, 'store'])->name('exercises.create');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::put('/Exercises/update/{id}', [ExercisesController::class, 'update'])->name('exercises.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('/Exercises/delete/{id}', [ExercisesController::class, 'destroy'])->name('exercises.delete');
});

require __DIR__.'/settings.php';
