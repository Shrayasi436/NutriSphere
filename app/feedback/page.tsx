"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen mesh-gradient pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(168,207,168,0.2)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1F3A2E]">Feedback</h1>
              <p className="text-[#5C6B63]">Help us improve NutriSphere</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-[#1F3A2E] mb-3">
              Rate NutriSphere
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-all hover:scale-110"
                >
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-8 w-8 ${star <= rating ? "fill-[#A8CFA8] text-[#A8CFA8]" : "fill-none text-gray-300"}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-[#5C6B63] mt-2">
                You rated {rating} {rating === 1 ? "star" : "stars"}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-[#1F3A2E] mb-3">
              Your Feedback
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your experience, suggest features, or report issues..."
              rows={6}
              className="input-premium resize-none"
            />
          </div>

          <div className="mb-6 p-4 glass rounded-xl">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[#5C6B63]">
                Your feedback helps us build a better wellness experience for everyone.
              </p>
            </div>
          </div>

          <button
            onClick={() => alert("Thank you for your feedback!")}
            className="btn-premium w-full flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Feedback
          </button>
        </motion.div>
      </div>
    </div>
  );
}