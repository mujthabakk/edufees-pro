"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Building2, Users, IndianRupee, TrendingUp, Plus, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const schools = [
  { id: "1", name: "Greenfield Academy", city: "Bangalore", plan: "GROWTH", students: 1248, collected: 8450000, status: "ACTIVE", joinedAt: "Jan 2025" },
  { id: "2", name: "Sunrise International", city: "Mumbai", plan: "ENTERPRISE", students: 3420, collected: 28000000, status: "ACTIVE", joinedAt: "Feb 2024" },
  { id: "3", name: "Delhi Public School", city: "Delhi", plan: "STARTER", students: 580, collected: 3200000, status: "ACTIVE", joinedAt: "Jun 2025" },
  { id: "4", name: "St. Mary's Convent", city: "Chennai", plan: "FREE", students: 48, collected: 180000, status: "TRIAL", joinedAt: "May 2026" },
  { id: "5", name: "Oxford High School", city: "Pune", plan: "GROWTH", students: 920, collected: 6100000, status: "SUSPENDED", joinedAt: "Mar 2024" },
  { id: "6", name: "Kendriya Vidyalaya", city: "Hyderabad", plan: "ENTERPRISE", students: 2100, collected: 15000000, status: "ACTIVE", joinedAt: "Apr 2024" },
];

const growthData = [
  { month: "Jan", schools: 180, revenue: 3200000 },
  { month: "Feb", schools: 196, revenue: 3800000 },
  { month: "Mar", schools: 210, revenue: 4100000 },
  { month: "Apr", schools: 225, revenue: 4600000 },
  { month: "May", schools: 235, revenue: 5200000 },
  { month: "Jun", schools: 240, revenue: 5800000 },
];

const planColors: Record<string, string> = {
  FREE: "default", STARTER: "info", GROWTH: "success", ENTERPRISE: "warning",
};

export function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Super Admin Dashboard" subtitle="Platform overview across all schools" />
      <main className="flex-1 p-6 space-y-5">

        {/* Platform Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Schools", value: "240", change: "+12 this month", icon: Building2, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
            { label: "Total Students", value: "1,24,816", change: "+2,341 this month", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
            { label: "Platform Revenue", value: formatCurrency(5800000), change: "+18.4% MoM", icon: IndianRupee, iconBg: "bg-green-50", iconColor: "text-green-600" },
            { label: "Avg Collection Rate", value: "86.2%", change: "+1.8% vs last month", icon: TrendingUp, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
          ].map(stat => (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Subscription breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { plan: "Enterprise", count: 28, color: "bg-yellow-500", revenue: "₹42L/mo" },
            { plan: "Growth", count: 94, color: "bg-green-500", revenue: "₹28L/mo" },
            { plan: "Starter", count: 76, color: "bg-blue-500", revenue: "₹7.6L/mo" },
            { plan: "Free / Trial", count: 42, color: "bg-gray-400", revenue: "₹0" },
          ].map(p => (
            <Card key={p.plan} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${p.color}`} />
                <span className="text-sm font-semibold text-gray-900">{p.plan}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{p.count}</p>
              <p className="text-xs text-gray-500 mt-1">schools · {p.revenue}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Platform Growth — Schools</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="schools" name="Schools" stroke="#9333ea" strokeWidth={2.5} dot={{ fill: "#9333ea", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Monthly Platform Revenue</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="revenue" name="Revenue" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Schools Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Schools</CardTitle>
            <Button size="sm"><Plus className="w-4 h-4" />Onboard School</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["School", "City", "Plan", "Students", "Collected", "Status", "Joined", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schools.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                          {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{s.city}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={planColors[s.plan] as "default" | "info" | "success" | "warning"}>{s.plan}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{s.students.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(s.collected)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{s.joinedAt}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {s.status === "SUSPENDED" ? (
                          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Activate">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Suspend">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent alerts */}
        <Card>
          <CardHeader><CardTitle>Platform Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50", msg: "St. Mary's Convent trial expires in 3 days. Send upgrade reminder.", time: "2 hours ago" },
              { icon: XCircle, color: "text-red-500", bg: "bg-red-50", msg: "Oxford High School subscription suspended due to non-payment.", time: "Yesterday" },
              { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", msg: "Kendriya Vidyalaya upgraded to Enterprise plan. ₹8,400/mo.", time: "2 days ago" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: alert.bg.replace("bg-", "") }}>
                <div className={`${alert.bg} p-2 rounded-lg`}>
                  <alert.icon className={`w-4 h-4 ${alert.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{alert.msg}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
