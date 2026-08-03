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
        return Exercise::latest()->get();
    }

    //for creating exercises
    public function create(array $data)
    {
        return Exercise::create($data);
    }


        //for creating exercises
    public function update($id, array $data)
    {
        $exercise = Exercise::findOrFail($id);

        $exercise->update($data);

        return $exercise;
       
    }

    public function delete($id)
    {
        $exercise = Exercise::findOrFail($id);

        $exercise->delete();
    }
}