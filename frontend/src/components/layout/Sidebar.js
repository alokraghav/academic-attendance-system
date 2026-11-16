"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  BarChart3,
  UserCheck,
  User,
  Layers,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  ShieldAlert,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "student";

  const adminNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: GraduationCap },
    { name: "Faculty", href: "/admin/faculty", icon: Users },
    { name: "Academics", href: "/admin/academics", icon: Building2 },
    { name: "Attendance Records", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Leave Requests", href: "/admin/leave-requests", icon: FileCheck2 },
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "User Management", href: "/admin/users", icon: UserCheck },
  ];

  const facultyNav = [
    { name: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { name: "Mark Attendance", href: "/faculty/mark-attendance", icon: CalendarCheck },
    { name: "My Subjects", href: "/faculty/my-subjects", icon: BookOpen },
    { name: "Enrolled Students", href: "/faculty/students", icon: GraduationCap },
    { name: "Attendance History", href: "/faculty/attendance-history", icon: Layers },
    { name: "Defaulters (<75%)", href: "/faculty/defaulters", icon: AlertTriangle },
    { name: "Leave Requests", href: "/faculty/leave-requests", icon: FileCheck2 },
    { name: "Academic Reports", href: "/faculty/reports", icon: FileSpreadsheet },
  ];

  const studentNav = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "My Attendance", href: "/student/my-attendance", icon: CalendarCheck },
    { name: "Attendance History", href: "/student/attendance-history", icon: Layers },
    { name: "Apply for Leave", href: "/student/apply-leave", icon: FileCheck2 },
    { name: "My Leave Status", href: "/student/my-leaves", icon: ShieldAlert },
    { name: "Enrolled Subjects", href: "/student/my-subjects", icon: BookOpen },
    { name: "My Profile", href: "/student/profile", icon: User },
  ];

  let currentNav = studentNav;
  if (role === "admin") currentNav = adminNav;
  else if (role === "faculty") currentNav = facultyNav;

  return (
    <aside className="w-64 bg-sidebar border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-gray-200 flex items-center space-x-3 bg-white">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm">
            SA
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm tracking-tight leading-none">
              SMART ACADEMIC
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">
              Attendance & Leave ERP
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {role.toUpperCase()} PORTAL
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="text-[11px] font-semibold text-gray-800">
          BCA Final Year Project
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">
          Developed by <span className="font-medium text-primary">Alok Raghav</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1 font-mono">
          Python 3.12 • FastAPI • Next.js
        </div>
      </div>
    </aside>
  );
}
