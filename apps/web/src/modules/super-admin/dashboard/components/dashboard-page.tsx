"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useSchools } from "@/lib/api/hooks/useDomains";
import {
  usePlatformStats,
  usePlatformAnalytics,
  useUpdateSchool,
  useAuditLogs,
} from "@/lib/api/hooks/useSuperAdmin";
import { Building2, Users, IndianRupee, TrendingUp, Plus, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const planColors: Record<string, string> = {
  FREE: "default", STARTER: "info", GROWTH: "success", ENTERPRISE: "warning",
};

const planBarColors: Record<string, string> = {
  ENTERPRISE: "bg-yellow-500",
  GROWTH: "bg-green-500",
  STARTER: "bg-blue-500",
  FREE: "bg-gray-400",
};

export function DashboardPage() {
  const router = useRouter();
  const statsQuery = usePlatformStats();
  const analyticsQuery = usePlatformAnalytics();
  const schoolsQuery = useSchools({ pageSize: 100 });
  const auditQuery = useAuditLogs({ pageSize: 5 });
  const updateSchool = useUpdateSchool();

  const stats = statsQuery.data;
  const growthData = analyticsQuery.data?.growth ?? [];
  const planDist = analyticsQuery.data?.planDistribution ?? [];
  const institutes = schoolsQuery.data?.data ?? [];
  const alerts = auditQuery.data?.data ?? [];

  const [toast, setToast] = useState("");
  const [confirmInstitute, setConfirmInstitute] = useState<(typeof institutes)[0] | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const toggleStatus = () => {
    if (!confirmInstitute) return;
    const activating = !confirmInstitute.isActive;
    updateSchool.mutate(
      { id: confirmInstitute.id, payload: { isActive: activating } },
      {
        onSuccess: () => {
          showToast(activating ? `✅ ${confirmInstitute.name} activated` : `⚠️ ${confirmInstitute.name} suspended`);
          setConfirmInstitute(null);
        },
        onError: () => showToast("❌ Failed to update institute status"),
      },
    );
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Super Admin Dashboard" subtitle="Platform overview across all institutes" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Institutes", value: (stats?.totalSchools ?? institutes.length).toString(), change: `${stats?.activeSchools ?? 0} active`, icon: Building2, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
            { label: "Total Students", value: (stats?.totalStudents ?? 0).toLocaleString(), change: `${stats?.totalUsers ?? 0} users`, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
            { label: "Platform MRR", value: formatCurrency(stats?.mrr ?? analyticsQuery.data?.mrr ?? 0), change: "Monthly recurring", icon: IndianRupee, iconBg: "bg-green-50", iconColor: "text-green-600" },
            { label: "Suspended", value: (stats?.suspendedSchools ?? 0).toString(), change: "Requires attention", icon: TrendingUp, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
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

        {planDist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {planDist.map(p => (
              <Card key={p.plan} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${planBarColors[p.plan.toUpperCase()] ?? "bg-gray-400"}`} />
                  <span className="text-sm font-semibold text-gray-900">{p.plan}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{p.count}</p>
                <p className="text-xs text-gray-500 mt-1">institutes</p>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Platform Growth — Institutes</CardTitle></CardHeader>
            <CardContent>
              {growthData.length === 0 ? (
                <p className="text-sm text-gray-400 py-16 text-center">No growth data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="institutes" name="Institutes" stroke="#9333ea" strokeWidth={2.5} dot={{ fill: "#9333ea", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Monthly Platform Revenue</CardTitle></CardHeader>
            <CardContent>
              {growthData.length === 0 ? (
                <p className="text-sm text-gray-400 py-16 text-center">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Revenue" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Institutes</CardTitle>
            <Button size="sm" onClick={() => router.push("/super-admin/schools")}><Plus className="w-4 h-4" />Onboard Institute</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Institute", "City", "Plan", "Students", "Users", "Status", "Joined", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {institutes.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No institutes found</td></tr>
                )}
                {institutes.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer" onClick={() => router.push(`/super-admin/schools/${s.id}`)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                          {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{s.city ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={planColors[(s.plan ?? "FREE").toUpperCase()] as "default" | "info" | "success" | "warning"}>{s.plan ?? "FREE"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{s.studentCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{s.userCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.isActive ? "ACTIVE" : "SUSPENDED"} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        {s.isActive ? (
                          <button onClick={() => setConfirmInstitute(s)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Suspend">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => setConfirmInstitute(s)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Activate">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => router.push(`/super-admin/schools/${s.id}`)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
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

        {confirmInstitute && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-[400px] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${confirmInstitute.isActive ? "bg-red-100" : "bg-green-100"}`}>
                  <AlertCircle className={`w-5 h-5 ${confirmInstitute.isActive ? "text-red-500" : "text-green-600"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{confirmInstitute.isActive ? "Suspend Institute?" : "Activate Institute?"}</h3>
                  <p className="text-sm text-gray-500 mt-1">{confirmInstitute.name} — {confirmInstitute.isActive ? "all users will lose access immediately." : "all users will regain access."}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmInstitute(null)}>Cancel</Button>
                <Button onClick={toggleStatus} className={confirmInstitute.isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
                  {confirmInstitute.isActive ? "Yes, Suspend" : "Yes, Activate"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Recent Platform Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 && <p className="text-sm text-gray-400">No recent activity</p>}
            {alerts.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-mono">{entry.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{entry.entityType} · {new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
