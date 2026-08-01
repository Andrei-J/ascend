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
    SkipForward,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
                className="relative z-10 w-full max-w-sm rounded-3xl border border-emerald-950/40 bg-[#0c1917] pb-8 pt-6 px-6 shadow-2xl text-neutral-100"
                style={{ animation: 'slideUpPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
                {/* Header line with Exercise name & dismiss X */}
                <div className="flex items-center justify-between mb-4 border-b border-emerald-950/30 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 truncate max-w-[80%]">
                        {exerciseName}
                    </span>
                    <button
                        type="button"
                        onClick={onSkip}
                        className="text-neutral-500 hover:text-neutral-350 transition-colors p-1 cursor-pointer"
                        title="Close Rest Timer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Circular countdown */}
                <div className="flex justify-center mb-6">
                    <div className="relative" style={{ width: SIZE, height: SIZE }}>
                        {/* Glow */}
                        <div
                            className="absolute inset-0 rounded-full transition-all duration-1000"
                            style={{ boxShadow: `0 0 35px 4px ${glowColor}` }}
                        />

                        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
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
                                style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s ease' }}
                            />
                        </svg>

                        {/* Center time digits */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span
                                className="font-mono font-black tabular-nums leading-none tracking-tight"
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
                <div className="text-center font-extrabold text-xl text-[#84cc16] tracking-wider uppercase mb-6">
                    Rest
                </div>

                {/* Info block: Sets / Total Time */}
                <div className="w-full max-w-[240px] mx-auto text-xs space-y-3 mb-8 border-y border-emerald-950/20 py-4">
                    <div className="flex justify-between items-center">
                        <span className="font-bold tracking-widest text-neutral-400">SETS</span>
                        <span className="text-neutral-200 font-bold font-mono text-sm">{setNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold tracking-widest text-neutral-400">TOTAL TIME</span>
                        <span className="text-neutral-200 font-bold font-mono text-sm">{formatTotalTime(totalTime)}</span>
                    </div>
                </div>

                {/* Adjust buttons: -30 / +30 */}
                <div className="flex items-center justify-center gap-4 mb-5">
                    <button
                        type="button"
                        onClick={() => onAdjust(-30)}
                        className="rounded-xl border border-emerald-900/45 bg-neutral-900/60 hover:bg-neutral-800 px-4 py-2 text-xs font-black text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title="Subtract 30 seconds"
                    >
                        -30s
                    </button>
                    <button
                        type="button"
                        onClick={() => onAdjust(30)}
                        className="rounded-xl border border-emerald-900/45 bg-neutral-900/60 hover:bg-neutral-800 px-4 py-2 text-xs font-black text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
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
                        className="flex-1 rounded-xl bg-yellow-400 py-3 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-md transition-all hover:bg-yellow-350 active:scale-[0.97] cursor-pointer"
                    >
                        {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex-1 rounded-xl bg-yellow-400 py-3 text-xs font-black uppercase tracking-wider text-neutral-950 shadow-md transition-all hover:bg-yellow-350 active:scale-[0.97] cursor-pointer"
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
                    className="w-full text-center text-xs font-bold text-neutral-500 hover:text-neutral-350 transition-colors mt-5 uppercase tracking-widest cursor-pointer"
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
        document.body
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

    // Auto-close popup when activeRest is cleared or timer finishes
    useEffect(() => {
        if (!activeRest) {
            setShowRestPopup(false);
        }
    }, [activeRest]);
    const [showAddExercise, setShowAddExercise] = useState(false);
    const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [editingRestForExercise, setEditingRestForExercise] = useState<number | null>(null);


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
    const filteredLibrary = exerciseLibrary.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
                className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-40 flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-850 bg-neutral-900/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-neutral-750 hover:bg-neutral-850/95 active:scale-[0.99] md:bottom-4 md:right-4 md:left-auto md:w-96"
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                        <Clock className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Active Workout
                        </span>
                        <span className="text-sm font-bold text-neutral-100 truncate max-w-[150px]">
                            {name || 'Workout'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    {activeRest && (
                        <div 
                            onClick={() => setIsExpanded(true)}
                            className="flex items-center gap-1 rounded-full bg-amber-950/50 border border-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-400 animate-pulse cursor-pointer"
                        >
                            <Timer className="h-3 w-3" />
                            <span>Rest: {formatRestTime(activeRest.remaining)}</span>
                        </div>
                    )}
                    <span className="font-mono text-sm font-bold text-sky-400">
                        {formatTime(elapsedSeconds)}
                    </span>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }


    // ─── Expanded View (Slide-up drawer / side panel) ──────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-neutral-950 text-neutral-100 transition-all duration-300 md:bottom-4 md:right-4 md:top-auto md:left-auto md:h-[680px] md:max-h-[calc(100vh-2rem)] md:w-[480px] md:rounded-3xl md:border md:border-neutral-850 md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-850/60 bg-neutral-900/60 px-5 pt-safe pb-4 md:pt-4 backdrop-blur-md">
                <button
                    onClick={() => setIsExpanded(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-1.5 rounded-full bg-sky-950/40 px-3 py-1 text-sky-400">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span className="font-mono text-xs font-bold">{formatTime(elapsedSeconds)}</span>
                </div>

                <button
                    onClick={finishWorkout}
                    className="rounded-xl bg-sky-500 px-4 py-1.5 text-xs font-bold tracking-wider text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
                >
                    FINISH
                </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-5 pb-16 md:pb-5 space-y-6 scrollbar-thin">
                
                {/* Title & Large Timer */}
                <div className="space-y-1">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => updateWorkoutName(e.target.value)}
                        placeholder="Afternoon Workout"
                        className="w-full bg-transparent text-2xl font-black text-neutral-50 border-0 p-0 focus:ring-0 outline-none leading-none placeholder-neutral-700"
                    />
                    <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-sm font-semibold">
                        <span>Time elapsed:</span>
                        <span className="text-neutral-200 font-bold">{formatTime(elapsedSeconds)}</span>
                    </div>
                </div>

                {/* Exercises list */}
                <div className="space-y-5">
                    {exercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-neutral-850 bg-neutral-900/10">
                            <Dumbbell className="h-10 w-10 text-neutral-600 mb-3" />
                            <p className="text-sm text-neutral-500">
                                No exercises added to this workout yet.
                            </p>
                            <button
                                onClick={handleOpenAddExercise}
                                className="mt-3 rounded-xl bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-all"
                            >
                                + Add Exercise
                            </button>
                        </div>
                    ) : (
                        exercises.map((ex, exIndex) => (
                            <div key={exIndex} className="rounded-2xl border border-neutral-850 bg-neutral-900/30 p-4 space-y-3">
                                
                                {/* Exercise Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 max-w-[80%]">
                                        <span className="text-base font-extrabold text-sky-400 truncate">
                                            {ex.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setEditingRestForExercise(editingRestForExercise === exIndex ? null : exIndex)}
                                            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold transition-all ${
                                                editingRestForExercise === exIndex
                                                    ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                    : 'bg-neutral-800/60 border-neutral-750 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                                            }`}
                                            title="Adjust rest timer"
                                        >
                                            <Timer className="h-3 w-3" />
                                            <span>{formatRestTime(ex.restSeconds !== undefined ? ex.restSeconds : 120)}</span>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeActiveExercise(exIndex)}
                                        className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                                        title="Remove exercise"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Rest Time Editor Panel */}
                                {editingRestForExercise === exIndex && (
                                    <div className="flex flex-col gap-2 rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-3 text-xs animate-in slide-in-from-top duration-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-400 font-extrabold">Adjust Rest Duration</span>
                                            <button
                                                type="button"
                                                onClick={() => setEditingRestForExercise(null)}
                                                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-350"
                                            >
                                                Done
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {[30, 60, 90, 120, 180, 300].map((sec) => (
                                                <button
                                                    key={sec}
                                                    type="button"
                                                    onClick={() => {
                                                        updateExerciseRest(exIndex, sec);
                                                    }}
                                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black transition-all ${
                                                        (ex.restSeconds !== undefined ? ex.restSeconds : 120) === sec
                                                            ? 'bg-sky-500 text-white'
                                                            : 'bg-neutral-850 text-neutral-300 hover:bg-neutral-800'
                                                    }`}
                                                >
                                                    {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-1 ml-auto shrink-0 bg-neutral-850 rounded-lg p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateExerciseRest(exIndex, Math.max(0, (ex.restSeconds !== undefined ? ex.restSeconds : 120) - 15))}
                                                    className="h-6 w-6 rounded-md hover:bg-neutral-800 text-neutral-300 font-extrabold flex items-center justify-center text-xs transition-colors"
                                                >
                                                    -15s
                                                </button>
                                                <div className="h-4 w-px bg-neutral-800" />
                                                <button
                                                    type="button"
                                                    onClick={() => updateExerciseRest(exIndex, (ex.restSeconds !== undefined ? ex.restSeconds : 120) + 15)}
                                                    className="h-6 w-6 rounded-md hover:bg-neutral-800 text-neutral-300 font-extrabold flex items-center justify-center text-xs transition-colors"
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
                                    <div className="grid grid-cols-[36px_1fr_64px_64px_36px_36px] gap-2 px-1 items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                                        <span className="text-center">Set</span>
                                        <span>Previous</span>
                                        <span className="text-center">LBS</span>
                                        <span className="text-center">Reps</span>
                                        <span className="text-center">✓</span>
                                        <span className="text-center"></span>
                                    </div>

                                    {/* Set Rows */}
                                    {ex.sets.map((set, setIndex) => (
                                        <div key={setIndex} className="space-y-2">
                                            <div
                                                className={`grid grid-cols-[36px_1fr_64px_64px_36px_36px] gap-2 px-1 items-center py-0.5 rounded-lg transition-colors ${
                                                    set.isFinished ? 'bg-emerald-500/5' : ''
                                                }`}
                                            >
                                                {/* Set Number */}
                                                <span className={`text-xs font-bold text-center ${
                                                    set.isFinished ? 'text-emerald-400' : 'text-neutral-400'
                                                }`}>
                                                    {setIndex + 1}
                                                </span>

                                                {/* Previous Set Info */}
                                                <span className="text-xs text-neutral-500 truncate">
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
                                                        updateActiveSet(exIndex, setIndex, { weight: e.target.value })
                                                    }
                                                    placeholder="60"
                                                    className="h-8 w-full rounded-lg border-0 bg-neutral-800 text-center text-xs font-semibold text-neutral-100 placeholder-neutral-500 focus:bg-neutral-750 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                                                />

                                                {/* Reps input */}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={set.reps}
                                                    disabled={set.isFinished}
                                                    onChange={(e) =>
                                                        updateActiveSet(exIndex, setIndex, { reps: e.target.value })
                                                    }
                                                    placeholder="10"
                                                    className="h-8 w-full rounded-lg border-0 bg-neutral-800 text-center text-xs font-semibold text-neutral-100 placeholder-neutral-500 focus:bg-neutral-750 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                                                />

                                                {/* Checkmark Completion Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSetCompleted(exIndex, setIndex)}
                                                    className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                                                        set.isFinished
                                                            ? 'bg-emerald-500 border-emerald-500 text-neutral-950 font-bold'
                                                            : 'border-neutral-700 bg-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                                                    }`}
                                                >
                                                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                                </button>

                                                {/* Delete Set Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeActiveSet(exIndex, setIndex)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-rose-500 transition-colors cursor-pointer"
                                                    title="Delete set"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                             {/* Rest timer row */}
                                             <div className="flex items-center gap-2 py-1 px-1">
                                                 <div className="h-[1px] flex-1 bg-sky-950/20" />
                                                 <div className="flex items-center gap-2 z-10">
                                                     {activeRest && activeRest.exerciseIndex === exIndex && activeRest.setIndex === setIndex ? (
                                                         <button
                                                             type="button"
                                                             onClick={() => setShowRestPopup(true)}
                                                             className="flex items-center gap-1 text-[10px] font-black tracking-widest text-sky-400 animate-pulse hover:text-sky-300 transition-colors cursor-pointer"
                                                             title="Click to open Rest Timer popup"
                                                         >
                                                             <Timer className="h-3 w-3" />
                                                             <span>REST: {formatRestTime(activeRest.remaining)}</span>
                                                         </button>
                                                     ) : (
                                                         <span className="text-[10px] font-black tracking-widest text-sky-400/60">
                                                             REST: {formatRestTime(ex.restSeconds !== undefined ? ex.restSeconds : 120)}
                                                         </span>
                                                     )}
                                                     <div className="flex items-center gap-1 bg-neutral-900/40 rounded-lg p-0.5 border border-neutral-800/40">
                                                         <button
                                                             type="button"
                                                             onClick={() => {
                                                                 if (activeRest && activeRest.exerciseIndex === exIndex && activeRest.setIndex === setIndex) {
                                                                     adjustActiveRest(15);
                                                                 } else {
                                                                     updateExerciseRest(exIndex, Math.max(15, (ex.restSeconds !== undefined ? ex.restSeconds : 120) + 15));
                                                                 }
                                                             }}
                                                             className="rounded bg-neutral-800/60 hover:bg-neutral-750 px-1.5 py-0.2 text-[8px] font-extrabold text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer"
                                                             title="Increase rest duration (+15s)"
                                                         >
                                                             +15s
                                                         </button>
                                                         <button
                                                             type="button"
                                                             onClick={() => {
                                                                 if (activeRest && activeRest.exerciseIndex === exIndex && activeRest.setIndex === setIndex) {
                                                                     adjustActiveRest(-15);
                                                                 } else {
                                                                     updateExerciseRest(exIndex, Math.max(15, (ex.restSeconds !== undefined ? ex.restSeconds : 120) - 15));
                                                                 }
                                                             }}
                                                             className="rounded bg-neutral-800/60 hover:bg-neutral-750 px-1.5 py-0.2 text-[8px] font-extrabold text-neutral-400 hover:text-sky-400 transition-colors cursor-pointer"
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
                                    className="flex w-full items-center justify-center rounded-xl bg-neutral-800/40 py-2 text-xs font-bold text-sky-400 hover:bg-neutral-800 transition-colors"
                                >
                                    ADD SET ({formatRestTime(ex.restSeconds !== undefined ? ex.restSeconds : 120)})
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Additional Buttons */}
                <div className="pt-2 space-y-3.5">
                    <button
                        onClick={handleOpenAddExercise}
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-sky-500/10 py-3 text-sm font-extrabold tracking-wide text-sky-400 hover:bg-sky-500/15 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        ADD EXERCISE
                    </button>

                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full text-center text-xs font-extrabold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors py-2"
                    >
                        CANCEL WORKOUT
                    </button>
                </div>
            </div>

            {/* ── Cancel Confirmation Dialog ── */}
            {showCancelConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-neutral-950/80 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-extrabold text-neutral-100">
                                Cancel active workout?
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                This will erase all logged exercises and sets for the current session. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 rounded-2xl border border-neutral-800 py-2.5 text-xs font-bold text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                            >
                                Back to workout
                            </button>
                            <button
                                onClick={() => {
                                    cancelWorkout();
                                    setShowCancelConfirm(false);
                                }}
                                className="flex-1 rounded-2xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/10"
                            >
                                Cancel Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Exercise Library Slide-up ── */}
            {showAddExercise && (
                <div className="absolute inset-0 z-50 flex flex-col bg-neutral-900 animate-in slide-in-from-bottom duration-300">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-neutral-850 bg-neutral-950/40 px-5 pt-safe pb-4 md:pt-4">
                        <span className="text-sm font-extrabold text-neutral-100">
                            Add Exercise
                        </span>
                        <button
                            onClick={() => {
                                setShowAddExercise(false);
                                setSearchQuery('');
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="p-4 bg-neutral-950/20 border-b border-neutral-850">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, muscle, or category..."
                                className="h-10 w-full rounded-xl border-0 bg-neutral-800 pl-9 pr-4 text-sm text-neutral-100 placeholder-neutral-500 focus:bg-neutral-750 focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                    </div>

                    {/* Library List */}
                    <div className="flex-1 overflow-y-auto p-4 pb-12 md:pb-4 space-y-2">
                        {loadingLibrary ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-neutral-500">
                                <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full mb-2" />
                                Loading exercise library...
                            </div>
                        ) : filteredLibrary.length === 0 ? (
                            <div className="text-center text-xs text-neutral-500 py-12">
                                No exercises match your search
                            </div>
                        ) : (
                            filteredLibrary.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        addActiveExercise(item.id, item.name, item.restSeconds);
                                        setShowAddExercise(false);
                                        setSearchQuery('');
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl bg-neutral-850/50 hover:bg-neutral-800 px-4 py-3.5 text-left transition-colors"
                                >
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-bold text-neutral-100">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-medium">
                                            {item.muscleGroup}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-sky-400/80 bg-sky-950/40 rounded px-1.5 py-0.5">
                                        {item.category}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── Rest Timer Popup Modal ── */}
            {activeRest && showRestPopup && (
                <RestTimerModal
                    remaining={activeRest.remaining}
                    total={activeRest.total}
                    exerciseName={exercises[activeRest.exerciseIndex]?.name || 'Workout'}
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
