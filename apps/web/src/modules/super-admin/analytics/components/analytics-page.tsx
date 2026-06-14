"use client";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { usePlatformStats, usePlatformAnalytics } from "@/lib/api/hooks/useSuperAdmin";
import { useSchools } from "@/lib/api/hooks/useDomains";
import { TrendingUp, Users, Building2, CreditCard } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const planFills: Record<string, string> = {
  ENTERPRISE: "#7c3aed",
  GROWTH: "#6366f1",
  STARTER: "#3b82f6",
  FREE: "#9ca3af",
};

export function AnalyticsPage() {
  const statsQuery = usePlatformStats();
  const analyticsQuery = usePlatformAnalytics();
  const schoolsQuery = useSchools({ pageSize: 100 });

  const stats = statsQuery.data;
  const growth = analyticsQuery.data?.growth ?? [];
  const planDist = (analyticsQuery.data?.planDistribution ?? []).map(p => ({
    name: p.plan,
    value: p.count,
    fill: planFills[p.plan.toUpperCase()] ?? "#9ca3af",
  }));
  const topSchools = [...(schoolsQuery.data?.data ?? [])]
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Platform Analytics" subtitle="Growth, revenue, and engagement metrics" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Institutes", value: (stats?.totalSchools ?? 0).toString(), change: `${stats?.activeSchools ?? 0} active`, icon: Building2, color: "bg-purple-50 text-purple-600" },
            { label: "Total Users", value: (stats?.totalUsers ?? 0).toLocaleString(), change: `${stats?.totalStudents ?? 0} students`, icon: Users, color: "bg-indigo-50 text-indigo-600" },
            { label: "Platform MRR", value: `₹${(stats?.mrr ?? analyticsQuery.data?.mrr ?? 0).toLocaleString()}`, change: "Monthly recurring", icon: CreditCard, color: "bg-green-50 text-green-600" },
            { label: "Suspended", value: (stats?.suspendedSchools ?? 0).toString(), change: "Institutes", icon: TrendingUp, color: "bg-red-50 text-red-600" },
          ].map(({ label, value, change, icon: Icon, color }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  <p className="text-xs mt-1 flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3 h-3" />{change}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Platform Growth (Institutes)</CardTitle></CardHeader>
          <CardContent>
            {growth.length === 0 ? (
              <p className="text-sm text-gray-400 py-16 text-center">No growth data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growth}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="institutes" stroke="#7c3aed" fill="#ede9fe" name="Institutes" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="col-span-2">
            <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              {growth.length === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={growth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
            <CardContent>
              {planDist.length === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center">No plan data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={planDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                      {planDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Top Schools by Student Count</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topSchools.length === 0 && <p className="text-sm text-gray-400">No schools yet</p>}
            {topSchools.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.studentCount} students · {s.plan ?? "Free"}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900">{s.userCount} users</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
