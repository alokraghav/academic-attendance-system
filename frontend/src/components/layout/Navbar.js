"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, Bell, Calendar } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "faculty":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{today}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-semibold">Academic Session 2026-2027</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 border-r border-gray-200 pr-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 leading-tight">
                {user.full_name}
              </div>
              <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                {user.roll_number && (
                  <span className="text-xs text-gray-500 font-mono">
                    [{user.roll_number}]
                  </span>
                )}
                {user.employee_id && (
                  <span className="text-xs text-gray-500 font-mono">
                    [{user.employee_id}]
                  </span>
                )}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {user.full_name ? user.full_name[0].toUpperCase() : "U"}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
          title="Sign out of system"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
