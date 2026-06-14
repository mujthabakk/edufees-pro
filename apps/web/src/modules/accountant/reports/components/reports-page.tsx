"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  useDashboardStats,
  useMonthlyCollection,
  useClassWiseCollection,
  usePaymentModes,
  useQuotaWise,
} from "@/lib/api/hooks/useDomains";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const MODE_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

export function ReportsPage() {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: stats } = useDashboardStats();
  const { data: monthly } = useMonthlyCollection();
  const { data: classWise } = useClassWiseCollection();
  const { data: paymentModes } = usePaymentModes();
  const { data: quotaWise } = useQuotaWise();

  const monthlyData = monthly ?? [];
  const classWiseData = classWise ?? [];
  const quotaData = quotaWise ?? [];
  const paymentModeData = (paymentModes ?? []).map((m, i) => ({
    name: m.mode,
    value: m.percent,
    color: MODE_COLORS[i % MODE_COLORS.length],
  }));

  const totalRevenue = stats?.totalCollected ?? 0;
  const avgPerStudent = stats && stats.totalStudents > 0
    ? Math.round(stats.totalCollected / stats.totalStudents) : 0;
  const outstanding = (stats?.totalPending ?? 0) + (stats?.totalOverdue ?? 0);
  const collectionRate = (stats?.collectionRate ?? 0).toFixed(1);

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Financial Reports" subtitle="Collection analytics · Greenfield Institute 2025-26" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "+12.4%", up: true },
            { label: "Avg / Student", value: formatCurrency(avgPerStudent), change: "+5.2%", up: true },
            { label: "Outstanding", value: formatCurrency(outstanding), change: "-8.3%", up: false },
            { label: "Collection Rate", value: `${collectionRate}%`, change: "+2.1%", up: true },
          ].map(stat => (
            <Card key={stat.label} className="p-5">
              <p className="text-xs text-gray-500 uppercase font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${stat.up?"text-green-600":"text-red-600"}`}>
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
              <Button variant="outline" size="sm" onClick={() => showToast("📥 Downloading...")}><Download className="w-3.5 h-3.5" />Download</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="#4f46e5" fill="url(#aGrad)" strokeWidth={2} />
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
                    {paymentModeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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

        {/* Class-wise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Class-wise Collection</CardTitle>
              <Button variant="outline" size="sm" onClick={() => showToast("📥 Downloading...")}><Download className="w-3.5 h-3.5" />Export</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={classWiseData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:11 }} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
                  <YAxis dataKey="class" type="category" tick={{ fontSize:11 }} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[0,4,4,0]} />
                  <Bar dataKey="total" name="Total" fill="#e5e7eb" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Class-wise Details</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Class","Total","Collected","Pending","Rate"].map(h=>(
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classWiseData.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No collection data yet.</td></tr>}
                  {classWiseData.map(c => (
                    <tr key={c.class} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-sm font-medium">{c.class}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(c.total)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{formatCurrency(c.collected)}</td>
                      <td className="px-4 py-3 text-sm text-red-500">{formatCurrency(c.total - c.collected)}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{c.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Quota-wise */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quota-wise Collection</CardTitle>
            <Button variant="outline" size="sm" onClick={() => showToast("📥 Downloading...")}><Download className="w-3.5 h-3.5" />Export</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quotaData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11 }} />
                <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="total" name="Total" fill="#e5e7eb" radius={[4,4,0,0]} />
                <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            {quotaData.length===0 && <p className="text-center text-gray-400 text-sm pb-2">No quota data yet.</p>}
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card>
          <CardHeader><CardTitle>Generate Reports</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Day Book", desc: "Daily collection ledger", icon: "📓" },
                { name: "Defaulter List", desc: "Students with overdue fees", icon: "⚠️" },
                { name: "Class-wise Report", desc: "Collection by class", icon: "🏫" },
                { name: "Payment Mode Report", desc: "Cash, Online, Cheque split", icon: "💳" },
                { name: "Quota Report", desc: "SC/ST, Sports, Scholarship", icon: "📋" },
                { name: "Outstanding Report", desc: "Pending dues summary", icon: "⏳" },
                { name: "Fee Collection Summary", desc: "Monthly/Annual breakdown", icon: "📊" },
                { name: "Annual Report", desc: "Full year financial overview", icon: "📅" },
              ].map(r => (
                <button key={r.name} onClick={() => showToast(`📊 Generating "${r.name}"...`)}
                  className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group">
                  <span className="text-xl">{r.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{r.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
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
