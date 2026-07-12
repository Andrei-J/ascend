<?php

namespace App\Repository;

use App\Models\WorkoutTemplate;

class WorkoutRepository
{
    /**
     * Fetch all workout templates with exercises and original exercises eager loaded for a user.
     */
    public function getWorkoutTemplatesForUser(int $userId)
    {
        return WorkoutTemplate::with(['exercises.exercise'])
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    /**
     * Create a new workout template.
     */
    public function create(array $data)
    {
        return WorkoutTemplate::create($data);
    }

    /**
     * Find a workout template by ID.
     */
    public function find(int $id)
    {
        return WorkoutTemplate::findOrFail($id);
    }

    /**
     * Update a workout template.
     */
    public function update(int $id, array $data)
    {
        $workoutTemplate = WorkoutTemplate::findOrFail($id);
        $workoutTemplate->update($data);
        return $workoutTemplate;
    }

    /**
     * Delete a workout template.
     */
    public function delete(int $id)
    {
        $workoutTemplate = WorkoutTemplate::findOrFail($id);
        $workoutTemplate->delete();
    }

    /**
     * Fetch completed workouts for a user, eager loading exercises and sets.
     */
    public function getCompletedWorkoutsForUser(int $userId)
    {
        return \App\Models\Workout::with(['exercises.sets', 'template'])
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'desc')
            ->get();
    }
}
