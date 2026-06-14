"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { useMyStudent, useMyFees, useMyInvoices } from "@/lib/api/hooks/usePortal";
import { useSchoolProfile } from "@/lib/api/hooks/useSettings";
import { AlertTriangle, CheckCircle, ChevronRight, CreditCard } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export function StudentDashboardPage() {
  const { data: studentData } = useMyStudent();
  const { data: feesData = [] } = useMyFees();
  const { data: invoicesData = [] } = useMyInvoices();
  const { data: school } = useSchoolProfile();

  const student = {
    name: studentData?.fullName ?? "—",
    admissionNo: studentData?.admissionNo ?? "—",
    class: `${studentData?.className ?? ""}${studentData?.divisionName ? ` - ${studentData.divisionName}` : ""}`.trim() || "—",
    school: school?.name ?? "—",
  };

  const fees = feesData.map(f => ({
    id: f.id,
    type: f.feeTypeName,
    due: f.dueDate.slice(0, 10),
    amount: f.netAmount,
    paid: f.paidAmount,
    balance: f.netAmount - f.paidAmount,
    status: f.status,
  }));

  const payments = invoicesData.map(inv => ({
    id: inv.id,
    inv: inv.invoiceNo,
    desc: inv.invoiceNo,
    amount: inv.amount,
    date: inv.date.slice(0, 10),
  }));

  const totalFee = studentData?.totalFee ?? fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = studentData?.paidAmount ?? fees.reduce((s, f) => s + f.paid, 0);
  const totalDue = studentData?.balance ?? totalFee - totalPaid;
  const overdueFees = fees.filter(f => f.status === "OVERDUE");
  const pendingFees = fees.filter(f => f.status === "PENDING" || (f.balance > 0 && f.paid > 0));

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/edufees-pro/sw.js").catch(() => {});
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {student.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-lg font-bold">{student.name}</h2>
            <p className="text-indigo-200 text-xs">{student.class}</p>
            <p className="text-indigo-300 text-xs">{student.admissionNo}</p>
          </div>
        </div>
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
      </div>

      {overdueFees.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{overdueFees.length} overdue fee{overdueFees.length > 1 ? "s" : ""}</p>
            {overdueFees.map(f => (
              <p key={f.id} className="text-xs text-red-600">{f.type} — {formatCurrency(f.balance)}</p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Fee Breakdown</h3>
          <Link href="/student/fees" className="text-xs text-indigo-600 font-medium flex items-center gap-1">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {fees.length === 0 && <p className="px-4 py-8 text-sm text-gray-400 text-center">No fees assigned</p>}
          {fees.slice(0, 6).map(f => (
            <div key={f.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{f.type}</p>
                <p className="text-xs text-gray-400">Due {f.due}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLE[f.status] ?? "bg-gray-100 text-gray-600"}`}>{f.status}</span>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(f.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent Payments</h3>
          <Link href="/student/invoices" className="text-xs text-indigo-600 font-medium flex items-center gap-1">All invoices <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.length === 0 && <p className="px-4 py-8 text-sm text-gray-400 text-center">No payments yet</p>}
          {payments.slice(0, 5).map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.desc}</p>
                <p className="text-xs text-gray-400">{p.inv} · {p.date}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
        <span className="text-xl">🏫</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{student.school}</p>
          <p className="text-xs text-gray-500">{school?.primaryEmail ?? "—"} · {school?.primaryPhone ?? "—"}</p>
        </div>
        {totalDue > 0 && (
          <Link href="/student/fees" className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
            <CreditCard className="w-3 h-3" />Pay
          </Link>
        )}
      </div>
    </div>
  );
}
