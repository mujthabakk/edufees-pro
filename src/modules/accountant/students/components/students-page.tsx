"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStudents } from "@/lib/mock-data";
import { Search, Phone, Bell } from "lucide-react";

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = mockStudents.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.admissionNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || s.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Students" subtitle="Fee status by student" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            {["All", "PAID", "PARTIAL", "PENDING", "OVERDUE"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student", "Admission No", "Class", "Total Fee", "Paid", "Due", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.parentEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono">{s.admissionNo}</td>
                    <td className="px-5 py-3.5 text-sm">{s.class} - {s.division}</td>
                    <td className="px-5 py-3.5 text-sm">{formatCurrency(s.totalFee)}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600">{formatCurrency(s.paidAmount)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-red-600">{formatCurrency(s.totalFee - s.paidAmount)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Phone className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Bell className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
