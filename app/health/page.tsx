"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import {
  fetchBMR,
  saveHealthProfile,
  BMRResult,
  HealthProfile,
} from "@/app/lib/api";
import { removeToken } from "@/app/lib/auth";

// ── Activity options ──────────────────────────────────────────────────────────
const ACTIVITY_OPTIONS = [
  { value: "mostly sitting",         label: "Mostly Sitting",          sub: "Desk job, little movement" },
  { value: "often standing",         label: "Often Standing",          sub: "Light activity, on feet often" },
  { value: "regularly walking",      label: "Regularly Walking",       sub: "Moderate exercise 3-5x/week" },
  { value: "physically intense work",label: "Physically Intense Work", sub: "Hard exercise or physical job" },
];

const GOAL_OPTIONS = [
  { value: "Weight Loss",      label: "Weight Loss",      desc: "Calorie deficit" },
  { value: "Muscle Gain",      label: "Muscle Gain",      desc: "Calorie surplus" },
  { value: "Healthy Lifestyle",label: "Maintenance",      desc: "Maintain current weight" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  sub,
  accent,
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="glass-card p-6"
    >
      <p className="text-sm font-medium text-[#5C6B63] mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="text-sm text-[#5C6B63]">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-[#5C6B63] mt-1.5">{sub}</p>}
    </motion.div>
  );
}

// ── Main page content ─────────────────────────────────────────────────────────
function HealthContent() {
  const router = useRouter();

  const [form, setForm] = useState<Partial<HealthProfile>>({
    age: undefined,
    height: undefined,
    weight: undefined,
    gender: "",
    activityLevel: "",
    goal: "Healthy Lifestyle",
  });

  const [bmr, setBmr] = useState<BMRResult | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Load existing profile + BMR on mount
  useEffect(() => {
    fetchBMR()
      .then((res) => {
        if (res.profileComplete && res.profile) {
          setForm({
            age:           res.profile.age,
            height:        res.profile.height,
            weight:        res.profile.weight,
            gender:        res.profile.gender,
            activityLevel: res.profile.activityLevel,
            goal:          res.profile.goal || "Healthy Lifestyle",
          });
          setBmr(res.bmr);
          setProfileComplete(true);
        }
      })
      .catch(() => {
        removeToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function update<K extends keyof HealthProfile>(field: K, value: HealthProfile[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const { age, height, weight, gender, activityLevel } = form;
    if (!age || !height || !weight || !gender || !activityLevel) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await saveHealthProfile(form);
      setBmr(res.bmr);
      setProfileComplete(true);
      setSaved(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A8CFA8]/30 border-t-[#A8CFA8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-10 w-72 h-72 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-32 right-10 w-72 h-72 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />
      </div>

      {/* Nav */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#5C6B63] hover:text-[#1F3A2E] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-[#1F3A2E]">
              Nutri<span className="text-[#5DA9A6]">Sphere</span>
            </span>
          </div>

          <div className="w-24" /> {/* spacer */}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8 relative z-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Health Profile</h1>
          <p className="text-[#5C6B63]">
            Your BMR and daily calorie targets are calculated using the Mifflin-St Jeor equation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="glass-card p-8">
              <h2 className="text-lg font-bold text-[#1F3A2E] mb-6">
                Body Measurements
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Age / Gender row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                      Age <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="e.g. 28"
                      value={form.age ?? ""}
                      onChange={(e) => update("age", Number(e.target.value))}
                      className="input-premium"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.gender ?? ""}
                      onChange={(e) => update("gender", e.target.value)}
                      className="input-premium"
                      disabled={saving}
                    >
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g.toLowerCase()}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Height / Weight row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                      Height (cm) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={300}
                      placeholder="e.g. 175"
                      value={form.height ?? ""}
                      onChange={(e) => update("height", Number(e.target.value))}
                      className="input-premium"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                      Weight (kg) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      placeholder="e.g. 70"
                      value={form.weight ?? ""}
                      onChange={(e) => update("weight", Number(e.target.value))}
                      className="input-premium"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Activity level */}
                <div>
                  <label className="block text-sm font-medium text-[#1F3A2E] mb-2">
                    Activity Level <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("activityLevel", opt.value)}
                        disabled={saving}
                        className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          form.activityLevel === opt.value
                            ? "border-[#A8CFA8] bg-[#A8CFA8]/10"
                            : "border-[#D6E2D3] bg-white/50 hover:border-[#A8CFA8]/60"
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#1F3A2E]">{opt.label}</p>
                        <p className="text-xs text-[#5C6B63] mt-0.5">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness goal */}
                <div>
                  <label className="block text-sm font-medium text-[#1F3A2E] mb-2">
                    Fitness Goal
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("goal", opt.value)}
                        disabled={saving}
                        className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.goal === opt.value
                            ? "border-[#5DA9A6] bg-[#5DA9A6]/10 text-[#1F3A2E]"
                            : "border-[#D6E2D3] bg-white/50 text-[#5C6B63] hover:border-[#5DA9A6]/60"
                        }`}
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <span className="ml-1.5 text-xs opacity-70">({opt.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-premium w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Calculating…
                    </>
                  ) : (
                    "Calculate BMR"
                  )}
                </button>

                <AnimatePresence>
                  {saved && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-sm text-[#7A9B76] font-medium"
                    >
                      Profile saved and BMR updated.
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

          {/* ── Right: Results ── */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {bmr ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Goal badge */}
                  <div className="glass-card px-5 py-3 flex items-center justify-between">
                    <span className="text-sm text-[#5C6B63]">Current goal</span>
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)",
                        color: "white",
                      }}
                    >
                      {bmr.goalLabel}
                    </span>
                  </div>

                  <StatCard
                    label="Basal Metabolic Rate"
                    value={bmr.bmr.toLocaleString()}
                    unit="kcal / day"
                    sub="Calories burned at complete rest"
                    accent="#1F3A2E"
                    delay={0}
                  />

                  <StatCard
                    label="Total Daily Energy Expenditure"
                    value={bmr.tdee.toLocaleString()}
                    unit="kcal / day"
                    sub="Calories burned with your activity level"
                    accent="#5DA9A6"
                    delay={0.08}
                  />

                  <StatCard
                    label="Daily Calorie Target"
                    value={bmr.dailyCalorieTarget.toLocaleString()}
                    unit="kcal / day"
                    sub={
                      bmr.dailyCalorieTarget < bmr.maintenance
                        ? `${bmr.maintenance - bmr.dailyCalorieTarget} kcal deficit`
                        : bmr.dailyCalorieTarget > bmr.maintenance
                        ? `${bmr.dailyCalorieTarget - bmr.maintenance} kcal surplus`
                        : "Maintenance calories"
                    }
                    accent="#A8CFA8"
                    delay={0.16}
                  />

                  {/* Macro split hint */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="glass-card p-5"
                  >
                    <p className="text-sm font-semibold text-[#1F3A2E] mb-3">
                      Suggested Macro Split
                    </p>
                    {[
                      { label: "Protein", pct: 30, color: "#A8CFA8" },
                      { label: "Carbs",   pct: 45, color: "#5DA9A6" },
                      { label: "Fat",     pct: 25, color: "#7A9B76" },
                    ].map((m) => {
                      const kcal = Math.round((bmr.dailyCalorieTarget * m.pct) / 100);
                      const grams = Math.round(
                        m.label === "Fat" ? kcal / 9 : kcal / 4
                      );
                      return (
                        <div key={m.label} className="mb-3 last:mb-0">
                          <div className="flex justify-between text-xs text-[#5C6B63] mb-1">
                            <span className="font-medium">{m.label}</span>
                            <span>{grams}g &nbsp;·&nbsp; {kcal} kcal</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#D6E2D3] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${m.pct}%`, background: m.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-8 text-center"
                >
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(168,207,168,0.2)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#1F3A2E] mb-1">
                    No results yet
                  </p>
                  <p className="text-xs text-[#5C6B63]">
                    Fill in your measurements and click Calculate BMR to see your results.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card p-5"
        >
          <p className="text-xs text-[#5C6B63] leading-relaxed">
            <span className="font-semibold text-[#1F3A2E]">About this calculation — </span>
            BMR is calculated using the Mifflin-St Jeor equation, the most accurate formula for
            estimating resting energy expenditure. TDEE applies an activity multiplier to account
            for your daily movement. Calorie targets are adjusted based on your selected fitness goal.
            These are estimates — individual results may vary.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  return (
    <AuthGuard>
      <HealthContent />
    </AuthGuard>
  );
}
