<?php

namespace App\Services;

use App\Repository\ExerciseRepository;

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

        return $this->exerciseRepository->getAllExercises();
    }
}