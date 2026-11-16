"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { Search, Plus, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    roll_number: "",
    registration_number: "",
    full_name: "",
    email: "",
    password: "Student@123",
    phone: "",
    batch_year: "2024-2027",
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = search ? `/students?search=${encodeURIComponent(search)}` : "/students";
      const res = await apiRequest(url);
      setStudents(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest("/students", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Student successfully registered in ERP system.");
      setFormData({
        roll_number: "",
        registration_number: "",
        full_name: "",
        email: "",
        password: "Student@123",
        phone: "",
        batch_year: "2024-2027",
      });
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.message || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to remove student "${studentName}"?`)) return;
    try {
      await apiRequest(`/students/${studentId}`, { method: "DELETE" });
      fetchStudents();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Student Enrollment & Records"
        subtitle="Manage enrolled students, registration numbers, batch details, and profiles."
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        }
      />

      {success && (
        <div className="mb-4 p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-lg border border-border p-4 mb-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Roll No, Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{students.length}</span> enrolled students
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Registration No</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Batch</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Loading student database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id}>
                    <td className="font-mono font-semibold text-primary">{st.roll_number}</td>
                    <td className="font-mono text-gray-600">{st.registration_number}</td>
                    <td className="font-semibold text-gray-900">{st.full_name}</td>
                    <td className="text-gray-600">{st.email}</td>
                    <td className="text-gray-700">{st.course_name || "BCA"}</td>
                    <td className="text-gray-700">Sem {st.semester_number || 6}</td>
                    <td className="text-gray-600">{st.batch_year}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(st.id, st.full_name)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-border shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add New Student</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alok Raghav"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="2024BCA026"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    placeholder="REG2024BCA0026"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="student26@smartacademic.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Batch Year</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_year}
                    onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Default Password</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
