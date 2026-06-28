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
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:255',
            'muscleGroup' => 'required|string|max:255',
            'equipment'   => 'required|string|max:255',
            'difficulty'   => 'required|string|max:255',
            'instructions' => 'nullable|string|max:1000',
        ]);

        // 2. Map frontend field names → actual DB column names
        //    DB columns: type, muscle, instructions (not category/muscleGroup/description)
        $mapped = [
            'name'         => $validatedData['name'],
            'type'         => $validatedData['category'],
            'muscle'       => $validatedData['muscleGroup'],
            'equipment'    => $validatedData['equipment'],
            'difficulty'   => $validatedData['difficulty'],
            'instructions' => $validatedData['instructions'] ?? null,
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
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:255',
            'muscleGroup' => 'required|string|max:255',
            'equipment'   => 'required|string|max:255',
            'difficulty'   => 'required|string|max:255',
            'instructions' => 'nullable|string|max:1000',
        ]);

        // Map frontend field names → actual DB column names (same as store)
        $mapped = [
            'name'         => $validatedData['name'],
            'type'         => $validatedData['category'],
            'muscle'       => $validatedData['muscleGroup'],
            'equipment'    => $validatedData['equipment'],
            'difficulty'   => $validatedData['difficulty'],
            'instructions' => $validatedData['instructions'] ?? null,
        ];

        try{
            $this->exerciseService->updateExercise($id, $mapped);
            return redirect()->back();

        }catch(exception $e){
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
        //
    }
}
