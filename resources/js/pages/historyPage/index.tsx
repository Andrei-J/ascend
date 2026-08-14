import { Head, router } from '@inertiajs/react';
import { Clock, Trophy, Weight, Dumbbell, History, ChevronDown, Filter, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EdgeHeader, EdgeCard, EdgeBadge } from '@/lib/edge/engine';


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

export default function HistoryPage({
    history = [],
    historyTotal = 0,
    historyHasMore = false,
    historyPage = 1,
    filterMonth = null,
    filterYear = null,
}: {
    history?: LoggedWorkout[];
    historyTotal?: number;
    historyHasMore?: boolean;
    historyPage?: number;
    filterMonth?: number | null;
    filterYear?: number | null;
}) {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];


    const processedHistory = useMemo(() => {
        const chronological = [...history].sort(
            (a, b) =>
                new Date(a.startedAt).getTime() -
                new Date(b.startedAt).getTime(),
        );

        const exerciseMaxes: Record<string, number> = {};

        const enrichedChronological = chronological.map((workout) => {
            let prCount = 0;

            const exercisesWithPRs = workout.exercises.map((ex) => {
                const setsWithPRStatus = ex.sets.map((set) => {
                    let isPR = false;
                    const weightVal =
                        set.weight !== null
                            ? parseFloat(set.weight.toString())
                            : 0;

                    if (set.isCompleted && weightVal > 0) {
                        const currentMax = exerciseMaxes[ex.name] || 0;

                        if (weightVal > currentMax) {
                            isPR = true;
                            exerciseMaxes[ex.name] = weightVal;
                        }
                    }

                    return { ...set, isPR };
                });

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

        return enrichedChronological.sort(
            (a, b) =>
                new Date(b.completedAt).getTime() -
                new Date(a.completedAt).getTime(),
        );
    }, [history]);

    const groupedWorkouts = useMemo(() => {
        const groups: {
            monthYear: string;
            workouts: typeof processedHistory;
        }[] = [];

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
        hours = hours ? hours : 12;

        return `${weekday}, ${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
    };

    const getBestSet = (ex: LoggedExercise): LoggedSet | null => {
        let bestSet: LoggedSet | null = null;
        let maxWeight = -1;
        let maxReps = -1;

        for (const set of ex.sets) {
            if (!set.isCompleted) {
                continue;
            }

            const weightVal =
                set.weight !== null ? parseFloat(set.weight.toString()) : 0;
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

    const formatBestSetText = (ex: LoggedExercise) => {
        const bestSet = getBestSet(ex);

        if (!bestSet) {
            return '—';
        }

        const weightVal =
            bestSet.weight !== null ? parseFloat(bestSet.weight.toString()) : 0;
        const repsVal = bestSet.reps || 0;

        const nameLower = ex.name.toLowerCase();
        const isBodyweight =
            nameLower.includes('dip') ||
            nameLower.includes('pullup') ||
            nameLower.includes('pull-up') ||
            nameLower.includes('chinup') ||
            nameLower.includes('chin-up') ||
            nameLower.includes('leg raise');

        const unitStr = 'kg';

        if (isBodyweight) {
            return `${weightVal > 0 ? `+${weightVal}` : `+0`} ${unitStr} × ${repsVal}`;
        }

        return `${weightVal} ${unitStr} × ${repsVal}`;
    };

    const calculateWorkoutVolume = (
        workout: (typeof processedHistory)[number],
    ) => {
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

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        const nextPage = historyPage + 1;
        const params: Record<string, string | number> = { page: nextPage };
        if (filterMonth) params.month = filterMonth;
        if (filterYear) params.year = filterYear;

        router.visit('/History', {
            data: params,
            preserveScroll: true,
            preserveState: true,
            only: ['history', 'historyHasMore', 'historyPage', 'historyTotal'],
            onFinish: () => setIsLoadingMore(false),
        });
    };

    const applyFilter = (month: number | null, year: number | null) => {
        const params: Record<string, string | number> = { page: 1 };
        if (month) params.month = month;
        if (year) params.year = year;

        router.visit('/History', {
            data: params,
            preserveScroll: false,
            preserveState: false,
            only: ['history', 'historyHasMore', 'historyPage', 'historyTotal', 'filterMonth', 'filterYear'],
        });
        setShowFilters(false);
    };

    const clearFilter = () => {
        router.visit('/History', { data: {}, preserveScroll: false, preserveState: false });
        setShowFilters(false);
    };

    const hasActiveFilter = filterMonth || filterYear;

    return (
        <>
            <Head title="History - Ascend EDGE" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-white md:py-8 md:pb-12">
                <EdgeHeader
                    title="Workout History"
                    subtitle="Chronological log of completed sessions, performance milestones, and PR achievements."
                    icon={<History className="h-7 w-7 text-indigo-400" />}
                />

                {/* Filter Bar */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                            {historyTotal} workout{historyTotal !== 1 ? 's' : ''} total
                        </span>
                        {hasActiveFilter && (
                            <span className="flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                                <Filter className="h-3 w-3" />
                                {filterMonth ? monthNames[filterMonth - 1] : ''}{filterMonth && filterYear ? ' ' : ''}{filterYear || ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilter && (
                            <button
                                onClick={clearFilter}
                                className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                showFilters
                                    ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                                    : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filter
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="animate-in slide-in-from-top-2 rounded-2xl border border-white/10 bg-slate-900/80 p-4 duration-200">
                        <p className="mb-3 text-[11px] font-black tracking-widest text-slate-400 uppercase">Filter by Date</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-2 text-[10px] font-bold text-slate-500 uppercase">Month</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {monthNames.map((m, i) => (
                                        <button
                                            key={m}
                                            onClick={() => applyFilter(i + 1, filterYear || currentYear)}
                                            className={`cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                                                filterMonth === i + 1
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {m.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-[10px] font-bold text-slate-500 uppercase">Year</p>
                                <div className="flex flex-col gap-1.5">
                                    {yearOptions.map((y) => (
                                        <button
                                            key={y}
                                            onClick={() => applyFilter(filterMonth || null, y)}
                                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                                filterYear === y
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    {groupedWorkouts.length === 0 ? (
                        <EdgeCard
                            variant="glass"
                            className="flex flex-col items-center py-20 text-center"
                        >
                            <div className="mb-4 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-indigo-400">
                                <Dumbbell className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-white">
                                {hasActiveFilter ? 'No workouts for this period' : 'No workouts completed yet'}
                            </h3>
                            <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
                                {hasActiveFilter
                                    ? 'Try adjusting the date filter to see workouts from a different period.'
                                    : 'Complete your first workout session to record set logs, total volume, and personal records in your history timeline.'}
                            </p>
                            {hasActiveFilter && (
                                <button
                                    onClick={clearFilter}
                                    className="mt-4 cursor-pointer rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-300 transition-colors hover:bg-indigo-500/20"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </EdgeCard>
                    ) : (
                        groupedWorkouts.map((group) => (
                            <div key={group.monthYear} className="space-y-4">
                                <div className="flex items-baseline justify-between border-b border-white/10 px-1 pb-2">
                                    <h2 className="text-lg font-black tracking-tight text-white capitalize">
                                        {group.monthYear}
                                    </h2>
                                    <EdgeBadge
                                        text={`${group.workouts.length} ${group.workouts.length === 1 ? 'WORKOUT' : 'WORKOUTS'}`}
                                        variant="accent"
                                    />
                                </div>

                                <div className="space-y-4">
                                    {group.workouts.map((w) => {
                                        const volume =
                                            calculateWorkoutVolume(w);
                                        const durationText = formatDurationHevy(
                                            w.duration,
                                        );

                                        return (
                                            <EdgeCard
                                                key={w.id}
                                                variant="glass"
                                                elevation="lg"
                                                glow={w.prCount > 0}
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-black text-white">
                                                            {w.name}
                                                        </span>
                                                        {w.templateName && (
                                                            <EdgeBadge
                                                                text={
                                                                    w.templateName
                                                                }
                                                                variant="subtle"
                                                            />
                                                        )}
                                                    </div>
                                                }
                                                subtitle={formatDateHevy(
                                                    w.completedAt,
                                                )}
                                                headerAction={
                                                    w.prCount > 0 && (
                                                        <EdgeBadge
                                                            text={`🏆 ${w.prCount} PR${w.prCount > 1 ? 's' : ''}`}
                                                            variant="neon"
                                                            glow
                                                        />
                                                    )
                                                }
                                            >
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex justify-between border-b border-white/10 pb-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                        <span>
                                                            Exercises & Sets
                                                        </span>
                                                        <span>Best Load</span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {w.exercises.map(
                                                            (ex) => {
                                                                const completedSets =
                                                                    ex.sets.filter(
                                                                        (s) =>
                                                                            s.isCompleted,
                                                                    ).length;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            ex.id
                                                                        }
                                                                        className="flex items-center justify-between py-0.5 text-xs"
                                                                    >
                                                                        <span className="text-slate-200">
                                                                            <span className="mr-2 font-bold text-indigo-400">
                                                                                {
                                                                                    completedSets
                                                                                }
                                                                                ×
                                                                            </span>
                                                                            {
                                                                                ex.name
                                                                            }
                                                                        </span>
                                                                        <span className="rounded-md border border-white/5 bg-slate-900/60 px-2 py-0.5 font-mono font-bold text-slate-300">
                                                                            {formatBestSetText(
                                                                                ex,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-6 border-t border-white/10 pt-3 text-xs text-slate-400">
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Clock className="h-4 w-4 text-indigo-400" />
                                                            <span>
                                                                {durationText}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Weight className="h-4 w-4 text-purple-400" />
                                                            <span>
                                                                {volume} kg
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Trophy className="h-4 w-4 text-amber-400" />
                                                            <span>
                                                                {w.prCount} PRs
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </EdgeCard>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Load More Button */}
                    {historyHasMore && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 text-sm font-bold text-indigo-300 shadow-lg transition-all hover:bg-indigo-500/20 hover:text-indigo-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Load More
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Footer count */}
                    {history.length > 0 && (
                        <p className="text-center text-xs text-slate-600">
                            Showing {history.length} of {historyTotal} workout{historyTotal !== 1 ? 's' : ''}
                        </p>
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