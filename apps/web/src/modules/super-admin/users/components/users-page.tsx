"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { usePlatformUsers } from "@/lib/api/hooks/useSuperAdmin";
import { Search, Plus, Edit2, Lock, Unlock, Shield, User, Building2 } from "lucide-react";

const roleColors: Record<string, string> = {
  SCHOOL_ADMIN: "bg-indigo-100 text-indigo-700",
  ACCOUNTANT: "bg-green-100 text-green-700",
  TEACHER: "bg-orange-100 text-orange-700",
  PARENT: "bg-blue-100 text-blue-700",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
};

const roleLabel: Record<string, string> = {
  SCHOOL_ADMIN: "School Admin",
  ACCOUNTANT: "Accountant",
  TEACHER: "Teacher",
  PARENT: "Parent",
  SUPER_ADMIN: "Super Admin",
};

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const usersQuery = usePlatformUsers({ pageSize: 200, search: search || undefined });
  const users = usersQuery.data?.data ?? [];

  const filtered = users.filter(u =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.email.toLowerCase().includes(search.toLowerCase()) ||
     u.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Users" subtitle="All users across all schools on the platform" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: users.length, color: "text-gray-900" },
            { label: "School Admins", value: users.filter(u => u.role === "SCHOOL_ADMIN").length, color: "text-indigo-600" },
            { label: "Accountants", value: users.filter(u => u.role === "ACCOUNTANT").length, color: "text-green-600" },
            { label: "Teachers", value: users.filter(u => u.role === "TEACHER").length, color: "text-orange-600" },
            { label: "Suspended", value: users.filter(u => !u.isActive).length, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or username..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            {["all", "SCHOOL_ADMIN", "ACCOUNTANT", "TEACHER", "PARENT"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r === "all" ? "All" : roleLabel[r] ?? r}
              </button>
            ))}
          </div>
          <Button><Plus className="w-4 h-4" />Add User</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Platform Users ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["User", "Role", "School ID", "Status", "Last Login", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No users found</td></tr>}
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-purple-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-purple-600" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${roleColors[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{u.schoolId?.slice(-8) ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                        {u.isActive
                          ? <button className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Lock className="w-4 h-4" /></button>
                          : <button className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Unlock className="w-4 h-4" /></button>
                        }
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
