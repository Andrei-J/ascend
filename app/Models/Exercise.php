<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    protected $fillable = [
        'name',
        'type',
        'muscle',
        'difficulty',
        'instructions',
        'safety_info',
        'equipment',
    ];

    protected $casts = [
        'equipment' => 'array',
    ];
}
