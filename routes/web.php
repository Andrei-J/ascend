<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\ExercisesController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/Workout', [WorkoutController::class, 'index'])->name('workout');
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

require __DIR__.'/settings.php';
