"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { AlertTriangle, CheckCircle, ChevronRight, Download, Smartphone } from "lucide-react";

const student = {
  name: "Aryan Sharma",
  admissionNo: "ADM-2024-001",
  class: "Class 10 - A",
  rollNo: "24",
  school: "Greenfield Academy",
  academicYear: "2025-26",
};

const feeDetails = [
  { id: "1", feeType: "Tuition Fee", dueDate: "2026-06-10", grossAmount: 3000, discount: 0, netAmount: 3000, paid: 3000, status: "PAID" },
  { id: "2", feeType: "Transport Fee", dueDate: "2026-06-10", grossAmount: 1500, discount: 0, netAmount: 1500, paid: 1500, status: "PAID" },
  { id: "3", feeType: "Sports Fee", dueDate: "2026-06-10", grossAmount: 500, discount: 0, netAmount: 500, paid: 500, status: "PAID" },
  { id: "4", feeType: "Tuition Fee", dueDate: "2026-07-10", grossAmount: 3000, discount: 0, netAmount: 3000, paid: 0, status: "PENDING" },
  { id: "5", feeType: "Transport Fee", dueDate: "2026-07-10", grossAmount: 1500, discount: 0, netAmount: 1500, paid: 0, status: "PENDING" },
  { id: "6", feeType: "Lab Fee", dueDate: "2026-04-01", grossAmount: 2000, discount: 200, netAmount: 1800, paid: 1800, status: "PAID" },
];

const recentPayments = [
  { id: "1", invoiceNo: "INV-2026-001", feeType: "June Fees Bundle", amount: 5000, date: "2026-06-01", mode: "ONLINE", status: "PAID" },
  { id: "2", invoiceNo: "INV-2026-002", feeType: "May Fees Bundle", amount: 5000, date: "2026-05-03", mode: "UPI", status: "PAID" },
  { id: "3", invoiceNo: "INV-2026-003", feeType: "Lab Fee (Annual)", amount: 1800, date: "2026-04-05", mode: "NEFT", status: "PAID" },
];

export function DashboardPage() {
  const [showPayModal, setShowPayModal] = useState(false);
  const totalFee = feeDetails.reduce((sum, f) => sum + f.netAmount, 0);
  const totalPaid = feeDetails.reduce((sum, f) => sum + f.paid, 0);
  const totalDue = totalFee - totalPaid;

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/edufees-pro/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Student Profile Hero Card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {student.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{student.name}</h2>
            <p className="text-teal-100 text-xs">{student.class} · Roll {student.rollNo}</p>
            <p className="text-teal-200 text-xs">{student.admissionNo} · AY {student.academicYear}</p>
          </div>
        </div>

        {/* Fee summary stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Total Fees", value: formatCurrency(totalFee) },
            { label: "Paid", value: formatCurrency(totalPaid) },
            { label: "Balance", value: formatCurrency(totalDue), highlight: totalDue > 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-teal-100 text-xs">{s.label}</p>
              <p className={`text-base font-bold mt-0.5 ${s.highlight ? "text-yellow-300" : "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-teal-100 mb-1">
            <span>Payment progress</span>
            <span>{Math.round((totalPaid / totalFee) * 100)}% paid</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-2 bg-white rounded-full" style={{ width: `${(totalPaid / totalFee) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Fee Due Alert */}
      {totalDue > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">Fee Due: {formatCurrency(totalDue)}</p>
              <p className="text-xs text-amber-700 mt-0.5">July fees due by 10 Jul 2026</p>
            </div>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0" onClick={() => setShowPayModal(true)}>
              Pay Now
            </Button>
          </div>
        </div>
      )}

      {/* Fee Breakdown — card list on mobile, table on desktop */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fee Breakdown — AY 2025-26</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-100">
            {feeDetails.map(f => (
              <div key={f.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{f.feeType}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(f.dueDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(f.netAmount)}</p>
                  <StatusBadge status={f.status} />
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <table className="hidden sm:table w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Fee Type", "Due Date", "Amount", "Discount", "Net Amount", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feeDetails.map(f => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{f.feeType}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(f.dueDate)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{formatCurrency(f.grossAmount)}</td>
                  <td className="px-5 py-3.5 text-sm text-green-600">{f.discount > 0 ? `- ${formatCurrency(f.discount)}` : "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(f.netAmount)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Payment History</CardTitle>
          <Link href="/parent/invoices" className="text-sm text-teal-600 font-medium flex items-center gap-1">
            All <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {recentPayments.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.feeType}</p>
                <p className="text-xs text-gray-400">{p.invoiceNo} · {p.mode}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.date)}</p>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact school */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-xl">🏫</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{student.school}</p>
          <p className="text-xs text-gray-500 truncate">contact@greenfield.edu · +91 98765 43210</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0"><Smartphone className="w-3.5 h-3.5" />Call</Button>
      </div>

      {/* Pay Modal — slides up on mobile */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Pay Fee Online</h3>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-xs text-teal-600 font-medium">Paying for</p>
              <p className="text-sm font-semibold text-teal-900 mt-0.5">{student.name} — July 2026 Fees</p>
            </div>
            <div className="space-y-2">
              {feeDetails.filter(f => f.status === "PENDING").map(f => (
                <div key={f.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{f.feeType}</span>
                  <span className="font-medium">{formatCurrency(f.netAmount)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>{formatCurrency(feeDetails.filter(f => f.status === "PENDING").reduce((s, f) => s + f.netAmount, 0))}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Select payment method:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "UPI / GPay", icon: "📱" },
                { label: "Net Banking", icon: "🏦" },
                { label: "Debit Card", icon: "💳" },
                { label: "Credit Card", icon: "💳" },
              ].map(m => (
                <button key={m.label} onClick={() => setShowPayModal(false)}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl text-sm hover:border-teal-400 hover:bg-teal-50 transition-colors">
                  <span>{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400">Secured by Razorpay · 256-bit SSL</p>
          </div>
        </div>
      )}
    </div>
  );
}
