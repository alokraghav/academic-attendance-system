import React from "react";

export function StatusBadge({ status }) {
  const s = String(status).toLowerCase();
  
  if (s === "present" || s === "approved" || s === "active" || s === "completed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-status-success-bg text-status-success-text border border-status-success-border">
        {status.toUpperCase()}
      </span>
    );
  }

  if (s === "absent" || s === "rejected" || s === "defaulter" || s === "cancelled") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-status-danger-bg text-status-danger-text border border-status-danger-border">
        {status.toUpperCase()}
      </span>
    );
  }

  if (s === "pending" || s === "warning" || s === "scheduled") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-status-warning-bg text-status-warning-text border border-status-warning-border">
        {status.toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
      {status}
    </span>
  );
}

export function DefaulterBadge({ isDefaulter, percentage }) {
  if (isDefaulter) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-status-danger-bg text-status-danger-text border border-status-danger-border">
        DEFAULTER ({percentage}%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-status-success-bg text-status-success-text border border-status-success-border">
      REGULAR ({percentage}%)
    </span>
  );
}
