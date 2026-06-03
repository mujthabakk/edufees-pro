"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStudents } from "@/lib/mock-data";
import { Search, Filter, Plus, Download, Phone, Mail, MoreHorizontal, Eye } from "lucide-react";

const CLASSES = ["All Classes", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const STATUSES = ["All", "PAID", "PARTIAL", "PENDING", "OVERDUE"];

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockStudents.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All Classes" || s.class === classFilter;
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Students" subtitle={`${mockStudents.length} students enrolled`} />
      <main className="flex-1 p-6 space-y-4">

        {/* Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or admission no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
            <Button size="sm"><Plus className="w-4 h-4" />Add Student</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: mockStudents.length, color: "text-gray-900" },
            { label: "Paid", value: mockStudents.filter(s => s.status === "PAID").length, color: "text-green-600" },
            { label: "Partial", value: mockStudents.filter(s => s.status === "PARTIAL").length, color: "text-blue-600" },
            { label: "Overdue", value: mockStudents.filter(s => s.status === "OVERDUE").length, color: "text-red-600" },
          ].map(stat => (
            <Card key={stat.label} className="p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student", "Admission No", "Class", "Quota", "Contact", "Total Fee", "Paid", "Balance", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const balance = s.totalFee - s.paidAmount;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.fullName.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.admissionNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.class} - {s.division}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.quota}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a href={`tel:${s.parentMobile}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a href={`mailto:${s.parentEmail}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(s.totalFee)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{formatCurrency(s.paidAmount)}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: balance > 0 ? "#dc2626" : "#16a34a" }}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">No students found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
