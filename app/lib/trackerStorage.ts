/**
 * Shared localStorage helpers for tracker data.
 * Keys are scoped to userId (not date) so data persists across days.
 * Dashboard reads from these same keys.
 */

// ── Generic read / write ──────────────────────────────────────────────────────

function storageKey(userId: string, tracker: string): string {
  return `ns_tracker_${userId}_${tracker}`;
}

export function writeTracker<T>(userId: string, tracker: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId, tracker), JSON.stringify(value));
}

export function readTracker<T>(userId: string, tracker: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(storageKey(userId, tracker));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────

export interface SleepEntry {
  id: string;
  date: string;      // display string e.g. "Mon, Jan 6"
  dateKey: string;   // YYYY-MM-DD
  hours: number;     // exact decimal e.g. 6.75
  quality: string;
}

export interface SleepData {
  entries: SleepEntry[];
}

export const SleepStorage = {
  save(userId: string, data: SleepData): void {
    writeTracker(userId, "sleep", data);
  },

  load(userId: string): SleepData {
    return readTracker<SleepData>(userId, "sleep") ?? { entries: [] };
  },

  latestHours(userId: string): number | null {
    const data = readTracker<SleepData>(userId, "sleep");
    if (!data || data.entries.length === 0) return null;
    return data.entries[0].hours;
  },
};

// ── Workout ───────────────────────────────────────────────────────────────────

export interface WorkoutSession {
  id: string;
  name: string;
  type: string;
  duration: number;   // minutes
  calories: number;
  timestamp: string;  // ISO string
  timeDisplay: string; // "10:30 AM"
  dateKey: string;    // YYYY-MM-DD
}

export interface WorkoutData {
  sessions: WorkoutSession[];
  // Derived totals (recomputed on load)
  totalMinutes: number;
  totalCalories: number;
}

export const WorkoutStorage = {
  save(userId: string, data: WorkoutData): void {
    writeTracker(userId, "workout", data);
  },

  load(userId: string): WorkoutData {
    return readTracker<WorkoutData>(userId, "workout") ?? {
      sessions: [],
      totalMinutes: 0,
      totalCalories: 0,
    };
  },

  /** Returns total minutes across all sessions (for dashboard card). */
  totalMinutes(userId: string): number | null {
    const data = readTracker<WorkoutData>(userId, "workout");
    if (!data || data.sessions.length === 0) return null;
    return data.totalMinutes;
  },
};

// ── Steps ─────────────────────────────────────────────────────────────────────

export interface StepsEntry {
  id: string;
  steps: number;
  dateKey: string;    // YYYY-MM-DD
  dateDisplay: string; // "Mon, Jan 6"
  timeDisplay: string; // "10:30 AM"
}

export interface StepsData {
  entries: StepsEntry[];
}

export const StepsStorage = {
  save(userId: string, data: StepsData): void {
    writeTracker(userId, "steps", data);
  },

  load(userId: string): StepsData {
    return readTracker<StepsData>(userId, "steps") ?? { entries: [] };
  },

  /** Latest step count for dashboard card (null if none). */
  latestSteps(userId: string): number | null {
    const data = readTracker<StepsData>(userId, "steps");
    if (!data || data.entries.length === 0) return null;
    return data.entries[0].steps;
  },
};

// ── Water ─────────────────────────────────────────────────────────────────────

export interface WaterEntry {
  id: string;
  glasses: number;
  ml: number;
  timeDisplay: string; // "10:30 AM"
  dateKey: string;     // YYYY-MM-DD
}

export interface WaterData {
  entries: WaterEntry[];
  totalGlasses: number; // sum for today
}

export const WaterStorage = {
  save(userId: string, data: WaterData): void {
    writeTracker(userId, "water", data);
  },

  load(userId: string): WaterData {
    return readTracker<WaterData>(userId, "water") ?? { entries: [], totalGlasses: 0 };
  },

  /** Total glasses today for dashboard card (null if none logged). */
  totalGlasses(userId: string): number | null {
    const data = readTracker<WaterData>(userId, "water");
    if (!data || data.entries.length === 0) return null;
    return data.totalGlasses;
  },
};

// ── BMI ───────────────────────────────────────────────────────────────────────

export interface BMIData {
  bmi: number;
  category: string;
}

export const BMIStorage = {
  save(userId: string, data: BMIData): void {
    writeTracker(userId, "bmi", data);
  },

  load(userId: string): BMIData | null {
    return readTracker<BMIData>(userId, "bmi");
  },
};
