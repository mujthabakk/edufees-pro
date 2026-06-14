"use client";
import { useMyStudent } from "@/lib/api/hooks/usePortal";
import { useSchoolProfile } from "@/lib/api/hooks/useSettings";
import { User, BookOpen } from "lucide-react";

export function StudentProfilePage() {
  const { data: student, isLoading } = useMyStudent();
  const { data: school } = useSchoolProfile();

  if (isLoading) return <p className="p-6 text-sm text-gray-400">Loading profile...</p>;
  if (!student) return <p className="p-6 text-sm text-gray-400">No student profile linked to this account.</p>;

  return (
    <div className="space-y-4 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-700">
            {student.fullName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{student.fullName}</h2>
            <p className="text-sm text-gray-500">{student.admissionNo}</p>
            <p className="text-xs text-gray-400">{school?.name ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen className="w-4 h-4" />Academic</h3>
        {[
          ["Class", student.className ?? "—"],
          ["Division", student.divisionName ?? "—"],
          ["Total Fee", `₹${student.totalFee.toLocaleString()}`],
          ["Paid", `₹${student.paidAmount.toLocaleString()}`],
          ["Balance", `₹${student.balance.toLocaleString()}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium text-gray-900">{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><User className="w-4 h-4" />Account</h3>
        <p className="text-sm text-gray-500">Profile updates are managed by your school. Contact the office for changes.</p>
      </div>
    </div>
  );
}
