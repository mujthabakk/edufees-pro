"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, ChevronRight, Download, CreditCard, Bell, X } from "lucide-react";

const student = {
  name: "Aryan Sharma",
  admissionNo: "ADM-2024-001",
  class: "Class 10",
  division: "A",
  rollNo: "24",
  school: "Greenfield Academy",
  academicYear: "2025-26",
  quota: "General",
  photo: null,
};

const fees = [
  { id:"1",  type:"Tuition Fee",    month:"June 2026",  due:"2026-06-10", amount:3000, paid:3000, balance:0,    status:"PAID" },
  { id:"2",  type:"Transport Fee",  month:"June 2026",  due:"2026-06-10", amount:1500, paid:1500, balance:0,    status:"PAID" },
  { id:"3",  type:"Sports Fee",     month:"Annual",     due:"2026-06-10", amount:500,  paid:500,  balance:0,    status:"PAID" },
  { id:"4",  type:"Tuition Fee",    month:"July 2026",  due:"2026-07-10", amount:3000, paid:0,    balance:3000, status:"PENDING" },
  { id:"5",  type:"Transport Fee",  month:"July 2026",  due:"2026-07-10", amount:1500, paid:0,    balance:1500, status:"PENDING" },
  { id:"6",  type:"Lab Fee",        month:"Annual",     due:"2026-04-01", amount:2000, paid:1800, balance:200,  status:"PARTIAL" },
  { id:"7",  type:"Exam Fee",       month:"Term 1",     due:"2026-05-15", amount:800,  paid:0,    balance:800,  status:"OVERDUE" },
];

const payments = [
  { id:"1", inv:"INV-2026-001", desc:"June Fees Bundle",  amount:5000, date:"2026-06-01", mode:"UPI",    status:"PAID" },
  { id:"2", inv:"INV-2026-002", desc:"May Fees Bundle",   amount:5000, date:"2026-05-03", mode:"Online", status:"PAID" },
  { id:"3", inv:"INV-2026-003", desc:"Lab Fee (Annual)",  amount:1800, date:"2026-04-05", mode:"NEFT",   status:"PAID" },
];

const STATUS_STYLE: Record<string,string> = {
  PAID:    "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export function StudentDashboardPage() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [payFee, setPayFee]             = useState<typeof fees[0] | null>(null);
  const [coupon, setCoupon]             = useState("");
  const [couponOk, setCouponOk]         = useState(false);
  const [payMode, setPayMode]           = useState("upi");
  const [toast, setToast]               = useState("");
  const [notifOpen, setNotifOpen]       = useState(false);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const totalFee      = fees.reduce((s, f) => s + f.amount,  0);
  const totalPaid     = fees.reduce((s, f) => s + f.paid,    0);
  const totalDue      = fees.reduce((s, f) => s + f.balance, 0);
  const overdueFees   = fees.filter(f => f.status === "OVERDUE");
  const pendingFees   = fees.filter(f => f.status === "PENDING" || f.status === "PARTIAL");
  const upcomingFee   = pendingFees[0];
  const discount      = couponOk ? Math.round((payFee?.balance || 0) * 0.1) : 0;

  // Register PWA service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/edufees-pro/sw.js").catch(() => {});
    }
  }, []);

  const openPay = (fee: typeof fees[0]) => { setPayFee(fee); setCoupon(""); setCouponOk(false); setPayMode("upi"); setShowPayModal(true); };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-fade-in">{toast}</div>}

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {student.name.split(" ").map(n=>n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">{student.name}</h2>
            <p className="text-indigo-200 text-xs">{student.class} – Div {student.division} · Roll {student.rollNo}</p>
            <p className="text-indigo-300 text-xs">{student.admissionNo} · {student.quota} · AY {student.academicYear}</p>
          </div>
          <button onClick={() => setNotifOpen(true)} className="relative p-2 bg-white/10 rounded-xl">
            <Bell className="w-5 h-5 text-white" />
            {overdueFees.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />}
          </button>
        </div>

        {/* Fee summary */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Total Fees</p>
            <p className="text-white text-base font-bold mt-0.5">{formatCurrency(totalFee)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Paid</p>
            <p className="text-green-300 text-base font-bold mt-0.5">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Balance</p>
            <p className={`text-base font-bold mt-0.5 ${totalDue > 0 ? "text-yellow-300" : "text-green-300"}`}>{formatCurrency(totalDue)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-indigo-200 mb-1">
            <span>Payment progress</span>
            <span>{Math.round((totalPaid / totalFee) * 100)}% paid</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all" style={{ width: `${(totalPaid/totalFee)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueFees.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">⚠️ {overdueFees.length} Overdue Fee{overdueFees.length > 1 ? "s" : ""}</p>
              {overdueFees.map(f => (
                <p key={f.id} className="text-xs text-red-600 mt-0.5">{f.type} — {formatCurrency(f.balance)} overdue since {f.due}</p>
              ))}
            </div>
            <button onClick={() => openPay(overdueFees[0])}
              className="shrink-0 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Fee */}
      {upcomingFee && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Next Due: {upcomingFee.type}</p>
            <p className="text-xs text-amber-700">{formatCurrency(upcomingFee.balance)} · Due by {upcomingFee.due}</p>
          </div>
          <button onClick={() => openPay(upcomingFee)}
            className="shrink-0 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
            Pay
          </button>
        </div>
      )}

      {/* Quick Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Paid",    value:fees.filter(f=>f.status==="PAID").length,    color:"text-green-600",  bg:"bg-green-50",  icon:"✅" },
          { label:"Pending", value:pendingFees.length,                          color:"text-amber-600",  bg:"bg-amber-50",  icon:"⏳" },
          { label:"Overdue", value:overdueFees.length,                          color:"text-red-600",    bg:"bg-red-50",    icon:"🔴" },
          { label:"Invoices",value:payments.length,                             color:"text-indigo-600", bg:"bg-indigo-50", icon:"🧾" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fee breakdown cards */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Fee Breakdown — AY {student.academicYear}</h3>
          <Link href="/student/fees" className="text-xs text-indigo-600 font-medium flex items-center gap-1">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {fees.map(f => (
            <div key={f.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{f.type}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.month} · Due {f.due}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(f.amount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span>
                </div>
                {f.balance > 0 && (
                  <button onClick={() => openPay(f)} className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
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
              {["Fee Type","Period","Due Date","Amount","Paid","Balance","Status",""].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.map(f => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{f.type}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{f.month}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{f.due}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(f.amount)}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">{f.paid > 0 ? formatCurrency(f.paid) : "—"}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600">{f.balance > 0 ? formatCurrency(f.balance) : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span>
                </td>
                <td className="px-4 py-3">
                  {f.balance > 0 && (
                    <button onClick={() => openPay(f)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
                      <CreditCard className="w-3 h-3" />Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent Payments</h3>
          <Link href="/student/invoices" className="text-xs text-indigo-600 font-medium flex items-center gap-1">All invoices <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.desc}</p>
                <p className="text-xs text-gray-400">{p.inv} · {p.date} · {p.mode}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                <button onClick={() => showToast("📥 Downloading receipt...")} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* School info */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
        <span className="text-xl shrink-0">🏫</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{student.school}</p>
          <p className="text-xs text-gray-500">contact@greenfield.edu · +91 98765 43210</p>
        </div>
        <button onClick={() => showToast("📞 Contacting school...")}
          className="shrink-0 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600">
          Contact
        </button>
      </div>

      {/* Pay Modal — slide up on mobile */}
      {showPayModal && payFee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Pay Fee Online</h3>
              <button onClick={() => setShowPayModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-indigo-500 font-medium">Paying for</p>
              <p className="text-sm font-bold text-indigo-900 mt-0.5">{payFee.type} — {payFee.month}</p>
              <p className="text-xs text-indigo-600 mt-0.5">Due: {payFee.due}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Amount Due</span><span className="font-semibold">{formatCurrency(payFee.balance)}</span></div>
              {couponOk && <div className="flex justify-between text-sm text-green-600"><span>Coupon EARLYBIRD10</span><span>- {formatCurrency(discount)}</span></div>}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                <span>Total Payable</span>
                <span className="text-indigo-700">{formatCurrency(payFee.balance - discount)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => { if (coupon === "EARLYBIRD10") setCouponOk(true); else showToast("❌ Invalid coupon"); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                  Apply
                </button>
              </div>
              {couponOk && <p className="text-xs text-green-600 mt-1">✅ 10% discount applied!</p>}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[["upi","UPI / GPay"],["card","Debit Card"],["net","Net Banking"]].map(([val,label]) => (
                  <button key={val} onClick={() => setPayMode(val)}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${payMode===val?"border-indigo-600 text-indigo-700 bg-indigo-50":"border-gray-200 text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {payMode === "upi" && (
              <div>
                <label className="text-xs text-gray-500 font-medium">UPI ID</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="yourname@upi" />
              </div>
            )}

            <button onClick={() => { showToast(`✅ Payment of ${formatCurrency(payFee.balance - discount)} successful!`); setShowPayModal(false); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              <CreditCard className="w-4 h-4" />
              Pay {formatCurrency(payFee.balance - discount)} Securely
            </button>
            <p className="text-xs text-center text-gray-400">🔒 Secured by Razorpay · 256-bit SSL</p>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button onClick={() => setNotifOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {[
              { icon:"🔴", msg:"Exam Fee of ₹800 is overdue!",         time:"2 days ago", color:"bg-red-50" },
              { icon:"⏰", msg:"Tuition Fee due on 10 Jul 2026",        time:"5 hours ago", color:"bg-amber-50" },
              { icon:"✅", msg:"June Fees Bundle paid successfully",    time:"Jun 1, 2026", color:"bg-green-50" },
              { icon:"📧", msg:"Invoice INV-2026-001 sent to your email",time:"Jun 1, 2026", color:"bg-blue-50" },
            ].map((n, i) => (
              <div key={i} className={`${n.color} rounded-xl p-3 flex items-start gap-3`}>
                <span className="text-lg">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.msg}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
