import React, { useMemo, useState } from 'react';

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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GitHubContributionCalendar({ data, className = '' }: Props) {
    const years = data?.availableYears?.length ? data.availableYears : [new Date().getFullYear()];
    const [selectedYear, setSelectedYear] = useState<number>(data?.selectedYear || years[0]);
    const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

    const days = useMemo(() => data?.days || [], [data]);

    // Group 364 days into 52 weeks (7 days per week column: Sun=0..Sat=6)
    const { weeks, monthHeaders } = useMemo(() => {
        const resultWeeks: ContributionDay[][] = [];
        const monthCols: { month: string; colIndex: number }[] = [];
        let currentWeek: ContributionDay[] = [];
        let lastMonth = -1;

        days.forEach((day, index) => {
            currentWeek.push(day);
            const date = new Date(day.date);
            const month = date.getMonth();

            // Track month header position
            if (month !== lastMonth && currentWeek.length === 1) {
                const colIdx = Math.floor(index / 7);
                monthCols.push({ month: MONTH_NAMES[month], colIndex: colIdx });
                lastMonth = month;
            }

            if (currentWeek.length === 7) {
                resultWeeks.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            resultWeeks.push(currentWeek);
        }

        return { weeks: resultWeeks, monthHeaders: monthCols };
    }, [days]);

    const totalContributions = data?.totalContributions ?? 0;

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1:
                return 'bg-[#0e4429] border-[#165634] hover:border-emerald-400';
            case 2:
                return 'bg-[#006d32] border-[#00863f] hover:border-emerald-300';
            case 3:
                return 'bg-[#26a641] border-[#31b64d] hover:border-emerald-200';
            case 4:
                return 'bg-[#39d353] border-[#4ce866] hover:border-white shadow-[0_0_6px_rgba(57,211,83,0.5)]';
            case 0:
            default:
                return 'bg-[#161b22] border-[#21262d] hover:border-slate-600';
        }
    };

    return (
        <div className={`flex flex-col lg:flex-row gap-6 items-start w-full ${className}`}>
            {/* Main Calendar Heatmap Container */}
            <div className="flex-1 w-full rounded-2xl border border-slate-800 bg-[#0d1117] p-5 sm:p-6 shadow-2xl space-y-4">
                {/* Title Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                        <span className="font-extrabold text-white">{totalContributions}</span> contributions in{' '}
                        {selectedYear === new Date().getFullYear() ? 'the last year' : selectedYear}
                    </h3>
                    <div className="text-xs text-slate-400 hidden sm:block">Contribution settings ▾</div>
                </div>

                {/* Heatmap Grid wrapper */}
                <div className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="min-w-[680px] flex flex-col gap-1 select-none">
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

                        {/* Grid: Day labels + 52 Column Squares */}
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
                                                title={`${day.count > 0 ? `${day.count} workout session${day.count > 1 ? 's' : ''} (${day.sets} sets, ${day.volume} kg)` : 'No workout contributions'} on ${day.date}`}
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
                                            {hoveredDay.count > 0
                                                ? `${hoveredDay.count} workout${hoveredDay.count > 1 ? 's' : ''}`
                                                : 'No workouts'}
                                        </strong>{' '}
                                        {hoveredDay.count > 0 && `(${hoveredDay.sets} sets • ${hoveredDay.volume} kg volume) `}
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
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0e4429] border border-[#165634]" />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#006d32] border border-[#00863f]" />
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
                    const isActive = year === selectedYear;
                    return (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
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
