import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/ai/analyze-rhythm
// Analyzes sleep cycles, office working hours, workout timing, free time, and self-improvement efforts
app.post('/api/ai/analyze-rhythm', async (req, res) => {
  try {
    const { logs, habits, currentDay } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are Tempo AI, a circadian bio-rhythm, productivity, and self-improvement analyst.
Analyze the user's recent daily activity logs (sleep duration, deep/REM sleep, bedtime/wake time, office working hours, workout hours, free time, and self-improvement habits):

Recent 7-Day Logs:
${JSON.stringify(logs?.slice(-7) || [], null, 2)}

Current Day Details:
${JSON.stringify(currentDay || {}, null, 2)}

Self-Improvement Habits:
${JSON.stringify(habits || [], null, 2)}

Return a JSON object containing:
1. productivityDeepSleep: { headline, confidenceLabel, summaryText, peakCognitiveWindow, focusGainPercent }
2. workoutSleepLatency: { headline, signalLabel, summaryText, latencyMinutes, baselineMinutes, recommendation }
3. selfImprovementInsight: { headline, disciplineSummary, topHabitAdvice, nextAction }
4. weeklyExecutiveSummary: { overview, workBalanceNote, sleepCycleNote, workoutRecoveryNote, nextWeekFocusTarget }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityDeepSleep: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                confidenceLabel: { type: Type.STRING },
                summaryText: { type: Type.STRING },
                peakCognitiveWindow: { type: Type.STRING },
                focusGainPercent: { type: Type.STRING },
              },
              required: ['headline', 'confidenceLabel', 'summaryText', 'peakCognitiveWindow', 'focusGainPercent'],
            },
            workoutSleepLatency: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                signalLabel: { type: Type.STRING },
                summaryText: { type: Type.STRING },
                latencyMinutes: { type: Type.NUMBER },
                baselineMinutes: { type: Type.NUMBER },
                recommendation: { type: Type.STRING },
              },
              required: ['headline', 'signalLabel', 'summaryText', 'latencyMinutes', 'baselineMinutes', 'recommendation'],
            },
            selfImprovementInsight: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                disciplineSummary: { type: Type.STRING },
                topHabitAdvice: { type: Type.STRING },
                nextAction: { type: Type.STRING },
              },
              required: ['headline', 'disciplineSummary', 'topHabitAdvice', 'nextAction'],
            },
            weeklyExecutiveSummary: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                workBalanceNote: { type: Type.STRING },
                sleepCycleNote: { type: Type.STRING },
                workoutRecoveryNote: { type: Type.STRING },
                nextWeekFocusTarget: { type: Type.STRING },
              },
              required: ['overview', 'workBalanceNote', 'sleepCycleNote', 'workoutRecoveryNote', 'nextWeekFocusTarget'],
            },
          },
          required: ['productivityDeepSleep', 'workoutSleepLatency', 'selfImprovementInsight', 'weeklyExecutiveSummary'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate AI rhythm analysis.';
    res.status(500).json({ error: message });
  }
});

// POST /api/ai/parse-checkin
// Parses a natural language end-of-day summary into structured hours, sleep metrics, and schedule blocks
app.post('/api/ai/parse-checkin', async (req, res) => {
  try {
    const { reflectionText, date } = req.body;
    if (!reflectionText || typeof reflectionText !== 'string') {
      res.status(400).json({ error: 'Please provide a reflection text describing your day.' });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Parse the user's daily activity check-in note for date ${date || 'today'} into structured metrics and timeline blocks.
User's check-in note: "${reflectionText}"

Extract realistic numbers for:
- workHours (number, 0 to 16)
- workoutHours (number, 0 to 6)
- freeTimeHours (number, 0 to 12)
- selfImprovementHours (number, 0 to 6)
- sleepHours (number, 3 to 12)
- bedtime (string, e.g. "11:15 PM")
- wakeTime (string, e.g. "07:00 AM")
- sleepQuality (number, 50 to 99)
- aiCoachNote (1-2 sentence encouraging bio-rhythm feedback on their day)
- scheduleBlocks: array of 2 to 5 structured timeline items extracted from their description, each with:
  - title (string)
  - startTime (string, e.g. "09:00")
  - endTime (string, e.g. "12:00")
  - category (one of: "work", "workout", "self-improvement", "free-time", "sleep")
  - durationMinutes (number)
  - notes (string)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workHours: { type: Type.NUMBER },
            workoutHours: { type: Type.NUMBER },
            freeTimeHours: { type: Type.NUMBER },
            selfImprovementHours: { type: Type.NUMBER },
            sleepHours: { type: Type.NUMBER },
            bedtime: { type: Type.STRING },
            wakeTime: { type: Type.STRING },
            sleepQuality: { type: Type.NUMBER },
            aiCoachNote: { type: Type.STRING },
            scheduleBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  category: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
                required: ['title', 'startTime', 'endTime', 'category', 'durationMinutes', 'notes'],
              },
            },
          },
          required: [
            'workHours',
            'workoutHours',
            'freeTimeHours',
            'selfImprovementHours',
            'sleepHours',
            'bedtime',
            'wakeTime',
            'sleepQuality',
            'aiCoachNote',
            'scheduleBlocks',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse daily check-in with AI.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tempo AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
