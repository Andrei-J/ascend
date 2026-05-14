<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function index(Request $request)
    {
        return inertia('workoutPage/index');
    }
}
