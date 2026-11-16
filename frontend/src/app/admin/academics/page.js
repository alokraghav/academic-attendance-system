"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { Building2, BookOpen, Layers, Users } from "lucide-react";

export default function AdminAcademicsPage() {
  const [tab, setTab] = useState("subjects"); // subjects, departments, courses, assignments
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const [depRes, courseRes, subRes, assignRes] = await Promise.all([
        apiRequest("/academics/departments"),
        apiRequest("/academics/courses"),
        apiRequest("/academics/subjects"),
        apiRequest("/academics/faculty-subjects"),
      ]);
      setDepartments(depRes);
      setCourses(courseRes);
      setSubjects(subRes);
      setAssignments(assignRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Academic Curriculum & Department Setup"
        subtitle="Manage departments, degree courses, curriculum subjects, and faculty teaching allocations."
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-card">
        {[
          { id: "subjects", label: "Subjects Catalog", icon: BookOpen, count: subjects.length },
          { id: "assignments", label: "Faculty Allocations", icon: Users, count: assignments.length },
          { id: "departments", label: "Departments", icon: Building2, count: departments.length },
          { id: "courses", label: "Degree Courses", icon: Layers, count: courses.length },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary-light text-primary" : "bg-gray-100 text-gray-600"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading curriculum data...</div>
        ) : (
          <>
            {tab === "subjects" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Type</th>
                      <th className="text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.id}>
                        <td className="font-mono font-semibold text-primary">{s.code}</td>
                        <td className="font-semibold text-gray-900">{s.name}</td>
                        <td className="text-gray-700">{s.course_code || "BCA-3YR"}</td>
                        <td className="text-gray-700">Semester {s.semester_number || 6}</td>
                        <td className="capitalize text-gray-600">{s.subject_type}</td>
                        <td className="text-right font-semibold text-gray-900">{s.credits} Credits</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "assignments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Assigned Faculty</th>
                      <th>Subject Code</th>
                      <th>Subject Title</th>
                      <th>Academic Year</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td className="font-semibold text-gray-900">{a.faculty_name}</td>
                        <td className="font-mono font-semibold text-primary">{a.subject_code}</td>
                        <td className="text-gray-700">{a.subject_name}</td>
                        <td className="text-gray-600 font-mono">{a.academic_year}</td>
                        <td>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "departments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Department Code</th>
                      <th>Department Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d) => (
                      <tr key={d.id}>
                        <td className="font-mono font-semibold text-primary">{d.code}</td>
                        <td className="font-semibold text-gray-900">{d.name}</td>
                        <td className="text-gray-600">{d.description || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "courses" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Department</th>
                      <th className="text-right">Total Semesters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono font-semibold text-primary">{c.code}</td>
                        <td className="font-semibold text-gray-900">{c.name}</td>
                        <td className="text-gray-700">{c.department_name || "Computer Applications"}</td>
                        <td className="text-right font-semibold text-gray-900">{c.total_semesters} Semesters</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
