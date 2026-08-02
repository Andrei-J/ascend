<?php

namespace App\Http\Controllers;

use Throwable;
use Illuminate\Http\Request;
use App\Services\AnalyticsService;
use Illuminate\Support\Facades\Log;

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
        } catch (Throwable $e) {
            Log::error('AnalyticsController@index error: ' . $e->getMessage());
            $data = $this->analyticsService->getWeeklyAnalytics(null);
            return inertia('analyticsPage/index', $data);
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
        } catch (Throwable $e) {
            Log::error('AnalyticsController@dashboard error: ' . $e->getMessage());
            $data = $this->analyticsService->getWeeklyAnalytics(null);
            return inertia('dashboard', $data);
        }
    }
}
