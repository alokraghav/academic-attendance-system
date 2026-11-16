"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, switchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard immediately
  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "faculty") router.push("/faculty");
      else if (user.role === "student") router.push("/student");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async (role) => {
    setError("");
    setLoading(true);
    try {
      await switchRole(role);
    } catch (err) {
      setError(err.message || "Failed to switch role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Institutional Branding */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mx-auto shadow-sm mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            Smart Academic ERP
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Attendance & Leave Management System
          </p>
        </div>

        {/* Localhost Bypass Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-blue-900 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Localhost Mode Active: Direct 1-Click Access</span>
          </div>
          <p className="text-[11px] text-blue-700 mb-3">
            Click any role to surpass authentication and enter the portal immediately:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantLogin("admin")}
              className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center space-x-1"
            >
              <span>Admin</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantLogin("faculty")}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center space-x-1"
            >
              <span>Faculty</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantLogin("student")}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center space-x-1"
            >
              <span>Student</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="mt-4 bg-white py-6 px-6 shadow-card border border-border sm:rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-md bg-status-danger-bg border border-status-danger-border flex items-start space-x-2 text-xs text-status-danger-text">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartacademic.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 mt-2 shadow-sm"
            >
              <span>{loading ? "Authenticating..." : "Sign in to Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Project Meta Credits */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            BCA Final Year Project • Author: <strong className="text-text-primary">Alok Raghav</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
