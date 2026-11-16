"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest } from "@/lib/api";
import { UserCheck, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/users");
      setUsers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await apiRequest(`/users/${userId}/status?is_active=${!currentStatus}`, {
        method: "PUT",
      });
      setMsg(`User account status updated successfully.`);
      fetchUsers();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    const newPass = prompt(`Enter new password for ${userEmail}:`, "DefaultPass@123");
    if (!newPass) return;
    try {
      await apiRequest(`/users/${userId}/reset-password?new_password=${encodeURIComponent(newPass)}`, {
        method: "PUT",
      });
      alert(`Password successfully updated for ${userEmail}.`);
    } catch (err) {
      alert(`Password reset failed: ${err.message}`);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="System User Accounts & Authorization"
        subtitle="Manage authentication credentials, activate/deactivate accounts, and enforce role permissions."
      />

      {msg && (
        <div className="mb-4 p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Phone</th>
                <th>Account Status</th>
                <th>Created At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    Loading system user accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-gray-900">{u.full_name}</td>
                    <td className="font-mono text-gray-600">{u.email}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-light text-primary border border-primary/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="text-gray-600">{u.phone || "—"}</td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleResetPassword(u.id, u.email)}
                          className="px-2 py-1 text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5 inline mr-1 text-gray-500" />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          className={`px-2 py-1 text-[11px] font-medium rounded border ${
                            u.is_active
                              ? "text-red-700 bg-red-50 border-red-200 hover:bg-red-100"
                              : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                      </div>
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
