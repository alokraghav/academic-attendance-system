import React from "react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "primary", alert = false }) {
  const colorStyles = {
    primary: "text-primary bg-primary-light border-primary/20",
    success: "text-status-success-text bg-status-success-bg border-status-success-border",
    warning: "text-status-warning-text bg-status-warning-bg border-status-warning-border",
    danger: "text-status-danger-text bg-status-danger-bg border-status-danger-border",
  };

  return (
    <div className={`bg-card rounded-lg border p-5 shadow-card transition-all ${alert ? "border-red-300 ring-1 ring-red-200" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${colorStyles[color] || colorStyles.primary}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
