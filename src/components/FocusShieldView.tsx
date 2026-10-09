import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Lock,
  Filter,
  VolumeX,
  CheckCircle2,
  Plus,
  Trash2,
  PhoneCall,
  MessageSquare,
  Hourglass,
  BellOff,
  Volume2,
} from 'lucide-react';
import { NotificationSettings, ShieldAppRule } from '../types';
import { SOUNDSCAPES, SoundscapeId, soundEngine } from '../utils/soundEngine';
import focusStudioImg from '../assets/images/focus_acoustic_studio_1791541220263.jpg';

interface FocusShieldViewProps {
  initialTitle?: string;
  initialDurationMins?: number;
  shieldApps: ShieldAppRule[];
  onCycleAppStatus: (id: string) => void;
  onAddShieldApp: (
    name: string,
    subtitle: string,
    platform: 'mobile' | 'laptop' | 'both',
    status: 'blocked' | 'vip-only' | 'muted'
  ) => void;
  onDeleteShieldApp: (id: string) => void;
  onSimulateIntercept: (id?: string) => void;
  notificationSettings: NotificationSettings;
  onUpdateSettings: (partial: Partial<NotificationSettings>) => void;
  onLogCompletedSession: (
    title: string,
    durationMins: number,
    category: 'work' | 'self-improvement'
  ) => void;
  activeSoundscape: SoundscapeId;
  isPlayingAudio: boolean;
  onToggleAudio: (id?: SoundscapeId) => void;
  onCycleSoundscape: () => void;
}

export const FocusShieldView: React.FC<FocusShieldViewProps> = ({
  initialTitle = 'Deep Work Session - Q4 Strategy & Code',
  initialDurationMins = 45,
  shieldApps,
  onCycleAppStatus,
  onAddShieldApp,
  onDeleteShieldApp,
  onSimulateIntercept,
  notificationSettings,
  onUpdateSettings,
  onLogCompletedSession,
  activeSoundscape,
  isPlayingAudio,
  onToggleAudio,
  onCycleSoundscape,
}) => {
  const [sessionTitle, setSessionTitle] = useState(initialTitle);
  const [sessionCategory, setSessionCategory] = useState<'work' | 'self-improvement'>('work');
  const [activePreset, setActivePreset] = useState<'deep-50' | 'pomodoro-25' | 'flow-90' | 'custom'>('custom');
  const [initialSeconds, setInitialSeconds] = useState(initialDurationMins * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialDurationMins * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(initialDurationMins);
  const [sessionLoggedBanner, setSessionLoggedBanner] = useState<string | null>(null);
  const [lastInterceptToast, setLastInterceptToast] = useState<string | null>(null);

  // Add Custom App Modal/Form State
  const [showAddAppForm, setShowAddAppForm] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppSubtitle, setNewAppSubtitle] = useState('');
  const [newAppPlatform, setNewAppPlatform] = useState<'both' | 'mobile' | 'laptop'>('both');
  const [newAppStatus, setNewAppStatus] = useState<'blocked' | 'vip-only' | 'muted'>('blocked');

  useEffect(() => {
    setSessionTitle(initialTitle);
    setInitialSeconds(initialDurationMins * 60);
    setRemainingSeconds(initialDurationMins * 60);
    setCustomMinutesInput(initialDurationMins);
    setTimerRunning(false);
  }, [initialTitle, initialDurationMins]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          soundEngine.playChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const selectPreset = (
    presetKey: 'deep-50' | 'pomodoro-25' | 'flow-90' | 'custom',
    mins: number,
    title: string,
    cat: 'work' | 'self-improvement'
  ) => {
    setActivePreset(presetKey);
    setTimerRunning(false);
    setInitialSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    setCustomMinutesInput(mins);
    setSessionTitle(title);
    setSessionCategory(cat);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setRemainingSeconds(initialSeconds);
  };

  const handleCompleteAndLog = () => {
    setTimerRunning(false);
    const elapsedMins = Math.max(
      5,
      Math.round((initialSeconds - remainingSeconds) / 60) || Math.round(initialSeconds / 60)
    );
    onLogCompletedSession(sessionTitle, elapsedMins, sessionCategory);
    soundEngine.playChime();
    setSessionLoggedBanner(
      `Logged "${sessionTitle}" (${elapsedMins}m) to Today's ${
        sessionCategory === 'work' ? 'Working Hours' : 'Self-Improvement'
      }!`
    );
    setTimeout(() => setSessionLoggedBanner(null), 5000);
  };

  const handleCreateAppRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    onAddShieldApp(
      newAppName.trim(),
      newAppSubtitle.trim() || 'User-defined notification quarantine rule',
      newAppPlatform,
      newAppStatus
    );
    setNewAppName('');
    setNewAppSubtitle('');
    setShowAddAppForm(false);
  };

  const triggerSimulatedBlock = (app?: ShieldAppRule) => {
    onSimulateIntercept(app?.id);
    const targetName = app ? app.name : 'Instagram & Slack';
    setLastInterceptToast(
      `Shield intercepted incoming notification from ${targetName} (${
        notificationSettings.deviceSyncScope === 'both'
          ? 'Mobile + Laptop'
          : notificationSettings.deviceSyncScope === 'mobile'
          ? 'Mobile'
          : 'Laptop'
      })`
    );
    setTimeout(() => setLastInterceptToast(null), 4000);
  };

  const minsDisplay = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secsDisplay = String(remainingSeconds % 60).padStart(2, '0');

  const totalCircumference = 2 * Math.PI * 102; // ~640.88
  const progress = initialSeconds > 0 ? remainingSeconds / initialSeconds : 1;
  const strokeDashoffset = totalCircumference * (1 - progress);

  const currentSoundMeta =
    SOUNDSCAPES.find((s) => s.id === activeSoundscape) || SOUNDSCAPES[0];

  const totalSilencedToday = shieldApps.reduce((acc, a) => acc + a.interceptsToday, 0);
  const filteredShieldApps =
    notificationSettings.deviceSyncScope === 'both'
      ? shieldApps
      : shieldApps.filter(
          (a) => a.platform === 'both' || a.platform === notificationSettings.deviceSyncScope
        );

  return (
    <div className="space-y-8">
      {/* Acoustic Neuro-Sync Top Banner */}
      <div className="rounded-2xl bg-[#161b22] border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => onToggleAudio()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isPlayingAudio
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                : 'bg-[#1c2026] text-[#d0bcff] border border-white/10 hover:bg-[#262a31]'
            }`}
            aria-label={isPlayingAudio ? 'Pause Neuro-Sync Audio' : 'Play Neuro-Sync Audio'}
          >
            {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#4edea3]">
              <span>Acoustic Neuro-Sync</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{currentSoundMeta.frequencyBadge}</span>
              <span aria-hidden="true">·</span>
              <span>{isPlayingAudio ? 'Playing Live' : 'Ready'}</span>
            </div>
            <p className="text-base font-semibold text-[#f0f6fc] truncate">
              {currentSoundMeta.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => onToggleAudio()}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-medium text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0"
          >
            {isPlayingAudio ? 'Mute Audio' : 'Start Soundscape'}
          </button>
          <button
            type="button"
            onClick={onCycleSoundscape}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#262a31] hover:bg-[#31353c] text-xs font-semibold text-[#7bd0ff] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Switch Track</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Controls */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() =>
            selectPreset('deep-50', 50, 'Deep Work Session - Q4 Strategy & Code', 'work')
          }
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activePreset === 'deep-50'
              ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(160,120,255,0.35)]'
              : 'bg-[#161b22] text-[#8b949e] border border-white/10 hover:text-[#f0f6fc]'
          }`}
        >
          Deep Work (50m)
        </button>
        <button
          type="button"
          onClick={() =>
            selectPreset('pomodoro-25', 25, 'Study Pomodoro - Skill Mastery & Reading', 'self-improvement')
          }
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activePreset === 'pomodoro-25'
              ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(160,120,255,0.35)]'
              : 'bg-[#161b22] text-[#8b949e] border border-white/10 hover:text-[#f0f6fc]'
          }`}
        >
          Study Pomodoro (25m)
        </button>
        <button
          type="button"
          onClick={() =>
            selectPreset('flow-90', 90, 'Creative Flow & System Architecture', 'work')
          }
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activePreset === 'flow-90'
              ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(160,120,255,0.35)]'
              : 'bg-[#161b22] text-[#8b949e] border border-white/10 hover:text-[#f0f6fc]'
          }`}
        >
          Creative Flow (90m)
        </button>
        <button
          type="button"
          onClick={() =>
            selectPreset('custom', customMinutesInput, sessionTitle, sessionCategory)
          }
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
            activePreset === 'custom'
              ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(160,120,255,0.35)]'
              : 'bg-[#161b22] text-[#8b949e] border border-white/10 hover:text-[#f0f6fc]'
          }`}
        >
          Custom Interval
        </button>
      </div>

      {/* Main 12-Column Split: Left 6 Cols Timer & Hardware Sync | Right 6 Cols App & Notification Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Columns: Circular Focus Timer + Cross-Device Hardware Shield Sync + Lifetime Stats */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Focus Timer Card */}
          <div className="relative rounded-2xl bg-[#161b22] border border-white/10 p-6 sm:p-8 overflow-hidden flex flex-col items-center text-center">
            {/* Ambient Violet Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#a078ff]/15 blur-[64px] pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center mb-4 space-y-2">
              <div className="text-xs text-[#d0bcff] font-medium">
                Target Focus State · {sessionCategory === 'work' ? 'Working Hours' : 'Self-Improvement Study'}
              </div>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full max-w-md text-center bg-transparent border-b border-transparent hover:border-white/15 focus:border-[#8b5cf6] focus:outline-none text-lg sm:text-xl font-semibold text-[#f0f6fc] px-2 py-1"
                aria-label="Focus Session Task Title"
              />
              {activePreset === 'custom' && !timerRunning && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#8b949e]">Duration (mins):</span>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={customMinutesInput}
                    onChange={(e) => {
                      const val = Math.max(5, Math.min(180, Number(e.target.value) || 45));
                      setCustomMinutesInput(val);
                      setInitialSeconds(val * 60);
                      setRemainingSeconds(val * 60);
                    }}
                    className="w-16 rounded-lg bg-[#0d1117] border border-white/10 px-2 py-1 text-xs text-center text-[#f0f6fc] font-mono tabular-nums"
                  />
                  <select
                    value={sessionCategory}
                    onChange={(e) =>
                      setSessionCategory(e.target.value as 'work' | 'self-improvement')
                    }
                    className="rounded-lg bg-[#0d1117] border border-white/10 px-2.5 py-1 text-xs text-[#f0f6fc]"
                  >
                    <option value="work">Log to Working Hrs</option>
                    <option value="self-improvement">Log to Study / Self-Improvement</option>
                  </select>
                </div>
              )}
            </div>

            {/* Circular Timer Visualization */}
            <div className="relative z-10 w-64 h-64 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  className="text-[#31353c]/50"
                  cx="120"
                  cy="120"
                  fill="none"
                  r="102"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <circle
                  className="transition-all duration-500 ease-out"
                  cx="120"
                  cy="120"
                  fill="none"
                  r="102"
                  stroke="url(#focusGradientTimer)"
                  strokeDasharray={totalCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="10"
                />
                <defs>
                  <linearGradient id="focusGradientTimer" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#d0bcff" />
                    <stop offset="60%" stopColor="#a078ff" />
                    <stop offset="100%" stopColor="#4edea3" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-[#f0f6fc] font-mono tabular-nums tracking-tight select-none">
                  {minsDisplay}:{secsDisplay}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#4edea3] mt-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {notificationSettings.masterShieldEnabled
                      ? 'App Shield Active'
                      : 'Shield Standby'}
                  </span>
                </div>
                <span className="text-[11px] text-[#8b949e] mt-0.5 font-mono tabular-nums">
                  {totalSilencedToday} notifications blocked today
                </span>
              </div>
            </div>

            {/* Primary Timer Controls */}
            <div className="relative z-10 w-full mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetTimer}
                className="w-12 h-12 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-[#8b949e] hover:text-[#f0f6fc] flex items-center justify-center transition-colors shrink-0"
                title="Reset Session"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setTimerRunning((prev) => !prev)}
                className={`flex-1 min-h-[48px] py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  timerRunning
                    ? 'bg-[#262a31] text-[#f0f6fc] border border-white/15'
                    : 'bg-gradient-to-r from-[#a078ff] to-[#6d3bd7] text-white shadow-[0_8px_32px_-4px_rgba(139,92,246,0.45)]'
                }`}
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Focus</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>
                      {remainingSeconds < initialSeconds
                        ? 'Resume Focus Session'
                        : 'Start Focus Session'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCompleteAndLog}
                className="min-h-[48px] px-4 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-semibold text-[#4edea3] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                title="Log completed minutes to Today's schedule"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Hours</span>
              </button>
            </div>

            {sessionLoggedBanner && (
              <div className="relative z-10 mt-4 w-full rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 px-4 py-2.5 text-xs text-[#4edea3] font-medium">
                {sessionLoggedBanner}
              </div>
            )}
          </div>

          {/* Hardware Cross-Device Sync Scope Selector */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#f0f6fc]">
                    Cross-Device Notification Blockade
                  </span>
                  <span className="text-xs text-[#4edea3]">Paired</span>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Choose whether to block distracting app notifications on your Mobile phone, Laptop, or both synchronously during study and work sessions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ deviceSyncScope: 'both' })}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                  notificationSettings.deviceSyncScope === 'both'
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#d0bcff]'
                    : 'bg-[#1c2026] border-white/5 text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Mobile + Laptop</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ deviceSyncScope: 'mobile' })}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                  notificationSettings.deviceSyncScope === 'mobile'
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#d0bcff]'
                    : 'bg-[#1c2026] border-white/5 text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Only</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ deviceSyncScope: 'laptop' })}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                  notificationSettings.deviceSyncScope === 'laptop'
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#d0bcff]'
                    : 'bg-[#1c2026] border-white/5 text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptop Only</span>
              </button>
            </div>
          </div>

          {/* Lifetime Focus Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#161b22] border border-white/10 flex flex-col items-center text-center justify-center">
              <Hourglass className="w-5 h-5 text-[#d0bcff] mb-1.5" />
              <p className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">142h</p>
              <p className="text-[11px] text-[#8b949e] mt-0.5">Focused this month</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161b22] border border-white/10 flex flex-col items-center text-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#4edea3] mb-1.5" />
              <p className="text-2xl font-bold text-[#4edea3] font-mono tabular-nums">94.2%</p>
              <p className="text-[11px] text-[#8b949e] mt-0.5">Distraction-free</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161b22] border border-white/10 flex flex-col items-center text-center justify-center">
              <BellOff className="w-5 h-5 text-[#7bd0ff] mb-1.5" />
              <p className="text-2xl font-bold text-[#f0f6fc] font-mono tabular-nums">
                {625 + totalSilencedToday}
              </p>
              <p className="text-[11px] text-[#8b949e] mt-0.5">Blocked this week</p>
            </div>
          </div>

          {/* Studio Focus Sanctuary Visual Card */}
          <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-white/10 bg-[#161b22]">
            <img
              src={focusStudioImg}
              alt="Minimalist architectural deep-work studio desk at dusk with warm task lamp"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between p-4">
              <div>
                <span className="text-xs text-[#d0bcff] font-medium block">
                  Deep Work Sanctuary
                </span>
                <p className="text-sm font-semibold text-[#f0f6fc]">
                  Zero-Leakage Notification Quarantine
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerSimulatedBlock()}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#1c2026]/90 hover:bg-[#262a31] border border-white/15 text-xs font-medium text-[#4edea3] whitespace-nowrap shrink-0"
              >
                Test Shield Intercept
              </button>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: User-Defined App & Web Shield + Emergency Override Rules */}
        <div className="lg:col-span-6 space-y-6">
          {/* App & Web Shield Master Card */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#f0f6fc]">
                    App & Web Notification Shield
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Autonomous distraction quarantine for Mobile & Laptop
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationSettings.masterShieldEnabled}
                onClick={() =>
                  onUpdateSettings({
                    masterShieldEnabled: !notificationSettings.masterShieldEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  notificationSettings.masterShieldEnabled ? 'bg-[#00a572]' : 'bg-[#31353c]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow block transform transition-transform ${
                    notificationSettings.masterShieldEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Strict Mode Sub-bar */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#1c2026] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#f0f6fc] font-medium">
                Strict Mode: Lock blocklist changes while timer runs
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ strictMode: !notificationSettings.strictMode })
                }
                className="text-xs font-semibold text-[#4edea3] hover:underline"
              >
                {notificationSettings.strictMode ? 'Zero Leakage Active' : 'Standard Mode'}
              </button>
            </div>

            {lastInterceptToast && (
              <div className="rounded-xl bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 px-3.5 py-2.5 text-xs text-[#d0bcff] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#4edea3]" />
                <span>{lastInterceptToast}</span>
              </div>
            )}

            {/* Restricted Feeds Header */}
            <div className="flex items-center justify-between text-xs text-[#8b949e]">
              <span>
                User-Defined Restricted Apps ({filteredShieldApps.length} Managed)
              </span>
              <span className="text-[#4edea3] font-mono tabular-nums">
                {totalSilencedToday} silenced today
              </span>
            </div>

            {/* Managed Apps List */}
            <div className="space-y-2.5">
              {filteredShieldApps.map((app) => {
                const statusLabel =
                  app.status === 'blocked'
                    ? 'Blocked'
                    : app.status === 'vip-only'
                    ? 'VIP Only'
                    : app.status === 'muted'
                    ? 'Muted'
                    : 'Allowed';

                const statusColor =
                  app.status === 'blocked'
                    ? 'text-[#ffb4ab]'
                    : app.status === 'vip-only'
                    ? 'text-[#7bd0ff]'
                    : app.status === 'muted'
                    ? 'text-[#f59e0b]'
                    : 'text-[#4edea3]';

                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/5 transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#f0f6fc] truncate">
                          {app.name}
                        </p>
                        <span className="text-[11px] text-[#8b949e]">
                          ·{' '}
                          {app.platform === 'both'
                            ? 'Mobile + Laptop'
                            : app.platform === 'mobile'
                            ? 'Mobile'
                            : 'Laptop'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] truncate mt-0.5">
                        {app.subtitle} · {app.interceptsToday} intercepted
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onCycleAppStatus(app.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-lg bg-[#0d1117] border border-white/10 text-xs font-semibold flex items-center gap-1.5 ${statusColor} hover:border-white/25 transition-colors`}
                        title="Click to cycle protection level (Blocked / VIP Only / Muted / Allowed)"
                      >
                        {app.status === 'blocked' ? (
                          <Lock className="w-3 h-3" />
                        ) : app.status === 'vip-only' ? (
                          <Filter className="w-3 h-3" />
                        ) : (
                          <VolumeX className="w-3 h-3" />
                        )}
                        <span>{statusLabel}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerSimulatedBlock(app)}
                        className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#161b22] hover:bg-[#31353c] text-[11px] font-mono text-[#8b949e] hover:text-[#f0f6fc] border border-white/5"
                        title="Simulate blocking a notification from this app"
                      >
                        Test
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteShieldApp(app.id)}
                        className="min-h-[36px] min-w-[32px] flex items-center justify-center rounded-lg text-[#8b949e] hover:text-[#ffb4ab]"
                        aria-label={`Remove ${app.name} from blocklist`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom App or URL Form / Trigger */}
            {showAddAppForm ? (
              <form
                onSubmit={handleCreateAppRule}
                className="rounded-xl bg-[#0d1117] border border-white/10 p-4 space-y-3"
              >
                <div className="text-xs font-semibold text-[#f0f6fc]">
                  Add Custom Mobile App or Laptop Website to Shield
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="App or URL (e.g., Discord, Reddit, Netflix)"
                    className="rounded-lg bg-[#161b22] border border-white/10 px-3 py-2 text-xs text-[#f0f6fc]"
                  />
                  <input
                    type="text"
                    value={newAppSubtitle}
                    onChange={(e) => setNewAppSubtitle(e.target.value)}
                    placeholder="Rule note (e.g., Mute channels during study)"
                    className="rounded-lg bg-[#161b22] border border-white/10 px-3 py-2 text-xs text-[#f0f6fc]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <select
                    value={newAppPlatform}
                    onChange={(e) =>
                      setNewAppPlatform(e.target.value as 'both' | 'mobile' | 'laptop')
                    }
                    className="rounded-lg bg-[#161b22] border border-white/10 px-3 py-2 text-xs text-[#f0f6fc]"
                  >
                    <option value="both">Target: Mobile + Laptop</option>
                    <option value="mobile">Target: Mobile Only</option>
                    <option value="laptop">Target: Laptop Only</option>
                  </select>
                  <select
                    value={newAppStatus}
                    onChange={(e) =>
                      setNewAppStatus(e.target.value as 'blocked' | 'vip-only' | 'muted')
                    }
                    className="rounded-lg bg-[#161b22] border border-white/10 px-3 py-2 text-xs text-[#f0f6fc]"
                  >
                    <option value="blocked">Mode: Strictly Blocked</option>
                    <option value="vip-only">Mode: VIP Contacts Only</option>
                    <option value="muted">Mode: Silent Badge Hold</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAppForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#8b5cf6] text-xs font-semibold text-white"
                  >
                    Add to Shield
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddAppForm(true)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#1c2026] hover:bg-[#262a31] border border-white/10 text-xs font-semibold text-[#d0bcff] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom App or URL to Blocklist</span>
              </button>
            )}
          </div>

          {/* Emergency Override Rules */}
          <div className="rounded-2xl bg-[#161b22] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#f0f6fc]">
              Emergency Override Rules
            </h3>

            {/* Rule 1: Starred Contacts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2026] border border-white/5 gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 text-[#7bd0ff] flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#f0f6fc]">
                    Allow Calls from Starred Contacts
                  </p>
                  <p className="text-xs text-[#8b949e]">
                    Favorites can ring through after 2 repeated dials
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationSettings.allowStarredCalls}
                onClick={() =>
                  onUpdateSettings({
                    allowStarredCalls: !notificationSettings.allowStarredCalls,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  notificationSettings.allowStarredCalls ? 'bg-[#00a572]' : 'bg-[#31353c]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow block transform transition-transform ${
                    notificationSettings.allowStarredCalls ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Rule 2: Auto-Reply SMS Shield */}
            <div className="p-3.5 rounded-xl bg-[#1c2026] border border-white/5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 text-[#d0bcff] flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      Auto-Reply SMS & Slack Status Shield
                    </p>
                    <p className="text-xs text-[#8b949e] truncate">
                      &ldquo;{notificationSettings.autoReplyMessage}&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationSettings.autoReplySms}
                  onClick={() =>
                    onUpdateSettings({
                      autoReplySms: !notificationSettings.autoReplySms,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    notificationSettings.autoReplySms ? 'bg-[#00a572]' : 'bg-[#31353c]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow block transform transition-transform ${
                      notificationSettings.autoReplySms ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {notificationSettings.autoReplySms && (
                <input
                  type="text"
                  value={notificationSettings.autoReplyMessage}
                  onChange={(e) => onUpdateSettings({ autoReplyMessage: e.target.value })}
                  className="w-full rounded-lg bg-[#0d1117] border border-white/10 px-3 py-1.5 text-xs text-[#f0f6fc]"
                  aria-label="Edit Auto-Reply SMS Message"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
