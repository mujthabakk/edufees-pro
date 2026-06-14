"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import {
  Building2, Plus, GraduationCap, Edit2, Trash2, X,
  AlertTriangle, Users, CalendarDays, CheckCircle, Clock,
  Copy, ToggleRight, Tag,
} from "lucide-react";
import {
  useAcademicYears, useClasses, useQuotas,
  useCreateAcademicYear, useCreateClass, useCreateDivision,
  useCreateQuota, useSetCurrentYear,
  useUpdateAcademicYear, useDeleteAcademicYear,
  useUpdateClass, useDeleteClass, useUpdateQuota, useDeleteQuota,
  type AcademicYearDto, type ClassWithDivisions,
} from "@/lib/api/hooks/useAcademic";

type AcademicYear = {
  id: string; label: string; startMonth: string; startYear: string;
  endMonth: string; endYear: string;
  status: "active" | "upcoming" | "closed";
  totalStudents: number; totalGroups: number;
};

type GroupItem = {
  id: string; name: string; sections: string[]; students: number; incharge: string;
};

type Quota = { id: string; name: string; description: string };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS_LIST = ["2023","2024","2025","2026","2027","2028","2029","2030"];

const monthIndex = (m: string) => Math.max(0, MONTHS.indexOf(m));
const toISODate = (year: string, month: string, day = 1) =>
  new Date(Number(year), monthIndex(month), day).toISOString().slice(0, 10);

function mapYear(y: AcademicYearDto): AcademicYear {
  const start = new Date(y.startDate);
  const end = new Date(y.endDate);
  const now = new Date();
  const status: AcademicYear["status"] = y.isCurrent
    ? "active"
    : start > now
      ? "upcoming"
      : "closed";
  return {
    id: y.id,
    label: y.label,
    startMonth: MONTHS[start.getMonth()],
    startYear: String(start.getFullYear()),
    endMonth: MONTHS[end.getMonth()],
    endYear: String(end.getFullYear()),
    status,
    totalStudents: 0,
    totalGroups: 0,
  };
}

function mapGroup(c: ClassWithDivisions): GroupItem {
  return {
    id: c.id,
    name: c.name,
    sections: c.divisions.map((d) => d.name),
    students: 0,
    incharge: "",
  };
}

function YearBadge({ status }: { status: AcademicYear["status"] }) {
  if (status === "active")   return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" />Active</span>;
  if (status === "upcoming") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" />Upcoming</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Closed</span>;
}

export function AcademicPage() {
  const [tab, setTab] = useState<"years" | "groups" | "quotas">("years");

  // Live data from the API (seeds the editable lists below).
  const yearsQuery = useAcademicYears();
  const classesQuery = useClasses();
  const quotasQuery = useQuotas();
  const createYearMut = useCreateAcademicYear();
  const createClassMut = useCreateClass();
  const createDivisionMut = useCreateDivision();
  const createQuotaMut = useCreateQuota();
  const setCurrentYearMut = useSetCurrentYear();
  const updateYearMut = useUpdateAcademicYear();
  const deleteYearMut = useDeleteAcademicYear();
  const updateClassMut = useUpdateClass();
  const deleteClassMut = useDeleteClass();
  const updateQuotaMut = useUpdateQuota();
  const deleteQuotaMut = useDeleteQuota();

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editYear, setEditYear] = useState<AcademicYear | null>(null);
  const [deleteYear, setDeleteYear] = useState<AcademicYear | null>(null);
  const [confirmActivate, setConfirmActivate] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({ startMonth:"April", startYear:"2026", endMonth:"March", endYear:"2027" });

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupItem | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<GroupItem | null>(null);
  const [groupForm, setGroupForm] = useState({ name:"", sections:"A, B", incharge:"" });

  // Quota state
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [quotaForm, setQuotaForm] = useState({ name:"", description:"" });
  const [editQuota, setEditQuota] = useState<Quota | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [deleteQuota, setDeleteQuota] = useState<Quota | null>(null);

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Seed editable lists from queries.
  useEffect(() => {
    if (yearsQuery.data) setYears(yearsQuery.data.map(mapYear));
  }, [yearsQuery.data]);
  useEffect(() => {
    if (classesQuery.data) setGroups(classesQuery.data.map(mapGroup));
  }, [classesQuery.data]);
  useEffect(() => {
    if (quotasQuery.data) {
      setQuotas(quotasQuery.data.map((q) => ({ id: q.id, name: q.name, description: q.description ?? "" })));
    }
  }, [quotasQuery.data]);

  const activeYear = years.find(y => y.status === "active");

  const saveYear = () => {
    if (!yearForm.startYear || !yearForm.endYear) { showToast("⚠️ Start and end year required"); return; }
    const label = `${yearForm.startYear}-${yearForm.endYear.slice(2)}`;
    if (!editYear && years.find(y => y.label === label)) { showToast("⚠️ Year already exists"); return; }
    if (editYear) {
      updateYearMut.mutate(
        {
          id: editYear.id,
          payload: {
            label,
            startDate: toISODate(yearForm.startYear, yearForm.startMonth),
            endDate: toISODate(yearForm.endYear, yearForm.endMonth),
          },
        },
        {
          onSuccess: () => { showToast("✅ Academic year updated"); setShowYearModal(false); setEditYear(null); },
          onError: () => showToast("❌ Failed to update academic year"),
        },
      );
      return;
    }
    createYearMut.mutate(
      {
        label,
        startDate: toISODate(yearForm.startYear, yearForm.startMonth),
        endDate: toISODate(yearForm.endYear, yearForm.endMonth),
      },
      {
        onSuccess: () => { showToast(`✅ Academic year ${label} created`); },
        onError: () => {
          setYears(prev => [...prev, { id:String(Date.now()), ...yearForm, label, status:"upcoming", totalStudents:0, totalGroups:0 }]);
          showToast(`✅ Academic year ${label} created (local)`);
        },
      },
    );
    setShowYearModal(false); setEditYear(null);
  };

  const openEditYear = (y: AcademicYear) => {
    setEditYear(y);
    setYearForm({ startMonth:y.startMonth, startYear:y.startYear, endMonth:y.endMonth, endYear:y.endYear });
    setShowYearModal(true);
  };

  const activateYear = (y: AcademicYear) => {
    setCurrentYearMut.mutate(y.id, {
      onSuccess: () => showToast(`✅ ${y.label} is now active`),
      onError: () => {
        setYears(prev => prev.map(x => ({ ...x, status: x.id === y.id ? "active" : x.status === "active" ? "closed" : x.status })));
        showToast(`✅ ${y.label} is now active (local)`);
      },
    });
    setConfirmActivate(null);
  };

  const duplicateYear = (y: AcademicYear) => {
    const nextStart = String(Number(y.startYear) + 1);
    const nextEnd   = String(Number(y.endYear) + 1);
    const label = `${nextStart}-${nextEnd.slice(2)}`;
    if (years.find(x => x.label === label)) { showToast("⚠️ Next year already exists"); return; }
    createYearMut.mutate(
      {
        label,
        startDate: toISODate(nextStart, y.startMonth),
        endDate: toISODate(nextEnd, y.endMonth),
      },
      {
        onSuccess: () => showToast(`✅ ${label} created`),
        onError: () => {
          setYears(prev => [...prev, { id:String(Date.now()), label, startMonth:y.startMonth, startYear:nextStart, endMonth:y.endMonth, endYear:nextEnd, status:"upcoming", totalStudents:0, totalGroups:0 }]);
          showToast(`✅ ${label} created (local)`);
        },
      },
    );
  };

  const saveGroup = () => {
    if (!groupForm.name.trim()) { showToast("⚠️ Group name is required"); return; }
    const sections = groupForm.sections.split(",").map(s => s.trim()).filter(Boolean);
    if (editGroup) {
      updateClassMut.mutate(
        { id: editGroup.id, payload: { name: groupForm.name.trim() } },
        {
          onSuccess: () => { showToast("✅ Group updated"); setShowGroupModal(false); setEditGroup(null); },
          onError: () => showToast("❌ Failed to update group"),
        },
      );
      return;
    }
    const name = groupForm.name.trim();
    createClassMut.mutate(
      { name },
      {
        onSuccess: (created) => {
          const classId = (created as { id?: string } | null)?.id;
          if (classId) {
            sections.forEach((sectionName) => createDivisionMut.mutate({ classId, name: sectionName }));
          }
          showToast(`✅ ${name} added`);
        },
        onError: () => {
          setGroups(prev => [...prev, { id:String(Date.now()), name, sections, students:0, incharge:"" }]);
          showToast(`✅ ${name} added (local)`);
        },
      },
    );
    setShowGroupModal(false); setEditGroup(null);
  };

  const openEditGroup = (g: GroupItem) => {
    setEditGroup(g);
    setGroupForm({ name:g.name, sections:g.sections.join(", "), incharge:"" });
    setShowGroupModal(true);
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Academic Setup" subtitle="Academic years, groups & sections · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              <div><p className="text-xs text-gray-500">Groups</p><p className="text-lg font-bold">{groups.length}</p></div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-orange-600" /></div>
              <div><p className="text-xs text-gray-500">Total Students</p><p className="text-lg font-bold">{activeYear?.totalStudents ?? 0}</p></div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([["years","Academic Years"],["groups","Groups & Sections"],["quotas","Quotas"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as "years"|"groups"|"quotas")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: Academic Years ── */}
        {tab === "years" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setEditYear(null); setYearForm({ startMonth:"April", startYear:"2026", endMonth:"March", endYear:"2027" }); setShowYearModal(true); }}>
                <Plus className="w-4 h-4" />Create Academic Year
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[...years].sort((a, b) => b.label.localeCompare(a.label)).map(y => (
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
                        <p className="text-xs text-gray-500 mt-0.5">{y.startMonth} {y.startYear} → {y.endMonth} {y.endYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center"><p className="text-xl font-bold text-gray-900">{y.totalStudents || "—"}</p><p className="text-xs text-gray-400">Students</p></div>
                      <div className="text-center"><p className="text-xl font-bold text-gray-900">{y.totalGroups || "—"}</p><p className="text-xs text-gray-400">Groups</p></div>
                      <div className="flex gap-1.5">
                        {y.status !== "active" && (
                          <button onClick={() => setConfirmActivate(y)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg">
                            <ToggleRight className="w-3.5 h-3.5" />Set Active
                          </button>
                        )}
                        {y.status === "closed" && (
                          <button onClick={() => duplicateYear(y)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg">
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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label:"Term 1", period:`${y.startMonth} – Jun ${y.startYear}`, color:"bg-indigo-50 text-indigo-700" },
                          { label:"Term 2", period:`Jul – Sep ${y.startYear}`,             color:"bg-purple-50 text-purple-700" },
                          { label:"Term 3", period:`Oct – Dec ${y.startYear}`,             color:"bg-orange-50 text-orange-700" },
                          { label:"Term 4", period:`Jan – ${y.endMonth} ${y.endYear}`,     color:"bg-green-50 text-green-700" },
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

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Academic Year Rules</p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1 list-disc list-inside">
                    <li>Only one year can be <strong>Active</strong> at a time — activating a new year closes the current one</li>
                    <li>Closed years are read-only and preserved for historical records</li>
                    <li>Use <strong>Duplicate</strong> to quickly create the next year from a previous one</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: Groups & Sections ── */}
        {tab === "groups" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Groups &amp; Sections — {activeYear?.label ?? "No active year"}</CardTitle>
              <Button size="sm" onClick={() => { setEditGroup(null); setGroupForm({ name:"", sections:"A, B", incharge:"" }); setShowGroupModal(true); }}>
                <Plus className="w-4 h-4" />Add Group
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Group","Divisions / Batches","Students","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 text-sm font-semibold">{g.name}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {g.sections.length > 0
                            ? g.sections.map(s => <Badge key={s} variant="info">{s}</Badge>)
                            : <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">{g.students}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEditGroup(g)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteGroup(g)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: Quotas ── */}
        {tab === "quotas" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Student Quotas / Categories</h3>
                <p className="text-xs text-gray-400 mt-0.5">Define admission quotas used when assigning fee structures (e.g. General, Management, NRI, Sports)</p>
              </div>
              <Button size="sm" onClick={() => { setEditQuota(null); setQuotaForm({ name:"", description:"" }); setShowQuotaModal(true); }}>
                <Plus className="w-4 h-4" />Add Quota
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {["#","Quota Name","Description","Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotas.map((q, i) => (
                      <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                        <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full">
                            <Tag className="w-3 h-3" />{q.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{q.description || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditQuota(q); setQuotaForm({ name:q.name, description:q.description }); setShowQuotaModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteQuota(q)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {quotas.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">No quotas defined. Click "Add Quota" to create one.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 space-y-1">
                  <p className="font-semibold text-amber-800">What are Quotas?</p>
                  <p>Quotas define student admission categories with different fee slabs. Examples:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-1">
                    <span>🏫 School — General, Management, NRI, Sports</span>
                    <span>🎓 College — Merit, Management, NRI, EWS</span>
                    <span>⚽ Sports Academy — Elite, Regular, Trial</span>
                    <span>🎵 Music — Full Fee, Scholarship, Staff Ward</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* ── Year Modal ── */}
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

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
              <p className="text-xs text-indigo-500 font-medium">Academic Year Label</p>
              <p className="text-2xl font-bold text-indigo-700 mt-0.5">
                {yearForm.startYear && yearForm.endYear ? `${yearForm.startYear}-${yearForm.endYear.slice(2)}` : "—"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Month</label>
                  <select value={yearForm.startMonth} onChange={e => setYearForm(f => ({ ...f, startMonth:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Year *</label>
                  <select value={yearForm.startYear} onChange={e => setYearForm(f => ({ ...f, startYear:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {YEARS_LIST.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Month</label>
                  <select value={yearForm.endMonth} onChange={e => setYearForm(f => ({ ...f, endMonth:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Year *</label>
                  <select value={yearForm.endYear} onChange={e => setYearForm(f => ({ ...f, endYear:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {YEARS_LIST.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
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
                  {activeYear && <>The current active year <strong>{activeYear.label}</strong> will be marked as <strong>Closed</strong>.</>}
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
              ⚠️ Make sure fee structures and group data are ready before activating.
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

      {/* ── Delete Year ── */}
      {deleteYear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete {deleteYear.label}?</h3>
                <p className="text-sm text-gray-500 mt-1">This academic year will be permanently removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteYear(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!deleteYear) return;
                deleteYearMut.mutate(deleteYear.id, {
                  onSuccess: () => { showToast(`🗑️ ${deleteYear.label} deleted`); setDeleteYear(null); },
                  onError: () => showToast("❌ Failed to delete academic year"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add/Edit Group Modal ── */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[460px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editGroup ? `Edit ${editGroup.name}` : "Add New Group"}</h3>
              <button onClick={() => { setShowGroupModal(false); setEditGroup(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Group Name *</label>
                <input value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name:e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Class 10 / Semester 1 / Under-14 / Batch A" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Divisions / Batches <span className="font-normal text-gray-400">(comma separated, optional)</span></label>
                <input value={groupForm.sections} onChange={e => setGroupForm(f => ({ ...f, sections:e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. A, B, C  or  Morning, Evening  or  Group 1, Group 2" />
                {groupForm.sections && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {groupForm.sections.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowGroupModal(false); setEditGroup(null); }}>Cancel</Button>
              <Button onClick={saveGroup}>{editGroup ? "Save Changes" : "Add Group"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Group ── */}
      {deleteGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete {deleteGroup.name}?</h3>
                <p className="text-sm text-gray-500 mt-1">This will remove the group and its {deleteGroup.sections.length} section(s).</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteGroup(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!deleteGroup) return;
                deleteClassMut.mutate(deleteGroup.id, {
                  onSuccess: () => { showToast(`🗑️ ${deleteGroup.name} removed`); setDeleteGroup(null); },
                  onError: () => showToast("❌ Failed to delete group"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add/Edit Quota Modal ── */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[440px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">{editQuota ? "Edit Quota" : "Add Quota"}</h3>
              </div>
              <button onClick={() => { setShowQuotaModal(false); setEditQuota(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Quota Name *</label>
                <input value={quotaForm.name} onChange={e => setQuotaForm(f => ({ ...f, name:e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. General, Management, NRI, Sports, Scholarship" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Description <span className="font-normal text-gray-400">(optional)</span></label>
                <input value={quotaForm.description} onChange={e => setQuotaForm(f => ({ ...f, description:e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Students admitted under management quota" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Quick add common quotas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["General","Management","NRI","Sports","Staff Ward","Scholarship","SC/ST","OBC","EWS","Merit","Early Bird","Sibling"].map(q => (
                    <button key={q} onClick={() => setQuotaForm(f => ({ ...f, name:q }))}
                      className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowQuotaModal(false); setEditQuota(null); }}>Cancel</Button>
              <Button onClick={() => {
                if (!quotaForm.name.trim()) { showToast("⚠️ Quota name is required"); return; }
                if (editQuota) {
                  updateQuotaMut.mutate(
                    { id: editQuota.id, payload: { name: quotaForm.name.trim(), description: quotaForm.description.trim() || undefined } },
                    {
                      onSuccess: () => { showToast("✅ Quota updated"); setShowQuotaModal(false); setEditQuota(null); },
                      onError: () => showToast("❌ Failed to update quota"),
                    },
                  );
                  return;
                }
                createQuotaMut.mutate(
                  { name: quotaForm.name.trim(), description: quotaForm.description.trim() || undefined },
                  {
                    onSuccess: () => showToast(`✅ "${quotaForm.name}" quota added`),
                    onError: () => {
                      setQuotas(prev => [...prev, { id:String(Date.now()), ...quotaForm }]);
                      showToast(`✅ "${quotaForm.name}" quota added (local)`);
                    },
                  },
                );
                setShowQuotaModal(false); setEditQuota(null);
              }}>{editQuota ? "Save Changes" : "Add Quota"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Quota Confirm ── */}
      {deleteQuota && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete "{deleteQuota.name}" quota?</h3>
                <p className="text-sm text-gray-500 mt-1">This quota will be removed. Existing fee structures using this quota won't be affected.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteQuota(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!deleteQuota) return;
                deleteQuotaMut.mutate(deleteQuota.id, {
                  onSuccess: () => { showToast(`🗑️ "${deleteQuota.name}" removed`); setDeleteQuota(null); },
                  onError: () => showToast("❌ Failed to delete quota"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
