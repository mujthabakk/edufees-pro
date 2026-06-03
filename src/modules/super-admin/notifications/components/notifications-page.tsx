"use client";
import React, { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { AlertTriangle, CheckCircle, Info, Megaphone, Send, X, Bell } from "lucide-react";

type Notif = { id: number; type: string; title: string; body: string; time: string; read: boolean };

const initialNotifs: Notif[] = [
  { id: 1, type: "alert", title: "School subscription expiring soon", body: "Vidya Vihar CBSE subscription expires in 3 days. Action required.", time: "2 hours ago", read: false },
  { id: 2, type: "info", title: "New school onboarded", body: "Ryan International Bangalore joined on the Growth plan.", time: "Yesterday", read: false },
  { id: 3, type: "success", title: "Payment gateway configured", body: "Delhi Modern School successfully integrated Razorpay.", time: "2 days ago", read: true },
  { id: 4, type: "alert", title: "5 failed login attempts detected", body: "Account vidyavihar@gmail.com has been temporarily locked.", time: "3 days ago", read: true },
  { id: 5, type: "info", title: "Monthly backup completed", body: "All school data backed up. 63 schools, 2,820 users.", time: "4 days ago", read: true },
];

const iconMap: Record<string, React.ReactElement> = {
  alert: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>(initialNotifs);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState("");

  // Broadcast form
  const [audience, setAudience] = useState("All Schools");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("Info");
  const [via, setVia] = useState("In-App Only");
  const [sent, setSent] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const handleBroadcast = () => {
    if (!title.trim() || !body.trim()) { showToast("⚠️ Please fill in title and message"); return; }
    const newNotif: Notif = {
      id: Date.now(), type: type.toLowerCase() === "alert" ? "alert" : "info",
      title, body: `[Broadcast to ${audience}] ${body}`, time: "Just now", read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setSent(true);
    setTitle(""); setBody("");
    showToast(`✅ Broadcast sent to ${audience} via ${via}`);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" subtitle="Platform alerts and broadcast messages" />
      <main className="flex-1 p-6 space-y-5">

        {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}

        <div className="flex items-center justify-between">
          <div className="flex gap-1 border-b border-gray-200">
            {["Inbox", "Broadcast"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === i ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
                {t} {t === "Inbox" && unread > 0 && <span className="ml-1 text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
              </button>
            ))}
          </div>
          {tab === 0 && unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
          )}
          {tab === 1 && (
            <Button onClick={() => setTab(0)}><Megaphone className="w-4 h-4" />View Inbox</Button>
          )}
        </div>

        {/* Inbox */}
        {tab === 0 && (
          <div className="space-y-3">
            {notifications.length === 0 && (
              <Card className="p-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </Card>
            )}
            {notifications.map(n => (
              <Card key={n.id} className={`p-4 transition-colors ${!n.read ? "border-purple-200 bg-purple-50/30" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{iconMap[n.type] || <Info className="w-4 h-4 text-gray-400" />}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.read && <span className="w-2 h-2 bg-purple-600 rounded-full" />}
                        <span className="text-xs text-gray-400">{n.time}</span>
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="text-xs text-purple-600 hover:underline">Mark read</button>
                        )}
                        <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Broadcast */}
        {tab === 1 && (
          <div className="space-y-4 max-w-2xl">
            {sent && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
                <CheckCircle className="w-4 h-4" />Broadcast sent! It appears in the Inbox.
              </div>
            )}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Send Broadcast Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Target Audience</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                    <option>All Schools</option>
                    <option>Enterprise Plan Only</option>
                    <option>Growth Plan Only</option>
                    <option>Starter Plan Only</option>
                    <option>All School Admins</option>
                    <option>Free Plan (Upgrade Prompt)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Message Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Scheduled Maintenance Notice" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Message Body *</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Write your message..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                      <option>Info</option><option>Alert</option><option>Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Send via</label>
                    <select value={via} onChange={e => setVia(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                      <option>In-App Only</option><option>In-App + Email</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleBroadcast} disabled={!title.trim() || !body.trim()}>
                  <Send className="w-4 h-4" />Send Broadcast
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
