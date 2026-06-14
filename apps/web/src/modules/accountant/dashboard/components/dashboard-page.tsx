"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useStudents } from "@/lib/api/hooks/useStudents";
import { usePayments } from "@/lib/api/hooks/usePayments";
import { useDashboardStats, useMonthlyCollection } from "@/lib/api/hooks/useDomains";
import { IndianRupee, AlertTriangle, TrendingUp, MessageCircle, Filter, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ACADEMIC_YEARS = ["2025-26","2024-25","2023-24"];
const CLASSES   = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const QUOTAS    = ["All Quotas","General","SC/ST","Sports","Scholarship","Management"];
const MONTHS    = ["All Months","April","May","June","July","August","September","October","November","December","January","February","March"];
const MONTH_TARGET = 900000;

const STATUS_COLOR: Record<string,string> = {
  PAID:"bg-green-100 text-green-700",PARTIAL:"bg-yellow-100 text-yellow-700",
  OVERDUE:"bg-red-100 text-red-700",PENDING:"bg-gray-100 text-gray-600",
};

export function DashboardPage() {
  const [toast, setToast]             = useState("");
  const [yearFilter, setYearFilter]   = useState("2025-26");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [divFilter, setDivFilter]     = useState("All Divisions");
  const [quotaFilter, setQuotaFilter] = useState("All Quotas");
  const [monthFilter, setMonthFilter] = useState("All Months");
  const [showFilters, setShowFilters] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: stats } = useDashboardStats();
  const studentsQuery = useStudents({ pageSize: 200 });
  const paymentsQuery = usePayments({ pageSize: 50 });
  const { data: monthly } = useMonthlyCollection();

  const monthlyData = monthly ?? [];

  const students = (studentsQuery.data?.data ?? []).map((s) => ({
    id: s.id,
    fullName: s.fullName,
    class: s.className ?? "",
    division: s.divisionName ?? "",
    quota: s.quotaName ?? "General",
    totalFee: s.totalFee,
    paidAmount: s.paidAmount,
    status: s.status as string,
  }));

  const filteredStudents = students.filter(s =>
    (classFilter === "All Classes"   || s.class === classFilter) &&
    (divFilter   === "All Divisions" || s.division === divFilter) &&
    (quotaFilter === "All Quotas"    || s.quota === quotaFilter)
  );

  const overdueStudents = filteredStudents.filter(s => s.status === "OVERDUE" || s.status === "PARTIAL");

  const todayStr = new Date().toISOString().slice(0,10);
  const recentPayments = (paymentsQuery.data?.data ?? []).map((p) => ({
    id: p.id,
    studentName: p.studentName,
    admissionNo: p.admissionNo,
    mode: p.paymentMode as string,
    amount: p.amount,
    date: p.paymentDate.slice(0,10),
    status: "PAID",
  }));
  const todayPayments = recentPayments.filter(p => p.date === todayStr);

  const thisMonthCollected = monthlyData.slice(-1)[0]?.collected ?? 0;
  const totalOutstanding = (stats?.totalPending ?? 0) + (stats?.totalOverdue ?? 0);
  const collectionRate  = Math.round(stats?.collectionRate ?? 0);
  const todayCollection = todayPayments.reduce((a,p)=>a+p.amount,0);
  const monthProgress   = Math.min(thisMonthCollected / MONTH_TARGET * 100, 100);

  const activeFilterCount = [
    classFilter !== "All Classes",
    divFilter   !== "All Divisions",
    quotaFilter !== "All Quotas",
    monthFilter !== "All Months",
  ].filter(Boolean).length;

  const clearFilters = () => { setClassFilter("All Classes"); setDivFilter("All Divisions"); setQuotaFilter("All Quotas"); setMonthFilter("All Months"); };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Accountant Dashboard" subtitle="Fee collection overview · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Global Filter Bar */}
        <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">View by:</span>
          <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700">
            {ACADEMIC_YEARS.map(y=><option key={y}>{y}</option>)}
          </select>
          <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {MONTHS.map(m=><option key={m}>{m}</option>)}
          </select>
          <select value={classFilter} onChange={e=>setClassFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {CLASSES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={divFilter} onChange={e=>setDivFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {DIVISIONS.map(d=><option key={d}>{d}</option>)}
          </select>
          <select value={quotaFilter} onChange={e=>setQuotaFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {QUOTAS.map(q=><option key={q}>{q}</option>)}
          </select>
          {activeFilterCount > 0 && (
            <>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{activeFilterCount} filter{activeFilterCount>1?"s":""} active</span>
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">✕ Clear</button>
            </>
          )}
          <div className="ml-auto text-xs text-gray-400">Showing: {filteredStudents.length} students</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"Collected Today",   value:formatCurrency(todayCollection),    icon:TrendingUp,    color:"text-green-600",  bg:"bg-green-50" },
            { label:"This Month",        value:formatCurrency(thisMonthCollected), icon:IndianRupee, color:"text-indigo-600", bg:"bg-indigo-50" },
            { label:"Outstanding",       value:formatCurrency(totalOutstanding),   icon:AlertTriangle, color:"text-red-600",    bg:"bg-red-50" },
            { label:"Collection Rate",   value:`${collectionRate}%`,              icon:TrendingUp,    color:"text-amber-600",  bg:"bg-amber-50" },
          ].map(s=>(
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                  {activeFilterCount>0 && <p className="text-xs text-indigo-500 mt-0.5">Filtered view</p>}
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chart + Month Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Collection Trend — {yearFilter}</CardTitle>
              <span className="text-xs text-gray-400">{monthFilter !== "All Months" ? monthFilter : "All months"}</span>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v)=>formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="#4f46e5" fill="url(#dashGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Month vs Target</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-bold text-indigo-700">{Math.round(monthProgress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{width:`${monthProgress}%`}} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹0</span><span>Target: {formatCurrency(MONTH_TARGET)}</span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Collected</span><span className="font-semibold text-green-600">{formatCurrency(thisMonthCollected)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="font-semibold text-amber-600">{formatCurrency(stats?.totalPending ?? 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Overdue</span><span className="font-semibold text-red-500">{overdueStudents.length} students</span></div>
              </div>
              <Button size="sm" className="w-full" onClick={()=>showToast("📣 Bulk reminder sent!")}>
                <MessageCircle className="w-4 h-4" />Bulk Reminder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Transactions + Overdue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Transactions</CardTitle>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{formatCurrency(todayCollection)}</span>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {todayPayments.length===0 && <p className="text-sm text-gray-400 text-center py-4">No transactions today yet.</p>}
              {todayPayments.slice(0,5).map(p=>(
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.studentName}</p>
                    <p className="text-xs text-gray-500">{p.admissionNo} · {p.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(p.amount)}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[p.status]||"bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Overdue Students</CardTitle>
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">{overdueStudents.length}</span>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {overdueStudents.length===0 && <p className="text-sm text-gray-400 text-center py-4">No overdue students 🎉</p>}
              {overdueStudents.map(s=>(
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-500">{s.class} {s.division && `Div ${s.division}`} · {s.quota}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">{formatCurrency(s.totalFee-s.paidAmount)}</span>
                    <button onClick={()=>showToast(`💬 Reminder sent to ${s.fullName}'s parent`)}
                      className="p-1 bg-green-50 hover:bg-green-100 rounded">
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Record Payment", icon:"💳", desc:"Log a new payment" },
                { label:"Send Reminders", icon:"📣", desc:"Notify overdue parents" },
                { label:"Generate Invoice", icon:"🧾", desc:"Create fee invoice" },
                { label:"View Report", icon:"📊", desc:"Financial analytics" },
              ].map(a=>(
                <button key={a.label} onClick={()=>showToast(`Opening ${a.label}...`)}
                  className="flex flex-col gap-2 p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{a.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
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
