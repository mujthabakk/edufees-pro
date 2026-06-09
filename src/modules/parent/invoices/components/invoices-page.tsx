"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Download, Eye, X } from "lucide-react";

const invoices = [
  { id: "INV-2239", desc: "Full Year Fee – 2024-25", amount: 85000, date: "2025-05-30", status: "PAID" },
  { id: "INV-2234", desc: "Term 2 Tuition Fee", amount: 20000, date: "2025-01-15", status: "PAID" },
  { id: "INV-2001", desc: "Term 1 Tuition Fee", amount: 25000, date: "2024-07-01", status: "PAID" },
  { id: "INV-2000", desc: "Admission Fee", amount: 15000, date: "2024-06-01", status: "PAID" },
  { id: "INV-2240", desc: "Term 3 Tuition Fee", amount: 25000, date: "2025-06-01", status: "PENDING" },
];

export function InvoicesPage() {
  const [viewInv, setViewInv] = useState<typeof invoices[0] | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Invoices</h2>
          <p className="text-sm text-gray-500">Arjun Mehta · All fee invoices</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4" /><span className="hidden sm:inline">Download All</span></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs text-green-700">Paid</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{invoices.filter(i => i.status === "PAID").length}</p>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <p className="text-xs text-orange-700">Pending</p>
          <p className="text-2xl font-bold text-orange-800 mt-1">{invoices.filter(i => i.status === "PENDING").length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-100">
            {invoices.map(inv => (
              <div key={inv.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-teal-700">{inv.id}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{inv.desc}</p>
                  <p className="text-xs text-gray-400">{new Date(inv.date).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{inv.amount.toLocaleString()}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button onClick={() => setViewInv(inv)} className="p-1 text-gray-400 hover:text-teal-600 rounded"><Eye className="w-4 h-4" /></button>
                    <button className="p-1 text-gray-400 hover:text-green-600 rounded"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <table className="hidden sm:table w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Invoice #", "Description", "Amount", "Issue Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-teal-700">{inv.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.desc}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(inv.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewInv(inv)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invoice view modal */}
      {viewInv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Invoice Details</h3>
              <button onClick={() => setViewInv(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-teal-600 font-medium">Invoice No.</span><span className="font-bold text-teal-800">{viewInv.id}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Description</span><span className="font-medium text-gray-900">{viewInv.desc}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Amount</span><span className="font-bold text-gray-900">₹{viewInv.amount.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Date</span><span className="text-gray-700">{new Date(viewInv.date).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between text-sm items-center"><span className="text-gray-600">Status</span><StatusBadge status={viewInv.status} /></div>
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setViewInv(null)}>
              <Download className="w-4 h-4" />Download PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
