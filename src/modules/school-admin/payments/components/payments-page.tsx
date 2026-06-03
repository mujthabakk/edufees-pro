"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockRecentPayments } from "@/lib/mock-data";
import { Plus, Search, Download, Filter, Receipt } from "lucide-react";

const allPayments = [
  ...mockRecentPayments,
  { id: "6", studentName: "Aisha Khan", admissionNo: "ADM-2024-006", class: "Class 11 - B", amount: 20000, mode: "NEFT", date: "2026-05-28", status: "PAID" },
  { id: "7", studentName: "Rohan Gupta", admissionNo: "ADM-2024-007", class: "Class 7 - A", amount: 5000, mode: "CASH", date: "2026-05-27", status: "PARTIAL" },
  { id: "8", studentName: "Meera Singh", admissionNo: "ADM-2024-008", class: "Class 5 - B", amount: 32000, mode: "ONLINE", date: "2026-05-26", status: "PAID" },
];

export function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("All");

  const filtered = allPayments.filter(p =>
    (p.studentName.toLowerCase().includes(search.toLowerCase()) || p.admissionNo.toLowerCase().includes(search.toLowerCase())) &&
    (mode === "All" || p.mode === mode)
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payments" subtitle="Record and track fee collections" />
      <main className="flex-1 p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">Today&apos;s Collection</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(27000)}</p>
            <p className="text-xs text-green-600 mt-1">3 transactions</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(845000)}</p>
            <p className="text-xs text-indigo-600 mt-1">142 transactions</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">Online vs Offline</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">63% / 37%</p>
            <p className="text-xs text-gray-500 mt-1">Online adoption growing</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
          >
            {["All", "CASH", "CHEQUE", "NEFT", "UPI", "ONLINE"].map(m => <option key={m}>{m}</option>)}
          </select>
          <Button variant="outline" size="sm"><Download className="w-4 h-4" />Export</Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Record Payment</Button>
        </div>

        {/* Record Payment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Record New Payment</CardTitle>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Student (Admission No / Name)</label>
                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search student..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount (₹)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Mode</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {["CASH", "CHEQUE", "NEFT", "UPI", "ONLINE"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Date</label>
                    <input type="date" defaultValue="2026-06-02" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Reference No</label>
                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cheque / Transaction ID" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
                    <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional notes..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={() => setShowForm(false)}>
                    <Receipt className="w-4 h-4" />Record & Generate Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student", "Admission No", "Class", "Amount", "Mode", "Reference", "Date", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {p.studentName.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{p.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.admissionNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.class}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{p.mode}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">—</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <Receipt className="w-3 h-3" />Invoice
                      </button>
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
