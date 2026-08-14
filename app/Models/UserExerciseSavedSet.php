<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExerciseSavedSet extends Model
{
    protected $table = 'user_exercise_saved_sets';

    protected $fillable = [
        'user_id',
        'exercise_id',
        'exercise_name',
        'sets',
        'last_logged_at',
    ];

    protected $casts = [
        'sets' => 'array',
        'last_logged_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
