"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockInvoices } from "@/lib/mock-data";
import { Download, Mail, Plus } from "lucide-react";

export function InvoicesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Invoices" subtitle="Generate and track fee invoices" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex justify-end">
          <Button><Plus className="w-4 h-4" />Generate Invoice</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Invoice List</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice No", "Student", "Class", "Amount", "Date", "Delivery", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-mono font-semibold">{inv.invoiceNo}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">{inv.studentName}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{inv.class}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{inv.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {inv.sentEmail && <Badge variant="info">Email</Badge>}
                        {inv.sentWA && <Badge variant="success">WA</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Download className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Mail className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
