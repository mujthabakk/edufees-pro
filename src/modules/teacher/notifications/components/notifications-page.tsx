"use client";
import React from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card } from "@/modules/shared/ui/card";
import { Bell, CreditCard, UserPlus, AlertTriangle, Info } from "lucide-react";

const notifications = [
  { id: 1, type: "payment", title: "Fee Payment Received", body: "Arjun Mehta's parent paid ₹20,000 towards Term 3 fees.", time: "2 hours ago", read: false },
  { id: 2, type: "alert", title: "Overdue Fee Alert", body: "3 students in your class have overdue fees for more than 30 days.", time: "Yesterday", read: false },
  { id: 3, type: "info", title: "New Student Added", body: "Kavya Reddy has been added to Class 10-A by the admin.", time: "2 days ago", read: true },
  { id: 4, type: "payment", title: "Fee Payment Received", body: "Ajay Kumar's parent cleared all outstanding fees.", time: "3 days ago", read: true },
  { id: 5, type: "info", title: "Academic Year Update", body: "Batch 2025-26 fee structures have been set up by the admin.", time: "1 week ago", read: true },
];

const iconMap: Record<string, React.ReactElement> = {
  payment: <CreditCard className="w-4 h-4 text-green-500" />,
  alert: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  user: <UserPlus className="w-4 h-4 text-purple-500" />,
};

export function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`} />
      <main className="flex-1 p-6 space-y-3">
        {notifications.map(n => (
          <Card key={n.id} className={`p-4 ${!n.read ? "border-orange-200 bg-orange-50/30" : ""}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{iconMap[n.type] || <Bell className="w-4 h-4 text-gray-400" />}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
                    <span className="text-xs text-gray-400">{n.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
}
