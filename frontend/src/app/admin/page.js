"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge, DefaulterBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/dashboard/admin");
      setData(res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Institutional Administrator Dashboard"
        subtitle="Real-time academic metrics, attendance surveillance, and defaulter tracking."
        actions={
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
        }
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Computing academic records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Students"
              value={data?.summary?.total_students || 0}
              subtitle="Enrolled BCA students"
              icon={GraduationCap}
              color="primary"
            />
            <StatCard
              title="Total Faculty"
              value={data?.summary?.total_faculty || 0}
              subtitle="Teaching professors"
              icon={Users}
              color="primary"
            />
            <StatCard
              title="Active Subjects"
              value={data?.summary?.total_subjects || 0}
              subtitle="Curriculum subjects"
              icon={BookOpen}
              color="primary"
            />
            <StatCard
              title="Today's Attendance"
              value={`${data?.summary?.today_attendance_percentage || 0}%`}
              subtitle={`${data?.summary?.today_present_count || 0}/${data?.summary?.today_total_marked || 0} students marked`}
              icon={CalendarCheck}
              color="success"
            />
            <StatCard
              title="Defaulter Alert"
              value={data?.summary?.defaulter_students_count || 0}
              subtitle="Attendance < 75.0%"
              icon={AlertTriangle}
              color="danger"
              alert={data?.summary?.defaulter_students_count > 0}
            />
            <StatCard
              title="Pending Leaves"
              value={data?.summary?.pending_leave_requests || 0}
              subtitle="Applications review"
              icon={FileCheck2}
              color="warning"
            />
          </div>

          {/* Department Breakdown & Defaulter Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department-wise Statistics */}
            <div className="bg-white rounded-lg border border-border p-5 shadow-card">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-text-primary">Department-wise Academic Statistics</h2>
                <span className="text-xs text-text-secondary">Official ERP Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Department Name</th>
                      <th className="text-right">Students</th>
                      <th className="text-right">Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.department_statistics?.map((dept) => (
                      <tr key={dept.department_id}>
                        <td className="font-semibold text-primary">{dept.department_code}</td>
                        <td className="font-medium text-gray-800">{dept.department_name}</td>
                        <td className="text-right font-semibold">{dept.students_count}</td>
                        <td className="text-right font-semibold">{dept.faculty_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Defaulter Students Preview */}
            <div className="bg-white rounded-lg border border-border p-5 shadow-card">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Defaulter Students (<span className="text-red-600">&lt; 75%</span>)</h2>
                  <p className="text-[11px] text-text-secondary">Mandatory 75% attendance rule threshold</p>
                </div>
                <a
                  href="/admin/reports"
                  className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center space-x-1"
                >
                  <span>Full Report</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Subject</th>
                      <th className="text-center">Attended / Total</th>
                      <th className="text-right">Percentage</th>
                      <th className="text-right">Needed Classes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.defaulters_preview?.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          No defaulters found! All students maintain &gt;= 75% attendance.
                        </td>
                      </tr>
                    ) : (
                      data?.defaulters_preview?.map((d, i) => (
                        <tr key={i}>
                          <td className="font-mono text-xs">{d.roll_number}</td>
                          <td className="font-medium text-gray-900">{d.student_name}</td>
                          <td className="text-gray-600">{d.subject_code}</td>
                          <td className="text-center">{d.attended_classes} / {d.total_classes}</td>
                          <td className="text-right">
                            <span className="font-bold text-red-600">{d.attendance_percentage}%</span>
                          </td>
                          <td className="text-right">
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                              +{d.additional_classes_needed} classes
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Attendance Log */}
          <div className="bg-white rounded-lg border border-border p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-text-primary">Recent Class Attendance Records</h2>
              <a
                href="/admin/attendance"
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center space-x-1"
              >
                <span>View All Records</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Subject Code</th>
                    <th>Session Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recent_attendance?.map((rec) => (
                    <tr key={rec.id}>
                      <td className="font-mono">{rec.roll_number}</td>
                      <td className="font-medium text-gray-900">{rec.student_name}</td>
                      <td className="text-gray-600">{rec.subject_code}</td>
                      <td className="text-gray-600">{rec.session_date}</td>
                      <td>
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
