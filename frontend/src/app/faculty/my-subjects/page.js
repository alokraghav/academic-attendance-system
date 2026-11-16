"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { BookOpen, CalendarCheck } from "lucide-react";

export default function FacultyMySubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/faculty/my-subjects");
        setSubjects(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="My Allocated Teaching Curriculum"
        subtitle="Current semester subjects assigned by department administration."
      />

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Curriculum Type</th>
                <th>Course Degree</th>
                <th>Semester</th>
                <th className="text-right">Credits</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    Loading assigned subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No subjects allocated.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.subject_id || s.id}>
                    <td className="font-mono font-bold text-primary">{s.code}</td>
                    <td className="font-semibold text-gray-900">{s.name}</td>
                    <td className="capitalize text-gray-600">{s.subject_type || "theory"}</td>
                    <td className="text-gray-700">{s.course_code || "BCA-3YR"}</td>
                    <td className="text-gray-700">Semester {s.semester_number || 6}</td>
                    <td className="text-right font-bold text-gray-900">{s.credits || 4} Credits</td>
                    <td className="text-right">
                      <a
                        href="/faculty/mark-attendance"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Mark Attendance</span>
                      </a>
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
