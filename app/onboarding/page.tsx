"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    language: "",
    goal: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    medical: "",
    activity: "",
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4">Welcome to NutriSphere</h2>
            <p className="text-[#5C6B63] mb-8">Let&apos;s start by getting to know you</p>
            <input
              type="text"
              placeholder="What&apos;s your name?"
              value={formData.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="input-premium text-center text-xl"
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">Where are you located?</h2>
            <input
              type="text"
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => updateForm("location", e.target.value)}
              className="input-premium mt-4"
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">Preferred Language</h2>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {["English", "Spanish", "French", "German", "Hindi", "Japanese"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => updateForm("language", lang)}
                  className={`capsule ${formData.language === lang ? "active" : ""}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">What&apos;s your primary goal?</h2>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {[
                "Weight Loss", "Muscle Gain", "Intermittent Fasting",
                "Better Sleep", "Healthy Lifestyle", "Count Calories"
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => updateForm("goal", goal)}
                  className={`capsule ${formData.goal === goal ? "active" : ""}`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">Select your gender</h2>
            <div className="flex gap-4 mt-4 justify-center">
              {["Male", "Female", "Non-binary", "Prefer not to say"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => updateForm("gender", gender)}
                  className={`capsule ${formData.gender === gender ? "active" : ""}`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">How old are you?</h2>
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => updateForm("age", e.target.value)}
              className="input-premium text-center mt-4"
            />
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">What&apos;s your height?</h2>
            <input
              type="text"
              placeholder="e.g., 175 cm or 5&apos;9&quot;"
              value={formData.height}
              onChange={(e) => updateForm("height", e.target.value)}
              className="input-premium text-center mt-4"
            />
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            key="step8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">What&apos;s your current weight?</h2>
            <input
              type="text"
              placeholder="e.g., 70 kg or 154 lbs"
              value={formData.weight}
              onChange={(e) => updateForm("weight", e.target.value)}
              className="input-premium text-center mt-4"
            />
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            key="step9"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">Any medical conditions?</h2>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {["Diabetes", "Pre-diabetes", "Cholesterol", "Hypertension", "None"].map((medical) => (
                <button
                  key={medical}
                  onClick={() => updateForm("medical", medical)}
                  className={`capsule ${formData.medical === medical ? "active" : ""}`}
                >
                  {medical}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 10:
        return (
          <motion.div
            key="step10"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold text-[#1F3A2E] mb-4 text-center">Activity level</h2>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {[
                "Mostly Sitting", "Often Standing",
                "Regularly Walking", "Physically Intense Work"
              ].map((activity) => (
                <button
                  key={activity}
                  onClick={() => updateForm("activity", activity)}
                  className={`capsule ${formData.activity === activity ? "active" : ""}`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
      </div>

      <div className="glass-card p-12 max-w-2xl w-full relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#5C6B63] mb-2">
            <span>Step {step} of 10</span>
            <span>{Math.round((step / 10) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 10) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#A8CFA8] to-[#5DA9A6]"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 gap-4">
          {step > 1 && (
            <button onClick={prevStep} className="btn-secondary-premium">
              Back
            </button>
          )}
          {step < 10 ? (
            <button onClick={nextStep} className="btn-premium ml-auto">
              Continue
            </button>
          ) : (
            <button onClick={handleComplete} className="btn-premium ml-auto">
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}