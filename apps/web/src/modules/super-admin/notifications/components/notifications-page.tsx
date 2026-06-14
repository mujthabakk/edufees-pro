"use client";
import React, { useState, useMemo } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { useAuditLogs } from "@/lib/api/hooks/useSuperAdmin";
import { AlertTriangle, CheckCircle, Info, Megaphone, X, Bell } from "lucide-react";

const iconMap: Record<string, React.ReactElement> = {
  alert: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
};

function auditType(action: string): string {
  if (action.includes("SUSPEND") || action.includes("FAILED")) return "alert";
  if (action.includes("ONBOARD") || action.includes("UPDATED")) return "success";
  return "info";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function NotificationsPage() {
  const auditQuery = useAuditLogs({ pageSize: 50 });
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("Info");
  const [sent, setSent] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const notifications = useMemo(() => {
    return (auditQuery.data?.data ?? [])
      .filter(e => !dismissed.has(e.id))
      .map(e => ({
        id: e.id,
        type: auditType(e.action),
        title: e.action.replace(/_/g, " "),
        body: `${e.entityType} ${e.entityId.slice(-8)}${e.schoolId ? ` · School ${e.schoolId.slice(-8)}` : ""}`,
        time: timeAgo(e.createdAt),
        read: readIds.has(e.id),
      }));
  }, [auditQuery.data, readIds, dismissed]);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]));

  const handleBroadcast = () => {
    if (!title.trim() || !body.trim()) { showToast("⚠️ Please fill in title and message"); return; }
    setSent(true);
    setTitle(""); setBody("");
    showToast("ℹ️ Broadcast requires a notifications API — logged locally for now");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" subtitle="Platform alerts derived from audit logs" />
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
        </div>

        {tab === 0 && (
          <div className="space-y-3">
            {notifications.length === 0 && (
              <Card className="p-10 text-center text-sm text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No platform notifications yet
              </Card>
            )}
            {notifications.map(n => (
              <Card key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? "border-purple-200 bg-purple-50/30" : ""}`}>
                <div className="mt-0.5">{iconMap[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-purple-600 hover:underline">Read</button>}
                  <button onClick={() => dismiss(n.id)} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 1 && (
          <Card className="p-6 max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Broadcast Message</h3>
            </div>
            <p className="text-sm text-gray-500">Send a platform-wide announcement to institute admins.</p>
            {sent && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Message queued (requires backend notifications service)</div>}
            <div>
              <label className="text-xs text-gray-500 font-medium">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex gap-3">
              <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Info</option><option>Alert</option><option>Success</option>
              </select>
            </div>
            <Button onClick={handleBroadcast}>Send Broadcast</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
