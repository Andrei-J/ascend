import { Dumbbell, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { EdgeCard, EdgeBadge } from '@/lib/edge/engine';

export interface ExerciseSession {
    session_id: number;
    workout_name: string;
    date: string;
    fullDate: string;
    isoDate: string;
    setsCount: number;
    totalReps: number;
    maxReps: number;
    volume: number;
    setsDetail: number[];
    weightDetail: number[];
}

export interface ExerciseProgressItem {
    exercise_id: number | null;
    name: string;
    isBodyweight: boolean;
    sessions: ExerciseSession[];
}

interface ExerciseProgressCardProps {
    exerciseProgressData?: ExerciseProgressItem[];
}

type MetricType = 'totalReps' | 'maxReps' | 'volume';

export default function ExerciseProgressCard({
    exerciseProgressData = [],
}: ExerciseProgressCardProps) {
    const [selectedName, setSelectedName] = useState<string>(
        exerciseProgressData[0]?.name || '',
    );
    const [metric, setMetric] = useState<MetricType>('totalReps');
    const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

    // Active Exercise
    const currentExercise = useMemo(() => {
        if (!selectedName && exerciseProgressData.length > 0) {
            return exerciseProgressData[0];
        }

        return (
            exerciseProgressData.find((ex) => ex.name === selectedName) ||
            exerciseProgressData[0] ||
            null
        );
    }, [selectedName, exerciseProgressData]);

    const sessions = useMemo(
        () => currentExercise?.sessions || [],
        [currentExercise],
    );

    // Dynamic SVG Line Graph Calculations
    const graphData = useMemo(() => {
        if (!sessions || sessions.length === 0) {
            return null;
        }

        const values = sessions.map((s) => {
            if (metric === 'maxReps') {
                return s.maxReps;
            }

            if (metric === 'volume') {
                return s.volume;
            }

            return s.totalReps;
        });

        const maxVal = Math.max(...values, 1);

        const width = 500;
        const height = 200;
        const paddingLeft = 45;
        const paddingRight = 25;
        const paddingTop = 25;
        const paddingBottom = 35;
        const graphW = width - paddingLeft - paddingRight;
        const graphH = height - paddingTop - paddingBottom;

        const points = values.map((val, i) => {
            const x =
                sessions.length === 1
                    ? paddingLeft + graphW / 2
                    : paddingLeft + (i / (sessions.length - 1)) * graphW;
            const y = paddingTop + graphH - (val / maxVal) * graphH;

            return { x, y, val, session: sessions[i] };
        });

        // Path generator
        let pathD = '';

        if (points.length === 1) {
            pathD = `M ${points[0].x} ${points[0].y}`;
        } else if (points.length > 1) {
            pathD = `M ${points[0].x} ${points[0].y}`;

            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const cpX1 = prev.x + (curr.x - prev.x) / 2;
                const cpY1 = prev.y;
                const cpX2 = prev.x + (curr.x - prev.x) / 2;
                const cpY2 = curr.y;

                pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
            }
        }

        // Area path generator (for background glow under line)
        let areaD = '';

        if (points.length > 1) {
            const lastPt = points[points.length - 1];
            const firstPt = points[0];

            areaD = `${pathD} L ${lastPt.x} ${paddingTop + graphH} L ${firstPt.x} ${paddingTop + graphH} Z`;
        }

        // Y-axis ticks
        const yTicks = [
            { val: maxVal, y: paddingTop },
            { val: Math.round(maxVal / 2), y: paddingTop + graphH / 2 },
            { val: 0, y: paddingTop + graphH },
        ];

        return {
            width,
            height,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
            graphW,
            graphH,
            points,
            pathD,
            areaD,
            yTicks,
            maxVal,
        };
    }, [sessions, metric]);

    // Progression Metrics Calculation
    const summary = useMemo(() => {
        if (!sessions || sessions.length === 0) {
            return null;
        }

        const latest = sessions[sessions.length - 1];
        const prev = sessions.length > 1 ? sessions[sessions.length - 2] : null;

        const getMetricVal = (s: ExerciseSession) => {
            if (metric === 'maxReps') {
                return s.maxReps;
            }

            if (metric === 'volume') {
                return s.volume;
            }

            return s.totalReps;
        };

        const unit = metric === 'volume' ? 'kg' : 'reps';
        const currentVal = getMetricVal(latest);

        if (!prev) {
            return {
                currentVal,
                unit,
                hasComparison: false,
                diffText: 'First recorded workout',
                pctText: null,
                isPositive: true,
            };
        }

        const prevVal = getMetricVal(prev);
        const diff = currentVal - prevVal;
        const pct = prevVal > 0 ? ((diff / prevVal) * 100).toFixed(1) : '0';
        const isPositive = diff >= 0;

        return {
            currentVal,
            prevVal,
            unit,
            hasComparison: true,
            diff,
            diffText: `${diff >= 0 ? '+' : ''}${diff} ${unit}`,
            pctText: `${diff >= 0 ? '+' : ''}${pct}%`,
            isPositive,
        };
    }, [sessions, metric]);

    const unitLabel = metric === 'volume' ? 'kg' : 'reps';

    return (
        <EdgeCard variant="glass" elevation="md" className="space-y-5">
            {/* Header: Title + Exercise Selector Dropdown */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold tracking-tight text-white uppercase">
                            EXERCISE PROGRESS
                        </h2>
                        <p className="text-xs text-slate-400">
                            Track performance progression over completed workouts
                        </p>
                    </div>
                </div>

                {exerciseProgressData.length > 0 && (
                    <Select
                        value={currentExercise?.name || selectedName}
                        onValueChange={(val) => setSelectedName(val)}
                    >
                        <SelectTrigger className="h-10 w-full min-w-[200px] rounded-xl border border-indigo-500/30 bg-slate-900/90 px-3.5 text-xs font-bold text-indigo-200 outline-none transition-all hover:border-indigo-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer shadow-lg">
                            <SelectValue placeholder="Select exercise..." />
                        </SelectTrigger>
                        <SelectContent className="z-[60] border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl">
                            {exerciseProgressData.map((ex) => (
                                <SelectItem
                                    key={ex.name}
                                    value={ex.name}
                                    className="cursor-pointer text-xs font-semibold text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                >
                                    {ex.name} ({ex.sessions.length} {ex.sessions.length === 1 ? 'workout' : 'workouts'})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Empty State if No Data */}
            {!currentExercise || sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-500">
                        <Dumbbell className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">
                        No workout history for this exercise yet.
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                        Complete a workout session including this exercise to generate progression analytics.
                    </p>
                </div>
            ) : (
                <>
                    {/* Metric Switcher Pills */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/60 p-1">
                            <button
                                type="button"
                                onClick={() => setMetric('totalReps')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    metric === 'totalReps'
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Total Reps
                            </button>
                            <button
                                type="button"
                                onClick={() => setMetric('maxReps')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    metric === 'maxReps'
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Max Reps
                            </button>
                            {!currentExercise.isBodyweight && (
                                <button
                                    type="button"
                                    onClick={() => setMetric('volume')}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                        metric === 'volume'
                                            ? 'bg-indigo-500 text-white shadow-md'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Volume
                                </button>
                            )}
                        </div>

                        {summary && summary.hasComparison && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Progression:</span>
                                <EdgeBadge
                                    text={summary.pctText || summary.diffText}
                                    variant={summary.isPositive ? 'success' : 'danger'}
                                    glow
                                />
                            </div>
                        )}
                    </div>

                    {/* Main Line Graph SVG */}
                    {graphData && (
                        <div className="relative w-full rounded-2xl border border-white/5 bg-slate-950/70 p-3 pt-5 backdrop-blur-sm">
                            <svg
                                viewBox={`0 0 ${graphData.width} ${graphData.height}`}
                                className="w-full h-auto overflow-visible"
                            >
                                <defs>
                                    <linearGradient
                                        id="lineGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="50%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                    <linearGradient
                                        id="areaGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="0%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Y-Axis Grid Lines & Ticks */}
                                {graphData.yTicks.map((tick, idx) => (
                                    <g key={idx}>
                                        <line
                                            x1={graphData.paddingLeft}
                                            y1={tick.y}
                                            x2={graphData.width - graphData.paddingRight}
                                            y2={tick.y}
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeDasharray="4 4"
                                        />
                                        <text
                                            x={graphData.paddingLeft - 8}
                                            y={tick.y + 4}
                                            textAnchor="end"
                                            className="fill-slate-500 text-[10px] font-mono font-bold"
                                        >
                                            {tick.val}
                                        </text>
                                    </g>
                                ))}

                                {/* Area Under Line */}
                                {graphData.areaD && (
                                    <path
                                        d={graphData.areaD}
                                        fill="url(#areaGradient)"
                                    />
                                )}

                                {/* Line Path */}
                                {graphData.pathD && (
                                    <path
                                        d={graphData.pathD}
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {/* Interactive Data Points */}
                                {graphData.points.map((pt, i) => {
                                    const isHovered = hoveredPointIndex === i;

                                    return (
                                        <g key={i}>
                                            {/* Pulse Ring on Hover */}
                                            {isHovered && (
                                                <circle
                                                    cx={pt.x}
                                                    cy={pt.y}
                                                    r="10"
                                                    className="fill-indigo-500/30 animate-ping"
                                                />
                                            )}
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={isHovered ? '7' : '5'}
                                                className="fill-indigo-400 stroke-slate-900 stroke-2 cursor-pointer transition-all duration-200 hover:fill-rose-400"
                                                onMouseEnter={() => setHoveredPointIndex(i)}
                                                onMouseLeave={() => setHoveredPointIndex(null)}
                                                onClick={() => setHoveredPointIndex(i)}
                                            />
                                            {/* X-Axis Date Labels */}
                                            <text
                                                x={pt.x}
                                                y={graphData.height - 8}
                                                textAnchor="middle"
                                                className={`text-[10px] font-semibold transition-colors ${
                                                    isHovered
                                                        ? 'fill-indigo-300 font-bold'
                                                        : 'fill-slate-500'
                                                }`}
                                            >
                                                {pt.session.date}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Point Detail Tooltip Box */}
                            {hoveredPointIndex !== null &&
                                graphData.points[hoveredPointIndex] && (
                                <div className="mt-3 rounded-xl border border-indigo-500/30 bg-slate-900/95 p-3 text-xs shadow-xl animate-in fade-in zoom-in-95 duration-150">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                                        <span className="font-mono font-bold text-indigo-300">
                                            {graphData.points[hoveredPointIndex].session.date} ({graphData.points[hoveredPointIndex].session.workout_name})
                                        </span>
                                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-black text-indigo-200">
                                            {graphData.points[hoveredPointIndex].val} {unitLabel}
                                        </span>
                                    </div>
                                    <div className="mt-2 space-y-1 text-slate-300">
                                        <p className="text-[11px]">
                                            <span className="text-slate-400">Sets completed: </span>
                                            <span className="font-bold text-white">
                                                {graphData.points[hoveredPointIndex].session.setsCount} sets
                                            </span>
                                        </p>
                                        <p className="text-[11px] font-mono text-slate-400">
                                            Sets Breakdown: {graphData.points[hoveredPointIndex].session.setsDetail.map((r, idx) => {
                                                const w = graphData.points[hoveredPointIndex].session.weightDetail[idx];

                                                return w > 0 ? `${w}kg×${r}` : `${r} reps`;
                                            }).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary Row Below Graph */}
                    {summary && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-1">
                            <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    CURRENT WORKOUT
                                </p>
                                <p className="mt-0.5 text-lg font-black text-white">
                                    {summary.currentVal} {summary.unit}
                                </p>
                            </div>

                            {summary.hasComparison ? (
                                <>
                                    <div className="rounded-xl border border-white/5 bg-slate-900/70 p-3">
                                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            PREVIOUS WORKOUT
                                        </p>
                                        <p className="mt-0.5 text-lg font-black text-slate-300">
                                            {summary.prevVal} {summary.unit}
                                        </p>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-white/5 bg-slate-900/70 p-3">
                                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            PROGRESSION
                                        </p>
                                        <p
                                            className={`mt-0.5 text-lg font-black ${
                                                summary.isPositive
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400'
                                            }`}
                                        >
                                            {summary.diffText}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-1 sm:col-span-2 rounded-xl border border-white/5 bg-slate-900/70 p-3 flex items-center justify-center text-center">
                                    <p className="text-xs font-bold text-indigo-300">
                                        ✦ First recorded workout session for {currentExercise.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </EdgeCard>
    );
}
