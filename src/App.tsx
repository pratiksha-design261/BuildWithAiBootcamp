/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Moon,
  BarChart3,
  Timer,
  Bell,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AIRhythmInsights,
  DailyLog,
  NavTab,
  NotificationSettings,
  ScheduleBlock,
  SelfImprovementHabit,
  ShieldAppRule,
  WindDownStep,
} from './types';
import {
  createInitialLogs,
  INITIAL_AI_INSIGHTS,
  INITIAL_HABITS,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_SHIELD_APPS,
  INITIAL_WINDDOWN_STEPS,
} from './data/initialData';
import { TodayView } from './components/TodayView';
import { SleepAIView } from './components/SleepAIView';
import { AnalyticsView } from './components/AnalyticsView';
import { FocusShieldView } from './components/FocusShieldView';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { SOUNDSCAPES, SoundscapeId, soundEngine } from './utils/soundEngine';

const STORAGE_KEYS = {
  LOGS: 'tempo_ai_logs_v1',
  HABITS: 'tempo_ai_habits_v1',
  WINDDOWN: 'tempo_ai_winddown_v1',
  SHIELD: 'tempo_ai_shield_v1',
  SETTINGS: 'tempo_ai_settings_v1',
  INSIGHTS: 'tempo_ai_insights_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('today');

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return createInitialLogs();
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const initial = createInitialLogs();
    return initial[initial.length - 1].date;
  });

  const [habits, setHabits] = useState<SelfImprovementHabit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_HABITS;
  });

  const [windDownSteps, setWindDownSteps] = useState<WindDownStep[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WINDDOWN);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_WINDDOWN_STEPS;
  });

  const [shieldApps, setShieldApps] = useState<ShieldAppRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIELD);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SHIELD_APPS;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATION_SETTINGS;
  });

  const [aiInsights, setAiInsights] = useState<AIRhythmInsights>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_AI_INSIGHTS;
  });

  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [notificationAlertBanner, setNotificationAlertBanner] = useState<string | null>(null);

  // Focus Preset Jump State
  const [focusTaskTitle, setFocusTaskTitle] = useState('Deep Work Session - Q4 Strategy & Code');
  const [focusDurationMins, setFocusDurationMins] = useState(45);

  // Web Audio Soundscape State
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeId>('gamma-40hz');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch {
      // ignore storage quota errors
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WINDDOWN, JSON.stringify(windDownSteps));
    } catch {
      // ignore
    }
  }, [windDownSteps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIELD, JSON.stringify(shieldApps));
    } catch {
      // ignore
    }
  }, [shieldApps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(notificationSettings));
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(aiInsights));
    } catch {
      // ignore
    }
  }, [aiInsights]);

  const currentLog = logs.find((l) => l.date === selectedDate) || logs[logs.length - 1];

  const handleUpdateLog = useCallback((updatedLog: DailyLog) => {
    setLogs((prev) => prev.map((l) => (l.date === updatedLog.date ? updatedLog : l)));
  }, []);

  // Trigger Daily Check-in Reminder Notification (Browser Notification + In-App Interactive Prompt)
  const triggerDailyCheckInNotification = useCallback(async () => {
    soundEngine.playChime();
    setNotificationAlertBanner(
      "Daily Check-In Reminder: Ready to log what you did today (Working hrs, Workout, Free time & Sleep)?"
    );

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Tempo AI — Daily Activity Check-In', {
          body: 'Tap to log your working hours, workout, self-improvement, free time, and sleep cycle.',
        });
      } else if (Notification.permission !== 'denied') {
        try {
          const perm = await Notification.requestPermission();
          setNotificationSettings((prev) => ({ ...prev, browserPermission: perm }));
          if (perm === 'granted') {
            new Notification('Tempo AI — Daily Activity Check-In', {
              body: 'Tap to log your working hours, workout, self-improvement, free time, and sleep cycle.',
            });
          }
        } catch {
          // ignore permission errors in iframe
        }
      }
    }
  }, []);

  // Check every 60s if current clock matches dailyReminderTime
  useEffect(() => {
    if (!notificationSettings.dailyReminderEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      if (`${hh}:${mm}` === notificationSettings.dailyReminderTime && now.getSeconds() < 15) {
        triggerDailyCheckInNotification();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [
    notificationSettings.dailyReminderEnabled,
    notificationSettings.dailyReminderTime,
    triggerDailyCheckInNotification,
  ]);

  // Refresh AI Insights from backend Gemini API
  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      const response = await fetch('/api/ai/analyze-rhythm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logs.slice(-7),
          habits,
          currentDay: currentLog,
        }),
      });
      const data = await response.json();
      if (response.ok && data.productivityDeepSleep) {
        setAiInsights({
          ...data,
          lastUpdated: 'Just now',
        });
      }
    } catch {
      // Retain existing insights if offline
    } finally {
      setIsRefreshingAI(false);
    }
  };

  // Habits handlers
  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nextCompleted = !h.completed;
        return {
          ...h,
          completed: nextCompleted,
          streakDays: nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1),
        };
      })
    );
  };

  const handleAddHabit = (title: string, targetLabel: string) => {
    const newHabit: SelfImprovementHabit = {
      id: `hab-${Date.now()}`,
      title,
      targetLabel,
      category: 'skill',
      completed: false,
      streakDays: 1,
      loggedDetail: targetLabel,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  // Wind-down handlers
  const handleToggleWindDown = (id: string) => {
    setWindDownSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleActivateNightCocoon = () => {
    setWindDownSteps((prev) => prev.map((s) => ({ ...s, enabled: true })));
    setNotificationSettings((prev) => ({ ...prev, masterShieldEnabled: true }));
    soundEngine.start('deep-delta');
    setActiveSoundscape('deep-delta');
    setIsPlayingAudio(true);
    setNotificationAlertBanner(
      'Night Cocoon Routine Activated: Warm 1800K cue set, App Shield locked until 8:00 AM, and Delta soundscape playing.'
    );
  };

  // Audio handlers
  const handleToggleAudio = (id?: SoundscapeId) => {
    const target = id || activeSoundscape;
    const playing = soundEngine.toggle(target);
    setActiveSoundscape(target);
    setIsPlayingAudio(playing);
  };

  const handleCycleSoundscape = () => {
    const idx = SOUNDSCAPES.findIndex((s) => s.id === activeSoundscape);
    const next = SOUNDSCAPES[(idx + 1) % SOUNDSCAPES.length];
    setActiveSoundscape(next.id);
    if (isPlayingAudio) {
      soundEngine.start(next.id);
    }
  };

  // Shield App handlers
  const handleCycleAppStatus = (id: string) => {
    const order: ShieldAppRule['status'][] = ['blocked', 'vip-only', 'muted', 'allowed'];
    setShieldApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const nextStatus = order[(order.indexOf(a.status) + 1) % order.length];
        return { ...a, status: nextStatus };
      })
    );
  };

  const handleAddShieldApp = (
    name: string,
    subtitle: string,
    platform: 'mobile' | 'laptop' | 'both',
    status: 'blocked' | 'vip-only' | 'muted'
  ) => {
    const created: ShieldAppRule = {
      id: `app-${Date.now()}`,
      name,
      subtitle,
      category: 'custom',
      platform,
      status,
      interceptsToday: 1,
    };
    setShieldApps((prev) => [...prev, created]);
  };

  const handleDeleteShieldApp = (id: string) => {
    setShieldApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSimulateIntercept = (id?: string) => {
    setShieldApps((prev) =>
      prev.map((a, idx) => {
        if (id ? a.id === id : idx === 0) {
          return { ...a, interceptsToday: a.interceptsToday + 1 };
        }
        return a;
      })
    );
  };

  const handleLogCompletedFocusSession = (
    title: string,
    durationMins: number,
    category: 'work' | 'self-improvement'
  ) => {
    const latestDay = logs[logs.length - 1];
    const now = new Date();
    const endHH = String(now.getHours()).padStart(2, '0');
    const endMM = String(now.getMinutes()).padStart(2, '0');
    const startTotal = Math.max(0, now.getHours() * 60 + now.getMinutes() - durationMins);
    const startHH = String(Math.floor(startTotal / 60)).padStart(2, '0');
    const startMM = String(startTotal % 60).padStart(2, '0');

    const newBlock: ScheduleBlock = {
      id: `focus-blk-${Date.now()}`,
      title,
      startTime: `${startHH}:${startMM}`,
      endTime: `${endHH}:${endMM}`,
      category,
      durationMinutes: durationMins,
      completed: true,
      notes: 'Completed via Shielded Focus Session',
    };

    const hrsAdded = Number((durationMins / 60).toFixed(2));
    const updated: DailyLog = {
      ...latestDay,
      workHours:
        category === 'work'
          ? Number((latestDay.workHours + hrsAdded).toFixed(1))
          : latestDay.workHours,
      selfImprovementHours:
        category === 'self-improvement'
          ? Number((latestDay.selfImprovementHours + hrsAdded).toFixed(1))
          : latestDay.selfImprovementHours,
      schedule: [...latestDay.schedule, newBlock],
    };

    handleUpdateLog(updated);
  };

  const handleNavigateToFocus = (taskTitle?: string, durationMins?: number) => {
    if (taskTitle) setFocusTaskTitle(taskTitle);
    if (durationMins) setFocusDurationMins(durationMins);
    setActiveTab('focus');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-40 h-16 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title (single text element, one line) */}
          <a
            href="#today"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('today');
            }}
            className="text-lg font-bold tracking-tight text-[#f0f6fc] whitespace-nowrap shrink-0"
          >
            Tempo AI
          </a>

          {/* Zone 2: 4 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'today'
                  ? 'text-[#f0f6fc] border-[#d0bcff]'
                  : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
              }`}
            >
              Today Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sleep-ai')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'sleep-ai'
                  ? 'text-[#f0f6fc] border-[#d0bcff]'
                  : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
              }`}
            >
              Sleep & AI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'analytics'
                  ? 'text-[#f0f6fc] border-[#d0bcff]'
                  : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
              }`}
            >
              Analytics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('focus')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'focus'
                  ? 'text-[#f0f6fc] border-[#d0bcff]'
                  : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc]'
              }`}
            >
              Focus Shield
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(true)}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-xl hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Check-In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Active Notification Prompt Toast */}
      {notificationAlertBanner && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 pt-4">
          <div className="rounded-xl bg-[#1c2026] border border-[#8b5cf6]/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs text-[#f0f6fc]">
              <Bell className="w-4 h-4 text-[#4edea3] shrink-0" />
              <span>{notificationAlertBanner}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setNotificationAlertBanner(null);
                  setIsCheckInModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-xs font-semibold text-white whitespace-nowrap shrink-0"
              >
                Open Check-In Log
              </button>
              <button
                type="button"
                onClick={() => setNotificationAlertBanner(null)}
                className="p-1 text-[#8b949e] hover:text-[#f0f6fc]"
                aria-label="Dismiss notification banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pb-28 md:pb-16">
        {activeTab === 'today' && (
          <TodayView
            logs={logs}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onUpdateLog={handleUpdateLog}
            onOpenCheckIn={() => setIsCheckInModalOpen(true)}
            onNavigateToFocus={handleNavigateToFocus}
            notificationSettings={notificationSettings}
            onTriggerTestNotification={triggerDailyCheckInNotification}
            onToggleDailyReminder={() =>
              setNotificationSettings((prev) => ({
                ...prev,
                dailyReminderEnabled: !prev.dailyReminderEnabled,
              }))
            }
          />
        )}

        {activeTab === 'sleep-ai' && (
          <SleepAIView
            currentLog={currentLog}
            logs={logs}
            onUpdateLog={handleUpdateLog}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            windDownSteps={windDownSteps}
            onToggleWindDown={handleToggleWindDown}
            onActivateNightCocoon={handleActivateNightCocoon}
            aiInsights={aiInsights}
            isRefreshingAI={isRefreshingAI}
            onRefreshAI={handleRefreshAI}
            activeSoundscape={activeSoundscape}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={handleToggleAudio}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            logs={logs}
            aiInsights={aiInsights}
            isRefreshingAI={isRefreshingAI}
            onRefreshAI={handleRefreshAI}
            onSelectDateAndJump={(date) => {
              setSelectedDate(date);
              setActiveTab('today');
            }}
          />
        )}

        {activeTab === 'focus' && (
          <FocusShieldView
            initialTitle={focusTaskTitle}
            initialDurationMins={focusDurationMins}
            shieldApps={shieldApps}
            onCycleAppStatus={handleCycleAppStatus}
            onAddShieldApp={handleAddShieldApp}
            onDeleteShieldApp={handleDeleteShieldApp}
            onSimulateIntercept={handleSimulateIntercept}
            notificationSettings={notificationSettings}
            onUpdateSettings={(partial) =>
              setNotificationSettings((prev) => ({ ...prev, ...partial }))
            }
            onLogCompletedSession={handleLogCompletedFocusSession}
            activeSoundscape={activeSoundscape}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={handleToggleAudio}
            onCycleSoundscape={handleCycleSoundscape}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (md:hidden) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0d1117]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-4 items-center"
      >
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'today' ? 'text-[#d0bcff]' : 'text-[#8b949e]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] font-medium">Today</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sleep-ai')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'sleep-ai' ? 'text-[#d0bcff]' : 'text-[#8b949e]'
          }`}
        >
          <Moon className="w-5 h-5" />
          <span className="text-[11px] font-medium">Sleep & AI</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'analytics' ? 'text-[#d0bcff]' : 'text-[#8b949e]'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] font-medium">Analytics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('focus')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'focus' ? 'text-[#d0bcff]' : 'text-[#8b949e]'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span className="text-[11px] font-medium">Focus</span>
        </button>
      </nav>

      {/* Daily Check-In & AI Log Modal */}
      <DailyCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        activeLog={currentLog}
        onSaveLog={handleUpdateLog}
        reminderTime={notificationSettings.dailyReminderTime}
        onUpdateReminderTime={(time) =>
          setNotificationSettings((prev) => ({ ...prev, dailyReminderTime: time }))
        }
      />
    </div>
  );
}
