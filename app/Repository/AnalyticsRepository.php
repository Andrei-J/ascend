<?php

namespace App\Repository;

use App\Models\Workout;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AnalyticsRepository
{
    /**
     * Fetch workouts for a user within a given date range.
     * Eager-loads exercises + sets in a single query (no N+1).
     *
     * Complexity: O(1) DB round trips.
     */
    public function getWorkoutsInRange(int $userId, Carbon $start, Carbon $end): Collection
    {
        return Workout::with(['exercises.sets'])
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$start, $end])
            ->orderBy('completed_at', 'asc')
            ->get();
    }

    /**
     * Fetch all completed workouts for a user, eager loading exercises + sets.
     * Used for PR detection (running max) and weekly graph building.
     *
     * Complexity: O(1) DB round trips.
     */
    public function getAllWorkouts(int $userId): Collection
    {
        return Workout::with(['exercises.sets'])
            ->where('user_id', $userId)
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'asc')
            ->get();
    }
}
