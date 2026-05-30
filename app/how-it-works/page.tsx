"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    { num: 1, title: "Sign Up", desc: "Create your account and profile" },
    { num: 2, title: "Set Goals", desc: "Choose your wellness objectives" },
    { num: 3, title: "Log Meals", desc: "Track your nutrition daily" },
    { num: 4, title: "Get Insights", desc: "Receive AI-powered recommendations" },
    { num: 5, title: "Track Progress", desc: "Monitor your health journey" },
    { num: 6, title: "Achieve Goals", desc: "Reach your wellness targets" },
  ];

  return (
    <div className="min-h-screen mesh-gradient pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-8 mb-6"
        >
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-2">How It Works</h1>
          <p className="text-[#5C6B63] mb-8">Start your wellness journey in 6 simple steps</p>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 8 }}
                className="glass-card p-6 flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center text-white font-bold">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F3A2E]">{step.title}</h3>
                  <p className="text-sm text-[#5C6B63]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}