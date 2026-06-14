"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { StudentPicker, type PickedStudent } from "@/modules/shared/ui/student-picker";
import { formatCurrency } from "@/lib/utils";
import {
  useCoupons,
  useCouponAssignments,
  useAssignCoupon,
  useDeleteCouponAssignment,
  type CouponDto,
} from "@/lib/api/hooks/useDomains";
import { Tag, Search, X, AlertTriangle, CheckCircle2, Percent, IndianRupee, Copy, Eye } from "lucide-react";

type Assignment = {
  id: string; couponId: string; couponCode: string; discountType: "PERCENTAGE" | "FLAT";
  discountAmount: number; studentName: string; admissionNo: string;
  class: string; assignedDate: string; note: string; appliedAmount: number;
};

function couponUi(c: CouponDto) {
  const amount = Number(c.discountValue);
  const used = c.totalRedeemed;
  const max = c.maxUses ?? Infinity;
  return {
    id: c.id,
    code: c.code,
    discountType: c.discountType === "PERCENTAGE" ? "percent" as const : "flat" as const,
    amount,
    validFrom: c.validFrom.slice(0, 10),
    validTo: c.validUntil.slice(0, 10),
    maxUses: c.maxUses ?? 999,
    usedCount: used,
    active: c.isActive,
    description: `${c.discountType === "PERCENTAGE" ? `${amount}%` : formatCurrency(amount)} discount`,
  };
}

export function AccountantCouponsPage() {
  const couponsQuery = useCoupons();
  const assignmentsQuery = useCouponAssignments();
  const assignCoupon = useAssignCoupon();
  const deleteCouponAssignment = useDeleteCouponAssignment();

  const coupons = (couponsQuery.data ?? []).map(couponUi);
  const assignments: Assignment[] = (assignmentsQuery.data ?? []).map(a => ({
    id: a.id,
    couponId: a.couponId,
    couponCode: a.couponCode,
    discountType: a.discountType,
    discountAmount: a.discountValue,
    studentName: a.studentName,
    admissionNo: a.admissionNo,
    class: "—",
    assignedDate: "—",
    note: "",
    appliedAmount: a.discountType === "PERCENTAGE" ? a.discountValue : a.discountValue,
  }));

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewCoupons, setViewCoupons] = useState(false);
  const [delAssign, setDelAssign] = useState<Assignment | null>(null);
  const [toast, setToast] = useState("");

  const [couponId, setCouponId] = useState("");
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const [note, setNote] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const selectedCoupon = coupons.find(c => c.id === couponId);

  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    return a.studentName.toLowerCase().includes(q) ||
      a.couponCode.toLowerCase().includes(q) ||
      a.admissionNo.toLowerCase().includes(q);
  });

  const calcApplied = (coupon: ReturnType<typeof couponUi>, totalFee: number) =>
    coupon.discountType === "percent" ? Math.round(totalFee * coupon.amount / 100) : coupon.amount;

  const handleAssign = () => {
    if (!couponId) { showToast("⚠️ Select a coupon first"); return; }
    if (!student) { showToast("⚠️ Select a student"); return; }
    const coupon = coupons.find(c => c.id === couponId)!;
    if (!coupon.active) { showToast("⚠️ This coupon is not active"); return; }
    assignCoupon.mutate(
      { couponId: coupon.id, studentIds: [student.id] },
      {
        onSuccess: () => {
          const applied = calcApplied(coupon, student.totalFee);
          showToast(`✅ "${coupon.code}" assigned to ${student.fullName}. Discount: ${coupon.discountType === "percent" ? `${coupon.amount}%` : formatCurrency(coupon.amount)} (${formatCurrency(applied)})`);
          resetModal();
        },
        onError: () => showToast("❌ Failed to assign coupon"),
      },
    );
  };

  const resetModal = () => {
    setShowModal(false); setCouponId(""); setStudent(null); setNote("");
  };

  const activeCoupons = coupons.filter(c => c.active);

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Coupon Assignment" subtitle="Assign admin-created discount coupons to students" />
      <main className="flex-1 p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Coupons", value: activeCoupons.length, color: "text-green-600" },
            { label: "Total Assigned", value: assignments.length, color: "text-indigo-600" },
            { label: "Discount Given", value: formatCurrency(assignments.reduce((a, x) => a + x.appliedAmount, 0)), color: "text-amber-600" },
            { label: "Available", value: coupons.filter(c => c.active && c.usedCount < c.maxUses).length, color: "text-gray-900" },
          ].map(s => (
            <Card key={s.label} className="p-5">
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-indigo-900 text-sm">Available Coupons (Created by Admin)</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setViewCoupons(!viewCoupons)}>
                <Eye className="w-4 h-4" />{viewCoupons ? "Hide" : "View All"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeCoupons.length === 0 && <p className="text-sm text-indigo-600">No active coupons</p>}
              {activeCoupons.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-700">{c.code}</span>
                  <span className="text-xs text-gray-500">{c.discountType === "percent" ? `${c.amount}% off` : formatCurrency(c.amount) + " off"}</span>
                  <span className="text-xs text-gray-400">({c.maxUses - c.usedCount} left)</span>
                  <button onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => {}); showToast(`📋 "${c.code}" copied`); }}
                    className="text-gray-400 hover:text-indigo-600"><Copy className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            {viewCoupons && (
              <div className="mt-3 grid gap-2 border-t border-indigo-200 pt-3">
                {coupons.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-gray-100 flex-wrap">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${c.active ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm font-mono font-bold w-24">{c.code}</span>
                    <span className="text-sm text-gray-600 flex-1 min-w-[120px]">{c.description}</span>
                    <span className="text-xs font-semibold text-indigo-700">{c.discountType === "percent" ? `${c.amount}%` : formatCurrency(c.amount)}</span>
                    <span className="text-xs text-gray-400">{c.usedCount}/{c.maxUses} used</span>
                    <span className="text-xs text-gray-400">{c.validTo}</span>
                    <Badge variant={c.active ? "success" : "default"}>{c.active ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, admission no or coupon code..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>
          <Button onClick={() => setShowModal(true)}><Tag className="w-4 h-4" />Assign Coupon</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Coupon Assignments ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Coupon", "Student", "Adm No", "Discount", "Applied", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No assignments yet.</td></tr>}
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-sm font-mono font-bold text-indigo-700">{a.couponCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{a.studentName}</td>
                    <td className="px-4 py-3.5 text-sm font-mono text-gray-500">{a.admissionNo}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                        {a.discountType === "PERCENTAGE" ? <Percent className="w-3.5 h-3.5" /> : <IndianRupee className="w-3.5 h-3.5" />}
                        {a.discountType === "PERCENTAGE" ? `${a.discountAmount}%` : formatCurrency(a.discountAmount)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-green-600">{formatCurrency(a.appliedAmount)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setDelAssign(a)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><X className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full sm:max-w-[540px] p-6 space-y-4 max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Assign Coupon to Student</h3>
              </div>
              <button onClick={resetModal}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Select Coupon <span className="text-red-500">*</span></label>
              <div className="grid gap-2 max-h-52 overflow-y-auto pr-1">
                {activeCoupons.map(c => (
                  <button key={c.id} onClick={() => setCouponId(c.id)}
                    className={`flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${couponId === c.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${couponId === c.id ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm">{c.code}</span>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          {c.discountType === "percent" ? `${c.amount}% OFF` : formatCurrency(c.amount) + " OFF"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.description}</p>
                    </div>
                    {couponId === c.id && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {selectedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">{selectedCoupon.code} — {selectedCoupon.discountType === "percent" ? `${selectedCoupon.amount}% off` : formatCurrency(selectedCoupon.amount) + " off"}</p>
                  <p className="text-xs text-green-600">Valid till {selectedCoupon.validTo}</p>
                </div>
              </div>
            )}

            <StudentPicker label="Student" required value={student} onChange={setStudent} placeholder="Search by name or admission number..." />

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Note / Reason</label>
              <input value={note} onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Early payment discount" />
            </div>

            {student && selectedCoupon && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm space-y-1">
                <p className="font-semibold text-indigo-900">Assignment Preview</p>
                <p className="text-indigo-700">{student.fullName} · {student.admissionNo}</p>
                <p className="text-indigo-600">
                  Discount: {selectedCoupon.discountType === "percent"
                    ? `${selectedCoupon.amount}% = ${formatCurrency(Math.round(student.totalFee * selectedCoupon.amount / 100))}`
                    : formatCurrency(selectedCoupon.amount)}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={resetModal}>Cancel</Button>
              <Button onClick={handleAssign} disabled={assignCoupon.isPending}><Tag className="w-4 h-4" />Assign Coupon</Button>
            </div>
          </Card>
        </div>
      )}

      {delAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Remove Assignment?</h3>
                <p className="text-sm text-gray-500 mt-1">This will remove the coupon assignment for the student.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDelAssign(null)}>Cancel</Button>
              <Button onClick={() => {
                if (!delAssign) return;
                deleteCouponAssignment.mutate(delAssign.id, {
                  onSuccess: () => { showToast("🗑️ Assignment removed"); setDelAssign(null); },
                  onError: () => showToast("❌ Failed to remove assignment"),
                });
              }} className="bg-red-600 hover:bg-red-700 text-white">Remove</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
