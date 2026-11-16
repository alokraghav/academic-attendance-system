"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge, DefaulterBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck2,
  PlusCircle,
  BookOpen,
} from "lucide-react";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/dashboard/student");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const att = data?.attendance || {};
  const isDefaulter = att.is_defaulter;

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <PageHeader
        title={`Welcome, ${data?.student?.full_name || "Student"}`}
        subtitle={`Roll Number: ${data?.student?.roll_number || "—"} | ${data?.student?.course || "BCA"} Semester ${data?.student?.semester || 6} | Batch ${data?.student?.batch_year || "2024-2027"}`}
        actions={
          <a
            href="/student/apply-leave"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply for Leave</span>
          </a>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-text-secondary">Loading your attendance records...</div>
      ) : (
        <div className="space-y-6">
          {/* Defaulter Warning Banner if < 75% */}
          {isDefaulter && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-950 text-xs flex items-start space-x-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-900">Attendance Defaulter Warning (&lt; 75%)</h4>
                <p className="mt-0.5 leading-relaxed text-red-800">
                  Your overall attendance is currently <strong>{att.overall_percentage}%</strong>, which is below the mandatory university threshold of 75.00%. You must attend at least <strong>{att.required_classes_to_75}</strong> consecutive lectures to reach 75% eligibility for university examinations.
                </p>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Attendance"
              value={`${att.overall_percentage || 0}%`}
              subtitle={isDefaulter ? "Defaulter Status (<75%)" : "Good Academic Standing"}
              icon={CalendarCheck}
              color={isDefaulter ? "danger" : "success"}
              alert={isDefaulter}
            />
            <StatCard
              title="Classes Attended"
              value={att.total_attended || 0}
              subtitle="Lectures Present"
              icon={CheckCircle2}
              color="success"
            />
            <StatCard
              title="Classes Conducted"
              value={att.total_conducted || 0}
              subtitle="Total Semester Sessions"
              icon={Clock}
              color="primary"
            />
            <StatCard
              title="Classes Missed"
              value={att.total_missed || 0}
              subtitle="Absent sessions"
              icon={XCircle}
              color={att.total_missed > 5 ? "warning" : "primary"}
            />
          </div>

          {/* Subject-Wise Attendance Breakdown Table */}
          <div className="bg-white rounded-lg border border-border p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-text-primary">Subject-Wise Attendance Breakdown</h2>
              <span className="text-[11px] text-text-secondary">Official University Calculations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th className="text-center">Attended / Conducted</th>
                    <th className="text-center">Missed</th>
                    <th className="text-right">Attendance %</th>
                    <th className="text-right">Eligibility Status</th>
                  </tr>
                </thead>
                <tbody>
                  {att.subjects?.map((sub) => (
                    <tr key={sub.subject_id}>
                      <td className="font-mono font-bold text-primary">{sub.subject_code}</td>
                      <td className="font-semibold text-gray-900">{sub.subject_name}</td>
                      <td className="text-center font-medium">
                        {sub.attended} / {sub.total_conducted}
                      </td>
                      <td className="text-center text-gray-600">{sub.missed}</td>
                      <td className="text-right">
                        <span className={`font-bold ${sub.is_defaulter ? "text-red-600" : "text-emerald-700"}`}>
                          {sub.percentage}%
                        </span>
                      </td>
                      <td className="text-right">
                        {sub.is_defaulter ? (
                          <span className="font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            Defaulter (Needs +{sub.required_classes_to_75} classes)
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            Eligible (&ge;75%)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Records & Leave Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Attendance */}
            <div className="bg-white rounded-lg border border-border p-5 shadow-card">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-text-primary">Recent Class Attendance</h3>
                <a href="/student/attendance-history" className="text-xs font-semibold text-primary hover:underline">
                  Full History &rarr;
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recent_attendance?.map((r) => (
                      <tr key={r.id}>
                        <td className="font-medium text-gray-900">{r.session_date}</td>
                        <td className="text-gray-700">{r.subject_code} - {r.subject_name}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Applications Status */}
            <div className="bg-white rounded-lg border border-border p-5 shadow-card">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-text-primary">Leave Application Status</h3>
                <a href="/student/my-leaves" className="text-xs font-semibold text-primary hover:underline">
                  All Applications &rarr;
                </a>
              </div>
              <div className="space-y-3">
                {data?.recent_leaves?.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No leave applications submitted.</p>
                ) : (
                  data?.recent_leaves?.map((l) => (
                    <div key={l.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">{l.leave_type} Leave</div>
                        <div className="text-gray-500 text-[11px] mt-0.5">{l.start_date} to {l.end_date}</div>
                        {l.review_remarks && (
                          <div className="text-[11px] text-gray-600 mt-1 italic">&ldquo;{l.review_remarks}&rdquo;</div>
                        )}
                      </div>
                      <div>
                        <StatusBadge status={l.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
