"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "My Account", path: "/account" },
    { name: "Settings", path: "/settings" },
    { name: "About Us", path: "/about" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Feedback", path: "/feedback" },
  ];

  return (
    <>
      <header className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-semibold text-xl text-[#1F3A2E] hidden sm:block">
                  NutriSphere
                </span>
              </Link>
            </div>

            <div className="flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="Search meals, nutrients..."
                className="w-full pl-4 pr-4 py-2 rounded-full border-2 border-[#A8CFA8] bg-white focus:outline-none focus:border-[#7A9B76] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#5DA9A6] rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white font-semibold">U</span>
              </div>
              <div className="hidden sm:flex gap-2">
                <Link href="/login">
                  <button className="btn-secondary text-sm">Sign In</button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary text-sm">Sign Up</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isSidebarOpen && (
        <>
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8CFA8] to-[#5DA9A6] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-bold text-xl text-[#1F3A2E]">NutriSphere</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`nav-link block px-4 py-3 rounded-lg ${
                    pathname === link.path
                      ? "bg-gradient-to-r from-[#A8CFA8] to-[#5DA9A6] text-white"
                      : "hover:bg-gray-50 text-[#1F3A2E]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-2">
              <Link href="/login">
                <button className="w-full btn-secondary">Sign In</button>
              </Link>
              <Link href="/signup">
                <button className="w-full btn-primary">Sign Up</button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}