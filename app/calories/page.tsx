"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuthGuard from "@/app/components/AuthGuard";
import {
  getMeals,
  addMeal,
  deleteMeal,
  getFoodList,
  getMealHistory,
  Meal,
  FoodItem,
  MealType,
  MealHistoryDay,
} from "@/app/lib/api";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch",     label: "Lunch"     },
  { value: "dinner",    label: "Dinner"    },
  { value: "snack",     label: "Snack"     },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

// ── Circular progress ring ────────────────────────────────────────────────────
function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const dash = pct * circ;
  const color = pct >= 1 ? "#C97B63" : "#A8CFA8";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#D6E2D3" strokeWidth="10" />
      <motion.circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="64" textAnchor="middle" fill="#1F3A2E" fontSize="22" fontWeight="700">
        {consumed.toLocaleString()}
      </text>
      <text x="70" y="82" textAnchor="middle" fill="#5C6B63" fontSize="11">
        kcal
      </text>
    </svg>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
function CaloriesContent() {
  const router = useRouter();

  const [meals, setMeals]           = useState<Meal[]>([]);
  const [foods, setFoods]           = useState<FoodItem[]>([]);
  const [history, setHistory]       = useState<MealHistoryDay[]>([]);
  const [totalCalories, setTotal]   = useState(0);
  const [byType, setByType]         = useState<Record<string, number>>({});
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]           = useState("");
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [foodName, setFoodName]         = useState("");
  const [quantity, setQuantity]         = useState("1");
  const [mealType, setMealType]         = useState<MealType>("snack");
  const [manualCal, setManualCal]       = useState("");
  const [isManual, setIsManual]         = useState(false);
  const [previewCal, setPreviewCal]     = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      getMeals(),
      getFoodList(),
      getMealHistory(7),
    ]).then(([mealsRes, foodsRes, histRes]) => {
      setMeals(mealsRes.meals);
      setTotal(mealsRes.totalCalories);
      setByType(mealsRes.byType);
      setFoods(foodsRes.foods);
      setHistory(histRes.history);
    }).catch(() => {
      router.replace("/login");
    }).finally(() => setLoading(false));
  }, [router]);

  // Live calorie preview
  useEffect(() => {
    const qty = parseFloat(quantity) || 1;
    if (isManual) {
      const mc = parseFloat(manualCal);
      setPreviewCal(isNaN(mc) ? null : Math.round(mc * qty));
    } else {
      const match = foods.find(f => f.name.toLowerCase() === foodName.toLowerCase());
      setPreviewCal(match ? Math.round(match.calories * qty) : null);
    }
  }, [foodName, quantity, manualCal, isManual, foods]);

  function handleFoodInput(val: string) {
    setFoodName(val);
    setIsManual(false);
    if (val.length >= 1) {
      const filtered = foods.filter(f =>
        f.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(food: FoodItem) {
    setFoodName(food.name);
    setIsManual(false);
    setShowSuggestions(false);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!foodName.trim()) { setError("Please enter a food name."); return; }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) { setError("Quantity must be a positive number."); return; }

    const inDataset = foods.some(f => f.name.toLowerCase() === foodName.toLowerCase());
    if (!inDataset && !manualCal) {
      setError(`"${foodName}" is not in the database. Please enter calories manually.`);
      setIsManual(true);
      return;
    }

    setAdding(true);
    try {
      const payload: Parameters<typeof addMeal>[0] = {
        foodName: foodName.trim(),
        quantity: qty,
        mealType,
        ...(isManual || !inDataset ? { manualCalories: parseFloat(manualCal) } : {}),
      };
      const res = await addMeal(payload);
      setMeals(prev => [...prev, res.meal]);
      setTotal(prev => prev + res.meal.calories);
      setByType(prev => ({ ...prev, [mealType]: (prev[mealType] ?? 0) + res.meal.calories }));
      // Reset form
      setFoodName(""); setQuantity("1"); setManualCal(""); setIsManual(false); setPreviewCal(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? "Failed to add meal.";
      setError(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, cal: number, type: MealType) {
    setDeletingId(id);
    try {
      await deleteMeal(id);
      setMeals(prev => prev.filter(m => m._id !== id));
      setTotal(prev => Math.max(0, prev - cal));
      setByType(prev => ({ ...prev, [type]: Math.max(0, (prev[type] ?? 0) - cal) }));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  const maxHistoryCal = Math.max(...history.map(h => h.totalCalories), 1);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A8CFA8]/30 border-t-[#A8CFA8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient pb-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-10 w-64 h-64 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-32 right-10 w-64 h-64 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-delayed" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/30"
        style={{ background: "rgba(247,245,239,0.88)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#5C6B63] hover:text-[#1F3A2E] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-[#1F3A2E]">Nutri<span className="text-[#5DA9A6]">Sphere</span></span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Calorie Tracker</h1>
          <p className="text-[#5C6B63]">Log your meals and track daily intake — {formatDate(todayStr())}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left col: form + meal list ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Add meal form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-card p-7">
              <h2 className="text-lg font-bold text-[#1F3A2E] mb-5">Log a Meal</h2>

              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleAdd} className="space-y-4" noValidate>
                {/* Food name + autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Food Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rice, Egg, Banana…"
                    value={foodName}
                    onChange={e => handleFoodInput(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="input-premium"
                    disabled={adding}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-lg border border-[#D6E2D3]"
                        style={{ background: "rgba(255,255,255,0.97)" }}>
                        {suggestions.map(f => (
                          <li key={f.name}
                            onMouseDown={() => selectSuggestion(f)}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-[#A8CFA8]/10 cursor-pointer transition-colors">
                            <div>
                              <span className="text-sm font-medium text-[#1F3A2E]">{f.name}</span>
                              <span className="text-xs text-[#5C6B63] ml-2">{f.servingUnit}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#5DA9A6]">{f.calories} kcal</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quantity + meal type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Quantity (servings)</label>
                    <input type="number" min="0.1" step="0.1" placeholder="1"
                      value={quantity} onChange={e => setQuantity(e.target.value)}
                      className="input-premium" disabled={adding} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">Meal Type</label>
                    <select value={mealType} onChange={e => setMealType(e.target.value as MealType)}
                      className="input-premium" disabled={adding}>
                      {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Manual calories (shown when food not in dataset) */}
                <AnimatePresence>
                  {isManual && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                        Calories per serving (manual)
                      </label>
                      <input type="number" min="0" placeholder="e.g. 250"
                        value={manualCal} onChange={e => setManualCal(e.target.value)}
                        className="input-premium" disabled={adding} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview */}
                {previewCal !== null && (
                  <p className="text-sm text-[#5DA9A6] font-medium">
                    Estimated: {previewCal.toLocaleString()} kcal
                  </p>
                )}

                <button type="submit" disabled={adding}
                  className="btn-premium w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  {adding ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding…</>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Meal
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Today's meal list */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-7">
              <h2 className="text-lg font-bold text-[#1F3A2E] mb-5">
                Today&apos;s Meals
                {meals.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#5C6B63]">({meals.length} items)</span>
                )}
              </h2>

              {meals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(168,207,168,0.15)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#A8CFA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#5C6B63]">No meals logged today. Add your first meal above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {meals.map((meal) => (
                      <motion.div key={meal._id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#D6E2D3]/60"
                        style={{ background: "rgba(255,255,255,0.55)" }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: meal.mealType === "breakfast" ? "#A8CFA8" : meal.mealType === "lunch" ? "#5DA9A6" : meal.mealType === "dinner" ? "#7A9B76" : "#D6E2D3" }} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1F3A2E] truncate">{meal.foodName}</p>
                            <p className="text-xs text-[#5C6B63]">
                              {meal.quantity} × {meal.servingUnit} &nbsp;·&nbsp;
                              <span className="capitalize">{meal.mealType}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-bold text-[#1F3A2E]">{meal.calories} kcal</span>
                          <button onClick={() => handleDelete(meal._id, meal.calories, meal.mealType)}
                            disabled={deletingId === meal._id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C6B63] hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40">
                            {deletingId === meal._id
                              ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            }
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Right col: summary + history ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Daily summary ring */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6 text-center">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-4">Today&apos;s Intake</p>
              <div className="flex justify-center mb-4">
                <CalorieRing consumed={totalCalories} target={2000} />
              </div>
              <p className="text-xs text-[#5C6B63]">Target: 2,000 kcal</p>

              {/* By meal type */}
              <div className="mt-5 space-y-2">
                {MEAL_TYPES.map(t => (
                  <div key={t.value} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: t.value === "breakfast" ? "#A8CFA8" : t.value === "lunch" ? "#5DA9A6" : t.value === "dinner" ? "#7A9B76" : "#D6E2D3" }} />
                      <span className="text-[#5C6B63] capitalize">{t.label}</span>
                    </div>
                    <span className="font-semibold text-[#1F3A2E]">{(byType[t.value] ?? 0)} kcal</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 7-day history */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
              className="glass-card p-6">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-4">7-Day History</p>
              <div className="space-y-2">
                {history.map((day, i) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-[#5C6B63] w-16 flex-shrink-0">
                      {i === 0 ? "Today" : formatDate(day.date).split(",")[0]}
                    </span>
                    <div className="flex-1 h-2 bg-[#D6E2D3] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.totalCalories / maxHistoryCal) * 100}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? "#A8CFA8" : "#D6E2D3", border: i === 0 ? "none" : "1px solid #A8CFA8" }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1F3A2E] w-16 text-right flex-shrink-0">
                      {day.totalCalories > 0 ? `${day.totalCalories.toLocaleString()} kcal` : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick nav */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}
              className="glass-card p-5">
              <p className="text-sm font-semibold text-[#1F3A2E] mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { label: "Health Profile & BMR", href: "/health" },
                  { label: "Sleep Tracker",        href: "/sleep"  },
                  { label: "Workout Log",          href: "/workout"},
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#5C6B63] hover:text-[#1F3A2E] hover:bg-white/50 transition-all">
                    {l.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaloriesPage() {
  return (
    <AuthGuard>
      <CaloriesContent />
    </AuthGuard>
  );
}
