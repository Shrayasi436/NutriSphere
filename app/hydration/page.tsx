"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { WaterStorage, type WaterEntry } from "@/app/lib/trackerStorage";
import { AuthUser } from "@/app/lib/api";

const GOAL = 8;
const ML_PER_GLASS = 250;

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function HydrationContent() {
  const router = useRouter();
  const [entries,  setEntries]  = useState<WaterEntry[]>([]);
  const [quantity, setQuantity] = useState("1"); // glasses to log
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);

  // Load persisted entries on mount
  useEffect(() => {
    const user = getUser<AuthUser>();
    if (!user) return;
    const stored = WaterStorage.load(user.id);
    setEntries(stored.entries);
  }, []);

  const totalGlasses = entries.reduce((s, e) => s + e.glasses, 0);
  const pct = Math.min(totalGlasses / GOAL, 1);

  /** Only saves when user explicitly clicks "Log Water Intake". */
  function handleLog() {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    setError("");

    const now = new Date();
    const timeDisplay = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newEntry: WaterEntry = {
      id:          `${Date.now()}`,
      glasses:     qty,
      ml:          Math.round(qty * ML_PER_GLASS),
      timeDisplay,
      dateKey:     todayDateKey(),
    };

    const updated = [newEntry, ...entries];
    const newTotal = updated.reduce((s, e) => s + e.glasses, 0);
    setEntries(updated);

    const user = getUser<AuthUser>();
    if (user) {
      WaterStorage.save(user.id, { entries: updated, totalGlasses: newTotal });
    }

    setQuantity("1");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDelete(id: string) {
    const updated = entries.filter(e => e.id !== id);
    const newTotal = updated.reduce((s, e) => s + e.glasses, 0);
    setEntries(updated);
    const user = getUser<AuthUser>();
    if (user) {
      WaterStorage.save(user.id, { entries: updated, totalGlasses: newTotal });
    }
  }

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-10 w-64 h-64 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
      </div>

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
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Water Intake</h1>
          <p className="text-[#5C6B63]">Daily goal: {GOAL} glasses ({GOAL * ML_PER_GLASS} ml)</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Progress ring */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card p-8 text-center">
            <div className="flex justify-center mb-6">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#D6E2D3" strokeWidth="10" />
                <motion.circle cx="70" cy="70" r="54" fill="none" stroke="#5DA9A6" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 54}
                  initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - pct) }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  transform="rotate(-90 70 70)" />
                <text x="70" y="64" textAnchor="middle" fill="#1F3A2E" fontSize="28" fontWeight="700">
                  {totalGlasses % 1 === 0 ? totalGlasses : totalGlasses.toFixed(1)}
                </text>
                <text x="70" y="82" textAnchor="middle" fill="#5C6B63" fontSize="11">of {GOAL} glasses</text>
              </svg>
            </div>
            <p className="text-sm text-[#5C6B63] mb-2">
              {totalGlasses >= GOAL ? "Daily goal reached!" : `${(GOAL - totalGlasses).toFixed(1)} more to reach your goal`}
            </p>
            <p className="text-xs text-[#5C6B63]">{Math.round(totalGlasses * ML_PER_GLASS)} ml consumed</p>
          </motion.div>

          {/* Log form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6">
            <h2 className="text-base font-bold text-[#1F3A2E] mb-4">Log Water Intake</h2>
            {error && (
              <p className="mb-3 text-sm text-red-500 px-3 py-2 bg-red-50 rounded-xl border border-red-200">{error}</p>
            )}
            <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Glasses (250 ml each)</label>
            <input
              type="number" min="0.5" step="0.5" placeholder="e.g. 1"
              value={quantity} onChange={e => setQuantity(e.target.value)}
              className="input-premium mb-4"
            />
            {quantity && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0 && (
              <p className="text-sm text-[#5DA9A6] font-medium mb-3">
                = {Math.round(parseFloat(quantity) * ML_PER_GLASS)} ml
              </p>
            )}
            <button onClick={handleLog} className="btn-premium w-full">Log Water Intake</button>

            <AnimatePresence>
              {saved && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-sm text-[#7A9B76] font-medium mt-3">
                  Water intake logged.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Today's log — persisted entries */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-6 glass-card p-6">
          <h2 className="text-base font-bold text-[#1F3A2E] mb-4">Today&apos;s Log</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-[#5C6B63] text-center py-6">No entries yet. Log your first glass above.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {entries.map(entry => (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(93,169,166,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#5DA9A6] flex-shrink-0" />
                      <div>
                        <span className="text-sm text-[#1F3A2E] font-medium">
                          {entry.glasses % 1 === 0 ? entry.glasses : entry.glasses.toFixed(1)} glass{entry.glasses !== 1 ? "es" : ""} ({entry.ml} ml)
                        </span>
                        <p className="text-xs text-[#5C6B63]">{entry.timeDisplay}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(entry.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#5C6B63] hover:text-red-500 hover:bg-red-50 transition-all"
                      aria-label="Delete entry">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-4 glass-card p-5">
          <p className="text-xs text-[#5C6B63] leading-relaxed">
            <span className="font-semibold text-[#1F3A2E]">Hydration tip — </span>
            The general recommendation is 8 glasses (2 litres) of water per day. Needs vary based on
            activity level, climate, and body weight. Staying hydrated supports metabolism, focus, and recovery.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function HydrationPage() {
  return <AuthGuard><HydrationContent /></AuthGuard>;
}
