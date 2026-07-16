import { Head } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { useMemo, useState } from 'react';
import {
    BarChart2,
    TrendingUp,
    TrendingDown,
    Minus,
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
} from 'lucide-react';

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

interface WeeklyGraphPoint {
    weekKey: string;
    label: string;
    score: number;
}

interface AnalyticsProps {
    currentWeek: WeekData;
    previousWeek: WeekData;
    comparison: ComparisonData;
    exerciseBreakdown: ExerciseBreakdownRow[];
    weeklyGraph: WeeklyGraphPoint[];
    newExercises: string[];
    hasData: boolean;
    hasTwoWeeks: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TimeWindow = '4w' | '8w' | '12w' | 'all';
const WINDOWS: Record<TimeWindow, number> = { '4w': 4, '8w': 8, '12w': 12, 'all': Infinity };

function fmt(n: number, decimals = 1): string {
    return n.toFixed(decimals);
}

function fmtVol(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return v.toFixed(0);
}

function diffArrow(diff: number): string {
    if (diff > 0) return '▲';
    if (diff < 0) return '▼';
    return '▬';
}

function diffColor(diff: number): string {
    if (diff > 0) return 'text-emerald-400';
    if (diff < 0) return 'text-rose-400';
    return 'text-amber-400';
}

function statusConfig(status: 'improved' | 'maintained' | 'declined') {
    const configs = {
        improved:   { emoji: '🟢', label: 'Improved',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        maintained: { emoji: '🟡', label: 'Maintained', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
        declined:   { emoji: '🔴', label: 'Declined',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
    };
    return configs[status];
}

// ─── AI Insight generation: linear rule engine O(k) ─────────────────────────

interface InsightRule {
    check: (c: ComparisonData, b: ExerciseBreakdownRow[]) => boolean;
    message: (c: ComparisonData, b: ExerciseBreakdownRow[]) => string;
    icon: string;
}

function generateInsights(
    comparison: ComparisonData,
    breakdown: ExerciseBreakdownRow[],
    currentWeek: WeekData,
    previousWeek: WeekData,
): string[] {
    const rules: InsightRule[] = [
        {
            check:   (c) => c.progressPct > 5,
            message: (c) => `Overall weekly performance improved by ${fmt(c.progressPct)}% ▲`,
            icon: '🟢',
        },
        {
            check:   (c) => c.progressPct < -5,
            message: (c) => `Overall weekly performance declined by ${fmt(Math.abs(c.progressPct))}% ▼`,
            icon: '🔴',
        },
        {
            check:   (c) => Math.abs(c.progressPct) <= 5 && previousWeek.score > 0,
            message: () => `Your overall performance remained consistent this week ▬`,
            icon: '🟡',
        },
        {
            check:   (c) => c.volumeDiff > 0,
            message: (c) => `Total training volume increased by ${fmtVol(Math.abs(c.volumeDiff))} kg ▲`,
            icon: '💪',
        },
        {
            check:   (c) => c.volumeDiff < 0,
            message: (c) => `Total training volume decreased by ${fmtVol(Math.abs(c.volumeDiff))} kg ▼`,
            icon: '📉',
        },
        {
            check:   (c) => c.avgWeightDiff > 0,
            message: (c) => `Average weight lifted increased by ${fmt(c.avgWeightDiff)} kg ▲`,
            icon: '🏋️',
        },
        {
            check:   (c) => c.avgRepsDiff > 0,
            message: (c) => `Average reps per set increased by ${fmt(c.avgRepsDiff)} ▲`,
            icon: '🔢',
        },
        {
            check:   (c) => c.frequencyDiff > 0,
            message: (c) => `You completed ${Math.abs(c.frequencyDiff)} more workout${Math.abs(c.frequencyDiff) > 1 ? 's' : ''} than last week ▲`,
            icon: '📅',
        },
        {
            check:   (c) => c.frequencyDiff < 0,
            message: (c) => `You completed ${Math.abs(c.frequencyDiff)} fewer workout${Math.abs(c.frequencyDiff) > 1 ? 's' : ''} than last week ▼`,
            icon: '⚠️',
        },
        {
            check:   (_, b) => b.filter(r => r.status === 'improved').length > 0,
            message: (c) => `${c.improved} exercise${c.improved > 1 ? 's' : ''} showed improvement this week ▲`,
            icon: '📈',
        },
        {
            check:   (_, b) => b.filter(r => r.status === 'declined').length > 0,
            message: (c) => `${c.declined} exercise${c.declined > 1 ? 's' : ''} declined — focus on progressive overload ▼`,
            icon: '⚠️',
        },
        {
            check:   () => currentWeek.prCount > 0,
            message: () => `${currentWeek.prCount} new personal record${currentWeek.prCount > 1 ? 's' : ''} achieved this week 🏆`,
            icon: '🏆',
        },
    ];

    // Linear rule filter O(k) — bounded constant rules
    return rules
        .filter(r => r.check(comparison, breakdown))
        .map(r => `${r.icon} ${r.message(comparison, breakdown)}`);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const score = payload[0]?.value as number;
    return (
        <div className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 shadow-2xl">
            <p className="text-xs font-bold text-neutral-400 mb-1">{label}</p>
            <p className="text-xl font-black text-sky-400">{score.toFixed(1)}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Weekly Score</p>
        </div>
    );
}

// ─── Stat Delta Badge ─────────────────────────────────────────────────────────

function DeltaBadge({ diff, suffix = '' }: { diff: number; suffix?: string }) {
    const arrow = diffArrow(diff);
    const color = diffColor(diff);
    return (
        <span className={`text-xs font-bold ${color}`}>
            {arrow} {diff > 0 ? '+' : ''}{diff}{suffix}
        </span>
    );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
    icon,
    label,
    value,
    subValue,
    diff,
    diffSuffix,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    diff?: number;
    diffSuffix?: string;
    accent: string;
}) {
    return (
        <div className={`rounded-2xl border bg-neutral-900/60 p-5 space-y-3 ${accent}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</span>
                <div className="rounded-lg p-1.5 bg-neutral-800">{icon}</div>
            </div>
            <div>
                <p className="text-3xl font-black text-neutral-50 leading-none">{value}</p>
                {subValue && <p className="text-xs text-neutral-500 mt-1">{subValue}</p>}
            </div>
            {diff !== undefined && (
                <DeltaBadge diff={diff} suffix={diffSuffix} />
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage({
    currentWeek,
    previousWeek,
    comparison,
    exerciseBreakdown = [],
    weeklyGraph = [],
    newExercises = [],
    hasData = false,
    hasTwoWeeks = false,
}: AnalyticsProps) {
    const [activeWindow, setActiveWindow] = useState<TimeWindow>('8w');
    const [breakdownOpen, setBreakdownOpen] = useState(false);

    // O(k) — slice pre-sorted array from backend
    const chartData = useMemo(() => {
        const limit = WINDOWS[activeWindow];
        return limit === Infinity ? weeklyGraph : weeklyGraph.slice(-limit);
    }, [weeklyGraph, activeWindow]);

    // O(n) — single reduce pass for summary totals
    const summaryStats = useMemo(() => {
        return exerciseBreakdown.reduce(
            (acc, row) => ({
                totalSets:   acc.totalSets + row.currSets,
                totalReps:   acc.totalReps + Math.round(row.currAvgReps * row.currSets),
                totalVolume: acc.totalVolume + row.currVolume,
            }),
            { totalSets: 0, totalReps: 0, totalVolume: 0 }
        );
    }, [exerciseBreakdown]);

    // O(k) — linear rule engine
    const insights = useMemo(
        () => generateInsights(comparison, exerciseBreakdown, currentWeek, previousWeek),
        [comparison, exerciseBreakdown, currentWeek, previousWeek]
    );

    // Trend for chart based on last 2 data points
    const trend = useMemo(() => {
        if (chartData.length < 2) return 'neutral';
        const last = chartData[chartData.length - 1].score;
        const prev = chartData[chartData.length - 2].score;
        if (last > prev + 1) return 'up';
        if (last < prev - 1) return 'down';
        return 'flat';
    }, [chartData]);

    const statusCfg = statusConfig(comparison?.status ?? 'maintained');

    const trendColor =
        trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#f59e0b';

    // ── Empty State ────────────────────────────────────────────────────────────
    if (!hasData) {
        return (
            <>
                <Head title="Analytics" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20">
                        <BarChart2 className="h-8 w-8 text-sky-400" />
                    </div>
                    <div className="space-y-2 max-w-xs">
                        <h2 className="text-xl font-black text-neutral-100">No analytics yet</h2>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Complete at least one workout to start seeing your weekly performance analytics.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Analytics" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8 pb-24">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-neutral-50 flex items-center gap-3">
                        <BarChart2 className="h-7 w-7 text-sky-400" />
                        Analytics
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Your weekly performance overview — track, compare, and improve.
                    </p>
                </div>

                {/* ── Weekly Performance Line Graph ── */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-base font-bold text-neutral-100">Weekly Performance Score</h2>
                            <p className="text-xs text-neutral-500">
                                {trend === 'up' && <span className="text-emerald-400 font-bold">↗ Trending up</span>}
                                {trend === 'down' && <span className="text-rose-400 font-bold">↘ Trending down</span>}
                                {trend === 'flat' && <span className="text-amber-400 font-bold">→ Stable</span>}
                                {' '}· {chartData.length} week{chartData.length !== 1 ? 's' : ''} of data
                            </p>
                        </div>

                        {/* Time filter tabs */}
                        <div className="flex rounded-xl border border-neutral-800 bg-neutral-950/60 p-1 gap-1">
                            {(['4w', '8w', '12w', 'all'] as TimeWindow[]).map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setActiveWindow(w)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                                        activeWindow === w
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                            : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                                >
                                    {w === 'all' ? 'All' : w.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {chartData.length === 0 ? (
                        <div className="flex h-48 items-center justify-center text-sm text-neutral-600">
                            Not enough data for this time range
                        </div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={trendColor} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: '#525252', fontSize: 11, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        tick={{ fill: '#525252', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <ReferenceLine y={50} stroke="#404040" strokeDasharray="4 4" />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke={trendColor}
                                        strokeWidth={2.5}
                                        fill="url(#scoreGrad)"
                                        dot={{ fill: trendColor, r: 3, strokeWidth: 0 }}
                                        activeDot={{ fill: trendColor, r: 5, strokeWidth: 2, stroke: '#0a0a0a' }}
                                        animationDuration={600}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* ── Weekly Summary Cards ── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <SummaryCard
                        icon={<Activity className="h-4 w-4 text-sky-400" />}
                        label="Weekly Score"
                        value={fmt(currentWeek.score)}
                        subValue={`vs ${fmt(previousWeek.score)} last week`}
                        diff={parseFloat(fmt(comparison.progressPct))}
                        diffSuffix="%"
                        accent="border-sky-500/20"
                    />
                    <SummaryCard
                        icon={<Dumbbell className="h-4 w-4 text-violet-400" />}
                        label="Workouts"
                        value={currentWeek.workouts}
                        subValue={`${previousWeek.workouts} last week`}
                        diff={comparison.frequencyDiff}
                        accent="border-violet-500/20"
                    />
                    <SummaryCard
                        icon={<Zap className="h-4 w-4 text-amber-400" />}
                        label="Volume"
                        value={`${fmtVol(currentWeek.totalVolume)} kg`}
                        subValue={`${fmtVol(previousWeek.totalVolume)} kg last week`}
                        diff={parseFloat((comparison.volumeDiff / 1000).toFixed(1))}
                        diffSuffix="k kg"
                        accent="border-amber-500/20"
                    />
                    <SummaryCard
                        icon={<Trophy className="h-4 w-4 text-rose-400" />}
                        label="PRs This Week"
                        value={currentWeek.prCount}
                        subValue="personal records"
                        accent="border-rose-500/20"
                    />
                </div>

                {/* ── Weekly Summary Detail Card ── */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Week Summary</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: 'Exercises',  value: currentWeek.exercises },
                            { label: 'Total Sets',  value: currentWeek.totalSets },
                            { label: 'Total Reps',  value: currentWeek.totalReps },
                            { label: 'Volume (kg)', value: fmtVol(currentWeek.totalVolume) },
                        ].map(({ label, value }) => (
                            <div key={label} className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{label}</p>
                                <p className="text-2xl font-black text-neutral-100">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Weekly Comparison Panel ── */}
                {hasTwoWeeks && (
                    <div className={`rounded-2xl border p-5 space-y-5 ${statusCfg.bg}`}>
                        {/* Status header */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`text-3xl font-black ${statusCfg.color}`}>
                                    {statusCfg.emoji} {statusCfg.label}
                                </div>
                                <span className={`text-xl font-black ${statusCfg.color}`}>
                                    {comparison.progressPct > 0 ? '+' : ''}{fmt(comparison.progressPct)}%
                                </span>
                            </div>
                            <div className="flex gap-3 text-xs">
                                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 font-bold text-emerald-400">
                                    ▲ {comparison.improved} improved
                                </span>
                                <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-bold text-amber-400">
                                    ▬ {comparison.maintained} maintained
                                </span>
                                <span className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 font-bold text-rose-400">
                                    ▼ {comparison.declined} declined
                                </span>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                {
                                    label: 'Volume Diff',
                                    value: `${comparison.volumeDiff >= 0 ? '+' : ''}${fmtVol(comparison.volumeDiff)} kg`,
                                    diff: comparison.volumeDiff,
                                },
                                {
                                    label: 'Avg Weight Δ',
                                    value: `${comparison.avgWeightDiff >= 0 ? '+' : ''}${fmt(comparison.avgWeightDiff)} kg`,
                                    diff: comparison.avgWeightDiff,
                                },
                                {
                                    label: 'Avg Reps Δ',
                                    value: `${comparison.avgRepsDiff >= 0 ? '+' : ''}${fmt(comparison.avgRepsDiff)}`,
                                    diff: comparison.avgRepsDiff,
                                },
                                {
                                    label: 'Workouts Δ',
                                    value: `${comparison.frequencyDiff >= 0 ? '+' : ''}${comparison.frequencyDiff}`,
                                    diff: comparison.frequencyDiff,
                                },
                            ].map(({ label, value, diff }) => (
                                <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{label}</p>
                                    <p className={`text-xl font-black ${diffColor(diff)}`}>{value}</p>
                                    <div className="flex items-center gap-1">
                                        {diff > 0
                                            ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                                            : diff < 0
                                                ? <ArrowDownRight className="h-3 w-3 text-rose-400" />
                                                : <Minus className="h-3 w-3 text-amber-400" />
                                        }
                                        <span className={`text-[10px] font-bold ${diffColor(diff)}`}>
                                            {diff > 0 ? 'Up' : diff < 0 ? 'Down' : 'No change'} vs last week
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Exercise Breakdown ── */}
                {exerciseBreakdown.length > 0 && (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                        <button
                            onClick={() => setBreakdownOpen(o => !o)}
                            className="flex w-full items-center justify-between p-5 text-left hover:bg-neutral-800/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Target className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <h2 className="text-base font-bold text-neutral-100">Exercise Breakdown</h2>
                                    <p className="text-xs text-neutral-500">{exerciseBreakdown.length} exercises compared</p>
                                </div>
                            </div>
                            {breakdownOpen
                                ? <ChevronUp className="h-5 w-5 text-neutral-500" />
                                : <ChevronDown className="h-5 w-5 text-neutral-500" />
                            }
                        </button>

                        {breakdownOpen && (
                            <div className="border-t border-neutral-800">
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                                                <th className="px-5 py-3 text-left">Exercise</th>
                                                <th className="px-4 py-3 text-right">Prev Wk</th>
                                                <th className="px-4 py-3 text-right">Curr Wk</th>
                                                <th className="px-4 py-3 text-right">Weight Δ</th>
                                                <th className="px-4 py-3 text-right">Reps Δ</th>
                                                <th className="px-4 py-3 text-right">Volume Δ</th>
                                                <th className="px-4 py-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exerciseBreakdown.map((row) => {
                                                const cfg = statusConfig(row.status);
                                                return (
                                                    <tr key={row.name} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                                        <td className="px-5 py-3 font-semibold text-neutral-200">{row.name}</td>
                                                        <td className="px-4 py-3 text-right text-neutral-400 font-mono text-xs">
                                                            {row.prevSets}×{row.prevAvgWeight}kg×{row.prevAvgReps}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-neutral-200 font-mono text-xs font-bold">
                                                            {row.currSets}×{row.currAvgWeight}kg×{row.currAvgReps}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold text-xs ${diffColor(row.weightDiff)}`}>
                                                            {row.weightDiff >= 0 ? '+' : ''}{fmt(row.weightDiff)} kg
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold text-xs ${diffColor(row.repsDiff)}`}>
                                                            {row.repsDiff >= 0 ? '+' : ''}{fmt(row.repsDiff)}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold text-xs ${diffColor(row.volumeDiff)}`}>
                                                            {row.volumeDiff >= 0 ? '+' : ''}{fmtVol(row.volumeDiff)} kg
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.bg} ${cfg.color}`}>
                                                                {cfg.emoji} {cfg.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-neutral-800">
                                    {exerciseBreakdown.map((row) => {
                                        const cfg = statusConfig(row.status);
                                        return (
                                            <div key={row.name} className="p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-neutral-100 text-sm">{row.name}</span>
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.emoji} {cfg.label}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-neutral-600 font-bold uppercase text-[9px] tracking-wide">Prev</p>
                                                        <p className="text-neutral-400 font-mono">{row.prevSets}×{row.prevAvgWeight}kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-600 font-bold uppercase text-[9px] tracking-wide">Curr</p>
                                                        <p className="text-neutral-200 font-mono font-bold">{row.currSets}×{row.currAvgWeight}kg</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-neutral-600 font-bold uppercase text-[9px] tracking-wide">Vol Δ</p>
                                                        <p className={`font-bold ${diffColor(row.volumeDiff)}`}>
                                                            {row.volumeDiff >= 0 ? '+' : ''}{fmtVol(row.volumeDiff)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* New exercises section */}
                                {newExercises.length > 0 && (
                                    <div className="border-t border-neutral-800 p-5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-3">
                                            New This Week (not compared)
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {newExercises.map(name => (
                                                <span key={name} className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400">
                                                    ✦ {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── AI Performance Insights ── */}
                {insights.length > 0 && (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-sky-400" />
                            <h2 className="text-base font-bold text-neutral-100">Performance Insights</h2>
                        </div>
                        <ul className="space-y-2.5">
                            {insights.map((insight, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-300 leading-relaxed"
                                >
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── No comparison data notice ── */}
                {hasData && !hasTwoWeeks && (
                    <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 py-10 text-center space-y-2">
                        <TrendingUp className="mx-auto h-8 w-8 text-neutral-600" />
                        <p className="text-sm font-bold text-neutral-400">Complete workouts in two different weeks</p>
                        <p className="text-xs text-neutral-600">Week-over-week comparison will appear once you have data for two consecutive weeks.</p>
                    </div>
                )}

            </div>
        </>
    );
}

AnalyticsPage.layout = {
    breadcrumbs: [
        {
            title: 'Analytics',
            href: '/Analytics',
        },
    ],
};
