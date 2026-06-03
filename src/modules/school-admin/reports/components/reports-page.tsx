"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockMonthlyCollection, mockClassWiseCollection } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const PAYMENT_MODE_DATA = [
  { name: "Online", value: 42, color: "#4f46e5" },
  { name: "UPI", value: 21, color: "#06b6d4" },
  { name: "Cash", value: 18, color: "#f59e0b" },
  { name: "NEFT", value: 12, color: "#10b981" },
  { name: "Cheque", value: 7, color: "#8b5cf6" },
];

const QUOTA_DATA = [
  { name: "General", students: 820, collected: 6200000 },
  { name: "SC/ST", students: 180, collected: 800000 },
  { name: "Sports", students: 95, collected: 650000 },
  { name: "Scholarship", students: 78, collected: 350000 },
  { name: "Management", students: 75, collected: 450000 },
];

export function ReportsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reports & Analytics" subtitle="Financial insights for Academic Year 2025-26" />
      <main className="flex-1 p-6 space-y-5">

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(9680000), change: "+12.4%", up: true },
            { label: "Avg Collection/Student", value: formatCurrency(7757), change: "+5.2%", up: true },
            { label: "Outstanding", value: formatCurrency(1570000), change: "-8.3%", up: false },
            { label: "Collection Rate", value: "87.3%", change: "+2.1%", up: true },
          ].map(stat => (
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
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Collection Trend</CardTitle>
              <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" />Download</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockMonthlyCollection}>
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
                  <Pie data={PAYMENT_MODE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {PAYMENT_MODE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${Number(v)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
                {PAYMENT_MODE_DATA.map(d => (
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
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Class-wise Collection</CardTitle>
              <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5" />Download</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockClassWiseCollection} layout="vertical" barSize={14}>
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
                <BarChart data={QUOTA_DATA}>
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
            <div className="grid grid-cols-4 gap-3">
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
                <button key={report.name} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group">
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
