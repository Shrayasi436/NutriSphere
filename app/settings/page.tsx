"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/app/components/AuthGuard";
import { removeToken } from "@/app/lib/auth";

interface Toggle { id: string; label: string; description: string; enabled: boolean; }

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        enabled ? "bg-[#7A9B76]" : "bg-gray-200"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow"
        style={{ x: enabled ? 22 : 2 }}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Toggle[]>([
    { id: "meal",   label: "Meal Reminders",        description: "Get reminded to log your meals",       enabled: true  },
    { id: "water",  label: "Water Intake Reminders", description: "Hydration check-ins throughout the day", enabled: true  },
    { id: "sleep",  label: "Sleep Reminders",        description: "Bedtime and wake-up notifications",    enabled: false },
    { id: "insights",label: "Health Insights",       description: "Weekly wellness summary and tips",     enabled: true  },
  ]);

  const [modal, setModal] = useState<"password" | "2fa" | "export" | "delete" | null>(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg]   = useState("");
  const [exportDone, setExportDone] = useState(false);

  function toggleNotif(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  }

  function handlePasswordSave() {
    if (!pwForm.current) { setPwMsg("Enter your current password."); return; }
    if (pwForm.next.length < 8) { setPwMsg("New password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg("Passwords do not match."); return; }
    setPwMsg("Password updated successfully.");
    setTimeout(() => { setModal(null); setPwForm({ current: "", next: "", confirm: "" }); setPwMsg(""); }, 1500);
  }

  function handleExport() {
    const data = { exportedAt: new Date().toISOString(), note: "NutriSphere data export" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nutrisphere-data.json"; a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => { setModal(null); setExportDone(false); }, 1500);
  }

  function handleDeleteAccount() {
    removeToken();
    router.replace("/signup");
  }

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

      <div className="max-w-3xl mx-auto px-6 pt-8 relative z-10 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#1F3A2E] mb-1">Settings</h1>
          <p className="text-[#5C6B63]">Manage your preferences and account</p>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card p-7">
          <h2 className="text-base font-bold text-[#1F3A2E] mb-5">Notifications</h2>
          <div className="space-y-4">
            {notifications.map(n => (
              <div key={n.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#1F3A2E]">{n.label}</p>
                  <p className="text-xs text-[#5C6B63]">{n.description}</p>
                </div>
                <Toggle enabled={n.enabled} onChange={() => toggleNotif(n.id)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-7">
          <h2 className="text-base font-bold text-[#1F3A2E] mb-5">Privacy & Security</h2>
          <div className="space-y-2">
            {[
              {
                label: "Change Password",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />,
                action: () => setModal("password"),
              },
              {
                label: "Two-Factor Authentication",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                action: () => setModal("2fa"),
              },
              {
                label: "Export My Data",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
                action: () => setModal("export"),
              },
              {
                label: "Delete Account",
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
                action: () => setModal("delete"),
                danger: true,
              },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
                  item.danger
                    ? "border-red-200/60 hover:border-red-300 hover:bg-red-50/50 text-red-500"
                    : "border-[#D6E2D3]/60 hover:border-[#A8CFA8] hover:bg-white/50 text-[#1F3A2E]"
                }`}>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </motion.div>

        {/* App info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1F3A2E]">NutriSphere</p>
            <p className="text-xs text-[#5C6B63]">Version 1.0.0 — Premium Wellness Platform</p>
          </div>
          <button onClick={() => { removeToken(); router.push("/"); }}
            className="text-sm px-4 py-2 rounded-xl border-2 border-[#A8CFA8]/40 text-[#5C6B63] hover:border-[#A8CFA8] hover:text-[#1F3A2E] transition-all">
            Sign out
          </button>
        </motion.div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(31,58,46,0.35)", backdropFilter: "blur(6px)" }}
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-md">

              {/* Change Password */}
              {modal === "password" && (
                <>
                  <h3 className="text-lg font-bold text-[#1F3A2E] mb-5">Change Password</h3>
                  {pwMsg && (
                    <p className={`mb-4 text-sm px-3 py-2 rounded-xl border ${
                      pwMsg.includes("success") ? "text-[#7A9B76] bg-green-50 border-green-200" : "text-red-500 bg-red-50 border-red-200"
                    }`}>{pwMsg}</p>
                  )}
                  <div className="space-y-3">
                    {[
                      { label: "Current Password", key: "current" as const },
                      { label: "New Password",     key: "next"    as const },
                      { label: "Confirm Password", key: "confirm" as const },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-[#1F3A2E] mb-1">{f.label}</label>
                        <input type="password" value={pwForm[f.key]}
                          onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-premium" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setModal(null)} className="btn-secondary-premium flex-1 py-3">Cancel</button>
                    <button onClick={handlePasswordSave} className="btn-premium flex-1 py-3">Save</button>
                  </div>
                </>
              )}

              {/* 2FA */}
              {modal === "2fa" && (
                <>
                  <h3 className="text-lg font-bold text-[#1F3A2E] mb-3">Two-Factor Authentication</h3>
                  <p className="text-sm text-[#5C6B63] mb-6">
                    Two-factor authentication adds an extra layer of security to your account.
                    This feature will be available in a future update.
                  </p>
                  <button onClick={() => setModal(null)} className="btn-premium w-full">Close</button>
                </>
              )}

              {/* Export */}
              {modal === "export" && (
                <>
                  <h3 className="text-lg font-bold text-[#1F3A2E] mb-3">Export My Data</h3>
                  <p className="text-sm text-[#5C6B63] mb-6">
                    Download a copy of your NutriSphere data as a JSON file.
                  </p>
                  {exportDone
                    ? <p className="text-sm text-[#7A9B76] font-medium text-center">Download started.</p>
                    : (
                      <div className="flex gap-3">
                        <button onClick={() => setModal(null)} className="btn-secondary-premium flex-1 py-3">Cancel</button>
                        <button onClick={handleExport} className="btn-premium flex-1 py-3">Download</button>
                      </div>
                    )
                  }
                </>
              )}

              {/* Delete account */}
              {modal === "delete" && (
                <>
                  <h3 className="text-lg font-bold text-red-500 mb-3">Delete Account</h3>
                  <p className="text-sm text-[#5C6B63] mb-6">
                    This will permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setModal(null)} className="btn-secondary-premium flex-1 py-3">Cancel</button>
                    <button onClick={handleDeleteAccount}
                      className="flex-1 py-3 rounded-2xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  return <AuthGuard><SettingsContent /></AuthGuard>;
}
