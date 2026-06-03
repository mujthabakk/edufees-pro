"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { Building2, Plus, GraduationCap, Layers } from "lucide-react";

const classes = [
  { id: "1", name: "Class 10", divisions: ["A", "B", "C"], students: 124, teacher: "Mrs. Priya Nair" },
  { id: "2", name: "Class 9", divisions: ["A", "B"], students: 98, teacher: "Mr. Ravi Kumar" },
  { id: "3", name: "Class 8", divisions: ["A", "B", "C"], students: 112, teacher: "Ms. Anjali Shah" },
  { id: "4", name: "Class 12", divisions: ["A", "B"], students: 86, teacher: "Dr. Suresh Menon" },
];

export function AcademicPage() {
  const [year, setYear] = useState("2025-26");

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Academic Setup" subtitle="Classes, divisions & academic year configuration" />
      <main className="flex-1 p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><GraduationCap className="w-5 h-5 text-indigo-600" /></div>
              <div><p className="text-xs text-gray-500">Academic Year</p><p className="text-lg font-bold">{year}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-xs text-gray-500">Classes</p><p className="text-lg font-bold">{classes.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-xs text-gray-500">Total Divisions</p><p className="text-lg font-bold">{classes.reduce((s, c) => s + c.divisions.length, 0)}</p></div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Classes & Divisions</CardTitle>
            <div className="flex gap-2">
              <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                <option>2025-26</option><option>2024-25</option>
              </select>
              <Button size="sm"><Plus className="w-4 h-4" />Add Class</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Class", "Divisions", "Students", "Class Teacher", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5 text-sm font-semibold">{c.name}</td>
                    <td className="px-5 py-3.5 flex gap-1.5">{c.divisions.map(d => <Badge key={d} variant="info">{d}</Badge>)}</td>
                    <td className="px-5 py-3.5 text-sm">{c.students}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.teacher}</td>
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
