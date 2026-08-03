<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutSet extends Model
{
    protected $table = 'workout_sets';

    protected $fillable = [
        'workout_exercise_id',
        'set_number',
        'weight',
        'reps',
        'is_completed',
    ];

    protected $casts = [
        'weight' => 'float',
        'reps' => 'integer',
        'is_completed' => 'boolean',
    ];

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(WorkoutExercises::class, 'workout_exercise_id');
    }
}
