"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { GraduationCap, Home, FileText, CreditCard, LogOut, Bell, Download, CheckCircle, Clock, AlertTriangle, ChevronRight, Smartphone } from "lucide-react";

const student = {
  name: "Aryan Sharma",
  admissionNo: "ADM-2024-001",
  class: "Class 10 - A",
  rollNo: "24",
  school: "Greenfield Academy",
  photo: null,
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

const navLinks = [
  { label: "Home", href: "/parent/dashboard", icon: Home },
  { label: "Fee Details", href: "/parent/fees", icon: CreditCard },
  { label: "Invoices", href: "/parent/invoices", icon: FileText },
];

export function DashboardPage() {
  const [showPayModal, setShowPayModal] = useState(false);
  const totalFee = feeDetails.reduce((sum, f) => sum + f.netAmount, 0);
  const totalPaid = feeDetails.reduce((sum, f) => sum + f.paid, 0);
  const totalDue = totalFee - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">EduFees Pro</span>
          </div>
          <nav className="flex gap-1">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <Link href="/" className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-3.5 h-3.5" />Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Student Profile Card */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {student.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span className="text-teal-100 text-sm">Admission: {student.admissionNo}</span>
                <span className="text-teal-100 text-sm">{student.class}</span>
                <span className="text-teal-100 text-sm">Roll No: {student.rollNo}</span>
              </div>
              <p className="text-teal-200 text-xs mt-1">{student.school} · AY {student.academicYear}</p>
            </div>
          </div>

          {/* Fee summary in card */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <p className="text-teal-100 text-xs">Total Fees</p>
              <p className="text-white text-lg font-bold mt-0.5">{formatCurrency(totalFee)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <p className="text-teal-100 text-xs">Amount Paid</p>
              <p className="text-white text-lg font-bold mt-0.5">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <p className="text-teal-100 text-xs">Balance Due</p>
              <p className={`text-lg font-bold mt-0.5 ${totalDue > 0 ? "text-yellow-300" : "text-green-300"}`}>{formatCurrency(totalDue)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-teal-100 mb-1">
              <span>Payment progress</span>
              <span>{Math.round((totalPaid / totalFee) * 100)}% paid</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${(totalPaid / totalFee) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Pay Now CTA */}
        {totalDue > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Fee Due: {formatCurrency(totalDue)}</p>
                <p className="text-xs text-yellow-700">July fees due by 10 Jul 2026. Pay now to avoid late charges.</p>
              </div>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white shrink-0" onClick={() => setShowPayModal(true)}>
              Pay Now
            </Button>
          </div>
        )}

        {/* Pay Online Modal */}
        {showPayModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Pay Fee Online</CardTitle>
                <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <button key={m.label} onClick={() => setShowPayModal(false)} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl text-sm hover:border-teal-400 hover:bg-teal-50 transition-colors">
                      <span>{m.icon}</span>{m.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-gray-400">Secured by Razorpay · 256-bit SSL</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fee Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fee Breakdown — AY 2025-26</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Fee Type", "Due Date", "Amount", "Discount", "Net Amount", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feeDetails.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Link href="/parent/invoices" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              All invoices <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.feeType}</p>
                    <p className="text-xs text-gray-500">{p.invoiceNo} · {formatDate(p.date)} · {p.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact school */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl">🏫</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Greenfield Academy</p>
                <p className="text-xs text-gray-500">contact@greenfield.edu · +91 98765 43210</p>
              </div>
            </div>
            <Button variant="outline" size="sm"><Smartphone className="w-3.5 h-3.5" />Contact School</Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
