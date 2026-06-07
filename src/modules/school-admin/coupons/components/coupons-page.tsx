"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { Tag, Plus, Edit2, Trash2, X, AlertTriangle, Copy, ToggleLeft, ToggleRight, Percent } from "lucide-react";

type Coupon = {
  id: string; code: string; discountType: "percent" | "flat";
  amount: number; validFrom: string; validTo: string;
  maxUses: number; usedCount: number; classes: string[]; active: boolean;
};

const initCoupons: Coupon[] = [
  { id:"1", code:"EARLY25", discountType:"percent", amount:25, validFrom:"2025-04-01", validTo:"2025-04-30", maxUses:100, usedCount:67, classes:["All Classes"], active:true },
  { id:"2", code:"STAFF500", discountType:"flat", amount:500, validFrom:"2025-04-01", validTo:"2025-12-31", maxUses:50, usedCount:12, classes:["All Classes"], active:true },
  { id:"3", code:"NRI10", discountType:"percent", amount:10, validFrom:"2025-01-01", validTo:"2025-12-31", maxUses:200, usedCount:45, classes:["Class 11","Class 12"], active:false },
  { id:"4", code:"SPORTS1K", discountType:"flat", amount:1000, validFrom:"2025-06-01", validTo:"2025-09-30", maxUses:30, usedCount:8, classes:["Class 9","Class 10"], active:true },
];

const CLASS_LIST = ["All Classes","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];

const emptyForm = { code:"", discountType:"percent" as "percent"|"flat", amount:0, validFrom:"", validTo:"", maxUses:100, classes:["All Classes"] };

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initCoupons);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const upd = (k: string, v: string | number | string[]) => setForm(f => ({ ...f, [k]: v }));

  const toggleClass = (cls: string) => {
    if (cls === "All Classes") { upd("classes", ["All Classes"]); return; }
    const cur = form.classes.filter(c => c !== "All Classes");
    upd("classes", cur.includes(cls) ? cur.filter(c => c !== cls) : [...cur, cls]);
  };

  const save = () => {
    if (!form.code) { showToast("⚠️ Coupon code is required"); return; }
    if (!form.amount) { showToast("⚠️ Discount amount is required"); return; }
    if (editCoupon) {
      setCoupons(prev => prev.map(c => c.id === editCoupon.id ? { ...c, ...form, usedCount: c.usedCount } : c));
      showToast("✅ Coupon updated");
    } else {
      setCoupons(prev => [...prev, { id: String(Date.now()), ...form, usedCount: 0, active: true }]);
      showToast(`✅ Coupon "${form.code}" created`);
    }
    setShowModal(false); setEditCoupon(null);
  };

  const openEdit = (c: Coupon) => {
    setEditCoupon(c);
    setForm({ code: c.code, discountType: c.discountType, amount: c.amount, validFrom: c.validFrom, validTo: c.validTo, maxUses: c.maxUses, classes: c.classes });
    setShowModal(true);
  };

  const toggleActive = (c: Coupon) => {
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
    showToast(c.active ? `⏸️ "${c.code}" deactivated` : `▶️ "${c.code}" activated`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    showToast(`📋 "${code}" copied to clipboard`);
  };

  const activeCount = coupons.filter(c => c.active).length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Coupons & Discounts" subtitle="Fee discount codes · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Total Coupons", value: coupons.length, icon: Tag, bg:"bg-indigo-50", color:"text-indigo-600" },
            { label:"Active Coupons", value: activeCount, icon: ToggleRight, bg:"bg-green-50", color:"text-green-600" },
            { label:"Inactive", value: coupons.length - activeCount, icon: ToggleLeft, bg:"bg-gray-100", color:"text-gray-500" },
            { label:"Total Uses", value: totalUses, icon: Percent, bg:"bg-orange-50", color:"text-orange-600" },
          ].map(k => (
            <Card key={k.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
                <div><p className="text-xs text-gray-500">{k.label}</p><p className="text-lg font-bold">{k.value}</p></div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Coupon Codes</CardTitle>
            <Button size="sm" onClick={() => { setEditCoupon(null); setForm({ ...emptyForm }); setShowModal(true); }}>
              <Plus className="w-4 h-4" />Create Coupon
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Code","Type","Discount","Valid Period","Uses","Classes","Status","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{c.code}</code>
                        <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-indigo-600"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.discountType === "percent" ? "info" : "success"}>{c.discountType === "percent" ? "Percent" : "Flat"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold">
                      {c.discountType === "percent" ? `${c.amount}%` : `₹${c.amount.toLocaleString()}`}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{c.validFrom} → {c.validTo}</td>
                    <td className="px-5 py-3.5 text-sm">{c.usedCount} / {c.maxUses}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{c.classes.join(", ")}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleActive(c)}>
                        {c.active
                          ? <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Active</span>
                          : <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Inactive</span>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteCoupon(c)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[500px] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editCoupon ? "Edit Coupon" : "Create Coupon"}</h3>
              <button onClick={() => { setShowModal(false); setEditCoupon(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Coupon Code *</label>
                <input value={form.code} onChange={e => upd("code", e.target.value.toUpperCase())} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. EARLY25" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Discount Type</label>
                  <select value={form.discountType} onChange={e => upd("discountType", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Amount *</label>
                  <input type="number" value={form.amount} onChange={e => upd("amount", Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => upd("validFrom", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Valid To</label>
                  <input type="date" value={form.validTo} onChange={e => upd("validTo", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Max Uses</label>
                <input type="number" value={form.maxUses} onChange={e => upd("maxUses", Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-2">Applicable Classes</label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_LIST.map(cls => (
                    <button key={cls} onClick={() => toggleClass(cls)} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${form.classes.includes(cls) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => { setShowModal(false); setEditCoupon(null); }}>Cancel</Button>
              <Button onClick={save}>{editCoupon ? "Save Changes" : "Create Coupon"}</Button>
            </div>
          </Card>
        </div>
      )}

      {deleteCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[380px] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Coupon?</h3>
                <p className="text-sm text-gray-500 mt-1">Delete coupon <strong>{deleteCoupon.code}</strong>? This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteCoupon(null)}>Cancel</Button>
              <Button onClick={() => { setCoupons(prev => prev.filter(c => c.id !== deleteCoupon.id)); showToast(`🗑️ "${deleteCoupon.code}" deleted`); setDeleteCoupon(null); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
