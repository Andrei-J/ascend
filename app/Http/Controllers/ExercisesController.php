<?php

namespace App\Http\Controllers;
use Exception;
use Illuminate\Http\Request;
use App\Services\ExerciseService;
use Inertia\Inertia;
class ExercisesController extends Controller
{
    protected $exerciseService;

    // Inject the service into the controller
    public function __construct(ExerciseService $exerciseService)
    {
        $this->exerciseService = $exerciseService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch the exercises from the service layer
        $exercises = $this->exerciseService->getExercisesForDashboard();

        // Pass the exercises into your React component as a prop
        return Inertia::render('ExercisesPage/index', [
            'exercises' => $exercises
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate the incoming React data
        $validatedData = $request->validate([
            'name'         => 'required|string|max:255',
            'category'     => 'required|string|in:Strength,Cardio,Flexibility,Core',
            'muscleGroup'  => 'required|string|max:255',
            'equipment'    => 'required|string|in:Barbell,Dumbbell,Machine,None',
            'difficulty'   => 'required|string|in:Easy,Moderate,Hard',
            'instructions' => 'nullable|string|max:1000',
            'safety_info'  => 'nullable|string|max:1000',
            'restSeconds'  => 'required|string|max:10',
        ]);

        // 2. Map frontend field names → actual DB column names.
        //    'equipment' is stored as a JSON array — split the comma-separated string.
        $equipmentArray = array_map(
            'trim',
            explode(',', $validatedData['equipment'])
        );

        $mapped = [
            'name'         => $validatedData['name'],
            'type'         => $validatedData['category'],
            'muscle'       => $validatedData['muscleGroup'],
            'equipment'    => $equipmentArray,          // stored as JSON array
            'difficulty'   => $validatedData['difficulty'],
            'instructions' => $validatedData['instructions'] ?? null,
            'safety_info'  => $validatedData['safety_info'] ?? null,
            'rest_seconds' => $this->parseRestSeconds($validatedData['restSeconds']),
            'source'       => 'manual',                 // distinguish from API imports
        ];

        $this->exerciseService->createExercise($mapped);
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'name'         => 'required|string|max:255',
            'category'     => 'required|string|in:Strength,Cardio,Flexibility,Core',
            'muscleGroup'  => 'required|string|max:255',
            'equipment'    => 'required|string|in:Barbell,Dumbbell,Machine,None',
            'difficulty'   => 'required|string|in:Easy,Moderate,Hard',
            'instructions' => 'nullable|string|max:1000',
            'safety_info'  => 'nullable|string|max:1000',
            'restSeconds'  => 'required|string|max:10',
        ]);

        // Map frontend field names → actual DB column names.
        //    'equipment' is stored as a JSON array — split the comma-separated string.
        $equipmentArray = array_map(
            'trim',
            explode(',', $validatedData['equipment'])
        );

        $mapped = [
            'name'         => $validatedData['name'],
            'type'         => $validatedData['category'],
            'muscle'       => $validatedData['muscleGroup'],
            'equipment'    => $equipmentArray,          // stored as JSON array
            'difficulty'   => $validatedData['difficulty'],
            'instructions' => $validatedData['instructions'] ?? null,
            'safety_info'  => $validatedData['safety_info'] ?? null,
            'rest_seconds' => $this->parseRestSeconds($validatedData['restSeconds']),
        ];

        try {
            $this->exerciseService->updateExercise($id, $mapped);
            return redirect()->back();

        } catch (Exception $e) {
            return redirect()->back()->withErrors([
                'name' => $e->getMessage()
            ]);
        }
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         $this->exerciseService->deleteExercise($id);
         return redirect()->back();
    }

    private function parseRestSeconds($val)
    {
        if (empty($val)) {
            return 120;
        }
        if (strpos($val, ':') !== false) {
            $parts = explode(':', $val);
            if (count($parts) === 2) {
                return ((int)$parts[0] * 60) + (int)$parts[1];
            }
        }
        if (is_numeric($val)) {
            return (int)$val;
        }
        return 120;
    }
}
