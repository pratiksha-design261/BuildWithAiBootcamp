import {
  AIRhythmInsights,
  DailyLog,
  NotificationSettings,
  ScheduleBlock,
  SelfImprovementHabit,
  ShieldAppRule,
  WindDownStep,
} from '../types';

const TODAY_SCHEDULES: Record<number, ScheduleBlock[]> = {
  0: [
    {
      id: 'blk-1',
      title: 'Morning Sunlight & Mobility Flow',
      startTime: '07:15',
      endTime: '07:50',
      category: 'workout',
      durationMinutes: 35,
      completed: true,
      notes: 'Zone 1 outdoor walk + thoracic spine opening before screens',
    },
    {
      id: 'blk-2',
      title: 'Technical Reading & System Notes',
      startTime: '08:00',
      endTime: '08:40',
      category: 'self-improvement',
      durationMinutes: 40,
      completed: true,
      notes: '20m book reading + 20m spaced-repetition review',
    },
    {
      id: 'blk-3',
      title: 'Deep Work Block I — Q4 Architecture & Core API',
      startTime: '09:00',
      endTime: '12:30',
      category: 'work',
      durationMinutes: 210,
      completed: true,
      notes: 'Peak cognitive window — App Shield active across laptop & phone',
    },
    {
      id: 'blk-4',
      title: 'Midday Decompression & Walk',
      startTime: '12:30',
      endTime: '13:30',
      category: 'free-time',
      durationMinutes: 60,
      completed: true,
      notes: 'High-protein lunch & step goal top-up',
    },
    {
      id: 'blk-5',
      title: 'Office Collaboration & Sprint Execution',
      startTime: '13:30',
      endTime: '17:30',
      category: 'work',
      durationMinutes: 240,
      completed: true,
      notes: 'Design reviews, PR merges, and Q4 roadmap alignment',
    },
    {
      id: 'blk-6',
      title: 'Strength Conditioning & Zone 2 Run',
      startTime: '18:00',
      endTime: '19:15',
      category: 'workout',
      durationMinutes: 75,
      completed: true,
      notes: 'Completed before 7:30 PM to preserve evening thermoregulation',
    },
    {
      id: 'blk-7',
      title: 'Dinner & Unplugged Free Time',
      startTime: '19:30',
      endTime: '21:30',
      category: 'free-time',
      durationMinutes: 120,
      completed: false,
      notes: 'Family conversation, acoustic music, zero work notifications',
    },
    {
      id: 'blk-8',
      title: 'Evening Wind-down & Circadian Sleep Window',
      startTime: '22:45',
      endTime: '06:45',
      category: 'sleep',
      durationMinutes: 468,
      completed: false,
      notes: '1800K warm lighting + Magnesium L-Threonate + App Shield till 8 AM',
    },
  ],
};

function generateScheduleForOffset(offsetFromToday: number, workH: number, workoutH: number, selfH: number, freeH: number): ScheduleBlock[] {
  if (offsetFromToday === 0) {
    return TODAY_SCHEDULES[0];
  }
  const workMins = Math.round(workH * 60);
  const workoutMins = Math.round(workoutH * 60);
  const selfMins = Math.round(selfH * 60);
  const freeMins = Math.round(freeH * 60);

  return [
    {
      id: `d-${offsetFromToday}-1`,
      title: 'Morning Reading & Hydration Routine',
      startTime: '07:30',
      endTime: '08:30',
      category: 'self-improvement',
      durationMinutes: selfMins,
      completed: true,
      notes: 'Daily self-improvement habit streak maintained',
    },
    {
      id: `d-${offsetFromToday}-2`,
      title: 'Core Office & Deep Focus Sessions',
      startTime: '09:00',
      endTime: '17:00',
      category: 'work',
      durationMinutes: workMins,
      completed: true,
      notes: 'Focused execution with notification shield enabled',
    },
    {
      id: `d-${offsetFromToday}-3`,
      title: 'Evening Workout & Bio-Kinetic Training',
      startTime: '17:45',
      endTime: '19:00',
      category: 'workout',
      durationMinutes: workoutMins,
      completed: true,
      notes: 'Completed prior to melatonin onset window',
    },
    {
      id: `d-${offsetFromToday}-4`,
      title: 'Evening Leisure & Recovery Time',
      startTime: '19:30',
      endTime: '22:15',
      category: 'free-time',
      durationMinutes: freeMins,
      completed: true,
      notes: 'Restorative personal downtime',
    },
  ];
}

export function createInitialLogs(): DailyLog[] {
  const baseDate = new Date('2026-10-09T12:00:00');
  const logs: DailyLog[] = [];

  // Deterministic realistic patterns across 30 days
  const patterns = [
    { work: 7.5, workout: 1.8, free: 2.8, self: 1.2, sleepM: 468, quality: 88, eff: 92, deep: 102, rem: 130, light: 205, awake: 31, latency: 14, bed: '11:15 PM', wake: '07:03 AM' },
    { work: 8.2, workout: 1.2, free: 2.4, self: 1.0, sleepM: 452, quality: 85, eff: 90, deep: 96, rem: 122, light: 204, awake: 30, latency: 16, bed: '11:25 PM', wake: '06:57 AM' },
    { work: 8.6, workout: 1.0, free: 2.2, self: 0.8, sleepM: 438, quality: 81, eff: 89, deep: 88, rem: 118, light: 198, awake: 34, latency: 19, bed: '11:40 PM', wake: '06:58 AM' },
    { work: 7.8, workout: 1.5, free: 3.0, self: 1.3, sleepM: 474, quality: 91, eff: 94, deep: 110, rem: 134, light: 206, awake: 24, latency: 12, bed: '10:55 PM', wake: '06:49 AM' },
    { work: 8.0, workout: 1.3, free: 2.6, self: 1.1, sleepM: 460, quality: 87, eff: 91, deep: 100, rem: 126, light: 204, awake: 30, latency: 15, bed: '11:10 PM', wake: '06:50 AM' },
    { work: 3.5, workout: 2.2, free: 5.5, self: 1.8, sleepM: 495, quality: 93, eff: 95, deep: 118, rem: 142, light: 213, awake: 22, latency: 11, bed: '10:50 PM', wake: '07:05 AM' },
    { work: 2.0, workout: 1.6, free: 6.2, self: 1.5, sleepM: 482, quality: 90, eff: 93, deep: 112, rem: 136, light: 208, awake: 26, latency: 13, bed: '11:00 PM', wake: '07:02 AM' },
  ];

  const hypnogramTemplates = [
    [12, 12, 78, 78, 48, 48, 86, 86, 32, 32, 72, 72, 28, 28, 68, 68, 18, 18],
    [15, 15, 72, 72, 44, 44, 82, 82, 36, 36, 68, 68, 30, 30, 62, 62, 16, 16],
    [18, 18, 66, 66, 52, 52, 78, 78, 38, 38, 64, 64, 34, 34, 58, 58, 20, 20],
    [10, 10, 84, 84, 46, 46, 90, 90, 28, 28, 76, 76, 26, 26, 70, 70, 14, 14],
  ];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const pat = patterns[i % patterns.length];
    const hypno = hypnogramTemplates[i % hypnogramTemplates.length];

    logs.push({
      date: dateStr,
      label,
      dayShort,
      dayNum: dd,
      workHours: pat.work,
      workoutHours: pat.workout,
      freeTimeHours: pat.free,
      selfImprovementHours: pat.self,
      sleep: {
        totalMinutes: pat.sleepM,
        bedtime: pat.bed,
        wakeTime: pat.wake,
        qualityScore: pat.quality,
        efficiency: pat.eff,
        deepMinutes: pat.deep,
        remMinutes: pat.rem,
        lightMinutes: pat.light,
        awakeMinutes: pat.awake,
        latencyMinutes: pat.latency,
        hypnogramPoints: hypno,
      },
      schedule: generateScheduleForOffset(i, pat.work, pat.workout, pat.self, pat.free),
      checkedIn: i > 0, // Today starts ready for live check-in or updates
      reflectionNote:
        i === 0
          ? 'Strong morning deep work flow on Q4 architecture; evening workout completed before 7:15 PM.'
          : `Logged ${pat.work}h deep & office work, ${pat.workout}h training, and ${pat.self}h self-improvement.`,
      aiCoachFeedback:
        'Maintaining >1.5h deep sleep paired with pre-7 PM workouts kept your next-day cognitive efficiency in the top decile.',
    });
  }

  return logs;
}

export const INITIAL_HABITS: SelfImprovementHabit[] = [
  {
    id: 'hab-1',
    title: 'Reading & Deep Synthesis (20 mins)',
    targetLabel: '20 mins daily',
    category: 'reading',
    completed: true,
    streakDays: 12,
    loggedDetail: 'Completed · 12-day streak',
  },
  {
    id: 'hab-2',
    title: 'Hydration & Electrolyte Goal (3.0L)',
    targetLabel: '3.0L water',
    category: 'hydration',
    completed: true,
    streakDays: 14,
    loggedDetail: 'Completed (3.2L logged)',
  },
  {
    id: 'hab-3',
    title: 'Screen-Free 45m Before Bed',
    targetLabel: 'Starts at 10:00 PM',
    category: 'mindfulness',
    completed: false,
    streakDays: 9,
    loggedDetail: 'Starts at 10:00 PM',
  },
  {
    id: 'hab-4',
    title: 'Skill Mastery & Deliberate Practice',
    targetLabel: '30 mins study',
    category: 'skill',
    completed: true,
    streakDays: 8,
    loggedDetail: 'Completed (40m system design)',
  },
];

export const INITIAL_WINDDOWN_STEPS: WindDownStep[] = [
  {
    id: 'wd-1',
    title: 'Shift lights to warm amber (1800K)',
    subtitle: 'Triggers pineal melatonin release phase',
    enabled: true,
    category: 'light',
  },
  {
    id: 'wd-2',
    title: 'Chamomile or magnesium l-threonate',
    subtitle: 'Promotes GABA neuro-inhibition',
    enabled: false,
    category: 'supplement',
  },
  {
    id: 'wd-3',
    title: 'App Shield notification blockade',
    subtitle: 'Mutes work channels till 8:00 AM',
    enabled: false,
    category: 'shield',
  },
];

export const INITIAL_SHIELD_APPS: ShieldAppRule[] = [
  {
    id: 'app-1',
    name: 'Instagram',
    subtitle: '18 impulse launches intercepted',
    category: 'social',
    platform: 'both',
    status: 'blocked',
    interceptsToday: 18,
  },
  {
    id: 'app-2',
    name: 'YouTube & TikTok',
    subtitle: 'Short-form feeds & algorithmic video',
    category: 'video',
    platform: 'both',
    status: 'blocked',
    interceptsToday: 9,
  },
  {
    id: 'app-3',
    name: 'Slack & Work Email',
    subtitle: 'VIP @channel emergency alerts only',
    category: 'work',
    platform: 'laptop',
    status: 'vip-only',
    interceptsToday: 14,
  },
  {
    id: 'app-4',
    name: 'Twitter / X',
    subtitle: 'Both app binary and web URLs rerouted',
    category: 'social',
    platform: 'both',
    status: 'blocked',
    interceptsToday: 11,
  },
  {
    id: 'app-5',
    name: 'WhatsApp & Telegram',
    subtitle: 'Silent badge hold until session ends',
    category: 'messaging',
    platform: 'mobile',
    status: 'muted',
    interceptsToday: 7,
  },
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: true,
  dailyReminderTime: '20:30',
  browserPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  allowStarredCalls: true,
  autoReplySms: true,
  autoReplyMessage: 'In Deep Focus via Tempo AI until 4:30 PM',
  strictMode: true,
  masterShieldEnabled: true,
  deviceSyncScope: 'both',
};

export const INITIAL_AI_INSIGHTS: AIRhythmInsights = {
  productivityDeepSleep: {
    headline: 'Productivity vs. Deep Sleep',
    confidenceLabel: 'High Confidence · 94% Bio-Match',
    summaryText:
      'When you log >1.5h Deep Sleep, your next-day deep work focus duration increases by +34% with 41% fewer context switches during morning engineering blocks.',
    peakCognitiveWindow: '9:30 AM – 11:45 AM',
    focusGainPercent: '+34%',
  },
  workoutSleepLatency: {
    headline: 'Workout vs. Sleep Latency',
    signalLabel: 'Bio-Kinetic Signal',
    summaryText:
      'Your 6:00 PM strength and cardio session shortened your sleep onset to just 14 minutes (down from 26m). Keep vigorous workouts before 7:00 PM to avoid elevating core temperature before bed.',
    latencyMinutes: 14,
    baselineMinutes: 26,
    recommendation: 'Evening thermoregulation stabilized 42 mins faster',
  },
  selfImprovementInsight: {
    headline: 'Self-Improvement Momentum',
    disciplineSummary: 'Daily Routine Discipline',
    topHabitAdvice:
      'Pairing 20m morning technical reading before checking Slack has sustained a 12-day streak and raised weekly self-improvement volume to 8.7 hours.',
    nextAction: 'Lock in the 10:00 PM Screen-Free cutoff tonight to push REM share above 29%.',
  },
  weeklyExecutiveSummary: {
    overview:
      'Across the past 7 days, you logged 45.6h of focused work, 10.6h of workouts, 8.7h of deliberate self-improvement, and 24.7h of restorative free time while maintaining a 7h 47m average sleep cycle.',
    workBalanceNote:
      'Office working hours averaged 7.9h on weekdays with zero late-night spillover past 6:30 PM on 4 of 5 days.',
    sleepCycleNote:
      'Sleep efficiency held at 92% with zero cumulative sleep debt (+12m surplus vs 7h 35m baseline).',
    workoutRecoveryNote:
      'Early evening training sessions (5:45 PM – 7:00 PM) consistently correlated with your highest deep sleep nights.',
    nextWeekFocusTarget:
      'Protect the 9:30 AM – 11:45 AM Peak Cognitive Window with Strict App Shield and cap mid-week work at 8.0h.',
  },
  lastUpdated: 'Just now',
};
