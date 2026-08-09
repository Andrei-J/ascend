import {
    ChevronDown,
    ChevronUp,
    Clock,
    Plus,
    Trash2,
    X,
    Search,
    AlertTriangle,
    Check,
    Dumbbell,
    Timer,
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useWorkout } from '@/hooks/use-workout';

// ─── Rest Timer Modal ───────────────────────────────────────────────────────

function RestTimerModal({
    remaining,
    total,
    exerciseName,
    setNumber,
    totalTime,
    isPaused,
    onSkip,
    onAdjust,
    onPause,
    onResume,
    onReset,
    onSkipTimer,
}: {
    remaining: number;
    total: number;
    exerciseName: string;
    setNumber: number;
    totalTime: number;
    isPaused: boolean;
    onSkip: () => void;
    onAdjust: (seconds: number) => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onSkipTimer: () => void;
}) {
    const SIZE = 220;
    const STROKE = 10;
    const RADIUS = (SIZE - STROKE) / 2;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const progress = Math.max(0, Math.min(1, remaining / total));
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    const ringColor = '#84cc16'; // lime-500
    const glowColor = 'rgba(132,204,22,0.15)';

    const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const formatTotalTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const pad = (num: number) => String(num).padStart(2, '0');

        if (hrs > 0) {
            return `${hrs}:${pad(mins)}:${pad(secs)}`;
        }

        return `${pad(mins)}:${pad(secs)}`;
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Blurred backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
                onClick={onSkip}
            />

            {/* Panel */}
            <div
                className="relative z-10 w-full max-w-sm rounded-3xl border border-emerald-950/40 bg-[#0c1917] px-6 pt-6 pb-8 text-neutral-100 shadow-2xl"
                style={{
                    animation:
                        'slideUpPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
            >
                {/* Header line with Exercise name & dismiss X */}
                <div className="mb-4 flex items-center justify-between border-b border-emerald-950/30 pb-2">
                    <span className="max-w-[80%] truncate text-[10px] font-black tracking-[0.25em] text-neutral-400 uppercase">
                        {exerciseName}
                    </span>
                    <button
                        type="button"
                        onClick={onSkip}
                        className="hover:text-neutral-350 cursor-pointer p-1 text-neutral-500 transition-colors"
                        title="Close Rest Timer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Circular countdown */}
                <div className="mb-6 flex justify-center">
                    <div
                        className="relative"
                        style={{ width: SIZE, height: SIZE }}
                    >
                        {/* Glow */}
                        <div
                            className="absolute inset-0 rounded-full transition-all duration-1000"
                            style={{ boxShadow: `0 0 35px 4px ${glowColor}` }}
                        />

                        <svg
                            width={SIZE}
                            height={SIZE}
                            style={{ transform: 'rotate(-90deg)' }}
                        >
                            {/* Track (dark forest green) */}
                            <circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke="#1c2d27"
                                strokeWidth={STROKE}
                            />
                            {/* Progress arc (bright green) */}
                            <circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke={ringColor}
                                strokeWidth={STROKE}
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={dashOffset}
                                style={{
                                    transition:
                                        'stroke-dashoffset 1s linear, stroke 1s ease',
                                }}
                            />
                        </svg>

                        {/* Center time digits */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span
                                className="font-mono leading-none font-black tracking-tight tabular-nums"
                                style={{
                                    fontSize: '3.25rem',
                                    color: ringColor,
                                    textShadow: `0 0 15px ${glowColor}`,
                                }}
                            >
                                {formattedTimer}
                            </span>
                        </div>
                    </div>
                </div>

                {/* "Rest" label in green */}
                <div className="mb-6 text-center text-xl font-extrabold tracking-wider text-[#84cc16] uppercase">
                    Rest
                </div>

                {/* Info block: Sets / Total Time */}
                <div className="mx-auto mb-8 w-full max-w-[240px] space-y-3 border-y border-emerald-950/20 py-4 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="font-bold tracking-widest text-neutral-400">
                            SETS
                        </span>
                        <span className="font-mono text-sm font-bold text-neutral-200">
                            {setNumber}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-bold tracking-widest text-neutral-400">
                            TOTAL TIME
                        </span>
                        <span className="font-mono text-sm font-bold text-neutral-200">
                            {formatTotalTime(totalTime)}
                        </span>
                    </div>
                </div>

                {/* Adjust buttons: -30 / +30 */}
                <div className="mb-5 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => onAdjust(-30)}
                        className="cursor-pointer rounded-xl border border-emerald-900/45 bg-neutral-900/60 px-4 py-2 text-xs font-black text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
                        title="Subtract 30 seconds"
                    >
                        -30s
                    </button>
                    <button
                        type="button"
                        onClick={() => onAdjust(30)}
                        className="cursor-pointer rounded-xl border border-emerald-900/45 bg-neutral-900/60 px-4 py-2 text-xs font-black text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
                        title="Add 30 seconds"
                    >
                        +30s
                    </button>
                </div>

                {/* Control buttons: PAUSE / RESET */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={isPaused ? onResume : onPause}
                        className="hover:bg-yellow-350 flex-1 cursor-pointer rounded-xl bg-yellow-400 py-3 text-xs font-black tracking-wider text-neutral-950 uppercase shadow-md transition-all active:scale-[0.97]"
                    >
                        {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="hover:bg-yellow-350 flex-1 cursor-pointer rounded-xl bg-yellow-400 py-3 text-xs font-black tracking-wider text-neutral-950 uppercase shadow-md transition-all active:scale-[0.97]"
                    >
                        RESET
                    </button>
                </div>

                {/* Skip Rest text button */}
                <button
                    type="button"
                    onClick={() => {
                        onSkipTimer();
                        onSkip();
                    }}
                    className="hover:text-neutral-350 mt-5 w-full cursor-pointer text-center text-xs font-bold tracking-widest text-neutral-500 uppercase transition-colors"
                >
                    Skip Rest
                </button>
            </div>

            <style>{`
                @keyframes slideUpPop {
                    from { opacity: 0; transform: translateY(40px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
            `}</style>
        </div>,
        document.body,
    );
}

interface ExerciseLibraryItem {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
    restSeconds?: number;
}

export function ActiveWorkoutPanel() {
    const {
        isActive,
        isExpanded,
        name,
        exercises,
        elapsedSeconds,
        activeRest,
        setIsExpanded,
        updateWorkoutName,
        addActiveExercise,
        removeActiveExercise,
        addActiveSet,
        removeActiveSet,
        updateActiveSet,
        toggleSetCompleted,
        updateExerciseRest,
        adjustActiveRest,
        skipActiveRest,
        pauseActiveRest,
        resumeActiveRest,
        resetActiveRest,
        cancelWorkout,
        finishWorkout,
    } = useWorkout();

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showRestPopup, setShowRestPopup] = useState(false);
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [exerciseLibrary, setExerciseLibrary] = useState<
        ExerciseLibraryItem[]
    >([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [editingRestForExercise, setEditingRestForExercise] = useState<
        number | null
    >(null);

    // Format timer (e.g. 0:23, 14:05, 1:12:30)
    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const pad = (num: number) => String(num).padStart(2, '0');

        if (hrs > 0) {
            return `${hrs}:${pad(mins)}:${pad(secs)}`;
        }

        return `${mins}:${pad(secs)}`;
    };

    // Load exercises from API when opening exercise library
    const handleOpenAddExercise = () => {
        setShowAddExercise(true);

        if (exerciseLibrary.length === 0) {
            setLoadingLibrary(true);
            fetch('/api/exercises')
                .then((res) => res.json())
                .then((data) => {
                    setExerciseLibrary(data || []);
                    setLoadingLibrary(false);
                })
                .catch((err) => {
                    console.error('Failed to load exercise library', err);
                    toast.error('Failed to load exercises');
                    setLoadingLibrary(false);
                });
        }
    };

    if (!isActive) {
        return null;
    }

    // Filtered exercises for the library
    const filteredLibrary = exerciseLibrary.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.muscleGroup
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const formatRestTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ─── Collapsed View (Floating bottom bar) ──────────────────────────────
    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className="border-neutral-850 hover:border-neutral-750 hover:bg-neutral-850/95 fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-4 z-40 flex cursor-pointer items-center justify-between rounded-2xl border bg-neutral-900/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 active:scale-[0.99] md:right-4 md:bottom-4 md:left-auto md:w-96"
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                        <Clock className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                            Active Workout
                        </span>
                        <span className="max-w-[150px] truncate text-sm font-bold text-neutral-100">
                            {name || 'Workout'}
                        </span>
                    </div>
                </div>

                <div
                    className="flex items-center gap-2.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {activeRest && (
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="flex animate-pulse cursor-pointer items-center gap-1 rounded-full border border-amber-900/40 bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold text-amber-400"
                        >
                            <Timer className="h-3 w-3" />
                            <span>
                                Rest: {formatRestTime(activeRest.remaining)}
                            </span>
                        </div>
                    )}
                    <span className="font-mono text-sm font-bold text-sky-400">
                        {formatTime(elapsedSeconds)}
                    </span>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-700"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ─── Expanded View (Slide-up drawer / side panel) ──────────────────────
    return (
        <div className="md:border-neutral-850 fixed inset-0 z-[100] flex animate-in flex-col overflow-hidden bg-neutral-950 text-neutral-100 transition-all duration-300 slide-in-from-bottom md:top-auto md:right-4 md:bottom-4 md:left-auto md:h-[680px] md:max-h-[calc(100vh-2rem)] md:w-[480px] md:rounded-3xl md:border md:shadow-2xl">
            {/* Header */}
            <div className="border-neutral-850/60 pt-safe flex shrink-0 items-center justify-between border-b bg-neutral-900/60 px-5 pb-4 backdrop-blur-md md:pt-4">
                <button
                    onClick={() => setIsExpanded(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800/40 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-sky-950/40 px-3 py-1 text-sky-400">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span className="font-mono text-xs font-bold">
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                    {activeRest && (
                        <button
                            type="button"
                            onClick={() => setShowRestPopup(true)}
                            className="flex animate-pulse cursor-pointer items-center gap-1 rounded-full border border-amber-900/40 bg-amber-950/60 px-2.5 py-1 text-xs font-extrabold text-amber-400 shadow-md transition-all hover:bg-amber-900/80"
                            title="Click to open Rest Timer"
                        >
                            <Timer className="h-3.5 w-3.5" />
                            <span>Rest: {formatRestTime(activeRest.remaining)}</span>
                        </button>
                    )}
                </div>

                <button
                    onClick={finishWorkout}
                    className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold tracking-wider text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-[0.98]"
                >
                    FINISH
                </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 scrollbar-thin space-y-6 overflow-y-auto p-5 pb-16 md:pb-5">
                {/* Title & Large Timer */}
                <div className="space-y-1">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => updateWorkoutName(e.target.value)}
                        placeholder="Afternoon Workout"
                        className="w-full border-0 bg-transparent p-0 text-2xl leading-none font-black text-neutral-50 placeholder-neutral-700 outline-none focus:ring-0"
                    />
                    <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-neutral-400">
                        <span>Time elapsed:</span>
                        <span className="font-bold text-neutral-200">
                            {formatTime(elapsedSeconds)}
                        </span>
                    </div>
                </div>

                {/* Exercises list */}
                <div className="space-y-5">
                    {exercises.length === 0 ? (
                        <div className="border-neutral-850 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-neutral-900/10 py-12 text-center">
                            <Dumbbell className="mb-3 h-10 w-10 text-neutral-600" />
                            <p className="text-sm text-neutral-500">
                                No exercises added to this workout yet.
                            </p>
                        </div>
                    ) : (
                        exercises.map((ex, exIndex) => (
                            <div
                                key={exIndex}
                                className="border-neutral-850 space-y-3 rounded-2xl border bg-neutral-900/30 p-4"
                            >
                                {/* Exercise Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex max-w-[80%] items-center gap-2">
                                        <span className="truncate text-base font-extrabold text-sky-400">
                                            {ex.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingRestForExercise(
                                                    editingRestForExercise ===
                                                        exIndex
                                                        ? null
                                                        : exIndex,
                                                )
                                            }
                                            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold transition-all ${
                                                editingRestForExercise ===
                                                exIndex
                                                    ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                    : 'border-neutral-750 bg-neutral-800/60 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                                            }`}
                                            title="Adjust rest timer"
                                        >
                                            <Timer className="h-3 w-3" />
                                            <span>
                                                {formatRestTime(
                                                    ex.restSeconds !== undefined
                                                        ? ex.restSeconds
                                                        : 120,
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeActiveExercise(exIndex)
                                        }
                                        className="p-1 text-neutral-500 transition-colors hover:text-rose-400"
                                        title="Remove exercise"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Rest Time Editor Panel */}
                                {editingRestForExercise === exIndex && (
                                    <div className="flex animate-in flex-col gap-2 rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-3 text-xs duration-200 slide-in-from-top">
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-neutral-400">
                                                Adjust Rest Duration
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingRestForExercise(
                                                        null,
                                                    )
                                                }
                                                className="hover:text-neutral-350 text-[10px] font-bold text-neutral-500"
                                            >
                                                Done
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {[30, 60, 90, 120, 180, 300].map(
                                                (sec) => (
                                                    <button
                                                        key={sec}
                                                        type="button"
                                                        onClick={() => {
                                                            updateExerciseRest(
                                                                exIndex,
                                                                sec,
                                                            );
                                                        }}
                                                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition-all ${
                                                            (ex.restSeconds !==
                                                            undefined
                                                                ? ex.restSeconds
                                                                : 120) === sec
                                                                ? 'bg-sky-500 text-white'
                                                                : 'bg-neutral-850 text-neutral-300 hover:bg-neutral-800'
                                                        }`}
                                                    >
                                                        {sec >= 60
                                                            ? `${sec / 60}m`
                                                            : `${sec}s`}
                                                    </button>
                                                ),
                                            )}
                                            <div className="bg-neutral-850 ml-auto flex shrink-0 items-center gap-1 rounded-lg p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateExerciseRest(
                                                            exIndex,
                                                            Math.max(
                                                                0,
                                                                (ex.restSeconds !==
                                                                undefined
                                                                    ? ex.restSeconds
                                                                    : 120) - 15,
                                                            ),
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-neutral-300 transition-colors hover:bg-neutral-800"
                                                >
                                                    -15s
                                                </button>
                                                <div className="h-4 w-px bg-neutral-800" />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateExerciseRest(
                                                            exIndex,
                                                            (ex.restSeconds !==
                                                            undefined
                                                                ? ex.restSeconds
                                                                : 120) + 15,
                                                        )
                                                    }
                                                    className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-neutral-300 transition-colors hover:bg-neutral-800"
                                                >
                                                    +15s
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sets Grid */}
                                <div className="space-y-2">
                                    {/* Grid Header */}
                                    <div className="grid grid-cols-[36px_1fr_64px_64px_36px_36px] items-center gap-2 px-1 text-[10px] font-black tracking-widest text-neutral-500 uppercase">
                                        <span className="text-center">Set</span>
                                        <span>Previous</span>
                                        <span className="text-center">LBS</span>
                                        <span className="text-center">
                                            Reps
                                        </span>
                                        <span className="text-center">✓</span>
                                        <span className="text-center"></span>
                                    </div>

                                    {/* Set Rows */}
                                    {ex.sets.map((set, setIndex) => (
                                        <div
                                            key={setIndex}
                                            className="space-y-2"
                                        >
                                            <div
                                                className={`grid grid-cols-[36px_1fr_64px_64px_36px_36px] items-center gap-2 rounded-lg px-1 py-0.5 transition-colors ${
                                                    set.isFinished
                                                        ? 'bg-emerald-500/5'
                                                        : ''
                                                }`}
                                            >
                                                {/* Set Number */}
                                                <span
                                                    className={`text-center text-xs font-bold ${
                                                        set.isFinished
                                                            ? 'text-emerald-400'
                                                            : 'text-neutral-400'
                                                    }`}
                                                >
                                                    {setIndex + 1}
                                                </span>

                                                {/* Previous Set Info */}
                                                <span className="truncate text-xs text-neutral-500">
                                                    —
                                                </span>

                                                {/* Weight input */}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    value={set.weight}
                                                    disabled={set.isFinished}
                                                    onChange={(e) =>
                                                        updateActiveSet(
                                                            exIndex,
                                                            setIndex,
                                                            {
                                                                weight: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    placeholder="60"
                                                    className="focus:bg-neutral-750 h-8 w-full rounded-lg border-0 bg-neutral-800 text-center text-xs font-semibold text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                                                />

                                                {/* Reps input */}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={set.reps}
                                                    disabled={set.isFinished}
                                                    onChange={(e) =>
                                                        updateActiveSet(
                                                            exIndex,
                                                            setIndex,
                                                            {
                                                                reps: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    placeholder="10"
                                                    className="focus:bg-neutral-750 h-8 w-full rounded-lg border-0 bg-neutral-800 text-center text-xs font-semibold text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                                                />

                                                {/* Checkmark Completion Button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleSetCompleted(
                                                            exIndex,
                                                            setIndex,
                                                        )
                                                    }
                                                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border transition-all ${
                                                        set.isFinished
                                                            ? 'border-emerald-500 bg-emerald-500 font-bold text-neutral-950'
                                                            : 'border-neutral-700 bg-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                                                    }`}
                                                >
                                                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                                </button>

                                                {/* Delete Set Button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeActiveSet(
                                                            exIndex,
                                                            setIndex,
                                                        )
                                                    }
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-rose-500"
                                                    title="Delete set"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Rest timer row */}
                                            <div className="flex items-center gap-2 px-1 py-1">
                                                <div className="h-[1px] flex-1 bg-sky-950/20" />
                                                <div className="z-10 flex items-center gap-2">
                                                    {activeRest &&
                                                    activeRest.exerciseIndex ===
                                                        exIndex &&
                                                    activeRest.setIndex ===
                                                        setIndex ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowRestPopup(
                                                                    true,
                                                                )
                                                            }
                                                            className="flex animate-pulse cursor-pointer items-center gap-1 text-[10px] font-black tracking-widest text-sky-400 transition-colors hover:text-sky-300"
                                                            title="Click to open Rest Timer popup"
                                                        >
                                                            <Timer className="h-3 w-3" />
                                                            <span>
                                                                REST:{' '}
                                                                {formatRestTime(
                                                                    activeRest.remaining,
                                                                )}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-black tracking-widest text-sky-400/60">
                                                            REST:{' '}
                                                            {formatRestTime(
                                                                ex.restSeconds !==
                                                                    undefined
                                                                    ? ex.restSeconds
                                                                    : 120,
                                                            )}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1 rounded-lg border border-neutral-800/40 bg-neutral-900/40 p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    activeRest &&
                                                                    activeRest.exerciseIndex ===
                                                                        exIndex &&
                                                                    activeRest.setIndex ===
                                                                        setIndex
                                                                ) {
                                                                    adjustActiveRest(
                                                                        15,
                                                                    );
                                                                } else {
                                                                    updateExerciseRest(
                                                                        exIndex,
                                                                        Math.max(
                                                                            15,
                                                                            (ex.restSeconds !==
                                                                            undefined
                                                                                ? ex.restSeconds
                                                                                : 120) +
                                                                                15,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            className="hover:bg-neutral-750 py-0.2 cursor-pointer rounded bg-neutral-800/60 px-1.5 text-[8px] font-extrabold text-neutral-400 transition-colors hover:text-sky-400"
                                                            title="Increase rest duration (+15s)"
                                                        >
                                                            +15s
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (
                                                                    activeRest &&
                                                                    activeRest.exerciseIndex ===
                                                                        exIndex &&
                                                                    activeRest.setIndex ===
                                                                        setIndex
                                                                ) {
                                                                    adjustActiveRest(
                                                                        -15,
                                                                    );
                                                                } else {
                                                                    updateExerciseRest(
                                                                        exIndex,
                                                                        Math.max(
                                                                            15,
                                                                            (ex.restSeconds !==
                                                                            undefined
                                                                                ? ex.restSeconds
                                                                                : 120) -
                                                                                15,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            className="hover:bg-neutral-750 py-0.2 cursor-pointer rounded bg-neutral-800/60 px-1.5 text-[8px] font-extrabold text-neutral-400 transition-colors hover:text-sky-400"
                                                            title="Decrease rest duration (-15s)"
                                                        >
                                                            -15s
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="h-[1px] flex-1 bg-sky-950/20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add set to exercise */}
                                <button
                                    type="button"
                                    onClick={() => addActiveSet(exIndex)}
                                    className="flex w-full items-center justify-center rounded-xl bg-neutral-800/40 py-2 text-xs font-bold text-sky-400 transition-colors hover:bg-neutral-800"
                                >
                                    ADD SET (
                                    {formatRestTime(
                                        ex.restSeconds !== undefined
                                            ? ex.restSeconds
                                            : 120,
                                    )}
                                    )
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Additional Buttons */}
                <div className="space-y-3.5 pt-2">
                    <button
                        onClick={handleOpenAddExercise}
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-sky-500/10 py-3 text-sm font-extrabold tracking-wide text-sky-400 transition-all hover:bg-sky-500/15"
                    >
                        <Plus className="h-4 w-4" />
                        ADD EXERCISE
                    </button>

                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-2 text-center text-xs font-extrabold tracking-widest text-rose-500 uppercase transition-colors hover:text-rose-400"
                    >
                        CANCEL WORKOUT
                    </button>
                </div>
            </div>

            {/* ── Cancel Confirmation Dialog ── */}
            {showCancelConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-5 backdrop-blur-md">
                    <div className="w-full max-w-sm space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-extrabold text-neutral-100">
                                Cancel active workout?
                            </h3>
                            <p className="text-xs leading-relaxed text-neutral-400">
                                This will erase all logged exercises and sets
                                for the current session. This action cannot be
                                undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 rounded-2xl border border-neutral-800 py-2.5 text-xs font-bold text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
                            >
                                Back to workout
                            </button>
                            <button
                                onClick={() => {
                                    cancelWorkout();
                                    setShowCancelConfirm(false);
                                }}
                                className="flex-1 rounded-2xl bg-rose-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/10 transition-colors hover:bg-rose-600"
                            >
                                Cancel Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Exercise Library Modal ── */}
            {showAddExercise && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center p-4 pt-12 sm:p-6 duration-200 fade-in">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setShowAddExercise(false)}
                    />
                    <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/50 px-5 py-4">
                            <span className="text-base font-extrabold text-white">
                                Add Exercise
                            </span>
                            <button
                                onClick={() => {
                                    setShowAddExercise(false);
                                    setSearchQuery('');
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors hover:text-white cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Search Field & Create Custom Exercise Link */}
                        <div className="border-b border-white/10 bg-slate-950/30 p-4 space-y-2">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, muscle, or category..."
                                    className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 pr-4 pl-9 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end">
                                <a
                                    href="/Exercises"
                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                >
                                    + Create Custom Exercise
                                </a>
                            </div>
                        </div>

                        {/* Library List */}
                        <div className="flex-1 space-y-2 overflow-y-auto p-4">
                            {loadingLibrary ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-500">
                                    <span className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                                    Loading exercise library...
                                </div>
                            ) : filteredLibrary.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-500">
                                    No exercises match your search
                                </div>
                            ) : (
                                filteredLibrary.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            addActiveExercise(
                                                item.id,
                                                item.name,
                                                item.restSeconds,
                                            );
                                            setShowAddExercise(false);
                                            setSearchQuery('');
                                        }}
                                        className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3.5 text-left transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white">
                                                {item.name}
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-400">
                                                {item.muscleGroup}
                                            </div>
                                        </div>
                                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-indigo-300 uppercase">
                                            {item.category}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Rest Timer Popup Modal ── */}
            {activeRest && showRestPopup && (
                <RestTimerModal
                    remaining={activeRest.remaining}
                    total={activeRest.total}
                    exerciseName={
                        exercises[activeRest.exerciseIndex]?.name || 'Workout'
                    }
                    setNumber={activeRest.setIndex + 1}
                    totalTime={elapsedSeconds}
                    isPaused={activeRest.isPaused || false}
                    onSkip={() => setShowRestPopup(false)}
                    onAdjust={adjustActiveRest}
                    onPause={pauseActiveRest}
                    onResume={resumeActiveRest}
                    onReset={resetActiveRest}
                    onSkipTimer={skipActiveRest}
                />
            )}
        </div>
    );
}
