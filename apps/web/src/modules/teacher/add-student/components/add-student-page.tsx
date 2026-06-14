"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useCreateStudent } from "@/lib/api/hooks/useStudents";
import { useClasses, useQuotas, useAcademicYears } from "@/lib/api/hooks/useAcademic";

type FormState = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  admissionNo: string;
  classId: string;
  divisionId: string;
  rollNo: string;
  quotaId: string;
  parentMobile: string;
  whatsappNumber: string;
  parentEmail: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  addressLine1: string;
  city: string;
  state: string;
  pinCode: string;
};

const emptyForm: FormState = {
  fullName: "", dateOfBirth: "", gender: "", admissionNo: "",
  classId: "", divisionId: "", rollNo: "", quotaId: "",
  parentMobile: "", whatsappNumber: "", parentEmail: "",
  fatherName: "", motherName: "", guardianName: "",
  addressLine1: "", city: "", state: "", pinCode: "",
};

export function AddStudentPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState("");
  const createStudent = useCreateStudent();
  const { data: classes = [] } = useClasses();
  const { data: quotas = [] } = useQuotas();
  const { data: years = [] } = useAcademicYears();

  const selectedClass = classes.find(c => c.id === form.classId);
  const divisions = selectedClass?.divisions ?? [];
  const currentYear = years.find(y => y.isCurrent);

  const upd = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSubmit = () => {
    if (!form.fullName.trim()) { showToast("⚠️ Full name is required"); return; }
    if (!form.classId || !form.divisionId) { showToast("⚠️ Class and division are required"); return; }
    if (!form.parentMobile.trim()) { showToast("⚠️ Parent mobile is required"); return; }
    const admissionNo = form.admissionNo.trim() || `ADM-${Date.now().toString(36).toUpperCase()}`;
    createStudent.mutate(
      {
        academicYearId: currentYear?.id,
        classId: form.classId,
        divisionId: form.divisionId,
        quotaId: form.quotaId || undefined,
        fullName: form.fullName.trim(),
        admissionNo,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender ? form.gender.toUpperCase() : undefined,
        rollNo: form.rollNo || undefined,
        parentMobile: form.parentMobile.trim(),
        whatsappNumber: form.whatsappNumber || undefined,
        parentEmail: form.parentEmail || undefined,
        fatherName: form.fatherName || undefined,
        motherName: form.motherName || undefined,
        guardianName: form.guardianName || undefined,
        addressLine1: form.addressLine1 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        pinCode: form.pinCode || undefined,
      },
      {
        onSuccess: () => { setSubmitted(true); setForm(emptyForm); },
        onError: () => showToast("❌ Failed to register student"),
      },
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Add Student" subtitle="Student registered successfully" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Student Added!</h2>
            <p className="text-gray-500 mb-6 text-sm">The student has been registered. Login credentials will be sent to the parent's WhatsApp and email.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/teacher/students")}>View Students</Button>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Add Another</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Add Student" subtitle="Register a new student under your class" />
      <main className="flex-1 p-6 space-y-5">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-2">
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Full Name<span className="text-red-500 ml-0.5">*</span></label>
                <input value={form.fullName} onChange={e => upd("fullName", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="As per records" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => upd("dateOfBirth", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Gender</label>
                <select value={form.gender} onChange={e => upd("gender", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="">Select...</option>
                  {["Male", "Female", "Other"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Admission Number</label>
                <input value={form.admissionNo} onChange={e => upd("admissionNo", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Auto or manual" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Class<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.classId} onChange={e => { upd("classId", e.target.value); upd("divisionId", ""); }} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="">Select...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Division<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.divisionId} onChange={e => upd("divisionId", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="">Select...</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Roll No.</label>
                <input value={form.rollNo} onChange={e => upd("rollNo", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Admission Quota</label>
                <select value={form.quotaId} onChange={e => upd("quotaId", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="">Select...</option>
                  {quotas.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 bg-orange-50 border-orange-200">
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Required Fields</h3>
              <ul className="space-y-1 text-xs text-orange-700">
                <li>• Full Name</li><li>• Class & Division</li><li>• Parent Mobile</li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">After Submission</h3>
              <ul className="space-y-1.5 text-xs text-gray-500">
                {["Login credentials auto-generated", "WhatsApp sent to parent", "Email sent to parent", "Student visible in your class list"].map(i => (
                  <li key={i} className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" />{i}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="col-span-2">
            <CardHeader><CardTitle>Contact & Parent Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Parent Mobile<span className="text-red-500 ml-0.5">*</span></label>
                <input type="tel" value={form.parentMobile} onChange={e => upd("parentMobile", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">WhatsApp Number</label>
                <input type="tel" value={form.whatsappNumber} onChange={e => upd("whatsappNumber", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="If different from mobile" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Parent Email</label>
                <input type="email" value={form.parentEmail} onChange={e => upd("parentEmail", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="parent@email.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Father&apos;s Name</label>
                <input value={form.fatherName} onChange={e => upd("fatherName", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Mother&apos;s Name</label>
                <input value={form.motherName} onChange={e => upd("motherName", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Guardian Name</label>
                <input value={form.guardianName} onChange={e => upd("guardianName", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="If different from parents" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 font-medium">Address Line 1</label>
                <input value={form.addressLine1} onChange={e => upd("addressLine1", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="House/Flat, Street, Locality" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">City</label>
                <input value={form.city} onChange={e => upd("city", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">State</label>
                <input value={form.state} onChange={e => upd("state", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">PIN Code</label>
                <input value={form.pinCode} onChange={e => upd("pinCode", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="6-digit PIN" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={createStudent.isPending}>
            {createStudent.isPending ? "Saving..." : "Add Student"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </main>
    </div>
  );
}
