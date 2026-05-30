"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";

// ── Course catalogue ──────────────────────────────────────────────────────────
const COURSES = [
  {
    title: "Weight Loss Journey",
    slug: "weight-loss-journey",
    badge: "Most Popular",
    badgeGradient: "linear-gradient(135deg, #C97B63, #FF7F50)",
    category: "Fat Loss",
    coach: "Dr. Sarah Mitchell, RD",
    duration: "12 Weeks",
    price: "$49/month",
    image: "https://images.unsplash.com/photo-1662549904992-cc9ac569be45?q=80&w=800&auto=format&fit=crop",
    cardGradient: "linear-gradient(135deg, #C97B63, #FF7F50)",
    accentColor: "#C97B63",
    accentBg: "rgba(201,123,99,0.12)",
    desc: "Science-backed 12-week program combining nutrition, cardio, and strength training for sustainable fat loss without sacrificing energy or muscle.",
    highlights: ["Personalised calorie targets", "Weekly meal plans", "Daily check-in prompts", "Progress tracking"],
  },
  {
    title: "Lean Muscle Program",
    slug: "lean-muscle-program",
    badge: "Best Value",
    badgeGradient: "linear-gradient(135deg, #A8CFA8, #5DA9A6)",
    category: "Strength",
    coach: "Coach Marcus Reid, CSCS",
    duration: "16 Weeks",
    price: "$59/month",
    image: "https://images.unsplash.com/photo-1733077151330-a6f3a257926b?q=80&w=800&auto=format&fit=crop",
    cardGradient: "linear-gradient(135deg, #A8C3B0, #1F5C4C)",
    accentColor: "#7A9B76",
    accentBg: "rgba(122,155,118,0.12)",
    desc: "Progressive resistance training and nutrition program engineered to build quality, functional muscle mass while keeping body fat in check.",
    highlights: ["Progressive overload plans", "High-protein meal templates", "Recovery optimisation", "Form check videos"],
  },
  {
    title: "Yoga Flow",
    slug: "yoga-flow",
    badge: null,
    badgeGradient: "",
    category: "Flexibility",
    coach: "Priya Sharma, E-RYT 500",
    duration: "8 Weeks",
    price: "$39/month",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    cardGradient: "linear-gradient(135deg, #D8A7B1, #9B5C6A)",
    accentColor: "#D8A7B1",
    accentBg: "rgba(216,167,177,0.12)",
    desc: "Mindful, progressive yoga program that builds flexibility, core strength, and mental clarity through daily guided flows — suitable for all levels.",
    highlights: ["Daily 20–45 min guided flows", "Breathwork & meditation", "Pose modification library", "Stress-relief journaling"],
  },
  {
    title: "Sustainable Wellness",
    slug: "sustainable-wellness",
    badge: null,
    badgeGradient: "",
    category: "Lifestyle",
    coach: "Dr. Amara Osei, PhD Wellness",
    duration: "Ongoing",
    price: "$29/month",
    image: "https://plus.unsplash.com/premium_photo-1712935717662-3dc032f087dc?q=80&w=800&auto=format&fit=crop",
    cardGradient: "linear-gradient(135deg, #7FB7BE, #2C6E6A)",
    accentColor: "#5DA9A6",
    accentBg: "rgba(93,169,166,0.12)",
    desc: "Holistic lifestyle program integrating nutrition, movement, sleep, and mindset into a seamless daily routine you can maintain for life.",
    highlights: ["Monthly wellness check-ins", "Seasonal meal plan updates", "Habit tracker integration", "Mindset coaching modules"],
  },
  {
    title: "Stress Recovery",
    slug: "stress-recovery",
    badge: null,
    badgeGradient: "",
    category: "Mental Wellness",
    coach: "Dr. Lena Kovacs, Clinical Psychologist",
    duration: "6 Weeks",
    price: "$45/month",
    image: "https://plus.unsplash.com/premium_photo-1726797750216-75a8487a05c0?q=80&w=800&auto=format&fit=crop",
    cardGradient: "linear-gradient(135deg, #7C83C3, #3E4A89)",
    accentColor: "#7C83C3",
    accentBg: "rgba(124,131,195,0.12)",
    desc: "Therapeutic wellness program combining evidence-based relaxation techniques, gentle movement, and nutritional support to restore mental and physical balance.",
    highlights: ["Daily guided meditations", "Stress-relief nutrition plan", "Gentle movement routines", "CBT-based journaling"],
  },
];

const CATEGORIES = ["All", "Fat Loss", "Strength", "Flexibility", "Lifestyle", "Mental Wellness"];

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: typeof COURSES[0]; index: number }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.015 }}
      onClick={() => router.push(`/plans/${course.slug}`)}
      className="rounded-3xl cursor-pointer overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(246,241,232,0.8) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(168,195,176,0.45)",
        boxShadow: "0 20px 50px rgba(31,92,76,0.1)",
      }}
    >
      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        {!imgError ? (
          <motion.img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback gradient when image fails to load */
          <div className="w-full h-full" style={{ background: course.cardGradient }} />
        )}

        {/* Dark overlay at bottom of image */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(31,58,46,0.55) 100%)" }} />

        {/* Price badge — top right */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "rgba(31,58,46,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          {course.price}
        </div>

        {/* Optional popularity badge — top left */}
        {course.badge && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: course.badgeGradient, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            {course.badge}
          </div>
        )}

        {/* Category pill — bottom left, overlapping image/body boundary */}
        <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: course.accentBg, border: `1px solid ${course.accentColor}50`,
            color: course.accentColor, backdropFilter: "blur(8px)" }}>
          {course.category}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Title + coach */}
        <div className="mb-3">
          <h3 className="text-lg font-bold leading-snug mb-1" style={{ color: "#1F5C4C" }}>{course.title}</h3>
          <p className="text-xs font-medium" style={{ color: course.accentColor }}>{course.coach}</p>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#5C6B63" }}>{course.desc}</p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5">
          {course.highlights.map(h => (
            <li key={h} className="flex items-center gap-2 text-xs" style={{ color: "#5C6B63" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: course.accentColor }} />
              {h}
            </li>
          ))}
        </ul>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid rgba(168,195,176,0.3)" }}>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" style={{ color: "#7FB7BE" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: "#1F5C4C" }}>{course.duration}</span>
          </div>

          <motion.button
            onClick={e => { e.stopPropagation(); router.push(`/plans/${course.slug}`); }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 25px rgba(31,92,76,0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-full text-xs font-bold text-white"
            style={{ background: course.cardGradient, boxShadow: "0 4px 15px rgba(31,92,76,0.18)" }}>
            View Plan
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Voice assistant coming-soon card ─────────────────────────────────────────
function VoiceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + COURSES.length * 0.08, duration: 0.5 }}
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(246,241,232,0.8) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(124,131,195,0.4)",
        boxShadow: "0 20px 50px rgba(62,74,137,0.1)",
      }}
    >
      {/* Placeholder image area */}
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(124,131,195,0.25) 0%, rgba(62,74,137,0.35) 100%)" }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C83C3, #3E4A89)", boxShadow: "0 12px 40px rgba(62,74,137,0.4)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </motion.div>
        {/* Coming soon badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7C83C3, #3E4A89)", boxShadow: "0 4px 12px rgba(62,74,137,0.3)" }}>
          Coming Soon
        </div>
        <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(124,131,195,0.2)", border: "1px solid rgba(124,131,195,0.4)",
            color: "#7C83C3", backdropFilter: "blur(8px)" }}>
          Voice AI
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold leading-snug mb-1" style={{ color: "#1F5C4C" }}>Voice Assistant Program</h3>
          <p className="text-xs font-medium" style={{ color: "#7C83C3" }}>NutriSphere AI Team</p>
        </div>
        <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "#5C6B63" }}>
          Hands-free wellness coaching with voice-guided workouts, meal logging, and real-time health feedback — all powered by advanced AI.
        </p>
        <ul className="space-y-1.5 mb-5">
          {["Voice-guided workout sessions", "Hands-free meal logging", "Real-time health feedback", "Advanced AI model integration"].map(h => (
            <li key={h} className="flex items-center gap-2 text-xs" style={{ color: "#5C6B63" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#7C83C3" }} />
              {h}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid rgba(124,131,195,0.25)" }}>
          <span className="text-xs font-semibold" style={{ color: "#7C83C3" }}>Future Update</span>
          <span className="px-5 py-2 rounded-full text-xs font-bold text-white/80 cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, rgba(124,131,195,0.5), rgba(62,74,137,0.5))" }}>
            Coming Soon
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function WellnessCoursesContent() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? COURSES
    : COURSES.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#F6F1E8", fontFamily: '"Poppins", sans-serif' }}>
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{ background: "linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)" }} />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25"
          style={{ background: "linear-gradient(135deg, #7FB7BE 0%, #2C6E6A 100%)" }} />
      </div>

      {/* Header */}
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: "rgba(246,241,232,0.9)", borderBottom: "1px solid rgba(168,195,176,0.5)",
          boxShadow: "0 4px 30px rgba(31,92,76,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{ color: "#1F5C4C", background: "rgba(255,255,255,0.75)", border: "1px solid #A8C3B0" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #A8C3B0, #1F5C4C)" }}>
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "#1F5C4C" }}>
              Nutri<span style={{ color: "#7FB7BE" }}>Sphere</span>
            </span>
          </div>

          <div className="w-28" />
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10">

        {/* Page hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center mb-12">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7FB7BE" }}>
            Exclusive Programs
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 leading-tight" style={{ color: "#1F5C4C" }}>
            Wellness Courses
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#5C6B63" }}>
            Premium programs designed by certified coaches to transform your health — from fat loss and muscle building to stress recovery and mindful living.
          </motion.p>
        </motion.div>

        {/* Category filter pills */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-2.5 mb-12">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg, #A8C3B0, #1F5C4C)", color: "#F6F1E8",
                      boxShadow: "0 6px 20px rgba(31,92,76,0.25)" }
                  : { background: "rgba(255,255,255,0.75)", color: "#1F5C4C",
                      border: "1px solid rgba(168,195,176,0.5)" }
              }>
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Course grid */}
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((course, i) => (
              <CourseCard key={course.slug} course={course} index={i} />
            ))}
            {/* Show voice card only in "All" view */}
            {activeCategory === "All" && <VoiceCard />}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-lg font-semibold" style={{ color: "#1F5C4C" }}>No courses in this category yet.</p>
            <p className="text-sm mt-2" style={{ color: "#5C6B63" }}>More programs are coming soon.</p>
          </motion.div>
        )}

        {/* Bottom CTA strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-16 rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)",
            boxShadow: "0 25px 60px rgba(31,92,76,0.25)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div animate={{ x: ["0%", "100%", "0%"] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)" }} />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Not sure where to start?</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Let the AI Wellness Coach analyse your health data and recommend the best program for your goals.
            </p>
            <motion.button
              onClick={() => router.push("/ai-coach")}
              whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-12 py-4 rounded-2xl font-bold text-lg"
              style={{ background: "rgba(255,255,255,0.95)", color: "#1F5C4C",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              Ask the AI Coach
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function WellnessCoursesPage() {
  return <AuthGuard><WellnessCoursesContent /></AuthGuard>;
}
