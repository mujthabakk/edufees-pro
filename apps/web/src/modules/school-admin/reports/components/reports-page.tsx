"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useDashboardStats, useMonthlyCollection, useClassWiseCollection, usePaymentModes, useQuotaWise } from "@/lib/api/hooks/useDomains";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const MODE_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#6366f1"];

export function ReportsPage() {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const statsQuery = useDashboardStats();
  const monthlyQuery = useMonthlyCollection();
  const classWiseQuery = useClassWiseCollection();
  const paymentModesQuery = usePaymentModes();
  const quotaWiseQuery = useQuotaWise();

  const s = statsQuery.data;
  const totalRevenue = s?.totalCollected ?? 0;
  const outstanding = s ? s.totalPending + s.totalOverdue : 0;
  const collectionRate = s ? `${s.collectionRate.toFixed(1)}%` : "0%";
  const avgPerStudent = s && s.totalStudents > 0 ? Math.round(s.totalCollected / s.totalStudents) : 0;

  const quickStats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "+12.4%", up: true },
    { label: "Avg Collection/Student", value: formatCurrency(avgPerStudent), change: "+5.2%", up: true },
    { label: "Outstanding", value: formatCurrency(outstanding), change: "-8.3%", up: false },
    { label: "Collection Rate", value: collectionRate, change: "+2.1%", up: true },
  ];

  const monthlyData = monthlyQuery.data ?? [];
  const classWiseData = classWiseQuery.data ?? [];
  const paymentModeData = (paymentModesQuery.data ?? []).map((m, i) => ({
    name: m.mode,
    value: m.percent,
    color: MODE_COLORS[i % MODE_COLORS.length],
  }));
  const quotaData = quotaWiseQuery.data ?? [];

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Reports & Analytics" subtitle="Financial insights · Greenfield Institute 2025-26" />
      <main className="flex-1 p-6 space-y-5">

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickStats.map(stat => (
            <Card key={stat.label} className="p-5">
              <p className="text-xs text-gray-500 uppercase font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change} vs last year
              </p>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Collection Trend</CardTitle>
              <Button variant="outline" size="sm" onClick={() => showToast("📥 Downloading report...")}><Download className="w-3.5 h-3.5" />Download</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="#4f46e5" fill="url(#colorCollected)" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Mode Split</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentModeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {paymentModeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${Number(v)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
                {paymentModeData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Class-wise Collection</CardTitle>
              <Button variant="outline" size="sm" onClick={() => showToast("📥 Downloading report...")}><Download className="w-3.5 h-3.5" />Download</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={classWiseData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <YAxis dataKey="class" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" name="Total" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quota-wise Collection</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quotaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card>
          <CardHeader><CardTitle>Generate Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Fee Collection Summary", desc: "Monthly/Annual breakdown", icon: "📊" },
                { name: "Defaulter List", desc: "Students with overdue fees", icon: "⚠️" },
                { name: "Class-wise Report", desc: "Collection by class & division", icon: "🏫" },
                { name: "Payment Mode Report", desc: "Cash, Online, Cheque split", icon: "💳" },
                { name: "Quota Report", desc: "SC/ST, Sports, Scholarship", icon: "📋" },
                { name: "Outstanding Report", desc: "Pending dues summary", icon: "⏳" },
                { name: "Coupon Usage Report", desc: "Discount redemption stats", icon: "🏷️" },
                { name: "Day Book", desc: "Daily collection ledger", icon: "📓" },
              ].map(report => (
                <button key={report.name} onClick={() => showToast(`📊 Generating "${report.name}"...`)} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group">
                  <span className="text-xl">{report.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{report.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{report.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
