"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Badge } from "@/modules/shared/ui/badge";
import { Search, Filter } from "lucide-react";

const logs = [
  { id: 1, ts: "2025-06-02 09:14:32", actor: "admin@greenfield.edu", role: "School Admin", school: "Greenfield Academy", action: "PAYMENT_RECORDED", resource: "Payment #PAY-8821", ip: "103.22.45.1", severity: "info" },
  { id: 2, ts: "2025-06-02 09:02:11", actor: "accounts@greenfield.edu", role: "Accountant", school: "Greenfield Academy", action: "INVOICE_SENT", resource: "Invoice INV-2234", ip: "103.22.45.2", severity: "info" },
  { id: 3, ts: "2025-06-02 08:45:00", actor: "superadmin@edufees.pro", role: "Super Admin", school: "—", action: "SCHOOL_SUSPENDED", resource: "Vidya Vihar CBSE", ip: "115.99.1.10", severity: "warning" },
  { id: 4, ts: "2025-06-01 18:30:22", actor: "admin@delhimodern.edu", role: "School Admin", school: "Delhi Modern School", action: "USER_CREATED", resource: "Staff: Rajan Sharma", ip: "182.64.10.3", severity: "info" },
  { id: 5, ts: "2025-06-01 17:15:00", actor: "unknown", role: "—", school: "—", action: "LOGIN_FAILED_5X", resource: "vidyavihar@gmail.com", ip: "45.120.88.99", severity: "danger" },
  { id: 6, ts: "2025-06-01 16:00:45", actor: "superadmin@edufees.pro", role: "Super Admin", school: "—", action: "PLAN_UPGRADED", resource: "KV Andheri → Growth", ip: "115.99.1.10", severity: "info" },
  { id: 7, ts: "2025-06-01 14:22:10", actor: "admin@sunrise.edu", role: "School Admin", school: "Sunrise Public School", action: "BULK_IMPORT", resource: "87 students imported", ip: "59.144.22.8", severity: "info" },
  { id: 8, ts: "2025-06-01 11:05:33", actor: "accounts@greenfield.edu", role: "Accountant", school: "Greenfield Academy", action: "COUPON_APPLIED", resource: "EARLYBIRD20 on STU-0092", ip: "103.22.45.2", severity: "info" },
  { id: 9, ts: "2025-06-01 10:30:00", actor: "superadmin@edufees.pro", role: "Super Admin", school: "—", action: "SCHOOL_CREATED", resource: "KV Andheri", ip: "115.99.1.10", severity: "info" },
  { id: 10, ts: "2025-05-31 22:00:00", actor: "system", role: "System", school: "All", action: "DAILY_BACKUP", resource: "DB Snapshot", ip: "internal", severity: "info" },
];

const severityBadge = (s: string) =>
  s === "danger" ? <Badge variant="danger">Critical</Badge>
  : s === "warning" ? <Badge variant="warning">Warning</Badge>
  : <Badge variant="info">Info</Badge>;

export function AuditPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");

  const filtered = logs.filter(l =>
    (severity === "all" || l.severity === severity) &&
    (l.actor.includes(search) || l.action.includes(search) || l.resource.includes(search) || l.school.includes(search))
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Logs" subtitle="Full trail of all actions across the platform" />
      <main className="flex-1 p-6 space-y-5">

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by actor, action, resource..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            {["all", "info", "warning", "danger"].map(s => (
              <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${severity === s ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s === "all" ? "All" : s}</button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Timestamp", "Actor", "Role", "School", "Action", "Resource", "IP", "Severity"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={`border-b border-gray-50 ${l.severity === "danger" ? "bg-red-50/50" : l.severity === "warning" ? "bg-yellow-50/30" : ""}`}>
                    <td className="px-3 py-2.5 text-xs text-gray-500 font-mono whitespace-nowrap">{l.ts}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{l.actor}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{l.role}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{l.school}</td>
                    <td className="px-3 py-2.5"><span className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{l.action}</span></td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{l.resource}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{l.ip}</td>
                    <td className="px-3 py-2.5">{severityBadge(l.severity)}</td>
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
