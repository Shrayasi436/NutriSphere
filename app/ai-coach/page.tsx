"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { getUser } from "@/app/lib/auth";
import { AuthUser } from "@/app/lib/api";
import {
  ChatStorage,
  TrialStorage,
  type ChatMessage,
  type TrackerSnapshot,
} from "@/app/lib/wellnessStorage";
import {
  SleepStorage,
  WorkoutStorage,
  StepsStorage,
  WaterStorage,
  BMIStorage,
} from "@/app/lib/trackerStorage";
import { generateAIResponse } from "@/app/lib/aiEngine";

// ── Paywall screen ────────────────────────────────────────────────────────────
function PaywallScreen({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 text-center max-w-md mx-auto mt-12"
    >
      <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1F3A2E] mb-2">Your Free Trial Has Ended</h2>
      <p className="text-[#5C6B63] mb-6 leading-relaxed">
        Your 7-day free trial of the AI Wellness Coach has expired. Subscribe to continue receiving
        personalised nutrition insights, smart wellness guidance, and AI-powered recommendations.
      </p>

      <div className="glass-card p-5 mb-6 text-left" style={{ background: "rgba(168,207,168,0.08)" }}>
        <p className="text-sm font-semibold text-[#1F3A2E] mb-3">Premium includes:</p>
        <ul className="space-y-2">
          {[
            "Unlimited AI wellness conversations",
            "Personalised nutrition recommendations",
            "Smart workout & recovery guidance",
            "Sleep improvement strategies",
            "Data-aware insights from your trackers",
          ].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-[#5C6B63]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A8CFA8] flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-[#1F3A2E]">$9.99<span className="text-sm font-normal text-[#5C6B63]">/month</span></p>
        <p className="text-xs text-[#5C6B63] mt-1">Cancel anytime</p>
      </div>

      <button
        onClick={onSubscribe}
        className="btn-premium w-full py-3 text-sm font-semibold"
      >
        Subscribe Now
      </button>
      <p className="text-xs text-[#5C6B63] mt-3">Secure payment · Instant access</p>
    </motion.div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  // Render markdown-lite: **bold**, bullet points
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      // Bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
      );
      return <p key={i} className={line.startsWith("•") ? "ml-2" : ""}>{rendered}</p>;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-1 ${
          isUser
            ? "text-white rounded-br-sm"
            : "text-[#1F3A2E] rounded-bl-sm"
        }`}
        style={
          isUser
            ? { background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)" }
            : { background: "rgba(255,255,255,0.75)", border: "1px solid rgba(168,207,168,0.3)" }
        }
      >
        {renderContent(msg.content)}
        <p className={`text-xs mt-1 ${isUser ? "text-white/60" : "text-[#5C6B63]/60"}`}>
          {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #A8CFA8, #5DA9A6)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(168,207,168,0.3)" }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
            className="w-2 h-2 rounded-full bg-[#A8CFA8]"
          />
        ))}
      </div>
    </div>
  );
}

// ── Suggested prompts — categorised and mapped to strict intent ───────────────
const SUGGESTED_PROMPT_GROUPS = [
  {
    category: "Nutrition",
    prompts: [
      "What should I eat for fat loss?",
      "Give me a daily meal plan",
      "How much protein do I need?",
    ],
  },
  {
    category: "Sleep",
    prompts: [
      "How can I improve my sleep quality?",
      "I have trouble sleeping at night",
      "What is the ideal amount of sleep?",
    ],
  },
  {
    category: "Fatigue & Recovery",
    prompts: [
      "I feel tired after workouts",
      "How do I recover faster after exercise?",
      "Why do I have low energy during the day?",
    ],
  },
  {
    category: "Workouts",
    prompts: [
      "I want to build muscle",
      "Create a fat loss workout plan",
      "How many days a week should I train?",
    ],
  },
  {
    category: "Hydration & Steps",
    prompts: [
      "How much water should I drink daily?",
      "How do I reach 10,000 steps a day?",
    ],
  },
  {
    category: "Goals & Summary",
    prompts: [
      "Give me my wellness summary for today",
      "How do I set a wellness goal?",
      "I want to lose weight",
    ],
  },
];

// ── Main content ──────────────────────────────────────────────────────────────
function AICoachContent() {
  const router = useRouter();
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  // Load user + trial state + chat history
  useEffect(() => {
    const u = getUser<AuthUser>();
    if (!u) return;
    setUser(u);

    // Start trial on first visit (kept for storage compatibility)
    TrialStorage.start(u.id);

    // Restore subscription state (kept for storage compatibility)

    // Load chat history
    const history = ChatStorage.load(u.id);
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message
      const welcome: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hello${u.firstName ? `, ${u.firstName}` : ""}! I'm your AI Wellness Coach.\n\nI can help you with:\n• **Nutrition** — meal advice, calorie guidance, macro tips\n• **Sleep** — improvement strategies and recovery\n• **Workouts** — training plans and recovery advice\n• **Hydration** — daily water targets and tips\n• **Goals** — personalised plans for weight loss, muscle gain, and more\n\nI also have access to your logged tracker data, so my advice is tailored to your actual progress. What would you like to work on today?`,
        timestamp: Date.now(),
      };
      setMessages([welcome]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save messages whenever they change
  useEffect(() => {
    if (!user || messages.length === 0) return;
    ChatStorage.save(user.id, messages);
  }, [messages, user]);

  const getSnapshot = useCallback((): TrackerSnapshot => {
    if (!user) return { calories: null, sleepHrs: null, water: null, workoutMin: null, steps: null, bmi: null };
    const sleepHrs    = SleepStorage.latestHours(user.id);
    const workoutData = WorkoutStorage.load(user.id);
    const stepsTotal  = StepsStorage.latestSteps(user.id);
    const waterTotal  = WaterStorage.totalGlasses(user.id);
    const bmiD        = BMIStorage.load(user.id);
    return {
      calories:   null, // calories come from backend; not available here without an API call
      sleepHrs:   sleepHrs,
      water:      waterTotal,
      workoutMin: (workoutData && workoutData.sessions.length > 0) ? workoutData.totalMinutes : null,
      steps:      stepsTotal,
      bmi:        bmiD?.bmi ?? null,
    };
  }, [user]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate a brief "thinking" delay for realism
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    const snap = getSnapshot();
    const responseText = generateAIResponse(text.trim(), snap);

    const aiMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClearChat() {
    if (!user) return;
    ChatStorage.clear(user.id);
    const welcome: ChatMessage = {
      id: "welcome_new",
      role: "assistant",
      content: "Chat cleared. How can I help you today?",
      timestamp: Date.now(),
    };
    setMessages([welcome]);
  }

  // AI Coach is always accessible — no paywall in MVP
  const canUse = true;

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-10 w-64 h-64 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-32 right-10 w-64 h-64 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-delayed" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#5C6B63] hover:text-[#1F3A2E] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-bold text-[#1F3A2E]">AI Wellness <span className="text-[#5DA9A6]">Coach</span></span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8 relative z-10">
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">AI Wellness Coach</h1>
          <p className="text-[#5C6B63]">Personalised guidance powered by your health data</p>
        </motion.div>

        {/* Trial badge removed — AI Coach is fully accessible */}

        {!canUse ? (
          <PaywallScreen onSubscribe={() => {}} />
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Chat area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="lg:col-span-3 flex flex-col">
              {/* Messages */}
              <div className="glass-card p-5 mb-4 flex-1 overflow-y-auto"
                style={{ minHeight: "420px", maxHeight: "520px" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-[#5C6B63] uppercase tracking-wide">Conversation</p>
                  <button onClick={handleClearChat}
                    className="text-xs text-[#5C6B63] hover:text-red-500 transition-colors">
                    Clear chat
                  </button>
                </div>

                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                <AnimatePresence>
                  {loading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="glass-card p-4">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about nutrition, sleep, workouts, goals…"
                    rows={2}
                    disabled={loading}
                    className="flex-1 bg-transparent outline-none text-sm text-[#1F3A2E] placeholder-[#5C6B63]/60 resize-none"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="btn-premium px-4 py-2.5 text-sm flex-shrink-0 disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#5C6B63]/60 mt-2">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </motion.div>

            {/* Sidebar: suggested prompts */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="space-y-4 lg:col-span-2">
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Try asking…</p>
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {SUGGESTED_PROMPT_GROUPS.map(group => (
                    <div key={group.category}>
                      <p className="text-xs font-semibold text-[#5DA9A6] uppercase tracking-wide mb-1.5">
                        {group.category}
                      </p>
                      <div className="space-y-1.5">
                        {group.prompts.map(prompt => (
                          <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            disabled={loading}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#5C6B63] hover:text-[#1F3A2E] hover:bg-white/60 transition-all border border-[#D6E2D3]/60 disabled:opacity-40 leading-snug"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-[#1F3A2E] mb-2">Your data context</p>
                <p className="text-xs text-[#5C6B63] leading-relaxed">
                  The AI Coach reads your logged sleep, water, workout, steps, and BMI data to give personalised, data-aware advice when relevant to your question.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AICoachPage() {
  return <AuthGuard><AICoachContent /></AuthGuard>;
}
