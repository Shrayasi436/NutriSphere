"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, Lightbulb, Utensils, TrendingUp, Zap, Star } from "lucide-react";

const insights = [
  {
    icon: Utensils,
    title: "Personalized Nutrition Recommendations",
    desc: "Based on your health profile, we recommend a balanced macro split of 30% protein, 45% carbohydrates, and 25% healthy fats to support your wellness goals.",
    gradient: "linear-gradient(135deg, #A8C3B0, #1F5C4C)",
    tips: ["Increase leafy greens to 3 servings/day", "Add omega-3 rich foods like salmon twice a week", "Reduce processed sugar intake by 20%"],
  },
  {
    icon: Lightbulb,
    title: "Smart Wellness Suggestions",
    desc: "AI analysis of your activity patterns suggests small lifestyle adjustments that can significantly improve your overall wellness score.",
    gradient: "linear-gradient(135deg, #E0C897, #C6A969)",
    tips: ["Take a 10-minute walk after each meal", "Drink 250ml water every 2 hours", "Practice 5 minutes of deep breathing before bed"],
  },
  {
    icon: Star,
    title: "Healthy Meal Alternatives",
    desc: "Smart swaps identified from your meal history that maintain flavor while improving nutritional value.",
    gradient: "linear-gradient(135deg, #D8A7B1, #9B5C6A)",
    tips: ["Swap white rice for cauliflower rice (save 150 kcal)", "Replace soda with sparkling water + lemon", "Use Greek yogurt instead of sour cream"],
  },
  {
    icon: Zap,
    title: "AI-Based Optimization Suggestions",
    desc: "Advanced pattern recognition has identified opportunities to optimize your daily routine for peak performance.",
    gradient: "linear-gradient(135deg, #7C83C3, #3E4A89)",
    tips: ["Eat your largest meal before 2 PM", "Sync workout timing with your energy peaks (10 AM–12 PM)", "Add a protein-rich snack 30 min post-workout"],
  },
];

export default function AIInsightsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F6F1E8', fontFamily: '"Poppins", sans-serif' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'linear-gradient(135deg, #7C83C3 0%, #3E4A89 100%)' }} />
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
            style={{ background: 'linear-gradient(135deg, #7C83C3, #3E4A89)', boxShadow: '0 15px 40px rgba(62,74,137,0.3)' }}>
            <Brain style={{ color: '#F6F1E8', width: 40 }} />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#1F5C4C' }}>AI Insights</h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5C6B63' }}>
            Smart wellness recommendations powered by advanced machine learning — personalized just for you.
          </p>
        </motion.div>

        {/* Insight cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(246,241,232,0.65))', backdropFilter: 'blur(15px)', border: '1px solid #A8C3B0', boxShadow: '0 20px 50px rgba(31,92,76,0.1)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: item.gradient }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: item.gradient, boxShadow: '0 8px 25px rgba(31,92,76,0.2)' }}>
                  <item.icon style={{ color: '#F6F1E8', width: 28 }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1F5C4C' }}>{item.title}</h3>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: '#5C6B63' }}>{item.desc}</p>
                <ul className="space-y-2">
                  {item.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm" style={{ color: '#5C6B63' }}>
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#A8C3B0' }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12 rounded-3xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(124,131,195,0.15), rgba(62,74,137,0.1))', border: '1px solid #7C83C3', backdropFilter: 'blur(20px)' }}>
          <TrendingUp className="mx-auto mb-4" style={{ color: '#7C83C3', width: 40 }} />
          <h3 className="text-2xl font-bold mb-3" style={{ color: '#1F5C4C' }}>Unlock Full AI Analysis</h3>
          <p className="mb-6" style={{ color: '#5C6B63' }}>Complete your health profile to receive fully personalized AI-driven recommendations.</p>
          <motion.button onClick={() => router.push('/health')} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-10 py-3.5 rounded-2xl font-bold"
            style={{ background: 'linear-gradient(135deg, #7C83C3, #3E4A89)', color: '#F6F1E8', boxShadow: '0 10px 30px rgba(62,74,137,0.3)' }}>
            Complete Health Profile
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
