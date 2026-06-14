"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useInvoices, useSendInvoice, useGenerateInvoice, useDeleteInvoice, type InvoiceListItem } from "@/lib/api/hooks/useDomains";
import { useStudents } from "@/lib/api/hooks/useStudents";
import { Download, Mail, MessageCircle, Plus, X, FileText, Search, AlertTriangle } from "lucide-react";

type Invoice = {
  id: string; invoiceNo: string; studentName: string; class: string;
  amount: number; date: string; dueDate: string; feeType: string; notes: string;
  sentEmail: boolean; sentWA: boolean;
};

const CLASS_LIST = ["Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const FEE_TYPES  = ["Tuition Fee","Exam Fee","Transport Fee","Lab Fee","Activity Fee","Annual Fee","Sports Fee","Library Fee"];

const toInvoice = (raw: any): Invoice => ({
  id: raw.id,
  invoiceNo: raw.invoiceNo,
  studentName: raw.studentName,
  class: raw.class,
  amount: raw.amount,
  date: raw.date,
  dueDate: raw.dueDate || "",
  feeType: raw.feeType || "Tuition Fee",
  notes: raw.notes || "",
  sentEmail: !!raw.sentEmail,
  sentWA: !!raw.sentWA,
});

const emptyForm = { student: "", class: "Class 10", feeType: "Tuition Fee", amount: "", dueDate: "", notes: "" };

const apiToInvoice = (raw: InvoiceListItem): Invoice => ({
  id: raw.id,
  invoiceNo: raw.invoiceNo,
  studentName: raw.studentName,
  class: raw.class,
  amount: raw.amount,
  date: raw.date ? raw.date.slice(0, 10) : "",
  dueDate: "",
  feeType: "Tuition Fee",
  notes: "",
  sentEmail: raw.sentEmail,
  sentWA: raw.sentWA,
});

export function InvoicesPage() {
  const invoicesQuery = useInvoices({ pageSize: 100 });
  const sendInvoice = useSendInvoice();
  const generateInvoice = useGenerateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const studentsQuery = useStudents({ pageSize: 200 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch]     = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm]   = useState({ ...emptyForm });
  const [deleteInv, setDeleteInv] = useState<Invoice | null>(null);
  const [toast, setToast]       = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const studentOptions = (studentsQuery.data?.data ?? []).map(s => ({
    id: s.id,
    fullName: s.fullName,
    admissionNo: s.admissionNo,
    class: s.className ?? "",
  }));

  useEffect(() => {
    if (invoicesQuery.data?.data) setInvoices(invoicesQuery.data.data.map(apiToInvoice));
  }, [invoicesQuery.data]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const upd = (k: string, v: string) => setGenForm(f => ({ ...f, [k]: v }));

  const filtered = invoices.filter(inv =>
    inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    if (!genForm.student.trim()) { showToast("⚠️ Student name is required"); return; }
    if (!genForm.amount || Number(genForm.amount) <= 0) { showToast("⚠️ Valid amount is required"); return; }
    const match = selectedStudentId
      ? studentOptions.find(s => s.id === selectedStudentId)
      : studentOptions.find(s =>
          s.fullName.toLowerCase() === genForm.student.trim().toLowerCase() ||
          s.admissionNo.toLowerCase() === genForm.student.trim().toLowerCase()
        );
    if (!match) { showToast("⚠️ Select a valid student"); return; }
    generateInvoice.mutate(
      {
        studentId: match.id,
        amount: Number(genForm.amount),
        notes: [genForm.feeType, genForm.notes.trim()].filter(Boolean).join(" — ") || undefined,
        paymentMode: "CASH",
      },
      {
        onSuccess: () => {
          showToast(`✅ Invoice generated for ${match.fullName}`);
          setShowGenModal(false);
          setGenForm({ ...emptyForm });
          setSelectedStudentId("");
        },
        onError: () => showToast("❌ Failed to generate invoice"),
      },
    );
  };

  const sendEmail = (inv: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, sentEmail: true } : i));
    showToast(`📧 Invoice emailed to ${inv.studentName}'s parent`);
    sendInvoice.mutate({ id: inv.id, channel: "EMAIL" });
  };

  const sendWA = (inv: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, sentWA: true } : i));
    showToast(`💬 Invoice sent via WhatsApp to ${inv.studentName}'s parent`);
    sendInvoice.mutate({ id: inv.id, channel: "WHATSAPP" });
  };

  const emailCount = invoices.filter(i => i.sentEmail).length;
  const waCount    = invoices.filter(i => i.sentWA).length;

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Invoices" subtitle="Generate and manage fee invoices · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: invoices.length,  color: "text-gray-900" },
            { label: "Email Sent",     value: emailCount,        color: "text-blue-600" },
            { label: "WhatsApp Sent",  value: waCount,           color: "text-green-600" },
            { label: "This Month",     value: invoices.filter(i => i.date.startsWith("2026-06")).length || invoices.length, color: "text-indigo-600" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or invoice no..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <Button variant="outline" size="sm" onClick={() => showToast("📥 Exporting invoice list...")}><Download className="w-4 h-4" />Export</Button>
          <Button size="sm" onClick={() => { setGenForm({ ...emptyForm }); setShowGenModal(true); }}><Plus className="w-4 h-4" />Generate Invoice</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Invoices ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice No","Student","Class","Fee Type","Amount","Date","Email","WhatsApp","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">No invoices found.</td></tr>
                )}
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-mono font-semibold text-indigo-700">{inv.invoiceNo}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">{inv.studentName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{inv.class}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{inv.feeType}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{inv.date}</td>
                    <td className="px-5 py-3.5"><Badge variant={inv.sentEmail ? "success" : "default"}>{inv.sentEmail ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5"><Badge variant={inv.sentWA ? "success" : "default"}>{inv.sentWA ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 items-center">
                        <button onClick={() => showToast(`📥 Downloading ${inv.invoiceNo}...`)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => sendEmail(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Send Email"><Mail className="w-3.5 h-3.5" /></button>
                        <button onClick={() => sendWA(inv)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Send WhatsApp"><MessageCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteInv(inv)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* Generate Invoice Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[480px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Generate Invoice</h3>
              </div>
              <button onClick={() => setShowGenModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Student Name *</label>
                <input value={genForm.student} onChange={e => upd("student", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Class</label>
                  <select value={genForm.class} onChange={e => upd("class", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {CLASS_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                  <select value={genForm.feeType} onChange={e => upd("feeType", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                  <input type="number" value={genForm.amount} onChange={e => upd("amount", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Due Date</label>
                  <input type="date" value={genForm.dueDate} onChange={e => upd("dueDate", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Notes</label>
                <textarea value={genForm.notes} onChange={e => upd("notes", e.target.value)}
                  rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowGenModal(false)}>Cancel</Button>
              <Button onClick={handleGenerate}><FileText className="w-4 h-4" />Generate & Add</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteInv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Invoice?</h3>
                <p className="text-sm text-gray-500 mt-1">{deleteInv.invoiceNo} · {deleteInv.studentName} — will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteInv(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!deleteInv) return;
                deleteInvoice.mutate(deleteInv.id, {
                  onSuccess: () => { showToast(`🗑️ ${deleteInv.invoiceNo} deleted`); setDeleteInv(null); },
                  onError: () => showToast("❌ Failed to delete invoice"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
