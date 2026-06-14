"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useMyStudent, useMyFees } from "@/lib/api/hooks/usePortal";
import { Download, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";

export function StudentFeesPage() {
  const [showPay, setShowPay] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [payMode, setPayMode] = useState("upi");
  const { data: student } = useMyStudent();
  const { data: fees = [] } = useMyFees();

  const feeItems = fees.map(f => ({
    type: f.feeTypeName,
    amount: f.netAmount,
    due: f.dueDate.slice(0, 10),
    paid: f.paidAmount,
    balance: f.netAmount - f.paidAmount,
    status: f.status,
  }));

  const totalDue = student?.balance ?? feeItems.reduce((a, f) => a + f.balance, 0);
  const totalPaid = student?.paidAmount ?? feeItems.reduce((a, f) => a + f.paid, 0);
  const annualFee = student?.totalFee ?? feeItems.reduce((a, f) => a + f.amount, 0);
  const paidPct = annualFee ? Math.round((totalPaid / annualFee) * 1000) / 10 : 0;

  const STATUS_BG: Record<string, string> = {
    OVERDUE: "bg-red-50 border-l-4 border-l-red-400",
    PENDING: "bg-amber-50/50",
    PAID: "",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Fees</h2>
          <p className="text-sm text-gray-500">{student?.fullName ?? "—"} · {student?.className ?? "—"}</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4" /><span className="hidden sm:inline">Statement</span></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className={`p-4 ${totalDue > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <p className={`text-xs font-medium uppercase ${totalDue > 0 ? "text-red-700" : "text-green-700"}`}>Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${totalDue > 0 ? "text-red-800" : "text-green-800"}`}>{formatCurrency(totalDue)}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs font-medium uppercase text-green-700">Total Paid</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Annual Fee</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(annualFee)}</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${paidPct}%` }} />
          </div>
        </Card>
      </div>

      {totalDue > 0 && (
        <Button className="w-full sm:hidden" onClick={() => setShowPay(true)}>
          <CreditCard className="w-4 h-4" />Pay Now {formatCurrency(totalDue)}
        </Button>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {feeItems.length === 0 && <p className="px-4 py-8 text-sm text-gray-400 text-center">No fee assignments yet</p>}
          <div className="divide-y divide-gray-100">
            {feeItems.map((f, i) => (
              <div key={i} className={`px-4 py-3 ${STATUS_BG[f.status] || ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{f.type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due: {new Date(f.due).toLocaleDateString("en-IN")}</p>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <span>Amount: {formatCurrency(f.amount)}</span>
                  {f.balance > 0 && <span className="text-red-600 font-semibold">Due: {formatCurrency(f.balance)}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showPay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Online Payment</h3>
            <p className="text-sm text-gray-500">Payment gateway integration pending — contact school office to pay {formatCurrency(totalDue)}.</p>
            <Button className="w-full" onClick={() => setShowPay(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
