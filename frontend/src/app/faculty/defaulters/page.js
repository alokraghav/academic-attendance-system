"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { AlertTriangle, BookOpen, Download } from "lucide-react";

export default function FacultyDefaultersPage() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDefaulters() {
      try {
        setLoading(true);
        const res = await apiRequest("/attendance/defaulters");
        setDefaulters(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDefaulters();
  }, []);

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="Subject Defaulters List (Attendance Below 75.00%)"
        subtitle="Mandatory university attendance threshold compliance. Calculations executed via Python backend."
      />

      {/* Info Banner */}
      <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-red-950">University 75% Attendance Regulation</h4>
          <p className="mt-0.5 leading-relaxed text-red-800">
            Students whose attendance falls strictly below <strong>75.00%</strong> in any subject are classified as defaulters and may be debarred from end-semester university examinations. The additional lectures column calculates the exact consecutive lectures the student must attend to reach the 75% threshold.
          </p>
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
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th className="text-center">Attended Classes</th>
                <th className="text-center">Total Classes</th>
                <th className="text-right">Attendance %</th>
                <th className="text-right">Classes Needed for 75%</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    Computing defaulter statistics...
                  </td>
                </tr>
              ) : defaulters.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No defaulter students found! All students maintain 75% or above.
                  </td>
                </tr>
              ) : (
                defaulters.map((d, i) => (
                  <tr key={i} className="hover:bg-red-50/20">
                    <td className="font-mono font-bold text-gray-900">{d.roll_number}</td>
                    <td className="font-mono text-gray-500 text-[11px]">{d.registration_number}</td>
                    <td className="font-semibold text-gray-900">{d.student_name}</td>
                    <td className="font-mono font-semibold text-primary">{d.subject_code}</td>
                    <td className="text-gray-700">{d.subject_name}</td>
                    <td className="text-center font-semibold text-gray-800">{d.attended_classes}</td>
                    <td className="text-center font-semibold text-gray-800">{d.total_classes}</td>
                    <td className="text-right">
                      <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {d.attendance_percentage}%
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
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
    </DashboardLayout>
  );
}
