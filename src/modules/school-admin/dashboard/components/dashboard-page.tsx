"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStats, mockRecentPayments, mockMonthlyCollection, mockClassWiseCollection } from "@/lib/mock-data";
import { Users, IndianRupee, AlertTriangle, TrendingUp, ArrowRight, Plus, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function DashboardPage() {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Dashboard" subtitle="Greenfield Institute · Academic Year 2025-26" />
      <main className="flex-1 p-6 space-y-5">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button onClick={() => router.push("/students")} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4" />Add Student</Button>
          <Button onClick={() => router.push("/payments")} variant="outline"><IndianRupee className="w-4 h-4" />Record Payment</Button>
          <Button onClick={() => router.push("/invoices")} variant="outline"><ArrowRight className="w-4 h-4" />Generate Invoice</Button>
          <Button onClick={() => { showToast("📣 Reminder sent to 156 students with pending fees!"); }} variant="outline"><Bell className="w-4 h-4" />Send Reminders</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Students" value={mockStats.totalStudents.toLocaleString()} change="+48 this month" changeType="up" icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
          <StatCard title="Total Collected" value={formatCurrency(mockStats.totalCollected)} change="+12.4% vs last month" changeType="up" icon={IndianRupee} iconBg="bg-green-50" iconColor="text-green-600" />
          <StatCard title="Pending Dues" value={formatCurrency(mockStats.totalPending)} change="156 students" changeType="neutral" icon={AlertTriangle} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
          <StatCard title="Collection Rate" value={`${mockStats.collectionRate}%`} change="+2.1% vs last month" changeType="up" icon={TrendingUp} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle>Monthly Collection</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockMonthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Class-wise Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mockClassWiseCollection.slice(0, 5).map(c => (
                <div key={c.class}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{c.class}</span>
                    <span className="font-medium">{c.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push("/payments")}>View All <ArrowRight className="w-3.5 h-3.5" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student", "Class", "Amount", "Mode", "Date", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRecentPayments.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{p.studentName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.class}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.mode}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{p.date}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
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
