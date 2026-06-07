"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import {
  Building2, Plus, GraduationCap, Layers, Edit2, Trash2, X,
  AlertTriangle, Users, CalendarDays, CheckCircle, Clock,
  ChevronRight, Copy, ToggleRight,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type AcademicYear = {
  id: string;
  label: string;          // "2025-26"
  startMonth: string;     // "April"
  startYear: string;      // "2025"
  endMonth: string;
  endYear: string;
  status: "active" | "upcoming" | "closed";
  totalStudents: number;
  totalClasses: number;
};

type ClassItem = {
  id: string; name: string; divisions: string[]; students: number; teacher: string;
};

// ─────────────────────────────────────────────
// Initial data
// ─────────────────────────────────────────────
const initYears: AcademicYear[] = [
  { id:"1", label:"2025-26", startMonth:"April", startYear:"2025", endMonth:"March", endYear:"2026", status:"active",   totalStudents:675, totalClasses:7 },
  { id:"2", label:"2024-25", startMonth:"April", startYear:"2024", endMonth:"March", endYear:"2025", status:"closed",   totalStudents:612, totalClasses:7 },
  { id:"3", label:"2023-24", startMonth:"April", startYear:"2023", endMonth:"March", endYear:"2024", status:"closed",   totalStudents:580, totalClasses:6 },
  { id:"4", label:"2026-27", startMonth:"April", startYear:"2026", endMonth:"March", endYear:"2027", status:"upcoming", totalStudents:0,   totalClasses:0 },
];

const initClasses: ClassItem[] = [
  { id:"1", name:"Class 10", divisions:["A","B","C"], students:124, teacher:"Mrs. Priya Nair" },
  { id:"2", name:"Class 9",  divisions:["A","B"],     students:98,  teacher:"Mr. Ravi Kumar" },
  { id:"3", name:"Class 8",  divisions:["A","B","C"], students:112, teacher:"Ms. Anjali Shah" },
  { id:"4", name:"Class 12", divisions:["A","B"],     students:86,  teacher:"Dr. Suresh Menon" },
  { id:"5", name:"Class 11", divisions:["Science","Commerce"], students:72, teacher:"Mr. Arun Pillai" },
  { id:"6", name:"Class 7",  divisions:["A","B","C"], students:95,  teacher:"Mrs. Rekha Desai" },
  { id:"7", name:"Class 6",  divisions:["A","B"],     students:88,  teacher:"Mr. Santosh Jha" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS_LIST = ["2023","2024","2025","2026","2027","2028"];
const emptyClass = { name:"", divisions:"A, B", students:0, teacher:"" };
const emptyYear  = { label:"", startMonth:"April", startYear:"2026", endMonth:"March", endYear:"2027" };

// ─────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────
function YearBadge({ status }: { status: AcademicYear["status"] }) {
  if (status === "active")   return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" />Active</span>;
  if (status === "upcoming") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" />Upcoming</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Closed</span>;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export function AcademicPage() {
  const [tab, setTab] = useState<"years" | "classes">("years");

  // Academic year state
  const [years, setYears] = useState<AcademicYear[]>(initYears);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editYear, setEditYear] = useState<AcademicYear | null>(null);
  const [deleteYear, setDeleteYear] = useState<AcademicYear | null>(null);
  const [confirmActivate, setConfirmActivate] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({ ...emptyYear });

  // Class state
  const [classes, setClasses] = useState<ClassItem[]>(initClasses);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);
  const [deleteClass, setDeleteClass] = useState<ClassItem | null>(null);
  const [classForm, setClassForm] = useState({ ...emptyClass });

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const activeYear = years.find(y => y.status === "active");

  // ── Year helpers ──
  const updY = (k: string, v: string) => setYearForm(f => ({ ...f, [k]: v }));

  const autoLabel = (sm: string, sy: string, ey: string) => {
    const syShort = sy.slice(2);
    const eyShort = ey.slice(2);
    return `${sy}-${eyShort}`;
  };

  const saveYear = () => {
    if (!yearForm.startYear || !yearForm.endYear) { showToast("⚠️ Start and end year are required"); return; }
    const label = autoLabel(yearForm.startMonth, yearForm.startYear, yearForm.endYear);
    if (!editYear && years.find(y => y.label === label)) { showToast("⚠️ This academic year already exists"); return; }

    if (editYear) {
      setYears(prev => prev.map(y => y.id === editYear.id ? { ...y, ...yearForm, label } : y));
      showToast("✅ Academic year updated");
    } else {
      const newYear: AcademicYear = { id: String(Date.now()), label, ...yearForm, status: "upcoming", totalStudents: 0, totalClasses: 0 };
      setYears(prev => [...prev, newYear]);
      showToast(`✅ Academic year ${label} created`);
    }
    setShowYearModal(false); setEditYear(null);
  };

  const openEditYear = (y: AcademicYear) => {
    setEditYear(y);
    setYearForm({ label: y.label, startMonth: y.startMonth, startYear: y.startYear, endMonth: y.endMonth, endYear: y.endYear });
    setShowYearModal(true);
  };

  const activateYear = (y: AcademicYear) => {
    setYears(prev => prev.map(x => ({ ...x, status: x.id === y.id ? "active" : x.status === "active" ? "closed" : x.status })));
    showToast(`✅ ${y.label} is now the active academic year`);
    setConfirmActivate(null);
  };

  const duplicateYear = (y: AcademicYear) => {
    const nextStart = String(Number(y.startYear) + 1);
    const nextEnd   = String(Number(y.endYear) + 1);
    const label = `${nextStart}-${nextEnd.slice(2)}`;
    if (years.find(x => x.label === label)) { showToast("⚠️ Next year already exists"); return; }
    setYears(prev => [...prev, { id: String(Date.now()), label, startMonth: y.startMonth, startYear: nextStart, endMonth: y.endMonth, endYear: nextEnd, status: "upcoming", totalStudents: 0, totalClasses: 0 }]);
    showToast(`✅ ${label} created as upcoming year`);
  };

  // ── Class helpers ──
  const updC = (k: string, v: string | number) => setClassForm(f => ({ ...f, [k]: v }));

  const saveClass = () => {
    if (!classForm.name) { showToast("⚠️ Class name is required"); return; }
    const divisionList = classForm.divisions.split(",").map(d => d.trim()).filter(Boolean);
    if (editClass) {
      setClasses(prev => prev.map(c => c.id === editClass.id ? { ...c, name: classForm.name, divisions: divisionList, teacher: classForm.teacher } : c));
      showToast("✅ Class updated");
    } else {
      setClasses(prev => [...prev, { id: String(Date.now()), name: classForm.name, divisions: divisionList, students: 0, teacher: classForm.teacher }]);
      showToast(`✅ ${classForm.name} added`);
    }
    setShowClassModal(false); setEditClass(null);
  };

  const openEditClass = (c: ClassItem) => {
    setEditClass(c);
    setClassForm({ name: c.name, divisions: c.divisions.join(", "), students: c.students, teacher: c.teacher });
    setShowClassModal(true);
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Academic Setup" subtitle="Academic years, classes & divisions · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><GraduationCap className="w-5 h-5 text-indigo-600" /></div>
              <div><p className="text-xs text-gray-500">Active Year</p><p className="text-lg font-bold">{activeYear?.label ?? "—"}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><CalendarDays className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-xs text-gray-500">Total Years</p><p className="text-lg font-bold">{years.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-xs text-gray-500">Classes</p><p className="text-lg font-bold">{classes.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-xs text-gray-500">Total Students</p><p className="text-lg font-bold">{activeYear?.totalStudents ?? 0}</p></div>
            </div>
          </Card>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([["years","Academic Years"],["classes","Classes & Divisions"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: Academic Years ── */}
        {tab === "years" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setEditYear(null); setYearForm({ ...emptyYear }); setShowYearModal(true); }}>
                <Plus className="w-4 h-4" />Create Academic Year
              </Button>
            </div>

            {/* Year cards */}
            <div className="grid grid-cols-1 gap-3">
              {years.sort((a, b) => b.label.localeCompare(a.label)).map(y => (
                <Card key={y.id} className={`p-5 ${y.status === "active" ? "border-green-300 bg-green-50/30" : y.status === "upcoming" ? "border-blue-200 bg-blue-50/20" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                        ${y.status === "active" ? "bg-green-100 text-green-700" : y.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {y.label.split("-")[0].slice(2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-bold text-gray-900">{y.label}</h3>
                          <YearBadge status={y.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {y.startMonth} {y.startYear} → {y.endMonth} {y.endYear}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{y.totalStudents || "—"}</p>
                        <p className="text-xs text-gray-400">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{y.totalClasses || "—"}</p>
                        <p className="text-xs text-gray-400">Classes</p>
                      </div>
                      <div className="flex gap-1.5">
                        {y.status !== "active" && (
                          <button
                            onClick={() => setConfirmActivate(y)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                          >
                            <ToggleRight className="w-3.5 h-3.5" />Set Active
                          </button>
                        )}
                        {y.status === "closed" && (
                          <button
                            onClick={() => duplicateYear(y)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />Duplicate
                          </button>
                        )}
                        <button onClick={() => openEditYear(y)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-4 h-4" /></button>
                        {y.status !== "active" && (
                          <button onClick={() => setDeleteYear(y)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  </div>

                  {y.status === "active" && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Term 1", period: `${y.startMonth} – Jun ${y.startYear}`, color: "bg-indigo-50 text-indigo-700" },
                          { label: "Term 2", period: `Jul – Sep ${y.startYear}`, color: "bg-purple-50 text-purple-700" },
                          { label: "Term 3", period: `Oct – Dec ${y.startYear}`, color: "bg-orange-50 text-orange-700" },
                          { label: "Term 4", period: `Jan – ${y.endMonth} ${y.endYear}`, color: "bg-green-50 text-green-700" },
                        ].map(t => (
                          <div key={t.label} className={`${t.color} rounded-lg px-3 py-2 text-center`}>
                            <p className="text-xs font-bold">{t.label}</p>
                            <p className="text-xs opacity-70 mt-0.5">{t.period}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Info box */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Academic Year Rules</p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1 list-disc list-inside">
                    <li>Only one year can be <strong>Active</strong> at a time — activating a new year closes the current one</li>
                    <li>Closed years are read-only and preserved for historical records and reports</li>
                    <li>Upcoming years can be prepared in advance (fee structures, class setup)</li>
                    <li>Use <strong>Duplicate</strong> to quickly create the next year based on a previous year</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: Classes & Divisions ── */}
        {tab === "classes" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Classes &amp; Divisions — {activeYear?.label ?? "No active year"}</CardTitle>
              <Button size="sm" onClick={() => { setEditClass(null); setClassForm({ ...emptyClass }); setShowClassModal(true); }}>
                <Plus className="w-4 h-4" />Add Class
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Class","Divisions","Students","Class Teacher","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 text-sm font-semibold">{c.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5 flex-wrap">
                          {c.divisions.map(d => <Badge key={d} variant="info">{d}</Badge>)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">{c.students}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{c.teacher || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEditClass(c)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteClass(c)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ── Create/Edit Academic Year Modal ── */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[480px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">{editYear ? "Edit Academic Year" : "Create Academic Year"}</h3>
              </div>
              <button onClick={() => { setShowYearModal(false); setEditYear(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            {/* Preview label */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
              <p className="text-xs text-indigo-500 font-medium">Academic Year Label</p>
              <p className="text-2xl font-bold text-indigo-700 mt-0.5">
                {yearForm.startYear && yearForm.endYear
                  ? `${yearForm.startYear}-${yearForm.endYear.slice(2)}`
                  : "—"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Month</label>
                  <select value={yearForm.startMonth} onChange={e => updY("startMonth", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Year *</label>
                  <select value={yearForm.startYear} onChange={e => updY("startYear", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {YEARS_LIST.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Month</label>
                  <select value={yearForm.endMonth} onChange={e => updY("endMonth", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Year *</label>
                  <select value={yearForm.endYear} onChange={e => updY("endYear", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {YEARS_LIST.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">📋 What gets created automatically:</p>
                <p>• 4 terms based on start/end months</p>
                <p>• Status set to <strong>Upcoming</strong> — activate when ready</p>
                <p>• All existing classes copied to the new year</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowYearModal(false); setEditYear(null); }}>Cancel</Button>
              <Button onClick={saveYear}>{editYear ? "Save Changes" : "Create Year"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Activate Confirm ── */}
      {confirmActivate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0"><ToggleRight className="w-5 h-5 text-green-600" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Activate {confirmActivate.label}?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will set <strong>{confirmActivate.label}</strong> as the active academic year.
                  {activeYear && <> The current active year <strong>{activeYear.label}</strong> will be marked as <strong>Closed</strong>.</>}
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
              ⚠️ Make sure all fee structures and class data are ready for the new year before activating.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmActivate(null)}>Cancel</Button>
              <Button onClick={() => activateYear(confirmActivate)} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4" />Yes, Activate {confirmActivate.label}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Year Confirm ── */}
      {deleteYear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete {deleteYear.label}?</h3>
                <p className="text-sm text-gray-500 mt-1">This academic year and its configuration will be permanently removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteYear(null)}>Cancel</Button>
              <Button onClick={() => { setYears(prev => prev.filter(y => y.id !== deleteYear.id)); showToast(`🗑️ ${deleteYear.label} deleted`); setDeleteYear(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add/Edit Class Modal ── */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[440px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editClass ? `Edit ${editClass.name}` : "Add New Class"}</h3>
              <button onClick={() => { setShowClassModal(false); setEditClass(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Class Name *</label>
                <input value={classForm.name} onChange={e => updC("name", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Class 10" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Divisions (comma separated)</label>
                <input value={classForm.divisions} onChange={e => updC("divisions", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. A, B, C" />
                <p className="text-xs text-gray-400 mt-1">Enter division names separated by commas</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Class Teacher</label>
                <input value={classForm.teacher} onChange={e => updC("teacher", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Teacher name" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowClassModal(false); setEditClass(null); }}>Cancel</Button>
              <Button onClick={saveClass}>{editClass ? "Save Changes" : "Add Class"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Class Confirm ── */}
      {deleteClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete {deleteClass.name}?</h3>
                <p className="text-sm text-gray-500 mt-1">This will remove the class and all its {deleteClass.divisions.length} division(s).</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteClass(null)}>Cancel</Button>
              <Button onClick={() => { setClasses(prev => prev.filter(c => c.id !== deleteClass.id)); showToast(`🗑️ ${deleteClass.name} removed`); setDeleteClass(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
