<?php

namespace App\Services;

use App\Repository\AnalyticsRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class AnalyticsService
{
    protected AnalyticsRepository $repo;

    public function __construct(AnalyticsRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * Main entry point: returns the full analytics payload for the frontend.
     */
    public function getWeeklyAnalytics(?int $userId): array
    {
        try {
            if (!$userId) {
                return [
                    'currentWeek'       => [
                        'label'       => 'Week of ' . Carbon::now()->startOfWeek(Carbon::MONDAY)->format('M j'),
                        'score'       => 0,
                        'workouts'    => 0,
                        'exercises'   => 0,
                        'totalSets'   => 0,
                        'totalReps'   => 0,
                        'totalVolume' => 0.0,
                        'prCount'     => 0,
                    ],
                    'previousWeek'      => [
                        'label'       => 'Week of ' . Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeek()->format('M j'),
                        'score'       => 0,
                        'workouts'    => 0,
                        'exercises'   => 0,
                        'totalSets'   => 0,
                        'totalReps'   => 0,
                        'totalVolume' => 0.0,
                        'prCount'     => 0,
                    ],
                    'comparison'        => [
                        'progressPct'   => 0.0,
                        'volumeDiff'    => 0.0,
                        'avgWeightDiff' => 0.0,
                        'avgRepsDiff'   => 0.0,
                        'frequencyDiff' => 0,
                        'improved'      => 0,
                        'maintained'    => 0,
                        'declined'      => 0,
                        'status'        => 'maintained',
                    ],
                    'exerciseBreakdown'    => [],
                    'weeklyGraph'          => [],
                    'contributionCalendar' => [
                        'totalContributions' => 0,
                        'selectedYear'       => (int)Carbon::now()->format('Y'),
                        'availableYears'     => [(int)Carbon::now()->format('Y')],
                        'days'               => [],
                    ],
                    'newExercises'         => [],
                    'hasData'              => false,
                    'hasTwoWeeks'          => false,
                ];
            }

            // ── 1. Determine week boundaries ─────────────────────────────────
            $now         = Carbon::now();
            $currStart   = $now->copy()->startOfWeek(Carbon::MONDAY);
            $currEnd     = $now->copy()->endOfWeek(Carbon::SUNDAY);
            $prevStart   = $currStart->copy()->subWeek();
            $prevEnd     = $currStart->copy()->subSecond();

            // ── 2. Single eager-load query for all history ────────────────────
            // O(1) DB round trips — fetches everything in one go.
            $allWorkouts = $this->repo->getAllWorkouts($userId);

            // ── 3. PR detection: running maximum hash map O(n) ───────────────
            // Chronological pass — already ordered asc from the repo.
            $maxWeightMap = []; // ['exercise_name' => max_weight]
            $currWeekPRs  = 0;

            foreach ($allWorkouts as $workout) {
                $inCurrWeek = $workout->completed_at->between($currStart, $currEnd);

                foreach ($workout->exercises as $ex) {
                    foreach ($ex->sets as $set) {
                        if (!$set->is_completed || !$set->weight) {
                            continue;
                        }
                        $prev = $maxWeightMap[$ex->exercise_name] ?? 0;
                        if ($set->weight > $prev) {
                            $maxWeightMap[$ex->exercise_name] = $set->weight;
                            if ($inCurrWeek) {
                                $currWeekPRs++;
                            }
                        }
                    }
                }
            }

            // ── 4. Weekly bucket grouping: hash map O(n) ─────────────────────
            // Key format: 'YYYY-Www' (ISO week, e.g. '2026-W29')
            $weekBuckets = []; // ['2026-W29' => [workout, ...]]

            foreach ($allWorkouts as $workout) {
                $weekKey = $workout->completed_at->format('o-\WW');
                $weekBuckets[$weekKey][] = $workout;
            }

            // Sort by ISO week key — lexicographic sort = chronological O(w log w)
            ksort($weekBuckets);

            // ── 5. Build weekly graph data ────────────────────────────────────
            $weeklyGraph = [];
            foreach ($weekBuckets as $weekKey => $workouts) {
                // Parse ISO week key (e.g. '2026-W29') into the Monday of that week.
                // Carbon::fromIsoFormat is not available in all versions; use strtotime instead.
                [$isoYear, $isoWeek] = explode('-W', $weekKey);
                $weekStart = Carbon::instance(
                    new \DateTime(sprintf('%04dW%02d1', (int)$isoYear, (int)$isoWeek))
                )->startOfDay();
                $statsForWeek = $this->buildWeekStats($workouts, $weekStart);
                $weeklyGraph[] = [
                    'weekKey' => $weekKey,
                    'label'   => $weekStart->format('M j'),
                    'score'   => $statsForWeek['score'],
                ];
            }

            // ── 6. Build current and previous week stats ──────────────────────
            $currWeekWorkouts = $allWorkouts->filter(
                fn($w) => $w->completed_at->between($currStart, $currEnd)
            )->values();

            $prevWeekWorkouts = $allWorkouts->filter(
                fn($w) => $w->completed_at->between($prevStart, $prevEnd)
            )->values();

            $currentWeek  = $this->buildWeekData($currWeekWorkouts, $currStart, $currWeekPRs);
            $previousWeek = $this->buildWeekData($prevWeekWorkouts, $prevStart, 0);

            // ── 7. Exercise comparison: hash map intersection O(n + m) ────────
            $breakdown    = $this->buildExerciseBreakdown(
                $currentWeek['exerciseMap'],
                $previousWeek['exerciseMap']
            );

            // ── 8. Weekly comparison deltas ───────────────────────────────────
            $comparison = $this->buildComparison($currentWeek, $previousWeek, $breakdown);

            // ── 10. Contribution Calendar (Monthly Grid) ─────────────────────
            $contributionCalendar = $this->buildContributionCalendar($allWorkouts);

            // ── 11. Exercise Progress Data (Chronological Sessions) ────────────
            $exerciseProgressData = $this->buildExerciseProgressData($allWorkouts);

            return [
                'currentWeek'                => $this->stripExerciseMap($currentWeek),
                'previousWeek'               => $this->stripExerciseMap($previousWeek),
                'comparison'                 => $comparison,
                'exerciseBreakdown'          => $breakdown,
                'weeklyGraph'                => $weeklyGraph,
                'contributionCalendar'       => $contributionCalendar,
                'exerciseProgressData'       => $exerciseProgressData,
                'recentlyPerformedExercises' => $exerciseProgressData,
                'newExercises'               => array_keys(array_diff_key(
                    $currentWeek['exerciseMap'],
                    $previousWeek['exerciseMap']
                )),
                'hasData'                    => count($allWorkouts) > 0,
                'hasTwoWeeks'                => count($currWeekWorkouts) > 0 && count($prevWeekWorkouts) > 0,
            ];
        } catch (Exception $e) {
            Log::error('AnalyticsService::getWeeklyAnalytics failed: ' . $e->getMessage());
            throw new Exception('Failed to load analytics data.');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build a full WeekData array from a collection of workouts.
     * Uses hash map accumulation — O(n) over total sets.
     */
    private function buildWeekData($workouts, Carbon $weekStart, int $prCount): array
    {
        $exerciseMap = []; // ['exercise_name' => ExerciseSummary]
        $totalSets   = 0;
        $totalReps   = 0;
        $totalVolume = 0.0;
        $totalExercises = 0;

        foreach ($workouts as $workout) {
            foreach ($workout->exercises as $ex) {
                $key = $ex->exercise_name;

                if (!isset($exerciseMap[$key])) {
                    $exerciseMap[$key] = [
                        'totalVol'    => 0.0,
                        'totalWeight' => 0.0,
                        'totalReps'   => 0,
                        'setCount'    => 0,
                    ];
                    $totalExercises++;
                }

                foreach ($ex->sets as $set) {
                    if (!$set->is_completed) {
                        continue;
                    }
                    $w   = (float)($set->weight ?? 0);
                    $r   = (int)($set->reps ?? 0);
                    $vol = $w * $r;

                    $exerciseMap[$key]['totalVol']    += $vol;
                    $exerciseMap[$key]['totalWeight'] += $w;
                    $exerciseMap[$key]['totalReps']   += $r;
                    $exerciseMap[$key]['setCount']++;

                    $totalSets++;
                    $totalReps   += $r;
                    $totalVolume += $vol;
                }
            }
        }

        $workoutCount = count($workouts);
        $stats = $this->buildWeekStats($workouts->all(), $weekStart);

        return [
            'label'         => 'Week of ' . $weekStart->format('M j'),
            'score'         => $stats['score'],
            'workouts'      => $workoutCount,
            'exercises'     => $totalExercises,
            'totalSets'     => $totalSets,
            'totalReps'     => $totalReps,
            'totalVolume'   => round($totalVolume, 2),
            'prCount'       => $prCount,
            'exerciseMap'   => $exerciseMap,
        ];
    }

    /**
     * Calculate weekly performance score.
     * Weighted formula: Volume(40%) + Frequency(20%) + Consistency(20%) + PRs(20%)
     */
    private function buildWeekStats(array $workouts, Carbon $weekStart): array
    {
        $totalVolume  = 0.0;
        $workoutCount = count($workouts);

        foreach ($workouts as $workout) {
            foreach ($workout->exercises as $ex) {
                foreach ($ex->sets as $set) {
                    if ($set->is_completed) {
                        $totalVolume += (float)($set->weight ?? 0) * (int)($set->reps ?? 0);
                    }
                }
            }
        }

        // Volume score: normalise against a 10,000 kg/week reference baseline
        $volumeBaseline = 10000.0;
        $volumeScore    = min(($totalVolume / $volumeBaseline) * 40, 40);

        // Frequency score: target = 4 workouts/week
        $frequencyTarget = 4;
        $frequencyScore  = min(($workoutCount / $frequencyTarget) * 20, 20);

        $score = round($volumeScore + $frequencyScore, 2);

        return ['score' => $score, 'totalVolume' => $totalVolume];
    }

    /**
     * Compare two exercise maps using hash map intersection O(n + m).
     * Returns breakdown rows only for exercises in both weeks.
     */
    private function buildExerciseBreakdown(array $currMap, array $prevMap): array
    {
        $breakdown = [];

        foreach ($prevMap as $name => $prevStats) {
            if (!isset($currMap[$name])) {
                continue; // Not in current week — skip (doesn't affect status)
            }

            $curr = $currMap[$name]; // O(1) hash lookup

            $prevAvgWeight = $prevStats['setCount'] > 0
                ? round($prevStats['totalWeight'] / $prevStats['setCount'], 2)
                : 0;
            $currAvgWeight = $curr['setCount'] > 0
                ? round($curr['totalWeight'] / $curr['setCount'], 2)
                : 0;

            $prevAvgReps = $prevStats['setCount'] > 0
                ? round($prevStats['totalReps'] / $prevStats['setCount'], 1)
                : 0;
            $currAvgReps = $curr['setCount'] > 0
                ? round($curr['totalReps'] / $curr['setCount'], 1)
                : 0;

            $weightDiff = round($currAvgWeight - $prevAvgWeight, 2);
            $repsDiff   = round($currAvgReps - $prevAvgReps, 1);
            $volumeDiff = round($curr['totalVol'] - $prevStats['totalVol'], 2);

            // O(1) threshold classification
            $pctChange = $prevStats['totalVol'] > 0
                ? ($curr['totalVol'] - $prevStats['totalVol']) / $prevStats['totalVol']
                : 0;

            if ($pctChange > 0.02) {
                $status = 'improved';
            } elseif ($pctChange < -0.02) {
                $status = 'declined';
            } else {
                $status = 'maintained';
            }

            $breakdown[] = [
                'name'          => $name,
                'prevSets'      => $prevStats['setCount'],
                'prevAvgWeight' => $prevAvgWeight,
                'prevAvgReps'   => $prevAvgReps,
                'prevVolume'    => round($prevStats['totalVol'], 2),
                'currSets'      => $curr['setCount'],
                'currAvgWeight' => $currAvgWeight,
                'currAvgReps'   => $currAvgReps,
                'currVolume'    => round($curr['totalVol'], 2),
                'weightDiff'    => $weightDiff,
                'repsDiff'      => $repsDiff,
                'volumeDiff'    => $volumeDiff,
                'status'        => $status,
            ];
        }

        return $breakdown;
    }

    /**
     * Build the weekly comparison summary from two WeekData arrays.
     */
    private function buildComparison(array $curr, array $prev, array $breakdown): array
    {
        $progressPct = $prev['score'] > 0
            ? round((($curr['score'] - $prev['score']) / $prev['score']) * 100, 1)
            : ($curr['score'] > 0 ? 100.0 : 0.0);

        $volumeDiff  = round($curr['totalVolume'] - $prev['totalVolume'], 2);
        $freqDiff    = $curr['workouts'] - $prev['workouts'];

        // Single-pass accumulation O(n)
        $totalWeightDiff = 0;
        $totalRepsDiff   = 0;
        $improved        = 0;
        $maintained      = 0;
        $declined        = 0;

        foreach ($breakdown as $row) {
            $totalWeightDiff += $row['weightDiff'];
            $totalRepsDiff   += $row['repsDiff'];
            match ($row['status']) {
                'improved'   => $improved++,
                'maintained' => $maintained++,
                'declined'   => $declined++,
            };
        }

        $count = count($breakdown);
        $avgWeightDiff = $count > 0 ? round($totalWeightDiff / $count, 2) : 0;
        $avgRepsDiff   = $count > 0 ? round($totalRepsDiff / $count, 1) : 0;

        // Overall status by majority
        if ($progressPct > 1) {
            $status = 'improved';
        } elseif ($progressPct < -1) {
            $status = 'declined';
        } else {
            $status = 'maintained';
        }

        return [
            'progressPct'    => $progressPct,
            'volumeDiff'     => $volumeDiff,
            'avgWeightDiff'  => $avgWeightDiff,
            'avgRepsDiff'    => $avgRepsDiff,
            'frequencyDiff'  => $freqDiff,
            'improved'       => $improved,
            'maintained'     => $maintained,
            'declined'       => $declined,
            'status'         => $status,
        ];
    }

    /**
     * Remove the internal exerciseMap from WeekData before sending to frontend
     * (frontend receives the breakdown array instead).
     */
    private function stripExerciseMap(array $weekData): array
    {
        unset($weekData['exerciseMap']);
        return $weekData;
    }

    /**
     * Build GitHub contribution calendar heatmap data for the past 52 weeks.
     */
    private function buildContributionCalendar($allWorkouts): array
    {
        $now = Carbon::now();
        $currentYear = (int)$now->format('Y');

        $yearsSet = [];
        $yearsSet[$currentYear] = true;

        $dailyMap = [];

        foreach ($allWorkouts as $workout) {
            if (!$workout->completed_at) {
                continue;
            }

            $dateKey = $workout->completed_at->format('Y-m-d');
            $year = (int)$workout->completed_at->format('Y');
            $yearsSet[$year] = true;

            if (!isset($dailyMap[$dateKey])) {
                $dailyMap[$dateKey] = [
                    'count'    => 0,
                    'sets'     => 0,
                    'volume'   => 0.0,
                    'duration' => 0,
                    'workouts' => [],
                ];
            }

            $dailyMap[$dateKey]['count']++;

            $durationSeconds = ($workout->started_at && $workout->completed_at)
                ? max(0, $workout->completed_at->diffInSeconds($workout->started_at))
                : 0;

            $dailyMap[$dateKey]['duration'] += $durationSeconds;

            $wVolume = 0.0;
            $wSetsCount = 0;
            $exercisesSummary = [];

            foreach ($workout->exercises as $ex) {
                $exSetsCount = 0;
                $bestWeight = 0.0;
                $bestReps = 0;

                foreach ($ex->sets as $set) {
                    if ($set->is_completed || $workout->completed_at) {
                        $wSetsCount++;
                        $exSetsCount++;
                        $w = (float)($set->weight ?? 0);
                        $r = (int)($set->reps ?? 0);
                        $wVolume += $w * $r;

                        if ($w > $bestWeight || ($w === $bestWeight && $r > $bestReps)) {
                            $bestWeight = $w;
                            $bestReps = $r;
                        }
                    }
                }

                $exercisesSummary[] = [
                    'name'      => $ex->exercise_name,
                    'setsCount' => $exSetsCount,
                    'bestSet'   => $bestWeight > 0 ? "{$bestWeight} kg × {$bestReps}" : "{$bestReps} reps",
                ];
            }

            $dailyMap[$dateKey]['sets'] += $wSetsCount;
            $dailyMap[$dateKey]['volume'] += $wVolume;

            $dailyMap[$dateKey]['workouts'][] = [
                'id'           => $workout->id,
                'name'         => $workout->name,
                'templateName' => $workout->template ? $workout->template->name : null,
                'startedAt'    => $workout->started_at ? $workout->started_at->toISOString() : null,
                'completedAt'  => $workout->completed_at ? $workout->completed_at->toISOString() : null,
                'duration'     => $durationSeconds,
                'setsCount'    => $wSetsCount,
                'volume'       => round($wVolume, 1),
                'exercises'    => $exercisesSummary,
            ];
        }

        $availableYears = array_keys($yearsSet);
        rsort($availableYears);

        $minYear = min($availableYears);
        $endDate = $now->copy()->endOfWeek(Carbon::SUNDAY);
        $oneYearAgo = $now->copy()->subWeeks(51)->startOfWeek(Carbon::SUNDAY);
        $earliestYearStart = Carbon::create($minYear, 1, 1)->startOfWeek(Carbon::SUNDAY);
        $startDate = $oneYearAgo->lt($earliestYearStart) ? $oneYearAgo : $earliestYearStart;

        $days = [];
        $totalContributions = 0;

        $cursor = $startDate->copy();
        while ($cursor->lte($endDate)) {
            $dateStr = $cursor->format('Y-m-d');
            $stats = $dailyMap[$dateStr] ?? [
                'count'    => 0,
                'sets'     => 0,
                'volume'   => 0.0,
                'duration' => 0,
                'workouts' => [],
            ];

            $setCount = $stats['sets'];
            $workoutCount = $stats['count'];

            if ($workoutCount === 0 && $setCount === 0) {
                $level = 0;
            } elseif ($workoutCount >= 4 || $setCount >= 16) {
                $level = 4;
            } elseif ($workoutCount === 3 || $setCount >= 11) {
                $level = 3;
            } elseif ($workoutCount === 2 || $setCount >= 6) {
                $level = 2;
            } else {
                $level = 1;
            }

            if ($setCount > 0 || $workoutCount > 0) {
                $totalContributions += max($workoutCount, 1);
            }

            $days[] = [
                'date'     => $dateStr,
                'count'    => $workoutCount,
                'sets'     => $setCount,
                'volume'   => round($stats['volume'], 1),
                'duration' => $stats['duration'],
                'level'    => $level,
                'workouts' => $stats['workouts'],
            ];

            $cursor->addDay();
        }

        return [
            'totalContributions' => $totalContributions,
            'selectedYear'       => $currentYear,
            'availableYears'     => $availableYears,
            'days'               => $days,
        ];
    }

    /**
     * Build Exercise Progress data from user's completed workout history (chronological).
     */
    private function buildExerciseProgressData($allWorkouts): array
    {
        $exerciseProgressMap = [];

        // $allWorkouts is ordered asc by completed_at (Oldest to Newest)
        foreach ($allWorkouts as $workout) {
            if (!$workout->completed_at) {
                continue;
            }

            $dateObj = $workout->completed_at;
            $isoDate = $dateObj->toIso8601String();
            $dateLabel = $dateObj->format('M j');

            foreach ($workout->exercises as $ex) {
                $name = $ex->exercise_name;
                $exerciseId = $ex->exercise_id;

                $setsCount = 0;
                $totalReps = 0;
                $maxReps = 0;
                $volume = 0.0;
                $hasWeight = false;
                $setsDetail = [];
                $weightDetail = [];

                foreach ($ex->sets as $set) {
                    if (!$set->is_completed) {
                        continue;
                    }
                    $setsCount++;
                    $r = (int)($set->reps ?? 0);
                    $w = (float)($set->weight ?? 0);

                    $totalReps += $r;
                    if ($r > $maxReps) {
                        $maxReps = $r;
                    }

                    if ($w > 0) {
                        $hasWeight = true;
                        $volume += ($w * $r);
                    }

                    $setsDetail[] = $r;
                    $weightDetail[] = $w;
                }

                if ($setsCount === 0) {
                    continue;
                }

                if (!isset($exerciseProgressMap[$name])) {
                    $exerciseProgressMap[$name] = [
                        'exercise_id'  => $exerciseId,
                        'name'         => $name,
                        'isBodyweight' => true,
                        'sessions'     => [],
                    ];
                }

                if ($hasWeight) {
                    $exerciseProgressMap[$name]['isBodyweight'] = false;
                }

                $exerciseProgressMap[$name]['sessions'][] = [
                    'session_id'   => $workout->id,
                    'workout_name' => $workout->name,
                    'date'         => $dateLabel,
                    'fullDate'     => $dateObj->format('Y-m-d'),
                    'isoDate'      => $isoDate,
                    'setsCount'    => $setsCount,
                    'totalReps'    => $totalReps,
                    'maxReps'      => $maxReps,
                    'volume'       => round($volume, 1),
                    'setsDetail'   => $setsDetail,
                    'weightDetail' => $weightDetail,
                ];
            }
        }

        return array_values($exerciseProgressMap);
    }
}
