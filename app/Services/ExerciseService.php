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
     * Get exercises processed for the frontend.
     */
    public function getExercisesForDashboard()
    {
        $exercises = $this->exerciseRepository->getAllExercises();

        // Map DB column names → camelCase keys the React frontend expects
        return $exercises->map(function ($exercise) {
            return [
                'id'            => $exercise->id,
                'difficulty'            => $exercise->difficulty,
                'name'          => $exercise->name,
                'category'      => $exercise->type,
                'muscleGroup'   => $exercise->muscle,
                'equipment'     => is_array($exercise->equipment)
                                    ? implode(', ', $exercise->equipment)
                                    : $exercise->equipment,
                'instructions'   => $exercise->instructions,
                'restSeconds'    => $exercise->rest_seconds !== null ? (int)$exercise->rest_seconds : 120,
                'lastPerformed' => null, // future: pull from workout logs
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