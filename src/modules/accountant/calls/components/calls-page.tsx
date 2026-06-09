"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { mockStudents } from "@/lib/mock-data";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Plus, X, AlertTriangle } from "lucide-react";

type CallLog = {
  id: string; studentName: string; admissionNo: string; mobile: string;
  type: "incoming" | "outgoing" | "missed"; date: string; duration: string;
  summary: string; nextAction: string;
};

const INIT_CALLS: CallLog[] = [
  { id: "1", studentName: "Aryan Sharma", admissionNo: "ADM-2024-001", mobile: "9876543210", type: "outgoing", date: "2026-06-07", duration: "3", summary: "Parent agreed to pay by end of week. Partial payment of ₹15,000 promised.", nextAction: "Follow up on 2026-06-10" },
  { id: "2", studentName: "Priya Nair", admissionNo: "ADM-2024-002", mobile: "9876543211", type: "incoming", date: "2026-06-06", duration: "5", summary: "Parent called to inquire about due date. Extended till 15th June.", nextAction: "Send reminder on 14th" },
  { id: "3", studentName: "Rahul Verma", admissionNo: "ADM-2024-003", mobile: "9876543212", type: "missed", date: "2026-06-05", duration: "—", summary: "", nextAction: "Call back tomorrow" },
  { id: "4", studentName: "Kiran Reddy", admissionNo: "ADM-2024-005", mobile: "9876543214", type: "outgoing", date: "2026-06-04", duration: "2", summary: "Confirmed receipt of WhatsApp reminder. Will pay online.", nextAction: "" },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "incoming") return <PhoneIncoming className="w-4 h-4 text-green-500" />;
  if (type === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
  return <PhoneMissed className="w-4 h-4 text-red-500" />;
};

const TYPE_LABEL: Record<string,string> = {
  incoming: "bg-green-50 text-green-700",
  outgoing: "bg-blue-50 text-blue-700",
  missed: "bg-red-50 text-red-700",
};

export function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>(INIT_CALLS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewCall, setViewCall] = useState<CallLog | null>(null);
  const [delCall, setDelCall] = useState<CallLog | null>(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    studentSearch: "", admissionNo: "", mobile: "",
    type: "outgoing" as "incoming"|"outgoing"|"missed",
    date: new Date().toISOString().slice(0,10), duration: "", summary: "", nextAction: "",
  });
  const [studentSugg, setStudentSugg] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const suggestedStudents = mockStudents.filter(s =>
    s.fullName.toLowerCase().includes(form.studentSearch.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(form.studentSearch.toLowerCase())
  ).slice(0,5);

  const filtered = calls.filter(c => {
    const q = search.toLowerCase();
    return (c.studentName.toLowerCase().includes(q) || c.admissionNo.toLowerCase().includes(q))
      && (typeFilter === "All" || c.type === typeFilter);
  });

  const handleSave = () => {
    if (!form.studentSearch.trim()) { showToast("⚠️ Student name required"); return; }
    const log: CallLog = {
      id: String(Date.now()), studentName: form.studentSearch.trim(),
      admissionNo: form.admissionNo || "—", mobile: form.mobile || "—",
      type: form.type, date: form.date, duration: form.duration || "—",
      summary: form.summary, nextAction: form.nextAction,
    };
    setCalls(prev => [log, ...prev]);
    showToast(`📞 Call log saved for ${log.studentName}`);
    setShowModal(false);
    setForm({ studentSearch:"", admissionNo:"", mobile:"", type:"outgoing", date:new Date().toISOString().slice(0,10), duration:"", summary:"", nextAction:"" });
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Call Logs" subtitle="Track parent communication · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Calls", value: calls.length, color: "text-gray-900" },
            { label: "Outgoing", value: calls.filter(c=>c.type==="outgoing").length, color: "text-blue-600" },
            { label: "Incoming", value: calls.filter(c=>c.type==="incoming").length, color: "text-green-600" },
            { label: "Missed", value: calls.filter(c=>c.type==="missed").length, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or admission no..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {["All","outgoing","incoming","missed"].map(t=><option key={t}>{t}</option>)}
          </select>
          <Button size="sm" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Log Call</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Call History ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student","Admission No","Mobile","Type","Date","Duration","Summary","Actions"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No call logs found.</td></tr>}
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{c.studentName}</td>
                    <td className="px-4 py-3.5 text-sm font-mono text-gray-500">{c.admissionNo}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.mobile}</td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${TYPE_LABEL[c.type]}`}>
                        <TypeIcon type={c.type} />{c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{c.date}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{c.duration !== "—" ? `${c.duration} min` : "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate">{c.summary || "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => setViewCall(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="View"><Phone className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast(`📞 Calling ${c.mobile}...`)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Call Back"><PhoneOutgoing className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDelCall(c)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* VIEW CALL MODAL */}
      {viewCall && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Call Details</h3>
              <button onClick={() => setViewCall(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              {[["Student",viewCall.studentName],["Admission No",viewCall.admissionNo],["Mobile",viewCall.mobile],
                ["Type",viewCall.type],["Date",viewCall.date],["Duration",viewCall.duration!=="—"?`${viewCall.duration} min`:"—"]].map(([k,v])=>(
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span><span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            {viewCall.summary && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Summary</p>
                <p className="text-sm text-gray-800 bg-indigo-50 rounded-lg p-3">{viewCall.summary}</p>
              </div>
            )}
            {viewCall.nextAction && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Next Action</p>
                <p className="text-sm text-gray-800 bg-amber-50 rounded-lg p-3">{viewCall.nextAction}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => showToast(`📞 Calling ${viewCall.mobile}...`)}>
                <Phone className="w-4 h-4" />Call Back
              </Button>
              <Button className="flex-1" onClick={() => setViewCall(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}

      {/* LOG CALL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[480px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-gray-900">Log Call</h3></div>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-xs text-gray-500 font-medium">Student *</label>
                <input value={form.studentSearch} onChange={e=>{setForm(f=>({...f,studentSearch:e.target.value}));setStudentSugg(true);}} onFocus={()=>setStudentSugg(true)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search student..." />
                {studentSugg && form.studentSearch && suggestedStudents.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestedStudents.map(s=>(
                      <button key={s.id} onClick={()=>{setForm(f=>({...f,studentSearch:s.fullName,admissionNo:s.admissionNo,mobile:s.parentMobile}));setStudentSugg(false);}}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0">
                        <span className="font-medium">{s.fullName}</span><span className="text-gray-400 ml-2">{s.admissionNo} · {s.parentMobile}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Call Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as any}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {["outgoing","incoming","missed"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Summary</label>
                <textarea value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="What was discussed..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Next Action</label>
                <input value={form.nextAction} onChange={e=>setForm(f=>({...f,nextAction:e.target.value}))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Follow up on..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}><Phone className="w-4 h-4" />Save Log</Button>
            </div>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {delCall && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="font-bold text-gray-900">Delete Call Log?</h3>
                <p className="text-sm text-gray-500 mt-1">{delCall.studentName} · {delCall.date} call will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDelCall(null)}>Cancel</Button>
              <Button onClick={() => { setCalls(p=>p.filter(c=>c.id!==delCall.id)); showToast("🗑️ Call log deleted"); setDelCall(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
