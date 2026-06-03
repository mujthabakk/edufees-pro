"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockStudents } from "@/lib/mock-data";
import { Bell, Send, MessageCircle, Mail } from "lucide-react";

const defaulters = mockStudents.filter(s => s.status === "OVERDUE" || s.status === "PARTIAL" || s.status === "PENDING");

export function RemindersPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Reminders" subtitle="Send payment reminders to parents" />
      <main className="flex-1 p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5"><p className="text-xs text-gray-500">Pending Reminders</p><p className="text-2xl font-bold">{defaulters.length}</p></Card>
          <Card className="p-5"><p className="text-xs text-gray-500">Sent This Week</p><p className="text-2xl font-bold">34</p></Card>
          <Card className="p-5"><p className="text-xs text-gray-500">Response Rate</p><p className="text-2xl font-bold">68%</p></Card>
        </div>

        <div className="flex gap-2">
          <Button disabled={selected.length === 0}><MessageCircle className="w-4 h-4" />Send WhatsApp ({selected.length})</Button>
          <Button variant="outline" disabled={selected.length === 0}><Mail className="w-4 h-4" />Send Email ({selected.length})</Button>
          <Button variant="outline"><Bell className="w-4 h-4" />Send to All Defaulters</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Students with Pending Dues</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="px-5 py-3"><input type="checkbox" onChange={e => setSelected(e.target.checked ? defaulters.map(s => s.id) : [])} /></th>
                  {["Student", "Class", "Total Fee", "Paid", "Due", "Status", "Last Reminder"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {defaulters.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} /></td>
                    <td className="px-5 py-3.5 text-sm font-medium">{s.fullName}</td>
                    <td className="px-5 py-3.5 text-sm">{s.class} - {s.division}</td>
                    <td className="px-5 py-3.5 text-sm">{formatCurrency(s.totalFee)}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600">{formatCurrency(s.paidAmount)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-red-600">{formatCurrency(s.totalFee - s.paidAmount)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5"><Badge variant="info">2 days ago</Badge></td>
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
