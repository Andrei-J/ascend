<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutTemplateExercise extends Model
{
    protected $fillable = [
        'workout_template_id',
        'exercise_id',
        'order_index',
        'sets',
    ];

    protected $casts = [
        'sets' => 'array', // Holds default sets configuration e.g. [{"reps": 10, "weight": 60}]
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(WorkoutTemplate::class, 'workout_template_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
