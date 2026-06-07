"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent } from "@/modules/shared/ui/card";
import { StatusBadge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { formatCurrency } from "@/lib/utils";
import { mockStudents } from "@/lib/mock-data";
import { Search, Plus, Download, Phone, Mail, Eye, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

const CLASSES = ["All Classes", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const STATUSES = ["All", "PAID", "PARTIAL", "PENDING", "OVERDUE"];
const CLASS_LIST = ["Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["A","B","C","D"];
const QUOTAS = ["General","Management","NRI","Sports","Staff Ward"];

type Student = typeof mockStudents[0];

const emptyForm = { fullName:"", admissionNo:"", class:"Class 6", division:"A", quota:"General", dob:"", parentName:"", parentMobile:"", parentEmail:"", address:"", totalFee:0 };

export function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(mockStudents as Student[]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const upd = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const filtered = students.filter(s => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.admissionNo.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All Classes" || s.class === classFilter;
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  const handleAdd = () => {
    if (!form.fullName || !form.admissionNo) { showToast("⚠️ Name and Admission No are required"); return; }
    const newStudent: any = { id: String(Date.now()), ...form, paidAmount: 0, status: "PENDING", photo: "" };
    setStudents(prev => [newStudent, ...prev]);
    showToast(`✅ ${form.fullName} added successfully`);
    setShowAdd(false);
    setForm({ ...emptyForm });
  };

  const handleEdit = () => {
    setStudents(prev => prev.map(s => s.id === editStudent!.id ? { ...s, ...form } : s));
    showToast(`✅ ${form.fullName} updated successfully`);
    setEditStudent(null);
  };

  const handleDelete = () => {
    setStudents(prev => prev.filter(s => s.id !== deleteStudent!.id));
    showToast(`🗑️ ${deleteStudent!.fullName} removed`);
    setDeleteStudent(null);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ fullName: s.fullName, admissionNo: s.admissionNo, class: s.class, division: s.division, quota: s.quota, dob: (s as any).dob || "", parentName: (s as any).parentName || "", parentMobile: s.parentMobile, parentEmail: s.parentEmail, address: (s as any).address || "", totalFee: s.totalFee });
  };

  const FormFields = () => (
    <div className="grid grid-cols-2 gap-3">
      {[["Full Name *","fullName","text"],["Admission No *","admissionNo","text"],["Date of Birth","dob","date"],["Parent Name","parentName","text"],["Parent Mobile","parentMobile","tel"],["Parent Email","parentEmail","email"],["Total Fee","totalFee","number"],["Address","address","text"]].map(([label,key,type]) => (
        <div key={key} className={key==="address"||key==="fullName" ? "col-span-2" : ""}>
          <label className="text-xs text-gray-500 font-medium">{label}</label>
          <input type={type} value={(form as any)[key]} onChange={e => upd(key, type==="number" ? Number(e.target.value) : e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      ))}
      <div>
        <label className="text-xs text-gray-500 font-medium">Class</label>
        <select value={form.class} onChange={e=>upd("class",e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {CLASS_LIST.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 font-medium">Division</label>
        <select value={form.division} onChange={e=>upd("division",e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {DIVISIONS.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="text-xs text-gray-500 font-medium">Quota</label>
        <select value={form.quota} onChange={e=>upd("quota",e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {QUOTAS.map(q=><option key={q}>{q}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Students" subtitle={`${students.length} students enrolled · Greenfield Institute`} />
      <main className="flex-1 p-6 space-y-4">

        {/* Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or admission no..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => showToast("📥 Exporting student list...")}><Download className="w-4 h-4" />Export</Button>
            <Button size="sm" onClick={() => { setShowAdd(true); setForm({ ...emptyForm }); }}><Plus className="w-4 h-4" />Add Student</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: students.length, color: "text-gray-900" },
            { label: "Paid", value: students.filter(s => s.status === "PAID").length, color: "text-green-600" },
            { label: "Partial", value: students.filter(s => s.status === "PARTIAL").length, color: "text-blue-600" },
            { label: "Overdue", value: students.filter(s => s.status === "OVERDUE").length, color: "text-red-600" },
          ].map(stat => (
            <Card key={stat.label} className="p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student","Admission No","Class","Quota","Contact","Total Fee","Paid","Balance","Status","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const balance = s.totalFee - s.paidAmount;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.fullName.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.admissionNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.class} - {s.division}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.quota}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a href={`tel:${s.parentMobile}`} className="text-gray-400 hover:text-indigo-600 transition-colors"><Phone className="w-3.5 h-3.5" /></a>
                          <a href={`mailto:${s.parentEmail}`} className="text-gray-400 hover:text-indigo-600 transition-colors"><Mail className="w-3.5 h-3.5" /></a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(s.totalFee)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{formatCurrency(s.paidAmount)}</td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: balance > 0 ? "#dc2626" : "#16a34a" }}>{formatCurrency(balance)}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => router.push(`/students/${s.id}`)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteStudent(s)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No students found matching your filters.</div>}
          </CardContent>
        </Card>
      </main>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[600px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Add New Student</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <FormFields />
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Student</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[600px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Edit Student — {editStudent.fullName}</h3>
              <button onClick={() => setEditStudent(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <FormFields />
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setEditStudent(null)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[400px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Student?</h3>
                <p className="text-sm text-gray-500 mt-1">This will permanently remove <strong>{deleteStudent.fullName}</strong> and all their records.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteStudent(null)}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Yes, Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
