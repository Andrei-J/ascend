<?php

use App\Services\AnalyticsService;
use App\Repository\AnalyticsRepository;

test('getWeeklyAnalytics returns fallback contribution calendar structure for unauthenticated or empty user', function () {
    $repo = Mockery::mock(AnalyticsRepository::class);
    $service = new AnalyticsService($repo);

    $analytics = $service->getWeeklyAnalytics(null);

    expect($analytics)->toHaveKey('contributionCalendar');
    expect($analytics['contributionCalendar'])->toHaveKeys(['totalContributions', 'selectedYear', 'availableYears', 'days']);
    expect($analytics['contributionCalendar']['totalContributions'])->toBe(0);
    expect($analytics['contributionCalendar']['days'])->toBeArray();
});
