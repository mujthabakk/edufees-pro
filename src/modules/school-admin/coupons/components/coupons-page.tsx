"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { mockCoupons } from "@/lib/mock-data";
import { Plus, Tag, Copy } from "lucide-react";

export function CouponsPage() {
  const [coupons] = useState(mockCoupons);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Coupons & Discounts" subtitle="Manage fee discount codes" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex justify-end">
          <Button><Plus className="w-4 h-4" />Create Coupon</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {coupons.map(c => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono font-bold text-gray-900">{c.code}</span>
                </div>
                <Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-2xl font-bold text-indigo-600 mb-1">
                {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                <span className="text-sm font-normal text-gray-500 ml-1">off</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">{c.validFrom} → {c.validUntil}</p>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Used: {c.totalRedeemed}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
                <button className="flex items-center gap-1 text-indigo-600 hover:underline"><Copy className="w-3 h-3" />Copy</button>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>All Coupons</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Code", "Discount", "Valid Period", "Usage", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 font-mono font-semibold text-sm">{c.code}</td>
                    <td className="px-5 py-3.5 text-sm">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{c.validFrom} – {c.validUntil}</td>
                    <td className="px-5 py-3.5 text-sm">{c.totalRedeemed}{c.maxUses ? ` / ${c.maxUses}` : " / ∞"}</td>
                    <td className="px-5 py-3.5"><Badge variant={c.isActive ? "success" : "default"}>{c.isActive ? "Active" : "Inactive"}</Badge></td>
                    <td className="px-5 py-3.5"><Button variant="outline" size="sm">Edit</Button></td>
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
