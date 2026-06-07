"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { mockNotifications } from "@/lib/mock-data";
import { Bell, Send, Plus, X, MessageCircle, Mail, Smartphone } from "lucide-react";

const TEMPLATES = [
  "Fee Due Reminder",
  "Payment Confirmation",
  "Overdue Alert",
  "Monthly Statement",
  "Exam Fee Notice",
  "Custom Message",
];

const AUDIENCES = ["All Students", "Overdue Students", "Class 10", "Class 11", "Class 12", "All Classes"];

export function NotificationsPage() {
  const [channel, setChannel] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ template: TEMPLATES[0], audience: AUDIENCES[0], channels: { whatsapp: true, email: false, sms: false }, message: "" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = mockNotifications.filter(n => channel === "All" || n.channel === channel);

  const handleSend = () => {
    const channelList = [form.channels.whatsapp && "WhatsApp", form.channels.email && "Email", form.channels.sms && "SMS"].filter(Boolean).join(", ");
    if (!channelList) { showToast("⚠️ Select at least one channel"); return; }
    showToast(`📣 Notification sent via ${channelList} to ${form.audience}`);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Notifications" subtitle="WhatsApp, Email & SMS communication · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["All", "WHATSAPP", "EMAIL", "BOTH"].map(c => (
              <button key={c} onClick={() => setChannel(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${channel === c ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{c}</button>
            ))}
          </div>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Send Notification</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Sent Today", value: "48", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Delivered", value: "42", icon: Bell, color: "text-green-600", bg: "bg-green-50" },
            { label: "Read", value: "31", icon: MessageCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
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

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[500px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Send Notification</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Template</label>
                <select value={form.template} onChange={e => setForm(f => ({ ...f, template: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {TEMPLATES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Send To</label>
                <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-2">Channels</label>
                <div className="flex gap-3">
                  {[
                    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
                    { key: "email", label: "Email", icon: Mail, color: "text-blue-600" },
                    { key: "sms", label: "SMS", icon: Smartphone, color: "text-orange-600" },
                  ].map(ch => (
                    <label key={ch.key} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${(form.channels as any)[ch.key] ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                      <input type="checkbox" checked={(form.channels as any)[ch.key]} onChange={e => setForm(f => ({ ...f, channels: { ...f.channels, [ch.key]: e.target.checked } }))} className="sr-only" />
                      <ch.icon className={`w-4 h-4 ${ch.color}`} />
                      <span className="text-sm font-medium">{ch.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Custom Message (optional)</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Override template message..." />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSend}><Send className="w-4 h-4" />Send Now</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
