"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Search, Users } from "lucide-react";

const students = [
  { id: 1, name: "Arjun Mehta", rollNo: "12", class: "Class 10-A", admNo: "ADM2024001", parentMobile: "9876543200", totalFee: 85000, paid: 60000, status: "PARTIAL" },
  { id: 2, name: "Sana Khan", rollNo: "13", class: "Class 10-A", admNo: "ADM2024002", parentMobile: "9876543201", totalFee: 85000, paid: 85000, status: "PAID" },
  { id: 3, name: "Vikram Nair", rollNo: "14", class: "Class 10-A", admNo: "ADM2024003", parentMobile: "9876543202", totalFee: 85000, paid: 30000, status: "OVERDUE" },
  { id: 4, name: "Deepa Iyer", rollNo: "15", class: "Class 10-A", admNo: "ADM2024004", parentMobile: "9876543203", totalFee: 85000, paid: 0, status: "PENDING" },
  { id: 5, name: "Rohit Sharma", rollNo: "16", class: "Class 10-A", admNo: "ADM2024005", parentMobile: "9876543205", totalFee: 85000, paid: 85000, status: "PAID" },
  { id: 6, name: "Meena Pillai", rollNo: "17", class: "Class 10-A", admNo: "ADM2024006", parentMobile: "9876543206", totalFee: 85000, paid: 40000, status: "PARTIAL" },
  { id: 7, name: "Ajay Kumar", rollNo: "18", class: "Class 10-A", admNo: "ADM2024007", parentMobile: "9876543207", totalFee: 85000, paid: 85000, status: "PAID" },
];

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.includes(search) || s.admNo.includes(search)
  );

  const paid = students.filter(s => s.status === "PAID").length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Students" subtitle="Class 10-A · Read-only fee view" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-xs text-gray-500">Total Students</p><p className="text-2xl font-bold text-gray-900">{students.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500">Fee Cleared</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{paid}/{students.length}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${(paid/students.length)*100}%` }} /></div>
          </Card>
          <Card className="p-5 bg-orange-50 border-orange-200">
            <p className="text-xs text-orange-700">Note</p>
            <p className="text-sm text-orange-800 mt-1">You have read-only access to fee status. Contact the accountant for payment actions.</p>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, roll no, admission no..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Roll No", "Name", "Admission No", "Parent Mobile", "Total Fee", "Paid", "Balance", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.rollNo}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.admNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.parentMobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹{s.totalFee.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{s.paid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{s.totalFee - s.paid > 0 ? `₹${(s.totalFee - s.paid).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
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
