"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockRecentPayments } from "@/lib/mock-data";
import { Plus, Search, Download, Receipt, X, AlertTriangle, UserPlus, ClipboardList } from "lucide-react";

type Payment = {
  id: string; studentName: string; admissionNo: string; class: string;
  amount: number; mode: string; reference: string; date: string; notes: string; status: string;
};

type AssignedFee = {
  id: string; studentName: string; admissionNo: string; class: string;
  feeType: string; category: string; amount: number; frequency: string; dueDay: number; notes: string;
};

const INIT_PAYMENTS: Payment[] = [
  ...mockRecentPayments.map((p: any) => ({ ...p, reference: p.reference || "—", notes: "" })),
  { id: "6", studentName: "Aisha Khan",  admissionNo: "ADM-2024-006", class: "Class 11 - B", amount: 20000, mode: "NEFT",   reference: "NEFT20240528", notes: "", date: "2026-05-28", status: "PAID" },
  { id: "7", studentName: "Rohan Gupta", admissionNo: "ADM-2024-007", class: "Class 7 - A",  amount: 5000,  mode: "CASH",   reference: "—",            notes: "", date: "2026-05-27", status: "PARTIAL" },
  { id: "8", studentName: "Meera Singh", admissionNo: "ADM-2024-008", class: "Class 5 - B",  amount: 32000, mode: "ONLINE", reference: "TXN20240526",  notes: "", date: "2026-05-26", status: "PAID" },
];

const PAYMENT_MODES = ["CASH", "CHEQUE", "NEFT", "UPI", "ONLINE"];
const FREQ = ["Monthly","Quarterly","Half-Yearly","Annually","One-Time","Per Session","Per Term"];
const DEFAULT_CATEGORIES = ["General","Management","NRI","Sports","Staff Ward","Scholarship","SC/ST","EWS","Merit","Early Bird"];
const FEE_TYPES_QUICK = ["Bus Fee","Sports Fee","Lab Fee","Library Fee","Music Fee","Dance Fee","Hostel Fee","Meal Fee","Activity Fee","Tuition Fee","Exam Fee","Uniform Fee"];
const MOCK_STUDENTS = [
  { name:"Aryan Sharma", admissionNo:"ADM-2024-001", class:"Class 10 - A" },
  { name:"Priya Nair",   admissionNo:"ADM-2024-002", class:"Class 8 - B"  },
  { name:"Rahul Verma",  admissionNo:"ADM-2024-003", class:"Class 12 - A" },
  { name:"Sneha Patel",  admissionNo:"ADM-2024-004", class:"Class 6 - C"  },
  { name:"Kiran Reddy",  admissionNo:"ADM-2024-005", class:"Class 9 - A"  },
  { name:"Aisha Khan",   admissionNo:"ADM-2024-006", class:"Class 11 - B" },
  { name:"Rohan Gupta",  admissionNo:"ADM-2024-007", class:"Class 7 - A"  },
  { name:"Meera Singh",  admissionNo:"ADM-2024-008", class:"Class 5 - B"  },
  { name:"Dev Malhotra", admissionNo:"ADM-2024-009", class:"Class 10 - B" },
  { name:"Kavya Menon",  admissionNo:"ADM-2024-010", class:"Class 8 - A"  },
];

const emptyForm = { studentName: "", admissionNo: "", class: "Class 10 - A", amount: "", mode: "CASH", reference: "", date: new Date().toISOString().slice(0, 10), notes: "" };
const emptyAssign = { studentName:"", admissionNo:"", class:"", feeType:"Bus Fee", category:"General", amount:"", frequency:"Monthly", dueDay:"5", notes:"" };

const INIT_ASSIGNED: AssignedFee[] = [
  { id:"af1", studentName:"Aryan Sharma", admissionNo:"ADM-2024-001", class:"Class 10 - A", feeType:"Bus Fee",   category:"General", amount:1200, frequency:"Monthly",  dueDay:5,  notes:"Route A" },
  { id:"af2", studentName:"Kiran Reddy",  admissionNo:"ADM-2024-005", class:"Class 9 - A",  feeType:"Sports Fee",category:"Sports",  amount:500,  frequency:"Quarterly",dueDay:10, notes:"Basketball" },
];

export function PaymentsPage() {
  const [tab, setTab] = useState<"payments"|"assigned">("payments");
  const [payments, setPayments] = useState<Payment[]>(INIT_PAYMENTS);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...emptyForm });
  const [deletePayment, setDeletePayment] = useState<Payment | null>(null);
  const [search, setSearch]       = useState("");
  const [modeFilter, setModeFilter] = useState("All");

  // Assign fee state
  const [assignedFees, setAssignedFees] = useState<AssignedFee[]>(INIT_ASSIGNED);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editAssign, setEditAssign] = useState<AssignedFee | null>(null);
  const [deleteAssign, setDeleteAssign] = useState<AssignedFee | null>(null);
  const [assignForm, setAssignForm] = useState({ ...emptyAssign });
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDrop, setShowStudentDrop] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");

  const [toast, setToast]         = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter(p => p.date === todayStr);
  const todayTotal = todayPayments.reduce((s, p) => s + p.amount, 0);
  const monthTotal = payments.reduce((s, p) => s + p.amount, 0);
  const onlineCount = payments.filter(p => ["ONLINE", "UPI", "NEFT"].includes(p.mode)).length;
  const onlinePct = payments.length ? Math.round((onlineCount / payments.length) * 100) : 0;

  const filtered = payments.filter(p =>
    (p.studentName.toLowerCase().includes(search.toLowerCase()) ||
     p.admissionNo.toLowerCase().includes(search.toLowerCase())) &&
    (modeFilter === "All" || p.mode === modeFilter)
  );

  const handleSave = () => {
    if (!form.studentName.trim()) { showToast("⚠️ Student name is required"); return; }
    if (!form.amount || Number(form.amount) <= 0) { showToast("⚠️ Valid amount is required"); return; }
    const newPayment: Payment = {
      id: String(Date.now()), studentName: form.studentName.trim(),
      admissionNo: form.admissionNo.trim() || `ADM-${Date.now()}`, class: form.class,
      amount: Number(form.amount), mode: form.mode, reference: form.reference.trim() || "—",
      date: form.date, notes: form.notes.trim(), status: "PAID",
    };
    setPayments(prev => [newPayment, ...prev]);
    showToast(`✅ Payment of ${formatCurrency(newPayment.amount)} recorded for ${newPayment.studentName}`);
    setShowForm(false); setForm({ ...emptyForm });
  };

  // Assign fee helpers
  const openAssign = (af?: AssignedFee) => {
    if (af) { setEditAssign(af); setAssignForm({ studentName:af.studentName, admissionNo:af.admissionNo, class:af.class, feeType:af.feeType, category:af.category, amount:String(af.amount), frequency:af.frequency, dueDay:String(af.dueDay), notes:af.notes }); setStudentSearch(af.studentName); }
    else { setEditAssign(null); setAssignForm({ ...emptyAssign }); setStudentSearch(""); }
    setShowAssignModal(true);
  };
  const selectStudent = (s: typeof MOCK_STUDENTS[0]) => {
    setAssignForm(f => ({ ...f, studentName:s.name, admissionNo:s.admissionNo, class:s.class }));
    setStudentSearch(s.name); setShowStudentDrop(false);
  };
  const saveAssign = () => {
    if (!assignForm.studentName.trim()) { showToast("⚠️ Student is required"); return; }
    if (!assignForm.amount || Number(assignForm.amount) <= 0) { showToast("⚠️ Valid amount is required"); return; }
    const base = { studentName:assignForm.studentName.trim(), admissionNo:assignForm.admissionNo.trim(), class:assignForm.class.trim(), feeType:assignForm.feeType.trim(), category:assignForm.category, amount:Number(assignForm.amount), frequency:assignForm.frequency, dueDay:Number(assignForm.dueDay), notes:assignForm.notes.trim() };
    if (editAssign) { setAssignedFees(prev => prev.map(a => a.id === editAssign.id ? { ...a, ...base } : a)); showToast("✅ Fee assignment updated"); }
    else { setAssignedFees(prev => [...prev, { id:String(Date.now()), ...base }]); showToast(`✅ ${assignForm.feeType} assigned to ${assignForm.studentName}`); }
    setShowAssignModal(false); setEditAssign(null);
  };
  const filteredSuggestions = MOCK_STUDENTS.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase())).slice(0, 6);
  const filteredAssigned = assignedFees.filter(a => a.studentName.toLowerCase().includes(assignSearch.toLowerCase()) || a.feeType.toLowerCase().includes(assignSearch.toLowerCase()));

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Payments" subtitle="Record and track fee collections · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-4">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([["payments","Payment Records"],["assigned","Assigned Fees"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{label}</button>
          ))}
          {tab === "payments" && <Button size="sm" className="ml-3" onClick={() => { setForm({ ...emptyForm }); setShowForm(true); }}><Plus className="w-4 h-4" />Record Payment</Button>}
          {tab === "assigned" && <Button size="sm" className="ml-3" onClick={() => openAssign()}><UserPlus className="w-4 h-4" />Assign Fee to Student</Button>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">Today&apos;s Collection</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todayTotal || 27000)}</p>
            <p className="text-xs text-green-600 mt-1">{todayPayments.length || 3} transactions</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(monthTotal)}</p>
            <p className="text-xs text-indigo-600 mt-1">{payments.length} transactions</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">Online vs Offline</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{onlinePct}% / {100 - onlinePct}%</p>
            <p className="text-xs text-gray-500 mt-1">Online adoption</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase font-medium">Total Records</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </Card>
        </div>

        {tab === "payments" && (<>
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name or admission no..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            {["All", ...PAYMENT_MODES].map(m => <option key={m}>{m}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => showToast("📥 Exporting payment records...")}><Download className="w-4 h-4" />Export</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student","Admission No","Class","Amount","Mode","Reference","Date","Status",""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No payments found.</td></tr>}
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">{p.studentName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                        <span className="text-sm font-medium text-gray-900">{p.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.admissionNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.class}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{p.mode}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => showToast(`📥 Downloading invoice for ${p.studentName}...`)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 whitespace-nowrap"><Receipt className="w-3 h-3" />Invoice</button>
                        <button onClick={() => setDeletePayment(p)} className="ml-2 text-xs text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        </>)}

        {/* ── Assigned Fees Tab ── */}
        {tab === "assigned" && (<>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <ClipboardList className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-indigo-900">Student-specific Fee Assignments</p>
              <p className="text-xs text-indigo-700 mt-0.5">Fees like Bus, Sports coaching, Lab, Hostel etc. assigned to individual students only — not the whole class.</p>
            </div>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Assigned Fees</CardTitle>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredAssigned.length} entries</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={assignSearch} onChange={e => setAssignSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-52" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAssigned.length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No fee assignments yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => openAssign()}><Plus className="w-4 h-4" />Assign First Fee</Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {["Student","Class","Fee Type","Category","Amount","Frequency","Due Day","Notes","Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssigned.map(af => (
                      <tr key={af.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">{af.studentName.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{af.studentName}</p>
                              <p className="text-xs text-gray-400">{af.admissionNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{af.class}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{af.feeType}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">{af.category}</span></td>
                        <td className="px-4 py-3 text-sm font-semibold text-indigo-700">{formatCurrency(af.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{af.frequency}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{af.dueDay}th</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{af.notes || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openAssign(af)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Receipt className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteAssign(af)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>)}
      </main>

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Record New Payment</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700">Student Name *</label>
                  <input value={form.studentName} onChange={e => upd("studentName", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Admission No</label>
                  <input value={form.admissionNo} onChange={e => upd("admissionNo", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ADM-2024-001" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Class</label>
                  <input value={form.class} onChange={e => upd("class", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Class 10 - A" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Amount (₹) *</label>
                  <input type="number" value={form.amount} onChange={e => upd("amount", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Payment Mode</label>
                  <select value={form.mode} onChange={e => upd("mode", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Payment Date</label>
                  <input type="date" value={form.date} onChange={e => upd("date", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Reference No</label>
                  <input value={form.reference} onChange={e => upd("reference", e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Cheque / Transaction ID" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-700">Notes</label>
                  <textarea value={form.notes} onChange={e => upd("notes", e.target.value)}
                    rows={2} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Optional notes..." />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave}><Receipt className="w-4 h-4" />Record & Save</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Payment Confirm */}
      {deletePayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Payment?</h3>
                <p className="text-sm text-gray-500 mt-1">{deletePayment.studentName} · {formatCurrency(deletePayment.amount)} · {deletePayment.date}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletePayment(null)}>Cancel</Button>
              <Button onClick={() => { setPayments(p => p.filter(x => x.id !== deletePayment.id)); showToast("🗑️ Payment record deleted"); setDeletePayment(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Assign Fee Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[540px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">{editAssign ? "Edit Fee Assignment" : "Assign Fee to Student"}</h3>
              </div>
              <button onClick={() => { setShowAssignModal(false); setEditAssign(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            {/* Student search */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Search Student *</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={studentSearch}
                  onChange={e => { setStudentSearch(e.target.value); setAssignForm(f => ({ ...f, studentName:e.target.value, admissionNo:"", class:"" })); setShowStudentDrop(true); }}
                  onFocus={() => setShowStudentDrop(true)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type student name or admission no..." />
                {showStudentDrop && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden">
                    {filteredSuggestions.map(s => (
                      <button key={s.admissionNo} onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                          {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.admissionNo} · {s.class}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {assignForm.admissionNo && (
                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <UserPlus className="w-3.5 h-3.5" />{assignForm.admissionNo} · {assignForm.class}
                </div>
              )}
            </div>

            {/* Quick fee type chips */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Fee Type *</label>
              <div className="flex flex-wrap gap-2 mt-2 mb-1">
                {FEE_TYPES_QUICK.map(ft => (
                  <button key={ft} onClick={() => setAssignForm(f => ({ ...f, feeType: ft }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${assignForm.feeType === ft ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}>
                    {ft}
                  </button>
                ))}
              </div>
              <input value={assignForm.feeType} onChange={e => setAssignForm(f => ({ ...f, feeType: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Or type a custom fee name..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Category</label>
                <select value={assignForm.category} onChange={e => setAssignForm(f => ({ ...f, category:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                <input type="number" value={assignForm.amount} onChange={e => setAssignForm(f => ({ ...f, amount:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Frequency</label>
                <select value={assignForm.frequency} onChange={e => setAssignForm(f => ({ ...f, frequency:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {FREQ.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Due Day of Month</label>
                <input type="number" min="1" max="31" value={assignForm.dueDay} onChange={e => setAssignForm(f => ({ ...f, dueDay:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Notes / Remarks</label>
                <input value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Route A - Stop 3, Basketball coaching..." />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowAssignModal(false); setEditAssign(null); }}>Cancel</Button>
              <Button onClick={saveAssign}><UserPlus className="w-4 h-4" />{editAssign ? "Save Changes" : "Assign Fee"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Assign Confirm */}
      {deleteAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Remove Fee Assignment?</h3>
                <p className="text-sm text-gray-500 mt-1">{deleteAssign.feeType} for <strong>{deleteAssign.studentName}</strong> will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteAssign(null)}>Cancel</Button>
              <Button onClick={() => { setAssignedFees(p => p.filter(a => a.id !== deleteAssign.id)); showToast(`🗑️ Fee removed for ${deleteAssign.studentName}`); setDeleteAssign(null); }} className="bg-red-600 hover:bg-red-700 text-white">Remove</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
