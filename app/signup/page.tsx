"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signUp } from "@/app/lib/api";
import { setToken, setUser, isAuthenticated } from "@/app/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const { firstName, lastName, email, password, confirmPassword } = form;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      setToken(data.token);
      setUser(data.user);
      router.push("/onboarding");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Sign up failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 bg-[#A8CFA8] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#5DA9A6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card p-10 w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-bold text-[#1F3A2E]">
            Nutri<span className="text-[#5DA9A6]">Sphere</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#1F3A2E] mb-1 text-center">
          Create your account
        </h1>
        <p className="text-sm text-[#5C6B63] text-center mb-8">
          Start your personalized wellness journey
        </p>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                First name
              </label>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="input-premium"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
                Last name
              </label>
              <input
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="input-premium"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input-premium"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input-premium"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F3A2E] mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              className="input-premium"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C6B63] mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#5DA9A6] hover:text-[#1F3A2E] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
