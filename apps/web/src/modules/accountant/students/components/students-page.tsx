"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useStudents, useUpdateStudent, useDeleteStudent } from "@/lib/api/hooks/useStudents";
import { useRecordPayment } from "@/lib/api/hooks/usePayments";
import type { StudentSummary, PaymentMode } from "@edufees/shared-types";
import {
  Search, Phone, Mail, Eye, Pencil, Trash2, X, AlertTriangle,
  IndianRupee, MessageCircle, PhoneCall, SlidersHorizontal, ChevronDown,
  Download, Filter,
} from "lucide-react";

type Student = {
  id: string; fullName: string; admissionNo: string; class: string;
  division: string; parentMobile: string; parentEmail: string;
  totalFee: number; paidAmount: number; status: string; quota: string;
};

function toUiStudent(s: StudentSummary): Student {
  return {
    id: s.id,
    fullName: s.fullName,
    admissionNo: s.admissionNo,
    class: s.className ?? "",
    division: s.divisionName ?? "",
    parentMobile: s.parentMobile,
    parentEmail: s.parentEmail ?? "",
    totalFee: s.totalFee,
    paidAmount: s.paidAmount,
    status: s.status,
    quota: s.quotaName ?? "General",
  };
}

// ── Admin-created master data (mirrors academic settings) ──
const ACADEMIC_YEARS = ["2025-26", "2024-25", "2023-24"];
const CLASSES  = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const QUOTAS   = ["All Quotas","General","SC/ST","Sports","Scholarship","Management"];
const STATUSES = ["All","PAID","PARTIAL","OVERDUE","PENDING"];

const STATUS_COLOR: Record<string,string> = {
  PAID:"bg-green-100 text-green-700", PARTIAL:"bg-yellow-100 text-yellow-700",
  OVERDUE:"bg-red-100 text-red-700",  PENDING:"bg-gray-100 text-gray-600",
};
const QUOTA_COLOR: Record<string,string> = {
  General:"bg-indigo-50 text-indigo-700","SC/ST":"bg-purple-50 text-purple-700",
  Sports:"bg-cyan-50 text-cyan-700",Scholarship:"bg-green-50 text-green-700",Management:"bg-orange-50 text-orange-700",
};
const AVATAR_COLORS = ["bg-indigo-500","bg-purple-500","bg-cyan-500","bg-green-500","bg-pink-500","bg-orange-500","bg-teal-500","bg-rose-500"];
const initials = (n: string) => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const FEE_TYPES = ["Tuition Fee","Transport Fee","Lab Fee","Sports Fee","Library Fee","Exam Fee","Activity Fee","Annual Fee","Hostel Fee","Meal Fee"];
const PAY_MODES = ["Online","UPI","Cash","NEFT","Cheque"];

export function StudentsPage() {
  const studentsQuery = useStudents({ pageSize: 200 });
  const updateStudent = useUpdateStudent();
  const deleteStudentMut = useDeleteStudent();
  const recordPayment = useRecordPayment();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    if (studentsQuery.data?.data) setStudents(studentsQuery.data.data.map(toUiStudent));
  }, [studentsQuery.data]);
  const [yearFilter, setYearFilter]     = useState("2025-26");
  const [classFilter, setClassFilter]   = useState("All Classes");
  const [divFilter, setDivFilter]       = useState("All Divisions");
  const [quotaFilter, setQuotaFilter]   = useState("All Quotas");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters]   = useState(false);

  const [viewSt, setViewSt]     = useState<Student | null>(null);
  const [editSt, setEditSt]     = useState<Student | null>(null);
  const [delSt, setDelSt]       = useState<Student | null>(null);
  const [paySt, setPaySt]       = useState<Student | null>(null);
  const [callSt, setCallSt]     = useState<Student | null>(null);
  const [remindSt, setRemindSt] = useState<Student | null>(null);

  const [payForm, setPayForm]   = useState({ feeType:"Tuition Fee", amount:"", mode:"Online", date:"", ref:"", notes:"" });
  const [callForm, setCallForm] = useState({ date:"", duration:"", summary:"", nextAction:"" });
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [toast, setToast]       = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const activeFilters = [
    classFilter !== "All Classes" && classFilter,
    divFilter !== "All Divisions" && divFilter,
    quotaFilter !== "All Quotas" && quotaFilter,
    statusFilter !== "All" && statusFilter,
  ].filter(Boolean) as string[];

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (s.fullName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q))
      && (classFilter === "All Classes" || s.class === classFilter)
      && (divFilter === "All Divisions" || s.division === divFilter)
      && (quotaFilter === "All Quotas" || s.quota === quotaFilter)
      && (statusFilter === "All" || s.status === statusFilter);
  });

  const totalCollected = students.reduce((a,s)=>a+s.paidAmount,0);
  const totalOutstanding = students.reduce((a,s)=>a+(s.totalFee-s.paidAmount),0);

  const PAY_MODE_MAP: Record<string, PaymentMode> = {
    Online: "ONLINE" as PaymentMode, UPI: "UPI" as PaymentMode, Cash: "CASH" as PaymentMode,
    NEFT: "NEFT" as PaymentMode, Cheque: "CHEQUE" as PaymentMode,
  };

  const handlePaySave = () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) { showToast("⚠️ Enter a valid amount"); return; }
    if (!paySt) return;
    const amt = Number(payForm.amount);
    const target = paySt;
    setStudents(prev => prev.map(s => {
      if (s.id !== target.id) return s;
      const newPaid = Math.min(s.paidAmount + amt, s.totalFee);
      return { ...s, paidAmount: newPaid, status: newPaid >= s.totalFee ? "PAID" : newPaid > 0 ? "PARTIAL" : s.status };
    }));
    recordPayment.mutate({
      studentId: target.id,
      amount: amt,
      paymentMode: PAY_MODE_MAP[payForm.mode] ?? "OTHER",
      paymentDate: payForm.date || undefined,
      referenceNo: payForm.ref || undefined,
      notes: payForm.notes || undefined,
    });
    showToast(`✅ ${formatCurrency(amt)} recorded for ${target.fullName}. Invoice auto-generated.`);
    setPaySt(null);
  };

  const clearFilters = () => { setClassFilter("All Classes"); setDivFilter("All Divisions"); setQuotaFilter("All Quotas"); setStatusFilter("All"); setSearch(""); };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Students" subtitle="Fee status overview · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Total Students", value:students.length, color:"text-gray-900" },
            { label:"Fully Paid",     value:students.filter(s=>s.status==="PAID").length, color:"text-green-600" },
            { label:"Overdue",        value:students.filter(s=>s.status==="OVERDUE").length, color:"text-red-600" },
            { label:"Outstanding",    value:formatCurrency(totalOutstanding), color:"text-amber-600" },
          ].map(s=>(
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or admission no..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
            </div>
            {/* Academic Year */}
            <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
              {ACADEMIC_YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters||activeFilters.length>0 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
              <Filter className="w-4 h-4" />Filters{activeFilters.length>0 && <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilters.length}</span>}
            </button>
            <Button variant="outline" size="sm" onClick={()=>showToast("📥 Exporting...")}><Download className="w-4 h-4" />Export</Button>
            <Button size="sm" onClick={()=>showToast("📣 Bulk reminder sent to all overdue parents")}><MessageCircle className="w-4 h-4" />Bulk Remind</Button>
          </div>

          {/* Expandable Filter Panel */}
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
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${statusFilter===s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-2">✕ Clear all</button>
              )}
            </div>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && !showFilters && (
            <div className="flex gap-2 flex-wrap">
              {activeFilters.map(f=>(
                <span key={f} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                  {f}<button onClick={()=>{
                    if(CLASSES.includes(f)) setClassFilter("All Classes");
                    else if(DIVISIONS.slice(1).includes(f)) setDivFilter("All Divisions");
                    else if(QUOTAS.slice(1).includes(f)) setQuotaFilter("All Quotas");
                    else setStatusFilter("All");
                  }} className="ml-0.5 hover:text-indigo-900">×</button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
            </div>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students ({filtered.length})</CardTitle>
            <p className="text-xs text-gray-400">Year: {yearFilter}</p>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student","Admission No","Class","Div","Quota","Contact","Total Fee","Paid","Balance","Status","Actions"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && <tr><td colSpan={11} className="px-5 py-12 text-center text-gray-400 text-sm">No students found for selected filters.</td></tr>}
                {filtered.map((s,idx)=>{
                  const balance = s.totalFee - s.paidAmount;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[idx%AVATAR_COLORS.length]}`}>{initials(s.fullName)}</div>
                          <p className="text-sm font-semibold text-gray-900">{s.fullName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-gray-500">{s.admissionNo}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{s.class}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{s.division||"—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${QUOTA_COLOR[s.quota]||"bg-gray-100 text-gray-600"}`}>{s.quota}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={()=>{setCallSt(s);setCallForm({date:new Date().toISOString().slice(0,10),duration:"",summary:"",nextAction:""}); }}
                            className="w-6 h-6 bg-indigo-50 hover:bg-indigo-100 rounded flex items-center justify-center" title={s.parentMobile}>
                            <Phone className="w-3 h-3 text-indigo-600" />
                          </button>
                          <button onClick={()=>showToast(`📧 Email sent to ${s.parentEmail}`)}
                            className="w-6 h-6 bg-green-50 hover:bg-green-100 rounded flex items-center justify-center" title={s.parentEmail}>
                            <Mail className="w-3 h-3 text-green-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">{formatCurrency(s.totalFee)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-green-600">{formatCurrency(s.paidAmount)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-red-500">{balance>0?formatCurrency(balance):"—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[s.status]||"bg-gray-100 text-gray-600"}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={()=>setViewSt(s)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>{setEditSt(s);setEditForm({fullName:s.fullName,parentMobile:s.parentMobile,parentEmail:s.parentEmail,quota:s.quota});}} className="p-1.5 text-gray-400 hover:text-amber-600 rounded" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>{setPaySt(s);setPayForm({feeType:"Tuition Fee",amount:String(s.totalFee-s.paidAmount),mode:"Online",date:new Date().toISOString().slice(0,10),ref:"",notes:""}); }} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Record Payment"><IndianRupee className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>setRemindSt(s)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Remind"><MessageCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={()=>setDelSt(s)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* ── VIEW MODAL ── */}
      {viewSt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[500px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Student Details</h3>
              <button onClick={()=>setViewSt(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold">{initials(viewSt.fullName)}</div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{viewSt.fullName}</p>
                <p className="text-sm text-gray-500">{viewSt.admissionNo} · {viewSt.class} {viewSt.division && `Div ${viewSt.division}`}</p>
                <div className="flex gap-1 mt-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[viewSt.status]}`}>{viewSt.status}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${QUOTA_COLOR[viewSt.quota]||"bg-gray-100 text-gray-600"}`}>{viewSt.quota}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Mobile",viewSt.parentMobile],["Email",viewSt.parentEmail],
                ["Total Fee",formatCurrency(viewSt.totalFee)],["Paid",formatCurrency(viewSt.paidAmount)],
                ["Balance",formatCurrency(viewSt.totalFee-viewSt.paidAmount)],["Division",viewSt.division||"—"]].map(([k,v])=>(
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-medium">{k}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Payment Progress</span><span>{Math.round((viewSt.paidAmount/viewSt.totalFee)*100)}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width:`${Math.min((viewSt.paidAmount/viewSt.totalFee)*100,100)}%`}} /></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button size="sm" variant="outline" className="flex-1" onClick={()=>{setViewSt(null);setCallSt(viewSt);setCallForm({date:new Date().toISOString().slice(0,10),duration:"",summary:"",nextAction:""}); }}><PhoneCall className="w-4 h-4" />Log Call</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={()=>showToast(`📧 Reminder sent to ${viewSt.fullName}'s parent`)}><MessageCircle className="w-4 h-4" />Remind</Button>
              <Button size="sm" className="flex-1" onClick={()=>{setViewSt(null);setPaySt(viewSt);setPayForm({feeType:"Tuition Fee",amount:String(viewSt.totalFee-viewSt.paidAmount),mode:"Online",date:new Date().toISOString().slice(0,10),ref:"",notes:""}); }}><IndianRupee className="w-4 h-4" />Record Payment</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editSt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Edit Student</h3>
              <button onClick={()=>setEditSt(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              {([["Full Name","fullName","text"],["Mobile","parentMobile","text"],["Email","parentEmail","email"]] as [string,string,string][]).map(([label,key,type])=>(
                <div key={key}>
                  <label className="text-xs text-gray-500 font-medium">{label}</label>
                  <input type={type} value={(editForm as any)[key]||""} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 font-medium">Quota</label>
                <select value={(editForm as any).quota||""} onChange={e=>setEditForm(f=>({...f,quota:e.target.value}))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {["General","SC/ST","Sports","Scholarship","Management"].map(q=><option key={q}>{q}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setEditSt(null)}>Cancel</Button>
              <Button onClick={()=>{updateStudent.mutate({id:editSt.id,payload:{fullName:editForm.fullName,parentMobile:editForm.parentMobile,parentEmail:editForm.parentEmail||undefined}});setStudents(p=>p.map(s=>s.id===editSt.id?{...s,...editForm}:s));showToast("✅ Student updated");setEditSt(null);}}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── RECORD PAYMENT MODAL ── */}
      {paySt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[480px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="font-bold text-gray-900">Record Payment</h3><p className="text-xs text-gray-500 mt-0.5">{paySt.fullName} · {paySt.admissionNo} · {paySt.class} {paySt.division && `Div ${paySt.division}`}</p></div>
              <button onClick={()=>setPaySt(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-4 text-sm">
              <div><span className="text-amber-700 font-medium">Outstanding: </span><span className="font-bold text-red-600">{formatCurrency(paySt.totalFee-paySt.paidAmount)}</span></div>
              <div><span className="text-amber-700 font-medium">Total: </span><span className="font-bold">{formatCurrency(paySt.totalFee)}</span></div>
              <div><span className="text-amber-700 font-medium">Paid: </span><span className="font-bold text-green-600">{formatCurrency(paySt.paidAmount)}</span></div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                  <select value={payForm.feeType} onChange={e=>setPayForm(f=>({...f,feeType:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {FEE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Payment Mode</label>
                  <select value={payForm.mode} onChange={e=>setPayForm(f=>({...f,mode:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {PAY_MODES.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                  <input type="number" value={payForm.amount} onChange={e=>setPayForm(f=>({...f,amount:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Date</label>
                  <input type="date" value={payForm.date} onChange={e=>setPayForm(f=>({...f,date:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Reference / Transaction ID</label>
                <input value={payForm.ref} onChange={e=>setPayForm(f=>({...f,ref:e.target.value}))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="UTR / Cheque no." />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Notes</label>
                <textarea value={payForm.notes} onChange={e=>setPayForm(f=>({...f,notes:e.target.value}))} rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setPaySt(null)}>Cancel</Button>
              <Button onClick={handlePaySave}><IndianRupee className="w-4 h-4" />Save & Generate Invoice</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── CALL LOG MODAL ── */}
      {callSt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><PhoneCall className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-gray-900">Log Call</h3></div>
              <button onClick={()=>setCallSt(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-900">{callSt.fullName}</p>
              <p className="text-gray-500">📞 {callSt.parentMobile} · {callSt.class} {callSt.division && `Div ${callSt.division}`}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 font-medium">Date</label>
                  <input type="date" value={callForm.date} onChange={e=>setCallForm(f=>({...f,date:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="text-xs text-gray-500 font-medium">Duration (mins)</label>
                  <input type="number" value={callForm.duration} onChange={e=>setCallForm(f=>({...f,duration:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="5" /></div>
              </div>
              <div><label className="text-xs text-gray-500 font-medium">Call Summary *</label>
                <textarea value={callForm.summary} onChange={e=>setCallForm(f=>({...f,summary:e.target.value}))} rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="What was discussed..." /></div>
              <div><label className="text-xs text-gray-500 font-medium">Next Action</label>
                <input value={callForm.nextAction} onChange={e=>setCallForm(f=>({...f,nextAction:e.target.value}))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Follow up on..." /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setCallSt(null)}>Cancel</Button>
              <Button onClick={()=>{if(!callForm.summary.trim()){showToast("⚠️ Enter summary");return;}showToast(`📞 Call logged for ${callSt.fullName}`);setCallSt(null);}}><PhoneCall className="w-4 h-4" />Save Log</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── REMINDER MODAL ── */}
      {remindSt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[400px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Send Reminder</h3>
              <button onClick={()=>setRemindSt(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-semibold text-gray-900">{remindSt.fullName}</p>
              <p><span className="text-gray-500">Class:</span> {remindSt.class} {remindSt.division && `Div ${remindSt.division}`}</p>
              <p><span className="text-gray-500">Outstanding:</span> <span className="font-bold text-red-600">{formatCurrency(remindSt.totalFee-remindSt.paidAmount)}</span></p>
              <p><span className="text-gray-500">Mobile:</span> {remindSt.parentMobile}</p>
              <p><span className="text-gray-500">Email:</span> {remindSt.parentEmail}</p>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setRemindSt(null)}>Cancel</Button>
              <Button variant="outline" onClick={()=>{showToast(`📧 Email reminder sent`);setRemindSt(null);}}><Mail className="w-4 h-4" />Email</Button>
              <Button onClick={()=>{showToast(`💬 WhatsApp sent to ${remindSt.parentMobile}`);setRemindSt(null);}}><MessageCircle className="w-4 h-4" />WhatsApp</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {delSt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="font-bold text-gray-900">Delete Student?</h3>
                <p className="text-sm text-gray-500 mt-1">{delSt.fullName} ({delSt.admissionNo}) will be permanently removed.</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>setDelSt(null)}>Cancel</Button>
              <Button onClick={()=>{deleteStudentMut.mutate(delSt.id);setStudents(p=>p.filter(s=>s.id!==delSt.id));showToast(`🗑️ ${delSt.fullName} removed`);setDelSt(null);}} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
