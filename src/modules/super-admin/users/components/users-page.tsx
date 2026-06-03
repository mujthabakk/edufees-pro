"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { Search, Plus, Edit2, Lock, Unlock, Shield, User, Building2 } from "lucide-react";

const users = [
  { id: 1, name: "Anita Sharma", email: "admin@greenfield.edu", role: "School Admin", school: "Greenfield Academy", status: "Active", lastLogin: "2025-06-02 09:14", joined: "2023-04-01" },
  { id: 2, name: "Ravi Kumar", email: "accounts@greenfield.edu", role: "Accountant", school: "Greenfield Academy", status: "Active", lastLogin: "2025-06-02 08:30", joined: "2023-04-05" },
  { id: 3, name: "Priya Nair", email: "teacher@greenfield.edu", role: "Teacher", school: "Greenfield Academy", status: "Active", lastLogin: "2025-06-01 14:00", joined: "2023-06-01" },
  { id: 4, name: "Suresh Mehta", email: "parent001@greenfield.edu", role: "Parent", school: "Greenfield Academy", status: "Active", lastLogin: "2025-05-30 20:15", joined: "2024-06-01" },
  { id: 5, name: "Rajiv Patel", email: "admin@sunrise.edu", role: "School Admin", school: "Sunrise Public School", status: "Active", lastLogin: "2025-06-01 11:00", joined: "2023-09-15" },
  { id: 6, name: "Deepa Joshi", email: "admin@delhimodern.edu", role: "School Admin", school: "Delhi Modern School", status: "Active", lastLogin: "2025-06-02 07:45", joined: "2022-11-01" },
  { id: 7, name: "Arun Sinha", email: "locked@vidyavihar.edu", role: "School Admin", school: "Vidya Vihar CBSE", status: "Suspended", lastLogin: "2025-05-10 16:00", joined: "2024-01-10" },
];

const roleColors: Record<string, string> = {
  "School Admin": "bg-indigo-100 text-indigo-700",
  "Accountant": "bg-green-100 text-green-700",
  "Teacher": "bg-orange-100 text-orange-700",
  "Parent": "bg-blue-100 text-blue-700",
};

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter(u =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()) ||
     u.school.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Users" subtitle="All users across all schools on the platform" />
      <main className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: users.length, color: "text-gray-900" },
            { label: "School Admins", value: users.filter(u => u.role === "School Admin").length, color: "text-indigo-600" },
            { label: "Accountants", value: users.filter(u => u.role === "Accountant").length, color: "text-green-600" },
            { label: "Teachers", value: users.filter(u => u.role === "Teacher").length, color: "text-orange-600" },
            { label: "Suspended", value: users.filter(u => u.status === "Suspended").length, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, school..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            {["all", "School Admin", "Accountant", "Teacher", "Parent"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["User", "Role", "School", "Status", "Last Login", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                          {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${roleColors[u.role] || "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.school}</td>
                    <td className="px-4 py-3">
                      {u.status === "Active" ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Suspended</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-purple-600 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        {u.status === "Active"
                          ? <button className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Suspend"><Lock className="w-4 h-4" /></button>
                          : <button className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Activate"><Unlock className="w-4 h-4" /></button>
                        }
                        <button className="p-1.5 text-gray-400 hover:text-orange-500 rounded" title="Reset Password"><Shield className="w-4 h-4" /></button>
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
