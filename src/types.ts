export type ActivityCategory = 'work' | 'workout' | 'self-improvement' | 'free-time' | 'sleep';

export type NavTab = 'today' | 'sleep-ai' | 'analytics' | 'focus';

export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string;   // "11:30"
  category: ActivityCategory;
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface SleepArchitecture {
  totalMinutes: number; // e.g. 468 for 7h 48m
  bedtime: string;      // "11:15 PM"
  wakeTime: string;     // "07:03 AM"
  qualityScore: number; // 88
  efficiency: number;   // 92
  deepMinutes: number;  // 102
  remMinutes: number;   // 130
  lightMinutes: number; // 205
  awakeMinutes: number; // 31
  latencyMinutes: number; // 14
  hypnogramPoints: number[]; // values 0-100 representing sleep depth stages across the night
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  label: string; // "Oct 9"
  dayShort: string; // "Fri"
  dayNum: string; // "09"
  workHours: number;
  workoutHours: number;
  freeTimeHours: number;
  selfImprovementHours: number;
  sleep: SleepArchitecture;
  schedule: ScheduleBlock[];
  checkedIn: boolean;
  reflectionNote?: string;
  aiCoachFeedback?: string;
}

export interface SelfImprovementHabit {
  id: string;
  title: string;
  targetLabel: string;
  category: 'reading' | 'hydration' | 'mindfulness' | 'skill';
  completed: boolean;
  streakDays: number;
  loggedDetail: string;
}

export interface WindDownStep {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  category: 'light' | 'supplement' | 'shield';
}

export interface ShieldAppRule {
  id: string;
  name: string;
  subtitle: string;
  category: 'social' | 'video' | 'work' | 'messaging' | 'custom';
  platform: 'mobile' | 'laptop' | 'both';
  status: 'blocked' | 'vip-only' | 'muted' | 'allowed';
  interceptsToday: number;
}

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "20:30"
  browserPermission: NotificationPermission | 'unsupported';
  allowStarredCalls: boolean;
  autoReplySms: boolean;
  autoReplyMessage: string;
  strictMode: boolean;
  masterShieldEnabled: boolean;
  deviceSyncScope: 'both' | 'mobile' | 'laptop';
}

export interface AIRhythmInsights {
  productivityDeepSleep: {
    headline: string;
    confidenceLabel: string;
    summaryText: string;
    peakCognitiveWindow: string;
    focusGainPercent: string;
  };
  workoutSleepLatency: {
    headline: string;
    signalLabel: string;
    summaryText: string;
    latencyMinutes: number;
    baselineMinutes: number;
    recommendation: string;
  };
  selfImprovementInsight: {
    headline: string;
    disciplineSummary: string;
    topHabitAdvice: string;
    nextAction: string;
  };
  weeklyExecutiveSummary: {
    overview: string;
    workBalanceNote: string;
    sleepCycleNote: string;
    workoutRecoveryNote: string;
    nextWeekFocusTarget: string;
  };
  lastUpdated: string;
}
