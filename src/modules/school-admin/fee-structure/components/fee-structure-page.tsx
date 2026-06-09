"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockFeeTypes, mockFeeStructures } from "@/lib/mock-data";
import { Plus, BookOpen, Edit2, Trash2, X, AlertTriangle, CheckSquare, Square, Search, User, UserPlus } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FeeStructure = {
  id: string; group: string; category: string;
  feeType: string; amount: number; frequency: string; dueDay: number;
};
type FeeType = { id: string; name: string; description: string; isLateFee?: boolean };
type StudentFee = {
  id: string;
  studentName: string; admissionNo: string; class: string;
  feeType: string; category: string; amount: number;
  frequency: string; dueDay: number; notes: string;
};
type StudentOption = { name: string; admissionNo: string; class: string };

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DEFAULT_GROUPS = [
  "Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12",
  "Batch A","Batch B","Under-14","Under-17","Senior","Junior","Year 1","Year 2",
];

const DEFAULT_CATEGORIES = [
  "General","Management","NRI","Sports","Staff Ward",
  "Scholarship","SC/ST","EWS","Merit","Early Bird",
];

const FREQ = ["Monthly","Quarterly","Half-Yearly","Annually","One-Time","Per Session","Per Term"];

const MOCK_STUDENTS = [
  { name:"Aryan Sharma",  admissionNo:"ADM-2024-001", class:"Class 10 - A" },
  { name:"Priya Nair",    admissionNo:"ADM-2024-002", class:"Class 8 - B"  },
  { name:"Rahul Verma",   admissionNo:"ADM-2024-003", class:"Class 12 - A" },
  { name:"Sneha Patel",   admissionNo:"ADM-2024-004", class:"Class 6 - C"  },
  { name:"Kiran Reddy",   admissionNo:"ADM-2024-005", class:"Class 9 - A"  },
  { name:"Aisha Khan",    admissionNo:"ADM-2024-006", class:"Class 11 - B" },
  { name:"Rohan Gupta",   admissionNo:"ADM-2024-007", class:"Class 7 - A"  },
  { name:"Meera Singh",   admissionNo:"ADM-2024-008", class:"Class 5 - B"  },
  { name:"Dev Malhotra",  admissionNo:"ADM-2024-009", class:"Class 10 - B" },
  { name:"Kavya Menon",   admissionNo:"ADM-2024-010", class:"Class 8 - A"  },
  { name:"Arjun Rao",     admissionNo:"ADM-2024-011", class:"Class 12 - B" },
  { name:"Nisha Joshi",   admissionNo:"ADM-2024-012", class:"Class 6 - A"  },
];

// Sample pre-existing student fees (bus route students etc.)
const INIT_STUDENT_FEES: StudentFee[] = [
  { id:"sf1", studentName:"Aryan Sharma",  admissionNo:"ADM-2024-001", class:"Class 10 - A", feeType:"Bus Fee",   category:"General",  amount:1200, frequency:"Monthly",  dueDay:5,  notes:"Route A - Stop 3" },
  { id:"sf2", studentName:"Priya Nair",    admissionNo:"ADM-2024-002", class:"Class 8 - B",  feeType:"Bus Fee",   category:"General",  amount:1200, frequency:"Monthly",  dueDay:5,  notes:"Route B - Stop 7" },
  { id:"sf3", studentName:"Kiran Reddy",   admissionNo:"ADM-2024-005", class:"Class 9 - A",  feeType:"Sports Fee",category:"Sports",   amount:500,  frequency:"Quarterly",dueDay:10, notes:"Basketball coaching" },
  { id:"sf4", studentName:"Aisha Khan",    admissionNo:"ADM-2024-006", class:"Class 11 - B", feeType:"Lab Fee",   category:"General",  amount:800,  frequency:"Annually", dueDay:15, notes:"Science lab extra" },
];

const emptyStruct = { selectedGroups:[] as string[], category:"General", feeType:"", amount:"", frequency:"Monthly", dueDay:"10" };
const emptyType   = { name:"", description:"", isLateFee:false };
const emptyStudentFee = { feeType:"Bus Fee", category:"General", amount:"", frequency:"Monthly", dueDay:"5", notes:"" };

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export function FeeStructurePage() {
  const [tab, setTab] = useState<"structures"|"types"|"custom">("structures");

  // ── Group Fee Structures ──
  const [structures, setStructures] = useState<FeeStructure[]>(
    (mockFeeStructures as any[]).map((s: any) => ({
      ...s,
      group: s.class || s.group || "Class 6",
      category: s.quota || s.category || "General",
    }))
  );
  const [showStructModal, setShowStructModal] = useState(false);
  const [editStruct, setEditStruct]           = useState<FeeStructure | null>(null);
  const [structForm, setStructForm]           = useState({ ...emptyStruct });
  const [deleteStruct, setDeleteStruct]       = useState<FeeStructure | null>(null);
  const [editGroup, setEditGroup]             = useState("");

  // ── Fee Types ──
  const [feeTypes, setFeeTypes]           = useState<FeeType[]>(mockFeeTypes as any);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editType, setEditType]           = useState<FeeType | null>(null);
  const [typeForm, setTypeForm]           = useState({ ...emptyType });
  const [deleteType, setDeleteType]       = useState<FeeType | null>(null);

  // ── Custom Fees (student-specific) ──
  const [studentFees, setStudentFees]         = useState<StudentFee[]>(INIT_STUDENT_FEES);
  const [showSFModal, setShowSFModal]         = useState(false);
  const [editSF, setEditSF]                   = useState<StudentFee | null>(null);
  const [deleteSF, setDeleteSF]               = useState<StudentFee | null>(null);
  const [sfForm, setSFForm]                   = useState({ ...emptyStudentFee });
  // Multi-student selection
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch]     = useState("");
  const [showStudentDrop, setShowStudentDrop] = useState(false);
  const [sfSearch, setSFSearch]               = useState("");

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ── Structure helpers ──
  const openAddStruct = () => { setEditStruct(null); setEditGroup(""); setStructForm({ ...emptyStruct, feeType: feeTypes[0]?.name || "Tuition Fee" }); setShowStructModal(true); };
  const openAddForGroup = (grp: string) => { setEditStruct(null); setEditGroup(""); setStructForm({ ...emptyStruct, selectedGroups:[grp], feeType: feeTypes[0]?.name || "Tuition Fee" }); setShowStructModal(true); };
  const openEditStruct = (s: FeeStructure) => { setEditStruct(s); setEditGroup(s.group); setStructForm({ selectedGroups:[s.group], category:s.category, feeType:s.feeType, amount:String(s.amount), frequency:s.frequency, dueDay:String(s.dueDay) }); setShowStructModal(true); };
  const toggleGroup = (g: string) => setStructForm(f => ({ ...f, selectedGroups: f.selectedGroups.includes(g) ? f.selectedGroups.filter(x => x !== g) : [...f.selectedGroups, g] }));
  const selectAllGroups = () => setStructForm(f => ({ ...f, selectedGroups: [...DEFAULT_GROUPS] }));
  const clearGroups     = () => setStructForm(f => ({ ...f, selectedGroups: [] }));

  const saveStruct = () => {
    if (!editStruct && structForm.selectedGroups.length === 0) { showToast("⚠️ Select at least one group"); return; }
    if (!structForm.amount) { showToast("⚠️ Amount is required"); return; }
    const base = { category: structForm.category, feeType: structForm.feeType, amount: Number(structForm.amount), frequency: structForm.frequency, dueDay: Number(structForm.dueDay) };
    if (editStruct) {
      setStructures(prev => prev.map(s => s.id === editStruct.id ? { ...s, ...base } : s));
      showToast("✅ Fee structure updated");
    } else {
      const newEntries = structForm.selectedGroups.map(grp => ({ id: String(Date.now()) + grp, group: grp, ...base }));
      setStructures(prev => [...prev, ...newEntries]);
      showToast(`✅ Fee added to ${newEntries.length} group${newEntries.length > 1 ? "s" : ""}`);
    }
    setShowStructModal(false); setEditStruct(null);
  };

  // ── Fee Type CRUD ──
  const saveType = () => {
    if (!typeForm.name) { showToast("⚠️ Fee type name is required"); return; }
    if (editType) { setFeeTypes(prev => prev.map(t => t.id === editType.id ? { ...t, ...typeForm } : t)); showToast("✅ Fee type updated"); }
    else { setFeeTypes(prev => [...prev, { id: String(Date.now()), ...typeForm }]); showToast("✅ Fee type created"); }
    setShowTypeModal(false); setEditType(null);
  };

  // ── Custom Fee helpers ──
  const openAddSF = () => {
    setEditSF(null); setSFForm({ ...emptyStudentFee });
    setSelectedStudents([]); setStudentSearch(""); setShowSFModal(true);
  };
  const openEditSF = (sf: StudentFee) => {
    setEditSF(sf);
    setSFForm({ feeType: sf.feeType, category: sf.category, amount: String(sf.amount), frequency: sf.frequency, dueDay: String(sf.dueDay), notes: sf.notes });
    setSelectedStudents([{ name: sf.studentName, admissionNo: sf.admissionNo, class: sf.class }]);
    setStudentSearch(""); setShowSFModal(true);
  };

  const toggleStudentSelect = (s: StudentOption) => {
    setSelectedStudents(prev => {
      const exists = prev.find(x => x.admissionNo === s.admissionNo);
      return exists ? prev.filter(x => x.admissionNo !== s.admissionNo) : [...prev, s];
    });
  };
  const removeSelectedStudent = (admNo: string) => setSelectedStudents(prev => prev.filter(x => x.admissionNo !== admNo));

  const saveSF = () => {
    if (!editSF && selectedStudents.length === 0) { showToast("⚠️ Select at least one student"); return; }
    if (!sfForm.amount || Number(sfForm.amount) <= 0) { showToast("⚠️ Valid amount is required"); return; }
    if (!sfForm.feeType.trim()) { showToast("⚠️ Fee type is required"); return; }
    const base = { feeType: sfForm.feeType.trim(), category: sfForm.category, amount: Number(sfForm.amount), frequency: sfForm.frequency, dueDay: Number(sfForm.dueDay), notes: sfForm.notes.trim() };
    if (editSF) {
      const s = selectedStudents[0];
      setStudentFees(prev => prev.map(x => x.id === editSF.id ? { ...x, ...base, studentName: s?.name || editSF.studentName, admissionNo: s?.admissionNo || editSF.admissionNo, class: s?.class || editSF.class } : x));
      showToast("✅ Custom fee updated");
    } else {
      const newEntries = selectedStudents.map(s => ({ id: String(Date.now()) + s.admissionNo, studentName: s.name, admissionNo: s.admissionNo, class: s.class, ...base }));
      setStudentFees(prev => [...prev, ...newEntries]);
      showToast(`✅ ${sfForm.feeType} assigned to ${newEntries.length} student${newEntries.length > 1 ? "s" : ""}`);
    }
    setShowSFModal(false); setEditSF(null); setSelectedStudents([]);
  };

  const filteredSuggestions = MOCK_STUDENTS.filter(s =>
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()))
  ).slice(0, 8);
  const filteredSF = studentFees.filter(sf => sf.studentName.toLowerCase().includes(sfSearch.toLowerCase()) || sf.feeType.toLowerCase().includes(sfSearch.toLowerCase()) || sf.admissionNo.toLowerCase().includes(sfSearch.toLowerCase()));

  const groupedStructures = structures.reduce<Record<string, FeeStructure[]>>((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s); return acc;
  }, {});

  const FEE_TYPE_OPTIONS = [...new Set([...feeTypes.map(f => f.name), "Bus Fee","Sports Fee","Lab Fee","Library Fee","Music Fee","Dance Fee","Art Fee","Hostel Fee","Meal Fee","Uniform Fee","Activity Fee"])];

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Fee Structure" subtitle="Configure fees for any group, batch, or class · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {([["structures","Fee Structures"],["types","Fee Types"],["custom","Custom Fees"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
          {tab === "structures" && (
            <Button size="sm" className="ml-3" onClick={openAddStruct}><Plus className="w-4 h-4" />Add Structure</Button>
          )}
          {tab === "types" && (
            <Button size="sm" className="ml-3" onClick={() => { setEditType(null); setTypeForm({ ...emptyType }); setShowTypeModal(true); }}><Plus className="w-4 h-4" />Add Fee Type</Button>
          )}
          {tab === "custom" && (
            <Button size="sm" className="ml-3" onClick={openAddSF}><UserPlus className="w-4 h-4" />Assign Custom Fee</Button>
          )}
        </div>

        {/* ── Fee Structures Tab ── */}
        {tab === "structures" && (
          <div className="space-y-4">
            {Object.keys(groupedStructures).length === 0 && (
              <Card className="p-12 text-center">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No fee structures yet. Click <strong>Add Structure</strong> to get started.</p>
              </Card>
            )}
            {Object.entries(groupedStructures).map(([grp, rows]) => (
              <Card key={grp}>
                <CardHeader className="py-3 px-5 flex flex-row items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-700">{grp.slice(0, 2).toUpperCase()}</div>
                    <CardTitle className="text-sm">{grp}</CardTitle>
                    <span className="text-xs text-gray-400">({rows.length} fee{rows.length !== 1 ? "s" : ""})</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openAddForGroup(grp)}><Plus className="w-3.5 h-3.5" />Add Fee</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        {["Category","Fee Type","Amount","Frequency","Due Day","Actions"].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-2.5 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(f => (
                        <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                          <td className="px-5 py-3"><Badge variant="info">{f.category}</Badge></td>
                          <td className="px-5 py-3 text-sm font-medium">{f.feeType}</td>
                          <td className="px-5 py-3 text-sm font-semibold text-indigo-700">{formatCurrency(f.amount)}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{f.frequency}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{f.dueDay}th</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => openEditStruct(f)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteStruct(f)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Fee Types Tab ── */}
        {tab === "types" && (
          <div className="grid grid-cols-2 gap-4">
            {feeTypes.map(ft => (
              <Card key={ft.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{ft.name}</p>
                      {ft.isLateFee && <Badge variant="warning">Late Fee</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{ft.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditType(ft); setTypeForm({ name:ft.name, description:ft.description||"", isLateFee:!!ft.isLateFee }); setShowTypeModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteType(ft)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </Card>
            ))}
            <button onClick={() => { setEditType(null); setTypeForm({ ...emptyType }); setShowTypeModal(true); }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Add Fee Type</p>
            </button>
          </div>
        )}

        {/* ── Custom Fees Tab ── */}
        {tab === "custom" && (
          <div className="space-y-4">
            {/* Info card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <User className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-900">Custom Fees — Assigned to Specific Students</p>
                <p className="text-xs text-indigo-700 mt-0.5">For fees that apply to only certain students — e.g. Bus Fee, Sports coaching, Lab, Hostel. Select one or multiple students and assign the custom fee in one action.</p>
              </div>
            </div>

            {/* Search + table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Student Fee Assignments</CardTitle>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredSF.length} entries</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={sfSearch} onChange={e => setSFSearch(e.target.value)} placeholder="Search student or fee..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-56" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredSF.length === 0 ? (
                  <div className="py-12 text-center">
                    <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No student-specific fees yet.</p>
                    <Button size="sm" className="mt-3" onClick={openAddSF}><Plus className="w-4 h-4" />Assign Custom Fee</Button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {["Student","Admission No","Class","Fee Type","Category","Amount","Frequency","Due","Actions"].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSF.map(sf => (
                        <tr key={sf.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                                {sf.studentName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{sf.studentName}</p>
                                {sf.notes && <p className="text-xs text-gray-400">{sf.notes}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-mono">{sf.admissionNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{sf.class}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{sf.feeType}</td>
                          <td className="px-4 py-3"><Badge variant="info">{sf.category}</Badge></td>
                          <td className="px-4 py-3 text-sm font-semibold text-indigo-700">{formatCurrency(sf.amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{sf.frequency}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{sf.dueDay}th</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => openEditSF(sf)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteSF(sf)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* ── Add/Edit Structure Modal ── */}
      {showStructModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[560px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editStruct ? "Edit Fee Structure" : "Add Fee Structure"}</h3>
              <button onClick={() => { setShowStructModal(false); setEditStruct(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            {!editStruct && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 font-medium">Apply to Groups / Classes *{structForm.selectedGroups.length > 0 && <span className="ml-2 text-indigo-600 font-semibold">{structForm.selectedGroups.length} selected</span>}</label>
                  <div className="flex gap-2">
                    <button onClick={selectAllGroups} className="text-xs text-indigo-600 hover:underline">Select All</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={clearGroups} className="text-xs text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                  {DEFAULT_GROUPS.map(g => {
                    const selected = structForm.selectedGroups.includes(g);
                    return (
                      <button key={g} onClick={() => toggleGroup(g)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${selected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0 text-gray-300" />}
                        {g}
                      </button>
                    );
                  })}
                </div>
                {structForm.selectedGroups.length > 0 && <p className="text-xs text-indigo-600 mt-1.5">This fee will be created for: {structForm.selectedGroups.join(", ")}</p>}
              </div>
            )}
            {editStruct && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm text-indigo-700 font-medium">
                Editing fee for: <strong>{editStruct.group}</strong>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Category / Quota</label>
                <select value={structForm.category} onChange={e => setStructForm(f => ({ ...f, category:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                <input value={structForm.feeType} onChange={e => setStructForm(f => ({ ...f, feeType:e.target.value }))} list="fee-type-list" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Tuition Fee, Bus Fee" />
                <datalist id="fee-type-list">{feeTypes.map(ft => <option key={ft.id} value={ft.name} />)}</datalist>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                <input type="number" value={structForm.amount} onChange={e => setStructForm(f => ({ ...f, amount:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Due Day of Month</label>
                <input type="number" min="1" max="31" value={structForm.dueDay} onChange={e => setStructForm(f => ({ ...f, dueDay:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Frequency</label>
                <select value={structForm.frequency} onChange={e => setStructForm(f => ({ ...f, frequency:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {FREQ.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowStructModal(false); setEditStruct(null); }}>Cancel</Button>
              <Button onClick={saveStruct}>{editStruct ? "Save Changes" : structForm.selectedGroups.length > 1 ? `Add to ${structForm.selectedGroups.length} Groups` : "Add Structure"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add/Edit Fee Type Modal ── */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editType ? "Edit Fee Type" : "Create Fee Type"}</h3>
              <button onClick={() => { setShowTypeModal(false); setEditType(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Fee Type Name *</label>
                <input value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name:e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Tuition Fee, Bus Fee, Lab Fee" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Description</label>
                <textarea value={typeForm.description} onChange={e => setTypeForm(f => ({ ...f, description:e.target.value }))} rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Brief description..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={typeForm.isLateFee} onChange={e => setTypeForm(f => ({ ...f, isLateFee:e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-gray-700">This is a Late Fee / Penalty charge</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowTypeModal(false); setEditType(null); }}>Cancel</Button>
              <Button onClick={saveType}>{editType ? "Save Changes" : "Create Type"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Assign Custom Fee Modal ── */}
      {showSFModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[580px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">{editSF ? "Edit Custom Fee" : "Assign Custom Fee"}</h3>
              </div>
              <button onClick={() => { setShowSFModal(false); setEditSF(null); setSelectedStudents([]); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            {/* Multi-student selector */}
            <div>
              <label className="text-xs text-gray-500 font-medium">
                Select Students *
                {selectedStudents.length > 0 && <span className="ml-2 text-indigo-600 font-semibold">{selectedStudents.length} selected</span>}
              </label>

              {/* Selected student chips */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {selectedStudents.map(s => (
                    <span key={s.admissionNo} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      <span>{s.name}</span>
                      <span className="text-indigo-400">·</span>
                      <span className="text-indigo-500">{s.class}</span>
                      <button onClick={() => removeSelectedStudent(s.admissionNo)} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={studentSearch}
                  onChange={e => { setStudentSearch(e.target.value); setShowStudentDrop(true); }}
                  onFocus={() => setShowStudentDrop(true)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search student name or admission no..." />
              </div>

              {/* Dropdown */}
              {showStudentDrop && studentSearch && filteredSuggestions.length > 0 && (
                <div className="border border-gray-200 rounded-xl mt-1 overflow-hidden shadow-md">
                  {filteredSuggestions.map(s => {
                    const isSelected = selectedStudents.some(x => x.admissionNo === s.admissionNo);
                    return (
                      <button key={s.admissionNo} onClick={() => { toggleStudentSelect(s); setStudentSearch(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 ${isSelected ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                          {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.admissionNo} · {s.class}</p>
                        </div>
                        {isSelected && <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />}
                        {!isSelected && <Square className="w-4 h-4 text-gray-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedStudents.length === 0 && !studentSearch && (
                <p className="text-xs text-gray-400 mt-1">Type a name to search and select one or more students</p>
              )}
            </div>

            {/* Quick fee type chips */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Custom Fee Type *</label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {["Bus Fee","Sports Fee","Lab Fee","Library Fee","Music Fee","Dance Fee","Hostel Fee","Meal Fee","Activity Fee","Uniform Fee"].map(ft => (
                  <button key={ft} onClick={() => setSFForm(f => ({ ...f, feeType: ft }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${sfForm.feeType === ft ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}>
                    {ft}
                  </button>
                ))}
              </div>
              <input value={sfForm.feeType} onChange={e => setSFForm(f => ({ ...f, feeType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Or type any custom fee name..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Category / Quota</label>
                <select value={sfForm.category} onChange={e => setSFForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                <input type="number" value={sfForm.amount} onChange={e => setSFForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Frequency</label>
                <select value={sfForm.frequency} onChange={e => setSFForm(f => ({ ...f, frequency: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {FREQ.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Due Day of Month</label>
                <input type="number" min="1" max="31" value={sfForm.dueDay} onChange={e => setSFForm(f => ({ ...f, dueDay: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Notes / Remarks</label>
                <input value={sfForm.notes} onChange={e => setSFForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Route A - Stop 3, Basketball coaching..." />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowSFModal(false); setEditSF(null); setSelectedStudents([]); }}>Cancel</Button>
              <Button onClick={saveSF}>
                <UserPlus className="w-4 h-4" />
                {editSF ? "Save Changes" : selectedStudents.length > 1 ? `Assign to ${selectedStudents.length} Students` : "Assign Custom Fee"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Confirms ── */}
      {deleteStruct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Fee Structure?</h3>
                <p className="text-sm text-gray-500 mt-1">{deleteStruct.group} · {deleteStruct.category} · {deleteStruct.feeType} — will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteStruct(null)}>Cancel</Button>
              <Button onClick={() => { setStructures(p => p.filter(s => s.id !== deleteStruct.id)); showToast("🗑️ Structure removed"); setDeleteStruct(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
      {deleteType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete "{deleteType.name}"?</h3>
                <p className="text-sm text-gray-500 mt-1">This fee type will be permanently removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteType(null)}>Cancel</Button>
              <Button onClick={() => { setFeeTypes(p => p.filter(t => t.id !== deleteType.id)); showToast(`🗑️ "${deleteType.name}" removed`); setDeleteType(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
      {deleteSF && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Remove Custom Fee?</h3>
                <p className="text-sm text-gray-500 mt-1">{deleteSF.feeType} for <strong>{deleteSF.studentName}</strong> will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteSF(null)}>Cancel</Button>
              <Button onClick={() => { setStudentFees(p => p.filter(s => s.id !== deleteSF.id)); showToast(`🗑️ Fee removed for ${deleteSF.studentName}`); setDeleteSF(null); }} className="bg-red-600 hover:bg-red-700 text-white">Remove</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
