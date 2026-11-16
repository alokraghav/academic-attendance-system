"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import { Check, X } from "lucide-react";

export default function FacultyLeaveRequestsPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [actionType, setActionType] = useState("approved");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/leave/requests");
      setLeaves(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleOpenReview = (leave, action) => {
    setReviewModal(leave);
    setActionType(action);
    setReviewRemarks(action === "approved" ? "Verified and approved by subject instructor." : "Rejected due to unverified documentation.");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await apiRequest(`/leave/${reviewModal.id}/review`, {
        method: "PUT",
        body: JSON.stringify({
          status: actionType,
          review_remarks: reviewRemarks,
        }),
      });
      setReviewModal(null);
      fetchLeaves();
    } catch (err) {
      alert(`Review failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["faculty", "admin"]}>
      <PageHeader
        title="Student Leave Application Approvals"
        subtitle="Review and evaluate student medical, academic, and emergency leave requests."
      />

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Full Name</th>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Instructor Remarks</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    Loading applications...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="font-mono font-semibold text-primary">{l.roll_number}</td>
                    <td className="font-semibold text-gray-900">{l.student_name}</td>
                    <td className="capitalize font-medium text-gray-700">{l.leave_type}</td>
                    <td className="text-gray-600">{l.start_date} to {l.end_date}</td>
                    <td className="max-w-xs truncate text-gray-700" title={l.reason}>{l.reason}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-gray-600 text-[11px]">{l.review_remarks || "—"}</td>
                    <td className="text-right">
                      {l.status === "pending" && (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenReview(l, "approved")}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenReview(l, "rejected")}
                            className="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-border shadow-xl max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 mb-3">
              {actionType === "approved" ? "Approve Student Leave" : "Reject Student Leave"}
            </h3>

            <div className="text-xs text-gray-600 space-y-1 mb-4 p-3 rounded bg-gray-50 border border-gray-100">
              <p><strong>Student:</strong> {reviewModal.student_name} ({reviewModal.roll_number})</p>
              <p><strong>Period:</strong> {reviewModal.start_date} to {reviewModal.end_date}</p>
              <p><strong>Reason:</strong> {reviewModal.reason}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Faculty Remarks
                </label>
                <textarea
                  rows="3"
                  required
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-1.5 text-white rounded text-xs font-semibold shadow-sm disabled:opacity-50 ${
                    actionType === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? "Submitting..." : actionType === "approved" ? "Confirm Approval" : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
