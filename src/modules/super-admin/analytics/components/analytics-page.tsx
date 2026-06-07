"use client";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { TrendingUp, TrendingDown, Users, Building2, CreditCard, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const growth = [
  { month: "Jan", institutes: 48, users: 1820, revenue: 185000 },
  { month: "Feb", institutes: 51, users: 1980, revenue: 210000 },
  { month: "Mar", institutes: 53, users: 2100, revenue: 230000 },
  { month: "Apr", institutes: 56, users: 2340, revenue: 258000 },
  { month: "May", institutes: 60, users: 2610, revenue: 285000 },
  { month: "Jun", institutes: 63, users: 2820, revenue: 312000 },
];

const retention = [
  { month: "Jan", rate: 96 }, { month: "Feb", rate: 97 }, { month: "Mar", rate: 95 },
  { month: "Apr", rate: 98 }, { month: "May", rate: 97 }, { month: "Jun", rate: 99 },
];

const planDist = [
  { name: "Enterprise", value: 5, fill: "#7c3aed" },
  { name: "Growth", value: 18, fill: "#6366f1" },
  { name: "Starter", value: 28, fill: "#3b82f6" },
  { name: "Free", value: 12, fill: "#9ca3af" },
];

const topSchools = [
  { name: "Delhi Modern School", students: 1240, collection: 9800000, plan: "Enterprise" },
  { name: "Greenfield Academy", students: 630, collection: 5200000, plan: "Growth" },
  { name: "KV Andheri", students: 420, collection: 3100000, plan: "Starter" },
  { name: "Sunrise Public School", students: 310, collection: 2400000, plan: "Starter" },
  { name: "Ryan International", students: 890, collection: 7200000, plan: "Growth" },
];

export function AnalyticsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Platform Analytics" subtitle="Growth, revenue, and engagement metrics" />
      <main className="flex-1 p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Institutes", value: "63", change: "+5 this month", up: true, icon: Building2, color: "bg-purple-50 text-purple-600" },
            { label: "Total Users", value: "2,820", change: "+210 this month", up: true, icon: Users, color: "bg-indigo-50 text-indigo-600" },
            { label: "Platform MRR", value: "₹3,12,000", change: "+9.5% vs last month", up: true, icon: CreditCard, color: "bg-green-50 text-green-600" },
            { label: "Churn Rate", value: "1.2%", change: "-0.3% vs last month", up: false, icon: Activity, color: "bg-red-50 text-red-600" },
          ].map(({ label, value, change, up, icon: Icon, color }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-green-600" : "text-red-500"}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{change}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Growth Chart */}
        <Card>
          <CardHeader><CardTitle>Platform Growth (Institutes + Users)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="institutes" stroke="#7c3aed" fill="#ede9fe" name="Institutes" />
                <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#e0e7ff" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-5">
          {/* Revenue trend */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={growth}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Plan distribution */}
          <Card>
            <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                    {planDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Retention */}
        <div className="grid grid-cols-3 gap-5">
          <Card>
            <CardHeader><CardTitle>Retention Rate (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={retention}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [`${v}%`, "Retention"]} />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top schools */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>Top Schools by Collection</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {topSchools.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.students} students · {s.plan}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">₹{(s.collection / 100000).toFixed(1)}L</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
