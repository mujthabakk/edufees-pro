"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockInvoices, mockStudents } from "@/lib/mock-data";
import { Download, Mail, MessageCircle, Plus, X, FileText, Search, AlertTriangle, Trash2, Filter } from "lucide-react";

type Invoice = {
  id: string; invoiceNo: string; studentName: string; class: string; division: string;
  amount: number; date: string; dueDate: string; feeType: string; notes: string;
  sentEmail: boolean; sentWA: boolean;
};

const ACADEMIC_YEARS = ["2025-26","2024-25","2023-24"];
const CLASSES   = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const FEE_TYPES_ALL = ["All Types","Tuition Fee","Exam Fee","Transport Fee","Lab Fee","Activity Fee","Annual Fee","Sports Fee","Library Fee"];
const FEE_TYPES = FEE_TYPES_ALL.slice(1);
const CLASS_LIST = CLASSES.slice(1);

const toInvoice = (r: any): Invoice => ({
  id:r.id, invoiceNo:r.invoiceNo, studentName:r.studentName, class:r.class, division:"A",
  amount:r.amount, date:r.date, dueDate:r.dueDate||"", feeType:r.feeType||"Tuition Fee",
  notes:r.notes||"", sentEmail:!!r.sentEmail, sentWA:!!r.sentWA,
});
const emptyForm = { student:"", class:"Class 10", division:"A", feeType:"Tuition Fee", amount:"", dueDate:"", notes:"" };

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices.map(toInvoice));
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ ...emptyForm });
  const [delInv, setDelInv]     = useState<Invoice | null>(null);
  const [toast, setToast]       = useState("");
  const [studentSugg, setStudentSugg] = useState(false);

  // Filters
  const [yearFilter, setYearFilter]   = useState("2025-26");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [divFilter, setDivFilter]     = useState("All Divisions");
  const [feeFilter, setFeeFilter]     = useState("All Types");
  const [sentFilter, setSentFilter]   = useState("All"); // All / Email Sent / WA Sent / Unsent
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const upd = (k: string, v: string) => setForm(f=>({...f,[k]:v}));

  const suggestedStudents = mockStudents.filter(s =>
    s.fullName.toLowerCase().includes(form.student.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(form.student.toLowerCase())
  ).slice(0,5);

  const activeFilters = [
    classFilter !== "All Classes"   && classFilter,
    divFilter   !== "All Divisions" && divFilter,
    feeFilter   !== "All Types"     && feeFilter,
    sentFilter  !== "All"           && sentFilter,
    dateFrom && `From ${dateFrom}`,
    dateTo   && `To ${dateTo}`,
  ].filter(Boolean) as string[];

  const clearFilters = () => { setClassFilter("All Classes"); setDivFilter("All Divisions"); setFeeFilter("All Types"); setSentFilter("All"); setDateFrom(""); setDateTo(""); };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (inv.studentName.toLowerCase().includes(q) || inv.invoiceNo.toLowerCase().includes(q))
      && (classFilter === "All Classes"   || inv.class === classFilter)
      && (divFilter   === "All Divisions" || inv.division === divFilter)
      && (feeFilter   === "All Types"     || inv.feeType === feeFilter)
      && (sentFilter  === "All"           || (sentFilter==="Email Sent"&&inv.sentEmail) || (sentFilter==="WA Sent"&&inv.sentWA) || (sentFilter==="Unsent"&&!inv.sentEmail&&!inv.sentWA))
      && (!dateFrom || inv.date >= dateFrom)
      && (!dateTo   || inv.date <= dateTo);
  });

  const handleGenerate = () => {
    if (!form.student.trim()) { showToast("⚠️ Student name is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { showToast("⚠️ Valid amount is required"); return; }
    const seq = String(invoices.length+1).padStart(3,"0");
    const newInv: Invoice = {
      id:String(Date.now()), invoiceNo:`INV-2026-${seq}`, studentName:form.student.trim(),
      class:form.class, division:form.division, amount:Number(form.amount),
      date:new Date().toISOString().slice(0,10), dueDate:form.dueDate,
      feeType:form.feeType, notes:form.notes.trim(), sentEmail:false, sentWA:false,
    };
    setInvoices(prev=>[newInv,...prev]);
    showToast(`✅ ${newInv.invoiceNo} generated for ${newInv.studentName}`);
    setShowModal(false);
    setForm({...emptyForm});
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Invoices" subtitle="Generate and track fee invoices · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Total Invoices", value:invoices.length, color:"text-gray-900" },
            { label:"Email Sent", value:invoices.filter(i=>i.sentEmail).length, color:"text-blue-600" },
            { label:"WhatsApp Sent", value:invoices.filter(i=>i.sentWA).length, color:"text-green-600" },
            { label:"Unsent", value:invoices.filter(i=>!i.sentEmail&&!i.sentWA).length, color:"text-amber-600" },
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
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or invoice no..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
            </div>
            <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
              {ACADEMIC_YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={()=>setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters||activeFilters.length>0?"border-indigo-500 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
              <Filter className="w-4 h-4" />Filters{activeFilters.length>0&&<span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center">{activeFilters.length}</span>}
            </button>
            <Button variant="outline" size="sm" onClick={()=>showToast("📥 Exporting...")}><Download className="w-4 h-4" />Export</Button>
            <Button size="sm" onClick={()=>{setForm({...emptyForm});setShowModal(true);}}><Plus className="w-4 h-4" />Generate Invoice</Button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex flex-wrap gap-3">
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
                  <label className="text-xs text-gray-500 font-medium block mb-1">Fee Type</label>
                  <select value={feeFilter} onChange={e=>setFeeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                    {FEE_TYPES_ALL.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Send Status</label>
                  <div className="flex gap-1">
                    {["All","Email Sent","WA Sent","Unsent"].map(s=>(
                      <button key={s} onClick={()=>setSentFilter(s)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${sentFilter===s?"bg-indigo-600 text-white border-indigo-600":"bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Date From</label>
                  <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Date To</label>
                  <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                {activeFilters.length>0&&<button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-2">✕ Clear all</button>}
              </div>
            </div>
          )}
          {activeFilters.length>0&&!showFilters&&(
            <div className="flex gap-2 flex-wrap">
              {activeFilters.map(f=><span key={f} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{f}</span>)}
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices ({filtered.length})</CardTitle>
            {filtered.length<invoices.length&&<p className="text-xs text-indigo-600 font-medium">Filtered from {invoices.length} total</p>}
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice No","Student","Class","Div","Fee Type","Amount","Date","Email","WA","Actions"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">No invoices found.</td></tr>}
                {filtered.map(inv=>(
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5 text-sm font-mono font-semibold text-indigo-700">{inv.invoiceNo}</td>
                    <td className="px-4 py-3.5 text-sm font-medium">{inv.studentName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{inv.class}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{inv.division||"—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{inv.feeType}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{inv.date}</td>
                    <td className="px-4 py-3.5"><Badge variant={inv.sentEmail?"success":"default"}>{inv.sentEmail?"Sent":"—"}</Badge></td>
                    <td className="px-4 py-3.5"><Badge variant={inv.sentWA?"success":"default"}>{inv.sentWA?"Sent":"—"}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={()=>showToast(`📥 Downloading ${inv.invoiceNo}...`)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>{setInvoices(p=>p.map(i=>i.id===inv.id?{...i,sentEmail:true}:i));showToast(`📧 Emailed to ${inv.studentName}'s parent`);}} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Mail className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>{setInvoices(p=>p.map(i=>i.id===inv.id?{...i,sentWA:true}:i));showToast(`💬 WhatsApp sent`);}} className="p-1.5 text-gray-400 hover:text-green-600 rounded"><MessageCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>setDelInv(inv)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* GENERATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[500px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-gray-900">Generate Invoice</h3></div>
              <button onClick={()=>setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-xs text-gray-500 font-medium">Student Name *</label>
                <input value={form.student} onChange={e=>{upd("student",e.target.value);setStudentSugg(true);}} onFocus={()=>setStudentSugg(true)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search student..." />
                {studentSugg && form.student && suggestedStudents.length>0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestedStudents.map(s=>(
                      <button key={s.id} onClick={()=>{upd("student",s.fullName);upd("class",s.class);upd("division",s.division||"A");setStudentSugg(false);}}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0">
                        <span className="font-medium">{s.fullName}</span><span className="text-gray-400 ml-2">{s.class} Div {s.division}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Class</label>
                  <select value={form.class} onChange={e=>upd("class",e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {CLASS_LIST.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Division</label>
                  <select value={form.division} onChange={e=>upd("division",e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {["A","B","C","Science","Commerce"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                  <select value={form.feeType} onChange={e=>upd("feeType",e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {FEE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e=>upd("amount",e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e=>upd("dueDate",e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Notes</label>
                <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)} rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
              <Button onClick={handleGenerate}><FileText className="w-4 h-4" />Generate & Add</Button>
            </div>
          </Card>
        </div>
      )}

      {delInv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="font-bold text-gray-900">Delete Invoice?</h3><p className="text-sm text-gray-500 mt-1">{delInv.invoiceNo} · {delInv.studentName}</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>setDelInv(null)}>Cancel</Button>
              <Button onClick={()=>{setInvoices(p=>p.filter(i=>i.id!==delInv.id));showToast(`🗑️ ${delInv.invoiceNo} deleted`);setDelInv(null);}} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
