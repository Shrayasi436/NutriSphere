"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { StepsStorage, type StepsEntry } from "@/app/lib/trackerStorage";
import { AuthUser } from "@/app/lib/api";

const GOAL = 10000;

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayDisplay(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function StepsContent() {
  const router = useRouter();
  const [stepsInput, setStepsInput] = useState("");
  const [entries,    setEntries]    = useState<StepsEntry[]>([]);
  const [error,      setError]      = useState("");
  const [saved,      setSaved]      = useState(false);

  // Load persisted entries on mount
  useEffect(() => {
    const user = getUser<AuthUser>();
    if (!user) return;
    const stored = StepsStorage.load(user.id);
    setEntries(stored.entries);
  }, []);

  // Latest entry for the ring display
  const latestEntry = entries[0] ?? null;
  const logged = latestEntry?.steps ?? null;
  const pct = logged !== null ? Math.min(logged / GOAL, 1) : 0;
  const circ = 2 * Math.PI * 54;

  /** Only saves when user explicitly clicks "Save Steps". */
  function handleLog() {
    const n = parseInt(stepsInput);
    if (isNaN(n) || n < 0) { setError("Please enter a valid step count."); return; }
    setError("");

    const now = new Date();
    const timeDisplay = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newEntry: StepsEntry = {
      id:          `${Date.now()}`,
      steps:       n,
      dateKey:     todayDateKey(),
      dateDisplay: todayDisplay(),
      timeDisplay,
    };

    const updated = [newEntry, ...entries].slice(0, 30); // keep last 30 entries
    setEntries(updated);

    const user = getUser<AuthUser>();
    if (user) {
      StepsStorage.save(user.id, { entries: updated });
    }

    setStepsInput("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDelete(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    const user = getUser<AuthUser>();
    if (user) {
      StepsStorage.save(user.id, { entries: updated });
    }
  }

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-6 pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Step Counter</h1>
          <p className="text-[#5C6B63]">Daily goal: {GOAL.toLocaleString()} steps</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Ring */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card p-8 text-center">
            <div className="flex justify-center mb-6">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#D6E2D3" strokeWidth="10" />
                <motion.circle cx="70" cy="70" r="54" fill="none" stroke="#A8CFA8" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - pct) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  transform="rotate(-90 70 70)" />
                <text x="70" y="62" textAnchor="middle" fill="#1F3A2E" fontSize="18" fontWeight="700">
                  {logged !== null ? logged.toLocaleString() : "--"}
                </text>
                <text x="70" y="80" textAnchor="middle" fill="#5C6B63" fontSize="10">steps today</text>
              </svg>
            </div>
            {logged !== null && (
              <p className="text-sm text-[#5C6B63] mb-2">
                {logged >= GOAL ? "Goal reached!" : `${(GOAL - logged).toLocaleString()} steps remaining`}
              </p>
            )}
            {logged !== null && (
              <div className="mt-4 pt-4 border-t border-[#D6E2D3] space-y-2">
                {[
                  { label: "Calories burned (est.)", value: `${Math.round(logged * 0.04)} kcal` },
                  { label: "Distance (est.)",        value: `${(logged * 0.0008).toFixed(1)} km`  },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-[#5C6B63]">{s.label}</span>
                    <span className="font-semibold text-[#1F3A2E]">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Log form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6">
            <h2 className="text-base font-bold text-[#1F3A2E] mb-4">Log Steps</h2>
            {error && (
              <p className="mb-3 text-sm text-red-500 px-3 py-2 bg-red-50 rounded-xl border border-red-200">{error}</p>
            )}
            <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Steps taken</label>
            <input type="number" min="0" placeholder="e.g. 7500"
              value={stepsInput} onChange={e => setStepsInput(e.target.value)}
              className="input-premium mb-4" />
            <button onClick={handleLog} className="btn-premium w-full">Save Steps</button>

            <AnimatePresence>
              {saved && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center text-sm text-[#7A9B76] font-medium mt-3">
                  Steps saved.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Step history — persisted entries */}
        {entries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-6 glass-card p-6">
            <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Step History</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {entries.map(entry => (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(168,207,168,0.08)" }}>
                    <div>
                      <p className="text-sm font-semibold text-[#1F3A2E]">{entry.steps.toLocaleString()} steps</p>
                      <p className="text-xs text-[#5C6B63]">{entry.dateDisplay} · {entry.timeDisplay}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${entry.steps >= GOAL ? "text-[#7A9B76]" : "text-[#5C6B63]"}`}>
                        {entry.steps >= GOAL ? "Goal ✓" : `${Math.round((entry.steps / GOAL) * 100)}%`}
                      </span>
                      <button onClick={() => handleDelete(entry.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[#5C6B63] hover:text-red-500 hover:bg-red-50 transition-all"
                        aria-label="Delete entry">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function StepsPage() {
  return <AuthGuard><StepsContent /></AuthGuard>;
}
