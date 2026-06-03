"use client";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Download, Eye } from "lucide-react";

const invoices = [
  { id: "INV-2239", desc: "Full Year Fee – 2024-25", amount: 85000, date: "2025-05-30", status: "PAID" },
  { id: "INV-2234", desc: "Term 2 Tuition Fee", amount: 20000, date: "2025-01-15", status: "PAID" },
  { id: "INV-2001", desc: "Term 1 Tuition Fee", amount: 25000, date: "2024-07-01", status: "PAID" },
  { id: "INV-2000", desc: "Admission Fee", amount: 15000, date: "2024-06-01", status: "PAID" },
  { id: "INV-2240", desc: "Term 3 Tuition Fee", amount: 25000, date: "2025-06-01", status: "PENDING" },
];

export function InvoicesPage() {
  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Invoices</h2>
          <p className="text-sm text-gray-500">Arjun Mehta · All fee invoices</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4" />Download All</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
        </Card>
        <Card className="p-5 bg-green-50 border-green-200">
          <p className="text-xs text-green-700">Paid</p>
          <p className="text-2xl font-bold text-green-800 mt-1">{invoices.filter(i => i.status === "PAID").length}</p>
        </Card>
        <Card className="p-5 bg-orange-50 border-orange-200">
          <p className="text-xs text-orange-700">Pending</p>
          <p className="text-2xl font-bold text-orange-800 mt-1">{invoices.filter(i => i.status === "PENDING").length}</p>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Invoice #", "Description", "Amount", "Issue Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-teal-700">{inv.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.desc}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(inv.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-teal-600 rounded" title="View"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Download"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
