"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { WorkoutStorage, type WorkoutSession } from "@/app/lib/trackerStorage";
import { AuthUser } from "@/app/lib/api";

const WORKOUT_TYPES = [
  "Running", "Cardio", "Strength", "Yoga", "HIIT",
  "Walking", "Cycling", "Swimming", "Other",
];

const CAL_PER_MIN: Record<string, number> = {
  Running: 11, Cardio: 10, Strength: 7, Yoga: 4, HIIT: 12,
  Walking: 5, Cycling: 9, Swimming: 11, Other: 6,
};

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function WorkoutContent() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [duration, setDuration] = useState("");
  const [type,     setType]     = useState("Running");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);

  // Load persisted sessions on mount
  useEffect(() => {
    const user = getUser<AuthUser>();
    if (!user) return;
    const stored = WorkoutStorage.load(user.id);
    setSessions(stored.sessions);
  }, []);

  function handleLog() {
    if (!name.trim()) { setError("Please enter a workout name."); return; }
    const dur = parseInt(duration);
    if (isNaN(dur) || dur <= 0) { setError("Please enter a valid duration in minutes."); return; }
    setError("");

    const calories = Math.round((CAL_PER_MIN[type] ?? 6) * dur);
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newSession: WorkoutSession = {
      id:          `${Date.now()}`,
      name:        name.trim(),
      type,
      duration:    dur,
      calories,
      timestamp:   now.toISOString(),
      timeDisplay,
      dateKey:     todayDateKey(),
    };

    const updated = [newSession, ...sessions];
    const totalMinutes  = updated.reduce((s, e) => s + e.duration, 0);
    const totalCalories = updated.reduce((s, e) => s + e.calories, 0);

    setSessions(updated);

    const user = getUser<AuthUser>();
    if (user) {
      WorkoutStorage.save(user.id, {
        sessions: updated,
        totalMinutes,
        totalCalories,
      });
    }

    setName(""); setDuration("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDelete(id: string) {
    const updated = sessions.filter(s => s.id !== id);
    const totalMinutes  = updated.reduce((s, e) => s + e.duration, 0);
    const totalCalories = updated.reduce((s, e) => s + e.calories, 0);
    setSessions(updated);
    const user = getUser<AuthUser>();
    if (user) {
      WorkoutStorage.save(user.id, { sessions: updated, totalMinutes, totalCalories });
    }
  }

  const totalMin = sessions.reduce((s, e) => s + e.duration, 0);
  const totalCal = sessions.reduce((s, e) => s + e.calories, 0);

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-10 w-64 h-64 bg-[#7A9B76] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#5C6B63] hover:text-[#1F3A2E] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <span className="font-bold text-[#1F3A2E]">Nutri<span className="text-[#5DA9A6]">Sphere</span></span>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Workout Log</h1>
          <p className="text-[#5C6B63]">Track your exercise sessions and calories burned</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="lg:col-span-3 glass-card p-7">
            <h2 className="text-base font-bold text-[#1F3A2E] mb-5">Log a Workout</h2>
            {error && <p className="mb-4 text-sm text-red-500 px-3 py-2 bg-red-50 rounded-xl border border-red-200">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Workout Name</label>
                <input type="text" placeholder="e.g. Morning Run, Chest Day…"
                  value={name} onChange={e => setName(e.target.value)} className="input-premium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Duration (min)</label>
                  <input type="number" min="1" placeholder="e.g. 45"
                    value={duration} onChange={e => setDuration(e.target.value)} className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="input-premium">
                    {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {duration && !isNaN(parseInt(duration)) && parseInt(duration) > 0 && (
                <p className="text-sm text-[#5DA9A6] font-medium">
                  Estimated burn: {Math.round((CAL_PER_MIN[type] ?? 6) * parseInt(duration))} kcal
                </p>
              )}

              <button onClick={handleLog} className="btn-premium w-full">Log Workout</button>

              <AnimatePresence>
                {saved && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center text-sm text-[#7A9B76] font-medium">
                    Workout saved.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Session list — from persisted storage */}
            {sessions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#D6E2D3]">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-3">All Sessions</p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {sessions.map(s => (
                      <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#D6E2D3]/60"
                        style={{ background: "rgba(255,255,255,0.55)" }}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1F3A2E] truncate">{s.name}</p>
                          <p className="text-xs text-[#5C6B63]">{s.type} · {s.timeDisplay}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#1F3A2E]">{s.duration} min</p>
                            <p className="text-xs text-[#5DA9A6]">{s.calories} kcal</p>
                          </div>
                          <button onClick={() => handleDelete(s.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C6B63] hover:text-red-500 hover:bg-red-50 transition-all"
                            aria-label="Delete session">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>

          {/* Summary */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Summary</p>
              <div className="space-y-4">
                {[
                  { label: "Total Duration",  value: `${totalMin} min`,      color: "#7A9B76" },
                  { label: "Calories Burned", value: `${totalCal} kcal`,     color: "#A8CFA8" },
                  { label: "Sessions",        value: `${sessions.length}`,   color: "#5DA9A6" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-[#5C6B63] mb-0.5">{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="glass-card p-5">
              <p className="text-xs text-[#5C6B63] leading-relaxed">
                <span className="font-semibold text-[#1F3A2E]">Calorie estimates — </span>
                Values are approximate and based on average metabolic rates per activity type.
                Actual burn varies by body weight, intensity, and fitness level.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  return <AuthGuard><WorkoutContent /></AuthGuard>;
}
