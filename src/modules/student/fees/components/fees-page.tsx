"use client";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Download, X, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const fees = [
  { id:"1",  type:"Tuition Fee",   month:"April 2026",  due:"2026-04-10", amount:3000, paid:3000, balance:0,    status:"PAID"    },
  { id:"2",  type:"Transport Fee", month:"April 2026",  due:"2026-04-10", amount:1500, paid:1500, balance:0,    status:"PAID"    },
  { id:"3",  type:"Tuition Fee",   month:"May 2026",    due:"2026-05-10", amount:3000, paid:3000, balance:0,    status:"PAID"    },
  { id:"4",  type:"Transport Fee", month:"May 2026",    due:"2026-05-10", amount:1500, paid:1500, balance:0,    status:"PAID"    },
  { id:"5",  type:"Tuition Fee",   month:"June 2026",   due:"2026-06-10", amount:3000, paid:3000, balance:0,    status:"PAID"    },
  { id:"6",  type:"Transport Fee", month:"June 2026",   due:"2026-06-10", amount:1500, paid:1500, balance:0,    status:"PAID"    },
  { id:"7",  type:"Lab Fee",       month:"Annual",      due:"2026-04-01", amount:2000, paid:1800, balance:200,  status:"PARTIAL" },
  { id:"8",  type:"Exam Fee",      month:"Term 1",      due:"2026-05-15", amount:800,  paid:0,    balance:800,  status:"OVERDUE" },
  { id:"9",  type:"Tuition Fee",   month:"July 2026",   due:"2026-07-10", amount:3000, paid:0,    balance:3000, status:"PENDING" },
  { id:"10", type:"Transport Fee", month:"July 2026",   due:"2026-07-10", amount:1500, paid:0,    balance:1500, status:"PENDING" },
  { id:"11", type:"Sports Fee",    month:"Annual",      due:"2026-06-10", amount:500,  paid:500,  balance:0,    status:"PAID"    },
  { id:"12", type:"Activity Fee",  month:"Term 2",      due:"2026-10-01", amount:1200, paid:0,    balance:1200, status:"PENDING" },
];

const STATUS_STYLE: Record<string,string> = {
  PAID:"bg-green-100 text-green-700", PENDING:"bg-amber-100 text-amber-700",
  PARTIAL:"bg-yellow-100 text-yellow-700", OVERDUE:"bg-red-100 text-red-700",
};

const STATUS_FILTERS = ["All","PAID","PENDING","PARTIAL","OVERDUE"];

export function StudentFeesPage() {
  const [filter, setFilter]         = useState("All");
  const [showPay, setShowPay]       = useState(false);
  const [payFee, setPayFee]         = useState<typeof fees[0]|null>(null);
  const [coupon, setCoupon]         = useState("");
  const [couponOk, setCouponOk]     = useState(false);
  const [payMode, setPayMode]       = useState("upi");
  const [toast, setToast]           = useState("");

  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(""),3000); };

  const visible = filter === "All" ? fees : fees.filter(f => f.status === filter);
  const totalDue = fees.reduce((s,f)=>s+f.balance,0);
  const totalPaid = fees.reduce((s,f)=>s+f.paid,0);
  const discount = couponOk ? Math.round((payFee?.balance||0)*0.1) : 0;

  const openPay = (f: typeof fees[0]) => { setPayFee(f); setCoupon(""); setCouponOk(false); setPayMode("upi"); setShowPay(true); };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Fees</h2>
          <p className="text-sm text-gray-500">Aryan Sharma · Class 10-A · AY 2025-26</p>
        </div>
        <button onClick={() => showToast("📥 Downloading fee statement...")}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600">
          <Download className="w-4 h-4" /><span className="hidden sm:inline">Statement</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Total Due",   value:formatCurrency(totalDue),                            color:"text-red-600",    bg:"bg-red-50",    icon:<AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label:"Total Paid",  value:formatCurrency(totalPaid),                           color:"text-green-700",  bg:"bg-green-50",  icon:<CheckCircle className="w-4 h-4 text-green-500" /> },
          { label:"Pending",     value:fees.filter(f=>f.status==="PENDING"||f.status==="PARTIAL").length+" fees", color:"text-amber-700",  bg:"bg-amber-50",  icon:<Clock className="w-4 h-4 text-amber-500" /> },
          { label:"Overdue",     value:fees.filter(f=>f.status==="OVERDUE").length+" fees", color:"text-red-700",    bg:"bg-red-50",    icon:<AlertTriangle className="w-4 h-4 text-red-600" /> },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-1.5 mb-1">{s.icon}<p className="text-xs text-gray-500 font-medium">{s.label}</p></div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pay all due button */}
      {totalDue > 0 && (
        <button onClick={() => { const f = fees.find(x=>x.balance>0); if(f) openPay(f); }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
          <CreditCard className="w-4 h-4" />Pay All Dues — {formatCurrency(totalDue)}
        </button>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter===s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
            {s} {s!=="All" && `(${fees.filter(f=>f.status===s).length})`}
          </button>
        ))}
      </div>

      {/* Fee list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {visible.length === 0 && <p className="px-4 py-8 text-center text-gray-400 text-sm">No fees found 🎉</p>}
          {visible.map(f => (
            <div key={f.id} className={`px-4 py-3.5 ${f.status==="OVERDUE"?"bg-red-50/40":""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{f.type}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{f.month} · Due {f.due}</p>
                  <div className="flex gap-3 mt-1.5 text-xs">
                    <span className="text-gray-500">Amount: <span className="font-semibold text-gray-800">{formatCurrency(f.amount)}</span></span>
                    {f.paid > 0 && <span className="text-green-600 font-semibold">Paid: {formatCurrency(f.paid)}</span>}
                    {f.balance > 0 && <span className="text-red-600 font-bold">Due: {formatCurrency(f.balance)}</span>}
                  </div>
                </div>
                {f.balance > 0 && (
                  <button onClick={() => openPay(f)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg">
                    <CreditCard className="w-3 h-3" />Pay
                  </button>
                )}
                {f.status === "PAID" && (
                  <button onClick={() => showToast("📥 Downloading receipt...")}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-green-600 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {["Fee Type","Period","Due Date","Amount","Paid","Balance","Status","Action"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(f => (
              <tr key={f.id} className={`border-b border-gray-50 hover:bg-gray-50/60 ${f.status==="OVERDUE"?"bg-red-50/30":""}`}>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{f.type}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{f.month}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{f.due}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(f.amount)}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">{f.paid>0?formatCurrency(f.paid):"—"}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{f.balance>0?formatCurrency(f.balance):"—"}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span></td>
                <td className="px-4 py-3">
                  {f.balance>0 ? (
                    <button onClick={()=>openPay(f)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                      <CreditCard className="w-3 h-3"/>Pay
                    </button>
                  ) : (
                    <button onClick={()=>showToast("📥 Downloading...")} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg">
                      <Download className="w-4 h-4"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pay Modal */}
      {showPay && payFee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Pay Fee</h3>
              <button onClick={() => setShowPay(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-1">
              <p className="text-xs text-indigo-500 font-medium">Paying for</p>
              <p className="text-sm font-bold text-indigo-900">{payFee.type} — {payFee.month}</p>
              <p className="text-xs text-indigo-600">Due: {payFee.due}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Amount Due</span><span className="font-semibold">{formatCurrency(payFee.balance)}</span></div>
              {couponOk && <div className="flex justify-between text-sm text-green-600"><span>Coupon Discount</span><span>- {formatCurrency(discount)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-indigo-700">{formatCurrency(payFee.balance-discount)}</span></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={()=>{if(coupon==="EARLYBIRD10")setCouponOk(true);else showToast("❌ Invalid coupon");}}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50">Apply</button>
              </div>
              {couponOk && <p className="text-xs text-green-600 mt-1">✅ 10% discount applied!</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[["upi","UPI"],["card","Card"],["net","Net Banking"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setPayMode(v)}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${payMode===v?"border-indigo-600 text-indigo-700 bg-indigo-50":"border-gray-200 text-gray-600"}`}>{l}</button>
                ))}
              </div>
            </div>
            {payMode==="upi" && <div><label className="text-xs text-gray-500 font-medium">UPI ID</label><input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="yourname@upi"/></div>}
            <button onClick={()=>{showToast(`✅ ₹${payFee.balance-discount} paid!`);setShowPay(false);}}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
              Pay {formatCurrency(payFee.balance-discount)} Securely 🔒
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
