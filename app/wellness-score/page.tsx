"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { AuthUser } from "@/app/lib/api";
import {
  GoalStorage,
  ScoreStorage,
  PointsStorage,
  calcWellnessScore,
  scoreToLevel,
  type WellnessGoal,
  type WellnessScoreData,
} from "@/app/lib/wellnessStorage";
import {
  SleepStorage,
  WorkoutStorage,
  StepsStorage,
  WaterStorage,
  BMIStorage,
} from "@/app/lib/trackerStorage";

// ── Goal config ───────────────────────────────────────────────────────────────
const GOALS: { value: WellnessGoal; desc: string; color: string }[] = [
  { value: "Weight Loss",       desc: "Burn fat, reduce body weight",         color: "#C97B63" },
  { value: "Muscle Gain",       desc: "Build strength and lean muscle",        color: "#7A9B76" },
  { value: "Healthy Lifestyle", desc: "Balanced habits for long-term health",  color: "#A8CFA8" },
  { value: "Better Sleep",      desc: "Improve rest and recovery quality",     color: "#5DA9A6" },
  { value: "Improve Fitness",   desc: "Boost endurance and performance",       color: "#E0C897" },
  { value: "Stress Management", desc: "Reduce stress and improve wellbeing",   color: "#D8A7B1" },
];

// ── Milestones per goal ───────────────────────────────────────────────────────
const MILESTONES: Record<WellnessGoal, { label: string; pts: number }[]> = {
  "Weight Loss": [
    { label: "Log calories 3 days in a row",       pts: 30 },
    { label: "Reach 8,000+ steps in a day",        pts: 20 },
    { label: "Complete 3 workout sessions",        pts: 40 },
    { label: "Hit hydration goal 5 times",         pts: 25 },
    { label: "Log sleep for 7 consecutive days",   pts: 35 },
  ],
  "Muscle Gain": [
    { label: "Log 3 strength workouts",            pts: 40 },
    { label: "Track protein intake 5 days",        pts: 30 },
    { label: "Sleep 7+ hours for 5 nights",        pts: 35 },
    { label: "Log meals for 7 days straight",      pts: 30 },
    { label: "Complete a 45+ min workout",         pts: 25 },
  ],
  "Healthy Lifestyle": [
    { label: "Log all 6 trackers in one day",      pts: 50 },
    { label: "Reach hydration goal 5 times",       pts: 25 },
    { label: "Sleep 7–9 hours for 5 nights",       pts: 35 },
    { label: "Walk 10,000 steps in a day",         pts: 30 },
    { label: "Log meals for 7 days straight",      pts: 30 },
  ],
  "Better Sleep": [
    { label: "Log sleep for 3 consecutive days",   pts: 25 },
    { label: "Achieve 7–9 hours for 5 nights",     pts: 50 },
    { label: "Log sleep for 7 consecutive days",   pts: 40 },
    { label: "Reach hydration goal 3 times",       pts: 20 },
    { label: "Complete 3 relaxation workouts",     pts: 30 },
  ],
  "Improve Fitness": [
    { label: "Complete 5 workout sessions",        pts: 50 },
    { label: "Walk 10,000 steps in a day",         pts: 30 },
    { label: "Log workouts for 7 days",            pts: 40 },
    { label: "Complete a 60+ min workout",         pts: 35 },
    { label: "Hit step goal 5 times",              pts: 30 },
  ],
  "Stress Management": [
    { label: "Log sleep for 5 consecutive days",   pts: 35 },
    { label: "Complete 3 yoga/meditation sessions",pts: 40 },
    { label: "Reach hydration goal 5 times",       pts: 25 },
    { label: "Sleep 7–9 hours for 7 nights",       pts: 50 },
    { label: "Log all trackers for 3 days",        pts: 30 },
  ],
};

// ── Circular score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, level }: { score: number; level: string }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const levelColors: Record<string, string> = {
    Beginner:   "#D6E2D3",
    Improving:  "#A8CFA8",
    Consistent: "#5DA9A6",
    Excellent:  "#7A9B76",
  };
  const color = levelColors[level] ?? "#A8CFA8";

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#D6E2D3" strokeWidth="12" />
      <motion.circle
        cx="90" cy="90" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 90 90)"
      />
      <text x="90" y="82" textAnchor="middle" fill="#1F3A2E" fontSize="36" fontWeight="700">{score}</text>
      <text x="90" y="100" textAnchor="middle" fill="#5C6B63" fontSize="12">/100</text>
      <text x="90" y="118" textAnchor="middle" fill={color} fontSize="13" fontWeight="600">{level}</text>
    </svg>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function WellnessScoreContent() {
  const router = useRouter();
  const [user, setUser]           = useState<AuthUser | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<WellnessGoal | null>(null);
  const [scoreData, setScoreData] = useState<WellnessScoreData | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  useEffect(() => {
    const u = getUser<AuthUser>();
    if (!u) return;
    setUser(u);

    // Load saved goal
    const goalData = GoalStorage.load(u.id);
    if (goalData) setSelectedGoal(goalData.goal);

    // Load or compute score
    const snap = {
      calories:   null,
      sleepHrs:   SleepStorage.latestHours(u.id),
      water:      WaterStorage.totalGlasses(u.id),
      workoutMin: (() => { const w = WorkoutStorage.load(u.id); return w && w.sessions.length > 0 ? w.totalMinutes : null; })(),
      steps:      StepsStorage.latestSteps(u.id),
      bmi:        BMIStorage.load(u.id)?.bmi ?? null,
    };

    const score = calcWellnessScore(snap);
    const level = scoreToLevel(score);
    const today = new Date().toISOString().slice(0, 10);
    const newScoreData: WellnessScoreData = { score, level, points: PointsStorage.totalPoints(u.id), lastUpdated: today };
    ScoreStorage.save(u.id, newScoreData);
    setScoreData(newScoreData);
    setTotalPoints(PointsStorage.totalPoints(u.id));
  }, []);

  function handleGoalSelect(goal: WellnessGoal) {
    if (!user) return;
    GoalStorage.save(user.id, goal);
    setSelectedGoal(goal);
    setShowGoalPicker(false);
    // Award points for setting a goal
    PointsStorage.addPoints(user.id, "Set wellness goal", 10);
    setTotalPoints(PointsStorage.totalPoints(user.id));
  }

  const milestones = useMemo(() => {
    if (!selectedGoal) return [];
    return MILESTONES[selectedGoal] ?? [];
  }, [selectedGoal]);

  const goalConfig = GOALS.find(g => g.value === selectedGoal);

  // Tracker status for the breakdown
  const trackerStatus = useMemo(() => {
    if (!user) return [];
    const sleepHrs  = SleepStorage.latestHours(user.id);
    const water     = WaterStorage.totalGlasses(user.id);
    const workoutD  = WorkoutStorage.load(user.id);
    const workout   = (workoutD && workoutD.sessions.length > 0) ? workoutD.totalMinutes : null;
    const steps     = StepsStorage.latestSteps(user.id);
    const bmi       = BMIStorage.load(user.id)?.bmi ?? null;

    return [
      {
        label: "Sleep",
        value: sleepHrs !== null ? `${sleepHrs.toFixed(1)}h` : "--",
        pts: sleepHrs !== null ? (sleepHrs >= 7 && sleepHrs <= 9 ? 20 : sleepHrs >= 6 ? 12 : 5) : 0,
        max: 20,
        color: "#5DA9A6",
        logged: sleepHrs !== null,
      },
      {
        label: "Water",
        value: water !== null ? `${water} glasses` : "--",
        pts: water !== null ? (water >= 8 ? 20 : water >= 5 ? 12 : water >= 1 ? 5 : 0) : 0,
        max: 20,
        color: "#7FB7BE",
        logged: water !== null && water > 0,
      },
      {
        label: "Workout",
        value: workout !== null ? `${workout} min` : "--",
        pts: workout !== null ? (workout >= 30 ? 20 : workout >= 10 ? 12 : workout > 0 ? 5 : 0) : 0,
        max: 20,
        color: "#7A9B76",
        logged: workout !== null && workout > 0,
      },
      {
        label: "Steps",
        value: steps !== null ? steps.toLocaleString() : "--",
        pts: steps !== null ? (steps >= 10000 ? 15 : steps >= 5000 ? 10 : steps > 0 ? 4 : 0) : 0,
        max: 15,
        color: "#A8CFA8",
        logged: steps !== null && steps > 0,
      },
      {
        label: "BMI",
        value: bmi !== null ? bmi.toFixed(1) : "--",
        pts: bmi !== null && bmi >= 18.5 && bmi <= 24.9 ? 10 : 0,
        max: 10,
        color: "#E0C897",
        logged: bmi !== null,
      },
    ];
  }, [user]);

  const hasAnyData = trackerStatus.some(t => t.logged);

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 right-10 w-64 h-64 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-32 left-10 w-64 h-64 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#5C6B63] hover:text-[#1F3A2E] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-[#1F3A2E]">Wellness <span className="text-[#5DA9A6]">Score</span></span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Wellness Score</h1>
          <p className="text-[#5C6B63]">Track your progress and earn points for healthy habits</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Score + breakdown */}
          <div className="lg:col-span-3 space-y-5">

            {/* Score card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-card p-7">
              {!hasAnyData ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(168,207,168,0.15)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#1F3A2E] mb-2">No data logged yet</p>
                  <p className="text-xs text-[#5C6B63] max-w-xs mx-auto">
                    Start logging your sleep, water, workouts, steps, and BMI to calculate your Wellness Score.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    {scoreData && <ScoreRing score={scoreData.score} level={scoreData.level} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Score Breakdown</p>
                    <div className="space-y-3">
                      {trackerStatus.map(t => (
                        <div key={t.label}>
                          <div className="flex justify-between text-xs text-[#5C6B63] mb-1">
                            <span className="font-medium">{t.label}</span>
                            <span>{t.logged ? `${t.pts}/${t.max} pts` : "Not logged"}</span>
                          </div>
                          <div className="w-full h-2 bg-[#D6E2D3] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: t.logged ? `${(t.pts / t.max) * 100}%` : "0%" }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: t.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Points */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5C6B63] mb-1">Total Points Earned</p>
                  <p className="text-4xl font-bold text-[#1F3A2E]">
                    {totalPoints}
                    <span className="text-sm font-normal text-[#5C6B63] ml-1">pts</span>
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(168,207,168,0.15)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>

              {/* Level progression */}
              <div className="mt-5 pt-4 border-t border-[#D6E2D3]">
                <p className="text-xs font-semibold text-[#5C6B63] mb-3 uppercase tracking-wide">Level Progression</p>
                <div className="flex items-center gap-2">
                  {["Beginner", "Improving", "Consistent", "Excellent"].map((lvl, i) => {
                    const thresholds = [0, 30, 55, 80];
                    const isActive = scoreData ? scoreData.score >= thresholds[i] : false;
                    const isCurrent = scoreData?.level === lvl;
                    return (
                      <div key={lvl} className="flex-1 text-center">
                        <div className={`h-2 rounded-full mb-1.5 transition-all ${isActive ? "" : "opacity-30"}`}
                          style={{ background: isActive ? "linear-gradient(135deg, #A8CFA8, #5DA9A6)" : "#D6E2D3" }} />
                        <p className={`text-xs font-medium ${isCurrent ? "text-[#1F3A2E]" : "text-[#5C6B63]/60"}`}>{lvl}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Goal + milestones */}
          <div className="lg:col-span-2 space-y-5">

            {/* Active goal */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#1F3A2E]">Active Goal</p>
                <button onClick={() => setShowGoalPicker(v => !v)}
                  className="text-xs text-[#5DA9A6] hover:text-[#1F3A2E] font-medium transition-colors">
                  {selectedGoal ? "Change" : "Set Goal"}
                </button>
              </div>

              {selectedGoal && goalConfig ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${goalConfig.color}20`, border: `1.5px solid ${goalConfig.color}40` }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: goalConfig.color }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F3A2E] text-sm">{selectedGoal}</p>
                    <p className="text-xs text-[#5C6B63]">{goalConfig.desc}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#5C6B63]">No goal set yet. Choose a goal to unlock milestones.</p>
              )}

              {/* Goal picker */}
              <AnimatePresence>
                {showGoalPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-[#D6E2D3] space-y-2 overflow-hidden">
                    {GOALS.map(g => (
                      <button key={g.value} onClick={() => handleGoalSelect(g.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border-2 ${
                          selectedGoal === g.value
                            ? "border-[#A8CFA8] bg-[#A8CFA8]/10"
                            : "border-transparent hover:bg-white/50"
                        }`}>
                        <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: `${g.color}30`, border: `1.5px solid ${g.color}60` }} />
                        <div>
                          <p className="text-sm font-medium text-[#1F3A2E]">{g.value}</p>
                          <p className="text-xs text-[#5C6B63]">{g.desc}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Milestones */}
            {selectedGoal && milestones.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="glass-card p-6">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Milestones</p>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: "rgba(168,207,168,0.2)", border: "1.5px solid #D6E2D3" }}>
                        <span className="text-xs font-bold text-[#5C6B63]">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#1F3A2E] font-medium leading-snug">{m.label}</p>
                        <p className="text-xs text-[#5DA9A6] font-semibold mt-0.5">+{m.pts} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* How to earn points */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-3">How to earn points</p>
              <div className="space-y-2">
                {[
                  { action: "Log a meal",           pts: "+5 pts"  },
                  { action: "Hit sleep goal",        pts: "+20 pts" },
                  { action: "Reach hydration goal",  pts: "+20 pts" },
                  { action: "Complete a workout",    pts: "+20 pts" },
                  { action: "Hit step goal",         pts: "+15 pts" },
                  { action: "BMI in healthy range",  pts: "+10 pts" },
                ].map(e => (
                  <div key={e.action} className="flex items-center justify-between text-xs">
                    <span className="text-[#5C6B63]">{e.action}</span>
                    <span className="font-semibold text-[#5DA9A6]">{e.pts}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WellnessScorePage() {
  return <AuthGuard><WellnessScoreContent /></AuthGuard>;
}
