<?php

namespace App\Services;

use App\Repository\WorkoutRepository;
use Exception;
use Illuminate\Support\Facades\Log;

class WorkoutService
{
    protected $workoutRepository;

    // Inject the repository into the service
    public function __construct(WorkoutRepository $workoutRepository)
    {
        $this->workoutRepository = $workoutRepository;
    }

    /**
     * Get workout templates formatted and grouped for the frontend page.
     */
    public function getWorkoutTemplatesForDashboard(int $userId)
    {
        try {
            $templates = $this->workoutRepository->getWorkoutTemplatesForUser($userId);

            // 1. Map individual database entities to frontend structure
            $mapped = $templates->map(function ($template) {
                // Map the template's exercises relation (WorkoutTemplateExercise)
                $exercises = $template->exercises->map(function ($templateEx) {
                    $exerciseName = $templateEx->exercise ? $templateEx->exercise->name : 'Unknown Exercise';
                    $setsCount = is_array($templateEx->sets) ? count($templateEx->sets) : 0;
                    return "{$setsCount} x {$exerciseName}";
                })->toArray();

                return [
                    'id'           => $template->id,
                    'name'         => $template->name,
                    'folderName'   => $template->folder_name,
                    'exercises'    => $exercises,
                    'lastUsed'     => $template->last_used_at ? $template->last_used_at->diffForHumans() : null,
                    'rawExercises' => $template->exercises->map(function ($templateEx) {
                        return [
                            'exercise_id' => $templateEx->exercise_id,
                            'sets'        => $templateEx->sets ?? [],
                        ];
                    })->toArray(),
                ];
            });

            // 2. Group into folders and single templates ("My Templates")
            $foldersGrouped = [];
            $myTemplates = [];
            $folderIdCounter = 1;

            foreach ($mapped as $t) {
                // Ensure all templates show up in "My Templates" list
                $myTemplates[] = $t;

                if (!empty($t['folderName'])) {
                    $folderName = $t['folderName'];
                    if (!isset($foldersGrouped[$folderName])) {
                        $foldersGrouped[$folderName] = [
                            'id'        => $folderIdCounter++,
                            'name'      => $folderName,
                            'templates' => [],
                        ];
                    }
                    $foldersGrouped[$folderName]['templates'][] = $t;
                }
            }

            return [
                'folders'     => array_values($foldersGrouped),
                'myTemplates' => $myTemplates,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get workout templates: ' . $e->getMessage());
            throw new Exception('An error occurred while loading your workout templates.');
        }
    }

    /**
     * Create a workout template.
     */
    public function createWorkoutTemplate(array $data)
    {
        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
                // 1. Create the main template
                $template = $this->workoutRepository->create([
                    'user_id'     => $data['user_id'],
                    'name'        => $data['name'],
                    'folder_name' => $data['folder_name'] ?? null,
                ]);

                // 2. Add the exercises
                if (!empty($data['exercises']) && is_array($data['exercises'])) {
                    foreach ($data['exercises'] as $index => $item) {
                        $formattedSets = array_map(function ($s) {
                            return [
                                'weight' => isset($s['weight']) ? (float)$s['weight'] : 0.0,
                                'reps'   => isset($s['reps']) ? (int)$s['reps'] : 0,
                                'unit'   => isset($s['unit']) ? (string)$s['unit'] : 'kg',
                            ];
                        }, $item['sets'] ?? []);

                        $template->exercises()->create([
                            'exercise_id' => $item['exercise_id'],
                            'order_index' => $index,
                            'sets'        => $formattedSets,
                        ]);
                    }
                }

                return $template;
            });
        } catch (Exception $e) {
            Log::error('Failed to create workout template: ' . $e->getMessage());
            throw new Exception('An error occurred while saving the workout template.');
        }
    }

    /**
     * Update a workout template.
     */
    public function updateWorkoutTemplate(int $id, array $data)
    {
        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($id, $data) {
                // 1. Update the main template
                $template = $this->workoutRepository->update($id, [
                    'name'        => $data['name'],
                    'folder_name' => $data['folder_name'] ?? null,
                ]);

                // 2. Delete old exercises
                $template->exercises()->delete();

                // 3. Re-create exercises
                if (!empty($data['exercises']) && is_array($data['exercises'])) {
                    foreach ($data['exercises'] as $index => $item) {
                        $formattedSets = array_map(function ($s) {
                            return [
                                'weight' => isset($s['weight']) ? (float)$s['weight'] : 0.0,
                                'reps'   => isset($s['reps']) ? (int)$s['reps'] : 0,
                                'unit'   => isset($s['unit']) ? (string)$s['unit'] : 'kg',
                            ];
                        }, $item['sets'] ?? []);

                        $template->exercises()->create([
                            'exercise_id' => $item['exercise_id'],
                            'order_index' => $index,
                            'sets'        => $formattedSets,
                        ]);
                    }
                }

                return $template;
            });
        } catch (Exception $e) {
            Log::error('Failed to update workout template: ' . $e->getMessage());
            throw new Exception('An error occurred while updating the workout template.');
        }
    }

    /**
     * Delete a workout template.
     */
    public function deleteWorkoutTemplate(int $id)
    {
        try {
            return $this->workoutRepository->delete($id);
        } catch (Exception $e) {
            Log::error('Failed to delete workout template: ' . $e->getMessage());
            throw new Exception('An error occurred while deleting the workout template.');
        }
    }

    /**
     * Log a workout session.
     */
    public function logWorkoutSession(int $userId, array $data)
    {
        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($userId, $data) {
                // 1. Create the main workout session
                $workout = \App\Models\Workout::create([
                    'user_id'             => $userId,
                    'workout_template_id' => $data['workout_template_id'] ?? null,
                    'name'                => $data['name'],
                    'started_at'          => $data['started_at'],
                    'completed_at'        => $data['completed_at'] ?? now(),
                ]);

                // 2. Update the last_used_at on the template if applicable
                if (!empty($data['workout_template_id'])) {
                    $template = \App\Models\WorkoutTemplate::find($data['workout_template_id']);
                    if ($template && $template->user_id === $userId) {
                        $template->update(['last_used_at' => now()]);
                    }
                }

                // 3. Add exercises
                if (!empty($data['exercises']) && is_array($data['exercises'])) {
                    foreach ($data['exercises'] as $index => $item) {
                        $workoutExercise = $workout->exercises()->create([
                            'exercise_id'   => $item['exercise_id'] ?? null,
                            'exercise_name' => $item['name'] ?? 'Unknown Exercise',
                            'order_index'   => $index,
                        ]);

                        // 4. Add sets
                        if (!empty($item['sets']) && is_array($item['sets'])) {
                            foreach ($item['sets'] as $setIndex => $set) {
                                $workoutExercise->sets()->create([
                                    'set_number'   => $setIndex + 1,
                                    'weight'       => isset($set['weight']) && $set['weight'] !== '' ? (float)$set['weight'] : null,
                                    'reps'         => isset($set['reps']) && $set['reps'] !== '' ? (int)$set['reps'] : null,
                                    'is_completed' => !empty($set['is_completed']) || !empty($set['isFinished']),
                                ]);
                            }
                        }
                    }
                }

                return $workout;
            });
        } catch (Exception $e) {
            Log::error('Failed to log workout session: ' . $e->getMessage());
            throw new Exception('An error occurred while logging the workout session.');
        }
    }

    /**
     * Get completed workouts formatted for history page.
     */
    public function getCompletedWorkoutsForHistory(int $userId)
    {
        try {
            $workouts = $this->workoutRepository->getCompletedWorkoutsForUser($userId);

            return $workouts->map(function ($w) {
                return [
                    'id'           => $w->id,
                    'name'         => $w->name,
                    'templateName' => $w->template ? $w->template->name : null,
                    'startedAt'    => $w->started_at->toIso8601String(),
                    'completedAt'  => $w->completed_at->toIso8601String(),
                    'duration'     => $w->started_at->diffInSeconds($w->completed_at),
                    'exercises'    => $w->exercises->map(function ($ex) {
                        return [
                            'id'   => $ex->id,
                            'name' => $ex->exercise_name,
                            'sets' => $ex->sets->map(function ($s) {
                                return [
                                    'id'          => $s->id,
                                    'setNumber'   => $s->set_number,
                                    'weight'      => $s->weight,
                                    'reps'        => $s->reps,
                                    'isCompleted' => $s->is_completed,
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ];
            });
        } catch (Exception $e) {
            Log::error('Failed to get completed workouts: ' . $e->getMessage());
            throw new Exception('An error occurred while loading your history.');
        }
    }
}


