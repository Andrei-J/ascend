<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutExercises extends Model
{
    protected $table = 'workout_exercises';

    protected $fillable = [
        'workout_id',
        'exercise_id',
        'exercise_name',
        'order_index',
    ];

    public function workout(): BelongsTo
    {
        return $this->belongsTo(Workout::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function sets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class, 'workout_exercise_id')->orderBy('set_number');
    }
}
