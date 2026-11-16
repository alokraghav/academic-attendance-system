"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to user's assigned dashboard
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "faculty") router.push("/faculty");
        else if (user.role === "student") router.push("/student");
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">Authenticating ERP Session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
