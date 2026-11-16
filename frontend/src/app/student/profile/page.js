"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Hash, BookOpen, Layers, CheckCircle2 } from "lucide-react";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/auth/me");
        setProfile(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <PageHeader
        title="Student Academic Profile"
        subtitle="University enrollment credentials, degree course registration, and identity records."
      />

      <div className="max-w-2xl bg-white rounded-lg border border-border p-6 shadow-card">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading student identity record...</div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-black">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : "S"}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{profile?.full_name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary/20">
                    {profile?.roll_number}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {profile?.registration_number}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Institutional Email</div>
                <div className="font-semibold text-gray-900 font-mono">{profile?.email}</div>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Phone Number</div>
                <div className="font-semibold text-gray-900">{profile?.phone || "+91-9876543210"}</div>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Registered Degree Program</div>
                <div className="font-semibold text-gray-900">Bachelor of Computer Applications (BCA)</div>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Current Academic Term</div>
                <div className="font-semibold text-gray-900">Semester 6 (Final Year)</div>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Academic Batch</div>
                <div className="font-semibold text-gray-900">{profile?.batch_year || "2024-2027"}</div>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="text-gray-500 mb-1">Enrollment Status</div>
                <div className="font-semibold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified & Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
