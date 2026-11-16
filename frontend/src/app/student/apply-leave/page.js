"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentApplyLeavePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leave_type: "medical",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    reason: "",
    document_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("End date cannot be prior to start date.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/leave/apply", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Leave application submitted successfully. Redirecting to your leave status...");
      setTimeout(() => {
        router.push("/student/my-leaves");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <PageHeader
        title="Apply for Student Leave"
        subtitle="Submit medical, academic, emergency, or personal leave applications to department faculty."
      />

      <div className="max-w-2xl bg-white rounded-lg border border-border p-6 shadow-card">
        {success && (
          <div className="mb-4 p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Leave Category</label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="w-full font-medium"
            >
              <option value="medical">Medical / Health Leave</option>
              <option value="academic">Academic / Hackathon / University Event</option>
              <option value="personal">Personal / Family Function</option>
              <option value="emergency">Emergency Absence</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Leave Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Leave End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Reason for Absence</label>
            <textarea
              rows="4"
              required
              placeholder="State clear reasons (e.g., medical symptoms, doctor prescription, participating in zonal competition, etc.)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Supporting Document URL <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/your-medical-certificate"
              value={formData.document_url}
              onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
            <a
              href="/student"
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-1.5 px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting Application..." : "Submit Leave Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
