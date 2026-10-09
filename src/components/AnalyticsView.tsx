import React, { useState } from 'react';
import {
  Download,
  Sparkles,
  RefreshCw,
  Briefcase,
  Dumbbell,
  BookOpen,
  Coffee,
  Moon,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { AIRhythmInsights, DailyLog } from '../types';

interface AnalyticsViewProps {
  logs: DailyLog[];
  aiInsights: AIRhythmInsights;
  isRefreshingAI: boolean;
  onRefreshAI: () => void;
  onSelectDateAndJump: (date: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  logs,
  aiInsights,
  isRefreshingAI,
  onRefreshAI,
  onSelectDateAndJump,
}) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const activeLogs = timeframe === 'weekly' ? logs.slice(-7) : logs.slice(-30);
  const count = Math.max(1, activeLogs.length);

  // Totals & Averages
  const totalWork = activeLogs.reduce((acc, l) => acc + l.workHours, 0);
  const avgWork = totalWork / count;

  const totalWorkout = activeLogs.reduce((acc, l) => acc + l.workoutHours, 0);
  const avgWorkout = totalWorkout / count;

  const totalSelf = activeLogs.reduce((acc, l) => acc + l.selfImprovementHours, 0);
  const avgSelf = totalSelf / count;

  const totalFree = activeLogs.reduce((acc, l) => acc + l.freeTimeHours, 0);
  const avgFree = totalFree / count;

  const totalSleepMins = activeLogs.reduce((acc, l) => acc + l.sleep.totalMinutes, 0);
  const avgSleepMins = Math.round(totalSleepMins / count);
  const avgSleepHrsPart = Math.floor(avgSleepMins / 60);
  const avgSleepMinsPart = avgSleepMins % 60;

  const avgQuality = Math.round(
    activeLogs.reduce((acc, l) => acc + l.sleep.qualityScore, 0) / count
  );
  const avgEfficiency = Math.round(
    activeLogs.reduce((acc, l) => acc + l.sleep.efficiency, 0) / count
  );

  const inspectedLog =
    hoveredBarIndex !== null && activeLogs[hoveredBarIndex]
      ? activeLogs[hoveredBarIndex]
      : activeLogs[activeLogs.length - 1];

  const handleDownloadCSV = () => {
    const headers = [
      'Date',
      'Day',
      'Work_Hours',
      'Workout_Hours',
      'Self_Improvement_Hours',
      'Free_Time_Hours',
      'Sleep_Minutes',
      'Sleep_Quality',
      'Bedtime',
      'Wake_Time',
    ];
    const rows = activeLogs.map((l) => [
      l.date,
      l.dayShort,
      l.workHours.toFixed(1),
      l.workoutHours.toFixed(1),
      l.selfImprovementHours.toFixed(1),
      l.freeTimeHours.toFixed(1),
      String(l.sleep.totalMinutes),
      String(l.sleep.qualityScore),
      `"${l.sleep.bedtime}"`,
      `"${l.sleep.wakeTime}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tempo-ai-${timeframe}-analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build Trend SVG coordinates for Sleep Hours vs Work+Self Hours
  const chartWidth = 640;
  const chartHeight = 160;
  const sleepPoints = activeLogs
    .map((l, idx) => {
      const x = (idx / Math.max(1, activeLogs.length - 1)) * chartWidth;
      const sleepH = l.sleep.totalMinutes / 60;
      const y = chartHeight - ((sleepH - 4) / 8) * (chartHeight - 28) - 14;
      return `${x.toFixed(1)},${Math.max(10, Math.min(chartHeight - 10, y)).toFixed(1)}`;
    })
    .join(' ');

  const workPoints = activeLogs
    .map((l, idx) => {
      const x = (idx / Math.max(1, activeLogs.length - 1)) * chartWidth;
      const productiveH = l.workHours + l.selfImprovementHours;
      const y = chartHeight - (productiveH / 12) * (chartHeight - 28) - 14;
      return `${x.toFixed(1)},${Math.max(10, Math.min(chartHeight - 10, y)).toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <span>Performance & Bio-Rhythm Telemetry</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {timeframe === 'weekly' ? 'Past 7 Rolling Days' : 'Past 30 Rolling Days'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f6fc] tracking-tight">
            {timeframe === 'weekly' ? 'Weekly' : 'Monthly'} Activity & Sleep Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Interactive Segmented Timeframe Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#161b22] border border-white/10">
            <button
              type="button"
              onClick={() => setTimeframe('weekly')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                timeframe === 'weekly'
                  ? 'bg-[#8b5cf6] text-white'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Weekly (7D)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                timeframe === 'monthly'
                  ? 'bg-[#8b5cf6] text-white'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Monthly (30D)
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#161b22] hover:bg-[#1c2026] border border-white/10 text-xs font-medium text-[#f0f6fc] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[#7bd0ff]" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Numerical KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Working Hours</span>
            <Briefcase className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">
            {totalWork.toFixed(1)}h
          </div>
          <p className="text-xs text-[#d0bcff] font-mono tabular-nums">
            {avgWork.toFixed(1)}h / day avg
          </p>
        </div>

        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Workout Hours</span>
            <Dumbbell className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="text-2xl font-bold text-[#4edea3] font-mono tabular-nums">
            {totalWorkout.toFixed(1)}h
          </div>
          <p className="text-xs text-[#4edea3] font-mono tabular-nums">
            {Math.round(avgWorkout * 60)}m / day avg
          </p>
        </div>

        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Self-Improvement</span>
            <BookOpen className="w-4 h-4 text-[#7bd0ff]" />
          </div>
          <div className="text-2xl font-bold text-[#7bd0ff] font-mono tabular-nums">
            {totalSelf.toFixed(1)}h
          </div>
          <p className="text-xs text-[#7bd0ff] font-mono tabular-nums">
            {Math.round(avgSelf * 60)}m / day avg
          </p>
        </div>

        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Free Time</span>
            <Coffee className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="text-2xl font-bold text-[#f59e0b] font-mono tabular-nums">
            {totalFree.toFixed(1)}h
          </div>
          <p className="text-xs text-[#f59e0b] font-mono tabular-nums">
            {avgFree.toFixed(1)}h / day avg
          </p>
        </div>

        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Avg Sleep Cycle</span>
            <Moon className="w-4 h-4 text-[#60a5fa]" />
          </div>
          <div className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">
            {avgSleepHrsPart}h {avgSleepMinsPart}m
          </div>
          <p className="text-xs text-[#60a5fa] font-mono tabular-nums">
            Quality {avgQuality}% · Eff {avgEfficiency}%
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Stacked Bar Chart & Correlation Trend Line */}
        <div className="lg:col-span-7 space-y-6">
          {/* Graph 1: Stacked Daily Hours Bar Chart */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#d0bcff]" />
                  <h2 className="text-base font-semibold text-[#f0f6fc]">
                    Daily Hours Breakdown ({timeframe === 'weekly' ? '7 Days' : '30 Days'})
                  </h2>
                </div>
                <p className="text-xs text-[#8b949e]">
                  Hover or tap any day bar to inspect Work, Workout, Self-Improvement, Free Time & Sleep
                </p>
              </div>
              {inspectedLog && (
                <div className="text-xs font-mono tabular-nums text-[#f0f6fc] bg-[#1c2026] px-3 py-1.5 rounded-lg border border-white/5">
                  {inspectedLog.label}: {inspectedLog.workHours}h Work · {inspectedLog.workoutHours}h
                  Gym · {Math.floor(inspectedLog.sleep.totalMinutes / 60)}h
                  {inspectedLog.sleep.totalMinutes % 60}m Sleep
                </div>
              )}
            </div>

            {/* Stacked Bars Container */}
            <div className="h-56 w-full bg-[#0a0e14] rounded-xl p-4 border border-white/5 flex items-end gap-1.5 sm:gap-2.5">
              {activeLogs.map((log, idx) => {
                const sleepH = log.sleep.totalMinutes / 60;
                const totalDay = Math.max(
                  1,
                  log.workHours +
                    log.workoutHours +
                    log.selfImprovementHours +
                    log.freeTimeHours +
                    sleepH
                );
                const scaleFactor = Math.min(100, (totalDay / 24) * 100);

                const workShare = (log.workHours / totalDay) * scaleFactor;
                const workoutShare = (log.workoutHours / totalDay) * scaleFactor;
                const selfShare = (log.selfImprovementHours / totalDay) * scaleFactor;
                const freeShare = (log.freeTimeHours / totalDay) * scaleFactor;
                const sleepShare = (sleepH / totalDay) * scaleFactor;

                return (
                  <div
                    key={log.date}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    onClick={() => onSelectDateAndJump(log.date)}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-full h-44 flex flex-col justify-end rounded-md overflow-hidden bg-[#161b22]/50 group-hover:ring-1 group-hover:ring-[#d0bcff] transition-all">
                      <div
                        style={{ height: `${sleepShare}%` }}
                        className="w-full bg-[#60a5fa]"
                        title={`Sleep: ${sleepH.toFixed(1)}h`}
                      />
                      <div
                        style={{ height: `${freeShare}%` }}
                        className="w-full bg-[#f59e0b]"
                        title={`Free Time: ${log.freeTimeHours}h`}
                      />
                      <div
                        style={{ height: `${selfShare}%` }}
                        className="w-full bg-[#7bd0ff]"
                        title={`Self-Improvement: ${log.selfImprovementHours}h`}
                      />
                      <div
                        style={{ height: `${workoutShare}%` }}
                        className="w-full bg-[#4edea3]"
                        title={`Workout: ${log.workoutHours}h`}
                      />
                      <div
                        style={{ height: `${workShare}%` }}
                        className="w-full bg-[#8b5cf6]"
                        title={`Work: ${log.workHours}h`}
                      />
                    </div>
                    {(timeframe === 'weekly' || idx % 4 === 0 || idx === activeLogs.length - 1) && (
                      <span className="text-[10px] font-mono tabular-nums text-[#8b949e] group-hover:text-[#f0f6fc]">
                        {timeframe === 'weekly' ? log.dayShort : log.dayNum}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b949e] pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-[#d0bcff]">■ Working Hrs</span>
                <span className="text-[#4edea3]">■ Workout Hrs</span>
                <span className="text-[#7bd0ff]">■ Self-Improvement</span>
                <span className="text-[#f59e0b]">■ Free Time</span>
                <span className="text-[#60a5fa]">■ Sleep Cycle</span>
              </div>
              <span className="text-[11px]">Click any bar to open that day&apos;s schedule</span>
            </div>
          </div>

          {/* Graph 2: Sleep Duration vs Office Work + Self-Improvement Trend */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#4edea3]" />
                  <h2 className="text-base font-semibold text-[#f0f6fc]">
                    Sleep Cycle vs. Productive Output Trend
                  </h2>
                </div>
                <p className="text-xs text-[#8b949e]">
                  Tracks nightly sleep duration against daily Office Work + Self-Improvement hours
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                <span className="text-[#d0bcff]">― Work + Study</span>
                <span className="text-[#4edea3]">― Sleep Hrs</span>
              </div>
            </div>

            <div className="h-44 w-full bg-[#0a0e14] rounded-xl p-3 border border-white/5 overflow-hidden">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="35"
                  x2={chartWidth}
                  y2="35"
                  stroke="#30363d"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <line
                  x1="0"
                  y1="80"
                  x2={chartWidth}
                  y2="80"
                  stroke="#30363d"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <line
                  x1="0"
                  y1="125"
                  x2={chartWidth}
                  y2="125"
                  stroke="#30363d"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <polyline
                  fill="none"
                  stroke="#d0bcff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={workPoints}
                />
                <polyline
                  fill="none"
                  stroke="#4edea3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sleepPoints}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: AI Weekly/Monthly Executive Summary & Tabular Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Weekly / Monthly Executive Summary Card */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d0bcff]" />
                <h2 className="text-lg font-semibold text-[#f0f6fc]">
                  AI {timeframe === 'weekly' ? 'Weekly' : 'Monthly'} Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={onRefreshAI}
                disabled={isRefreshingAI}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-medium text-[#d0bcff] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAI ? 'animate-spin' : ''}`} />
                <span>{isRefreshingAI ? 'Updating...' : 'Regenerate'}</span>
              </button>
            </div>

            <p className="text-sm text-[#f0f6fc] leading-relaxed">
              {aiInsights.weeklyExecutiveSummary.overview}
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#1c2026] border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-[#d0bcff] block">
                  Office Working Hours Balance
                </span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  {aiInsights.weeklyExecutiveSummary.workBalanceNote}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c2026] border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-[#7bd0ff] block">
                  Sleep Architecture & Recovery
                </span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  {aiInsights.weeklyExecutiveSummary.sleepCycleNote}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c2026] border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-[#4edea3] block">
                  Workout & Self-Improvement Synergy
                </span>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  {aiInsights.weeklyExecutiveSummary.workoutRecoveryNote}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#8b5cf6]/30 space-y-1">
                <span className="text-xs font-semibold text-[#f0f6fc] block">
                  Next 7-Day Optimization Target
                </span>
                <p className="text-xs text-[#d0bcff] leading-relaxed">
                  {aiInsights.weeklyExecutiveSummary.nextWeekFocusTarget}
                </p>
              </div>
            </div>
          </div>

          {/* High-Density Tabular Log Ledger */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#f0f6fc]">
                Daily Activity Ledger
              </h3>
              <span className="text-xs text-[#8b949e] font-mono tabular-nums">
                Showing { Math.min(7, activeLogs.length) } recent days
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#8b949e]">
                    <th className="py-2 pr-2 font-medium">Day</th>
                    <th className="py-2 px-2 font-medium text-right">Work</th>
                    <th className="py-2 px-2 font-medium text-right">Gym</th>
                    <th className="py-2 px-2 font-medium text-right">Study</th>
                    <th className="py-2 px-2 font-medium text-right">Free</th>
                    <th className="py-2 pl-2 font-medium text-right">Sleep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono tabular-nums">
                  {activeLogs
                    .slice(-7)
                    .reverse()
                    .map((row) => (
                      <tr
                        key={row.date}
                        onClick={() => onSelectDateAndJump(row.date)}
                        className="hover:bg-[#1c2026] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 pr-2 font-sans text-[#f0f6fc] whitespace-nowrap">
                          {row.dayShort}, {row.label}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#d0bcff]">
                          {row.workHours.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#4edea3]">
                          {row.workoutHours.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#7bd0ff]">
                          {row.selfImprovementHours.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#f59e0b]">
                          {row.freeTimeHours.toFixed(1)}h
                        </td>
                        <td className="py-2.5 pl-2 text-right text-[#60a5fa] whitespace-nowrap">
                          {Math.floor(row.sleep.totalMinutes / 60)}h {row.sleep.totalMinutes % 60}m
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
