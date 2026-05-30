"use client";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Clock, DollarSign, Target, CheckCircle, Calendar, User } from "lucide-react";

const PLANS: Record<string, {
  title: string;
  desc: string;
  coach: string;
  duration: string;
  price: string;
  image: string;
  gradient: string;
  goals: string[];
  benefits: string[];
  weeklyHighlights: { week: string; focus: string }[];
}> = {
  "weight-loss-journey": {
    title: "Weight Loss Journey",
    desc: "A science-backed, sustainable fat loss program designed to help you shed weight without sacrificing energy or muscle. Built around real food, smart movement, and lasting habits.",
    coach: "Dr. Sarah Mitchell, RD",
    duration: "12 Weeks",
    price: "$49/month",
    image: "https://images.unsplash.com/photo-1662549904992-cc9ac569be45?q=80&w=386&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(135deg, #C97B63, #FF7F50)",
    goals: ["Lose 4–8 kg sustainably", "Build healthy eating habits", "Improve metabolic health", "Increase daily energy levels"],
    benefits: ["Personalized calorie targets", "Weekly meal plans", "Daily check-in prompts", "Progress photo tracking", "Community support group"],
    weeklyHighlights: [
      { week: "Weeks 1–2", focus: "Baseline assessment & habit foundation" },
      { week: "Weeks 3–5", focus: "Calorie deficit introduction & meal prep" },
      { week: "Weeks 6–8", focus: "Cardio integration & macro optimization" },
      { week: "Weeks 9–10", focus: "Plateau-breaking strategies" },
      { week: "Weeks 11–12", focus: "Maintenance transition & long-term planning" },
    ],
  },
  "lean-muscle-program": {
    title: "Lean Muscle Program",
    desc: "A progressive resistance training and nutrition program engineered to build quality, functional muscle mass while keeping body fat in check.",
    coach: "Coach Marcus Reid, CSCS",
    duration: "16 Weeks",
    price: "$59/month",
    image: "https://images.unsplash.com/photo-1733077151330-a6f3a257926b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(135deg, #A8C3B0, #1F5C4C)",
    goals: ["Gain 3–6 kg lean muscle", "Increase strength benchmarks", "Optimize protein synthesis", "Improve body composition"],
    benefits: ["Progressive overload workout plans", "High-protein meal templates", "Recovery & sleep optimization", "Supplement guidance", "1-on-1 form check videos"],
    weeklyHighlights: [
      { week: "Weeks 1–3", focus: "Movement patterns & baseline strength" },
      { week: "Weeks 4–7", focus: "Hypertrophy phase — volume increase" },
      { week: "Weeks 8–11", focus: "Strength phase — intensity increase" },
      { week: "Weeks 12–14", focus: "Deload & muscle consolidation" },
      { week: "Weeks 15–16", focus: "Peak performance & body recomposition" },
    ],
  },
  "yoga-flow": {
    title: "Yoga Flow",
    desc: "A mindful, progressive yoga program that builds flexibility, core strength, and mental clarity through daily guided flows — suitable for all levels.",
    coach: "Priya Sharma, E-RYT 500",
    duration: "8 Weeks",
    price: "$39/month",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(135deg, #D8A7B1, #9B5C6A)",
    goals: ["Improve flexibility by 40%", "Build core strength", "Reduce stress & anxiety", "Establish daily mindfulness practice"],
    benefits: ["Daily 20–45 min guided flows", "Breathwork & meditation sessions", "Pose modification library", "Stress-relief journaling prompts", "Offline video access"],
    weeklyHighlights: [
      { week: "Week 1–2", focus: "Foundation poses & breath awareness" },
      { week: "Week 3–4", focus: "Flow sequences & balance work" },
      { week: "Week 5–6", focus: "Strength-building inversions & twists" },
      { week: "Week 7–8", focus: "Advanced flows & integration practice" },
    ],
  },
  "sustainable-wellness": {
    title: "Sustainable Wellness",
    desc: "A holistic, ongoing lifestyle program that integrates nutrition, movement, sleep, and mindset into a seamless daily routine you can maintain for life.",
    coach: "Dr. Amara Osei, PhD Wellness",
    duration: "Ongoing",
    price: "$29/month",
    image: "https://plus.unsplash.com/premium_photo-1712935717662-3dc032f087dc?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(135deg, #7FB7BE, #2C6E6A)",
    goals: ["Build lifelong healthy habits", "Achieve balanced nutrition", "Optimize sleep quality", "Maintain consistent energy"],
    benefits: ["Monthly wellness check-ins", "Seasonal meal plan updates", "Habit tracker integration", "Mindset coaching modules", "Cancel anytime"],
    weeklyHighlights: [
      { week: "Month 1", focus: "Habit audit & foundation building" },
      { week: "Month 2", focus: "Nutrition & hydration optimization" },
      { week: "Month 3", focus: "Sleep & recovery protocols" },
      { week: "Ongoing", focus: "Continuous refinement & community" },
    ],
  },
  "stress-recovery": {
    title: "Stress Recovery",
    desc: "A therapeutic wellness program combining evidence-based relaxation techniques, gentle movement, and nutritional support to restore mental and physical balance.",
    coach: "Dr. Lena Kovacs, Clinical Psychologist",
    duration: "6 Weeks",
    price: "$45/month",
    image: "https://plus.unsplash.com/premium_photo-1726797750216-75a8487a05c0?q=80&w=817&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(135deg, #7C83C3, #3E4A89)",
    goals: ["Reduce cortisol levels", "Improve sleep quality", "Build emotional resilience", "Restore physical energy"],
    benefits: ["Daily guided meditations", "Stress-relief nutrition plan", "Gentle movement routines", "CBT-based journaling", "24/7 wellness support chat"],
    weeklyHighlights: [
      { week: "Week 1", focus: "Stress assessment & nervous system reset" },
      { week: "Week 2", focus: "Sleep hygiene & relaxation techniques" },
      { week: "Week 3", focus: "Anti-inflammatory nutrition protocol" },
      { week: "Week 4", focus: "Gentle movement & breathwork" },
      { week: "Weeks 5–6", focus: "Resilience building & long-term tools" },
    ],
  },
};

export default function PlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const plan = PLANS[slug];

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F6F1E8' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1F5C4C' }}>Plan not found</h1>
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-2xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)', color: '#F6F1E8' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F6F1E8', fontFamily: '"Poppins", sans-serif' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
          style={{ background: plan.gradient }} />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)' }} />
      </div>

      {/* Header */}
      <motion.header initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: 'rgba(246,241,232,0.88)', borderBottom: '1px solid #A8C3B0', boxShadow: '0 4px 30px rgba(31,92,76,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
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

      {/* Hero image */}
      <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}
        className="relative h-80 md:h-[420px] overflow-hidden">
        <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(31,92,76,0.7) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2">{plan.title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
            className="text-white/80 text-lg">{plan.desc.split('.')[0]}.</motion.p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Quick info bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: User, label: "Coach", value: plan.coach },
            { icon: Clock, label: "Duration", value: plan.duration },
            { icon: DollarSign, label: "Price", value: plan.price },
            { icon: Target, label: "Focus", value: plan.goals[0] },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0' }}>
              <item.icon style={{ color: '#7FB7BE', width: 18, marginBottom: 8 }} />
              <p className="text-xs mb-1" style={{ color: '#5C6B63' }}>{item.label}</p>
              <p className="text-sm font-bold" style={{ color: '#1F5C4C' }}>{item.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Wellness goals */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl p-8"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.08)' }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: '#1F5C4C' }}>Wellness Goals</h2>
            <ul className="space-y-3">
              {plan.goals.map((g, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#5C6B63' }}>
                  <CheckCircle style={{ color: '#A8C3B0', width: 18, flexShrink: 0 }} />
                  {g}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            className="rounded-3xl p-8"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.08)' }}>
            <h2 className="text-xl font-bold mb-5" style={{ color: '#1F5C4C' }}>What's Included</h2>
            <ul className="space-y-3">
              {plan.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#5C6B63' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7FB7BE' }} />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Weekly highlights */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-3xl p-8 mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.08)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Calendar style={{ color: '#1F5C4C', width: 22 }} />
            <h2 className="text-xl font-bold" style={{ color: '#1F5C4C' }}>Weekly Highlights</h2>
          </div>
          <div className="space-y-4">
            {plan.weeklyHighlights.map((wk, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(168,195,176,0.1)', border: '1px solid rgba(168,195,176,0.3)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: plan.gradient }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1F5C4C' }}>{wk.week}</p>
                  <p className="text-sm" style={{ color: '#5C6B63' }}>{wk.focus}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enroll CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-3xl p-10 text-center"
          style={{ background: plan.gradient, boxShadow: '0 25px 60px rgba(31,92,76,0.25)' }}>
          <h3 className="text-3xl font-bold text-white mb-3">Ready to Begin?</h3>
          <p className="text-white/80 mb-2">{plan.duration} · {plan.price}</p>
          <p className="text-white/70 text-sm mb-8">Guided by {plan.coach}</p>
          <motion.button
            onClick={() => router.push('/signup')}
            whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-14 py-4 rounded-2xl font-bold text-lg"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#1F5C4C', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            Join / Enroll Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
