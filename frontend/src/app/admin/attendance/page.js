"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import { Calendar, Filter, RefreshCw } from "lucide-react";

export default function AdminAttendancePage() {
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const subs = await apiRequest("/academics/subjects");
      setSubjects(subs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let url = "/attendance/history?";
      if (selectedSubject) url += `subject_id=${selectedSubject}&`;
      if (startDate) url += `start_date=${startDate}&`;
      if (endDate) url += `end_date=${endDate}&`;
      const res = await apiRequest(url);
      setHistory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedSubject, startDate, endDate]);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Institutional Attendance Surveillance"
        subtitle="Audit completed lecture sessions, attendance timestamps, and marked status."
        actions={
          <button
            onClick={fetchAttendance}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-lg border border-border p-4 mb-5 shadow-card flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-700">Filter By:</span>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs py-1.5 px-2.5"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.name}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs py-1 px-2"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs py-1 px-2"
          />
        </div>

        {(selectedSubject || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedSubject("");
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Loading attendance audit trail...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No attendance records found for selected criteria.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="font-medium text-gray-900">{h.session_date}</td>
                    <td className="text-gray-600 font-mono text-[11px]">{h.session_time}</td>
                    <td className="font-mono font-semibold text-primary">{h.subject_code}</td>
                    <td className="text-gray-800">{h.subject_name}</td>
                    <td className="font-mono font-semibold">{h.roll_number}</td>
                    <td className="text-gray-900 font-medium">{h.student_name}</td>
                    <td>
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="text-gray-500 text-[11px]">{h.remarks || "—"}</td>
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
