"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { mockNotifications } from "@/lib/mock-data";
import { Bell, Send, Plus } from "lucide-react";

export function NotificationsPage() {
  const [channel, setChannel] = useState("All");

  const filtered = mockNotifications.filter(n => channel === "All" || n.channel === channel);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" subtitle="WhatsApp, Email & SMS communication log" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["All", "WHATSAPP", "EMAIL", "BOTH"].map(c => (
              <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${channel === c ? "bg-indigo-600 text-white" : "bg-white border text-gray-600"}`}>{c}</button>
            ))}
          </div>
          <Button><Plus className="w-4 h-4" />Send Notification</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Sent Today", value: "48", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Delivered", value: "42", icon: Bell, color: "text-green-600", bg: "bg-green-50" },
            { label: "Read", value: "31", icon: Bell, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Failed", value: "3", icon: Bell, color: "text-red-600", bg: "bg-red-50" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Notification Log</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Student", "Channel", "Template", "Recipient", "Status", "Sent At"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => (
                  <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-medium">{n.studentName}</td>
                    <td className="px-5 py-3.5"><Badge variant="info">{n.channel}</Badge></td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{n.template}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-500">{n.recipient}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={n.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{n.sentAt}</td>
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
