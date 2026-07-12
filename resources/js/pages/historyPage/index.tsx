import { Head } from '@inertiajs/react';
import { Clock, Trophy, Weight, Dumbbell, History } from 'lucide-react';
import { useMemo } from 'react';

interface LoggedSet {
    id: number;
    setNumber: number;
    weight: string | number | null;
    reps: number | null;
    isCompleted: boolean;
}

interface LoggedExercise {
    id: number;
    name: string;
    sets: LoggedSet[];
}

interface LoggedWorkout {
    id: number;
    name: string;
    templateName: string | null;
    startedAt: string;
    completedAt: string;
    duration: number; // in seconds
    exercises: LoggedExercise[];
}

export default function HistoryPage({ history = [] }: { history?: LoggedWorkout[] }) {
    
    // 1. Calculate PRs chronologically using O(N) client-side traversal
    const processedHistory = useMemo(() => {
        // Sort history oldest first to track record improvements over time
        const chronological = [...history].sort(
            (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );

        // Keep track of maximum weight achieved per exercise name
        const exerciseMaxes: Record<string, number> = {};

        const enrichedChronological = chronological.map((workout) => {
            let prCount = 0;

            const exercisesWithPRs = workout.exercises.map((ex) => {
                const setsWithPRStatus = ex.sets.map((set) => {
                    let isPR = false;
                    const weightVal = set.weight !== null ? parseFloat(set.weight.toString()) : 0;
                    
                    if (set.isCompleted && weightVal > 0) {
                        const currentMax = exerciseMaxes[ex.name] || 0;

                        if (weightVal > currentMax) {
                            isPR = true;
                            exerciseMaxes[ex.name] = weightVal;
                        }
                    }

                    return { ...set, isPR };
                });

                // If any set in the exercise is a PR, we count it as 1 exercise PR
                const hasPR = setsWithPRStatus.some((s) => s.isPR);

                if (hasPR) {
                    prCount++;
                }

                return { ...ex, sets: setsWithPRStatus };
            });

            return {
                ...workout,
                exercises: exercisesWithPRs,
                prCount,
            };
        });

        // Re-sort to newest first for display
        return enrichedChronological.sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
    }, [history]);

    // 2. Group workouts by month and year
    const groupedWorkouts = useMemo(() => {
        const groups: { monthYear: string; workouts: typeof processedHistory }[] = [];

        processedHistory.forEach((w) => {
            const date = new Date(w.completedAt);
            const monthName = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const key = `${monthName} ${year}`;

            let group = groups.find((g) => g.monthYear === key);

            if (!group) {
                group = { monthYear: key, workouts: [] };
                groups.push(group);
            }

            group.workouts.push(w);
        });

        return groups;
    }, [processedHistory]);

    // Format duration to match Hevy app format (e.g. 2h 11m, 15m, 32s)
    const formatDurationHevy = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }

        if (mins > 0) {
            return `${mins}m`;
        }

        return `${secs}s`;
    };

    // Format date to Hevy format (e.g. "Thursday, 9 July 2026 at 7:09 pm")
    const formatDateHevy = (dateStr: string) => {
        const d = new Date(dateStr);
        const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
        const day = d.getDate();
        const month = d.toLocaleDateString(undefined, { month: 'long' });
        const year = d.getFullYear();
        
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${weekday}, ${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
    };

    // Calculate best set for an exercise (highest weight, then highest reps)
    const getBestSet = (ex: LoggedExercise): LoggedSet | null => {
        let bestSet: LoggedSet | null = null;
        let maxWeight = -1;
        let maxReps = -1;

        for (const set of ex.sets) {
            if (!set.isCompleted) {
continue;
}

            const weightVal = set.weight !== null ? parseFloat(set.weight.toString()) : 0;
            const repsVal = set.reps || 0;

            if (weightVal > maxWeight) {
                maxWeight = weightVal;
                maxReps = repsVal;
                bestSet = set;
            } else if (weightVal === maxWeight && repsVal > maxReps) {
                maxReps = repsVal;
                bestSet = set;
            }
        }

        return bestSet;
    };

    // Helper to decide if we should format bodyweight extra loads (e.g. +58 kg) vs standard barbell load
    const formatBestSetText = (ex: LoggedExercise) => {
        const bestSet = getBestSet(ex);

        if (!bestSet) {
return '—';
}

        const weightVal = bestSet.weight !== null ? parseFloat(bestSet.weight.toString()) : 0;
        const repsVal = bestSet.reps || 0;

        // heuristic to check if weighted bodyweight (dips, pullups, hanging leg raises)
        const nameLower = ex.name.toLowerCase();
        const isBodyweight =
            nameLower.includes('dip') ||
            nameLower.includes('pullup') ||
            nameLower.includes('pull-up') ||
            nameLower.includes('chinup') ||
            nameLower.includes('chin-up') ||
            nameLower.includes('leg raise');

        const unitStr = 'kg'; // default unit is kg as defined in default active sets

        if (isBodyweight) {
            return `${weightVal > 0 ? `+${weightVal}` : `+0`} ${unitStr} × ${repsVal}`;
        }

        return `${weightVal} ${unitStr} × ${repsVal}`;
    };

    // Calculate total workout volume
    const calculateWorkoutVolume = (workout: typeof processedHistory[number]) => {
        let total = 0;
        workout.exercises.forEach((ex) => {
            ex.sets.forEach((set) => {
                if (set.isCompleted && set.weight !== null) {
                    const weightVal = parseFloat(set.weight.toString());
                    const repsVal = set.reps || 0;
                    total += weightVal * repsVal;
                }
            });
        });

        return total;
    };

    return (
        <>
            <Head title="History" />

            <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:py-8 text-neutral-100 pb-24">
                
                {/* Header title */}
                <h1 className="text-3xl font-black text-neutral-550 flex items-center gap-2.5">
                    <History className="h-7 w-7 text-sky-500" />
                    History
                </h1>

                {/* Timeline groups */}
                <div className="flex flex-col gap-8">
                    {groupedWorkouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/10 py-20 text-center">
                            <Dumbbell className="mb-4 h-12 w-12 text-neutral-600" />
                            <h3 className="text-lg font-bold text-neutral-200">No workouts completed yet</h3>
                            <p className="mt-1 text-xs text-neutral-500 max-w-xs px-4 leading-relaxed">
                                Go to the Workout tab, start a session, log your sets, and tap finish to see your workout timeline here!
                            </p>
                        </div>
                    ) : (
                        groupedWorkouts.map((group) => (
                            <div key={group.monthYear} className="space-y-4">
                                
                                {/* Month divider title */}
                                <div className="flex items-baseline justify-between px-1">
                                    <h2 className="text-lg font-black text-neutral-100 capitalize">
                                        {group.monthYear.split(' ')[0]}
                                    </h2>
                                    <span className="text-xs font-bold text-neutral-500">
                                        {group.workouts.length} {group.workouts.length === 1 ? 'workout' : 'workouts'}
                                    </span>
                                </div>

                                {/* Workouts in month list */}
                                <div className="space-y-4">
                                    {group.workouts.map((w) => {
                                        const volume = calculateWorkoutVolume(w);
                                        const durationText = formatDurationHevy(w.duration);

                                        return (
                                            <div
                                                key={w.id}
                                                className="rounded-2xl border border-neutral-850 bg-neutral-900/40 p-5 shadow-lg space-y-4"
                                            >
                                                {/* Header info */}
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-base font-black text-neutral-50">
                                                            {w.name}
                                                        </h3>
                                                        {w.templateName && (
                                                            <span className="rounded-md bg-sky-950/40 border border-sky-900/40 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-400">
                                                                {w.templateName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-neutral-500">
                                                        {formatDateHevy(w.completedAt)}
                                                    </p>
                                                </div>

                                                {/* Table column titles */}
                                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 tracking-wider border-b border-neutral-850/60 pb-1.5 mt-2">
                                                    <span>Sets</span>
                                                    <span>Best set</span>
                                                </div>

                                                {/* Exercise items list */}
                                                <div className="space-y-2">
                                                    {w.exercises.map((ex) => {
                                                        const completedSets = ex.sets.filter(s => s.isCompleted).length;
                                                        
                                                        return (
                                                            <div
                                                                key={ex.id}
                                                                className="flex justify-between items-center text-xs"
                                                            >
                                                                <span className="text-neutral-300">
                                                                    <span className="font-bold text-neutral-500 mr-2">
                                                                        {completedSets} ×
                                                                    </span>
                                                                    {ex.name}
                                                                </span>
                                                                <span className="font-mono text-neutral-350 font-semibold">
                                                                    {formatBestSetText(ex)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Card footer statistics bar */}
                                                <div className="flex items-center gap-6 text-xs text-neutral-400 border-t border-neutral-850/40 pt-4 mt-3">
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <Clock className="h-4 w-4 text-neutral-500" />
                                                        <span>{durationText}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <Weight className="h-4 w-4 text-neutral-500" />
                                                        <span>{volume} kg</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        <Trophy className="h-4 w-4 text-neutral-500" />
                                                        <span>{w.prCount} PRs</span>
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

HistoryPage.layout = {
    breadcrumbs: [
        {
            title: 'History',
            href: '/History',
        },
    ],
};
