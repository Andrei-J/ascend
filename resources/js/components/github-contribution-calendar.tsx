import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface ContributionDay {
    date: string;
    count: number;
    sets: number;
    volume: number;
    level: 0 | 1 | 2 | 3 | 4;
}

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

type RangePreset = '1Y' | '6M' | '3M' | '1M' | 'custom';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GitHubContributionCalendar({ data, className = '' }: Props) {
    const years = data?.availableYears?.length ? data.availableYears : [new Date().getFullYear()];
    const [selectedYear, setSelectedYear] = useState<number>(data?.selectedYear || years[0]);
    const [rangePreset, setRangePreset] = useState<RangePreset>('1Y');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

    const gridContainerRef = useRef<HTMLDivElement>(null);

    const allDays = useMemo(() => data?.days || [], [data]);

    // Filter days based on range preset or custom date range / year
    const { filteredDays, dateRangeLabel } = useMemo(() => {
        if (!allDays.length) {
            return { filteredDays: [], dateRangeLabel: 'the last year' };
        }

        const now = new Date();
        let startLimit: Date | null = null;
        let endLimit: Date | null = null;
        let label = 'the last year';

        if (rangePreset === '1M') {
            startLimit = new Date(now);
            startLimit.setDate(now.getDate() - 30);
            label = 'the last 30 days';
        } else if (rangePreset === '3M') {
            startLimit = new Date(now);
            startLimit.setDate(now.getDate() - 90);
            label = 'the last 90 days';
        } else if (rangePreset === '6M') {
            startLimit = new Date(now);
            startLimit.setDate(now.getDate() - 180);
            label = 'the last 6 months';
        } else if (rangePreset === 'custom') {
            if (customStartDate) {
                startLimit = new Date(customStartDate);
            }

            if (customEndDate) {
                endLimit = new Date(customEndDate);
                endLimit.setHours(23, 59, 59, 999);
            }

            if (customStartDate && customEndDate) {
                label = `${customStartDate} to ${customEndDate}`;
            } else if (customStartDate) {
                label = `from ${customStartDate}`;
            } else if (customEndDate) {
                label = `until ${customEndDate}`;
            } else {
                label = 'custom date range';
            }
        } else if (selectedYear !== now.getFullYear()) {
            label = `in ${selectedYear}`;
        }

        const filtered = allDays.filter((day) => {
            const date = new Date(day.date);

            if (startLimit && date < startLimit) {
return false;
}

            if (endLimit && date > endLimit) {
return false;
}

            return true;
        });

        return { filteredDays: filtered, dateRangeLabel: label };
    }, [allDays, rangePreset, customStartDate, customEndDate, selectedYear]);

    // Group filtered days into week columns (newest week first on left, oldest on right)
    const { weeks, monthHeaders } = useMemo(() => {
        const rawWeeks: ContributionDay[][] = [];
        let currentWeek: ContributionDay[] = [];

        filteredDays.forEach((day) => {
            currentWeek.push(day);

            if (currentWeek.length === 7) {
                rawWeeks.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            rawWeeks.push(currentWeek);
        }

        // Reverse week columns so newest week (today) is Column 0 on the left
        const reversedWeeks = [...rawWeeks].reverse();

        const monthCols: { month: string; colIndex: number }[] = [];
        let lastMonth = -1;

        reversedWeeks.forEach((week, colIdx) => {
            const sampleDay = week.find((d) => d && d.date) || week[0];

            if (sampleDay) {
                const date = new Date(sampleDay.date);
                const month = date.getMonth();

                if (month !== lastMonth) {
                    monthCols.push({ month: MONTH_NAMES[month], colIndex: colIdx });
                    lastMonth = month;
                }
            }
        });

        return { weeks: reversedWeeks, monthHeaders: monthCols };
    }, [filteredDays]);

    // Compute total contributions and volume for filtered days
    const totalContributions = useMemo(() => {
        return filteredDays.reduce((acc, day) => acc + (day.count > 0 || day.sets > 0 ? maxOne(day.count) : 0), 0);
    }, [filteredDays]);

    function maxOne(val: number): number {
        return val > 0 ? val : 1;
    }

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1:
                return 'bg-[#0e6231] border-[#167e42] hover:border-emerald-400 text-emerald-100';
            case 2:
                return 'bg-[#178846] border-[#1fa054] hover:border-emerald-300';
            case 3:
                return 'bg-[#26a641] border-[#31b64d] hover:border-emerald-200 shadow-[0_0_8px_rgba(38,166,65,0.4)]';
            case 4:
                return 'bg-[#39d353] border-[#4ce866] hover:border-white shadow-[0_0_12px_rgba(57,211,83,0.7)]';
            case 0:
            default:
                return 'bg-[#161b22] border-[#21262d] hover:border-slate-600';
        }
    };

    // Ensure scroll position starts at top-left when preset changes
    useEffect(() => {
        if (gridContainerRef.current) {
            gridContainerRef.current.scrollLeft = 0;
        }
    }, [rangePreset, selectedYear]);

    return (
        <div className={`flex flex-col lg:flex-row gap-6 items-start w-full ${className}`}>
            {/* Main Calendar Heatmap Container */}
            <div className="flex-1 w-full rounded-2xl border border-slate-800 bg-[#0d1117] p-5 sm:p-6 shadow-2xl space-y-4">
                {/* Title & Filter Toolbar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-100">
                            <span className="font-extrabold text-white">{totalContributions}</span> contributions in{' '}
                            {dateRangeLabel}
                        </h3>
                        <p className="text-xs text-slate-400">Workout activity heatmap & session log tracker</p>
                    </div>

                    {/* Date Range Filter Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                        {(['1Y', '6M', '3M', '1M', 'custom'] as RangePreset[]).map((preset) => (
                            <button
                                key={preset}
                                onClick={() => {
                                    setRangePreset(preset);
                                }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    rangePreset === preset
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                {preset === 'custom' ? 'Custom Range' : preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range Picker inputs when custom preset selected */}
                {rangePreset === 'custom' && (
                    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                            <label className="text-slate-400 font-semibold">From:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-slate-400 font-semibold">To:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        {(customStartDate || customEndDate) && (
                            <button
                                onClick={() => {
                                    setCustomStartDate('');
                                    setCustomEndDate('');
                                }}
                                className="text-rose-400 hover:underline font-semibold ml-auto"
                            >
                                Reset Dates
                            </button>
                        )}
                    </div>
                )}

                {/* Heatmap Grid wrapper */}
                <div ref={gridContainerRef} className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                    <div className={`flex flex-col gap-1 select-none ${rangePreset === '1Y' ? 'min-w-[680px]' : 'min-w-fit'}`}>
                        {/* Month Headers */}
                        <div className="flex pl-8 text-[11px] font-semibold text-slate-400 h-5 relative">
                            {monthHeaders.map((mh, idx) => (
                                <span
                                    key={idx}
                                    className="absolute"
                                    style={{ left: `${mh.colIndex * 13 + 32}px` }}
                                >
                                    {mh.month}
                                </span>
                            ))}
                        </div>

                        {/* Grid: Day labels + Column Squares */}
                        <div className="flex items-start gap-2">
                            {/* Day labels (Mon, Wed, Fri) */}
                            <div className="flex flex-col gap-[3px] text-[10px] font-medium text-slate-400 pr-1 pt-[13px]">
                                <span className="h-2.5 leading-none">Mon</span>
                                <span className="h-2.5 leading-none opacity-0">Tue</span>
                                <span className="h-2.5 leading-none">Wed</span>
                                <span className="h-2.5 leading-none opacity-0">Thu</span>
                                <span className="h-2.5 leading-none">Fri</span>
                                <span className="h-2.5 leading-none opacity-0">Sat</span>
                                <span className="h-2.5 leading-none opacity-0">Sun</span>
                            </div>

                            {/* Squares Grid */}
                            <div className="flex gap-[3px]">
                                {weeks.map((week, wIdx) => (
                                    <div key={wIdx} className="flex flex-col gap-[3px]">
                                        {week.map((day, dIdx) => (
                                            <div
                                                key={dIdx}
                                                onMouseEnter={() => setHoveredDay(day)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] border transition-all cursor-pointer ${getLevelColor(
                                                    day.level
                                                )}`}
                                                title={`${day.count > 0 || day.sets > 0 ? `${day.count || 1} workout session${day.count > 1 ? 's' : ''} (${day.sets} sets, ${day.volume} kg)` : 'No workout contributions'} on ${day.date}`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hover Tooltip / Activity Bar */}
                        <div className="h-6 flex items-center justify-between pt-3 text-xs text-slate-400">
                            <div>
                                {hoveredDay ? (
                                    <span className="font-medium text-slate-200">
                                        <strong className="text-emerald-400">
                                            {hoveredDay.count > 0 || hoveredDay.sets > 0
                                                ? `${hoveredDay.count || 1} workout${hoveredDay.count > 1 ? 's' : ''}`
                                                : 'No workouts'}
                                        </strong>{' '}
                                        {(hoveredDay.count > 0 || hoveredDay.sets > 0) && `(${hoveredDay.sets} sets • ${hoveredDay.volume} kg volume) `}
                                        on {hoveredDay.date}
                                    </span>
                                ) : (
                                    <span className="text-slate-500 hover:text-slate-400 transition-colors">
                                        Learn how we count contributions
                                    </span>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>Less</span>
                                <div className="flex gap-[3px]">
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#161b22] border border-[#21262d]" />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0e6231] border border-[#167e42]" />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#178846] border border-[#1fa054]" />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#26a641] border border-[#31b64d]" />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353] border border-[#4ce866]" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Year Selector Sidebar Tabs */}
            <div className="flex flex-row lg:flex-col gap-1.5 w-full lg:w-28 shrink-0">
                {years.map((year) => {
                    const isActive = year === selectedYear && rangePreset === '1Y';

                    return (
                        <button
                            key={year}
                            onClick={() => {
                                setSelectedYear(year);
                                setRangePreset('1Y');
                            }}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                isActive
                                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-lg shadow-blue-600/30'
                                    : 'bg-[#0d1117]/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            }`}
                        >
                            {year}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
