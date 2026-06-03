"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockFeeTypes, mockFeeStructures } from "@/lib/mock-data";
import { Plus, BookOpen } from "lucide-react";

export function FeeStructurePage() {
  const [tab, setTab] = useState<"structures" | "types">("structures");

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Structure" subtitle="Configure fee types and class-wise amounts" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex gap-2">
          {(["structures", "types"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              Fee {t}
            </button>
          ))}
          <div className="flex-1" />
          <Button size="sm"><Plus className="w-4 h-4" />Add {tab === "structures" ? "Structure" : "Fee Type"}</Button>
        </div>

        {tab === "structures" ? (
          <Card>
            <CardHeader><CardTitle>Class-wise Fee Structure</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Class", "Quota", "Fee Type", "Amount", "Frequency", "Due Day", ""].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockFeeStructures.map(f => (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 text-sm font-medium">{f.class}</td>
                      <td className="px-5 py-3.5"><Badge variant="info">{f.quota}</Badge></td>
                      <td className="px-5 py-3.5 text-sm">{f.feeType}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(f.amount)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{f.frequency}</td>
                      <td className="px-5 py-3.5 text-sm">{f.dueDay}th</td>
                      <td className="px-5 py-3.5"><Button variant="outline" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {mockFeeTypes.map(ft => (
              <Card key={ft.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{ft.name}</p>
                      {ft.isLateFee && <Badge variant="warning">Late Fee</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{ft.description}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
