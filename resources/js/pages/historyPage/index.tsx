import { Head } from '@inertiajs/react';
import { Clock, Trophy, Weight, Dumbbell, History } from 'lucide-react';
import { useMemo } from 'react';
import {
    EdgeHeader,
    EdgeCard,
    EdgeBadge,
} from '@/lib/edge/engine';

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
    
    const processedHistory = useMemo(() => {
        const chronological = [...history].sort(
            (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );

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
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
    }, [history]);

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

    const formatDurationHevy = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m`;
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
            if (!set.isCompleted) continue;

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

    const formatBestSetText = (ex: LoggedExercise) => {
        const bestSet = getBestSet(ex);
        if (!bestSet) return '—';

        const weightVal = bestSet.weight !== null ? parseFloat(bestSet.weight.toString()) : 0;
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
            <Head title="History - Ascend EDGE" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:py-8 text-white pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
                <EdgeHeader
                    title="Workout History"
                    subtitle="Chronological log of completed sessions, performance milestones, and PR achievements."
                    icon={<History className="h-7 w-7 text-indigo-400" />}
                />

                <div className="flex flex-col gap-8">
                    {groupedWorkouts.length === 0 ? (
                        <EdgeCard variant="glass" className="py-20 text-center flex flex-col items-center">
                            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4">
                                <Dumbbell className="h-10 w-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-white">No workouts completed yet</h3>
                            <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed">
                                Complete your first workout session to record set logs, total volume, and personal records in your history timeline.
                            </p>
                        </EdgeCard>
                    ) : (
                        groupedWorkouts.map((group) => (
                            <div key={group.monthYear} className="space-y-4">
                                <div className="flex items-baseline justify-between px-1 border-b border-white/10 pb-2">
                                    <h2 className="text-lg font-black text-white tracking-tight capitalize">
                                        {group.monthYear}
                                    </h2>
                                    <EdgeBadge
                                        text={`${group.workouts.length} ${group.workouts.length === 1 ? 'WORKOUT' : 'WORKOUTS'}`}
                                        variant="accent"
                                    />
                                </div>

                                <div className="space-y-4">
                                    {group.workouts.map((w) => {
                                        const volume = calculateWorkoutVolume(w);
                                        const durationText = formatDurationHevy(w.duration);

                                        return (
                                            <EdgeCard
                                                key={w.id}
                                                variant="glass"
                                                elevation="lg"
                                                glow={w.prCount > 0}
                                                title={
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-black text-white">{w.name}</span>
                                                        {w.templateName && (
                                                            <EdgeBadge text={w.templateName} variant="subtle" />
                                                        )}
                                                    </div>
                                                }
                                                subtitle={formatDateHevy(w.completedAt)}
                                                headerAction={
                                                    w.prCount > 0 && (
                                                        <EdgeBadge text={`🏆 ${w.prCount} PR${w.prCount > 1 ? 's' : ''}`} variant="neon" glow />
                                                    )
                                                }
                                            >
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-white/10 pb-1.5">
                                                        <span>Exercises & Sets</span>
                                                        <span>Best Load</span>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {w.exercises.map((ex) => {
                                                            const completedSets = ex.sets.filter(s => s.isCompleted).length;
                                                            return (
                                                                <div
                                                                    key={ex.id}
                                                                    className="flex justify-between items-center text-xs py-0.5"
                                                                >
                                                                    <span className="text-slate-200">
                                                                        <span className="font-bold text-indigo-400 mr-2">
                                                                            {completedSets}×
                                                                        </span>
                                                                        {ex.name}
                                                                    </span>
                                                                    <span className="font-mono text-slate-300 font-bold bg-slate-900/60 px-2 py-0.5 rounded-md border border-white/5">
                                                                        {formatBestSetText(ex)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="flex items-center gap-6 text-xs text-slate-400 border-t border-white/10 pt-3 mt-3">
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Clock className="h-4 w-4 text-indigo-400" />
                                                            <span>{durationText}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Weight className="h-4 w-4 text-purple-400" />
                                                            <span>{volume} kg</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                                            <Trophy className="h-4 w-4 text-amber-400" />
                                                            <span>{w.prCount} PRs</span>
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
