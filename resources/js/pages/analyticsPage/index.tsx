import { Head } from '@inertiajs/react';
import {
    BarChart2,
    Sparkles,
    Dumbbell,
    Trophy,
    Zap,
    Activity,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
    EdgeHeader,
    EdgeStat,
    EdgeCard,
    EdgeGrid,
    EdgeBadge,
} from '@/lib/edge/engine';

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

type TimeWindow = '4w' | '8w' | '12w' | 'all';
const WINDOWS: Record<TimeWindow, number> = { '4w': 4, '8w': 8, '12w': 12, 'all': Infinity };

function fmt(n: number, decimals = 1): string {
    return (n || 0).toFixed(decimals);
}

function fmtVol(v: number): string {
    const val = v || 0;

    if (Math.abs(val) >= 1000) {
return `${(val / 1000).toFixed(1)}k`;
}

    return val.toFixed(0);
}

function generateInsights(
    comparison: ComparisonData,
    currentWeek: WeekData,
): string[] {
    if (!comparison) {
return [];
}

    const insights: string[] = [];

    if (comparison.progressPct > 5) {
        insights.push(`🟢 Overall weekly performance improved by ${fmt(comparison.progressPct)}% ▲`);
    } else if (comparison.progressPct < -5) {
        insights.push(`🔴 Overall weekly performance declined by ${fmt(Math.abs(comparison.progressPct))}% ▼`);
    }

    if (comparison.volumeDiff > 0) {
        insights.push(`💪 Training volume increased by ${fmtVol(Math.abs(comparison.volumeDiff))} kg ▲`);
    } else if (comparison.volumeDiff < 0) {
        insights.push(`📉 Training volume decreased by ${fmtVol(Math.abs(comparison.volumeDiff))} kg ▼`);
    }

    if (comparison.improved > 0) {
        insights.push(`📈 ${comparison.improved} exercise${comparison.improved > 1 ? 's' : ''} set new progress benchmarks`);
    }

    if (currentWeek?.prCount > 0) {
        insights.push(`🏆 ${currentWeek.prCount} personal record${currentWeek.prCount > 1 ? 's' : ''} achieved this week`);
    }

    return insights;
}

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) {
return null;
}

    const score = payload[0]?.value as number;

    return (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 backdrop-blur-md px-4 py-3 shadow-2xl">
            <p className="text-xs font-bold text-slate-400 mb-0.5">{label}</p>
            <p className="text-2xl font-black text-indigo-400 tracking-tight">{score.toFixed(1)}</p>
            <p className="text-[10px] text-slate-500">EDGE Analytics Score</p>
        </div>
    );
}

export default function AnalyticsPage({
    currentWeek = { label: '', score: 0, workouts: 0, exercises: 0, totalSets: 0, totalReps: 0, totalVolume: 0, prCount: 0 },
    previousWeek = { label: '', score: 0, workouts: 0, exercises: 0, totalSets: 0, totalReps: 0, totalVolume: 0, prCount: 0 },
    comparison = { progressPct: 0, volumeDiff: 0, avgWeightDiff: 0, avgRepsDiff: 0, frequencyDiff: 0, improved: 0, maintained: 0, declined: 0, status: 'maintained' },
    weeklyGraph = [],
    hasData = false,
}: AnalyticsProps) {
    const [activeWindow, setActiveWindow] = useState<TimeWindow>('8w');

    const chartData = useMemo(() => {
        const limit = WINDOWS[activeWindow];

        return limit === Infinity ? weeklyGraph : weeklyGraph.slice(-limit);
    }, [weeklyGraph, activeWindow]);

    const insights = useMemo(
        () => generateInsights(comparison, currentWeek),
        [comparison, currentWeek]
    );

    const trend = useMemo(() => {
        if (chartData.length < 2) {
return 'neutral';
}

        const last = chartData[chartData.length - 1].score;
        const prev = chartData[chartData.length - 2].score;

        if (last > prev + 1) {
return 'up';
}

        if (last < prev - 1) {
return 'down';
}

        return 'flat';
    }, [chartData]);

    const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#818cf8';

    return (
        <>
            <Head title="Analytics - Ascend EDGE" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
                <EdgeHeader
                    title="Performance Analytics"
                    subtitle="Advanced volume metrics, progress breakdown, and weekly trend analysis."
                    icon={<BarChart2 className="h-7 w-7 text-indigo-400" />}
                />

                {!hasData ? (
                    <EdgeCard variant="glass" className="py-20 text-center flex flex-col items-center">
                        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4">
                            <BarChart2 className="h-10 w-10 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white">No analytics recorded</h2>
                        <p className="text-sm text-slate-400 max-w-md mt-2">
                            Log workouts to generate volume progression graphs and performance comparisons.
                        </p>
                    </EdgeCard>
                ) : (
                    <>
                        <EdgeCard
                            variant="glass"
                            elevation="lg"
                            glow
                            title={
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span>Weekly Performance Index</span>
                                        <EdgeBadge text={`${chartData.length} WEEKS`} variant="accent" />
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        {trend === 'up' && <span className="text-emerald-400 font-bold">↗ Trending Up</span>}
                                        {trend === 'down' && <span className="text-rose-400 font-bold">↘ Trending Down</span>}
                                        {trend === 'flat' && <span className="text-indigo-400 font-bold">→ Stable Trajectory</span>}
                                    </p>
                                </div>
                            }
                            headerAction={
                                <div className="flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 gap-1">
                                    {(['4w', '8w', '12w', 'all'] as TimeWindow[]).map((w) => (
                                        <button
                                            key={w}
                                            onClick={() => setActiveWindow(w)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                                                activeWindow === w
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {w === 'all' ? 'All' : w.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            <div className="h-64 pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -24 }}>
                                        <defs>
                                            <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                                        <Area type="monotone" dataKey="score" stroke={trendColor} strokeWidth={3} fill="url(#analyticsGrad)" dot={{ fill: trendColor, r: 4 }} activeDot={{ fill: '#fff', r: 6, stroke: trendColor }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </EdgeCard>

                        <EdgeGrid columns="responsive" gap="md">
                            <EdgeStat
                                title="Performance Score"
                                value={fmt(currentWeek.score)}
                                subValue={`vs ${fmt(previousWeek.score)} prev`}
                                trend={{
                                    value: `${comparison.progressPct > 0 ? '+' : ''}${fmt(comparison.progressPct)}%`,
                                    direction: comparison.progressPct > 0 ? 'up' : comparison.progressPct < 0 ? 'down' : 'neutral',
                                    label: 'vs last week',
                                }}
                                icon={<Activity className="h-5 w-5 text-indigo-400" />}
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Total Workouts"
                                value={currentWeek.workouts}
                                subValue={`${previousWeek.workouts} prev`}
                                trend={{
                                    value: `${comparison.frequencyDiff >= 0 ? '+' : ''}${comparison.frequencyDiff}`,
                                    direction: comparison.frequencyDiff > 0 ? 'up' : comparison.frequencyDiff < 0 ? 'down' : 'neutral',
                                    label: 'sessions',
                                }}
                                icon={<Dumbbell className="h-5 w-5 text-purple-400" />}
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Volume Lifted"
                                value={`${fmtVol(currentWeek.totalVolume)} kg`}
                                subValue={`${fmtVol(previousWeek.totalVolume)} kg prev`}
                                trend={{
                                    value: `${comparison.volumeDiff >= 0 ? '+' : ''}${fmtVol(comparison.volumeDiff)} kg`,
                                    direction: comparison.volumeDiff > 0 ? 'up' : comparison.volumeDiff < 0 ? 'down' : 'neutral',
                                    label: 'volume Δ',
                                }}
                                icon={<Zap className="h-5 w-5 text-amber-400" />}
                                variant="glass"
                                elevation="lg"
                            />

                            <EdgeStat
                                title="Personal Records"
                                value={currentWeek.prCount}
                                subValue="PRs this week"
                                badge={currentWeek.prCount > 0 ? { text: 'MILESTONE', variant: 'neon' } : undefined}
                                icon={<Trophy className="h-5 w-5 text-rose-400" />}
                                variant="glass"
                                elevation="lg"
                            />
                        </EdgeGrid>

                        {insights.length > 0 && (
                            <EdgeCard
                                variant="glass"
                                elevation="lg"
                                title="AI Analytics Insights"
                                icon={<Sparkles className="h-5 w-5 text-indigo-400" />}
                            >
                                <div className="grid grid-cols-1 gap-2.5">
                                    {insights.map((insight, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-slate-900/60 p-3.5 text-sm text-slate-200 font-medium"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                            <span>{insight}</span>
                                        </div>
                                    ))}
                                </div>
                            </EdgeCard>
                        )}
                    </>
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
