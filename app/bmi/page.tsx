"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { BMIStorage } from "@/app/lib/trackerStorage";
import { AuthUser } from "@/app/lib/api";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  advice: string;
}

function calcBMI(weight: number, height: number): BMIResult {
  const h = height / 100;
  const bmi = weight / (h * h);
  const b = parseFloat(bmi.toFixed(1));
  if (b < 18.5) return { bmi: b, category: "Underweight", color: "#7FB7BE", advice: "Consider increasing calorie intake with nutrient-dense foods." };
  if (b < 25)   return { bmi: b, category: "Normal weight", color: "#7A9B76", advice: "Great work. Maintain your current healthy habits." };
  if (b < 30)   return { bmi: b, category: "Overweight", color: "#E0C897", advice: "A moderate calorie deficit and regular exercise can help." };
  return         { bmi: b, category: "Obese", color: "#C97B63", advice: "Consult a healthcare professional for a personalised plan." };
}

function BMIContent() {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState("");

  function handleCalc() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setError("Please enter valid weight (kg) and height (cm)."); return;
    }
    setError("");
    const bmiResult = calcBMI(w, h);
    setResult(bmiResult);

    // Persist to shared storage so dashboard can read it
    const user = getUser<AuthUser>();
    if (user) {
      BMIStorage.save(user.id, { bmi: bmiResult.bmi, category: bmiResult.category });
    }
  }

  // Needle position: BMI 10–40 mapped to 0–180 degrees
  const needleDeg = result ? Math.min(Math.max((result.bmi - 10) / 30 * 180, 0), 180) : 0;

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
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">BMI Calculator</h1>
          <p className="text-[#5C6B63]">Body Mass Index — weight relative to height</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card p-7">
            <h2 className="text-base font-bold text-[#1F3A2E] mb-5">Your Measurements</h2>
            {error && <p className="mb-4 text-sm text-red-500 px-3 py-2 bg-red-50 rounded-xl border border-red-200">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Weight (kg)</label>
                <input type="number" min="1" placeholder="e.g. 70"
                  value={weight} onChange={e => setWeight(e.target.value)} className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Height (cm)</label>
                <input type="number" min="1" placeholder="e.g. 175"
                  value={height} onChange={e => setHeight(e.target.value)} className="input-premium" />
              </div>
              <button onClick={handleCalc} className="btn-premium w-full">Calculate BMI</button>
            </div>

            {/* Scale reference */}
            <div className="mt-6 pt-5 border-t border-[#D6E2D3] space-y-1.5">
              {[
                { range: "Below 18.5", label: "Underweight", color: "#7FB7BE" },
                { range: "18.5 – 24.9", label: "Normal",      color: "#7A9B76" },
                { range: "25.0 – 29.9", label: "Overweight",  color: "#E0C897" },
                { range: "30.0 and above", label: "Obese",    color: "#C97B63" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-[#5C6B63]">{s.label}</span>
                  </div>
                  <span className="text-[#1F3A2E] font-medium">{s.range}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Result */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-7 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="w-full">
                  {/* Gauge */}
                  <div className="flex justify-center mb-4">
                    <svg width="160" height="90" viewBox="0 0 160 90">
                      {/* Arc segments */}
                      {[
                        { color: "#7FB7BE", d: "M 10 80 A 70 70 0 0 1 47 22" },
                        { color: "#7A9B76", d: "M 47 22 A 70 70 0 0 1 113 22" },
                        { color: "#E0C897", d: "M 113 22 A 70 70 0 0 1 150 80" },
                      ].map((seg, i) => (
                        <path key={i} d={seg.d} fill="none" stroke={seg.color} strokeWidth="12" strokeLinecap="round" />
                      ))}
                      {/* Needle */}
                      <motion.line
                        x1="80" y1="80" x2="80" y2="20"
                        stroke="#1F3A2E" strokeWidth="3" strokeLinecap="round"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: needleDeg - 90 }}
                        style={{ originX: "80px", originY: "80px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      <circle cx="80" cy="80" r="5" fill="#1F3A2E" />
                    </svg>
                  </div>

                  <p className="text-5xl font-bold mb-1" style={{ color: result.color }}>{result.bmi}</p>
                  <p className="text-lg font-semibold text-[#1F3A2E] mb-3">{result.category}</p>
                  <p className="text-sm text-[#5C6B63] leading-relaxed">{result.advice}</p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(122,155,118,0.15)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7A9B76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#1F3A2E] mb-1">No result yet</p>
                  <p className="text-xs text-[#5C6B63]">Enter your weight and height to calculate your BMI.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-6 glass-card p-5">
          <p className="text-xs text-[#5C6B63] leading-relaxed">
            <span className="font-semibold text-[#1F3A2E]">About BMI — </span>
            BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass,
            bone density, or fat distribution. For a complete health assessment, consult a healthcare professional.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function BMIPage() {
  return <AuthGuard><BMIContent /></AuthGuard>;
}
