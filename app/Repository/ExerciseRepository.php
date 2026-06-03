<?php

namespace App\Repository;
use App\Models\Exercise;

class ExerciseRepository
{
    /**
     * Fetch all exercises from the SQLite database.
     */
    public function getAllExercises()
    {
        // This queries your 'exercises' table using Eloquent
        return Exercise::all();
    }
}