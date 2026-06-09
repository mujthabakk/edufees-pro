"use client";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Download, Eye, X, Share2 } from "lucide-react";

const invoices = [
  { id:"INV-2026-001", desc:"June Fees Bundle (Tuition + Transport)",  amount:4500, date:"2026-06-01", mode:"UPI",    status:"PAID", items:["Tuition Fee ₹3,000","Transport Fee ₹1,500"] },
  { id:"INV-2026-002", desc:"May Fees Bundle (Tuition + Transport)",   amount:4500, date:"2026-05-03", mode:"Online", status:"PAID", items:["Tuition Fee ₹3,000","Transport Fee ₹1,500"] },
  { id:"INV-2026-003", desc:"Lab Fee — Annual 2025-26",               amount:1800, date:"2026-04-05", mode:"NEFT",   status:"PAID", items:["Lab Fee ₹2,000","Discount -₹200"] },
  { id:"INV-2026-004", desc:"April Fees Bundle (Tuition + Transport)", amount:4500, date:"2026-04-01", mode:"UPI",   status:"PAID", items:["Tuition Fee ₹3,000","Transport Fee ₹1,500"] },
  { id:"INV-2026-005", desc:"Exam Fee — Term 1",                      amount:800,  date:"—",           mode:"—",     status:"PENDING", items:["Exam Fee ₹800"] },
  { id:"INV-2026-006", desc:"July Fees Bundle",                       amount:4500, date:"—",           mode:"—",     status:"PENDING", items:["Tuition Fee ₹3,000","Transport Fee ₹1,500"] },
];

const STATUS_STYLE: Record<string,string> = {
  PAID:"bg-green-100 text-green-700", PENDING:"bg-amber-100 text-amber-700",
};

export function StudentInvoicesPage() {
  const [view, setView] = useState<typeof invoices[0]|null>(null);
  const [toast, setToast] = useState("");
  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(""),3000); };

  const paid    = invoices.filter(i=>i.status==="PAID");
  const pending = invoices.filter(i=>i.status==="PENDING");

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Invoices</h2>
          <p className="text-sm text-gray-500">All fee receipts · AY 2025-26</p>
        </div>
        <button onClick={() => showToast("📥 Downloading all invoices...")}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Download All</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-xs text-green-700 font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{paid.length}</p>
          <p className="text-xs text-green-600">{formatCurrency(paid.reduce((s,i)=>s+i.amount,0))}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-xs text-amber-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{pending.length}</p>
          <p className="text-xs text-amber-600">{formatCurrency(pending.reduce((s,i)=>s+i.amount,0))}</p>
        </div>
      </div>

      {/* Annual certificate */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-900">Annual Fee Statement 2025-26</p>
          <p className="text-xs text-indigo-600">For tax/employer reimbursement purposes</p>
        </div>
        <button onClick={() => showToast("📥 Generating annual statement...")}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
          Download
        </button>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {invoices.map(inv => (
            <div key={inv.id} className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${inv.status==="PAID"?"bg-green-100":"bg-amber-100"}`}>
                  <span className="text-base">{inv.status==="PAID"?"✅":"⏳"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-700">{inv.id}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[inv.status]}`}>{inv.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{inv.desc}</p>
                  <p className="text-xs text-gray-400">{inv.date !== "—" ? inv.date : "Awaiting payment"} {inv.mode !== "—" && `· ${inv.mode}`}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.amount)}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button onClick={() => setView(inv)} className="p-1 text-gray-400 hover:text-indigo-600 rounded"><Eye className="w-4 h-4" /></button>
                    {inv.status==="PAID" && <button onClick={()=>showToast("📥 Downloading...")} className="p-1 text-gray-400 hover:text-green-600 rounded"><Download className="w-4 h-4" /></button>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {["Invoice #","Description","Amount","Date","Mode","Status","Actions"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                <td className="px-4 py-3 text-sm font-mono font-bold text-indigo-700">{inv.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[220px] truncate">{inv.desc}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(inv.amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{inv.date}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{inv.mode}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[inv.status]}`}>{inv.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={()=>setView(inv)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Eye className="w-4 h-4"/></button>
                    {inv.status==="PAID" && (
                      <>
                        <button onClick={()=>showToast("📥 Downloading...")} className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Download className="w-4 h-4"/></button>
                        <button onClick={()=>showToast("📤 Sharing via WhatsApp...")} className="p-1.5 text-gray-400 hover:text-teal-600 rounded"><Share2 className="w-4 h-4"/></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {view && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Invoice Details</h3>
              <button onClick={()=>setView(null)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            {/* Invoice preview */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-indigo-700 text-white px-4 py-3">
                <p className="text-xs text-indigo-200">Greenfield Academy</p>
                <p className="text-sm font-bold mt-0.5">{view.id}</p>
              </div>
              <div className="px-4 py-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Student</span><span className="font-medium">Aryan Sharma</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Class</span><span className="font-medium">Class 10 – A</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{view.date}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Mode</span><span className="font-medium">{view.mode}</span></div>
                <div className="border-t pt-2 space-y-1">
                  {view.items.map((item,i)=>(
                    <div key={i} className="flex justify-between text-sm text-gray-600"><span>{item.split("₹")[0]}</span><span className="font-medium">₹{item.split("₹")[1]}</span></div>
                  ))}
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span><span className="text-indigo-700">{formatCurrency(view.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[view.status]}`}>{view.status}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {view.status==="PAID" && <>
                <button onClick={()=>{showToast("📥 Downloading PDF...");setView(null);}} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  <Download className="w-4 h-4"/>Download PDF
                </button>
                <button onClick={()=>{showToast("📤 Sharing via WhatsApp...");setView(null);}} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-teal-600">
                  <Share2 className="w-4 h-4"/>
                </button>
              </>}
              {view.status==="PENDING" && (
                <button onClick={()=>setView(null)} className="flex-1 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl">Pay Now</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
