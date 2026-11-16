"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";

export default function StudentMySubjectsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/dashboard/student");
        setData(res.attendance?.subjects || []);
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
        title="My Enrolled Degree Curriculum"
        subtitle="Bachelor of Computer Applications (BCA) - Semester 6 Course Modules"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-gray-500">Loading enrolled curriculum...</div>
        ) : (
          data?.map((s) => (
            <div key={s.subject_id} className="bg-white rounded-lg border border-border p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-primary">{s.subject_code}</span>
                  <span className="text-[11px] font-semibold text-gray-500">{s.credits || 4} Credits</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{s.subject_name}</h3>
                <p className="text-xs text-gray-500 mt-1">Core Undergraduate Module</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[11px] text-gray-500">My Attendance</div>
                  <div className={`font-bold text-sm ${s.is_defaulter ? "text-red-600" : "text-emerald-700"}`}>
                    {s.percentage}%
                  </div>
                </div>
                <a
                  href="/student/my-attendance"
                  className="px-3 py-1 text-xs font-semibold text-primary bg-primary-light rounded hover:bg-primary/20 transition-colors"
                >
                  View Details &rarr;
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
