import { Head } from '@inertiajs/react';
import {
    BarChart2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Dumbbell,
    Trophy,
    Zap,
    Activity,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ExerciseProgressCard from '@/components/exercise-progress-card';
import type { ExerciseProgressItem } from '@/components/exercise-progress-card';
import GitHubContributionCalendar from '@/components/github-contribution-calendar';
import type { ContributionCalendarData } from '@/components/github-contribution-calendar';
import {
    EdgeHeader,
    EdgeStat,
    EdgeCard,
    EdgeGrid,
    EdgeBadge,
    EdgeButton,
} from '@/lib/edge/engine';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeekData {
    label: string;
    score: number;
    workouts: number;
    exercises: number;
    totalSets: number;
    totalReps: number;
    totalVolume: number;
    prCount: number;
}

interface ComparisonData {
    progressPct: number;
    volumeDiff: number;
    avgWeightDiff: number;
    avgRepsDiff: number;
    frequencyDiff: number;
    improved: number;
    maintained: number;
    declined: number;
    status: 'improved' | 'maintained' | 'declined';
}

interface ExerciseBreakdownRow {
    name: string;
    prevSets: number;
    prevAvgWeight: number;
    prevAvgReps: number;
    prevVolume: number;
    currSets: number;
    currAvgWeight: number;
    currAvgReps: number;
    currVolume: number;
    weightDiff: number;
    repsDiff: number;
    volumeDiff: number;
    status: 'improved' | 'maintained' | 'declined';
}

export interface RecentlyPerformedExercise {
    exercise_id: number | null;
    name: string;
    lastPerformedAt: string;
    relativeDate: string;
    setsCount: number;
    totalReps: number;
    maxWeight: number | null;
    isBodyweight: boolean;
    history: {
        date: string;
        fullDate: string;
        setsCount: number;
        totalReps: number;
        maxWeight: number | null;
    }[];
}

interface DashboardProps {
    currentWeek?: WeekData;
    previousWeek?: WeekData;
    comparison?: ComparisonData;
    exerciseBreakdown?: ExerciseBreakdownRow[];
    contributionCalendar?: ContributionCalendarData;
    exerciseProgressData?: ExerciseProgressItem[];
    recentlyPerformedExercises?: RecentlyPerformedExercise[];
    newExercises?: string[];
    hasData?: boolean;
    hasTwoWeeks?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
    return n.toFixed(decimals);
}

function fmtVol(v: number): string {
    if (Math.abs(v) >= 1000) {
        return `${(v / 1000).toFixed(1)}k`;
    }

    return v.toFixed(0);
}

function diffColor(diff: number): string {
    if (diff > 0) {
        return 'text-emerald-400';
    }

    if (diff < 0) {
        return 'text-rose-400';
    }

    return 'text-amber-400';
}

function statusConfig(status?: 'improved' | 'maintained' | 'declined') {
    const configs = {
        improved: {
            emoji: '🟢',
            label: 'Improved',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
        },
        maintained: {
            emoji: '🟡',
            label: 'Maintained',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
        },
        declined: {
            emoji: '🔴',
            label: 'Declined',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20',
        },
    };

    return status && configs[status] ? configs[status] : configs.maintained;
}

function generateInsights(
    comparison: ComparisonData,
    breakdown: ExerciseBreakdownRow[],
    currentWeek: WeekData,
    previousWeek: WeekData,
): string[] {
    type Rule = {
        check: (c: ComparisonData, b: ExerciseBreakdownRow[]) => boolean;
        message: (c: ComparisonData, b: ExerciseBreakdownRow[]) => string;
    };

    const rules: Rule[] = [
        {
            check: (c) => c.progressPct > 5,
            message: (c) =>
                `🟢 Overall weekly performance improved by ${fmt(c.progressPct)}% ▲`,
        },
        {
            check: (c) => c.progressPct < -5,
            message: (c) =>
                `🔴 Overall weekly performance declined by ${fmt(Math.abs(c.progressPct))}% ▼`,
        },
        {
            check: (c) =>
                Math.abs(c.progressPct) <= 5 && previousWeek.score > 0,
            message: () =>
                `🟡 Your overall performance remained consistent this week ▬`,
        },
        {
            check: (c) => c.volumeDiff > 0,
            message: (c) =>
                `💪 Total training volume increased by ${fmtVol(Math.abs(c.volumeDiff))} kg ▲`,
        },
        {
            check: (c) => c.volumeDiff < 0,
            message: (c) =>
                `📉 Total training volume decreased by ${fmtVol(Math.abs(c.volumeDiff))} kg ▼`,
        },
        {
            check: (c) => c.avgWeightDiff > 0,
            message: (c) =>
                `🏋️ Average weight lifted increased by ${fmt(c.avgWeightDiff)} kg ▲`,
        },
        {
            check: (c) => c.avgRepsDiff > 0,
            message: (c) =>
                `🔢 Average reps per set increased by ${fmt(c.avgRepsDiff)} ▲`,
        },
        {
            check: (c) => c.frequencyDiff > 0,
            message: (c) =>
                `📅 You completed ${Math.abs(c.frequencyDiff)} more workout${Math.abs(c.frequencyDiff) > 1 ? 's' : ''} than last week ▲`,
        },
        {
            check: (c) => c.frequencyDiff < 0,
            message: (c) =>
                `⚠️ You completed ${Math.abs(c.frequencyDiff)} fewer workout${Math.abs(c.frequencyDiff) > 1 ? 's' : ''} than last week ▼`,
        },
        {
            check: (c) => c.improved > 0,
            message: (c) =>
                `📈 ${c.improved} exercise${c.improved > 1 ? 's' : ''} showed improvement this week ▲`,
        },
        {
            check: (c) => c.declined > 0,
            message: (c) =>
                `⚠️ ${c.declined} exercise${c.declined > 1 ? 's' : ''} declined — focus on progressive overload ▼`,
        },
        {
            check: () => currentWeek.prCount > 0,
            message: () =>
                `🏆 ${currentWeek.prCount} new personal record${currentWeek.prCount > 1 ? 's' : ''} achieved this week`,
        },
    ];

    return rules
        .filter((r) => r.check(comparison, breakdown))
        .map((r) => r.message(comparison, breakdown));
}

const DEFAULT_WEEK: WeekData = {
    label: '',
    score: 0,
    workouts: 0,
    exercises: 0,
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    prCount: 0,
};

const DEFAULT_COMPARISON: ComparisonData = {
    progressPct: 0,
    volumeDiff: 0,
    avgWeightDiff: 0,
    avgRepsDiff: 0,
    frequencyDiff: 0,
    improved: 0,
    maintained: 0,
    declined: 0,
    status: 'maintained',
};

export default function Dashboard({
    currentWeek,
    previousWeek,
    comparison,
    exerciseBreakdown,
    contributionCalendar,
    exerciseProgressData,
    recentlyPerformedExercises,
    newExercises,
    hasData = false,
    hasTwoWeeks = false,
}: DashboardProps) {
    const cWeek = currentWeek ?? DEFAULT_WEEK;
    const pWeek = previousWeek ?? DEFAULT_WEEK;
    const comp = comparison ?? DEFAULT_COMPARISON;
    const exBreakdown = useMemo(
        () => exerciseBreakdown ?? [],
        [exerciseBreakdown],
    );
    const exProgressData = useMemo(
        () => exerciseProgressData ?? (recentlyPerformedExercises as any) ?? [],
        [exerciseProgressData, recentlyPerformedExercises],
    );
    const nExercises = newExercises ?? [];

    const [breakdownOpen, setBreakdownOpen] = useState(false);
    const [selectedExerciseForProgress, setSelectedExerciseForProgress] =
        useState<RecentlyPerformedExercise | null>(null);

    const insights = useMemo(
        () =>
            hasTwoWeeks
                ? generateInsights(comp, exBreakdown, cWeek, pWeek)
                : [],
        [comp, exBreakdown, cWeek, pWeek, hasTwoWeeks],
    );

    const statusCfg = statusConfig(comp.status);

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:p-8 md:pb-12">
                <EdgeHeader
                    title="Dashboard"
                    subtitle="Your workout performance overview — track, compare, and elevate your fitness gains."
                    icon={<BarChart2 className="h-7 w-7 text-indigo-400" />}
                />

                {!hasData && (
                    <EdgeCard
                        variant="glass"
                        elevation="lg"
                        className="flex flex-col items-center py-20 text-center"
                    >
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            <Dumbbell className="h-10 w-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white">
                            No workout data recorded yet
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                            Log your first workout session to start unlocking
                            EDGE performance analytics, weekly score trends, and
                            AI-driven insights.
                        </p>
                    </EdgeCard>
                )}

                {hasData && (
                    <>
                        <GitHubContributionCalendar
                            data={contributionCalendar}
                        />

                        <EdgeGrid columns="responsive" gap="md">
                            <EdgeStat
                                title="Personal Records"
                                value={cWeek.prCount}
                                subValue="PRs achieved this week"
                                badge={
                                    cWeek.prCount > 0
                                        ? { text: 'RECORD', variant: 'neon' }
                                        : undefined
                                }
                                icon={
                                    <Trophy className="h-5 w-5 text-rose-400" />
                                }
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Total Volume"
                                value={`${fmtVol(cWeek.totalVolume)} kg`}
                                subValue={`${fmtVol(pWeek.totalVolume)} kg prev`}
                                trend={{
                                    value: `${comp.volumeDiff >= 0 ? '+' : ''}${fmtVol(comp.volumeDiff)} kg`,
                                    direction:
                                        comp.volumeDiff > 0
                                            ? 'up'
                                            : comp.volumeDiff < 0
                                              ? 'down'
                                              : 'neutral',
                                    label: 'volume Δ',
                                }}
                                icon={
                                    <Zap className="h-5 w-5 text-amber-400" />
                                }
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Workouts"
                                value={cWeek.workouts}
                                subValue={`${pWeek.workouts} last week`}
                                trend={{
                                    value: `${comp.frequencyDiff >= 0 ? '+' : ''}${comp.frequencyDiff}`,
                                    direction:
                                        comp.frequencyDiff > 0
                                            ? 'up'
                                            : comp.frequencyDiff < 0
                                              ? 'down'
                                              : 'neutral',
                                    label: 'sessions',
                                }}
                                icon={
                                    <Dumbbell className="h-5 w-5 text-purple-400" />
                                }
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Weekly Score"
                                value={fmt(cWeek.score)}
                                subValue={`vs ${fmt(pWeek.score)} prev week`}
                                trend={{
                                    value: `${comp.progressPct > 0 ? '+' : ''}${fmt(comp.progressPct)}%`,
                                    direction:
                                        comp.progressPct > 0
                                            ? 'up'
                                            : comp.progressPct < 0
                                              ? 'down'
                                              : 'neutral',
                                    label: 'vs last week',
                                }}
                                icon={
                                    <Activity className="h-5 w-5 text-indigo-400" />
                                }
                                variant="glass"
                                elevation="lg"
                            />
                        </EdgeGrid>

                        <ExerciseProgressCard exerciseProgressData={exProgressData} />

                        {hasTwoWeeks && (
                            <EdgeCard
                                variant="neon"
                                elevation="xl"
                                glow
                                title={
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xl font-black sm:text-2xl ${statusCfg.color}`}
                                        >
                                            {statusCfg.emoji} {statusCfg.label}
                                        </span>
                                        <EdgeBadge
                                            text={`${comp.progressPct > 0 ? '+' : ''}${fmt(comp.progressPct)}%`}
                                            variant={
                                                comp.progressPct >= 0
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                            glow
                                        />
                                    </div>
                                }
                                headerAction={
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-400">
                                            ▲ {comp.improved} improved
                                        </span>
                                        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-bold text-amber-400">
                                            ▬ {comp.maintained} maintained
                                        </span>
                                        <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-bold text-rose-400">
                                            ▼ {comp.declined} declined
                                        </span>
                                    </div>
                                }
                            >
                                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        {
                                            label: 'Volume Diff',
                                            value: `${comp.volumeDiff >= 0 ? '+' : ''}${fmtVol(comp.volumeDiff)} kg`,
                                            diff: comp.volumeDiff,
                                        },
                                        {
                                            label: 'Avg Weight Δ',
                                            value: `${comp.avgWeightDiff >= 0 ? '+' : ''}${fmt(comp.avgWeightDiff)} kg`,
                                            diff: comp.avgWeightDiff,
                                        },
                                        {
                                            label: 'Avg Reps Δ',
                                            value: `${comp.avgRepsDiff >= 0 ? '+' : ''}${fmt(comp.avgRepsDiff)}`,
                                            diff: comp.avgRepsDiff,
                                        },
                                        {
                                            label: 'Workouts Δ',
                                            value: `${comp.frequencyDiff >= 0 ? '+' : ''}${comp.frequencyDiff}`,
                                            diff: comp.frequencyDiff,
                                        },
                                    ].map(({ label, value, diff }) => (
                                        <div
                                            key={label}
                                            className="space-y-1 rounded-xl border border-white/10 bg-slate-900/70 p-3.5"
                                        >
                                            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {label}
                                            </p>
                                            <p
                                                className={`text-xl font-black ${diffColor(diff)}`}
                                            >
                                                {value}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                {diff > 0 ? (
                                                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                                                ) : diff < 0 ? (
                                                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                                                ) : (
                                                    <Minus className="h-3.5 w-3.5 text-amber-400" />
                                                )}
                                                <span
                                                    className={`text-[10px] font-semibold ${diffColor(diff)}`}
                                                >
                                                    {diff > 0
                                                        ? 'Increased'
                                                        : diff < 0
                                                          ? 'Decreased'
                                                          : 'Stable'}{' '}
                                                    vs last week
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </EdgeCard>
                        )}

                        {exBreakdown.length > 0 && (
                            <EdgeCard
                                variant="glass"
                                elevation="md"
                                className="overflow-hidden p-0"
                            >
                                <button
                                    onClick={() => setBreakdownOpen((o) => !o)}
                                    className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-400">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-white">
                                                Exercise Breakdown Engine
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                {exBreakdown.length} exercises
                                                analyzed week-over-week
                                            </p>
                                        </div>
                                    </div>
                                    {breakdownOpen ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>

                                {breakdownOpen && (
                                    <div className="border-t border-white/10">
                                        <div className="hidden overflow-x-auto md:block">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/10 bg-slate-900/40 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                        <th className="px-5 py-3.5 text-left">
                                                            Exercise Name
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Prev Week
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Curr Week
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Weight Δ
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Reps Δ
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Volume Δ
                                                        </th>
                                                        <th className="px-4 py-3.5 text-right">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {exBreakdown.map((row) => {
                                                        const cfg =
                                                            statusConfig(
                                                                row.status,
                                                            );

                                                        return (
                                                            <tr
                                                                key={row.name}
                                                                className="transition-colors hover:bg-indigo-500/5"
                                                            >
                                                                <td className="px-5 py-3.5 font-bold text-slate-200">
                                                                    {row.name}
                                                                </td>
                                                                <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-400">
                                                                    {
                                                                        row.prevSets
                                                                    }
                                                                    ×
                                                                    {
                                                                        row.prevAvgWeight
                                                                    }
                                                                    kg×
                                                                    {
                                                                        row.prevAvgReps
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3.5 text-right font-mono text-xs font-extrabold text-white">
                                                                    {
                                                                        row.currSets
                                                                    }
                                                                    ×
                                                                    {
                                                                        row.currAvgWeight
                                                                    }
                                                                    kg×
                                                                    {
                                                                        row.currAvgReps
                                                                    }
                                                                </td>
                                                                <td
                                                                    className={`px-4 py-3.5 text-right text-xs font-bold ${diffColor(row.weightDiff)}`}
                                                                >
                                                                    {row.weightDiff >=
                                                                    0
                                                                        ? '+'
                                                                        : ''}
                                                                    {fmt(
                                                                        row.weightDiff,
                                                                    )}{' '}
                                                                    kg
                                                                </td>
                                                                <td
                                                                    className={`px-4 py-3.5 text-right text-xs font-bold ${diffColor(row.repsDiff)}`}
                                                                >
                                                                    {row.repsDiff >=
                                                                    0
                                                                        ? '+'
                                                                        : ''}
                                                                    {fmt(
                                                                        row.repsDiff,
                                                                    )}
                                                                </td>
                                                                <td
                                                                    className={`px-4 py-3.5 text-right text-xs font-bold ${diffColor(row.volumeDiff)}`}
                                                                >
                                                                    {row.volumeDiff >=
                                                                    0
                                                                        ? '+'
                                                                        : ''}
                                                                    {fmtVol(
                                                                        row.volumeDiff,
                                                                    )}{' '}
                                                                    kg
                                                                </td>
                                                                <td className="px-4 py-3.5 text-right">
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.bg} ${cfg.color}`}
                                                                    >
                                                                        {
                                                                            cfg.emoji
                                                                        }{' '}
                                                                        {
                                                                            cfg.label
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="divide-y divide-white/5 md:hidden">
                                            {exBreakdown.map((row) => {
                                                const cfg = statusConfig(
                                                    row.status,
                                                );

                                                return (
                                                    <div
                                                        key={row.name}
                                                        className="space-y-2 p-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold text-white">
                                                                {row.name}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.bg} ${cfg.color}`}
                                                            >
                                                                {cfg.emoji}{' '}
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-500 uppercase">
                                                                    Prev
                                                                </p>
                                                                <p className="font-mono text-slate-400">
                                                                    {
                                                                        row.prevSets
                                                                    }
                                                                    ×
                                                                    {
                                                                        row.prevAvgWeight
                                                                    }
                                                                    kg
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-500 uppercase">
                                                                    Curr
                                                                </p>
                                                                <p className="font-mono font-bold text-slate-100">
                                                                    {
                                                                        row.currSets
                                                                    }
                                                                    ×
                                                                    {
                                                                        row.currAvgWeight
                                                                    }
                                                                    kg
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-500 uppercase">
                                                                    Vol Δ
                                                                </p>
                                                                <p
                                                                    className={`font-bold ${diffColor(row.volumeDiff)}`}
                                                                >
                                                                    {row.volumeDiff >=
                                                                    0
                                                                        ? '+'
                                                                        : ''}
                                                                    {fmtVol(
                                                                        row.volumeDiff,
                                                                    )}{' '}
                                                                    kg
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {nExercises.length > 0 && (
                                            <div className="border-t border-white/10 bg-indigo-500/5 p-5">
                                                <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    New Exercises Added This
                                                    Week
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {nExercises.map((name) => (
                                                        <EdgeBadge
                                                            key={name}
                                                            text={`✦ ${name}`}
                                                            variant="neon"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </EdgeCard>
                        )}

                        {insights.length > 0 && (
                            <EdgeCard
                                variant="glass"
                                elevation="lg"
                                title="Performance Insights"
                                icon={
                                    <Sparkles className="h-5 w-5 text-indigo-400" />
                                }
                            >
                                <div className="grid grid-cols-1 gap-2.5">
                                    {insights.map((insight, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-slate-900/60 p-3.5 text-sm font-medium text-slate-200"
                                        >
                                            <div className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                                            <span>{insight}</span>
                                        </div>
                                    ))}
                                </div>
                            </EdgeCard>
                        )}
                    </>
                )}

                {selectedExerciseForProgress && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
                        <div className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                        <Dumbbell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-white">
                                            EXERCISE PROGRESS
                                        </h3>
                                        <p className="text-xs font-bold text-indigo-400">
                                            {selectedExerciseForProgress.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedExerciseForProgress(null)}
                                    className="p-1 text-slate-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/50 p-3 text-xs">
                                    <div>
                                        <span className="text-slate-400">Most Recent: </span>
                                        <span className="font-bold text-white">
                                            {selectedExerciseForProgress.setsCount} sets · {selectedExerciseForProgress.totalReps} reps
                                        </span>
                                    </div>
                                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-semibold text-indigo-300">
                                        {selectedExerciseForProgress.relativeDate}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Historical Performance
                                    </p>
                                    {selectedExerciseForProgress.history.length === 0 ? (
                                        <p className="text-xs text-slate-500">
                                            No previous sessions recorded.
                                        </p>
                                    ) : (
                                        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                                            {selectedExerciseForProgress.history.map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/30 px-3 py-2 text-xs"
                                                >
                                                    <span className="font-mono text-slate-300">
                                                        {h.date}
                                                    </span>
                                                    <span className="font-bold text-white">
                                                        {h.setsCount} sets · {h.totalReps} reps{' '}
                                                        {h.maxWeight ? `(${h.maxWeight} kg)` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <EdgeButton
                                    variant="subtle"
                                    onClick={() => setSelectedExerciseForProgress(null)}
                                    className="w-full justify-center"
                                >
                                    Close Progress View
                                </EdgeButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
