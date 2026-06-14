"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useTeacherStudents } from "@/lib/api/hooks/usePortal";
import { Users, CheckCircle, Clock, AlertTriangle, Phone, Mail } from "lucide-react";

export function DashboardPage() {
  const { data: students = [] } = useTeacherStudents();

  const paid = students.filter(s => s.balance <= 0 && s.totalFee > 0).length;
  const pending = students.filter(s => s.balance > 0 && s.paidAmount > 0).length;
  const overdue = students.filter(s => s.balance > 0 && s.paidAmount === 0).length;

  const classLabel = students[0]
    ? `${students[0].className ?? "Class"}${students[0].divisionName ? ` - ${students[0].divisionName}` : ""}`
    : "My Class";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Dashboard" subtitle={`${classLabel} · Greenfield Academy`} />
      <main className="flex-1 p-6 space-y-5">

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <p className="text-orange-100 text-sm mb-1">Good morning,</p>
          <h2 className="text-2xl font-bold mb-1">Priya Teacher 👋</h2>
          <p className="text-orange-100 text-sm">Class Teacher · {classLabel} · {students.length} students enrolled</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "My Students", value: students.length, icon: Users, bg: "bg-orange-50", color: "text-orange-600" },
            { label: "Fees Paid", value: paid, icon: CheckCircle, bg: "bg-green-50", color: "text-green-600" },
            { label: "Pending / Partial", value: pending, icon: Clock, bg: "bg-yellow-50", color: "text-yellow-600" },
            { label: "Overdue", value: overdue, icon: AlertTriangle, bg: "bg-red-50", color: "text-red-600" },
          ].map(stat => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">ℹ️</div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Read-only fee view</p>
            <p className="text-xs text-blue-700">As a teacher, you can view your class students&apos; fee status but cannot record payments. Contact the accountant for payment issues.</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>{classLabel} · Student Fee Status</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student", "Admission No", "Total Fee", "Paid", "Balance", "Status", "Contact"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No students assigned to your class.</td></tr>
                )}
                {students.map((s) => {
                  const status = s.balance <= 0 ? "PAID" : s.paidAmount > 0 ? "PARTIAL" : "OVERDUE";
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold">
                            {s.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{s.admissionNo}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{formatCurrency(s.totalFee)}</td>
                      <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{formatCurrency(s.paidAmount)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: s.balance > 0 ? "#dc2626" : "#16a34a" }}>
                        {formatCurrency(s.balance)}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <span className="p-1.5 text-gray-300 rounded"><Phone className="w-3.5 h-3.5" /></span>
                          <span className="p-1.5 text-gray-300 rounded"><Mail className="w-3.5 h-3.5" /></span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{classLabel} · Collection Progress</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all" style={{ width: `${(paid / students.length) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-900 w-12">{Math.round((paid / students.length) * 100)}%</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-lg font-bold text-green-700">{paid}</p>
                <p className="text-xs text-green-600">Fully Paid</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-lg font-bold text-yellow-700">{pending}</p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-lg font-bold text-red-700">{overdue}</p>
                <p className="text-xs text-red-600">Overdue</p>
              </div>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
