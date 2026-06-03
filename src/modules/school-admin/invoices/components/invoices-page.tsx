"use client";

import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockInvoices } from "@/lib/mock-data";
import { Download, Mail, MessageCircle, Plus } from "lucide-react";

export function InvoicesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Invoices" subtitle="Generate and manage fee invoices" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex justify-end gap-2">
          <Button variant="outline"><Download className="w-4 h-4" />Export</Button>
          <Button><Plus className="w-4 h-4" />Generate Invoice</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Invoice No", "Student", "Class", "Amount", "Date", "Email", "WhatsApp", ""].map(h => (
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
                    <td className="px-5 py-3.5"><Badge variant={inv.sentEmail ? "success" : "default"}>{inv.sentEmail ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5"><Badge variant={inv.sentWA ? "success" : "default"}>{inv.sentWA ? "Sent" : "—"}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Download className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Mail className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-green-600 rounded"><MessageCircle className="w-3.5 h-3.5" /></button>
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
