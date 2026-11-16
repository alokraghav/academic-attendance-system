"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";

export default function StudentAttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/attendance/history");
        setRecords(res);
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
        title="My Classroom Attendance History"
        subtitle="Complete chronological log of attendance marked in each classroom lecture session."
      />

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Marked Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Loading attendance history...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold text-gray-900">{r.session_date}</td>
                    <td className="text-gray-600 font-mono text-[11px]">{r.session_time}</td>
                    <td className="font-mono font-semibold text-primary">{r.subject_code}</td>
                    <td className="text-gray-800">{r.subject_name}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="text-gray-500 text-[11px]">{r.remarks || "Regular session"}</td>
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
