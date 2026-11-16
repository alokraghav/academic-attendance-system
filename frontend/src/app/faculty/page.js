"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import {
  BookOpen,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/dashboard/faculty");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="Faculty Teaching Dashboard"
        subtitle="Manage assigned subjects, record lecture attendance, and review student leave applications."
        actions={
          <a
            href="/faculty/mark-attendance"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Mark Today's Attendance</span>
          </a>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-text-secondary">Loading faculty overview...</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Assigned Subjects"
              value={data?.summary?.assigned_subjects_count || 0}
              subtitle="Current Semester Courses"
              icon={BookOpen}
              color="primary"
            />
            <StatCard
              title="Enrolled Students"
              value={data?.summary?.total_enrolled_students || 0}
              subtitle="Under instruction"
              icon={GraduationCap}
              color="primary"
            />
            <StatCard
              title="Today's Attendance"
              value={`${data?.summary?.today_attendance_percentage || 0}%`}
              subtitle={`${data?.summary?.today_marked_count || 0} students marked`}
              icon={CalendarCheck}
              color="success"
            />
            <StatCard
              title="Subject Defaulters"
              value={data?.summary?.defaulters_count || 0}
              subtitle="Students below 75%"
              icon={AlertTriangle}
              color="danger"
              alert={data?.summary?.defaulters_count > 0}
            />
            <StatCard
              title="Pending Leaves"
              value={data?.summary?.pending_leaves_count || 0}
              subtitle="Awaiting approval"
              icon={FileCheck2}
              color="warning"
            />
          </div>

          {/* Assigned Subjects Overview */}
          <div className="bg-white rounded-lg border border-border p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-text-primary">Allocated Teaching Subjects</h2>
              <a href="/faculty/mark-attendance" className="text-xs font-semibold text-primary hover:underline">
                Open Attendance Register &rarr;
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.assigned_subjects?.map((sub) => (
                <div key={sub.subject_id} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-primary">{sub.code}</span>
                    <span className="text-[10px] font-semibold text-gray-500">{sub.credits} Credits</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900">{sub.name}</h3>
                  <div className="mt-3 pt-3 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-gray-600">
                    <span>Enrolled: <strong className="text-gray-900">{sub.enrolled_students}</strong></span>
                    <span>Conducted: <strong className="text-gray-900">{sub.classes_conducted} classes</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defaulters Preview Table */}
          <div className="bg-white rounded-lg border border-border p-5 shadow-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Defaulters in Your Assigned Subjects (<span className="text-red-600">&lt; 75%</span>)</h2>
                <p className="text-[11px] text-text-secondary">Real-time attendance calculations powered by Python</p>
              </div>
              <a href="/faculty/defaulters" className="text-xs font-semibold text-primary hover:underline">
                View All Defaulters &rarr;
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Subject Code</th>
                    <th className="text-center">Attended / Total</th>
                    <th className="text-right">Attendance %</th>
                    <th className="text-right">Lectures Needed to Reach 75%</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.defaulters_preview?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No defaulters in your assigned subjects!
                      </td>
                    </tr>
                  ) : (
                    data?.defaulters_preview?.map((d, idx) => (
                      <tr key={idx}>
                        <td className="font-mono font-semibold">{d.roll_number}</td>
                        <td className="font-semibold text-gray-900">{d.student_name}</td>
                        <td className="text-gray-600 font-mono">{d.subject_code}</td>
                        <td className="text-center">{d.attended_classes} / {d.total_classes}</td>
                        <td className="text-right">
                          <span className="font-bold text-red-600">{d.attendance_percentage}%</span>
                        </td>
                        <td className="text-right">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            +{d.additional_classes_needed} lectures
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
      )}
    </DashboardLayout>
  );
}
