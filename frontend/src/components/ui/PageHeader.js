import React from "react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-6 border-b border-gray-200">
      <div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="mt-3 sm:mt-0 flex items-center space-x-2.5">{actions}</div>}
    </div>
  );
}
