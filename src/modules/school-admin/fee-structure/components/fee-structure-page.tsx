"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockFeeTypes, mockFeeStructures } from "@/lib/mock-data";
import { Plus, BookOpen, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

type FeeStructure = { id: string; class: string; quota: string; feeType: string; amount: number; frequency: string; dueDay: number };
type FeeType = { id: string; name: string; description: string; isLateFee?: boolean };

const CLASS_LIST = ["Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const QUOTAS = ["General","Management","NRI","Sports","Staff Ward"];
const FREQ = ["Monthly","Quarterly","Half-Yearly","Annually","One-Time"];

export function FeeStructurePage() {
  const [tab, setTab] = useState<"structures" | "types">("structures");
  const [structures, setStructures] = useState<FeeStructure[]>(mockFeeStructures as any);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(mockFeeTypes as any);

  const [showStructModal, setShowStructModal] = useState(false);
  const [editStruct, setEditStruct] = useState<FeeStructure | null>(null);
  const [structForm, setStructForm] = useState({ class:"Class 6", quota:"General", feeType:"Tuition Fee", amount:"", frequency:"Monthly", dueDay:"10" });

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editType, setEditType] = useState<FeeType | null>(null);
  const [typeForm, setTypeForm] = useState({ name:"", description:"", isLateFee: false });

  const [deleteStruct, setDeleteStruct] = useState<FeeStructure | null>(null);
  const [deleteType, setDeleteType] = useState<FeeType | null>(null);
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const saveStruct = () => {
    if (!structForm.amount) { showToast("⚠️ Amount is required"); return; }
    if (editStruct) {
      setStructures(prev => prev.map(s => s.id === editStruct.id ? { ...s, ...structForm, amount: Number(structForm.amount), dueDay: Number(structForm.dueDay) } : s));
      showToast("✅ Fee structure updated");
    } else {
      setStructures(prev => [...prev, { id: String(Date.now()), ...structForm, amount: Number(structForm.amount), dueDay: Number(structForm.dueDay) }]);
      showToast("✅ Fee structure added");
    }
    setShowStructModal(false); setEditStruct(null);
  };

  const saveType = () => {
    if (!typeForm.name) { showToast("⚠️ Fee type name is required"); return; }
    if (editType) {
      setFeeTypes(prev => prev.map(t => t.id === editType.id ? { ...t, ...typeForm } : t));
      showToast("✅ Fee type updated");
    } else {
      setFeeTypes(prev => [...prev, { id: String(Date.now()), ...typeForm }]);
      showToast("✅ Fee type created");
    }
    setShowTypeModal(false); setEditType(null);
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Fee Structure" subtitle="Configure fee types and class-wise amounts · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex gap-2">
          {(["structures", "types"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              Fee {t}
            </button>
          ))}
          <div className="flex-1" />
          <Button size="sm" onClick={() => {
            if (tab === "structures") { setEditStruct(null); setStructForm({ class:"Class 6", quota:"General", feeType:"Tuition Fee", amount:"", frequency:"Monthly", dueDay:"10" }); setShowStructModal(true); }
            else { setEditType(null); setTypeForm({ name:"", description:"", isLateFee: false }); setShowTypeModal(true); }
          }}>
            <Plus className="w-4 h-4" />Add {tab === "structures" ? "Structure" : "Fee Type"}
          </Button>
        </div>

        {tab === "structures" ? (
          <Card>
            <CardHeader><CardTitle>Class-wise Fee Structure</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    {["Class","Quota","Fee Type","Amount","Frequency","Due Day","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {structures.map(f => (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                      <td className="px-5 py-3.5 text-sm font-medium">{f.class}</td>
                      <td className="px-5 py-3.5"><Badge variant="info">{f.quota}</Badge></td>
                      <td className="px-5 py-3.5 text-sm">{f.feeType}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold">{formatCurrency(f.amount)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{f.frequency}</td>
                      <td className="px-5 py-3.5 text-sm">{f.dueDay}th</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditStruct(f); setStructForm({ class:f.class, quota:f.quota, feeType:f.feeType, amount:String(f.amount), frequency:f.frequency, dueDay:String(f.dueDay) }); setShowStructModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteStruct(f)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {feeTypes.map(ft => (
              <Card key={ft.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
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
            <button onClick={() => { setEditType(null); setTypeForm({ name:"", description:"", isLateFee:false }); setShowTypeModal(true); }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <Plus className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500 font-medium">Add Fee Type</p>
            </button>
          </div>
        )}
      </main>

      {/* Add/Edit Structure Modal */}
      {showStructModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[480px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editStruct ? "Edit Fee Structure" : "Add Fee Structure"}</h3>
              <button onClick={() => { setShowStructModal(false); setEditStruct(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Class</label>
                <select value={structForm.class} onChange={e => setStructForm(f=>({...f,class:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {CLASS_LIST.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Quota</label>
                <select value={structForm.quota} onChange={e => setStructForm(f=>({...f,quota:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {QUOTAS.map(q=><option key={q}>{q}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Fee Type</label>
                <input value={structForm.feeType} onChange={e=>setStructForm(f=>({...f,feeType:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Tuition Fee" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                <input type="number" value={structForm.amount} onChange={e=>setStructForm(f=>({...f,amount:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Due Day of Month</label>
                <input type="number" min="1" max="31" value={structForm.dueDay} onChange={e=>setStructForm(f=>({...f,dueDay:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Frequency</label>
                <select value={structForm.frequency} onChange={e => setStructForm(f=>({...f,frequency:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {FREQ.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowStructModal(false); setEditStruct(null); }}>Cancel</Button>
              <Button onClick={saveStruct}>{editStruct ? "Save Changes" : "Add Structure"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Fee Type Modal */}
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
                <input value={typeForm.name} onChange={e=>setTypeForm(f=>({...f,name:e.target.value}))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Tuition Fee, Lab Fee" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Description</label>
                <textarea value={typeForm.description} onChange={e=>setTypeForm(f=>({...f,description:e.target.value}))} rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Brief description..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={typeForm.isLateFee} onChange={e=>setTypeForm(f=>({...f,isLateFee:e.target.checked}))} className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-gray-700">This is a Late Fee / Penalty</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowTypeModal(false); setEditType(null); }}>Cancel</Button>
              <Button onClick={saveType}>{editType ? "Save Changes" : "Create Type"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Structure Confirm */}
      {deleteStruct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Fee Structure?</h3>
                <p className="text-sm text-gray-500 mt-1">{deleteStruct.class} · {deleteStruct.quota} · {deleteStruct.feeType} — will be removed.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteStruct(null)}>Cancel</Button>
              <Button onClick={() => { setStructures(prev=>prev.filter(s=>s.id!==deleteStruct.id)); showToast("🗑️ Structure removed"); setDeleteStruct(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Type Confirm */}
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
              <Button onClick={() => { setFeeTypes(prev=>prev.filter(t=>t.id!==deleteType.id)); showToast(`🗑️ "${deleteType.name}" removed`); setDeleteType(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
