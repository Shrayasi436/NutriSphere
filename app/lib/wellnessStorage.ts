/**
 * Shared localStorage helpers for AI Wellness Coach and Wellness Score features.
 * Scoped by userId so multiple users on the same browser never collide.
 */

// ── Keys ──────────────────────────────────────────────────────────────────────
function chatKey(userId: string)    { return `ns_ai_chat_${userId}`; }
function trialKey(userId: string)   { return `ns_ai_trial_${userId}`; }
function scoreKey(userId: string)   { return `ns_wellness_score_${userId}`; }
function goalKey(userId: string)    { return `ns_wellness_goal_${userId}`; }
function pointsKey(userId: string)  { return `ns_wellness_points_${userId}`; }

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface TrialData {
  startedAt: number;   // ms timestamp when trial began
  active: boolean;
}

export type WellnessGoal =
  | "Weight Loss"
  | "Muscle Gain"
  | "Healthy Lifestyle"
  | "Better Sleep"
  | "Improve Fitness"
  | "Stress Management";

export interface WellnessScoreData {
  score: number;          // 0–100
  level: string;          // Beginner / Improving / Consistent / Excellent
  points: number;         // cumulative points earned
  lastUpdated: string;    // YYYY-MM-DD
}

export interface GoalData {
  goal: WellnessGoal;
  setAt: number;
}

export interface PointsLog {
  entries: { date: string; reason: string; pts: number }[];
}

// ── Trial helpers ─────────────────────────────────────────────────────────────
const TRIAL_DAYS = 7;

export const TrialStorage = {
  start(userId: string): void {
    if (typeof window === "undefined") return;
    const existing = TrialStorage.load(userId);
    if (existing) return; // already started
    const data: TrialData = { startedAt: Date.now(), active: true };
    localStorage.setItem(trialKey(userId), JSON.stringify(data));
  },

  load(userId: string): TrialData | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(trialKey(userId));
    if (!raw) return null;
    try { return JSON.parse(raw) as TrialData; } catch { return null; }
  },

  /** Returns true if trial is active (started and within 7 days). */
  isActive(userId: string): boolean {
    const data = TrialStorage.load(userId);
    if (!data) return false;
    const elapsed = Date.now() - data.startedAt;
    return elapsed < TRIAL_DAYS * 24 * 60 * 60 * 1000;
  },

  /** Returns days remaining in trial (0 if expired). */
  daysLeft(userId: string): number {
    const data = TrialStorage.load(userId);
    if (!data) return 0;
    const elapsed = Date.now() - data.startedAt;
    const remaining = TRIAL_DAYS - Math.floor(elapsed / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  },
};

// ── Chat history ──────────────────────────────────────────────────────────────
export const ChatStorage = {
  load(userId: string): ChatMessage[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(chatKey(userId));
    if (!raw) return [];
    try { return JSON.parse(raw) as ChatMessage[]; } catch { return []; }
  },

  save(userId: string, messages: ChatMessage[]): void {
    if (typeof window === "undefined") return;
    // Keep last 50 messages to avoid unbounded growth
    const trimmed = messages.slice(-50);
    localStorage.setItem(chatKey(userId), JSON.stringify(trimmed));
  },

  clear(userId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(chatKey(userId));
  },
};

// ── Wellness goal ─────────────────────────────────────────────────────────────
export const GoalStorage = {
  save(userId: string, goal: WellnessGoal): void {
    if (typeof window === "undefined") return;
    const data: GoalData = { goal, setAt: Date.now() };
    localStorage.setItem(goalKey(userId), JSON.stringify(data));
  },

  load(userId: string): GoalData | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(goalKey(userId));
    if (!raw) return null;
    try { return JSON.parse(raw) as GoalData; } catch { return null; }
  },
};

// ── Wellness score ────────────────────────────────────────────────────────────
export const ScoreStorage = {
  save(userId: string, data: WellnessScoreData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(scoreKey(userId), JSON.stringify(data));
  },

  load(userId: string): WellnessScoreData | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(scoreKey(userId));
    if (!raw) return null;
    try { return JSON.parse(raw) as WellnessScoreData; } catch { return null; }
  },
};

// ── Points log ────────────────────────────────────────────────────────────────
export const PointsStorage = {
  load(userId: string): PointsLog {
    if (typeof window === "undefined") return { entries: [] };
    const raw = localStorage.getItem(pointsKey(userId));
    if (!raw) return { entries: [] };
    try { return JSON.parse(raw) as PointsLog; } catch { return { entries: [] }; }
  },

  addPoints(userId: string, reason: string, pts: number): void {
    if (typeof window === "undefined") return;
    const log = PointsStorage.load(userId);
    const today = new Date().toISOString().slice(0, 10);
    log.entries.push({ date: today, reason, pts });
    // Keep last 100 entries
    log.entries = log.entries.slice(-100);
    localStorage.setItem(pointsKey(userId), JSON.stringify(log));
  },

  totalPoints(userId: string): number {
    return PointsStorage.load(userId).entries.reduce((s, e) => s + e.pts, 0);
  },
};

// ── Score calculation ─────────────────────────────────────────────────────────
export interface TrackerSnapshot {
  calories: number | null;
  sleepHrs: number | null;
  water: number | null;
  workoutMin: number | null;
  steps: number | null;
  bmi: number | null;
}

export function calcWellnessScore(snap: TrackerSnapshot): number {
  let score = 0;

  // Calories logged at all → 15 pts
  if (snap.calories !== null && snap.calories > 0) score += 15;

  // Sleep: 7–9h = 20, 6–7 or 9–10 = 12, anything logged = 5
  if (snap.sleepHrs !== null) {
    if (snap.sleepHrs >= 7 && snap.sleepHrs <= 9) score += 20;
    else if (snap.sleepHrs >= 6) score += 12;
    else score += 5;
  }

  // Water: 8+ glasses = 20, 5–7 = 12, 1–4 = 5
  if (snap.water !== null) {
    if (snap.water >= 8) score += 20;
    else if (snap.water >= 5) score += 12;
    else if (snap.water >= 1) score += 5;
  }

  // Workout: 30+ min = 20, 10–29 = 12, any = 5
  if (snap.workoutMin !== null) {
    if (snap.workoutMin >= 30) score += 20;
    else if (snap.workoutMin >= 10) score += 12;
    else score += 5;
  }

  // Steps: 10000+ = 15, 5000–9999 = 10, any = 4
  if (snap.steps !== null) {
    if (snap.steps >= 10000) score += 15;
    else if (snap.steps >= 5000) score += 10;
    else score += 4;
  }

  // BMI in healthy range (18.5–24.9) = 10
  if (snap.bmi !== null && snap.bmi >= 18.5 && snap.bmi <= 24.9) score += 10;

  return Math.min(100, score);
}

export function scoreToLevel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 55) return "Consistent";
  if (score >= 30) return "Improving";
  return "Beginner";
}
