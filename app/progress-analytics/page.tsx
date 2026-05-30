"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TrendingUp, BarChart2, Target, Activity, Award, Calendar } from "lucide-react";

const weeklyData = [
  { day: "Mon", calories: 1850, steps: 7200, sleep: 7.2 },
  { day: "Tue", calories: 2100, steps: 9400, sleep: 6.8 },
  { day: "Wed", calories: 1780, steps: 8100, sleep: 7.5 },
  { day: "Thu", calories: 2050, steps: 10200, sleep: 7.0 },
  { day: "Fri", calories: 1920, steps: 6800, sleep: 8.1 },
  { day: "Sat", calories: 2300, steps: 11500, sleep: 7.8 },
  { day: "Sun", calories: 1650, steps: 5900, sleep: 8.5 },
];

const monthlyTrends = [
  { label: "Avg Daily Calories", value: "1,950", unit: "kcal", change: "-3.2%", positive: true, color: "#C97B63" },
  { label: "Avg Daily Steps", value: "8,443", unit: "steps", change: "+12.1%", positive: true, color: "#A8C3B0" },
  { label: "Avg Sleep", value: "7.4", unit: "hrs", change: "+0.3 hrs", positive: true, color: "#7C83C3" },
  { label: "Workouts Logged", value: "18", unit: "sessions", change: "+6 vs last month", positive: true, color: "#7FB7BE" },
];

const goals = [
  { label: "Weight Goal", progress: 68, target: "Lose 5 kg", color: "#C97B63" },
  { label: "Daily Steps", progress: 84, target: "10,000 steps/day", color: "#A8C3B0" },
  { label: "Water Intake", progress: 72, target: "2.5L per day", color: "#7FB7BE" },
  { label: "Sleep Quality", progress: 90, target: "7–9 hrs/night", color: "#7C83C3" },
];

const maxCal = Math.max(...weeklyData.map(d => d.calories));

export default function ProgressAnalyticsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F6F1E8', fontFamily: '"Poppins", sans-serif' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'linear-gradient(135deg, #7FB7BE 0%, #2C6E6A 100%)' }} />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
          style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)' }} />
      </div>

      {/* Header */}
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: 'rgba(246,241,232,0.88)', borderBottom: '1px solid #A8C3B0', boxShadow: '0 4px 30px rgba(31,92,76,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded-full transition"
            style={{ color: '#1F5C4C', background: 'rgba(255,255,255,0.7)', border: '1px solid #A8C3B0' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)' }}>
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold" style={{ color: '#1F5C4C' }}>Nutri<span style={{ color: '#7FB7BE' }}>Sphere</span></span>
          </div>
          <div className="w-24" />
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 relative z-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{ background: 'linear-gradient(135deg, #7FB7BE, #2C6E6A)', boxShadow: '0 15px 40px rgba(44,110,106,0.3)' }}>
            <TrendingUp style={{ color: '#F6F1E8', width: 40 }} />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#1F5C4C' }}>Progress Analytics</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5C6B63' }}>
            Comprehensive data visualization and trend analysis for your health journey.
          </p>
        </motion.div>

        {/* Monthly trend stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Calendar style={{ color: '#1F5C4C', width: 22 }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>Monthly Health Trends</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {monthlyTrends.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 15px 40px rgba(31,92,76,0.08)' }}>
                <p className="text-sm mb-2" style={{ color: '#5C6B63' }}>{stat.label}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="text-sm" style={{ color: '#5C6B63' }}>{stat.unit}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(168,195,176,0.2)', color: '#1F5C4C' }}>
                  {stat.change}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weekly chart */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-3xl p-8 mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.1)' }}>
          <div className="flex items-center gap-3 mb-8">
            <BarChart2 style={{ color: '#1F5C4C', width: 22 }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>Weekly Progress Charts</h2>
          </div>
          <div className="flex items-end gap-4 h-48">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#5C6B63' }}>{d.calories}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.calories / maxCal) * 160}px` }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-t-xl"
                  style={{ background: i === new Date().getDay() - 1 ? 'linear-gradient(135deg, #A8C3B0, #1F5C4C)' : 'linear-gradient(135deg, rgba(168,195,176,0.4), rgba(127,183,190,0.4))', border: '1px solid #A8C3B0' }}
                />
                <span className="text-xs" style={{ color: '#5C6B63' }}>{d.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: '#5C6B63' }}>Daily calorie intake — this week (kcal)</p>
        </motion.div>

        {/* Goal achievement */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-3xl p-8 mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.1)' }}>
          <div className="flex items-center gap-3 mb-8">
            <Target style={{ color: '#1F5C4C', width: 22 }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>Goal Achievement Tracking</h2>
          </div>
          <div className="space-y-6">
            {goals.map((goal, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: '#1F5C4C' }}>{goal.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#5C6B63' }}>{goal.target}</span>
                    <span className="text-sm font-bold" style={{ color: goal.color }}>{goal.progress}%</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full" style={{ background: 'rgba(168,195,176,0.2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ delay: 0.45 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: goal.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wellness stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <Award style={{ color: '#1F5C4C', width: 22 }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>Wellness Statistics</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { label: "Streak", value: "14 days", sub: "Consecutive logging days", color: "#E0C897" },
              { label: "Best Week", value: "Week 3", sub: "Highest goal completion", color: "#A8C3B0" },
              { label: "Overall Score", value: "82/100", sub: "Wellness index", color: "#7C83C3" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 15px 40px rgba(31,92,76,0.08)' }}>
                <p className="text-sm mb-2" style={{ color: '#5C6B63' }}>{s.label}</p>
                <p className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: '#5C6B63' }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
