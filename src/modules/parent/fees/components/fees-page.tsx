"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Download, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";

const feeItems = [
  { type: "Admission Fee", amount: 15000, due: "2024-06-01", paid: 15000, balance: 0, status: "PAID" },
  { type: "Term 1 Tuition", amount: 25000, due: "2024-07-01", paid: 25000, balance: 0, status: "PAID" },
  { type: "Term 2 Tuition", amount: 20000, due: "2024-10-01", paid: 20000, balance: 0, status: "PAID" },
  { type: "Term 3 Tuition", amount: 25000, due: "2025-01-01", paid: 0, balance: 25000, status: "OVERDUE" },
  { type: "Annual Sports Fee", amount: 5000, due: "2025-02-01", paid: 0, balance: 5000, status: "PENDING" },
];

const STATUS_BG: Record<string, string> = {
  OVERDUE: "bg-red-50 border-l-4 border-l-red-400",
  PENDING: "bg-amber-50/50",
  PAID: "",
};

export function FeesPage() {
  const [showPay, setShowPay] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [payMode, setPayMode] = useState("upi");

  const totalDue = feeItems.reduce((a, f) => a + f.balance, 0);
  const discount = couponApplied ? 2500 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fee Dashboard</h2>
          <p className="text-sm text-gray-500">Arjun Mehta · Class 9-A · 2024-25</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4" /><span className="hidden sm:inline">Statement</span></Button>
      </div>

      {/* Stats — single column mobile, 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className={`p-4 ${totalDue > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <p className={`text-xs font-medium uppercase ${totalDue > 0 ? "text-red-700" : "text-green-700"}`}>Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${totalDue > 0 ? "text-red-800" : "text-green-800"}`}>₹{totalDue.toLocaleString()}</p>
          {totalDue > 0 && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Please pay immediately</p>}
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs font-medium uppercase text-green-700">Total Paid</p>
          <p className="text-2xl font-bold text-green-800 mt-1">₹60,000</p>
          <p className="text-xs text-green-600 mt-1">3 payments made</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Annual Fee</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹85,000</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-green-500 rounded-full" style={{ width: "70.6%" }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">70.6% paid</p>
        </Card>
      </div>

      {/* Pay now CTA for mobile */}
      {totalDue > 0 && (
        <Button className="w-full sm:hidden" onClick={() => setShowPay(true)}>
          <CreditCard className="w-4 h-4" />Pay Now ₹{totalDue.toLocaleString()}
        </Button>
      )}

      {/* Fee breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Fee Breakdown</CardTitle>
            {totalDue > 0 && (
              <Button onClick={() => setShowPay(true)} size="sm" className="hidden sm:flex">
                <CreditCard className="w-4 h-4" />Pay ₹{totalDue.toLocaleString()}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile cards — show below sm=640px */}
          <div className="sm:hidden divide-y divide-gray-100">
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
                  <span className="text-gray-500">Amount: <span className="font-medium text-gray-800">₹{f.amount.toLocaleString()}</span></span>
                  {f.paid > 0 && <span className="text-green-600">Paid: ₹{f.paid.toLocaleString()}</span>}
                  {f.balance > 0 && <span className="text-red-600 font-semibold">Due: ₹{f.balance.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <table className="hidden sm:table w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Fee Type", "Amount", "Due Date", "Paid", "Balance", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {feeItems.map((f, i) => (
                <tr key={i} className={`border-b border-gray-50 ${f.status === "OVERDUE" ? "bg-red-50/40" : ""}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{f.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₹{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(f.due).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">{f.paid > 0 ? `₹${f.paid.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{f.balance > 0 ? `₹${f.balance.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Payment modal — slide-up sheet on mobile */}
      {showPay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Make Payment</h3>
              <button onClick={() => setShowPay(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Outstanding Amount</span><span className="font-semibold">₹{totalDue.toLocaleString()}</span></div>
              {couponApplied && <div className="flex justify-between text-sm text-green-600"><span>Coupon EARLYBIRD20</span><span>- ₹{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total Payable</span><span>₹{(totalDue - discount).toLocaleString()}</span></div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <Button variant="outline" size="sm" onClick={() => { if (coupon === "EARLYBIRD20") setCouponApplied(true); }}>Apply</Button>
              </div>
              {couponApplied && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />₹{discount.toLocaleString()} discount applied!</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[["upi", "UPI"], ["card", "Card"], ["netbanking", "Net Banking"]].map(([val, label]) => (
                  <button key={val} onClick={() => setPayMode(val)}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${payMode === val ? "border-teal-600 text-teal-700 bg-teal-50" : "border-gray-200 text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {payMode === "upi" && (
              <div>
                <label className="text-xs text-gray-500 font-medium">UPI ID</label>
                <input className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="yourname@upi" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => setShowPay(false)}>
                Pay ₹{(totalDue - discount).toLocaleString()}
              </Button>
              <Button variant="outline" onClick={() => setShowPay(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
