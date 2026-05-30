"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/app/components/AuthGuard";
import { getMe, fetchBMR, getMeals, AuthUser, BMRResult } from "@/app/lib/api";
import { removeToken, getUser } from "@/app/lib/auth";
import {
  SleepStorage,
  WorkoutStorage,
  StepsStorage,
  WaterStorage,
  BMIStorage,
} from "@/app/lib/trackerStorage";
import {
  GoalStorage,
  calcWellnessScore,
  scoreToLevel,
} from "@/app/lib/wellnessStorage";
import { generateAIResponse } from "@/app/lib/aiEngine";

// ── Search index ──────────────────────────────────────────────────────────────
const SEARCH_INDEX = [
  { label: "Log a Meal",        href: "/calories",  hint: "Calorie tracker"    },
  { label: "Calorie Tracker",   href: "/calories",  hint: "Daily intake"       },
  { label: "Sleep Tracker",     href: "/sleep",     hint: "Rest & recovery"    },
  { label: "Workout Log",       href: "/workout",   hint: "Exercise sessions"  },
  { label: "Water Intake",      href: "/hydration", hint: "Hydration tracker"  },
  { label: "Step Counter",      href: "/steps",     hint: "Daily steps"        },
  { label: "BMI Calculator",    href: "/bmi",       hint: "Body mass index"    },
  { label: "Health Profile",    href: "/health",    hint: "BMR & goals"        },
  { label: "AI Coach",          href: "/ai-coach",  hint: "Wellness coach"     },
  { label: "Wellness Score",    href: "/wellness-score", hint: "Progress"      },
  { label: "Settings",          href: "/settings",  hint: "Preferences"        },
];

// ── Hamburger sidebar nav links ───────────────────────────────────────────────
const SIDEBAR_NAV = [
  { label: "Home",               href: "/",                     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Dashboard",          href: "/dashboard",            icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { label: "AI Health Profile",  href: "/health",               icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "AI Wellness Coach",  href: "/ai-coach",             icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { label: "Progress Analytics", href: "/progress-analytics",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Wellness Courses",   href: "/wellness-courses",     icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { label: "About / How It Works", href: "/about",             icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Settings",           href: "/settings",             icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

// ── Wellness plans / courses data ─────────────────────────────────────────────
const WELLNESS_PLANS = [
  {
    title: "Weight Loss Journey",
    slug: "weight-loss-journey",
    badge: "Most Popular",
    badgeColor: "linear-gradient(135deg, #C97B63, #E8A87C)",
    desc: "Science-backed 12-week program combining nutrition, cardio, and strength training for sustainable fat loss.",
    duration: "12 Weeks",
    color: "#C97B63",
    bg: "rgba(201,123,99,0.1)",
  },
  {
    title: "Lean Muscle Program",
    slug: "lean-muscle-program",
    badge: "Best Value",
    badgeColor: "linear-gradient(135deg, #A8CFA8, #5DA9A6)",
    desc: "Progressive strength training with nutrition guidance to build lean muscle mass effectively.",
    duration: "12 Weeks",
    color: "#7A9B76",
    bg: "rgba(122,155,118,0.1)",
  },
  {
    title: "Yoga Flow",
    slug: "yoga-flow",
    badge: null,
    badgeColor: "",
    desc: "Improve flexibility, balance, and mindfulness through guided yoga sessions for all levels.",
    duration: "12 Weeks",
    color: "#D8A7B1",
    bg: "rgba(216,167,177,0.1)",
  },
  {
    title: "Sustainable Wellness",
    slug: "sustainable-wellness",
    badge: null,
    badgeColor: "",
    desc: "Build long-term healthy habits across nutrition, sleep, movement, and stress management.",
    duration: "12 Weeks",
    color: "#5DA9A6",
    bg: "rgba(93,169,166,0.1)",
  },
  {
    title: "Stress Recovery",
    slug: "stress-recovery",
    badge: null,
    badgeColor: "",
    desc: "Reduce cortisol, restore balance, and improve mental wellness through recovery techniques.",
    duration: "10 Weeks",
    color: "#7C83C3",
    bg: "rgba(124,131,195,0.1)",
  },
];

// ── Animated wellness graphic ─────────────────────────────────────────────────
function WellnessGraphic({ sleepLabel }: { sleepLabel: string }) {
  return (
    <div className="relative w-56 h-56 flex-shrink-0 select-none" aria-hidden>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: "rgba(168,207,168,0.4)" }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute inset-6 rounded-full border-2 border-dashed" style={{ borderColor: "rgba(93,169,166,0.35)" }} />
      <motion.div animate={{ scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-14 rounded-full"
        style={{ background: "linear-gradient(135deg, #A8CFA8 0%, #5DA9A6 100%)", boxShadow: "0 12px 40px rgba(93,169,166,0.35)" }} />
      <div className="absolute inset-16 rounded-full bg-white/20" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 20 + i * 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0" style={{ transformOrigin: "50% 50%" }}>
          <div className="absolute w-2.5 h-2.5 rounded-full"
            style={{ background: i % 2 === 0 ? "#A8CFA8" : "#5DA9A6", opacity: 0.7, top: "4%", left: "50%",
              transform: `translateX(-50%) rotate(${deg}deg) translateY(0)` }} />
        </motion.div>
      ))}
      {[
        { label: "BMR", value: "Active", top: "8%", left: "-18%", delay: 0 },
        { label: "Sleep", value: sleepLabel, top: "72%", left: "-14%", delay: 0.8 },
        { label: "Calories", value: "On track", top: "40%", left: "88%", delay: 1.6 },
      ].map(pill => (
        <motion.div key={pill.label} animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4 + parseFloat(pill.delay.toString()), repeat: Infinity, ease: "easeInOut", delay: pill.delay }}
          className="absolute px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap"
          style={{ top: pill.top, left: pill.left, background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(168,207,168,0.5)", color: "#1F3A2E", boxShadow: "0 4px 12px rgba(31,58,46,0.08)" }}>
          <span className="text-[#5C6B63] font-normal">{pill.label} </span>{pill.value}
        </motion.div>
      ))}
    </div>
  );
}

// ── Dashboard cards config ────────────────────────────────────────────────────
const CARDS = [
  { title: "Calories", unit: "kcal",    color: "#A8CFA8", bg: "rgba(168,207,168,0.2)", link: "/calories",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /> },
  { title: "Sleep",    unit: "hrs",     color: "#5DA9A6", bg: "rgba(93,169,166,0.2)",  link: "/sleep",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> },
  { title: "Workout",  unit: "min",     color: "#7A9B76", bg: "rgba(122,155,118,0.2)", link: "/workout",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
  { title: "Water",    unit: "glasses", color: "#5DA9A6", bg: "rgba(93,169,166,0.2)",  link: "/hydration",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
  { title: "Steps",    unit: "steps",   color: "#A8CFA8", bg: "rgba(168,207,168,0.2)", link: "/steps",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
  { title: "BMI",      unit: "",        color: "#7A9B76", bg: "rgba(122,155,118,0.2)", link: "/bmi",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
];

// ── Hamburger sidebar ─────────────────────────────────────────────────────────
function DashboardSidebar({ open, onClose, onSignOut }: {
  open: boolean; onClose: () => void; onSignOut: () => void;
}) {
  const router = useRouter();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
          <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col"
            style={{ background: "rgba(247,245,239,0.97)", backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(168,207,168,0.4)", boxShadow: "20px 0 60px rgba(31,58,46,0.12)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D6E2D3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="font-bold text-[#1F3A2E]">Nutri<span className="text-[#5DA9A6]">Sphere</span></span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#D6E2D3]/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5C6B63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {SIDEBAR_NAV.map(item => (
                <button key={item.href} onClick={() => { onClose(); router.push(item.href); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium text-[#1F3A2E] hover:bg-[#A8CFA8]/15 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#5DA9A6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </nav>
            {/* Sign out at bottom */}
            <div className="px-3 py-4 border-t border-[#D6E2D3]">
              <button onClick={() => { onClose(); onSignOut(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const [user, setUser]                   = useState<AuthUser | null>(null);
  const [bmr, setBmr]                     = useState<BMRResult | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [search, setSearch]               = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // Tracker metric state
  const [calories, setCalories]     = useState<number | null>(null);
  const [sleepHrs, setSleepHrs]     = useState<number | null>(null);
  const [workoutMin, setWorkoutMin] = useState<number | null>(null);
  const [water, setWater]           = useState<number | null>(null);
  const [steps, setSteps]           = useState<number | null>(null);
  const [bmi, setBmi]               = useState<number | null>(null);

  // Wellness score state
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [wellnessLevel, setWellnessLevel] = useState<string>("");
  const [activeGoal, setActiveGoal]       = useState<string>("");

  // AI quick-ask state
  const [aiInput, setAiInput]     = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  function handleSignOut() {
    removeToken();
    router.replace("/");
  }

  useEffect(() => {
    const cached = getUser<AuthUser>();
    if (cached) setUser(cached);

    getMe()
      .then(res => {
        setUser(res.user);
        const uid = res.user.id;
        const sleepHours  = SleepStorage.latestHours(uid);
        const workoutData = WorkoutStorage.load(uid);
        const stepsTotal  = StepsStorage.latestSteps(uid);
        const waterTotal  = WaterStorage.totalGlasses(uid);
        const bmiD        = BMIStorage.load(uid);

        if (sleepHours !== null) setSleepHrs(sleepHours);
        if (workoutData && workoutData.sessions.length > 0) setWorkoutMin(workoutData.totalMinutes);
        if (stepsTotal !== null) setSteps(stepsTotal);
        if (waterTotal !== null) setWater(waterTotal);
        if (bmiD) setBmi(bmiD.bmi);

        const snap = {
          calories: null, sleepHrs: sleepHours,
          water: waterTotal,
          workoutMin: (workoutData && workoutData.sessions.length > 0) ? workoutData.totalMinutes : null,
          steps: stepsTotal, bmi: bmiD?.bmi ?? null,
        };
        setWellnessScore(calcWellnessScore(snap));
        setWellnessLevel(scoreToLevel(calcWellnessScore(snap)));

        const goalData = GoalStorage.load(uid);
        if (goalData) setActiveGoal(goalData.goal);
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) { removeToken(); router.replace("/login"); }
      });

    fetchBMR()
      .then(res => { if (res.profileComplete && res.bmr) { setBmr(res.bmr); setProfileComplete(true); } })
      .catch(() => {});

    getMeals()
      .then(res => setCalories(res.totalCalories))
      .catch(() => setCalories(0));
  }, [router]);

  const searchResults = search.trim().length > 0
    ? SEARCH_INDEX.filter(s =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        s.hint.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : [];

  const initials = user
    ? `${(user.firstName || "?")[0]}${(user.lastName || "?")[0]}`.toUpperCase()
    : "…";

  const sleepPillLabel = sleepHrs !== null ? `${sleepHrs.toFixed(1)}h` : "--";

  async function handleAiAsk() {
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResponse("");
    const snap = { calories, sleepHrs, water, workoutMin, steps, bmi };
    await new Promise(r => setTimeout(r, 800));
    setAiResponse(generateAIResponse(aiInput.trim(), snap));
    setAiLoading(false);
  }

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSignOut={handleSignOut} />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-20 w-80 h-80 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-60 right-40 w-80 h-80 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Hamburger + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-[#A8CFA8]/20 transition-colors"
              aria-label="Open navigation menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1F3A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-[#1F3A2E] text-lg hidden sm:block">
                Nutri<span className="text-[#5DA9A6]">Sphere</span>
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-[#D6E2D3] bg-white/60 focus-within:border-[#A8CFA8] focus-within:bg-white/90 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#A8CFA8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search features…"
                value={search} onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                className="bg-transparent outline-none text-sm text-[#1F3A2E] placeholder-[#5C6B63]/60 w-full" />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#5C6B63] hover:text-[#1F3A2E] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-full mt-1 w-full rounded-2xl overflow-hidden shadow-xl border border-[#D6E2D3] z-50"
                  style={{ background: "rgba(255,255,255,0.97)" }}>
                  {searchResults.map(r => (
                    <li key={r.href + r.label}>
                      <button onMouseDown={() => { router.push(r.href); setSearch(""); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#A8CFA8]/10 transition-colors text-left">
                        <span className="text-sm font-medium text-[#1F3A2E]">{r.label}</span>
                        <span className="text-xs text-[#5C6B63]">{r.hint}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* User + Sign out */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <span className="hidden md:block text-sm font-medium text-[#1F3A2E]">
                {user ? `${user.firstName} ${user.lastName}` : "…"}
              </span>
            </div>
            <button onClick={handleSignOut}
              className="text-sm px-4 py-2 rounded-xl border-2 border-[#A8CFA8]/40 text-[#5C6B63] hover:border-[#A8CFA8] hover:text-[#1F3A2E] transition-all">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 relative z-10">

        {/* Hero welcome card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="glass-card mb-8 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(168,207,168,0.12) 100%)" }}>
          <motion.div animate={{ x: ["0%", "100%", "0%"] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(168,207,168,0.08) 50%, transparent 100%)" }} />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8 p-8 sm:p-10">
            <div className="flex-1 min-w-0">
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-sm font-semibold text-[#5DA9A6] mb-2 tracking-wide uppercase">
                Your Wellness Dashboard
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="text-3xl sm:text-4xl font-bold text-[#1F3A2E] mb-3 leading-tight">
                Welcome back{user ? `, ${user.firstName}` : ""}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="text-[#5C6B63] mb-6 max-w-sm leading-relaxed">
                Every healthy choice compounds. Track your meals, rest, and movement to stay on course.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-3">
                <Link href="/calories"><button className="btn-premium px-7 py-3 text-sm">Start Tracking</button></Link>
                <Link href="/health">
                  <button className="btn-secondary-premium px-6 py-3 text-sm">
                    {profileComplete ? "View Health Profile" : "Set Up Profile"}
                  </button>
                </Link>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }} className="hidden sm:flex flex-shrink-0">
              <WellnessGraphic sleepLabel={sleepPillLabel} />
            </motion.div>
          </div>
        </motion.div>

        {/* BMR strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6">
              {[
                { label: "BMR",          value: profileComplete && bmr ? bmr.bmr.toLocaleString() : "--",                unit: "kcal", color: "#1F3A2E" },
                { label: "Daily Target", value: profileComplete && bmr ? bmr.dailyCalorieTarget.toLocaleString() : "--", unit: "kcal", color: "#5DA9A6" },
                { label: "Goal",         value: profileComplete && bmr ? bmr.goalLabel : "--",                           unit: "",     color: "#7A9B76" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xs font-medium text-[#5C6B63] mb-0.5">{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>
                    {s.value}{s.unit && <span className="text-sm font-normal text-[#5C6B63] ml-1">{s.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/health">
              <button className="btn-secondary-premium text-sm px-5 py-2.5 whitespace-nowrap">
                {profileComplete ? "Update Profile" : "Set Up Health Profile"}
              </button>
            </Link>
          </div>
          {!profileComplete && (
            <p className="text-xs text-[#5C6B63] mt-3">Complete your health profile to see your BMR and daily calorie targets.</p>
          )}
        </motion.div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {CARDS.map((card, i) => {
            let value: number | null = null;
            if (card.title === "Calories") value = calories;
            else if (card.title === "Sleep")   value = sleepHrs;
            else if (card.title === "Workout") value = workoutMin;
            else if (card.title === "Water")   value = water;
            else if (card.title === "Steps")   value = steps;
            else if (card.title === "BMI")     value = bmi;

            return (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card p-6 cursor-pointer"
                style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.72), ${card.bg})` }}
                onClick={() => router.push(card.link)}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: card.color }}>
                      {card.icon}
                    </svg>
                  </div>
                  {/* Visible arrow — uses card color instead of gray-300 */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: card.color }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-[#5C6B63] mb-1">{card.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#1F3A2E]">
                      {card.title === "BMI" && value !== null
                        ? value.toFixed(1)
                        : (value ?? 0).toLocaleString()}
                    </span>
                    {card.unit && <span className="text-sm text-[#5C6B63]">{card.unit}</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <h2 className="text-lg font-bold text-[#1F3A2E] mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Log Meal",       href: "/calories",  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> },
              { label: "Log Sleep",      href: "/sleep",     icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /> },
              { label: "Log Workout",    href: "/workout",   icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
              { label: "Track Water",    href: "/hydration", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
              { label: "Health Profile", href: "/health",    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
              { label: "AI Coach",       href: "/ai-coach",  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
            ].map(a => (
              <Link key={a.href + a.label} href={a.href}>
                <button className="capsule flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{a.icon}</svg>
                  {a.label}
                </button>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Wellness Score + AI Coach row */}
        <div className="grid lg:grid-cols-2 gap-5 mt-8">
          {/* Wellness Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
            className="glass-card p-6 cursor-pointer"
            onClick={() => router.push("/wellness-score")}
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(168,207,168,0.12))" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-[#1F3A2E]">Wellness Score</p>
                <p className="text-xs text-[#5C6B63] mt-0.5">{activeGoal ? `Goal: ${activeGoal}` : "Set a goal to get started"}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,207,168,0.2)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            {wellnessScore !== null ? (
              <>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-[#1F3A2E]">{wellnessScore}</span>
                  <span className="text-sm text-[#5C6B63]">/ 100</span>
                  <span className="ml-1 text-sm font-semibold text-[#5DA9A6]">{wellnessLevel}</span>
                </div>
                <div className="w-full h-2 bg-[#D6E2D3] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${wellnessScore}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                    className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #A8CFA8, #5DA9A6)" }} />
                </div>
                <p className="text-xs text-[#5C6B63] mt-2">Based on today&apos;s logged data · Tap to view details</p>
              </>
            ) : (
              <p className="text-sm text-[#5C6B63]">Log your trackers to calculate your score.</p>
            )}
          </motion.div>

          {/* AI Wellness Coach widget — no trial badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68 }}
            className="glass-card p-6"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(93,169,166,0.08))" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-[#1F3A2E]">AI Wellness Coach</p>
                <p className="text-xs text-[#5C6B63] mt-0.5">Ask a quick question</p>
              </div>
              <button onClick={() => router.push("/ai-coach")}
                className="text-xs text-[#5DA9A6] hover:text-[#1F3A2E] font-medium transition-colors">
                Open →
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAiAsk(); }}
                placeholder="Ask about nutrition, sleep, workouts…"
                className="flex-1 text-sm bg-white/60 border border-[#D6E2D3] rounded-xl px-3 py-2 outline-none focus:border-[#A8CFA8] transition-colors text-[#1F3A2E] placeholder-[#5C6B63]/60" />
              <button onClick={handleAiAsk} disabled={aiLoading || !aiInput.trim()}
                className="btn-premium px-3 py-2 text-sm flex-shrink-0 disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed">
                {aiLoading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                  : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>}
              </button>
            </div>
            <AnimatePresence>
              {aiResponse && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-xl p-3 text-xs text-[#1F3A2E] leading-relaxed max-h-28 overflow-y-auto"
                  style={{ background: "rgba(168,207,168,0.1)", border: "1px solid rgba(168,207,168,0.3)" }}>
                  {aiResponse.split("\n").slice(0, 4).join("\n")}
                  {aiResponse.split("\n").length > 4 && (
                    <button onClick={() => router.push("/ai-coach")}
                      className="block mt-1 text-[#5DA9A6] font-semibold hover:underline">
                      See full response →
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* System Status card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}
          className="glass-card p-6 mt-5"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(224,200,151,0.1))" }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(224,200,151,0.25)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C6A969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-[#1F3A2E]">System Status</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)" }}>
                  Basic AI Model
                </span>
              </div>
              <p className="text-xs text-[#5C6B63] leading-relaxed">
                NutriSphere is currently in its basic MVP stage. The AI Wellness Coach uses a rule-based model for guidance.
                Advanced features — including a premium AI model, two-factor authentication, payment processing, and voice assistant programs — are planned for future updates.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Courses / Wellness Plans section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.78 }}
          className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#1F3A2E]">Wellness Courses</h2>
              <p className="text-xs text-[#5C6B63] mt-0.5">Exclusive programs and plans for your transformation</p>
            </div>
            <button onClick={() => router.push("/wellness-courses")}
              className="text-xs text-[#5DA9A6] hover:text-[#1F3A2E] font-semibold transition-colors">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WELLNESS_PLANS.map((plan, i) => (
              <motion.div key={plan.slug}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.06 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="glass-card p-5 cursor-pointer"
                style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.75), ${plan.bg})` }}
                onClick={() => router.push(`/plans/${plan.slug}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: plan.bg, border: `1.5px solid ${plan.color}30` }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: plan.color }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  {plan.badge && (
                    <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
                      style={{ background: plan.badgeColor }}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#1F3A2E] mb-1">{plan.title}</h3>
                <p className="text-xs text-[#5C6B63] leading-relaxed mb-3">{plan.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: plan.color }}>{plan.duration}</span>
                  <span className="text-xs text-[#5DA9A6] font-medium">View Plan →</span>
                </div>
              </motion.div>
            ))}

            {/* Voice Assistant — coming soon */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + WELLNESS_PLANS.length * 0.06 }}
              className="glass-card p-5"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(124,131,195,0.08))" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,131,195,0.15)", border: "1.5px solid rgba(124,131,195,0.3)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7C83C3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #7C83C3, #3E4A89)" }}>
                  Coming Soon
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1F3A2E] mb-1">Voice Assistant Program</h3>
              <p className="text-xs text-[#5C6B63] leading-relaxed mb-3">
                Hands-free wellness coaching with voice-guided workouts, meal logging, and real-time health feedback.
              </p>
              <span className="text-xs text-[#7C83C3] font-medium">Available in future update</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function Dashboard() {
  return <AuthGuard><DashboardContent /></AuthGuard>;
}
