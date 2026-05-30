"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { SleepStorage, type SleepEntry } from "@/app/lib/trackerStorage";
import { AuthUser } from "@/app/lib/api";

// ── Time helpers ──────────────────────────────────────────────────────────────

/** Convert { hour12, minute, period } → total minutes since midnight (0–1439). */
function toMinutes(hour12: number, minute: number, period: "AM" | "PM"): number {
  let h = hour12 % 12; // 12 AM → 0, 12 PM → 12
  if (period === "PM") h += 12;
  return h * 60 + minute;
}

/**
 * Calculate sleep duration in exact decimal hours.
 * Always treats bedtime as the START and wake time as the END.
 * If wake ≤ bed (overnight), adds 24 h to wake so the diff is positive.
 */
function calcHours(
  bedH: number, bedM: number, bedP: "AM" | "PM",
  wakeH: number, wakeM: number, wakeP: "AM" | "PM"
): number {
  const bedMins  = toMinutes(bedH, bedM, bedP);
  const wakeMins = toMinutes(wakeH, wakeM, wakeP);
  let diff = wakeMins - bedMins;
  if (diff <= 0) diff += 24 * 60; // crossed midnight
  return diff / 60;
}

/** Format decimal hours as "7h 45m". */
function fmtHours(h: number): string {
  const totalMins = Math.round(h * 60);
  const hrs  = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/** Format a time selection as "10:30 PM". */
function fmtTime(hour12: number, minute: number, period: "AM" | "PM"): string {
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/** Auto-assign quality from duration. */
function autoQuality(hours: number): string {
  if (hours < 5)    return "Poor";
  if (hours < 6.5)  return "Fair";
  if (hours <= 8.5) return "Good";
  return "Excellent";
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayDisplay(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// ── Time picker sub-component ─────────────────────────────────────────────────
function TimePicker({
  label,
  hour, minute, period,
  onHour, onMinute, onPeriod,
}: {
  label: string;
  hour: number; minute: number; period: "AM" | "PM";
  onHour: (h: number) => void;
  onMinute: (m: number) => void;
  onPeriod: (p: "AM" | "PM") => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F3A2E] mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {/* Hour */}
        <select
          value={hour}
          onChange={e => onHour(Number(e.target.value))}
          className="input-premium flex-1 text-center"
          aria-label={`${label} hour`}
        >
          {HOURS_12.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-[#1F3A2E] font-bold text-lg">:</span>
        {/* Minute */}
        <select
          value={minute}
          onChange={e => onMinute(Number(e.target.value))}
          className="input-premium flex-1 text-center"
          aria-label={`${label} minute`}
        >
          {MINUTES.map(m => (
            <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
          ))}
        </select>
        {/* AM / PM */}
        <div className="flex rounded-xl overflow-hidden border-2 border-[#D6E2D3] flex-shrink-0">
          {(["AM", "PM"] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriod(p)}
              className="px-3 py-2 text-sm font-semibold transition-all"
              style={
                period === p
                  ? { background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.6)", color: "#5C6B63" }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#5C6B63] mt-1">{fmtTime(hour, minute, period)}</p>
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function SleepContent() {
  const router = useRouter();

  // Bedtime state
  const [bedH,  setBedH]  = useState(10);
  const [bedM,  setBedM]  = useState(0);
  const [bedP,  setBedP]  = useState<"AM" | "PM">("PM");

  // Wake time state
  const [wakeH, setWakeH] = useState(6);
  const [wakeM, setWakeM] = useState(0);
  const [wakeP, setWakeP] = useState<"AM" | "PM">("AM");

  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [error,   setError]   = useState("");
  const [saved,   setSaved]   = useState(false);

  // Load persisted entries on mount
  useEffect(() => {
    const user = getUser<AuthUser>();
    if (!user) return;
    const stored = SleepStorage.load(user.id);
    setEntries(stored.entries);
  }, []);

  // Live duration preview
  const preview = useMemo(
    () => calcHours(bedH, bedM, bedP, wakeH, wakeM, wakeP),
    [bedH, bedM, bedP, wakeH, wakeM, wakeP]
  );

  function handleLog() {
    if (preview <= 0 || preview > 24) {
      setError("Please check your times — duration must be between 0 and 24 hours.");
      return;
    }
    setError("");

    const quality = autoQuality(preview);
    const newEntry: SleepEntry = {
      id:      `${Date.now()}`,
      date:    todayDisplay(),
      dateKey: todayDateKey(),
      hours:   preview,
      quality,
    };

    const updated = [newEntry, ...entries].slice(0, 7);
    setEntries(updated);

    const user = getUser<AuthUser>();
    if (user) {
      SleepStorage.save(user.id, { entries: updated });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDelete(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    const user = getUser<AuthUser>();
    if (user) {
      SleepStorage.save(user.id, { entries: updated });
    }
  }

  const avgHours = useMemo(() => {
    if (entries.length === 0) return null;
    const sum = entries.reduce((s, e) => s + e.hours, 0);
    return (sum / entries.length).toFixed(1);
  }, [entries]);

  const latestHours = entries[0]?.hours ?? 0;
  const pct  = Math.min(latestHours / 9, 1);
  const circ = 2 * Math.PI * 54;

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 right-10 w-64 h-64 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-delayed" />
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
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Sleep Tracker</h1>
          <p className="text-[#5C6B63]">Log your rest and monitor recovery quality</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="lg:col-span-3 glass-card p-7">
            <h2 className="text-base font-bold text-[#1F3A2E] mb-5">Log Sleep</h2>
            {error && (
              <p className="mb-4 text-sm text-red-500 px-3 py-2 bg-red-50 rounded-xl border border-red-200">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <TimePicker
                label="Bedtime"
                hour={bedH} minute={bedM} period={bedP}
                onHour={setBedH} onMinute={setBedM} onPeriod={setBedP}
              />
              <TimePicker
                label="Wake Time"
                hour={wakeH} minute={wakeM} period={wakeP}
                onHour={setWakeH} onMinute={setWakeM} onPeriod={setWakeP}
              />
            </div>

            {/* Live duration preview */}
            <AnimatePresence>
              {preview > 0 && preview <= 24 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-5 px-4 py-3 rounded-xl border border-[#D6E2D3]"
                  style={{ background: "rgba(93,169,166,0.07)" }}>
                  <p className="text-sm text-[#1F3A2E]">
                    Sleep Duration:{" "}
                    <span className="font-bold text-[#5DA9A6]">{fmtHours(preview)}</span>
                    <span className="ml-2 text-xs text-[#5C6B63]">· {autoQuality(preview)}</span>
                  </p>
                  <p className="text-xs text-[#5C6B63] mt-0.5">
                    {fmtTime(bedH, bedM, bedP)} → {fmtTime(wakeH, wakeM, wakeP)}
                    {toMinutes(wakeH, wakeM, wakeP) <= toMinutes(bedH, bedM, bedP) && (
                      <span className="ml-1 text-[#5DA9A6]">(overnight)</span>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleLog} className="btn-premium w-full">Log Sleep</button>

            <AnimatePresence>
              {saved && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-sm text-[#7A9B76] font-medium mt-3">
                  Sleep entry saved.
                </motion.p>
              )}
            </AnimatePresence>

            {entries.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#D6E2D3]">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-3">Recent Entries</p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {entries.map(e => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(93,169,166,0.07)" }}>
                        <span className="text-sm text-[#5C6B63]">{e.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#5C6B63]">{e.quality}</span>
                          <span className="text-sm font-bold text-[#1F3A2E]">{fmtHours(e.hours)}</span>
                          <button
                            onClick={() => handleDelete(e.id)}
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
              </div>
            )}
          </motion.div>

          {/* Summary */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6 text-center">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Last Night</p>
              <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto mb-3">
                <circle cx="70" cy="70" r="54" fill="none" stroke="#D6E2D3" strokeWidth="10" />
                <motion.circle cx="70" cy="70" r="54" fill="none" stroke="#5DA9A6" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - pct) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  transform="rotate(-90 70 70)" />
                <text x="70" y="64" textAnchor="middle" fill="#1F3A2E" fontSize="26" fontWeight="700">
                  {latestHours > 0 ? fmtHours(latestHours) : "--"}
                </text>
                <text x="70" y="82" textAnchor="middle" fill="#5C6B63" fontSize="11">hours</text>
              </svg>
              <p className="text-xs text-[#5C6B63]">Recommended: 7–9 hours</p>
            </motion.div>

            {avgHours && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="glass-card p-5">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-3">Weekly Average</p>
                <p className="text-3xl font-bold text-[#5DA9A6]">
                  {avgHours}
                  <span className="text-sm font-normal text-[#5C6B63] ml-1">hrs/night</span>
                </p>
                <p className="text-xs text-[#5C6B63] mt-1">Based on {entries.length} logged {entries.length === 1 ? "entry" : "entries"}</p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <p className="text-xs text-[#5C6B63] leading-relaxed">
                <span className="font-semibold text-[#1F3A2E]">How it works — </span>
                Select your bedtime and wake time using the hour, minute, and AM/PM selectors.
                Overnight sleep (e.g. 10:00 PM to 6:00 AM) is calculated correctly as 8 hours.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SleepPage() {
  return <AuthGuard><SleepContent /></AuthGuard>;
}
