"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
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

        {/* Login Box */}
        <div className="mt-6 bg-white py-8 px-6 shadow-card border border-border sm:rounded-lg sm:px-10">
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

          {/* Quick Demo Logins for Evaluation */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-center mb-3">
              One-Click Evaluator Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@smartacademic.edu", "Admin@123")}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded text-[11px] font-semibold transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("rajesh.sharma@smartacademic.edu", "Faculty@123")}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded text-[11px] font-semibold transition-colors text-center"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("student01@smartacademic.edu", "Student@123")}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded text-[11px] font-semibold transition-colors text-center"
              >
                Student
              </button>
            </div>
          </div>
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
