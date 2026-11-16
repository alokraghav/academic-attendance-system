"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";

export default function StudentMyAttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/dashboard/student");
        setData(res.attendance);
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
        title="My Subject-Wise Attendance Status"
        subtitle="Detailed breakdown of attended and missed lecture sessions for the current semester."
      />

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Credits</th>
                <th className="text-center">Total Conducted</th>
                <th className="text-center">Attended</th>
                <th className="text-center">Missed</th>
                <th className="text-right">Percentage</th>
                <th className="text-right">Defaulter Status</th>
                <th className="text-right">Classes to Reach 75%</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    Loading attendance data...
                  </td>
                </tr>
              ) : (
                data?.subjects?.map((s) => (
                  <tr key={s.subject_id}>
                    <td className="font-mono font-bold text-primary">{s.subject_code}</td>
                    <td className="font-semibold text-gray-900">{s.subject_name}</td>
                    <td className="text-gray-600">{s.credits} Credits</td>
                    <td className="text-center font-semibold text-gray-800">{s.total_conducted}</td>
                    <td className="text-center font-bold text-emerald-700">{s.attended}</td>
                    <td className="text-center text-red-600 font-semibold">{s.missed}</td>
                    <td className="text-right">
                      <span className={`font-bold ${s.is_defaulter ? "text-red-600" : "text-emerald-700"}`}>
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="text-right">
                      {s.is_defaulter ? (
                        <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                          Defaulter (&lt;75%)
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          Eligible (&ge;75%)
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      {s.is_defaulter ? (
                        <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          +{s.required_classes_to_75} lectures
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
