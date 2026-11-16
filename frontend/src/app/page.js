"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "faculty") router.push("/faculty");
        else if (user.role === "student") router.push("/student");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-text-secondary font-medium">Loading Smart Academic Portal...</p>
      </div>
    </div>
  );
}
