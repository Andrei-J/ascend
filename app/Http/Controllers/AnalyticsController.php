<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use App\Services\AnalyticsService;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display the analytics page with weekly progress data.
     */
    public function index(Request $request)
    {
        try {
            $data = $this->analyticsService->getWeeklyAnalytics(auth()->id());
            return inertia('analyticsPage/index', $data);
        } catch (Exception $e) {
            abort(500, $e->getMessage());
        }
    }

    /**
     * Serve analytics data on the Dashboard page.
     */
    public function dashboard(Request $request)
    {
        try {
            $data = $this->analyticsService->getWeeklyAnalytics(auth()->id());
            return inertia('dashboard', $data);
        } catch (Exception $e) {
            abort(500, $e->getMessage());
        }
    }
}
