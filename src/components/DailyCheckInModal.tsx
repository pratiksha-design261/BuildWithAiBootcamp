import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Clock,
  Briefcase,
  Dumbbell,
  BookOpen,
  Coffee,
  Moon,
  CheckCircle2,
  Loader2,
  Bell,
} from 'lucide-react';
import { ActivityCategory, DailyLog, ScheduleBlock } from '../types';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLog: DailyLog;
  onSaveLog: (updatedLog: DailyLog) => void;
  reminderTime: string;
  onUpdateReminderTime: (time: string) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  activeLog,
  onSaveLog,
  reminderTime,
  onUpdateReminderTime,
}) => {
  const [reflectionText, setReflectionText] = useState(activeLog.reflectionNote || '');
  const [workHours, setWorkHours] = useState(activeLog.workHours);
  const [workoutHours, setWorkoutHours] = useState(activeLog.workoutHours);
  const [selfImprovementHours, setSelfImprovementHours] = useState(activeLog.selfImprovementHours);
  const [freeTimeHours, setFreeTimeHours] = useState(activeLog.freeTimeHours);
  const [sleepHours, setSleepHours] = useState(
    Number((activeLog.sleep.totalMinutes / 60).toFixed(1))
  );
  const [bedtime, setBedtime] = useState(activeLog.sleep.bedtime);
  const [wakeTime, setWakeTime] = useState(activeLog.sleep.wakeTime);
  const [sleepQuality, setSleepQuality] = useState(activeLog.sleep.qualityScore);
  const [aiCoachNote, setAiCoachNote] = useState(activeLog.aiCoachFeedback || '');
  const [parsedBlocks, setParsedBlocks] = useState<ScheduleBlock[]>([]);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setReflectionText(activeLog.reflectionNote || '');
    setWorkHours(activeLog.workHours);
    setWorkoutHours(activeLog.workoutHours);
    setSelfImprovementHours(activeLog.selfImprovementHours);
    setFreeTimeHours(activeLog.freeTimeHours);
    setSleepHours(Number((activeLog.sleep.totalMinutes / 60).toFixed(1)));
    setBedtime(activeLog.sleep.bedtime);
    setWakeTime(activeLog.sleep.wakeTime);
    setSleepQuality(activeLog.sleep.qualityScore);
    setAiCoachNote(activeLog.aiCoachFeedback || '');
    setParsedBlocks([]);
    setAiError(null);
  }, [activeLog, isOpen]);

  if (!isOpen) return null;

  const handleParseWithAI = async () => {
    if (!reflectionText.trim()) {
      setAiError('Describe what you did today first so Tempo AI can extract your hours and schedule.');
      return;
    }
    setIsParsingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/parse-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflectionText,
          date: activeLog.date,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to parse check-in.');
      }

      if (typeof data.workHours === 'number') setWorkHours(Number(data.workHours.toFixed(1)));
      if (typeof data.workoutHours === 'number') setWorkoutHours(Number(data.workoutHours.toFixed(1)));
      if (typeof data.freeTimeHours === 'number') setFreeTimeHours(Number(data.freeTimeHours.toFixed(1)));
      if (typeof data.selfImprovementHours === 'number')
        setSelfImprovementHours(Number(data.selfImprovementHours.toFixed(1)));
      if (typeof data.sleepHours === 'number') setSleepHours(Number(data.sleepHours.toFixed(1)));
      if (data.bedtime) setBedtime(data.bedtime);
      if (data.wakeTime) setWakeTime(data.wakeTime);
      if (typeof data.sleepQuality === 'number') setSleepQuality(data.sleepQuality);
      if (data.aiCoachNote) setAiCoachNote(data.aiCoachNote);

      if (Array.isArray(data.scheduleBlocks) && data.scheduleBlocks.length > 0) {
        const validCategories: ActivityCategory[] = [
          'work',
          'workout',
          'self-improvement',
          'free-time',
          'sleep',
        ];
        const blocks: ScheduleBlock[] = data.scheduleBlocks.map(
          (b: {
            title: string;
            startTime: string;
            endTime: string;
            category: string;
            durationMinutes: number;
            notes: string;
          }, idx: number) => ({
            id: `ai-blk-${Date.now()}-${idx}`,
            title: b.title || 'Logged Activity',
            startTime: b.startTime || '09:00',
            endTime: b.endTime || '10:00',
            category: validCategories.includes(b.category as ActivityCategory)
              ? (b.category as ActivityCategory)
              : 'work',
            durationMinutes: b.durationMinutes || 60,
            completed: true,
            notes: b.notes || 'Extracted via Tempo AI Daily Check-In',
          })
        );
        setParsedBlocks(blocks);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to parse with AI.');
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMins = Math.round(sleepHours * 60);
    const deepMins = Math.round(totalSleepMins * 0.22);
    const remMins = Math.round(totalSleepMins * 0.28);
    const awakeMins = Math.max(15, Math.round(totalSleepMins * 0.06));
    const lightMins = Math.max(60, totalSleepMins - deepMins - remMins - awakeMins);

    const updatedLog: DailyLog = {
      ...activeLog,
      workHours,
      workoutHours,
      selfImprovementHours,
      freeTimeHours,
      checkedIn: true,
      reflectionNote: reflectionText,
      aiCoachFeedback:
        aiCoachNote ||
        `Logged ${workHours}h work, ${workoutHours}h workout, ${selfImprovementHours}h self-improvement, and ${freeTimeHours}h free time.`,
      sleep: {
        ...activeLog.sleep,
        totalMinutes: totalSleepMins,
        bedtime,
        wakeTime,
        qualityScore: sleepQuality,
        deepMinutes: deepMins,
        remMinutes: remMins,
        lightMinutes: lightMins,
        awakeMinutes: awakeMins,
      },
      schedule:
        parsedBlocks.length > 0 ? [...parsedBlocks, ...activeLog.schedule.slice(0, 3)] : activeLog.schedule,
    };

    onSaveLog(updatedLog);
    onClose();
  };

  const applySamplePrompt = () => {
    setReflectionText(
      'Worked 8 hours on Q4 product architecture and code reviews from 9am to 5:30pm. Did a 1.5 hour strength and running workout at 6pm, spent 1 hour reading and studying system design, had 2.5 hours of relaxing free time after dinner, and slept 7.8 hours from 11:10 PM to 6:58 AM feeling well rested.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#161b22] border border-white/10 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1c2026]">
          <div>
            <p className="text-xs text-[#8b949e]">
              Daily Activity Reflection · {activeLog.dayShort}, {activeLog.label}
            </p>
            <h2 className="text-lg font-semibold text-[#f0f6fc]">
              End-of-Day Check-In & AI Activity Log
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-white/5 transition-colors"
            aria-label="Close Daily Check-In Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Natural Language AI Quick Fill */}
          <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d0bcff]" />
                <span className="text-sm font-semibold text-[#f0f6fc]">
                  Describe Your Day (AI Auto-Parser)
                </span>
              </div>
              <button
                type="button"
                onClick={applySamplePrompt}
                className="text-xs text-[#7bd0ff] hover:underline whitespace-nowrap shrink-0"
              >
                Insert Example Summary
              </button>
            </div>
            <textarea
              rows={3}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Tell Tempo AI what you did today (e.g., 'Worked 8h at the office, 1.5h gym session at 6pm, 45m reading, 2.5h free time, slept 11:15 PM to 7:00 AM')..."
              className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3.5 py-2.5 text-sm text-[#f0f6fc] placeholder-[#8b949e]/60 focus:outline-none focus:border-[#8b5cf6]"
            />
            {aiError && <p className="text-xs text-[#ffb4ab]">{aiError}</p>}
            {aiCoachNote && (
              <div className="rounded-lg bg-[#0d1117]/80 border border-white/10 px-3.5 py-2.5 text-xs text-[#d0bcff]">
                <strong className="font-semibold text-[#f0f6fc]">AI Bio-Coach Synthesis: </strong>
                {aiCoachNote}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[#8b949e]">
                Extracts working hrs, workouts, free time, sleep & timeline blocks
              </span>
              <button
                type="button"
                onClick={handleParseWithAI}
                disabled={isParsingAI}
                className="px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                {isParsingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse Day with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Activity Hour Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Working Hours */}
            <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#d0bcff]" />
                  Office & Deep Work
                </span>
                <span className="text-base font-bold text-[#f0f6fc] font-mono tabular-nums">
                  {workHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={workHours}
                onChange={(e) => setWorkHours(parseFloat(e.target.value))}
                className="w-full accent-[#8b5cf6] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8b949e] tabular-nums">
                <span>0h</span>
                <span>Target: 8.0h</span>
                <span>14h</span>
              </div>
            </div>

            {/* Workout Hours */}
            <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-[#4edea3]" />
                  Workout & Training
                </span>
                <span className="text-base font-bold text-[#4edea3] font-mono tabular-nums">
                  {workoutHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.25"
                value={workoutHours}
                onChange={(e) => setWorkoutHours(parseFloat(e.target.value))}
                className="w-full accent-[#10b981] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8b949e] tabular-nums">
                <span>0h</span>
                <span>Target: 1.2h</span>
                <span>5h</span>
              </div>
            </div>

            {/* Self-Improvement Hours */}
            <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#7bd0ff]" />
                  Self-Improvement
                </span>
                <span className="text-base font-bold text-[#7bd0ff] font-mono tabular-nums">
                  {selfImprovementHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.25"
                value={selfImprovementHours}
                onChange={(e) => setSelfImprovementHours(parseFloat(e.target.value))}
                className="w-full accent-[#38bdf8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8b949e] tabular-nums">
                <span>0h</span>
                <span>Target: 1.0h</span>
                <span>5h</span>
              </div>
            </div>

            {/* Free Time Hours */}
            <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-[#f59e0b]" />
                  Free Time & Leisure
                </span>
                <span className="text-base font-bold text-[#f59e0b] font-mono tabular-nums">
                  {freeTimeHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={freeTimeHours}
                onChange={(e) => setFreeTimeHours(parseFloat(e.target.value))}
                className="w-full accent-[#f59e0b] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8b949e] tabular-nums">
                <span>0h</span>
                <span>Target: 3.0h</span>
                <span>10h</span>
              </div>
            </div>
          </div>

          {/* Sleep Cycle Log */}
          <div className="rounded-xl bg-[#1c2026] border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#7bd0ff]" />
                Sleep Cycle & Circadian Timing
              </span>
              <span className="text-xs text-[#7bd0ff] font-mono tabular-nums">
                {Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m · Quality {sleepQuality}%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Sleep Duration (hrs)</label>
                <input
                  type="number"
                  step="0.2"
                  min="3"
                  max="12"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 7.5)}
                  className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Bedtime</label>
                <input
                  type="text"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Wake Time</label>
                <input
                  type="text"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-2 text-sm text-[#f0f6fc] font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Daily Notification Schedule Config */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#0d1117] border border-white/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#4edea3]" />
              <div>
                <p className="text-xs font-medium text-[#f0f6fc]">
                  Daily Check-In Reminder Notification
                </p>
                <p className="text-[11px] text-[#8b949e]">
                  Prompts you every evening to log your working hrs, workout, free time & sleep
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#8b949e]" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => onUpdateReminderTime(e.target.value)}
                className="rounded-lg bg-[#1c2026] border border-white/10 px-2.5 py-1.5 text-xs text-[#f0f6fc] font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-xs font-medium text-[#f0f6fc] hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-xs font-semibold text-white hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Daily Activity Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
