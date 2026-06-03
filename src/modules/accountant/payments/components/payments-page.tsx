"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockRecentPayments } from "@/lib/mock-data";
import { Plus, Search, Receipt } from "lucide-react";

export function PaymentsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockRecentPayments.filter(p =>
    p.studentName.toLowerCase().includes(search.toLowerCase()) ||
    p.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payments" subtitle="Record and manage fee payments" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <Button><Plus className="w-4 h-4" />Record Payment</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Payment Records</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student", "Admission No", "Class", "Amount", "Mode", "Date", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-medium">{p.studentName}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-500">{p.admissionNo}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.class}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 text-sm">{p.mode}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{p.date}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5"><button className="p-1.5 text-gray-400 hover:text-indigo-600"><Receipt className="w-3.5 h-3.5" /></button></td>
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
