import React, { useState } from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  Coffee,
  Moon,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Bell,
  Sparkles,
  Timer,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ActivityCategory,
  DailyLog,
  NotificationSettings,
  ScheduleBlock,
} from '../types';

interface TodayViewProps {
  logs: DailyLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onUpdateLog: (updatedLog: DailyLog) => void;
  onOpenCheckIn: () => void;
  onNavigateToFocus: (taskTitle?: string, durationMins?: number) => void;
  notificationSettings: NotificationSettings;
  onTriggerTestNotification: () => void;
  onToggleDailyReminder: () => void;
}

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; colorText: string; colorBg: string; borderAccent: string }
> = {
  work: {
    label: 'Office & Deep Work',
    colorText: 'text-[#d0bcff]',
    colorBg: 'bg-[#8b5cf6]/15',
    borderAccent: 'border-[#8b5cf6]/30',
  },
  workout: {
    label: 'Workout & Training',
    colorText: 'text-[#4edea3]',
    colorBg: 'bg-[#10b981]/15',
    borderAccent: 'border-[#10b981]/30',
  },
  'self-improvement': {
    label: 'Self-Improvement',
    colorText: 'text-[#7bd0ff]',
    colorBg: 'bg-[#38bdf8]/15',
    borderAccent: 'border-[#38bdf8]/30',
  },
  'free-time': {
    label: 'Free Time & Leisure',
    colorText: 'text-[#f59e0b]',
    colorBg: 'bg-[#f59e0b]/15',
    borderAccent: 'border-[#f59e0b]/30',
  },
  sleep: {
    label: 'Sleep & Restoration',
    colorText: 'text-[#60a5fa]',
    colorBg: 'bg-[#60a5fa]/15',
    borderAccent: 'border-[#60a5fa]/30',
  },
};

export const TodayView: React.FC<TodayViewProps> = ({
  logs,
  selectedDate,
  onSelectDate,
  onUpdateLog,
  onOpenCheckIn,
  onNavigateToFocus,
  notificationSettings,
  onTriggerTestNotification,
  onToggleDailyReminder,
}) => {
  const recentSevenDays = logs.slice(-7);
  const currentLog = logs.find((l) => l.date === selectedDate) || logs[logs.length - 1];

  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [showAddBlockForm, setShowAddBlockForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityCategory>('work');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:30');
  const [newNotes, setNewNotes] = useState('');

  const adjustHours = (
    field: 'workHours' | 'workoutHours' | 'selfImprovementHours' | 'freeTimeHours',
    delta: number
  ) => {
    const nextVal = Math.max(0, Math.min(16, Number((currentLog[field] + delta).toFixed(2))));
    onUpdateLog({
      ...currentLog,
      [field]: nextVal,
    });
  };

  const adjustSleepMinutes = (deltaMins: number) => {
    const nextMins = Math.max(180, Math.min(720, currentLog.sleep.totalMinutes + deltaMins));
    const deep = Math.round(nextMins * 0.22);
    const rem = Math.round(nextMins * 0.28);
    const awake = Math.max(15, Math.round(nextMins * 0.06));
    const light = Math.max(60, nextMins - deep - rem - awake);

    onUpdateLog({
      ...currentLog,
      sleep: {
        ...currentLog.sleep,
        totalMinutes: nextMins,
        deepMinutes: deep,
        remMinutes: rem,
        lightMinutes: light,
        awakeMinutes: awake,
      },
    });
  };

  const toggleBlockCompletion = (blockId: string) => {
    const updatedSchedule = currentLog.schedule.map((blk) =>
      blk.id === blockId ? { ...blk, completed: !blk.completed } : blk
    );
    onUpdateLog({
      ...currentLog,
      schedule: updatedSchedule,
    });
  };

  const deleteBlock = (blockId: string) => {
    const target = currentLog.schedule.find((b) => b.id === blockId);
    const updatedSchedule = currentLog.schedule.filter((b) => b.id !== blockId);
    const nextLog = { ...currentLog, schedule: updatedSchedule };

    if (target) {
      const hrsDelta = Number((target.durationMinutes / 60).toFixed(2));
      if (target.category === 'work') {
        nextLog.workHours = Math.max(0, Number((nextLog.workHours - hrsDelta).toFixed(1)));
      } else if (target.category === 'workout') {
        nextLog.workoutHours = Math.max(0, Number((nextLog.workoutHours - hrsDelta).toFixed(1)));
      } else if (target.category === 'self-improvement') {
        nextLog.selfImprovementHours = Math.max(
          0,
          Number((nextLog.selfImprovementHours - hrsDelta).toFixed(1))
        );
      } else if (target.category === 'free-time') {
        nextLog.freeTimeHours = Math.max(0, Number((nextLog.freeTimeHours - hrsDelta).toFixed(1)));
      }
    }
    onUpdateLog(nextLog);
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const [sh, sm] = newStartTime.split(':').map(Number);
    const [eh, em] = newEndTime.split(':').map(Number);
    let diffMins = eh * 60 + em - (sh * 60 + sm);
    if (diffMins <= 0) diffMins += 24 * 60;

    const createdBlock: ScheduleBlock = {
      id: `blk-${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      durationMinutes: diffMins,
      completed: false,
      notes: newNotes.trim() || `${CATEGORY_META[newCategory].label} scheduled block`,
    };

    const sortedSchedule = [...currentLog.schedule, createdBlock].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const addedHrs = Number((diffMins / 60).toFixed(1));
    const nextLog: DailyLog = {
      ...currentLog,
      schedule: sortedSchedule,
    };

    if (newCategory === 'work') {
      nextLog.workHours = Number((nextLog.workHours + addedHrs).toFixed(1));
    } else if (newCategory === 'workout') {
      nextLog.workoutHours = Number((nextLog.workoutHours + addedHrs).toFixed(1));
    } else if (newCategory === 'self-improvement') {
      nextLog.selfImprovementHours = Number((nextLog.selfImprovementHours + addedHrs).toFixed(1));
    } else if (newCategory === 'free-time') {
      nextLog.freeTimeHours = Number((nextLog.freeTimeHours + addedHrs).toFixed(1));
    }

    onUpdateLog(nextLog);
    setNewTitle('');
    setNewNotes('');
    setShowAddBlockForm(false);
  };

  const filteredSchedule =
    categoryFilter === 'all'
      ? currentLog.schedule
      : currentLog.schedule.filter((b) => b.category === categoryFilter);

  const sleepHrs = Math.floor(currentLog.sleep.totalMinutes / 60);
  const sleepMins = currentLog.sleep.totalMinutes % 60;
  const totalTrackedHours = Number(
    (
      currentLog.workHours +
      currentLog.workoutHours +
      currentLog.selfImprovementHours +
      currentLog.freeTimeHours +
      currentLog.sleep.totalMinutes / 60
    ).toFixed(1)
  );

  return (
    <div className="space-y-8">
      {/* Top Header & Date Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8b949e] mb-1">
            <span>Daily Rhythm & Activity Cockpit</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{totalTrackedHours}h / 24h Allocated</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#4edea3]">
              {currentLog.checkedIn ? 'Daily Check-In Completed' : 'Awaiting Evening Log'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f0f6fc] tracking-tight">
            {currentLog.dayShort}, {currentLog.label} Schedule & Hours
          </h1>
        </div>

        {/* 7-Day Horizontal Date Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {recentSevenDays.map((day) => {
            const isSelected = day.date === currentLog.date;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={`min-h-[52px] min-w-[56px] px-3 py-2 rounded-xl flex flex-col items-center justify-center transition-colors border shrink-0 ${
                  isSelected
                    ? 'bg-[#8b5cf6] text-white border-[#a078ff] shadow-[0_8px_24px_-4px_rgba(139,92,246,0.4)]'
                    : 'bg-[#161b22] text-[#8b949e] border-white/10 hover:text-[#f0f6fc] hover:bg-[#1c2026]'
                }`}
              >
                <span className="text-[11px] font-medium">{day.dayShort}</span>
                <span className="text-sm font-bold font-mono tabular-nums mt-0.5">
                  {day.dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Check-In Notification & AI Reflection Banner */}
      <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#d0bcff]">
            <Bell className="w-4 h-4 text-[#4edea3]" />
            <span>
              Daily Check-In Reminder {notificationSettings.dailyReminderEnabled ? 'Active' : 'Paused'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Scheduled for {notificationSettings.dailyReminderTime}
            </span>
          </div>
          <h2 className="text-base font-semibold text-[#f0f6fc]">
            Log What You Did Throughout the Day
          </h2>
          <p className="text-sm text-[#8b949e] max-w-2xl">
            {currentLog.reflectionNote ||
              'Get your daily evening notification to fill in your office working hours, workout session, self-improvement habits, free time, and sleep cycle.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleDailyReminder}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-medium text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0"
          >
            {notificationSettings.dailyReminderEnabled ? 'Mute Reminder' : 'Enable Reminder'}
          </button>
          <button
            type="button"
            onClick={onTriggerTestNotification}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-medium text-[#7bd0ff] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Daily Notification</span>
          </button>
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-xs font-semibold text-white hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fill Today&apos;s Activity Log</span>
          </button>
        </div>
      </div>

      {/* 5-Pillar Daily Hours Tracker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Working Hours */}
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Working Hours</span>
            <Briefcase className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">
              {currentLog.workHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 tabular-nums">
              Office & Deep Focus · Goal 8.0h
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#262a31] overflow-hidden">
              <div
                className="h-full bg-[#8b5cf6] rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLog.workHours / 8) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => adjustHours('workHours', -0.5)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f0f6fc] border border-white/10"
              >
                -0.5h
              </button>
              <button
                type="button"
                onClick={() => adjustHours('workHours', 0.5)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#d0bcff] border border-white/10"
              >
                +0.5h
              </button>
            </div>
          </div>
        </div>

        {/* 2. Workout Hours */}
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Workout Hours</span>
            <Dumbbell className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#4edea3] font-mono tabular-nums">
              {currentLog.workoutHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 tabular-nums">
              Strength & Cardio · Goal 1.2h
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#262a31] overflow-hidden">
              <div
                className="h-full bg-[#4edea3] rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLog.workoutHours / 1.5) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => adjustHours('workoutHours', -0.25)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f0f6fc] border border-white/10"
              >
                -15m
              </button>
              <button
                type="button"
                onClick={() => adjustHours('workoutHours', 0.25)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#4edea3] border border-white/10"
              >
                +15m
              </button>
            </div>
          </div>
        </div>

        {/* 3. Self-Improvement */}
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Self-Improvement</span>
            <BookOpen className="w-4 h-4 text-[#7bd0ff]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#7bd0ff] font-mono tabular-nums">
              {currentLog.selfImprovementHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 tabular-nums">
              Reading & Study · Goal 1.0h
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#262a31] overflow-hidden">
              <div
                className="h-full bg-[#7bd0ff] rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLog.selfImprovementHours / 1.5) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => adjustHours('selfImprovementHours', -0.25)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f0f6fc] border border-white/10"
              >
                -15m
              </button>
              <button
                type="button"
                onClick={() => adjustHours('selfImprovementHours', 0.25)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#7bd0ff] border border-white/10"
              >
                +15m
              </button>
            </div>
          </div>
        </div>

        {/* 4. Free Time */}
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Free Time</span>
            <Coffee className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#f59e0b] font-mono tabular-nums">
              {currentLog.freeTimeHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 tabular-nums">
              Rest & Social · Goal 3.0h
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#262a31] overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLog.freeTimeHours / 4) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => adjustHours('freeTimeHours', -0.5)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f0f6fc] border border-white/10"
              >
                -30m
              </button>
              <button
                type="button"
                onClick={() => adjustHours('freeTimeHours', 0.5)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f59e0b] border border-white/10"
              >
                +30m
              </button>
            </div>
          </div>
        </div>

        {/* 5. Sleep Time */}
        <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8b949e]">Sleep Cycle</span>
            <Moon className="w-4 h-4 text-[#60a5fa]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">
              {sleepHrs}h {sleepMins}m
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 tabular-nums">
              {currentLog.sleep.bedtime} – {currentLog.sleep.wakeTime}
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-[#262a31] overflow-hidden">
              <div
                className="h-full bg-[#60a5fa] rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLog.sleep.totalMinutes / 480) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => adjustSleepMinutes(-15)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#f0f6fc] border border-white/10"
              >
                -15m
              </button>
              <button
                type="button"
                onClick={() => adjustSleepMinutes(15)}
                className="min-h-[36px] px-2.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] text-xs font-mono text-[#60a5fa] border border-white/10"
              >
                +15m
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split: Daily Schedule Timeline + Bio-Allocation & Quick Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Chronological Daily Schedule */}
        <div className="lg:col-span-8 rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#f0f6fc]">
                Daily Schedule & Time Blocks
              </h2>
              <p className="text-xs text-[#8b949e]">
                Click any block to mark completed or launch a shielded focus timer
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBlockForm((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddBlockForm ? 'Close Form' : 'Add Schedule Block'}</span>
            </button>
          </div>

          {/* Interactive Category Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-[#0d1117] rounded-xl border border-white/5">
            {(
              [
                ['all', 'All Blocks'],
                ['work', 'Work'],
                ['workout', 'Workout'],
                ['self-improvement', 'Self-Improvement'],
                ['free-time', 'Free Time'],
                ['sleep', 'Sleep'],
              ] as const
            ).map(([catKey, label]) => (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === catKey
                    ? 'bg-[#262a31] text-[#f0f6fc] shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Add New Schedule Block Inline Form */}
          {showAddBlockForm && (
            <form
              onSubmit={handleAddBlock}
              className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Activity Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Deep Work — System Design"
                    className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                    className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] focus:outline-none focus:border-[#8b5cf6]"
                  >
                    <option value="work">Office & Deep Work</option>
                    <option value="workout">Workout & Training</option>
                    <option value="self-improvement">Self-Improvement</option>
                    <option value="free-time">Free Time & Leisure</option>
                    <option value="sleep">Sleep & Restoration</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8b949e] mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Key objective or target"
                    className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlockForm(false)}
                  className="px-3.5 py-2 rounded-lg text-xs text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-xs font-semibold text-white"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          )}

          {/* Timeline List */}
          {filteredSchedule.length === 0 ? (
            <div className="rounded-xl bg-[#0d1117] border border-white/5 p-8 text-center space-y-3">
              <Clock className="w-8 h-8 text-[#8b949e] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#f0f6fc]">
                  No schedule blocks in this category yet
                </p>
                <p className="text-xs text-[#8b949e]">
                  Add a new time block or use the AI Daily Check-In to populate your schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBlockForm(true)}
                className="px-4 py-2 rounded-lg bg-[#1c2026] border border-white/10 text-xs font-medium text-[#d0bcff] hover:bg-[#262a31]"
              >
                Log First Entry
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredSchedule.map((block) => {
                const meta = CATEGORY_META[block.category];
                return (
                  <div
                    key={block.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleBlockCompletion(block.id)}
                        className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-[#8b949e] hover:text-[#4edea3] transition-colors shrink-0"
                        aria-label={`Mark ${block.title} as ${
                          block.completed ? 'incomplete' : 'completed'
                        }`}
                      >
                        {block.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b949e]">
                          <span className="font-mono tabular-nums text-[#f0f6fc]">
                            {block.startTime} – {block.endTime}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className={meta.colorText}>{meta.label}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{block.durationMinutes}m</span>
                        </div>
                        <h3
                          className={`text-sm font-semibold ${
                            block.completed ? 'text-[#8b949e] line-through' : 'text-[#f0f6fc]'
                          }`}
                        >
                          {block.title}
                        </h3>
                        {block.notes && (
                          <p className="text-xs text-[#8b949e] leading-relaxed">{block.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {(block.category === 'work' || block.category === 'self-improvement') && (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToFocus(
                              block.title,
                              Math.min(90, Math.max(25, block.durationMinutes))
                            )
                          }
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-medium text-[#d0bcff] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>Focus Shield</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#8b949e] hover:text-[#ffb4ab] hover:bg-white/5 transition-colors"
                        aria-label={`Delete ${block.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: 24-Hour Circadian Balance & AI Daily Cue */}
        <div className="lg:col-span-4 space-y-6">
          {/* 24h Proportional Distribution Card */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#f0f6fc]">24-Hour Bio-Allocation</h2>
                <p className="text-xs text-[#8b949e]">Proportion of day across core domains</p>
              </div>
              <SlidersHorizontal className="w-4 h-4 text-[#8b949e]" />
            </div>

            {/* Segmented Bar */}
            <div className="h-3 w-full rounded-full bg-[#0d1117] overflow-hidden flex">
              <div
                className="h-full bg-[#8b5cf6]"
                style={{ width: `${(currentLog.workHours / 24) * 100}%` }}
                title={`Working: ${currentLog.workHours}h`}
              />
              <div
                className="h-full bg-[#4edea3]"
                style={{ width: `${(currentLog.workoutHours / 24) * 100}%` }}
                title={`Workout: ${currentLog.workoutHours}h`}
              />
              <div
                className="h-full bg-[#7bd0ff]"
                style={{ width: `${(currentLog.selfImprovementHours / 24) * 100}%` }}
                title={`Self-Improvement: ${currentLog.selfImprovementHours}h`}
              />
              <div
                className="h-full bg-[#f59e0b]"
                style={{ width: `${(currentLog.freeTimeHours / 24) * 100}%` }}
                title={`Free Time: ${currentLog.freeTimeHours}h`}
              />
              <div
                className="h-full bg-[#60a5fa]"
                style={{ width: `${(currentLog.sleep.totalMinutes / 60 / 24) * 100}%` }}
                title={`Sleep: ${sleepHrs}h ${sleepMins}m`}
              />
            </div>

            {/* Domain Breakdown Table */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#d0bcff]">Office & Deep Work</span>
                <span className="font-mono tabular-nums text-[#f0f6fc]">
                  {currentLog.workHours.toFixed(1)}h ·{' '}
                  {Math.round((currentLog.workHours / 24) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#4edea3]">Workout & Movement</span>
                <span className="font-mono tabular-nums text-[#f0f6fc]">
                  {currentLog.workoutHours.toFixed(1)}h ·{' '}
                  {Math.round((currentLog.workoutHours / 24) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#7bd0ff]">Self-Improvement</span>
                <span className="font-mono tabular-nums text-[#f0f6fc]">
                  {currentLog.selfImprovementHours.toFixed(1)}h ·{' '}
                  {Math.round((currentLog.selfImprovementHours / 24) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-[#f59e0b]">Free Time & Recovery</span>
                <span className="font-mono tabular-nums text-[#f0f6fc]">
                  {currentLog.freeTimeHours.toFixed(1)}h ·{' '}
                  {Math.round((currentLog.freeTimeHours / 24) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#60a5fa]">Sleep Cycle</span>
                <span className="font-mono tabular-nums text-[#f0f6fc]">
                  {sleepHrs}h {sleepMins}m ·{' '}
                  {Math.round((currentLog.sleep.totalMinutes / 60 / 24) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Coach Feedback Card */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#d0bcff]">
              <Sparkles className="w-4 h-4" />
              <span>AI Circadian & Productivity Cue</span>
            </div>
            <h3 className="text-base font-semibold text-[#f0f6fc]">
              Optimal Cognitive & Workout Alignment
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              {currentLog.aiCoachFeedback ||
                'Your deep sleep ratio supports a 9:30 AM – 11:45 AM peak focus block today. Complete high-intensity workouts before 7:00 PM to protect tonight’s melatonin onset.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateToFocus('Deep Work Session - Peak Cognitive Window', 50)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-semibold text-[#d0bcff] flex items-center justify-center gap-2 transition-colors"
              >
                <Timer className="w-4 h-4" />
                <span>Start 50m Shielded Deep Work</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
