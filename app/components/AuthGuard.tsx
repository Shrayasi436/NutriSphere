"use client";

/**
 * AuthGuard — wraps any page that requires authentication.
 * Redirects to /login if no token is found in localStorage.
 * Renders nothing (null) during the check to avoid flash of protected content.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    // Minimal full-screen loader while checking auth
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A8CFA8]/30 border-t-[#A8CFA8] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
