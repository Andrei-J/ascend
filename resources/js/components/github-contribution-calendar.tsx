import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type {
    ContributionDay,
    DayWorkoutSession,
} from '@/components/workout-details-modal';
import WorkoutDetailsModal from '@/components/workout-details-modal';

export type { ContributionDay, DayWorkoutSession };

export interface ContributionCalendarData {
    totalContributions: number;
    selectedYear: number;
    availableYears: number[];
    days: ContributionDay[];
}

interface Props {
    data?: ContributionCalendarData;
    className?: string;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

// Helper: format Date object to "YYYY-MM-DD"
function formatLocalDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function GitHubContributionCalendar({
    data,
    className = '',
}: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatLocalDate(today);

    // Current viewed month state (defaults to current month)
    const [viewDate, setViewDate] = useState<Date>(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedModalDay, setSelectedModalDay] =
        useState<ContributionDay | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Map all incoming workout records by "YYYY-MM-DD"
    const incomingDaysMap = useMemo(() => {
        const map = new Map<string, ContributionDay>();

        if (data?.days) {
            data.days.forEach((day) => {
                map.set(day.date, day);
            });
        }

        return map;
    }, [data]);

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    // Calculate monthly calendar grid (Sunday..Saturday)
    const { calendarGrid, monthlyWorkoutCount } = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        const cells: {
            dateStr: string;
            dayNumber: number;
            isCurrentMonth: boolean;
            isToday: boolean;
            hasWorkout: boolean;
            workoutCount: number;
            dayData: ContributionDay;
        }[] = [];

        let countThisMonth = 0;

        // Trailing days from previous month
        const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const d = new Date(viewYear, viewMonth - 1, dayNum);
            const dateStr = formatLocalDate(d);
            const dayData = incomingDaysMap.get(dateStr) || {
                date: dateStr,
                count: 0,
                sets: 0,
                volume: 0,
                duration: 0,
                level: 0,
                workouts: [],
            };
            const hasW = dayData.count > 0 || dayData.sets > 0;

            cells.push({
                dateStr,
                dayNumber: dayNum,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                hasWorkout: hasW,
                workoutCount: dayData.count || (hasW ? 1 : 0),
                dayData,
            });
        }

        // Current month days
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const d = new Date(viewYear, viewMonth, dayNum);
            const dateStr = formatLocalDate(d);
            const dayData = incomingDaysMap.get(dateStr) || {
                date: dateStr,
                count: 0,
                sets: 0,
                volume: 0,
                duration: 0,
                level: 0,
                workouts: [],
            };
            const hasW = dayData.count > 0 || dayData.sets > 0;

            if (hasW) {
                countThisMonth += dayData.count > 0 ? dayData.count : 1;
            }

            cells.push({
                dateStr,
                dayNumber: dayNum,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
                hasWorkout: hasW,
                workoutCount: dayData.count || (hasW ? 1 : 0),
                dayData,
            });
        }

        // Trailing days from next month to complete standard weeks grid (35 or 42 cells)
        const totalTargetCells = Math.ceil(cells.length / 7) * 7;
        const remainingCells = totalTargetCells - cells.length;

        for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
            const d = new Date(viewYear, viewMonth + 1, dayNum);
            const dateStr = formatLocalDate(d);
            const dayData = incomingDaysMap.get(dateStr) || {
                date: dateStr,
                count: 0,
                sets: 0,
                volume: 0,
                duration: 0,
                level: 0,
                workouts: [],
            };
            const hasW = dayData.count > 0 || dayData.sets > 0;

            cells.push({
                dateStr,
                dayNumber: dayNum,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                hasWorkout: hasW,
                workoutCount: dayData.count || (hasW ? 1 : 0),
                dayData,
            });
        }

        return {
            calendarGrid: cells,
            monthlyWorkoutCount: countThisMonth,
        };
    }, [viewYear, viewMonth, incomingDaysMap, todayStr]);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewYear, viewMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewYear, viewMonth + 1, 1));
    };

    const handleTodayClick = () => {
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    const handleCellClick = (dayData: ContributionDay) => {
        setSelectedModalDay(dayData);
        setIsModalOpen(true);
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Monthly Calendar Card Container */}
            <div className="w-full space-y-5 rounded-2xl border border-slate-800 bg-[#0d1117] p-5 shadow-2xl sm:p-6">
                {/* Header: Title + Navigation */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center">
                    <div>
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Workout Activity Calendar</span>
                        </div>
                        <h3 className="flex items-baseline gap-2.5 text-lg font-black text-slate-100 sm:text-xl">
                            <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                            <span className="text-xs font-normal text-slate-400">
                                ({monthlyWorkoutCount} completed session{monthlyWorkoutCount === 1 ? '' : 's'} this month)
                            </span>
                        </h3>
                    </div>

                    {/* Navigation Controls: Prev, Today, Next */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                            type="button"
                            onClick={handleTodayClick}
                            className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
                        >
                            Today
                        </button>
                        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                aria-label="Previous Month"
                                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-200">
                                {MONTH_NAMES[viewMonth].slice(0, 3)} {viewYear}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                aria-label="Next Month"
                                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="w-full select-none">
                    {/* Sunday -> Saturday Weekday Header Row */}
                    <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400 sm:gap-2">
                        {WEEKDAY_NAMES.map((dayName) => (
                            <div key={dayName} className="py-1">
                                {dayName}
                            </div>
                        ))}
                    </div>

                    {/* Monthly Calendar Dates Grid */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {calendarGrid.map((cell, idx) => {
                            const fullDateLabel = `${MONTH_NAMES[viewMonth]} ${cell.dayNumber}, ${viewYear}${cell.isToday ? ', today' : ''}${cell.hasWorkout ? ', workout completed' : ', no workout'}`;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleCellClick(cell.dayData)}
                                    aria-label={fullDateLabel}
                                    className={`group relative flex h-14 w-full cursor-pointer flex-col justify-between rounded-xl border p-1.5 transition-all select-none box-border sm:h-16 sm:p-2 ${
                                        cell.isCurrentMonth
                                            ? 'bg-slate-900/70 hover:bg-slate-800/80'
                                            : 'bg-slate-950/30 opacity-40 hover:opacity-60'
                                    } ${
                                        cell.isToday
                                            ? 'border-2 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                                            : cell.isCurrentMonth
                                              ? 'border-slate-800/80 hover:border-slate-700'
                                              : 'border-slate-950/40'
                                    }`}
                                >
                                    {/* Top-Left Date Number */}
                                    <div className="flex w-full items-center justify-start">
                                        <span
                                            className={`text-xs font-bold sm:text-sm ${
                                                cell.isToday
                                                    ? 'font-black text-indigo-300'
                                                    : cell.hasWorkout && cell.isCurrentMonth
                                                      ? 'font-extrabold text-slate-100'
                                                      : cell.isCurrentMonth
                                                        ? 'text-slate-300'
                                                        : 'text-slate-500'
                                            }`}
                                        >
                                            {cell.dayNumber}
                                        </span>
                                    </div>

                                    {/* Bottom-Center Green Workout Marker */}
                                    <div className="flex h-4 w-full items-center justify-center">
                                        {cell.hasWorkout && (
                                            <span
                                                className={`flex items-center justify-center ${
                                                    !cell.isCurrentMonth
                                                        ? 'opacity-40'
                                                        : ''
                                                }`}
                                                title={
                                                    cell.workoutCount > 1
                                                        ? `${cell.workoutCount} workouts`
                                                        : 'Workout completed'
                                                }
                                            >
                                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)] sm:h-2.5 sm:w-2.5" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Legend / Hint */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs text-slate-400 sm:flex-row">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5 rounded-md border-2 border-indigo-500 bg-slate-900 shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                            <span className="font-bold text-indigo-300">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.85)]" />
                            <span className="font-bold text-emerald-400">Workout Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3.5 w-3.5 rounded-md border border-slate-800 bg-slate-900/40" />
                            <span className="font-semibold text-slate-400">Rest Day</span>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                        Click any date to view workout session details or rest day status.
                    </div>
                </div>
            </div>

            {/* Click Detail Modal Dialog */}
            <WorkoutDetailsModal
                day={selectedModalDay}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
