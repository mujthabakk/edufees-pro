"use client";

import { useState, useMemo, type ReactElement } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useStudents } from "@/lib/api/hooks/useStudents";
import { useAcademicYears, useClasses } from "@/lib/api/hooks/useAcademic";
import { CalendarDays, GraduationCap, Users, CheckCircle, Clock, Search, Eye } from "lucide-react";

type AcademicYear = {
  id: string; label: string; startMonth: string; startYear: string;
  endMonth: string; endYear: string; status: "active" | "upcoming" | "closed";
  totalStudents: number; totalGroups: number;
};

type ClassGroup = {
  id: string; name: string; sections: string[]; students: number; incharge: string;
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_STYLE: Record<string,string> = {
  active:   "bg-green-100 text-green-700",
  upcoming: "bg-blue-100 text-blue-700",
  closed:   "bg-gray-100 text-gray-500",
};
const STATUS_ICON: Record<string,ReactElement> = {
  active:   <CheckCircle className="w-3 h-3" />,
  upcoming: <Clock className="w-3 h-3" />,
  closed:   <CheckCircle className="w-3 h-3 opacity-40" />,
};

export function AccountantAcademicPage() {
  const [tab, setTab] = useState<"years" | "classes">("years");
  const [yearFilter, setYearFilter] = useState("2025-26");
  const [classFilter, setClassFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewClass, setViewClass] = useState<ClassGroup | null>(null);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: yearsData } = useAcademicYears();
  const { data: classesData } = useClasses();
  const studentsQuery = useStudents({ pageSize: 500 });

  const students = useMemo(() => (studentsQuery.data?.data ?? []).map(s => ({
    id: s.id,
    fullName: s.fullName,
    admissionNo: s.admissionNo,
    class: s.className ?? "",
    division: s.divisionName ?? "",
    quota: s.quotaName ?? "General",
    totalFee: s.totalFee,
    paidAmount: s.paidAmount,
    status: s.status as string,
  })), [studentsQuery.data]);

  // Build class groups from the academic structure, counting enrolled students per class.
  const CLASS_GROUPS: ClassGroup[] = useMemo(() => (classesData ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => ({
      id: c.id,
      name: c.name,
      sections: c.divisions.map(d => d.name),
      students: students.filter(s => s.class === c.name).length,
      incharge: "—",
    })), [classesData, students]);

  // Map academic years; per-year student/class counts only known for the current year.
  const ACADEMIC_YEARS: AcademicYear[] = useMemo(() => (yearsData ?? []).map(y => {
    const start = new Date(y.startDate);
    const end = new Date(y.endDate);
    const now = new Date();
    const status: AcademicYear["status"] = y.isCurrent
      ? "active"
      : start > now ? "upcoming" : "closed";
    return {
      id: y.id,
      label: y.label,
      startMonth: MONTH_NAMES[start.getMonth()] ?? "",
      startYear: String(start.getFullYear()),
      endMonth: MONTH_NAMES[end.getMonth()] ?? "",
      endYear: String(end.getFullYear()),
      status,
      totalStudents: y.isCurrent ? (studentsQuery.data?.meta.total ?? students.length) : 0,
      totalGroups: y.isCurrent ? CLASS_GROUPS.length : 0,
    };
  }), [yearsData, students, studentsQuery.data, CLASS_GROUPS]);

  const activeYear = ACADEMIC_YEARS.find(y => y.status === "active");

  const allDivisions = Array.from(new Set(CLASS_GROUPS.flatMap(g => g.sections))).sort();
  const classOptions = ["All", ...CLASS_GROUPS.map(g => g.name)];
  const divisionOptions = ["All", ...allDivisions];

  // Filter students using academic filters
  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.fullName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q);
    const matchClass = classFilter === "All" || s.class === classFilter;
    const matchDiv = divisionFilter === "All" || s.division === divisionFilter;
    return matchSearch && matchClass && matchDiv;
  });

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Academic Structure" subtitle="View academic years, classes & divisions · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Active Year Banner */}
        {activeYear && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-900 text-sm">Active Academic Year: {activeYear.label}</p>
              <p className="text-xs text-green-700">{activeYear.startMonth} {activeYear.startYear} → {activeYear.endMonth} {activeYear.endYear} · {activeYear.totalStudents} students enrolled</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500 text-white">Current</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Classes", value: CLASS_GROUPS.length, color: "text-indigo-700" },
            { label: "Total Sections", value: CLASS_GROUPS.reduce((a,g)=>a+g.sections.length,0), color: "text-gray-900" },
            { label: "Students Enrolled", value: activeYear?.totalStudents || 0, color: "text-green-600" },
            { label: "Academic Years", value: ACADEMIC_YEARS.length, color: "text-amber-600" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {(["years","classes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab===t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "years" ? "Academic Years" : "Classes & Divisions"}
            </button>
          ))}
        </div>

        {/* ACADEMIC YEARS TAB */}
        {tab === "years" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACADEMIC_YEARS.map(y => (
              <Card key={y.id} className={`p-5 ${y.status==="active"?"border-green-300 bg-green-50/30":""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{y.label}</p>
                    <p className="text-xs text-gray-500">{y.startMonth} {y.startYear} – {y.endMonth} {y.endYear}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[y.status]}`}>
                    {STATUS_ICON[y.status]}{y.status.charAt(0).toUpperCase()+y.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/70 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="font-bold text-gray-900">{y.totalStudents}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500">Classes</p>
                    <p className="font-bold text-gray-900">{y.totalGroups}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CLASSES & DIVISIONS TAB */}
        {tab === "classes" && (
          <div className="space-y-4">
            {/* Class grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CLASS_GROUPS.map(g => (
                <button key={g.id} onClick={() => setViewClass(g)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <Eye className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700">{g.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{g.students} students</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {g.sections.map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">{s}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Student Filter by Class+Division */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student View by Class & Division</CardTitle>
                  <p className="text-xs text-gray-400">Filter students using academic structure</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                  </div>
                  <select value={classFilter} onChange={e=>setClassFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {classOptions.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <select value={divisionFilter} onChange={e=>setDivisionFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {divisionOptions.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <Button size="sm" onClick={() => showToast("📣 Bulk reminder sent to filtered students' parents")}>
                    Bulk Remind ({filteredStudents.length})
                  </Button>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["Student","Admission No","Class","Division","Quota","Total Fee","Paid","Balance","Status"].map(h=>(
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length===0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-gray-400 text-sm">No students found.</td></tr>}
                    {filteredStudents.map(s => {
                      const bal = s.totalFee - s.paidAmount;
                      const statusColor: Record<string,string> = { PAID:"bg-green-100 text-green-700", PARTIAL:"bg-yellow-100 text-yellow-700", OVERDUE:"bg-red-100 text-red-700", PENDING:"bg-gray-100 text-gray-600" };
                      return (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.fullName}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{s.admissionNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.class}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.division || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.quota}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(s.totalFee)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(s.paidAmount)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-red-500">{bal>0?formatCurrency(bal):"—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor[s.status]||"bg-gray-100 text-gray-600"}`}>{s.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* CLASS DETAIL MODAL */}
      {viewClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">{viewClass.name}</h3>
              </div>
              <button onClick={() => setViewClass(null)}><span className="text-gray-400 hover:text-gray-700 text-xl">×</span></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="font-bold text-gray-900 text-lg">{viewClass.students}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Sections</p>
                <p className="font-bold text-gray-900 text-lg">{viewClass.sections.length}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Divisions / Sections</p>
              <div className="flex gap-2 flex-wrap">
                {viewClass.sections.map(s => (
                  <div key={s} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-bold text-indigo-700">{s}</span>
                    <span className="text-xs text-indigo-400">Div</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Class Incharge</p>
              <p className="font-semibold text-gray-900">{viewClass.incharge}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setViewClass(null); setTab("classes"); setClassFilter(viewClass.name); }}>
                <Users className="w-4 h-4" />View Students
              </Button>
              <Button size="sm" className="flex-1" onClick={() => { showToast(`📣 Reminder sent to all ${viewClass.name} parents`); setViewClass(null); }}>
                Bulk Remind
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
