"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { Calendar, Clock, BookOpen, Check, X, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function FacultyMarkAttendancePage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTime, setSessionTime] = useState("09:00 - 10:00 AM");
  const [topic, setTopic] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // 1. Fetch faculty's assigned subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await apiRequest("/faculty/my-subjects");
        setSubjects(res);
        if (res.length > 0) {
          setSelectedSubject(res[0].subject_id || res[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSubjects();
  }, []);

  // 2. Fetch enrolled students when subject changes
  useEffect(() => {
    if (!selectedSubject) return;

    async function loadStudents() {
      setLoadingStudents(true);
      setStatusMsg({ type: "", text: "" });
      try {
        const res = await apiRequest(`/faculty/my-students?subject_id=${selectedSubject}`);
        setStudents(res);
        // Default all students to "present"
        const initial = {};
        res.forEach((st) => {
          initial[st.student_id] = "present";
        });
        setAttendanceMap(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    }

    loadStudents();
  }, [selectedSubject]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st.student_id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      alert("No students enrolled in this subject.");
      return;
    }

    setSaving(true);
    setStatusMsg({ type: "", text: "" });

    const records = students.map((st) => ({
      student_id: st.student_id,
      status: attendanceMap[st.student_id] || "present",
      remarks: attendanceMap[st.student_id] === "absent" ? "Absent during roll call" : "Regular lecture attendance",
    }));

    try {
      const res = await apiRequest("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          subject_id: selectedSubject,
          session_date: sessionDate,
          session_time: sessionTime,
          topic: topic.trim() || "Regular Classroom Lecture",
          session_type: "regular",
          records,
        }),
      });

      setStatusMsg({
        type: "success",
        text: `Attendance recorded successfully: ${res.present_count} Present, ${res.absent_count} Absent out of ${res.total_marked} students.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to submit attendance.",
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="Mark Classroom Attendance Register"
        subtitle="Verify enrolled student rolls, toggle present/absent statuses, and commit attendance records to database."
      />

      {statusMsg.text && (
        <div
          className={`mb-5 p-3.5 rounded-lg border text-xs flex items-center space-x-2.5 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* Class Session Configuration Bar */}
      <div className="bg-white rounded-lg border border-border p-5 mb-5 shadow-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Lecture Session Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Select Subject</label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs font-semibold"
              >
                {subjects.map((sub) => (
                  <option key={sub.subject_id || sub.id} value={sub.subject_id || sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Class Time Slot</label>
            <select
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full text-xs font-mono"
            >
              <option value="09:00 - 10:00 AM">09:00 - 10:00 AM (Slot 1)</option>
              <option value="10:15 - 11:15 AM">10:15 - 11:15 AM (Slot 2)</option>
              <option value="11:30 - 12:30 PM">11:30 - 12:30 PM (Slot 3)</option>
              <option value="01:30 - 02:30 PM">01:30 - 02:30 PM (Slot 4)</option>
              <option value="02:45 - 03:45 PM">02:45 - 03:45 PM (Slot 5)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Lecture Topic</label>
            <input
              type="text"
              placeholder="e.g. Unit 3: SQLAlchemy Relationships"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        {/* Action Header */}
        <div className="p-4 bg-gray-50/70 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-gray-700">Enrolled Students: {students.length}</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Present: {presentCount}
            </span>
            <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Absent: {absentCount}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll("present")}
              className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded shadow-sm"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("absent")}
              className="px-2.5 py-1 text-xs font-medium text-red-800 bg-white hover:bg-red-50 border border-red-300 rounded shadow-sm"
            >
              Mark All Absent
            </button>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
              className="flex items-center space-x-1.5 px-4 py-1 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded shadow-sm disabled:opacity-50 transition-colors ml-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Attendance"}</span>
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Roll Number</th>
                <th>Student Full Name</th>
                <th>Email Address</th>
                <th>Semester</th>
                <th className="text-center w-48">Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingStudents ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Loading enrolled student register...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No enrolled students found for this subject.
                  </td>
                </tr>
              ) : (
                students.map((st, idx) => {
                  const isPresent = (attendanceMap[st.student_id] || "present") === "present";
                  return (
                    <tr
                      key={st.student_id}
                      className={!isPresent ? "bg-red-50/30" : ""}
                    >
                      <td className="text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="font-mono font-bold text-gray-900">{st.roll_number}</td>
                      <td className="font-semibold text-gray-900">{st.full_name}</td>
                      <td className="text-gray-500 font-mono text-[11px]">{st.email}</td>
                      <td className="text-gray-600">Sem {st.semester_number || 6}</td>
                      <td className="text-center">
                        <div className="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, "present")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                              isPresent
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, "absent")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                              !isPresent
                                ? "bg-red-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save bar */}
        {students.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              Review and click Save Attendance to commit this session to database.
            </span>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Commit Attendance Records"}</span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
