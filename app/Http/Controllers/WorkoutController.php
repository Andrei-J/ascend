<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\WorkoutService;
use App\Services\ExerciseService;
use App\Models\WorkoutTemplate;

class WorkoutController extends Controller
{
    protected $workoutService;
    protected $exerciseService;

    public function __construct(WorkoutService $workoutService, ExerciseService $exerciseService)
    {
        $this->workoutService = $workoutService;
        $this->exerciseService = $exerciseService;
    }

    /**
     * Display a listing of workout templates and exercises.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $workoutTemplates = $this->workoutService->getWorkoutTemplatesForDashboard($userId);
        $exercises = $this->exerciseService->getExercisesForDashboard();

        return inertia('workoutPage/index', [
            'folders' => $workoutTemplates['folders'],
            'myTemplates' => $workoutTemplates['myTemplates'],
            'exercises' => $exercises,
        ]);
    }

    /**
     * Store a newly created workout template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                      => 'required|string|max:255',
            'folderName'                => 'nullable|string|max:255',
            'exercises'                 => 'nullable|array',
            'exercises.*.exercise_id'   => 'required|integer|exists:exercises,id',
            'exercises.*.sets'          => 'required|array',
            'exercises.*.sets.*.weight' => 'required|numeric|min:0',
            'exercises.*.sets.*.reps'   => 'required|integer|min:0',
            'exercises.*.sets.*.unit'   => 'required|string|in:kg,lbs',
        ]);

        try {
            $this->workoutService->createWorkoutTemplate([
                'user_id'     => auth()->id(),
                'name'        => $validated['name'],
                'folder_name' => $validated['folderName'] ?? null,
                'exercises'   => $validated['exercises'] ?? [],
            ]);

            return redirect()->back();

        } catch (Exception $e) {
            return redirect()->back()->withErrors([
                'name' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified workout template in storage.
     */
    public function update(Request $request, int $id)
    {
        $template = WorkoutTemplate::findOrFail($id);
        if ($template->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name'                      => 'required|string|max:255',
            'folderName'                => 'nullable|string|max:255',
            'exercises'                 => 'nullable|array',
            'exercises.*.exercise_id'   => 'required|integer|exists:exercises,id',
            'exercises.*.sets'          => 'required|array',
            'exercises.*.sets.*.weight' => 'required|numeric|min:0',
            'exercises.*.sets.*.reps'   => 'required|integer|min:0',
            'exercises.*.sets.*.unit'   => 'required|string|in:kg,lbs',
        ]);

        try {
            $this->workoutService->updateWorkoutTemplate($id, [
                'name'        => $validated['name'],
                'folder_name' => $validated['folderName'] ?? null,
                'exercises'   => $validated['exercises'] ?? [],
            ]);

            return redirect()->back();

        } catch (Exception $e) {
            return redirect()->back()->withErrors([
                'name' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified workout template from storage.
     */
    public function destroy(int $id)
    {
        $template = WorkoutTemplate::findOrFail($id);
        if ($template->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $this->workoutService->deleteWorkoutTemplate($id);
            return redirect()->back();

        } catch (Exception $e) {
            return redirect()->back()->withErrors([
                'name' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log an active workout session.
     */
    public function logSession(Request $request)
    {
        $validated = $request->validate([
            'name'                             => 'required|string|max:255',
            'workout_template_id'              => 'nullable|integer|exists:workout_templates,id',
            'started_at'                       => 'required|string',
            'completed_at'                     => 'required|string',
            'exercises'                        => 'required|array',
            'exercises.*.exercise_id'          => 'nullable|integer|exists:exercises,id',
            'exercises.*.name'                 => 'required|string|max:255',
            'exercises.*.sets'                 => 'required|array',
            'exercises.*.sets.*.weight'        => 'nullable|numeric|min:0',
            'exercises.*.sets.*.reps'          => 'nullable|integer|min:0',
            'exercises.*.sets.*.is_completed'  => 'nullable|boolean',
            'exercises.*.sets.*.isFinished'    => 'nullable|boolean',
        ]);

        try {
            $this->workoutService->logWorkoutSession(auth()->id(), $validated);
            return redirect()->back();
        } catch (Exception $e) {
            return redirect()->back()->withErrors([
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display the workout history page.
     */
    public function history(Request $request)
    {
        try {
            $history = $this->workoutService->getCompletedWorkoutsForHistory(auth()->id());
            return inertia('historyPage/index', [
                'history' => $history,
            ]);
        } catch (Exception $e) {
            abort(500, $e->getMessage());
        }
    }
}




