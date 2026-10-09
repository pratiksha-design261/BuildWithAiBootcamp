import React, { useState } from 'react';
import {
  RefreshCw,
  Sparkles,
  Brain,
  Activity,
  Award,
  CheckSquare,
  Square,
  Play,
  Pause,
  Moon,
  Clock,
  CheckCircle2,
  Plus,
  Sliders,
  Volume2,
} from 'lucide-react';
import {
  AIRhythmInsights,
  DailyLog,
  SelfImprovementHabit,
  WindDownStep,
} from '../types';
import { SoundscapeId } from '../utils/soundEngine';
import sleepSanctuaryImg from '../assets/images/ambient_sleep_sanctuary_1791541206617.jpg';

interface SleepAIViewProps {
  currentLog: DailyLog;
  logs: DailyLog[];
  onUpdateLog: (updated: DailyLog) => void;
  habits: SelfImprovementHabit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string, targetLabel: string) => void;
  windDownSteps: WindDownStep[];
  onToggleWindDown: (id: string) => void;
  onActivateNightCocoon: () => void;
  aiInsights: AIRhythmInsights;
  isRefreshingAI: boolean;
  onRefreshAI: () => void;
  activeSoundscape: SoundscapeId;
  isPlayingAudio: boolean;
  onToggleAudio: (id?: SoundscapeId) => void;
}

export const SleepAIView: React.FC<SleepAIViewProps> = ({
  currentLog,
  logs,
  onUpdateLog,
  habits,
  onToggleHabit,
  onAddHabit,
  windDownSteps,
  onToggleWindDown,
  onActivateNightCocoon,
  aiInsights,
  isRefreshingAI,
  onRefreshAI,
  activeSoundscape,
  isPlayingAudio,
  onToggleAudio,
}) => {
  const [showSleepEditor, setShowSleepEditor] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState('25 mins daily');
  const [hoveredHypnoIndex, setHoveredHypnoIndex] = useState<number | null>(null);

  const { sleep } = currentLog;
  const totalHrs = Math.floor(sleep.totalMinutes / 60);
  const totalMins = sleep.totalMinutes % 60;

  const deepHrs = Math.floor(sleep.deepMinutes / 60);
  const deepMins = sleep.deepMinutes % 60;
  const remHrs = Math.floor(sleep.remMinutes / 60);
  const remMins = sleep.remMinutes % 60;
  const lightHrs = Math.floor(sleep.lightMinutes / 60);
  const lightMins = sleep.lightMinutes % 60;

  const deepPct = Math.round((sleep.deepMinutes / sleep.totalMinutes) * 100);
  const remPct = Math.round((sleep.remMinutes / sleep.totalMinutes) * 100);
  const awakePct = Math.max(2, Math.round((sleep.awakeMinutes / sleep.totalMinutes) * 100));
  const lightPct = Math.max(10, 100 - deepPct - remPct - awakePct);

  // Calculate 7-day rolling average sleep comparison
  const recent7 = logs.slice(-7);
  const avg7Mins =
    recent7.reduce((acc, item) => acc + item.sleep.totalMinutes, 0) / Math.max(1, recent7.length);
  const diffVsAvg = Math.round(sleep.totalMinutes - avg7Mins);
  const diffLabel = `${diffVsAvg >= 0 ? '+' : ''}${diffVsAvg}m vs avg`;

  // Calculate dynamic Self-Improvement Scorecard out of 100
  const completedHabitsCount = habits.filter((h) => h.completed).length;
  const scorecardValue =
    habits.length > 0 ? Math.round(60 + (completedHabitsCount / habits.length) * 40) : 86;

  const activeWindDownCount = windDownSteps.filter((s) => s.enabled).length;

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    onAddHabit(newHabitTitle.trim(), newHabitTarget.trim() || 'Daily target');
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const hypnoLabels = ['11:15 PM', '12:30 AM', '1:45 AM', '3:00 AM', '4:15 AM', '5:30 AM', '7:03 AM'];
  const stageNameForVal = (val: number) => {
    if (val <= 20) return 'Awake / Transition';
    if (val <= 40) return 'REM Sleep';
    if (val <= 65) return 'Light Sleep';
    return 'Deep Slow-Wave Sleep';
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <span className="text-[#4edea3] font-medium">Circadian Sync 96%</span>
            <span aria-hidden="true">·</span>
            <span>Updated {aiInsights.lastUpdated}</span>
            <span aria-hidden="true">·</span>
            <span>{currentLog.label}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f6fc] tracking-tight">
            Sleep & AI Bio-Intelligence Hub
          </h1>
          <p className="text-sm text-[#8b949e]">
            Cognitive regeneration, office work correlation & daily self-improvement alignment
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowSleepEditor((prev) => !prev)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#161b22] hover:bg-[#1c2026] border border-white/10 text-xs font-medium text-[#f0f6fc] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-[#7bd0ff]" />
            <span>{showSleepEditor ? 'Done Editing' : 'Edit Sleep Cycle'}</span>
          </button>
          <button
            type="button"
            onClick={onRefreshAI}
            disabled={isRefreshingAI}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 text-xs font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAI ? 'animate-spin' : ''}`} />
            <span>{isRefreshingAI ? 'Analyzing Bio-Data...' : 'Refresh AI Cues'}</span>
          </button>
        </div>
      </div>

      {/* Optional Inline Sleep Editor */}
      {showSleepEditor && (
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">
              Adjust Last Night&apos;s Sleep Parameters ({currentLog.label})
            </h2>
            <span className="text-xs text-[#7bd0ff] font-mono tabular-nums">
              {totalHrs}h {totalMins}m Total
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Total Sleep (Minutes)</label>
              <input
                type="number"
                min={200}
                max={720}
                step={10}
                value={sleep.totalMinutes}
                onChange={(e) => {
                  const mins = Math.max(180, Math.min(720, Number(e.target.value) || 460));
                  const deep = Math.round(mins * 0.22);
                  const rem = Math.round(mins * 0.28);
                  const awake = Math.max(15, Math.round(mins * 0.06));
                  const light = Math.max(60, mins - deep - rem - awake);
                  onUpdateLog({
                    ...currentLog,
                    sleep: {
                      ...sleep,
                      totalMinutes: mins,
                      deepMinutes: deep,
                      remMinutes: rem,
                      lightMinutes: light,
                      awakeMinutes: awake,
                    },
                  });
                }}
                className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Bedtime</label>
              <input
                type="text"
                value={sleep.bedtime}
                onChange={(e) =>
                  onUpdateLog({
                    ...currentLog,
                    sleep: { ...sleep, bedtime: e.target.value },
                  })
                }
                className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Wake Time</label>
              <input
                type="text"
                value={sleep.wakeTime}
                onChange={(e) =>
                  onUpdateLog({
                    ...currentLog,
                    sleep: { ...sleep, wakeTime: e.target.value },
                  })
                }
                className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Sleep Quality Score (1–100)</label>
              <input
                type="number"
                min={40}
                max={100}
                value={sleep.qualityScore}
                onChange={(e) =>
                  onUpdateLog({
                    ...currentLog,
                    sleep: {
                      ...sleep,
                      qualityScore: Math.max(40, Math.min(100, Number(e.target.value) || 88)),
                    },
                  })
                }
                className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main 12-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Hypnogram Master Card + Sleep Debt + Ambiance + Evening Wind-Down */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Score & Hypnogram Master Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-6">
            {/* Main Metric Split */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#8b949e]">Last Night Total</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold text-[#f0f6fc] font-mono tabular-nums">
                    {totalHrs}h {totalMins}m
                  </span>
                  <span className="text-xs font-semibold text-[#4edea3] font-mono tabular-nums">
                    {diffLabel}
                  </span>
                </div>
              </div>

              {/* Sleep Score Dial */}
              <div className="flex items-center gap-3 bg-[#1c2026] border border-white/10 px-4 py-2.5 rounded-xl">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#30363d] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                    />
                    <path
                      className="text-[#d0bcff] stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${sleep.qualityScore}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-[#d0bcff] font-mono tabular-nums">
                    {sleep.qualityScore}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#8b949e] block">Tempo Quality</span>
                  <span className="text-sm font-semibold text-[#4edea3]">
                    {sleep.qualityScore >= 85 ? 'Optimal' : sleep.qualityScore >= 75 ? 'Good' : 'Fair'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hypnogram Curve Waveform */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8b949e] font-medium">
                  Sleep Architecture (Hypnogram)
                </span>
                <span className="text-[#7bd0ff] font-mono tabular-nums">
                  {hoveredHypnoIndex !== null
                    ? `${stageNameForVal(sleep.hypnogramPoints[hoveredHypnoIndex])}`
                    : `Efficiency: ${sleep.efficiency}%`}
                </span>
              </div>

              <div className="h-28 w-full relative bg-[#0a0e14] rounded-xl p-3 flex items-end overflow-hidden border border-white/5">
                <svg
                  className="w-full h-full overflow-visible"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 320 60"
                >
                  <defs>
                    <linearGradient id="hypnoGradientReact" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#7bd0ff" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line
                    stroke="#494454"
                    strokeDasharray="2 2"
                    strokeOpacity="0.35"
                    x1="0"
                    x2="320"
                    y1="12"
                    y2="12"
                  />
                  <line
                    stroke="#494454"
                    strokeDasharray="2 2"
                    strokeOpacity="0.35"
                    x1="0"
                    x2="320"
                    y1="32"
                    y2="32"
                  />
                  <line
                    stroke="#494454"
                    strokeDasharray="2 2"
                    strokeOpacity="0.35"
                    x1="0"
                    x2="320"
                    y1="50"
                    y2="50"
                  />
                  <path
                    d="M0,8 L20,8 L26,48 L55,48 L65,30 L88,30 L96,52 L132,52 L142,20 L176,20 L188,44 L210,44 L220,18 L254,18 L266,42 L290,42 L302,12 L320,12 L320,60 L0,60 Z"
                    fill="url(#hypnoGradientReact)"
                  />
                  <path
                    d="M0,8 L20,8 L26,48 L55,48 L65,30 L88,30 L96,52 L132,52 L142,20 L176,20 L188,44 L210,44 L220,18 L254,18 L266,42 L290,42 L302,12 L320,12"
                    stroke="#d0bcff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                  />
                  {sleep.hypnogramPoints.map((pt, idx) => {
                    const x = (idx / Math.max(1, sleep.hypnogramPoints.length - 1)) * 320;
                    const y = Math.max(6, Math.min(54, (pt / 100) * 56));
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={hoveredHypnoIndex === idx ? 4.5 : 2.5}
                        className="fill-[#7bd0ff] cursor-pointer transition-transform"
                        onMouseEnter={() => setHoveredHypnoIndex(idx)}
                        onMouseLeave={() => setHoveredHypnoIndex(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[#8b949e] font-mono tabular-nums px-1">
                <span>{sleep.bedtime}</span>
                {hypnoLabels.slice(1, -1).map((t) => (
                  <span key={t} className="hidden sm:inline">
                    {t}
                  </span>
                ))}
                <span>{sleep.wakeTime}</span>
              </div>
            </div>

            {/* Segmented Stage Breakdown Bar */}
            <div className="space-y-3">
              <div className="h-2.5 w-full bg-[#262a31] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#d0bcff]"
                  style={{ width: `${deepPct}%` }}
                  title={`Deep Sleep: ${deepPct}%`}
                />
                <div
                  className="h-full bg-[#7bd0ff]"
                  style={{ width: `${remPct}%` }}
                  title={`REM Sleep: ${remPct}%`}
                />
                <div
                  className="h-full bg-[#d0bcff]/45"
                  style={{ width: `${lightPct}%` }}
                  title={`Light Sleep: ${lightPct}%`}
                />
                <div
                  className="h-full bg-[#ffb4ab]"
                  style={{ width: `${awakePct}%` }}
                  title={`Awake: ${awakePct}%`}
                />
              </div>

              {/* 4 Stage Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#1c2026] border border-white/5">
                  <span className="text-xs text-[#d0bcff] block">Deep ({deepPct}%)</span>
                  <span className="text-base font-bold text-[#f0f6fc] font-mono tabular-nums mt-0.5 block">
                    {deepHrs}h {deepMins}m
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2026] border border-white/5">
                  <span className="text-xs text-[#7bd0ff] block">REM ({remPct}%)</span>
                  <span className="text-base font-bold text-[#f0f6fc] font-mono tabular-nums mt-0.5 block">
                    {remHrs}h {remMins}m
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2026] border border-white/5">
                  <span className="text-xs text-[#8b949e] block">Light ({lightPct}%)</span>
                  <span className="text-base font-bold text-[#f0f6fc] font-mono tabular-nums mt-0.5 block">
                    {lightHrs}h {lightMins}m
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2026] border border-white/5">
                  <span className="text-xs text-[#ffb4ab] block">Awake ({awakePct}%)</span>
                  <span className="text-base font-bold text-[#f0f6fc] font-mono tabular-nums mt-0.5 block">
                    {sleep.awakeMinutes}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Circadian Rhythm & Sleep Debt Dual Module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">Rolling 7-Day Sleep Debt</span>
                <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#4edea3] font-mono tabular-nums">
                  {diffVsAvg >= 0 ? `+${diffVsAvg}m` : `${diffVsAvg}m`}
                </div>
                <span className="text-xs text-[#f0f6fc]">
                  {diffVsAvg >= -15 ? 'Well Rested · Zero Deficit' : 'Mild Recovery Needed'}
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Cumulative balance across your past 7 rolling nights vs 7h 35m baseline.
              </p>
            </div>

            <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">Optimal Bedtime Window</span>
                <Moon className="w-4 h-4 text-[#7bd0ff]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#d0bcff] font-mono tabular-nums">
                  10:45 – 11:15 PM
                </div>
                <span className="text-xs text-[#8b949e]">Melatonin Release Peak</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7bd0ff] font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>Sleep Onset Latency: {sleep.latencyMinutes}m</span>
              </div>
            </div>
          </div>

          {/* Regeneration Ambiance Visualizer Card */}
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#161b22]">
            <img
              src={sleepSanctuaryImg}
              alt="Serene nocturnal circadian bedroom sanctuary bathed in calm indigo and cyan twilight lighting"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#d0bcff] font-medium block">
                    Regeneration Ambiance · Acoustic Neuro-Sync
                  </span>
                  <p className="text-base font-semibold text-[#f0f6fc]">
                    Alpha Wave Soundscape (10Hz Regeneration)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAudio('alpha-10hz')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#d0bcff] hover:bg-[#e9ddff] text-[#23005c] text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlayingAudio && activeSoundscape === 'alpha-10hz' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Audio</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Evening Wind-down Interactive Checklist */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#f0f6fc]">Evening Wind-down</h2>
                <p className="text-xs text-[#8b949e]">
                  Recommended bio-steps for rapid sleep onset
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#d0bcff]">
                {activeWindDownCount} / {windDownSteps.length} Ready
              </span>
            </div>

            <div className="space-y-3">
              {windDownSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => onToggleWindDown(step.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/5 cursor-pointer transition-colors"
                >
                  <div className="pr-4 min-w-0">
                    <div className="text-sm font-semibold text-[#f0f6fc] truncate">
                      {step.title}
                    </div>
                    <p className="text-xs text-[#8b949e] truncate">{step.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={step.enabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWindDown(step.id);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      step.enabled ? 'bg-[#4edea3]' : 'bg-[#31353c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full shadow-md block transform transition-transform duration-150 ${
                        step.enabled
                          ? 'translate-x-5 bg-[#002113]'
                          : 'translate-x-0 bg-[#f0f6fc]'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onActivateNightCocoon}
              className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-gradient-to-r from-[#a078ff] via-[#6d3bd7] to-[#8b5cf6] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity"
            >
              <Volume2 className="w-4 h-4" />
              <span>Activate Night Cocoon Routine</span>
            </button>
          </div>
        </div>

        {/* Right 5 Columns: AI Sleep, Office Work & Self-Improvement Intelligence */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d0bcff]" />
              <h2 className="text-lg font-semibold text-[#f0f6fc]">AI Sleep Intelligence</h2>
            </div>
            <span className="text-xs text-[#d0bcff]">3 Active Cues</span>
          </div>

          {/* Card 1: Productivity vs. Deep Sleep */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/20 text-[#d0bcff] flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">
                  {aiInsights.productivityDeepSleep.headline}
                </h3>
                <span className="text-xs text-[#4edea3]">
                  {aiInsights.productivityDeepSleep.confidenceLabel}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#8b949e] leading-relaxed">
              {aiInsights.productivityDeepSleep.summaryText}
            </p>

            <div className="p-3.5 rounded-xl bg-[#1c2026] border border-white/5 flex items-center justify-between gap-2">
              <span className="text-xs text-[#8b949e]">Today&apos;s Peak Cognitive Window:</span>
              <span className="text-xs font-bold text-[#d0bcff] font-mono tabular-nums">
                {aiInsights.productivityDeepSleep.peakCognitiveWindow}
              </span>
            </div>
          </div>

          {/* Card 2: Workout vs. Sleep Latency */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">
                  {aiInsights.workoutSleepLatency.headline}
                </h3>
                <span className="text-xs text-[#7bd0ff]">
                  {aiInsights.workoutSleepLatency.signalLabel}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#8b949e] leading-relaxed">
              {aiInsights.workoutSleepLatency.summaryText}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#4edea3]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{aiInsights.workoutSleepLatency.recommendation}</span>
            </div>
          </div>

          {/* Card 3: Self-Improvement Scorecard */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/20 text-[#7bd0ff] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc]">
                    Self-Improvement Scorecard
                  </h3>
                  <span className="text-xs text-[#8b949e]">
                    {aiInsights.selfImprovementInsight.disciplineSummary}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono tabular-nums">
                <span className="text-2xl font-bold text-[#d0bcff]">{scorecardValue}</span>
                <span className="text-xs text-[#8b949e]">/100</span>
              </div>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed">
              {aiInsights.selfImprovementInsight.topHabitAdvice}
            </p>

            {/* Interactive Habit Checklist */}
            <div className="space-y-2.5 pt-1">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/5 text-left transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-medium text-[#f0f6fc] block truncate">
                      {habit.title}
                    </span>
                    <span
                      className={`text-xs ${
                        habit.completed ? 'text-[#4edea3]' : 'text-[#8b949e]'
                      }`}
                    >
                      {habit.completed
                        ? `Completed · ${habit.streakDays}-day streak`
                        : habit.loggedDetail}
                    </span>
                  </div>
                  {habit.completed ? (
                    <CheckSquare className="w-5 h-5 text-[#4edea3] shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-[#8b949e] shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Add Custom Self-Improvement Habit */}
            {showAddHabit ? (
              <form
                onSubmit={handleAddCustomHabit}
                className="rounded-xl bg-[#0d1117] border border-white/10 p-3 space-y-2.5"
              >
                <input
                  type="text"
                  required
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Habit title (e.g., Journaling 15m)"
                  className="w-full rounded-lg bg-[#161b22] border border-white/10 px-3 py-1.5 text-xs text-[#f0f6fc]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(e.target.value)}
                    placeholder="Target (e.g., 15m evening)"
                    className="flex-1 rounded-lg bg-[#161b22] border border-white/10 px-3 py-1.5 text-xs text-[#f0f6fc]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddHabit(true)}
                className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/5 text-xs font-medium text-[#d0bcff] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Self-Improvement Habit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
