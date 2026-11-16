"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { downloadReport } from "@/lib/api";
import { FileSpreadsheet, FileText, Download, CheckCircle2 } from "lucide-react";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState("");

  const handleDownload = async (type, format, endpoint, filename) => {
    setDownloading(`${type}-${format}`);
    try {
      await downloadReport(`${endpoint}?format=${format}`, filename);
    } finally {
      setDownloading("");
    }
  };

  const reports = [
    {
      id: "student",
      title: "Student Attendance Master Report",
      description: "Complete student breakdown including conducted classes, attended classes, missed classes, overall percentage, and defaulter status.",
      endpoint: "/reports/student",
      filename: "Student_Attendance_Report",
    },
    {
      id: "defaulter",
      title: "Official Defaulter Report (Attendance < 75%)",
      description: "Official university compliance report listing all students below 75.00% attendance and exact additional lectures required to reach 75%.",
      endpoint: "/reports/defaulters",
      filename: "Defaulter_Attendance_Report",
      highlight: true,
    },
    {
      id: "subject",
      title: "Subject-wise Attendance Distribution",
      description: "Comprehensive subject-level attendance analysis across all enrolled students and course curriculum modules.",
      endpoint: "/reports/subject",
      filename: "Subject_Wise_Attendance_Report",
    },
    {
      id: "date",
      title: "Date-wise Class Session Audit Report",
      description: "Chronological class attendance audit detailing timestamped sessions, individual roll calls, and faculty instructor notes.",
      endpoint: "/reports/date-wise",
      filename: "Date_Wise_Attendance_Audit",
    },
    {
      id: "faculty",
      title: "Faculty Teaching Workload & Sessions Report",
      description: "Department faculty lecture summary, active subject allocations, and total verified classroom sessions conducted.",
      endpoint: "/reports/faculty",
      filename: "Faculty_Teaching_Report",
    },
    {
      id: "leave",
      title: "Student Leave Applications Summary",
      description: "Record of medical, academic, and personal leave applications, sanctioned durations, reviewer identity, and remarks.",
      endpoint: "/reports/leave",
      filename: "Student_Leave_Applications_Report",
    },
  ];

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Academic Reports & Institutional Analytics Hub"
        subtitle="Export university compliance reports generated via backend Python Pandas & openpyxl services."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className={`bg-white rounded-lg border p-5 shadow-card flex flex-col justify-between ${
              rep.highlight ? "border-red-200 ring-1 ring-red-100 bg-red-50/20" : "border-border"
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                {rep.highlight && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                    Mandatory Audit
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-text-primary">{rep.title}</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500">Python Service</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleDownload(
                      rep.id,
                      "excel",
                      rep.endpoint,
                      `${rep.filename}_${new Date().toISOString().split("T")[0]}.xlsx`
                    )
                  }
                  disabled={Boolean(downloading)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === `${rep.id}-excel` ? "Exporting..." : "Excel (.xlsx)"}</span>
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      rep.id,
                      "csv",
                      rep.endpoint,
                      `${rep.filename}_${new Date().toISOString().split("T")[0]}.csv`
                    )
                  }
                  disabled={Boolean(downloading)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading === `${rep.id}-csv` ? "Exporting..." : "CSV (.csv)"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
