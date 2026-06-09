"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStudents } from "@/lib/mock-data";
import { Bell, MessageCircle, Mail, X, Clock, CheckCircle2, Filter } from "lucide-react";

const ACADEMIC_YEARS = ["2025-26","2024-25","2023-24"];
const CLASSES   = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const QUOTAS    = ["All Quotas","General","SC/ST","Sports","Scholarship","Management"];
const STATUSES  = ["All","PARTIAL","OVERDUE","PENDING"];

const STATUS_COLOR: Record<string,string> = {
  PAID:"bg-green-100 text-green-700",PARTIAL:"bg-yellow-100 text-yellow-700",
  OVERDUE:"bg-red-100 text-red-700",PENDING:"bg-gray-100 text-gray-600",
};

type ReminderLog = { id: string; student: string; type: string; time: string; };

export function RemindersPage() {
  const [yearFilter, setYearFilter]   = useState("2025-26");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [divFilter, setDivFilter]     = useState("All Divisions");
  const [quotaFilter, setQuotaFilter] = useState("All Quotas");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected]       = useState<string[]>([]);
  const [logs, setLogs]               = useState<ReminderLog[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [toast, setToast]             = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const activeFilters = [
    classFilter !== "All Classes"   && classFilter,
    divFilter   !== "All Divisions" && divFilter,
    quotaFilter !== "All Quotas"    && quotaFilter,
    statusFilter !== "All"          && statusFilter,
  ].filter(Boolean) as string[];
  const clearFilters = () => { setClassFilter("All Classes"); setDivFilter("All Divisions"); setQuotaFilter("All Quotas"); setStatusFilter("All"); };

  const defaulters = mockStudents.filter(s =>
    s.status !== "PAID" &&
    (classFilter  === "All Classes"   || s.class === classFilter) &&
    (divFilter    === "All Divisions" || s.division === divFilter) &&
    (quotaFilter  === "All Quotas"    || s.quota === quotaFilter) &&
    (statusFilter === "All"           || s.status === statusFilter)
  );

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const allChecked = defaulters.length > 0 && defaulters.every(s => selected.includes(s.id));

  const sendReminders = (type: "WhatsApp" | "Email", ids: string[]) => {
    const students = mockStudents.filter(s => ids.includes(s.id));
    const newLogs: ReminderLog[] = students.map(s => ({
      id: String(Date.now())+s.id, student:s.fullName, type, time:new Date().toLocaleTimeString(),
    }));
    setLogs(prev=>[...newLogs,...prev]);
    showToast(`${type==="WhatsApp"?"💬":"📧"} ${type} sent to ${students.length} parent(s)`);
    setSelected([]);
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Fee Reminders" subtitle="Send payment reminders to parents · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Pending Reminders", value:defaulters.length, color:"text-red-600" },
            { label:"Sent This Week", value:34+logs.length, color:"text-indigo-600" },
            { label:"Response Rate", value:"68%", color:"text-green-600" },
            { label:"Logged Today", value:logs.length, color:"text-amber-600" },
          ].map(s=>(
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap items-center">
            <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
              {ACADEMIC_YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={()=>setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters||activeFilters.length>0?"border-indigo-500 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
              <Filter className="w-4 h-4" />Filters{activeFilters.length>0&&<span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilters.length}</span>}
            </button>
            <div className="flex-1" />
            <Button variant="outline" onClick={()=>setShowSchedule(true)}><Clock className="w-4 h-4" />Schedule</Button>
            <Button variant="outline" disabled={selected.length===0} onClick={()=>sendReminders("Email",selected)}>
              <Mail className="w-4 h-4" />Email ({selected.length})
            </Button>
            <Button disabled={selected.length===0} onClick={()=>sendReminders("WhatsApp",selected)}>
              <MessageCircle className="w-4 h-4" />WhatsApp ({selected.length})
            </Button>
            <Button variant="outline" onClick={()=>sendReminders("WhatsApp",defaulters.map(s=>s.id))}>
              <Bell className="w-4 h-4" />Send All ({defaulters.length})
            </Button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Class</label>
                <select value={classFilter} onChange={e=>setClassFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                  {CLASSES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Division</label>
                <select value={divFilter} onChange={e=>setDivFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                  {DIVISIONS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Quota</label>
                <select value={quotaFilter} onChange={e=>setQuotaFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                  {QUOTAS.map(q=><option key={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
                <div className="flex gap-1">
                  {STATUSES.map(s=>(
                    <button key={s} onClick={()=>setStatusFilter(s)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${statusFilter===s?"bg-indigo-600 text-white border-indigo-600":"bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters.length>0&&<button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-2">✕ Clear all</button>}
            </div>
          )}

          {activeFilters.length>0&&!showFilters&&(
            <div className="flex gap-2 flex-wrap">
              {activeFilters.map(f=>(
                <span key={f} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{f}</span>
              ))}
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
            </div>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Students with Pending Dues ({defaulters.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allChecked} onChange={e=>setSelected(e.target.checked?defaulters.map(s=>s.id):[])} className="rounded" />
                  </th>
                  {["Student","Class","Div","Quota","Total Fee","Paid","Due","Status","Actions"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {defaulters.length===0&&<tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">No pending dues for selected filters 🎉</td></tr>}
                {defaulters.map(s=>(
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5"><input type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)} className="rounded" /></td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.class}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{s.division||"—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{s.quota}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatCurrency(s.totalFee)}</td>
                    <td className="px-4 py-3.5 text-sm text-green-600 font-semibold">{formatCurrency(s.paidAmount)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-red-600">{formatCurrency(s.totalFee-s.paidAmount)}</td>
                    <td className="px-4 py-3.5"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[s.status]||"bg-gray-100 text-gray-600"}`}>{s.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={()=>sendReminders("WhatsApp",[s.id])} className="p-1.5 text-gray-400 hover:text-green-600 rounded"><MessageCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>sendReminders("Email",[s.id])} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Mail className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {logs.length>0 && (
          <Card>
            <CardHeader><CardTitle>Sent Reminders (This Session)</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4">
              {logs.slice(0,10).map(l=>(
                <div key={l.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{l.type} → <span className="font-medium">{l.student}</span>'s parent</span>
                  <span className="text-xs text-gray-400">{l.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[400px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-gray-900">Schedule Bulk Reminder</h3></div>
              <button onClick={()=>setShowSchedule(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Date & Time</label>
                <input type="datetime-local" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <p className="text-sm text-gray-500">Will send to all <span className="font-semibold">{defaulters.length} students</span> matching current filters.</p>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setShowSchedule(false)}>Cancel</Button>
              <Button onClick={()=>{showToast(`⏰ Reminder scheduled`);setShowSchedule(false);}}><Clock className="w-4 h-4" />Schedule</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
