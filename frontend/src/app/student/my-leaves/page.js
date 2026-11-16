"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import { PlusCircle } from "lucide-react";

export default function StudentMyLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiRequest("/leave/my-leaves");
        setLeaves(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <PageHeader
        title="My Submitted Leave Applications"
        subtitle="Track verification status, review remarks, and sanctioned leave periods."
        actions={
          <a
            href="/student/apply-leave"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply New Leave</span>
          </a>
        }
      />

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Leave Category</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Feedback</th>
                <th>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    Loading applications...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    You have not submitted any leave applications.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold text-gray-900 capitalize">{l.leave_type} Leave</td>
                    <td className="text-gray-700">{l.start_date}</td>
                    <td className="text-gray-700">{l.end_date}</td>
                    <td className="max-w-xs truncate text-gray-700" title={l.reason}>{l.reason}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="text-gray-600 text-[11px]">
                      {l.review_remarks ? (
                        <div>
                          <span className="font-semibold">{l.reviewer_name || "Faculty"}: </span>
                          <span>{l.review_remarks}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Pending review</span>
                      )}
                    </td>
                    <td className="text-gray-500 text-[11px]">{new Date(l.created_at).toLocaleDateString()}</td>
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
