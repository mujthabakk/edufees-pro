"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useMyStudent, useMyInvoices } from "@/lib/api/hooks/usePortal";
import { useInvoiceUrl } from "@/lib/api/hooks/usePayments";
import { Download, Eye, X } from "lucide-react";

export function StudentInvoicesPage() {
  const { data: student } = useMyStudent();
  const { data: apiInvoices = [] } = useMyInvoices();
  const invoiceUrl = useInvoiceUrl();
  const invoices = apiInvoices.map(inv => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    desc: inv.invoiceNo,
    amount: inv.amount,
    date: inv.date.slice(0, 10),
    status: "PAID",
    hasPdf: inv.hasPdf,
  }));
  const [viewInv, setViewInv] = useState<(typeof invoices)[0] | null>(null);

  const download = (id: string) => {
    invoiceUrl.mutate(id, {
      onSuccess: (url) => { if (url) window.open(url, "_blank"); },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">My Invoices</h2>
        <p className="text-sm text-gray-500">{student?.fullName ?? "—"} · Payment receipts</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">All Invoices ({invoices.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 && <p className="px-4 py-8 text-sm text-gray-400 text-center">No invoices yet</p>}
          <div className="divide-y divide-gray-100">
            {invoices.map(inv => (
              <div key={inv.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-indigo-700">{inv.invoiceNo}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.date).toLocaleDateString("en-IN")}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.amount)}</p>
                <div className="flex gap-1">
                  <button onClick={() => setViewInv(inv)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"><Eye className="w-4 h-4" /></button>
                  {inv.hasPdf && (
                    <button onClick={() => download(inv.id)} className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Download className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {viewInv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Invoice Details</h3>
              <button onClick={() => setViewInv(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Invoice No.</span><span className="font-bold">{viewInv.invoiceNo}</span></div>
              <div className="flex justify-between"><span>Amount</span><span className="font-bold">{formatCurrency(viewInv.amount)}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{new Date(viewInv.date).toLocaleDateString("en-IN")}</span></div>
            </div>
            {viewInv.hasPdf && (
              <Button className="w-full" onClick={() => download(viewInv.id)}><Download className="w-4 h-4" />Download PDF</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
