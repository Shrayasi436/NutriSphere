"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Menu, Flame, Droplets, Moon, Dumbbell, Home as HomeIcon, LayoutDashboard, Info, HelpCircle, Settings, Utensils, Brain, TrendingUp, Scale, Apple, Heart, Zap, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMsg, setSearchMsg] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Feature card → route map
  const featureRoutes: Record<string, string> = {
    'Calories': '/calories',
    'Meals': '/calories',
    'Water': '/hydration',
    'Sleep': '/sleep',
    'Workout': '/workout',
    'BMI': '/bmi',
    'BMR': '/health',
    'Nutrition': '/calories',
    'Hydration': '/hydration',
    'Weight': '/steps',
  };

  // Search keyword → route map
  const searchRoutes: Record<string, string> = {
    'calorie tracking': '/calories',
    'meal tracking': '/calories',
    'water tracking': '/hydration',
    'sleep tracking': '/sleep',
    'workout tracking': '/workout',
    'bmi calculator': '/bmi',
    'nutrition tracking': '/calories',
    'hydration tracking': '/hydration',
    'weight tracking': '/steps',
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const route = searchRoutes[q];
    if (!route) {
      setSearchMsg("No matching wellness tools found");
      setTimeout(() => setSearchMsg(""), 3000);
      return;
    }
    setSearchMsg("");
    if (!isAuthenticated()) {
      router.push("/signup");
    } else {
      router.push(route);
    }
  }

  function handleFeatureClick(title: string) {
    if (!isAuthenticated()) {
      router.push("/signup");
    } else {
      router.push(featureRoutes[title] ?? "/dashboard");
    }
  }

  function handlePlanClick(slug: string) {
    router.push(`/plans/${slug}`);
  }

  function scrollCarousel(dir: "left" | "right") {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  }

  function handleSidebarNav(item: string) {
    setSidebarOpen(false);
    if (item === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item === "Dashboard") {
      if (!isAuthenticated()) router.push("/signup");
      else router.push("/dashboard");
    } else if (item === "About Us") {
      router.push("/about");
    } else if (item === "How It Works") {
      router.push("/how-it-works");
    } else if (item === "Settings") {
      router.push("/settings");
    }
  }

  function handleGetStarted() {
    if (!isAuthenticated()) router.push("/signup");
    else router.push("/onboarding");
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: '#F6F1E8',
        fontFamily: '"Poppins", sans-serif'
      }}
    >
      {/* Animated Background Mesh Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40"
          style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)' }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-35"
          style={{ background: 'linear-gradient(135deg, #7FB7BE 0%, #2C6E6A 100%)' }}
        />
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 z-50 backdrop-blur-xl rounded-r-3xl flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #F6F1E8 0%, #E7DFD4 100%)',
              borderRight: '1px solid #A8C3B0',
              boxShadow: '20px 0 60px rgba(31, 92, 76, 0.15)'
            }}
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold" style={{ color: '#1F5C4C' }}>Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-white/50 transition">
                  <Menu style={{ color: '#1F5C4C' }} />
                </button>
              </div>
              <nav className="space-y-2">
                {[
                  { label: 'Home', icon: HomeIcon },
                  { label: 'Dashboard', icon: LayoutDashboard },
                  { label: 'About Us', icon: Info },
                  { label: 'How It Works', icon: HelpCircle },
                  { label: 'Settings', icon: Settings },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSidebarNav(label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/60 transition text-left"
                    style={{ color: '#1F5C4C' }}
                  >
                    <Icon style={{ width: 18, color: '#1F5C4C' }} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Sign In / Sign Up buttons fixed at bottom */}
            <div className="p-6 space-y-3" style={{ borderTop: '1px solid #A8C3B0' }}>
              <motion.button
                onClick={() => { setSidebarOpen(false); router.push('/login'); }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full py-3 rounded-full font-semibold text-sm"
                style={{ color: '#1F5C4C', background: 'rgba(255,255,255,0.8)', border: '1px solid #A8C3B0' }}
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={() => { setSidebarOpen(false); router.push('/signup'); }}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full py-3 rounded-full font-semibold text-sm shadow-lg"
                style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #7FB7BE 50%, #3E4A89 100%)', color: '#F6F1E8', boxShadow: '0 8px 25px rgba(31, 92, 76, 0.25)' }}
              >
                Sign Up
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-40 backdrop-blur-xl relative"
        style={{
          background: 'linear-gradient(135deg, rgba(246, 241, 232, 0.88) 0%, rgba(231, 223, 212, 0.85) 100%)',
          borderBottom: '1px solid #A8C3B0',
          boxShadow: '0 4px 30px rgba(31, 92, 76, 0.08)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-3 rounded-full backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(246,241,232,0.6))',
                border: '1px solid #A8C3B0',
                boxShadow: '0 4px 15px rgba(31, 92, 76, 0.08)'
              }}
            >
              <Menu style={{ color: '#1F5C4C', width: 22 }} />
            </motion.button>

            <motion.div className="flex items-center space-x-3" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)',
                  boxShadow: '0 8px 25px rgba(31, 92, 76, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white text-xl font-bold">N</span>
              </motion.div>
              <span className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>
                Nutri<span style={{ fontWeight: 600, color: '#7FB7BE' }}>Sphere</span>
              </span>
            </motion.div>

            <div className="relative hidden lg:block">
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center px-6 py-3.5 rounded-full backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(246, 241, 232, 0.6))',
                  border: '1px solid #A8C3B0',
                  boxShadow: '0 4px 20px rgba(31, 92, 76, 0.08)'
                }}
              >
                <Search style={{ color: '#7FB7BE', width: 20 }} />
                <input
                  type="text"
                  placeholder="Search meals, calories, wellness insights…"
                  className="ml-3 bg-transparent outline-none text-sm"
                  style={{ color: '#1F5C4C', width: 300 }}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchMsg(""); }}
                />
              </motion.form>
              {searchMsg && (
                <div className="absolute top-full mt-2 left-0 right-0 px-4 py-2 rounded-xl text-sm text-center"
                  style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #A8C3B0', color: '#C97B63' }}>
                  {searchMsg}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Notification button with dropdown */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  onClick={() => setShowNotifications(v => !v)}
                  whileHover={{ y: -2, scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="p-3 rounded-full backdrop-blur-md relative"
                  style={{ background: 'linear-gradient(135deg, #F6F1E8, #E7DFD4)', border: '1px solid #A8C3B0' }}
                >
                  <Bell style={{ color: '#1F5C4C', width: 20 }} />
                </motion.button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-72 rounded-2xl p-5 z-50"
                      style={{
                        background: 'linear-gradient(135deg, rgba(246,241,232,0.98), rgba(231,223,212,0.96))',
                        border: '1px solid #A8C3B0',
                        boxShadow: '0 20px 50px rgba(31,92,76,0.15)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)' }}>
                            <span className="text-white text-xs font-bold">N</span>
                          </div>
                          <span className="font-bold text-sm" style={{ color: '#1F5C4C' }}>NutriSphere</span>
                        </div>
                        <button onClick={() => setShowNotifications(false)}>
                          <X style={{ width: 16, color: '#5C6B63' }} />
                        </button>
                      </div>
                      <p className="text-sm text-center py-4" style={{ color: '#5C6B63' }}>
                        You currently have no notifications
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile icon — "U" for unauthenticated */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold backdrop-blur-md"
                style={{ background: 'linear-gradient(135deg, #A8C3B0, #7FB7BE)', color: '#F6F1E8', boxShadow: '0 4px 15px rgba(31, 92, 76, 0.25)' }}
              >
                U
              </motion.div>

              <Link href="/login">
                <motion.button whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="hidden sm:block px-5 py-2.5 rounded-full font-semibold" style={{ color: '#1F5C4C', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid #A8C3B0' }}>
                  Sign In
                </motion.button>
              </Link>

              <Link href="/signup">
                <motion.button whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="px-6 py-2.5 rounded-full font-semibold shadow-lg" style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #7FB7BE 50%, #3E4A89 100%)', color: '#F6F1E8', boxShadow: '0 8px 25px rgba(31, 92, 76, 0.3)' }}>
                  Sign Up
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* SECTION 1: Hero Cinematic Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(216, 167, 177, 0.15) 0%, rgba(62, 74, 137, 0.1) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid #A8C3B0',
            boxShadow: '0 30px 80px rgba(31, 92, 76, 0.12)'
          }}
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative h-96 flex items-center justify-center"
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 rounded-full border-2 border-dashed" style={{ borderColor: '#A8C3B0' }} />
              <motion.div animate={{ rotate: [360, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-48 h-48 rounded-full border-2 border-dashed" style={{ borderColor: '#7FB7BE' }} />
              <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6], y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute w-36 h-36 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)', boxShadow: '0 20px 60px rgba(31, 92, 76, 0.4)' }}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10" />
              </motion.div>
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} animate={{ x: [0, Math.random() * 30 - 15, 0], y: [0, Math.random() * 30 - 15, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }} className="absolute w-2.5 h-2.5 rounded-full" style={{ background: i % 2 === 0 ? '#D8A7B1' : '#E0C897', top: `${15 + i * 12}%`, left: `${15 + i * 10}%` }} />
              ))}
            </motion.div>

            <div>
              <motion.h1 initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }} className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#1F5C4C' }}>
                Your Wellness
                <br />
                <span className="bg-clip-text text-transparent" style={{ background: 'linear-gradient(135deg, #A8C3B0, #7FB7BE)' }}>Journey Begins</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.6 }} className="text-xl mb-10 leading-relaxed" style={{ color: '#5C6B63' }}>
                AI-powered nutrition planning, personalized workout routines, and intelligent health tracking. Your path to optimal wellness, beautifully designed.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}>
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ y: -5, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="px-14 py-4 rounded-2xl font-bold text-lg shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #A8C3B0 0%, #7FB7BE 100%)', color: '#F6F1E8', boxShadow: '0 10px 30px rgba(31, 92, 76, 0.3)' }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 2: Core Wellness Feature Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center mb-12">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4" style={{ color: '#1F5C4C' }}>Core Wellness Features</motion.h2>
          <motion.p variants={itemVariants} className="text-lg" style={{ color: '#5C6B63' }}>Everything you need for a balanced, healthy lifestyle</motion.p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-5 gap-6">
          {[
            { title: 'Calories', subtitle: 'Daily tracking', icon: Flame, gradientLight: '#C97B63', gradientDark: '#FF7F50' },
            { title: 'Meals', subtitle: 'Food logging', icon: Apple, gradientLight: '#E8B49A', gradientDark: '#C97B63' },
            { title: 'Water', subtitle: 'Hydration', icon: Droplets, gradientLight: '#7FB7BE', gradientDark: '#2C6E6A' },
            { title: 'Sleep', subtitle: 'Rest quality', icon: Moon, gradientLight: '#D8A7B1', gradientDark: '#9B5C6A' },
            { title: 'Workout', subtitle: 'Exercise plans', icon: Dumbbell, gradientLight: '#A8C3B0', gradientDark: '#1F5C4C' },
            { title: 'BMI', subtitle: 'Health metric', icon: Scale, gradientLight: '#A8C3B0', gradientDark: '#E0C897' },
            { title: 'BMR', subtitle: 'Metabolism', icon: Zap, gradientLight: '#E0C897', gradientDark: '#C6A969' },
            { title: 'Nutrition', subtitle: 'Macro insights', icon: Utensils, gradientLight: '#E8B49A', gradientDark: '#C97B63' },
            { title: 'Hydration', subtitle: 'Water balance', icon: Heart, gradientLight: '#7FB7BE', gradientDark: '#2C6E6A' },
            { title: 'Weight', subtitle: 'Track progress', icon: TrendingUp, gradientLight: '#A8C3B0', gradientDark: '#1F5C4C' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.02 }}
              onClick={() => handleFeatureClick(feature.title)}
              className="rounded-2xl p-6 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(246, 241, 232, 0.6) 100%)',
                backdropFilter: 'blur(15px)',
                border: '1px solid #A8C3B0',
                boxShadow: '0 15px 40px rgba(31, 92, 76, 0.1)'
              }}
            >
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${feature.gradientLight}, ${feature.gradientDark})`, boxShadow: '0 8px 20px rgba(31, 92, 76, 0.2)' }}>
                <feature.icon style={{ color: '#F6F1E8', width: 24 }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: '#1F5C4C' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: '#5C6B63' }}>{feature.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* SECTION 3: Premium Intelligence Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#1F5C4C' }}>Premium Intelligence</h2>
          <p className="text-lg" style={{ color: '#5C6B63' }}>AI-powered insights and advanced analytics</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Wellness Coach Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => {
              if (!isAuthenticated()) router.push("/signup");
              else router.push("/ai-coach");
            }}
            className="rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(168,207,168,0.2) 0%, rgba(93,169,166,0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #A8CFA8',
              boxShadow: '0 25px 60px rgba(31, 92, 76, 0.15)'
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-40" style={{ background: '#A8CFA8' }} />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A8CFA8, #5DA9A6)', boxShadow: '0 10px 30px rgba(93, 169, 166, 0.3)' }}>
                <Brain style={{ color: '#F6F1E8', width: 32 }} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-2xl font-bold" style={{ color: '#1F5C4C' }}>AI Wellness Coach</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #A8CFA8, #5DA9A6)', color: '#F6F1E8' }}>7-day free trial</span>
              </div>
              <p className="mb-6" style={{ color: '#5C6B63' }}>Your personal AI-powered wellness assistant — personalised nutrition insights, smart guidance, and health recommendations tailored to your data.</p>
              <ul className="space-y-2" style={{ color: '#5C6B63' }}>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8CFA8' }} /><span>Personalised nutrition recommendations</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8CFA8' }} /><span>Smart workout &amp; recovery guidance</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8CFA8' }} /><span>Sleep improvement strategies</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8CFA8' }} /><span>Data-aware insights from your trackers</span></li>
              </ul>
            </div>
          </motion.div>

          {/* AI Insights Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => router.push('/ai-insights')}
            className="rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 131, 195, 0.2) 0%, rgba(62, 74, 137, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #7C83C3',
              boxShadow: '0 25px 60px rgba(62, 74, 137, 0.2)'
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-40" style={{ background: '#7C83C3' }} />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #7C83C3, #3E4A89)', boxShadow: '0 10px 30px rgba(62, 74, 137, 0.3)' }}>
                <Brain style={{ color: '#F6F1E8', width: 32 }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1F5C4C' }}>AI Insights</h3>
              <p className="mb-6" style={{ color: '#5C6B63' }}>Smart wellness recommendations powered by advanced machine learning algorithms</p>
              <ul className="space-y-2" style={{ color: '#5C6B63' }}>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Personalized nutrition tips</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Healthy meal alternatives</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Optimization suggestions</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Progress Analytics Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => router.push('/progress-analytics')}
            className="rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(127, 183, 190, 0.2) 0%, rgba(44, 110, 106, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #7FB7BE',
              boxShadow: '0 25px 60px rgba(44, 110, 106, 0.2)'
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-40" style={{ background: '#7FB7BE' }} />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #7FB7BE, #2C6E6A)', boxShadow: '0 10px 30px rgba(44, 110, 106, 0.3)' }}>
                <TrendingUp style={{ color: '#F6F1E8', width: 32 }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1F5C4C' }}>Progress Analytics</h3>
              <p className="mb-6" style={{ color: '#5C6B63' }}>Comprehensive data visualization and trend analysis for your health journey</p>
              <ul className="space-y-2" style={{ color: '#5C6B63' }}>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Weekly progress charts</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Monthly trends</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Goal achievement tracking</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Wellness Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => {
              if (!isAuthenticated()) router.push("/signup");
              else router.push("/wellness-score");
            }}
            className="rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(168,207,168,0.15) 0%, rgba(122,155,118,0.12) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid #A8C3B0',
              boxShadow: '0 25px 60px rgba(31, 92, 76, 0.12)'
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-40" style={{ background: '#A8C3B0' }} />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #A8C3B0, #7A9B76)', boxShadow: '0 10px 30px rgba(31, 92, 76, 0.25)' }}>
                <TrendingUp style={{ color: '#F6F1E8', width: 32 }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1F5C4C' }}>Wellness Score</h3>
              <p className="mb-6" style={{ color: '#5C6B63' }}>Gamified progress system that rewards healthy habits and tracks your wellness journey</p>
              <ul className="space-y-2" style={{ color: '#5C6B63' }}>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Dynamic score based on daily habits</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Goal-based milestone system</span></li>
                <li className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full" style={{ background: '#A8C3B0' }} /><span>Points &amp; level progression</span></li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 4: Exclusive Wellness Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#1F5C4C' }}>Exclusive Wellness Plans</h2>
          <p className="text-lg" style={{ color: '#5C6B63' }}>Premium programs designed for your transformation</p>
        </motion.div>

        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)', color: '#F6F1E8' }}
          >
            <ChevronLeft style={{ width: 22 }} />
          </button>

          <div
            ref={carouselRef}
            className="flex space-x-6 overflow-x-auto pb-8 px-2"
            style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
          >
          {[
            {
              title: 'Weight Loss Journey',
              slug: 'weight-loss-journey',
              badge: 'Most Popular',
              badgeColor: 'linear-gradient(135deg, #C97B63, #FF7F50)',
              desc: 'Transform your body with our science-backed weight loss program.',
              duration: '12 Weeks',
              price: '$49/month',
              image: 'https://images.unsplash.com/photo-1662549904992-cc9ac569be45?q=80&w=386&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              btnGradient: 'linear-gradient(135deg, #C97B63, #FF7F50)',
            },
            {
              title: 'Lean Muscle Program',
              slug: 'lean-muscle-program',
              badge: 'Best Value',
              badgeColor: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)',
              desc: 'Build lean muscle mass with targeted strength training.',
              duration: '12 Weeks',
              price: '$59/month',
              image: 'https://images.unsplash.com/photo-1733077151330-a6f3a257926b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              btnGradient: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)',
            },
            {
              title: 'Yoga Flow',
              slug: 'yoga-flow',
              badge: null,
              badgeColor: '',
              desc: 'Improve flexibility and mindfulness through guided yoga.',
              duration: '12 Weeks',
              price: '$39/month',
              image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              btnGradient: 'linear-gradient(135deg, #D8A7B1, #9B5C6A)',
            },
            {
              title: 'Sustainable Wellness',
              slug: 'sustainable-wellness',
              badge: null,
              badgeColor: '',
              desc: 'Build long-term healthy habits for lifelong wellness.',
              duration: '12 Weeks',
              price: '$45/month',
              image: 'https://plus.unsplash.com/premium_photo-1712935717662-3dc032f087dc?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              btnGradient: 'linear-gradient(135deg, #7FB7BE, #2C6E6A)',
            },
            {
              title: 'Stress Recovery',
              slug: 'stress-recovery',
              badge: null,
              badgeColor: '',
              desc: 'Reduce stress and restore balance through recovery techniques.',
              duration: '10 Weeks',
              price: '$42/month',
              image: 'https://plus.unsplash.com/premium_photo-1726797750216-75a8487a05c0?q=80&w=817&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              btnGradient: 'linear-gradient(135deg, #7C83C3, #3E4A89)',
            },
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handlePlanClick(plan.slug)}
              className="flex-shrink-0 w-72 rounded-3xl cursor-pointer overflow-hidden flex flex-col"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(246,241,232,0.75) 100%)',
                backdropFilter: 'blur(15px)',
                border: '1px solid #A8C3B0',
                boxShadow: '0 15px 40px rgba(31, 92, 76, 0.12)',
                scrollSnapAlign: 'start',
              }}
            >
              {/* Image flush to top — no padding */}
              <div className="relative w-full h-44 overflow-hidden flex-shrink-0">
                <motion.img
                  src={plan.image}
                  alt={plan.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ display: 'block' }}
                />
                {/* Dark gradient overlay at bottom of image */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(31,58,46,0.35) 100%)' }} />
                {/* Price badge — top right */}
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'rgba(31,58,46,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  {plan.price}
                </div>
                {/* Optional badge — top left */}
                {plan.badge && (
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: plan.badgeColor, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                  >
                    {plan.badge}
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5">
                {/* Title + desc */}
                <div className="mb-4">
                  <h3 className="text-base font-bold mb-1.5 leading-snug" style={{ color: '#1F5C4C' }}>{plan.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#5C6B63' }}>{plan.desc}</p>
                </div>

                {/* Duration row */}
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <div className="flex items-center gap-1.5">
                    {/* Clock icon inline SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, color: '#7FB7BE' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold" style={{ color: '#1F5C4C' }}>{plan.duration}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#5C6B63' }}>NutriSphere Fitness</span>
                </div>

                {/* View Plan button */}
                <motion.button
                  onClick={e => { e.stopPropagation(); handlePlanClick(plan.slug); }}
                  whileHover={{ boxShadow: '0 8px 25px rgba(31,92,76,0.35)', y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: plan.btnGradient, boxShadow: '0 4px 15px rgba(31,92,76,0.2)' }}
                >
                  View Plan
                </motion.button>
              </div>
            </motion.div>
          ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollCarousel("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #A8C3B0, #1F5C4C)', color: '#F6F1E8' }}
          >
            <ChevronRight style={{ width: 22 }} />
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mt-8"
        style={{
          background: 'linear-gradient(135deg, rgba(31, 58, 46, 0.06) 0%, rgba(31, 92, 76, 0.1) 50%, rgba(44, 110, 106, 0.08) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: 'none',
        }}
      >
        {/* Glowing top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #A8C3B0 20%, #7FB7BE 50%, #A8C3B0 80%, transparent 100%)',
            boxShadow: '0 0 12px rgba(127, 183, 190, 0.6), 0 0 24px rgba(168, 195, 176, 0.3)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

            {/* Left — Brand */}
            <div className="space-y-5">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #A8C3B0 0%, #1F5C4C 100%)',
                    boxShadow: '0 6px 20px rgba(31, 92, 76, 0.3)',
                  }}
                >
                  <span className="text-white text-lg font-bold">N</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#1F5C4C' }}>
                  Nutri<span style={{ color: '#7FB7BE' }}>Sphere</span>
                </span>
              </motion.div>

              <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#5C6B63' }}>
                Empowering healthier lifestyles through smart wellness tracking and personalized health insights.
              </p>

              {/* Social icons */}
              <div className="flex items-center space-x-3 pt-1">
                {[
                  {
                    label: 'Twitter / X',
                    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                  },
                  {
                    label: 'Instagram',
                    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
                  },
                  {
                    label: 'LinkedIn',
                    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                  },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    whileHover={{ y: -3, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(246,241,232,0.5))',
                      border: '1px solid #A8C3B0',
                      boxShadow: '0 4px 12px rgba(31, 92, 76, 0.08)',
                    }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 14, fill: '#1F5C4C' }}>
                      <path d={social.path} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Middle — Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#1F5C4C' }}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                  { label: 'Dashboard', action: () => router.push('/dashboard') },
                  { label: 'About Us', action: () => router.push('/about') },
                  { label: 'How It Works', action: () => router.push('/how-it-works') },
                  { label: 'Wellness Plans', action: () => router.push('/plans/weight-loss-journey') },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.button
                      onClick={link.action}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="text-sm flex items-center gap-2 group"
                      style={{ color: '#5C6B63' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                        style={{ background: '#A8C3B0' }}
                      />
                      <span className="group-hover:text-[#1F5C4C] transition-colors duration-200">{link.label}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Features */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: '#1F5C4C' }}>
                Features
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'AI Insights', action: () => router.push('/ai-insights') },
                  { label: 'Progress Analytics', action: () => router.push('/progress-analytics') },
                  { label: 'Meal Tracking', action: () => isAuthenticated() ? router.push('/calories') : router.push('/signup') },
                  { label: 'Sleep Tracking', action: () => isAuthenticated() ? router.push('/sleep') : router.push('/signup') },
                  { label: 'BMI Calculator', action: () => isAuthenticated() ? router.push('/bmi') : router.push('/signup') },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.button
                      onClick={link.action}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="text-sm flex items-center gap-2 group"
                      style={{ color: '#5C6B63' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#7FB7BE' }}
                      />
                      <span className="group-hover:text-[#1F5C4C] transition-colors duration-200">{link.label}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{ background: 'linear-gradient(90deg, transparent, #A8C3B0, #7FB7BE, #A8C3B0, transparent)' }}
          />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: '#5C6B63' }}>
              © 2026 NutriSphere. All rights reserved.
            </p>
            <p className="text-xs italic" style={{ color: '#7FB7BE' }}>
              "Small healthy habits create lifelong transformation."
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}