"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { Search } from "lucide-react";

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/faculty/my-students");
        setStudents(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="Enrolled Students Register"
        subtitle="Students currently enrolled in your assigned lecture and laboratory modules."
      />

      <div className="bg-white rounded-lg border border-border p-4 mb-5 shadow-card flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student by name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Total Enrolled: <strong className="text-text-primary">{filtered.length}</strong>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Registration No</th>
                <th>Student Full Name</th>
                <th>Email Address</th>
                <th>Course</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Loading student list...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.student_id}>
                    <td className="font-mono font-bold text-primary">{s.roll_number}</td>
                    <td className="font-mono text-gray-500 text-[11px]">{s.registration_number}</td>
                    <td className="font-semibold text-gray-900">{s.full_name}</td>
                    <td className="text-gray-600">{s.email}</td>
                    <td className="text-gray-700">{s.course_code || "BCA"}</td>
                    <td className="text-gray-700">Sem {s.semester_number || 6}</td>
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
