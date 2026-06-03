"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockMonthlyCollection, mockClassWiseCollection } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Financial Reports" subtitle="Collection reports and analytics" />
      <main className="flex-1 p-6 space-y-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Collection</CardTitle>
            <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" />Export PDF</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockMonthlyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Class-wise Collection</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Class", "Total", "Collected", "Pending", "Rate"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockClassWiseCollection.map(c => (
                  <tr key={c.class} className="border-b border-gray-50">
                    <td className="px-5 py-3.5 text-sm font-medium">{c.class}</td>
                    <td className="px-5 py-3.5 text-sm">{formatCurrency(c.total)}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{formatCurrency(c.collected)}</td>
                    <td className="px-5 py-3.5 text-sm text-red-600">{formatCurrency(c.total - c.collected)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{c.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-3">
          {["Day Book", "Defaulter List", "Payment Mode Report", "Outstanding Summary"].map(r => (
            <Button key={r} variant="outline" className="h-auto py-4 flex-col gap-1">
              <Download className="w-4 h-4" />
              <span className="text-xs">{r}</span>
            </Button>
          ))}
        </div>
      </main>
    </div>
  );
}
