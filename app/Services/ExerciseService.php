<?php

namespace App\Services;

use App\Repository\ExerciseRepository;
use Exception;
use Illuminate\Support\Facades\Log;

class ExerciseService
{
    protected $exerciseRepository;

    // Inject the repository into the service
    public function __construct(ExerciseRepository $exerciseRepository)
    {
        $this->exerciseRepository = $exerciseRepository;
    }

    /**
     * Get exercises processed for the frontend, with user's last performed set values.
     */
    public function getExercisesForDashboard(?int $userId = null)
    {
        $exercises = $this->exerciseRepository->getAllExercises();

        $lastPerformedMap = [];
        if ($userId) {
            $savedRecords = \App\Models\UserExerciseSavedSet::where('user_id', $userId)->get();

            if ($savedRecords->isEmpty()) {
                // One-time initial backfill from completed workouts
                $recentWorkouts = \App\Models\Workout::with(['exercises.sets'])
                    ->where('user_id', $userId)
                    ->whereNotNull('completed_at')
                    ->orderBy('completed_at', 'desc')
                    ->take(50)
                    ->get();

                foreach ($recentWorkouts as $w) {
                    foreach ($w->exercises as $ex) {
                        $exIdKey = $ex->exercise_id;
                        $exNameKey = mb_strtolower(trim($ex->exercise_name));

                        if (($exIdKey && !isset($lastPerformedMap['id_' . $exIdKey])) || !isset($lastPerformedMap['name_' . $exNameKey])) {
                            $completedSets = [];
                            foreach ($ex->sets as $s) {
                                if ($s->is_completed || ($s->reps !== null && $s->reps > 0) || ($s->weight !== null && $s->weight > 0)) {
                                    $completedSets[] = [
                                        'weight' => $s->weight !== null ? (float)$s->weight : 0,
                                        'reps'   => $s->reps !== null ? (int)$s->reps : 0,
                                    ];
                                }
                            }

                            if (!empty($completedSets)) {
                                if ($exIdKey && !isset($lastPerformedMap['id_' . $exIdKey])) {
                                    $lastPerformedMap['id_' . $exIdKey] = $completedSets;
                                }
                                if (!isset($lastPerformedMap['name_' . $exNameKey])) {
                                    $lastPerformedMap['name_' . $exNameKey] = $completedSets;
                                }

                                \App\Models\UserExerciseSavedSet::updateOrCreate(
                                    [
                                        'user_id'       => $userId,
                                        'exercise_name' => $ex->exercise_name,
                                    ],
                                    [
                                        'exercise_id'    => $exIdKey,
                                        'sets'           => $completedSets,
                                        'last_logged_at' => $w->completed_at ?? now(),
                                    ]
                                );
                            }
                        }
                    }
                }
            } else {
                foreach ($savedRecords as $record) {
                    if ($record->exercise_id) {
                        $lastPerformedMap['id_' . $record->exercise_id] = $record->sets;
                    }
                    $lastPerformedMap['name_' . mb_strtolower(trim($record->exercise_name))] = $record->sets;
                }
            }
        }

        // Map DB column names → camelCase keys the React frontend expects
        return $exercises->map(function ($exercise) use ($lastPerformedMap, $userId) {
            $exSets = null;
            if ($userId) {
                $exSets = $lastPerformedMap['id_' . $exercise->id]
                    ?? $lastPerformedMap['name_' . mb_strtolower(trim($exercise->name))]
                    ?? null;
            }

            $previousSummary = null;
            if (!empty($exSets)) {
                $summaries = array_map(function ($s) {
                    $w = $s['weight'];
                    $r = $s['reps'];
                    return $w > 0 ? "{$w}kg×{$r}" : "{$r} reps";
                }, $exSets);
                $previousSummary = implode(', ', array_slice($summaries, 0, 3));
            }

            return [
                'id'              => $exercise->id,
                'difficulty'      => $exercise->difficulty,
                'name'            => $exercise->name,
                'category'        => $exercise->type,
                'muscleGroup'     => $exercise->muscle,
                'equipment'       => is_array($exercise->equipment)
                                      ? implode(', ', $exercise->equipment)
                                      : $exercise->equipment,
                'instructions'    => $exercise->instructions,
                'restSeconds'     => $exercise->rest_seconds !== null ? (int)$exercise->rest_seconds : 120,
                'lastPerformed'   => $exSets,
                'previousSummary' => $previousSummary,
            ];
        });
    }

    /**
     * Process data and create an exercise.
     */
    public function createExercise(array $data)
    {
       try {
            // Any specific business logic would go here before saving
            return $this->exerciseRepository->create($data);
            
        } catch (Exception $e) {
            // 1. Log the exact technical error to storage/logs/laravel.log
            Log::error('Failed to create exercise: ' . $e->getMessage());

            // 2. Throw a clean exception that the controller can catch
            throw new Exception('An error occurred while saving the exercise. Please try again.');
        }
    }

    public function updateExercise($id, array $data)
    {
       try {
            // Any specific business logic would go here before saving
            return $this->exerciseRepository->update($id, $data);
            
        } catch (Exception $e) {
            // 1. Log the exact technical error to storage/logs/laravel.log
            Log::error('Failed to create exercise: ' . $e->getMessage());

            // 2. Throw a clean exception that the controller can catch
            throw new Exception('An error occurred while saving the exercise. Please try again.');
        }
    }

    public function deleteExercise($id)
    {
       try {
            // Any specific business logic would go here before saving
            return $this->exerciseRepository->delete($id);
            
        } catch (Exception $e) {
            // 1. Log the exact technical error to storage/logs/laravel.log
            Log::error('Failed to delete exercise: ' . $e->getMessage());

            // 2. Throw a clean exception that the controller can catch
            throw new Exception('An error occurred while deleting the exercise. Please try again.');
        }
    }

    
}