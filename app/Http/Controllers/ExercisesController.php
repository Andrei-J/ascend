<?php

namespace App\Http\Controllers;

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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
