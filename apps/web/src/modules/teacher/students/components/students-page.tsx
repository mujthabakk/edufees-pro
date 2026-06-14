"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { useTeacherStudents } from "@/lib/api/hooks/usePortal";
import { Search, Users } from "lucide-react";

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const { data: students = [], isLoading } = useTeacherStudents();

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  const paid = students.filter(s => s.balance <= 0 && s.totalFee > 0).length;
  const classLabel = students[0]
    ? `${students[0].className ?? ""}${students[0].divisionName ? ` - ${students[0].divisionName}` : ""}`.trim()
    : "—";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Students" subtitle={`${classLabel} · Read-only fee view`} />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-xs text-gray-500">Total Students</p><p className="text-2xl font-bold text-gray-900">{students.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500">Fee Cleared</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{paid}/{students.length || 0}</p>
            {students.length > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${(paid / students.length) * 100}%` }} /></div>
            )}
          </Card>
          <Card className="p-5 bg-orange-50 border-orange-200">
            <p className="text-xs text-orange-700">Note</p>
            <p className="text-sm text-orange-800 mt-1">Read-only fee status. Contact the accountant for payment actions.</p>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or admission no..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">Loading students...</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Name", "Admission No", "Class", "Total Fee", "Paid", "Balance", "Status"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No students assigned to your class</td></tr>
                  )}
                  {filtered.map(s => {
                    const status = s.balance <= 0 ? "PAID" : s.paidAmount > 0 ? "PARTIAL" : "PENDING";
                    return (
                      <tr key={s.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.fullName}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{s.className}{s.divisionName ? ` - ${s.divisionName}` : ""}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">₹{s.totalFee.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{s.paidAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-red-600">{s.balance > 0 ? `₹${s.balance.toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
