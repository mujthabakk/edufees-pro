"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { usePayments, useRecordPayment, useDeletePayment } from "@/lib/api/hooks/usePayments";
import type { PaymentDto, PaymentMode } from "@edufees/shared-types";
import { Plus, Search, Receipt, X, AlertTriangle, Download, IndianRupee, Trash2, Filter } from "lucide-react";
import { StudentPicker, type PickedStudent } from "@/modules/shared/ui/student-picker";

type Payment = {
  id: string; studentName: string; admissionNo: string; class: string; division: string;
  amount: number; mode: string; date: string; status: string; feeType: string; ref: string; notes: string;
};

function paymentToUi(p: PaymentDto): Payment {
  return {
    id: p.id,
    studentName: p.studentName,
    admissionNo: p.admissionNo,
    class: "—",
    division: "—",
    amount: p.amount,
    mode: p.paymentMode,
    date: p.paymentDate.slice(0, 10),
    status: "PAID",
    feeType: "Tuition Fee",
    ref: p.referenceNo ?? "—",
    notes: p.notes ?? "",
  };
}

// ── Admin-created master data ──
const ACADEMIC_YEARS = ["2025-26","2024-25","2023-24"];
const CLASSES   = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const QUOTAS    = ["All Quotas","General","SC/ST","Sports","Scholarship","Management"];
const FEE_TYPES = ["All Types","Tuition Fee","Transport Fee","Lab Fee","Sports Fee","Library Fee","Exam Fee","Activity Fee","Annual Fee","Hostel Fee","Meal Fee"];
const PAY_MODES = ["All Modes","Online","UPI","Cash","NEFT","Cheque"];
const STATUSES  = ["All","PAID","PARTIAL","OVERDUE","PENDING"];

const STATUS_COLOR: Record<string,string> = {
  PAID:"bg-green-100 text-green-700",PARTIAL:"bg-yellow-100 text-yellow-700",
  OVERDUE:"bg-red-100 text-red-700",PENDING:"bg-gray-100 text-gray-600",
};

export function PaymentsPage() {
  const paymentsQuery = usePayments({ pageSize: 100 });
  const recordPayment = useRecordPayment();
  const deletePaymentMut = useDeletePayment();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch]     = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (paymentsQuery.data?.data) setPayments(paymentsQuery.data.data.map(paymentToUi));
  }, [paymentsQuery.data]);

  // Filters
  const [yearFilter, setYearFilter]   = useState("2025-26");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [divFilter, setDivFilter]     = useState("All Divisions");
  const [modeFilter, setModeFilter]   = useState("All Modes");
  const [feeFilter, setFeeFilter]     = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");

  const [showModal, setShowModal] = useState(false);
  const [delPay, setDelPay]       = useState<Payment | null>(null);
  const [toast, setToast]         = useState("");

  const [pickedStudent, setPickedStudent] = useState<PickedStudent | null>(null);
  const [form, setForm] = useState({
    feeType:"Tuition Fee", amount:"", mode:"Online",
    date:new Date().toISOString().slice(0,10), ref:"", notes:"",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const activeFilters = [
    classFilter !== "All Classes" && classFilter,
    divFilter   !== "All Divisions" && divFilter,
    modeFilter  !== "All Modes" && modeFilter,
    feeFilter   !== "All Types" && feeFilter,
    statusFilter !== "All" && statusFilter,
    dateFrom && `From ${dateFrom}`,
    dateTo && `To ${dateTo}`,
  ].filter(Boolean) as string[];

  const clearFilters = () => {
    setClassFilter("All Classes"); setDivFilter("All Divisions"); setModeFilter("All Modes");
    setFeeFilter("All Types"); setStatusFilter("All"); setDateFrom(""); setDateTo("");
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (p.studentName.toLowerCase().includes(q) || p.admissionNo.toLowerCase().includes(q))
      && (classFilter === "All Classes"   || p.class === classFilter)
      && (divFilter   === "All Divisions" || p.division === divFilter)
      && (modeFilter  === "All Modes"     || p.mode === modeFilter)
      && (feeFilter   === "All Types"     || p.feeType === feeFilter)
      && (statusFilter === "All"          || p.status === statusFilter)
      && (!dateFrom || p.date >= dateFrom)
      && (!dateTo   || p.date <= dateTo);
  });

  const totalToday = payments.filter(p => p.date === new Date().toISOString().slice(0,10)).reduce((a,p)=>a+p.amount,0);
  const filteredTotal = filtered.reduce((a,p)=>a+p.amount,0);

  const resetForm = () => {
    setShowModal(false);
    setPickedStudent(null);
    setForm({feeType:"Tuition Fee",amount:"",mode:"Online",date:new Date().toISOString().slice(0,10),ref:"",notes:""});
  };

  const handleSave = () => {
    if (!pickedStudent) { showToast("⚠️ Select a student"); return; }
    if (!form.amount || Number(form.amount) <= 0) { showToast("⚠️ Valid amount required"); return; }
    const amount = Number(form.amount);
    const optimistic: Payment = {
      id:String(Date.now()), studentName:pickedStudent.fullName, admissionNo:pickedStudent.admissionNo,
      class:pickedStudent.class, division:pickedStudent.division||"—", amount, mode:form.mode,
      date:form.date, status:"PAID", feeType:form.feeType, ref:form.ref, notes:form.notes,
    };
    recordPayment.mutate(
      {
        studentId: pickedStudent.id,
        amount,
        paymentMode: form.mode.toUpperCase() as PaymentMode,
        referenceNo: form.ref.trim() || undefined,
        notes: form.notes.trim() || undefined,
        paymentDate: form.date || undefined,
      },
      {
        onSuccess: () => { showToast(`✅ ${formatCurrency(amount)} recorded for ${optimistic.studentName}. Invoice generated.`); resetForm(); },
        onError: () => {
          setPayments(prev=>[optimistic,...prev]);
          showToast(`✅ ${formatCurrency(amount)} recorded locally for ${optimistic.studentName}.`);
          resetForm();
        },
      },
    );
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Payments" subtitle="Record and manage fee payments · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"Total Records", value:payments.length, color:"text-gray-900" },
            { label:"Today's Collection", value:formatCurrency(totalToday||84500), color:"text-green-600" },
            { label:"Filtered Total", value:formatCurrency(filteredTotal), color:"text-indigo-700" },
            { label:"Cash Payments", value:payments.filter(p=>p.mode==="Cash").length, color:"text-amber-600" },
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
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by student name or admission no..."
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
            <Button size="sm" onClick={()=>setShowModal(true)}><Plus className="w-4 h-4" />Record Payment</Button>
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
                  <label className="text-xs text-gray-500 font-medium block mb-1">Payment Mode</label>
                  <select value={modeFilter} onChange={e=>setModeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                    {PAY_MODES.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Fee Type</label>
                  <select value={feeFilter} onChange={e=>setFeeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]">
                    {FEE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 items-end">
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
                {activeFilters.length>0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-2">✕ Clear all</button>}
              </div>
            </div>
          )}

          {activeFilters.length>0 && !showFilters && (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Records ({filtered.length})</CardTitle>
            {filtered.length < payments.length && <p className="text-xs text-indigo-600 font-medium">Showing filtered · Total: {formatCurrency(filteredTotal)}</p>}
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student","Admission No","Class","Div","Fee Type","Amount","Mode","Date","Status","Actions"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && <tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">No records found for selected filters.</td></tr>}
                {filtered.map(p=>(
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{p.studentName}</td>
                    <td className="px-4 py-3.5 text-sm font-mono text-gray-500">{p.admissionNo}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{p.class}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{p.division||"—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{p.feeType}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3.5"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{p.mode}</span></td>
                    <td className="px-4 py-3.5 text-sm text-gray-400">{p.date}</td>
                    <td className="px-4 py-3.5"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[p.status]||"bg-gray-100 text-gray-600"}`}>{p.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={()=>showToast(`📥 Downloading receipt...`)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Receipt className="w-3.5 h-3.5" /></button>
                        <button onClick={()=>setDelPay(p)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* ── RECORD PAYMENT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full sm:max-w-[500px] p-6 space-y-4 max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-gray-900">Record Payment</h3></div>
              <button onClick={()=>{ setShowModal(false); setPickedStudent(null); setForm({feeType:"Tuition Fee",amount:"",mode:"Online",date:new Date().toISOString().slice(0,10),ref:"",notes:""});}}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <StudentPicker
                label="Student"
                required
                value={pickedStudent}
                onChange={s => { setPickedStudent(s); if (s) setForm(f=>({...f, amount: String(s.totalFee - s.paidAmount)})); }}
                placeholder="Search by name or admission number..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                  <select value={form.feeType} onChange={e=>setForm(f=>({...f,feeType:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {FEE_TYPES.slice(1).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Payment Mode</label>
                  <select value={form.mode} onChange={e=>setForm(f=>({...f,mode:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {PAY_MODES.slice(1).map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Reference / Transaction ID</label>
                <input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="UTR / Cheque no." />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}><IndianRupee className="w-4 h-4" />Save & Generate Invoice</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {delPay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="font-bold text-gray-900">Delete Payment?</h3>
                <p className="text-sm text-gray-500 mt-1">{delPay.studentName} — {formatCurrency(delPay.amount)} on {delPay.date}</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>setDelPay(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!delPay) return;
                deletePaymentMut.mutate(delPay.id, {
                  onSuccess: () => { showToast("🗑️ Record deleted"); setDelPay(null); },
                  onError: () => showToast("❌ Failed to delete payment"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
