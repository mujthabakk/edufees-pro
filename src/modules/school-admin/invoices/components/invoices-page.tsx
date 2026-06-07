"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockInvoices } from "@/lib/mock-data";
import { Download, Mail, MessageCircle, Plus, X, FileText, Search } from "lucide-react";

const CLASS_LIST = ["Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];

export function InvoicesPage() {
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ student: "", class: "Class 10", feeType: "Tuition Fee", amount: "", dueDate: "", notes: "" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = mockInvoices.filter(inv =>
    inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    if (!genForm.student || !genForm.amount) { showToast("⚠️ Student and amount are required"); return; }
    showToast(`✅ Invoice generated for ${genForm.student}`);
    setShowGenModal(false);
    setGenForm({ student: "", class: "Class 10", feeType: "Tuition Fee", amount: "", dueDate: "", notes: "" });
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Invoices" subtitle="Generate and manage fee invoices · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: mockInvoices.length, color: "text-gray-900", bg: "bg-gray-50" },
            { label: "Email Sent", value: mockInvoices.filter(i => i.sentEmail).length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "WhatsApp Sent", value: mockInvoices.filter(i => i.sentWA).length, color: "text-green-600", bg: "bg-green-50" },
            { label: "This Month", value: mockInvoices.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className={`text-xs text-gray-500 font-medium`}>{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or invoice no..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <Button variant="outline" size="sm" onClick={() => showToast("📥 Exporting invoice list...")}><Download className="w-4 h-4" />Export</Button>
          <Button size="sm" onClick={() => setShowGenModal(true)}><Plus className="w-4 h-4" />Generate Invoice</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice No", "Student", "Class", "Amount", "Date", "Email", "WhatsApp", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-mono font-semibold text-indigo-700">{inv.invoiceNo}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">{inv.studentName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{inv.class}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{inv.date}</td>
                    <td className="px-5 py-3.5"><Badge variant={inv.sentEmail ? "success" : "default"}>{inv.sentEmail ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5"><Badge variant={inv.sentWA ? "success" : "default"}>{inv.sentWA ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => showToast(`📥 Downloading ${inv.invoiceNo}...`)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast(`📧 Invoice emailed to ${inv.studentName}'s parent`)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Email"><Mail className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast(`💬 Invoice sent via WhatsApp to ${inv.studentName}'s parent`)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="WhatsApp"><MessageCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No invoices found.</div>}
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
                <label className="text-xs text-gray-500 font-medium">Student Name / Admission No *</label>
                <input value={genForm.student} onChange={e => setGenForm(f => ({ ...f, student: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search student..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Class</label>
                  <select value={genForm.class} onChange={e => setGenForm(f => ({ ...f, class: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {CLASS_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                  <select value={genForm.feeType} onChange={e => setGenForm(f => ({ ...f, feeType: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {["Tuition Fee","Exam Fee","Transport Fee","Lab Fee","Activity Fee","Annual Fee"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                  <input type="number" value={genForm.amount} onChange={e => setGenForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Due Date</label>
                  <input type="date" value={genForm.dueDate} onChange={e => setGenForm(f => ({ ...f, dueDate: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Notes</label>
                <textarea value={genForm.notes} onChange={e => setGenForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowGenModal(false)}>Cancel</Button>
              <Button onClick={handleGenerate}><FileText className="w-4 h-4" />Generate & Download</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
