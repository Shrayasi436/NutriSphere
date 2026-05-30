"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen mesh-gradient pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-8 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(168,207,168,0.2)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1F3A2E]">About Us</h1>
              <p className="text-[#5C6B63]">Learn about NutriSphere</p>
            </div>
          </div>

          <p className="text-[#5C6B63] leading-relaxed mb-6">
            NutriSphere is a premium nutrition and wellness platform designed to help you 
            achieve your health goals through personalized meal plans, smart tracking, 
            and AI-powered insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[
              { title: "Personalized", desc: "Tailored to your goals" },
              { title: "AI-Powered", desc: "Smart health insights" },
              { title: "Secure", desc: "Enterprise-grade privacy" },
              { title: "Premium", desc: "Luxurious wellness experience" },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-6"
              >
                <h3 className="font-semibold text-[#1F3A2E] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#5C6B63]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}