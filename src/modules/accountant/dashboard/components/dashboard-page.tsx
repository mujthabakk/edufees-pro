"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStats, mockRecentPayments } from "@/lib/mock-data";
import { IndianRupee, Clock, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Accountant Dashboard" subtitle="Fee collection overview · Greenfield Academy" />
      <main className="flex-1 p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Collected Today", value: formatCurrency(84500), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending This Month", value: formatCurrency(mockStats.totalPending), icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Overdue Amount", value: formatCurrency(mockStats.totalOverdue), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Collection Rate", value: `${mockStats.collectionRate}%`, icon: IndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Collections</CardTitle>
              <Button variant="outline" size="sm">Record Payment</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentPayments.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{p.studentName}</p>
                    <p className="text-xs text-gray-500">{p.class} · {p.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(p.amount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "Record Payment", href: "/accountant/payments" },
                { label: "Send Reminders", href: "/accountant/reminders" },
                { label: "View Defaulters", href: "/accountant/students" },
                { label: "Generate Report", href: "/accountant/reports" },
              ].map(a => (
                <Button key={a.label} variant="outline" className="justify-between h-auto py-3">
                  {a.label} <ArrowRight className="w-4 h-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
