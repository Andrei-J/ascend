import { Dumbbell, Clock, Weight, Calendar, CheckCircle2 } from 'lucide-react';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

export interface WorkoutExerciseSummary {
    name: string;
    setsCount: number;
    bestSet: string;
}

export interface DayWorkoutSession {
    id: number;
    name: string;
    templateName?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    duration: number; // in seconds
    setsCount: number;
    volume: number; // in kg
    exercises: WorkoutExerciseSummary[];
}

export interface ContributionDay {
    date: string; // YYYY-MM-DD
    count: number;
    sets: number;
    volume: number;
    duration?: number;
    level: 0 | 1 | 2 | 3 | 4;
    workouts?: DayWorkoutSession[];
}

interface WorkoutDetailsModalProps {
    day: ContributionDay | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDuration(seconds?: number): string {
    if (!seconds || seconds <= 0) {
return '—';
}

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
return `${hrs}h ${mins}m`;
}

    if (mins > 0) {
return `${mins} min`;
}

    return `${secs} sec`;
}

function formatDateString(dateStr: string): string {
    if (!dateStr) {
return '';
}

    // Prevent UTC shift by splitting YYYY-MM-DD manually
    const parts = dateStr.split('-');

    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);

        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return dateStr;
}

export default function WorkoutDetailsModal({
    day,
    open,
    onOpenChange,
}: WorkoutDetailsModalProps) {
    if (!day) {
return null;
}

    const formattedDate = formatDateString(day.date);
    const workouts = day.workouts || [];
    const hasWorkouts = workouts.length > 0 || day.count > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl border-slate-800 bg-[#0d1117] p-6 text-white shadow-2xl sm:p-7">
                <DialogHeader className="border-b border-slate-800 pb-4 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <DialogTitle className="mt-1 text-xl font-extrabold text-white">
                        {hasWorkouts ? (
                            <span>
                                {workouts.length || day.count} Workout
                                {workouts.length > 1 || day.count > 1
                                    ? 's'
                                    : ''}{' '}
                                Completed
                            </span>
                        ) : (
                            <span>Workout Rest Day</span>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        {hasWorkouts
                            ? `Summary of workout sessions and volume logged on this calendar date.`
                            : `No workouts were recorded on ${formattedDate}.`}
                    </DialogDescription>
                </DialogHeader>

                {hasWorkouts ? (
                    <div className="my-2 max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-800 space-y-4 overflow-y-auto pr-1">
                        {/* Daily Totals Bar */}
                        <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-center">
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Sessions
                                </p>
                                <p className="text-base font-black text-white">
                                    {workouts.length || day.count}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Total Sets
                                </p>
                                <p className="text-base font-black text-emerald-400">
                                    {day.sets} {day.sets === 1 ? 'set' : 'sets'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Total Volume
                                </p>
                                <p className="text-base font-black text-amber-400">
                                    {day.volume} kg
                                </p>
                            </div>
                        </div>

                        {/* List of Workouts */}
                        <div className="space-y-3">
                            {workouts.map((w, idx) => (
                                <div
                                    key={w.id || idx}
                                    className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
                                >
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-base font-bold text-slate-100">
                                                <Dumbbell className="h-4 w-4 shrink-0 text-emerald-400" />
                                                <span>{w.name}</span>
                                            </h4>
                                            {w.templateName && (
                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    Template: {w.templateName}
                                                </p>
                                            )}
                                        </div>
                                        {w.duration > 0 && (
                                            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDuration(w.duration)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats line */}
                                    <div className="flex items-center gap-4 text-xs text-slate-300">
                                        <div className="flex items-center gap-1 font-semibold">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>
                                                {w.setsCount}{' '}
                                                {w.setsCount === 1
                                                    ? 'set'
                                                    : 'sets'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <Weight className="h-3.5 w-3.5 text-amber-400" />
                                            <span>{w.volume} kg volume</span>
                                        </div>
                                    </div>

                                    {/* Exercise Breakdown */}
                                    {w.exercises && w.exercises.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                                Exercises Executed
                                            </p>
                                            <div className="space-y-1 rounded-lg border border-slate-800/40 bg-slate-950/60 p-2.5 text-xs">
                                                {w.exercises.map(
                                                    (ex, exIdx) => (
                                                        <div
                                                            key={exIdx}
                                                            className="flex items-center justify-between py-0.5"
                                                        >
                                                            <span className="font-medium text-slate-300">
                                                                <span className="mr-1.5 font-bold text-emerald-400">
                                                                    {
                                                                        ex.setsCount
                                                                    }
                                                                    ×
                                                                </span>
                                                                {ex.name}
                                                            </span>
                                                            <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-400">
                                                                {ex.bestSet}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 text-slate-500">
                            <Dumbbell className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-semibold text-slate-300">
                            No workouts recorded on this date.
                        </p>
                        <p className="max-w-xs text-xs text-slate-500">
                            Log a session in your workout logger to build your
                            streak and fill this square!
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
